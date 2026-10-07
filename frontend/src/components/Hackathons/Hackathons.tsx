import { useMemo, useState } from "react";

import { hackathons } from "../../data/hackathons";

import HackathonCard from "./HackathonCard";
import HackathonFilters from "./HackathonFilters";

function Hackathons() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const [saved, setSaved] = useState<number[]>([]);

  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const query = search.toLowerCase();

      const matchesSearch =
        hackathon.title.toLowerCase().includes(query) ||
        hackathon.organizer.toLowerCase().includes(query) ||
        hackathon.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesLocation =
        !location || hackathon.location === location;

      const matchesType =
        !type || hackathon.eventType === type;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [search, location, type]);

  const toggleSave = (id: number) => {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    );
  };

  return (
    <section
      className="section opportunities-section alternate-section"
      id="hackathons"
    >
      <div className="section-container">
        <div className="section-heading-row">
          <div>
            <span className="section-label">HACKATHONS</span>

            <h2>
              Build something
              <span> worth showing.</span>
            </h2>

            <p>
              Discover competitions, build challenges, and events
              worth your weekend.
            </p>
          </div>

          <a href="#intnem" className="section-link">
            Ask Intnem →
          </a>
        </div>

        <HackathonFilters
          search={search}
          location={location}
          type={type}
          onSearchChange={setSearch}
          onLocationChange={setLocation}
          onTypeChange={setType}
        />

        <div className="opportunity-grid">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              saved={saved.includes(hackathon.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="no-results">
            <div>⌕</div>
            <h3>No hackathons found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Hackathons;