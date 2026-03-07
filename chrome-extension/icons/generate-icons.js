// Generate PNG icons using only Node.js built-in modules
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPNG(width, height, r, g, b) {
   // PNG signature
   const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

   // IHDR chunk
   const ihdrData = Buffer.alloc(13);
   ihdrData.writeUInt32BE(width, 0);
   ihdrData.writeUInt32BE(height, 4);
   ihdrData[8] = 8;  // bit depth
   ihdrData[9] = 2;  // color type (RGB)
   ihdrData[10] = 0; // compression
   ihdrData[11] = 0; // filter
   ihdrData[12] = 0; // interlace
   const ihdr = makeChunk('IHDR', ihdrData);

   // IDAT chunk - pixel data
   // Each row starts with filter byte (0 = none)
   const rawData = Buffer.alloc((width * 3 + 1) * height);

   for (let y = 0; y < height; y++) {
      const rowOffset = y * (width * 3 + 1);
      rawData[rowOffset] = 0; // filter none

      for (let x = 0; x < width; x++) {
         const pixOffset = rowOffset + 1 + x * 3;

         // Create gradient from #6366f1 to #8b5cf6
         const t = (x + y) / (width + height);
         const pr = Math.round(99 + (139 - 99) * t);   // 0x63 to 0x8b
         const pg = Math.round(102 + (92 - 102) * t);   // 0x66 to 0x5c
         const pb = Math.round(241 + (246 - 241) * t);   // 0xf1 to 0xf6

         // Add rounded corner check
         const cornerRadius = Math.floor(width * 0.18);
         const isInside = isInsideRoundedRect(x, y, width, height, cornerRadius);

         if (isInside) {
            // Check if we should draw the letter "N" or the brain symbol
            const cx = width / 2;
            const cy = height / 2;
            const letterSize = width * 0.4;

            if (isInLetter(x, y, cx, cy, letterSize, width)) {
               rawData[pixOffset] = 255;     // white
               rawData[pixOffset + 1] = 255;
               rawData[pixOffset + 2] = 255;
            } else {
               rawData[pixOffset] = pr;
               rawData[pixOffset + 1] = pg;
               rawData[pixOffset + 2] = pb;
            }
         } else {
            // Transparent (but since RGB, use white/clear)
            rawData[pixOffset] = 255;
            rawData[pixOffset + 1] = 255;
            rawData[pixOffset + 2] = 255;
         }
      }
   }

   const compressed = zlib.deflateSync(rawData);
   const idat = makeChunk('IDAT', compressed);

   // IEND chunk
   const iend = makeChunk('IEND', Buffer.alloc(0));

   return Buffer.concat([signature, ihdr, idat, iend]);
}

function isInsideRoundedRect(x, y, w, h, r) {
   // Check corners
   if (x < r && y < r) {
      return ((x - r) ** 2 + (y - r) ** 2) <= r ** 2;
   }
   if (x >= w - r && y < r) {
      return ((x - (w - r - 1)) ** 2 + (y - r) ** 2) <= r ** 2;
   }
   if (x < r && y >= h - r) {
      return ((x - r) ** 2 + (y - (h - r - 1)) ** 2) <= r ** 2;
   }
   if (x >= w - r && y >= h - r) {
      return ((x - (w - r - 1)) ** 2 + (y - (h - r - 1)) ** 2) <= r ** 2;
   }
   return true;
}

function isInLetter(x, y, cx, cy, size, imgSize) {
   // Draw "N" letter
   const left = cx - size / 2;
   const right = cx + size / 2;
   const top = cy - size / 2;
   const bottom = cy + size / 2;
   const stroke = Math.max(2, Math.floor(imgSize * 0.08));

   // Left vertical bar
   if (x >= left && x < left + stroke && y >= top && y <= bottom) return true;
   // Right vertical bar  
   if (x >= right - stroke && x <= right && y >= top && y <= bottom) return true;
   // Diagonal
   const diagX = left + (y - top) / (bottom - top) * (right - left);
   if (Math.abs(x - diagX) < stroke && y >= top && y <= bottom) return true;

   return false;
}

function makeChunk(type, data) {
   const length = Buffer.alloc(4);
   length.writeUInt32BE(data.length, 0);

   const typeBuffer = Buffer.from(type, 'ascii');
   const crcData = Buffer.concat([typeBuffer, data]);

   const crc = Buffer.alloc(4);
   crc.writeUInt32BE(crc32(crcData), 0);

   return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(data) {
   let crc = 0xFFFFFFFF;
   const table = getCRC32Table();

   for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
   }

   return (crc ^ 0xFFFFFFFF) >>> 0;
}

let _crc32Table = null;
function getCRC32Table() {
   if (_crc32Table) return _crc32Table;
   _crc32Table = new Uint32Array(256);

   for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
         if (c & 1) {
            c = 0xEDB88320 ^ (c >>> 1);
         } else {
            c = c >>> 1;
         }
      }
      _crc32Table[n] = c;
   }

   return _crc32Table;
}

// Generate all sizes
const sizes = [16, 48, 128];
const dir = __dirname;

sizes.forEach(size => {
   const png = createPNG(size, size, 0x63, 0x66, 0xf1);
   const filepath = path.join(dir, `icon${size}.png`);
   fs.writeFileSync(filepath, png);
   console.log(`Created ${filepath} (${png.length} bytes)`);
});

console.log('All icons generated!');
