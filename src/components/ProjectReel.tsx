import { useState } from "react";
import {
  motion,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { projects, type Project } from "../data/content";
import { useMotionPaused } from "./Motion";

function ReelFrame({
  project,
  index,
  progress,
  onSelect,
}: {
  project: Project;
  index: number;
  progress: MotionValue<number>;
  onSelect: (project: Project) => void;
}) {
  const paused = useMotionPaused();
  const y = useTransform(
    progress,
    [0, 0.3, 1],
    [190 + index * 45, 25, -35 - index * 16],
  );
  const rotate = useTransform(
    progress,
    [0, 0.4, 1],
    [[-14, 12, -6, 10][index], [-7, 7, -3, 5][index], [-3, 3, 0, 0][index]],
  );
  return (
    <motion.button
      className={`hero-reel-frame hero-reel-frame-${index + 1}`}
      style={{
        y: paused ? 0 : y,
        rotate: paused ? [-7, 7, -3, 5][index] : rotate,
      }}
      onClick={() => onSelect(project)}
      aria-label={`Open ${project.name} from hero`}
    >
      <span className="reel-frame-bar mono">
        <span>
          {project.number} / {project.format}
        </span>
        <span>{project.name}</span>
      </span>
      <img
        src={project.image}
        alt={project.alt}
        width={index === 3 ? 412 : 1440}
        height={index === 3 ? 892 : 950}
      />
      <span className="reel-frame-action mono">EXPLORE THE PROJECT</span>
    </motion.button>
  );
}

export default function ProjectReel({
  progress,
  onSelect,
}: {
  progress: MotionValue<number>;
  onSelect: (project: Project) => void;
}) {
  const paused = useMotionPaused();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(progress, "change", (value) => setVisible(value > 0.2));
  const opacity = useTransform(progress, [0, 0.12, 0.32, 1], [0, 0, 1, 1]);
  const pointerEvents = useTransform(progress, (value) =>
    value > 0.2 ? "auto" : "none",
  );
  return (
    <>
      <motion.div
        className="hero-project-reel"
        style={{
          opacity: paused ? 0 : opacity,
          pointerEvents: paused ? "none" : pointerEvents,
        }}
        aria-hidden={paused || !visible}
        inert={paused || !visible}
      >
        <span className="hero-reel-heading mono">
          A FEW THINGS I’VE BROUGHT INTO THE WORLD.
        </span>
        {projects.map((project, index) => (
          <ReelFrame
            key={project.id}
            project={project}
            index={index}
            progress={progress}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
      <div
        className="hero-project-index"
        aria-label="Projects in this portfolio"
      >
        <span className="mono">FOUR PROJECTS. ONE CURIOUS MIND.</span>
        <div>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelect(project)}
              aria-label={`View ${project.name} from hero`}
            >
              <img src={project.image} alt="" width="92" height="58" />
              <span className="mono">{project.number}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
