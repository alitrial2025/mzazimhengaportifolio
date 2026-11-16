# Mzazi — an interactive portfolio

An editorial creative developer/designer portfolio built with React, TypeScript, Vite, and Motion for React. The current collection contains clearly labeled visual concepts and placeholder photography, ready to replace with real projects.

## Develop

Node.js 22.12+ or 24 LTS and npm are required. This environment has Node 24.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Use the existing checkout. Cloud tasks are already isolated; do not create a Git worktree for setup.

## Content

Edit `src/data/content.ts` for the name, role, biography, email, and visual studies. Set `site.email` to a real address to enable the email link; until then, the contact action clearly explains that details are coming soon. Artwork lives in `src/components/Sculpture.tsx` and `src/App.tsx`; photography and local fonts live in `public/`.

This version includes a horizontal desktop gallery (vertical on mobile), scroll-linked word reveal, image zoom and mountain parallax, rotating CSS 3D sculpture, a color remix control, project dialogs, a ticker, a mobile menu, and persistent motion controls. System reduced motion disables parallax and pinned sequences. Following design feedback, navigation and accents use typography and linework rather than arrows and stars.

## Validate

```sh
npm test
```

This builds the **GitHub Pages** version and runs six Chromium browser checks against its repository subpath: assets and layout, real horizontal scroll behavior, keyboard dialogs, text/zoom/3D effects, mobile interactions, reduced motion, and manual motion preferences. The mobile/desktop checks share suites where appropriate. Screenshots are written to ignored `test-results/`.

The tests use `/usr/bin/chromium` when present, or Playwright's installed Chromium. On another machine, run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to a compatible browser path.

## GitHub Pages

```sh
npm run deploy
```

This builds with `/mzazimhengaportifolio/` as the base and pushes only the built files to `gh-pages`. The deploy script uses a temporary Git index, preserves the working checkout and staging area, retains deployment history, and never force-pushes. GitHub write access is required.

In [repository Pages settings](https://github.com/alitrial2025/mzazimhengaportifolio/settings/pages), choose **Deploy from a branch**, branch **gh-pages**, folder **/(root)**. Save. The intended public address is `https://alitrial2025.github.io/mzazimhengaportifolio/` once GitHub finishes deployment. Push source changes to `main` as usual and run `npm run deploy` to publish subsequent revisions.

To inspect the Pages build locally:

```sh
npm run build:pages
npm run preview:pages -- --port 4173 --strictPort
```

Open the repository subpath `/mzazimhengaportifolio/` on that local server. For a root-hosted production build, use `npm run build` and `npm run preview` instead.

## Asset sources

- Placeholder mountain photography: [Start Bootstrap Grayscale assets](https://github.com/StartBootstrap/startbootstrap-grayscale/tree/master/dist/assets/img). Used `bg-masthead.jpg` and `demo-image-01.jpg`.
- Placeholder product photography: [Start Bootstrap Agency assets](https://github.com/StartBootstrap/startbootstrap-agency/tree/master/dist/assets/img/portfolio). Used `2.jpg` and `6.jpg`. These are illustrative product studies, not client work or affiliations.
- The two source templates' MIT notices are retained under `docs/licenses/`. No template layouts or application code were reused.
- Space Grotesk and DM Mono are bundled from [Google Fonts](https://github.com/google/fonts) with their SIL Open Font License notices under `public/fonts/`.
- Orbital sculptures, wireframe experiment, and linework are created for this implementation.

There is no contact backend, analytics, external font service, or required secret for running the site. Publication uses the existing GitHub Git authentication.
