import { useEffect, useRef } from "react";

export type FieldMode = "Orbit" | "Wave" | "Scatter";
type Props = { mode: FieldMode; paused: boolean; pulse: number };
const noise = (n: number) => {
  const x = Math.sin(n * 127.1 + 42.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function ParticleField({ mode, paused, pulse }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ mode, paused, pulse });
  const update = useRef<() => void>(() => {});
  useEffect(() => {
    controls.current = { mode, paused, pulse };
    update.current();
  }, [mode, paused, pulse]);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const count = window.innerWidth < 650 ? 650 : 1100;
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count * 2);
    let width = 1,
      height = 1,
      visible = false,
      frame = 0,
      clock = 0,
      previous = performance.now();
    let held = false,
      pointerActive = false,
      pointerX = 0,
      pointerY = 0,
      lastPulse = pulse,
      burst = 0;
    let alive = true;
    const point = (i: number, kind: FieldMode, time: number) => {
      if (kind === "Wave") {
        const side = Math.ceil(Math.sqrt(count));
        const x = ((i % side) / (side - 1) - 0.5) * 530;
        const z = (Math.floor(i / side) / (side - 1) - 0.5) * 410;
        return [
          x,
          Math.sin(x * 0.013 + time * 0.5) * 58 +
            Math.cos(z * 0.017 + time * 0.3) * 28,
          z,
        ];
      }
      if (kind === "Scatter")
        return [
          (noise(i + 1) - 0.5) * 620,
          (noise(i + 32) - 0.5) * 410,
          (noise(i + 191) - 0.5) * 390,
        ];
      const angle = i * 2.399963;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const r = 205 + Math.sin(phi * 5 + time * 0.3) * 18;
      return [
        Math.cos(angle) * Math.sin(phi) * r,
        Math.cos(phi) * r,
        Math.sin(angle) * Math.sin(phi) * r,
      ];
    };
    for (let i = 0; i < count; i++) positions.set(point(i, mode, 0), i * 3);
    const draw = (now: number) => {
      frame = 0;
      if (!alive) return;
      const state = controls.current;
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!state.paused) clock += dt;
      if (lastPulse !== state.pulse) {
        lastPulse = state.pulse;
        burst = 1;
      }
      if (state.paused) burst = 0;
      else burst *= Math.exp(-dt * 2.5);
      ctx.clearRect(0, 0, width, height);
      const angle = state.paused ? 0.25 : clock * 0.075;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      const scale = Math.min(width / 740, height / 570, 1.3);
      const centerX = width * 0.5,
        centerY = height * 0.5;
      const projected: {
        x: number;
        y: number;
        z: number;
        radius: number;
        index: number;
      }[] = [];
      for (let i = 0; i < count; i++) {
        const target = point(i, state.mode, clock);
        const blend = state.paused ? 1 : 1 - Math.exp(-dt * 3.5);
        for (let a = 0; a < 3; a++)
          positions[i * 3 + a] += (target[a] - positions[i * 3 + a]) * blend;
        const x = positions[i * 3],
          y = positions[i * 3 + 1],
          z = positions[i * 3 + 2];
        const rx = x * cos - z * sin,
          rz = x * sin + z * cos;
        const ry = y * 0.9 - rz * 0.28,
          depth = y * 0.28 + rz * 0.9;
        const perspective = 650 / (650 + depth);
        let px = centerX + rx * scale * perspective,
          py = centerY + ry * scale * perspective;
        let ox = 0,
          oy = 0;
        if (pointerActive && !state.paused) {
          const dx = px - pointerX,
            dy = py - pointerY;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const force = Math.exp(
            (-distance * distance) / (held ? 110000 : 26000),
          );
          ox = held ? -dx * force * 0.78 : (dx / distance) * force * 70;
          oy = held ? -dy * force * 0.78 : (dy / distance) * force * 70;
        }
        offsets[i * 2] += (ox - offsets[i * 2]) * 0.12;
        offsets[i * 2 + 1] += (oy - offsets[i * 2 + 1]) * 0.12;
        if (state.paused) {
          offsets[i * 2] = 0;
          offsets[i * 2 + 1] = 0;
        }
        px += offsets[i * 2] + (px - centerX) * burst * 0.7;
        py += offsets[i * 2 + 1] + (py - centerY) * burst * 0.7;
        projected.push({
          x: px,
          y: py,
          z: depth,
          radius: Math.max(0.6, 1.3 * perspective * scale),
          index: i,
        });
      }
      // Fine connections describe the surface without a solid mesh.
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#423c7124";
      ctx.beginPath();
      for (let i = 0; i < projected.length - 13; i += 4) {
        const a = projected[i],
          b = projected[i + 13];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 70 * scale) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.stroke();
      projected.sort((a, b) => b.z - a.z);
      for (const p of projected) {
        const alpha = Math.max(0.16, Math.min(0.9, 0.5 - p.z / 650));
        ctx.fillStyle =
          p.index % 17 === 0
            ? `rgba(230,74,39,${alpha + 0.1})`
            : `rgba(41,36,65,${alpha})`;
        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.radius * (p.index % 17 === 0 ? 1.7 : 1),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      if (pointerActive && !state.paused) {
        ctx.strokeStyle = held ? "#e64a2788" : "#423c7144";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, held ? 32 : 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#e64a27";
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      canvas.dataset.interaction = held
        ? "gathering"
        : pointerActive
          ? "repelling"
          : "idle";
      canvas.dataset.fieldState = state.paused
        ? "still"
        : visible
          ? "active"
          : "resting";
      if (visible && !document.hidden && !state.paused)
        frame = requestAnimationFrame(draw);
    };
    const request = () => {
      if (alive && !frame && visible && !document.hidden) {
        previous = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    update.current = request;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      request();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        canvas.dataset.interaction = held
          ? "gathering"
          : pointerActive
            ? "repelling"
            : "idle";
        canvas.dataset.fieldState = "resting";
      }
    });
    intersection.observe(canvas);
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerActive = true;
    };
    const leave = () => {
      pointerActive = false;
      held = false;
    };
    const down = (event: PointerEvent) => {
      move(event);
      held = true;
    };
    const up = () => {
      held = false;
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    };
    canvas.addEventListener("pointermove", move, { passive: true });
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", down, { passive: true });
    canvas.addEventListener("pointercancel", leave);
    window.addEventListener("pointerup", up);
    document.addEventListener("visibilitychange", visibility);
    resize();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      update.current = () => {};
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointercancel", leave);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return <canvas ref={ref} className="particle-canvas" aria-hidden="true" />;
}
