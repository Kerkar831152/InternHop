import type { HackathonCardProps } from "../../types/hackathons";

function HackathonCard({
  hackathon,
  saved,
  onToggleSave,
}: HackathonCardProps) {
  const sourceUrl = hackathon.source_url ?? "";

  return (
    <article className="opportunity-card hackathon-card">
      <div className="card-top">
        <div className="company-logo hackathon-logo">
          {hackathon.organizer.charAt(0)}
        </div>

        <button
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave(hackathon.id)}
          aria-label={saved ? "Unsave hackathon" : "Save hackathon"}
          aria-pressed={saved}
        >
          {saved ? "◆" : "◇"}
        </button>
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