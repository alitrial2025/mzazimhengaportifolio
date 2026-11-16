import { useEffect, useId } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useMotionPaused } from "./Motion";
import { site } from "../data/content";

const settle = {
  type: "spring" as const,
  stiffness: 75,
  damping: 10,
  mass: 1.1,
};

export default function LanyardBadge() {
  const paused = useMotionPaused();
  const id = useId().replace(/:/g, "");
  const x = useMotionValue(0);
  const y = useMotionValue(paused ? 0 : -700);
  const rotate = useTransform(
    () => -7 + x.get() * 0.08 + Math.max(-100, Math.min(100, y.get())) * 0.04,
  );
  const rope = useTransform(() => {
    const endX = 170 + x.get();
    const endY = 205 + y.get();
    return `M170 -30 C170 ${endY * 0.35} ${endX - x.get() * 0.25} ${endY * 0.65} ${endX} ${endY}`;
  });
  useEffect(() => {
    if (paused) {
      x.stop();
      y.stop();
      x.set(0);
      y.set(0);
      return;
    }
    const drop = animate(y, 0, { ...settle, delay: 0.55 });
    return () => drop.stop();
  }, [paused, x, y]);
  const release = () => {
    animate(x, 0, settle);
    animate(y, 0, settle);
  };
  const swing = () => {
    if (paused) return;
    animate(x, 65, {
      duration: 0.12,
      onComplete: () => {
        animate(x, 0, settle);
      },
    });
  };
  return (
    <div className="lanyard-badge" data-motion={paused ? "still" : "spring"}>
      <svg
        className="badge-rope"
        viewBox="0 0 340 720"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-cord`} x1="0" x2="1">
            <stop stopColor="#171e19" />
            <stop offset=".3" stopColor="#84927a" />
            <stop offset=".6" stopColor="#d0d6ba" />
            <stop offset="1" stopColor="#454d40" />
          </linearGradient>
        </defs>
        <motion.path
          d={rope}
          stroke="#0008"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <motion.path
          d={rope}
          stroke={`url(#${id}-cord)`}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <motion.path
          d={rope}
          stroke="#111b10"
          strokeWidth="7"
          strokeDasharray="1.3 4"
        />
        <motion.path
          d={rope}
          stroke="#e2ebc8"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity=".65"
        />
      </svg>
      <motion.div
        className="badge-card-motion"
        drag={!paused}
        dragMomentum={false}
        dragElastic={0.18}
        dragConstraints={{ left: -115, right: 90, top: -75, bottom: 100 }}
        style={{ x, y, rotate }}
        onDragStart={() => {
          x.stop();
          y.stop();
        }}
        onDragEnd={release}
        role="button"
        tabIndex={0}
        aria-label={`Drag or swing ${site.name}'s identity badge`}
        aria-describedby="badge-instructions"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            swing();
          }
        }}
      >
        <div className="badge-clip" aria-hidden="true">
          <span />
          <i />
        </div>
        <div className="badge-sleeve">
          <div className="id-card">
            <div className="id-card-top mono">
              <span>{site.name.toLowerCase()} /®</span>
              <span>ALL ACCESS</span>
            </div>
            <div className="badge-photo">
              <img
                src={site.portrait}
                alt={`${site.name}, creative developer and designer`}
                width="1200"
                height="1600"
                draggable={false}
              />
              <span className="photo-registration" aria-hidden="true" />
            </div>
            <div className="badge-identity">
              <strong>{site.name.toUpperCase()}</strong>
              <span className="mono">DESIGNER & DEVELOPER</span>
            </div>
            <div className="badge-card-foot">
              <span className="badge-barcode" aria-hidden="true" />
              <span className="mono">
                NO. 001
                <br />
                INDEPENDENT BY NATURE
              </span>
            </div>
          </div>
          <div className="badge-gloss" aria-hidden="true" />
        </div>
      </motion.div>
      <span id="badge-instructions" className="badge-instructions mono">
        {paused ? "THE PERSON BEHIND THE PIXELS" : "DRAG THE BADGE. LET IT GO."}
      </span>
    </div>
  );
}
