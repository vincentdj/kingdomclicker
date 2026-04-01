// ================================================================
// KINGDOM CLICKER – js/multiplayer.js
// WebSocket-based multiplayer client + UI.
// Connects to server.js (Node.js WS server on port 8080).
//
// Protocol messages (JSON):
//  Client → Server:
//    { type:'join',   sessionId, playerName, snapshot }
//    { type:'update', snapshot }                         (every ~5s)
//    { type:'attack', targetId }
//    { type:'leave' }
//
//  Server → Client:
//    { type:'joined',         playerId, players }
//    { type:'player_joined',  player }
//    { type:'player_left',    playerId }
//    { type:'state_update',   playerId, snapshot }
//    { type:'incoming_attack',fromId, fromName, power }
//    { type:'attack_result',  targetId, victory, loot }
//    { type:'error',          message }
// ================================================================

// ----------------------------------------------------------------
// MULTIPLAYER STATE
// ----------------------------------------------------------------
var MP = {
  ws:         null,
  connected:  false,
  sessionId:  null,
  playerId:   null,
  playerName: 'King ' + Math.random().toString(36).slice(2, 6).toUpperCase(),
  players:    {},   // playerId → { name, snapshot, lastUpdate }
  status:     'offline',  // 'offline' | 'connecting' | 'lobby' | 'in-session'
  WS_URL:     'ws://localhost:8080',
};

// ----------------------------------------------------------------
// CONNECTION
// ----------------------------------------------------------------
function mpConnect() {
  if (MP.ws && MP.ws.readyState < 2) return; // already open/connecting

  MP.status = 'connecting';
  renderMultiplayerPanel();

  try {
    MP.ws = new WebSocket(MP.WS_URL);
  } catch (e) {
    _mpSetStatus('offline');
    addNotification('Multiplayer: could not connect to server.');
    return;
  }

  MP.ws.onopen = function() {
    MP.connected = true;
    _mpSetStatus('lobby');
    addNotification('Connected to multiplayer server!');
    renderMultiplayerPanel();
  };

  MP.ws.onclose = function() {
    MP.connected = false;
    MP.players   = {};
    MP.sessionId = null;
    _mpSetStatus('offline');
    addNotification('Disconnected from multiplayer server.');
    renderMultiplayerPanel();
  };

  MP.ws.onerror = function() {
    _mpSetStatus('offline');
    addNotification('Multiplayer connection error. Is the server running?');
  };

  MP.ws.onmessage = function(event) {
    try {
      var msg = JSON.parse(event.data);
      mpHandleMessage(msg);
    } catch (e) {
      console.warn('MP: bad message', e);
    }
  };
}

function mpDisconnect() {
  if (MP.ws) {
    _mpSend({ type: 'leave' });
    MP.ws.close();
  }
  _mpSetStatus('offline');
  MP.players = {};
  renderMultiplayerPanel();
}

function _mpSetStatus(status) {
  MP.status = status;
  var el = document.getElementById('mp-status-badge');
  if (el) {
    el.textContent = status;
    el.className = 'mp-status-badge mp-status-' + status;
  }
}

function _mpSend(msg) {
  if (MP.ws && MP.ws.readyState === WebSocket.OPEN) {
    MP.ws.send(JSON.stringify(msg));
  }
}

// ----------------------------------------------------------------
// SESSION MANAGEMENT
// ----------------------------------------------------------------
function mpCreateSession() {
  var id = Math.random().toString(36).slice(2, 8).toUpperCase();
  _mpSend({ type: 'join', sessionId: id, playerName: MP.playerName, snapshot: _mpSnapshot() });
  MP.sessionId = id;
  _mpSetStatus('in-session');
  renderMultiplayerPanel();
}

function mpJoinSession() {
  var input = document.getElementById('mp-session-input');
  var id    = input ? input.value.trim().toUpperCase() : '';
  if (!id) { addNotification('Enter a Session ID first.'); return; }
  _mpSend({ type: 'join', sessionId: id, playerName: MP.playerName, snapshot: _mpSnapshot() });
  MP.sessionId = id;
  _mpSetStatus('in-session');
  renderMultiplayerPanel();
}

function mpLeaveSession() {
  _mpSend({ type: 'leave' });
  MP.sessionId = null;
  MP.players   = {};
  _mpSetStatus('lobby');
  renderMultiplayerPanel();
}

// ----------------------------------------------------------------
// INCOMING MESSAGE HANDLER
// ----------------------------------------------------------------
function mpHandleMessage(msg) {
  switch (msg.type) {

    case 'joined':
      MP.playerId = msg.playerId;
      MP.players  = {};
      if (msg.players) {
        msg.players.forEach(function(p) { MP.players[p.id] = p; });
      }
      addNotification('Joined session "' + MP.sessionId + '"! ' + Object.keys(MP.players).length + ' player(s) online.');
      renderMultiplayerPanel();
      break;

    case 'player_joined':
      if (msg.player) {
        MP.players[msg.player.id] = msg.player;
        addNotification(msg.player.name + ' joined the session!');
        renderMultiplayerPanel();
      }
      break;

    case 'player_left':
      if (MP.players[msg.playerId]) {
        var name = MP.players[msg.playerId].name;
        delete MP.players[msg.playerId];
        addNotification(name + ' left the session.');
        renderMultiplayerPanel();
      }
      break;

    case 'state_update':
      if (MP.players[msg.playerId]) {
        MP.players[msg.playerId].snapshot = msg.snapshot;
        MP.players[msg.playerId].lastUpdate = Date.now();
      }
      renderMultiplayerPanel();
      break;

    case 'incoming_attack':
      _mpHandleIncomingAttack(msg);
      break;

    case 'attack_result':
      _mpHandleAttackResult(msg);
      break;

    case 'error':
      addNotification('Multiplayer error: ' + msg.message);
      break;
  }
}

// ----------------------------------------------------------------
// GAMEPLAY HOOKS
// ----------------------------------------------------------------

/** Called by engine.js after each player-initiated battle */
function mpOnBattleResult(victory, loot) {
  // Sync state after battle
  mpSendStateUpdate();
}

function mpSendStateUpdate() {
  if (MP.status !== 'in-session') return;
  _mpSend({ type: 'update', snapshot: _mpSnapshot() });
}

function mpAttackPlayer(targetId) {
  if (MP.status !== 'in-session') { addNotification('Join a session first!'); return; }
  var power = calcArmyPower();
  if (power < 1) { addNotification('Train an army before attacking other players!'); return; }
  _mpSend({ type: 'attack', targetId: targetId });
  addLog('⚔️ Sent attack to ' + (MP.players[targetId] ? MP.players[targetId].name : targetId) + '!');
}

function _mpHandleIncomingAttack(msg) {
  // Attacker's power is resolved server-side; server sends their power
  var incoming = msg.power || 100;
  var defense  = calcArmyPower() + S.buildings.walls * 200;
  var wallDef  = S.buildings.walls * 0.05 + S.raidDefense;
  var eff      = incoming * (1 - wallDef);

  if (defense >= eff) {
    addNotification(msg.fromName + ' attacked you — repelled!');
    addLog('🛡 ' + msg.fromName + ' attacked and was repelled!');
  } else {
    var loss = Math.min(S.resources.gold * 0.1, eff * 1.5);
    S.resources.gold = Math.max(0, S.resources.gold - loss);
    addNotification(msg.fromName + ' raided you! Lost ' + fmt(loss) + ' gold.');
    addLog('💀 ' + msg.fromName + ' raided your kingdom! Lost ' + fmt(loss) + ' gold.');
  }
  renderResources();
  mpSendStateUpdate();
}

function _mpHandleAttackResult(msg) {
  if (msg.victory) {
    addNotification('Your attack on player succeeded! +' + fmt(msg.loot) + ' gold.');
    S.resources.gold += (msg.loot || 0);
    renderResources();
  } else {
    addNotification('Your attack was repelled by ' + (msg.targetName || 'the enemy') + '!');
  }
}

// ----------------------------------------------------------------
// SNAPSHOT (light-weight state sent over the wire)
// ----------------------------------------------------------------
function _mpSnapshot() {
  return {
    name:      MP.playerName,
    age:       getCurrentAge(),
    resources: { gold: Math.floor(S.resources.gold), food: Math.floor(S.resources.food) },
    army:      getTotalArmy(),
    power:     Math.floor(calcArmyPower()),
    buildings: Object.assign({}, S.buildings),
    wins:      S.combat.wins,
  };
}

// ----------------------------------------------------------------
// UI RENDERING
// ----------------------------------------------------------------
function toggleMultiplayerPanel() {
  var panel = document.getElementById('mp-panel');
  if (!panel) return;
  var open = panel.classList.toggle('open');
  if (open && MP.status === 'offline') mpConnect();
}

function renderMultiplayerPanel() {
  var panel = document.getElementById('mp-panel');
  if (!panel) return;

  var nameEl = document.getElementById('mp-player-name');
  if (nameEl) nameEl.value = MP.playerName;

  var statusEl = document.getElementById('mp-status-text');
  if (statusEl) {
    var label = { offline:'Offline', connecting:'Connecting…', lobby:'Lobby (no session)', 'in-session':'In Session "' + MP.sessionId + '"' };
    statusEl.textContent = label[MP.status] || MP.status;
    statusEl.className = 'mp-status-text mp-' + MP.status;
  }

  // Session controls
  var lobbyCtl    = document.getElementById('mp-lobby-controls');
  var sessionCtl  = document.getElementById('mp-session-controls');
  var connectBtn  = document.getElementById('mp-btn-connect');
  var disconnBtn  = document.getElementById('mp-btn-disconnect');

  if (lobbyCtl)   lobbyCtl.style.display   = MP.status === 'lobby'      ? '' : 'none';
  if (sessionCtl) sessionCtl.style.display = MP.status === 'in-session'  ? '' : 'none';
  if (connectBtn) connectBtn.style.display  = MP.status === 'offline'    ? '' : 'none';
  if (disconnBtn) disconnBtn.style.display  = MP.status !== 'offline'    ? '' : 'none';

  // Player list
  var list = document.getElementById('mp-player-list');
  if (!list) return;
  list.innerHTML = '';

  var ids = Object.keys(MP.players);
  if (ids.length === 0) {
    list.innerHTML = '<div class="mp-empty">No other players in session.</div>';
    return;
  }

  ids.forEach(function(pid) {
    var p = MP.players[pid];
    if (pid === MP.playerId) return; // skip self
    var snap = p.snapshot || {};
    var row  = document.createElement('div');
    row.className = 'mp-player-row';
    row.innerHTML =
      '<div class="mp-player-info">' +
        '<b>' + (p.name || 'Unknown') + '</b>' +
        '<span class="mp-player-age">' + AGE_NAMES[snap.age || 1] + '</span>' +
        '<span class="mp-player-stats">⚔ ' + (snap.power || 0) + ' | ' + (snap.army || 0) + ' units</span>' +
      '</div>' +
      '<button class="btn-mp-attack" onclick="mpAttackPlayer(\'' + pid + '\')">⚔ Raid</button>';
    list.appendChild(row);
  });
}

// Update player name when input changes
function mpUpdateName() {
  var input = document.getElementById('mp-player-name');
  if (input) MP.playerName = input.value || MP.playerName;
}
