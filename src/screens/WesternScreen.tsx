import { GameFrame } from '../components/GameFrame';
import { westernDifficulties } from '../data/games';
import { WesternGame } from '../games/western/WesternGame';

interface WesternScreenProps { onBack: () => void; soundOn: boolean }
export function WesternScreen({ onBack, soundOn }: WesternScreenProps) {
  return <GameFrame id="western" eyebrow="RÁFAGA / REFLEJOS" onBack={onBack} dossier={<div className="config-dossier"><span>REACCIÓN DEL ROBOT</span>{westernDifficulties.map((level) => <p key={level.name}><b>{level.name}</b><code>{level.range}</code></p>)}<small>J1 PULSA F · J2 PULSA J O →</small><small>FALSA SALIDA: PIERDES LA RONDA</small></div>}><WesternGame soundOn={soundOn} /></GameFrame>;
}
