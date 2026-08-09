# Dyson Sphere Project

## Overview

An interactive 3D visualization of a Dyson Sphere — a hypothetical megastructure that encompasses a star to capture its energy output. The project combines space textures, shader-based effects, and interactive elements to visualize the concept.

## Features

- 3D Dyson ring with transparent texture and inner wireframe structure
- Emissive sun with lens flare effect
- Multi-layer star field for parallax depth
- Orbit controls for free camera movement (when text is hidden)
- Adjustable animation speed (0.1× to 5×)
- Wikipedia article text in English, German, and Japanese (with furigana/ruby annotations for Japanese)
- Responsive layout for mobile devices
- Post-processing bloom effects

## Technologies

- [Three.js](https://threejs.org/) (v0.178) — 3D rendering
- [Vite](https://vite.dev/) (v8.2) — build tooling
- WebGL, HTML/CSS

## Installation

```bash
git clone https://github.com/ER5ATZ/dyson.git
cd dyson
npm install
npm run dev
```

## Deployment

Deployed automatically to GitHub Pages on push to `main` via GitHub Actions.

Live: https://er5atz.github.io/dyson/

## Sources

- [Wikipedia — Dyson sphere (EN)](https://en.wikipedia.org/wiki/Dyson_sphere)
- [Wikipedia — Dyson-Sphäre (DE)](https://de.wikipedia.org/wiki/Dyson-Sph%C3%A4re)
- [Wikipedia — ダイソン球 (JA)](https://ja.wikipedia.org/wiki/%E3%83%80%E3%82%A4%E3%82%BD%E3%83%B3%E7%90%83)
- [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)
- [Ring Texture (edited)](https://ambientcg.com/view?id=Tiles129B)
- [Three.js Documentation](https://threejs.org/docs/)

## License

Code: [MIT License](LICENSE)

Text content (`public/content/`): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — adapted from Wikipedia contributors. Multilingual articles edited and consolidated using Claude Haiku 4.5.

## Credits

Developed by Andreas Ersch. Special thanks to fireship.io and open-source libraries used in the project.
