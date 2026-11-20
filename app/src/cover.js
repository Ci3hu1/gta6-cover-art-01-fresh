// Afterglow Vice — the cover compositor.
// Draws one magazine cover from a state object onto any canvas, at any size.
// Layouts, colour grades, masthead, cover lines, type band, cast strip,
// barcode and seal are all drawn here. Pure canvas, no network, deterministic.

// ---------------------------------------------------------------- grades
export const GRADES = [
  { id: 'golden',    name: 'Golden Hour', top: 'rgba(255,150,60,0.28)',  bottom: 'rgba(120,30,90,0.38)',  band: '#2a1230', accent: '#ffc46b', ink: '#ffffff' },
  { id: 'afterhours',name: 'After Hours', top: 'rgba(90,40,160,0.32)',   bottom: 'rgba(10,5,30,0.48)',   band: '#120826', accent: '#b18cff', ink: '#ffffff' },
  { id: 'coral',     name: 'Coral',       top: 'rgba(255,90,110,0.30)',  bottom: 'rgba(140,20,60,0.38)',  band: '#3a0f22', accent: '#ff8fa8', ink: '#ffffff' },
  { id: 'tealnoir',  name: 'Teal Noir',   top: 'rgba(40,200,190,0.24)',  bottom: 'rgba(5,30,40,0.52)',   band: '#06222b', accent: '#5ee8dc', ink: '#ffffff' },
  { id: 'neonpink',  name: 'Neon Pink',   top: 'rgba(255,40,160,0.32)',  bottom: 'rgba(40,0,50,0.52)',   band: '#1e0424', accent: '#ff5ec4', ink: '#ffffff' },
  { id: 'sunset',    name: 'Sunset Fade', top: 'rgba(255,120,50,0.28)',  bottom: 'rgba(90,20,110,0.42)',  band: '#2e0f3d', accent: '#ff9a5c', ink: '#ffffff' },
  { id: 'mono',      name: 'Mono Vice',   top: 'rgba(200,170,120,0.28)', bottom: 'rgba(40,25,10,0.52)',   band: '#241708', accent: '#e8c88a', ink: '#ffffff' },
  { id: 'palmshade', name: 'Palm Shade',  top: 'rgba(60,180,120,0.24)',  bottom: 'rgba(5,35,25,0.52)',   band: '#06231c', accent: '#6fe8b0', ink: '#ffffff' },
];

// --------------------------------------------------------------- layouts
// Each layout returns panels (rects in pixels, with a scene offset) plus
// where the masthead, type band and cast strip sit. W/H are the cover size.
function rect(x, y, w, h) { return { x, y, w, h }; }
const LAYOUTS = {
  hero(W, H) {
    return {
      panels: [{ ...rect(W * 0.04, H * 0.145, W * 0.92, H * 0.575), scene: 0 }],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.04, H * 0.735, W * 0.92, H * 0.13),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.05, y: H * 0.155, text: 'LEONIDA NIGHTS', size: H * 0.024 }],
    };
  },
  grid(W, H) {
    const gx = W * 0.04, gy = H * 0.145, gw = W * 0.92, gh = H * 0.575, gap = W * 0.02;
    const cw = (gw - gap) / 2, ch = (gh - gap) / 2;
    return {
      panels: [
        { ...rect(gx, gy, cw, ch), scene: 0 },
        { ...rect(gx + cw + gap, gy, cw, ch), scene: 1 },
        { ...rect(gx, gy + ch + gap, cw, ch), scene: 2 },
        { ...rect(gx + cw + gap, gy + ch + gap, cw, ch), scene: 3 },
      ],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.04, H * 0.735, W * 0.92, H * 0.13),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.05, y: H * 0.155, text: 'FOUR WAYS IN', size: H * 0.024 }],
    };
  },
  heroStrip(W, H) {
    const sy = H * 0.535, sh = H * 0.185, sw = (W * 0.92 - W * 0.04) / 3;
    return {
      panels: [
        { ...rect(W * 0.04, H * 0.145, W * 0.92, H * 0.375), scene: 0 },
        { ...rect(W * 0.04, sy, sw, sh), scene: 1 },
        { ...rect(W * 0.04 + sw + W * 0.02, sy, sw, sh), scene: 2 },
        { ...rect(W * 0.04 + (sw + W * 0.02) * 2, sy, sw, sh), scene: 3 },
      ],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.04, H * 0.735, W * 0.92, H * 0.13),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.05, y: H * 0.155, text: 'THE GETAWAY ISSUE', size: H * 0.024 }],
    };
  },
  split(W, H) {
    return {
      panels: [{ ...rect(W * 0.04, H * 0.145, W * 0.54, H * 0.735), scene: 0 }],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.60, H * 0.30, W * 0.36, H * 0.30),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [
        { x: W * 0.60, y: H * 0.16, text: 'TWO SIDES', size: H * 0.026 },
        { x: W * 0.60, y: H * 0.20, text: 'ONE CITY', size: H * 0.026 },
        { x: W * 0.60, y: H * 0.66, text: 'INSIDE: THE FULL MAP', size: H * 0.022 },
      ],
    };
  },
  bleed(W, H) {
    return {
      panels: [{ ...rect(0, 0, W, H), scene: 0, bleed: true }],
      masthead: { y: H * 0.028, size: H * 0.062, shadow: true },
      band: rect(W * 0.04, H * 0.70, W * 0.92, H * 0.14),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.05, y: H * 0.14, text: 'FULL BLEED', size: H * 0.024, shadow: true }],
    };
  },
  triptych(W, H) {
    const tw = (W * 0.92 - W * 0.04) / 3;
    return {
      panels: [
        { ...rect(W * 0.04, H * 0.145, tw, H * 0.575), scene: 0 },
        { ...rect(W * 0.04 + tw + W * 0.02, H * 0.145, tw, H * 0.575), scene: 1 },
        { ...rect(W * 0.04 + (tw + W * 0.02) * 2, H * 0.145, tw, H * 0.575), scene: 2 },
      ],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.04, H * 0.735, W * 0.92, H * 0.13),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.05, y: H * 0.155, text: 'THREE ACTS', size: H * 0.024 }],
    };
  },
  framed(W, H) {
    const fx = W * 0.10, fy = H * 0.17, fw = W * 0.80, fh = H * 0.52;
    return {
      panels: [{ ...rect(fx, fy, fw, fh), scene: 0, frame: true }],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.04, H * 0.735, W * 0.92, H * 0.13),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.11, y: H * 0.18, text: 'FRAMED', size: H * 0.022 }],
    };
  },
  tilt(W, H) {
    return {
      panels: [
        { ...rect(W * 0.04, H * 0.145, W * 0.92, H * 0.50), scene: 0 },
        { ...rect(W * 0.48, H * 0.60, W * 0.48, H * 0.24), scene: 1, tilt: -0.07 },
      ],
      masthead: { y: H * 0.028, size: H * 0.062 },
      band: rect(W * 0.04, H * 0.735, W * 0.92, H * 0.13),
      cast: { y: H * 0.885, size: H * 0.026 },
      lines: [{ x: W * 0.05, y: H * 0.155, text: 'OFF ANGLE', size: H * 0.024 }],
    };
  },
};
export const LAYOUT_IDS = Object.keys(LAYOUTS);

// ------------------------------------------------------------ helpers
function fitFont(g, text, maxWidth, start, family, weight) {
  let size = start;
  g.font = `${weight} ${size}px ${family}`;
  while (g.measureText(text).width > maxWidth && size > 10) {
    size -= 1;
    g.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/** Cover-fit draw of a source canvas/image into a rect, with pan/zoom. */
function drawCoverFit(g, src, sw, sh, r, reframe) {
  const scale = Math.max(r.w / sw, r.h / sh) * (reframe?.scale ?? 1);
  const dw = sw * scale, dh = sh * scale;
  const dx = r.x + (r.w - dw) / 2 + (reframe?.dx ?? 0) * r.w;
  const dy = r.y + (r.h - dh) / 2 + (reframe?.dy ?? 0) * r.h;
  g.drawImage(src, dx, dy, dw, dh);
}

/** Deterministic grain: tiny light/dark specks. */
function grain(g, W, H, seed) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  g.save();
  for (let i = 0; i < Math.floor(W * H / 2600); i++) {
    const v = next();
    g.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    g.fillRect(next() * W, next() * H, 1.4, 1.4);
  }
  g.restore();
}

/** Vignette: darken the corners a touch. */
function vignette(g, W, H) {
  const rg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  rg.addColorStop(0, 'rgba(0,0,0,0)');
  rg.addColorStop(1, 'rgba(0,0,0,0.28)');
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------ the draw
/**
 * Draws one cover.
 * @param {HTMLCanvasElement} canvas
 * @param {object} state { sceneIndex, layout, grade, headline, cast[], reframe, userPhoto, userPhotoScene }
 * @param {object} paintScene (id, w, h) => canvas — the scene painter
 */
export function drawCover(canvas, state, paintScene) {
  const g = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const grade = GRADES.find((gr) => gr.id === state.grade) ?? GRADES[0];
  const layoutFn = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  const L = layoutFn(W, H);
  const scenes = state.scenes;

  // base
  g.fillStyle = grade.band;
  g.fillRect(0, 0, W, H);

  // panels
  const hero = L.panels[0];
  L.panels.forEach((p, i) => {
    const sceneId = scenes[(state.sceneIndex + p.scene) % scenes.length].id;
    const usePhoto = state.userPhoto && state.userPhotoScene === sceneId;
    const src = usePhoto ? state.userPhoto : paintScene(sceneId, Math.max(320, Math.round(p.w)), Math.max(320, Math.round(p.h)));
    const sw = usePhoto ? state.userPhoto.naturalWidth : src.width;
    const sh = usePhoto ? state.userPhoto.naturalHeight : src.height;
    g.save();
    if (p.tilt) {
      g.translate(p.x + p.w / 2, p.y + p.h / 2);
      g.rotate(p.tilt);
      g.translate(-p.w / 2, -p.h / 2);
      g.beginPath(); g.rect(0, 0, p.w, p.h); g.clip();
      drawCoverFit(g, src, sw, sh, { x: 0, y: 0, w: p.w, h: p.h }, state.reframe);
      g.restore();
      g.save();
      g.translate(p.x + p.w / 2, p.y + p.h / 2);
      g.rotate(p.tilt);
      g.translate(-p.w / 2, -p.h / 2);
      g.strokeStyle = 'rgba(255,255,255,0.9)';
      g.lineWidth = Math.max(2, W * 0.004);
      g.strokeRect(0, 0, p.w, p.h);
      g.restore();
    } else {
      g.beginPath(); g.rect(p.x, p.y, p.w, p.h); g.clip();
      drawCoverFit(g, src, sw, sh, p, state.reframe);
      g.restore();
      if (p.frame) {
        g.fillStyle = '#f5efe4';
        g.fillRect(p.x - W * 0.015, p.y - H * 0.012, p.w + W * 0.03, p.h + H * 0.024);
        g.save();
        g.beginPath(); g.rect(p.x, p.y, p.w, p.h); g.clip();
        drawCoverFit(g, src, sw, sh, p, state.reframe);
        g.restore();
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = Math.max(1, W * 0.002);
        g.strokeRect(p.x - W * 0.015, p.y - H * 0.012, p.w + W * 0.03, p.h + H * 0.024);
      } else if (!p.bleed) {
        g.strokeStyle = 'rgba(255,255,255,0.85)';
        g.lineWidth = Math.max(2, W * 0.004);
        g.strokeRect(p.x, p.y, p.w, p.h);
      }
    }
  });

  // grade wash over the whole cover
  const wash = g.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  g.fillStyle = wash;
  g.fillRect(0, 0, W, H);
  vignette(g, W, H);
  grain(g, W, H, 7 + state.sceneIndex * 13 + LAYOUT_IDS.indexOf(state.layout) * 5);

  // masthead: AFTERGLOW over VICE
  const mSize = L.masthead.size;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  if (L.masthead.shadow) { g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = mSize * 0.25; }
  g.fillStyle = grade.ink;
  fitFont(g, 'AFTERGLOW', W * 0.94, mSize, 'Arial Black, sans-serif', 900);
  g.fillText('AFTERGLOW', W / 2, L.masthead.y + mSize);
  g.shadowBlur = 0;
  g.fillStyle = grade.accent;
  const viceSize = mSize * 0.42;
  g.font = `italic 700 ${viceSize}px Georgia, serif`;
  g.fillText('— VICE —', W / 2, L.masthead.y + mSize + viceSize * 0.9);

  // cover lines
  for (const ln of L.lines) {
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    if (ln.shadow) { g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = ln.size * 0.3; }
    g.fillStyle = '#ffffff';
    g.font = `900 ${ln.size}px Arial, sans-serif`;
    g.fillText(ln.text, ln.x, ln.y + ln.size);
    g.shadowBlur = 0;
  }

  // name tag for TITO REYES, fully inside the hero panel (bottom-left, inset)
  const tagName = 'TITO REYES';
  const tagSize = Math.max(11, H * 0.020);
  g.font = `800 ${tagSize}px Arial, sans-serif`;
  const tagW = g.measureText(tagName).width + tagSize * 1.6;
  const tagH = tagSize * 2.0;
  const tagX = hero.x + Math.max(10, W * 0.015);
  const tagY = hero.y + hero.h - tagH - Math.max(10, H * 0.015);
  g.fillStyle = 'rgba(10,6,20,0.82)';
  g.fillRect(tagX, tagY, tagW, tagH);
  g.fillStyle = grade.accent;
  g.fillRect(tagX, tagY, Math.max(3, W * 0.006), tagH);
  g.fillStyle = '#ffffff';
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(tagName, tagX + tagSize * 0.9, tagY + tagH / 2 + 1);

  // type band: solid band, headline in bold caps, clear of the photos
  const b = L.band;
  g.fillStyle = grade.band;
  g.fillRect(b.x, b.y, b.w, b.h);
  g.fillStyle = grade.accent;
  g.fillRect(b.x, b.y, b.w, Math.max(3, H * 0.006));
  const head = (state.headline || 'GOLDEN GETAWAY').trim().toUpperCase();
  const headSize = fitFont(g, head, b.w * 0.92, b.h * 0.52, 'Arial Black, sans-serif', 900);
  g.fillStyle = grade.ink;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(head, b.x + b.w / 2, b.y + b.h / 2 + headSize * 0.06);

  // cast strip: the five names, one clean typographic line
  const cast = (state.cast && state.cast.length ? state.cast : ['MARA SOL', 'NICO VEGA', 'LUZ & JUNE', 'TITO REYES', 'JADE KNOX'])
    .map((n) => (n || '').trim().toUpperCase()).filter(Boolean);
  const castText = cast.join('  •  ');
  const cSize = fitFont(g, castText, W * 0.92, L.cast.size, 'Arial, sans-serif', 700);
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(castText, W / 2, L.cast.y + cSize * 0.5);

  // barcode + issue line, bottom-right inside the cast zone
  const bw = W * 0.085, bh = H * 0.030;
  const bx = W - bw - W * 0.035, by = H - bh - H * 0.012;
  g.fillStyle = '#ffffff';
  g.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
  g.fillStyle = '#111111';
  let cx = bx;
  let seed = 99;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  while (cx < bx + bw - 2) {
    const bar = 1 + rnd() * 3;
    if (rnd() > 0.42) g.fillRect(cx, by, bar, bh);
    cx += bar + 1.5;
  }
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.font = `700 ${Math.max(9, H * 0.013)}px Arial, sans-serif`;
  g.textAlign = 'right'; g.textBaseline = 'middle';
  g.fillText('ISSUE 07  •  $6.99  •  LEONIDA', W - W * 0.035 - bw - W * 0.02, by + bh / 2);

  // seal: small round badge, top-right over the masthead edge
  const sr = Math.max(16, W * 0.038);
  const sx = W - sr - W * 0.045, sy = L.masthead.y + mSize * 0.55;
  g.save();
  g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2);
  g.fillStyle = grade.accent; g.fill();
  g.lineWidth = Math.max(1.5, sr * 0.08);
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.stroke();
  g.fillStyle = '#1a0b26';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 ${sr * 0.42}px Arial, sans-serif`;
  g.fillText('★', sx, sy - sr * 0.18);
  g.font = `800 ${sr * 0.20}px Arial, sans-serif`;
  g.fillText('EST. 2026', sx, sy + sr * 0.42);
  g.restore();
}
