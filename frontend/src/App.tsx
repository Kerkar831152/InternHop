import './App.css'
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Internships from "./components/Internships/Internships";
import Hackathons from "./components/Hackathons/Hackathons";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Home />

        <Internships />

        <Hackathons />

        <section id="verify">
          <h1>Verify</h1>
        </section>

        <section id="about">
          <h1>About</h1>
        </section>
      </main>
    </>
  );
}

export default App;