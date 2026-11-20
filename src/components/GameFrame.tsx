import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { GameId } from '../data/games';
import { games, keyGuide, seats } from '../data/games';
import { Icon } from './Icon';

interface GameFrameProps {
  id: GameId;
  eyebrow: string;
  children: ReactNode;
  dossier: ReactNode;
  onBack: () => void;
}

/* ---------- Emblemas pixel de la etiqueta ---------- */
const STAR = ['.....x.....', '.....x.....', '....xxx....', 'xxxxxxxxxxx', '.xxxxxxxxx.', '..xxxxxxx..', '..xxxxxxx..', '.xxxx.xxxx.', '.xxx...xxx.', 'xx.......xx', 'x.........x'];
const SHIP = ['..x......', '..xx.....', 'xxxxxx...', '.xxxxxxxx', 'xxxxxx...', '..xx.....', '..x......'];

function Emblem({ id, colors }: { id: GameId; colors: string[] }) {
  if (id === 'western') {
    return <svg viewBox="0 0 11 11" shapeRendering="crispEdges" className="em-star" aria-hidden="true">{STAR.map((row, y) => [...row].map((c, x) => c === 'x' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={y < 3 || y > 6 ? colors[0] : colors[1]} /> : null))}<rect x="5" y="5" width="1" height="1" fill="#fff3cc" /></svg>;
  }
  if (id === 'memory') {
    const rows = Array.from({ length: 11 }, (_, i) => { const dy = i - 5; const hw = Math.round(Math.sqrt(5.4 * 5.4 - dy * dy)); return <rect key={i} x={5.5 - hw} y={i} width={hw * 2} height="1" fill={dy > 2 ? '#1f5fa8' : dy > -1 ? '#2f7fd0' : '#4aa0e8'} />; });
    return <svg viewBox="0 0 11 11" shapeRendering="crispEdges" className="em-earth" aria-hidden="true">{rows}<rect x="3" y="3" width="3" height="2" fill="#3fa05a" /><rect x="6" y="6" width="3" height="2" fill="#3fa05a" /><rect x="2" y="7" width="2" height="1" fill="#3fa05a" /><rect x="4" y="1" width="2" height="1" fill="#cfeaff" opacity=".8" /></svg>;
  }
  return <svg viewBox="0 0 11 11" shapeRendering="crispEdges" className="em-ship" aria-hidden="true"><g transform="translate(1 2)">{SHIP.map((row, y) => [...row].map((c, x) => c === 'x' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={x > 5 ? '#e6fffb' : x < 2 ? colors[2] : colors[0]} /> : null))}</g></svg>;
}

function Pilot({ lit, dashed, tag }: { lit: boolean; dashed?: boolean; tag: string }) {
  return (
    <span className={`seat${lit ? ' lit' : ''}${dashed ? ' dashed' : ''}`}>
      <svg viewBox="0 0 7 9" shapeRendering="crispEdges" aria-hidden="true"><rect x="2" y="0" width="3" height="3" /><rect x="1" y="3" width="5" height="3" /><rect x="0" y="4" width="1" height="3" /><rect x="6" y="4" width="1" height="3" /><rect x="1" y="6" width="2" height="3" /><rect x="4" y="6" width="2" height="3" /></svg>
      <b>{tag}</b>
    </span>
  );
}

const normalizeKey = (key: string) => ({ ArrowRight: '→', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓' } as Record<string, string>)[key] ?? (key.length === 1 ? key.toUpperCase() : key);

export function GameFrame({ id, eyebrow, children, dossier, onBack }: GameFrameProps) {
  const game = games.find((entry) => entry.id === id)!;
  const guide = keyGuide[id];
  const seat = seats[id];
  const [lit, setLit] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimer = useRef<number>(0);

  // Las teclas del cartucho se iluminan cuando se pulsan de verdad
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key);
      setLit((prev) => ({ ...prev, [key]: Date.now() }));
      window.setTimeout(() => setLit((prev) => { const next = { ...prev }; if (Date.now() - (next[key] ?? 0) >= 150) delete next[key]; return next; }), 170);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(copyTimer.current); };
  }, []);

  const copy = async (hex: string) => {
    try { await navigator.clipboard.writeText(hex); } catch { /* sin permiso: solo feedback visual */ }
    setCopied(hex);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1400);
  };

  const cartStyle = { '--cart': game.palette[0], '--cart-2': game.palette[1], '--cart-3': game.palette[2] } as CSSProperties;

  return (
    <div className={`game-page ${game.texture} page-enter`}>
      <div className="game-breadcrumb">
        <button onClick={onBack}><Icon name="back" /> VOLVER AL HUB</button>
        <span>ARCADE <i>/</i> {game.category} <i>/</i> {game.title.toUpperCase()}</span>
        <span className="game-system-led"><i /> CARTUCHO CARGADO</span>
      </div>
      <div className="game-page-heading">
        <div>
          <p className="eyebrow"><span className="heading-marker">{game.number}</span> {eyebrow}</p>
          <h1>{game.title}<span className="title-period">.</span></h1>
          <p>{game.descriptor}</p>
        </div>
      </div>

      <details className="game-pocket-guide">
        <summary>
          <span className="pocket-guide-copy">
            <small>GUÍA RÁPIDA · {game.category}</small>
            <b>{game.subtitle}</b>
            <em>{game.controls}</em>
          </span>
          <span className="pocket-guide-toggle">INFO <i>+</i></span>
        </summary>
        <div className="game-pocket-body">
          <p>{game.summary}</p>
          <div className="game-pocket-details">
            {game.details.map((detail, index) => <span key={detail}><i>0{index + 1}</i>{detail}</span>)}
          </div>
          <div className="game-pocket-palette" aria-label="Paleta del cartucho">
            {game.palette.map((color) => <i key={color} style={{ background: color }} title={color} />)}
          </div>
          {dossier}
        </div>
      </details>

      <div className="game-layout">
        <section className="play-panel">
          <div className="panel-titlebar">
            <span><i className="live-dot" /> SESSION / {game.number}</span>
            <span>TECLADO + TÁCTIL <i className="titlebar-square" /></span>
          </div>
          {children}
        </section>

        <aside className="dossier-panel cartridge" style={cartStyle} aria-label="Datos del cartucho">
          <div className="cart-shell">
            <div className="cart-body">
              <div className="cart-grip" aria-hidden="true">{Array.from({ length: 7 }, (_, n) => <i key={n} />)}</div>
              <div className="dossier-top"><span><i className="cart-led" /> DATOS DEL CARTUCHO</span><b className="cart-slot">SLOT {game.number}</b></div>

              <div className="cart-label">
                <div className="cart-label-band"><span>FRONTERA DIGITAL</span><span>ESP32 · 8-BIT</span></div>
                <div className="cart-label-main">
                  <div className="cart-emblem"><Emblem id={id} colors={game.palette} /><i className="sp s1" /><i className="sp s2" /><i className="sp s3" /></div>
                  <div className="dossier-title">
                    <p className="eyebrow">{game.category} / {game.number}</p>
                    <h2>{game.subtitle}</h2>
                  </div>
                </div>
                <span className="cart-shine" aria-hidden="true" />
              </div>

              <section className="cart-block">
                <h3 className="cart-tag"><i />JUGADORES</h3>
                <div className="cart-seats">
                  <Pilot lit tag="P1" />
                  <Pilot lit={seat.p2Required} dashed={!seat.p2Required} tag={seat.p2Required ? 'P2' : `P2 / ${seat.p2Alt}`} />
                  <span className="cart-seats-text">{game.players}</span>
                </div>
              </section>

              <p className="dossier-summary">{game.summary}</p>

              <section className="cart-block">
                <h3 className="cart-tag"><i />CARACTERÍSTICAS</h3>
                <ul className="cart-features">
                  {game.details.map((detail, index) => (
                    <li key={detail} style={{ '--i': index } as CSSProperties}>
                      <svg viewBox="0 0 7 6" shapeRendering="crispEdges" aria-hidden="true"><rect x="0" y="3" width="1" height="1" /><rect x="1" y="4" width="1" height="1" /><rect x="2" y="5" width="1" height="1" /><rect x="3" y="4" width="1" height="1" /><rect x="4" y="3" width="1" height="1" /><rect x="5" y="2" width="1" height="1" /><rect x="6" y="0" width="1" height="2" /></svg>
                      <p>{detail}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="cart-block">
                <h3 className="cart-tag"><i />PALETA DEL JUEGO <small aria-live="polite">{copied ? `¡${copied} COPIADO!` : 'TOCA PARA COPIAR'}</small></h3>
                <div className="cart-swatches">
                  {game.palette.map((color) => (
                    <button key={color} className={copied === color ? 'copied' : ''} onClick={() => copy(color)} aria-label={`Copiar color ${color}`}>
                      <i style={{ background: color }} /><span>{color.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="cart-block">
                <h3 className="cart-tag"><i />TECLAS <small>PRUEBA LAS TUYAS</small></h3>
                <div className="cart-keys">
                  {guide.pilots.map((pilot) => (
                    <div className="key-row" key={pilot.who}>
                      <b className="key-who">{pilot.who}</b>
                      <div className="key-groups">
                        {pilot.groups.map((group) => (
                          <div className="key-group" key={group.label}>
                            <span>{group.label}</span>
                            <div>{group.keys.map((k) => <kbd key={k} className={lit[k] ? 'lit' : ''}>{k}</kbd>)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {guide.note && <p className="key-note"><Icon name="controller" />{guide.note}</p>}
                </div>
              </section>

              {dossier}
              <button className="dossier-exit" onClick={onBack}><span className="eject" aria-hidden="true" /> SALIR AL HUB</button>
            </div>
          </div>
          <div className="cart-pins" aria-hidden="true">{Array.from({ length: 18 }, (_, n) => <i key={n} style={{ '--n': n } as CSSProperties} />)}</div>
        </aside>
      </div>
      <div className="game-footer">
        <span><i>·</i> FIRMWARE ORIGINAL · WEB EDITION</span>
        <span>{game.id === 'western' ? 'EL TIEMPO DE ESPERA ES ALEATORIO' : game.id === 'memory' ? 'LAS SEÑALES CRECEN CADA NIVEL' : 'AL MEJOR DE TRES RONDAS'}</span>
      </div>
    </div>
  );
}
