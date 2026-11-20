import { GameFrame } from '../components/GameFrame';
import { orbitalModes } from '../data/games';
import { OrbitalGame } from '../games/orbital/OrbitalGame';

interface OrbitalScreenProps { onBack: () => void; soundOn: boolean }
export function OrbitalScreen({ onBack, soundOn }: OrbitalScreenProps) {
  return <GameFrame id="orbital" eyebrow="P1 + P2 / COMBATE DE NAVES" onBack={onBack} dossier={<div className="config-dossier orbital-config">{orbitalModes.map((item) => <div key={item.name}><span>{item.name.toUpperCase()}</span><code>{item.subtitle}</code><small>{item.suddenDeath} S / VELOCIDAD {item.speed}</small></div>)}<small>AL MEJOR DE TRES · PRIMER PILOTO A 2</small></div>}><OrbitalGame soundOn={soundOn} /></GameFrame>;
}
