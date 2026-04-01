// ================================================================
// KINGDOM CLICKER – js/config.js
// All pure constants and definitions. No game logic, no DOM refs.
// ================================================================

// ----------------------------------------------------------------
// HELPERS (shared utilities used everywhere)
// ----------------------------------------------------------------
function gi(author, slug, fg, bg) {
  fg = fg || 'c8a96e'; bg = bg || '1a0e00';
  return 'https://game-icons.net/icons/' + fg + '/' + bg + '/1x1/' + author + '/' + slug + '.svg';
}

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function fmtRate(n) { return (+n).toFixed(1); }

function rand(min, max) { return Math.random() * (max - min) + min; }

// ----------------------------------------------------------------
// ICON MAP (game-icons.net SVGs)
// ----------------------------------------------------------------
var ICONS = {
  gold:         gi('delapouite', 'two-coins',       'ffd700', '1a0e00'),
  food:         gi('delapouite', 'wheat',            '90c050', '1a0e00'),
  wood:         gi('lorc',       'wood-beam',        'c87941', '1a0e00'),
  stone:        gi('lorc',       'stone-block',      'b0a090', '1a0e00'),
  farmer:       gi('delapouite', 'farmer',           'c8a96e', '1a0e00'),
  woodcutter:   gi('lorc',       'axe',              'c87941', '1a0e00'),
  miner:        gi('lorc',       'mine-wagon',       'b0a090', '1a0e00'),
  taxcollector: gi('delapouite', 'coins',            'ffd700', '1a0e00'),
  spearman:     gi('lorc',       'spear-head',       'c8c8c8', '1a0e00'),
  archer:       gi('lorc',       'archer',           '90c050', '1a0e00'),
  knight:       gi('delapouite', 'knight-helmet',    'c8a96e', '1a0e00'),
  siege:        gi('lorc',       'catapult',         'b0a090', '1a0e00'),
  farm:         gi('delapouite', 'farm',             '90c050', '1a0e00'),
  lumbermill:   gi('delapouite', 'wood-axe',         'c87941', '1a0e00'),
  quarry:       gi('lorc',       'stone-block',      'b0a090', '1a0e00'),
  market:       gi('delapouite', 'market',           'ffd700', '1a0e00'),
  barracks:     gi('delapouite', 'barracks',         'c8c8c8', '1a0e00'),
  stable:       gi('delapouite', 'horse',            'c87941', '1a0e00'),
  archery:      gi('lorc',       'bow-arrow',        '90c050', '1a0e00'),
  siege_ws:     gi('lorc',       'siege-ram',        'b0a090', '1a0e00'),
  walls:        gi('lorc',       'stone-wall',       'b0a090', '1a0e00'),
  tower:        gi('lorc',       'watchtower',       'c8a96e', '1a0e00'),
  castle:       gi('delapouite', 'castle',           'ffd700', '1a0e00'),
  sword:        gi('lorc',       'crossed-swords',   'c8c8c8', '1a0e00'),
  shield:       gi('lorc',       'shield',           'c8a96e', '1a0e00'),
  crown:        gi('delapouite', 'imperial-crown',   'ffd700', '1a0e00'),
  upgrade:      gi('delapouite', 'upgrade',          'ffd700', '1a0e00'),
  event:        gi('lorc',       'star-swirl',       'c8a96e', '1a0e00'),
  hero:         gi('delapouite', 'knight',           'ffd700', '1a0e00'),
  skull:        gi('lorc',       'skull',            'c8c8c8', '1a0e00'),
  fire:         gi('lorc',       'fire',             'ff6020', '1a0e00'),
  city:         gi('delapouite', 'city',             'c8a96e', '1a0e00'),
};

// ----------------------------------------------------------------
// WORKER DEFINITIONS
// ----------------------------------------------------------------
var WORKER_DEFS = {
  farmers:       { name: 'Farmer',        icon: 'farmer',       resource: 'food',  rate: 1.2, baseCost: 10,  desc: '+1.2 food/s' },
  woodcutters:   { name: 'Woodcutter',    icon: 'woodcutter',   resource: 'wood',  rate: 1.0, baseCost: 12,  desc: '+1.0 wood/s' },
  miners:        { name: 'Miner',         icon: 'miner',        resource: 'stone', rate: 0.6, baseCost: 15,  desc: '+0.6 stone/s' },
  taxcollectors: { name: 'Tax Collector', icon: 'taxcollector', resource: 'gold',  rate: 1.0, baseCost: 20,  desc: '+1.0 gold/s' },
};

// Worker cost scaling: +15% per worker of same type already hired
var WORKER_SCALE = 1.15;

// ----------------------------------------------------------------
// BUILDING DEFINITIONS
// costs = BASE costs. Actual cost = getBuildingCost(type) in engine.js
// costScale = multiplier per building already built (default 1.20)
// ----------------------------------------------------------------
var BUILDING_DEFS = {
  farms:          { name: 'Farm',           icon: 'farm',      max: 10, costScale: 1.20, costs: {wood:50},                        desc: '+5 food/s per farm',             requires: null        },
  lumbermills:    { name: 'Lumber Mill',    icon: 'lumbermill',max: 10, costScale: 1.20, costs: {wood:30,stone:20},               desc: '+3 wood/s per mill',             requires: null        },
  quarries:       { name: 'Quarry',         icon: 'quarry',    max: 10, costScale: 1.20, costs: {wood:40,stone:30},               desc: '+2 stone/s per quarry',          requires: null        },
  markets:        { name: 'Market',         icon: 'market',    max:  3, costScale: 1.25, costs: {gold:100,wood:50,stone:50},      desc: '+20% gold income per market',    requires: null        },
  barracks:       { name: 'Barracks',       icon: 'barracks',  max:  1, costScale: 1.00, costs: {wood:80,stone:40},              desc: 'Unlock Spearmen',                requires: null        },
  stables:        { name: 'Stable',         icon: 'stable',    max:  1, costScale: 1.00, costs: {wood:100,stone:60},             desc: 'Unlock Knights',                 requires: 'barracks'  },
  archerranges:   { name: 'Archery Range',  icon: 'archery',   max:  1, costScale: 1.00, costs: {wood:70,stone:30},              desc: 'Unlock Archers',                 requires: null        },
  siegeworkshops: { name: 'Siege Workshop', icon: 'siege_ws',  max:  1, costScale: 1.00, costs: {wood:150,stone:100},            desc: 'Unlock Siege units',             requires: 'barracks'  },
  walls:          { name: 'Wall',           icon: 'walls',     max:  5, costScale: 1.20, costs: {stone:60},                      desc: '-5% losses & damage per wall',   requires: null        },
  towers:         { name: 'Tower',          icon: 'tower',     max:  5, costScale: 1.20, costs: {wood:50,stone:80},              desc: '+5 auto-damage/s per tower',     requires: null        },
  castles:        { name: 'Castle',         icon: 'castle',    max:  1, costScale: 1.00, costs: {gold:500,wood:500,stone:500},   desc: '+50% all production',            requires: 'walls'     },
};

// ----------------------------------------------------------------
// UNIT DEFINITIONS
// ----------------------------------------------------------------
var UNIT_DEFS = {
  spearmen: { name: 'Spearman', icon: 'spearman', attack: 10, costs: {gold:30,  food:10},  upkeep: 0.5, requires: 'barracks'      },
  archers:  { name: 'Archer',   icon: 'archer',   attack: 15, costs: {gold:50,  food:15},  upkeep: 0.6, requires: 'archerranges'  },
  knights:  { name: 'Knight',   icon: 'knight',   attack: 30, costs: {gold:100, food:30},  upkeep: 1.0, requires: 'stables'       },
  siege:    { name: 'Siege',    icon: 'siege',    attack: 50, costs: {gold:200, wood:50},  upkeep: 0.5, requires: 'siegeworkshops'},
};

// ----------------------------------------------------------------
// AGE PROGRESSION
// ----------------------------------------------------------------
var AGE_NAMES = ['', 'Dark Age', 'Feudal Age', 'Castle Age', 'Imperial Age'];

// ----------------------------------------------------------------
// MAP BUILDING POSITIONS (% left, % top)
// Each entry has up to max positions for each level of that building
// ----------------------------------------------------------------
var MAP_BUILDINGS = {
  farms:          { positions: [{l:10,t:62},{l:18,t:72},{l:7,t:77},{l:15,t:81},{l:22,t:75},{l:11,t:85},{l:25,t:83}],  icon:'farm'    },
  lumbermills:    { positions: [{l:5, t:22},{l:13,t:14},{l:5,t:32}],                                                   icon:'lumbermill'},
  quarries:       { positions: [{l:80,t:64},{l:72,t:73},{l:80,t:74}],                                                  icon:'quarry'  },
  markets:        { positions: [{l:56,t:72},{l:63,t:66}],                                                              icon:'market'  },
  barracks:       { positions: [{l:32,t:48}],                                                                          icon:'barracks'},
  stables:        { positions: [{l:55,t:50}],                                                                          icon:'stable'  },
  archerranges:   { positions: [{l:21,t:42}],                                                                          icon:'archery' },
  siegeworkshops: { positions: [{l:66,t:44}],                                                                          icon:'siege_ws'},
  towers:         { positions: [{l:3,t:3},{l:89,t:3},{l:3,t:84},{l:89,t:84},{l:46,t:2}],                              icon:'tower'   },
  walls:          { positions: [],                                                                                      icon:'walls'   }, // handled via CSS class
  castles:        { positions: [{l:41,t:17}],                                                                          icon:'castle'  },
};
