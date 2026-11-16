# Portfolio research and creative direction

Prepared 16 November 2026 for a creative developer / designer portfolio.

## Goal

Create an original, polished portfolio with scroll-linked motion, parallax, and a strong visual identity. Project names, imagery, outcomes, personal biography, and contact details will come from the owner later. Do not invent client work, awards, testimonials, or experience.

## Research and evidence

The initial research used public GitHub pages, original source files, and a published screenshot. After the environment was published, live Chromium browsing reached Aristide Benoist, Dennis Snellenberg, Brittany Chiang, and the Awwwards portfolio collection. Aristide's project-strip and About interaction were inspected; Brittany's current rendered portfolio loaded. Dennis's page remained behind its loader because external script hosts were blocked, and Awwwards thumbnails/fonts were blocked on its separate asset domain. Pinterest and Dribbble still require their additional domains to be applied. These are references for techniques, not claims that every live site was fully tested or that every reference has an award.

| Reference                                                                         | Reviewed evidence                                             | Useful lesson                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Olivier Larose: cards parallax](https://github.com/olivierlarose/cards-parallax) | `src/app/page.js` and `src/components/Card/index.jsx`         | Scroll progress drives card scaling and image zoom. A good foundation for a selected-work sequence.                                                                                              |
| [Olivier Larose: zoom parallax](https://github.com/olivierlarose/zoom-parallax)   | `src/app/page.js` and `src/components/ZoomParallax/index.jsx` | A sticky image composition scales different layers at different rates. Use as one deliberate transition.                                                                                         |
| [Bruno Simon: Folio 2019](https://github.com/brunosimon/folio-2019)               | README, package manifest, and `src/javascript/World/index.js` | The source organizes a 3D world around a car, project sections, controls, physics, and sound. A signature interaction can communicate personality. A full 3D world is a separate scope decision. |
| [Brittany Chiang: v4](https://github.com/bchiang7/v4)                             | README and original `src/images/demo.png` screenshot          | Strong type hierarchy, concise introduction, clear navigation, and a visible contact action keep the work understandable. This is an older version, not evidence of the current live design.     |
| [Motion official repository](https://github.com/motiondivision/motion)            | Current README                                                | Framer Motion is now Motion; the recommended React import is `motion/react`.                                                                                                                     |

Additional live references:

- [Awwwards portfolio collection](https://www.awwwards.com/websites/portfolio/)
- [Dennis Snellenberg](https://dennissnellenberg.com/)
- [Aristide Benoist](https://www.aristidebenoist.com/)
- [Motion scroll animation documentation](https://motion.dev/docs/react-scroll-animations)

Additional research asset hosts, Pinterest, Dribbble, and their image hosts have been saved to the new draft, preserving the published domains. That save does not publish or apply runtime policy. Nothing was republished by the agent.

## Recommended direction

An editorial, cinematic identity: warm ivory and near-black, a restrained vermilion accent, oversized grotesk type, fine rules, generous space, and large project imagery. Alternate light and dark sections to give the page rhythm. Motion should make the hierarchy and work feel intentional.

Proposed page sequence:

1. **Opening:** compact navigation; oversized name or statement; short role line; one original visual motif. A brief masked text entrance should never delay navigation.
2. **Selected work:** three to five substantial project panels. On desktop, sticky cards scale subtly as the next project enters; imagery moves within its crop. On mobile, readable vertical cards with much smaller parallax.
3. **Perspective:** a concise introduction to how the owner thinks and works, with a restrained word or line reveal. Keep a complete accessible text representation.
4. **Capabilities / experiments:** an editorial list of real skills and optional small interactive studies, once content is supplied.
5. **Contact:** a large closing invitation, functional contact details, and genuine social links.

Choose one signature visual sequence for the first version. The card stack and zoom collage are alternatives, rather than effects that must both appear.

## Implementation recommendation

- React + TypeScript + Vite for a focused portfolio with no current backend requirements.
- Motion for React (`motion/react`) for `useScroll`, `useTransform`, reveals, and interactive transitions.
- Native scrolling first. Add Lenis only if it improves the tested experience; use one animation loop and clean it up on unmount.
- Keep projects in a typed content file so replacing provisional content does not require rewriting animation components.
- Use original or appropriately licensed assets. Source examples inform the technique; do not reproduce another designer's layout, code, or branding without the applicable permission and attribution.
- Provisional project panels must be clearly marked as concepts, with no invented results or clients.

## Quality requirements

- Fully usable navigation and content before animation starts.
- Honor reduced motion: remove parallax, long scroll sequences, and nonessential movement.
- Support touch, keyboard focus, and readable small-screen layouts. Hover behavior must have a touch/keyboard equivalent.
- Prefer transform and opacity animation; avoid updating React state every scroll frame.
- Reserve image dimensions, load hero assets deliberately, and lazy-load offscreen media.
- Verify the production build and inspect desktop/mobile layouts, scrolling, project interactions, keyboard navigation, and reduced motion in a real browser.
- Aim for good Core Web Vitals; measure them rather than assuming animation is smooth or fast.

## Content still to supply

Public name, one-line positioning, short biography, project descriptions and assets, each project's role and outcomes, and contact/social links. Project details can arrive after the visual direction is established.

## Implemented first version

The first version now exists in this checkout. It combines an original orbital hero object, horizontal desktop concept gallery, accessible concept dialogs, word reveal, mountain parallax and zoom, a scroll-rotated CSS 3D experiment, color remixing, and a ticker. Mobile uses a vertical project sequence. System reduced motion and a persistent manual pause remove the long pinned sequences and nonessential movement.

Following the owner's feedback, repeated arrows and star motifs were removed throughout. Navigation and actions now use typography, fine rules, numbered labels, and one original flowing-line accent. Photography is placeholder material and the three studies are explicitly labeled as concepts. Real projects and contact information remain to be supplied.

The owner requested GitHub Pages hosting. The repository-path production build and browser checks are documented in the root README; deployment publishes built files to `gh-pages` while retaining source on `main`.

## Immersive revision

The owner requested a less constrained, more immersive design, then supplied a portrait for a falling lanyard badge and asked for a distinct entrance for each section. The opening now uses an edge-to-edge, dark spatial stage with iridescent real-time 3D, oversized layered typography, and a portrait ID card on a textured cord. The card uses a spring drop/bounce, pointer dragging with a rope that follows its attachment point, release settling, and keyboard swing. The original uploaded photograph is preserved unchanged.

Chapter entrances now differ: ribbon wipe, rounded expanding work stage, horizontal typographic wipe, rotating zoom portal, spatial playground unfold, and folding contact finale. Motion is removed or simplified under system reduced motion and the persistent manual pause. Real client projects remain to be supplied.
