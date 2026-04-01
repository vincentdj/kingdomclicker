// ================================================================
// KINGDOM CLICKER – js/render.js
// All DOM rendering functions.
// Depends on: config.js, state.js, engine.js
// ================================================================

// ----------------------------------------------------------------
// FLOATING TEXT
// ----------------------------------------------------------------
function showFloatingText(text, parentEl, x, y, color) {
  if (!parentEl) return;
  color = color || '#c8a96e';
  var el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.color = color;
  el.style.left = (x != null ? x : (parentEl.offsetWidth / 2)) + 'px';
  el.style.top  = (y != null ? y : 10) + 'px';
  parentEl.style.position = 'relative';
  parentEl.appendChild(el);
  setTimeout(function(){ el.remove(); }, 1200);
}

// ----------------------------------------------------------------
// NOTIFICATIONS (toast)
// ----------------------------------------------------------------
function addLog(msg) {
  S.log.unshift(msg);
  if (S.log.length > 60) S.log.pop();
  renderLog();
}

function addNotification(msg) {
  var el = document.createElement('div');
  el.className = 'notification';
  el.textContent = msg;
  var container = document.getElementById('notifications');
  if (!container) return;
  container.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('show'); });
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){ el.remove(); }, 600);
  }, 3500);
}

// ----------------------------------------------------------------
// MASTER RENDER
// ----------------------------------------------------------------
function renderAll() {
  renderResources();
  renderRates();
  renderKingdom();
  renderWorkers();
  renderBuildings();
  renderArmy();
  renderCombat();
  renderUpgrades();
  renderPrestige();
  renderLog();
  renderEventBox();
  renderMap();
}

// ----------------------------------------------------------------
// RESOURCES
// ----------------------------------------------------------------
function renderResources() {
  var keys = ['gold','food','wood','stone'];
  for (var i = 0; i < keys.length; i++) {
    var r = keys[i];
    var el = document.getElementById('res-' + r);
    if (el) el.textContent = fmt(S.resources[r]);
  }
}

function renderRates() {
  var rates = calcRates();
  var upkeep = 0;
  for (var t in S.army) upkeep += S.army[t] * (UNIT_DEFS[t] ? UNIT_DEFS[t].upkeep : 0);

  var map = { gold: rates.gold, food: rates.food, wood: rates.wood, stone: rates.stone };
  for (var r in map) {
    var el = document.getElementById('rate-' + r);
    if (!el) continue;
    if (r === 'food' && upkeep > 0) {
      el.textContent = '+' + fmtRate(rates.food) + ' (-' + fmtRate(upkeep) + ')/s';
      el.style.color = rates.food - upkeep < 0 ? '#e05030' : '';
    } else {
      el.textContent = map[r] > 0 ? '+' + fmtRate(map[r]) + '/s' : '0/s';
      el.style.color = '';
    }
  }
}

// ----------------------------------------------------------------
// KINGDOM / AGE
// ----------------------------------------------------------------
function renderKingdom() {
  var age   = getCurrentAge();
  var badge = document.getElementById('map-age-badge');
  if (badge) badge.textContent = AGE_NAMES[age];
  var hBadge = document.getElementById('age-badge-header');
  if (hBadge) hBadge.textContent = AGE_NAMES[age];

  // Update click value display
  var prestigeBonus = S.prestige.bonuses.clickMult || 1;
  var marketMult    = 1 + S.buildings.markets * 0.2;
  var val           = (S.clickBonus + 1) * S.clickMult * prestigeBonus * marketMult;
  var cvEl          = document.getElementById('click-value');
  if (cvEl) cvEl.textContent = '+' + fmtRate(val) + ' gold';
}

// ----------------------------------------------------------------
// WORKERS
// ----------------------------------------------------------------
function renderWorkers() {
  var container = document.getElementById('workers-list');
  if (!container) return;
  container.innerHTML = '';

  var totalWorkers = Object.values(S.workers).reduce(function(a,b){ return a+b; },0);
  var wc = document.getElementById('worker-count');
  if (wc) wc.textContent = totalWorkers + ' hired';

  for (var type in WORKER_DEFS) {
    var def      = WORKER_DEFS[type];
    var count    = S.workers[type] || 0;
    var cost     = workerCost(type);
    var afford   = S.resources.gold >= cost;

    var card = document.createElement('div');
    card.className = 'worker-card';
    card.innerHTML =
      '<img class="card-icon" src="' + ICONS[def.icon] + '" alt="' + def.name + '" onerror="this.style.display=\'none\'">' +
      '<div class="card-info">' +
        '<div class="card-name">' + def.name + ' <span class="card-count">' + count + '</span></div>' +
        '<div class="card-desc">' + def.desc + '</div>' +
      '</div>' +
      '<button class="btn-hire' + (afford ? '' : ' disabled') + '" onclick="hireWorker(\'' + type + '\')">' +
        'Hire<br><span class="cost">' + fmt(cost) + 'g</span>' +
      '</button>';
    container.appendChild(card);
  }
}

// ----------------------------------------------------------------
// BUILDINGS
// ----------------------------------------------------------------
function renderBuildings() {
  var container = document.getElementById('buildings-list');
  if (!container) return;
  container.innerHTML = '';

  for (var type in BUILDING_DEFS) {
    var def    = BUILDING_DEFS[type];
    var count  = S.buildings[type] || 0;
    var atMax  = count >= def.max;
    var meetsR = meetsBuildingRequires(type);
    var cost   = getBuildingCost(type);
    var afford = canAffordBuilding(type);

    var costStr = atMax ? 'MAX' :
      (meetsR
        ? Object.entries(cost).map(function(e){ return fmt(e[1]) + ' ' + e[0]; }).join(', ')
        : '🔒 Needs ' + (BUILDING_DEFS[def.requires] ? BUILDING_DEFS[def.requires].name : def.requires));

    var btnClass = 'btn-build' + (atMax ? ' at-max' : (!meetsR || !afford ? ' disabled' : ''));

    var card = document.createElement('div');
    card.className = 'building-card' + (!meetsR ? ' locked' : '');
    card.innerHTML =
      '<img class="card-icon" src="' + ICONS[def.icon] + '" alt="' + def.name + '" onerror="this.style.display=\'none\'">' +
      '<div class="card-info">' +
        '<div class="card-name">' + def.name +
          (def.max > 1
            ? ' <span class="card-count">' + count + '/' + def.max + '</span>'
            : (count > 0 ? ' <span class="card-count built">✓</span>' : '')) +
        '</div>' +
        '<div class="card-desc">' + def.desc + '</div>' +
        '<div class="card-cost">' + costStr + '</div>' +
      '</div>' +
      '<button class="' + btnClass + '" onclick="buildBuilding(\'' + type + '\')"' + (atMax || !meetsR ? ' disabled' : '') + '>' +
        (atMax ? 'MAX' : 'Build') +
      '</button>';
    container.appendChild(card);
  }
}

// ----------------------------------------------------------------
// ARMY
// ----------------------------------------------------------------
function renderArmy() {
  var totalArmy = getTotalArmy();
  var power     = calcArmyPower();

  var szEl = document.getElementById('army-size');
  if (szEl) szEl.textContent = totalArmy + ' / ' + S.armyCap;
  var pwEl = document.getElementById('army-power');
  if (pwEl) pwEl.textContent = fmt(power);

  var container = document.getElementById('unit-list');
  if (!container) return;
  container.innerHTML = '';

  for (var type in UNIT_DEFS) {
    var def      = UNIT_DEFS[type];
    var unlocked = isUnitUnlocked(type);
    var count    = S.army[type] || 0;
    var atCap    = totalArmy >= S.armyCap;
    var afford   = Object.keys(def.costs).every(function(r){ return (S.resources[r] || 0) >= def.costs[r]; });
    var costStr  = unlocked
      ? Object.entries(def.costs).map(function(e){ return fmt(e[1]) + ' ' + e[0]; }).join(', ')
      : '🔒 Build ' + (BUILDING_DEFS[def.requires] ? BUILDING_DEFS[def.requires].name : def.requires);

    var canTrain = unlocked && afford && !atCap;
    var btnClass = 'btn-train' + (canTrain ? '' : ' disabled');

    var card = document.createElement('div');
    card.className = 'unit-card' + (unlocked ? '' : ' locked');
    card.innerHTML =
      '<img class="card-icon" src="' + ICONS[def.icon] + '" alt="' + def.name + '" onerror="this.style.display=\'none\'">' +
      '<div class="card-info">' +
        '<div class="card-name">' + def.name + ' <span class="card-count">' + count + '</span></div>' +
        '<div class="card-desc">ATK ' + def.attack + ' | ' + def.upkeep + ' food/s upkeep</div>' +
        '<div class="card-cost">' + costStr + '</div>' +
      '</div>' +
      '<button class="' + btnClass + '" onclick="trainUnit(\'' + type + '\')"' + (!canTrain ? ' disabled' : '') + '>Train</button>';
    container.appendChild(card);
  }
}

// ----------------------------------------------------------------
// COMBAT STATS + STRATEGY
// ----------------------------------------------------------------
function renderCombat() {
  document.querySelectorAll('.strategy-radio').forEach(function(r){
    r.checked = (r.value === S.combat.strategy);
  });
  var el = document.getElementById('combat-stats');
  if (el) {
    el.innerHTML =
      '<span class="stat-item">W: <b>' + S.combat.wins + '</b></span> ' +
      '<span class="stat-item">L: <b>' + S.combat.losses + '</b></span> ' +
      '<span class="stat-item">Loot: <b>' + fmt(S.combat.loot) + 'g</b></span>';
  }
}

// ----------------------------------------------------------------
// UPGRADES
// ----------------------------------------------------------------
function renderUpgrades() {
  ['economy','military','defense'].forEach(function(tree) {
    var container = document.getElementById('upgrades-' + tree);
    if (!container) return;
    container.innerHTML = '';

    UPGRADE_DEFS.filter(function(u){ return u.tree === tree; }).forEach(function(def) {
      var purchased = isUpgradePurchased(def.id);
      var afford    = canAffordUpgrade(def);
      var costStr   = Object.entries(def.cost).map(function(e){ return fmt(e[1]) + ' ' + e[0]; }).join(', ');

      var card = document.createElement('div');
      card.className = 'upgrade-card' + (purchased ? ' purchased' : '');
      card.innerHTML =
        '<img class="card-icon small" src="' + ICONS[def.icon] + '" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="card-info">' +
          '<div class="card-name">' + def.name + '</div>' +
          '<div class="card-desc">' + def.desc + '</div>' +
          '<div class="card-cost">' + (purchased ? '✓ Researched' : costStr) + '</div>' +
        '</div>' +
        (purchased ? '' : '<button class="btn-research' + (afford ? '' : ' disabled') + '" onclick="buyUpgrade(\'' + def.id + '\')">Research</button>');
      container.appendChild(card);
    });
  });
}

// ----------------------------------------------------------------
// PRESTIGE
// ----------------------------------------------------------------
function renderPrestige() {
  var available = S.prestige.points - S.prestige.spent;
  var el = document.getElementById('prestige-info');
  if (el) {
    el.innerHTML =
      '<div class="p-row">Crown Level <b>' + S.prestige.level + '</b></div>' +
      '<div class="p-row">Available Points <b>' + available + '</b></div>' +
      '<div class="p-row">Potential pts at reset <b>' + calcPrestigePts() + '</b></div>' +
      '<div class="p-row">Prod bonus <b>+' + Math.round(((S.prestige.bonuses.prodMult||1)-1)*100) + '%</b></div>' +
      '<div class="p-row">Click bonus <b>+' + Math.round(((S.prestige.bonuses.clickMult||1)-1)*100) + '%</b></div>';
  }
  var bp = document.getElementById('btn-prestige-prod');
  var bc = document.getElementById('btn-prestige-click');
  if (bp) bp.disabled = available <= 0;
  if (bc) bc.disabled = available <= 0;
}

// ----------------------------------------------------------------
// LOG
// ----------------------------------------------------------------
function renderLog() {
  var container = document.getElementById('battle-log');
  if (!container) return;
  container.innerHTML = S.log.slice(0, 25).map(function(m, i){
    return '<div class="log-entry' + (i === 0 ? ' log-new' : '') + '">' + m + '</div>';
  }).join('');
}

// ----------------------------------------------------------------
// EVENT BOX
// ----------------------------------------------------------------
function renderEventBox() {
  var el = document.getElementById('event-box');
  if (!el) return;
  if (!S.events.active) { el.style.display = 'none'; return; }

  var evDef    = null;
  for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].id === S.events.active) { evDef = EVENTS[i]; break; }
  var remaining = Math.max(0, Math.ceil((S.events.activeEnd - Date.now()) / 1000));

  el.style.display = 'flex';
  el.innerHTML =
    '<img class="event-icon" src="' + ICONS[evDef ? evDef.icon : 'event'] + '" alt="" onerror="this.style.display=\'none\'">' +
    '<div>' +
      '<b>' + (evDef ? evDef.name : 'Event') + '</b>' +
      (evDef && evDef.duration > 0 ? ' <span class="event-timer">(' + remaining + 's)</span>' : '') +
      '<div>' + (evDef ? evDef.desc : '') + '</div>' +
    '</div>';
}
