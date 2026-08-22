import sharp from "sharp";

for (const p of process.argv.slice(2)) {
  try {
    const m = await sharp(p).metadata();
    console.log(p, JSON.stringify({ width: m.width, height: m.height, format: m.format }));
  } catch (e) {
    console.log(p, "ERROR", e.message);
  }
}
