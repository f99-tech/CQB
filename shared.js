export const ROOMS = {
  living: { x: 2, z: 2, w: 8, d: 7 },
  hall: { x: 10, z: 4, w: 4, d: 3 },
  bed1: { x: 14, z: 2, w: 6, d: 5 },
  bed2: { x: 14, z: 8, w: 6, d: 5 }
};

export function defaultState() {
  return {
    running: true,
    t: 0,
    player: { x: 3.2, z: 8.4, yaw: -Math.PI / 2 },
    stack: [
      { id: "A1", x: 2.6, z: 8.8 },
      { id: "A2", x: 2.6, z: 9.4 },
      { id: "A3", x: 2.6, z: 10.0 },
      { id: "A4", x: 2.6, z: 10.6 }
    ],
    contacts: [
      { id: "CIV-1", kind: "civilian", x: 5.5, z: 4.2 },
      { id: "UNK-1", kind: "unknown", x: 16.5, z: 10.2 }
    ],
    log: [{ t: 0, text: "Stack set. PID required before engagement." }]
  };
}

export const channel = new BroadcastChannel("cqb-suite");
