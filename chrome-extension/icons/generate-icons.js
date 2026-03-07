// Generate PNG icons using Canvas API in Node.js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

sizes.forEach(size => {
   const canvas = createCanvas(size, size);
   const ctx = canvas.getContext('2d');

   // Gradient background
   const gradient = ctx.createLinearGradient(0, 0, size, size);
   gradient.addColorStop(0, '#6366f1');
   gradient.addColorStop(1, '#8b5cf6');

   // Rounded rect
   const radius = size * 0.15;
   ctx.beginPath();
   ctx.moveTo(radius, 0);
   ctx.lineTo(size - radius, 0);
   ctx.quadraticCurveTo(size, 0, size, radius);
   ctx.lineTo(size, size - radius);
   ctx.quadraticCurveTo(size, size, size - radius, size);
   ctx.lineTo(radius, size);
   ctx.quadraticCurveTo(0, size, 0, size - radius);
   ctx.lineTo(0, radius);
   ctx.quadraticCurveTo(0, 0, radius, 0);
   ctx.closePath();
   ctx.fillStyle = gradient;
   ctx.fill();

   // Draw brain-like symbol
   ctx.fillStyle = 'white';
   const cx = size / 2;
   const cy = size / 2;
   const r = size * 0.3;

   // Left hemisphere
   ctx.beginPath();
   ctx.arc(cx - r * 0.15, cy, r, Math.PI * 0.5, Math.PI * 1.5);
   ctx.fill();

   // Right hemisphere
   ctx.beginPath();
   ctx.arc(cx + r * 0.15, cy, r, Math.PI * 1.5, Math.PI * 0.5);
   ctx.fill();

   // Dividing line
   ctx.strokeStyle = gradient;
   ctx.lineWidth = size * 0.04;
   ctx.beginPath();
   ctx.moveTo(cx, cy - r * 0.9);
   ctx.lineTo(cx, cy + r * 0.9);
   ctx.stroke();

   // Brain folds (wavy lines)
   ctx.strokeStyle = gradient;
   ctx.lineWidth = size * 0.03;

   // Left folds
   ctx.beginPath();
   ctx.moveTo(cx - r * 0.6, cy - r * 0.3);
   ctx.quadraticCurveTo(cx - r * 0.3, cy - r * 0.5, cx - r * 0.1, cy - r * 0.2);
   ctx.stroke();

   ctx.beginPath();
   ctx.moveTo(cx - r * 0.7, cy + r * 0.2);
   ctx.quadraticCurveTo(cx - r * 0.4, cy, cx - r * 0.1, cy + r * 0.3);
   ctx.stroke();

   // Right folds  
   ctx.beginPath();
   ctx.moveTo(cx + r * 0.6, cy - r * 0.3);
   ctx.quadraticCurveTo(cx + r * 0.3, cy - r * 0.5, cx + r * 0.1, cy - r * 0.2);
   ctx.stroke();

   ctx.beginPath();
   ctx.moveTo(cx + r * 0.7, cy + r * 0.2);
   ctx.quadraticCurveTo(cx + r * 0.4, cy, cx + r * 0.1, cy + r * 0.3);
   ctx.stroke();

   // Save
   const outputPath = path.join(__dirname, `icon${size}.png`);
   const buffer = canvas.toBuffer('image/png');
   fs.writeFileSync(outputPath, buffer);
   console.log(`Created ${outputPath}`);
});

console.log('All icons generated!');
