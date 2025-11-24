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
  gradientFilter.resources.timeUniforms.uniforms.uTime +=
    0.04 * ticker.deltaTime;
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
