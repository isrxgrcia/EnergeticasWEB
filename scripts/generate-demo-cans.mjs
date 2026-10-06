// Genera latas ilustradas de DEMOSTRACIÓN (placeholders identificados, no productos reales).
// Uso: node scripts/generate-demo-cans.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const cans = [
  { id: 'demo-citrica', label: 'CÍTRICA', color: '#C8E038', dark: '#5E6B0F' },
  { id: 'demo-bosque-rojo', label: 'BOSQUE ROJO', color: '#E8442E', dark: '#6E1408' },
  { id: 'demo-tropical', label: 'TROPICAL', color: '#FF8A1F', dark: '#7A3500' },
  { id: 'demo-original', label: 'ORIGINAL', color: '#3D7BFF', dark: '#0B2A73' },
  { id: 'demo-menta-glaciar', label: 'MENTA GLACIAR', color: '#2FD3C0', dark: '#0B5A51' },
];

const svg = ({ label, color, dark }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 880" width="400" height="880">
  <defs>
    <linearGradient id="body" x1="0" x2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset=".28" stop-color="${color}"/>
      <stop offset=".5" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset=".56" stop-color="${color}"/>
      <stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" x2="1">
      <stop offset="0" stop-color="#6b6b72"/>
      <stop offset=".45" stop-color="#e9e9ee"/>
      <stop offset="1" stop-color="#5a5a61"/>
    </linearGradient>
  </defs>
  <path d="M70 70 Q70 40 110 34 L290 34 Q330 40 330 70 L338 110 L338 790 L330 830 Q330 852 290 856 L110 856 Q70 852 70 830 L62 790 L62 110 Z" fill="url(#body)"/>
  <path d="M70 70 Q70 40 110 34 L290 34 Q330 40 330 70 L338 110 L62 110 Z" fill="url(#metal)"/>
  <path d="M62 790 L338 790 L330 830 Q330 852 290 856 L110 856 Q70 852 70 830 Z" fill="url(#metal)"/>
  <ellipse cx="200" cy="40" rx="100" ry="9" fill="#2a2a2f" opacity=".5"/>
  <g fill="#121214">
    <text x="200" y="250" text-anchor="middle" font-family="Impact, 'Arial Narrow', sans-serif" font-size="92" textLength="240" lengthAdjust="spacingAndGlyphs">DEMO</text>
    <text x="200" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${label.length > 10 ? 24 : 30}"${label.length > 10 ? ' textLength="240" lengthAdjust="spacingAndGlyphs"' : ''}>${label}</text>
  </g>
  <rect x="110" y="600" width="180" height="56" rx="8" fill="#121214" opacity=".85"/>
  <text x="200" y="636" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="20" fill="#F3EEE3" letter-spacing="2">PLACEHOLDER</text>
</svg>
`;

mkdirSync('public/img/demo', { recursive: true });
for (const can of cans) writeFileSync(`public/img/demo/${can.id}.svg`, svg(can));
console.log(`Generadas ${cans.length} latas de demostración.`);
