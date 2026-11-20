// Afterglow Vice — procedural scene painters.
// Five stylized Vice City scenes, drawn with plain canvas shapes. No photos,
// no external art: every scene is painted from gradients and silhouettes, so
// the app is fully self-contained and deterministic. Each painter takes a 2D
// context and the pixel size to fill, and draws one scene edge to edge.

/** Deterministic random stream from a seed, so a scene always paints the same. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Vertical gradient helper. */
function vgrad(g, w, h, stops) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) gr.addColorStop(at, color);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/** A palm silhouette: trunk + a crown of drooping fronds. */
function palm(g, x, y, s, lean, color) {
  g.save();
  g.translate(x, y);
  g.rotate(lean);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = Math.max(2, s * 0.045);
  g.lineCap = 'round';
  // trunk, slightly curved
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(s * 0.06, -s * 0.55, s * 0.02, -s);
  g.stroke();
  // fronds
  const cx = s * 0.02, cy = -s;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + i * 0.14);
    const len = s * (0.5 + (i % 3) * 0.09);
    const tipX = cx + Math.cos(a) * len;
    const tipY = cy + Math.sin(a) * len * 0.55 + s * 0.16;
    g.beginPath();
    g.moveTo(cx, cy);
    g.quadraticCurveTo(cx + Math.cos(a) * len * 0.55, cy + Math.sin(a) * len * 0.35 - s * 0.12, tipX, tipY);
    g.lineWidth = Math.max(1.5, s * 0.028);
    g.stroke();
  }
  // coconuts
  g.beginPath(); g.arc(cx - s * 0.05, cy + s * 0.03, s * 0.045, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(cx + s * 0.05, cy + s * 0.04, s * 0.04, 0, Math.PI * 2); g.fill();
  g.restore();
}

/** A simple standing figure silhouette: head, shoulders, torso. */
function figure(g, x, y, s, color, pose) {
  g.save();
  g.translate(x, y);
  g.fillStyle = color;
  // head
  g.beginPath(); g.arc(0, -s * 0.82, s * 0.16, 0, Math.PI * 2); g.fill();
  // torso / coat
  g.beginPath();
  g.moveTo(-s * 0.22, -s * 0.62);
  g.quadraticCurveTo(-s * 0.3, -s * 0.1, -s * 0.2, s * 0.28);
  g.lineTo(s * 0.2, s * 0.28);
  g.quadraticCurveTo(s * 0.3, -s * 0.1, s * 0.22, -s * 0.62);
  g.closePath(); g.fill();
  if (pose === 'lean') {
    // one arm out to a car door / railing
    g.strokeStyle = color; g.lineWidth = s * 0.09; g.lineCap = 'round';
    g.beginPath(); g.moveTo(s * 0.16, -s * 0.5); g.lineTo(s * 0.62, -s * 0.18); g.stroke();
  } else if (pose === 'rod') {
    // fishing rod held up
    g.strokeStyle = color; g.lineWidth = s * 0.05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(s * 0.18, -s * 0.45); g.lineTo(s * 0.85, -s * 1.15); g.stroke();
    g.beginPath(); g.moveTo(s * 0.85, -s * 1.15); g.lineTo(s * 0.9, -s * 0.55); g.stroke();
  } else if (pose === 'wave') {
    g.strokeStyle = color; g.lineWidth = s * 0.09; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-s * 0.16, -s * 0.5); g.lineTo(-s * 0.55, -s * 0.95); g.stroke();
  }
  g.restore();
}

/** A low sun disc with a soft halo. */
function sun(g, x, y, r, core, halo) {
  const hg = g.createRadialGradient(x, y, r * 0.2, x, y, r * 2.4);
  hg.addColorStop(0, halo);
  hg.addColorStop(1, 'rgba(255,120,60,0)');
  g.fillStyle = hg;
  g.fillRect(x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2);
  g.fillStyle = core;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}

/** Rows of lit windows on a tower block. */
function windows(g, x, y, w, h, cols, rows, lit, color) {
  const cw = w / cols, ch = h / rows;
  g.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (lit() > 0.45) g.fillRect(x + c * cw + cw * 0.25, y + r * ch + ch * 0.3, cw * 0.5, ch * 0.42);
    }
  }
}

/** 1 — Boulevard Gold: palm-lined boulevard at golden hour. */
export function paintBoulevard(g, w, h) {
  const R = rng(11);
  vgrad(g, w, h, [[0, '#2a1b4d'], [0.42, '#c94b7a'], [0.68, '#ff8a4d'], [1, '#ffc46b']]);
  sun(g, w * 0.5, h * 0.44, h * 0.075, '#fff3c4', 'rgba(255,190,90,0.55)');
  // distant towers
  g.fillStyle = '#3a2358';
  const towers = [[0.02, 0.30, 0.10, 0.30], [0.14, 0.26, 0.08, 0.34], [0.78, 0.28, 0.09, 0.32], [0.90, 0.32, 0.08, 0.28]];
  for (const [x, y, tw, th] of towers) g.fillRect(x * w, y * h, tw * w, th * h);
  // road, receding to the horizon below the sun
  g.fillStyle = '#241531';
  g.beginPath();
  g.moveTo(w * 0.32, h); g.lineTo(w * 0.475, h * 0.58); g.lineTo(w * 0.525, h * 0.58); g.lineTo(w * 0.68, h);
  g.closePath(); g.fill();
  // centre line dashes
  g.fillStyle = '#ffd98a';
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const y = h * (0.62 + t * 0.36);
    const half = w * (0.008 + t * 0.012);
    g.fillRect(w * 0.5 - half / 2, y, half, h * 0.02);
  }
  // sidewalks + palms
  g.fillStyle = '#4a2b52';
  g.fillRect(0, h * 0.58, w * 0.32, h * 0.42);
  g.fillRect(w * 0.68, h * 0.58, w * 0.32, h * 0.42);
  palm(g, w * 0.10, h * 0.62, h * 0.34, -0.06, '#1c1030');
  palm(g, w * 0.24, h * 0.60, h * 0.27, 0.10, '#221238');
  palm(g, w * 0.88, h * 0.62, h * 0.32, 0.05, '#1c1030');
  palm(g, w * 0.76, h * 0.60, h * 0.24, -0.12, '#221238');
  // convertible silhouette, low in the road
  g.fillStyle = '#160a24';
  const cy = h * 0.86, cx = w * 0.5, cw = w * 0.30;
  g.beginPath();
  g.moveTo(cx - cw / 2, cy);
  g.lineTo(cx - cw * 0.32, cy - h * 0.045);
  g.lineTo(cx + cw * 0.28, cy - h * 0.045);
  g.lineTo(cx + cw / 2, cy);
  g.closePath(); g.fill();
  g.fillRect(cx - cw * 0.42, cy - h * 0.012, cw * 0.14, h * 0.012);
  g.fillRect(cx + cw * 0.28, cy - h * 0.012, cw * 0.14, h * 0.012);
  figure(g, w * 0.60, h * 0.84, h * 0.085, '#160a24', 'lean');
  // birds
  g.strokeStyle = 'rgba(30,16,48,0.85)'; g.lineWidth = Math.max(1.5, h * 0.003); g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const bx = w * (0.2 + R() * 0.55), by = h * (0.14 + R() * 0.16), s = w * 0.02;
    g.beginPath(); g.moveTo(bx - s, by); g.quadraticCurveTo(bx - s * 0.4, by - s * 0.5, bx, by);
    g.quadraticCurveTo(bx + s * 0.4, by - s * 0.5, bx + s, by); g.stroke();
  }
}

/** 2 — Rooftop Dusk: hazy skyline from a rooftop ledge. */
export function paintRooftop(g, w, h) {
  const R = rng(23);
  vgrad(g, w, h, [[0, '#1b1440'], [0.45, '#5b2a72'], [0.72, '#e0607e'], [1, '#ffb36b']]);
  sun(g, w * 0.72, h * 0.66, h * 0.07, '#ffe9a8', 'rgba(255,170,90,0.5)');
  // skyline, two depths
  const far = [[0, 0.44, 0.09, 0.22], [0.10, 0.38, 0.07, 0.28], [0.19, 0.46, 0.11, 0.20], [0.32, 0.40, 0.08, 0.26], [0.42, 0.47, 0.10, 0.19], [0.54, 0.36, 0.09, 0.30], [0.65, 0.45, 0.08, 0.21], [0.75, 0.39, 0.10, 0.27], [0.87, 0.46, 0.12, 0.20]];
  g.fillStyle = '#4a2a63';
  for (const [x, y, tw, th] of far) g.fillRect(x * w, y * h, tw * w, th * h);
  const near = [[0.05, 0.52, 0.12, 0.22], [0.24, 0.48, 0.10, 0.26], [0.46, 0.54, 0.13, 0.20], [0.68, 0.50, 0.11, 0.24], [0.86, 0.55, 0.12, 0.19]];
  g.fillStyle = '#2c1745';
  for (const [x, y, tw, th] of near) {
    g.fillRect(x * w, y * h, tw * w, th * h);
    windows(g, x * w, y * h, tw * w, th * h, 4, 6, R, 'rgba(255,214,130,0.85)');
  }
  // rooftop ledge in the foreground
  g.fillStyle = '#170d2a';
  g.fillRect(0, h * 0.74, w, h * 0.26);
  g.fillStyle = '#241640';
  g.fillRect(0, h * 0.74, w, h * 0.02);
  // figure leaning on the ledge
  figure(g, w * 0.30, h * 0.76, h * 0.13, '#0f0820', 'lean');
  palm(g, w * 0.90, h * 0.76, h * 0.20, 0.08, '#120a26');
  // string lights along the ledge
  g.strokeStyle = 'rgba(255,200,110,0.5)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0, h * 0.80); g.quadraticCurveTo(w * 0.5, h * 0.86, w, h * 0.80); g.stroke();
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = t * w, y = h * (0.80 + Math.sin(t * Math.PI) * 0.055);
    g.fillStyle = i % 2 ? '#ffd98a' : '#ff9ecf';
    g.beginPath(); g.arc(x, y + h * 0.012, h * 0.006, 0, Math.PI * 2); g.fill();
  }
}

/** 3 — Neon Street: two friends laughing on a neon-lit night street. */
export function paintNeon(g, w, h) {
  const R = rng(37);
  vgrad(g, w, h, [[0, '#0a0618'], [0.5, '#1c0f38'], [1, '#33164a']]);
  // building faces with neon signs
  const signs = [
    { x: 0.04, y: 0.10, w: 0.20, h: 0.16, c: '#ff4d9d', label: 'VICE' },
    { x: 0.30, y: 0.06, w: 0.16, h: 0.22, c: '#2de8d8', label: 'PALM' },
    { x: 0.55, y: 0.12, w: 0.22, h: 0.14, c: '#ffb02e', label: 'DINER' },
    { x: 0.82, y: 0.08, w: 0.14, h: 0.20, c: '#7a5cff', label: '24H' },
  ];
  for (const s of signs) {
    g.fillStyle = '#140b28';
    g.fillRect(s.x * w, s.y * h, s.w * w, s.h * h + h * 0.30);
    g.save();
    g.shadowColor = s.c; g.shadowBlur = h * 0.03;
    g.fillStyle = s.c;
    g.fillRect(s.x * w + w * 0.015, s.y * h + h * 0.02, s.w * w - w * 0.03, h * 0.055);
    g.restore();
    g.fillStyle = '#140b28';
    g.font = `900 ${Math.round(h * 0.038)}px sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(s.label, (s.x + s.w / 2) * w, (s.y + h * 0.02 / h + 0.0275) * h);
  }
  // wet pavement with neon reflections
  const pv = g.createLinearGradient(0, h * 0.58, 0, h);
  pv.addColorStop(0, '#1a0e30'); pv.addColorStop(1, '#0a0618');
  g.fillStyle = pv; g.fillRect(0, h * 0.58, w, h * 0.42);
  for (const s of signs) {
    const rg = g.createLinearGradient(0, h * 0.58, 0, h);
    rg.addColorStop(0, s.c + '55'); rg.addColorStop(1, s.c + '00');
    g.fillStyle = rg;
    g.fillRect((s.x + 0.02) * w, h * 0.58, (s.w - 0.04) * w, h * 0.34);
  }
  // puddle sparkles
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(255,255,255,${0.10 + R() * 0.25})`;
    g.fillRect(R() * w, h * (0.62 + R() * 0.32), w * 0.02, 1.5);
  }
  // two friends, laughing
  figure(g, w * 0.38, h * 0.74, h * 0.16, '#0a0518', 'wave');
  figure(g, w * 0.58, h * 0.76, h * 0.15, '#0a0518', 'lean');
  // diner awning stripes
  g.fillStyle = '#ff4d9d';
  for (let i = 0; i < 6; i++) g.fillRect(w * (0.55 + i * 0.036), h * 0.30, w * 0.018, h * 0.05);
}

/** 4 — Pier Light: a wooden pier over turquoise water, a fisherman at its end. */
export function paintPier(g, w, h) {
  const R = rng(51);
  vgrad(g, w, h, [[0, '#7ec8e8'], [0.45, '#a8e0d8'], [0.62, '#2fb3a8'], [1, '#0b6f7a']]);
  sun(g, w * 0.24, h * 0.20, h * 0.07, '#fff8d8', 'rgba(255,240,170,0.5)');
  // sun glitter on the water
  for (let i = 0; i < 40; i++) {
    const y = h * (0.62 + R() * 0.34);
    const xw = w * (0.16 + R() * 0.22) * (1 - (y - h * 0.62) / (h * 0.4));
    g.fillStyle = `rgba(255,250,220,${0.15 + R() * 0.35})`;
    g.fillRect(w * 0.24 + (R() - 0.5) * xw, y, w * (0.01 + R() * 0.03), 2);
  }
  // horizon + distant boats
  g.fillStyle = '#0d5f6e';
  g.fillRect(0, h * 0.58, w, h * 0.012);
  g.fillStyle = '#083f4c';
  g.fillRect(w * 0.68, h * 0.55, w * 0.10, h * 0.03);
  g.fillRect(w * 0.71, h * 0.50, w * 0.012, h * 0.05);
  g.fillRect(w * 0.82, h * 0.565, w * 0.07, h * 0.02);
  // pier planks, receding to the right
  g.fillStyle = '#6b4a2f';
  g.beginPath();
  g.moveTo(w * 0.30, h); g.lineTo(w * 0.52, h * 0.60); g.lineTo(w * 0.62, h * 0.60); g.lineTo(w * 0.78, h);
  g.closePath(); g.fill();
  g.strokeStyle = '#4a2f1c'; g.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const y = h * (0.62 + t * 0.36);
    g.beginPath(); g.moveTo(w * (0.52 - t * 0.20), y); g.lineTo(w * (0.62 + t * 0.14), y); g.stroke();
  }
  // pier posts
  g.fillStyle = '#54371f';
  g.fillRect(w * 0.50, h * 0.60, w * 0.014, h * 0.10);
  g.fillRect(w * 0.60, h * 0.60, w * 0.014, h * 0.10);
  // fisherman at the pier end, bucket hat + rod
  figure(g, w * 0.57, h * 0.62, h * 0.10, '#12303a', 'rod');
  g.fillStyle = '#12303a';
  g.beginPath(); g.ellipse(w * 0.57, h * 0.62 - h * 0.10 * 0.98, w * 0.032, h * 0.010, 0, 0, Math.PI * 2); g.fill();
  // palms on the shore, left
  palm(g, w * 0.06, h * 0.62, h * 0.26, -0.08, '#0d4a42');
  palm(g, w * 0.16, h * 0.63, h * 0.20, 0.12, '#0d4a42');
}

/** 5 — Night Drive: highway at night, tail lights and city glow. */
export function paintNightDrive(g, w, h) {
  const R = rng(67);
  vgrad(g, w, h, [[0, '#05060f'], [0.55, '#131a33'], [0.78, '#3a1c4d'], [1, '#0a0616']]);
  // city glow on the horizon
  const glow = g.createRadialGradient(w * 0.5, h * 0.62, 10, w * 0.5, h * 0.62, w * 0.55);
  glow.addColorStop(0, 'rgba(255,120,140,0.5)');
  glow.addColorStop(0.5, 'rgba(150,80,200,0.25)');
  glow.addColorStop(1, 'rgba(150,80,200,0)');
  g.fillStyle = glow;
  g.fillRect(0, h * 0.30, w, h * 0.5);
  // skyline silhouette
  g.fillStyle = '#0d1024';
  const blocks = [[0, 0.52, 0.08, 0.12], [0.09, 0.46, 0.07, 0.18], [0.18, 0.54, 0.10, 0.10], [0.30, 0.48, 0.06, 0.16], [0.38, 0.55, 0.11, 0.09], [0.51, 0.47, 0.08, 0.17], [0.62, 0.53, 0.09, 0.11], [0.73, 0.45, 0.07, 0.19], [0.82, 0.54, 0.10, 0.10], [0.93, 0.49, 0.07, 0.15]];
  for (const [x, y, tw, th] of blocks) {
    g.fillRect(x * w, y * h, tw * w, th * h);
    windows(g, x * w, y * h, tw * w, th * h, 3, 4, R, 'rgba(255,200,110,0.8)');
  }
  // highway, receding
  g.fillStyle = '#0c0e1e';
  g.beginPath();
  g.moveTo(0, h); g.lineTo(w * 0.42, h * 0.64); g.lineTo(w * 0.58, h * 0.64); g.lineTo(w, h);
  g.closePath(); g.fill();
  // lane dashes, warm from the tail lights
  g.fillStyle = '#ffd98a';
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const y = h * (0.66 + t * 0.32);
    g.fillRect(w * (0.495 - t * 0.004), y, w * (0.006 + t * 0.008), h * 0.018);
  }
  // light trails
  g.strokeStyle = 'rgba(255,60,90,0.75)'; g.lineWidth = h * 0.012; g.lineCap = 'round';
  g.beginPath(); g.moveTo(w * 0.42, h * 0.70); g.quadraticCurveTo(w * 0.46, h * 0.85, w * 0.44, h); g.stroke();
  g.strokeStyle = 'rgba(255,180,80,0.6)'; g.lineWidth = h * 0.008;
  g.beginPath(); g.moveTo(w * 0.58, h * 0.70); g.quadraticCurveTo(w * 0.54, h * 0.85, w * 0.56, h); g.stroke();
  // car roof + rear window, bottom centre
  g.fillStyle = '#05060f';
  g.beginPath();
  g.moveTo(w * 0.28, h); g.lineTo(w * 0.34, h * 0.88); g.lineTo(w * 0.66, h * 0.88); g.lineTo(w * 0.72, h);
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,90,110,0.9)';
  g.fillRect(w * 0.30, h * 0.94, w * 0.05, h * 0.012);
  g.fillRect(w * 0.65, h * 0.94, w * 0.05, h * 0.012);
  // stars
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(255,255,255,${0.2 + R() * 0.6})`;
    g.fillRect(R() * w, R() * h * 0.4, 1.5, 1.5);
  }
  palm(g, w * 0.06, h * 0.66, h * 0.16, -0.10, '#070818');
  palm(g, w * 0.94, h * 0.66, h * 0.18, 0.10, '#070818');
}

/** The five scenes, in rail order: id, display name, painter. */
export const SCENES = [
  { id: 'boulevard', name: 'Boulevard Gold', paint: paintBoulevard },
  { id: 'rooftop', name: 'Rooftop Dusk', paint: paintRooftop },
  { id: 'neon', name: 'Neon Street', paint: paintNeon },
  { id: 'pier', name: 'Pier Light', paint: paintPier },
  { id: 'nightdrive', name: 'Night Drive', paint: paintNightDrive },
];

/** Paints a scene by id into a fresh canvas of the given size. */
export function paintScene(id, w, h) {
  const scene = SCENES.find((s) => s.id === id) ?? SCENES[0];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  scene.paint(c.getContext('2d'), w, h);
  return c;
}
