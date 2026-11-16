export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

// Replace the visual studies here when the real projects are ready.
export const site = {
  name: "Mzazi",
  portrait: asset("images/WhatsApp Image 2026-11-16 at 12.08.32.jpeg"),
  role: "Creative developer & designer",
  email: null as string | null,
  introduction:
    "I like the space between thoughtful design and unexpected interaction. A place where a small idea becomes something you can feel.",
};

export type Project = {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  color: string;
  image?: string;
  alt: string;
  kind: "image" | "sculpture" | "type";
};

export const projects: Project[] = [
  {
    id: "off-script",
    number: "01",
    name: "Off Script",
    category: "Art direction · Digital experience",
    description:
      "An exploration of contrast, rhythm, and the beauty of going a little off script. A visual concept for an independent culture journal.",
    color: "#b9c5a9",
    image: asset("images/ridge.jpg"),
    alt: "Black and white mountain landscape in a green editorial composition",
    kind: "image",
  },
  {
    id: "in-good-form",
    number: "02",
    name: "In Good Form",
    category: "3D exploration · Motion study",
    description:
      "A playful study of shape and balance. Soft forms, sharp ideas, and an object that seems to have a life of its own.",
    color: "#f57b53",
    alt: "Original sculptural orange orbital object",
    kind: "sculpture",
  },
  {
    id: "ordinary",
    number: "03",
    name: "Extra / Ordinary",
    category: "Typography · Identity exploration",
    description:
      "Finding an unexpected voice in everyday things. An expressive typographic identity built around scale, repetition, and a hint of mischief.",
    color: "#c0bcdb",
    alt: "Expressive black typography on a lavender background",
    kind: "type",
  },
];

export const capabilities = [
  {
    number: "01",
    title: "Thoughtful by design.",
    tags: "Art direction / Visual identity / Interface design",
    detail:
      "Clear ideas. A distinct point of view. Digital spaces that feel like they belong to you.",
  },
  {
    number: "02",
    title: "Built to be felt.",
    tags: "Creative development / Interaction / Motion",
    detail:
      "From the first scroll to the smallest hover, turning a considered design into a living experience.",
  },
  {
    number: "03",
    title: "Curious, always.",
    tags: "Prototyping / Creative coding / Experiments",
    detail:
      "Making room for the unexpected. Exploring, breaking things, and finding something worth keeping.",
  },
];
