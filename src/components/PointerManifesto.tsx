import { useEffect, useId, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { TextReveal, useMotionPaused } from "./Motion";
import { site, projects } from "../data/content";

export default function PointerManifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const paused = useMotionPaused();
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 240, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 240, damping: 30 });
  const radius = useSpring(0, { stiffness: 220, damping: 28 });
  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${smoothX}px ${smoothY}px, #000 99%, transparent 100%)`;
  useEffect(() => {
    const region = ref.current;
    const section = region?.closest("section");
    if (!region || !section) return;
    // Delegate to the section: its entrance mask can temporarily intercept
    // hit testing while the lens itself is being uncovered.
    const move = (event: PointerEvent) => {
      if (paused || expanded || event.pointerType === "touch") return;
      const rect = region.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        radius.set(0);
        return;
      }
      x.set(event.clientX - rect.left);
      y.set(event.clientY - rect.top);
      radius.set(window.innerWidth < 900 ? 120 : 185);
    };
    const leave = () => radius.set(0);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave);
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
    };
  }, [paused, expanded, x, y, radius]);
  return (
    <div className="pointer-manifesto">
      <div
        ref={ref}
        className={`lens-area ${expanded ? "is-uncovered" : ""}`}
        onPointerLeave={() => radius.set(0)}
      >
        <div className="lens-base" aria-hidden={expanded}>
          <TextReveal text={site.introduction} />
        </div>
        <motion.div
          id={id}
          className="lens-overlay"
          style={{
            maskImage: expanded ? "none" : mask,
            WebkitMaskImage: expanded ? "none" : mask,
          }}
          aria-hidden={!expanded}
        >
          <div className="lens-liquid" aria-hidden="true" />
          <div className="lens-project-world" aria-hidden="true">
            {projects.map((project) => (
              <img
                key={project.id}
                src={project.image}
                alt=""
                width="600"
                height="400"
                loading="lazy"
              />
            ))}
          </div>
          <span className="lens-caption mono">
            THE OTHER SIDE OF THE THOUGHT / REAL WORK
          </span>
          <p>
            Instinct
            <br />
            <i>over</i>
            <br />
            autopilot.
          </p>
          <span className="lens-foot mono">
            LOGIC MAKES IT WORK. FEELING MAKES IT MATTER.
          </span>
        </motion.div>
      </div>
      <div className="lens-controls mono">
        <span>
          THERE’S MORE UNDER THE SURFACE.
          <br />
          <span className="lens-pointer-hint">
            MOVE YOUR POINTER TO FIND IT.
          </span>
        </span>
        <button
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => {
            radius.set(0);
            setExpanded(!expanded);
          }}
        >
          {expanded ? "RETURN TO THE TEXT" : "REVEAL THE OTHER SIDE"}
        </button>
      </div>
    </div>
  );
}
