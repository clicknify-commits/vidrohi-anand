import sharp from "sharp";

// Simple abstract editorial-graphic generator: no embedded text (avoids
// Devanagari font-rendering risk inside SVG rasterization), just a
// topic-appropriate color field with a few soft geometric accents. Used as
// article art when no real licensed photo is available.

const PALETTES = {
  weather: ["#1e3a5f", "#2c5282", "#4a7ba6"],
  national: ["#7c2d2d", "#a13d3d", "#c15353"],
  politics: ["#3d3d1e", "#5c5c2c", "#7a7a3d"],
  crime: ["#2d2d2d", "#4a4a4a", "#666666"],
  sports: ["#1e5f3a", "#2c8250", "#3daa6b"],
  entertainment: ["#5f1e5f", "#822c82", "#aa3daa"],
  business: ["#1e4a5f", "#2c6b82", "#3d8caa"],
  default: ["#dc2626", "#b91c1c", "#991b1b"],
};

function shapesFor(seed, [c1, c2, c3]) {
  const rand = mulberry32(seed);
  const shapes = [];
  for (let i = 0; i < 6; i++) {
    const kind = rand() > 0.5 ? "circle" : "rect";
    const x = Math.floor(rand() * 1600);
    const y = Math.floor(rand() * 900);
    const size = 120 + Math.floor(rand() * 260);
    const color = [c1, c2, c3][i % 3];
    const opacity = (0.12 + rand() * 0.18).toFixed(2);
    if (kind === "circle") {
      shapes.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}" />`);
    } else {
      const rot = Math.floor(rand() * 45);
      shapes.push(
        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" opacity="${opacity}" transform="rotate(${rot} ${x} ${y})" />`
      );
    }
  }
  return shapes.join("\n");
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {{ topic?: string, seed: number, width?: number, height?: number }} opts
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateGraphicCard({ topic = "default", seed, width = 1600, height = 900 }) {
  const palette = PALETTES[topic] ?? PALETTES.default;
  const [base] = palette;
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${base}" />
    ${shapesFor(seed, palette)}
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
