import { demoAsset } from "./catalog";
const files: Record<string, string> = {
  logo: "ic_netflix_n",
  wordmark: "ic_netflix_logo",
  home: "ic_nav_home",
  search: "ic_nav_search",
  clips: "ic_nav_clips",
  download: "ic_netflix_download_custom",
  cast: "ic_outline_cast",
  play: "ic_netflix_play",
  plus: "ic_netflix_plus",
};
export default function NativeIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  if (files[name])
    return (
      <img
        className={`native-icon ${className}`}
        src={demoAsset(`${files[name]}.svg`)}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    );
  return (
    <svg
      className={`native-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {name === "bell" ? (
        <>
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </>
      ) : name === "check" ? (
        <path
          d="m5 12 4 4L19 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : name === "close" ? (
        <path
          d="m6 6 12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : name === "info" ? (
        <>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path d="M12 10v7m0-11v1" stroke="currentColor" strokeWidth="1.8" />
        </>
      ) : name === "pause" ? (
        <>
          <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="4" />
        </>
      ) : (
        <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.7" />
      )}
    </svg>
  );
}
