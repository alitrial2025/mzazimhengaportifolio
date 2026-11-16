import { useState } from "react";
import { motion } from "motion/react";
import ParticleField, { type FieldMode } from "./ParticleField";
import { useMotionPaused } from "./Motion";

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
        <span>NO BRIEF. NO FINISH LINE.</span>
      </div>
      <div className="room-introduction">
        <h2 id="play-title">
          What <i>if</i>
          <span>?</span>
        </h2>
        <p>
          Not every idea needs a destination.
          <br />
          Some just need someone
          <br />
          curious enough to follow.
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
    </section>
  );
}
