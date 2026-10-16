
import { useState } from "react";
import { apiRequest } from "../../api";
import "./AdminDashboard.css";

type DiscoveryType = "internships" | "hackathons" | "both";

interface DiscoveryResponse {
    message?: unknown;
    results?: unknown;
}

interface DiscoveryCounts {
    created?: number;
    updated?: number;
    skipped?: number;
}

const discoveryActions: {
    type: DiscoveryType;
    title: string;
    description: string;
    buttonLabel: string;
    icon: "briefcase" | "trophy" | "sparkles";
}[] = [
    {
        type: "internships",
        title: "Discover Internships",
        description:
            "Search for relevant internship opportunities and add new finds to your listings.",
        buttonLabel: "Discover internships",
        icon: "briefcase",
    },
    {
        type: "hackathons",
        title: "Discover Hackathons",
        description:
            "Find upcoming hackathons and refresh the opportunities available to your community.",
        buttonLabel: "Discover hackathons",
        icon: "trophy",
    },
    {
        type: "both",
        title: "Discover Both",
        description:
            "Run both searches together to keep internship and hackathon listings up to date.",
        buttonLabel: "Discover both",
        icon: "sparkles",
    },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCounts(value: unknown): DiscoveryCounts | null {
    if (!isRecord(value)) {
        return null;
    }

    const counts: DiscoveryCounts = {};
    for (const key of ["created", "updated", "skipped"] as const) {
        const count = value[key];
        if (typeof count === "number" && Number.isFinite(count) && count >= 0) {
            counts[key] = count;
        }
    }

    return Object.keys(counts).length > 0 ? counts : null;
}

function ActionIcon({ icon }: { icon: (typeof discoveryActions)[number]["icon"] }) {
    if (icon === "briefcase") {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
                <path d="M8 7.5v-2a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5.5v2M3.5 12h17M10 12v1.5h4V12" />
            </svg>
        );
    }

    if (icon === "trophy") {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 4.5h8v4a4 4 0 0 1-8 0v-4ZM8 7H4.5v1a4 4 0 0 0 4 4M16 7h3.5v1a4 4 0 0 1-4 4M12 12.5v4M8.5 20h7M10 16.5h4l1 3.5H9l1-3.5Z" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 15l1 2.5 2.5 1-2.5 1L19 22l-1-2.5-2.5-1 2.5-1 1-2.5Z" />
        </svg>
    );
}

function AdminDashboard() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiscoveryResponse | null>(null);
    const [error, setError] = useState("");

    async function runDiscovery(type: DiscoveryType) {
        setLoading(true);
        setResult(null);
        setError("");

        try {
            const data = await apiRequest<DiscoveryResponse>(
                "/opportunities/discover/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ type }),
                }
            );

            setResult(isRecord(data) ? data : {});
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Discovery failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="admin-dashboard">
            <header className="admin-dashboard-header">
                <span className="admin-eyebrow">ADMIN WORKSPACE</span>
                <h1>Admin Dashboard</h1>
                <p>
                    Manage opportunity discovery and keep the InternHop
                    community connected to what’s next.
                </p>
            </header>

            <section className="admin-actions-section" aria-labelledby="admin-actions-title">
                <div className="admin-section-heading">
                    <div>
                        <span className="admin-section-label">DISCOVERY TOOLS</span>
                        <h2 id="admin-actions-title">Available actions</h2>
                    </div>
                    <p>Choose what you’d like to search for.</p>
                </div>

                <div className="admin-discovery-actions">
                    {discoveryActions.map((action) => (
                        <article
                            className={`admin-action-card${action.type === "both" ? " admin-action-card-featured" : ""}`}
                            key={action.type}
                        >
                            <div className="admin-action-card-top">
                                <span className="admin-action-icon">
                                    <ActionIcon icon={action.icon} />
                                </span>
                                {action.type === "both" && (
                                    <span className="admin-recommended">Combined search</span>
                                )}
                            </div>
                            <div className="admin-action-copy">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                            <button
                                className="admin-action-button"
                                type="button"
                                onClick={() => runDiscovery(action.type)}
                                disabled={loading}
                                aria-label={`${action.buttonLabel}${loading ? ", discovery in progress" : ""}`}
                            >
                                {loading ? "Discovery in progress" : action.buttonLabel}
                                {!loading && (
                                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                        <path d="M4 10h12m-5-5 5 5-5 5" />
                                    </svg>
                                )}
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            {loading && (
                <div className="admin-state admin-loading" role="status" aria-live="polite">
                    <span className="admin-spinner" aria-hidden="true" />
                    <div>
                        <h2>Discovery is running</h2>
                        <p>Searching for opportunities and updating your listings. This may take a moment.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="admin-state admin-error" role="alert">
                    <span className="admin-state-mark" aria-hidden="true">!</span>
                    <div>
                        <h2>Discovery couldn’t be completed</h2>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {result && !loading && (
                <section className="admin-result" role="status" aria-live="polite">
                    <div className="admin-result-heading">
                        <span className="admin-success-mark" aria-hidden="true">✓</span>
                        <div>
                            <span className="admin-section-label">DISCOVERY COMPLETE</span>
                            <h2>
                                {typeof result.message === "string" && result.message.trim()
                                    ? result.message
                                    : "Discovery completed."}
                            </h2>
                        </div>
                    </div>

                    {(() => {
                        const resultGroups = isRecord(result.results) ? result.results : null;
                        const categories = [
                            { key: "internships", label: "Internships" },
                            { key: "hackathons", label: "Hackathons" },
                        ] as const;
                        const summaries = categories.flatMap(({ key, label }) => {
                            const counts = resultGroups ? readCounts(resultGroups[key]) : null;
                            return counts ? [{ key, label, counts }] : [];
                        });

                        return summaries.length > 0 ? (
                            <div className="admin-result-grid">
                                {summaries.map(({ key, label, counts }) => (
                                    <article className="admin-result-card" key={key}>
                                        <div className="admin-result-card-heading">
                                            <h3>{label}</h3>
                                            <span className="admin-result-status">Saved</span>
                                        </div>
                                        <dl className="admin-counts">
                                            <div>
                                                <dt>Created</dt>
                                                <dd>{counts.created ?? "—"}</dd>
                                            </div>
                                            <div>
                                                <dt>Updated</dt>
                                                <dd>{counts.updated ?? "—"}</dd>
                                            </div>
                                            <div>
                                                <dt>Skipped</dt>
                                                <dd>{counts.skipped ?? "—"}</dd>
                                            </div>
                                        </dl>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="admin-result-note">
                                The request completed, but no recognized opportunity counts were returned.
                            </p>
                        );
                    })()}
                </section>
            )}
        </section>
    );
}

export default AdminDashboard;
