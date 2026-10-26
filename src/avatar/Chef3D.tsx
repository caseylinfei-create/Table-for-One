import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { buildChef, makeRenderer, makeStage, type ChefRig, type Mood } from './model';
import type { Action, Avatar } from './avatar';

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

type Props = {
  avatar: Avatar;
  /** Defaults to the avatar's own signature move. */
  action?: Action;
  mood?: Mood;
  /** Bump to play the tap reaction. */
  reactKey?: number;
  /** Lets the viewer spin the chef by dragging (Chef Studio). */
  spin?: boolean;
  /** Base turn toward the viewer, radians. */
  turn?: number;
  className?: string;
};

/** Live, animated 3D chef. Pauses itself when off screen or when the tab is hidden. */
export function Chef3D({ avatar, action, mood = 'day', reactKey = 0, spin = false, turn = 0.28, className = '' }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ action: action ?? avatar.action, reactAt: -1, yaw: 0, drag: null as null | { x: number; yaw: number } });
  state.current.action = action ?? avatar.action;
  const key = useMemo(() => JSON.stringify(avatar), [avatar]);

  useEffect(() => {
    const el = host.current!;
    const renderer = makeRenderer();
    const canvas = renderer.domElement;
    canvas.className = 'chef3d-canvas';
    el.appendChild(canvas);
    const { scene, camera } = makeStage(mood, renderer);
    let rig: ChefRig = buildChef(JSON.parse(key));
    scene.add(rig.root);

    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the whole chef in frame whatever the box shape.
      camera.zoom = Math.min(1, (w / h) / 0.62);
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); });
    io.observe(el);

    let raf = 0, last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const s = state.current;
      const react = s.reactAt >= 0 ? (t - s.reactAt) / 1.1 : -1;
      if (react > 1) s.reactAt = -1;
      rig.root.rotation.y = turn + s.yaw;
      if (!s.drag) s.yaw *= 1 - Math.min(1, dt * 1.5);
      rig.update(dt, REDUCED ? t * 0.35 : t, s.action, react > 1 ? -1 : react);
      renderer.render(scene, camera);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const loop = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const onVis = () => !document.hidden && loop();
    document.addEventListener('visibilitychange', onVis);
    loop();

    (el as HTMLDivElement & { __react?: () => void }).__react = () => { state.current.reactAt = (performance.now() - t0) / 1000; loop(); };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      scene.remove(rig.root);
      rig.dispose();
      renderer.dispose();
      canvas.remove();
      rig = null as unknown as ChefRig;
    };
  }, [key, mood, turn]);

  useEffect(() => {
    if (reactKey) (host.current as (HTMLDivElement & { __react?: () => void }) | null)?.__react?.();
  }, [reactKey]);

  const handlers = spin
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          state.current.drag = { x: e.clientX, yaw: state.current.yaw };
        },
        onPointerMove: (e: React.PointerEvent) => {
          const d = state.current.drag;
          if (d) state.current.yaw = d.yaw + (e.clientX - d.x) / 60;
        },
        onPointerUp: () => { state.current.drag = null; },
        onPointerCancel: () => { state.current.drag = null; },
      }
    : {};

  return <div ref={host} className={`chef3d ${spin ? 'chef3d--spin' : ''} ${className}`} aria-hidden="true" {...handlers} />;
}

/* ----------------------------------------------------------- portraits */

let shared: { renderer: THREE.WebGLRenderer } | null = null;
const cache = new Map<string, string>();

/**
 * A still image of the chef for small spots (recipe page, cook mode),
 * so the app keeps a single live 3D canvas at a time.
 */
export function chefPortrait(avatar: Avatar, action: Action = 'idle', crop: 'full' | 'bust' = 'full', mood: Mood = 'day'): string {
  const k = JSON.stringify([avatar, action, crop, mood]);
  const hit = cache.get(k);
  if (hit) return hit;
  try {
    if (!shared) shared = { renderer: makeRenderer(undefined, true) };
    const { renderer } = shared;
    const W = crop === 'bust' ? 320 : 310, H = crop === 'bust' ? 320 : 500;
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    const { scene, camera } = makeStage(mood, renderer);
    camera.aspect = W / H;
    if (crop === 'bust') {
      camera.position.set(0, 1.8, 5.6);
      camera.lookAt(0, 1.72, 0);
    }
    camera.updateProjectionMatrix();
    const rig = buildChef(avatar);
    rig.root.rotation.y = 0.28;
    scene.add(rig.root);
    for (let i = 0; i <= 20; i++) rig.update(1 / 20, 1.2 + i / 20, action, -1, i === 0);
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    rig.dispose();
    if (cache.size > 40) cache.clear();
    cache.set(k, url);
    return url;
  } catch {
    return '';
  }
}

export function usePortrait(avatar: Avatar | undefined, action: Action = 'idle', crop: 'full' | 'bust' = 'full', mood: Mood = 'day') {
  const k = JSON.stringify(avatar);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (avatar ? chefPortrait(avatar, action, crop, mood) : ''), [k, action, crop, mood]);
}
