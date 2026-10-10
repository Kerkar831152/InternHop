
import { useState } from "react";
import type { ChangeEvent, SubmitEvent} from "react";    

import { registerUser } from "../../api";
import type { RegisterData } from "../../types/auth";

function Register() {
    const [formData, setFormData] = useState<RegisterData>({
        username: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    
    function handleChange(event: ChangeEvent<HTMLInputElement>) 
    {
        const { name, value } = event.target;
        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
       }));
    }

    
async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>
) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
        const response = await registerUser(formData);
        setMessage(response.message);

        setFormData({
            username: "",
            email: "",
            password: "",
        });
    } catch (error) {
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
        <div className="register-container">
            <h1>Create your InternHop account</h1>
            <p>Sign up to get started.</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                </button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}

export default Register;
