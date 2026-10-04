import './App.css'
import { internships } from "./data/internships";
import OpportunityCard from "./components/OpportunityCards";
function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">Intern<span>Hop</span></div>

        <div className="nav-links">
          <a href="#internships">Internships</a>
          <a href="#hackathons">Hackathons</a>
          <a href="#about">About</a>
        </div>

        <button className="login-btn">Sign In</button>
      </nav>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</p>

          <h1>
            Find opportunities
            <br />
            <span>worth chasing.</span>
          </h1>

          <p className="hero-text">
            Discover internships and hackathons from trusted sources,
            all in one place.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search internships, skills, companies..."
            />

            <button>Search</button>
          </div>
        </section>

        <section className="opportunities">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h2>Opportunities</h2>
            </div>

            <button className="view-all">View all →</button>
          </div>

          <div className="opportunity-grid">
            {internships.map((internship) => (
              <OpportunityCard key={internship.id} internship={internship}/>
              ))}
          </div>
        </section> 
      </main>
    </div>
  );
}

export default App;