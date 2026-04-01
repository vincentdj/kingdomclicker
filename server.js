// ================================================================
// KINGDOM CLICKER – server.js
// Node.js WebSocket server for multiplayer sessions.
//
// Usage:
//   npm install
//   node server.js
//
// Clients connect to ws://localhost:8080
// ================================================================

const WebSocket = require('ws');

const PORT     = process.env.PORT || 8080;
const wss      = new WebSocket.Server({ port: PORT });

// sessions[sessionId] = Map<playerId, ws>
const sessions = new Map();
// playerMeta[playerId] = { name, sessionId, snapshot }
const playerMeta = new Map();

let nextId = 1;
function genId() { return 'p' + (nextId++); }

// ----------------------------------------------------------------
// CONNECTION
// ----------------------------------------------------------------
wss.on('connection', (ws) => {
  const playerId = genId();
  ws.playerId = playerId;
  playerMeta.set(playerId, { name: 'Unknown', sessionId: null, snapshot: null });

  console.log(`[+] ${playerId} connected  (total: ${wss.clients.size})`);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    handleMessage(ws, msg);
  });

  ws.on('close', () => {
    handleDisconnect(ws);
    console.log(`[-] ${playerId} disconnected  (total: ${wss.clients.size})`);
  });

  ws.on('error', (err) => console.warn(`[!] ${playerId} error:`, err.message));
});

// ----------------------------------------------------------------
// MESSAGE ROUTING
// ----------------------------------------------------------------
function handleMessage(ws, msg) {
  switch (msg.type) {
    case 'join':   handleJoin(ws, msg);   break;
    case 'update': handleUpdate(ws, msg); break;
    case 'attack': handleAttack(ws, msg); break;
    case 'leave':  handleLeave(ws);       break;
    default: ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type: ' + msg.type }));
  }
}

// ----------------------------------------------------------------
// JOIN SESSION
// ----------------------------------------------------------------
function handleJoin(ws, msg) {
  const { sessionId, playerName, snapshot } = msg;
  if (!sessionId) { ws.send(JSON.stringify({ type: 'error', message: 'sessionId required' })); return; }

  // Leave previous session if any
  const meta = playerMeta.get(ws.playerId);
  if (meta.sessionId) _leaveSession(ws);

  // Create session if it doesn't exist
  if (!sessions.has(sessionId)) sessions.set(sessionId, new Map());

  const session = sessions.get(sessionId);
  session.set(ws.playerId, ws);

  meta.name      = playerName || meta.name;
  meta.sessionId = sessionId;
  meta.snapshot  = snapshot || null;

  // Inform the joiner of existing players
  const existing = [];
  session.forEach((sock, pid) => {
    if (pid !== ws.playerId) {
      const pm = playerMeta.get(pid);
      existing.push({ id: pid, name: pm?.name, snapshot: pm?.snapshot });
    }
  });

  ws.send(JSON.stringify({
    type:     'joined',
    playerId: ws.playerId,
    players:  existing,
  }));

  // Notify others
  _broadcastToSession(sessionId, {
    type:   'player_joined',
    player: { id: ws.playerId, name: meta.name, snapshot: meta.snapshot },
  }, ws.playerId);

  console.log(`[sesssion] ${ws.playerId} (${meta.name}) joined "${sessionId}" (${session.size} players)`);
}

// ----------------------------------------------------------------
// STATE UPDATE  (periodic sync)
// ----------------------------------------------------------------
function handleUpdate(ws, msg) {
  const meta = playerMeta.get(ws.playerId);
  if (!meta?.sessionId) return;
  meta.snapshot = msg.snapshot;

  _broadcastToSession(meta.sessionId, {
    type:     'state_update',
    playerId: ws.playerId,
    snapshot: msg.snapshot,
  }, ws.playerId);
}

// ----------------------------------------------------------------
// PLAYER-TO-PLAYER ATTACK
// ----------------------------------------------------------------
function handleAttack(ws, msg) {
  const { targetId } = msg;
  const attacker = playerMeta.get(ws.playerId);
  const target   = playerMeta.get(targetId);

  if (!attacker?.sessionId) { ws.send(JSON.stringify({ type:'error', message:'Join a session first.' })); return; }
  if (!target)               { ws.send(JSON.stringify({ type:'error', message:'Target player not found.' })); return; }
  if (attacker.sessionId !== target.sessionId) {
    ws.send(JSON.stringify({ type:'error', message:'Target is not in your session.' }));
    return;
  }

  // Get attacker's power from their snapshot
  const attackerPower = attacker.snapshot?.power || 100;
  const targetPower   = (target.snapshot?.power  || 0) + (target.snapshot?.buildings?.walls || 0) * 200;

  const victory = attackerPower >= targetPower * 0.6;
  const loot    = victory ? Math.floor(attackerPower * (Math.random() * 0.5 + 0.3)) : 0;

  // Tell the TARGET they're being attacked
  const targetWs = sessions.get(attacker.sessionId)?.get(targetId);
  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(JSON.stringify({
      type:     'incoming_attack',
      fromId:   ws.playerId,
      fromName: attacker.name,
      power:    attackerPower,
    }));
  }

  // Tell the ATTACKER the result
  ws.send(JSON.stringify({
    type:       'attack_result',
    targetId,
    targetName: target.name,
    victory,
    loot,
  }));

  console.log(`[attack] ${ws.playerId} → ${targetId}: ${victory ? 'WIN' : 'LOSS'} (loot ${loot})`);
}

// ----------------------------------------------------------------
// LEAVE
// ----------------------------------------------------------------
function handleLeave(ws) {
  _leaveSession(ws);
}

function handleDisconnect(ws) {
  _leaveSession(ws);
  playerMeta.delete(ws.playerId);
}

function _leaveSession(ws) {
  const meta = playerMeta.get(ws.playerId);
  if (!meta?.sessionId) return;

  const session = sessions.get(meta.sessionId);
  if (session) {
    session.delete(ws.playerId);
    // Clean up empty sessions
    if (session.size === 0) {
      sessions.delete(meta.sessionId);
      console.log(`[session] "${meta.sessionId}" removed (empty)`);
    } else {
      _broadcastToSession(meta.sessionId, {
        type:     'player_left',
        playerId: ws.playerId,
      });
    }
  }
  meta.sessionId = null;
}

// ----------------------------------------------------------------
// BROADCAST HELPERS
// ----------------------------------------------------------------
function _broadcastToSession(sessionId, msg, excludeId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  const json = JSON.stringify(msg);
  session.forEach((sock, pid) => {
    if (pid !== excludeId && sock.readyState === WebSocket.OPEN) {
      sock.send(json);
    }
  });
}

// ----------------------------------------------------------------
// START
// ----------------------------------------------------------------
console.log(`Kingdom Clicker multiplayer server running on ws://localhost:${PORT}`);
console.log('Press Ctrl+C to stop.\n');
