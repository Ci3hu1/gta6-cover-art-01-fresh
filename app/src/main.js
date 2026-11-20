// Afterglow Vice Cover Studio — the studio shell.
// State, history (undo/redo), the photo rail, layout/grade pickers, headline
// and cast inputs, drag-to-reframe, three-size export and user-photo upload.
// A `?shot=` query sets up a fixed scene for a screenshot instead.

import { SCENES, paintScene } from './scenes.js';
import { GRADES, LAYOUT_IDS, drawCover } from './cover.js';
import { runShot } from './shots.js';

const DEFAULT_CAST = ['MARA SOL', 'NICO VEGA', 'LUZ & JUNE', 'TITO REYES', 'JADE KNOX'];

function defaultState() {
  return {
    sceneIndex: 0,
    layout: 'hero',
    grade: 'golden',
    headline: 'GOLDEN GETAWAY',
    cast: [...DEFAULT_CAST],
    reframe: { dx: 0, dy: 0, scale: 1 },
    userPhoto: null,
    userPhotoScene: null,
  };
}

let state = defaultState();
let history = [JSON.stringify(state)];
let hi = 0;

const preview = document.getElementById('preview');
const status = document.getElementById('status');

function snapshot() {
  return JSON.stringify({ ...state, userPhoto: null, userPhotoScene: state.userPhotoScene });
}
function pushHistory() {
  history = history.slice(0, hi + 1);
  history.push(snapshot());
  if (history.length > 60) history.shift();
  hi = history.length - 1;
  updateUndoButtons();
}
function restore(snap) {
  const keepPhoto = state.userPhoto;
  const keepScene = state.userPhotoScene;
  state = { ...JSON.parse(snap), userPhoto: keepPhoto, userPhotoScene: keepScene };
  syncInputs();
  redraw();
}
function undo() {
  if (hi <= 0) return;
  hi -= 1;
  restore(history[hi]);
  updateUndoButtons();
}
function redo() {
  if (hi >= history.length - 1) return;
  hi += 1;
  restore(history[hi]);
  updateUndoButtons();
}
function updateUndoButtons() {
  document.getElementById('undo').disabled = hi <= 0;
  document.getElementById('redo').disabled = hi >= history.length - 1;
}

function drawState() {
  return { ...state, scenes: SCENES };
}
function redraw() {
  drawCover(preview, drawState(), paintScene);
}

// ------------------------------------------------------------- the rail
const rail = document.getElementById('rail');
SCENES.forEach((scene, i) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'thumb';
  btn.dataset.scene = scene.id;
  btn.title = scene.name;
  const thumb = paintScene(scene.id, 120, 150);
  thumb.className = 'thumb-img';
  btn.appendChild(thumb);
  const label = document.createElement('span');
  label.textContent = scene.name;
  btn.appendChild(label);
  btn.addEventListener('click', () => {
    state.sceneIndex = i;
    pushHistory();
    markActive();
    redraw();
  });
  rail.appendChild(btn);
});

// --------------------------------------------------- layout + grade pickers
const layoutBox = document.getElementById('layouts');
LAYOUT_IDS.forEach((id) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pick';
  btn.dataset.layout = id;
  btn.textContent = id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
  btn.addEventListener('click', () => {
    state.layout = id;
    pushHistory();
    markActive();
    redraw();
  });
  layoutBox.appendChild(btn);
});

const gradeBox = document.getElementById('grades');
GRADES.forEach((g) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'swatch';
  btn.dataset.grade = g.id;
  btn.title = g.name;
  btn.style.background = `linear-gradient(135deg, ${g.accent} 0%, ${g.band} 100%)`;
  btn.addEventListener('click', () => {
    state.grade = g.id;
    pushHistory();
    markActive();
    redraw();
  });
  gradeBox.appendChild(btn);
});

function markActive() {
  rail.querySelectorAll('.thumb').forEach((b, i) => b.classList.toggle('active', i === state.sceneIndex));
  layoutBox.querySelectorAll('.pick').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  gradeBox.querySelectorAll('.swatch').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
}

// ---------------------------------------------------------------- inputs
const headlineInput = document.getElementById('headline');
headlineInput.addEventListener('input', () => {
  state.headline = headlineInput.value;
  redraw();
});
headlineInput.addEventListener('change', pushHistory);

const castBox = document.getElementById('cast');
state.cast.forEach((name, i) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = name;
  input.maxLength = 24;
  input.setAttribute('aria-label', `Cast member ${i + 1}`);
  input.addEventListener('input', () => {
    state.cast[i] = input.value;
    redraw();
  });
  input.addEventListener('change', pushHistory);
  castBox.appendChild(input);
});

function syncInputs() {
  headlineInput.value = state.headline;
  castBox.querySelectorAll('input').forEach((input, i) => { input.value = state.cast[i] ?? ''; });
  markActive();
}

// -------------------------------------------------------- drag to reframe
let dragging = null;
preview.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY, dx: state.reframe.dx, dy: state.reframe.dy };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const r = preview.getBoundingClientRect();
  state.reframe.dx = dragging.dx + (e.clientX - dragging.x) / r.width;
  state.reframe.dy = dragging.dy + (e.clientY - dragging.y) / r.height;
  state.reframe.dx = Math.max(-0.4, Math.min(0.4, state.reframe.dx));
  state.reframe.dy = Math.max(-0.4, Math.min(0.4, state.reframe.dy));
  redraw();
});
preview.addEventListener('pointerup', () => {
  if (dragging) { dragging = null; pushHistory(); }
});
preview.addEventListener('wheel', (e) => {
  e.preventDefault();
  const next = state.reframe.scale * (e.deltaY < 0 ? 1.08 : 0.93);
  state.reframe.scale = Math.max(1, Math.min(2.5, next));
  redraw();
}, { passive: false });

const zoom = document.getElementById('zoom');
zoom.addEventListener('input', () => {
  state.reframe.scale = Number(zoom.value);
  redraw();
});
zoom.addEventListener('change', pushHistory);

// ------------------------------------------------------------ photo upload
document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    state.userPhoto = img;
    state.userPhotoScene = SCENES[state.sceneIndex].id;
    state.reframe = { dx: 0, dy: 0, scale: 1 };
    pushHistory();
    status.textContent = `Loaded ${file.name} into the ${SCENES[state.sceneIndex].name} frame.`;
    redraw();
  };
  img.onerror = () => { status.textContent = 'That file could not be read as an image.'; };
  img.src = URL.createObjectURL(file);
});

// ----------------------------------------------------------------- export
function exportCover(w, h, label) {
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  drawCover(off, drawState(), paintScene);
  off.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `afterglow-vice-${label}.png`;
    a.click();
    status.textContent = `Saved afterglow-vice-${label}.png (${w} x ${h}).`;
  }, 'image/png');
}
document.getElementById('export-portrait').addEventListener('click', () => exportCover(1080, 1350, 'portrait'));
document.getElementById('export-square').addEventListener('click', () => exportCover(1080, 1080, 'square'));
document.getElementById('export-landscape').addEventListener('click', () => exportCover(1920, 1080, 'landscape'));

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.getElementById('reset').addEventListener('click', () => {
  state = defaultState();
  pushHistory();
  syncInputs();
  redraw();
  status.textContent = 'Reset to the Golden Getaway cover.';
});

// ------------------------------------------------------------------- shots
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  // In shot mode the canvas backing store matches the requested shot size,
  // so the screenshot is crisp at exactly that resolution.
  const sw = Number(params.get('w'));
  const sh = Number(params.get('h'));
  if (Number.isInteger(sw) && sw > 0 && Number.isInteger(sh) && sh > 0) {
    preview.width = sw;
    preview.height = sh;
  }
  runShot(shot, params, (next) => {
    state = { ...state, ...next };
    syncInputs();
    redraw();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  });
} else {
  syncInputs();
  updateUndoButtons();
  redraw();
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
