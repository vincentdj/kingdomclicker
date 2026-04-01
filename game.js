// ================================================================
// KINGDOM CLICKER: AGE OF EMPIRES
// ================================================================

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------
function gi(author, slug, fg = 'c8a96e', bg = '1a0e00') {
  return `https://game-icons.net/icons/${fg}/${bg}/1x1/${author}/${slug}.svg`;
}

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function fmtRate(n) {
  return n.toFixed(1);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ----------------------------------------------------------------
// DEFINITIONS
// ----------------------------------------------------------------
const ICONS = {
  gold:         gi('delapouite', 'two-coins',        'ffd700', '1a0e00'),
  food:         gi('delapouite', 'wheat',             '90c050', '1a0e00'),
  wood:         gi('lorc',       'wood-beam',         'c87941', '1a0e00'),
  stone:        gi('lorc',       'stone-block',       'b0a090', '1a0e00'),
  farmer:       gi('delapouite', 'farmer',            'c8a96e', '1a0e00'),
  woodcutter:   gi('lorc',       'axe',               'c87941', '1a0e00'),
  miner:        gi('lorc',       'mine-wagon',        'b0a090', '1a0e00'),
  taxcollector: gi('delapouite', 'coins',             'ffd700', '1a0e00'),
  spearman:     gi('lorc',       'spear-head',        'c8c8c8', '1a0e00'),
  archer:       gi('lorc',       'archer',            '90c050', '1a0e00'),
  knight:       gi('delapouite', 'knight-helmet',     'c8a96e', '1a0e00'),
  siege:        gi('lorc',       'catapult',          'b0a090', '1a0e00'),
  farm:         gi('delapouite', 'farm',              '90c050', '1a0e00'),
  lumbermill:   gi('delapouite', 'wood-axe',          'c87941', '1a0e00'),
  quarry:       gi('lorc',       'stone-block',       'b0a090', '1a0e00'),
  market:       gi('delapouite', 'market',            'ffd700', '1a0e00'),
  barracks:     gi('delapouite', 'barracks',          'c8c8c8', '1a0e00'),
  stable:       gi('delapouite', 'horse',             'c87941', '1a0e00'),
  archery:      gi('lorc',       'bow-arrow',         '90c050', '1a0e00'),
  siege_ws:     gi('lorc',       'siege-ram',         'b0a090', '1a0e00'),
  walls:        gi('lorc',       'stone-wall',        'b0a090', '1a0e00'),
  tower:        gi('lorc',       'watchtower',        'c8a96e', '1a0e00'),
  castle:       gi('delapouite', 'castle',            'ffd700', '1a0e00'),
  sword:        gi('lorc',       'crossed-swords',    'c8c8c8', '1a0e00'),
  shield:       gi('lorc',       'shield',            'c8a96e', '1a0e00'),
  crown:        gi('delapouite', 'imperial-crown',    'ffd700', '1a0e00'),
  upgrade:      gi('delapouite', 'upgrade',           'ffd700', '1a0e00'),
  event:        gi('lorc',       'star-swirl',        'c8a96e', '1a0e00'),
  hero:         gi('delapouite', 'knight',            'ffd700', '1a0e00'),
  skull:        gi('lorc',       'skull',             'c8c8c8', '1a0e00'),
  fire:         gi('lorc',       'fire',              'ff6020', '1a0e00'),
};

// Worker definitions
const WORKER_DEFS = {
  farmers:       { name: 'Farmer',         icon: 'farmer',       resource: 'food',  rate: 1.2,  baseCost: 10,  desc: '+1.2 food/s' },
  woodcutters:   { name: 'Woodcutter',     icon: 'woodcutter',   resource: 'wood',  rate: 1.0,  baseCost: 12,  desc: '+1.0 wood/s' },
  miners:        { name: 'Miner',          icon: 'miner',        resource: 'stone', rate: 0.6,  baseCost: 15,  desc: '+0.6 stone/s' },
  taxcollectors: { name: 'Tax Collector',  icon: 'taxcollector', resource: 'gold',  rate: 1.0,  baseCost: 20,  desc: '+1.0 gold/s' },
};

// Building definitions
const BUILDING_DEFS = {
  farms:         { name: 'Farm',           icon: 'farm',     max: 10,  costs: {wood:50},              effect: {food:5},      desc: '+5 food/s per farm',       requires: null },
  lumbermills:   { name: 'Lumber Mill',    icon: 'lumbermill', max: 10, costs: {wood:30,stone:20},    effect: {wood:3},      desc: '+3 wood/s per mill',       requires: null },
  quarries:      { name: 'Quarry',         icon: 'quarry',   max: 10,  costs: {wood:40,stone:30},      effect: {stone:2},     desc: '+2 stone/s per quarry',    requires: null },
  markets:       { name: 'Market',         icon: 'market',   max: 3,   costs: {gold:100,wood:50,stone:50}, effect: {goldMult:0.2}, desc: '+20% gold income per market', requires: null },
  barracks:      { name: 'Barracks',       icon: 'barracks', max: 1,   costs: {wood:80,stone:40},     effect: {unlock:'spearman'}, desc: 'Unlock Spearmen',     requires: null },
  stables:       { name: 'Stable',         icon: 'stable',   max: 1,   costs: {wood:100,stone:60},    effect: {unlock:'knight'},   desc: 'Unlock Knights',      requires: 'barracks' },
  archerranges:  { name: 'Archery Range',  icon: 'archery',  max: 1,   costs: {wood:70,stone:30},     effect: {unlock:'archer'},   desc: 'Unlock Archers',      requires: null },
  siegeworkshops:{ name: 'Siege Workshop', icon: 'siege_ws', max: 1,   costs: {wood:150,stone:100},   effect: {unlock:'siege'},    desc: 'Unlock Siege units',  requires: 'barracks' },
  walls:         { name: 'Wall',           icon: 'walls',    max: 5,   costs: {stone:60},             effect: {defense:0.05},      desc: '-5% losses per wall', requires: null },
  towers:        { name: 'Tower',          icon: 'tower',    max: 5,   costs: {wood:50,stone:80},     effect: {autoDmg:5},         desc: '+5 auto-dmg/s',       requires: null },
  castles:       { name: 'Castle',         icon: 'castle',   max: 1,   costs: {gold:500,wood:500,stone:500}, effect: {allBonus:0.5}, desc: '+50% all production, unlock hero', requires: 'walls' },
};

// Unit definitions
const UNIT_DEFS = {
  spearmen: { name: 'Spearman', icon: 'spearman', attack: 10, costs: {gold:30,food:10},  upkeep: 0.5, requires: 'barracks' },
  archers:  { name: 'Archer',   icon: 'archer',   attack: 15, costs: {gold:50,food:15},  upkeep: 0.6, requires: 'archerranges' },
  knights:  { name: 'Knight',   icon: 'knight',   attack: 30, costs: {gold:100,food:30}, upkeep: 1.0, requires: 'stables' },
  siege:    { name: 'Siege',    icon: 'siege',    attack: 50, costs: {gold:200,wood:50},  upkeep: 0.5, requires: 'siegeworkshops' },
};

// Upgrade definitions
const UPGRADE_DEFS = [
  // Economy
  { id:'eco1',  name:'Better Tools',        tree:'economy',  level:1, cost:{gold:100},             icon:'upgrade',  desc:'+50% click value',           effect:(s)=>{ s.clickMult *= 1.5; } },
  { id:'eco2',  name:'Tax Reform',          tree:'economy',  level:1, cost:{gold:250},             icon:'upgrade',  desc:'+1 gold per click',          effect:(s)=>{ s.clickBonus += 1; } },
  { id:'eco3',  name:'Trade Routes',        tree:'economy',  level:2, cost:{gold:500,wood:100},    icon:'market',   desc:'+25% worker output',         effect:(s)=>{ s.workerMult *= 1.25; } },
  { id:'eco4',  name:'Guild System',        tree:'economy',  level:2, cost:{gold:1000,stone:200},  icon:'market',   desc:'+50% worker output',         effect:(s)=>{ s.workerMult *= 1.5; } },
  { id:'eco5',  name:'Imperial Economy',   tree:'economy',  level:3, cost:{gold:5000,wood:500,stone:500}, icon:'crown', desc:'Double all resource production', effect:(s)=>{ s.workerMult *= 2; } },
  // Military
  { id:'mil1',  name:'Iron Weapons',        tree:'military', level:1, cost:{gold:200,wood:50},     icon:'sword',    desc:'+25% unit attack',           effect:(s)=>{ s.attackMult *= 1.25; } },
  { id:'mil2',  name:'Heavy Armor',         tree:'military', level:1, cost:{gold:300,stone:80},    icon:'shield',   desc:'-20% battle losses',         effect:(s)=>{ s.lossReduction += 0.2; } },
  { id:'mil3',  name:'Tactics Manual',      tree:'military', level:2, cost:{gold:600,wood:100},    icon:'sword',    desc:'+50% unit attack',           effect:(s)=>{ s.attackMult *= 1.5; } },
  { id:'mil4',  name:'War Drums',           tree:'military', level:2, cost:{gold:800,food:200},    icon:'sword',    desc:'+25% army size capacity',    effect:(s)=>{ s.armyCap += 50; } },
  { id:'mil5',  name:'Imperial Legion',     tree:'military', level:3, cost:{gold:3000,stone:300},  icon:'knight',   desc:'+100% attack, -30% losses',  effect:(s)=>{ s.attackMult *= 2; s.lossReduction += 0.3; } },
  // Defense
  { id:'def1',  name:'Reinforced Gates',    tree:'defense',  level:1, cost:{wood:150,stone:100},   icon:'walls',    desc:'-15% losses from raids',     effect:(s)=>{ s.raidDefense += 0.15; } },
  { id:'def2',  name:'Garrison Training',   tree:'defense',  level:1, cost:{gold:400,food:100},    icon:'shield',   desc:'+2 auto-dmg from towers',    effect:(s)=>{ s.towerBonus += 2; } },
  { id:'def3',  name:'Moat Construction',   tree:'defense',  level:2, cost:{wood:200,stone:200},   icon:'walls',    desc:'-25% losses from raids',     effect:(s)=>{ s.raidDefense += 0.25; } },
  { id:'def4',  name:'Ballista Towers',     tree:'defense',  level:2, cost:{gold:1500,wood:300},   icon:'tower',    desc:'+5 auto-dmg from towers',    effect:(s)=>{ s.towerBonus += 5; } },
  { id:'def5',  name:'Impenetrable Walls',  tree:'defense',  level:3, cost:{gold:2000,stone:500},  icon:'castle',   desc:'-40% losses from all battles', effect:(s)=>{ s.raidDefense += 0.4; s.lossReduction += 0.1; } },
];

// Events
const EVENTS = [
  { id:'harvest',  name:'Golden Harvest',    icon:'food',   desc:'Abundant crops! +300% food production for 30s.',
    apply:(s)=>{ s.events.foodBoost = 3.0; },   remove:(s)=>{ s.events.foodBoost = 1.0; }, duration:30 },
  { id:'bandits',  name:'Bandit Raid',        icon:'skull',  desc:'Bandits attack! Lose gold unless you have an army.',
    apply:(s)=>{ applyBanditRaid(s); },          remove:()=>{},                               duration:0  },
  { id:'hero',     name:'Wandering Hero',     icon:'hero',   desc:'A hero joins your cause! +50% army power for 60s.',
    apply:(s)=>{ s.events.heroBoost = 1.5; },   remove:(s)=>{ s.events.heroBoost = 1.0; }, duration:60 },
  { id:'fire',     name:'Forest Fire',        icon:'fire',   desc:'Fire ravages the forest! Lose 100 wood.',
    apply:(s)=>{ s.resources.wood = Math.max(0, s.resources.wood - 100); }, remove:()=>{}, duration:0 },
  { id:'traders',  name:'Merchant Caravan',   icon:'market', desc:'Traders visit! +200% gold production for 20s.',
    apply:(s)=>{ s.events.goldBoost = 2.0; },   remove:(s)=>{ s.events.goldBoost = 1.0; }, duration:20 },
];

function applyBanditRaid(s) {
  const totalArmy = Object.values(s.army).reduce((a, b) => a + b, 0);
  if (totalArmy < 5) {
    const loss = Math.min(s.resources.gold, rand(50, 200));
    s.resources.gold -= loss;
    addLog(`Bandits stole ${fmt(loss)} gold! Train more troops!`);
  } else {
    addLog('Bandits were driven off by your army!');
  }
}

// ----------------------------------------------------------------
// GAME STATE
// ----------------------------------------------------------------
const defaultState = () => ({
  tick: 0,
  resources: { gold: 50, food: 20, wood: 30, stone: 0 },
  workers:   { farmers: 0, woodcutters: 0, miners: 0, taxcollectors: 0 },
  buildings: { farms:0, lumbermills:0, quarries:0, markets:0, barracks:0, stables:0, archerranges:0, siegeworkshops:0, walls:0, towers:0, castles:0 },
  army:      { spearmen:0, archers:0, knights:0, siege:0 },
  upgrades:  [],       // array of purchased upgrade ids
  prestige:  { level: 0, points: 0, spent: 0, bonuses: { prodMult: 1, clickMult: 1 } },
  hero:      { unlocked: false, xp: 0, level: 1, active: false },
  combat:    { wins: 0, losses: 0, loot: 0, lastRaid: 0, raidWarning: false, strategy: 'balanced' },
  stats:     { totalGoldEarned: 0, totalClicks: 0, totalBattles: 0, startTime: Date.now() },
  events:    { active: null, activeEnd: 0, lastEvent: 0, nextEvent: 0, foodBoost: 1.0, goldBoost: 1.0, heroBoost: 1.0 },
  log:       [],

  // Derived multipliers (recalculated from upgrades)
  clickMult:     1,
  clickBonus:    0,
  workerMult:    1,
  attackMult:    1,
  lossReduction: 0,
  raidDefense:   0,
  towerBonus:    0,
  armyCap:       100,
});

let S = loadGame() || defaultState();
let lastTickTime = Date.now();
let renderPending = false;

// ----------------------------------------------------------------
// SAVE / LOAD
// ----------------------------------------------------------------
function saveGame() {
  const save = JSON.parse(JSON.stringify(S));
  // Don't save functions
  localStorage.setItem('kc_save', JSON.stringify(save));
}

function loadGame() {
  try {
    const raw = localStorage.getItem('kc_save');
    if (!raw) return null;
    const loaded = JSON.parse(raw);
    // Merge with defaults to handle version differences
    const def = defaultState();
    return deepMerge(def, loaded);
  } catch(e) {
    return null;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function resetGame() {
  if (!confirm('Reset all progress? You will receive Prestige points for your earned gold.')) return;
  const prestigePts = Math.floor(Math.sqrt(S.stats.totalGoldEarned / 1000000));
  const newState = defaultState();
  newState.prestige.level = S.prestige.level + prestigePts;
  newState.prestige.points = S.prestige.level + prestigePts;
  if (prestigePts > 0) {
    newState.prestige.bonuses.prodMult = 1 + (newState.prestige.level * 0.1);
    newState.prestige.bonuses.clickMult = 1 + (newState.prestige.level * 0.05);
    addNotification(`🏆 Prestige! +${prestigePts} Crown Points earned!`);
  }
  S = newState;
  reapplyUpgrades();
  renderAll();
  addLog('The kingdom resets... but your legacy endures.');
}

// ----------------------------------------------------------------
// CORE GAME LOGIC
// ----------------------------------------------------------------

// Calculate current rates per second (called in render & tick)
function calcRates() {
  const pBonus = S.prestige.bonuses.prodMult || 1;
  const wm = S.workerMult * pBonus;
  const castleBonus = S.buildings.castles > 0 ? 1.5 : 1.0;
  const foodBoost = S.events.foodBoost || 1.0;
  const goldBoost = S.events.goldBoost || 1.0;

  const farmRate   = (S.workers.farmers      * WORKER_DEFS.farmers.rate +
                      S.buildings.farms       * 5) * wm * foodBoost * castleBonus;
  const woodRate   = (S.workers.woodcutters   * WORKER_DEFS.woodcutters.rate +
                      S.buildings.lumbermills * 3) * wm * castleBonus;
  const stoneRate  = (S.workers.miners        * WORKER_DEFS.miners.rate +
                      S.buildings.quarries    * 2) * wm * castleBonus;

  const marketMult = 1 + (S.buildings.markets * 0.2);
  const goldRate   = (S.workers.taxcollectors * WORKER_DEFS.taxcollectors.rate) *
                     marketMult * wm * goldBoost * castleBonus;

  // Auto damage from towers
  const towerDmg = S.buildings.towers * (5 + S.towerBonus);

  return { gold: goldRate, food: farmRate, wood: woodRate, stone: stoneRate, towerDmg };
}

function tickGame(dt) {
  // dt = elapsed seconds
  const rates = calcRates();

  // Produce resources
  S.resources.gold  = Math.min(S.resources.gold  + rates.gold  * dt, getMaxResource('gold'));
  S.resources.food  = Math.min(S.resources.food  + rates.food  * dt, getMaxResource('food'));
  S.resources.wood  = Math.min(S.resources.wood  + rates.wood  * dt, getMaxResource('wood'));
  S.resources.stone = Math.min(S.resources.stone + rates.stone * dt, getMaxResource('stone'));

  // Army food upkeep
  let totalUpkeep = 0;
  for (const [type, count] of Object.entries(S.army)) {
    totalUpkeep += count * (UNIT_DEFS[type]?.upkeep || 0);
  }
  S.resources.food -= totalUpkeep * dt;

  // Starvation
  if (S.resources.food < 0) {
    S.resources.food = 0;
    // Desertion
    const totalArmy = Object.values(S.army).reduce((a,b)=>a+b, 0);
    if (totalArmy > 0 && Math.random() < 0.1 * dt) {
      // Lose a random unit
      const types = Object.keys(S.army).filter(t => S.army[t] > 0);
      if (types.length) {
        const t = types[Math.floor(Math.random() * types.length)];
        S.army[t] = Math.max(0, S.army[t] - 1);
        addLog('A soldier deserted due to lack of food!');
      }
    }
  }

  // Tower auto-damage (accumulate and apply in combat)
  S._towerDmgAccum = (S._towerDmgAccum || 0) + rates.towerDmg * dt;

  S.tick++;

  // Events
  handleEventTick(dt);

  // Check passive raid
  handleRaidTick(dt);
}

function getMaxResource(res) {
  const base = { gold: 2000, food: 1000, wood: 1000, stone: 1000 };
  const castleBonus = S.buildings.castles > 0 ? 5 : 1;
  return base[res] * castleBonus * (1 + S.prestige.level * 0.1);
}

// ----------------------------------------------------------------
// EVENTS & RAIDS
// ----------------------------------------------------------------

function handleEventTick(dt) {
  const now = Date.now();

  // Active event countdown
  if (S.events.active && now > S.events.activeEnd) {
    const evDef = EVENTS.find(e => e.id === S.events.active);
    if (evDef && evDef.remove) evDef.remove(S);
    S.events.active = null;
    renderEventBox();
  }

  // Schedule next event
  if (!S.events.nextEvent || S.events.nextEvent === 0) {
    S.events.nextEvent = Date.now() + rand(30000, 90000);
  }

  // Trigger event?
  if (!S.events.active && now >= S.events.nextEvent) {
    triggerRandomEvent();
    S.events.nextEvent = Date.now() + rand(30000, 90000);
  }
}

function triggerRandomEvent() {
  const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  S.events.active = ev.id;
  S.events.activeEnd = ev.duration > 0 ? Date.now() + ev.duration * 1000 : Date.now() + 1;
  ev.apply(S);
  addNotification(`Event: ${ev.name} — ${ev.desc}`);
  addLog(`📯 Event: ${ev.name}`);
  renderEventBox();
}

function handleRaidTick(dt) {
  const now = Date.now();
  // First raid after 60s, then every 60-120s
  if (!S.combat.lastRaid) S.combat.lastRaid = now;
  const nextRaid = S.combat.lastRaid + rand(60000, 120000);
  if (now >= nextRaid) {
    triggerEnemyRaid();
    S.combat.lastRaid = now;
  }
}

function triggerEnemyRaid() {
  const age = getCurrentAge();
  const enemyPower = rand(age * 50, age * 150) + S.combat.wins * 10;
  const playerPower = calcArmyPower();
  const wallDefense = S.buildings.walls * 0.05 + S.raidDefense;
  const effectiveEnemyPower = enemyPower * (1 - wallDefense);
  const towerDmg = S._towerDmgAccum || 0;
  S._towerDmgAccum = 0;

  const reducedEnemy = Math.max(0, effectiveEnemyPower - towerDmg);

  if (playerPower > reducedEnemy * 0.5) {
    // Defend successfully
    const losses = Math.floor(Object.values(S.army).reduce((a,b)=>a+b,0) *
      (reducedEnemy / Math.max(playerPower, 1)) * (1 - S.lossReduction) * 0.3);
    applyLosses(losses);
    addNotification(`Enemy raid repelled! Lost ${losses} troops.`);
    addLog(`⚔️ Raiders attacked! You defended. Lost ~${losses} troops.`);
  } else {
    // Raid succeeds
    const goldLoss = Math.min(S.resources.gold, reducedEnemy * 2);
    S.resources.gold -= goldLoss;
    addLog(`💀 Raiders breached your walls! Lost ${fmt(goldLoss)} gold!`);
    addNotification(`Raid breached! Lost ${fmt(goldLoss)} gold! Build more defenses!`);
  }
}

// ----------------------------------------------------------------
// COMBAT
// ----------------------------------------------------------------
function calcArmyPower() {
  let power = 0;
  for (const [type, count] of Object.entries(S.army)) {
    power += count * (UNIT_DEFS[type]?.attack || 0) * S.attackMult;
  }
  power *= (S.events.heroBoost || 1.0);
  return power;
}

function getTotalArmy() {
  return Object.values(S.army).reduce((a,b)=>a+b,0);
}

function launchAttack() {
  const totalArmy = getTotalArmy();
  if (totalArmy < 1) {
    addLog('You have no army to attack with!');
    return;
  }

  const age = getCurrentAge();
  const playerPower = calcArmyPower();
  const stratMods = { aggressive: {dmg:1.3, loss:1.3}, defensive: {dmg:0.8, loss:0.5}, balanced: {dmg:1.0, loss:1.0} };
  const mod = stratMods[S.combat.strategy] || stratMods.balanced;

  const enemyPower = rand(age * 40, age * 120) + S.combat.wins * 8;
  const adjPlayerPower = playerPower * mod.dmg;

  const result = adjPlayerPower - enemyPower;
  S.stats.totalBattles++;

  const loot = Math.floor(enemyPower * rand(0.8, 1.5));

  if (result >= 0) {
    // Victory
    const lossCount = Math.floor(totalArmy * (enemyPower / Math.max(adjPlayerPower, 1)) * (1 - S.lossReduction) * mod.loss * 0.4);
    applyLosses(lossCount);
    S.resources.gold += loot;
    S.stats.totalGoldEarned += loot;
    S.combat.wins++;
    S.combat.loot += loot;

    // Hero XP
    if (S.hero.active) {
      S.hero.xp += 10 + lossCount;
      checkHeroLevelUp();
    }

    addLog(`⚔️ Victory! Looted ${fmt(loot)} gold. Lost ${lossCount} troops.`);
    addNotification(`Victory! +${fmt(loot)} gold plundered!`);
    showFloatingText(`+${fmt(loot)} gold!`, document.getElementById('btn-attack'));
  } else {
    // Defeat
    const lossCount = Math.floor(totalArmy * 0.3 * mod.loss * (1 - S.lossReduction));
    applyLosses(lossCount);
    S.combat.losses++;
    addLog(`💀 Defeat! The enemy was too strong. Lost ${lossCount} troops.`);
    addNotification(`Defeat! Your army was routed. Lost ${lossCount} troops.`);
  }

  renderAll();
}

function applyLosses(count) {
  let remaining = count;
  // Remove units, spread across types
  const types = ['spearmen', 'archers', 'knights', 'siege'];
  for (const t of types) {
    if (remaining <= 0) break;
    const lose = Math.min(S.army[t], remaining);
    S.army[t] -= lose;
    remaining -= lose;
  }
}

function getCurrentAge() {
  const total = Object.values(S.buildings).reduce((a,b)=>a+b,0);
  const goldEarned = S.stats.totalGoldEarned;
  if (goldEarned > 500000 || S.buildings.castles > 0) return 4; // Imperial
  if (goldEarned > 50000  || total > 15) return 3; // Castle
  if (goldEarned > 5000   || total > 5)  return 2; // Feudal
  return 1; // Dark
}

const AGE_NAMES = ['', 'Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];

// ----------------------------------------------------------------
// CLICK
// ----------------------------------------------------------------
function clickKingdom(e) {
  const prestigeBonus = S.prestige.bonuses.clickMult || 1;
  const marketMult = 1 + (S.buildings.markets * 0.2);
  const goldGained = (S.clickBonus + 1) * S.clickMult * prestigeBonus * marketMult;

  // Crit chance 5%
  let finalGold = goldGained;
  let crit = false;
  if (Math.random() < 0.05) {
    finalGold *= 5;
    crit = true;
  }

  S.resources.gold = Math.min(S.resources.gold + finalGold, getMaxResource('gold'));
  S.stats.totalGoldEarned += finalGold;
  S.stats.totalClicks++;

  const btn = document.getElementById('btn-collect');
  if (btn && e) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    showFloatingText(
      crit ? `CRIT! +${fmt(finalGold)}` : `+${fmt(finalGold)}`,
      btn, x, y, crit ? '#ffd700' : '#c8a96e'
    );
  }
  renderResources();
}

// ----------------------------------------------------------------
// WORKERS
// ----------------------------------------------------------------
function workerCost(type) {
  const def = WORKER_DEFS[type];
  const count = S.workers[type] || 0;
  return Math.ceil(def.baseCost * Math.pow(1.15, count));
}

function hireWorker(type) {
  const cost = workerCost(type);
  if (S.resources.gold < cost) {
    addLog(`Not enough gold to hire a ${WORKER_DEFS[type].name}!`);
    return;
  }
  S.resources.gold -= cost;
  S.workers[type] = (S.workers[type] || 0) + 1;
  renderWorkers();
  renderResources();
  renderRates();
}

// ----------------------------------------------------------------
// BUILDINGS
// ----------------------------------------------------------------
function canAffordBuilding(type) {
  const def = BUILDING_DEFS[type];
  for (const [res, amount] of Object.entries(def.costs)) {
    if ((S.resources[res] || 0) < amount) return false;
  }
  return true;
}

function meetsBuildingRequires(type) {
  const def = BUILDING_DEFS[type];
  if (!def.requires) return true;
  return (S.buildings[def.requires] || 0) > 0;
}

function buildBuilding(type) {
  const def = BUILDING_DEFS[type];
  if (!meetsBuildingRequires(type)) {
    addLog(`Requires ${BUILDING_DEFS[def.requires]?.name || def.requires} first!`);
    return;
  }
  if ((S.buildings[type] || 0) >= def.max) {
    addLog(`${def.name} is at maximum capacity!`);
    return;
  }
  if (!canAffordBuilding(type)) {
    addLog(`Not enough resources to build ${def.name}!`);
    return;
  }
  for (const [res, amount] of Object.entries(def.costs)) {
    S.resources[res] -= amount;
  }
  S.buildings[type] = (S.buildings[type] || 0) + 1;
  addLog(`🏗️ Built: ${def.name}!`);
  renderBuildings();
  renderResources();
  renderRates();
  renderArmy(); // might unlock units
  renderMap();
  checkAgeUp();
}

// ----------------------------------------------------------------
// ARMY
// ----------------------------------------------------------------
function isUnitUnlocked(type) {
  const def = UNIT_DEFS[type];
  return (S.buildings[def.requires] || 0) > 0;
}

function trainUnit(type) {
  if (!isUnitUnlocked(type)) {
    const def = UNIT_DEFS[type];
    addLog(`Build ${BUILDING_DEFS[def.requires]?.name} first!`);
    return;
  }
  if (getTotalArmy() >= S.armyCap) {
    addLog(`Army at maximum capacity (${S.armyCap})! Buy army upgrades.`);
    return;
  }
  const def = UNIT_DEFS[type];
  for (const [res, amount] of Object.entries(def.costs)) {
    if ((S.resources[res] || 0) < amount) {
      addLog(`Not enough resources to train ${def.name}!`);
      return;
    }
  }
  for (const [res, amount] of Object.entries(def.costs)) {
    S.resources[res] -= amount;
  }
  S.army[type] = (S.army[type] || 0) + 1;
  renderArmy();
  renderResources();
}

// ----------------------------------------------------------------
// UPGRADES
// ----------------------------------------------------------------
function reapplyUpgrades() {
  S.clickMult = 1;
  S.clickBonus = 0;
  S.workerMult = 1;
  S.attackMult = 1;
  S.lossReduction = 0;
  S.raidDefense = 0;
  S.towerBonus = 0;
  S.armyCap = 100;
  for (const id of S.upgrades) {
    const def = UPGRADE_DEFS.find(u => u.id === id);
    if (def) def.effect(S);
  }
  // Prestige bonuses
  const pm = S.prestige.bonuses.prodMult || 1;
  S.workerMult *= pm;
  S.clickMult  *= (S.prestige.bonuses.clickMult || 1);
}

function isUpgradePurchased(id) {
  return S.upgrades.includes(id);
}

function canAffordUpgrade(def) {
  for (const [res, amount] of Object.entries(def.cost)) {
    if ((S.resources[res] || 0) < amount) return false;
  }
  return true;
}

function buyUpgrade(id) {
  if (isUpgradePurchased(id)) return;
  const def = UPGRADE_DEFS.find(u => u.id === id);
  if (!def) return;
  if (!canAffordUpgrade(def)) {
    addLog(`Not enough resources for ${def.name}!`);
    return;
  }
  for (const [res, amount] of Object.entries(def.cost)) {
    S.resources[res] -= amount;
  }
  S.upgrades.push(id);
  def.effect(S);
  addLog(`✨ Researched: ${def.name}!`);
  addNotification(`Research complete: ${def.name}`);
  renderUpgrades();
  renderResources();
}

// ----------------------------------------------------------------
// PRESTIGE
// ----------------------------------------------------------------
function calcPrestigePts() {
  return Math.floor(Math.sqrt(S.stats.totalGoldEarned / 1000000));
}

function spendPrestigePoint(bonus) {
  if (S.prestige.points <= S.prestige.spent) {
    addLog('No Crown Points available!');
    return;
  }
  S.prestige.spent++;
  if (bonus === 'prod') {
    S.prestige.bonuses.prodMult = (S.prestige.bonuses.prodMult || 1) + 0.1;
    addLog('+10% production from Crown Point.');
  } else if (bonus === 'click') {
    S.prestige.bonuses.clickMult = (S.prestige.bonuses.clickMult || 1) + 0.05;
    addLog('+5% click power from Crown Point.');
  }
  reapplyUpgrades();
  renderPrestige();
}

// ----------------------------------------------------------------
// HERO
// ----------------------------------------------------------------
function checkHeroLevelUp() {
  const xpNeeded = S.hero.level * 100;
  if (S.hero.xp >= xpNeeded) {
    S.hero.xp -= xpNeeded;
    S.hero.level++;
    addLog(`🦸 Hero leveled up! Now level ${S.hero.level}!`);
    addNotification(`Hero reached level ${S.hero.level}!`);
  }
}

// ----------------------------------------------------------------
// AGE / MILESTONES
// ----------------------------------------------------------------
let _lastAge = 1;
function checkAgeUp() {
  const age = getCurrentAge();
  if (age > _lastAge) {
    _lastAge = age;
    addLog(`🎺 Your kingdom enters the ${AGE_NAMES[age]}!`);
    addNotification(`New Age: ${AGE_NAMES[age]}!`);
    renderKingdom();
  }
}

// ----------------------------------------------------------------
// LOG & NOTIFICATIONS
// ----------------------------------------------------------------
function addLog(msg) {
  S.log.unshift(msg);
  if (S.log.length > 50) S.log.pop();
  renderLog();
}

let notifQueue = [];
function addNotification(msg) {
  const el = document.createElement('div');
  el.className = 'notification';
  el.textContent = msg;
  document.getElementById('notifications').appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 600);
  }, 3500);
}

// ----------------------------------------------------------------
// FLOATING TEXT
// ----------------------------------------------------------------
function showFloatingText(text, parentEl, x, y, color = '#c8a96e') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.color = color;
  el.style.left = (x || (parentEl?.offsetWidth / 2) || 50) + 'px';
  el.style.top  = (y || 10) + 'px';
  parentEl.style.position = 'relative';
  parentEl.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ----------------------------------------------------------------
// RENDER FUNCTIONS
// ----------------------------------------------------------------
function renderAll() {
  renderResources();
  renderRates();
  renderKingdom();
  renderWorkers();
  renderBuildings();
  renderArmy();
  renderUpgrades();
  renderPrestige();
  renderLog();
  renderEventBox();
  renderCombat();
  renderMap();
}

function renderResources() {
  const res = ['gold', 'food', 'wood', 'stone'];
  for (const r of res) {
    const el = document.getElementById(`res-${r}`);
    if (el) el.textContent = fmt(S.resources[r]);
    const maxEl = document.getElementById(`res-${r}-max`);
    if (maxEl) maxEl.textContent = fmt(getMaxResource(r));
  }
}

function renderRates() {
  const rates = calcRates();
  const map = { gold: rates.gold, food: rates.food, wood: rates.wood, stone: rates.stone };
  for (const [r, rate] of Object.entries(map)) {
    const el = document.getElementById(`rate-${r}`);
    if (el) el.textContent = rate > 0 ? `+${fmtRate(rate)}/s` : '0/s';
  }
  // Army upkeep
  let upkeep = 0;
  for (const [t,c] of Object.entries(S.army)) upkeep += c * (UNIT_DEFS[t]?.upkeep || 0);
  const upEl = document.getElementById('rate-food');
  if (upEl && upkeep > 0) upEl.textContent = `+${fmtRate(rates.food)}/s (-${fmtRate(upkeep)})`;
}

function renderKingdom() {
  const age = getCurrentAge();
  const ageEl = document.getElementById('current-age');
  if (ageEl) ageEl.textContent = AGE_NAMES[age];

  // Kingdom visual: show different elements based on age
  const kv = document.getElementById('kingdom-visual');
  if (kv) {
    kv.className = 'kingdom-visual age-' + age;
  }

  // Update click button click value display
  const prestigeBonus = S.prestige.bonuses.clickMult || 1;
  const marketMult = 1 + (S.buildings.markets * 0.2);
  const clickVal = (S.clickBonus + 1) * S.clickMult * prestigeBonus * marketMult;
  const cvEl = document.getElementById('click-value');
  if (cvEl) cvEl.textContent = `+${fmtRate(clickVal)} gold`;
}

function renderWorkers() {
  const container = document.getElementById('workers-list');
  if (!container) return;
  container.innerHTML = '';

  const totalWorkers = Object.values(S.workers).reduce((a,b)=>a+b,0);
  const maxWorkers = 50 + S.prestige.level * 10;

  for (const [type, def] of Object.entries(WORKER_DEFS)) {
    const count = S.workers[type] || 0;
    const cost  = workerCost(type);
    const canAfford = S.resources.gold >= cost;

    const card = document.createElement('div');
    card.className = 'worker-card';

    card.innerHTML = `
      <img class="card-icon" src="${ICONS[def.icon]}" alt="${def.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="card-name">${def.name} <span class="card-count">${count}</span></div>
        <div class="card-desc">${def.desc}</div>
      </div>
      <button class="btn-hire ${canAfford ? '' : 'disabled'}" onclick="hireWorker('${type}')">
        Hire<br><span class="cost">${fmt(cost)}g</span>
      </button>
    `;
    container.appendChild(card);
  }

  const wpEl = document.getElementById('worker-count');
  if (wpEl) wpEl.textContent = `${totalWorkers} / ${maxWorkers} workers`;
}

function renderBuildings() {
  const container = document.getElementById('buildings-list');
  if (!container) return;
  container.innerHTML = '';

  for (const [type, def] of Object.entries(BUILDING_DEFS)) {
    const count = S.buildings[type] || 0;
    const atMax = count >= def.max;
    const canAfford = canAffordBuilding(type);
    const meetsReq = meetsBuildingRequires(type);
    const locked = !meetsReq;

    const card = document.createElement('div');
    card.className = `building-card ${locked ? 'locked' : ''}`;

    const costStr = Object.entries(def.costs).map(([r, a]) => `${fmt(a)} ${r}`).join(', ');

    card.innerHTML = `
      <img class="card-icon" src="${ICONS[def.icon]}" alt="${def.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="card-name">${def.name} ${def.max > 1 ? `<span class="card-count">${count}/${def.max}</span>` : (count > 0 ? '<span class="card-count built">✓ Built</span>' : '')}</div>
        <div class="card-desc">${def.desc}</div>
        <div class="card-cost">${locked ? `🔒 Requires ${BUILDING_DEFS[def.requires]?.name || def.requires}` : costStr}</div>
      </div>
      <button class="btn-build ${atMax ? 'at-max' : (canAfford && !locked ? '' : 'disabled')}"
              onclick="buildBuilding('${type}')" ${locked || atMax ? 'disabled' : ''}>
        ${atMax ? 'MAX' : 'Build'}
      </button>
    `;
    container.appendChild(card);
  }
}

function renderArmy() {
  const container = document.getElementById('army-list');
  if (!container) return;

  const totalArmy = getTotalArmy();
  const power = calcArmyPower();

  document.getElementById('army-size').textContent = `${totalArmy} / ${S.armyCap} units`;
  document.getElementById('army-power').textContent = fmt(power);

  // Unit cards
  const unitContainer = document.getElementById('unit-list');
  if (!unitContainer) return;
  unitContainer.innerHTML = '';

  for (const [type, def] of Object.entries(UNIT_DEFS)) {
    const unlocked = isUnitUnlocked(type);
    const count = S.army[type] || 0;
    const costStr = Object.entries(def.costs).map(([r,a])=>`${fmt(a)} ${r}`).join(', ');
    const canAfford = Object.entries(def.costs).every(([r,a]) => (S.resources[r]||0) >= a);
    const atCap = totalArmy >= S.armyCap;

    const card = document.createElement('div');
    card.className = `unit-card ${unlocked ? '' : 'locked'}`;
    card.innerHTML = `
      <img class="card-icon" src="${ICONS[def.icon]}" alt="${def.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="card-name">${def.name} <span class="card-count">${count}</span></div>
        <div class="card-desc">ATK ${def.attack} | Upkeep ${def.upkeep} food/s</div>
        <div class="card-cost">${unlocked ? costStr : `🔒 Build ${BUILDING_DEFS[def.requires]?.name}`}</div>
      </div>
      <button class="btn-train ${unlocked && canAfford && !atCap ? '' : 'disabled'}"
              onclick="trainUnit('${type}')" ${!unlocked || atCap ? 'disabled' : ''}>
        Train<br><span>x1</span>
      </button>
    `;
    unitContainer.appendChild(card);
  }
}

function renderCombat() {
  const el = document.getElementById('combat-strategy');
  if (!el) return;

  const radios = document.querySelectorAll('.strategy-radio');
  radios.forEach(r => {
    r.checked = (r.value === S.combat.strategy);
  });

  const statsEl = document.getElementById('combat-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <span class="stat-item">Wins: <b>${S.combat.wins}</b></span>
      <span class="stat-item">Losses: <b>${S.combat.losses}</b></span>
      <span class="stat-item">Total Loot: <b>${fmt(S.combat.loot)}g</b></span>
    `;
  }
}

function renderUpgrades() {
  const trees = ['economy', 'military', 'defense'];
  for (const tree of trees) {
    const container = document.getElementById(`upgrades-${tree}`);
    if (!container) continue;
    container.innerHTML = '';

    const defs = UPGRADE_DEFS.filter(u => u.tree === tree);
    for (const def of defs) {
      const purchased = isUpgradePurchased(def.id);
      const canAfford = canAffordUpgrade(def);
      const costStr = Object.entries(def.cost).map(([r,a])=>`${fmt(a)} ${r}`).join(', ');

      const card = document.createElement('div');
      card.className = `upgrade-card ${purchased ? 'purchased' : ''}`;
      card.innerHTML = `
        <img class="card-icon small" src="${ICONS[def.icon]}" alt="${def.name}" onerror="this.style.display='none'">
        <div class="card-info">
          <div class="card-name">${def.name}</div>
          <div class="card-desc">${def.desc}</div>
          <div class="card-cost">${purchased ? '✓ Researched' : costStr}</div>
        </div>
        ${purchased ? '' : `<button class="btn-research ${canAfford ? '' : 'disabled'}" onclick="buyUpgrade('${def.id}')">Research</button>`}
      `;
      container.appendChild(card);
    }
  }
}

function renderPrestige() {
  const pts = calcPrestigePts();
  const available = S.prestige.points - S.prestige.spent;
  const el = document.getElementById('prestige-info');
  if (!el) return;
  el.innerHTML = `
    <div class="prestige-stat">Crown Level: <b>${S.prestige.level}</b></div>
    <div class="prestige-stat">Available Points: <b>${available}</b></div>
    <div class="prestige-stat">Potential new points at reset: <b>${pts}</b></div>
    <div class="prestige-stat">Production bonus: <b>+${Math.round(((S.prestige.bonuses.prodMult||1)-1)*100)}%</b></div>
    <div class="prestige-stat">Click bonus: <b>+${Math.round(((S.prestige.bonuses.clickMult||1)-1)*100)}%</b></div>
  `;
  // Update buy buttons
  const btnProd  = document.getElementById('btn-prestige-prod');
  const btnClick = document.getElementById('btn-prestige-click');
  if (btnProd)  btnProd.disabled  = available <= 0;
  if (btnClick) btnClick.disabled = available <= 0;
}

function renderLog() {
  const container = document.getElementById('battle-log');
  if (!container) return;
  container.innerHTML = S.log.slice(0, 20).map(m => `<div class="log-entry">${m}</div>`).join('');
}

function renderEventBox() {
  const el = document.getElementById('event-box');
  if (!el) return;
  if (S.events.active) {
    const evDef = EVENTS.find(e => e.id === S.events.active);
    const remaining = Math.max(0, Math.ceil((S.events.activeEnd - Date.now()) / 1000));
    el.style.display = 'flex';
    el.innerHTML = `
      <img class="event-icon" src="${ICONS[evDef?.icon || 'event']}" alt="" onerror="this.style.display='none'">
      <div>
        <b>${evDef?.name || 'Event'}</b>
        ${evDef?.duration > 0 ? `<span class="event-timer"> (${remaining}s)</span>` : ''}
        <div>${evDef?.desc || ''}</div>
      </div>
    `;
  } else {
    el.style.display = 'none';
  }
}

// ----------------------------------------------------------------
// MAP
// ----------------------------------------------------------------
const MAP_BUILDINGS = {
  farms:          { positions: [{l:11,t:64},{l:19,t:74},{l:7,t:79}],              icon:'farm'       },
  lumbermills:    { positions: [{l:6, t:24},{l:14,t:16}],                         icon:'lumbermill'  },
  quarries:       { positions: [{l:82,t:66},{l:75,t:75}],                         icon:'quarry'     },
  markets:        { positions: [{l:57,t:74},{l:65,t:68}],                         icon:'market'     },
  barracks:       { positions: [{l:33,t:50}],                                     icon:'barracks'   },
  stables:        { positions: [{l:57,t:52}],                                     icon:'stable'     },
  archerranges:   { positions: [{l:22,t:44}],                                     icon:'archery'    },
  siegeworkshops: { positions: [{l:67,t:46}],                                     icon:'siege_ws'   },
  towers:         { positions: [{l:3,t:4},{l:91,t:4},{l:3,t:86},{l:91,t:84}],    icon:'tower'      },
  castles:        { positions: [{l:43,t:19}],                                     icon:'castle'     },
};

function renderMap() {
  const container = document.getElementById('map-buildings');
  if (!container) return;
  container.innerHTML = '';

  for (const [btype, def] of Object.entries(MAP_BUILDINGS)) {
    const count = S.buildings[btype] || 0;
    const showCount = Math.min(count, def.positions.length);
    for (let i = 0; i < showCount; i++) {
      const pos = def.positions[i];
      const el = document.createElement('div');
      el.className = 'map-building';
      el.style.left = pos.l + '%';
      el.style.top  = pos.t + '%';
      el.title = BUILDING_DEFS[btype]?.name || btype;
      el.innerHTML = `<img src="${ICONS[def.icon]}" alt="" width="26" height="26"
        onerror="this.style.display='none'">`;
      container.appendChild(el);
    }
  }

  const mapEl = document.getElementById('map-world');
  if (mapEl) {
    mapEl.classList.toggle('has-walls',  (S.buildings.walls  || 0) > 0);
    mapEl.classList.toggle('has-castle', (S.buildings.castles || 0) > 0);
    mapEl.dataset.wallLevel = S.buildings.walls || 0;
  }

  const age = getCurrentAge();
  const badge = document.getElementById('map-age-badge');
  if (badge) badge.textContent = AGE_NAMES[age];

  const totalWorkers = Object.values(S.workers).reduce((a,b)=>a+b,0);
  const totalArmy    = getTotalArmy();
  const popEl = document.getElementById('map-population');
  if (popEl) popEl.textContent = `Pop ${totalWorkers + totalArmy}`;
}

// ----------------------------------------------------------------
// STRATEGY
// ----------------------------------------------------------------
function setStrategy(value) {
  S.combat.strategy = value;
  renderCombat();
}

// ----------------------------------------------------------------
// GAME LOOP
// ----------------------------------------------------------------
function gameLoop() {
  const now = Date.now();
  const dt = Math.min((now - lastTickTime) / 1000, 0.5); // cap at 0.5s
  lastTickTime = now;

  tickGame(dt);

  if (!renderPending) {
    renderPending = true;
    requestAnimationFrame(() => {
      renderResources();
      renderRates();
      renderEventBox();
      renderPending = false;
    });
  }
}

// Slower render for non-critical UI (every 2s)
function slowRender() {
  renderWorkers();
  renderBuildings();
  renderArmy();
  renderCombat();
  renderPrestige();
  renderMap();
  checkAgeUp();
}

// Auto-save
function autoSave() {
  saveGame();
}

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
function init() {
  // Reapply all upgrade effects from save
  reapplyUpgrades();

  renderAll();

  // Start game loop at 10 ticks/s
  setInterval(gameLoop, 100);

  // Slow render every 2s
  setInterval(slowRender, 2000);

  // Auto-save every 5s
  setInterval(autoSave, 5000);

  // Strategy radio
  document.querySelectorAll('.strategy-radio').forEach(r => {
    r.addEventListener('change', () => setStrategy(r.value));
  });

  // Set last raid to now so it doesn't fire immediately
  if (!S.combat.lastRaid) S.combat.lastRaid = Date.now();
  if (!S.events.nextEvent) S.events.nextEvent = Date.now() + rand(30000, 90000);

  _lastAge = getCurrentAge();

  addLog('Your kingdom awaits, my liege. Click to collect taxes!');
}

document.addEventListener('DOMContentLoaded', init);
