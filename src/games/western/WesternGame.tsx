import { useCallback, useEffect, useRef, useState } from 'react';
import { westernDifficulties } from '../../data/games';
import { Icon } from '../../components/Icon';
import { playTone } from '../sfx';
import { WesternScene } from './WesternScene';

type Phase = 'setup' | 'waiting' | 'go' | 'roundResult' | 'matchResult';
type Mode = 'duel' | 'robot';

interface WesternGameProps { soundOn: boolean }
interface RoundResult { winner: number; reaction: number | null; falseStart: boolean }

export function WesternGame({ soundOn }: WesternGameProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<Mode>('robot');
  const [difficulty, setDifficulty] = useState(1);
  const [target, setTarget] = useState(1);
  const [wins, setWins] = useState<[number, number]>([0, 0]);
  const [round, setRound] = useState(0);
  const [last, setLast] = useState<RoundResult | null>(null);
  const [message, setMessage] = useState('Elige a tu rival.');
  const phaseRef = useRef<Phase>('setup');
  const modeRef = useRef<Mode>('robot');
  const difficultyRef = useRef(difficulty);
  const targetRef = useRef(target);
  const winsRef = useRef<[number, number]>([0, 0]);
  const signalAt = useRef(0);
  const settled = useRef(false);
  const timer = useRef<number | null>(null);
  const resolver = useRef<(player: number) => void>(() => undefined);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { targetRef.current = target; }, [target]);
  useEffect(() => { winsRef.current = wins; }, [wins]);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const settle = useCallback((winner: number, falseStart = false) => {
    if (settled.current) return;
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'waiting' && currentPhase !== 'go') return;
    settled.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    const reaction = currentPhase === 'go' && winner === 1 ? Math.max(1, Math.round(performance.now() - signalAt.current)) : null;
    const next: [number, number] = [...winsRef.current];
    next[winner - 1] += 1;
    winsRef.current = next;
    setWins(next);
    setLast({ winner, reaction, falseStart });
    const matchWon = next[winner - 1] >= targetRef.current;
    const playerName = modeRef.current === 'robot' && winner === 2 ? 'EL ROBOT' : `P${winner}`;
    setMessage(falseStart ? `SALIDA EN FALSO · ${playerName} GANA LA RONDA` : `${playerName} GANA LA RONDA`);
    phaseRef.current = matchWon ? 'matchResult' : 'roundResult';
    setPhase(matchWon ? 'matchResult' : 'roundResult');
    playTone(winner === 1 ? 790 : 350, falseStart ? 0.23 : 0.15, soundOn, falseStart ? 'sawtooth' : 'triangle');
  }, [soundOn]);
  useEffect(() => { resolver.current = (player) => {
    const currentPhase = phaseRef.current;
    if (modeRef.current === 'robot' && player === 2) return;
    if (currentPhase === 'waiting') settle(player === 1 ? 2 : 1, true);
    else if (currentPhase === 'go') settle(player);
  }; }, [settle]);

  const startRound = useCallback((newMatch = false) => {
    if (timer.current) window.clearTimeout(timer.current);
    const baseWins: [number, number] = newMatch ? [0, 0] : winsRef.current;
    winsRef.current = baseWins;
    setWins(baseWins);
    setRound((value) => newMatch ? 1 : value + 1);
    setLast(null);
    setMessage('ESPERA LA SEÑAL…');
    settled.current = false;
    phaseRef.current = 'waiting';
    setPhase('waiting');
    playTone(490, 0.12, soundOn);
    const pause = 3000 + Math.random() * 5000;
    timer.current = window.setTimeout(() => {
      if (settled.current) return;
      signalAt.current = performance.now();
      phaseRef.current = 'go';
      setPhase('go');
      setMessage('¡FUEGO!');
      playTone(1150, 0.2, soundOn, 'square');
      if (modeRef.current === 'robot') {
        const range = westernDifficulties[difficultyRef.current];
        const botDelay = range.min + Math.random() * (range.max - range.min);
        timer.current = window.setTimeout(() => settle(2), botDelay);
      }
    }, pause);
  }, [settle, soundOn]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ([' ', 'ArrowRight'].includes(event.key)) event.preventDefault();
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (['f', ' '].includes(key)) resolver.current(1);
      else if (['j', 'arrowright'].includes(key)) resolver.current(2);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const returnToSetup = () => {
    if (timer.current) window.clearTimeout(timer.current);
    winsRef.current = [0, 0];
    setWins([0, 0]);
    phaseRef.current = 'setup';
    setPhase('setup');
  };

  return (
    <div className={`western-console western-phase-${phase}`}>
      <div className="western-stage">
        <WesternScene phase={phase} winner={last?.winner ?? 0} falseStart={!!last?.falseStart} />
        <div className="western-hud"><span><b>JUGADOR 1</b><small>{mode === 'robot' ? 'PISTOLERO' : 'P1 · IZQUIERDA'}</small></span><span className="western-hud-score">{wins[0]} <i>—</i> {wins[1]}<small>MEJOR DE {target * 2 - 1} {target === 1 ? 'RONDA' : 'RONDAS'}</small></span><span><b>{mode === 'robot' ? 'ROBOT' : 'JUGADOR 2'}</b><small>{mode === 'robot' ? westernDifficulties[difficulty].name.toUpperCase() : 'P2 · DERECHA'}</small></span></div>
        {phase === 'setup' && <div className="western-setup-overlay"><div className="western-setup-card"><div className="western-star"><Icon name="star" /></div><p className="eyebrow">CÓDIGO 01 / MODO DE JUEGO</p><h2>Escoge a tu rival.</h2><div className="mode-choice-row"><button className={mode === 'duel' ? 'mode-choice selected' : 'mode-choice'} onClick={() => { setMode('duel'); playTone(560, 0.06, soundOn); }}><span>02</span><b>Dos jugadores</b><small>DUELO LOCAL</small></button><button className={mode === 'robot' ? 'mode-choice selected' : 'mode-choice'} onClick={() => { setMode('robot'); playTone(660, 0.06, soundOn); }}><span>AI</span><b>P1 vs robot</b><small>PRÁCTICA: PISTOLERO</small></button></div>
            {mode === 'robot' && <div className="difficulty-choice"><span className="eyebrow">DIFICULTAD DEL ROBOT</span><div>{westernDifficulties.map((item, index) => <button className={difficulty === index ? 'difficulty-chip selected' : 'difficulty-chip'} key={item.name} onClick={() => setDifficulty(index)}><b>{item.name}</b><small>{item.range}</small></button>)}</div><p>{westernDifficulties[difficulty].blurb}</p></div>}
            <div className="target-choice"><span className="eyebrow">VICTORIAS PARA GANAR</span><div>{[1, 2, 3, 4, 5].map((item) => <button key={item} onClick={() => setTarget(item)} className={target === item ? 'target-button selected' : 'target-button'}>{item}</button>)}</div><small>MEJOR DE {target * 2 - 1} {target === 1 ? 'RONDA' : 'RONDAS'}</small></div>
            <button className="button-primary western-launch" onClick={() => startRound(true)}>ENTRAR AL DESIERTO <Icon name="arrow" /></button></div></div>}
        {phase === 'waiting' && <div className="western-signal-overlay"><div className="wait-seal"><span>ESPERA</span><i /><i /><i /></div><p>NO DISPARES ANTES DE TIEMPO</p><small>LA SEÑAL PUEDE LLEGAR EN CUALQUIER MOMENTO</small></div>}
        {phase === 'go' && <div className="western-go-overlay"><div>¡FUEGO<span>!</span></div><p>AHORA · AHORA · AHORA</p></div>}
        {(phase === 'roundResult' || phase === 'matchResult') && <div className="western-result-overlay"><div className="result-star"><Icon name="star" /></div><p className="eyebrow">{phase === 'matchResult' ? 'PARTIDA TERMINADA' : `RONDA ${round} / META ${target}`}</p><h2>{message}</h2>{last?.reaction && <strong className="reaction-time">{last.reaction}<small>MS DE REACCIÓN</small></strong>}{last?.falseStart && <p className="false-start-note">El disparo se adelantó a la señal.</p>}<button className="button-primary" onClick={() => phase === 'matchResult' ? startRound(true) : startRound()}>{phase === 'matchResult' ? 'REVANCHA' : 'SIGUIENTE RONDA'} <Icon name="arrow" /></button><button className="result-link" onClick={returnToSetup}>CAMBIAR AJUSTES</button></div>}
        <div className="western-view-grain" />
      </div>
      <div className="western-controls"><div className="western-instruction"><span className="instruction-light" /><div><b>{phase === 'setup' ? 'DUELO LISTO' : phase === 'waiting' ? 'PACIENCIA, PISTOLERO' : phase === 'go' ? '¡DIBUJA!' : 'RONDA CONCLUIDA'}</b><small>{phase === 'setup' ? 'CONFIGURA LA PARTIDA Y ENTRA AL SALOON' : 'PRESIONA EN TU LADO CUANDO APAREZCA ¡FUEGO!'}</small></div></div><div className="duel-buttons"><button className="duel-fire p1" onClick={() => resolver.current(1)} disabled={phase === 'setup' || phase === 'roundResult' || phase === 'matchResult'}><span className="keycap">F</span><span><b>P1 · DIBUJA</b><small>JUGADOR IZQUIERDO</small></span><i>✦</i></button>{mode === 'duel' ? <button className="duel-fire p2" onClick={() => resolver.current(2)} disabled={phase === 'setup' || phase === 'roundResult' || phase === 'matchResult'}><span className="keycap">J</span><span><b>P2 · DIBUJA</b><small>JUGADOR DERECHO</small></span><i>✦</i></button> : <div className="bot-status"><span className="bot-eye">◎</span><span><b>PISTOLERO IA</b><small>ALERTA · {phase === 'go' ? 'LISTO' : 'CARGANDO'}</small></span></div>}</div></div>
      <div className="western-footer-strip"><span><Icon name="crosshair" /> TOCA O PULSA F / J</span><span>CONTROL DE SALIDA EN FALSO ACTIVADO</span></div>
    </div>
  );
}
