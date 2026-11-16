import { lazy, Suspense, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionPaused } from "./Motion";
import { Sculpture } from "./Sculpture";
import { site, projects, type Project } from "../data/content";
import LanyardBadge from "./LanyardBadge";
import ProjectReel from "./ProjectReel";

const SpatialScene = lazy(() => import("./SpatialScene"));

export default function ImmersiveHero({
  onSelect,
}: {
  onSelect: (project: Project) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const paused = useMotionPaused();
  const [frozen, setFrozen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const titleX = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const subX = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const openingOpacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.5, 1],
    [1, 1, 0.13, 0.08],
  );
  return (
    <section
      id="home"
      className="immersive-hero"
      ref={ref}
      aria-labelledby="hero-heading"
    >
      <div className="hero-stage">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-coordinate mono">
          <span>{site.role}</span>
          <span>AN INDEPENDENT PERSPECTIVE — 2026</span>
        </div>
        <motion.div
          className="hero-first-act"
          style={{ opacity: paused ? 1 : openingOpacity }}
        >
          <motion.div
            className="hero-backtype"
            style={{ x: paused ? 0 : titleX }}
          >
            <h1 id="hero-heading" aria-label="Beyond the expected.">
              <span aria-hidden="true">BEYOND</span>
            </h1>
          </motion.div>
          <motion.div
            className="hero-backtype hero-type-outline"
            style={{ x: paused ? 0 : titleX }}
            aria-hidden="true"
          >
            <span>BEYOND</span>
          </motion.div>
          <Suspense
            fallback={
              <div className="spatial-loading" aria-hidden="true">
                <Sculpture variant="silver" />
              </div>
            }
          >
            <SpatialScene
              progress={scrollYProgress}
              paused={paused}
              frozen={frozen}
            />
          </Suspense>
          <motion.div
            className="hero-fronttype"
            style={{ x: paused ? 0 : subX, opacity: paused ? 1 : opacity }}
            aria-hidden="true"
          >
            <span>the expected.</span>
            <span className="hero-period">(®)</span>
          </motion.div>
        </motion.div>
        <LanyardBadge />
        <ProjectReel progress={scrollYProgress} onSelect={onSelect} />
        <motion.div
          className="hero-bottom-info"
          style={{ opacity: paused ? 1 : opacity }}
        >
          <p>
            Design that makes you look.
            <br />
            Code that makes you stay.
          </p>
          <div className="hero-interaction-note mono">
            <span>MOVE TO EXPLORE. HOLD TO SLOW DOWN.</span>
            <button
              aria-pressed={frozen}
              onClick={() => setFrozen(!frozen)}
              disabled={paused}
            >
              {paused
                ? "SCULPTURE AT REST"
                : frozen
                  ? "RESUME SCULPTURE"
                  : "PAUSE SCULPTURE"}
            </button>
          </div>
          <a href="#work" className="hero-discover mono">
            <span>EXPLORE THE SELECTED WORK</span>
            <span>01 — {String(projects.length).padStart(2, "0")}</span>
          </a>
        </motion.div>
        <div className="hero-scroll-rail" aria-hidden="true">
          <motion.span style={{ scaleX: paused ? 1 : lineScale }} />
        </div>
        <span className="hero-edition mono" aria-hidden="true">
          SCROLL TO CHANGE YOUR PERSPECTIVE
        </span>
      </div>
    </section>
  );
}
