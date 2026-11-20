import { useCallback, useState } from 'react';
import { GameFrame } from '../components/GameFrame';
import { memoryDifficulties } from '../data/games';
import { MemoryGame } from '../games/memory/MemoryGame';

type MemoryPhase = 'intro' | 'watch' | 'input' | 'mistake' | 'levelup' | 'victory' | 'defeat';
interface MemoryScreenProps { onBack: () => void; soundOn: boolean }
export function MemoryScreen({ onBack, soundOn }: MemoryScreenProps) {
  const [difficulty, setDifficulty] = useState(0);
  const [phase, setPhase] = useState<MemoryPhase>('intro');
  const updatePhase = useCallback((next: MemoryPhase) => setPhase(next), []);
  const canSelect = phase === 'intro' || phase === 'victory' || phase === 'defeat';
  return <GameFrame id="memory" eyebrow="D-CORE / SECUENCIA GALÁCTICA" onBack={onBack} dossier={<div className="config-dossier memory-config">{memoryDifficulties.map((item) => <div key={item.name}><span>{item.name.toUpperCase()}</span><code>{item.start}→{item.max} · {item.shields} ESC. · {item.hints} PIST.</code><small>{item.on} MS LUZ / {item.gap} MS PAUSA{item.time ? ` / ${item.time} MS` : ' / LIBRE'}</small></div>)}</div>}>
    <div className="memory-difficulty-picker"><span>DIFICULTAD DE LA MISIÓN</span><div>{memoryDifficulties.map((item, index) => <button key={item.name} className={difficulty === index ? 'active' : ''} onClick={() => canSelect && setDifficulty(index)} disabled={!canSelect}><b>{item.name}</b><small>{item.start}→{item.max} señales · {item.shields} escudos</small></button>)}</div></div>
    <MemoryGame soundOn={soundOn} difficulty={difficulty} onPhaseChange={updatePhase} />
  </GameFrame>;
}
