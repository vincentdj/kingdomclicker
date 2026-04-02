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

// ----------------------------------------------------------------
// CUSTOM BUILDING SVG ICONS (inline, viewBox 0 0 80 62)
// ----------------------------------------------------------------
var BUILDING_SVGS = {
  farms: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="52" width="74" height="8" fill="#3a5a1e" rx="1"/><line x1="13" y1="52" x2="13" y2="60" stroke="#2a4014" stroke-width="1.5"/><line x1="23" y1="52" x2="23" y2="60" stroke="#2a4014" stroke-width="1.5"/><line x1="33" y1="52" x2="33" y2="60" stroke="#2a4014" stroke-width="1.5"/><line x1="43" y1="52" x2="43" y2="60" stroke="#2a4014" stroke-width="1.5"/><line x1="53" y1="52" x2="53" y2="60" stroke="#2a4014" stroke-width="1.5"/><line x1="63" y1="52" x2="63" y2="60" stroke="#2a4014" stroke-width="1.5"/><line x1="73" y1="52" x2="73" y2="60" stroke="#2a4014" stroke-width="1.5"/><rect x="18" y="29" width="44" height="24" fill="#8b6a3e"/><rect x="18" y="29" width="6" height="24" fill="#6b4a2e"/><polygon points="14,29 40,9 66,29" fill="#6b3a1e"/><line x1="14" y1="29" x2="40" y2="9" stroke="#4a2010" stroke-width="1"/><rect x="33" y="39" width="14" height="14" fill="#2d1608" rx="1"/><rect x="21" y="33" width="7" height="6" fill="#c8a060" rx="1"/><rect x="52" y="33" width="7" height="6" fill="#c8a060" rx="1"/></svg>',

  lumbermills: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="56" y="42" width="5" height="18" fill="#6b3e1a"/><polygon points="46,40 62,14 78,40" fill="#2d5a14"/><polygon points="50,31 62,8 74,31" fill="#3a7020"/><rect x="5" y="33" width="42" height="27" fill="#8b5e3c"/><line x1="5" y1="39" x2="47" y2="39" stroke="#6b4020" stroke-width="1"/><line x1="5" y1="45" x2="47" y2="45" stroke="#6b4020" stroke-width="1"/><line x1="5" y1="51" x2="47" y2="51" stroke="#6b4020" stroke-width="1"/><line x1="5" y1="57" x2="47" y2="57" stroke="#6b4020" stroke-width="1"/><polygon points="2,33 26,15 50,33" fill="#4a2810"/><rect x="19" y="44" width="12" height="16" fill="#2a1408" rx="1"/><line x1="50" y1="43" x2="50" y2="58" stroke="#6b4020" stroke-width="2"/><rect x="47" y="41" width="7" height="5" fill="#888060" rx="1"/></svg>',

  quarries: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><polygon points="2,60 19,19 40,5 61,19 78,60" fill="#706860"/><polygon points="19,19 40,5 43,28 22,33" fill="#5a5450"/><rect x="28" y="40" width="24" height="20" fill="#0e0a06"/><ellipse cx="40" cy="40" rx="12" ry="9" fill="#0e0a06"/><rect x="28" y="38" width="3" height="22" fill="#7a5030"/><rect x="49" y="38" width="3" height="22" fill="#7a5030"/><rect x="27" y="35" width="26" height="4" fill="#7a5030"/><circle cx="60" cy="26" r="3.5" fill="#c0b080"/><circle cx="62" cy="21" r="2.5" fill="#d8d090"/><circle cx="17" cy="33" r="2.5" fill="#c0b080"/><line x1="36" y1="60" x2="36" y2="44" stroke="#5a4020" stroke-width="1.5"/><line x1="44" y1="60" x2="44" y2="44" stroke="#5a4020" stroke-width="1.5"/><line x1="36" y1="48" x2="44" y2="48" stroke="#5a4020" stroke-width="1"/><line x1="36" y1="55" x2="44" y2="55" stroke="#5a4020" stroke-width="1"/></svg>',

  markets: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><polygon points="8,24 40,5 72,24" fill="#7a3818"/><rect x="7" y="23" width="66" height="8" fill="#c83c18"/><ellipse cx="17" cy="31" rx="7" ry="4" fill="#a02c10"/><ellipse cx="31" cy="31" rx="7" ry="4" fill="#a02c10"/><ellipse cx="45" cy="31" rx="7" ry="4" fill="#a02c10"/><ellipse cx="59" cy="31" rx="7" ry="4" fill="#a02c10"/><ellipse cx="70" cy="31" rx="6" ry="4" fill="#a02c10"/><rect x="10" y="31" width="60" height="29" fill="#9a8050"/><rect x="17" y="31" width="4" height="29" fill="#b09060"/><rect x="31" y="31" width="4" height="29" fill="#b09060"/><rect x="45" y="31" width="4" height="29" fill="#b09060"/><rect x="59" y="31" width="4" height="29" fill="#b09060"/><rect x="21" y="37" width="10" height="23" fill="#7a6030" rx="1"/><ellipse cx="26" cy="37" rx="5" ry="5" fill="#7a6030"/><rect x="35" y="37" width="10" height="23" fill="#7a6030" rx="1"/><ellipse cx="40" cy="37" rx="5" ry="5" fill="#7a6030"/><rect x="49" y="37" width="10" height="23" fill="#7a6030" rx="1"/><ellipse cx="54" cy="37" rx="5" ry="5" fill="#7a6030"/><circle cx="40" cy="52" r="7" fill="#c8a020"/><circle cx="40" cy="52" r="5" fill="#e8c030"/></svg>',

  barracks: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="20" width="64" height="40" fill="#707870"/><rect x="8" y="20" width="64" height="6" fill="#505850"/><rect x="8" y="11" width="9" height="10" fill="#707870"/><rect x="21" y="11" width="9" height="10" fill="#707870"/><rect x="34" y="11" width="9" height="10" fill="#707870"/><rect x="47" y="11" width="9" height="10" fill="#707870"/><rect x="60" y="11" width="10" height="10" fill="#707870"/><rect x="17" y="24" width="3" height="9" fill="#1a1a1a"/><rect x="34" y="24" width="3" height="9" fill="#1a1a1a"/><rect x="52" y="24" width="3" height="9" fill="#1a1a1a"/><rect x="65" y="24" width="3" height="9" fill="#1a1a1a"/><rect x="31" y="40" width="18" height="20" fill="#1a1008" rx="1"/><ellipse cx="40" cy="40" rx="9" ry="6" fill="#1a1008"/><line x1="19" y1="42" x2="28" y2="57" stroke="#c0a020" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="42" x2="19" y2="57" stroke="#c0a020" stroke-width="2.5" stroke-linecap="round"/><rect x="14" y="47" width="17" height="3" fill="#8b6010" rx="1"/></svg>',

  stables: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="30" width="72" height="30" fill="#8b7050"/><polygon points="2,30 40,10 78,30" fill="#5a3820"/><line x1="22" y1="21" x2="40" y2="10" stroke="#3a2010" stroke-width="1.5"/><line x1="58" y1="21" x2="40" y2="10" stroke="#3a2010" stroke-width="1.5"/><line x1="8" y1="26" x2="30" y2="26" stroke="#c8a030" stroke-width="1"/><line x1="50" y1="26" x2="72" y2="26" stroke="#c8a030" stroke-width="1"/><rect x="9" y="37" width="15" height="23" fill="#6b4820" rx="1"/><line x1="16" y1="37" x2="16" y2="60" stroke="#4a3010" stroke-width="1"/><rect x="28" y="37" width="15" height="23" fill="#6b4820" rx="1"/><line x1="35" y1="37" x2="35" y2="60" stroke="#4a3010" stroke-width="1"/><rect x="48" y="37" width="15" height="23" fill="#6b4820" rx="1"/><line x1="55" y1="37" x2="55" y2="60" stroke="#4a3010" stroke-width="1"/><ellipse cx="70" cy="37" rx="8" ry="7" fill="#9a7040"/><rect x="67" y="30" width="6" height="9" fill="#9a7040" rx="2"/><circle cx="73" cy="32" r="1.5" fill="#2a1a08"/></svg>',

  archerranges: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="24" width="60" height="36" fill="#706858"/><polygon points="8,24 40,7 72,24" fill="#4a3820"/><rect x="19" y="30" width="5" height="12" fill="#1a1a16"/><rect x="16" y="35" width="11" height="4" fill="#1a1a16"/><rect x="34" y="29" width="4" height="13" fill="#1a1a16"/><rect x="30" y="34" width="12" height="4" fill="#1a1a16"/><rect x="55" y="30" width="5" height="12" fill="#1a1a16"/><rect x="52" y="35" width="11" height="4" fill="#1a1a16"/><rect x="34" y="42" width="12" height="18" fill="#1a1008" rx="1"/><ellipse cx="40" cy="42" rx="6" ry="5" fill="#1a1008"/><path d="M 61 39 Q 72 30 61 54" stroke="#c8a030" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="61" y1="39" x2="61" y2="54" stroke="#8b6010" stroke-width="1.2"/><line x1="56" y1="46" x2="75" y2="38" stroke="#c8a030" stroke-width="1.5"/><polygon points="75,38 70,36 71,41" fill="#c8a030"/></svg>',

  siegeworkshops: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="26" width="70" height="34" fill="#787060"/><polygon points="3,26 40,8 77,26" fill="#4a3a20"/><rect x="19" y="38" width="18" height="22" fill="#2a1808" rx="1"/><rect x="43" y="38" width="18" height="22" fill="#2a1808" rx="1"/><rect x="17" y="35" width="46" height="4" fill="#6b4820"/><rect x="10" y="29" width="6" height="8" fill="#1a1810"/><rect x="64" y="29" width="6" height="8" fill="#1a1810"/><circle cx="60" cy="51" r="9" fill="none" stroke="#8b6020" stroke-width="3"/><circle cx="60" cy="51" r="2.5" fill="#6b4010"/><line x1="60" y1="42" x2="60" y2="60" stroke="#6b4010" stroke-width="1.5"/><line x1="51" y1="51" x2="69" y2="51" stroke="#6b4010" stroke-width="1.5"/><line x1="53.6" y1="44.6" x2="66.4" y2="57.4" stroke="#6b4010" stroke-width="1.5"/><line x1="66.4" y1="44.6" x2="53.6" y2="57.4" stroke="#6b4010" stroke-width="1.5"/><line x1="20" y1="47" x2="37" y2="31" stroke="#8b5020" stroke-width="3" stroke-linecap="round"/><circle cx="37" cy="29" r="3.5" fill="#604020"/></svg>',

  walls: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="30" width="74" height="30" fill="#8a8278"/><rect x="3" y="21" width="11" height="11" fill="#8a8278"/><rect x="18" y="21" width="11" height="11" fill="#8a8278"/><rect x="33" y="21" width="11" height="11" fill="#8a8278"/><rect x="48" y="21" width="11" height="11" fill="#8a8278"/><rect x="63" y="21" width="11" height="11" fill="#8a8278"/><rect x="3" y="30" width="74" height="5" fill="#787068"/><rect x="3" y="41" width="74" height="5" fill="#787068"/><rect x="3" y="52" width="74" height="5" fill="#787068"/><line x1="14" y1="30" x2="14" y2="35" stroke="#5a5248" stroke-width="0.5"/><line x1="26" y1="30" x2="26" y2="35" stroke="#5a5248" stroke-width="0.5"/><line x1="38" y1="30" x2="38" y2="35" stroke="#5a5248" stroke-width="0.5"/><line x1="50" y1="30" x2="50" y2="35" stroke="#5a5248" stroke-width="0.5"/><line x1="62" y1="30" x2="62" y2="35" stroke="#5a5248" stroke-width="0.5"/><line x1="74" y1="30" x2="74" y2="35" stroke="#5a5248" stroke-width="0.5"/><line x1="9" y1="41" x2="9" y2="46" stroke="#5a5248" stroke-width="0.5"/><line x1="21" y1="41" x2="21" y2="46" stroke="#5a5248" stroke-width="0.5"/><line x1="33" y1="41" x2="33" y2="46" stroke="#5a5248" stroke-width="0.5"/><line x1="45" y1="41" x2="45" y2="46" stroke="#5a5248" stroke-width="0.5"/><line x1="57" y1="41" x2="57" y2="46" stroke="#5a5248" stroke-width="0.5"/><line x1="69" y1="41" x2="69" y2="46" stroke="#5a5248" stroke-width="0.5"/></svg>',

  towers: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="50" width="40" height="10" fill="#7a7070"/><rect x="24" y="15" width="32" height="36" fill="#888080"/><rect x="24" y="6" width="7" height="11" fill="#888080"/><rect x="35" y="6" width="7" height="11" fill="#888080"/><rect x="46" y="6" width="7" height="11" fill="#888080"/><rect x="30" y="22" width="5" height="12" fill="#1a1a1a"/><rect x="27" y="27" width="11" height="3.5" fill="#1a1a1a"/><rect x="45" y="22" width="5" height="12" fill="#1a1a1a"/><rect x="42" y="27" width="11" height="3.5" fill="#1a1a1a"/><rect x="32" y="47" width="16" height="13" fill="#1a1008"/><ellipse cx="40" cy="47" rx="8" ry="6" fill="#1a1008"/><line x1="24" y1="26" x2="56" y2="26" stroke="#6a6060" stroke-width="0.5"/><line x1="24" y1="38" x2="56" y2="38" stroke="#6a6060" stroke-width="0.5"/><polygon points="37,17 32,28 39,26 34,38 48,24 41,26 46,17" fill="#c8c030"/></svg>',

  castles: '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg"><rect x="22" y="24" width="36" height="36" fill="#8a8278"/><rect x="5" y="28" width="20" height="32" fill="#7a7268"/><rect x="55" y="28" width="20" height="32" fill="#7a7268"/><rect x="22" y="15" width="7" height="11" fill="#8a8278"/><rect x="33" y="15" width="7" height="11" fill="#8a8278"/><rect x="44" y="15" width="7" height="11" fill="#8a8278"/><rect x="5" y="19" width="6" height="10" fill="#7a7268"/><rect x="14" y="19" width="6" height="10" fill="#7a7268"/><rect x="23" y="19" width="6" height="10" fill="#7a7268"/><rect x="51" y="19" width="6" height="10" fill="#7a7268"/><rect x="60" y="19" width="6" height="10" fill="#7a7268"/><rect x="69" y="19" width="6" height="10" fill="#7a7268"/><rect x="31" y="42" width="18" height="18" fill="#1a1008"/><ellipse cx="40" cy="42" rx="9" ry="7" fill="#1a1008"/><line x1="31" y1="44" x2="49" y2="44" stroke="#2a2010" stroke-width="1"/><line x1="31" y1="49" x2="49" y2="49" stroke="#2a2010" stroke-width="1"/><line x1="31" y1="54" x2="49" y2="54" stroke="#2a2010" stroke-width="1"/><line x1="35" y1="42" x2="35" y2="60" stroke="#2a2010" stroke-width="1"/><line x1="40" y1="42" x2="40" y2="60" stroke="#2a2010" stroke-width="1"/><line x1="45" y1="42" x2="45" y2="60" stroke="#2a2010" stroke-width="1"/><line x1="40" y1="3" x2="40" y2="17" stroke="#9a8060" stroke-width="1.5"/><polygon points="40,3 51,8 40,13" fill="#c83020"/><rect x="12" y="33" width="3" height="9" fill="#1a1a18"/><rect x="65" y="33" width="3" height="9" fill="#1a1a18"/><line x1="22" y1="33" x2="58" y2="33" stroke="#6a6258" stroke-width="0.5"/><line x1="22" y1="42" x2="58" y2="42" stroke="#6a6258" stroke-width="0.5"/></svg>',
};

// ----------------------------------------------------------------
// CUSTOM WORKER SVG ICONS (inline, viewBox 0 0 80 62)
// ----------------------------------------------------------------
var WORKER_SVGS = {
  farmers:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Field rows
    '<rect x="2" y="50" width="46" height="10" fill="#3a5a1e" rx="1"/>' +
    '<line x1="10" y1="50" x2="10" y2="60" stroke="#2a4014" stroke-width="1.2"/>' +
    '<line x1="20" y1="50" x2="20" y2="60" stroke="#2a4014" stroke-width="1.2"/>' +
    '<line x1="30" y1="50" x2="30" y2="60" stroke="#2a4014" stroke-width="1.2"/>' +
    '<line x1="40" y1="50" x2="40" y2="60" stroke="#2a4014" stroke-width="1.2"/>' +
    // Body
    '<rect x="20" y="31" width="18" height="20" fill="#8b6a3e" rx="2"/>' +
    // Head
    '<circle cx="29" cy="25" r="7" fill="#c8a870"/>' +
    // Straw hat
    '<ellipse cx="29" cy="20" rx="11" ry="4" fill="#c8a020"/>' +
    '<rect x="24" y="14" width="10" height="8" fill="#c8a020" rx="2"/>' +
    '<ellipse cx="29" cy="14" rx="5" ry="2" fill="#b08010"/>' +
    // Pitchfork handle
    '<line x1="55" y1="10" x2="55" y2="60" stroke="#7a4820" stroke-width="2.5"/>' +
    // Pitchfork tines
    '<line x1="51" y1="10" x2="51" y2="22" stroke="#a08050" stroke-width="2"/>' +
    '<line x1="55" y1="10" x2="55" y2="22" stroke="#a08050" stroke-width="2"/>' +
    '<line x1="59" y1="10" x2="59" y2="22" stroke="#a08050" stroke-width="2"/>' +
    '<line x1="50" y1="22" x2="60" y2="22" stroke="#a08050" stroke-width="1.5"/>' +
    '</svg>',

  woodcutters:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Tree stump
    '<ellipse cx="14" cy="52" rx="10" ry="4" fill="#5a3010"/>' +
    '<rect x="8" y="40" width="12" height="14" fill="#6b3e1a" rx="1"/>' +
    '<line x1="10" y1="43" x2="18" y2="43" stroke="#5a3010" stroke-width="1"/>' +
    '<line x1="10" y1="47" x2="18" y2="47" stroke="#5a3010" stroke-width="1"/>' +
    // Log pile
    '<ellipse cx="30" cy="57" rx="6" ry="3" fill="#8b5e3c"/>' +
    '<ellipse cx="38" cy="57" rx="6" ry="3" fill="#7a4e2c"/>' +
    '<ellipse cx="46" cy="57" rx="6" ry="3" fill="#8b5e3c"/>' +
    '<rect x="24" y="48" width="12" height="10" fill="#8b5e3c" rx="1"/>' +
    '<rect x="32" y="48" width="12" height="10" fill="#7a4e2c" rx="1"/>' +
    // Body
    '<rect x="30" y="28" width="18" height="20" fill="#5a7040" rx="2"/>' +
    // Head
    '<circle cx="39" cy="22" r="7" fill="#c8a870"/>' +
    // Cap
    '<ellipse cx="39" cy="18" rx="8" ry="3" fill="#3a3a3a"/>' +
    '<rect x="34" y="13" width="10" height="6" fill="#3a3a3a" rx="1"/>' +
    // Axe handle
    '<line x1="62" y1="14" x2="55" y2="50" stroke="#7a4820" stroke-width="3" stroke-linecap="round"/>' +
    // Axe blade
    '<polygon points="62,14 74,8 76,20 66,22" fill="#a0a8b0"/>' +
    '<line x1="62" y1="14" x2="76" y2="8" stroke="#808898" stroke-width="1"/>' +
    '</svg>',

  miners:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Rock chunks
    '<polygon points="4,58 10,44 20,42 28,50 22,60" fill="#706860"/>' +
    '<polygon points="22,56 28,46 38,44 42,54 34,60" fill="#5a5248"/>' +
    '<circle cx="12" cy="55" r="3" fill="#c0b080"/>' +
    '<circle cx="32" cy="50" r="2.5" fill="#d0c090"/>' +
    // Body
    '<rect x="28" y="29" width="18" height="22" fill="#607080" rx="2"/>' +
    // Head
    '<circle cx="37" cy="23" r="7" fill="#c8a870"/>' +
    // Mining helmet
    '<polygon points="29,22 30,14 37,11 44,14 45,22" fill="#707878"/>' +
    '<rect x="31" y="19" width="12" height="5" fill="#606868" rx="1"/>' +
    // Helmet lamp
    '<ellipse cx="37" cy="13" rx="4" ry="2.5" fill="#c8c020"/>' +
    '<polygon points="35,13 39,13 38,10 36,10" fill="#ffd700"/>' +
    // Pickaxe handle
    '<line x1="60" y1="18" x2="50" y2="52" stroke="#7a4820" stroke-width="3" stroke-linecap="round"/>' +
    // Pickaxe head
    '<polygon points="55,20 72,12 74,20 62,26" fill="#b0b8c0"/>' +
    '<polygon points="55,20 42,28 46,34 60,26" fill="#a0a8b0"/>' +
    '</svg>',

  taxcollectors:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Robe
    '<polygon points="18,60 22,30 44,30 48,60" fill="#4a3870"/>' +
    '<rect x="22" y="30" width="22" height="30" fill="#4a3870"/>' +
    '<line x1="25" y1="35" x2="41" y2="35" stroke="#6a50a0" stroke-width="1.5"/>' +
    '<line x1="23" y1="45" x2="43" y2="45" stroke="#6a50a0" stroke-width="1"/>' +
    '<line x1="19" y1="55" x2="47" y2="55" stroke="#6a50a0" stroke-width="1"/>' +
    // Body upper
    '<rect x="22" y="22" width="22" height="10" fill="#5a4880" rx="1"/>' +
    // Head
    '<circle cx="33" cy="16" r="7" fill="#c8a870"/>' +
    // Hat
    '<rect x="26" y="8" width="14" height="9" fill="#2a1840" rx="1"/>' +
    '<rect x="22" y="9" width="22" height="3" fill="#3a2850" rx="1"/>' +
    // Scroll in right hand
    '<rect x="50" y="26" width="8" height="16" fill="#e8dcc0" rx="2"/>' +
    '<ellipse cx="54" cy="26" rx="4" ry="2" fill="#c8b890"/>' +
    '<ellipse cx="54" cy="42" rx="4" ry="2" fill="#c8b890"/>' +
    '<line x1="52" y1="30" x2="58" y2="30" stroke="#9a7840" stroke-width="1"/>' +
    '<line x1="52" y1="34" x2="58" y2="34" stroke="#9a7840" stroke-width="1"/>' +
    // Coin bag left hand
    '<ellipse cx="16" cy="42" rx="8" ry="9" fill="#c8a020"/>' +
    '<line x1="11" y1="34" x2="21" y2="34" stroke="#9a7010" stroke-width="2"/>' +
    '<rect x="13" y="32" width="6" height="4" fill="#b08010" rx="1"/>' +
    '</svg>',
};

// ----------------------------------------------------------------
// CUSTOM UNIT SVG ICONS (inline, viewBox 0 0 80 62)
// ----------------------------------------------------------------
var UNIT_SVGS = {
  spearmen:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Round shield
    '<circle cx="20" cy="38" r="14" fill="#6b3010" stroke="#4a2008" stroke-width="1.5"/>' +
    '<circle cx="20" cy="38" r="10" fill="#8b4020"/>' +
    '<line x1="20" y1="28" x2="20" y2="48" stroke="#c8a020" stroke-width="1.5"/>' +
    '<line x1="10" y1="38" x2="30" y2="38" stroke="#c8a020" stroke-width="1.5"/>' +
    // Body
    '<rect x="30" y="26" width="16" height="22" fill="#7a7060" rx="2"/>' +
    // Head / helmet
    '<circle cx="38" cy="20" r="7" fill="#c8a870"/>' +
    '<polygon points="31,20 31,14 38,10 45,14 45,20" fill="#909888"/>' +
    '<rect x="33" y="17" width="10" height="4" fill="#10100e"/>' +
    // Spear handle
    '<line x1="62" y1="3" x2="58" y2="60" stroke="#8b5e2c" stroke-width="2.5" stroke-linecap="round"/>' +
    // Spear tip
    '<polygon points="60,3 66,3 62,12" fill="#c0c8d0"/>' +
    '</svg>',

  archers:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Quiver on back
    '<rect x="54" y="18" width="8" height="24" fill="#6b3e1a" rx="2"/>' +
    '<line x1="56" y1="16" x2="58" y2="26" stroke="#c8a030" stroke-width="1.5"/>' +
    '<line x1="59" y1="15" x2="61" y2="25" stroke="#c8a030" stroke-width="1.5"/>' +
    '<line x1="62" y1="16" x2="60" y2="26" stroke="#c8a030" stroke-width="1.5"/>' +
    // Body
    '<rect x="26" y="26" width="16" height="22" fill="#5a6840" rx="2"/>' +
    // Head
    '<circle cx="34" cy="20" r="7" fill="#c8a870"/>' +
    // Hood
    '<polygon points="27,20 28,12 34,9 40,12 41,20" fill="#4a5830"/>' +
    // Bow (drawn arc)
    '<path d="M 12 10 Q 2 31 12 52" stroke="#8b5e20" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<line x1="12" y1="10" x2="12" y2="52" stroke="#c8a030" stroke-width="1.2"/>' +
    // Arrow nocked
    '<line x1="12" y1="31" x2="50" y2="22" stroke="#c8a050" stroke-width="1.5"/>' +
    '<polygon points="50,22 44,19 44,25" fill="#c8a030"/>' +
    // Arrow fletching
    '<polygon points="12,31 8,27 10,33" fill="#c83020"/>' +
    '</svg>',

  knights:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Kite shield
    '<polygon points="6,18 6,44 16,58 26,44 26,18" fill="#3a4858"/>' +
    '<polygon points="8,20 8,43 16,55 24,43 24,20" fill="#4a5868"/>' +
    '<line x1="16" y1="22" x2="16" y2="50" stroke="#808898" stroke-width="1.5"/>' +
    '<line x1="9" y1="34" x2="23" y2="34" stroke="#808898" stroke-width="1.5"/>' +
    // Plate armour body
    '<rect x="30" y="26" width="18" height="24" fill="#888080" rx="2"/>' +
    '<line x1="30" y1="34" x2="48" y2="34" stroke="#707070" stroke-width="1"/>' +
    '<line x1="30" y1="42" x2="48" y2="42" stroke="#707070" stroke-width="1"/>' +
    // Helm
    '<polygon points="30,22 30,13 39,9 48,13 48,22" fill="#909898"/>' +
    '<rect x="32" y="17" width="14" height="5" fill="#10100e"/>' +
    '<rect x="34" y="20" width="10" height="2" fill="#303838"/>' +
    // Sword raised
    '<line x1="62" y1="6" x2="56" y2="40" stroke="#c0c8d0" stroke-width="3.5" stroke-linecap="round"/>' +
    '<rect x="53" y="36" width="14" height="4" fill="#c8a020" rx="1"/>' +
    '<rect x="57" y="38" width="5" height="10" fill="#8b6020" rx="1"/>' +
    // Sword tip
    '<polygon points="62,6 66,6 64,2" fill="#d0d8e0"/>' +
    '</svg>',

  siege:
    '<svg viewBox="0 0 80 62" xmlns="http://www.w3.org/2000/svg">' +
    // Wheels
    '<circle cx="16" cy="50" r="10" fill="none" stroke="#5a3010" stroke-width="3"/>' +
    '<circle cx="16" cy="50" r="3" fill="#4a2810"/>' +
    '<line x1="16" y1="40" x2="16" y2="60" stroke="#4a2810" stroke-width="1.5"/>' +
    '<line x1="6" y1="50" x2="26" y2="50" stroke="#4a2810" stroke-width="1.5"/>' +
    '<line x1="9" y1="43" x2="23" y2="57" stroke="#4a2810" stroke-width="1.5"/>' +
    '<line x1="23" y1="43" x2="9" y2="57" stroke="#4a2810" stroke-width="1.5"/>' +
    '<circle cx="52" cy="52" r="8" fill="none" stroke="#5a3010" stroke-width="3"/>' +
    '<circle cx="52" cy="52" r="2.5" fill="#4a2810"/>' +
    '<line x1="52" y1="44" x2="52" y2="60" stroke="#4a2810" stroke-width="1.5"/>' +
    '<line x1="44" y1="52" x2="60" y2="52" stroke="#4a2810" stroke-width="1.5"/>' +
    // Frame
    '<rect x="12" y="36" width="44" height="12" fill="#7a5030" rx="2"/>' +
    '<rect x="24" y="28" width="6" height="10" fill="#6b4020" rx="1"/>' +
    '<rect x="40" y="28" width="6" height="10" fill="#6b4020" rx="1"/>' +
    // Throwing arm
    '<line x1="34" y1="38" x2="64" y2="12" stroke="#8b5e2c" stroke-width="4" stroke-linecap="round"/>' +
    // Counterweight
    '<rect x="30" y="34" width="8" height="10" fill="#505040" rx="2"/>' +
    // Projectile cup
    '<polygon points="62,10 70,6 72,14 64,16" fill="#6b4820"/>' +
    // Boulder
    '<circle cx="70" cy="8" r="5" fill="#707060"/>' +
    '</svg>',
};

// ----------------------------------------------------------------
// RESOURCE SVG ICONS (viewBox 0 0 32 32, used in header bar)
// ----------------------------------------------------------------
var RESOURCE_SVGS = {
  gold:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="16" cy="16" r="13" fill="#c8a020" stroke="#7a5010" stroke-width="1.5"/>' +
    '<circle cx="16" cy="16" r="9" fill="#e8c030"/>' +
    '<text x="16" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#7a5010" font-family="serif">G</text>' +
    '</svg>',
  food:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<line x1="16" y1="26" x2="16" y2="10" stroke="#8b6020" stroke-width="2"/>' +
    '<ellipse cx="10" cy="15" rx="4" ry="7" fill="#c8a020"/>' +
    '<ellipse cx="16" cy="13" rx="4" ry="8" fill="#e8c030"/>' +
    '<ellipse cx="22" cy="15" rx="4" ry="7" fill="#c8a020"/>' +
    '</svg>',
  wood:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="4" y="14" width="24" height="8" fill="#8b5e3c" rx="2"/>' +
    '<ellipse cx="4" cy="18" rx="3" ry="4" fill="#6b3e1a"/>' +
    '<ellipse cx="28" cy="18" rx="3" ry="4" fill="#6b3e1a"/>' +
    '<line x1="8" y1="14" x2="8" y2="22" stroke="#6b3e1a" stroke-width="1"/>' +
    '<line x1="14" y1="14" x2="14" y2="22" stroke="#6b3e1a" stroke-width="1"/>' +
    '<line x1="20" y1="14" x2="20" y2="22" stroke="#6b3e1a" stroke-width="1"/>' +
    '</svg>',
  stone:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="6,26 4,18 10,8 22,8 28,18 26,26" fill="#7a8878"/>' +
    '<polygon points="8,24 6,18 11,10 21,10 26,18 24,24" fill="#909898"/>' +
    '<line x1="8" y1="18" x2="24" y2="18" stroke="#6a7868" stroke-width="1.5"/>' +
    '</svg>',
};

// ----------------------------------------------------------------
// MISC SVG ICONS (viewBox 0 0 32 32)
// ----------------------------------------------------------------
var MISC_SVGS = {
  crown:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="4,26 4,12 10,18 16,6 22,18 28,12 28,26" fill="#c8a020"/>' +
    '<rect x="4" y="24" width="24" height="6" fill="#a07818" rx="1"/>' +
    '<circle cx="16" cy="28" r="2.5" fill="#ffd83e"/>' +
    '<circle cx="8" cy="28" r="2" fill="#ffd83e"/>' +
    '<circle cx="24" cy="28" r="2" fill="#ffd83e"/>' +
    '</svg>',
  swords:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<line x1="4" y1="28" x2="28" y2="4" stroke="#c0c8d0" stroke-width="3" stroke-linecap="round"/>' +
    '<polygon points="28,4 24,6 26,10" fill="#d0d8e0"/>' +
    '<rect x="2" y="24" width="6" height="3" fill="#c8a030" rx="1" transform="rotate(-45 5 25.5)"/>' +
    '<line x1="28" y1="28" x2="4" y2="4" stroke="#b0b8c0" stroke-width="3" stroke-linecap="round"/>' +
    '<polygon points="4,4 8,6 6,10" fill="#c8d0d8"/>' +
    '<rect x="24" y="24" width="6" height="3" fill="#c8a030" rx="1" transform="rotate(45 27 25.5)"/>' +
    '</svg>',
  collect:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="16,3 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12" fill="#c8a020"/>' +
    '<polygon points="16,6 19,13 27,13 21,17 23,25 16,21 9,25 11,17 5,13 13,13" fill="#e8c030"/>' +
    '</svg>',
  fire:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M16,2 Q22,10 20,16 Q26,12 24,20 Q22,28 16,30 Q10,28 8,20 Q6,12 12,16 Q10,10 16,2" fill="#e85020"/>' +
    '<path d="M16,8 Q20,14 18,18 Q20,16 20,20 Q19,26 16,28 Q13,26 12,20 Q12,16 14,18 Q12,14 16,8" fill="#f8a020"/>' +
    '</svg>',
  event:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="16,2 19,11 28,11 21,17 24,26 16,20 8,26 11,17 4,11 13,11" fill="#c8a870"/>' +
    '</svg>',
  hero:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="16" cy="10" r="6" fill="#c8a870"/>' +
    '<polygon points="12,8 12,4 16,2 20,4 20,8" fill="#c8a020"/>' +
    '<rect x="10" y="16" width="12" height="14" fill="#4a5868" rx="2"/>' +
    '<rect x="4" y="16" width="8" height="10" fill="#3a4858" rx="2"/>' +
    '<rect x="20" y="16" width="8" height="10" fill="#3a4858" rx="2"/>' +
    '</svg>',
  skull:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="16" cy="13" rx="10" ry="11" fill="#c8c8b8"/>' +
    '<rect x="8" y="22" width="16" height="6" fill="#c8c8b8" rx="1"/>' +
    '<circle cx="12" cy="13" r="3" fill="#1a1a18"/>' +
    '<circle cx="20" cy="13" r="3" fill="#1a1a18"/>' +
    '<rect x="10" y="25" width="4" height="3" fill="#1a1a18" rx="0.5"/>' +
    '<rect x="14" y="24" width="4" height="3" fill="#1a1a18" rx="0.5"/>' +
    '<rect x="18" y="25" width="4" height="3" fill="#1a1a18" rx="0.5"/>' +
    '</svg>',
  market:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="4,14 16,4 28,14" fill="#7a3818"/>' +
    '<rect x="3" y="13" width="26" height="4" fill="#c83c18"/>' +
    '<rect x="4" y="17" width="24" height="13" fill="#9a8050"/>' +
    '<circle cx="16" cy="24" r="5" fill="#c8a020"/>' +
    '<circle cx="16" cy="24" r="3" fill="#e8c030"/>' +
    '</svg>',
  harvest:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="8" cy="18" rx="3" ry="7" fill="#c8a020"/>' +
    '<ellipse cx="14" cy="15" rx="3" ry="8" fill="#e8c030"/>' +
    '<ellipse cx="20" cy="18" rx="3" ry="7" fill="#c8a020"/>' +
    '<ellipse cx="26" cy="16" rx="3" ry="7" fill="#e8c030"/>' +
    '<line x1="8" y1="25" x2="8" y2="29" stroke="#8b6020" stroke-width="2"/>' +
    '<line x1="14" y1="23" x2="14" y2="29" stroke="#8b6020" stroke-width="2"/>' +
    '<line x1="20" y1="25" x2="20" y2="29" stroke="#8b6020" stroke-width="2"/>' +
    '<line x1="26" y1="23" x2="26" y2="29" stroke="#8b6020" stroke-width="2"/>' +
    '<rect x="4" y="27" width="24" height="3" fill="#5a3010" rx="1"/>' +
    '</svg>',
  bandits:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="16" cy="11" r="6" fill="#c8a870"/>' +
    '<rect x="12" y="8" width="8" height="5" fill="#1a1a18" rx="1"/>' +
    '<rect x="10" y="17" width="12" height="13" fill="#2a2a28" rx="2"/>' +
    '<line x1="6" y1="10" x2="14" y2="20" stroke="#c0c8d0" stroke-width="2" stroke-linecap="round"/>' +
    '<polygon points="6,10 4,14 8,13" fill="#d0d8e0"/>' +
    '</svg>',
  traders:
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="6" y="16" width="20" height="12" fill="#8b5e3c" rx="2"/>' +
    '<polygon points="4,16 16,8 28,16" fill="#6b3e1a"/>' +
    '<circle cx="10" cy="28" r="3" fill="#5a3010"/>' +
    '<circle cx="22" cy="28" r="3" fill="#5a3010"/>' +
    '<circle cx="16" cy="22" r="4" fill="#c8a020" stroke="#8b6010" stroke-width="1"/>' +
    '<circle cx="16" cy="22" r="2.5" fill="#e8c030"/>' +
    '</svg>',
};

// tree:      economy | military | defense
// tier:      0-3 (grid row). Tier N requires N talents spent in tree.
// col:       0-2 (grid column)
// exclusive: array of IDs — only ONE from the exclusive group can be bought
// cost:      resource cost ON TOP of the 1 talent point required
// ----------------------------------------------------------------
var TALENT_DEFS = [
  // ═══════════════════════════  ECONOMY  ═══════════════════════════
  { id:'eco_t1a', name:'Crop Rotation',    tree:'economy',  tier:0, col:0, exclusive:[],
    cost:{gold:100},
    desc:'+40% food & farm production',
    effect:function(s){ s.foodMult = (s.foodMult||1) * 1.4; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="30" width="36" height="6" fill="#3a5a1e" rx="1"/><line x1="10" y1="30" x2="10" y2="18" stroke="#c8a020" stroke-width="2"/><ellipse cx="10" cy="15" rx="3" ry="5" fill="#c8a020"/><line x1="20" y1="30" x2="20" y2="15" stroke="#c8a020" stroke-width="2"/><ellipse cx="20" cy="12" rx="3" ry="5" fill="#c8a020"/><line x1="30" y1="30" x2="30" y2="18" stroke="#c8a020" stroke-width="2"/><ellipse cx="30" cy="15" rx="3" ry="5" fill="#c8a020"/><path d="M4,8 A9,7 0 0 1 36,8" stroke="#50a030" stroke-width="2" fill="none" stroke-linecap="round"/><polygon points="4,8 2,13 7,11" fill="#50a030"/></svg>' },

  { id:'eco_t1b', name:'Lumber Expertise', tree:'economy',  tier:0, col:2, exclusive:[],
    cost:{gold:100},
    desc:'+40% wood production',
    effect:function(s){ s.woodMult = (s.woodMult||1) * 1.4; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 32,18 8,18" fill="#2d6014"/><polygon points="20,7 36,25 4,25" fill="#3a7820"/><rect x="16" y="25" width="8" height="7" fill="#7a4820"/><rect x="4" y="30" width="32" height="5" fill="#6b3e1a" rx="1"/><line x1="12" y1="20" x2="30" y2="38" stroke="#c0c0a0" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="24" x2="26" y2="42" stroke="#9a9888" stroke-width="1.5"/></svg>' },

  { id:'eco_t2a', name:'Tax Reform',       tree:'economy',  tier:1, col:0, exclusive:['eco_t2c'],
    cost:{gold:200},
    desc:'+1 gold/click & +20% gold rate',
    effect:function(s){ s.clickBonus += 1; s.goldMult = (s.goldMult||1) * 1.2; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="5" width="20" height="25" fill="#c8a060" rx="2"/><rect x="7" y="5" width="20" height="4" fill="#a07830" rx="2"/><rect x="7" y="26" width="20" height="4" fill="#a07830" rx="2"/><line x1="11" y1="14" x2="23" y2="14" stroke="#7a5020" stroke-width="1.5"/><line x1="11" y1="19" x2="18" y2="19" stroke="#7a5020" stroke-width="1.5"/><circle cx="31" cy="30" r="8" fill="#c8a020" stroke="#7a5010" stroke-width="1.5"/><circle cx="31" cy="30" r="5" fill="#e8c030"/></svg>' },

  { id:'eco_t2b', name:'Master Crafters',  tree:'economy',  tier:1, col:1, exclusive:[],
    cost:{gold:300,wood:80},
    desc:'+30% all worker output',
    effect:function(s){ s.workerMult *= 1.3; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="24" width="24" height="12" fill="#707878" rx="2"/><rect x="13" y="20" width="14" height="6" fill="#585858" rx="1"/><rect x="17" y="8" width="4" height="14" fill="#9a7050"/><rect x="11" y="5" width="14" height="7" fill="#b0b8c0" rx="1"/><rect x="11" y="5" width="14" height="2" fill="#a0a8b0"/></svg>' },

  { id:'eco_t2c', name:'Stone Masonry',    tree:'economy',  tier:1, col:2, exclusive:['eco_t2a'],
    cost:{stone:100,gold:150},
    desc:'+50% stone production',
    effect:function(s){ s.stoneMult = (s.stoneMult||1) * 1.5; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="13" width="22" height="20" fill="#7a8878" rx="2"/><line x1="3" y1="23" x2="25" y2="23" stroke="#6a7868" stroke-width="2"/><line x1="14" y1="13" x2="14" y2="33" stroke="#6a7868" stroke-width="2"/><rect x="27" y="6" width="5" height="22" fill="#c8a060" rx="2"/><polygon points="32,28 38,30 32,32" fill="#a0a090"/><rect x="25" y="10" width="4" height="14" fill="#8b6a3e" rx="1"/></svg>' },

  { id:'eco_t3a', name:'Trade Empire',     tree:'economy',  tier:2, col:0, exclusive:[],
    cost:{gold:500,wood:100},
    desc:'+50% gold rate & +2 gold/click',
    effect:function(s){ s.goldMult = (s.goldMult||1) * 1.5; s.clickBonus += 2; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="26" r="8" fill="#c8a020" stroke="#7a5010" stroke-width="1.5"/><circle cx="10" cy="26" r="5" fill="#e8c030"/><circle cx="22" cy="18" r="8" fill="#c8a020" stroke="#7a5010" stroke-width="1.5"/><circle cx="22" cy="18" r="5" fill="#e8c030"/><circle cx="32" cy="28" r="7" fill="#c8a020" stroke="#7a5010" stroke-width="1.5"/><circle cx="32" cy="28" r="4" fill="#e8c030"/><line x1="2" y1="36" x2="34" y2="4" stroke="#50a030" stroke-width="2" stroke-linecap="round"/><polygon points="34,4 31,8 36,8" fill="#50a030"/></svg>' },

  { id:'eco_t3b', name:'Grand Storehouse', tree:'economy',  tier:2, col:2, exclusive:[],
    cost:{wood:200,stone:150},
    desc:'x2 max resource storage',
    effect:function(s){ s.storageMult = (s.storageMult||1) * 2; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="18" width="32" height="20" fill="#8b5e3c" rx="2"/><rect x="4" y="13" width="32" height="7" fill="#6b3e1a" rx="2"/><rect x="14" y="22" width="12" height="10" fill="#6b3e1a" rx="1"/><rect x="16" y="24" width="8" height="6" fill="#c8a020" rx="1"/><circle cx="20" cy="27" r="2.5" fill="#e8c030"/><circle cx="9" cy="28" r="4" fill="#a07030"/><circle cx="31" cy="28" r="4" fill="#a07030"/></svg>' },

  { id:'eco_cap', name:'Imperial Economy', tree:'economy',  tier:3, col:1, exclusive:[],
    cost:{gold:1000,wood:300,stone:300},
    desc:'x2 all resource production',
    effect:function(s){ s.workerMult *= 2; s.foodMult=(s.foodMult||1)*1.5; s.woodMult=(s.woodMult||1)*1.5; s.stoneMult=(s.stoneMult||1)*1.5; s.goldMult=(s.goldMult||1)*1.5; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="4,28 4,14 11,20 20,5 29,20 36,14 36,28" fill="#c8a020"/><rect x="4" y="26" width="32" height="8" fill="#a07818" rx="1"/><circle cx="20" cy="31" r="3" fill="#ffd83e"/><circle cx="10" cy="31" r="2.5" fill="#ffd83e"/><circle cx="30" cy="31" r="2.5" fill="#ffd83e"/><line x1="20" y1="2" x2="20" y2="6" stroke="#ffd700" stroke-width="2"/><line x1="13" y1="4" x2="15" y2="7" stroke="#ffd700" stroke-width="1.5"/><line x1="27" y1="4" x2="25" y2="7" stroke="#ffd700" stroke-width="1.5"/></svg>' },

  // ═══════════════════════════  MILITARY  ══════════════════════════
  { id:'mil_t1a', name:'Iron Weapons',     tree:'military', tier:0, col:0, exclusive:[],
    cost:{gold:200,wood:50},
    desc:'+25% all unit attack',
    effect:function(s){ s.attackMult *= 1.25; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="35" x2="35" y2="5" stroke="#c0c8d0" stroke-width="4" stroke-linecap="round"/><polygon points="35,5 30,8 32,12" fill="#d0d8e0"/><rect x="2" y="29" width="8" height="4" fill="#c8a030" rx="1" transform="rotate(-45 6 31)"/><line x1="35" y1="35" x2="5" y2="5" stroke="#b0b0c0" stroke-width="4" stroke-linecap="round"/><polygon points="5,5 10,8 8,12" fill="#c8d0d8"/><rect x="30" y="29" width="8" height="4" fill="#c8a030" rx="1" transform="rotate(45 34 31)"/></svg>' },

  { id:'mil_t1b', name:'Battle Hardening', tree:'military', tier:0, col:2, exclusive:[],
    cost:{gold:200,food:50},
    desc:'+50 army cap & -10% losses',
    effect:function(s){ s.armyCap += 50; s.lossReduction += 0.1; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20,3 L36,9 L36,22 Q36,32 20,38 Q4,32 4,22 L4,9 Z" fill="#3a4858"/><path d="M20,5 L34,10 L34,22 Q34,30 20,36 Q6,30 6,22 L6,10 Z" fill="#4a5868"/><rect x="17" y="12" width="6" height="18" fill="#c0b890" rx="1"/><rect x="11" y="18" width="18" height="6" fill="#c0b890" rx="1"/></svg>' },

  { id:'mil_t2a', name:'Heavy Cavalry',    tree:'military', tier:1, col:0, exclusive:['mil_t2c'],
    cost:{gold:400,food:100},
    desc:'Knights deal x1.5 damage',
    effect:function(s){ s.knightMult = (s.knightMult||1) * 1.5; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M6,36 L8,22 L14,16 L22,12 L32,10 L36,14 L33,19 L28,17 L24,21 L26,28 L22,32 L14,36 Z" fill="#9a7050"/><circle cx="30" cy="12" r="4" fill="#6b4a2e"/><rect x="28" y="5" width="5" height="8" fill="#8b6040" rx="1"/><line x1="30" y1="5" x2="28" y2="1" stroke="#c8a030" stroke-width="2"/><line x1="32" y1="5" x2="34" y2="1" stroke="#c8a030" stroke-width="2"/></svg>' },

  { id:'mil_t2b', name:'Tactics Manual',   tree:'military', tier:1, col:1, exclusive:[],
    cost:{gold:400,wood:80},
    desc:'+30% attack & -10% losses',
    effect:function(s){ s.attackMult *= 1.3; s.lossReduction += 0.1; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="30" height="26" fill="#c8a060" rx="2"/><rect x="5" y="10" width="3" height="26" fill="#8b5e30"/><rect x="32" y="10" width="3" height="26" fill="#8b5e30"/><line x1="20" y1="10" x2="20" y2="36" stroke="#9a7040" stroke-width="1.5"/><line x1="8" y1="17" x2="18" y2="18" stroke="#7a5020" stroke-width="1.5"/><line x1="8" y1="22" x2="18" y2="23" stroke="#7a5020" stroke-width="1.5"/><line x1="22" y1="18" x2="32" y2="17" stroke="#7a5020" stroke-width="1.5"/><line x1="22" y1="23" x2="32" y2="22" stroke="#7a5020" stroke-width="1.5"/><line x1="20" y1="2" x2="20" y2="12" stroke="#b0b8c0" stroke-width="3" stroke-linecap="round"/><rect x="14" y="10" width="12" height="3" fill="#c8a030" rx="1"/><polygon points="18,2 22,2 20,0" fill="#d0d8e0"/></svg>' },

  { id:'mil_t2c', name:'Siege Mastery',    tree:'military', tier:1, col:2, exclusive:['mil_t2a'],
    cost:{gold:350,wood:150},
    desc:'Siege x2 damage, +3 tower dmg',
    effect:function(s){ s.siegeMult = (s.siegeMult||1) * 2; s.towerBonus += 3; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="24" width="22" height="10" fill="#7a5030" rx="2"/><circle cx="8" cy="34" r="5" fill="none" stroke="#5a3010" stroke-width="2.5"/><circle cx="22" cy="34" r="5" fill="none" stroke="#5a3010" stroke-width="2.5"/><circle cx="8" cy="34" r="2" fill="#4a2810"/><circle cx="22" cy="34" r="2" fill="#4a2810"/><line x1="22" y1="26" x2="38" y2="8" stroke="#6b4820" stroke-width="3.5" stroke-linecap="round"/><circle cx="38" cy="7" r="5" fill="#505040"/></svg>' },

  { id:'mil_t3a', name:'War Drums',        tree:'military', tier:2, col:0, exclusive:[],
    cost:{gold:600,food:150},
    desc:'+50 army cap & +20% attack',
    effect:function(s){ s.armyCap += 50; s.attackMult *= 1.2; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="12" rx="15" ry="6" fill="#8b3020"/><rect x="5" y="12" width="30" height="16" fill="#9a3822"/><ellipse cx="20" cy="28" rx="15" ry="6" fill="#6b2010"/><line x1="5" y1="12" x2="5" y2="28" stroke="#7a2810" stroke-width="1.5"/><line x1="35" y1="12" x2="35" y2="28" stroke="#7a2810" stroke-width="1.5"/><line x1="3" y1="5" x2="13" y2="15" stroke="#9a7040" stroke-width="2.5" stroke-linecap="round"/><circle cx="3" cy="4" r="3" fill="#7a5020"/><line x1="37" y1="5" x2="27" y2="15" stroke="#9a7040" stroke-width="2.5" stroke-linecap="round"/><circle cx="37" cy="4" r="3" fill="#7a5020"/></svg>' },

  { id:'mil_t3b', name:'Plunder Master',   tree:'military', tier:2, col:2, exclusive:[],
    cost:{gold:600,food:100},
    desc:'x2 battle loot',
    effect:function(s){ s.battleLootMult = (s.battleLootMult||1) * 2; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="27" rx="12" ry="10" fill="#c8a020" stroke="#8b6010" stroke-width="1.5"/><ellipse cx="18" cy="27" rx="8" ry="6" fill="#e8c030"/><rect x="13" y="12" width="10" height="9" fill="#a07810" rx="3"/><ellipse cx="18" cy="12" rx="5" ry="3" fill="#8b6010"/><line x1="18" y1="9" x2="18" y2="13" stroke="#7a5010" stroke-width="2"/><line x1="28" y1="4" x2="34" y2="22" stroke="#c0c0a0" stroke-width="3" stroke-linecap="round"/><polygon points="30,21 36,21 34,27" fill="#d0d0b0"/></svg>' },

  { id:'mil_cap', name:'Imperial Legion',  tree:'military', tier:3, col:1, exclusive:[],
    cost:{gold:1500,stone:300},
    desc:'x2 attack power, +100 army cap',
    effect:function(s){ s.attackMult *= 2; s.armyCap += 100; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="2" x2="20" y2="38" stroke="#9a7040" stroke-width="2.5"/><rect x="20" y="4" width="16" height="20" fill="#c83020"/><line x1="20" y1="10" x2="36" y2="10" stroke="#ffd700" stroke-width="1.5"/><line x1="20" y1="16" x2="36" y2="16" stroke="#ffd700" stroke-width="1.5"/><polygon points="27,5 31,10 23,10" fill="#ffd700"/><polygon points="14,5 4,5 10,12 4,19 14,19 20,12" fill="#6a4820"/><line x1="10" y1="5" x2="10" y2="19" stroke="#8a5820" stroke-width="1"/></svg>' },

  // ═══════════════════════════  DEFENSE  ═══════════════════════════
  { id:'def_t1a', name:'Reinforced Gates', tree:'defense',  tier:0, col:0, exclusive:[],
    cost:{wood:150,stone:100},
    desc:'-20% enemy raid damage',
    effect:function(s){ s.raidDefense += 0.2; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="32" height="28" fill="#7a8070"/><rect x="4" y="8" width="32" height="5" fill="#606860"/><rect x="13" y="13" width="7" height="18" fill="#1a1a18"/><rect x="20" y="13" width="7" height="18" fill="#1a1a18"/><line x1="13" y1="22" x2="20" y2="22" stroke="#7a8070" stroke-width="2"/><line x1="20" y1="22" x2="27" y2="22" stroke="#7a8070" stroke-width="2"/><line x1="9" y1="8" x2="9" y2="36" stroke="#c8a020" stroke-width="2.5"/><line x1="31" y1="8" x2="31" y2="36" stroke="#c8a020" stroke-width="2.5"/></svg>' },

  { id:'def_t1b', name:'Watchtowers',      tree:'defense',  tier:0, col:2, exclusive:[],
    cost:{wood:100,stone:150},
    desc:'+5 tower auto-damage/s',
    effect:function(s){ s.towerBonus += 5; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="16" width="12" height="24" fill="#888080"/><rect x="11" y="8" width="5" height="10" fill="#888080"/><rect x="18" y="8" width="5" height="10" fill="#888080"/><rect x="24" y="8" width="5" height="10" fill="#888080"/><rect x="16" y="23" width="6" height="12" fill="#1a1a18"/><ellipse cx="20" cy="14" rx="10" ry="5" fill="none" stroke="#c8c020" stroke-width="2"/><circle cx="20" cy="14" r="3" fill="#c8c020"/><line x1="8" y1="14" x2="13" y2="14" stroke="#c8c020" stroke-width="1.5" stroke-dasharray="2,2"/><line x1="27" y1="14" x2="32" y2="14" stroke="#c8c020" stroke-width="1.5" stroke-dasharray="2,2"/></svg>' },

  { id:'def_t2a', name:'Moat Construction',tree:'defense',  tier:1, col:0, exclusive:['def_t2c'],
    cost:{wood:200,stone:200},
    desc:'-25% troop losses in battles',
    effect:function(s){ s.lossReduction += 0.25; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="5" width="20" height="18" fill="#8a8078"/><rect x="10" y="1" width="5" height="6" fill="#8a8078"/><rect x="18" y="1" width="5" height="6" fill="#8a8078"/><rect x="25" y="1" width="5" height="6" fill="#8a8078"/><rect x="4" y="23" width="32" height="14" fill="#2a6888"/><path d="M4,25 Q10,21 16,25 Q22,29 28,25 Q34,21 40,25" stroke="#60b0d0" stroke-width="2" fill="none"/><path d="M4,30 Q10,26 16,30 Q22,34 28,30 Q34,26 40,30" stroke="#60b0d0" stroke-width="2" fill="none"/></svg>' },

  { id:'def_t2b', name:'Garrison Training', tree:'defense', tier:1, col:1, exclusive:[],
    cost:{gold:400,food:120},
    desc:'-15% losses & +3 tower dmg',
    effect:function(s){ s.lossReduction += 0.15; s.towerBonus += 3; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20,3 L35,8 L35,20 Q35,30 20,37 Q5,30 5,20 L5,8 Z" fill="#3a4858"/><path d="M20,5 L33,10 L33,20 Q33,28 20,35 Q7,28 7,20 L7,10 Z" fill="#4a5868"/><line x1="20" y1="12" x2="20" y2="28" stroke="#c0b890" stroke-width="3" stroke-linecap="round"/><rect x="13" y="19" width="14" height="3.5" fill="#c8a030" rx="1"/></svg>' },

  { id:'def_t2c', name:'Arrow Slits',      tree:'defense',  tier:1, col:2, exclusive:['def_t2a'],
    cost:{wood:100,stone:250},
    desc:'+8 tower auto-damage/s',
    effect:function(s){ s.towerBonus += 8; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="16" width="36" height="24" fill="#8a8278"/><rect x="2" y="6" width="9" height="12" fill="#8a8278"/><rect x="16" y="6" width="8" height="12" fill="#8a8278"/><rect x="29" y="6" width="9" height="12" fill="#8a8278"/><rect x="17" y="8" width="6" height="16" fill="#1a1a18"/><rect x="19" y="4" width="2" height="20" fill="#1a1a18"/><line x1="23" y1="16" x2="38" y2="10" stroke="#c8a030" stroke-width="1.5"/><polygon points="38,10 35,13 36,17" fill="#c8a030"/></svg>' },

  { id:'def_t3a', name:'Shield Wall',      tree:'defense',  tier:2, col:0, exclusive:[],
    cost:{gold:600,stone:200},
    desc:'-20% losses & +15% raid defense',
    effect:function(s){ s.lossReduction += 0.2; s.raidDefense += 0.15; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M8,7 L15,9 L15,18 Q15,23 8,26 Q1,23 1,18 L1,9 Z" fill="#3a4050" transform="translate(2,4)"/><path d="M8,7 L15,9 L15,18 Q15,23 8,26 Q1,23 1,18 L1,9 Z" fill="#4a5060" transform="translate(10,2)"/><path d="M8,7 L15,9 L15,18 Q15,23 8,26 Q1,23 1,18 L1,9 Z" fill="#606878" transform="translate(18,4)"/><line x1="6" y1="18" x2="15" y2="18" stroke="#c8a020" stroke-width="1.5" transform="translate(2,4)"/><line x1="6" y1="18" x2="15" y2="18" stroke="#c8a020" stroke-width="1.5" transform="translate(10,2)"/><line x1="6" y1="18" x2="15" y2="18" stroke="#c8a020" stroke-width="1.5" transform="translate(18,4)"/></svg>' },

  { id:'def_t3b', name:'Ballista Works',   tree:'defense',  tier:2, col:2, exclusive:[],
    cost:{gold:800,wood:250},
    desc:'+10 tower auto-damage/s',
    effect:function(s){ s.towerBonus += 10; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="22" width="24" height="10" fill="#7a5030" rx="2"/><circle cx="12" cy="32" r="5" fill="none" stroke="#5a3010" stroke-width="2.5"/><circle cx="28" cy="32" r="5" fill="none" stroke="#5a3010" stroke-width="2.5"/><path d="M10,20 Q8,13 14,10" stroke="#9a7040" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M30,20 Q32,13 26,10" stroke="#9a7040" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="14" y1="10" x2="26" y2="10" stroke="#c8c090" stroke-width="2"/><line x1="20" y1="10" x2="20" y2="22" stroke="#c8a030" stroke-width="2.5"/><polygon points="17,10 23,10 20,5" fill="#d0c890"/></svg>' },

  { id:'def_cap', name:'Impenetrable Fortress', tree:'defense', tier:3, col:1, exclusive:[],
    cost:{gold:1500,stone:500},
    desc:'-35% losses & +30% raid defense',
    effect:function(s){ s.lossReduction += 0.35; s.raidDefense += 0.3; },
    svg:'<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="24" width="32" height="16" fill="#666058"/><rect x="10" y="13" width="20" height="27" fill="#7a7268"/><rect x="10" y="7" width="5" height="8" fill="#7a7268"/><rect x="18" y="7" width="5" height="8" fill="#7a7268"/><rect x="25" y="7" width="5" height="8" fill="#7a7268"/><rect x="4" y="18" width="5" height="7" fill="#666058"/><rect x="31" y="18" width="5" height="7" fill="#666058"/><rect x="16" y="28" width="8" height="12" fill="#1a1008"/><ellipse cx="20" cy="28" rx="4" ry="3" fill="#1a1008"/><polygon points="20,2 24,5 20,8" fill="#c83020"/><line x1="20" y1="2" x2="20" y2="10" stroke="#9a8060" stroke-width="1.5"/></svg>' },
];
