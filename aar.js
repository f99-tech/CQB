const STEPS = [
  {
    clock: "T−0",
    title: "Brief — 16 Princes Gate, 5 May 1980",
    what: "Public case: Iranian Embassy siege, London. Six gunmen. Hostages inside. After one hostage is killed, a rescue is ordered. This replay uses only public facts. It is a classroom AAR, not a raid lesson.",
    freeze: false,
    markers: [
      { x: 10, y: 8, kind: "hostage", label: "Hostages" },
      { x: 8, y: 6, kind: "gunman", label: "Unknown" },
      { x: 13, y: 10, kind: "gunman", label: "Unknown" },
      { x: 10, y: 16.5, kind: "team", label: "Front" },
      { x: 18.5, y: 9, kind: "team", label: "Rear" },
      { x: 10, y: 1.8, kind: "team", label: "Roof" }
    ]
  },
  {
    clock: "19:23",
    title: "Go — three sides at once",
    what: "Teams move on front, rear, and roof so the building is hit together. Plan depends on surprise and every path working.",
    freeze: false,
    markers: [
      { x: 10, y: 8, kind: "hostage", label: "Hostages" },
      { x: 8, y: 6, kind: "gunman", label: "Unknown" },
      { x: 13, y: 10, kind: "gunman", label: "Unknown" },
      { x: 10, y: 14.2, kind: "team", label: "Front" },
      { x: 16.6, y: 9, kind: "team", label: "Rear" },
      { x: 10, y: 3.2, kind: "team", label: "Roof" }
    ]
  },
  {
    clock: "19:24",
    title: "Freeze 1 — surprise is gone",
    what: "A man snags on the descent. A window breaks. People inside now know an assault has started.",
    wrong: "The plan assumed silence and a clean line. One snag made noise and delayed the roof path.",
    avoid: "Rehearse a surprise-lost branch: slow the rush, confirm other doors are still timed, do not force the jammed path.",
    freeze: true,
    markers: [
      { x: 10, y: 8, kind: "hostage", label: "Hostages" },
      { x: 8.4, y: 6.4, kind: "gunman", label: "Alert" },
      { x: 13, y: 10, kind: "gunman", label: "Alert" },
      { x: 10, y: 13.6, kind: "team", label: "Front" },
      { x: 16.6, y: 9, kind: "team", label: "Rear" },
      { x: 11.4, y: 3.6, kind: "hazard", label: "Snag" }
    ]
  },
  {
    clock: "19:24",
    title: "Freeze 2 — one man blocks a whole side",
    what: "The rear team cannot use the planned opening. A teammate is hanging in the way. That side of the building is late.",
    wrong: "Entry methods were chained. When one man stopped, the rear option died with him.",
    avoid: "A second path that does not wait on the first. Call path blocked and switch. Do not stack behind a frozen action.",
    freeze: true,
    markers: [
      { x: 10.2, y: 8.2, kind: "hostage", label: "Hostages" },
      { x: 7.6, y: 7.2, kind: "gunman", label: "Moving" },
      { x: 12.4, y: 9.2, kind: "gunman", label: "Stairs" },
      { x: 10, y: 12.4, kind: "team", label: "Front" },
      { x: 16.4, y: 8.6, kind: "hazard", label: "Blocked" },
      { x: 10.6, y: 4.4, kind: "team", label: "Roof late" }
    ]
  },
  {
    clock: "19:29",
    title: "Freeze 3 — mixed crowd, PID required",
    what: "People come down the stairs together. Hostages and a gunman are in the same flow. From the top, they look like one group.",
    wrong: "Speed without identification. A threat hidden in a friendly stream is the classic CQB miss.",
    avoid: "Hold the stair. Hands visible. Separate before anyone is treated as a target. Identify, then act.",
    freeze: true,
    markers: [
      { x: 10.4, y: 11.2, kind: "hostage", label: "Hostages" },
      { x: 10.8, y: 11.8, kind: "gunman", label: "Hidden in flow" },
      { x: 9.2, y: 13.2, kind: "team", label: "Front" },
      { x: 11.6, y: 6.2, kind: "team", label: "Inside" }
    ]
  },
  {
    clock: "19:32",
    title: "Outcome — success with a cost",
    what: "Most hostages leave alive. One hostage is dead from the fight. One gunman is found among the hostages and arrested. Public record: about 17 minutes.",
    wrong: "A successful hit still lost a hostage and nearly missed a gunman in the exit line.",
    avoid: "Train the three freezes: surprise lost, path blocked, mixed PID. Speed is not the grade. Identification is.",
    freeze: true,
    markers: [
      { x: 10, y: 16.2, kind: "hostage", label: "Out" },
      { x: 11.4, y: 16.2, kind: "gunman", label: "Found in line" },
      { x: 8.2, y: 15.2, kind: "team", label: "Control" }
    ]
  }
];

let i = 0;
let playing = false;
let timer = null;
const canvas = document.getElementById("map");

function draw(step) {
  const g = canvas.getContext("2d");
  const c = canvas;
  g.fillStyle = "#0d1016";
  g.fillRect(0, 0, c.width, c.height);
  const worldW = 22, worldH = 20, pad = 28;
  const scale = Math.min((c.width - pad * 2) / worldW, (c.height - pad * 2) / worldH);
  g.save();
  g.translate((c.width - worldW * scale) / 2, (c.height - worldH * scale) / 2);
  g.scale(scale, scale);
  g.fillStyle = "#141820";
  g.fillRect(3.5, 15.2, 13, 2.4);
  g.fillStyle = "#1c2430";
  g.fillRect(16.2, 4, 3.2, 11);
  g.fillStyle = "#222a38";
  g.fillRect(4, 4, 12, 5.5);
  g.fillStyle = "#1a2230";
  g.fillRect(4, 9.5, 12, 5.5);
  g.strokeStyle = "#8b93a7";
  g.lineWidth = 0.12;
  g.strokeRect(4, 4, 12, 11);
  g.beginPath();
  g.moveTo(4, 9.5); g.lineTo(16, 9.5);
  g.moveTo(10, 4); g.lineTo(10, 15);
  g.stroke();
  if (step.freeze) {
    g.fillStyle = "rgba(196,92,92,0.12)";
    g.fillRect(4, 4, 12, 11);
  }
  g.fillStyle = "#8b93a7";
  g.font = "0.7px sans-serif";
  g.fillText("ROOF", 8.5, 3.3);
  g.fillText("1F", 5.3, 6.6);
  g.fillText("GF", 5.3, 12.4);
  g.fillText("STAIR", 10.3, 9.3);
  g.fillText("STREET", 8.1, 16.8);
  g.fillText("REAR", 16.5, 9.4);
  step.markers.forEach(function (m) {
    g.fillStyle = m.kind === "team" ? "#7a9cc8" : m.kind === "hostage" ? "#4ea878" : m.kind === "gunman" ? "#c45c5c" : "#c8ccd4";
    g.beginPath();
    g.arc(m.x, m.y, m.kind === "hazard" ? 0.42 : 0.32, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#e8eaef";
    g.font = "0.5px sans-serif";
    g.fillText(m.label, m.x + 0.45, m.y + 0.15);
  });
  g.restore();
}

function resize() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(r.width * dpr));
  canvas.height = Math.max(1, Math.floor(r.height * dpr));
  render();
}

function render() {
  const step = STEPS[i];
  document.getElementById("clock").textContent = step.clock;
  document.getElementById("stepLabel").textContent = "STEP " + (i + 1) + " / " + STEPS.length;
  document.getElementById("title").textContent = step.title;
  document.getElementById("what").textContent = step.what;
  document.getElementById("freezeTag").hidden = !step.freeze;
  document.getElementById("wrongBox").hidden = !step.wrong;
  document.getElementById("avoidBox").hidden = !step.avoid;
  document.getElementById("wrong").textContent = step.wrong || "";
  document.getElementById("avoid").textContent = step.avoid || "";
  document.getElementById("play").textContent = playing ? "Pause" : "Play";
  draw(step);
}

function go(n) {
  i = Math.max(0, Math.min(STEPS.length - 1, n));
  render();
}

function tick() {
  if (!playing) return;
  if (i >= STEPS.length - 1) { playing = false; render(); return; }
  go(i + 1);
  timer = setTimeout(tick, STEPS[i].freeze ? 4200 : 2800);
}

document.getElementById("back").onclick = function () { playing = false; clearTimeout(timer); go(i - 1); };
document.getElementById("next").onclick = function () { playing = false; clearTimeout(timer); go(i + 1); };
document.getElementById("play").onclick = function () {
  playing = !playing;
  clearTimeout(timer);
  render();
  if (playing) timer = setTimeout(tick, 800);
};

window.addEventListener("resize", resize);
resize();
