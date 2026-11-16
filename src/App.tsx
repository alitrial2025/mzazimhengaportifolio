import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
} from "motion/react";
import ImmersiveHero from "./components/ImmersiveHero";
import { Sculpture } from "./components/Sculpture";
import {
  MotionPreference,
  Reveal,
  TextReveal,
  useMotionPaused,
} from "./components/Motion";
import {
  asset,
  capabilities,
  projects,
  site,
  type Project,
} from "./data/content";

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
          Work <span>03</span>
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

function ProjectArt({ project }: { project: Project }) {
  if (project.kind === "image")
    return (
      <div className="editorial-art">
        <img
          src={project.image}
          alt={project.alt}
          width="700"
          height="500"
          loading="lazy"
        />
        <span className="editorial-title" aria-hidden="true">
          off
          <br />
          <i>script.</i>
        </span>
        <span className="editorial-meta mono" aria-hidden="true">
          INDEPENDENT THINKING
          <br />
          UNEXPECTED PERSPECTIVES
        </span>
      </div>
    );
  if (project.kind === "sculpture")
    return (
      <div className="sculpture-art">
        <span className="mono art-corner">
          FORM / 002
          <br />
          AN OBJECT OF CURIOSITY
        </span>
        <Sculpture variant="silver" />
        <span className="art-oversize" aria-hidden="true">
          f.
        </span>
      </div>
    );
  return (
    <div className="type-art" role="img" aria-label={project.alt}>
      <span className="mono art-corner">THE BEAUTY IN THE EVERYDAY.</span>
      <span className="type-line" aria-hidden="true">
        EXTRA
      </span>
      <span className="type-line outline-type" aria-hidden="true">
        ORDI
      </span>
      <span className="type-line" aria-hidden="true">
        NARY.
      </span>
      <span className="type-footer mono">A TYPOGRAPHIC PLAYGROUND — 003</span>
    </div>
  );
}

function SelectedWork({ onSelect }: { onSelect: (p: Project) => void }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const paused = useMotionPaused();
  const [travel, setTravel] = useState(0);
  const [height, setHeight] = useState(0);
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 900);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: arrival } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const curtain = useTransform(
    arrival,
    [0, 0.85],
    ["inset(0 18% 0 18% round 130px)", "inset(0 0% 0 0% round 0px)"],
  );
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  const activeIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [1, projects.length],
  );
  useLayoutEffect(() => {
    const measure = () => {
      setDesktop(window.innerWidth >= 900);
      setHeight(window.innerHeight);
      setTravel(
        window.innerWidth >= 900 && !paused
          ? Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth)
          : 0,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [paused, desktop]);
  const goTo = (i: number) => {
    if (!ref.current) return;
    if (travel)
      window.scrollTo({
        top: ref.current.offsetTop + (i / (projects.length - 1)) * travel,
        behavior: paused ? "instant" : "smooth",
      });
    else
      document.getElementById(projects[i].id)?.scrollIntoView({
        behavior: paused ? "instant" : "smooth",
        block: "center",
      });
  };
  return (
    <motion.section
      data-entrance="expanding-stage"
      className={`work-section ${desktop && !paused ? "is-horizontal" : ""}`}
      ref={ref}
      id="work"
      style={{
        ...(travel ? { height: travel + height } : {}),
        clipPath: paused ? "none" : curtain,
      }}
      aria-labelledby="work-title"
    >
      <div className="work-sticky">
        <div className="work-heading section-pad">
          <div>
            <span className="eyebrow mono">01 / SELECTED EXPLORATIONS</span>
            <h2 id="work-title">
              NOTHING ORDINARY.
              <span className="work-subtitle">Just possibilities.</span>
            </h2>
          </div>
          <p className="work-intro">
            EXPLORATIONS / 01—03
            <br />
            Visual studies today. Your next
            <br />
            favorite project tomorrow.
          </p>
        </div>
        <motion.div
          ref={track}
          className="project-track"
          style={{ x: paused ? 0 : x }}
        >
          {projects.map((project, i) => (
            <article id={project.id} className="project" key={project.id}>
              <button
                className="project-visual"
                style={{ backgroundColor: project.color }}
                onClick={() => onSelect(project)}
                onFocus={() => {
                  if (travel) goTo(i);
                }}
                aria-label={`Explore ${project.name}, visual concept ${project.number}`}
              >
                <ProjectArt project={project} />
                <span className="project-chip mono">
                  VISUAL CONCEPT {project.number}
                </span>
                <span className="project-open mono" aria-hidden="true">
                  VIEW STUDY<span>{project.number}</span>
                </span>
              </button>
              <div className="project-caption">
                <div>
                  <h3>{project.name}</h3>
                  <p className="mono">{project.category}</p>
                </div>
                <span className="project-number mono">({project.number})</span>
              </div>
            </article>
          ))}
        </motion.div>
        <div className="work-footer section-pad mono">
          <span>IDEAS IN MOTION. ALWAYS A WORK IN PROGRESS.</span>
          <div className="gallery-nav">
            {projects.map((project, i) => (
              <button
                onClick={() => goTo(i)}
                key={project.id}
                aria-label={`Go to visual concept ${project.number}`}
              >
                0{i + 1}
              </button>
            ))}
            <span aria-hidden="true"> / 03</span>
            <motion.span
              className="gallery-progress"
              style={{ scaleX: paused ? 1 : scrollYProgress }}
            />
          </div>
          <motion.span className="sr-only" aria-hidden="true">
            {activeIndex}
          </motion.span>
        </div>
      </div>
    </motion.section>
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
        <TextReveal text={site.introduction} />
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

function ZoomScene() {
  const ref = useRef<HTMLElement>(null);
  const paused = useMotionPaused();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.8, 1], [0.56, 1, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.75, 1], [-7, 0, 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-65, 60]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.25, 1.04]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [110, -65]);
  const textY = useTransform(scrollYProgress, [0, 1], [60, -45]);
  return (
    <section
      data-entrance="tilted-portal"
      className="zoom-section"
      ref={ref}
      aria-labelledby="zoom-title"
    >
      <div className="zoom-sticky">
        <span className="zoom-ghost" aria-hidden="true">
          BREATHE.
        </span>
        <motion.div
          className="zoom-frame"
          style={{ scale: paused ? 1 : scale, rotate: paused ? 0 : rotate }}
        >
          <motion.img
            className="zoom-image"
            src={asset("images/mountain.jpg")}
            alt="Layers of forested mountains rising through low clouds"
            width="1900"
            height="1188"
            loading="lazy"
            style={{ y: paused ? 0 : imageY, scale: paused ? 1 : imageScale }}
          />
          <div className="zoom-shade" />
          <span className="zoom-tag mono">
            FIELD NOTES / 001
            <br />
            THE ART OF LOOKING CLOSER
          </span>
          <motion.div className="zoom-text" style={{ y: paused ? 0 : textY }}>
            <p className="mono">STEP BACK. LEAN IN.</p>
            <h2 id="zoom-title">
              A different
              <br />
              <i>point of view.</i>
            </h2>
          </motion.div>
          <motion.svg
            viewBox="0 0 1600 350"
            preserveAspectRatio="none"
            className="mountain-foreground"
            style={{ y: paused ? 0 : foregroundY }}
            aria-hidden="true"
          >
            <path
              d="m0 250 190-100 110 60 180-190 220 160 150-100 190 170 170-125 200 160 90-50v115H0Z"
              fill="#171c18"
              opacity=".7"
            />
            <path
              d="m0 250 170-50 200 90 180-110 160 100 210-30 140 50 230-130 200 80 110-35v135H0Z"
              fill="#171c18"
            />
          </motion.svg>
          <div className="zoom-bottom mono">
            <span>LESS NOISE. MORE WONDER.</span>
            <span>ALTITUDE / UNKNOWN</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Playground() {
  const ref = useRef<HTMLElement>(null);
  const paused = useMotionPaused();
  const [palette, setPalette] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotateY = useTransform(scrollYProgress, [0, 1], [-40, 180]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-20, 60]);
  return (
    <section
      className="play-section section-pad"
      id="play"
      ref={ref}
      aria-labelledby="play-title"
    >
      <div className="section-topline mono">
        <span>03 / NO BRIEF. JUST CURIOSITY.</span>
        <span>THE PLAYGROUND</span>
      </div>
      <div className="play-grid">
        <div className="play-copy">
          <Reveal>
            <h2 id="play-title">
              Serious about
              <br />
              <i>not being boring.</i>
            </h2>
            <p>
              Not everything needs a reason.
              <br />
              Sometimes you follow an idea,
              <br />
              turn it around, and see what happens.
            </p>
            <a href="#contact" className="text-link">
              Got something in mind?
            </a>
          </Reveal>
          <div className="play-note mono">
            <span className="status-dot" /> EXPERIMENT IN PROGRESS / HAVE A PLAY
          </div>
        </div>
        <motion.div
          className={`experiment palette-${palette}`}
          data-entrance="spatial-unfold"
          initial={paused ? false : { rotate: -12, scale: 0.8, opacity: 0 }}
          whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="experiment-word" aria-hidden="true">
            PLAY.
          </span>
          <span className="experiment-label mono">
            OBJECT 003 — ENDLESS POSSIBILITIES
          </span>
          <div className="spiral-stage" aria-hidden="true">
            <motion.div
              className="spiral-object"
              style={{
                rotateY: paused ? -30 : rotateY,
                rotateZ: paused ? -15 : rotateZ,
                rotateX: 25,
              }}
            >
              {Array.from({ length: 32 }, (_, i) => (
                <span
                  className="spiral-ring"
                  key={i}
                  style={{
                    transform: `rotateY(${i * 5.625}deg)`,
                    width: 250 + Math.sin(i * 0.2) * 30,
                    height: 250 + Math.sin(i * 0.2) * 30,
                  }}
                />
              ))}
            </motion.div>
          </div>
          <span className="experiment-index mono" aria-hidden="true">
            32
            <br />
            FORMS / ONE IDEA
          </span>
          <div className="experiment-bottom mono">
            <span>
              SCROLL TO ROTATE
              <br />
              CLICK TO REIMAGINE
            </span>
            <button
              className="remix-button"
              onClick={() => setPalette((p) => (p + 1) % 3)}
              aria-label="Change sculpture color"
            >
              CHANGE COLOR <span className="palette-count">0{palette + 1}</span>
            </button>
          </div>
          <span className="sr-only" role="status">
            Sculpture palette:{" "}
            {["electric lime", "ultraviolet", "sunset"][palette]}
          </span>
        </motion.div>
      </div>
      <div className="little-gallery">
        <figure>
          <img
            src={asset("images/sneaker.jpg")}
            alt="A sneaker photographed as a placeholder product study"
            width="600"
            height="450"
            loading="lazy"
          />
          <figcaption className="mono">FOUND FORMS / 001</figcaption>
        </figure>
        <div className="gallery-message">
          <svg
            className="kinetic-thread"
            viewBox="0 0 220 75"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 45C25 8 51 11 70 41c18 29 30 19 21-4C74-3 119 0 123 35c5 44 21 37 30 7 10-36 37-28 62-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p>
            Stay curious.
            <br />
            Make a little mess.
          </p>
          <span className="mono">THAT’S WHERE THE GOOD STUFF STARTS.</span>
        </div>
        <figure>
          <img
            src={asset("images/still-life.jpg")}
            alt="A black cosmetic bottle photographed as a placeholder still-life study"
            width="600"
            height="450"
            loading="lazy"
          />
          <figcaption className="mono">EVERYDAY OBJECTS / 002</figcaption>
        </figure>
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
            <SelectedWork onSelect={setSelected} />
            <About />
            <ZoomScene />
            <Playground />
          </main>
          <Footer
            onContact={() => setContactOpen(true)}
            paused={paused}
            onToggle={toggleMotion}
            systemReduced={systemReduced}
          />
          <Dialog
            title={
              selected ? `${selected.name} — visual concept` : "Visual concept"
            }
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
                    VISUAL CONCEPT / {selected.number}
                  </span>
                  <h2>{selected.name}</h2>
                  <p>{selected.description}</p>
                  <p className="concept-note mono">
                    A SELF-INITIATED VISUAL STUDY.
                    <br />
                    REAL PROJECTS ARE COMING SOON.
                  </p>
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
                    details and the full project collection are coming soon.
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
