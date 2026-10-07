import "./App.css";

import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Internships from "./components/Internships/Internships";
import Hackathons from "./components/Hackathons/Hackathons";
import Verify from "./components/Verify/Verify";
import Intnem from "./components/Intnem/Intnem";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Home />
        <Internships />
        <Hackathons />
        <Verify />
        <Intnem />
        <About />
      </main>

      <Footer />
    </div>
  );
}

export default App;