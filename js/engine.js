// ================================================================
// KINGDOM CLICKER – js/engine.js
// All game mechanics: production, combat, events, upgrades.
// Depends on: config.js, state.js
// ================================================================

// ----------------------------------------------------------------
// UPGRADE_DEFS removed — talent system now lives in TALENT_DEFS (config.js)
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// RANDOM EVENTS
// apply / remove fns take the state object `s`
// ----------------------------------------------------------------
var EVENTS = [
  {
    id:'harvest', name:'Golden Harvest', icon:'food', duration:30,
    desc:'Abundant crops! +300% food production for 30s.',
    apply:  function(s){ s.events.foodBoost = 3.0; },
    remove: function(s){ s.events.foodBoost = 1.0; },
  },
  {
    id:'bandits', name:'Bandit Raid', icon:'skull', duration:0,
    desc:'Bandits attack! Lose gold unless you have an army.',
    apply:  function(s){ _applyBanditRaid(s); },
    remove: function(){},
  },
  {
    id:'hero', name:'Wandering Hero', icon:'hero', duration:60,
    desc:'A hero joins your cause! +50% army power for 60s.',
    apply:  function(s){ s.events.heroBoost = 1.5; },
    remove: function(s){ s.events.heroBoost = 1.0; },
  },
  {
    id:'fire', name:'Forest Fire', icon:'fire', duration:0,
    desc:'Fire ravages the forest! Lose 100 wood.',
    apply:  function(s){ s.resources.wood = Math.max(0, s.resources.wood - 100); },
    remove: function(){},
  },
  {
    id:'traders', name:'Merchant Caravan', icon:'market', duration:20,
    desc:'Traders visit! +200% gold production for 20s.',
    apply:  function(s){ s.events.goldBoost = 2.0; },
    remove: function(s){ s.events.goldBoost = 1.0; },
  },
];

function _applyBanditRaid(s) {
  var total = Object.values(s.army).reduce(function(a,b){ return a+b; }, 0);
  if (total < 5) {
    var loss = Math.min(s.resources.gold, rand(50, 200));
    s.resources.gold -= loss;
    addLog('Bandits stole ' + fmt(loss) + ' gold! Train more troops!');
  } else {
    addLog('Bandits were driven off by your army!');
  }
}

// ----------------------------------------------------------------
// PRODUCTION RATES
// ----------------------------------------------------------------
function calcRates() {
  var castleBonus = S.buildings.castles > 0 ? 1.5 : 1.0;
  var pBonus = (S.prestige.bonuses.prodMult || 1);
  var wm = S.workerMult * pBonus;

  var farmRate  = (S.workers.farmers      * WORKER_DEFS.farmers.rate
                 + S.buildings.farms      * 5) * wm * (S.foodMult || 1) * (S.events.foodBoost || 1) * castleBonus;
  var woodRate  = (S.workers.woodcutters  * WORKER_DEFS.woodcutters.rate
                 + S.buildings.lumbermills* 3) * wm * (S.woodMult || 1)  * castleBonus;
  var stoneRate = (S.workers.miners       * WORKER_DEFS.miners.rate
                 + S.buildings.quarries   * 2) * wm * (S.stoneMult || 1) * castleBonus;
  var goldRate  = (S.workers.taxcollectors * WORKER_DEFS.taxcollectors.rate)
               * (1 + S.buildings.markets * 0.2) * wm * (S.goldMult || 1) * (S.events.goldBoost || 1) * castleBonus;

  var towerDmg  = S.buildings.towers * (5 + S.towerBonus);

  return { gold: goldRate, food: farmRate, wood: woodRate, stone: stoneRate, towerDmg: towerDmg };
}

function getMaxResource(res) {
  var base  = { gold: 2000, food: 1000, wood: 1000, stone: 1000 };
  var extra = S.buildings.castles > 0 ? 5 : 1;
  return base[res] * extra * (1 + S.prestige.level * 0.1) * (S.storageMult || 1);
}

// ----------------------------------------------------------------
// GAME TICK
// ----------------------------------------------------------------
function tickGame(dt) {
  var rates = calcRates();

  // Produce
  S.resources.gold  = Math.min(S.resources.gold  + rates.gold  * dt, getMaxResource('gold'));
  S.resources.food  = Math.min(S.resources.food  + rates.food  * dt, getMaxResource('food'));
  S.resources.wood  = Math.min(S.resources.wood  + rates.wood  * dt, getMaxResource('wood'));
  S.resources.stone = Math.min(S.resources.stone + rates.stone * dt, getMaxResource('stone'));

  // Army upkeep
  var upkeep = 0;
  for (var t in S.army) upkeep += S.army[t] * (UNIT_DEFS[t] ? UNIT_DEFS[t].upkeep : 0);
  S.resources.food -= upkeep * dt;

  // Starvation / desertion
  if (S.resources.food < 0) {
    S.resources.food = 0;
    var total = getTotalArmy();
    if (total > 0 && Math.random() < 0.1 * dt) {
      var types = Object.keys(S.army).filter(function(t){ return S.army[t] > 0; });
      if (types.length) {
        var pick = types[Math.floor(Math.random() * types.length)];
        S.army[pick] = Math.max(0, S.army[pick] - 1);
        addLog('A soldier deserted due to lack of food!');
      }
    }
  }

  // Accumulate tower damage for raids
  S._towerDmgAccum = (S._towerDmgAccum || 0) + rates.towerDmg * dt;

  S.tick++;
  handleEventTick();
  handleRaidTick();
}

// ----------------------------------------------------------------
// EVENTS
// ----------------------------------------------------------------
function handleEventTick() {
  var now = Date.now();

  // Remove expired active event
  if (S.events.active && now > S.events.activeEnd) {
    var ev = _findEvent(S.events.active);
    if (ev && ev.remove) ev.remove(S);
    S.events.active = null;
    renderEventBox();
  }

  // Schedule next if unset
  if (!S.events.nextEvent) S.events.nextEvent = now + rand(30000, 90000);

  // Trigger?
  if (!S.events.active && now >= S.events.nextEvent) {
    _triggerRandomEvent();
    S.events.nextEvent = now + rand(45000, 120000);
  }
}

function _findEvent(id) {
  for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].id === id) return EVENTS[i];
  return null;
}

function _triggerRandomEvent() {
  var ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  S.events.active   = ev.id;
  S.events.activeEnd = ev.duration > 0 ? Date.now() + ev.duration * 1000 : Date.now() + 1;
  ev.apply(S);
  addNotification('Event: ' + ev.name + ' — ' + ev.desc);
  addLog('📯 Event: ' + ev.name);
  renderEventBox();
}

// ----------------------------------------------------------------
// RAIDS (passive enemy attacks)
// ----------------------------------------------------------------
function handleRaidTick() {
  var now = Date.now();
  if (!S.combat.lastRaid) { S.combat.lastRaid = now; return; }
  var interval = rand(60000, 120000);
  if (now >= S.combat.lastRaid + interval) {
    _triggerEnemyRaid();
    S.combat.lastRaid = now;
  }
}

function _triggerEnemyRaid() {
  var age = getCurrentAge();
  var enemyPower = rand(age * 50, age * 150) + S.combat.wins * 10;
  var playerPower = calcArmyPower();
  var wallDef = S.buildings.walls * 0.05 + S.raidDefense;
  var effEnemy = Math.max(0, enemyPower * (1 - wallDef) - (S._towerDmgAccum || 0));
  S._towerDmgAccum = 0;

  if (playerPower > effEnemy * 0.5) {
    var losses = Math.floor(getTotalArmy() * (effEnemy / Math.max(playerPower, 1)) * (1 - S.lossReduction) * 0.3);
    applyLosses(losses);
    addNotification('Enemy raid repelled! Lost ' + losses + ' troops.');
    addLog('⚔️ Raiders attacked! Defended. Lost ~' + losses + ' troops.');
  } else {
    var goldLoss = Math.min(S.resources.gold, effEnemy * 2);
    S.resources.gold -= goldLoss;
    addNotification('Raid breached! Lost ' + fmt(goldLoss) + ' gold!');
    addLog('💀 Raiders breached your walls! Lost ' + fmt(goldLoss) + ' gold!');
  }
}

// ----------------------------------------------------------------
// COMBAT (player-initiated)
// ----------------------------------------------------------------
function calcArmyPower() {
  var power = 0;
  for (var t in S.army) {
    var atk = UNIT_DEFS[t] ? UNIT_DEFS[t].attack : 0;
    if (t === 'knights') atk *= (S.knightMult || 1);
    if (t === 'siege')   atk *= (S.siegeMult  || 1);
    power += S.army[t] * atk * S.attackMult;
  }
  return power * (S.events.heroBoost || 1);
}

function getTotalArmy() {
  return Object.values(S.army).reduce(function(a,b){ return a+b; }, 0);
}

function launchAttack() {
  var total = getTotalArmy();
  if (total < 1) { addLog('You have no army to attack with!'); return; }

  var age = getCurrentAge();
  var mods = { aggressive:{dmg:1.3,loss:1.3}, balanced:{dmg:1.0,loss:1.0}, defensive:{dmg:0.8,loss:0.5} };
  var mod = mods[S.combat.strategy] || mods.balanced;
  var playerPower = calcArmyPower() * mod.dmg;
  var enemyPower  = rand(age * 40, age * 120) + S.combat.wins * 8;
var loot = Math.floor(enemyPower * rand(0.8, 1.5) * (S.battleLootMult || 1));

  S.stats.totalBattles++;

  if (playerPower >= enemyPower) {
    var losses = Math.floor(total * (enemyPower / Math.max(playerPower,1)) * (1 - S.lossReduction) * mod.loss * 0.4);
    applyLosses(losses);
    S.resources.gold += loot;
    S.stats.totalGoldEarned += loot;
    S.combat.wins++;
    S.combat.loot += loot;

    if (S.hero.active) { S.hero.xp += 10 + losses; checkHeroLevelUp(); }

    addLog('⚔️ Victory! Looted ' + fmt(loot) + ' gold. Lost ' + losses + ' troops.');
    addNotification('Victory! +' + fmt(loot) + ' gold plundered!');
    showFloatingText('+' + fmt(loot) + ' gold!', document.getElementById('btn-attack'), null, null, '#ffd700');

    // Notify multiplayer if active
    if (typeof mpOnBattleResult === 'function') mpOnBattleResult(true, loot);
  } else {
    var lossCount = Math.floor(total * 0.3 * mod.loss * (1 - S.lossReduction));
    applyLosses(lossCount);
    S.combat.losses++;
    addLog('💀 Defeat! The enemy was too strong. Lost ' + lossCount + ' troops.');
    addNotification('Defeat! Your army was routed. Lost ' + lossCount + ' troops.');
    if (typeof mpOnBattleResult === 'function') mpOnBattleResult(false, 0);
  }
  renderAll();
}

function applyLosses(count) {
  var remaining = count;
  var order = ['spearmen', 'archers', 'knights', 'siege'];
  for (var i = 0; i < order.length && remaining > 0; i++) {
    var lose = Math.min(S.army[order[i]], remaining);
    S.army[order[i]] -= lose;
    remaining -= lose;
  }
}

// ----------------------------------------------------------------
// AGE PROGRESSION
// ----------------------------------------------------------------
function getCurrentAge() {
  var g = S.stats.totalGoldEarned;
  var b = Object.values(S.buildings).reduce(function(a,v){ return a+v; }, 0);
  if (g > 500000 || S.buildings.castles > 0) return 4;
  if (g > 50000  || b > 15)                  return 3;
  if (g > 5000   || b > 5)                   return 2;
  return 1;
}

var _lastAge = 1;
function checkAgeUp() {
  var age = getCurrentAge();
  if (age > _lastAge) {
    _lastAge = age;
    addLog('🎺 Your kingdom enters the ' + AGE_NAMES[age] + '!');
    addNotification('New Age: ' + AGE_NAMES[age] + '!');
    renderKingdom();
    renderMap();
  }
}

// ----------------------------------------------------------------
// CLICK
// ----------------------------------------------------------------
function clickKingdom(e) {
  var prestigeBonus = S.prestige.bonuses.clickMult || 1;
  var marketMult    = 1 + S.buildings.markets * 0.2;
  var base          = (S.clickBonus + 1) * S.clickMult * prestigeBonus * marketMult;
  var crit          = Math.random() < 0.05;
  var gained        = crit ? base * 5 : base;

  S.resources.gold = Math.min(S.resources.gold + gained, getMaxResource('gold'));
  S.stats.totalGoldEarned += gained;
  S.stats.totalClicks++;

  var btn = document.getElementById('btn-collect');
  if (btn && e) {
    var rect = btn.getBoundingClientRect();
    showFloatingText(
      crit ? 'CRIT! +' + fmt(gained) : '+' + fmt(gained),
      btn, e.clientX - rect.left, e.clientY - rect.top,
      crit ? '#ffd700' : '#c8a96e'
    );
  }
  renderResources();
}

// ----------------------------------------------------------------
// WORKERS  (cost scales +15% per worker of same type hired)
// ----------------------------------------------------------------
function workerCost(type) {
  return Math.ceil(WORKER_DEFS[type].baseCost * Math.pow(WORKER_SCALE, S.workers[type] || 0));
}

function hireWorker(type) {
  var cost = workerCost(type);
  if (S.resources.gold < cost) { addLog('Not enough gold to hire a ' + WORKER_DEFS[type].name + '!'); return; }
  S.resources.gold -= cost;
  S.workers[type] = (S.workers[type] || 0) + 1;
  renderWorkers();
  renderResources();
  renderRates();
}

// ----------------------------------------------------------------
// BUILDINGS  (cost scales +20% per building of same type built)
// ----------------------------------------------------------------

/** Returns the ACTUAL current cost for the next instance of a building type */
function getBuildingCost(type) {
  var def   = BUILDING_DEFS[type];
  var count = S.buildings[type] || 0;
  var scale = Math.pow(def.costScale || 1.20, count);
  var result = {};
  for (var res in def.costs) {
    result[res] = Math.ceil(def.costs[res] * scale);
  }
  return result;
}

function canAffordBuilding(type) {
  var cost = getBuildingCost(type);
  for (var res in cost) {
    if ((S.resources[res] || 0) < cost[res]) return false;
  }
  return true;
}

function meetsBuildingRequires(type) {
  var req = BUILDING_DEFS[type].requires;
  return !req || (S.buildings[req] || 0) > 0;
}

function buildBuilding(type) {
  var def = BUILDING_DEFS[type];
  if (!meetsBuildingRequires(type)) {
    addLog('Requires ' + (BUILDING_DEFS[def.requires] ? BUILDING_DEFS[def.requires].name : def.requires) + ' first!');
    return;
  }
  if ((S.buildings[type] || 0) >= def.max) {
    addLog(def.name + ' is at maximum capacity!');
    return;
  }
  if (!canAffordBuilding(type)) {
    addLog('Not enough resources to build ' + def.name + '!');
    return;
  }
  var cost = getBuildingCost(type);
  for (var res in cost) S.resources[res] -= cost[res];
  S.buildings[type] = (S.buildings[type] || 0) + 1;
  addLog('🏗️ Built: ' + def.name + '!');

  // Castle unlocks hero
  if (type === 'castles') S.hero.unlocked = true;

  renderBuildings();
  renderResources();
  renderRates();
  renderArmy();
  renderMap();
  checkAgeUp();
}

// ----------------------------------------------------------------
// ARMY
// ----------------------------------------------------------------
function isUnitUnlocked(type) {
  return (S.buildings[UNIT_DEFS[type].requires] || 0) > 0;
}

function trainUnit(type) {
  var def = UNIT_DEFS[type];
  if (!isUnitUnlocked(type)) {
    addLog('Build ' + (BUILDING_DEFS[def.requires] ? BUILDING_DEFS[def.requires].name : def.requires) + ' first!');
    return;
  }
  if (getTotalArmy() >= S.armyCap) {
    addLog('Army at capacity (' + S.armyCap + ')! Upgrade War Drums.');
    return;
  }
  for (var res in def.costs) {
    if ((S.resources[res] || 0) < def.costs[res]) {
      addLog('Not enough resources to train ' + def.name + '!');
      return;
    }
  }
  for (var r in def.costs) S.resources[r] -= def.costs[r];
  S.army[type] = (S.army[type] || 0) + 1;
  renderArmy();
  renderResources();
}

// ----------------------------------------------------------------
// TALENTS
// ----------------------------------------------------------------
function reapplyTalents() {
  // Reset all derived multipliers
  S.clickMult = 1; S.clickBonus = 0; S.workerMult = 1;
  S.attackMult = 1; S.lossReduction = 0; S.raidDefense = 0;
  S.towerBonus = 0; S.armyCap = 100;
  S.foodMult = 1; S.woodMult = 1; S.stoneMult = 1; S.goldMult = 1;
  S.storageMult = 1; S.knightMult = 1; S.siegeMult = 1; S.battleLootMult = 1;

  for (var i = 0; i < TALENT_DEFS.length; i++) {
    if (S.talents[TALENT_DEFS[i].id]) {
      TALENT_DEFS[i].effect(S);
    }
  }
  // Apply prestige bonuses on top
  S.workerMult *= (S.prestige.bonuses.prodMult || 1);
  S.clickMult  *= (S.prestige.bonuses.clickMult || 1);
}

function _findTalent(id) {
  for (var i = 0; i < TALENT_DEFS.length; i++) if (TALENT_DEFS[i].id === id) return TALENT_DEFS[i];
  return null;
}

function isTalentLearned(id) { return !!S.talents[id]; }

function countTreeTalents(tree) {
  var n = 0;
  for (var i = 0; i < TALENT_DEFS.length; i++) {
    if (TALENT_DEFS[i].tree === tree && S.talents[TALENT_DEFS[i].id]) n++;
  }
  return n;
}

function getTalentPoints() { return S.talentPoints || 0; }
function getSpentTalentPoints() {
  var n = 0;
  for (var id in S.talents) if (S.talents[id]) n++;
  return n;
}

function canLearnTalent(id) {
  var def = _findTalent(id);
  if (!def) return false;
  if (isTalentLearned(id)) return false;
  // Need a free talent point
  if (getTalentPoints() <= getSpentTalentPoints()) return false;
  // Tier 0 always available; tier N requires N talents already spent in that tree
  var spent = countTreeTalents(def.tree);
  if (spent < def.tier) return false;
  // Exclusive group: none from the same exclusive[] already learned
  for (var i = 0; i < def.exclusive.length; i++) {
    if (isTalentLearned(def.exclusive[i])) return false;
  }
  // Can afford resource cost
  for (var res in def.cost) {
    if ((S.resources[res] || 0) < def.cost[res]) return false;
  }
  return true;
}

function learnTalent(id) {
  if (!canLearnTalent(id)) {
    var def = _findTalent(id);
    if (!def) return;
    if (getTalentPoints() <= getSpentTalentPoints()) {
      addLog('No talent points available!');
    } else if (countTreeTalents(def.tree) < def.tier) {
      addLog('Unlock ' + def.tier + ' ' + def.tree + ' talents first!');
    } else {
      addLog('Not enough resources for ' + def.name + '!');
    }
    return;
  }
  var def = _findTalent(id);
  for (var res in def.cost) S.resources[res] -= def.cost[res];
  S.talents[id] = true;
  def.effect(S);
  addLog('✨ Learned: ' + def.name + '!');
  addNotification('Talent learned: ' + def.name);
  renderTalents();
  renderResources();
}

// ----------------------------------------------------------------
// UPGRADES (stub kept for save compatibility; talent system takes over)
// ----------------------------------------------------------------
function reapplyUpgrades() { reapplyTalents(); }
function isUpgradePurchased(id) { return false; }
function canAffordUpgrade(def) { return false; }
function buyUpgrade(id) { learnTalent(id); }

// ----------------------------------------------------------------
// PRESTIGE SPENDING
// ----------------------------------------------------------------
function calcPrestigePts() {
  return Math.floor(Math.sqrt(S.stats.totalGoldEarned / 1000000));
}

function spendPrestigePoint(bonus) {
  if (S.prestige.points <= S.prestige.spent) { addLog('No Crown Points available!'); return; }
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
  var needed = S.hero.level * 100;
  if (S.hero.xp >= needed) {
    S.hero.xp -= needed;
    S.hero.level++;
    addLog('🦸 Hero leveled up! Now level ' + S.hero.level + '!');
    addNotification('Hero reached level ' + S.hero.level + '!');
  }
}

// ----------------------------------------------------------------
// STRATEGY  (called from HTML radio inputs)
// ----------------------------------------------------------------
function setStrategy(value) {
  S.combat.strategy = value;
  renderCombat();
}
