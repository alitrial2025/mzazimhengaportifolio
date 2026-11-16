import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { asset, projects, type Project } from "../data/content";
import { useMotionPaused } from "./Motion";

const chapters = [
  {
    label: "THE RIDE",
    line: "Ideas that",
    emphasis: "take you places.",
    detail:
      "A storefront with movement in its DNA. From the first bicycle to the finer details of the ride.",
    discipline: "COMMERCE / MOTION / THREE.JS",
  },
  {
    label: "THE CLARITY",
    line: "Confidence,",
    emphasis: "quietly built.",
    detail:
      "A considered digital home for a legal practice. Clear typography, useful information, and space to make a decision.",
    discipline: "ART DIRECTION / EDITORIAL / WEB",
  },
  {
    label: "THE BIG SCREEN",
    line: "A bigger",
    emphasis: "kind of feeling.",
    detail:
      "A cinematic interface made for the living room. Every focus state considers the person holding the remote.",
    discipline: "KOTLIN / COMPOSE / ANDROID TV",
  },
  {
    label: "THE EVERYDAY",
    line: "The details",
    emphasis: "go with you.",
    detail:
      "The same care, on a smaller canvas. Poster-led discovery, glass navigation, and a watchlist that feels personal.",
    discipline: "KOTLIN / COMPOSE / ANDROID",
  },
];
const holds = [0.1, 0.35, 0.6, 0.9];

function JourneyChapter({
  index,
  progress,
  active,
  onSelect,
}: {
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  onSelect: (project: Project) => void;
}) {
  const paused = useMotionPaused();
  const project = projects[index];
  const copy = chapters[index];
  const start = index * 0.25;
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, 0.19, 0.25]
      : index === 3
        ? [0.69, 0.77, 1]
        : [start - 0.06, start + 0.01, start + 0.19, start + 0.25],
    index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [Math.max(0, start - 0.06), start + 0.12, Math.min(1, start + 0.3)],
    [65, 0, -65],
  );
  const artScale = useTransform(
    progress,
    [Math.max(0, start - 0.06), Math.min(1, start + 0.3)],
    [1.1, 0.98],
  );
  const artY = useTransform(
    progress,
    [Math.max(0, start - 0.06), Math.min(1, start + 0.3)],
    [45, -35],
  );
  return (
    <motion.article
      className={`journey-chapter journey-chapter-${index + 1}`}
      data-project={project.id}
      aria-label={`${project.name} project story`}
      aria-hidden={!paused && !active}
      inert={!paused && !active}
      style={paused ? undefined : { opacity }}
    >
      <div className="journey-texture" aria-hidden="true" />
      <span className="journey-large-number" aria-hidden="true">
        {project.number}
      </span>
      <div className="journey-project-line mono">
        <span>{project.name}</span>
        <span>{copy.discipline}</span>
      </div>
      <motion.div className="journey-copy" style={paused ? undefined : { y }}>
        <span className="mono">
          {project.number} / {copy.label}
        </span>
        {index === 0 ? (
          <h2 id="perspective-title">
            {copy.line}
            <br />
            <i>{copy.emphasis}</i>
          </h2>
        ) : (
          <h3>
            {copy.line}
            <br />
            <i>{copy.emphasis}</i>
          </h3>
        )}
        <p>{copy.detail}</p>
        <button className="journey-open mono" onClick={() => onSelect(project)}>
          EXPLORE {project.name.toUpperCase()} <span>+</span>
        </button>
      </motion.div>
      <motion.div
        className="journey-art"
        style={paused ? undefined : { scale: artScale, y: artY }}
      >
        {index === 0 && (
          <img
            className="journey-bicycle"
            src={asset("projects/sites/jeffs-hero-bike.webp")}
            alt="Original ivory and red all-road bicycle from Jeff’s Concepts"
            width="1400"
            height="1050"
            loading="lazy"
          />
        )}
        {index === 1 && (
          <img
            className="journey-law-image"
            src={asset("projects/sites/rk-njogu-office.webp")}
            alt="Warm daylight in the legal office, from the original R. K. Njogu website"
            width="1440"
            height="960"
            loading="lazy"
          />
        )}
        <button
          className={`journey-screen journey-screen-${project.format.toLowerCase()}`}
          onClick={() => onSelect(project)}
          aria-label={`Open ${project.name} story`}
        >
          {project.kind === "website" && (
            <span className="journey-browser-bar mono">
              <span>● ● ●</span>
              <span>{new URL(project.url!).hostname}</span>
            </span>
          )}
          <img
            src={project.image}
            alt={project.alt}
            width={index === 3 ? 412 : 1440}
            height={index === 3 ? 892 : 950}
            loading="lazy"
          />
        </button>
        {index === 2 && (
          <span className="journey-tv-pedestal" aria-hidden="true" />
        )}
        {index === 3 && (
          <div className="journey-mobile-echo" aria-hidden="true">
            <img
              src={projects[2].image}
              alt=""
              width="1200"
              height="675"
              loading="lazy"
            />
            <span className="mono">ONE IDEA. DIFFERENT DIMENSIONS.</span>
          </div>
        )}
      </motion.div>
      <span className="journey-footnote mono">
        {index === 3
          ? "END OF THE REEL. THE CURIOSITY CONTINUES."
          : "TAKE YOUR TIME. THE DETAILS ARE PART OF THE STORY."}
      </span>
    </motion.article>
  );
}

export default function PerspectiveStory({
  onSelect,
}: {
  onSelect: (project: Project) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const paused = useMotionPaused();
  const [chapter, setChapter] = useState(0);
  const previousChapter = useRef(0);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(progress, [0, 0.1, 1], [0.8, 1, 1]);
  const rotate = useTransform(progress, [0, 0.1, 1], [-4, 0, 0]);
  useMotionValueEvent(progress, "change", (value) => {
    const next = value < 0.225 ? 0 : value < 0.475 ? 1 : value < 0.725 ? 2 : 3;
    if (next !== previousChapter.current) {
      previousChapter.current = next;
      setChapter(next);
    }
  });
  const goTo = (index: number) => {
    const section = ref.current;
    if (!section || paused) return;
    window.scrollTo({
      top:
        section.offsetTop +
        holds[index] * (section.offsetHeight - window.innerHeight),
      behavior: "smooth",
    });
  };
  return (
    <section
      ref={ref}
      className={`perspective-section project-journey ${paused ? "is-still" : ""}`}
      data-entrance="slow-aperture"
      aria-label="Four projects, four perspectives"
    >
      <div className="perspective-stage">
        <span className="perspective-ghost" aria-hidden="true">
          IN FOCUS.
        </span>
        <motion.div
          className="perspective-window"
          style={{ scale: paused ? 1 : scale, rotate: paused ? 0 : rotate }}
        >
          {projects.map((project, index) => (
            <JourneyChapter
              key={project.id}
              index={index}
              progress={progress}
              active={chapter === index}
              onSelect={onSelect}
            />
          ))}
          {!paused && (
            <nav
              className={`journey-chapters ${chapter === 0 ? "on-light" : ""}`}
              aria-label="Project story chapters"
            >
              {chapters.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => goTo(index)}
                  aria-label={`Read project chapter ${index + 1}: ${projects[index].name}`}
                  aria-current={chapter === index ? "step" : undefined}
                >
                  <span className="mono">0{index + 1}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <motion.span
                className="journey-progress"
                style={{ scaleX: progress }}
              />
            </nav>
          )}
        </motion.div>
      </div>
    </section>
  );
}
