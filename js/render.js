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
  renderTalents();
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

  var totalWorkers = Object.values(S.workers).reduce(function(a,b){ return a+b; },0);
  var wc = document.getElementById('worker-count');
  if (wc) wc.textContent = totalWorkers + ' hired';

  var html = '';
  for (var type in WORKER_DEFS) {
    var def      = WORKER_DEFS[type];
    var count    = S.workers[type] || 0;
    var cost     = workerCost(type);
    var afford   = S.resources.gold >= cost;
    var wIconHtml = WORKER_SVGS[type]
      ? '<div class="card-icon bsvg">' + WORKER_SVGS[type] + '</div>'
      : '<img class="card-icon" src="' + ICONS[def.icon] + '" alt="' + def.name + '" onerror="this.style.display=\'none\'">';
    html +=
      '<div class="worker-card">' +
      wIconHtml +
      '<div class="card-info">' +
        '<div class="card-name">' + def.name + ' <span class="card-count">' + count + '</span></div>' +
        '<div class="card-desc">' + def.desc + '</div>' +
      '</div>' +
      '<button class="btn-hire' + (afford ? '' : ' disabled') + '" onclick="hireWorker(\'' + type + '\')">' +
        'Hire<br><span class="cost">' + fmt(cost) + 'g</span>' +
      '</button>' +
      '</div>';
  }
  if (container.innerHTML !== html) container.innerHTML = html;
}

// ----------------------------------------------------------------
// BUILDINGS
// ----------------------------------------------------------------
function renderBuildings() {
  var container = document.getElementById('buildings-list');
  if (!container) return;

  var html = '';
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

    var iconHtml = BUILDING_SVGS[type]
      ? '<div class="card-icon bsvg">' + BUILDING_SVGS[type] + '</div>'
      : '<img class="card-icon" src="' + ICONS[def.icon] + '" alt="' + def.name + '" onerror="this.style.display=\'none\'">';

    html +=
      '<div class="building-card' + (!meetsR ? ' locked' : '') + '">' +
      iconHtml +
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
      '</button>' +
      '</div>';
  }
  if (container.innerHTML !== html) container.innerHTML = html;
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

  var html = '';
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

    var uIconHtml = UNIT_SVGS[type]
      ? '<div class="card-icon bsvg">' + UNIT_SVGS[type] + '</div>'
      : '<img class="card-icon" src="' + ICONS[def.icon] + '" alt="' + def.name + '" onerror="this.style.display=\'none\'">';
    html +=
      '<div class="unit-card' + (unlocked ? '' : ' locked') + '">' +
      uIconHtml +
      '<div class="card-info">' +
        '<div class="card-name">' + def.name + ' <span class="card-count">' + count + '</span></div>' +
        '<div class="card-desc">ATK ' + def.attack + ' | ' + def.upkeep + ' food/s upkeep</div>' +
        '<div class="card-cost">' + costStr + '</div>' +
      '</div>' +
      '<button class="' + btnClass + '" onclick="trainUnit(\'' + type + '\')"' + (!canTrain ? ' disabled' : '') + '>Train</button>' +
      '</div>';
  }
  if (container.innerHTML !== html) container.innerHTML = html;
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
// TALENTS
// ----------------------------------------------------------------
function renderTalents() {
  var overlay = document.getElementById('talent-overlay');
  var trees = ['economy', 'military', 'defense'];

  var available = getTalentPoints() - getSpentTalentPoints();
  var ptEl = document.getElementById('talent-pts');
  if (ptEl) ptEl.textContent = available + ' / ' + getTalentPoints();
  var ptEl2 = document.getElementById('talent-pts-modal');
  if (ptEl2) ptEl2.textContent = available + ' / ' + getTalentPoints();

  if (!overlay) return;

  trees.forEach(function(tree) {
    var wrap = document.getElementById('talent-tree-' + tree);
    if (!wrap) return;

    // Build a 4-row × 3-col grid of talent nodes
    // tier = row (0 top), col = column position
    var grid = [[null,null,null],[null,null,null],[null,null,null],[null,null,null]];
    TALENT_DEFS.filter(function(d){ return d.tree === tree; }).forEach(function(d){
      grid[d.tier][d.col] = d;
    });

    var html = '';
    for (var tier = 0; tier <= 3; tier++) {
      html += '<div class="tt-row">';
      for (var col = 0; col <= 2; col++) {
        var def = grid[tier][col];
        if (!def) {
          html += '<div class="tt-node tt-empty"></div>';
          continue;
        }
        var learned  = isTalentLearned(def.id);
        var canLearn = canLearnTalent(def.id);
        var blocked  = def.exclusive.some(function(eid){ return isTalentLearned(eid); });
        var prereqMet = countTreeTalents(tree) >= def.tier;
        var costStr  = Object.entries(def.cost).map(function(e){ return fmt(e[1]) + ' ' + e[0]; }).join(', ');

        var cls = 'tt-node';
        if (learned)        cls += ' tt-learned';
        else if (blocked)   cls += ' tt-blocked';
        else if (!prereqMet)cls += ' tt-locked';
        else if (canLearn)  cls += ' tt-available';
        else                cls += ' tt-noafford';

        html +=
          '<div class="' + cls + '" title="' + def.desc + (blocked? ' [Blocked by exclusive choice]':'') + '"' +
          ' onclick="learnTalent(\'' + def.id + '\')">' +
          '<div class="tt-icon">' + def.svg + '</div>' +
          '<div class="tt-name">' + def.name + '</div>' +
          (learned
            ? '<div class="tt-cost tt-done">✓ Learned</div>'
            : '<div class="tt-cost">' + (blocked ? '🔒 Excl.' : !prereqMet ? '🔒 Tier ' + def.tier : costStr) + '</div>') +
          '</div>';
      }
      html += '</div>';
      // Connector line between tiers (except after last)
      if (tier < 3) html += '<div class="tt-connector"></div>';
    }
    if (wrap.innerHTML !== html) wrap.innerHTML = html;
  });
}

function toggleTalentOverlay() {
  var overlay = document.getElementById('talent-overlay');
  if (!overlay) return;
  var isOpen = overlay.classList.toggle('open');
  if (isOpen) renderTalents();
}

// ----------------------------------------------------------------
// UPGRADES (stub kept so renderAll doesn't break in old saves)
// ----------------------------------------------------------------
function renderUpgrades() { renderTalents(); }

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

  var evIconKey = evDef ? evDef.icon : 'event';
  var evIconHtml = MISC_SVGS[evIconKey]
    ? '<div class="event-icon isvg">' + MISC_SVGS[evIconKey] + '</div>'
    : '<img class="event-icon" src="' + ICONS[evIconKey] + '" alt="" onerror="this.style.display=\'none\'">';

  el.style.display = 'flex';
  el.innerHTML =
    evIconHtml +
    '<div>' +
      '<b>' + (evDef ? evDef.name : 'Event') + '</b>' +
      (evDef && evDef.duration > 0 ? ' <span class="event-timer">(' + remaining + 's)</span>' : '') +
      '<div>' + (evDef ? evDef.desc : '') + '</div>' +
    '</div>';
}
