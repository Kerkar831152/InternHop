import { useState } from "react";
import type { Page } from "../../types/navigation";

export interface ProfileProps {
    username: string;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
}
function Profile({ username, onLogout, onNavigate }: ProfileProps) {
    const [open, setOpen] = useState(false);

    const initials = username
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    function handleLogout() {
        setOpen(false);
        onLogout();
    }

    return (
        <div className="nav-action-wrapper">
            <button
                className={`profile-btn ${open ? "profile-btn-active" : ""}`}
                onClick={() => setOpen((current) => !current)}
                aria-label="Open profile menu"
                aria-expanded={open}
            >
                <div className="profile-avatar">{initials}</div>

                <div className="profile-summary">
                    <strong>{username}</strong>
                    <span>Student</span>
                </div>

                <span className="profile-arrow">⌄</span>
            </button>

            {open && (
                <div className="dropdown profile-dropdown">
                    <div className="profile-dropdown-header">
                        <div className="profile-avatar-large">
                            {initials}
                        </div>

                        <div>
                            <h3>{username}</h3>
                            <p>InternHop member</p>
                        </div>
                    </div>

                    <div className="profile-menu">
                        <button
                        onClick={() => {
                            setOpen(false);
                            onNavigate("profile");
                            }}
                            >
                                <span>👤</span>
                                <span>My Profile</span>
                        </button>

                        <button
                            onClick={() => {
                                setOpen(false);
                                onNavigate("saved");
                            }}
                        >
                            <span>🔖</span>
                            <span>Saved Opportunities</span>
                        </button>

                        <button
                            onClick={() => setOpen(false)}
                        >
                            <span>⚙</span>
                            <span>Preferences</span>
                        </button>
                    </div>

                    <div className="profile-dropdown-footer">
                        <button
                            className="sign-out-btn"
                            onClick={handleLogout}
                        >
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