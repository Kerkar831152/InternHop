
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

function App() {
    const [showRegister, setShowRegister] = useState(false);

    return (
        <div className="app">
            <Navbar />

            <div className="page-switcher">
                {showRegister ? (
                    <button onClick={() => setShowRegister(false)}>
                        &larr; Back to home
                    </button>
                ) : (
                    <button onClick={() => setShowRegister(true)}>
                        Create account
                    </button>
                )}
            </div>

            <main>
                {showRegister ? (
                    <Register />
                ) : (
                    <>
                        <Home />
                        <Internships />
                        <Hackathons />
                        <Verify />
                        <Intnem />
                        <About />
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default App;
