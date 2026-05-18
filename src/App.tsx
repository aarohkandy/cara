import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Box,
  ChevronDown,
  CircleDot,
  Download,
  FolderOpen,
  Home,
  ImagePlus,
  LockKeyhole,
  LogIn,
  Plus,
  Send,
  Settings2,
  Sparkles,
  X,
  Zap,
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
      name: "Magnetic Fixture Concept",
      shortName: "Fixture",
      kind: "New study",
      status: "Sketching",
      prompt: "A magnetic fixture with indexed service handles",
      updated: "now",
      color: "#c77c43",
      accent: "#e0c59f",
      score: 64,
      parts: 3,
      dimensions: "120 x 44 x 32 mm",
    };
    setProjects((current) => [next, ...current]);
    setActiveProjectId(next.id);
    setToast("Project added to dashboard");
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
    return (
      <>
        <Landing onSignIn={completeSignIn} />
        <DemoDock
          activeView="home"
          settingsOpen={settingsOpen}
          onHome={showHome}
          onProjects={showProjects}
          onProject={showProject}
          onSettings={() => setSettingsOpen((current) => !current)}
        />
        <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </>
    );
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
  return (
    <div className="motion-field" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <span className={`motion-line line-${index + 1}`} key={index} />
      ))}
    </div>
  );
}

function Landing({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState("pilot@cadybara.dev");
  const heroProjects = useMemo(() => starterProjects.slice(0, 1), []);
  const [heroIndex, setHeroIndex] = useState(0);
  const [completion, setCompletion] = useState(heroProjects[0].score);
  const [isCompleting, setIsCompleting] = useState(false);
  const heroProject = heroProjects[heroIndex];

  useEffect(() => {
    setCompletion(heroProject.score);
    setIsCompleting(false);
  }, [heroProject.id, heroProject.score]);

  useEffect(() => {
    if (isCompleting) return undefined;

    const timer = window.setInterval(() => {
      setCompletion((current) => Math.min(100, current + 1));
    }, 140);

    return () => window.clearInterval(timer);
  }, [isCompleting]);

  useEffect(() => {
    if (completion < 100 || isCompleting) return;
    setIsCompleting(true);
  }, [completion, isCompleting]);

  useEffect(() => {
    if (!isCompleting) return undefined;

    const timer = window.setTimeout(() => {
      if (heroProjects.length === 1) {
        setCompletion(heroProject.score);
        setIsCompleting(false);
        return;
      }

      setHeroIndex((current) => (current + 1) % heroProjects.length);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [heroProject.score, heroProjects.length, isCompleting]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSignIn();
  };

  return (
    <main className="landing">
      <BackgroundMotion />
      <header className="landing-nav">
        <div className="brand-lockup">
          <img className="brand-mark" src="/cadybara-logo.svg" alt="" />
          <div>
            <strong>Cadybara</strong>
            <span>Generative CAD</span>
          </div>
        </div>
        <div className="founders-badge">
          <Zap size={20} />
          <span>Backed by Founders Inc.</span>
        </div>
      </header>

      <section className="landing-content">
        <div className="hero-copy">
          <span className="eyebrow">2026 CAD Workspace</span>
          <h1>Cadybara</h1>
          <p>
            Speak a part into existence, inspect it in a real workspace, and move from idea to
            export without losing the thread.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={onSignIn}>
              <LogIn size={18} />
              Enter workspace
            </button>
          </div>
          <HeroBuildStage
            project={heroProject}
            progress={completion}
            isCompleting={isCompleting}
          />
        </div>

        <form className="signin-panel" onSubmit={submit}>
          <span className="eyebrow">Pilot Access</span>
          <h2>Sign in</h2>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Workspace</span>
            <input defaultValue="Cadybara showroom" />
          </label>
          <button className="wide-action" type="submit">
            Launch workspace
            <ArrowRight size={18} />
          </button>
          <div className="signin-row">
            <LockKeyhole size={16} />
            <span>Pilot access only</span>
          </div>
        </form>
      </section>

      <div className="landing-strip">
        {heroProjects.map((project) => {
          const isActive = project.id === heroProject.id;

          return (
            <div
              className={`landing-chip ${isActive ? "active" : ""} ${
                isActive && isCompleting ? "is-completing" : ""
              }`}
              key={project.id}
            >
              <CircleDot size={15} color={project.color} />
              <span>{project.shortName}</span>
              <strong>{isActive ? completion : project.score}%</strong>
            </div>
          );
        })}
      </div>
    </main>
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

function HeroBuildStage({
  project,
  progress,
  isCompleting,
}: {
  project: Project;
  progress: number;
  isCompleting: boolean;
}) {
  return (
    <div
      className={`hero-build-stage ${isCompleting ? "is-completing" : ""}`}
      aria-label="Live Cadybara project preview"
    >
      <div className="build-stage-top">
        <span>{project.kind}</span>
        <strong>{project.name}</strong>
        <b>{progress}%</b>
      </div>
      <div className="build-stage-canvas">
        <CadScene project={project} hero />
        <div className="build-scan" />
        <div className="build-readout">
          <span>Prompt parsed</span>
          <span>Geometry pass</span>
          <span>Export check</span>
        </div>
      </div>
    </div>
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
              <span className="project-model-preview" aria-hidden="true">
                <CadScene project={project} hero />
              </span>
              <span className="project-tile-top">
                <span className="project-dot" style={{ background: project.color }} />
                <small>{project.kind}</small>
                <b>{project.updated}</b>
              </span>
              <strong>{project.name}</strong>
              <p>{project.prompt}</p>
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
      text: "Send a part change, material note, or manufacturability constraint.",
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
        <span>Current prompt</span>
        <p>{project.prompt}</p>
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
