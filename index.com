<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solar System Explorer</title>
  <link rel="stylesheet" href="styles.css" />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="universe">
    <canvas id="solarCanvas"></canvas>

    <!-- HUD Header -->
    <header id="hud-header">
      <div id="title-block">
        <span id="main-title">SOLAR SYSTEM</span>
        <span id="sub-title">INTERACTIVE EXPLORER</span>
      </div>
      <div id="controls-bar">
        <label class="hud-label">SPEED
          <input type="range" id="speedSlider" min="0.1" max="10" step="0.1" value="1" />
          <span id="speedVal">1.0x</span>
        </label>
        <button id="pauseBtn" class="hud-btn">⏸ PAUSE</button>
        <button id="resetBtn" class="hud-btn">↺ RESET</button>
        <label class="hud-label toggle-label">
          <input type="checkbox" id="showOrbitsToggle" checked /> ORBITS
        </label>
        <label class="hud-label toggle-label">
          <input type="checkbox" id="showLabelsToggle" checked /> LABELS
        </label>
      </div>
    </header>

    <!-- Info Panel -->
    <div id="info-panel" class="hidden">
      <div id="info-panel-header">
        <span id="info-panel-name">—</span>
        <button id="info-close">✕</button>
      </div>
      <div id="info-panel-body"></div>
    </div>

    <!-- Distance measurement overlay -->
    <div id="distance-overlay" class="hidden">
      <div id="distance-box">
        <div class="dist-row"><span class="dist-label">FROM</span><span id="dist-from">—</span></div>
        <div class="dist-row"><span class="dist-label">TO</span><span id="dist-to">—</span></div>
        <hr class="dist-hr"/>
        <div class="dist-row"><span class="dist-label">KM</span><span id="dist-km">—</span></div>
        <div class="dist-row"><span class="dist-label">AU</span><span id="dist-au">—</span></div>
        <div class="dist-row"><span class="dist-label">LIGHT</span><span id="dist-light">—</span></div>
        <button id="dist-clear" class="hud-btn" style="margin-top:8px;width:100%">CLEAR</button>
      </div>
    </div>

    <!-- Tooltip -->
    <div id="tooltip" class="hidden"></div>

    <!-- Feature Menu Popup -->
    <div id="feature-menu" class="hidden">
      <div id="feature-menu-title"></div>
      <div id="feature-menu-options"></div>
      <button id="feature-menu-close" class="hud-btn" style="margin-top:10px;width:100%">CLOSE</button>
    </div>

    <!-- Legend -->
    <div id="legend">
      <div class="legend-title">PLANETS</div>
      <div id="legend-items"></div>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
