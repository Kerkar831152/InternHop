import { useEffect, useMemo, useState } from "react";
import {
  getHackathons,
  getSavedOpportunities,
  toggleSavedOpportunity,
  deleteHackathon,
  type HackathonRecord,
} from "../../api";
import HackathonCard from "./HackathonCard";
import HackathonFilters from "./HackathonFilters";


interface HackathonsProps {
  isAdmin: boolean;
}

function Hackathons({ isAdmin }: HackathonsProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [hackathons, setHackathons] = useState<HackathonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getHackathons()
      .then((data) => {
        if (active) {
          setHackathons(data);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load hackathons."
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
  let active = true;

  getSavedOpportunities()
    .then((items) => {
      if (active) {
        setSaved(
          items
            .filter((item) => item.type === "hackathon")
            .map((item) => item.opportunity_id)
        );
      }
    })
    .catch(() => {
      if (active) {
        setSaved([]);
      }
    });

  return () => {
    active = false;
  };
}, []);

  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const query = search.toLowerCase();
      const skills = hackathon.themes
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const matchesSearch =
        hackathon.title.toLowerCase().includes(query) ||
        hackathon.organizer.toLowerCase().includes(query) ||
        skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesLocation =
        !location || hackathon.location === location;

      const matchesType =
        !type ||
        hackathon.event_type === type ||
        hackathon.participation_mode === type;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [hackathons, search, location, type]);

 const toggleSave = async (id: number) => {
  try {
    const result = await toggleSavedOpportunity("hackathon", id);

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
        : "Failed to update saved hackathon."
    );
  }
};

  const handleDelete = async (id: number) => {
  if (!window.confirm("Are you sure you want to delete this hackathon?")) {
    return;
  }

  try {
    await deleteHackathon(id);

    setHackathons((current) =>
      current.filter((hackathon) => hackathon.id !== id)
    );
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Failed to delete hackathon."
    );
  }
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

        {loading && (
          <div className="no-results">
            <h3>Loading hackathons...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="no-results">
            <h3>Unable to load hackathons</h3>
            <p>{error}</p>
            <p>Make sure the Django backend is running.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="opportunity-grid">
              {filteredHackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={{
                    id: hackathon.id,
                    title: hackathon.title,
                    organizer: hackathon.organizer,
                    location: hackathon.location,
                    source_url: hackathon.source_url,
                    eventType:
                      hackathon.participation_mode || hackathon.event_type,
                    skills: hackathon.themes
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                    prize: "Not specified",
                    deadline:
                      hackathon.registration_deadline || "Not specified",
                  }}
                  saved={saved.includes(hackathon.id)}
                  onToggleSave={toggleSave}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {filteredHackathons.length === 0 && (
              <div className="no-results">
                <div>⌕</div>
                <h3>No hackathons found</h3>
                <p>
                  {hackathons.length === 0
                    ? "No hackathons are currently available in the database."
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

export default Hackathons;