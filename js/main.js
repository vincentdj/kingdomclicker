// ================================================================
// KINGDOM CLICKER – js/main.js
// Entry point: initialises state, starts loops, wires up UI.
// Depends on: config.js, state.js, engine.js, render.js, map.js, multiplayer.js
// ================================================================

var lastTickTime  = Date.now();
var renderPending = false;

// ----------------------------------------------------------------
// GAME LOOP  (runs 10× per second)
// ----------------------------------------------------------------
function gameLoop() {
  var now = Date.now();
  var dt  = Math.min((now - lastTickTime) / 1000, 0.5); // cap at 500ms
  lastTickTime = now;

  tickGame(dt);

  if (!renderPending) {
    renderPending = true;
    requestAnimationFrame(function() {
      renderResources();
      renderRates();
      renderEventBox();
      renderPending = false;
    });
  }
}

// ----------------------------------------------------------------
// SLOW RENDER  (every 2 seconds – for panels that change infrequently)
// ----------------------------------------------------------------
function slowRender() {
  renderWorkers();
  renderBuildings();
  renderArmy();
  renderCombat();
  renderPrestige();
  renderMap();
  checkAgeUp();
}

// ----------------------------------------------------------------
// AUTO-SAVE  (every 5 seconds)
// ----------------------------------------------------------------
function autoSave() {
  saveGame();
  mpSendStateUpdate(); // sync to multiplayer if in session
}

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
function init() {
  initState();
  reapplyTalents();

  // Prevent raid from firing immediately on load
  if (!S.combat.lastRaid) S.combat.lastRaid = Date.now();
  if (!S.events.nextEvent) S.events.nextEvent = Date.now() + rand(30000, 90000);

  _lastAge = getCurrentAge();

  // Inject inline SVG icons into static HTML elements
  _injectStaticIcons();

  renderAll();

  // Wire up strategy radios
  document.querySelectorAll('.strategy-radio').forEach(function(r) {
    r.addEventListener('change', function() { setStrategy(r.value); });
  });

  setInterval(gameLoop,    100);   // 10 Hz tick
  setInterval(slowRender, 2000);   // 0.5 Hz slow render
  setInterval(autoSave,   5000);   // auto-save every 5s

  addLog('Your kingdom awaits, my liege. Click to collect taxes!');
}

function _injectStaticIcons() {
  function si(id, svg, w, h) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'inline-block';
    el.style.width   = (w || 24) + 'px';
    el.style.height  = (h || 24) + 'px';
    el.style.verticalAlign = 'middle';
    el.style.filter  = 'drop-shadow(0 1px 3px rgba(0,0,0,.8))';
    el.innerHTML     = svg;
    el.querySelector('svg').style.width  = '100%';
    el.querySelector('svg').style.height = '100%';
    el.querySelector('svg').style.display = 'block';
  }

  // Header resources
  si('icon-gold',    RESOURCE_SVGS.gold,  26, 26);
  si('icon-food',    RESOURCE_SVGS.food,  26, 26);
  si('icon-wood',    RESOURCE_SVGS.wood,  26, 26);
  si('icon-stone',   RESOURCE_SVGS.stone, 26, 26);

  // Header crown
  si('icon-crown',   MISC_SVGS.crown, 26, 26);

  // Click button
  si('icon-collect', RESOURCE_SVGS.gold, 28, 28);

  // Attack button
  si('icon-attack',  MISC_SVGS.swords, 20, 20);

  // Panel header icons (small)
  si('icon-army',     MISC_SVGS.swords,  14, 14);
  si('icon-combat',   MISC_SVGS.swords,  14, 14);
  si('icon-buildings',
     BUILDING_SVGS.castles, 18, 14);
  si('icon-research',
     '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
     '<polygon points="4,28 4,14 11,20 20,5 29,20 36,14 36,28" fill="#c8a020"/>' +
     '<rect x="4" y="26" width="32" height="8" fill="#a07818" rx="1"/></svg>',
     18, 14);
  si('icon-prestige', MISC_SVGS.crown, 14, 14);

  // Town center on map
  var tc = document.getElementById('map-tc');
  if (tc) {
    tc.innerHTML =
      '<div style="width:34px;height:34px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.9))">' +
      BUILDING_SVGS.castles + '</div>';
  }
}

document.addEventListener('DOMContentLoaded', init);
