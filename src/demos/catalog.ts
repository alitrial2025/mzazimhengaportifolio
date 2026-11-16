import { asset } from "../data/content";
export const demoAsset = (name: string) => asset(`projects/netflix/${name}`);
export type ScreenKind = "tv" | "mobile";
export type Media = {
  id: string;
  title: string;
  year: number;
  type: "Series" | "Film";
  genres: string[];
  description: string;
  poster: string;
  backdrop: string;
  logo?: string;
  age: string;
  original?: boolean;
  match: number;
};
const media = (
  id: string,
  title: string,
  year: number,
  type: Media["type"],
  genres: string[],
  description: string,
  match = 96,
): Media => ({
  id,
  title,
  year,
  type,
  genres,
  description,
  match,
  age: type === "Series" ? "16+" : "13+",
  poster: demoAsset(`${id}-poster.jpg`),
  backdrop: demoAsset(`${id}-backdrop.jpg`),
});
export const catalog: Media[] = [
  {
    ...media(
      "squid-game",
      "Squid Game",
      2021,
      "Series",
      ["Thriller", "Drama", "Korean"],
      "Hundreds of cash-strapped players accept a strange invitation to compete in children’s games. Inside, a tempting prize awaits — with deadly high stakes.",
    ),
    poster: demoAsset("squid-game.jpg"),
    backdrop: demoAsset("squid-game-backdrop.jpg"),
    logo: demoAsset("squid-game-logo.png"),
    original: true,
    age: "18+",
  },
  {
    ...media(
      "stranger-things",
      "Stranger Things",
      2016,
      "Series",
      ["Sci-Fi", "Drama", "Thriller"],
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    ),
    original: true,
  },
  media(
    "breaking-bad",
    "Breaking Bad",
    2008,
    "Series",
    ["Crime", "Drama", "Thriller"],
    "A high school chemistry teacher facing a devastating diagnosis turns to an unexpected new life.",
  ),
  media(
    "inception",
    "Inception",
    2010,
    "Film",
    ["Sci-Fi", "Action", "Thriller"],
    "A skilled thief who steals secrets from dreams is offered a chance at redemption: plant an idea instead of stealing one.",
  ),
  media(
    "interstellar",
    "Interstellar",
    2014,
    "Film",
    ["Sci-Fi", "Drama", "Adventure"],
    "A team of explorers travels beyond this galaxy to discover whether humanity has a future among the stars.",
  ),
  media(
    "blade-runner-2049",
    "Blade Runner 2049",
    2017,
    "Film",
    ["Sci-Fi", "Drama", "Thriller"],
    "A new blade runner unearths a long-buried secret that leads him on a quest to find a former blade runner.",
  ),
  media(
    "the-dark-knight",
    "The Dark Knight",
    2008,
    "Film",
    ["Action", "Crime", "Drama"],
    "Batman faces a criminal mastermind who plunges Gotham into chaos and tests everything its heroes believe.",
  ),
  media(
    "the-matrix",
    "The Matrix",
    1999,
    "Film",
    ["Sci-Fi", "Action"],
    "A computer hacker discovers that the world he knows may be only the surface of a much stranger reality.",
  ),
  media(
    "game-of-thrones",
    "Game of Thrones",
    2011,
    "Series",
    ["Drama", "Fantasy", "Adventure"],
    "Noble families fight for control of the Iron Throne while an ancient threat rises beyond the wall.",
  ),
  media(
    "house-of-the-dragon",
    "House of the Dragon",
    2022,
    "Series",
    ["Fantasy", "Drama"],
    "The story of House Targaryen, two centuries before the events of Game of Thrones.",
  ),
  {
    ...media(
      "the-crown",
      "The Crown",
      2016,
      "Series",
      ["Drama", "History"],
      "Political rivalries and personal relationships shape the reign of Queen Elizabeth II.",
    ),
    original: true,
  },
  media(
    "fight-club",
    "Fight Club",
    1999,
    "Film",
    ["Drama", "Thriller"],
    "An insomniac and a charismatic stranger start an underground club that grows into something neither expected.",
  ),
  media(
    "pulp-fiction",
    "Pulp Fiction",
    1994,
    "Film",
    ["Crime", "Drama"],
    "Interconnected stories follow an ensemble of colorful characters through Los Angeles.",
  ),
];
export const genres = [
  "Action",
  "Drama",
  "Comedies",
  "Romance",
  "Sci-Fi",
  "Animation",
  "Kids & Family",
];
export const games = [
  {
    title: "Hades",
    image: demoAsset("img_game_hades_1787645991083.jpg"),
    description: "Action • Adventure",
  },
  {
    title: "Monument Valley",
    image: demoAsset("img_game_monument_valley_1787646003139.jpg"),
    description: "Puzzle • Relaxing",
  },
];
