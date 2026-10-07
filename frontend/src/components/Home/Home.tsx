function Home() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-grid"></div>

      <div className="hero-glow hero-glow-one"></div>
      <div className="hero-glow hero-glow-two"></div>

      <div className="hero-content">
        <div className="hero-label">
          <span className="live-dot"></span>
          OPPORTUNITIES, WITHOUT THE NOISE
        </div>

        <h1>
          Find opportunities
          <br />
          <span>worth your time.</span>
        </h1>

        <p>
          Discover internships and hackathons matched to your skills,
          interests, and preferences — all in one focused platform.
        </p>

        <div className="hero-actions">
          <a href="#internships" className="primary-button">
            Explore Internships
            <span>→</span>
          </a>

          <a href="#hackathons" className="secondary-button">
            Explore Hackathons
          </a>
        </div>

        <div className="hero-trust">
          <div className="avatar-stack">
            <span>V</span>
            <span>A</span>
            <span>R</span>
          </div>

          <div>
            <strong>Built for ambitious students</strong>
            <p>Discover • Verify • Build</p>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-orbit orbit-one"></div>
        <div className="visual-orbit orbit-two"></div>
        <div className="visual-orbit orbit-three"></div>

        <div className="visual-core">
          <div className="core-symbol">✦</div>
        </div>

        <div className="floating-card floating-card-one">
          <span className="mini-logo">T</span>

          <div>
            <strong>Frontend Intern</strong>
            <small>TechNova · Remote</small>
          </div>

          <span className="match-score">94%</span>
        </div>

        <div className="floating-card floating-card-two">
          <span className="mini-logo purple">AI</span>

          <div>
            <strong>AI for Good</strong>
            <small>Hackathon · Online</small>
          </div>

          <span className="verified-mark">✓</span>
        </div>
      </div>
    </section>
  );
}

export default Home;