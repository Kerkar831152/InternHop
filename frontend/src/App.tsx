import './App.css'
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Internships from "./components/Internships/Internships";
import Hackathons from "./components/Hackathons/Hackathons";
import Verify from "./components/Verify/Verify";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Home />

        <Internships />

        <Hackathons />

        <Verify />

        <section id="about">
          <h1>About</h1>
        </section>
      </main>
    </>
  );
}

export default App;