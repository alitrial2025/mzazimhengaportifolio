import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { projects, type Project } from "../data/content";
import { ProjectArt } from "./ProjectArt";
import { useMotionPaused } from "./Motion";

export default function ArchiveWork({
  onSelect,
}: {
  onSelect: (project: Project) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const paused = useMotionPaused();
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const clip = useTransform(
    scrollYProgress,
    [0, 0.9],
    ["inset(0 12% 0 12% round 100px)", "inset(0 0% 0 0% round 0px)"],
  );
  return (
    <motion.section
      className="archive-section section-pad"
      id="work"
      ref={ref}
      data-entrance="contact-sheet"
      aria-labelledby="work-title"
      style={{ clipPath: paused ? "none" : clip }}
    >
      <div className="archive-top mono">
        <span>01 / THE COLLECTION</span>
        <span>AN OPEN INDEX. ALWAYS EVOLVING.</span>
        <span>001 — {String(projects.length).padStart(3, "0")}</span>
      </div>
      <div className="archive-layout">
        <div className="archive-index">
          <h2 id="work-title">
            Selected
            <br />
            <i>work.</i>
          </h2>
          <p className="archive-intro">
            Websites, interfaces, and the ideas behind them.
            <br />A selection of things I’ve brought to life.
          </p>
          <div className="archive-rows" aria-label="Select a project">
            {projects.map((item, i) => (
              <button
                key={item.id}
                className={`archive-row ${selected === i ? "is-selected" : ""}`}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") setSelected(i);
                }}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
                aria-label={`Preview ${item.name}`}
                aria-pressed={selected === i}
                aria-controls="archive-preview"
              >
                <span className="archive-row-number mono">{item.number}</span>
                <span className="archive-row-name">{item.name}</span>
                <span className="archive-row-kind mono">{item.format}</span>
              </button>
            ))}
          </div>
          <p className="archive-note mono">
            SELECT A NAME. FOLLOW THE THOUGHT.
          </p>
        </div>
        <div className="archive-light-table">
          <div className="archive-watermark" aria-hidden="true">
            {project.number}
          </div>
          <div className="archive-paper paper-back" aria-hidden="true" />
          <div className="archive-paper paper-middle" aria-hidden="true" />
          <div className="archive-print" id="archive-preview">
            <div className="archive-print-head mono">
              <span>PROJECT / {project.number}</span>
              <span>
                {project.format === "WEB"
                  ? "LIVE WEBSITE"
                  : "KOTLIN / REACT PREVIEW"}
              </span>
            </div>
            <div
              className="archive-art"
              style={{ backgroundColor: project.color }}
            >
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={project.id}
                  className="archive-art-layer"
                  initial={
                    paused
                      ? false
                      : { clipPath: "inset(0 0 100% 0)", scale: 1.08 }
                  }
                  animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: paused ? 0 : 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ProjectArt project={project} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="archive-print-caption">
              <div>
                <span className="mono">{project.category}</span>
                <strong>{project.name}</strong>
              </div>
              <button
                className="archive-open mono"
                onClick={() => onSelect(project)}
                aria-label={`Explore ${project.name}`}
              >
                OPEN
                <br />
                STUDY
              </button>
            </div>
          </div>
          <span className="archive-margin-note mono">
            NOTES FROM AN UNFINISHED PRACTICE.
          </span>
        </div>
      </div>
      <div className="archive-bottom mono">
        <span>COLLECTED WITH INTENTION.</span>
        <span>REAL PROJECTS. A PRACTICE IN PROGRESS.</span>
      </div>
    </motion.section>
  );
}
