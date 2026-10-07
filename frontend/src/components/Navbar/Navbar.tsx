import { useState } from "react";

import NotificationDropdown from "../Notifications/NotificationDropdown";
import Profile from "../Profile/Profile";

import type { Notification } from "../../types/notification";

function Navbar() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New internship match",
      message: "A React internship matches your profile.",
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

  return (
    <nav className="navbar">
      <a href="#home" className="brand">
        <div className="brand-mark">
          <span>✦</span>
        </div>

        <div className="brand-text">
          <strong>Intern<span>Hop</span></strong>
          <small>OPPORTUNITY PLATFORM</small>
        </div>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#internships">Internships</a>
        <a href="#hackathons">Hackathons</a>
        <a href="#verify">Verify</a>
        <a href="#about">About</a>
      </div>

      <div className="navbar-actions">
        <a href="#intnem" className="ask-intnem-btn">
          <span className="ask-intnem-icon">✦</span>
          <span>Ask Intnem</span>
        </a>

        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
        />

        <Profile />
      </div>
    </nav>
  );
}

export default Navbar;