import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  catalog,
  demoAsset,
  games,
  genres,
  type Media,
  type ScreenKind,
} from "./catalog";
import NativeIcon from "./NativeIcon";

type Overlay =
  | { type: "media" | "player"; movie: Media }
  | { type: "profiles" | "genres" | "cast" | "downloads" | "notifications" }
  | null;
const readList = (key: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export default function NativeHome({
  kind,
  width,
  height,
}: {
  kind: ScreenKind;
  width: number;
  height: number;
}) {
  const [tab, setTab] = useState("Home");
  const [category, setCategory] = useState("All");
  const [genre, setGenre] = useState<string | null>(null);
  const [hero, setHero] = useState(catalog[0]);
  const [profile, setProfile] = useState("Home");
  const [query, setQuery] = useState("");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const key = `mzazi-native-demo-${kind}-${profile.toLowerCase()}-list`;
  const [saved, setSaved] = useState<string[]>(() => readList(key));
  const [downloads, setDownloads] = useState<string[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);
  const [playing, setPlaying] = useState(true);
  const [heroFocused, setHeroFocused] = useState(false);
  const [position, setPosition] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobile = kind === "mobile";
  const kids = profile === "Kids";
  const isSearch = tab === "Search";
  const listView = tab === "My Netflix";
  const type = mobile
    ? category
    : tab === "Series" || tab === "Films"
      ? tab
      : category;
  const available = catalog.filter(
    (movie) =>
      !kids ||
      movie.genres.includes("Animation") ||
      movie.genres.includes("Family"),
  );
  const filtered = available.filter(
    (m) =>
      (type !== "Series" || m.type === "Series") &&
      (type !== "Films" || m.type === "Film") &&
      (!genre || m.genres.includes(genre)) &&
      (!isSearch ||
        `${m.title} ${m.genres.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!listView || saved.includes(m.id)),
  );
  const toggleSaved = (movie: Media) =>
    setSaved((current) => {
      const next = current.includes(movie.id)
        ? current.filter((id) => id !== movie.id)
        : [...current, movie.id];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* Local demo remains usable. */
      }
      return next;
    });
  const switchTab = (name: string) => {
    setTab(name);
    setGenre(null);
    setCategory("All");
    setQuery("");
    body.current?.scrollTo({ top: 0, behavior: "instant" });
    if (navTimer.current) clearTimeout(navTimer.current);
  };
  const open = (value: Overlay) => {
    if (!overlay) previousFocus.current = document.activeElement as HTMLElement;
    setOverlay(value);
    if (value?.type === "player") {
      setPosition(0);
      setPlaying(true);
    }
  };
  const close = () => {
    setOverlay(null);
    requestAnimationFrame(() => previousFocus.current?.focus());
  };
  useEffect(() => {
    setSaved(readList(key));
  }, [key]);
  useEffect(
    () => () => {
      if (navTimer.current) clearTimeout(navTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!overlay) return;
    overlayRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [overlay]);
  useEffect(() => {
    if (overlay?.type !== "player" || !playing) return;
    const timer = setInterval(() => setPosition((p) => (p + 1) % 120), 1000);
    return () => clearInterval(timer);
  }, [overlay, playing]);
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (overlay) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
      if (event.key === "Tab") {
        const buttons = [
          ...overlayRef.current!.querySelectorAll<HTMLElement>(
            "button, input, a",
          ),
        ];
        const index = buttons.indexOf(document.activeElement as HTMLElement);
        if (
          (!event.shiftKey && index === buttons.length - 1) ||
          (event.shiftKey && index === 0)
        ) {
          event.preventDefault();
          buttons[event.shiftKey ? buttons.length - 1 : 0]?.focus();
        }
      }
      return;
    }
    if (
      mobile ||
      event.target instanceof HTMLInputElement ||
      !event.key.startsWith("Arrow")
    )
      return;
    const current = event.target as HTMLElement;
    const row = current.closest<HTMLElement>("[data-native-row]");
    if (!row) return;
    const rows = [
      ...event.currentTarget.querySelectorAll<HTMLElement>("[data-native-row]"),
    ];
    const rowIndex = rows.indexOf(row);
    const buttons = [
      ...row.querySelectorAll<HTMLElement>("button:not(:disabled)"),
    ];
    const index = buttons.indexOf(current.closest("button")!);
    let target: HTMLElement | undefined;
    if (event.key === "ArrowRight")
      target = buttons[Math.min(buttons.length - 1, index + 1)];
    if (event.key === "ArrowLeft") target = buttons[Math.max(0, index - 1)];
    if (event.key === "ArrowDown")
      target =
        rows[rowIndex + 1]?.querySelectorAll<HTMLElement>("button")[
          rowIndex === 0
            ? 0
            : Math.min(
                Math.max(0, index),
                rows[rowIndex + 1].querySelectorAll("button").length - 1,
              )
        ];
    if (event.key === "ArrowUp")
      target = rows[rowIndex - 1]?.querySelectorAll<HTMLElement>("button")[0];
    if (target) {
      event.preventDefault();
      target.focus();
      target.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    }
  };
  const setFilter = (name: string) => {
    setCategory((c) => (c === name ? "All" : name));
    setGenre(null);
    setHero(
      catalog.find((m) =>
        name !== "Films" ? m.type === "Series" : m.type === "Film",
      ) || catalog[0],
    );
    body.current?.scrollTo({ top: 0, behavior: "instant" });
  };
  const currentHero =
    genre || type === "Films" || type === "Series" ? filtered[0] || hero : hero;
  const row = (
    title: string,
    items: Media[],
    options: { progress?: boolean; ranked?: boolean } = {},
  ) =>
    items.length > 0 && (
      <section
        className={`native-media-row ${options.progress ? "continue-row" : ""}`}
        key={title}
        aria-label={title}
      >
        <h2>{title}</h2>
        <div className="native-media-strip" data-native-row>
          {items.map((movie, i) => (
            <button
              className={`native-media-card ${options.ranked ? "is-ranked" : ""}`}
              key={movie.id}
              onClick={() => open({ type: "media", movie })}
              aria-label={`Details for ${movie.title}`}
              onFocus={() => {
                if (!mobile) setHero(movie);
              }}
            >
              {options.ranked && (
                <span className="native-rank" aria-hidden="true">
                  {i + 1}
                </span>
              )}
              <img
                src={movie.poster}
                alt={movie.title}
                loading="lazy"
                draggable={false}
              />
              {movie.original && (
                <NativeIcon name="logo" className="native-card-logo" />
              )}
              {options.progress && (
                <>
                  <span className="native-continue-play">
                    <NativeIcon name="play" />
                  </span>
                  <span className="native-watch-progress">
                    <i style={{ width: `${35 + i * 18}%` }} />
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>
    );
  return (
    <div
      className={`native-app native-${kind} ${kids ? "native-kids" : ""} ${heroFocused ? "tv-hero-focused" : ""}`}
      style={{ width, height }}
      onKeyDown={onKey}
      onFocusCapture={(event) => {
        if (!mobile)
          setHeroFocused(
            !!(event.target as HTMLElement).closest(".native-hero"),
          );
      }}
      data-screen={kind}
    >
      <div className="native-app-content" inert={!!overlay}>
        {!mobile ? (
          <header className="tv-topbar" data-native-row>
            <button
              className="native-profile-button"
              onClick={() => open({ type: "profiles" })}
              aria-label="Choose profile"
            >
              <img
                src={demoAsset(kids ? "profile-kids.svg" : "profile-home.svg")}
                alt={profile}
              />
              <NativeIcon name="chevron" />
            </button>
            <nav aria-label="TV navigation">
              {["Search", "Home", "Series", "Films", "My Netflix"].map(
                (name) => (
                  <button
                    className={tab === name ? "is-selected" : ""}
                    key={name}
                    onClick={() => switchTab(name)}
                    onFocus={() => {
                      if (navTimer.current) clearTimeout(navTimer.current);
                      navTimer.current = setTimeout(() => switchTab(name), 220);
                    }}
                    aria-label={name}
                    aria-pressed={tab === name}
                  >
                    {name === "Search" ? <NativeIcon name="search" /> : name}
                  </button>
                ),
              )}
            </nav>
            <NativeIcon name="logo" className="tv-brand" />
          </header>
        ) : null}
        <div className="native-scroll" ref={body}>
          {mobile && (
            <header className="mobile-topbar">
              <div className="mobile-brand-row">
                <button
                  className="mobile-brand glass"
                  onClick={() => switchTab("Home")}
                  aria-label="NetflixPro home"
                >
                  <NativeIcon name="logo" />
                  <span>
                    {isSearch
                      ? "Search"
                      : listView
                        ? "My Netflix"
                        : category === "All"
                          ? "Home"
                          : category}
                  </span>
                </button>
                <div className="mobile-utilities glass">
                  <button
                    onClick={() => open({ type: "cast" })}
                    aria-label="Cast"
                  >
                    <NativeIcon name="cast" />
                  </button>
                  <button
                    onClick={() => open({ type: "downloads" })}
                    aria-label="Downloads"
                  >
                    <NativeIcon name="download" />
                  </button>
                  <button
                    onClick={() => open({ type: "notifications" })}
                    aria-label="Notifications"
                  >
                    <NativeIcon name="bell" />
                    <i />
                  </button>
                </div>
              </div>
              {!isSearch && !listView && (
                <nav className="mobile-filter-pills" aria-label="Filter titles">
                  {["Series", "Films", "Games", "New & Hot"].map((name) => (
                    <button
                      key={name}
                      aria-pressed={category === name}
                      className={category === name ? "is-selected" : ""}
                      onClick={() =>
                        name === "New & Hot"
                          ? open({ type: "notifications" })
                          : setFilter(name)
                      }
                    >
                      {name}
                    </button>
                  ))}
                  <button
                    onClick={() => open({ type: "genres" })}
                    aria-label="Choose category"
                  >
                    {genre || "Categories"}
                    <NativeIcon name="chevron" />
                  </button>
                </nav>
              )}
            </header>
          )}
          {isSearch ? (
            <div className="native-search">
              <label>
                <NativeIcon name="search" />
                <input
                  type="search"
                  placeholder="Search titles, genres…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search catalog"
                />
              </label>
              <h2>
                {query ? `Results for “${query}”` : "Explore your next watch"}
              </h2>
              <div className="native-search-results" data-native-row>
                {filtered.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => open({ type: "media", movie })}
                  >
                    <img src={movie.backdrop} alt="" />
                    <span>{movie.title}</span>
                    <NativeIcon name="play" />
                  </button>
                ))}
              </div>
              {!filtered.length && (
                <div className="native-empty">
                  <h3>No matching titles</h3>
                  <p>Try another title or genre.</p>
                  <button onClick={() => setQuery("")}>Clear search</button>
                </div>
              )}
            </div>
          ) : listView ? (
            <div className="native-my-list">
              <h1>My Netflix</h1>
              <p>Your list, your next watch.</p>
              {row("My List", filtered)}
              {!filtered.length && (
                <div className="native-empty">
                  <NativeIcon name="plus" />
                  <h3>Your list is waiting</h3>
                  <p>Add a title from Home to see it here.</p>
                  <button onClick={() => switchTab("Home")}>
                    Explore titles
                  </button>
                </div>
              )}
              {row("Continue Watching", available.slice(0, 3), {
                progress: true,
              })}
            </div>
          ) : category === "Games" ? (
            <div className="native-games">
              <h1>Mobile Games</h1>
              <p>More stories. More ways to play.</p>
              {games
                .filter((game) => !kids || game.title === "Monument Valley")
                .map((game) => (
                  <article key={game.title}>
                    <img src={game.image} alt={game.title} />
                    <h2>{game.title}</h2>
                    <p>{game.description}</p>
                    <button onClick={() => open({ type: "notifications" })}>
                      Game information
                    </button>
                  </article>
                ))}
            </div>
          ) : (
            <>
              {!!filtered.length && (
                <section
                  className="native-hero"
                  style={{
                    height: mobile
                      ? Math.max(320, (height - 104) * 0.85 - 130)
                      : height * 0.76,
                  }}
                  aria-label={`Featured: ${currentHero.title}`}
                >
                  <button
                    className="native-hero-image"
                    onClick={() => open({ type: "media", movie: currentHero })}
                    aria-label={`Details for featured ${currentHero.title}`}
                    tabIndex={-1}
                  >
                    <img
                      src={mobile ? currentHero.poster : currentHero.backdrop}
                      alt=""
                      draggable={false}
                    />
                  </button>
                  <div className="native-hero-shade" />
                  {mobile && currentHero.original && (
                    <NativeIcon name="logo" className="mobile-hero-n" />
                  )}
                  <div className="native-hero-copy">
                    {mobile ? null : currentHero.logo ? (
                      <img
                        className="native-title-logo"
                        src={currentHero.logo}
                        alt={currentHero.title}
                      />
                    ) : (
                      <h1>{currentHero.title}</h1>
                    )}
                    {!mobile && (
                      <p className="native-meta">
                        {currentHero.type} <span>•</span> {currentHero.year}{" "}
                        <b>{currentHero.age}</b>
                      </p>
                    )}
                    {mobile ? (
                      <p className="native-hero-genres">
                        {currentHero.genres.slice(0, 3).join(" • ")}
                      </p>
                    ) : (
                      <p className="native-hero-summary">
                        {currentHero.description}
                      </p>
                    )}
                    <div className="native-hero-actions" data-native-row>
                      <button
                        className="native-play"
                        onClick={() =>
                          open({ type: "player", movie: currentHero })
                        }
                      >
                        <NativeIcon name="play" />
                        Play
                      </button>
                      {mobile ? (
                        <button
                          className="native-list-toggle"
                          onClick={() => toggleSaved(currentHero)}
                          aria-pressed={saved.includes(currentHero.id)}
                        >
                          <NativeIcon
                            name={
                              saved.includes(currentHero.id) ? "check" : "plus"
                            }
                          />
                          My List
                        </button>
                      ) : (
                        <button
                          className="native-info"
                          onClick={() =>
                            open({ type: "media", movie: currentHero })
                          }
                        >
                          <NativeIcon name="info" />
                          More Info
                        </button>
                      )}
                    </div>
                  </div>
                  {!mobile && (
                    <div className="tv-callouts">
                      <span>Recently added</span>
                      <span>Picked for you</span>
                    </div>
                  )}
                </section>
              )}
              {!mobile && (
                <nav
                  className="tv-genres"
                  aria-label="Browse genres"
                  data-native-row
                >
                  {genres.map((name) => (
                    <button
                      key={name}
                      className={genre === name ? "is-selected" : ""}
                      onClick={() => {
                        setGenre((g) => (g === name ? null : name));
                        body.current?.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </nav>
              )}
              {genre && filtered.length > 0 && (
                <div className="native-filter-label">
                  <span>{genre}</span>
                  <button onClick={() => setGenre(null)}>Clear filter</button>
                </div>
              )}
              {!filtered.length ? (
                <div className="native-empty">
                  <h3>No matching titles</h3>
                  <p>
                    No titles match this category in the demonstration catalog.
                  </p>
                  <button
                    onClick={() => {
                      setGenre(null);
                      setCategory("All");
                    }}
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                <>
                  {row(
                    `Continue Watching for ${profile}`,
                    filtered.slice(0, 3),
                    { progress: true },
                  )}
                  {row("Your next watch", [...filtered].reverse())}
                  {row("Top 10 Today", filtered.slice(0, 10), { ranked: true })}
                  {row(
                    "Only on NetflixPro",
                    filtered.filter((movie) => movie.original),
                  )}
                  {row(
                    "Action & Sci-Fi Thrillers",
                    filtered.filter(
                      (movie) =>
                        movie.genres.includes("Action") ||
                        movie.genres.includes("Sci-Fi"),
                    ),
                  )}
                  {row(
                    "Critically Acclaimed Dramas",
                    filtered.filter((movie) => movie.genres.includes("Drama")),
                  )}
                </>
              )}
            </>
          )}
        </div>
        {mobile && (
          <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            <div className="glass main-navigation">
              {["Home", "Search"].map((name) => (
                <button
                  key={name}
                  onClick={() => switchTab(name)}
                  className={tab === name ? "is-selected" : ""}
                  aria-pressed={tab === name}
                >
                  <NativeIcon name={name.toLowerCase()} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
            <button
              className={`glass mobile-profile-nav ${listView ? "is-selected" : ""}`}
              onClick={() => switchTab("My Netflix")}
              onContextMenu={(event) => {
                event.preventDefault();
                open({ type: "profiles" });
              }}
            >
              <img
                src={demoAsset(kids ? "profile-kids.svg" : "profile-home.svg")}
                alt=""
              />
              <span>My Netflix</span>
            </button>
          </nav>
        )}
      </div>
      {overlay && (
        <div
          className={`native-overlay native-overlay-${overlay.type}`}
          role="dialog"
          aria-modal="true"
          aria-label={
            overlay.type === "media" || overlay.type === "player"
              ? overlay.movie.title
              : overlay.type
          }
          ref={overlayRef}
        >
          <button
            className="native-overlay-close"
            onClick={close}
            aria-label="Close app panel"
          >
            <NativeIcon name="close" />
          </button>
          {overlay.type === "media" && (
            <>
              <img
                className="native-detail-art"
                src={overlay.movie.backdrop}
                alt=""
              />
              <div className="native-detail-copy">
                <h2>{overlay.movie.title}</h2>
                <p className="native-detail-meta">
                  <span>{overlay.movie.match}% Match</span> {overlay.movie.year}{" "}
                  <b>{overlay.movie.age}</b> {overlay.movie.type}
                </p>
                <p>{overlay.movie.description}</p>
                <div className="native-detail-actions">
                  <button
                    className="native-play"
                    onClick={() =>
                      open({ type: "player", movie: overlay.movie })
                    }
                  >
                    <NativeIcon name="play" />
                    Play
                  </button>
                  <button
                    className="native-round-action"
                    onClick={() => toggleSaved(overlay.movie)}
                    aria-label={
                      saved.includes(overlay.movie.id)
                        ? "Remove from My List"
                        : "Add to My List"
                    }
                    aria-pressed={saved.includes(overlay.movie.id)}
                  >
                    <NativeIcon
                      name={saved.includes(overlay.movie.id) ? "check" : "plus"}
                    />
                  </button>
                  <button
                    className="native-round-action"
                    onClick={() =>
                      setDownloads((ids) =>
                        ids.includes(overlay.movie.id)
                          ? ids.filter((id) => id !== overlay.movie.id)
                          : [...ids, overlay.movie.id],
                      )
                    }
                    aria-label="Toggle demo download"
                    aria-pressed={downloads.includes(overlay.movie.id)}
                  >
                    <NativeIcon
                      name={
                        downloads.includes(overlay.movie.id)
                          ? "check"
                          : "download"
                      }
                    />
                  </button>
                </div>
                <p className="native-tags">
                  {overlay.movie.genres.join(" • ")}
                </p>
                <div className="native-more-like">
                  <h3>More Like This</h3>
                  {catalog
                    .filter(
                      (m) =>
                        m.id !== overlay.movie.id &&
                        m.type === overlay.movie.type,
                    )
                    .slice(0, 3)
                    .map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => setOverlay({ type: "media", movie })}
                      >
                        <img src={movie.poster} alt={movie.title} />
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
          {overlay.type === "player" && (
            <div
              className="native-player"
              style={{
                backgroundImage: `linear-gradient(0deg,#000c,transparent 80%),url("${overlay.movie.backdrop}")`,
              }}
            >
              <span className="native-player-notice">
                UI playback preview · No video stream
              </span>
              <h2>{overlay.movie.title}</h2>
              <button
                className="native-player-toggle"
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? "Pause preview" : "Resume preview"}
              >
                <NativeIcon name={playing ? "pause" : "play"} />
              </button>
              <div className="native-player-controls">
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  aria-label="Preview playback position"
                />
                <span>
                  {Math.floor(position / 60)}:
                  {String(position % 60).padStart(2, "0")} / 2:00
                </span>
              </div>
            </div>
          )}
          {overlay.type === "profiles" && (
            <div className="native-panel-copy">
              <h2>Who’s watching?</h2>
              <div className="native-profile-options">
                {["Home", "Kids"].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setProfile(name);
                      setGenre(name === "Kids" ? "Animation" : null);
                      setTab("Home");
                      close();
                    }}
                  >
                    <img
                      src={demoAsset(
                        name === "Kids"
                          ? "profile-kids.svg"
                          : "profile-home.svg",
                      )}
                      alt=""
                    />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
              <p>Each profile keeps its own perspective.</p>
            </div>
          )}
          {overlay.type === "genres" && (
            <div className="native-panel-copy">
              <h2>Categories</h2>
              {["All Categories", ...genres, "Crime", "Thriller", "Korean"].map(
                (name) => (
                  <button
                    className="native-category-option"
                    key={name}
                    onClick={() => {
                      setGenre(name === "All Categories" ? null : name);
                      close();
                      body.current?.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    {name}
                  </button>
                ),
              )}
            </div>
          )}
          {overlay.type === "cast" && (
            <div className="native-panel-copy">
              <NativeIcon name="cast" />
              <h2>Connect to a device</h2>
              <p>No cast device is connected to this browser preview.</p>
              <button onClick={close}>Keep watching here</button>
            </div>
          )}
          {overlay.type === "downloads" && (
            <div className="native-panel-copy">
              <h2>Downloads</h2>
              <p>Saved interface previews. No video files are downloaded.</p>
              {downloads.length ? (
                downloads.map((id) => {
                  const movie = catalog.find((m) => m.id === id)!;
                  return (
                    <button
                      className="native-download-item"
                      key={id}
                      onClick={() => open({ type: "media", movie })}
                    >
                      <img src={movie.poster} alt="" />
                      <span>{movie.title}</span>
                    </button>
                  );
                })
              ) : (
                <p>Open a title and tap its download action to add it here.</p>
              )}
            </div>
          )}
          {overlay.type === "notifications" && (
            <div className="native-panel-copy">
              <h2>New & Hot</h2>
              <p>Keep your next watch close.</p>
              {catalog.slice(0, 4).map((movie) => (
                <div className="native-notification" key={movie.id}>
                  <img src={movie.backdrop} alt="" />
                  <div>
                    <strong>{movie.title}</strong>
                    <button
                      onClick={() =>
                        setReminders((ids) =>
                          ids.includes(movie.id)
                            ? ids.filter((id) => id !== movie.id)
                            : [...ids, movie.id],
                        )
                      }
                    >
                      {reminders.includes(movie.id)
                        ? "Reminder set"
                        : "Remind me"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
