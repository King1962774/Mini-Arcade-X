import { useMemo } from 'react';
import { WesternScene } from '../games/western/WesternScene';

const stars: Array<[number, number]> = [[8, 6], [30, 14], [52, 5], [74, 18], [96, 8], [118, 16], [140, 6], [18, 34], [150, 30], [126, 46], [40, 52], [60, 38]];
const Stars = () => <g className="ca-stars" fill="#fff3d6">{stars.map(([x, y], i) => <rect key={i} x={x} y={y} width="1.5" height="1.5" style={{ animationDelay: `${i * -0.3}s` }} />)}</g>;
const SHIP = ['d.d....', '.dmm...', '.mmwwnn', '.dmm...', 'd.d....'];
const PALS = [{ m: '#46e6d2', d: '#14807e', n: '#e6fffb' }, { m: '#ffb838', d: '#a85a14', n: '#fff3cc' }];

function Ship({ x, y, side }: { x: number; y: number; side: 0 | 1 }) {
  const pal = PALS[side];
  return <g className={`ca-ship ship-${side}`} transform={side ? `translate(${x} ${y}) scale(-1.6 1.6)` : `translate(${x} ${y}) scale(1.6)`}><g className="ca-bob">
    {SHIP.map((row, r) => [...row].map((ch, c) => ch === '.' ? null : <rect key={`${r}-${c}`} x={c * 3} y={r * 3} width="3" height="3" fill={ch === 'm' ? pal.m : ch === 'd' ? pal.d : ch === 'n' ? pal.n : '#0c1528'} />))}
    <rect className="ca-flame" x="-4" y="6" width="4" height="3" fill="#ffb838" />
  </g></g>;
}

function disc(cx: number, cy: number, r: number, fill: (dy: number) => string) {
  return Array.from({ length: r * 2 + 1 }, (_, i) => { const dy = i - r; const hw = Math.floor(Math.sqrt(r * r + r * 0.4 - dy * dy)); return <rect key={i} x={cx - hw} y={cy + dy} width={hw * 2} height="1" fill={fill(dy)} />; });
}

function MemoryArt() {
  const earth = useMemo(() => disc(80, 36, 19, (dy) => dy > 10 ? '#1f5fa8' : dy > 2 ? '#2f7fd0' : '#4aa0e8'), []);
  return (
    <svg className="card-svg ca-memory" viewBox="0 0 160 104" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="160" height="104" fill="#080c28" /><rect x="0" y="0" width="160" height="40" fill="#10104a" opacity=".55" /><rect x="90" y="30" width="70" height="40" fill="#3a1a6a" opacity=".3" /><rect x="0" y="48" width="60" height="30" fill="#0f3a5a" opacity=".3" />
      <Stars />
      <g className="ca-comet"><rect x="0" y="0" width="14" height="2" fill="#8fffea" opacity=".35" /><rect x="14" y="0" width="6" height="2" fill="#fff6c8" /></g>
      <g className="ca-earth">{earth}<g fill="#3fa05a"><rect x="68" y="26" width="9" height="5" /><rect x="72" y="31" width="7" height="6" /><rect x="86" y="38" width="9" height="6" /><rect x="70" y="44" width="6" height="4" /></g><rect x="72" y="20" width="10" height="2" fill="#cfeaff" opacity=".7" /></g>
      <ellipse className="ca-ring" cx="80" cy="38" rx="36" ry="9" fill="none" stroke="#8fffea" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(-14 80 38)" />
      <g className="ca-padA"><rect x="20" y="72" width="52" height="24" fill="#0f5a60" className="pad-body" /><rect x="20" y="72" width="52" height="3" fill="#ffffff" opacity=".25" /><rect x="20" y="93" width="52" height="3" fill="#000" opacity=".35" /></g>
      <g className="ca-padB"><rect x="88" y="72" width="52" height="24" fill="#6a1f50" className="pad-body" /><rect x="88" y="72" width="52" height="3" fill="#ffffff" opacity=".25" /><rect x="88" y="93" width="52" height="3" fill="#000" opacity=".35" /></g>
    </svg>
  );
}

function OrbitalArt() {
  const planet = useMemo(() => disc(112, 30, 14, (dy) => dy > 6 ? '#5a3a9a' : dy > -2 ? '#8a62d0' : '#b99af0'), []);
  return (
    <svg className="card-svg ca-orbital" viewBox="0 0 160 104" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="160" height="104" fill="#070a1e" /><rect x="0" y="60" width="160" height="44" fill="#1a0f3a" opacity=".5" /><rect x="30" y="0" width="70" height="30" fill="#0f3a5a" opacity=".3" />
      <Stars />
      <g className="ca-planet">{planet}<rect x="96" y="28" width="32" height="3" fill="#d7c5ff" opacity=".6" /></g>
      <g className="ca-rock r1"><rect x="68" y="20" width="8" height="8" fill="#6b7490" /><rect x="68" y="20" width="3" height="3" fill="#a9b2cf" /><rect x="73" y="25" width="3" height="3" fill="#454c66" /></g>
      <g className="ca-rock r2"><rect x="76" y="70" width="12" height="10" fill="#6b7490" /><rect x="76" y="70" width="4" height="4" fill="#a9b2cf" /><rect x="84" y="76" width="4" height="4" fill="#454c66" /></g>
      <Ship x={16} y={40} side={0} /><Ship x={146} y={48} side={1} />
      <rect className="ca-bul b1" x="54" y="51" width="8" height="2" fill="#46e6d2" /><rect className="ca-bul b2" x="102" y="59" width="8" height="2" fill="#ffb838" />
      <g className="ca-boom" fill="#fff3cc"><rect x="76" y="48" width="8" height="8" /><rect x="72" y="52" width="16" height="2" fill="#ee4ea0" /><rect x="79" y="44" width="2" height="16" fill="#ee4ea0" /></g>
    </svg>
  );
}

export function CardArt({ id, active }: { id: string; active: boolean }) {
  if (id === 'western') return <WesternScene phase={active ? 'go' : 'setup'} winner={0} falseStart={false} />;
  return id === 'memory' ? <MemoryArt /> : <OrbitalArt />;
}
