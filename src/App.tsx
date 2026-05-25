import { useState } from "react";

const projects = [
  "Wall Planter",
  "Desk Bracket",
  "Sensor Enclosure",
  "Ergonomic Handle",
  "Drone Mount",
  "Tool Organizer",
  "Desk Lamp Clamp",
  "Assembly Jig",
  "New Project",
];

function App() {
  const [signedIn, setSignedIn] = useState(() => {
    return window.localStorage.getItem("cadybara-site-session") === "true";
  });
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [selectedProject, setSelectedProject] = useState("");

  const openAuth = (mode: "signin" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const openDashboard = () => {
    if (signedIn) {
      setView("dashboard");
      return;
    }

    openAuth("signin");
  };

  const completeAuth = () => {
    window.localStorage.setItem("cadybara-site-session", "true");
    setSignedIn(true);
    setAuthOpen(false);
    setView("dashboard");
  };

  const signOut = () => {
    window.localStorage.removeItem("cadybara-site-session");
    setSignedIn(false);
    setSelectedProject("");
    setView("landing");
  };

  if (signedIn && view === "dashboard") {
    return (
      <main className="dashboard" aria-label="Cadybara project dashboard">
        <nav className="top-bar" aria-label="Primary">
          <button className="brand-word" type="button" onClick={() => setView("landing")}>
            CADYBARA
          </button>
          <div className="nav-actions">
            <button className="nav-action primary-action" type="button" onClick={() => setSelectedProject("New Project")}>
              New project
            </button>
            <button className="nav-action" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </nav>

        <section className="project-picker" aria-label="Projects">
          {projects.map((project, index) => (
            <button
              className={`project-stone stone-${index + 1}${selectedProject === project ? " selected" : ""}`}
              key={project}
              type="button"
              onClick={() => setSelectedProject(project)}
            >
              <span>{project}</span>
            </button>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="hero" aria-label="Cadybara AI CAD landing page">
      <nav className="top-bar" aria-label="Primary">
        <button className="brand-word" type="button">
          CADYBARA
        </button>
        <div className="nav-actions">
          <button className="nav-action primary-action" type="button" onClick={openDashboard}>
            Start now
          </button>
          <button className="nav-action" type="button" onClick={() => openAuth("register")}>
            Register
          </button>
        </div>
      </nav>

      <section className="hero-center">
        <p>your favorite</p>
        <h1>cad capybaras</h1>
      </section>

      {authOpen && (
        <div className="auth-shell" role="presentation">
          <form className="auth-card" onSubmit={(event) => {
            event.preventDefault();
            completeAuth();
          }}>
            <button className="dialog-close" type="button" aria-label="Close" onClick={() => setAuthOpen(false)}>
              x
            </button>
            <p className="auth-kicker">{authMode === "register" ? "Register" : "Start now"}</p>
            <h2>{authMode === "register" ? "Create account" : "Sign in"}</h2>
            {authMode === "register" && (
              <label className="field">
                <span>Name</span>
                <input autoComplete="name" />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input autoComplete="email" type="email" />
            </label>
            <label className="field">
              <span>Password</span>
              <input autoComplete={authMode === "register" ? "new-password" : "current-password"} type="password" />
            </label>
            <p className="auth-message">Demo mode is ready. Empty fields are fine for testing.</p>
            <button className="submit-action" type="submit">
              {authMode === "register" ? "Create account" : "Sign in"}
            </button>
            <button
              className="swap-action"
              type="button"
              onClick={() => setAuthMode(authMode === "register" ? "signin" : "register")}
            >
              {authMode === "register" ? "Already have an account? Sign in" : "Need an account? Register"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default App;
