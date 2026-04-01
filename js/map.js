// ================================================================
// KINGDOM CLICKER – js/map.js
// Renders the interactive kingdom map.
// Depends on: config.js (MAP_BUILDINGS, ICONS, AGE_NAMES), state.js, engine.js
// ================================================================

function renderMap() {
  var container = document.getElementById('map-buildings');
  if (!container) return;
  container.innerHTML = '';

  // Place each building type at its predefined positions
  for (var btype in MAP_BUILDINGS) {
    var mapDef  = MAP_BUILDINGS[btype];
    var count   = S.buildings[btype] || 0;
    var visible = Math.min(count, mapDef.positions.length);

    for (var i = 0; i < visible; i++) {
      var pos = mapDef.positions[i];
      var el  = document.createElement('div');
      el.className = 'map-building';
      el.style.left = pos.l + '%';
      el.style.top  = pos.t + '%';
      el.title = BUILDING_DEFS[btype] ? BUILDING_DEFS[btype].name : btype;
      el.innerHTML = '<img src="' + ICONS[mapDef.icon] + '" alt="" width="26" height="26" onerror="this.style.display=\'none\'">';
      container.appendChild(el);
    }
  }

  // Annotate map-world with CSS classes for visual theming
  var mapEl = document.getElementById('map-world');
  if (mapEl) {
    var age = getCurrentAge();
    mapEl.className = 'age-' + age
      + (S.buildings.walls    > 0 ? ' has-walls'    : '')
      + (S.buildings.towers   > 0 ? ' has-towers'   : '')
      + (S.buildings.castles  > 0 ? ' has-castle'   : '');
    mapEl.dataset.wallLevel = S.buildings.walls || 0;
  }

  // Population label
  var totalWorkers = Object.values(S.workers).reduce(function(a,b){ return a+b; }, 0);
  var totalArmy    = getTotalArmy();
  var popEl = document.getElementById('map-population');
  if (popEl) popEl.textContent = 'Pop ' + (totalWorkers + totalArmy);
}
