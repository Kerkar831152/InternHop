import type { InternshipCardProps } from "../../types/internships";

function InternshipCard({
  internship,
  saved,
  onToggleSave,
}: InternshipCardProps) {
  return (
    <article className="opportunity-card">
      <div className="card-top">
        <div className="company-logo">
          {internship.company.charAt(0)}
        </div>

        <button
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave(internship.id)}
          aria-label="Save internship"
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

      <button className="card-action">
        View opportunity
        <span>→</span>
      </button>
    </article>
  );
}

export default InternshipCard;