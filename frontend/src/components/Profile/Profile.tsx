import { useState } from "react";

function Profile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav-action-wrapper">
      <button
        className={`profile-btn ${open ? "profile-btn-active" : ""}`}
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
          <div className="profile-dropdown-header">
            <div className="profile-avatar-large">VK</div>

            <div>
              <h3>Vithal Kerkar</h3>
              <p>CSE Student</p>
            </div>
          </div>

          <div className="profile-completeness">
            <div className="completeness-header">
              <span>Profile completeness</span>
              <strong>72%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="profile-menu">
            <button>
              <span>👤</span>
              <span>My Profile</span>
            </button>

            <button>
              <span>🔖</span>
              <span>Saved Opportunities</span>
            </button>

            <button>
              <span>⚙</span>
              <span>Preferences</span>
            </button>
          </div>

          <div className="profile-dropdown-footer">
            <button className="sign-out-btn">
              <span>↪</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;