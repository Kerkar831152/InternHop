import './App.css'
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Internships from "./components/Internships/Internships";
import Hackathons from "./components/Hackathons/Hackathons";
import Verify from "./components/Verify/Verify";
import About from "./components/About/About";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Home />

        <Internships />

        <Hackathons />

        <Verify />

        <About />
      </main>
    </>
  );
}

export default App;