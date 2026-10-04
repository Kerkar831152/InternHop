import './App.css'
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
function App() {
  return (
    <>
      <Navbar />

      <main>
        <Home />

        <section id="internships">
          <h1>Internships</h1>
        </section>

        <section id="hackathons">
          <h1>Hackathons</h1>
        </section>

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