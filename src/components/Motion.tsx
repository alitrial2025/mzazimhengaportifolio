import { createContext, useContext, useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export const MotionPreference = createContext(false);
export const useMotionPaused = () => useContext(MotionPreference);

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const paused = useMotionPaused();
  return (
    <motion.div
      className={className}
      initial={paused ? false : { opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const paused = useMotionPaused();
  return (
    <motion.span style={{ opacity: paused ? 1 : opacity }}>{word} </motion.span>
  );
}

export function TextReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "end 45%"],
  });
  const words = text.split(" ");
  return (
    <p ref={ref} className="reveal-copy" aria-label={text}>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Word
            key={i}
            word={word}
            range={[i / words.length, (i + 1) / words.length]}
            progress={scrollYProgress}
          />
        ))}
      </span>
    </p>
  );
}
