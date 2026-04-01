// ================================================================
// KINGDOM CLICKER – js/state.js
// Game state: schema, save/load, reset.
// Depends on: config.js (BUILDING_DEFS, AGE_NAMES)
// ================================================================

function defaultState() {
  return {
    tick: 0,
    resources: { gold: 50, food: 20, wood: 30, stone: 0 },
    workers:   { farmers: 0, woodcutters: 0, miners: 0, taxcollectors: 0 },
    buildings: { farms:0, lumbermills:0, quarries:0, markets:0, barracks:0,
                 stables:0, archerranges:0, siegeworkshops:0, walls:0, towers:0, castles:0 },
    army:      { spearmen:0, archers:0, knights:0, siege:0 },
    upgrades:  [],

    prestige: { level: 0, points: 0, spent: 0, bonuses: { prodMult: 1, clickMult: 1 } },
    hero:     { unlocked: false, xp: 0, level: 1, active: false },

    combat: {
      wins: 0, losses: 0, loot: 0,
      lastRaid: 0, strategy: 'balanced',
    },
    stats: {
      totalGoldEarned: 0, totalClicks: 0, totalBattles: 0,
      startTime: Date.now(),
    },
    events: {
      active: null, activeEnd: 0, nextEvent: 0,
      foodBoost: 1.0, goldBoost: 1.0, heroBoost: 1.0,
    },
    log: [],

    // Derived multipliers – recalculated by reapplyUpgrades()
    clickMult:     1,
    clickBonus:    0,
    workerMult:    1,
    attackMult:    1,
    lossReduction: 0,
    raidDefense:   0,
    towerBonus:    0,
    armyCap:       100,

    // Internal accumulator (not saved)
    _towerDmgAccum: 0,
  };
}

// Mutable global game state (accessible to all scripts)
var S = null;

function initState() {
  S = loadGame() || defaultState();
}

// ----------------------------------------------------------------
// SAVE / LOAD
// ----------------------------------------------------------------
function saveGame() {
  try {
    var snapshot = JSON.parse(JSON.stringify(S));
    delete snapshot._towerDmgAccum;
    localStorage.setItem('kc_save_v2', JSON.stringify(snapshot));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

function loadGame() {
  try {
    var raw = localStorage.getItem('kc_save_v2');
    if (!raw) return null;
    var loaded = JSON.parse(raw);
    return deepMerge(defaultState(), loaded);
  } catch (e) {
    console.warn('Load failed', e);
    return null;
  }
}

function deepMerge(target, source) {
  var result = Object.assign({}, target);
  for (var key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ----------------------------------------------------------------
// PRESTIGE RESET
// ----------------------------------------------------------------
function resetGame() {
  if (!confirm('Reset all progress? You will receive Prestige Crown Points based on gold earned.')) return;

  var pts = Math.floor(Math.sqrt(S.stats.totalGoldEarned / 1000000));
  var ns = defaultState();

  ns.prestige.level  = S.prestige.level + pts;
  ns.prestige.points = S.prestige.level + pts;
  ns.prestige.bonuses.prodMult  = 1 + ns.prestige.level * 0.10;
  ns.prestige.bonuses.clickMult = 1 + ns.prestige.level * 0.05;

  S = ns;
  reapplyUpgrades();
  renderAll();
  renderMap();
  if (pts > 0) addNotification('Prestige! +' + pts + ' Crown Points earned!');
  addLog('The kingdom resets... but your legacy endures.');
}
