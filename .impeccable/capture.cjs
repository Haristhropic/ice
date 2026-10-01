const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 4312;
const OUT = path.join(__dirname, "review");
const BASE = `http://127.0.0.1:${PORT}`;

const SHOTS = [
  { name: "desktop", width: 1512, height: 945, url: "/", full: false },
  { name: "desktop-full", width: 1512, height: 945, url: "/", full: true },
  { name: "mobile", width: 390, height: 844, url: "/", full: false },
  { name: "room", width: 1512, height: 945, url: "/room", full: false },
  { name: "admin", width: 1512, height: 945, url: "/admin", full: false },
];

function waitForPort(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      fetch(url)
        .then((r) => (r.ok ? resolve() : retry(n)))
        .catch(() => retry(n));
    };
    const retry = (n) => {
      if (n >= tries) return reject(new Error("server never came up"));
      setTimeout(() => attempt(n + 1), 1000);
    };
    attempt(0);
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: path.join(__dirname, ".."),
    stdio: "ignore",
    shell: true,
  });

  const stop = () => {
    try {
      server.kill();
    } catch {
      /* already gone */
    }
  };
  process.on("exit", stop);

  try {
    await waitForPort(BASE);
    console.log("server up");

    const { chromium } = require("playwright");

    /* The bundled chromium for this playwright build is not downloaded, but a
       matching one already exists on the machine from an earlier install. */
    const browser = await chromium.launch({
      executablePath: path.join(
        process.env.LOCALAPPDATA,
        "ms-playwright",
        "chromium-1194",
        "chrome-win",
        "chrome.exe",
      ),
    });
    for (const shot of SHOTS) {
      const page = await browser.newPage({
        viewport: { width: shot.width, height: shot.height },
        deviceScaleFactor: 1,
      });
      await page.goto(BASE + shot.url, { waitUntil: "load", timeout: 45000 });
      /* Settle entrance animations before capture: a hidden-by-animation element
         reads as a missing element and would send a reviewer hunting a ghost. */
      await page.waitForTimeout(1400);
      await page.screenshot({
        path: path.join(OUT, `${shot.name}.png`),
        fullPage: shot.full,
      });
      console.log(`captured ${shot.name} ${shot.width}x${shot.height}`);
      await page.close();
    }
    await browser.close();
    console.log("ALL CAPTURED");
  } finally {
    stop();
  }
})().catch((err) => {
  console.error("CAPTURE FAILED:", err.message);
  process.exit(1);
});
