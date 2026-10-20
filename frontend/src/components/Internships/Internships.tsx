import { useEffect, useMemo, useState } from "react";
import {
  getInternships,
  getSavedOpportunities,
  toggleSavedOpportunity,
  deleteInternship,
  type InternshipRecord,
} from "../../api";
import InternshipCard from "./InternshipCard";
import InternshipFilters from "./InternshipFilters";
import type { Page } from "../../types/navigation";


interface InternshipsProps {
  isAdmin: boolean;
  isAuthenticated: boolean;
  onNavigate: (page: Page) => void;
}

function Internships({ isAdmin, isAuthenticated, onNavigate }: InternshipsProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState<"recommended" | "deadline" | "title">("recommended");
  const [saved, setSaved] = useState<number[]>([]);
  const [internships, setInternships] = useState<InternshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");

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

  useEffect(() => {
  if (!isAuthenticated) return;

  let active = true;

  getSavedOpportunities()
    .then((items) => {
      if (active) {
        setSaved(
          items
            .filter((item) => item.type === "internship")
            .map((item) => item.opportunity_id)
        );
        setSavedError("");
      }
    })
    .catch(() => {
      if (active) {
        setSaved([]);
        setSavedError("Saved status could not be loaded.");
      }
    });

  return () => {
    active = false;
  };
}, [isAuthenticated]);

  const filteredInternships = useMemo(() => {
    const filtered = internships.filter((internship) => {
      const query = search.toLowerCase();
      const skills = internship.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const internshipType = internship.internship_type || "";

      const matchesSearch =
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.description.toLowerCase().includes(query) ||
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

    if (sortBy === "title") {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "deadline") {
      return filtered.sort((a, b) => {
        const aDate = a.deadline ? Date.parse(a.deadline) : Number.POSITIVE_INFINITY;
        const bDate = b.deadline ? Date.parse(b.deadline) : Number.POSITIVE_INFINITY;
        return (Number.isNaN(aDate) ? Number.POSITIVE_INFINITY : aDate) -
          (Number.isNaN(bDate) ? Number.POSITIVE_INFINITY : bDate);
      });
    }

    return filtered;
  }, [internships, search, location, type, sortBy]);

  const locations = useMemo(
    () => Array.from(new Set(internships.map((item) => item.location).filter(Boolean))).sort(),
    [internships]
  );

  const types = useMemo(
    () => Array.from(new Set(internships.map((item) => item.internship_type).filter(Boolean))).sort(),
    [internships]
  );

 const toggleSave = async (id: number) => {
  try {
    const result = await toggleSavedOpportunity("internship", id);

    setSavedError("");
    setSaved((current) =>
      result.saved
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((savedId) => savedId !== id)
    );
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Failed to update saved internship."
    );
  }
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

          <button
            type="button"
            className="section-link"
            onClick={() => onNavigate("verify")}
          >
            Check an opportunity image →
          </button>
        </div>

        <InternshipFilters
          search={search}
          location={location}
          type={type}
          onSearchChange={setSearch}
          onLocationChange={setLocation}
          onTypeChange={setType}
          locations={locations}
          types={types}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {savedError && (
          <p className="opportunity-save-state" role="status">
            {savedError}
          </p>
        )}

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
                    description: internship.description,
                    source_url: internship.source_url,
                  }}
                  saved={saved.includes(internship.id)}
                  onToggleSave={toggleSave}
                  canSave={isAuthenticated}
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