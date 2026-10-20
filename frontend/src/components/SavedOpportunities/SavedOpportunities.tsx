
import { useEffect, useState } from "react";
import {
    getSavedOpportunities,
    getInternships,
    getHackathons,
    toggleSavedOpportunity,
    type InternshipRecord,
    type HackathonRecord,
} from "../../api";

function SavedOpportunities() {
    const [internships, setInternships] = useState<InternshipRecord[]>([]);
    const [hackathons, setHackathons] = useState<HackathonRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadSavedOpportunities() {
        setError("");

        try {
            const [saved, allInternships, allHackathons] = await Promise.all([
                getSavedOpportunities(),
                getInternships(),
                getHackathons(),
            ]);

            const savedInternshipIds = new Set(
                saved
                    .filter((item) => item.type === "internship")
                    .map((item) => item.opportunity_id)
            );

            const savedHackathonIds = new Set(
                saved
                    .filter((item) => item.type === "hackathon")
                    .map((item) => item.opportunity_id)
            );

            setInternships(
                allInternships.filter((item) => savedInternshipIds.has(item.id))
            );

            setHackathons(
                allHackathons.filter((item) => savedHackathonIds.has(item.id))
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load saved opportunities."
            );
        } finally {
            setLoading(false);
        }
    }

   useEffect(() => {
    let active = true;

    async function load() {
        try {
            const [saved, allInternships, allHackathons] = await Promise.all([
                getSavedOpportunities(),
                getInternships(),
                getHackathons(),
            ]);

            if (!active) return;

            const savedInternshipIds = new Set(
                saved
                    .filter((item) => item.type === "internship")
                    .map((item) => item.opportunity_id)
            );

            const savedHackathonIds = new Set(
                saved
                    .filter((item) => item.type === "hackathon")
                    .map((item) => item.opportunity_id)
            );

            setInternships(
                allInternships.filter((item) => savedInternshipIds.has(item.id))
            );

            setHackathons(
                allHackathons.filter((item) => savedHackathonIds.has(item.id))
            );
        } catch (err) {
            if (active) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load saved opportunities."
                );
            }
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }

    void load();

    return () => {
        active = false;
    };
}, []);

    async function handleUnsave(
        type: "internship" | "hackathon",
        id: number
    ) {
        try {
            await toggleSavedOpportunity(type, id);

            if (type === "internship") {
                setInternships((current) =>
                    current.filter((item) => item.id !== id)
                );
            } else {
                setHackathons((current) =>
                    current.filter((item) => item.id !== id)
                );
            }
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to remove saved opportunity."
            );
        }
    }

    if (loading) {
        return (
            <section className="saved-opportunities saved-opportunities-loading">
                <h1>Saved Opportunities</h1>
                <p className="saved-state-message">Loading your saved opportunities...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="saved-opportunities saved-opportunities-error">
                <h1>Saved Opportunities</h1>
                <p className="saved-state-message">{error}</p>
                <button
                    className="saved-retry-button"
                    onClick={() => void loadSavedOpportunities()}
                >
                    Try Again
                </button>
            </section>
        );
    }

    const isEmpty = internships.length === 0 && hackathons.length === 0;

    return (
        <section className="saved-opportunities">
            <h1>Saved Opportunities</h1>
            <p className="saved-intro">Keep track of internships and hackathons you want to explore.</p>

            {isEmpty ? (
                <p className="saved-empty-state">You haven't saved any opportunities yet.</p>
            ) : (
                <>
                    {internships.length > 0 && (
                        <div className="saved-section">
                            <h2>Internships ({internships.length})</h2>

                            <div className="saved-list">
                                {internships.map((item) => (
                                    <article className="saved-card" key={item.id}>
                                        <h3>{item.title}</h3>
                                        <p className="saved-company">{item.company}</p>
                                        <p className="saved-location">{item.location}</p>
                                        <p className="saved-detail">Stipend: {item.stipend || "Not specified"}</p>
                                        {item.description && (
                                            <p className="saved-description">{item.description}</p>
                                        )}
                                        {item.skills && (
                                            <p className="saved-detail">Skills: {item.skills}</p>
                                        )}

                                        {item.deadline && (
                                            <p className="saved-deadline">Deadline: {item.deadline}</p>
                                        )}

                                        <div className="saved-card-actions">
                                            {item.source_url ? (
                                                <a
                                                    href={item.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View opportunity
                                                </a>
                                            ) : (
                                                <span className="saved-link-unavailable">
                                                    Link unavailable
                                                </span>
                                            )}

                                            <button
                                                onClick={() =>
                                                    void handleUnsave("internship", item.id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                    {hackathons.length > 0 && (
                        <div className="saved-section">
                            <h2>Hackathons ({hackathons.length})</h2>

                            <div className="saved-list">
                                {hackathons.map((item) => (
                                    <article className="saved-card" key={item.id}>
                                        <h3>{item.title}</h3>
                                        <p className="saved-company">{item.organizer}</p>
                                        <p className="saved-location">{item.location}</p>
                                        <p className="saved-detail">Mode: {item.participation_mode}</p>
                                        {item.description && (
                                            <p className="saved-description">{item.description}</p>
                                        )}
                                        {item.themes && (
                                            <p className="saved-detail">Themes: {item.themes}</p>
                                        )}

                                        {item.registration_deadline && (
                                            <p className="saved-deadline">
                                                Registration deadline:{" "}
                                                {item.registration_deadline}
                                            </p>
                                        )}

                                        <div className="saved-card-actions">
                                            {item.source_url ? (
                                                <a
                                                    href={item.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View hackathon
                                                </a>
                                            ) : (
                                                <span className="saved-link-unavailable">
                                                    Link unavailable
                                                </span>
                                            )}

                                            <button
                                                onClick={() =>
                                                    void handleUnsave("hackathon", item.id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default SavedOpportunities;
