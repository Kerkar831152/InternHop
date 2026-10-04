import { useState } from "react";
import { hackathons } from "../../data/hackathons";
import HackathonCard from "./HackathonCard";
import HackathonFilters from "./HackathonFilters";

function Hackathons() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const filteredHackathons = hackathons.filter((hackathon) => {
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

  const toggleSave = (id: number) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    );
  };

  return (
    <section className="hackathons-section" id="hackathons">
      <div className="section-heading">
        <div>
          <span className="section-label">COMPETE & BUILD</span>

          <h2>Find your next hackathon.</h2>

          <p>
            Discover hackathons worth your time and start building.
          </p>
        </div>

        <span className="hackathon-count">
          {filteredHackathons.length} opportunities
        </span>
      </div>

      <HackathonFilters
        search={search}
        location={location}
        type={type}
        onSearchChange={setSearch}
        onLocationChange={setLocation}
        onTypeChange={setType}
      />

      <div className="hackathon-grid">
        {filteredHackathons.length > 0 ? (
          filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              saved={savedIds.includes(hackathon.id)}
              onToggleSave={toggleSave}
            />
          ))
        ) : (
          <div className="no-hackathons">
            <h3>No hackathons found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Hackathons;