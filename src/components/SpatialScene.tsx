import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Sculpture } from "./Sculpture";

type Props = {
  progress: MotionValue<number>;
  paused: boolean;
  frozen: boolean;
};

export default function SpatialScene({ progress, paused, frozen }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef({ paused, frozen });
  const refresh = useRef<() => void>(() => {});
  const [state, setState] = useState("loading");

  useEffect(() => {
    controls.current = { paused, frozen };
    refresh.current();
  }, [paused, frozen]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setState("fallback");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    element.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 0, 9.6);
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    const geometry = new TorusKnotGeometry(1.4, 0.49, 220, 40, 2, 3);
    const material = new MeshPhysicalMaterial({
      color: new Color("#dadfd0"),
      metalness: 1,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 1,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [180, 520],
      envMapIntensity: 1.7,
    });
    const time = { value: 0 };
    const scroll = { value: progress.get() };
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uSculptureTime = time;
      shader.uniforms.uSculptureScroll = scroll;
      shader.vertexShader = `uniform float uSculptureTime; uniform float uSculptureScroll;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        vec3 transformed = vec3(position);
        transformed += normal * sin(position.y * 2.5 + uSculptureTime * .5) * .055;
        float twist = uSculptureScroll * .7 + sin(position.y * .5 + uSculptureTime * .15) * .11;
        transformed.xz = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * transformed.xz;
      `,
      );
    };
    const sculpture = new Mesh(geometry, material);
    sculpture.rotation.set(0.35, -0.5, -0.35);
    scene.add(sculpture, new AmbientLight(0xffffff, 0.5));
    const key = new DirectionalLight(0xe3ffa0, 5);
    key.position.set(-3, 4, 5);
    const rim = new DirectionalLight(0xa395ff, 7);
    rim.position.set(4, -1, 2);
    const warm = new DirectionalLight(0xff6239, 3);
    warm.position.set(-4, -3, 1);
    scene.add(key, rim, warm);

    const pointer = new Vector2();
    const smoothPointer = new Vector2();
    let visible = true;
    let alive = true;
    let held = false;
    let frame = 0;
    let previous = performance.now();
    let elapsed = 0;
    let baseScale = 1;
    const render = (now: number) => {
      frame = 0;
      if (!alive) return;
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const stopped = controls.current.paused || controls.current.frozen;
      if (!stopped) elapsed += delta * (held ? 0.08 : 1);
      const p = controls.current.paused ? 0 : progress.get();
      time.value = elapsed;
      scroll.value = p;
      smoothPointer.lerp(
        controls.current.paused ? new Vector2() : pointer,
        0.06,
      );
      sculpture.rotation.set(
        0.35 + smoothPointer.y * 0.3 + p * 0.9,
        -0.5 + elapsed * 0.13 + smoothPointer.x * 0.5 + p * 2.2,
        -0.35 + p * 0.6,
      );
      sculpture.scale.setScalar(baseScale * (1 + p * 0.6));
      sculpture.position.y = -p * 0.4;
      renderer.render(scene, camera);
      if (
        visible &&
        !document.hidden &&
        !controls.current.paused &&
        !controls.current.frozen
      )
        frame = requestAnimationFrame(render);
    };
    const requestFrame = () => {
      if (!frame && alive && visible && !document.hidden) {
        previous = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    refresh.current = requestFrame;
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      baseScale = width < 650 ? 0.58 : 0.98;
      sculpture.position.x = width < 650 ? 0 : 0.65;
      requestFrame();
    };
    const onPointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      );
    };
    const onLeave = () => {
      pointer.set(0, 0);
      held = false;
    };
    const onDown = () => {
      held = true;
    };
    const onUp = () => {
      held = false;
    };
    const surface = element.closest(".hero-stage") ?? element;
    surface.addEventListener("pointermove", onPointer as EventListener, {
      passive: true,
    });
    surface.addEventListener("pointerleave", onLeave);
    surface.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestFrame();
    });
    intersectionObserver.observe(element);
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestFrame();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = progress.on("change", () => {
      if (!controls.current.paused) requestFrame();
    });
    const lostContext = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      alive = false;
      setState("fallback");
    };
    renderer.domElement.addEventListener("webglcontextlost", lostContext);
    resize();
    setState("ready");
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      refresh.current = () => {};
      unsubscribe();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      surface.removeEventListener("pointermove", onPointer as EventListener);
      surface.removeEventListener("pointerleave", onLeave);
      surface.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("webglcontextlost", lostContext);
      geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return (
    <div className="spatial-scene" data-scene-state={state} aria-hidden="true">
      <div className="scene-canvas" ref={host} />
      <div className="spatial-fallback">
        <Sculpture variant="silver" />
      </div>
    </div>
  );
}
