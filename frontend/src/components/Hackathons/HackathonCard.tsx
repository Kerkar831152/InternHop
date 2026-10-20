
import type { HackathonCardProps } from "../../types/hackathons";

interface ExtendedHackathonCardProps extends HackathonCardProps {
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
}

function HackathonCard({
  hackathon,
  saved,
  onToggleSave,
  canSave = true,
  isAdmin = false,
  onDelete,
}: ExtendedHackathonCardProps) {
  const sourceUrl = hackathon.source_url ?? "";

  return (
    <article className="opportunity-card hackathon-card">
      <div className="card-top">
        <div className="company-logo hackathon-logo">
          {hackathon.organizer.charAt(0)}
        </div>

        <div className="card-top-actions">
          {canSave && (
            <button
              className={`save-button ${saved ? "saved" : ""}`}
              onClick={() => onToggleSave(hackathon.id)}
              aria-label={saved ? "Unsave hackathon" : "Save hackathon"}
              aria-pressed={saved}
            >
              {saved ? "◆" : "◇"}
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              className="delete-button"
              onClick={() => onDelete(hackathon.id)}
              aria-label={`Delete ${hackathon.title}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="card-company">
        {hackathon.organizer}
      </div>

      <h3>{hackathon.title}</h3>

      <div className="card-meta">
        <span>⌖ {hackathon.location}</span>
        <span>◷ {hackathon.eventType}</span>
      </div>

      <div className="skill-list">
        {hackathon.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <details className="opportunity-details">
        <summary>View details</summary>
        <p>{hackathon.description || "No description provided."}</p>
      </details>

      <div className="card-divider"></div>

      <div className="card-bottom">
        <div>
          <small>PRIZE POOL</small>
          <strong>{hackathon.prize}</strong>
        </div>

        <div className="deadline">
          <small>DEADLINE</small>
          <strong>{hackathon.deadline}</strong>
        </div>
      </div>

      {sourceUrl ? (
        <a
          className="card-action"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View hackathon
          <span>→</span>
        </a>
      ) : (
        <button className="card-action" disabled>
          Link unavailable
        </button>
      )}
    </article>
  );
}

export default HackathonCard;
