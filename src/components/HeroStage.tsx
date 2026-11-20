import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { games, type GameId } from '../data/games';
import { playTone } from '../games/sfx';

/* ------------------------------------------------------------------ */
/*  Carita pixel: parpadea, sigue el cursor y reacciona a la consola   */
/* ------------------------------------------------------------------ */
type Mood = 'idle' | 'happy' | 'wow' | 'sleep';

const FACE = [
  '...hhhhhhhh...',
  '..hhhhhhhhhh..',
  'hhhhhhhhhhhhhh',
  '..ssssssssss..',
  '.sssssssssssss',
  '.sssssssssssss',
  '.sssssssssssss',
  '.sssssssssssss',
  '.sscsssssscsss',
  '..ssssssssss..',
  '...dd....dd...',
];

function PixelFace({ mood, look }: { mood: Mood; look: { x: number; y: number } }) {
  const eyeY = 4;
  const mouth =
    mood === 'happy' ? [[5, 8], [6, 9], [7, 9], [8, 8]] :
    mood === 'wow' ? [[6, 8], [7, 8], [6, 9], [7, 9]] :
    mood === 'sleep' ? [[6, 8], [7, 8]] :
    [[5, 8], [6, 8], [7, 8], [8, 8]];
  const closed = mood === 'sleep' || mood === 'happy';
  return (
    <svg className={`hc-face mood-${mood}`} viewBox="0 0 14 12" shapeRendering="crispEdges" aria-hidden="true">
      {FACE.map((row, y) => [...row].map((ch, x) => ch === '.' ? null :
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={ch === 'h' ? '#ffb838' : ch === 'd' ? '#a85a14' : ch === 'c' ? '#ff6b91' : '#ffe9c2'} />))}
      <rect x="0" y="2" width="14" height="1" fill="#a85a14" />
      <rect x="6" y="0" width="2" height="1" fill="#fff3cc" />
      <g className="hc-eyes" style={{ transform: `translate(${look.x}px, ${look.y}px)` }}>
        {closed ? (
          <>
            <rect x="3" y={eyeY + 1} width="3" height="1" fill="#0c1528" /><rect x="8" y={eyeY + 1} width="3" height="1" fill="#0c1528" />
          </>
        ) : (
          <>
            <g className="hc-blink"><rect x="3" y={eyeY} width="2" height="2" fill="#0c1528" /><rect x="9" y={eyeY} width="2" height="2" fill="#0c1528" /></g>
            <rect x="3" y={eyeY} width="1" height="1" fill="#fff" /><rect x="9" y={eyeY} width="1" height="1" fill="#fff" />
          </>
        )}
      </g>
      {mouth.map(([x, y]) => <rect key={`m${x}${y}`} x={x} y={y} width="1" height="1" fill="#7a2a1a" />)}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini-escenas de cada cartucho en la pantalla                       */
/* ------------------------------------------------------------------ */
function MiniScene({ id }: { id: GameId }) {
  if (id === 'western') {
    return (
      <svg className="hc-scene" viewBox="0 0 96 40" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="96" height="40" fill="#3a1c3e" /><rect y="14" width="96" height="10" fill="#7a3a46" /><rect y="24" width="96" height="16" fill="#c27a3a" />
        <rect className="hc-sun" x="40" y="8" width="16" height="16" fill="#ffd36b" />
        <rect x="6" y="14" width="14" height="10" fill="#5a2a40" /><rect x="70" y="16" width="20" height="8" fill="#5a2a40" />
        <g className="hc-duelist a"><rect x="14" y="20" width="6" height="12" fill="#2a1a2e" /><rect x="13" y="17" width="8" height="2" fill="#ffb838" /><rect x="15" y="19" width="4" height="3" fill="#ffe9c2" /></g>
        <g className="hc-duelist b"><rect x="76" y="20" width="6" height="12" fill="#2a1a2e" /><rect x="75" y="17" width="8" height="2" fill="#ee4ea0" /><rect x="77" y="19" width="4" height="3" fill="#ffe9c2" /></g>
        <rect className="hc-shot" x="22" y="25" width="5" height="2" fill="#fff3cc" />
        <g fill="#2f7a4a"><rect x="40" y="26" width="3" height="9" /><rect x="37" y="28" width="3" height="2" /><rect x="43" y="29" width="3" height="2" /></g>
        <rect className="hc-tumble" x="0" y="33" width="4" height="4" fill="#8a5a2a" />
      </svg>
    );
  }
  if (id === 'memory') {
    const pads = ['#46e6d2', '#ee4ea0', '#ffb838', '#9d8cff'];
    return (
      <svg className="hc-scene" viewBox="0 0 96 40" shapeRendering="crispEdges" aria-hidden="true">
        <rect width="96" height="40" fill="#0a0e2c" />
        <g fill="#fff3d6"><rect x="6" y="5" width="1" height="1" /><rect x="30" y="9" width="1" height="1" /><rect x="84" y="6" width="1" height="1" /><rect x="60" y="3" width="1" height="1" /></g>
        <rect x="42" y="6" width="12" height="12" fill="#2f7fd0" /><rect x="40" y="8" width="16" height="8" fill="#2f7fd0" /><rect x="44" y="9" width="4" height="3" fill="#3fa05a" /><rect x="50" y="12" width="3" height="3" fill="#3fa05a" />
        {pads.map((c, i) => <rect key={c} className={`hc-pad p${i}`} x={8 + i * 21} y="24" width="16" height="11" fill={c} />)}
      </svg>
    );
  }
  return (
    <svg className="hc-scene" viewBox="0 0 96 40" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="96" height="40" fill="#0a0820" />
      <g fill="#fff3d6"><rect x="10" y="6" width="1" height="1" /><rect x="52" y="30" width="1" height="1" /><rect x="76" y="10" width="1" height="1" /></g>
      <rect x="70" y="4" width="14" height="14" fill="#8a62d0" /><rect x="68" y="6" width="18" height="10" fill="#8a62d0" /><rect x="70" y="10" width="14" height="2" fill="#d7c5ff" />
      <rect className="hc-rock" x="44" y="14" width="6" height="6" fill="#6b7490" />
      <g className="hc-ship l"><rect x="6" y="17" width="10" height="6" fill="#46e6d2" /><rect x="4" y="15" width="4" height="2" fill="#14807e" /><rect x="4" y="23" width="4" height="2" fill="#14807e" /><rect x="14" y="19" width="4" height="2" fill="#e6fffb" /></g>
      <g className="hc-ship r"><rect x="80" y="23" width="10" height="6" fill="#ffb838" /><rect x="88" y="21" width="4" height="2" fill="#a85a14" /><rect x="88" y="29" width="4" height="2" fill="#a85a14" /><rect x="78" y="25" width="4" height="2" fill="#fff3cc" /></g>
      <rect className="hc-bolt b1" x="20" y="19" width="6" height="2" fill="#46e6d2" /><rect className="hc-bolt b2" x="70" y="25" width="6" height="2" fill="#ffb838" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Consola                                                            */
/* ------------------------------------------------------------------ */
type Screen = 'title' | 'menu';
type PressKey = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start';

interface HeroConsoleProps { onLaunch: (id: GameId) => void; soundOn: boolean; coins: number }

export function HeroConsole({ onLaunch, soundOn, coins }: HeroConsoleProps) {
  const [screen, setScreen] = useState<Screen>('title');
  const [index, setIndex] = useState(0);
  const [mood, setMood] = useState<Mood>('idle');
  const [pressed, setPressed] = useState<PressKey | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [launching, setLaunching] = useState(false);
  const [bounce, setBounce] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number>(0);
  const moodTimer = useRef<number>(0);
  const pressTimer = useRef<number>(0);
  const game = games[index];

  const wake = useCallback((next: Mood = 'idle', hold = 900) => {
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(moodTimer.current);
    setMood(next);
    if (next !== 'idle') moodTimer.current = window.setTimeout(() => setMood('idle'), hold);
    idleTimer.current = window.setTimeout(() => setMood('sleep'), 14000);
  }, []);

  useEffect(() => {
    idleTimer.current = window.setTimeout(() => setMood('sleep'), 14000);
    return () => { window.clearTimeout(idleTimer.current); window.clearTimeout(moodTimer.current); window.clearTimeout(pressTimer.current); };
  }, []);

  // Moneda recogida: la carita celebra
  const lastCoins = useRef(coins);
  useEffect(() => {
    if (coins > lastCoins.current) { wake('happy', 1100); setBounce((n) => n + 1); }
    lastCoins.current = coins;
  }, [coins, wake]);

  // Los ojos siguen el cursor por toda la ventana
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const el = rootRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height * 0.35;
      const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / 260));
      const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / 260));
      setLook({ x: Math.round(dx), y: Math.round(dy * 0.6) });
      setTilt({ x: Math.round(dx * 6), y: Math.round(dy * -4) });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const flash = (key: PressKey) => {
    setPressed(key);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 140);
  };

  const press = useCallback((key: PressKey) => {
    flash(key);
    if (key === 'left' || key === 'right') {
      if (screen === 'title') { setScreen('menu'); playTone(660, 0.07, soundOn, 'square'); wake('wow', 600); return; }
      setIndex((i) => (i + (key === 'right' ? 1 : games.length - 1)) % games.length);
      playTone(key === 'right' ? 523 : 440, 0.06, soundOn, 'square'); wake('wow', 500);
    } else if (key === 'up') {
      setBounce((n) => n + 1); playTone(880, 0.05, soundOn, 'square'); wake('happy', 700);
    } else if (key === 'down') {
      playTone(220, 0.07, soundOn, 'square'); wake('wow', 500);
    } else if (key === 'start') {
      setScreen((s) => (s === 'title' ? 'menu' : 'title'));
      playTone(784, 0.09, soundOn, 'square'); wake('happy', 800);
    } else if (key === 'b') {
      setScreen('title'); playTone(330, 0.08, soundOn, 'triangle'); wake('wow', 500);
    } else if (key === 'a') {
      if (screen === 'title') { setScreen('menu'); playTone(784, 0.08, soundOn, 'square'); wake('happy', 700); return; }
      if (launching) return;
      setLaunching(true); wake('happy', 1200);
      [523, 659, 784, 1046].forEach((f, n) => window.setTimeout(() => playTone(f, 0.08, soundOn, 'square'), n * 70));
      window.setTimeout(() => { setLaunching(false); onLaunch(game.id); }, 720);
    }
  }, [screen, soundOn, wake, launching, game.id, onLaunch]);

  const onKeyDown = (event: KeyboardEvent) => {
    const map: Record<string, PressKey> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Enter: 'a', ' ': 'start', Escape: 'b', Backspace: 'b' };
    const key = map[event.key];
    if (!key) return;
    event.preventDefault(); press(key);
  };

  const hold = (key: PressKey) => ({
    onPointerDown: (e: ReactPointerEvent) => { e.preventDefault(); press(key); },
    onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); press(key); } },
  });

  const cartStyle = { '--cart': game.palette[0], '--cart-2': game.palette[1] } as CSSProperties;

  return (
    <div className={`hc-wrap${launching ? ' is-launching' : ''}`} ref={rootRef} style={{ ...cartStyle, '--tx': `${tilt.x}deg`, '--ty': `${tilt.y}deg` } as CSSProperties}>
      {/* Cartucho que sobresale por arriba y cambia al elegir juego */}
      <div className="hc-cart-slot" aria-hidden="true">
        <div className="hc-cart" key={game.id}><span>{game.number}</span><i /><b>{game.title.split(' ')[0].toUpperCase()}</b></div>
      </div>
      <div className="hc-body" role="group" aria-label="Consola arcade interactiva. Usa las flechas y Enter" tabIndex={0} onKeyDown={onKeyDown}>
        <i className="hc-screw s1" /><i className="hc-screw s2" /><i className="hc-screw s3" /><i className="hc-screw s4" />
        <div className="hc-bezel">
          <div className="hc-led-row"><span className="hc-power"><i />PWR</span><span className="hc-brand">FRONTERA·DIGITAL</span><span className="hc-coins" aria-label={`${coins} monedas`}>◆ {String(coins).padStart(2, '0')}</span></div>
          <div className={`hc-screen scr-${screen}`}>
            <div className="hc-sky"><i /><i /><i /></div>
            <div className="hc-topbar"><span>CONSOLA ARCADE</span><span>V.01</span></div>

            {screen === 'title' ? (
              <div className="hc-title" key="title">
                <div className="hc-face-box" key={bounce} data-hop={bounce > 0 ? 'y' : 'n'}><PixelFace mood={mood} look={look} /></div>
                <div className="hc-logo" aria-label="Arcade ready">{'ARCADE'.split('').map((ch, i) => <b key={i} style={{ '--i': i } as CSSProperties}>{ch}</b>)}<em>READY<u>_</u></em></div>
                <button className="hc-press" onClick={() => press('start')}>▶ PULSA START ◀</button>
                {mood === 'sleep' && <span className="hc-zzz" aria-hidden="true">z<i>z</i><i>Z</i></span>}
              </div>
            ) : (
              <div className="hc-menu" key="menu">
                <div className="hc-carts" role="listbox" aria-label="Cartuchos">
                  {games.map((g, i) => (
                    <button key={g.id} role="option" aria-selected={i === index} className={`hc-tile${i === index ? ' on' : ''}`} style={{ '--c': g.palette[0] } as CSSProperties}
                      onClick={() => { setIndex(i); playTone(523, 0.06, soundOn, 'square'); wake('wow', 500); }}>
                      <span>{g.number}</span><i />
                    </button>
                  ))}
                  <div className="hc-face-mini" key={bounce}><PixelFace mood={mood} look={look} /></div>
                </div>
                <div className="hc-preview" key={game.id}><MiniScene id={game.id} /></div>
                <div className="hc-info"><b>{game.title}</b><span>{game.players}</span></div>
                <div className="hc-hint"><span>◀ ▶ ELEGIR</span><span className="hc-blink-text">A · JUGAR</span><span>B · VOLVER</span></div>
              </div>
            )}
            {launching && <div className="hc-launch" aria-hidden="true">{Array.from({ length: 6 }, (_, n) => <i key={n} style={{ '--n': n } as CSSProperties} />)}<b>CARGANDO…</b></div>}
            <div className="hc-scan" />
          </div>
        </div>

        <div className="hc-controls">
          <div className="hc-dpad" role="group" aria-label="Cruceta">
            {(['up', 'left', 'right', 'down'] as const).map((d) => (
              <button key={d} className={`dp-${d}${pressed === d ? ' down' : ''}`} aria-label={{ up: 'Arriba', down: 'Abajo', left: 'Izquierda', right: 'Derecha' }[d]} {...hold(d)} />
            ))}
            <span className="dp-core" />
          </div>
          <div className="hc-mid">
            <button className={`hc-pill${pressed === 'b' ? ' down' : ''}`} aria-label="Volver (B)" {...hold('b')}><span>SELECT</span></button>
            <button className={`hc-pill${pressed === 'start' ? ' down' : ''}`} aria-label="Start" {...hold('start')}><span>START</span></button>
            <div className="hc-speaker" aria-hidden="true"><i /><i /><i /><i /></div>
          </div>
          <div className="hc-ab">
            <button className={`hc-btn b${pressed === 'b' ? ' down' : ''}`} aria-label="Botón B, volver" {...hold('b')}><span>B</span></button>
            <button className={`hc-btn a${pressed === 'a' ? ' down' : ''}`} aria-label="Botón A, jugar" {...hold('a')}><span>A</span></button>
          </div>
        </div>
      </div>
      <p className="hc-help" aria-hidden="true">TOCA LA CONSOLA O USA EL TECLADO</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cielo de la portada: estrellas en capas, estrella fugaz, monedas,  */
/*  nave y un suelo que se desplaza con cactus y rodadora              */
/* ------------------------------------------------------------------ */
const COIN_SLOTS = [
  { left: '46%', top: '9%', d: 0 }, { left: '48%', top: '70%', d: 1.1 }, { left: '93%', top: '8%', d: 2.2 },
];

function Coin({ onCollect, slot }: { onCollect: () => void; slot: typeof COIN_SLOTS[number] }) {
  const [taken, setTaken] = useState(false);
  useEffect(() => {
    if (!taken) return;
    const t = window.setTimeout(() => setTaken(false), 5000);
    return () => window.clearTimeout(t);
  }, [taken]);
  return (
    <button className={`hs-coin${taken ? ' taken' : ''}`} style={{ left: slot.left, top: slot.top, animationDelay: `${slot.d}s` } as CSSProperties}
      aria-label="Recoger moneda" tabIndex={taken ? -1 : 0}
      onClick={() => { if (taken) return; setTaken(true); onCollect(); }}>
      <svg viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true"><rect x="2" y="0" width="4" height="8" fill="#ffc75e" /><rect x="0" y="2" width="8" height="4" fill="#ffc75e" /><rect x="3" y="2" width="2" height="4" fill="#a85a14" /><rect x="1" y="2" width="1" height="1" fill="#fff3cc" /></svg>
      {taken && <b className="hs-plus" aria-hidden="true">+1</b>}
    </button>
  );
}

export function HeroSky({ onCoin, soundOn }: { onCoin: () => void; soundOn: boolean }) {
  const collect = () => {
    playTone(988, 0.06, soundOn, 'square');
    window.setTimeout(() => playTone(1318, 0.12, soundOn, 'square'), 70);
    onCoin();
  };
  return (
    <div className="hs-sky" aria-hidden="false">
      <div className="hs-layer l1" aria-hidden="true" /><div className="hs-layer l2" aria-hidden="true" /><div className="hs-layer l3" aria-hidden="true" />
      <i className="hs-meteor m1" aria-hidden="true" /><i className="hs-meteor m2" aria-hidden="true" />
      <svg className="hs-ship" viewBox="0 0 21 15" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="0" y="0" width="3" height="3" fill="#14807e" /><rect x="0" y="12" width="3" height="3" fill="#14807e" />
        <rect x="3" y="3" width="6" height="9" fill="#46e6d2" /><rect x="9" y="6" width="9" height="3" fill="#e6fffb" /><rect x="9" y="3" width="3" height="3" fill="#46e6d2" /><rect x="9" y="9" width="3" height="3" fill="#46e6d2" />
        <rect className="hs-flame" x="-4" y="6" width="4" height="3" fill="#ffb838" />
      </svg>
      <i className="hs-bolt" aria-hidden="true" />
      {COIN_SLOTS.map((slot, i) => <Coin key={i} slot={slot} onCollect={collect} />)}
      <div className="hs-ground" aria-hidden="true">
        <div className="hs-dunes" />
        <svg className="hs-cactus c1" viewBox="0 0 9 14" shapeRendering="crispEdges"><rect x="3" y="0" width="3" height="14" fill="#2f7a4a" /><rect x="0" y="4" width="3" height="2" fill="#2f7a4a" /><rect x="0" y="2" width="2" height="3" fill="#2f7a4a" /><rect x="6" y="6" width="3" height="2" fill="#2f7a4a" /><rect x="7" y="4" width="2" height="3" fill="#2f7a4a" /><rect x="4" y="1" width="1" height="12" fill="#4fbf74" /></svg>
        <svg className="hs-cactus c2" viewBox="0 0 9 14" shapeRendering="crispEdges"><rect x="3" y="0" width="3" height="14" fill="#2f7a4a" /><rect x="0" y="5" width="3" height="2" fill="#2f7a4a" /><rect x="0" y="3" width="2" height="3" fill="#2f7a4a" /><rect x="4" y="1" width="1" height="12" fill="#4fbf74" /></svg>
        <svg className="hs-weed" viewBox="0 0 8 8" shapeRendering="crispEdges"><rect x="2" y="0" width="4" height="1" fill="#b57a3a" /><rect x="0" y="2" width="8" height="1" fill="#b57a3a" /><rect x="1" y="4" width="6" height="1" fill="#8a5a2a" /><rect x="3" y="1" width="1" height="6" fill="#8a5a2a" /><rect x="2" y="7" width="4" height="1" fill="#b57a3a" /></svg>
        <div className="hs-track" />
      </div>
    </div>
  );
}
