import { useState } from "react";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import Profile from "../Profile/Profile";
import Intnem from "../Intnem/Intnem";
import type { Notification } from "../../types/notification";

function Navbar() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New internship match",
      message: "A React internship matches your skills.",
      type: "recommended",
      read: false,
    },
    {
      id: 2,
      title: "Hackathon deadline",
      message: "A hackathon you saved ends soon.",
      type: "deadline",
      read: false,
    },
  ]);

  const [intnemOpen, setIntnemOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          Intern<span>Hop</span>
        </div>

        <div className="nav-links">
          <a href="#internships" className="active">
            Internships
          </a>

          <a href="#hackathons">
            Hackathons
          </a>

          <a href="#verify">
            Verify
          </a>

          <a href="#about">
            About
          </a>
        </div>

        <div className="navbar-actions">
          <button
            className={`intnem-nav-btn ${
              intnemOpen ? "intnem-nav-btn-active" : ""
            }`}
            onClick={() => setIntnemOpen(!intnemOpen)}
          >
            <span className="intnem-logo">✦</span>
            <span>Ask Intnem</span>
          </button>

          <NotificationDropdown
            notifications={notifications}
            setNotifications={setNotifications}
          />

          <Profile />
        </div>
      </nav>

      {intnemOpen && (
        <div className="intnem-overlay">
          <Intnem />
        </div>
      )}
    </>
  );
}

export default Navbar;