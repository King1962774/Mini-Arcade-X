import { useCallback, useEffect, useRef, useState } from 'react';
import { orbitalModes } from '../../data/games';
import { OrbitalArena, type BattlePhase } from './OrbitalArena';
import { playTone } from '../sfx';

interface OrbitalGameProps { soundOn: boolean }
export function OrbitalGame({ soundOn }: OrbitalGameProps) {
  const [phase, setPhase] = useState<BattlePhase>('menu');
  const [modeIndex, setModeIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [count, setCount] = useState(3);
  const [wins, setWins] = useState<[number, number]>([0, 0]);
  const [roundWinner, setRoundWinner] = useState<0 | 1>(0);
  const phaseRef = useRef<BattlePhase>('menu');
  const winsRef = useRef<[number, number]>([0, 0]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { winsRef.current = wins; }, [wins]);

  const countIn = useCallback((newRound: boolean) => {
    const nextRound = newRound ? round + 1 : 1;
    if (newRound) setRound(nextRound); else {
      setRound(1); setWins([0, 0]); winsRef.current = [0, 0];
    }
    setCount(3);
    phaseRef.current = 'countdown'; setPhase('countdown');
    playTone(560, 0.11, soundOn);
  }, [round, soundOn]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    setCount(3);
    const timers = [window.setTimeout(() => { setCount(2); playTone(700, 0.09, soundOn); }, 730), window.setTimeout(() => { setCount(1); playTone(880, 0.09, soundOn); }, 1460), window.setTimeout(() => { setCount(0); playTone(1320, 0.2, soundOn, 'square'); phaseRef.current = 'playing'; setPhase('playing'); }, 2190)];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase, soundOn]);

  const onRoundEnd = useCallback((winner: 0 | 1) => {
    if (phaseRef.current !== 'playing') return;
    setRoundWinner(winner);
    const next: [number, number] = [...winsRef.current];
    next[winner] += 1;
    winsRef.current = next;
    setWins(next);
    const hasMatch = next[winner] >= 2;
    phaseRef.current = hasMatch ? 'final' : 'roundEnd';
    setPhase(hasMatch ? 'final' : 'roundEnd');
  }, []);

  useEffect(() => {
    const start = () => { countIn(false); };
    const next = () => { if (phaseRef.current === 'roundEnd') countIn(true); };
    const rematch = () => { setWins([0, 0]); winsRef.current = [0, 0]; setRound(1); phaseRef.current = 'menu'; setPhase('menu'); };
    const changeMode = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (phaseRef.current === 'menu' && Number.isInteger(value) && value >= 0 && value < orbitalModes.length) setModeIndex(value);
    };
    document.addEventListener('orbital-start', start);
    document.addEventListener('orbital-next-round', next);
    document.addEventListener('orbital-rematch', rematch);
    document.addEventListener('orbital-change-mode', changeMode);
    return () => {
      document.removeEventListener('orbital-start', start);
      document.removeEventListener('orbital-next-round', next);
      document.removeEventListener('orbital-rematch', rematch);
      document.removeEventListener('orbital-change-mode', changeMode);
    };
  }, [countIn]);

  return (
    <div className="orbital-game-wrap">
      <div className="orbital-match-score"><span><i className="score-dot teal" />P1 <b>{wins[0]}</b></span><small>R{round} · PRIMER PILOTO A DOS RONDAS</small><span><i className="score-dot amber" />P2 <b>{wins[1]}</b></span></div>
      <OrbitalArena phase={phase} modeIndex={modeIndex} soundOn={soundOn} onRoundEnd={onRoundEnd} round={round} roundWinner={roundWinner} count={count} />
      <div className="orbital-mode-selector"><span>CAMPO DE BATALLA</span>{orbitalModes.map((item, index) => <button key={item.name} className={modeIndex === index ? 'mode-selector-button active' : 'mode-selector-button'} onClick={() => { if (phase === 'menu') setModeIndex(index); }} disabled={phase !== 'menu'} style={{ '--mode-color': item.color } as React.CSSProperties}><i />{item.name}</button>)}{phase === 'menu' && <button className="button-primary orbital-launch" onClick={() => countIn(false)}>INICIAR COMBATE <span>↗</span></button>}</div>
    </div>
  );
}
