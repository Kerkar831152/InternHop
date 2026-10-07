import { useState } from "react";

function Profile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav-action-wrapper">
      <button
        className={`profile-button ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <div className="profile-avatar">VK</div>

        <div className="profile-summary">
          <strong>Vithal</strong>
          <span>Student</span>
        </div>

        <span className="profile-arrow">⌄</span>
      </button>

      {open && (
        <div className="dropdown profile-dropdown">
          <div className="profile-card-top">
            <div className="profile-avatar-large">VK</div>

            <div>
              <h3>Vithal Kerkar</h3>
              <p>CSE Student</p>
            </div>
          </div>

          <div className="profile-progress">
            <div className="progress-label">
              <span>Profile completeness</span>
              <strong>72%</strong>
            </div>

            <div className="progress-track">
              <div className="progress-value"></div>
            </div>
          </div>

          <div className="profile-menu">
            <button>
              <span>◉</span>
              My Profile
            </button>

            <button>
              <span>◇</span>
              Saved Opportunities
            </button>

            <button>
              <span>⚙</span>
              Preferences
            </button>
          </div>

          <button className="sign-out-button">
            <span>↪</span>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;