// Procedural p5.js glitch animation. No image needed: everything is drawn in code.
// Drifting color blocks sit on a dark background; every so often a glitch burst hits
// with an RGB split, shifted slices, noise bars and a screen flicker.

const BLOCK_COUNT = 14;
let blocks = [];
let burst = 0; // frames of glitching left

function setup() {
  pixelDensity(1);
  const c = createCanvas(windowWidth, windowHeight);

  // Pin the canvas behind the page text, full screen, no margins
  c.style("position", "fixed");
  c.style("top", "0");
  c.style("left", "0");
  c.style("z-index", "-1");

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
  background(10, 10, 18);

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

// Quiet frame: soft blue-gray blocks drifting slowly
function calmFrame() {
  fill(60, 70, 110, 90);
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
    fill(r, g, bl, 110);
    for (const b of blocks) rect(b.x + off, b.y, b.w, b.h);
  }
  blendMode(BLEND);

  // Horizontally shifted slices of whatever has been drawn so far
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
