function Home() {
  return (
    <section className="home" id="home">
      <div className="home-content">
        <span className="home-label">
          OPPORTUNITIES, WITHOUT THE NOISE
        </span>

        <h1>
          Find opportunities
          <br />
          <span>worth your time.</span>
        </h1>

        <p>
          Discover internships and hackathons matched to your skills,
          interests, and preferences — all in one place.
        </p>

        <div className="home-actions">
          <a href="#internships" className="home-primary-btn">
            Explore Internships
          </a>

          <a href="#hackathons" className="home-secondary-btn">
            Explore Hackathons
          </a>
        </div>

        <button className="personalized-match-btn">
          <span className="personalized-match-icon">✦</span>
          Get Personalized Matches
        </button>
      </div>

      <div className="home-visual">
        <div className="home-glow"></div>
      </div>
    </section>
  );
}

export default Home;