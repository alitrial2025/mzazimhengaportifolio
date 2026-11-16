# Mzazi — an interactive portfolio

An editorial creative developer/designer portfolio built with React, TypeScript, Vite, Motion for React, and Three.js. The collection showcases four real projects: Jeff’s Concepts, R. K. Njogu & Company Advocates, NetflixPro TV, and NetflixPro Mobile. The Kotlin projects include interactive React home-screen reconstructions with original artwork.

## Develop

Node.js 22.12+ or 24 LTS and npm are required. This environment has Node 24.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Use the existing checkout. Cloud tasks are already isolated; do not create a Git worktree for setup.

## Content

Edit `src/data/content.ts` for the name, role, biography, email, and project cases. Set `site.email` to a real address to enable the email link; until then, the contact action clearly explains that details are coming soon. Artwork lives in `src/components/Sculpture.tsx` and `src/components/ProjectArt.tsx`; photography and local fonts live in `public/`.

The full-bleed opening layers kinetic typography with a real, iridescent WebGL sculpture that reacts to pointer movement and scroll. Holding slows its rotation; an explicit pause control is available. Its rendering loop stops offscreen and while the tab is hidden, and a static original SVG takes over if WebGL is unavailable. The 3D code loads separately from the main page.

The owner-supplied portrait appears on a hanging ID badge: a textured fixed-point cord, metal clip, transparent sleeve, and spring-driven drop/bounce. Drag it to bend the rope; release to settle, or press Enter/Space to swing with a keyboard. Update `site.portrait` in the content file to replace the image.

The collection is an interactive contact sheet: hover, focus, or tap a project name to change its printed artwork, then open the project case. Website cases link to the sites; the Android cases link to working React UI previews. It replaces the earlier horizontal card gallery.

The about text reveals with scrolling. A spring-smoothed pointer lens uncovers a second, iridescent typographic layer. **Reveal the other side** provides the same content on touch and keyboard, including with reduced motion.

The landscape is a three-chapter story with an opening, a held middle, and a resolved ending. It has 480svh (4.8 screens) of space on desktop and 360svh (3.6 screens) on mobile; the sticky scene occupies one viewport, leaving a continuous scroll range of 380svh / 260svh. Chapter controls let visitors jump directly to a passage. Reduced motion shows all three passages naturally without pinning.

The experiment room replaces the earlier spiral panel. A deterministic Canvas 2D particle field morphs between Orbit, Wave, and Scatter, bends away from the pointer, gathers when held, and responds to a pulse control. It stops rendering offscreen or when the tab is hidden. Reduced motion renders a still field; the shape controls remain functional without animation.

The sections have distinct entrances with clear resting moments. Navigation and accents retain the owner's preference for typography and linework, without decorative arrows or stars.

## Validate

```sh
npm test
```

This builds the **GitHub Pages** version and runs sixteen Chromium browser checks against its repository subpath: local assets, project selection and dialogs, all three landscape chapters, touch interactions, reduced motion, persistent pause, the portrait lanyard, section entrances, WebGL and its fallback, the pointer lens, the particle room, real project actions, TV keyboard navigation, mobile geometry and list persistence, native filter/utility panels, and preview-route isolation. Screenshots are written to ignored `test-results/`. The original Android apps are not compiled by this browser suite.

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

## Kotlin project previews

The previews are lazy-loaded and use hash routes compatible with GitHub Pages:

- `#/preview/netflix-tv` — 960 × 540 TV design canvas with arrow-key focus, billboard behavior, genre/category rails, search, My List and title details.
- `#/preview/netflix-mobile` — 412 × 892 phone design canvas with the source-defined hero geometry, poster imagery, glass navigation, categories, search, personal lists and detail panels.

`src/demos/NativeHome.tsx` translates the supplied HomeScreen composables and shared components. `src/demos/catalog.ts` supplies a deterministic local catalog. UI playback, reminders and download panels are explicitly demonstrative; Firebase, billing, Cast discovery, DRM, recommendations and actual video streaming are not ported. No Android secrets or backend credentials are included in the browser code.

The owner’s original Kotlin files depend on runtime data and additional components. The related original components, geometry, typography and artwork were inspected. See [source mapping and visual-equivalence limits](docs/projects/native-source-map.md); exact pixel equivalence to every Android device/runtime configuration is not claimed.

## Asset sources

- Placeholder mountain photography: [Start Bootstrap Grayscale assets](https://github.com/StartBootstrap/startbootstrap-grayscale/tree/master/dist/assets/img). Used `bg-masthead.jpg` and `demo-image-01.jpg`.
- Placeholder product photography: [Start Bootstrap Agency assets](https://github.com/StartBootstrap/startbootstrap-agency/tree/master/dist/assets/img/portfolio). Used `2.jpg` and `6.jpg`. These are illustrative product studies, not client work or affiliations.
- The two source templates' MIT notices are retained under `docs/licenses/`. No template layouts or application code were reused.
- Space Grotesk and DM Mono are bundled from [Google Fonts](https://github.com/google/fonts) with their SIL Open Font License notices under `public/fonts/`.
- The original portrait was supplied and uploaded by the owner; the source JPEG is preserved unchanged.
- NetflixPro poster, backdrop, logo and game artwork comes from the owner’s original native repositories. Android vector paths were converted to SVG; the profile smile fallbacks are drawn as SVG. Roboto is bundled with its SIL OFL notice.
- Website previews were captured locally from the owner’s source repositories; the phone and TV preview images are captures of the React reconstructions.
- Orbital sculptures, WebGL shader deformation, the particle field, and linework are created for this implementation.

The portfolio and its UI previews have no contact backend, analytics, external font service, or required secret. Publication uses the existing GitHub Git authentication.
