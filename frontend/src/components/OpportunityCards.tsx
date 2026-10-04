import type { Internship } from "../types/internships";

type OpportunityCardProps = {
  internship: Internship;
};

function OpportunityCard({ internship }: OpportunityCardProps) {
  return (
    <article className="opportunity-card">
      <div className="card-top">
        <div>
          <p className="company">{internship.company}</p>
          <h3>{internship.title}</h3>
        </div>

        {internship.verified && (
          <span className="verified">✓ Verified</span>
        )}
      </div>

      <p className="description">{internship.description}</p>

      <div className="skills">
        {internship.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="card-info">
        <span>📍 {internship.location}</span>
        <span>💰 {internship.stipend}</span>
      </div>

      <div className="card-bottom">
        <span className="deadline">
          Deadline: {internship.deadline}
        </span>

        <button>View Details →</button>
      </div>
    </article>
  );
}

export default OpportunityCard;