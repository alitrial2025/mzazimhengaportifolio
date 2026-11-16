import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
} from "motion/react";
import ImmersiveHero from "./components/ImmersiveHero";
import { ProjectArt } from "./components/ProjectArt";
import ArchiveWork from "./components/ArchiveWork";
import PerspectiveStory from "./components/PerspectiveStory";
import ExperimentRoom from "./components/ExperimentRoom";
import PointerManifesto from "./components/PointerManifesto";
import { MotionPreference, Reveal, useMotionPaused } from "./components/Motion";
import { capabilities, projects, site, type Project } from "./data/content";

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label={`${site.name} home`}>
        {site.name.toLowerCase()}
        <span>®</span>
      </a>
      <span className="header-note mono">
        INDEPENDENT MIND.
        <br />
        INTERACTIVE BY NATURE.
      </span>
      <button
        className="menu-toggle mono"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        className={open ? "main-nav is-open" : "main-nav"}
      >
        <a href="#work" onClick={() => setOpen(false)}>
          Work <span>{String(projects.length).padStart(2, "0")}</span>
        </a>
        <a href="#about" onClick={() => setOpen(false)}>
          About
        </a>
        <a href="#play" onClick={() => setOpen(false)}>
          Play
        </a>
        <a
          href="#contact"
          className="nav-contact"
          onClick={() => setOpen(false)}
        >
          Let’s talk <span className="nav-index">04</span>
        </a>
      </nav>
    </header>
  );
}

function Ticker() {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useMotionPaused();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const clip = useTransform(
    scrollYProgress,
    [0, 0.45],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );
  return (
    <motion.div
      ref={ref}
      data-entrance="ribbon-wipe"
      style={{ clipPath: paused ? "none" : clip }}
      className="ticker"
      aria-label="Good design is a feeling. Let's make it move."
    >
      <motion.div style={{ x: paused ? 0 : x }}>
        <div className="ticker-loop" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span className="ticker-unit" key={i}>
              GOOD DESIGN IS A FEELING <span className="ticker-divider">/</span>{" "}
              LET’S MAKE IT MOVE <span className="ticker-divider">/</span>
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function About() {
  const paused = useMotionPaused();
  const section = useRef<HTMLElement>(null);
  const entered = useInView(section, { once: true, amount: 0.1 });
  return (
    <section
      className="about-section section-pad"
      ref={section}
      id="about"
      aria-labelledby="about-title"
    >
      <div className="section-topline mono">
        <span>02 / THE WAY I SEE IT</span>
        <span className="belief-note">A FEW THINGS I BELIEVE.</span>
      </div>
      <motion.div
        className="about-grid"
        data-entrance="typographic-wipe"
        initial={paused ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={{
          clipPath: entered || paused ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Reveal>
          <h2 id="about-title">
            A curious mind.
            <br />
            An eye for detail.
            <br />
            <span className="soft-italic">A soft spot for weird.</span>
          </h2>
          <p className="about-small">
            A little about the person behind the pixels.
          </p>
        </Reveal>
        <PointerManifesto />
      </motion.div>
      <div className="capabilities">
        {capabilities.map((c, i) => (
          <Reveal key={c.number} delay={i * 0.06}>
            <details className="capability" open={i === 0 ? true : undefined}>
              <summary>
                <span className="cap-number mono">/{c.number}</span>
                <h3>{c.title}</h3>
                <span className="cap-toggle" aria-hidden="true" />
              </summary>
              <div className="cap-detail">
                <p>{c.detail}</p>
                <span className="mono">{c.tags}</span>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Dialog({
  children,
  title,
  open,
  onClose,
}: {
  children: ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && ref.current && !ref.current.open) ref.current.showModal();
    if (!open && ref.current?.open) ref.current.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog
      className="detail-dialog"
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <button
          className="dialog-close mono"
          onClick={onClose}
          autoFocus
          aria-label="Close preview"
        >
          CLOSE <span aria-hidden="true">×</span>
        </button>
        {children}
      </div>
    </dialog>
  );
}

function Footer({
  onContact,
  paused,
  onToggle,
  systemReduced,
}: {
  onContact: () => void;
  paused: boolean;
  onToggle: () => void;
  systemReduced: boolean;
}) {
  return (
    <motion.footer
      className="contact-section section-pad"
      id="contact"
      data-entrance="closing-fold"
      initial={paused ? false : { y: 120, rotateX: -12, opacity: 0.3 }}
      whileInView={{ y: 0, rotateX: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="section-topline mono">
        <span>04 / THE NEXT GOOD THING</span>
        <span>STARTS WITH A HELLO</span>
      </div>
      <Reveal>
        <h2>
          Let’s make
          <br />
          something <i>matter.</i>
        </h2>
      </Reveal>
      <div className="footer-invite">
        <p>
          A good idea deserves
          <br />a great conversation.
        </p>
        <button onClick={onContact} className="contact-button">
          Say hello
        </button>
      </div>
      <div className="footer-bottom">
        <a href="#home" className="wordmark" aria-label="Back to top">
          {site.name.toLowerCase()}
          <span>®</span>
        </a>
        <span className="mono">
          AN INDEPENDENT WORK IN PROGRESS.
          <br />© {new Date().getFullYear()} — MADE WITH INTENTION.
        </span>
        <button
          className="motion-toggle mono"
          onClick={onToggle}
          disabled={systemReduced}
          aria-pressed={paused}
        >
          {systemReduced
            ? "REDUCED MOTION"
            : paused
              ? "RESUME MOTION"
              : "PAUSE MOTION"}
        </button>
        <a className="back-top mono" href="#home">
          BACK TO TOP
        </a>
      </div>
    </motion.footer>
  );
}

export default function App() {
  const systemReduced = useReducedMotion() ?? false;
  const [manualPaused, setManualPaused] = useState(() => {
    try {
      return localStorage.getItem("mzazi-motion-paused") === "true";
    } catch {
      return false;
    }
  });
  const paused = systemReduced || manualPaused;
  const [selected, setSelected] = useState<Project | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const toggleMotion = () => {
    const next = !manualPaused;
    setManualPaused(next);
    try {
      localStorage.setItem("mzazi-motion-paused", String(next));
    } catch {
      /* Preference remains available for this visit. */
    }
  };
  return (
    <MotionPreference.Provider value={paused}>
      <MotionConfig reducedMotion={paused ? "always" : "never"}>
        <div
          className={paused ? "portfolio motion-paused" : "portfolio"}
          data-motion={paused ? "paused" : "active"}
        >
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <motion.div
            className="page-progress"
            style={{ scaleX: scrollYProgress }}
            aria-hidden="true"
          />
          <Header />
          <main id="main">
            <ImmersiveHero />
            <Ticker />
            <ArchiveWork onSelect={setSelected} />
            <About />
            <PerspectiveStory />
            <ExperimentRoom />
          </main>
          <Footer
            onContact={() => setContactOpen(true)}
            paused={paused}
            onToggle={toggleMotion}
            systemReduced={systemReduced}
          />
          <Dialog
            title={selected ? `${selected.name} — project` : "Project"}
            open={!!selected}
            onClose={() => setSelected(null)}
          >
            {selected && (
              <>
                <div
                  className="dialog-art"
                  style={{ backgroundColor: selected.color }}
                >
                  <ProjectArt project={selected} />
                </div>
                <div className="dialog-copy">
                  <span className="eyebrow mono">
                    PROJECT / {selected.number}
                  </span>
                  <h2>{selected.name}</h2>
                  <p>{selected.description}</p>
                  <ul
                    className="project-stack"
                    aria-label="Project technologies"
                  >
                    {selected.stack.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                  <ul className="project-highlights">
                    {selected.highlights.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                  <div className="project-case-actions">
                    {selected.preview ? (
                      <a
                        className="project-primary-action"
                        href={selected.preview}
                        onClick={() => setSelected(null)}
                      >
                        Try the React preview
                      </a>
                    ) : (
                      <a
                        className="project-primary-action"
                        href={selected.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit website
                      </a>
                    )}
                    {selected.source && (
                      <a
                        href={selected.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-source-action"
                      >
                        Source repository
                      </a>
                    )}
                  </div>
                  <p className="project-context-note">{selected.note}</p>
                  <button
                    className="text-link"
                    onClick={() => setSelected(null)}
                  >
                    Keep exploring
                  </button>
                </div>
              </>
            )}
          </Dialog>
          <Dialog
            title="Let’s connect"
            open={contactOpen}
            onClose={() => setContactOpen(false)}
          >
            <div className="contact-dialog-copy">
              <span className="eyebrow mono">THE START OF SOMETHING GOOD</span>
              <h2>Well, hello.</h2>
              {site.email ? (
                <>
                  <p>Have an idea? I’d love to hear it.</p>
                  <a className="contact-button" href={`mailto:${site.email}`}>
                    Send an email
                  </a>
                </>
              ) : (
                <>
                  <p>
                    This little corner of the internet is taking shape. Contact
                    details are coming soon. Explore the current project
                    collection in the meantime.
                  </p>
                  <button
                    className="contact-button"
                    onClick={() => {
                      setContactOpen(false);
                      document.getElementById("work")?.scrollIntoView({
                        behavior: paused ? "instant" : "smooth",
                      });
                    }}
                  >
                    Explore the studies
                  </button>
                </>
              )}
            </div>
          </Dialog>
        </div>
      </MotionConfig>
    </MotionPreference.Provider>
  );
}
