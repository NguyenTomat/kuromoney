const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpeg = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');

const frames = fs.readdirSync('assets').filter(f => f.startsWith('walk_') && f.endsWith('.png'));

let globalMinX = 1280, globalMaxX = 0, globalMinY = 720, globalMaxY = 0;

frames.forEach(file => {
  const buf = execSync(`"${ffmpeg}" -i "assets/${file}" -vcodec rawvideo -pix_fmt rgba -f rawvideo -`, { maxBuffer: 50 * 1024 * 1024 });
  const W = 1280, H = 720;
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < 650; x++) { // Kuromi is on left half
      const idx = (y * W + x) * 4;
      const r = buf[idx], g = buf[idx + 1], b = buf[idx + 2];
      const dist = Math.sqrt((r - 215) ** 2 + (g - 196) ** 2 + (b - 228) ** 2);
      if (dist > 35) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(file, { minX, maxX, minY, maxY });
  if (minX < globalMinX) globalMinX = minX;
  if (maxX > globalMaxX) globalMaxX = maxX;
  if (minY < globalMinY) globalMinY = minY;
  if (maxY > globalMaxY) globalMaxY = maxY;
});

console.log('GLOBAL BOUNDS:', { globalMinX, globalMaxX, globalMinY, globalMaxY });
