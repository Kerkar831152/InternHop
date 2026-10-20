import type { Page } from "../../types/navigation";

interface FooterProps {
  onNavigate: (page: Page) => void;
}

function Footer({ onNavigate }: FooterProps) {
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
          <button type="button" onClick={() => onNavigate("internships")}>Internships</button>
          <button type="button" onClick={() => onNavigate("hackathons")}>Hackathons</button>
          <button type="button" onClick={() => onNavigate("verify")}>Image check</button>
          <button type="button" onClick={() => onNavigate("assistant")}>Ask Intnem</button>
          <button type="button" onClick={() => onNavigate("about")}>About</button>
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