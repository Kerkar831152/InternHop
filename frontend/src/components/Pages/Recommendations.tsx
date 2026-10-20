import { useEffect, useState } from "react";
import {
    getRecommendations,
    type RecommendedInternship,
    type RecommendedHackathon,
} from "../../api";

export default function Recommendations() {
    const [internships, setInternships] = useState<RecommendedInternship[]>([]);
    const [hackathons, setHackathons] = useState<RecommendedHackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadRecommendations() {
            try {
                const data = await getRecommendations();

                if (!cancelled) {
                    setInternships(data.internships);
                    setHackathons(data.hackathons);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load recommendations."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadRecommendations();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <main className="recommendations-page">
                <header className="recommendations-header">
                    <h1>Recommended for You</h1>
                    <p>
                        Personalized internships and hackathons based on your
                        profile and preferences.
                    </p>
                </header>
                <p className="recommendations-state" role="status">
                    Finding opportunities for you...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="recommendations-page">
                <header className="recommendations-header">
                    <h1>Recommended for You</h1>
                    <p>
                        Personalized internships and hackathons based on your
                        profile and preferences.
                    </p>
                </header>
                <div className="recommendations-state recommendations-state-error">
                    <p role="alert">{error}</p>
                    <p>Make sure you're logged in and try again.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="recommendations-page">
            <header className="recommendations-header">
                <h1>Recommended for You</h1>
                <p>
                    Opportunities ranked according to your skills,
                    preferred roles, location, and interests.
                </p>
            </header>

            <section className="recommendation-section" aria-labelledby="recommended-internships">
                <h2 id="recommended-internships">Recommended Internships</h2>

                {internships.length === 0 ? (
                    <p className="recommendations-state">
                        No internships available right now.
                    </p>
                ) : (
                    <div className="recommendations-grid">
                        {internships.map((item) => (
                            <article
                                className="recommendation-card"
                                key={item.id}
                            >
                                <div className="recommendation-card-top">
                                    <h3>{item.title}</h3>
                                    <span className="match-score">
                                        {item.match_score}% match
                                    </span>
                                </div>

                                <p className="recommendation-org">{item.company}</p>
                                <p className="recommendation-location">{item.location}</p>
                                <p className="recommendation-description">{item.description}</p>

                                {item.match_reasons.length > 0 && (
                                    <ul className="recommendation-reasons">
                                        {item.match_reasons.map((reason) => (
                                            <li key={reason}>{reason}</li>
                                        ))}
                                    </ul>
                                )}

                                <a
                                    href={item.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View opportunity ↗
                                </a>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="recommendation-section" aria-labelledby="recommended-hackathons">
                <h2 id="recommended-hackathons">Recommended Hackathons</h2>

                {hackathons.length === 0 ? (
                    <p className="recommendations-state">
                        No hackathons available right now.
                    </p>
                ) : (
                    <div className="recommendations-grid">
                        {hackathons.map((item) => (
                            <article
                                className="recommendation-card"
                                key={item.id}
                            >
                                <div className="recommendation-card-top">
                                    <h3>{item.title}</h3>
                                    <span className="match-score">
                                        {item.match_score}% match
                                    </span>
                                </div>

                                <p className="recommendation-org">{item.organizer}</p>
                                <p className="recommendation-location">{item.location}</p>
                                <p className="recommendation-description">{item.description}</p>

                                {item.match_reasons.length > 0 && (
                                    <ul className="recommendation-reasons">
                                        {item.match_reasons.map((reason) => (
                                            <li key={reason}>{reason}</li>
                                        ))}
                                    </ul>
                                )}

                                <a
                                    href={item.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View hackathon ↗
                                </a>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
