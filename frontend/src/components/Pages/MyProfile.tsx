import { useEffect, useState } from "react";
import {
    getUserProfile,
    updateUserProfile,
} from "../../api";
import type { UserProfile } from "../../api";
import type { Page } from "../../types/navigation";

interface MyProfileProps {
    onNavigate: (page: Page) => void;
}

function MyProfile({ onNavigate }: MyProfileProps) {
    const [profile, setProfile] = useState<UserProfile>({
        degree: "",
        study_year: null,
        skills: [],
        preferred_roles: [],
        preferred_locations: [],
        work_mode: "",
    });

    const [skillsText, setSkillsText] = useState("");
    const [rolesText, setRolesText] = useState("");
    const [locationsText, setLocationsText] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        getUserProfile()
            .then((data) => {
                setProfile(data);
                setSkillsText(data.skills.join(", "));
                setRolesText(data.preferred_roles.join(", "));
                setLocationsText(data.preferred_locations.join(", "));
            })
            .catch((err: unknown) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load profile."
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    function handleChange(
        field: "degree" | "study_year" | "work_mode",
        value: string | number | null
    ) {
        setProfile((current) => ({
            ...current,
            [field]: value,
        }));

        setMessage("");
        setError("");
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        const updatedData: Partial<UserProfile> = {
            ...profile,
            skills: skillsText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            preferred_roles: rolesText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            preferred_locations: locationsText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        };

        try {
            const updatedProfile =
                await updateUserProfile(updatedData);

            setProfile(updatedProfile);
            setSkillsText(updatedProfile.skills.join(", "));
            setRolesText(updatedProfile.preferred_roles.join(", "));
            setLocationsText(
                updatedProfile.preferred_locations.join(", ")
            );

            setMessage("Profile saved successfully!");
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save profile."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="my-profile-page">
            <button
                className="my-profile-close"
                type="button"
                aria-label="Close profile"
                onClick={() => onNavigate("home")}
            >
                ×
            </button>

            <div className="my-profile-header">
                <h1>My Profile</h1>
                <p>
                    Tell us about yourself and your career
                    preferences.
                </p>
            </div>

            {loading ? (
                <p className="profile-page-status" role="status">
                    Loading profile...
                </p>
            ) : (
                <form
                    className="my-profile-form"
                    onSubmit={handleSubmit}
                >
                    <div className="profile-form-group">
                        <label htmlFor="degree">
                            Degree
                        </label>
                        <input
                            id="degree"
                            type="text"
                            placeholder="e.g. B.Tech Computer Engineering"
                            value={profile.degree}
                            onChange={(event) =>
                                handleChange("degree", event.target.value)
                            }
                        />
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="study-year">
                            Current Study Year
                        </label>
                        <select
                            id="study-year"
                            value={profile.study_year ?? ""}
                            onChange={(event) =>
                                handleChange(
                                    "study_year",
                                    event.target.value
                                        ? Number(event.target.value)
                                        : null
                                )
                            }
                        >
                            <option value="">
                                Select study year
                            </option>
                            {[1, 2, 3, 4, 5, 6].map((year) => (
                                <option key={year} value={year}>
                                    Year {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="skills">
                            Skills
                        </label>
                        <textarea
                            id="skills"
                            placeholder="Python, React, Django"
                            value={skillsText}
                            onChange={(event) => {
                                setSkillsText(event.target.value);
                                setMessage("");
                                setError("");
                            }}
                        />
                        <small>
                            Separate skills with commas.
                        </small>
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="preferred-roles">
                            Preferred Job Roles
                        </label>
                        <textarea
                            id="preferred-roles"
                            placeholder="Backend Developer, DevOps Engineer"
                            value={rolesText}
                            onChange={(event) => {
                                setRolesText(event.target.value);
                                setMessage("");
                                setError("");
                            }}
                        />
                        <small>
                            Separate roles with commas.
                        </small>
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="preferred-locations">
                            Preferred Locations
                        </label>
                        <textarea
                            id="preferred-locations"
                            placeholder="Goa, Bengaluru, Pune"
                            value={locationsText}
                            onChange={(event) => {
                                setLocationsText(event.target.value);
                                setMessage("");
                                setError("");
                            }}
                        />
                        <small>
                            Separate locations with commas.
                        </small>
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="work-mode">
                            Preferred Work Mode
                        </label>
                        <select
                            id="work-mode"
                            value={profile.work_mode}
                            onChange={(event) =>
                                handleChange(
                                    "work_mode",
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Select work mode
                            </option>
                            <option value="remote">Remote</option>
                            <option value="onsite">Onsite</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    {error && (
                        <p
                            className="profile-form-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {message && (
                        <p
                            className="profile-form-success"
                            role="status"
                        >
                            {message}
                        </p>
                    )}

                    <button
                        className="profile-save-btn"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            )}
        </section>
    );
}

export default MyProfile;
