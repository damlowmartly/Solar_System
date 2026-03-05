/* =============================================
   SOLAR SYSTEM EXPLORER — script.js
   All simulation logic, data, and interactivity
   ============================================= */

// ============================================================
// PLANETARY DATA (real approximate values)
// ============================================================
const BODIES = [
  {
    id: 'sun',
    name: 'Sun',
    color: '#FFD700',
    glowColor: 'rgba(255,220,50,0.6)',
    radiusPx: 32,
    orbitRadiusPx: 0,
    orbitalPeriodDays: 0,
    orbitalSpeedKms: 0,
    rotationHours: 609.12,
    distanceFromSunKm: 0,
    massKg: 1.989e30,
    gravityMs2: 274,
    isSun: true,
    angle: 0,
    spinAngle: 0,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#b5b5b5',
    glowColor: 'rgba(181,181,181,0.4)',
    radiusPx: 4,
    orbitRadiusPx: 80,
    orbitalPeriodDays: 87.97,
    orbitalSpeedKms: 47.87,
    rotationHours: 1407.6,
    distanceFromSunKm: 57_900_000,
    massKg: 3.285e23,
    gravityMs2: 3.7,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#e8cda0',
    glowColor: 'rgba(232,205,160,0.4)',
    radiusPx: 7,
    orbitRadiusPx: 120,
    orbitalPeriodDays: 224.7,
    orbitalSpeedKms: 35.02,
    rotationHours: -5832.5, // retrograde
    distanceFromSunKm: 108_200_000,
    massKg: 4.867e24,
    gravityMs2: 8.87,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#4fa3e0',
    glowColor: 'rgba(79,163,224,0.4)',
    radiusPx: 8,
    orbitRadiusPx: 165,
    orbitalPeriodDays: 365.25,
    orbitalSpeedKms: 29.78,
    rotationHours: 23.93,
    distanceFromSunKm: 149_600_000,
    massKg: 5.972e24,
    gravityMs2: 9.81,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#c1440e',
    glowColor: 'rgba(193,68,14,0.4)',
    radiusPx: 6,
    orbitRadiusPx: 215,
    orbitalPeriodDays: 686.97,
    orbitalSpeedKms: 24.07,
    rotationHours: 24.62,
    distanceFromSunKm: 227_900_000,
    massKg: 6.39e23,
    gravityMs2: 3.71,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#c88b3a',
    glowColor: 'rgba(200,139,58,0.4)',
    radiusPx: 22,
    orbitRadiusPx: 305,
    orbitalPeriodDays: 4332.59,
    orbitalSpeedKms: 13.07,
    rotationHours: 9.93,
    distanceFromSunKm: 778_500_000,
    massKg: 1.898e27,
    gravityMs2: 24.79,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#e4d191',
    glowColor: 'rgba(228,209,145,0.4)',
    radiusPx: 18,
    orbitRadiusPx: 395,
    orbitalPeriodDays: 10759.22,
    orbitalSpeedKms: 9.69,
    rotationHours: 10.66,
    distanceFromSunKm: 1_432_000_000,
    massKg: 5.683e26,
    gravityMs2: 10.44,
    hasRing: true,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#7de8e8',
    glowColor: 'rgba(125,232,232,0.4)',
    radiusPx: 13,
    orbitRadiusPx: 470,
    orbitalPeriodDays: 30688.5,
    orbitalSpeedKms: 6.81,
    rotationHours: -17.24, // retrograde
    distanceFromSunKm: 2_871_000_000,
    massKg: 8.681e25,
    gravityMs2: 8.69,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#3f54ba',
    glowColor: 'rgba(63,84,186,0.4)',
    radiusPx: 12,
    orbitRadiusPx: 535,
    orbitalPeriodDays: 60182,
    orbitalSpeedKms: 5.43,
    rotationHours: 16.11,
    distanceFromSunKm: 4_495_000_000,
    massKg: 1.024e26,
    gravityMs2: 11.15,
    angle: Math.random() * Math.PI * 2,
    spinAngle: 0,
  },
];

const LIGHT_SPEED_KMS = 299_792.458;
const AU_KM = 149_600_000;

// ============================================================
// STATE
// ============================================================
let canvas, ctx;
let cx, cy; // center of canvas
let animationId;
let lastTime = 0;
let paused = false;
let simSpeed = 1;
let showOrbits = true;
let showLabels = true;

let activeFeature = null;       // 'distance' | 'speed' | 'rotation' | 'light' | 'mass'
let selectedBody = null;        // body that opened the panel
let distanceFrom = null;
let distanceTo = null;
let spinningBodies = new Set(); // set of body ids with spin visualizer
let speedBodies = new Set();    // set of body ids with speed readout

// ============================================================
// INIT
// ============================================================
window.addEventListener('load', init);
window.addEventListener('resize', onResize);

function init() {
  canvas = document.getElementById('solarCanvas');
  ctx = canvas.getContext('2d');

  onResize();
  buildLegend();
  buildSelectPrompt();
  setupControls();

  requestAnimationFrame(loop);
}

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cx = canvas.width / 2;
  cy = canvas.height / 2;
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.1); // seconds, capped
  lastTime = ts;

  update(paused ? 0 : dt);
  draw();

  animationId = requestAnimationFrame(loop);
}

function update(dt) {
  const speedMul = simSpeed * dt;
  BODIES.forEach(b => {
    if (b.isSun) {
      // Sun slow spin
      b.spinAngle += (2 * Math.PI / (b.rotationHours * 3600)) * speedMul * 86400 * 0.5;
      return;
    }
    // Orbital angle: one full orbit per orbitalPeriodDays (in sim-days = real seconds * speedMul)
    const orbitalRate = (2 * Math.PI) / (b.orbitalPeriodDays * 86400);
    b.angle += orbitalRate * speedMul * 86400;

    // Spin: rotationHours (negative = retrograde)
    const spinRate = (2 * Math.PI) / (Math.abs(b.rotationHours) * 3600);
    const spinDir = b.rotationHours < 0 ? -1 : 1;
    b.spinAngle += spinDir * spinRate * speedMul * 86400 * 0.5;
  });
}

// ============================================================
// DRAWING
// ============================================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subtle space gradient
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cx, cy));
  grad.addColorStop(0, 'rgba(10,15,40,0.3)');
  grad.addColorStop(1, 'rgba(3,5,13,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw orbits
  if (showOrbits) drawOrbits();

  // Draw distance line
  if (activeFeature === 'distance' && distanceFrom && distanceTo) {
    drawDistanceLine();
  }

  // Draw planets and sun
  BODIES.forEach(b => drawBody(b));

  // Orbital speed arrows
  if (activeFeature === 'speed' && selectedBody && !selectedBody.isSun) {
    drawSpeedArrow(selectedBody);
  }

  // Update distance readout
  if (activeFeature === 'distance' && distanceFrom && distanceTo) {
    updateDistanceReadout();
  }

  // Spin ring overlay (canvas-drawn)
  if (activeFeature === 'rotation' && selectedBody) {
    drawSpinRing(selectedBody);
  }
}

function drawOrbits() {
  BODIES.forEach(b => {
    if (b.isSun) return;
    ctx.beginPath();
    ctx.arc(cx, cy, b.orbitRadiusPx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function getBodyPos(b) {
  if (b.isSun) return { x: cx, y: cy };
  return {
    x: cx + b.orbitRadiusPx * Math.cos(b.angle),
    y: cy + b.orbitRadiusPx * Math.sin(b.angle),
  };
}

function drawBody(b) {
  const pos = getBodyPos(b);

  if (b.isSun) {
    // Sun corona glow
    const coronaGrad = ctx.createRadialGradient(pos.x, pos.y, b.radiusPx * 0.5, pos.x, pos.y, b.radiusPx * 3.5);
    coronaGrad.addColorStop(0, 'rgba(255,220,50,0.35)');
    coronaGrad.addColorStop(0.4, 'rgba(255,160,20,0.12)');
    coronaGrad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, b.radiusPx * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    // Pulsing ring
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.002);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, b.radiusPx * (1.15 + pulse * 0.1), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,200,50,${0.3 + pulse * 0.2})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sun body (gradient)
    const sunGrad = ctx.createRadialGradient(pos.x - b.radiusPx * 0.3, pos.y - b.radiusPx * 0.3, 0, pos.x, pos.y, b.radiusPx);
    sunGrad.addColorStop(0, '#fff9d6');
    sunGrad.addColorStop(0.4, '#FFD700');
    sunGrad.addColorStop(0.8, '#ff9500');
    sunGrad.addColorStop(1, '#cc5500');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, b.radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Spin surface lines
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(b.spinAngle);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(-b.radiusPx * 0.7 * Math.cos(a), -b.radiusPx * 0.3 * Math.sin(a));
      ctx.bezierCurveTo(
        -b.radiusPx * 0.3 * Math.cos(a), b.radiusPx * 0.4 * Math.sin(a),
        b.radiusPx * 0.3 * Math.cos(a), b.radiusPx * 0.4 * Math.sin(a),
        b.radiusPx * 0.7 * Math.cos(a), -b.radiusPx * 0.3 * Math.sin(a)
      );
      ctx.strokeStyle = 'rgba(255,160,0,0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // Planet glow
    const glow = ctx.createRadialGradient(pos.x, pos.y, b.radiusPx * 0.5, pos.x, pos.y, b.radiusPx * 2.8);
    glow.addColorStop(0, b.glowColor);
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, b.radiusPx * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Saturn rings (before planet so planet draws on top partially)
    if (b.hasRing) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      const ringInner = b.radiusPx * 1.35;
      const ringOuter = b.radiusPx * 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringOuter, ringOuter * 0.3, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,160,100,0.25)';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, ringInner, ringInner * 0.3, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(3,8,22,0.7)';
      ctx.fill();
      // Ring stripes
      for (let r = ringInner; r < ringOuter; r += 3) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.3, 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,180,120,${0.1 + Math.random() * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Planet body
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(b.spinAngle);
    const pGrad = ctx.createRadialGradient(-b.radiusPx * 0.35, -b.radiusPx * 0.35, 0, 0, 0, b.radiusPx);
    pGrad.addColorStop(0, lightenColor(b.color, 50));
    pGrad.addColorStop(0.5, b.color);
    pGrad.addColorStop(1, darkenColor(b.color, 60));
    ctx.beginPath();
    ctx.arc(0, 0, b.radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = pGrad;
    ctx.fill();

    // Surface detail (band lines for gas giants, subtle for others)
    if (b.id === 'jupiter') {
      for (let band = -3; band <= 3; band++) {
        ctx.beginPath();
        const bY = band * b.radiusPx * 0.28;
        const halfW = Math.sqrt(Math.max(0, b.radiusPx ** 2 - bY ** 2));
        ctx.rect(-halfW, bY - 1.5, halfW * 2, 3);
        ctx.fillStyle = `rgba(${band % 2 === 0 ? '160,110,60' : '80,50,20'},0.25)`;
        ctx.fill();
      }
    }
    if (b.id === 'saturn') {
      for (let band = -2; band <= 2; band++) {
        ctx.beginPath();
        const bY = band * b.radiusPx * 0.3;
        const halfW = Math.sqrt(Math.max(0, b.radiusPx ** 2 - bY ** 2));
        ctx.rect(-halfW, bY - 1.5, halfW * 2, 3);
        ctx.fillStyle = `rgba(200,180,120,0.18)`;
        ctx.fill();
      }
    }
    if (b.id === 'earth') {
      // Hint of continents
      ctx.beginPath();
      ctx.arc(-b.radiusPx * 0.2, -b.radiusPx * 0.2, b.radiusPx * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,160,80,0.35)';
      ctx.fill();
    }
    if (b.id === 'mars') {
      ctx.beginPath();
      ctx.arc(b.radiusPx * 0.15, -b.radiusPx * 0.25, b.radiusPx * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();
    }

    // Clip circle for all planet extras
    ctx.beginPath();
    ctx.arc(0, 0, b.radiusPx, 0, Math.PI * 2);
    ctx.clip();
    ctx.restore();

    // Highlight shimmer
    ctx.beginPath();
    ctx.arc(pos.x - b.radiusPx * 0.35, pos.y - b.radiusPx * 0.35, b.radiusPx * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();

    // Label
    if (showLabels) {
      ctx.font = `600 10px 'Rajdhani', sans-serif`;
      ctx.fillStyle = 'rgba(200,224,244,0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(b.name.toUpperCase(), pos.x, pos.y + b.radiusPx + 14);
    }
  }

  // "?" button drawn as circle on canvas
  drawInfoButton(b, pos);
}

function drawInfoButton(b, pos) {
  const bx = pos.x + b.radiusPx + 6;
  const by = pos.y - b.radiusPx - 6;
  const r = 7;
  ctx.beginPath();
  ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,212,255,0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,212,255,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = 'bold 9px Orbitron, monospace';
  ctx.fillStyle = '#00d4ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', bx, by);
  ctx.textBaseline = 'alphabetic';
}

function drawDistanceLine() {
  const p1 = getBodyPos(distanceFrom);
  const p2 = getBodyPos(distanceTo);

  // Animated dashed line
  const t = (Date.now() % 2000) / 2000;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = 'rgba(255,209,102,0.8)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.lineDashOffset = -t * 28;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Midpoint label
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const distKm = calcDistanceKm(distanceFrom, distanceTo);
  const distAU = distKm / AU_KM;
  ctx.font = 'bold 10px Orbitron, monospace';
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.fillText(`${formatKm(distKm)} km`, mx, my - 8);
  ctx.font = '9px Rajdhani, sans-serif';
  ctx.fillStyle = 'rgba(255,209,102,0.7)';
  ctx.fillText(`${distAU.toFixed(3)} AU`, mx, my + 8);
}

function drawSpeedArrow(b) {
  const pos = getBodyPos(b);
  // Tangent direction of orbit
  const tangX = -Math.sin(b.angle);
  const tangY = Math.cos(b.angle);
  const arrowLen = 40 + b.orbitalSpeedKms;
  const ex = pos.x + tangX * arrowLen;
  const ey = pos.y + tangY * arrowLen;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = '#06ffa5';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(ey - pos.y, ex - pos.x);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 12 * Math.cos(angle - 0.4), ey - 12 * Math.sin(angle - 0.4));
  ctx.lineTo(ex - 12 * Math.cos(angle + 0.4), ey - 12 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = '#06ffa5';
  ctx.fill();

  ctx.font = 'bold 10px Orbitron, monospace';
  ctx.fillStyle = '#06ffa5';
  ctx.textAlign = 'center';
  ctx.fillText(`${b.orbitalSpeedKms} km/s`, ex + tangX * 22, ey + tangY * 22);
  ctx.restore();
}

function drawSpinRing(b) {
  if (b.isSun) return;
  const pos = getBodyPos(b);
  const r = b.radiusPx * 1.7;
  const spinFactor = 1 / (Math.abs(b.rotationHours) / 24); // faster = bigger factor

  ctx.save();
  ctx.translate(pos.x, pos.y);

  // Animated arc showing spin
  const t = Date.now() * 0.001 * Math.sign(b.rotationHours) * spinFactor * 2;
  for (let i = 0; i < 3; i++) {
    const startA = t + (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, startA, startA + Math.PI * 0.5);
    ctx.strokeStyle = `rgba(0,212,255,${0.6 - i * 0.15})`;
    ctx.lineWidth = 2 - i * 0.4;
    ctx.stroke();
  }

  // Label
  const periodStr = Math.abs(b.rotationHours) >= 24
    ? `${(Math.abs(b.rotationHours) / 24).toFixed(2)} days`
    : `${Math.abs(b.rotationHours).toFixed(2)} hrs`;
  ctx.font = '9px Orbitron, monospace';
  ctx.fillStyle = '#00d4ff';
  ctx.textAlign = 'center';
  ctx.fillText(b.rotationHours < 0 ? `↺ ${periodStr}` : `↻ ${periodStr}`, 0, r + 16);
  ctx.restore();
}

// ============================================================
// HELPERS
// ============================================================
function calcDistanceKm(b1, b2) {
  // Use real-time positions scaled from orbit radius
  // Scale: orbitRadiusPx maps to distanceFromSunKm
  // But Sun is at 0 → special case
  const p1 = getBodyPos(b1);
  const p2 = getBodyPos(b2);
  const pxDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

  // Use planet's scale: pxDist / orbitRadiusPx * distanceFromSunKm (for non-sun)
  // Best approximation: scale by earth's AU
  const scale = AU_KM / BODIES.find(b => b.id === 'earth').orbitRadiusPx;
  return pxDist * scale;
}

function formatKm(km) {
  if (km >= 1e9) return (km / 1e9).toFixed(3) + 'B';
  if (km >= 1e6) return (km / 1e6).toFixed(2) + 'M';
  return Math.round(km).toLocaleString();
}

function formatMass(kg) {
  if (kg >= 1e27) return `${(kg / 1e27).toFixed(3)} × 10²⁷ kg`;
  if (kg >= 1e24) return `${(kg / 1e24).toFixed(3)} × 10²⁴ kg`;
  if (kg >= 1e23) return `${(kg / 1e23).toFixed(3)} × 10²³ kg`;
  return `${kg.toExponential(3)} kg`;
}

function lightenColor(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function updateDistanceReadout() {
  if (!distanceFrom || !distanceTo) return;
  const distKm = calcDistanceKm(distanceFrom, distanceTo);
  const distAU = distKm / AU_KM;
  const lightSec = distKm / LIGHT_SPEED_KMS;
  let lightStr;
  if (lightSec < 60) lightStr = `${lightSec.toFixed(1)} sec`;
  else if (lightSec < 3600) lightStr = `${(lightSec / 60).toFixed(2)} min`;
  else lightStr = `${(lightSec / 3600).toFixed(2)} hrs`;

  document.getElementById('dist-from').textContent = distanceFrom.name;
  document.getElementById('dist-to').textContent = distanceTo.name;
  document.getElementById('dist-km').textContent = `${formatKm(distKm)} km`;
  document.getElementById('dist-au').textContent = `${distAU.toFixed(4)} AU`;
  document.getElementById('dist-light').textContent = lightStr;
}

// ============================================================
// UI — LEGEND
// ============================================================
function buildLegend() {
  const container = document.getElementById('legend-items');
  BODIES.forEach(b => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-dot" style="background:${b.color};color:${b.color}"></div>
      <span>${b.name}</span>
    `;
    item.addEventListener('click', () => openInfoPanel(b));
    container.appendChild(item);
  });
}

// ============================================================
// UI — SELECT PROMPT
// ============================================================
function buildSelectPrompt() {
  const el = document.createElement('div');
  el.id = 'select-prompt';
  el.className = 'hidden';
  el.textContent = 'CLICK A PLANET TO SELECT AS DESTINATION';
  document.getElementById('universe').appendChild(el);
}

function setSelectPrompt(visible, text) {
  const el = document.getElementById('select-prompt');
  el.textContent = text || '';
  el.classList.toggle('hidden', !visible);
}

// ============================================================
// UI — CONTROLS
// ============================================================
function setupControls() {
  document.getElementById('speedSlider').addEventListener('input', e => {
    simSpeed = parseFloat(e.target.value);
    document.getElementById('speedVal').textContent = simSpeed.toFixed(1) + 'x';
  });

  document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    BODIES.forEach(b => { b.angle = Math.random() * Math.PI * 2; b.spinAngle = 0; });
    clearFeature();
  });

  document.getElementById('showOrbitsToggle').addEventListener('change', e => {
    showOrbits = e.target.checked;
  });

  document.getElementById('showLabelsToggle').addEventListener('change', e => {
    showLabels = e.target.checked;
  });

  document.getElementById('info-close').addEventListener('click', () => {
    document.getElementById('info-panel').classList.add('hidden');
    clearFeature();
  });

  document.getElementById('dist-clear').addEventListener('click', () => {
    clearFeature();
  });

  document.getElementById('feature-menu-close').addEventListener('click', () => {
    document.getElementById('feature-menu').classList.add('hidden');
  });

  // Canvas click
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mousemove', onCanvasHover);
  canvas.addEventListener('mouseleave', () => {
    document.getElementById('tooltip').classList.add('hidden');
  });
}

// ============================================================
// CANVAS INTERACTION
// ============================================================
function getHitBody(mx, my) {
  // Check info buttons first (small circle at body radiusPx offset)
  for (const b of BODIES) {
    const pos = getBodyPos(b);
    const bx = pos.x + b.radiusPx + 6;
    const by = pos.y - b.radiusPx - 6;
    if (Math.hypot(mx - bx, my - by) <= 9) return { body: b, hit: 'button' };
  }
  // Then body itself
  for (const b of BODIES) {
    const pos = getBodyPos(b);
    if (Math.hypot(mx - pos.x, my - pos.y) <= b.radiusPx + 6) return { body: b, hit: 'body' };
  }
  return null;
}

function onCanvasHover(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const hit = getHitBody(mx, my);
  const tooltip = document.getElementById('tooltip');

  if (hit) {
    canvas.style.cursor = 'pointer';
    tooltip.textContent = hit.hit === 'button' ? `${hit.body.name} — Open Data` : hit.body.name;
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
    tooltip.classList.remove('hidden');
  } else {
    canvas.style.cursor = 'crosshair';
    tooltip.classList.add('hidden');
  }
}

function onCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const hit = getHitBody(mx, my);
  if (!hit) return;

  if (activeFeature === 'distance' && distanceFrom && !distanceTo) {
    // Selecting destination
    if (hit.body.id === distanceFrom.id) return; // same body, ignore
    distanceTo = hit.body;
    setSelectPrompt(false);
    document.getElementById('distance-overlay').classList.remove('hidden');
    return;
  }

  if (hit.hit === 'button' || hit.hit === 'body') {
    openInfoPanel(hit.body);
  }
}

// ============================================================
// INFO PANEL
// ============================================================
function openInfoPanel(b) {
  selectedBody = b;
  clearFeature(false);

  const panel = document.getElementById('info-panel');
  document.getElementById('info-panel-name').textContent = b.name.toUpperCase();

  const body = document.getElementById('info-panel-body');
  body.innerHTML = '';

  // Data rows
  const rows = [];
  if (!b.isSun) {
    rows.push(['Distance from Sun', `${(b.distanceFromSunKm / 1e6).toFixed(2)}M km / ${(b.distanceFromSunKm / AU_KM).toFixed(3)} AU`]);
    rows.push(['Orbital Period', b.orbitalPeriodDays < 365 ? `${b.orbitalPeriodDays.toFixed(2)} days` : `${(b.orbitalPeriodDays / 365.25).toFixed(2)} years`]);
    rows.push(['Orbital Speed', `${b.orbitalSpeedKms} km/s`]);
  }
  const rotAbs = Math.abs(b.rotationHours);
  rows.push(['Rotation', rotAbs >= 24 ? `${(rotAbs / 24).toFixed(2)} days${b.rotationHours < 0 ? ' (retrograde)' : ''}` : `${rotAbs.toFixed(2)} hrs`]);
  rows.push(['Mass', formatMass(b.massKg)]);
  rows.push(['Surface Gravity', `${b.gravityMs2} m/s²`]);
  if (!b.isSun) {
    const lightSec = b.distanceFromSunKm / LIGHT_SPEED_KMS;
    const lightStr = lightSec < 60 ? `${lightSec.toFixed(1)} s` : `${(lightSec / 60).toFixed(2)} min`;
    rows.push(['Light from Sun', lightStr]);
  }

  rows.forEach(([key, val]) => {
    const row = document.createElement('div');
    row.className = 'info-row';
    row.innerHTML = `<span class="info-key">${key}</span><span class="info-val">${val}</span>`;
    body.appendChild(row);
  });

  // Feature buttons
  const btnsDiv = document.createElement('div');
  btnsDiv.className = 'info-feature-btns';

  const features = [
    { id: 'distance', icon: '📏', label: 'DISTANCE' },
    { id: 'speed', icon: '⚡', label: 'ORBITAL SPEED' },
    { id: 'rotation', icon: '🔄', label: 'SPIN' },
    { id: 'light', icon: '💡', label: 'LIGHT TRAVEL' },
    { id: 'mass', icon: '⚖️', label: 'MASS / GRAVITY' },
  ];

  features.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'feature-btn';
    btn.dataset.feature = f.id;
    btn.innerHTML = `<span class="btn-icon">${f.icon}</span>${f.label}`;
    btn.addEventListener('click', () => activateFeature(f.id, b));
    btnsDiv.appendChild(btn);
  });

  body.appendChild(btnsDiv);
  panel.classList.remove('hidden');
}

// ============================================================
// FEATURE ACTIVATION
// ============================================================
function activateFeature(featureId, body) {
  // Deactivate previous
  document.querySelectorAll('.feature-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.feature-btn[data-feature="${featureId}"]`);
  if (btn) btn.classList.add('active');

  activeFeature = featureId;

  switch (featureId) {
    case 'distance':
      distanceFrom = body;
      distanceTo = null;
      document.getElementById('distance-overlay').classList.add('hidden');
      setSelectPrompt(true, `SELECT DESTINATION PLANET (measuring from ${body.name.toUpperCase()})`);
      break;

    case 'speed':
      selectedBody = body;
      showSpeedPopup(body);
      break;

    case 'rotation':
      selectedBody = body;
      showRotationPopup(body);
      break;

    case 'light':
      showLightPopup(body);
      break;

    case 'mass':
      showMassPopup(body);
      break;
  }
}

function showPopup(title, content) {
  const menu = document.getElementById('feature-menu');
  document.getElementById('feature-menu-title').textContent = title;
  document.getElementById('feature-menu-options').innerHTML = content;
  menu.classList.remove('hidden');
}

function showSpeedPopup(b) {
  if (b.isSun) {
    showPopup('ORBITAL SPEED', `<p style="color:var(--text-dim);font-size:13px">The Sun does not orbit — it is the center of mass of the Solar System.</p>`);
    return;
  }
  showPopup(`${b.name.toUpperCase()} — ORBITAL SPEED`, `
    <div class="info-row"><span class="info-key">SPEED</span><span class="info-val" style="color:var(--green);font-size:18px">${b.orbitalSpeedKms} km/s</span></div>
    <div class="info-row"><span class="info-key">PER HOUR</span><span class="info-val">${(b.orbitalSpeedKms * 3600).toLocaleString()} km/h</span></div>
    <div class="info-row"><span class="info-key">PERIOD</span><span class="info-val">${b.orbitalPeriodDays.toFixed(2)} days</span></div>
    <p style="color:var(--text-dim);font-size:11px;margin-top:10px;font-family:'Rajdhani';line-height:1.5">
      Green arrow on canvas shows velocity direction & relative magnitude.
    </p>
  `);
}

function showRotationPopup(b) {
  const rotAbs = Math.abs(b.rotationHours);
  const retrograde = b.rotationHours < 0;
  showPopup(`${b.name.toUpperCase()} — ROTATION`, `
    <div class="info-row"><span class="info-key">PERIOD</span><span class="info-val" style="color:var(--accent);font-size:16px">${rotAbs >= 24 ? (rotAbs / 24).toFixed(3) + ' days' : rotAbs.toFixed(2) + ' hrs'}</span></div>
    <div class="info-row"><span class="info-key">DIRECTION</span><span class="info-val">${retrograde ? '↺ Retrograde' : '↻ Prograde'}</span></div>
    <div class="info-row"><span class="info-key">IN HOURS</span><span class="info-val">${rotAbs.toFixed(2)} hrs</span></div>
    <p style="color:var(--text-dim);font-size:11px;margin-top:10px;font-family:'Rajdhani';line-height:1.5">
      Animated arc ring on canvas visualizes the spin direction and relative speed.
    </p>
  `);
}

function showLightPopup(b) {
  if (b.isSun) {
    showPopup('LIGHT TRAVEL', `<p style="color:var(--text-dim);font-size:13px">Select a planet to measure light travel from the Sun.</p>`);
    return;
  }
  const lightSec = b.distanceFromSunKm / LIGHT_SPEED_KMS;
  const lightMin = lightSec / 60;

  let travelStr;
  if (lightSec < 60) travelStr = `${lightSec.toFixed(1)} seconds`;
  else if (lightMin < 60) travelStr = `${lightMin.toFixed(2)} minutes`;
  else travelStr = `${(lightMin / 60).toFixed(2)} hours`;

  showPopup(`${b.name.toUpperCase()} — LIGHT TRAVEL TIME`, `
    <div class="info-row"><span class="info-key">SUN → ${b.name.toUpperCase()}</span><span class="info-val" style="color:var(--gold);font-size:16px">${travelStr}</span></div>
    <div class="info-row"><span class="info-key">DISTANCE</span><span class="info-val">${(b.distanceFromSunKm / 1e6).toFixed(2)}M km</span></div>
    <div class="info-row"><span class="info-key">LIGHT SPEED</span><span class="info-val">299,792 km/s</span></div>
    <div class="info-row"><span class="info-key">IN SECONDS</span><span class="info-val">${lightSec.toFixed(1)} s</span></div>
  `);
}

function showMassPopup(b) {
  showPopup(`${b.name.toUpperCase()} — MASS & GRAVITY`, `
    <div class="info-row"><span class="info-key">MASS</span><span class="info-val" style="color:var(--accent2);font-size:14px">${formatMass(b.massKg)}</span></div>
    <div class="info-row"><span class="info-key">SURFACE GRAVITY</span><span class="info-val" style="color:var(--accent2)">${b.gravityMs2} m/s²</span></div>
    <div class="info-row"><span class="info-key">vs EARTH (1g)</span><span class="info-val">${(b.gravityMs2 / 9.81).toFixed(2)}g</span></div>
    <p style="color:var(--text-dim);font-size:11px;margin-top:10px;font-family:'Rajdhani';line-height:1.5">
      ${b.gravityMs2 > 9.81 ? `On ${b.name}, a 70 kg person would weigh ${(70 * b.gravityMs2 / 9.81 * 9.81).toFixed(0)} N.` : `On ${b.name}, you'd feel lighter — ${(70 * b.gravityMs2).toFixed(0)} N instead of 686 N on Earth.`}
    </p>
  `);
}

function clearFeature(resetSelected = true) {
  activeFeature = null;
  distanceFrom = null;
  distanceTo = null;
  if (resetSelected) selectedBody = null;
  document.getElementById('distance-overlay').classList.add('hidden');
  document.getElementById('feature-menu').classList.add('hidden');
  setSelectPrompt(false);
  document.querySelectorAll('.feature-btn').forEach(b => b.classList.remove('active'));
}
