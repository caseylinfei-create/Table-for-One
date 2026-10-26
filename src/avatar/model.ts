import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Action, Avatar } from './avatar';

/**
 * Procedural clay chef. Built from soft primitives so every color, hairstyle and hat
 * can change at runtime, and posed by a small joint rig animated in code.
 * The public surface (buildChef → { root, update, dispose }) is what a future
 * hand-modeled .glb would also implement.
 */

export type ChefRig = {
  root: THREE.Group;
  /** dt and t in seconds. react is 0..1 progress of a tap reaction, or -1. */
  update: (dt: number, t: number, action: Action, react: number, snap?: boolean) => void;
  dispose: () => void;
};

const HEAD_R = 0.42;
const HEAD_S = new THREE.Vector3(1, 0.96, 0.95);

function clay(color: THREE.ColorRepresentation, extra: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.72, metalness: 0, sheen: 0.55, sheenRoughness: 0.75, sheenColor: new THREE.Color('#fff4ea'),
    clearcoat: 0.06, clearcoatRoughness: 0.6, ...extra,
  });
}
function shade(hex: string, k: number) {
  return new THREE.Color(hex).multiplyScalar(k);
}

type V3 = [number, number, number];
function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos: V3 = [0, 0, 0], scale: V3 = [1, 1, 1], rot: V3 = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.scale.set(...scale);
  m.rotation.set(...rot);
  parent.add(m);
  return m;
}
function group(parent: THREE.Object3D, pos: V3 = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(...pos);
  parent.add(g);
  return g;
}
/** Point on the (unscaled) head sphere, given x/y; z pushed to the surface. */
function onHead(x: number, y: number, lift = 0) {
  const z = Math.sqrt(Math.max(0, HEAD_R * HEAD_R - x * x - y * y)) * HEAD_S.z + lift;
  return [x, y, z] as V3;
}

export function buildChef(av: Avatar): ChefRig {
  const fem = av.body === 'fem';
  const M = {
    skin: clay(av.skin),
    hair: clay(av.hair, { roughness: 0.55, sheen: 0.25, sheenColor: new THREE.Color(av.hair).lerp(new THREE.Color('#ffffff'), 0.3) }),
    jacket: clay(av.jacket),
    jacketDark: clay(shade(av.jacket, 0.88)),
    apron: clay(av.apron, { side: THREE.DoubleSide }),
    apronDark: clay(shade(av.apron, 0.8)),
    pants: clay('#3A3640'),
    shoe: clay('#2B2523', { roughness: 0.45, clearcoat: 0.4 }),
    eye: new THREE.MeshPhysicalMaterial({ color: '#1F1714', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }),
    shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    mouth: clay('#7A2E2A'),
    tongue: clay('#E0736B'),
    blush: new THREE.MeshBasicMaterial({ color: '#F19A92', transparent: true, opacity: 0.45, depthWrite: false }),
    button: clay('#3B302C', { roughness: 0.4, clearcoat: 0.5 }),
    white: clay('#FBF8F2'),
    steel: new THREE.MeshPhysicalMaterial({ color: '#D5DADF', metalness: 0.6, roughness: 0.28, clearcoat: 0.4 }),
    wood: clay('#C08A55'),
    woodDark: clay('#8C5E3A'),
    tomato: clay('#D8503C'),
    leaf: clay('#6E9E4E'),
    bandana: clay('#C9473A'),
    bandanaDark: clay('#A8362C'),
  };
  const geos: THREE.BufferGeometry[] = [];
  const G = <T extends THREE.BufferGeometry>(g: T) => { geos.push(g); return g; };
  const sphere = (r: number, w = 28, h = 20) => G(new THREE.SphereGeometry(r, w, h));
  const capsule = (r: number, len: number) => G(new THREE.CapsuleGeometry(r, len, 8, 18));

  const root = new THREE.Group();
  const body = group(root);

  /* legs */
  const legX = fem ? 0.11 : 0.125;
  for (const s of [-1, 1]) {
    const leg = group(body, [s * legX, 0.52, 0]);
    add(leg, capsule(fem ? 0.1 : 0.115, 0.26), M.pants, [0, -0.2, 0]);
    add(leg, sphere(0.13), M.shoe, [0, -0.45, 0.05], [1, 0.6, 1.4]);
  }

  /* torso (pivot at hips) */
  const torso = group(body, [0, 0.55, 0]);
  const shoulderW = fem ? 1.0 : 1.1;
  add(torso, capsule(0.3, 0.32), M.jacket, [0, 0.33, 0], [shoulderW, 1, 0.85]);
  // double-breasted buttons
  for (const x of [-0.075, 0.075]) for (const y of [0.42, 0.55, 0.68]) add(torso, sphere(0.024, 10, 8), M.button, [x * shoulderW, y, 0.255]);
  add(torso, G(new THREE.TorusGeometry(0.13, 0.05, 10, 24)), M.jacketDark, [0, 0.79, 0], [1, 1, 0.9], [Math.PI / 2, 0, 0]);
  add(torso, G(new THREE.CylinderGeometry(0.085, 0.095, 0.14, 16)), M.skin, [0, 0.85, 0]);
  // apron: flared skirt, bib and waist tie
  add(torso, G(new THREE.CylinderGeometry(0.29 * shoulderW, fem ? 0.4 : 0.35, 0.52, 28, 1, true, -1.15, 2.3)), M.apron, [0, 0.08, 0.01], [1, 1, 0.92]);
  add(torso, G(new THREE.BoxGeometry(0.28, 0.24, 0.03)), M.apron, [0, 0.47, 0.25], [1, 1, 1], [-0.08, 0, 0]);
  add(torso, G(new THREE.TorusGeometry(0.29, 0.028, 8, 32)), M.apronDark, [0, 0.33, 0], [shoulderW, 0.85, 1], [Math.PI / 2, 0, 0]);
  add(torso, G(new THREE.BoxGeometry(0.1, 0.07, 0.04)), M.apronDark, [0, 0.47, 0.27]);

  /* arms */
  type Arm = { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  const arms: Record<-1 | 1, Arm> = {} as Record<-1 | 1, Arm>;
  for (const s of [-1, 1] as const) {
    const shoulder = group(torso, [s * 0.3 * shoulderW, 0.68, 0]);
    shoulder.rotation.order = 'XZY';
    add(shoulder, sphere(0.1), M.jacket, [0, 0, 0]);
    add(shoulder, capsule(0.088, 0.18), M.jacket, [0, -0.16, 0]);
    const elbow = group(shoulder, [0, -0.32, 0]);
    elbow.rotation.order = 'XZY';
    add(elbow, capsule(0.08, 0.15), M.jacket, [0, -0.13, 0]);
    add(elbow, G(new THREE.TorusGeometry(0.075, 0.025, 8, 18)), M.jacketDark, [0, -0.25, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    const hand = group(elbow, [0, -0.32, 0]);
    add(hand, sphere(0.085), M.skin, [0, 0, 0], [1, 1.05, 0.9]);
    add(hand, sphere(0.035), M.skin, [s * -0.07, 0.02, 0.03]); // thumb
    arms[s] = { shoulder, elbow, hand };
  }
  const R = arms[-1]; // character's right hand (viewer's left)
  const L = arms[1];

  /* head */
  const neck = group(torso, [0, 0.86, 0]);
  const head = group(neck, [0, 0.33, 0]);
  const skull = add(head, sphere(HEAD_R, 40, 30), M.skin);
  skull.scale.copy(HEAD_S);
  for (const s of [-1, 1]) add(head, sphere(0.085), M.skin, [s * 0.41, -0.02, 0], [0.55, 1, 0.8]);
  add(head, sphere(0.034), M.skin, onHead(0, -0.06, 0.005));
  for (const s of [-1, 1]) add(head, sphere(0.065), M.blush, onHead(s * 0.24, -0.1, -0.005), [1, 0.62, 0.35]);

  const eyes = group(head);
  const happyEyes = group(head);
  for (const s of [-1, 1]) {
    const [x, y, z] = onHead(s * 0.15, 0.0, -0.01);
    const e = group(eyes, [x, y, z]);
    e.rotation.y = s * 0.36;
    add(e, sphere(0.07), M.eye, [0, 0, 0], [1, 1.18, 0.45]);
    add(e, sphere(0.022, 10, 8), M.shine, [0.022, 0.032, 0.03]);
    add(e, sphere(0.011, 8, 6), M.shine, [-0.022, -0.03, 0.028]);
    if (fem) add(e, capsule(0.012, 0.05), M.eye, [s * 0.075, 0.05, 0], [1, 1, 1], [0, 0, s * -0.9]);
    const h = add(happyEyes, G(new THREE.TorusGeometry(0.055, 0.017, 8, 16, Math.PI)), M.eye, [x, y - 0.02, z + 0.005]);
    h.rotation.y = s * 0.36;
    // brows
    const [bx, by, bz] = onHead(s * 0.15, 0.135, 0.0);
    const brow = add(head, capsule(fem ? 0.016 : 0.022, 0.07), M.hair, [bx, by, bz], [1, 1, 0.6], [0, s * 0.36, Math.PI / 2 + s * 0.12]);
    brow.userData.base = brow.position.y;
    brow.name = 'brow';
  }
  happyEyes.visible = false;
  const brows = head.children.filter((c) => c.name === 'brow');
  const smile = add(head, G(new THREE.TorusGeometry(0.055, 0.015, 8, 18, Math.PI)), M.mouth, onHead(0, -0.15, 0.0), [1, 1, 1], [0, 0, Math.PI]);
  const open = group(head, onHead(0, -0.16, -0.01));
  add(open, sphere(0.06), M.mouth, [0, 0, 0], [1.1, 0.85, 0.4]);
  add(open, sphere(0.04), M.tongue, [0, -0.025, 0.012], [1, 0.6, 0.4]);
  open.visible = false;

  /* hair, in head space with the head's own proportions */
  const hair = group(head);
  hair.scale.copy(HEAD_S);
  const cap = (r: number, theta: number, tilt: number) => add(hair, G(new THREE.SphereGeometry(r, 40, 24, 0, Math.PI * 2, 0, theta)), M.hair, [0, 0, 0], [1, 1, 1], [tilt, 0, 0]);
  const backShell = (thetaEnd: number, sx = 1.06) =>
    add(hair, G(new THREE.SphereGeometry(0.455, 40, 24, Math.PI, Math.PI, 0.15, thetaEnd)), M.hair, [0, 0, -0.01], [sx, 1, 1.02]);
  const bangs = (n: number, spread = 0.22) => {
    for (let k = 0; k < n; k++) {
      const x = -spread + (2 * spread * k) / Math.max(1, n - 1);
      const polar = 0.86 + Math.abs(x) * 0.6;
      const y = 0.445 * Math.cos(polar);
      const hr = 0.445 * Math.sin(polar);
      const z = Math.sqrt(Math.max(0, hr * hr - x * x));
      add(hair, sphere(0.1), M.hair, [x, y, z], [1.15, 0.72, 0.55], [-0.5, x * 1.6, x * -1.4]);
    }
  };
  switch (av.hairStyle) {
    case 'bun':
      cap(0.445, 1.32, -0.5); bangs(4); backShell(1.45, 1.03);
      add(hair, sphere(0.17), M.hair, [0, 0.43, -0.2]);
      add(hair, G(new THREE.TorusGeometry(0.09, 0.03, 8, 18)), M.apron, [0, 0.33, -0.17], [1, 1, 1], [1.2, 0, 0]);
      break;
    case 'ponytail':
      cap(0.445, 1.32, -0.5); bangs(5); backShell(1.5, 1.03);
      add(hair, sphere(0.06), M.apron, [0, 0.22, -0.43]);
      add(hair, capsule(0.1, 0.34), M.hair, [0, -0.02, -0.52], [1, 1, 0.9], [0.45, 0, 0]);
      break;
    case 'bob':
      cap(0.445, 1.32, -0.5); bangs(5, 0.26); backShell(1.95);
      for (const s of [-1, 1]) add(hair, capsule(0.1, 0.3), M.hair, [s * 0.375, -0.12, 0.1], [0.85, 1, 0.9], [0.1, 0, s * -0.1]);
      break;
    case 'long':
      cap(0.445, 1.32, -0.5); bangs(5, 0.26); backShell(2.05);
      for (const s of [-1, 1]) add(hair, capsule(0.11, 0.48), M.hair, [s * 0.38, -0.24, 0.02], [1, 1, 0.85], [0, 0, s * -0.08]);
      add(hair, capsule(0.24, 0.5), M.hair, [0, -0.36, -0.22], [1.45, 1, 0.55], [0.12, 0, 0]);
      break;
    case 'short':
      cap(0.447, 1.25, -0.42); backShell(1.35, 1.02);
      // a soft side-swept quiff
      for (const [x, y, z, r] of [[-0.16, 0.36, 0.22, 0.1], [-0.02, 0.4, 0.23, 0.11], [0.13, 0.37, 0.22, 0.095], [0.04, 0.44, 0.08, 0.11]] as const)
        add(hair, sphere(r), M.hair, [x, y, z], [1.2, 0.6, 0.9], [-0.4, 0, -0.3]);
      break;
    case 'curly': {
      cap(0.44, 1.3, -0.45); backShell(1.5, 1.02);
      const n = 34;
      for (let k = 0; k < n; k++) {
        const yN = 1 - (k / (n - 1)) * 1.05; // from top down to a bit below equator
        const rr = Math.sqrt(Math.max(0, 1 - yN * yN));
        const a = k * 2.399963;
        const v = new THREE.Vector3(Math.cos(a) * rr, yN, Math.sin(a) * rr).multiplyScalar(0.46);
        if (v.z > 0.18 && v.y < 0.3) continue; // keep the face clear
        if (av.hat !== 'none' && v.y > 0.22) continue; // under the hat
        add(hair, sphere(0.085, 14, 10), M.hair, [v.x, v.y, v.z]);
      }
      break;
    }
    case 'buzz':
      cap(0.432, 1.36, -0.45); backShell(1.3, 1.0);
      break;
  }

  /* hats */
  const hat = group(head);
  hat.scale.copy(HEAD_S);
  if (av.hat === 'toque') {
    hat.rotation.x = -0.12;
    add(hat, G(new THREE.CylinderGeometry(0.3, 0.31, 0.3, 32)), M.white, [0, 0.43, 0]);
    add(hat, G(new THREE.TorusGeometry(0.31, 0.035, 8, 32)), M.white, [0, 0.29, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      add(hat, sphere(0.17), M.white, [Math.cos(a) * 0.2, 0.68, Math.sin(a) * 0.2]);
    }
    add(hat, sphere(0.2), M.white, [0, 0.76, 0]);
  } else if (av.hat === 'bandana') {
    // a head wrap that hugs the skull, knotted at the back
    add(hat, G(new THREE.SphereGeometry(0.462, 40, 20, 0, Math.PI * 2, 0, 1.12)), M.bandana, [0, 0, 0], [1, 1, 1], [-0.42, 0, 0]);
    add(hat, G(new THREE.TorusGeometry(0.405, 0.03, 8, 40)), M.bandanaDark, [0, 0.19, -0.08], [1, 1, 1], [Math.PI / 2 - 0.42, 0, 0]);
    add(hat, sphere(0.075), M.bandana, [0.12, 0.08, -0.43]);
    add(hat, capsule(0.045, 0.12), M.bandana, [0.2, -0.04, -0.44], [1, 1, 0.5], [0.3, 0, -0.5]);
    add(hat, capsule(0.045, 0.1), M.bandana, [0.06, -0.06, -0.45], [1, 1, 0.5], [0.3, 0, 0.4]);
  } else if (av.hat === 'cap') {
    const capMat = clay(new THREE.Color(av.apron).getHSL({ h: 0, s: 0, l: 0 }).l < 0.35 || av.apron === '#7A5238' ? '#C84B3A' : av.apron);
    add(hat, G(new THREE.SphereGeometry(0.462, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2)), capMat, [0, 0.13, -0.02], [1, 0.82, 1], [-0.12, 0, 0]);
    add(hat, G(new THREE.CylinderGeometry(0.28, 0.28, 0.035, 28, 1, false, -Math.PI / 2, Math.PI)), capMat, [0, 0.17, 0.4], [0.95, 1, 1.15], [0.12, 0, 0]);
    add(hat, sphere(0.04), capMat, [0, 0.5, -0.07]);
  }

  /* props */
  const props: Record<string, THREE.Group> = {};
  // bowl held at the chest
  props.bowl = group(torso, [0.1, 0.36, 0.42]);
  const bowlPts = [[0, 0], [0.1, 0.005], [0.17, 0.05], [0.2, 0.13], [0.205, 0.14], [0.19, 0.14], [0.155, 0.06], [0.09, 0.03], [0, 0.03]].map(([x, y]) => new THREE.Vector2(x, y));
  add(props.bowl, G(new THREE.LatheGeometry(bowlPts, 32)), M.steel);
  for (const [x, z, m] of [[-0.06, 0.02, M.leaf], [0.05, -0.03, M.tomato], [0.02, 0.06, M.leaf], [-0.03, -0.06, M.tomato], [0.07, 0.05, M.leaf]] as const)
    add(props.bowl, sphere(0.045, 12, 10), m, [x, 0.11, z], [1, 0.6, 1]);
  // wooden spoon in the right hand
  props.spoon = group(R.hand, [0, -0.02, 0.04]);
  add(props.spoon, capsule(0.016, 0.34), M.wood, [0, -0.17, 0]);
  add(props.spoon, sphere(0.05), M.wood, [0, -0.38, 0], [1, 1.3, 0.45]);
  // knife in the right hand, board in front
  props.knife = group(R.hand, [0, -0.02, 0.04]);
  add(props.knife, capsule(0.026, 0.1), M.woodDark, [0, -0.07, 0]);
  add(props.knife, G(new THREE.BoxGeometry(0.012, 0.22, 0.07)), M.steel, [0, -0.25, 0.015]);
  props.board = group(torso, [0, 0.12, 0.5]);
  add(props.board, G(new THREE.BoxGeometry(0.52, 0.04, 0.28)), M.wood);
  for (let k = 0; k < 4; k++) add(props.board, G(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 14)), M.leaf, [0.04 + k * 0.055, 0.035, 0.02], [1, 1, 1], [0, 0, 0]);
  add(props.board, sphere(0.06), M.tomato, [-0.15, 0.06, 0]);

  /* contact shadow */
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadow = add(root, G(new THREE.PlaneGeometry(1.1, 0.7)), shadowMat, [0, 0.002, 0.05], [1, 1, 1], [-Math.PI / 2, 0, 0]);

  /* ------------------------------------------------------------ animation */
  type Pose = {
    bodyY: number; torsoX: number; torsoZ: number; headX: number; headY: number; headZ: number;
    rFwd: number; rOut: number; rElbow: number; rElbowZ: number; rTwist: number;
    lFwd: number; lOut: number; lElbow: number; lElbowZ: number; lTwist: number;
    happy: number; open: number;
  };
  const cur: Pose = target('idle', 0, -1);

  function target(action: Action, t: number, react: number): Pose {
    const breathe = Math.sin(t * 1.6);
    const p: Pose = {
      bodyY: 0, torsoX: 0.02 * breathe, torsoZ: 0.03 * Math.sin(t * 1.1), headX: 0, headY: 0.12 * Math.sin(t * 0.45), headZ: -0.04 * Math.sin(t * 1.1 + 0.6),
      rFwd: 0.08, rOut: 0.14, rElbow: 0.3, rElbowZ: 0, rTwist: 0,
      lFwd: 0.08, lOut: 0.14, lElbow: 0.3, lElbowZ: 0, lTwist: 0,
      happy: 0, open: 0,
    };
    switch (action) {
      case 'wave':
        Object.assign(p, { rFwd: 0.25, rOut: 2.45, rElbow: 0.15, rElbowZ: -0.5 * Math.sin(t * 7) - 0.2, headZ: -0.12, headY: 0.1, happy: Math.sin(t * 0.7) > 0.2 ? 1 : 0 });
        break;
      case 'stir': {
        const a = t * 4.2;
        Object.assign(p, {
          lFwd: 0.95, lOut: -0.1, lElbow: 1.2, lTwist: 0.2,
          rFwd: 0.78 + 0.12 * Math.sin(a), rOut: 0.12 + 0.12 * Math.cos(a), rElbow: 1.05, rTwist: 0,
          headX: 0.28, headY: 0.05 * Math.sin(t * 0.8), headZ: 0.05,
          happy: Math.sin(t * 0.6) > 0.55 ? 1 : 0,
        });
        break;
      }
      case 'chop': {
        const c = Math.abs(Math.sin(t * 6.5));
        Object.assign(p, {
          lFwd: 0.85, lOut: -0.05, lElbow: 1.15,
          rFwd: 0.55 + 0.4 * c, rOut: 0.05, rElbow: 1.0 + 0.25 * c,
          headX: 0.32, headZ: 0.04, bodyY: 0.006 * c,
        });
        break;
      }
      case 'taste': {
        const k = 0.5 + 0.5 * Math.sin(t * 1.5);
        const up = k * k;
        Object.assign(p, {
          lFwd: 0.95, lOut: -0.1, lElbow: 1.2, lTwist: 0.2,
          rFwd: 0.8 + 0.55 * up, rOut: 0.1 - 0.35 * up, rElbow: 1.0 + 1.0 * up,
          headX: 0.15 - 0.22 * up, headZ: 0.12 * up, happy: up > 0.75 ? 1 : 0, open: up > 0.6 && up < 0.75 ? 1 : 0,
        });
        break;
      }
      case 'cheer': {
        const j = Math.abs(Math.sin(t * 4.2));
        Object.assign(p, {
          rFwd: 0.2, rOut: 2.65, rElbow: 0.2, rElbowZ: 0.25 * Math.sin(t * 8.4),
          lFwd: 0.2, lOut: 2.65, lElbow: 0.2, lElbowZ: -0.25 * Math.sin(t * 8.4),
          bodyY: 0.12 * j, headX: -0.1, happy: 1, open: 1,
        });
        break;
      }
      case 'think':
        Object.assign(p, {
          rFwd: 1.15, rOut: -0.42, rElbow: 2.15, rTwist: 0.3,
          lFwd: 0.62, lOut: -0.55, lElbow: 1.45,
          headX: -0.1, headZ: -0.16 + 0.04 * Math.sin(t * 0.9), headY: 0.1,
        });
        break;
      case 'idle':
        break;
    }
    if (react >= 0) {
      const k = Math.sin(Math.PI * Math.min(1, react));
      p.bodyY = Math.max(p.bodyY, 0.16 * k);
      p.happy = 1;
      p.open = react < 0.7 ? 1 : 0;
      p.headX -= 0.12 * k;
      if (action !== 'cheer') {
        p.rOut = Math.max(p.rOut, 1.2 * k);
        p.lOut = Math.max(p.lOut, action === 'stir' || action === 'chop' || action === 'taste' ? p.lOut : 1.2 * k);
      }
    }
    return p;
  }

  let blinkAt = 2 + Math.random() * 3;
  let currentAction: Action | null = null;

  function update(dt: number, t: number, action: Action, react: number, snap = false) {
    const tgt = target(action, t, react);
    const k = snap ? 1 : 1 - Math.exp(-dt * 9);
    for (const key of Object.keys(cur) as (keyof Pose)[]) {
      if (key === 'happy' || key === 'open') cur[key] = tgt[key];
      else cur[key] += (tgt[key] - cur[key]) * k;
    }
    if (currentAction !== action) {
      currentAction = action;
      props.bowl.visible = action === 'stir' || action === 'taste';
      props.spoon.visible = action === 'stir' || action === 'taste';
      props.knife.visible = action === 'chop';
      props.board.visible = action === 'chop';
    }
    body.position.y = cur.bodyY;
    shadow.scale.setScalar(1 - cur.bodyY * 1.6);
    torso.rotation.set(cur.torsoX, 0, cur.torsoZ);
    torso.scale.set(1, 1 + 0.012 * Math.sin(t * 1.6), 1);
    head.rotation.set(cur.headX, cur.headY, cur.headZ);
    for (const [arm, s, fwd, out, el, elz, tw] of [
      [R, -1, cur.rFwd, cur.rOut, cur.rElbow, cur.rElbowZ, cur.rTwist],
      [L, 1, cur.lFwd, cur.lOut, cur.lElbow, cur.lElbowZ, cur.lTwist],
    ] as const) {
      arm.shoulder.rotation.set(-fwd, s * tw, s * out);
      arm.elbow.rotation.set(-el, 0, s * elz);
    }
    // spoon points down into the bowl; knife blade points forward-down
    props.spoon.rotation.set(-0.2 + (action === 'taste' ? -0.9 * Math.max(0, cur.rElbow - 1.2) : 0), 0, 0);
    props.knife.rotation.set(-1.1, 0, 0);

    // blink
    let eyeY = 1;
    if (t > blinkAt) {
      const b = (t - blinkAt) / 0.14;
      eyeY = b < 1 ? Math.abs(1 - 2 * b) * 0.9 + 0.1 : 1;
      if (b >= 1) blinkAt = t + 2.5 + Math.random() * 3.5;
    }
    eyes.scale.y = eyeY;
    eyes.visible = cur.happy < 0.5;
    happyEyes.visible = cur.happy >= 0.5;
    smile.visible = cur.open < 0.5;
    open.visible = cur.open >= 0.5;
    const lift = cur.happy >= 0.5 ? 0.02 : action === 'think' ? 0.025 : 0;
    for (const b of brows) b.position.y = (b.userData.base as number) + lift;
  }

  update(0, 0, av.action, -1, true);

  return {
    root,
    update,
    dispose() {
      geos.forEach((g) => g.dispose());
      Object.values(M).forEach((m) => m.dispose());
      shadowTex.dispose();
      shadowMat.dispose();
      root.traverse((o) => { if (o instanceof THREE.Mesh && !Object.values(M).includes(o.material)) (o.material as THREE.Material).dispose(); });
    },
  };
}

/* ------------------------------------------------------------ staging */

export type Mood = 'day' | 'night';

let envTex: THREE.Texture | null = null;
function environment(renderer: THREE.WebGLRenderer) {
  if (!envTex) {
    const pm = new THREE.PMREMGenerator(renderer);
    envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
  }
  return envTex;
}

export function makeStage(mood: Mood, renderer?: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  if (renderer) {
    scene.environment = environment(renderer);
    scene.environmentIntensity = 0.28;
  }
  scene.add(new THREE.HemisphereLight(mood === 'night' ? '#E8DCFF' : '#FFF6E8', mood === 'night' ? '#4A3A52' : '#B89A80', mood === 'night' ? 0.9 : 1.15));
  const key = new THREE.DirectionalLight(mood === 'night' ? '#FFE7C4' : '#FFF1DE', mood === 'night' ? 1.7 : 2.3);
  key.position.set(-2.5, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(mood === 'night' ? '#FFD27A' : '#CFE0FF', mood === 'night' ? 1.6 : 0.9);
  rim.position.set(3.5, 1.5, -1.5); // the open fridge is to the chef's left
  scene.add(rim);
  const fill = new THREE.DirectionalLight('#FFFFFF', 0.35);
  fill.position.set(0, 1, 5);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(22, 0.62, 0.1, 50);
  camera.position.set(0, 1.35, 7.6);
  camera.lookAt(0, 1.22, 0);
  return { scene, camera };
}

export function makeRenderer(canvas?: HTMLCanvasElement, preserve = false) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: preserve, powerPreference: 'low-power' });
  r.setClearColor(0x000000, 0);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  return r;
}
