export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <a className="logo" href="#top" aria-label="IceBreaker Hub, ke atas">
          <span className="logo-mark" aria-hidden="true">🧊</span>
          <span className="logo-word">
            IceBreaker<span>Hub</span>
          </span>
        </a>
        <nav className="footer-links" aria-label="Navigasi bawah">
          <a href="#alat">Alat</a>
          <a href="#game">Game</a>
          <a href="#katalog">Katalog</a>
          <a href="#untuk">Untuk kamu</a>
        </nav>
        <p className="footer-note">
          © 2026 IceBreaker Hub. Dibuat untuk para pembawa acara.
        </p>
      </div>
    </footer>
  );
}