import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { registerUser } from "../../api";
import type { RegisterData, RegisterProps } from "../../types/auth";

function Register({
    onRegistrationSuccess,
    onGoToLogin,
}: RegisterProps) {
    const [formData, setFormData] = useState<RegisterData>({
        username: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            const response = await registerUser(formData);

            setMessage(response.message);

            setFormData({
                username: "",
                email: "",
                password: "",
            });

            onRegistrationSuccess();
        } catch (error) {
            setIsError(true);

            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="register-container">
            <div className="auth-heading">
                <span className="auth-eyebrow">JOIN INTERNHOP</span>

                <h1>Create your account</h1>

                <p>
                    Start discovering opportunities that fit your skills
                    and interests.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="auth-form-field">
                    <label htmlFor="register-username">Username</label>

                    <input
                        type="text"
                        id="register-username"
                        name="username"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="auth-form-field">
                    <label htmlFor="register-email">Email address</label>

                    <input
                        type="email"
                        id="register-email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="auth-form-field">
                    <label htmlFor="register-password">Password</label>

                    <input
                        type="password"
                        id="register-password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <button
                    className="auth-submit-btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>

                {message && (
                    <p
                        className={`auth-message ${
                            isError ? "auth-message-error" : "auth-message-success"
                        }`}
                        role="status"
                    >
                        {message}
                    </p>
                )}
            </form>

            <div className="auth-switch">
                <span>Already have an account?</span>

                <button type="button" onClick={onGoToLogin}>
                    Log in
                </button>
            </div>
        </section>
    );
}

export default Register;