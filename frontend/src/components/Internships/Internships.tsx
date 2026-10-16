import { useEffect, useMemo, useState } from "react";
import { getInternships, type InternshipRecord } from "../../api";
import InternshipCard from "./InternshipCard";
import InternshipFilters from "./InternshipFilters";
import { deleteInternship } from "../../api";


interface InternshipsProps {
  isAdmin: boolean;
}

function Internships({ isAdmin }: InternshipsProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [internships, setInternships] = useState<InternshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getInternships()
      .then((data) => {
        if (active) {
          setInternships(data);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load internships."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const query = search.toLowerCase();
      const skills = internship.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const internshipType = internship.internship_type || "";

      const matchesSearch =
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesLocation =
        !location ||
        internship.location === location ||
        (location === "Remote" &&
          internshipType.toLowerCase() === "remote");

      const matchesType =
        !type || internshipType === type;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [internships, search, location, type]);

  const toggleSave = (id: number) => {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    );
  };

  const handleDelete = async (id: number) => {
  if (!window.confirm("Are you sure you want to delete this internship?")) {
    return;
  }

  try {
    await deleteInternship(id);
    setInternships((current) =>
      current.filter((internship) => internship.id !== id)
    );
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Failed to delete internship."
    );
  }
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

        {loading && (
          <div className="no-results">
            <h3>Loading internships...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="no-results">
            <h3>Unable to load internships</h3>
            <p>{error}</p>
            <p>Make sure the Django backend is running.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="opportunity-grid">
              {filteredInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={{
                    id: internship.id,
                    title: internship.title,
                    company: internship.company,
                    location: internship.location,
                    internshipType: internship.internship_type,
                    skills: internship.skills
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                    stipend: internship.stipend || "Not specified",
                    deadline: internship.deadline || "Not specified",
                    source_url: internship.source_url,
                  }}
                  saved={saved.includes(internship.id)}
                  onToggleSave={toggleSave}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {filteredInternships.length === 0 && (
              <div className="no-results">
                <div>⌕</div>
                <h3>No internships found</h3>
                <p>
                  {internships.length === 0
                    ? "No internships are currently available in the database."
                    : "Try changing your search or filters."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Internships;