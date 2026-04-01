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
  reapplyUpgrades();

  // Prevent raid from firing immediately on load
  if (!S.combat.lastRaid) S.combat.lastRaid = Date.now();
  if (!S.events.nextEvent) S.events.nextEvent = Date.now() + rand(30000, 90000);

  _lastAge = getCurrentAge();

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

document.addEventListener('DOMContentLoaded', init);
