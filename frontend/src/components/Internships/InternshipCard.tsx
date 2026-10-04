import type { InternshipCardProps } from "../../types/internships";

function InternshipCard({
  internship,
  saved,
  onToggleSave,
}: InternshipCardProps) {
  return (
    <article className="internship-card">
      <div className="internship-card-top">
        <div>
          <span className="internship-company">
            {internship.company}
          </span>

          <h3>{internship.title}</h3>
        </div>

        <button
          className={`save-btn ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave(internship.id)}
          aria-label="Save internship"
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      <div className="internship-meta">
        <span>⌖ {internship.location}</span>
        <span>◷ {internship.internshipType}</span>
      </div>

      <div className="internship-skills">
        {internship.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="internship-card-bottom">
        <div>
          <strong>{internship.stipend}</strong>
          <span>Deadline: {internship.deadline}</span>
        </div>

        <button className="view-internship-btn">
          View details
        </button>
      </div>
    </article>
  );
}

export default InternshipCard;