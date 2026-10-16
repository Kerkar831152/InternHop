import type { InternshipCardProps } from "../../types/internships";

function InternshipCard({
  internship,
  saved,
  onToggleSave,
}: InternshipCardProps) {
  const sourceUrl = internship.source_url ?? "";

  return (
    <article className="opportunity-card">
      <div className="card-top">
        <div className="company-logo">
          {internship.company.charAt(0)}
        </div>

        <button
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave(internship.id)}
          aria-label={saved ? "Unsave internship" : "Save internship"}
          aria-pressed={saved}
        >
          {saved ? "◆" : "◇"}
        </button>
      </div>

      <div className="card-company">
        {internship.company}
      </div>

      <h3>{internship.title}</h3>

      <div className="card-meta">
        <span>⌖ {internship.location}</span>
        <span>◷ {internship.internshipType}</span>
      </div>

      <div className="skill-list">
        {internship.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="card-divider"></div>

      <div className="card-bottom">
        <div>
          <small>STIPEND</small>
          <strong>{internship.stipend}</strong>
        </div>

        <div className="deadline">
          <small>DEADLINE</small>
          <strong>{internship.deadline}</strong>
        </div>
      </div>

      {sourceUrl && (
        <a
          className="card-action"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View opportunity
          <span>→</span>
        </a>
      )}

      {!sourceUrl && (
        <button className="card-action" disabled>
          Link unavailable
        </button>
      )}
    </article>
  );
}

export default InternshipCard;