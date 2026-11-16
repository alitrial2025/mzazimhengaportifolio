import { useState } from "react";
import { motion } from "motion/react";
import ParticleField, { type FieldMode } from "./ParticleField";
import { useMotionPaused } from "./Motion";
import { projects } from "../data/content";

const modes: FieldMode[] = ["Orbit", "Wave", "Scatter"];
const descriptions = {
  Orbit: "An orbit of connected thoughts.",
  Wave: "A landscape made of possibilities.",
  Scatter: "A little room for the unexpected.",
};

export default function ExperimentRoom() {
  const paused = useMotionPaused();
  const [mode, setMode] = useState<FieldMode>("Orbit");
  const [pulse, setPulse] = useState(0);
  return (
    <section
      className="experiment-room section-pad"
      id="play"
      aria-labelledby="play-title"
    >
      <div className="room-top mono">
        <span>03 / THE EXPERIMENT ROOM</span>
        <span>CURIOSITY, MADE INTERACTIVE.</span>
      </div>
      <div className="room-introduction">
        <h2 id="play-title">
          What <i>if</i>
          <span>?</span>
        </h2>
        <p>
          A bicycle you can configure.
          <br />
          An interface you can feel.
          <br />
          It starts with a little curiosity.
        </p>
      </div>
      <motion.div
        className="field-theatre"
        data-entrance="thought-materialization"
        initial={paused ? false : { opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="field-side-note mono">
          AN UNFINISHED THOUGHT / YOUR MOVE
        </span>
        <ParticleField mode={mode} paused={paused} pulse={pulse} />
        <span className="field-coordinate mono" aria-hidden="true">
          COUNTLESS POSSIBILITIES.
          <br />
          ONE SMALL INTERFERENCE.
        </span>
      </motion.div>
      <div className="room-controls">
        <div
          className="field-mode-controls"
          role="group"
          aria-label="Particle field shape"
        >
          {modes.map((name, i) => (
            <button
              key={name}
              onClick={() => setMode(name)}
              aria-pressed={mode === name}
              aria-label={`Set field to ${name}`}
              className={mode === name ? "is-active" : ""}
            >
              <span className="mono">0{i + 1}</span>
              {name}
            </button>
          ))}
        </div>
        <button
          className="field-pulse mono"
          onClick={() => setPulse((value) => value + 1)}
          disabled={paused}
        >
          PULSE THE FIELD
        </button>
      </div>
      <div className="room-bottom">
        <p id="experiment-help" className="mono">
          {paused
            ? "A STILL MOMENT. CHANGE THE SHAPE TO EXPLORE."
            : "MOVE TO BEND THE FIELD. HOLD TO BRING IT TOGETHER."}
          <br />
          LET GO. SEE WHAT SETTLES.
        </p>
        <p className="field-description" role="status">
          {descriptions[mode]}
        </p>
        <span className="mono">
          SOME OF THE BEST THINGS
          <br />
          START WITH PLAY.
        </span>
      </div>
      <div className="project-preview-desk">
        <div className="preview-desk-heading">
          <span className="mono">FROM AN IDEA TO SOMETHING YOU CAN USE.</span>
          <h3>
            Go on.
            <br />
            <i>Get into it.</i>
          </h3>
          <p>
            The TV and mobile interfaces, rebuilt for your browser. Open one and
            make yourself at home.
          </p>
        </div>
        <div className="preview-desk-devices">
          {projects
            .filter((project) => project.preview)
            .map((project, index) => (
              <motion.a
                key={project.id}
                href={project.preview}
                aria-label={`Launch ${project.name} interactive preview`}
                className={`desk-device desk-device-${project.format.toLowerCase()}`}
                initial={
                  paused
                    ? false
                    : {
                        opacity: 0,
                        y: index ? 100 : 65,
                        rotate: index ? 7 : -5,
                      }
                }
                whileInView={{ opacity: 1, y: 0, rotate: index ? 5 : -3 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={project.image}
                  alt={project.alt}
                  width={index ? 412 : 1200}
                  height={index ? 892 : 675}
                  loading="lazy"
                />
                <span className="mono">
                  {project.name} <span>OPEN PREVIEW +</span>
                </span>
              </motion.a>
            ))}
        </div>
        <div className="preview-desk-note mono">
          <span>OR STEP INTO ANOTHER WORLD.</span>
          {projects
            .filter((project) => project.url)
            .map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.name} <span aria-hidden="true">+</span>
              </a>
            ))}
        </div>
      </div>
    </section>
  );
}
