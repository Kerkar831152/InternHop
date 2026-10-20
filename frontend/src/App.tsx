
import { useEffect, useState } from "react";
import "./App.css";

import { apiRequest } from "./api";

import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Internships from "./components/Internships/Internships";
import Hackathons from "./components/Hackathons/Hackathons";
import Verify from "./components/Verify/Verify";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";

import Register from "./components/Pages/Register";
import Login from "./components/Pages/Login";
import AdminDashboard from "./components/Pages/AdminDashboard";
import SavedOpportunities from "./components/SavedOpportunities/SavedOpportunities";
import MyProfile from "./components/Pages/MyProfile";
import Recommendations from "./components/Pages/Recommendations";

import type { Page } from "./types/navigation";

interface CurrentUserResponse {
    user?: {
        username?: string;
        is_admin?: boolean;
    } | null;
}

function App() {
    const [page, setPage] = useState<Page>("home");
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let active = true;

        apiRequest<CurrentUserResponse>("/accounts/me/")
            .then((data) => {
                if (active) {
                    setUsername(data.user?.username ?? null);
                    setIsAdmin(data.user?.is_admin === true);
                }
            })
            .catch(() => {
                if (active) {
                    setUsername(null);
                    setIsAdmin(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const isAuthenticated = username !== null;

    async function handleLoginSuccess(loggedInUsername: string) {
        setUsername(loggedInUsername);
        setPage("home");

        try {
            const data = await apiRequest<CurrentUserResponse>(
                "/accounts/me/"
            );
            setIsAdmin(data.user?.is_admin === true);
        } catch {
            setIsAdmin(false);
        }
    }

    async function handleLogout() {
        try {
            await apiRequest("/accounts/logout/", {
                method: "POST",
            });

            setUsername(null);
            setIsAdmin(false);
            setPage("home");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    function handleNavigate(nextPage: Page) {
        if (nextPage === "admin" && !isAdmin) {
            setPage("home");
            return;
        }

        if (
            (nextPage === "profile" || nextPage === "saved" ||
                nextPage === "recommendations") &&
            !isAuthenticated
        ) {
            setPage("login");
            return;
        }

        setPage(nextPage);
    }

    return (
        <div className="app">
            <Navbar
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                username={username}
                activePage={page}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />

            <main>
                {page === "home" && isAuthenticated && (
                    <Recommendations
                        username={username ?? ""}
                        onNavigate={handleNavigate}
                        isDashboard
                    />
                )}

                {page === "home" && !isAuthenticated && (
                    <>
                        <Home onNavigate={handleNavigate} />
                        <About />
                    </>
                )}

                {page === "explore" && (
                    <>
                        <Internships
                            isAdmin={isAdmin}
                            isAuthenticated={isAuthenticated}
                            onNavigate={handleNavigate}
                        />
                        <Hackathons
                            isAdmin={isAdmin}
                            isAuthenticated={isAuthenticated}
                        />
                    </>
                )}

                {page === "internships" && (
                    <Internships
                        isAdmin={isAdmin}
                        isAuthenticated={isAuthenticated}
                        onNavigate={handleNavigate}
                    />
                )}

                {page === "hackathons" && (
                    <Hackathons
                        isAdmin={isAdmin}
                        isAuthenticated={isAuthenticated}
                    />
                )}

                {page === "verify" && <Verify />}

                {page === "about" && <About />}

                {page === "register" && (
                    <Register
                        onRegistrationSuccess={() => setPage("login")}
                        onGoToLogin={() => setPage("login")}
                    />
                )}

                {page === "login" && (
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onGoToRegister={() => setPage("register")}
                    />
                )}

                {page === "admin" && isAdmin && (
                    <AdminDashboard />
                )}

                {page === "saved" && isAuthenticated && (
                    <SavedOpportunities />
                )}

                {page === "profile" && isAuthenticated && (
                    <MyProfile onNavigate={handleNavigate} />
                )}

                {page === "recommendations" && isAuthenticated && (
                    <Recommendations
                        username={username ?? ""}
                        onNavigate={handleNavigate}
                    />
                )}
            </main>

            {page !== "login" && page !== "register" && page !== "admin" && (
                <Footer onNavigate={handleNavigate} />
            )}
        </div>
    );
}

export default App;
