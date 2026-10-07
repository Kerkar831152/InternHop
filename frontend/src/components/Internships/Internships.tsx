import { useMemo, useState } from "react";

import { internships } from "../../data/internships";

import InternshipCard from "./InternshipCard";
import InternshipFilters from "./InternshipFilters";

function Internships() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const [saved, setSaved] = useState<number[]>([]);

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const query = search.toLowerCase();

      const matchesSearch =
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesLocation =
        !location ||
        internship.location === location ||
        (location === "Remote" && internship.internshipType === "Remote");

      const matchesType =
        !type || internship.internshipType === type;

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
    <section className="section opportunities-section" id="internships">
      <div className="section-container">
        <div className="section-heading-row">
          <div>
            <span className="section-label">INTERNSHIPS</span>

            <h2>
              Find your next
              <span> opportunity.</span>
            </h2>

            <p>
              Curated internships matched to the skills you're
              building.
            </p>
          </div>

          <a href="#verify" className="section-link">
            Verify an opportunity →
          </a>
        </div>

        <InternshipFilters
          search={search}
          location={location}
          type={type}
          onSearchChange={setSearch}
          onLocationChange={setLocation}
          onTypeChange={setType}
        />

        <div className="opportunity-grid">
          {filteredInternships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              saved={saved.includes(internship.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>

        {filteredInternships.length === 0 && (
          <div className="no-results">
            <div>⌕</div>
            <h3>No internships found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Internships;