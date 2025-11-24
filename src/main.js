import "./style.css";
import * as PIXI from "pixi.js";
import vertex from "./shaders/vertex.glsl?raw";
import fragment from "./shaders/fragment.glsl?raw";

// Get the canvas container
const container = document.getElementById("canvas-container");

// Create PIXI application
const app = new PIXI.Application();
await app.init({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x000000,
  antialias: true,
});

// Add canvas to the container
container.appendChild(app.canvas);

// Color palettes for different modes
const colorPalettes = {
  workspace: {
    color1: [0.2, 0.4, 0.8],
    color2: [0.4, 0.6, 0.9],
    color3: [0.3, 0.8, 0.7],
  },
  chill: {
    color1: [0.6, 0.4, 0.8],
    color2: [0.8, 0.5, 0.7],
    color3: [0.5, 0.6, 0.9],
  },
  photo: {
    color1: [1.0, 0.6, 0.3],
    color2: [1.0, 0.8, 0.3],
    color3: [0.9, 0.4, 0.5],
  },
  date: {
    color1: [0.9, 0.2, 0.4],
    color2: [0.8, 0.3, 0.6],
    color3: [0.6, 0.2, 0.5],
  },
  nightclub: {
    color1: [0.8, 0.0, 0.8],
    color2: [0.0, 0.8, 0.8],
    color3: [0.8, 0.8, 0.0],
  },
};

// Create filter using PIXI.Filter with GlProgram
const gradientFilter = new PIXI.Filter({
  glProgram: new PIXI.GlProgram({
    fragment,
    vertex,
  }),
  resources: {
    timeUniforms: {
      uTime: { value: 0.0, type: "f32" },
      uResolution: {
        value: [window.innerWidth, window.innerHeight],
        type: "vec2<f32>",
      },
      uColor1: { value: colorPalettes.workspace.color1, type: "vec3<f32>" },
      uColor2: { value: colorPalettes.workspace.color2, type: "vec3<f32>" },
      uColor3: { value: colorPalettes.workspace.color3, type: "vec3<f32>" },
      uTargetColor1: {
        value: colorPalettes.workspace.color1,
        type: "vec3<f32>",
      },
      uTargetColor2: {
        value: colorPalettes.workspace.color2,
        type: "vec3<f32>",
      },
      uTargetColor3: {
        value: colorPalettes.workspace.color3,
        type: "vec3<f32>",
      },
      uColorTransition: { value: 1.0, type: "f32" },
    },
  },
});

// Create a white rectangle to apply the filter to
const graphics = new PIXI.Graphics()
  .rect(0, 0, window.innerWidth, window.innerHeight)
  .fill(0xffffff);

graphics.filters = [gradientFilter];
app.stage.addChild(graphics);

// Animation loop
app.ticker.add((ticker) => {
  const uniforms = gradientFilter.resources.timeUniforms.uniforms;

  // Update time
  uniforms.uTime += 0.04 * ticker.deltaTime;

  // Smoothly transition between colors
  if (uniforms.uColorTransition < 1.0) {
    uniforms.uColorTransition = Math.min(
      1.0,
      uniforms.uColorTransition + 0.02 * ticker.deltaTime
    );

    // Lerp current colors toward target colors
    const t = uniforms.uColorTransition;
    for (let i = 0; i < 3; i++) {
      uniforms.uColor1[i] =
        uniforms.uColor1[i] * (1 - t) + uniforms.uTargetColor1[i] * t;
      uniforms.uColor2[i] =
        uniforms.uColor2[i] * (1 - t) + uniforms.uTargetColor2[i] * t;
      uniforms.uColor3[i] =
        uniforms.uColor3[i] * (1 - t) + uniforms.uTargetColor3[i] * t;
    }
  }
});

// Handle mode button clicks
const modeButtons = document.querySelectorAll(".mode-btn");
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Update active state
    modeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Get the mode and update target colors
    const mode = button.dataset.mode;
    const palette = colorPalettes[mode];

    if (palette) {
      const uniforms = gradientFilter.resources.timeUniforms.uniforms;

      // Store current colors as starting point
      uniforms.uColor1 = [...uniforms.uColor1];
      uniforms.uColor2 = [...uniforms.uColor2];
      uniforms.uColor3 = [...uniforms.uColor3];

      // Set target colors
      uniforms.uTargetColor1 = palette.color1;
      uniforms.uTargetColor2 = palette.color2;
      uniforms.uTargetColor3 = palette.color3;

      // Reset transition
      uniforms.uColorTransition = 0.0;
    }
  });
});

// Handle window resize
window.addEventListener("resize", () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  gradientFilter.resources.timeUniforms.uniforms.uResolution = [
    window.innerWidth,
    window.innerHeight,
  ];
  graphics.clear();
  graphics.rect(0, 0, window.innerWidth, window.innerHeight);
  graphics.fill(0xffffff);
});
