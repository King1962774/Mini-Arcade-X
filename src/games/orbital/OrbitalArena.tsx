import { useEffect, useRef, useState } from 'react';
import { orbitalModes } from '../../data/games';
import { Icon } from '../../components/Icon';
import { playTone } from '../sfx';
import { createOrbitalSim, drawOrbitalScene, fireOrbital, specialOrbital, stepOrbitalSim, type OrbitalHud, type ShotStyle } from './simulation';

export type BattlePhase = 'menu' | 'countdown' | 'playing' | 'roundEnd' | 'final';
interface OrbitalArenaProps { phase: BattlePhase; modeIndex: number; soundOn: boolean; onRoundEnd: (winner: 0 | 1) => void; round: number; roundWinner: 0 | 1; count: number }
interface PressState { at: number; player: 0 | 1 }
const initialHud: OrbitalHud = { hp: [100, 100], lives: [3, 3], energy: [100, 100], combo: [0, 0], elapsed: 0, sudden: false };

export function OrbitalArena({ phase, modeIndex, soundOn, onRoundEnd, round, roundWinner, count }: OrbitalArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const prevHealth = useRef<[number, number, number, number]>([40, 40, 3, 3]);
  const sim = useRef(createOrbitalSim());
  const keys = useRef(new Set<string>());
  const firePress = useRef<[PressState | null, PressState | null]>([null, null]);
  const lastTap = useRef<number[]>([0, 0]);
  const endedRef = useRef(false);
  const phaseRef = useRef(phase);
  const modeRef = useRef(modeIndex);
  const soundRef = useRef(soundOn);
  const onEndRef = useRef(onRoundEnd);
  const [hud, setHud] = useState<OrbitalHud>(initialHud);
  const [actionLabel, setActionLabel] = useState('SISTEMA DE ARMAS EN LÍNEA');
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { modeRef.current = modeIndex; }, [modeIndex]);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);
  useEffect(() => { onEndRef.current = onRoundEnd; }, [onRoundEnd]);

  useEffect(() => {
    if (phase === 'playing') {
      sim.current = createOrbitalSim(); endedRef.current = false; setHud(initialHud); setActionLabel('SISTEMA DE ARMAS EN LÍNEA');
    }
  }, [phase]);

  useEffect(() => {
    let raf = 0; let previous = 0; let lastHud = 0;
    const frame = (stamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const w = 960, h = 500;
        ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
        const dt = previous ? Math.min(0.035, Math.max(0, (stamp - previous) / 1000)) : 0;
        previous = stamp;
        const current = sim.current;
        if (phaseRef.current === 'playing') {
          const winner = stepOrbitalSim(current, keys.current, dt, modeRef.current, performance.now());
          if (winner !== null && !endedRef.current) { endedRef.current = true; onEndRef.current(winner); playTone(winner === 0 ? 780 : 400, 0.22, soundRef.current, 'triangle'); }
          if (stamp - lastHud > 130) {
            lastHud = stamp;
            setHud({ hp: [current.pilots[0].hp * 2.5, current.pilots[1].hp * 2.5], lives: [current.pilots[0].lives, current.pilots[1].lives], energy: [current.pilots[0].energy, current.pilots[1].energy], combo: [current.pilots[0].combo, current.pilots[1].combo], elapsed: current.elapsed, sudden: current.elapsed >= orbitalModes[modeRef.current].suddenDeath });
          }
        }
        const [a, b] = current.pilots;
        const prev = prevHealth.current;
        if (phaseRef.current === 'playing' && (a.hp < prev[0] || b.hp < prev[1])) {
          const el = arenaRef.current;
          if (el) { el.classList.remove('hit', 'big-hit'); void el.offsetWidth; el.classList.add(a.lives < prev[2] || b.lives < prev[3] ? 'big-hit' : 'hit'); }
        }
        prevHealth.current = [a.hp, b.hp, a.lives, b.lives];
        drawOrbitalScene(ctx, current, modeRef.current, stamp, w, h);
      }
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', ' '].includes(key)) event.preventDefault();
      if (event.repeat) return;
      keys.current.add(key);
      const player = key === 'f' || key === 'g' || key === 'w' || key === 's' ? 0 : key === 'enter' || key === 'shift' || key === 'arrowup' || key === 'arrowdown' ? 1 : -1;
      if (phaseRef.current === 'playing' && (player === 0 && key === 'g' || player === 1 && key === 'shift')) {
        const result = specialOrbital(sim.current, player as 0 | 1, performance.now());
        setActionLabel(result === 'nova' ? 'SUPER NOVA · DOBLE TOQUE' : result === 'missile' ? 'MISIL TELEDIRIGIDO' : 'ENERGÍA INSUFICIENTE');
        playTone(result === 'nova' ? 1280 : result === 'missile' ? 880 : 300, 0.14, soundRef.current, 'triangle');
      }
      if (phaseRef.current === 'playing' && player >= 0 && (key === 'f' || key === 'enter')) firePress.current[player as 0 | 1] = { at: performance.now(), player: player as 0 | 1 };
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase(); keys.current.delete(key);
      const player: 0 | 1 | null = key === 'f' ? 0 : key === 'enter' ? 1 : null;
      const active = player === null ? null : firePress.current[player];
      if (!active || player === null) return;
      firePress.current[player] = null;
      releaseFire(player, performance.now() - active.at);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const releaseFire = (player: 0 | 1, duration: number) => {
    const now = performance.now();
    const sinceTap = now - lastTap.current[player];
    const doubleTap = sinceTap < 380 && lastTap.current[player] > 0;
    const style: ShotStyle = doubleTap ? (sim.current.pilots[player].combo >= 3 ? 'nova' : 'missile') : duration > 650 ? 'beam' : duration > 130 ? 'fan' : 'pulse';
    lastTap.current[player] = now;
    const fired = fireOrbital(sim.current, player, style, now, duration);
    if (!fired) { setActionLabel('ENERGÍA BAJA · RECARGA'); playTone(180, 0.09, soundRef.current); return; }
    setActionLabel(({ pulse: 'BALA DE PLASMA', fan: 'ABANICO DE BALAS', beam: 'RAYO CARGADO', missile: 'MISIL TELEDIRIGIDO', nova: 'SUPER NOVA' } as Record<ShotStyle, string>)[style]);
    playTone(style === 'beam' ? 270 : style === 'missile' ? 880 : style === 'nova' ? 260 : 560, style === 'beam' ? 0.21 : 0.08, soundRef.current, style === 'beam' ? 'sawtooth' : 'triangle');
  };

  const startFireTouch = (player: 0 | 1) => { if (phaseRef.current === 'playing') firePress.current[player] = { at: performance.now(), player }; };
  const endFireTouch = (player: 0 | 1) => { const active = firePress.current[player]; if (!active) return; firePress.current[player] = null; releaseFire(player, performance.now() - active.at); };
  const doSpecial = (player: 0 | 1) => {
    if (phaseRef.current !== 'playing') return;
    const result = specialOrbital(sim.current, player, performance.now());
    setActionLabel(result === 'nova' ? `SUPER NOVA P${player + 1} · IMPACTO` : result === 'missile' ? `MISIL P${player + 1} · EN RUTA` : 'ENERGÍA INSUFICIENTE');
    playTone(result === 'nova' ? 1280 : result === 'missile' ? 880 : 300, 0.14, soundRef.current, 'triangle');
  };
  const setMove = (key: string, pressed: boolean) => { if (pressed) keys.current.add(key); else keys.current.delete(key); };
  const fmtTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
  const mode = orbitalModes[modeIndex];

  return (
    <div className="orbital-console">
      <div className="orbital-arena" ref={arenaRef}>
        <canvas ref={canvasRef} width="240" height="125" aria-label="Arena espacial de dos jugadores" />
        <div className="orbital-top-hud"><div className="orbital-player-hud teal"><span>P1 <b>CAPITÁN</b></span><div className={hud.hp[0] < 30 ? 'orbital-health low' : 'orbital-health'}><i style={{ width: `${hud.hp[0]}%` }} /></div><small>CASCO {Math.ceil(hud.hp[0])}% <i>·</i> VIDAS {hud.lives[0]} <i>·</i> EN. {Math.floor(hud.energy[0])}%</small></div><div className="orbital-match-hud"><span>{mode.name.toUpperCase()}</span><b>{fmtTime(hud.elapsed)}</b><small>R{round} · {phase === 'roundEnd' || phase === 'final' ? 'FIN' : ''}</small></div><div className="orbital-player-hud amber"><span><b>CAPITÁN</b> P2</span><div className={hud.hp[1] < 30 ? 'orbital-health low' : 'orbital-health'}><i style={{ width: `${hud.hp[1]}%` }} /></div><small>CASCO {Math.ceil(hud.hp[1])}% <i>·</i> VIDAS {hud.lives[1]} <i>·</i> EN. {Math.floor(hud.energy[1])}%</small></div></div>
        <div className="orbital-action-readout"><span><i className="readout-dot" /> {hud.sudden ? 'MUERTE SÚBITA · DAÑO DOBLE' : actionLabel}</span><span>COMBO <b>{hud.combo[0]}</b> / <b>{hud.combo[1]}</b> <i className="nova-marker">✦</i> A 3: SUPER NOVA</span></div>
        {(phase === 'menu' || phase === 'countdown' || phase === 'roundEnd' || phase === 'final') && <div className="orbital-screen-overlay">
          {phase === 'menu' && <div className="orbital-menu-card"><p className="eyebrow">ARCADE / CONFIGURACIÓN DE COMBATE</p><h2>Elige el <em>campo.</em></h2><p className="orbital-card-desc">El primer piloto en llevarse dos rondas gana la órbita.</p><div className="orbital-mode-choices">{orbitalModes.map((item, index) => <button className={modeIndex === index ? 'orbital-mode-card selected' : 'orbital-mode-card'} key={item.name} onClick={() => document.dispatchEvent(new CustomEvent('orbital-change-mode', { detail: index }))} style={{ '--mode-color': item.color } as React.CSSProperties}><span>0{index + 1}</span><b>{item.name}</b><small>{item.subtitle}</small><i>{item.events}</i><em>{item.suddenDeath} S · MUERTE SÚBITA</em></button>)}</div><p className="orbital-menu-note">P1: W / S · F / G <span>—</span> P2: ↑ / ↓ · ENTER / SHIFT</p><button className="button-primary orbital-overlay-launch" onClick={() => document.dispatchEvent(new Event('orbital-start'))}>INICIAR COMBATE <Icon name="arrow" /></button></div>}
          {phase === 'countdown' && <div className="orbital-countdown-card"><span>ALISTANDO NÚCLEOS</span><b className="countdown-number">{count || 'FUEGO!'}</b><small>{mode.name.toUpperCase()} · RONDA {round}</small></div>}
          {phase === 'roundEnd' && <div className="orbital-result-card"><span className="eyebrow">RONDA COMPLETADA · P{roundWinner + 1} SUMA UNA VICTORIA</span><h2>La órbita es de <em>P{roundWinner + 1}.</em></h2><p>Un respiro. Ajusta el pulso y vuelve al campo.</p><button className="button-primary" onClick={() => document.dispatchEvent(new Event('orbital-next-round'))}>SIGUIENTE RONDA <Icon name="arrow" /></button></div>}
          {phase === 'final' && <div className="orbital-result-card"><span className="eyebrow">PARTIDA TERMINADA · MEJOR DE 3</span><h2>Campeón de la órbita:<br /><em>P{roundWinner + 1}.</em></h2><p>Dos rondas ganadas. La señal de victoria queda registrada.</p><button className="button-primary" onClick={() => document.dispatchEvent(new Event('orbital-rematch'))}>REVANCHA <Icon name="arrow" /></button></div>}
        </div>}
      </div>
      <div className="orbital-controls" aria-label="Controles táctiles para dos jugadores">
        <div className="touch-pilot teal"><div className="touch-pilot-title"><i />P1 <small>JUGADOR 01</small></div><div className="touch-row"><button onPointerDown={() => setMove('w', true)} onPointerUp={() => setMove('w', false)} onPointerLeave={() => setMove('w', false)} aria-label="Mover jugador uno arriba">↑</button><button onPointerDown={() => setMove('s', true)} onPointerUp={() => setMove('s', false)} onPointerLeave={() => setMove('s', false)} aria-label="Mover jugador uno abajo">↓</button><button className="touch-fire" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startFireTouch(0); }} onPointerUp={() => endFireTouch(0)} onPointerCancel={() => endFireTouch(0)} aria-label="Disparar jugador uno">FIRE</button><button className="touch-special" onClick={() => doSpecial(0)} aria-label="Lanzar misil o Super Nova del jugador uno">G</button></div></div>
      <div className="touch-instructions"><span><b>TOQUE</b> · BALA</span><span><b>2 TOQUES</b> · MISIL / NOVA</span><span><b>MANTÉN</b> · ABANICO / RAYO</span></div>
        <div className="touch-pilot amber"><div className="touch-pilot-title"><i />P2 <small>JUGADOR 02</small></div><div className="touch-row"><button onPointerDown={() => setMove('arrowup', true)} onPointerUp={() => setMove('arrowup', false)} onPointerLeave={() => setMove('arrowup', false)} aria-label="Mover jugador dos arriba">↑</button><button onPointerDown={() => setMove('arrowdown', true)} onPointerUp={() => setMove('arrowdown', false)} onPointerLeave={() => setMove('arrowdown', false)} aria-label="Mover jugador dos abajo">↓</button><button className="touch-fire" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startFireTouch(1); }} onPointerUp={() => endFireTouch(1)} onPointerCancel={() => endFireTouch(1)} aria-label="Disparar jugador dos">FIRE</button><button className="touch-special" onClick={() => doSpecial(1)} aria-label="Lanzar misil o Super Nova del jugador dos">S</button></div></div>
      </div>
      <div className="orbital-footer-strip"><span><Icon name="crosshair" /> {mode.name.toUpperCase()} · VELOCIDAD {mode.speed}</span><span><Icon name="bolt" /> TOQUE: BALA <i>·</i> DOBLE: MISIL / NOVA <i>·</i> MANTÉN: ABANICO / RAYO</span></div>
    </div>
  );
}
