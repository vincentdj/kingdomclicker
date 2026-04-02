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
