function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand">
            <div className="brand-mark">
              <span>✦</span>
            </div>

            <div className="brand-text">
              <strong>
                Intern<span>Hop</span>
              </strong>
              <small>OPPORTUNITY PLATFORM</small>
            </div>
          </div>

          <p>
            Discover better internships, hackathons, and opportunities
            without the noise.
          </p>
        </div>

        <div className="footer-links">
          <a href="#internships">Internships</a>
          <a href="#hackathons">Hackathons</a>
          <a href="#verify">Verify</a>
          <a href="#intnem">Ask Intnem</a>
          <a href="#about">About</a>
        </div>

        <div className="footer-bottom">
          <span>© 2026 InternHop</span>
          <span>Built for students.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;