# Mzazi — an interactive portfolio

An editorial creative developer/designer portfolio built with React, TypeScript, Vite, Motion for React, and Three.js. The current collection contains clearly labeled visual concepts and placeholder photography, ready to replace with real projects.

## Develop

Node.js 22.12+ or 24 LTS and npm are required. This environment has Node 24.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Use the existing checkout. Cloud tasks are already isolated; do not create a Git worktree for setup.

## Content

Edit `src/data/content.ts` for the name, role, biography, email, and visual studies. Set `site.email` to a real address to enable the email link; until then, the contact action clearly explains that details are coming soon. Artwork lives in `src/components/Sculpture.tsx` and `src/components/ProjectArt.tsx`; photography and local fonts live in `public/`.

The full-bleed opening layers kinetic typography with a real, iridescent WebGL sculpture that reacts to pointer movement and scroll. Holding slows its rotation; an explicit pause control is available. Its rendering loop stops offscreen and while the tab is hidden, and a static original SVG takes over if WebGL is unavailable. The 3D code loads separately from the main page.

The owner-supplied portrait appears on a hanging ID badge: a textured fixed-point cord, metal clip, transparent sleeve, and spring-driven drop/bounce. Drag it to bend the rope; release to settle, or press Enter/Space to swing with a keyboard. Update `site.portrait` in the content file to replace the image.

The collection is an interactive contact sheet: hover, focus, or tap a project name to change its printed artwork, then open the concept preview. It replaces the earlier horizontal card gallery.

The about text reveals with scrolling. A spring-smoothed pointer lens uncovers a second, iridescent typographic layer. **Reveal the other side** provides the same content on touch and keyboard, including with reduced motion.

The landscape is a three-chapter story with an opening, a held middle, and a resolved ending. It has 480svh (4.8 screens) of space on desktop and 360svh (3.6 screens) on mobile; the sticky scene occupies one viewport, leaving a continuous scroll range of 380svh / 260svh. Chapter controls let visitors jump directly to a passage. Reduced motion shows all three passages naturally without pinning.

The experiment room replaces the earlier spiral panel. A deterministic Canvas 2D particle field morphs between Orbit, Wave, and Scatter, bends away from the pointer, gathers when held, and responds to a pulse control. It stops rendering offscreen or when the tab is hidden. Reduced motion renders a still field; the shape controls remain functional without animation.

The sections have distinct entrances with clear resting moments. Navigation and accents retain the owner's preference for typography and linework, without decorative arrows or stars.

## Validate

```sh
npm test
```

This builds the **GitHub Pages** version and runs eleven Chromium browser checks against its repository subpath: local assets, contact-sheet selection and dialogs, all three landscape chapters, touch interactions, reduced motion, persistent pause, the portrait lanyard's drag/return, section entrances, WebGL and its fallback, pointer-lens discovery with a keyboard alternative, and particle interactions plus static shape changes. Screenshots are written to ignored `test-results/`.

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
- The original portrait was supplied and uploaded by the owner; the source JPEG is preserved unchanged.
- Orbital sculptures, WebGL shader deformation, the particle field, and linework are created for this implementation.

There is no contact backend, analytics, external font service, or required secret for running the site. Publication uses the existing GitHub Git authentication.
