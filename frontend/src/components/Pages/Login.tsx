import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { loginUser } from "../../api";
import type { LoginData, LoginProps } from "../../types/auth";

function Login({ onLoginSuccess, onGoToRegister }: LoginProps) {
    const [formData, setFormData] = useState<LoginData>({
        username: "",
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
            const response = await loginUser(formData);

            setMessage(response.message);
            onLoginSuccess(formData.username);
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
                <span className="auth-eyebrow">WELCOME BACK</span>

                <h1>Log in to InternHop</h1>

                <p>
                    Continue discovering internships and hackathons
                    that match your goals.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="auth-form-field">
                    <label htmlFor="login-username">Username</label>

                    <input
                        type="text"
                        id="login-username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="auth-form-field">
                    <label htmlFor="login-password">Password</label>

                    <input
                        type="password"
                        id="login-password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    className="auth-submit-btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Log in"}
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
                <span>Don't have an account?</span>

                <button type="button" onClick={onGoToRegister}>
                    Create an account
                </button>
            </div>
        </section>
    );
}

export default Login;