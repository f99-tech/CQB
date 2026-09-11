import { defaultState, channel } from "./shared.js";

const state = defaultState();
const keys = {};
let canvasFP, canvasTD, ctxFP, ctxTD;

function wallRects() {
  return [
    { x: 1.5, z: 1.5, w: 18.5, d: 0.25 },
    { x: 1.5, z: 13.2, w: 18.5, d: 0.25 },
    { x: 1.5, z: 1.5, w: 0.25, d: 12 },
    { x: 19.8, z: 1.5, w: 0.25, d: 12 },
    { x: 10, z: 1.5, w: 0.25, d: 2.4 },
    { x: 10, z: 7.2, w: 0.25, d: 6.2 },
    { x: 14, z: 1.5, w: 0.25, d: 2.2 },
    { x: 14, z: 7.0, w: 6, d: 0.25 }
  ];
}

function blocked(x, z) {
  return wallRects().some(w => x > w.x && x < w.x + w.w && z > w.z && z < w.z + w.d);
}

function log(text) {
  state.log.unshift({ t: Math.floor(state.t), text });
  state.log = state.log.slice(0, 8);
  renderLog();
}

function renderLog() {
  const box = document.getElementById("log");
  if (!box) return;
  box.innerHTML = state.log.map(e => `<div class="event">+${e.t}s — ${e.text}</div>`).join("");
}

function drawTopDown() {
  const c = canvasTD, g = ctxTD;
  const scale = Math.min(c.width / 24, c.height / 16);
  g.fillStyle = "#0d1016";
  g.fillRect(0, 0, c.width, c.height);
  g.save();
  g.translate(20, 20);
  g.scale(scale, scale);

  g.fillStyle = "#1a1f2a";
  g.fillRect(1.5, 1.5, 18.5, 12);
  g.strokeStyle = "#8b93a7";
  g.lineWidth = 0.08;
  wallRects().forEach(w => g.strokeRect(w.x, w.z, w.w, w.d));

  g.fillStyle = "#8b93a7";
  g.font = "0.45px sans-serif";
  g.fillText("LIVING", 4.2, 3.2);
  g.fillText("HALL", 10.6, 5.6);
  g.fillText("BED 1", 15.4, 3.6);
  g.fillText("BED 2", 15.4, 10.2);

  const p = state.player;
  g.fillStyle = "rgba(200,204,212,.22)";
  g.beginPath();
  g.moveTo(p.x, p.z);
  g.arc(p.x, p.z, 3.2, p.yaw - 0.45, p.yaw + 0.45);
  g.closePath();
  g.fill();

  g.fillStyle = "#c8ccd4";
  g.beginPath();
  g.arc(p.x, p.z, 0.22, 0, Math.PI * 2);
  g.fill();
  g.fillText("YOU", p.x + 0.3, p.z);

  state.stack.forEach(s => {
    g.fillStyle = "#7a9cc8";
    g.fillRect(s.x - 0.16, s.z - 0.16, 0.32, 0.32);
    g.fillStyle = "#c9d4ea";
    g.fillText(s.id, s.x + 0.25, s.z);
  });

  state.contacts.forEach(ct => {
    g.fillStyle = ct.kind === "civilian" ? "#4ea878" : "#c45c5c";
    g.beginPath();
    g.arc(ct.x, ct.z, 0.22, 0, Math.PI * 2);
    g.fill();
    g.fillText(ct.kind.toUpperCase(), ct.x + 0.28, ct.z);
  });
  g.restore();
}

function drawFP() {
  const c = canvasFP, g = ctxFP;
  const w = c.width, h = c.height;
  g.fillStyle = "#1c222c";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#2a313d";
  g.fillRect(0, h * 0.58, w, h * 0.42);

  const p = state.player;
  state.contacts.forEach(ct => {
    const dx = ct.x - p.x;
    const dz = ct.z - p.z;
    const dist = Math.hypot(dx, dz);
    let ang = Math.atan2(dz, dx) - p.yaw;
    while (ang > Math.PI) ang -= Math.PI * 2;
    while (ang < -Math.PI) ang += Math.PI * 2;
    if (Math.abs(ang) > 0.7 || dist < 0.2 || dist > 12) return;
    const sx = w / 2 + (ang / 0.7) * (w * 0.5);
    const size = Math.max(18, 220 / dist);
    const sy = h * 0.58 - size;
    g.fillStyle = ct.kind === "civilian" ? "#7d8b7a" : "#6a3a3a";
    g.fillRect(sx - size * 0.22, sy, size * 0.44, size);
    g.fillStyle = "#dfe6f2";
    g.font = "12px sans-serif";
    g.fillText(ct.kind === "civilian" ? "UNKNOWN PERSON" : "UNKNOWN CONTACT", sx - 50, sy - 8);
  });

  g.strokeStyle = "rgba(232,234,239,.35)";
  g.beginPath();
  g.moveTo(w / 2 - 10, h / 2); g.lineTo(w / 2 + 10, h / 2);
  g.moveTo(w / 2, h / 2 - 10); g.lineTo(w / 2, h / 2 + 10);
  g.stroke();

  g.fillStyle = "#0b0c0e";
  g.fillRect(w / 2 - 26, h * 0.72, 52, 90);
  g.fillStyle = "#2b303a";
  g.fillRect(w / 2 - 8, h * 0.62, 16, 110);
}

function step(dt) {
  if (!state.running) return;
  state.t += dt;
  const speed = 2.4 * dt;
  const p = state.player;
  let nx = p.x, nz = p.z;
  if (keys["KeyW"]) { nx += Math.cos(p.yaw) * speed; nz += Math.sin(p.yaw) * speed; }
  if (keys["KeyS"]) { nx -= Math.cos(p.yaw) * speed; nz -= Math.sin(p.yaw) * speed; }
  if (keys["KeyA"]) { nx += Math.cos(p.yaw - Math.PI / 2) * speed; nz += Math.sin(p.yaw - Math.PI / 2) * speed; }
  if (keys["KeyD"]) { nx += Math.cos(p.yaw + Math.PI / 2) * speed; nz += Math.sin(p.yaw + Math.PI / 2) * speed; }
  if (!blocked(nx, p.z)) p.x = nx;
  if (!blocked(p.x, nz)) p.z = nz;
  document.getElementById("clock").textContent = `T+${Math.floor(state.t)}s`;
}

function loop(prev) {
  const now = performance.now();
  step((now - prev) / 1000);
  drawTopDown();
  drawFP();
  requestAnimationFrame(() => loop(now));
}

function resize() {
  [canvasFP, canvasTD].forEach(c => {
    c.width = c.clientWidth;
    c.height = c.clientHeight;
  });
}

export function boot() {
  canvasFP = document.getElementById("fp");
  canvasTD = document.getElementById("td");
  ctxFP = canvasFP.getContext("2d");
  ctxTD = canvasTD.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", e => { keys[e.code] = true; });
  window.addEventListener("keyup", e => { keys[e.code] = false; });
  canvasFP.addEventListener("click", () => canvasFP.requestPointerLock());
  document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvasFP) state.player.yaw += e.movementX * 0.0025;
  });

  document.getElementById("pause").onclick = () => {
    state.running = !state.running;
    log(state.running ? "Resumed." : "Paused by instructor.");
  };
  document.getElementById("reset").onclick = () => {
    Object.assign(state, defaultState());
    log("Scenario reset.");
    renderLog();
  };
  document.getElementById("dropCiv").onclick = () => {
    state.contacts.push({ id: "CIV-X", kind: "civilian", x: 8 + Math.random() * 3, z: 5 + Math.random() * 2 });
    log("Civilian inserted.");
  };
  document.getElementById("toggleThreat").onclick = () => {
    const u = state.contacts.find(c => c.kind === "unknown");
    if (u) { u.kind = "civilian"; log("Unknown reclassified: no threat."); }
    else log("No unknown contact left.");
  };

  renderLog();
  requestAnimationFrame(() => loop(performance.now()));
  try { channel.postMessage({ type: "ready" }); } catch (e) {}
}
