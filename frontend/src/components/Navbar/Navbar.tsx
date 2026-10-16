import NotificationDropdown from "../Notifications/NotificationDropdown";
import Profile from "../Profile/Profile";

import type { Notification } from "../../types/notification";
import type { NavbarProps } from "../../types/navigation";

import { useState } from "react";

function Navbar({
    isAuthenticated,
    isAdmin,
    username,
    onNavigate,
    onLogout,
}: NavbarProps) {
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

    return (
        <nav className="navbar">
            <a
                href="#home"
                className="logo"
                onClick={() => onNavigate("home")}
            >
                Intern<span>Hop</span>
            </a>

            <div className="nav-links">
                <a href="#internships" onClick={() => onNavigate("home")}>
                    Internships
                </a>

                <a href="#hackathons" onClick={() => onNavigate("home")}>
                    Hackathons
                </a>

                {isAuthenticated && (
                    <a href="#saved" onClick={() => onNavigate("saved")}>Saved</a>
                )}

                <a href="#verify" onClick={() => onNavigate("home")}>
                    Verify
                </a>

                <a href="#about" onClick={() => onNavigate("home")}>
                    About
                </a>

                {isAuthenticated && isAdmin && (
                    <button
                        className="auth-nav-login"
                        onClick={() => onNavigate("admin")}
                    >
                        Admin Dashboard
                    </button>
                )}
            </div>

            <div className="navbar-actions">
                <a
                    href="#intnem"
                    className="intnem-nav-btn"
                    onClick={() => onNavigate("home")}
                >
                    <span className="intnem-logo">✦</span>
                    <span>Ask Intnem</span>
                </a>

                {isAuthenticated && username ? (
                    <>
                        <NotificationDropdown
                            notifications={notifications}
                            setNotifications={setNotifications}
                        />

                        <Profile
                            username={username}
                            onLogout={onLogout}
                        />
                    </>
                ) : (
                    <div className="auth-nav-actions">
                        <button
                            className="auth-nav-login"
                            onClick={() => onNavigate("login")}
                        >
                            Log in
                        </button>

                        <button
                            className="auth-nav-register"
                            onClick={() => onNavigate("register")}
                        >
                            Sign up
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;