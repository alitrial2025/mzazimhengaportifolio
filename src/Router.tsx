import { lazy, Suspense, useEffect, useState } from "react";
import App from "./App";
const NativeDemo = lazy(() => import("./demos/NativeDemo"));
export default function Router() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const change = () => setHash(window.location.hash);
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const preview =
    hash === "#/preview/netflix-tv"
      ? "tv"
      : hash === "#/preview/netflix-mobile"
        ? "mobile"
        : null;
  useEffect(() => {
    if (preview) return;
    document.title = "Mzazi® — Beyond the expected";
    const target = hash.slice(1);
    if (["work", "about", "play", "contact", "home"].includes(target)) {
      requestAnimationFrame(() =>
        document
          .getElementById(target)
          ?.scrollIntoView({ behavior: "instant" }),
      );
    }
  }, [hash, preview]);
  return preview ? (
    <Suspense
      fallback={
        <div className="preview-loading" role="status">
          Opening the interface…
        </div>
      }
    >
      <NativeDemo key={preview} kind={preview} />
    </Suspense>
  ) : (
    <App />
  );
}
