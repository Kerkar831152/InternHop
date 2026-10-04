import { useState } from "react";
import { internships } from "../../data/internships";
import InternshipCard from "./InternshipCard";
import InternshipFilters from "./InternshipFilters";

function Internships() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const filteredInternships = internships.filter((internship) => {
    const query = search.toLowerCase();

    const matchesSearch =
      internship.title.toLowerCase().includes(query) ||
      internship.company.toLowerCase().includes(query) ||
      internship.skills.some((skill) =>
        skill.toLowerCase().includes(query)
      );

    const matchesLocation =
      !location || internship.location === location;

    const matchesType =
      !type || internship.internshipType === type;

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
    <section className="internships-section" id="internships">
      <div className="section-heading">
        <div>
          <span className="section-label">OPPORTUNITIES</span>

          <h2>Find your next internship.</h2>

          <p>
            Explore opportunities matched to your skills and interests.
          </p>
        </div>

        <span className="internship-count">
          {filteredInternships.length} opportunities
        </span>
      </div>

      <InternshipFilters
        search={search}
        location={location}
        type={type}
        onSearchChange={setSearch}
        onLocationChange={setLocation}
        onTypeChange={setType}
      />

      <div className="internship-grid">
        {filteredInternships.length > 0 ? (
          filteredInternships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              saved={savedIds.includes(internship.id)}
              onToggleSave={toggleSave}
            />
          ))
        ) : (
          <div className="no-internships">
            <h3>No internships found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Internships;