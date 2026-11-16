import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import type { SculptureEngine } from "./SculptureEngine";
import { Sculpture } from "./Sculpture";

type Props = {
  progress: MotionValue<number>;
  paused: boolean;
  frozen: boolean;
};
export default function SpatialScene({ progress, paused, frozen }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef({ paused, frozen });
  const send = useRef<(message: Record<string, unknown>) => void>(() => {});
  const [state, setState] = useState("loading");
  const [thread, setThread] = useState("starting");
  useEffect(() => {
    controls.current = { paused, frozen };
    send.current({ type: "controls", controls: controls.current });
  }, [paused, frozen]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let alive = true,
      worker: Worker | undefined,
      engine: SculptureEngine | undefined;
    let bounds = element.getBoundingClientRect(),
      inView = true,
      usingMain = false;
    let canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = Math.round(bounds.width * Math.min(devicePixelRatio, 1.6));
    canvas.height = Math.round(bounds.height * Math.min(devicePixelRatio, 1.6));
    element.appendChild(canvas);
    const visible = () => inView && !document.hidden;
    const main = async () => {
      if (!alive || usingMain) return;
      usingMain = true;
      setState("loading");
      worker?.terminate();
      worker = undefined;
      // Replace the presentation canvas before creating a WebGL context
      // for browsers that cannot render or present worker frames.
      canvas.remove();
      canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      element.appendChild(canvas);
      try {
        const { createSculptureEngine } = await import("./SculptureEngine");
        if (!alive) return;
        engine = createSculptureEngine(
          canvas,
          () => setState("fallback"),
          () => {
            if (alive) {
              setThread("main");
              setState("ready");
            }
          },
        );
        engine.setControls(controls.current);
        engine.setProgress(progress.get());
        engine.resize(bounds.width, bounds.height, devicePixelRatio);
        engine.setVisible(visible());
        send.current = (data) => {
          switch (data.type) {
            case "controls":
              engine?.setControls(controls.current);
              break;
            case "progress":
              engine?.setProgress(Number(data.value));
              break;
            case "pointer":
              engine?.setPointer(Number(data.x), Number(data.y));
              break;
            case "held":
              engine?.setHeld(Boolean(data.value));
              break;
            case "visible":
              engine?.setVisible(Boolean(data.value));
              break;
            case "resize":
              engine?.resize(bounds.width, bounds.height, devicePixelRatio);
              break;
          }
        };
      } catch {
        if (alive) setState("fallback");
      }
    };
    if (
      typeof Worker !== "undefined" &&
      typeof canvas.transferControlToOffscreen === "function"
    ) {
      try {
        worker = new Worker(new URL("./sculpture.worker.ts", import.meta.url), {
          type: "module",
        });
        const presentation = canvas.getContext("bitmaprenderer");
        if (!presentation)
          throw new Error("Bitmap presentation is unavailable");
        let firstFrame = true;
        worker.onmessage = (event) => {
          if (!alive || usingMain) {
            event.data.bitmap?.close();
            return;
          }
          if (event.data.type === "frame") {
            const bitmap = event.data.bitmap as ImageBitmap;
            if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
            if (canvas.height !== bitmap.height) canvas.height = bitmap.height;
            presentation.transferFromImageBitmap(bitmap);
            if (firstFrame) {
              firstFrame = false;
              setThread("worker");
              setState("ready");
              worker?.postMessage({ type: "visible", value: visible() });
            }
          } else if (event.data.type === "fallback") void main();
        };
        worker.onerror = (event) => {
          event.preventDefault();
          void main();
        };
        send.current = (data) => worker?.postMessage(data);
        worker.postMessage({
          type: "init",
          controls: controls.current,
          progress: progress.get(),
          width: bounds.width,
          height: bounds.height,
          ratio: devicePixelRatio,
        });
      } catch {
        void main();
      }
    } else void main();
    const resize = () => {
      bounds = element.getBoundingClientRect();
      send.current({
        type: "resize",
        width: bounds.width,
        height: bounds.height,
        ratio: devicePixelRatio,
      });
    };
    const onPointer = (event: PointerEvent) =>
      send.current({
        type: "pointer",
        x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      });
    const onLeave = () => {
      send.current({ type: "pointer", x: 0, y: 0 });
      send.current({ type: "held", value: false });
    };
    const onDown = () => send.current({ type: "held", value: true });
    const onUp = () => send.current({ type: "held", value: false });
    const surface = element.closest(".hero-stage") ?? element;
    surface.addEventListener("pointermove", onPointer as EventListener, {
      passive: true,
    });
    surface.addEventListener("pointerleave", onLeave);
    surface.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      send.current({ type: "visible", value: visible() });
    });
    intersection.observe(element);
    const onVisibility = () =>
      send.current({ type: "visible", value: visible() });
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = progress.on("change", (value) =>
      send.current({ type: "progress", value }),
    );
    return () => {
      alive = false;
      unsubscribe();
      resizeObserver.disconnect();
      intersection.disconnect();
      surface.removeEventListener("pointermove", onPointer as EventListener);
      surface.removeEventListener("pointerleave", onLeave);
      surface.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
      send.current = () => {};
      worker?.terminate();
      engine?.dispose();
      canvas.remove();
    };
  }, [progress]);
  return (
    <div
      className="spatial-scene"
      data-scene-state={state}
      data-render-thread={thread}
      aria-hidden="true"
    >
      <div className="scene-canvas" ref={host} />
      <div className="spatial-fallback">
        <Sculpture variant="silver" />
      </div>
    </div>
  );
}
