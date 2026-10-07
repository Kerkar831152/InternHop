import type { HackathonCardProps } from "../../types/hackathons";

function HackathonCard({
  hackathon,
  saved,
  onToggleSave,
}: HackathonCardProps) {
  return (
    <article className="opportunity-card hackathon-card">
      <div className="card-top">
        <div className="company-logo hackathon-logo">
          {hackathon.organizer.charAt(0)}
        </div>

        <button
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave(hackathon.id)}
          aria-label="Save hackathon"
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

      <button className="card-action">
        View hackathon
        <span>→</span>
      </button>
    </article>
  );
}

export default HackathonCard;