# Native project source mapping

Prepared 16 November 2026. The portfolio previews are React reconstructions of the supplied HomeScreen code, not a compiled Android runtime.

## Inputs

- TV: owner-supplied Kotlin `HomeScreen` (87217 bytes; SHA-256 `bcf3c1b4b767a79747735addba08808824538c880e94c3efe055902b8154ee61`).
  Related UI source: `alitrial2025/netflix-tv` at `49da8eab0e23f64bc9ac741145168437177b4e04`.
- Mobile: owner-supplied Kotlin `HomeScreen` (34606 bytes; SHA-256 `97f258da4d89e6f4783762f2bf4c82c2a8da38ca62af19d5fe0c2d94017c0543`).
  Related UI source: `alitrial2025/netflix-mobile` at `3b19dea181d1caf22b2ddc711bc1b21ead9acd12`.

## Translation map

| Kotlin UI                                     | React implementation                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| HomeScreen, HomeNavigationBar / NetflixTopBar | `src/demos/NativeHome.tsx`                                                            |
| Billboard, HeroBanner                         | TV and mobile hero branches in NativeHome                                             |
| HomeLayoutMetrics                             | 960 × 540 TV canvas, 76% billboard height, 48% TV row card height                     |
| Mobile HomeViewport / HeroBanner              | 412 × 892 canvas, 26px side insets, 12px corner radius, 540px reference hero          |
| TopNavBar / D-pad focus                       | TV navigation, focused billboard actions, arrow-key row traversal                     |
| NetflixBottomNav / ReferenceGlass             | Floating, separate glass navigation pill and profile circle                           |
| MediaSectionRow / NetflixMovieRow             | Horizontal local-catalog rails, focused TV expansion and progress rails               |
| My List / filters / title callbacks           | Local state + profile-scoped localStorage, category filters and preview detail panels |
| Android VectorDrawable resources              | Converted original path data to local SVG files                                       |

## Artwork and preview provenance

- Movie posters, backdrops, title wordmarks, and game thumbnails are copied from the owner’s `netflix-tv/advertising-video/assets`, `netflix-mobile/app/src/test/resources/artwork`, and drawable resources.
- Npro marks and navigation icons retain the original Android vector path data. The smile-profile fallback artwork is reconstructed as SVG.
- Roboto is bundled from Google Fonts with its SIL OFL license.
- `preview-tv.png` and `preview-mobile.png` are browser captures of the working React implementations.
- The law-site screenshot is a browser capture of its source build. Jeff’s Concepts previews are captures of its current source build and studio, which differs from the older deployed screenshot supplied in chat.

## Limits of visual equivalence

The supplied files compose other UI components and use runtime-selected media, profiles, extracted colors, font scaling, network artwork and backend data. The source components and bundled reference renders were inspected, and their geometry, original assets and interaction patterns were translated. No pixel-perfect equivalence to every Android runtime configuration is claimed. A local fixture catalog makes the web previews repeatable without account credentials or remote APIs.

This browser implementation does not port Firebase authentication, billing, video streaming, downloads, Cast device discovery, DRM, or recommendation services. Playback and download panels are explicitly labeled interface demonstrations. These services are outside the two supplied HomeScreen implementations.

The original portrait and the native repositories are not modified.
