import { useMemo, useState } from 'react';
import { games, type Category, type GameId } from '../data/games';
import { GameCard } from '../components/GameCard';
import { Icon } from '../components/Icon';
import { HeroConsole, HeroSky } from '../components/HeroStage';

interface HubScreenProps { onLaunch: (id: GameId) => void; onSystem: () => void; soundOn?: boolean }
const filters: Array<'TODOS' | Category> = ['TODOS', 'WESTERN', 'ARCADE'];

export function HubScreen({ onLaunch, onSystem, soundOn = true }: HubScreenProps) {
  const [coins, setCoins] = useState(0);
  const [filter, setFilter] = useState<'TODOS' | Category>('TODOS');
  const visibleGames = useMemo(() => filter === 'TODOS' ? games : games.filter((game) => game.category === filter), [filter]);
  return (
    <div className="hub-page page-enter">
      <section className="hero-band">
        <HeroSky soundOn={soundOn} onCoin={() => setCoins((n) => n + 1)} />
        <div className="hero-copy">
          <div className="eyebrow-row"><span className="eyebrow">ARCADE DE BOLSILLO · WEB EDITION</span><span className="tiny-divider" /><span className="mono-note">ESP32 / 2026</span></div>
          <h1 className="hero-title"><span className="ht-line l1">Un universo.</span><br /><em className="ht-line l2" data-text="Tres formas">Tres formas</em><br /><span className="ht-line l3">de jugar.<i className="ht-cursor" aria-hidden="true" /></span></h1>
          <p className="hero-description">La consola ahora vive en tu navegador. Recorre el desierto, sigue una señal entre estrellas y decide quién domina la órbita.</p>
          <div className="hero-actions"><a className="button-primary" href="#juegos">EXPLORAR JUEGOS <Icon name="arrow" /></a><button className="button-quiet" onClick={onSystem}>CONOCER EL HARDWARE <Icon name="monitor" /></button></div>
          <div className="hero-index"><span><b className="count-up">03</b> JUEGOS ACTIVOS</span><span><b className="count-up">02</b> MODOS LOCAL VS</span><span><b>{String(coins).padStart(2, '0')}</b> MONEDAS</span></div>
        </div>
        <div className="hero-machine" aria-label="Ilustración de la consola arcade ESP32">
          <div className="machine-glow" /><div className="machine-orbit machine-orbit-one" /><div className="machine-orbit machine-orbit-two" />
          <HeroConsole onLaunch={onLaunch} soundOn={soundOn} coins={coins} />
          <div className="machine-caption"></div>
        </div>
      </section>

      <section className="catalog-section" id="juegos">
        <div className="section-topline"><span>CATÁLOGO DE CARTUCHOS</span><span className="section-line" /><span className="mono-note">03 ARCHIVOS · 03 EXPERIENCIAS</span></div>
        <div className="section-heading-row"><div><p className="eyebrow">SELECCIONA TU SIGUIENTE PARTIDA</p><h2>Elige una <em>frontera.</em></h2></div><div className="filter-pills" aria-label="Filtrar juegos">{filters.map((item) => <button className={filter === item ? 'filter-pill selected' : 'filter-pill'} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
        <div className="game-grid">{visibleGames.map((game, index) => <GameCard key={game.id} game={game} onLaunch={onLaunch} featured={index === 0 && filter === 'TODOS'} />)}</div>
      </section>

      <section className="lower-band">
        <div className="manifest-card"><div className="manifest-stamp"><Icon name="star" /><span>BUILT<br />ON ESP32</span></div><div><p className="eyebrow">NO ES SOLO UNA PÁGINA DE JUEGOS</p><h2>Un archivo visual<br />del <em>firmware real.</em></h2><p>Las pantallas, modos, controles y paletas nacen del proyecto original. Las partidas de esta web son autónomas; no requieren conectar la consola.</p><button className="text-action" onClick={onSystem}>VER EL DOSSIER TÉCNICO <Icon name="arrow" /></button></div></div>
        <div className="signal-card"><div className="signal-top"><span>SEÑAL DEL SISTEMA</span><span className="signal-dots"><i /><i /><i /></span></div><div className="signal-wave" /><h3>El desierto está activo.</h3><p>Tres cartuchos cargados<br />y listos para el siguiente piloto.</p><span className="signal-coordinate">GPIO 25 <i /> GPIO 26 <i /> GPIO 27</span></div>
      </section>
      <footer className="page-footer"><span>FRONTERA DIGITAL <i>·</i> ARCHIVO ARCADE</span><span>UNA CARTUCHO. MUCHAS FRONTERAS.</span><button onClick={onSystem}>DOSSIER DEL PROYECTO ↗</button></footer>
    </div>
  );
}
