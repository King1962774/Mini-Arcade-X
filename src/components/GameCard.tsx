import { useState, type KeyboardEvent } from 'react';
import type { GameMeta } from '../data/games';
import { CardArt } from './CardArt';

interface GameCardProps { game: GameMeta; onLaunch: (id: GameMeta['id']) => void; featured?: boolean }

export function GameCard({ game, onLaunch, featured = false }: GameCardProps) {
  const [active, setActive] = useState(false);
  const onKey = (event: KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onLaunch(game.id); } };
  return (
    <article className={`game-card ${game.texture}${featured ? ' featured' : ''}${active ? ' is-active' : ''}`} role="button" tabIndex={0} aria-label={`Jugar ${game.title}`}
      onClick={() => onLaunch(game.id)} onKeyDown={onKey} onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} onFocus={() => setActive(true)} onBlur={() => setActive(false)}>
      <div className="card-art" aria-hidden="true">
        <CardArt id={game.id} active={active} />
        <span className="card-index">{game.number} / 03</span>
        <span className="card-category">{game.category}</span>
      </div>
      <div className="card-copy">
        <div className="card-title-row"><div><p className="eyebrow">{game.subtitle}</p><h3>{game.title}</h3></div><span className="players-pill">{game.players}</span></div>
        <p className="card-summary">{game.descriptor}</p>
        <div className="card-detail-points">{game.details.slice(0, 2).map((item) => <span key={item}><i />{item}</span>)}</div>
        <span className="card-play"><b>JUGAR</b><i>▶</i></span>
      </div>
    </article>
  );
}
