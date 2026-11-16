export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

// Portfolio identity and real project information.
export const site = {
  name: "Mzazi",
  portrait: asset("images/WhatsApp Image 2026-11-16 at 12.08.32.jpeg"),
  role: "Creative developer & designer",
  email: null as string | null,
  introduction:
    "I build digital places with a point of view. A bicycle store that moves. A legal practice with clarity. A cinematic world, from your living room to your pocket.",
};

export type Project = {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  color: string;
  image: string;
  alt: string;
  kind: "website" | "android-tv" | "android-mobile";
  format: string;
  stack: string[];
  highlights: string[];
  url?: string;
  source?: string;
  preview?: string;
  note: string;
};

export const projects: Project[] = [
  {
    id: "jeffs-concepts",
    number: "01",
    name: "Jeff’s Concepts",
    category: "E-commerce · Interactive 3D",
    description:
      "A cycling storefront built around the joy of finding your next ride. Product discovery, a configurable 3D bicycle studio, and a considered shopping experience for a Nairobi-based bicycle business.",
    color: "#d9d9ca",
    image: asset("projects/sites/jeffs.jpg"),
    alt: "Jeff’s Concepts storefront with More ride. Less routine. and the ivory and red all-road bicycle",
    kind: "website",
    format: "WEB",
    stack: ["React", "TypeScript", "Three.js", "E-commerce"],
    highlights: [
      "Interactive bicycle studio",
      "Product and accessory browsing",
      "Responsive storefront",
    ],
    url: "https://jeffsconcepts.co.ke/",
    source: "https://github.com/alitrial2025/jeffs-concepts",
    note: "Preview captured from the latest storefront source, including the More ride. Less routine. homepage and original bicycle artwork.",
  },
  {
    id: "rk-njogu",
    number: "02",
    name: "R. K. Njogu Advocates",
    category: "Legal practice · Editorial website",
    description:
      "A clear, composed digital presence for R. K. Njogu & Company Advocates. An editorial visual system brings practice areas, legal resources, and the firm’s approach into one accessible experience.",
    color: "#bdcbb3",
    image: asset("projects/sites/rk-njogu.jpg"),
    alt: "R. K. Njogu & Company Advocates website with Legal solutions. Made practical. and a legal office photograph",
    kind: "website",
    format: "WEB",
    stack: ["React", "TypeScript", "Responsive design"],
    highlights: [
      "Practice-area navigation",
      "Client resources and preparation tools",
      "Responsive editorial layout",
    ],
    url: "https://alitrial2025.github.io/rk-njogu-advocates/",
    source: "https://github.com/alitrial2025/rk-njogu-advocates",
    note: "Website preview captured from the original React source and local project assets.",
  },
  {
    id: "netflix-tv",
    number: "03",
    name: "NetflixPro / TV",
    category: "Android TV · Kotlin & Jetpack Compose",
    description:
      "A cinematic, remote-first home experience for Android TV. Billboard artwork, ambient backgrounds, focused navigation, genre discovery, and expanding catalog rows are translated from the original Kotlin implementation into an interactive React preview.",
    color: "#253a3c",
    image: asset("projects/netflix/preview-tv.png"),
    alt: "React reconstruction of the NetflixPro Android TV home screen",
    kind: "android-tv",
    format: "TV",
    stack: ["Kotlin", "Jetpack Compose", "Android TV", "React preview"],
    highlights: [
      "D-pad and keyboard navigation",
      "Cinematic billboard and catalog rails",
      "Profiles, search, and saved titles",
    ],
    source: "https://github.com/alitrial2025/netflix-tv",
    preview: "#/preview/netflix-tv",
    note: "The original project is a native Kotlin app. This browser version reconstructs its home-screen UI with the original artwork and a local demo catalog; it does not stream video or connect to native backend services.",
  },
  {
    id: "netflix-mobile",
    number: "04",
    name: "NetflixPro / Mobile",
    category: "Android · Kotlin & Jetpack Compose",
    description:
      "A mobile viewing experience with poster-led discovery, ambient color, glass navigation, category filters, and a personal watchlist. Rebuilt in React from the supplied Kotlin screen and its original shared components.",
    color: "#8d8c72",
    image: asset("projects/netflix/preview-mobile.png"),
    alt: "React reconstruction of the NetflixPro Android mobile home screen",
    kind: "android-mobile",
    format: "APP",
    stack: ["Kotlin", "Jetpack Compose", "Android", "React preview"],
    highlights: [
      "Poster-led home and category filtering",
      "Floating glass navigation",
      "Search, saved titles, and detail panels",
    ],
    source: "https://github.com/alitrial2025/netflix-mobile",
    preview: "#/preview/netflix-mobile",
    note: "An interactive React reconstruction of the native home-screen UI. Original artwork is bundled locally. Catalog data and playback controls are demonstrative, not a connection to the Android app’s services.",
  },
];

export const capabilities = [
  {
    number: "01",
    title: "Thoughtful by design.",
    tags: "Art direction / Visual identity / Interface design",
    detail:
      "The quiet typography of a legal practice. The warmth of a cycling store. Finding the visual language that belongs to each project.",
  },
  {
    number: "02",
    title: "Built to be felt.",
    tags: "Creative development / Interaction / Motion",
    detail:
      "A bicycle that responds to you. A TV interface that follows the remote. The small interactions that turn a considered design into a living experience.",
  },
  {
    number: "03",
    title: "Curious, always.",
    tags: "Prototyping / Creative coding / Experiments",
    detail:
      "From a configurable 3D ride to a cinematic interface in your pocket. Making room to explore, test an idea, and find something worth keeping.",
  },
];
