import type { Internship } from "../types/internships";

type OpportunityCardProps = {
  internship: Internship;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
};

function OpportunityCard({
  internship,
  isSaved,
  onToggleSave,
}: OpportunityCardProps) {
  return (
    <article className="opportunity-card">
      <div className="card-top">
        <div className="company-logo">
          {internship.company.charAt(0).toUpperCase()}
        </div>

        <div className="company-info">
          <div className="company-name">
            {internship.company}
            <span className="verified">✓</span>
          </div>

          <p>Verified opportunity</p>
        </div>

        <button
          className={`save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onToggleSave(internship.id)}
          aria-label={
            isSaved
              ? "Remove from saved"
              : "Save opportunity"
          }
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-main">
        <h3>{internship.title}</h3>

        <p className="card-description">
          {internship.description}
        </p>

        <div className="card-details">
          <span>⌖ {internship.location}</span>
          <span>◷ {internship.internshipType}</span>
        </div>

        <div className="skills">
          {internship.skills.slice(0, 4).map((skill) => (
            <span className="skill-tag" key={skill}>
              {skill}
            </span>
          ))}

          {internship.skills.length > 4 && (
            <span className="skill-more">
              +{internship.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="card-bottom">
        <div className="opportunity-meta">
          <div>
            <span>Stipend</span>
            <strong>{internship.stipend}</strong>
          </div>

          <div>
            <span>Deadline</span>
            <strong>{internship.deadline}</strong>
          </div>
        </div>

        <button className="view-btn">
          View <span>→</span>
        </button>
      </div>
    </article>
  );
}

export default OpportunityCard;