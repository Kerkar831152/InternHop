import type { HackathonCardProps } from "../../types/hackathons";

function HackathonCard({
  hackathon,
  saved,
  onToggleSave,
}: HackathonCardProps) {
  return (
    <article className="hackathon-card">
      <div className="hackathon-card-top">
        <div>
          <span className="hackathon-organizer">
            {hackathon.organizer}
          </span>

          <h3>{hackathon.title}</h3>
        </div>

        <button
          className={`save-btn ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave(hackathon.id)}
          aria-label="Save hackathon"
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      <div className="hackathon-meta">
        <span>⌖ {hackathon.location}</span>
        <span>◷ {hackathon.eventType}</span>
      </div>

      <div className="hackathon-skills">
        {hackathon.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="hackathon-card-bottom">
        <div>
          <strong>{hackathon.prize}</strong>
          <span>Deadline: {hackathon.deadline}</span>
        </div>

        <button className="view-hackathon-btn">
          View details
        </button>
      </div>
    </article>
  );
}

export default HackathonCard;