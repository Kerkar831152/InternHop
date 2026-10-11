import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Internships from "./components/Internships/Internships";
import Hackathons from "./components/Hackathons/Hackathons";
import Verify from "./components/Verify/Verify";
import Intnem from "./components/Intnem/Intnem";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";

import Register from "./components/Pages/Register";
import Login from "./components/Pages/Login";

import type { Page } from "./types/navigation";

function App() {
    const [page, setPage] = useState<Page>("home");
    const [username, setUsername] = useState<string | null>(null);

    const isAuthenticated = username !== null;

    function handleLoginSuccess(loggedInUsername: string) {
        setUsername(loggedInUsername);
        setPage("home");
    }

    function handleLogout() {
        setUsername(null);
        setPage("home");
    }

    function handleNavigate(nextPage: Page) {
        setPage(nextPage);
    }

    return (
        <div className="app">
            <Navbar
                isAuthenticated={isAuthenticated}
                username={username}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />

            <main>
                {page === "home" && (
                    <>
                        <Home />
                        <Internships />
                        <Hackathons />
                        <Verify />
                        <Intnem />
                        <About />
                    </>
                )}

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
            </main>

            {page === "home" && <Footer />}
        </div>
    );
}

export default App;