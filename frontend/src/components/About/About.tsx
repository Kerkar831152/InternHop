function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <div className="about-heading">
          <span className="section-label">ABOUT INTERNHOP</span>

          <h2>
            Opportunities are everywhere.
            <span> Finding the right ones isn't.</span>
          </h2>

          <p>
            InternHop brings internships and hackathons into one focused
            platform, helping students discover opportunities that actually
            match what they are looking for.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <span className="about-card-icon">⌕</span>

            <div>
              <h3>Discover</h3>

              <p>
                Find internships and hackathons based on your skills,
                interests, location, and preferences.
              </p>
            </div>
          </div>

          <div className="about-card">
            <span className="about-card-icon">✓</span>

            <div>
              <h3>Verify</h3>

              <p>
                Check opportunities found elsewhere and understand the
                available evidence before applying or registering.
              </p>
            </div>
          </div>

          <div className="about-card">
            <span className="about-card-icon">✦</span>

            <div>
              <h3>Personalize</h3>

              <p>
                Build your profile once and get opportunities that become
                more relevant to your goals over time.
              </p>
            </div>
          </div>
        </div>

        <div className="about-footer">
          <span>BUILT FOR STUDENTS</span>

          <p>
            Less noise. Better opportunities. More time spent building
            your future.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;