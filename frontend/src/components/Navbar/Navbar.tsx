import { useState } from "react";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import Profile from "../Profile/Profile";

import type { Notification } from "../../types/notification";
import type { NavbarProps } from "../../types/navigation";

function Navbar({
    isAuthenticated,
    isAdmin,
    username,
    activePage,
    onNavigate,
    onLogout,
}: NavbarProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    return (
        <nav className="navbar">
            <button
                type="button"
                className="logo"
                onClick={() => onNavigate("home")}
                aria-label="InternHop home"
            >
                <span className="logo-mark" aria-hidden="true">I</span>
                <span>Intern<span>Hop</span></span>
            </button>

            <div className="nav-links">
                {([
                    ["home", "Home"],
                    ["explore", "Explore"],
                    ["internships", "Internships"],
                    ["hackathons", "Hackathons"],
                    ["verify", "Image check"],
                    ["about", "About"],
                ] as const).map(([page, label]) => (
                    <button
                        className="nav-link"
                        type="button"
                        key={page}
                        aria-current={activePage === page ? "page" : undefined}
                        onClick={() => onNavigate(page)}
                    >
                        {label}
                    </button>
                ))}

                {isAuthenticated && (
                    <>
                        <button
                            className="nav-link"
                            type="button"
                            aria-current={activePage === "saved" ? "page" : undefined}
                            onClick={() => onNavigate("saved")}
                        >
                            Saved
                        </button>
                        <button
                            className="nav-link"
                            type="button"
                            aria-current={activePage === "profile" ? "page" : undefined}
                            onClick={() => onNavigate("profile")}
                        >
                            Profile
                        </button>
                    </>
                )}

                {isAuthenticated && isAdmin && (
                    <button
                        className="nav-link"
                        type="button"
                        aria-current={activePage === "admin" ? "page" : undefined}
                        onClick={() => onNavigate("admin")}
                    >
                        Admin
                    </button>
                )}
            </div>

            <div className="navbar-actions">
                {isAuthenticated && username ? (
                    <>
                        <NotificationDropdown
                            notifications={notifications}
                            setNotifications={setNotifications}
                        />
                        <Profile
                            username={username}
                            onLogout={onLogout}
                            onNavigate={onNavigate}
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