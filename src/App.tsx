import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Box,
  ChevronDown,
  Download,
  FolderOpen,
  Home,
  ImagePlus,
  Plus,
  Send,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import CadScene from "./CadScene";
import { projects as starterProjects } from "./data";
import type { ChatMessage, Project } from "./types";

function App() {
  const [signedIn, setSignedIn] = useState(() => {
    return localStorage.getItem("cadybara:signed-in") === "true";
  });
  const [projects, setProjects] = useState<Project[]>(starterProjects);
  const [activeProjectId, setActiveProjectId] = useState(starterProjects[0].id);
  const [view, setView] = useState<"dashboard" | "project">("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId, projects],
  );

  const completeSignIn = () => {
    localStorage.setItem("cadybara:signed-in", "true");
    setSignedIn(true);
    setView("dashboard");
  };

  const showHome = () => {
    localStorage.removeItem("cadybara:signed-in");
    setSignedIn(false);
    setView("dashboard");
  };

  const showProjects = () => {
    localStorage.setItem("cadybara:signed-in", "true");
    setSignedIn(true);
    setView("dashboard");
  };

  const showProject = () => {
    localStorage.setItem("cadybara:signed-in", "true");
    setSignedIn(true);
    setView("project");
  };

  const signOut = () => {
    localStorage.removeItem("cadybara:signed-in");
    setSignedIn(false);
    setView("dashboard");
  };

  const addProject = () => {
    const next: Project = {
      id: `concept-${Date.now()}`,
      name: "Untitled Project",
      shortName: "Untitled",
      kind: "Blank canvas",
      status: "No geometry yet",
      prompt: "",
      updated: "now",
      color: "#c77c43",
      accent: "#e0c59f",
      score: 0,
      parts: 0,
      dimensions: "No model",
      isBlank: true,
    };
    setProjects((current) => [next, ...current]);
    setActiveProjectId(next.id);
    setView("project");
    setToast("Blank workspace opened");
    window.setTimeout(() => setToast(""), 2200);
  };

  const openProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setView("project");
  };

  const exportProject = () => {
    setToast(`${activeProject.shortName}.step queued`);
    window.setTimeout(() => setToast(""), 2200);
  };

  if (!signedIn) {
    return <Landing onSignIn={completeSignIn} />;
  }

  return (
    <div className="app-shell">
      <BackgroundMotion />
      <AppHeader
        view={view}
        onBack={() => setView("dashboard")}
        onExport={exportProject}
        onSignOut={signOut}
      />

      {view === "dashboard" ? (
        <Dashboard
          projects={projects}
          onOpenProject={openProject}
          onAddProject={addProject}
        />
      ) : (
        <main className="workspace project-workspace">
        <section className="studio">
          <div className="viewport-wrap">
            <CadScene project={activeProject} />
            <div className="viewport-hud">
              <div>
                <span>{activeProject.kind}</span>
                <strong>{activeProject.name}</strong>
              </div>
              <div className="health-pill">
                <Sparkles size={16} />
                <span>Showroom</span>
              </div>
            </div>
            <ViewportTechPanel project={activeProject} />
          </div>
        </section>

        <AssistantPanel project={activeProject} onProjectUpdate={setProjects} />
        </main>
      )}

      {toast && <div className="toast">{toast}</div>}
      <DemoDock
        activeView={view === "dashboard" ? "projects" : "project"}
        settingsOpen={settingsOpen}
        onHome={showHome}
        onProjects={showProjects}
        onProject={showProject}
        onSettings={() => setSettingsOpen((current) => !current)}
      />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function BackgroundMotion() {
  return <div className="motion-field" aria-hidden="true" />;
}

function Landing({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState("pilot@cadybara.dev");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSignIn();
  };

  return (
    <main className="landing">
      <BackgroundMotion />
      <div className="landing-motion-rig" aria-hidden="true">
        <span className="rig-orbit" />
        <span className="rig-orbit rig-orbit-alt" />
        <span className="rig-part rig-part-a" />
        <span className="rig-part rig-part-b" />
        <span className="rig-part rig-part-c" />
        <span className="rig-scan" />
      </div>
      <header className="landing-nav">
        <div className="brand-lockup">
          <img className="brand-mark" src="/cadybara-logo.svg" alt="" />
          <strong>Cadybara</strong>
        </div>
        <div className="founders-badge">
          <FoundersLogo />
          <span>Backed by Founders Inc.</span>
        </div>
      </header>

      <section className="landing-content">
        <div className="hero-copy">
          <h1>Cadybara</h1>
          <div className="hero-command" aria-label="Example CAD prompt">
            <span>Prompt</span>
            <strong>compact clamp bracket with service tabs</strong>
            <i />
          </div>
          <div className="hero-readout" aria-label="Workspace capabilities">
            <span>
              <b>01</b>
              Plain language
            </span>
            <span>
              <b>02</b>
              Live geometry
            </span>
            <span>
              <b>03</b>
              STEP export
            </span>
          </div>
        </div>

        <form className="signin-panel" onSubmit={submit}>
          <h2>Sign in</h2>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button className="wide-action" type="submit">
            Launch workspace
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}

function FoundersLogo() {
  return (
    <svg
      className="founders-mark"
      viewBox="0 0 128 128"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M48.6 31.1 95.1 4.3c4.1-2.4 9.2.6 9.2 5.4v17.1c0 3.2-1.7 6.1-4.5 7.7L53.3 61.2a7.3 7.3 0 0 1-7.3 0L33.3 54c-4.8-2.7-4.8-9.6 0-12.4l15.3-10.5Z" />
      <path d="M29.5 72.7 96.2 34c4.1-2.4 9.2.6 9.2 5.3v16.8c0 3.2-1.7 6.2-4.5 7.8L43.7 97c-2.2 1.3-5 1.3-7.3 0L16.1 85.3c-4.8-2.8-4.8-9.7 0-12.5l13.4-7.8Z" />
      <path d="M78.6 74.4 111.8 55c4.1-2.4 9.2.6 9.2 5.3v40.2c0 5.6-6.1 9-10.9 6.2L78.4 88.1c-5.3-3.1-5.2-10.6.2-13.7Z" />
    </svg>
  );
}

function ViewportTechPanel({ project }: { project: Project }) {
  const rows = project.isBlank
    ? [
        ["Kernel", "Ready"],
        ["Units", "mm"],
        ["History", "0 ops"],
        ["Geometry", "Empty"],
      ]
    : [
        ["Kernel", "CAD mock"],
        ["Units", "mm"],
        ["History", `${project.parts} ops`],
        ["Envelope", project.dimensions],
      ];

  return (
    <div className="viewport-tech" aria-label="Model technical summary">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function DemoDock({
  activeView,
  settingsOpen,
  onHome,
  onProjects,
  onProject,
  onSettings,
}: {
  activeView: "home" | "projects" | "project";
  settingsOpen: boolean;
  onHome: () => void;
  onProjects: () => void;
  onProject: () => void;
  onSettings: () => void;
}) {
  return (
    <nav className="demo-dock" aria-label="Showroom screens">
      <button
        aria-label="Home"
        className={activeView === "home" ? "active" : ""}
        onClick={onHome}
      >
        <Home size={17} />
        <span>Home</span>
      </button>
      <button
        aria-label="Projects"
        className={activeView === "projects" ? "active" : ""}
        onClick={onProjects}
      >
        <FolderOpen size={17} />
        <span>Projects</span>
      </button>
      <button
        aria-label="Project"
        className={activeView === "project" ? "active" : ""}
        onClick={onProject}
      >
        <Box size={17} />
        <span>Project</span>
      </button>
      <button
        aria-label="Settings"
        className={settingsOpen ? "active" : ""}
        onClick={onSettings}
      >
        <Settings2 size={17} />
        <span>Settings</span>
      </button>
    </nav>
  );
}

function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`settings-sheet ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="settings-sheet-top">
        <div>
          <span className="eyebrow">Showroom controls</span>
          <strong>Showroom settings</strong>
        </div>
        <button title="Close settings" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="setting-row">
        <span>Palette</span>
        <b>Warm clay</b>
      </div>
      <div className="setting-row">
        <span>Board</span>
        <b>3 columns</b>
      </div>
      <div className="setting-row">
        <span>Motion</span>
        <b>Active</b>
      </div>
    </aside>
  );
}

function AppHeader({
  view,
  onBack,
  onExport,
  onSignOut,
}: {
  view: "dashboard" | "project";
  onBack: () => void;
  onExport: () => void;
  onSignOut: () => void;
}) {
  const isProjectView = view === "project";

  return (
    <header className="workspace-header">
      <div className="brand-button" aria-label="Cadybara">
        <img className="brand-mark" src="/cadybara-logo.svg" alt="" />
        <span>Cadybara</span>
      </div>

      <div className="header-actions">
        {isProjectView ? (
          <>
            <button title="Back to projects" onClick={onBack}>
              <ArrowLeft size={17} />
              <span>Projects</span>
            </button>
            <button title="Export" onClick={onExport}>
              <Download size={17} />
              <span>Export</span>
            </button>
          </>
        ) : null}
        <button title="Sign out" onClick={onSignOut}>
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  projects,
  onOpenProject,
  onAddProject,
}: {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onAddProject: () => void;
}) {
  return (
    <main className="dashboard">
      <section className="project-grid-shell">
        <div className="grid-heading">
          <h1>Projects</h1>
        </div>

        <div className="project-grid" aria-label="Projects">
          {projects.map((project) => (
            <button
              key={project.id}
              className="project-tile project-showcase-tile"
              onClick={() => onOpenProject(project.id)}
              title={`Open ${project.name}`}
            >
              {project.isBlank ? (
                <span className="project-model-preview empty-preview" aria-hidden="true">
                  <b>No geometry</b>
                </span>
              ) : (
                <span className="project-model-preview" aria-hidden="true">
                  <CadScene project={project} hero />
                </span>
              )}
              <span className="project-tile-top">
                <span className="project-dot" style={{ background: project.color }} />
                <small>{project.kind}</small>
                <b>{project.updated}</b>
              </span>
              <strong>{project.name}</strong>
              <p>{project.prompt || "Blank workspace. Add a prompt to generate the first model."}</p>
              <span className="project-tile-foot">
                <span>{project.status}</span>
                <b>{project.dimensions}</b>
              </span>
            </button>
          ))}

          <button className="project-tile add-project-tile" onClick={onAddProject}>
            <span className="add-tile-icon">
              <Plus size={24} />
            </span>
            <strong>New project</strong>
            <small>Blank slate</small>
          </button>
        </div>
      </section>
    </main>
  );
}

function AssistantPanel({
  project,
  onProjectUpdate,
}: {
  project: Project;
  onProjectUpdate: React.Dispatch<React.SetStateAction<Project[]>>;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Describe the part, material, tolerances, or manufacturing constraints.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setBusy(true);
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }]);

    window.setTimeout(() => {
      onProjectUpdate((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                status: "Updated by agent",
                updated: "now",
                score: Math.min(99, item.score + 2),
              }
            : item,
        ),
      );
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: `Applied to ${project.shortName}: topology cleaned, edges tagged, export score improved.`,
        },
      ]);
      setBusy(false);
    }, 900);
  };

  return (
    <aside className="assistant-panel">
      <div className="panel-title">
        <div>
          <Bot size={18} />
          <strong>Agent</strong>
        </div>
        <button title="Panel settings">
          <ChevronDown size={18} />
        </button>
      </div>

      <div className="agent-summary">
        <span>{project.prompt ? "Current prompt" : "Prompt"}</span>
        <p>{project.prompt || "No prompt yet. This project is blank."}</p>
      </div>

      <div className="message-list">
        {messages.map((message) => (
          <div className={`message ${message.role}`} key={message.id}>
            {message.text}
          </div>
        ))}
        {busy && (
          <div className="message assistant thinking">
            <Sparkles size={15} />
            Drafting geometry
          </div>
        )}
      </div>

      <form className="chat-box" onSubmit={submit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Say anything or attach image"
        />
        <button type="button" title="Attach image">
          <ImagePlus size={18} />
        </button>
        <button type="submit" title="Send">
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
}

export default App;
