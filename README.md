# Mzazi — an interactive portfolio

An editorial creative developer/designer portfolio built with React, TypeScript, Vite, Motion for React, and Three.js. Real projects run through the entire page, from a scroll-unfolding hero reel and mouse-reveal collage to four full-screen project chapters, an interactive preview desk, and the final project index. The collection showcases: Jeff’s Concepts, R. K. Njogu & Company Advocates, NetflixPro TV, and NetflixPro Mobile. The Kotlin projects include interactive React home-screen reconstructions with original artwork.

## Develop

Node.js 22.12+ or 24 LTS and npm are required. This environment has Node 24.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Use the existing checkout. Cloud tasks are already isolated; do not create a Git worktree for setup.

## Content

Edit `src/data/content.ts` for the name, role, biography, email, and project cases. Set `site.email` to a real address to enable the email link; until then, the contact action clearly explains that details are coming soon. Artwork lives in `src/components/Sculpture.tsx` and `src/components/ProjectArt.tsx`; photography and local fonts live in `public/`.

The full-bleed opening layers kinetic typography with a real, iridescent WebGL sculpture that reacts to pointer movement and scroll. Four project thumbnails open studies immediately; scrolling unfolds the real interfaces into an oversized reel while the opening scene recedes. The portrait lanyard stays in the scene. Holding slows its rotation; an explicit pause control is available. Its rendering loop stops offscreen and while the tab is hidden, and a static original SVG takes over if WebGL is unavailable. The 3D code loads separately from the main page. OffscreenCanvas moves its full-quality renderer into a dedicated worker where supported; completed full-resolution frames are presented through ImageBitmap so the scene stays visible between renders. The same engine runs on the main thread as a compatibility path. Shader, geometry, lighting, pixel ratio, frame cadence, and animation remain unchanged.

The owner-supplied portrait appears on a hanging ID badge: a textured fixed-point cord, metal clip, transparent sleeve, and spring-driven drop/bounce. Drag it to bend the rope; release to settle, or press Enter/Space to swing with a keyboard. Update `site.portrait` in the content file to replace the image.

The collection is an interactive contact sheet: hover, focus, or tap a project name to change its printed artwork, then open the project case. Website cases link to the sites; the Android cases link to working React UI previews. It replaces the earlier horizontal card gallery.

The about text reveals with scrolling. A spring-smoothed pointer lens uncovers a second, iridescent typographic layer with a collage of the four real interfaces. Project links connect the approach to the actual work. **Reveal the other side** provides the same content on touch and keyboard, including with reduced motion.

The project story gives each project its own held chapter: Jeff’s original bicycle artwork, the law practice’s office and website, a large TV interface, and the mobile interface. An aperture entrance and scroll-linked parallax lead into long resting moments, with four chapter controls and a resolved ending. Desktop has 640svh of space, mobile 560svh. Reduced motion and manual pause show all four chapters in normal flow; inactive animated chapters are inert and hidden from assistive technology. Every chapter opens its project study.

The experiment room replaces the earlier spiral panel. A deterministic Canvas 2D particle field morphs between Orbit, Wave, and Scatter, bends away from the pointer, gathers when held, and responds to a pulse control. It stops rendering offscreen or when the tab is hidden. Reduced motion renders a still field; the shape controls remain functional without animation. Shape geometry is cached in reusable buffers, and projection/depth buffers are reused; particle count, size, transparency, depth order, resolution and frame cadence remain unchanged. A device desk below the field launches the working TV and mobile React previews; the two websites are linked alongside. The closing section brings all four projects back into view before the contact invitation.

The sections have distinct entrances with clear resting moments. Navigation and accents retain the owner's preference for typography and linework, without decorative arrows or stars.

## Validate

```sh
npm test
```

This builds the **GitHub Pages** version and runs twenty-one Chromium browser checks against its repository subpath: local assets, project selection and dialogs, all four held project chapters, touch interactions, reduced motion, persistent pause, the portrait lanyard, section entrances, WebGL and its fallback, the pointer lens, the particle room, real project actions, TV keyboard navigation, mobile geometry and list persistence, native filter/utility panels, preview-route isolation, hero reel actions, and the project links across about, the preview desk, and the final index on touch and reduced motion, native smooth section navigation, stable dialog layout, full effects on weaker hardware, offscreen drawing suspension, and worker compatibility. Screenshots are written to ignored `test-results/`. The original Android apps are not compiled by this browser suite.

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
- Website previews were captured locally from the owner’s source repositories; Jeff’s storefront capture is refreshed from `3b01c74`, including its original `hero-bike.webp`. The law chapter uses its original `legal/hero.webp`. The phone and TV preview images are captures of the React reconstructions.
- Orbital sculptures, WebGL shader deformation, the particle field, and linework are created for this implementation.

The portfolio and its UI previews have no contact backend, analytics, external font service, or required secret. Publication uses the existing GitHub Git authentication.

## Full-quality performance work

Section links use native smooth scrolling; returning from a preview restores the project index immediately. Scroll chapters and the hero reel only update React state at actual chapter/visibility changes. The root reserves scrollbar space to prevent dialog layout jumps and WebGL buffer resizes. The renderer caches pointer bounds and avoids repeated vector allocation. Project chapters isolate layout and paint. See [the measured browser comparison](docs/performance/browser-comparison.json) for the test conditions and limits.

## 90-second walkthrough

`npm run record:walkthrough` records the real production site at 1920 × 1080 with full effects, native badge dragging, project selection, mouse reveal, every scroll chapter, and particle interactions. It exports a silent 90-second H.264 MP4 to `public/films/portfolio-walkthrough.mp4`, ready for download from the Pages site. It requires Chromium, FFmpeg on PATH, and Playwright’s FFmpeg recorder (`npx playwright install ffmpeg` on a fresh machine). Raw capture and coverage metadata stay in ignored `test-results/walkthrough/`. The video is only downloaded when requested; the portfolio does not preload or embed it.
