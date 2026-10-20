import { useEffect, useMemo, useState } from "react";
import {
    getRecommendations,
    getSavedOpportunities,
    toggleSavedOpportunity,
    type RecommendedHackathon,
    type RecommendedInternship,
} from "../../api";
import type { Page } from "../../types/navigation";

interface RecommendationsProps {
    username: string;
    onNavigate: (page: Page) => void;
    isDashboard?: boolean;
}

interface RecommendationCardData {
    id: number;
    type: "internship" | "hackathon";
    title: string;
    organization: string;
    location: string;
    description: string;
    details: string[];
    deadline: string | null;
    sourceUrl: string;
    matchScore: number;
    matchReasons: string[];
}

function toInternshipCard(item: RecommendedInternship): RecommendationCardData {
    return {
        id: item.id,
        type: "internship",
        title: item.title,
        organization: item.company,
        location: item.location,
        description: item.description,
        details: [item.internship_type, item.stipend].filter(Boolean),
        deadline: item.deadline,
        sourceUrl: item.source_url,
        matchScore: item.match_score,
        matchReasons: item.match_reasons,
    };
}

function toHackathonCard(item: RecommendedHackathon): RecommendationCardData {
    return {
        id: item.id,
        type: "hackathon",
        title: item.title,
        organization: item.organizer,
        location: item.location,
        description: item.description,
        details: [item.participation_mode || item.event_type, item.themes]
            .filter(Boolean),
        deadline: item.registration_deadline,
        sourceUrl: item.source_url,
        matchScore: item.match_score,
        matchReasons: item.match_reasons,
    };
}

export default function Recommendations({
    username,
    onNavigate,
    isDashboard = false,
}: RecommendationsProps) {
    const [internships, setInternships] = useState<RecommendedInternship[]>([]);
    const [hackathons, setHackathons] = useState<RecommendedHackathon[]>([]);
    const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
    const [savedCount, setSavedCount] = useState<number | null>(null);
    const [savedError, setSavedError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getRecommendations()
            .then((data) => {
                if (!cancelled) {
                    setInternships(data.internships);
                    setHackathons(data.hackathons);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load recommendations."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        getSavedOpportunities()
            .then((items) => {
                if (!cancelled) {
                    setSavedKeys(
                        new Set(items.map((item) => `${item.type}:${item.opportunity_id}`))
                    );
                    setSavedCount(items.length);
                    setSavedError("");
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSavedCount(null);
                    setSavedError("Saved opportunity count is unavailable.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const upcomingDeadlines = useMemo(() => {
        const cards = [
            ...internships.map(toInternshipCard),
            ...hackathons.map(toHackathonCard),
        ];
        const today = new Date();

        return cards
            .map((item) => ({
                ...item,
                deadlineDate: item.deadline ? new Date(item.deadline) : null,
            }))
            .filter(
                (item) =>
                    item.deadlineDate &&
                    !Number.isNaN(item.deadlineDate.getTime()) &&
                    item.deadlineDate >= today
            )
            .sort(
                (a, b) =>
                    (a.deadlineDate?.getTime() ?? 0) -
                    (b.deadlineDate?.getTime() ?? 0)
            )
            .slice(0, 3);
    }, [internships, hackathons]);

    async function handleToggleSave(item: RecommendationCardData) {
        const key = `${item.type}:${item.id}`;
        setSavingKey(key);
        setActionError("");

        try {
            const result = await toggleSavedOpportunity(item.type, item.id);
            setSavedKeys((current) => {
                const next = new Set(current);
                if (result.saved) next.add(key);
                else next.delete(key);
                return next;
            });
            setSavedCount((count) =>
                count === null
                    ? count
                    : Math.max(0, count + (result.saved ? 1 : -1))
            );
        } catch (err: unknown) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Unable to update saved opportunities."
            );
        } finally {
            setSavingKey(null);
        }
    }

    function renderCards(items: RecommendationCardData[], kind: "internship" | "hackathon") {
        const visibleItems = isDashboard ? items.slice(0, 3) : items;

        if (items.length === 0) {
            return (
                <div className="recommendations-state">
                    <p>
                        No {kind === "internship" ? "internships" : "hackathons"}{" "}
                        match your preferences right now.
                    </p>
                    <button
                        type="button"
                        className="recommendations-text-action"
                        onClick={() => onNavigate("profile")}
                    >
                        Review your profile preferences
                    </button>
                </div>
            );
        }

        return (
            <div className="recommendations-grid">
                {visibleItems.map((item) => {
                    const key = `${item.type}:${item.id}`;
                    const isSaved = savedKeys.has(key);

                    return (
                        <article className="recommendation-card" key={key}>
                            <div className="recommendation-card-top">
                                <div className="recommendation-title-wrap">
                                    <span className="recommendation-org-mark" aria-hidden="true">
                                        {item.organization.trim().charAt(0).toUpperCase() || "O"}
                                    </span>
                                    <div>
                                        <p className="recommendation-org">{item.organization}</p>
                                        <h3>{item.title}</h3>
                                    </div>
                                </div>
                                <span className="match-score" aria-label={`${item.matchScore}% match`}>
                                    {item.matchScore}% match
                                </span>
                            </div>

                            <p className="recommendation-location">{item.location}</p>
                            <p className="recommendation-description">{item.description}</p>

                            {item.details.length > 0 && (
                                <div className="recommendation-details">
                                    {item.details.map((detail) => (
                                        <span key={detail}>{detail}</span>
                                    ))}
                                </div>
                            )}

                            {item.deadline && (
                                <p className="recommendation-deadline">
                                    Deadline: {item.deadline}
                                </p>
                            )}

                            {item.matchReasons.length > 0 && (
                                <div className="recommendation-match-reasons">
                                    <span className="recommendation-reasons-label">
                                        Why it matches
                                    </span>
                                    <ul className="recommendation-reasons">
                                        {item.matchReasons.map((reason) => (
                                            <li key={reason}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="recommendation-card-actions">
                                <button
                                    type="button"
                                    className={`recommendation-save-button${isSaved ? " is-saved" : ""}`}
                                    onClick={() => void handleToggleSave(item)}
                                    disabled={savingKey === key}
                                    aria-pressed={isSaved}
                                >
                                    {savingKey === key
                                        ? "Saving..."
                                        : isSaved
                                          ? "Saved"
                                          : "Save"}
                                </button>
                                {item.sourceUrl ? (
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View {kind === "internship" ? "opportunity" : "hackathon"}
                                        <span aria-hidden="true">↗</span>
                                    </a>
                                ) : (
                                    <span className="recommendation-link-unavailable">
                                        Link unavailable
                                    </span>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    }

    const internshipCards = internships.map(toInternshipCard);
    const hackathonCards = hackathons.map(toHackathonCard);

    return (
        <section className={`recommendations-page${isDashboard ? " dashboard-page" : ""}`}>
            <header className="recommendations-header">
                <div>
                    {isDashboard && <p className="dashboard-eyebrow">STUDENT DASHBOARD</p>}
                    <h1>
                        {isDashboard ? `Welcome back, ${username}` : "Recommended for You"}
                    </h1>
                    <p>
                        Recommendations use your profile skills and preferences to help
                        you discover relevant opportunities. Match scores are guides,
                        not guarantees of eligibility or acceptance.
                    </p>
                </div>
                <div className="recommendations-header-actions">
                    {isDashboard && (
                        <button
                            type="button"
                            className="recommendations-explore-action"
                            onClick={() => onNavigate("explore")}
                        >
                            Explore opportunities
                        </button>
                    )}
                    <button
                        type="button"
                        className="recommendations-profile-action"
                        onClick={() => onNavigate("profile")}
                    >
                        Update preferences
                    </button>
                </div>
            </header>

            {isDashboard && (
                <div className="dashboard-overview">
                    <article className="dashboard-overview-card">
                        <span className="dashboard-overview-label">Saved opportunities</span>
                        {savedCount === null ? (
                            <span className="dashboard-overview-value dashboard-overview-unavailable">
                                {loading ? "Loading saved count..." : savedError}
                            </span>
                        ) : (
                            <strong className="dashboard-overview-value">{savedCount}</strong>
                        )}
                        <button type="button" onClick={() => onNavigate("saved")}>
                            View saved <span aria-hidden="true">→</span>
                        </button>
                    </article>
                    <article className="dashboard-overview-card dashboard-deadlines-card">
                        <span className="dashboard-overview-label">Upcoming deadlines</span>
                        {upcomingDeadlines.length === 0 ? (
                            <span className="dashboard-overview-value dashboard-overview-unavailable">
                                {loading
                                    ? "Loading recommendations..."
                                    : "No upcoming dates in your recommendations"}
                            </span>
                        ) : (
                            upcomingDeadlines.map((item) => (
                                <span className="dashboard-deadline-item" key={`${item.type}:${item.id}`}>
                                    <strong>{item.title}</strong>
                                    <span>{item.deadline}</span>
                                </span>
                            ))
                        )}
                    </article>
                </div>
            )}

            {actionError && (
                <p className="recommendations-state recommendations-state-error" role="alert">
                    {actionError}
                </p>
            )}

            {loading ? (
                <p className="recommendations-state" role="status">
                    Finding opportunities for you...
                </p>
            ) : error ? (
                <div className="recommendations-state recommendations-state-error">
                    <p role="alert">{error}</p>
                    <p>Make sure you are logged in and try again.</p>
                </div>
            ) : (
                <>
                    <section
                        className="recommendation-section"
                        aria-labelledby="recommended-internships"
                    >
                        <div className="recommendation-section-heading">
                            <h2 id="recommended-internships">Recommended Internships</h2>
                            {isDashboard && internships.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => onNavigate("recommendations")}
                                >
                                    View all
                                </button>
                            )}
                        </div>
                        {renderCards(internshipCards, "internship")}
                    </section>

                    <section
                        className="recommendation-section"
                        aria-labelledby="recommended-hackathons"
                    >
                        <div className="recommendation-section-heading">
                            <h2 id="recommended-hackathons">Recommended Hackathons</h2>
                            {isDashboard && hackathons.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => onNavigate("recommendations")}
                                >
                                    View all
                                </button>
                            )}
                        </div>
                        {renderCards(hackathonCards, "hackathon")}
                    </section>
                </>
            )}
        </section>
    );
}
