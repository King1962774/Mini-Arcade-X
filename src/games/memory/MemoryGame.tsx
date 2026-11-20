import { useCallback, useEffect, useRef, useState } from 'react';
import { memoryDifficulties } from '../../data/games';
import { Icon } from '../../components/Icon';
import { playTone } from '../sfx';

type Phase = 'intro' | 'watch' | 'input' | 'mistake' | 'levelup' | 'victory' | 'defeat';
interface MemoryGameProps { soundOn: boolean; difficulty: number; onPhaseChange: (phase: Phase) => void }
const bestKey = 'fd-memory-best-v1';
function safeBest(): number[] { try { const value = JSON.parse(localStorage.getItem(bestKey) || '[0,0,0,0]'); return Array.isArray(value) ? [0, 1, 2, 3].map((i) => Number(value[i]) || 0) : [0, 0, 0, 0]; } catch { return [0, 0, 0, 0]; } }
function makeRoute(size: number) {
  const route: number[] = [];
  for (let i = 0; i < size; i++) {
    let value = Math.random() > 0.5 ? 1 : 0;
    if (i >= 3 && route[i - 1] === route[i - 2] && route[i - 2] === route[i - 3] && route[i - 1] === value) value = 1 - value;
    route.push(value);
  }
  return route;
}

export function MemoryGame({ soundOn, difficulty, onPhaseChange }: MemoryGameProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [levelLength, setLevelLength] = useState<number>(memoryDifficulties[difficulty].start);
  const [route, setRoute] = useState<number[]>(() => makeRoute(memoryDifficulties[difficulty].max));
  const [activePad, setActivePad] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [shields, setShields] = useState<number>(memoryDifficulties[difficulty].shields);
  const [hints, setHints] = useState<number>(memoryDifficulties[difficulty].hints);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState<number[]>(safeBest);
  const [timePercent, setTimePercent] = useState(100);
  const [notice, setNotice] = useState('INICIANDO SECUENCIA D-CORE');
  const [rank, setRank] = useState('ASPIRANTE');
  const phaseRef = useRef<Phase>('intro');
  const shieldRef = useRef(0);
  const timer = useRef<number | null>(null);
  const currentDifficulty = memoryDifficulties[difficulty];
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { shieldRef.current = shields; }, [shields]);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  useEffect(() => { onPhaseChange(phase); }, [phase, onPhaseChange]);
  useEffect(() => {
    if (phaseRef.current !== 'intro') return;
    const cfg = memoryDifficulties[difficulty];
    setRoute(makeRoute(cfg.max)); setLevelLength(cfg.start); setShields(cfg.shields); shieldRef.current = cfg.shields;
    setHints(cfg.hints); setScore(0); setCombo(0); setInputIndex(0); setActivePad(null);
  }, [difficulty]);

  const updateBest = useCallback((value: number, index = difficulty) => {
    setBest((current) => {
      const next = [...current];
      next[index] = Math.max(next[index] || 0, value);
      try { localStorage.setItem(bestKey, JSON.stringify(next)); } catch { /* almacenamiento no disponible */ }
      return next;
    });
  }, [difficulty]);

  const begin = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    const cfg = memoryDifficulties[difficulty];
    setRoute(makeRoute(cfg.max));
    setLevelLength(cfg.start);
    setShields(cfg.shields);
    shieldRef.current = cfg.shields;
    setHints(cfg.hints);
    setScore(0);
    setCombo(0);
    setInputIndex(0);
    setActivePad(null);
    setNotice('ABRIENDO CANAL DE MEMORIA');
    phaseRef.current = 'intro';
    setPhase('intro');
    playTone(260, 0.22, soundOn, 'sine');
  }, [difficulty, soundOn]);

  useEffect(() => {
    if (phase !== 'watch' || route.length === 0) return;
    const cfg = memoryDifficulties[difficulty];
    let cancelled = false;
    const hold = Math.max(110, cfg.on);
    const space = cfg.on + cfg.gap;
    setInputIndex(0);
    setActivePad(null);
    setNotice(`OBSERVA LA RUTA · ${levelLength} SEÑALES`);
    for (let i = 0; i < levelLength; i++) {
      const id = window.setTimeout(() => {
        if (cancelled) return;
        setActivePad(route[i]);
        playTone(route[i] ? 700 : 440, Math.min(hold / 1000, 0.32), soundOn, route[i] ? 'triangle' : 'sine');
        window.setTimeout(() => { if (!cancelled) setActivePad(null); }, hold);
      }, 420 + i * space);
      if (i === 0) timer.current = id;
    }
    const end = window.setTimeout(() => {
      if (cancelled) return;
      setActivePad(null);
      setNotice('TU TURNO · REPITE LA RUTA');
      phaseRef.current = 'input';
      setPhase('input');
    }, 420 + levelLength * space + hold);
    timer.current = end;
    return () => { cancelled = true; window.clearTimeout(end); };
  }, [phase, route, levelLength, difficulty, soundOn]);

  const finishSuccess = useCallback((remainingShields: number, inputScore: number) => {
    const levelScore = inputScore + 50 * levelLength;
    if (levelLength >= currentDifficulty.max) {
      const finalScore = levelScore + 200 * remainingShields;
      setScore(finalScore);
      const newRank = remainingShields >= currentDifficulty.shields ? 'ALMIRANTE' : remainingShields > 1 ? 'CAPITÁN' : 'PILOTO';
      setRank(newRank);
      updateBest(finalScore);
      phaseRef.current = 'victory';
      setPhase('victory');
      setNotice('LA TIERRA ENCONTRÓ LA RUTA');
      playTone(1047, 0.35, soundOn, 'triangle');
      return;
    }
    setScore(levelScore);
    setNotice('SEÑAL CONFIRMADA · SALTO ADELANTE');
    phaseRef.current = 'levelup';
    setPhase('levelup');
    playTone(880, 0.17, soundOn);
    const nextLength = levelLength + 1;
    timer.current = window.setTimeout(() => { setLevelLength(nextLength); phaseRef.current = 'watch'; setPhase('watch'); }, 650);
  }, [levelLength, currentDifficulty, updateBest, soundOn]);

  const fail = useCallback(() => {
    if (phaseRef.current !== 'input') return;
    const remaining = Math.max(0, shieldRef.current - 1);
    shieldRef.current = remaining;
    setShields(remaining);
    setCombo(0);
    setActivePad(null);
    setNotice(remaining ? 'ESCUDO DAÑADO · REPITE EL NIVEL' : 'SIN ESCUDOS · SEÑAL PERDIDA');
    phaseRef.current = 'mistake';
    setPhase('mistake');
    playTone(180, 0.33, soundOn, 'sawtooth');
    if (remaining) timer.current = window.setTimeout(() => { phaseRef.current = 'watch'; setPhase('watch'); }, 1050);
    else { updateBest(score); setRank('ASPIRANTE'); phaseRef.current = 'defeat'; setPhase('defeat'); }
  }, [soundOn, updateBest, score]);

  useEffect(() => {
    if (phase !== 'input' || currentDifficulty.time === 0) { setTimePercent(100); return; }
    const expiresAt = Date.now() + currentDifficulty.time;
    const tick = window.setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now());
      setTimePercent((left / currentDifficulty.time) * 100);
      if (left <= 0) { window.clearInterval(tick); fail(); }
    }, 40);
    return () => window.clearInterval(tick);
  }, [phase, inputIndex, currentDifficulty, fail]);

  const pressPad = useCallback((side: number) => {
    if (phaseRef.current !== 'input') return;
    if (route[inputIndex] !== side) { fail(); return; }
    playTone(side ? 760 : 520, 0.1, soundOn);
    setActivePad(side);
    window.setTimeout(() => setActivePad((current) => current === side ? null : current), 150);
    const nextCombo = combo + 1;
    const nextScore = score + 10 + 2 * Math.min(nextCombo, 10);
    setCombo(nextCombo);
    setScore(nextScore);
    setNotice(`TU TURNO · RACHA ${nextCombo}`);
    const nextIndex = inputIndex + 1;
    setInputIndex(nextIndex);
    if (nextIndex >= levelLength) finishSuccess(shieldRef.current, nextScore);
  }, [route, inputIndex, soundOn, fail, levelLength, finishSuccess, combo, score]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright'].includes(key)) event.preventDefault();
      if (event.repeat) return;
      if (['a', 'arrowleft'].includes(key)) pressPad(0);
      else if (['d', 'arrowright'].includes(key)) pressPad(1);
      else if (key === ' ' && phaseRef.current === 'input' && hints > 0) {
        setHints((value) => value - 1);
        setCombo(0);
        phaseRef.current = 'watch'; setPhase('watch'); setNotice('PISTA ACTIVADA · OBSERVA DE NUEVO');
        playTone(980, 0.16, soundOn, 'triangle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressPad, hints, soundOn]);

  const stateLabel = ({ intro: 'CARGANDO', watch: 'OBSERVA', input: 'RESPONDE', mistake: 'ESCUDO', levelup: 'SEÑAL OK', victory: 'VICTORIA', defeat: 'SIN SEÑAL' } as const)[phase];
  return (
    <div className="memory-console" data-phase={phase}>
      <div className="memory-stage">
        <div className="memory-nebula nebula-one" /><div className="memory-nebula nebula-two" />
        <span className="memory-meteor meteor-one" aria-hidden="true" /><span className="memory-meteor meteor-two" aria-hidden="true" />
        {Array.from({ length: 84 }, (_, i) => <i className={`memory-star star-${i % 4}`} key={i} style={{ left: `${(i * 53 + 17) % 100}%`, top: `${(i * 37 + 9) % 88}%`, animationDelay: `${(i % 13) * -0.4}s` }} />)}
        <div className="memory-topline"><span><i className="memory-live" /> D-CORE / REGISTRO 00{difficulty + 1}</span><span>SECTOR TIERRA <b>◎</b></span></div>
        <div className="memory-hud"><div><small>ESCUDOS</small><div className="shield-icons">{Array.from({ length: currentDifficulty.shields }, (_, i) => <i className={i < shields ? 'shield-on' : ''} key={i}>◆</i>)}</div></div><div className="memory-length"><small>SEÑALES</small><strong>{levelLength.toString().padStart(2, '0')}<i>/{currentDifficulty.max.toString().padStart(2, '0')}</i></strong></div><div><small>PISTAS</small><strong className="hint-count">{hints.toString().padStart(2, '0')}</strong></div></div>
        <div className={`earth-illustration ${phase === 'defeat' ? 'earth-lost' : ''}`}><div className="earth-halo" /><div className="earth-ring" /><div className="earth-disc"><i className="land land-a" /><i className="land land-b" /><i className="land land-c" /><span /></div><span className="earth-label">HOGAR · 03</span></div>
        <div className="memory-message"><span className={`phase-chip phase-${phase}`}>{stateLabel}</span><h2>{notice}</h2><div className="sequence-progress">{Array.from({ length: levelLength }, (_, i) => <i key={i} className={i < inputIndex && phase === 'input' ? 'done' : ''} />)}</div></div>
        {phase === 'input' && currentDifficulty.time > 0 && <div className="memory-timebar"><i style={{ width: `${timePercent}%` }} /></div>}
        <div className="memory-pads"><button className={`memory-pad-button pad-left ${activePad === 0 ? 'lit' : ''}`} onClick={() => pressPad(0)} disabled={phase !== 'input'}><span className="pad-glyph">◒</span><b>SEÑAL A</b><small>P1 · A / ←</small></button><button className={`memory-pad-button pad-right ${activePad === 1 ? 'lit' : ''}`} onClick={() => pressPad(1)} disabled={phase !== 'input'}><span className="pad-glyph">◓</span><b>SEÑAL B</b><small>P2 · D / →</small></button></div>
        <div className="memory-bottom-hud"><span>PTS <b>{score.toString().padStart(5, '0')}</b></span><span>NIVEL <b>{Math.max(0, levelLength - currentDifficulty.start + 1).toString().padStart(2, '0')}</b></span><span>RÉCORD <b>{(best[difficulty] || 0).toString().padStart(5, '0')}</b></span></div>
        <div className="memory-stage-vignette" />
        {(phase === 'intro' || phase === 'victory' || phase === 'defeat') && <div className="memory-overlay"><div className="memory-overlay-card"><img src="/logo.svg" alt="" /><p className="eyebrow">{phase === 'intro' ? 'TRANSMISIÓN ESTELAR' : phase === 'victory' ? 'TRANSMISIÓN FINAL' : 'SEÑAL PERDIDA'}</p><h2>{phase === 'intro' ? 'Mission Memory' : phase === 'victory' ? 'Memoria perfecta' : 'Secuencia rota'}</h2>{phase === 'intro' ? <><p>Observa las luces de la ruta y repítelas en el mismo orden. Cada nivel añade una señal nueva.</p><button className="button-primary" onClick={() => { if (timer.current) clearTimeout(timer.current); phaseRef.current = 'watch'; setPhase('watch'); }}>COMENZAR MISIÓN <Icon name="arrow" /></button></> : <><div className="memory-result-stats"><span>PTS<strong>{score.toString().padStart(5, '0')}</strong></span><span>RANGO<strong>{phase === 'victory' ? rank : 'ASPIRANTE'}</strong></span><span>ESCUDOS<strong>{shields}</strong></span></div>{phase === 'victory' && <p className="new-record-label">{score >= (best[difficulty] || 0) ? '✦ NUEVO RÉCORD ✦' : 'LA TIERRA ENCONTRÓ LA RUTA'}</p>}<button className="button-primary" onClick={begin}>JUGAR OTRA MISIÓN <Icon name="arrow" /></button><button className="result-link" onClick={() => setPhase('intro')}>VOLVER AL MENÚ</button></>}</div></div>}
      </div>
      <div className="memory-toolbar"><div className="memory-toolbar-status"><span className="memory-mini-orbit">◎</span><div><b>{currentDifficulty.name.toUpperCase()} · {currentDifficulty.subtitle.toUpperCase()}</b><small>LUZ {currentDifficulty.on} MS <i>·</i> PAUSA {currentDifficulty.gap} MS <i>·</i> {currentDifficulty.time ? `${currentDifficulty.time} MS / PULSACIÓN` : 'SIN LÍMITE DE TIEMPO'}</small></div></div><div className="memory-toolbar-actions"><button className="hint-button" onClick={() => { if (hints > 0 && phase === 'input') { setHints((value) => value - 1); setCombo(0); phaseRef.current = 'watch'; setPhase('watch'); setNotice('PISTA ACTIVADA · OBSERVA DE NUEVO'); playTone(980, 0.16, soundOn, 'triangle'); } }} disabled={hints === 0 || phase !== 'input'}><span>?</span> USAR PISTA <b>×{hints}</b></button>{(phase === 'intro' || phase === 'defeat' || phase === 'victory') && <button className="restart-button" onClick={begin}>⟲ REINICIAR</button>}</div></div>
      <div className="memory-footer-strip"><span><Icon name="spark" /> DOS LUCES · UNA RUTA</span><span>PROHIBIDAS CUATRO SEÑALES IGUALES SEGUIDAS</span></div>
    </div>
  );
}
