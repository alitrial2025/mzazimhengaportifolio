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
    const mobile = window.innerWidth < 650;
    const count = mobile ? 650 : 1100;
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count * 2);
    const orbit = new Float64Array(count * 4);
    const scatter = new Float64Array(count * 3);
    const wave = new Float64Array(count * 2);
    const px = new Float64Array(count),
      py = new Float64Array(count);
    const radii = new Float64Array(count),
      depths = new Float64Array(count);
    const depthOrder = Uint16Array.from({ length: count }, (_, index) => index);
    const side = Math.ceil(Math.sqrt(count));
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      orbit.set(
        [
          Math.cos(angle) * Math.sin(phi),
          Math.cos(phi),
          Math.sin(angle) * Math.sin(phi),
          phi * 5,
        ],
        i * 4,
      );
      scatter.set(
        [
          (noise(i + 1) - 0.5) * 620,
          (noise(i + 32) - 0.5) * 410,
          (noise(i + 191) - 0.5) * 390,
        ],
        i * 3,
      );
      wave.set(
        [
          ((i % side) / (side - 1) - 0.5) * 530,
          (Math.floor(i / side) / (side - 1) - 0.5) * 410,
        ],
        i * 2,
      );
      positions.set(
        [orbit[i * 4] * 205, orbit[i * 4 + 1] * 205, orbit[i * 4 + 2] * 205],
        i * 3,
      );
    }
    canvas.dataset.particleCount = String(count);
    let width = 1,
      height = 1,
      visible = false,
      frame = 0,
      clock = 0;
    let previous = performance.now(),
      alive = true,
      initialized = false;
    let held = false,
      pointerActive = false,
      pointerX = 0,
      pointerY = 0;
    let lastPulse = controls.current.pulse,
      burst = 0;
    const mark = (key: string, value: string) => {
      if (canvas.dataset[key] !== value) canvas.dataset[key] = value;
    };
    const draw = (now: number) => {
      frame = 0;
      if (!alive || !visible || document.hidden) return;
      const state = controls.current;
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!state.paused) clock += dt;
      if (lastPulse !== state.pulse) {
        lastPulse = state.pulse;
        burst = 1;
      }
      burst = state.paused ? 0 : burst * Math.exp(-dt * 2.5);
      const blend = state.paused || !initialized ? 1 : 1 - Math.exp(-dt * 3.5);
      const offsetBlend = 0.12;
      const angle = state.paused ? 0.25 : clock * 0.075;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      const scale = Math.min(width / 740, height / 570, 1.3);
      const centerX = width * 0.5,
        centerY = height * 0.5;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < count; i++) {
        const a = i * 3,
          b = i * 2,
          c = i * 4;
        let tx: number, ty: number, tz: number;
        if (state.mode === "Wave") {
          tx = wave[b];
          tz = wave[b + 1];
          ty =
            Math.sin(tx * 0.013 + clock * 0.5) * 58 +
            Math.cos(tz * 0.017 + clock * 0.3) * 28;
        } else if (state.mode === "Scatter") {
          tx = scatter[a];
          ty = scatter[a + 1];
          tz = scatter[a + 2];
        } else {
          const r = 205 + Math.sin(orbit[c + 3] + clock * 0.3) * 18;
          tx = orbit[c] * r;
          ty = orbit[c + 1] * r;
          tz = orbit[c + 2] * r;
        }
        positions[a] += (tx - positions[a]) * blend;
        positions[a + 1] += (ty - positions[a + 1]) * blend;
        positions[a + 2] += (tz - positions[a + 2]) * blend;
        const x = positions[a],
          y = positions[a + 1],
          z = positions[a + 2];
        const rx = x * cos - z * sin,
          rz = x * sin + z * cos;
        const ry = y * 0.9 - rz * 0.28,
          depth = y * 0.28 + rz * 0.9;
        const perspective = 650 / (650 + depth);
        let sx = centerX + rx * scale * perspective,
          sy = centerY + ry * scale * perspective;
        let ox = 0,
          oy = 0;
        if (pointerActive && !state.paused) {
          const dx = sx - pointerX,
            dy = sy - pointerY;
          const distance2 = dx * dx + dy * dy;
          const force = Math.exp(-distance2 / (held ? 110000 : 26000));
          const inverse = 1 / Math.max(1, Math.sqrt(distance2));
          ox = held ? -dx * force * 0.78 : dx * inverse * force * 70;
          oy = held ? -dy * force * 0.78 : dy * inverse * force * 70;
        }
        offsets[b] = state.paused
          ? 0
          : offsets[b] + (ox - offsets[b]) * offsetBlend;
        offsets[b + 1] = state.paused
          ? 0
          : offsets[b + 1] + (oy - offsets[b + 1]) * offsetBlend;
        sx += offsets[b] + (sx - centerX) * burst * 0.7;
        sy += offsets[b + 1] + (sy - centerY) * burst * 0.7;
        px[i] = sx;
        py[i] = sy;
        radii[i] =
          Math.max(0.6, 1.3 * perspective * scale) * (i % 17 === 0 ? 1.7 : 1);
        depths[i] = depth;
      }
      initialized = true;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#423c7124";
      ctx.beginPath();
      for (let i = 0; i < count - 13; i += 4) {
        const j = i + 13,
          dx = px[i] - px[j],
          dy = py[i] - py[j];
        if (dx * dx + dy * dy < 4900 * scale * scale) {
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
        }
      }
      ctx.stroke();
      // Preserve exact depth order, particle size and transparency. Reuse
      // typed buffers and avoid allocating/sorting a new object per particle.
      depthOrder.sort((a, b) => depths[b] - depths[a]);
      let lastAccent = -1;
      for (const i of depthOrder) {
        const accent = Number(i % 17 === 0);
        if (accent !== lastAccent) {
          ctx.fillStyle = accent ? "#e64a27" : "#292441";
          lastAccent = accent;
        }
        ctx.globalAlpha =
          Math.max(0.16, Math.min(0.9, 0.5 - depths[i] / 650)) +
          (accent ? 0.1 : 0);
        ctx.beginPath();
        ctx.arc(px[i], py[i], radii[i], 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
      mark(
        "interaction",
        held ? "gathering" : pointerActive ? "repelling" : "idle",
      );
      mark("fieldState", state.paused ? "still" : "active");
      if (!state.paused) frame = requestAnimationFrame(draw);
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
      if (!width || !height) return;
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
        held = false;
        pointerActive = false;
        mark("interaction", "idle");
        mark("fieldState", "resting");
      }
    });
    intersection.observe(canvas);
    const move = (event: PointerEvent) => {
      pointerX = event.offsetX;
      pointerY = event.offsetY;
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
