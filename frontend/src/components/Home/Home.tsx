import type { Page } from "../../types/navigation";

interface HomeProps {
  onNavigate: (page: Page) => void;
}

function Home({ onNavigate }: HomeProps) {
  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <div className="hero-label">
          <span className="live-dot"></span>
          YOUR NEXT STEP STARTS HERE
        </div>

        <h1>
          Discover opportunities
          <br />
          <span>built around you.</span>
        </h1>

        <p>
          Explore internships and hackathons, save the ones you like, and get
          recommendations informed by your skills and preferences.
        </p>

        <div className="hero-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => onNavigate("explore")}
          >
            Explore opportunities <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate("verify")}
          >
            Check an image
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="home-feature-panel">
          <span className="home-feature-eyebrow">A clearer way to discover</span>
          <h2>Find the right opportunity, at your own pace.</h2>
          <div className="home-feature-list">
            <div>
              <span aria-hidden="true">01</span>
              <p><strong>Explore</strong> internships and hackathons in one place.</p>
            </div>
            <div>
              <span aria-hidden="true">02</span>
              <p><strong>Personalize</strong> recommendations with your profile.</p>
            </div>
            <div>
              <span aria-hidden="true">03</span>
              <p><strong>Keep track</strong> of opportunities you save.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;