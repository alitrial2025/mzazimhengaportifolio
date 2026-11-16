import { useEffect, useRef, useState } from "react";
import NativeHome from "./NativeHome";
import type { ScreenKind } from "./catalog";
import { asset } from "../data/content";
import "./native.css";

export default function NativeDemo({ kind }: { kind: ScreenKind }) {
  const holder = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [revision, setRevision] = useState(0);
  const width = kind === "tv" ? 960 : 412;
  const height = kind === "tv" ? 540 : 892;
  useEffect(() => {
    const element = holder.current!;
    const measure = () => setScale(element.clientWidth / width);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    document.title = `NetflixPro ${kind === "tv" ? "TV" : "Mobile"} — React UI preview | Mzazi`;
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => observer.disconnect();
  }, [kind, width]);
  return (
    <main className={`demo-page demo-page-${kind}`}>
      <header className="demo-header">
        <a className="demo-back" href={`${asset("")}#work`}>
          Back to portfolio
        </a>
        <span className="demo-project-name">
          NETFLIXPRO <b>{kind === "tv" ? "ANDROID TV" : "ANDROID MOBILE"}</b>
        </span>
        <button
          className="demo-reset"
          onClick={() => {
            try {
              localStorage.removeItem(`mzazi-native-demo-${kind}-home-list`);
              localStorage.removeItem(`mzazi-native-demo-${kind}-kids-list`);
            } catch {
              /* Reset the in-memory preview as well. */
            }
            setRevision((n) => n + 1);
          }}
        >
          Reset preview
        </button>
      </header>
      <div className="demo-intro">
        <div>
          <span>FROM KOTLIN / JETPACK COMPOSE</span>
          <h1>
            {kind === "tv"
              ? "Made for the big screen."
              : "A whole world, in your hand."}
          </h1>
        </div>
        <nav aria-label="Preview platform">
          <a
            href="#/preview/netflix-tv"
            aria-current={kind === "tv" ? "page" : undefined}
          >
            TV
          </a>
          <a
            href="#/preview/netflix-mobile"
            aria-current={kind === "mobile" ? "page" : undefined}
          >
            Mobile
          </a>
        </nav>
      </div>
      <div className={kind === "tv" ? "demo-tv-frame" : "demo-mobile-frame"}>
        <div
          className="demo-screen-holder"
          ref={holder}
          style={{ height: height * scale }}
        >
          <div
            className="demo-design-canvas"
            style={{ width, height, transform: `scale(${scale})` }}
          >
            <NativeHome
              key={`${kind}-${revision}`}
              kind={kind}
              width={width}
              height={height}
            />
          </div>
        </div>
      </div>
      <footer className="demo-footer">
        <p>
          Interactive React reconstruction of the original Kotlin interface.
          <br />
          Original artwork · Local demonstration catalog · No video streaming
        </p>
        <p>
          {kind === "tv"
            ? "Use arrow keys and Enter, or your mouse."
            : "Browse, filter, save a title, and try the navigation."}
        </p>
      </footer>
    </main>
  );
}
