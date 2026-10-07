function About() {
  return (
    <section className="section about-section" id="about">
      <div className="section-container">
        <div className="about-heading">
          <span className="section-label">ABOUT INTERNHOP</span>

          <h2>
            Opportunities are everywhere.
            <span> Finding the right ones isn't.</span>
          </h2>

          <p>
            InternHop brings internships and hackathons into one
            focused platform, helping students discover opportunities
            that actually match what they're looking for.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-number">01</div>
            <div className="about-icon">⌕</div>

            <h3>Discover</h3>

            <p>
              Find internships and hackathons based on your skills,
              interests, location, and preferences.
            </p>
          </div>

          <div className="about-card featured">
            <div className="about-number">02</div>
            <div className="about-icon">✓</div>

            <h3>Verify</h3>

            <p>
              Check opportunities found elsewhere and understand the
              available evidence before applying or registering.
            </p>
          </div>

          <div className="about-card">
            <div className="about-number">03</div>
            <div className="about-icon">✦</div>

            <h3>Personalize</h3>

            <p>
              Build your profile once and get opportunities that
              become more relevant to your goals over time.
            </p>
          </div>
        </div>

        <div className="about-bottom">
          <div>
            <span>BUILT FOR STUDENTS</span>
            <strong>Less noise. Better opportunities.</strong>
          </div>

          <p>
            InternHop is designed around one simple idea:
            your time is valuable.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;