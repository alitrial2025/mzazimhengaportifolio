import { createSculptureEngine, type SculptureEngine } from "./SculptureEngine";

let engine: SculptureEngine | undefined;
self.onmessage = (event: MessageEvent) => {
  const data = event.data;
  try {
    switch (data.type) {
      case "init":
        if (typeof requestAnimationFrame !== "function") {
          self.postMessage({ type: "fallback" });
          return;
        }
        const canvas = new OffscreenCanvas(1, 1);
        engine = createSculptureEngine(
          canvas,
          () => self.postMessage({ type: "fallback" }),
          () => {},
          () => {
            const bitmap = canvas.transferToImageBitmap();
            self.postMessage({ type: "frame", bitmap }, { transfer: [bitmap] });
          },
        );
        engine.setControls(data.controls);
        engine.setProgress(data.progress);
        engine.resize(data.width, data.height, data.ratio);
        break;
      case "resize":
        engine?.resize(data.width, data.height, data.ratio);
        break;
      case "controls":
        engine?.setControls(data.controls);
        break;
      case "progress":
        engine?.setProgress(data.value);
        break;
      case "pointer":
        engine?.setPointer(data.x, data.y);
        break;
      case "held":
        engine?.setHeld(data.value);
        break;
      case "visible":
        engine?.setVisible(data.value);
        break;
      case "dispose":
        engine?.dispose();
        self.close();
        break;
    }
  } catch {
    self.postMessage({ type: "fallback" });
  }
};
