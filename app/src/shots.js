// Fixed scenes for screenshots: ?shot=editor shows the studio with a scene
// loaded; ?shot=cover shows the cover alone, full frame. Query params pick
// the scene, layout, grade, headline and cast. window.__shotReady is set
// once the cover has been painted.
import { SCENES } from './scenes.js';
import { GRADES, LAYOUT_IDS } from './cover.js';

export function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const sceneId = query.get('scene') ?? 'boulevard';
  const sceneIndex = Math.max(0, SCENES.findIndex((s) => s.id === sceneId));
  const layout = LAYOUT_IDS.includes(query.get('layout')) ? query.get('layout') : 'hero';
  const grade = GRADES.some((g) => g.id === query.get('grade')) ? query.get('grade') : 'golden';
  const headline = query.get('headline') ?? 'GOLDEN GETAWAY';
  const castParam = query.get('cast');
  const cast = castParam
    ? castParam.split(',').map((n) => n.trim()).filter(Boolean).slice(0, 5)
    : ['MARA SOL', 'NICO VEGA', 'LUZ & JUNE', 'TITO REYES', 'JADE KNOX'];
  apply({
    sceneIndex,
    layout,
    grade,
    headline,
    cast: cast.length ? cast : ['MARA SOL', 'NICO VEGA', 'LUZ & JUNE', 'TITO REYES', 'JADE KNOX'],
    reframe: { dx: 0, dy: 0, scale: 1 },
  });
}
