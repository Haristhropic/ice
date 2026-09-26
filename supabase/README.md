# Supabase + admin

The `/admin` page talks to Supabase. **The schema and seed data are already
applied** to project `kitkmdocxyomzstqlqbz` (migrations `admin_backoffice` and
`harden_trigger_function`).

This folder keeps the SQL so the database can be rebuilt or audited. It is the
source of truth, not the live database.

---

## What is already done

| Step | Status |
| --- | --- |
| 4 tables created, RLS enabled | done |
| `private.is_admin()`, triggers, 14 RLS policies | done |
| 6 catalog rows seeded | done |
| Types generated into `src/lib/supabase/database.types.ts` | done |
| Admin user `hrisscloud@gmail.com`, role `admin` | done |

To re-apply, use the Supabase MCP server's `apply_migration` tool rather than
the SQL Editor. The files are still valid SQL if you prefer the dashboard.
Both are idempotent, so re-running will not destroy data.

| Table | Purpose |
| --- | --- |
| `profiles` | App-level user profile, 1:1 with `auth.users`. Holds `role`. |
| `icebreaker_ideas` | The offline game catalog the public site reads. |
| `custom_templates` | Wheels, quizzes and question sets saved by users. |
| `game_rooms` | Realtime rooms for the join-by-phone micro games (phase 2). |

### A note on `users` vs `profiles`

The PRD calls the first table `users`. It is named `profiles` because
`auth.users` already exists and belongs to Supabase Auth. `profiles` is our
own table, keyed 1:1 on `auth.users.id`, and it carries the role.

---

## Signing in

`hrisscloud@gmail.com` exists with `role = 'admin'`. Sign in at
<http://localhost:3000/admin>.

**Email confirmation is currently enabled on this project.** A signup attempt
returned `over_email_send_rate_limit` from the mailer, which only happens when
confirmation emails are being sent. Confirm via the emailed link, or turn
confirmation off under **Authentication > Sign In / Providers > Email** if you
want local-only signups.

### If a pre-existing account has no profile row

`on_auth_user_created` only fires on `INSERT` into `auth.users`. An account
created *before* this schema was applied therefore never gets a profile, and
`/admin` will show "Belum punya akses admin" for that account no matter how many
times you reload. The trigger cannot fix it retroactively; backfill by hand:

```sql
insert into public.profiles (id, email, full_name, role)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
       'admin'
  from auth.users u
 where u.email = 'you@example.com'
on conflict (id) do update set role = excluded.role;
```

Find orphans with:

```sql
select u.email from auth.users u
  left join public.profiles p on p.id = u.id
 where p.id is null;
```

## Changing someone's role

The **Pengguna** tab does this for anyone except yourself, which is deliberate so
you cannot lock the last admin out. To change your own role, use SQL:

```sql
update public.profiles
   set role = 'admin'
 where email = 'you@example.com';
```

No policy lets a user promote themselves: the only `UPDATE` policy on
`profiles` requires `private.is_admin()`.

---

## Environment variables

`.env.local` is already written and gitignored. To recreate it, copy
`.env.example`, fill it in, and restart the dev server. Never put the
`service_role` key in either file. The publishable key is designed to be
public.

---

## Verifying RLS

These run with the public key and no session, so they model exactly what a
stranger with the URL could do.

```bash
export SB_URL="https://kitkmdocxyomzstqlqbz.supabase.co"
export SB_KEY="<NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local>"
```

**Read the published catalog. Expected: 200 with your 6 ideas.**

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "$SB_URL/rest/v1/icebreaker_ideas?select=slug" \
  -H "apikey: $SB_KEY"
```

**Write without signing in. Expected: 401, body carries code `42501`.**

```bash
curl -s -X POST "$SB_URL/rest/v1/icebreaker_ideas" \
  -H "apikey: $SB_KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug":"hack","title":"Should not work"}'
```

`401` is what PostgREST returns for an unauthenticated write that RLS refuses.
The body contains `"code":"42501"` and
`new row violates row-level security policy for table "icebreaker_ideas"`.
Only `200` means failure.

> On Windows PowerShell, `-d '{...}'` mangles the embedded quotes and you get
> a misleading `PGRST102 Empty or invalid json`. Write the payload to a file
> with `Set-Content -Encoding ASCII` (not `UTF8`, which prepends a BOM) and
> pass `--data-binary @file`.

### Verified matrix

Checked against the live project on 2026-09-26.

| Actor | Operation | Result |
| --- | --- | --- |
| anon | read published ideas | 200, 6 rows |
| anon | read `profiles` / `custom_templates` / `game_rooms` | 200, 0 rows |
| anon | insert / update / delete ideas | denied, `42501`, 0 rows changed |
| anon | insert `profiles` with `role = 'admin'` | denied, `42501` |
| anon | `POST /rest/v1/rpc/is_admin` | 404, not exposed |
| anon | `POST /rest/v1/rpc/handle_new_user` | 404, not exposed |
| signed-in `free` user | insert an idea | denied, `42501` |
| signed-in `free` user | insert own template | allowed |
| signed-in `free` user | insert template with someone else's `user_id` | denied, `42501` |
| signed-in `admin` user | insert an idea | allowed |

The signed-in rows were exercised with `set local role authenticated` and
`set local "request.jwt.claim.sub"` inside transactions that rolled back, so no
probe rows were left behind.

### Verified in the browser

Signed in as `hrisscloud@gmail.com` against the live project on 2026-09-26, with
zero console errors:

- **Katalog** rendered all 6 seeded rows, with stats matching the database
  exactly (6 total, 6 published, 0 draft, 19 steps).
- **Template** and **Room** rendered live rows, and the embedded `profiles` join
  resolved the owner email, which confirms that join works under RLS.
- **Pengguna** showed the signed-in admin with an "Admin kamu" badge and no role
  control on their own row, so the self-lockout guard is live.
- Deleting a room and a template through the UI both succeeded, with the tab
  counts, success toasts and empty states all updating.

### Do not hand-insert into `auth.users`

Creating a user with a plain `INSERT` into `auth.users` produces an account that
returns `500 Database error querying schema` on password sign-in, even after
adding the matching `auth.identities` row. Use the signup API, or the Admin API
with a `service_role` key. The `auth.identities.email` column is a generated
column and rejects explicit values.


---

## Troubleshooting

**"Tabel belum ada di database" on the admin page**
PostgREST has not reloaded. Run `select 1;` in the SQL Editor to nudge the
schema cache, then retry. If it persists, check that `.env.local` points at
project `kitkmdocxyomzstqlqbz`.

**"Akses ditolak. Akun ini belum berperan admin"**
Signed in fine, but `role` is still `free`. Re-run the promote query.

**`PGRST205`**
The table does not exist, or the schema cache is stale.

**`PGRST102 Empty or invalid json`**
A malformed request body, almost always the PowerShell quoting trap above. It
is not an RLS problem.

**`over_email_send_rate_limit` on signup**
The mailer rate limit was hit. Wait, or disable email confirmation.

---

## Security model

The publishable key is public by design. Every write is authorized by Postgres
Row Level Security, not by the key.

`private.is_admin()` reads `profiles.role` for the caller. It must be
`SECURITY DEFINER`, otherwise a `profiles` SELECT policy that calls it would
recurse into itself the moment an admin loaded their own row. It lives in a
`private` schema rather than `public` so PostgREST never exposes it as an RPC
endpoint, and its `search_path` is emptied so nothing can be substituted for a
same-named object at call time. `private.handle_new_user()` is hardened the
same way and has `EXECUTE` revoked from `anon` and `authenticated`; trigger
functions are not privilege-checked when they fire, so the signup trigger still
works.

Policy performance follows the Supabase RLS guidance: `auth.uid()` is wrapped as
`(select auth.uid())` so it evaluates once per statement rather than once per
row, and every column a policy filters on is indexed. The `or private.is_admin()`
branch does stop the planner from using `ideas_published_idx` for the public
read; at this table size that is not worth trading the simpler policy for.

The signup trigger runs as the table owner, so a new user can create their own
profile and nothing else. Nobody can promote themselves, because the only
UPDATE policy on `profiles` requires `is_admin()`.

### Known gaps

The admin account uses the password `123456`, and leaked password protection is
disabled on the project, so nothing would flag a weak credential. That is the
current, deliberate configuration. Leaked password protection lives under
**Authentication > Sign In / Providers > Email** and is not reachable from SQL.

RLS is not forced on the tables, so the `postgres` role bypasses it. That is
intentional and matches how Supabase projects normally work: forcing RLS would
also subject the SQL Editor and `seed.sql` to the policies. Application traffic
arrives as `anon` or `authenticated` and is fully constrained.
