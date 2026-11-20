// news-image-20261120 entry, round 3 (main account @dayuwidayadi):
// "THE WORLD TODAY — Friday 20 November 2026". One 1024x1024 front
// page holding the whole day: 42 stories, 6 continents. Round 3 promotes
// the Kyiv missile barrage to the lead hero (the #2 title on the live
// board opens with it), with Cyclone Akvan and COP31's closing day
// beside it; Riyadh drops to the feature grid and the Shenzhen trio
// leaves the page. The poster itself is drawn by a Python/PIL script
// (winner-study geometry: big hero colour blocks, 2x5 feature grid, dark
// navy map, the date as the largest type), so every headline stays
// legible. This program does one small job: hand the finished image to
// the grader, byte for byte, and refuse to run if it is not the poster
// the competition expects.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const destDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const POSTER = "news-image entry.png";

function fail(message) {
  throw new Error(message);
}

mkdirSync(destDir, { recursive: true });

const poster = readFileSync(join(repoDir, POSTER));
if (poster.length === 0) fail(`${POSTER} is empty`);

// A valid PNG starts with its 8-byte signature; the IHDR chunk then
// stores the width at bytes 16-19 and the height at bytes 20-23, both
// big-endian. The competition grades a 1024x1024 poster, so anything
// else is a wrong file and we stop here instead of shipping it.
const signature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
if (poster.length < 24 || !poster.subarray(0, 8).equals(signature)) {
  fail(`${POSTER} is not a PNG file`);
}
const posterWidth = poster.readUInt32BE(16);
const posterHeight = poster.readUInt32BE(20);
if (posterWidth !== 1024 || posterHeight !== 1024) {
  fail(`${POSTER} is ${posterWidth}x${posterHeight}, expected 1024x1024`);
}

const dest = join(destDir, "entry.png");
writeFileSync(dest, poster);

// Prove the copy is exact: read it back and compare every byte, so a
// second grader run always sees the same image.
const verify = readFileSync(dest);
if (!verify.equals(poster)) fail(`${dest} does not match source`);
console.log(`wrote ${dest} (${poster.length} bytes)`);
