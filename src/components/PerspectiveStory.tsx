import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { asset } from "../data/content";
import { useMotionPaused } from "./Motion";

const chapters = ["LOOK", "LOOK CLOSER", "TAKE IT WITH YOU"];

export default function PerspectiveStory() {
  const ref = useRef<HTMLElement>(null);
  const paused = useMotionPaused();
  const [chapter, setChapter] = useState(0);
  const previousChapter = useRef(0);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(progress, [0, 0.25, 1], [0.58, 1, 1]);
  const rotate = useTransform(progress, [0, 0.25, 1], [-6, 0, 0]);
  const y = useTransform(progress, [0, 1], [-60, 65]);
  const imageScale = useTransform(progress, [0, 0.5, 1], [1.26, 1.16, 1.08]);
  const firstOpacity = useTransform(
    progress,
    [0, 0.08, 0.27, 0.38],
    [0, 1, 1, 0],
  );
  const firstY = useTransform(progress, [0, 0.27, 0.38], [40, 0, -60]);
  const secondOpacity = useTransform(
    progress,
    [0.34, 0.43, 0.63, 0.73],
    [0, 1, 1, 0],
  );
  const secondY = useTransform(progress, [0.34, 0.45, 0.73], [65, 0, -45]);
  const lastOpacity = useTransform(progress, [0.7, 0.8, 1], [0, 1, 1]);
  const lastY = useTransform(progress, [0.7, 0.83, 1], [55, 0, 0]);
  const warmth = useTransform(progress, [0.25, 0.8, 1], [0, 0.5, 0.55]);
  useMotionValueEvent(progress, "change", (value) => {
    const next = value < 0.36 ? 0 : value < 0.72 ? 1 : 2;
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
        [0.15, 0.5, 0.9][index] * (section.offsetHeight - window.innerHeight),
      behavior: "smooth",
    });
  };
  return (
    <section
      ref={ref}
      className={`perspective-section ${paused ? "is-still" : ""}`}
      data-entrance="slow-aperture"
      aria-labelledby="perspective-title"
    >
      <div className="perspective-stage">
        <span className="perspective-ghost" aria-hidden="true">
          BREATHE.
        </span>
        <motion.div
          className="perspective-window"
          style={{ scale: paused ? 1 : scale, rotate: paused ? 0 : rotate }}
        >
          <motion.img
            className="perspective-image"
            src={asset("images/mountain.jpg")}
            alt="Forested mountain ridges slowly emerging through a sea of clouds"
            width="1900"
            height="1188"
            loading="lazy"
            style={{ y: paused ? 0 : y, scale: paused ? 1 : imageScale }}
          />
          <div className="perspective-shade" />
          <motion.div
            className="perspective-warmth"
            style={{ opacity: paused ? 0.3 : warmth }}
          />
          <div className="perspective-mist" aria-hidden="true" />
          <div className="perspective-top mono">
            <span>A FIELD NOTE / ON PAYING ATTENTION</span>
            <span>TAKE YOUR TIME.</span>
          </div>
          <div className="perspective-passages">
            <motion.div
              className="perspective-passage"
              data-passage="look"
              style={paused ? undefined : { opacity: firstOpacity, y: firstY }}
            >
              <span className="mono">01 / STEP OUTSIDE THE OBVIOUS</span>
              <h2 id="perspective-title">
                A different
                <br />
                <i>point of view.</i>
              </h2>
            </motion.div>
            <motion.div
              className="perspective-passage"
              data-passage="closer"
              style={
                paused ? undefined : { opacity: secondOpacity, y: secondY }
              }
            >
              <span className="mono">
                02 / A SMALL SHIFT IS SOMETIMES EVERYTHING
              </span>
              <p>
                The familiar.
                <br />
                <i>Seen differently.</i>
              </p>
            </motion.div>
            <motion.div
              className="perspective-passage"
              data-passage="carry"
              style={paused ? undefined : { opacity: lastOpacity, y: lastY }}
            >
              <span className="mono">03 / SOMETHING TO CARRY WITH YOU</span>
              <p>
                Some things deserve
                <br />
                <i>a second look.</i>
              </p>
              <span className="perspective-ending mono">
                END OF FIELD NOTE. KEEP THE FEELING.
              </span>
            </motion.div>
          </div>
          {!paused && (
            <div
              className="perspective-chapters"
              aria-label="Landscape story chapters"
            >
              {chapters.map((name, i) => (
                <button
                  className={chapter === i ? "is-active" : ""}
                  key={name}
                  onClick={() => goTo(i)}
                  aria-current={chapter === i ? "step" : undefined}
                  aria-label={`Read landscape chapter ${i + 1}: ${name}`}
                >
                  <span className="mono">0{i + 1}</span>
                  <span className="mono">{name}</span>
                </button>
              ))}
              <motion.span
                className="perspective-progress"
                style={{ scaleX: progress }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
