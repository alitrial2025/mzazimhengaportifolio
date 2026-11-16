import { useId } from "react";

export function Sculpture({
  className = "",
  variant = "orange",
}: {
  className?: string;
  variant?: "orange" | "silver";
}) {
  const id = useId().replace(/:/g, "");
  const silver = variant === "silver";
  return (
    <svg
      viewBox="0 0 500 500"
      className={`sculpture ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-ring`}
          x1="100"
          y1="100"
          x2="370"
          y2="420"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={silver ? "#fff" : "#fff0d6"} />
          <stop offset=".22" stopColor={silver ? "#a4a6a0" : "#ff9868"} />
          <stop offset=".46" stopColor={silver ? "#f7f6ef" : "#ff491c"} />
          <stop offset=".68" stopColor={silver ? "#393b36" : "#ad2508"} />
          <stop offset=".85" stopColor={silver ? "#bfc0b7" : "#ef6030"} />
          <stop offset="1" stopColor={silver ? "#f0eee5" : "#ffc4a0"} />
        </linearGradient>
        <radialGradient id={`${id}-orb`} cx=".3" cy=".2" r=".8">
          <stop stopColor={silver ? "#fff" : "#ffe0b4"} />
          <stop offset=".4" stopColor={silver ? "#d2d3c9" : "#ff7548"} />
          <stop offset=".78" stopColor={silver ? "#65675e" : "#c32b0d"} />
          <stop offset="1" stopColor={silver ? "#2d3028" : "#791d0e"} />
        </radialGradient>
        <filter
          id={`${id}-shadow`}
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodOpacity=".18" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <ellipse
          cx="250"
          cy="250"
          rx="177"
          ry="91"
          transform="rotate(-35 250 250)"
          stroke={`url(#${id}-ring)`}
          strokeWidth="43"
        />
        <circle cx="250" cy="250" r="77" fill={`url(#${id}-orb)`} />
        <ellipse
          cx="250"
          cy="250"
          rx="175"
          ry="92"
          transform="rotate(63 250 250)"
          stroke={`url(#${id}-ring)`}
          strokeWidth="43"
        />
        <path
          d="M130 330c35 9 89 0 139-25"
          stroke={`url(#${id}-ring)`}
          strokeWidth="42"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
