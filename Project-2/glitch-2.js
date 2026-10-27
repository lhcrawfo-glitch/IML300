// Procedural p5.js glitch animation that overlays the page's image.
// The canvas is transparent: the <img> shows through, and the glitch effects
// (color blocks, RGB split, shifted slices, noise bars, scanlines) draw on top.
// Layering: <img> (z-index -1)  <  this canvas (z-index 0)  <  page text (z-index 1)

const BLOCK_COUNT = 14;
let blocks = [];
let burst = 0; // frames of glitching left

function setup() {
  pixelDensity(1);
  const c = createCanvas(windowWidth, windowHeight);

  // Full screen, no margins, above the image, below the text, never blocks clicks
  c.style("position", "fixed");
  c.style("top", "0");
  c.style("left", "0");
  c.style("z-index", "0");
  c.style("pointer-events", "none");

  noStroke();
  makeBlocks();
}

function makeBlocks() {
  blocks = [];
  for (let i = 0; i < BLOCK_COUNT; i++) {
    blocks.push({
      x: random(width),
      y: random(height),
      w: random(80, width * 0.4),
      h: random(20, height * 0.25),
      vx: random(-0.8, 0.8),
    });
  }
}

function updateBlocks() {
  for (const b of blocks) {
    b.x += b.vx;
    if (b.x > width) b.x = -b.w;
    if (b.x + b.w < 0) b.x = width;
  }
}

function draw() {
  clear(); // transparent, so the image underneath stays visible

  // Randomly start a glitch burst lasting a few frames
  if (burst === 0 && random() < 0.04) {
    burst = floor(random(4, 12));
  }

  updateBlocks();

  if (burst > 0) {
    burst--;
    glitchFrame();
  } else {
    calmFrame();
  }

  drawScanlines();
}

// Quiet frame: faint blue-gray blocks drifting slowly over the image
function calmFrame() {
  fill(60, 70, 110, 40);
  for (const b of blocks) rect(b.x, b.y, b.w, b.h);
}

function glitchFrame() {
  // RGB split: draw the blocks three times, one per channel, offset and added together
  const split = random(6, 28);
  const channels = [
    [255, 0, 0, -split],
    [0, 255, 0, 0],
    [0, 0, 255, split],
  ];
  blendMode(ADD);
  for (const [r, g, bl, off] of channels) {
    fill(r, g, bl, 90);
    for (const b of blocks) rect(b.x + off, b.y, b.w, b.h);
  }
  blendMode(BLEND);

  // Horizontally shifted slices of the effects drawn so far
  const slices = floor(random(3, 10));
  for (let i = 0; i < slices; i++) {
    const y = floor(random(height));
    const h = floor(random(8, 90));
    const shift = floor(random(-120, 120));
    copy(0, y, width, h, shift, y, width, h);
  }

  // Thin noise bars in glitchy colors
  const colors = [
    [255, 0, 90],
    [0, 255, 220],
    [255, 255, 255],
  ];
  const bars = floor(random(4, 14));
  for (let i = 0; i < bars; i++) {
    const [r, g, bl] = random(colors);
    fill(r, g, bl, random(80, 220));
    rect(random(width), random(height), random(40, width * 0.5), random(2, 8));
  }

  // Occasional whole-screen flicker
  if (random() < 0.3) {
    fill(255, random(10, 40));
    rect(0, 0, width, height);
  }
}

// Faint CRT scanlines over everything
function drawScanlines() {
  fill(0, 0, 0, 40);
  for (let y = 0; y < height; y += 4) rect(0, y, width, 1);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  makeBlocks();
}
