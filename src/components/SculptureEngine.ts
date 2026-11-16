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

export type SceneControls = { paused: boolean; frozen: boolean };
// Shared by the worker and the compatibility path. Geometry, shader, pixel
// ratio, lighting, pointer response, and timing match the original renderer.
export function createSculptureEngine(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  onLost: () => void,
  onFirstFrame: () => void = () => {},
  onFrame: () => void = () => {},
) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
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
  const time = { value: 0 },
    scroll = { value: 0 };
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
  const pointer = new Vector2(),
    smoothPointer = new Vector2(),
    neutralPointer = new Vector2();
  let controls: SceneControls = { paused: false, frozen: false };
  let progress = 0,
    baseScale = 1,
    held = false,
    visible = true,
    alive = true;
  let frame = 0,
    previous = performance.now(),
    elapsed = 0;
  let sceneWidth = 0,
    sceneHeight = 0;
  let firstFrame = true;
  const schedule = (callback: FrameRequestCallback): number =>
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame(callback)
      : Number(setTimeout(() => callback(performance.now()), 1000 / 60));
  const cancel = (id: number) => {
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
  };
  const render = (now: number) => {
    frame = 0;
    if (!alive) return;
    const delta = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (!controls.paused && !controls.frozen)
      elapsed += delta * (held ? 0.08 : 1);
    const p = controls.paused ? 0 : progress;
    time.value = elapsed;
    scroll.value = p;
    smoothPointer.lerp(controls.paused ? neutralPointer : pointer, 0.06);
    sculpture.rotation.set(
      0.35 + smoothPointer.y * 0.3 + p * 0.9,
      -0.5 + elapsed * 0.13 + smoothPointer.x * 0.5 + p * 2.2,
      -0.35 + p * 0.6,
    );
    sculpture.scale.setScalar(baseScale * (1 + p * 0.6));
    sculpture.position.y = -p * 0.4;
    renderer.render(scene, camera);
    if (firstFrame) {
      // Keep the loading artwork until the first full-quality frame is ready.
      // This synchronization happens once, on the rendering thread.
      renderer.getContext().finish();
      firstFrame = false;
      onFirstFrame();
    }
    onFrame();
    if (visible && !controls.paused && !controls.frozen)
      frame = schedule(render);
  };
  const request = () => {
    if (!frame && alive && visible) {
      previous = performance.now();
      frame = schedule(render);
    }
  };
  const lost = (event: Event) => {
    event.preventDefault();
    cancel(frame);
    frame = 0;
    alive = false;
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);
  return {
    resize(width: number, height: number, ratio: number) {
      if (!width || !height || (width === sceneWidth && height === sceneHeight))
        return;
      sceneWidth = width;
      sceneHeight = height;
      renderer.setPixelRatio(Math.min(ratio, 1.6));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      baseScale = width < 650 ? 0.58 : 0.98;
      sculpture.position.x = width < 650 ? 0 : 0.65;
      request();
    },
    setControls(next: SceneControls) {
      controls = next;
      request();
    },
    setProgress(next: number) {
      progress = next;
      if (!controls.paused) request();
    },
    setPointer(x: number, y: number) {
      pointer.set(x, y);
    },
    setHeld(next: boolean) {
      held = next;
    },
    setVisible(next: boolean) {
      visible = next;
      if (next) request();
      else {
        cancel(frame);
        frame = 0;
      }
    },
    dispose() {
      alive = false;
      cancel(frame);
      canvas.removeEventListener("webglcontextlost", lost);
      geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
export type SculptureEngine = ReturnType<typeof createSculptureEngine>;
