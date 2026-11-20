import { useMemo } from 'react';

interface SceneProps { phase: string; winner: number; falseStart: boolean }
const bands = ['#1d1233', '#2e1744', '#4d2352', '#7a2f58', '#b04456', '#d9604c', '#f08a4b', '#f8b45e', '#fbd68a'];

function Cowboy({ side, state }: { side: 1 | 2; state: string }) {
  const shirt = side === 1 ? '#78d6da' : '#f46a4e';
  const dark = side === 1 ? '#3b8f96' : '#a93a2c';
  return (
    <g transform={side === 1 ? 'translate(30 84)' : 'translate(130 84) scale(-1 1)'}>
      <rect x="-9" y="-1" width="18" height="2" fill="#0007" />
      <g className={`cb cb-${state}`}>
        <rect x="-5" y="-3" width="4" height="3" fill="#3a2418" /><rect x="1" y="-3" width="4" height="3" fill="#3a2418" />
        <rect x="-4" y="-12" width="3" height="9" fill="#2d4a8a" /><rect x="1" y="-12" width="3" height="9" fill="#2d4a8a" />
        <rect x="-5" y="-14" width="10" height="2" fill="#5a3320" /><rect x="-1" y="-14" width="2" height="2" fill="#f8d78a" />
        <g className="cb-torso">
          <rect x="-5" y="-22" width="10" height="8" fill={shirt} /><rect x="-5" y="-22" width="3" height="8" fill={dark} />
          <rect x="-3" y="-27" width="6" height="5" fill="#f0c08a" /><rect x="1" y="-25" width="1" height="1" fill="#1d1233" />
          <g className="cb-hat"><rect x="-7" y="-28" width="14" height="2" fill="#6b3f22" /><rect x="-4" y="-33" width="8" height="5" fill="#8a5330" /><rect x="-4" y="-29" width="8" height="1" fill="#f8d78a" /></g>
          <rect className="sweat" x="-4" y="-26" width="1" height="2" fill="#9fe8ff" />
        </g>
        <g transform="translate(3 -20)"><g className="cb-arm">
          <rect x="0" y="-1" width="6" height="2" fill={shirt} /><rect x="6" y="-1" width="2" height="2" fill="#f0c08a" />
          <rect x="7" y="-2" width="6" height="3" fill="#2b2b33" /><rect x="7" y="1" width="2" height="3" fill="#2b2b33" />
          <g className="cb-flash"><rect x="13" y="-4" width="3" height="7" fill="#fff3b0" /><rect x="13" y="-2" width="8" height="3" fill="#ffb838" /></g>
        </g></g>
      </g>
    </g>
  );
}

export function WesternScene({ phase, winner, falseStart }: SceneProps) {
  const sun = useMemo(() => Array.from({ length: 29 }, (_, i) => { const dy = i - 14; const hw = Math.floor(Math.sqrt(225 - dy * dy)); return <rect key={i} x={80 - hw} y={44 + dy} width={hw * 2} height="1" fill={Math.abs(dy) % 6 < 2 && dy > 2 ? '#f08a4b' : '#ffd27a'} />; }), []);
  const result = phase === 'roundResult' || phase === 'matchResult';
  const stateFor = (p: 1 | 2) => result ? (winner === p ? 'win' : 'dead') : phase === 'waiting' ? 'ready' : phase === 'go' ? 'draw' : 'idle';
  return (
    <svg className={`western-scene sc-${phase}${phase === 'waiting' || phase === 'go' ? ' sc-dusk' : ''}${falseStart ? ' sc-false' : ''}`} viewBox="0 -14 160 104" preserveAspectRatio="xMidYMax meet" shapeRendering="crispEdges" aria-hidden="true">
      {bands.map((c, i) => <rect key={c} x="0" y={-14 + i * 7.4} width="160" height="7.6" fill={c} />)}
      <g className="sc-stars" fill="#fff3d6">{[[10, -8], [34, -3], [58, -10], [100, -6], [126, -11], [148, -2], [20, 6], [142, 8]].map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" style={{ animationDelay: `${i * -0.35}s` }} />)}</g>
      <g className="sc-sun">{sun}</g>
      <g className="sc-clouds" fill="#ffd9a8" opacity=".75"><g className="cloud c-a"><rect x="14" y="14" width="18" height="3" /><rect x="18" y="11" width="9" height="3" /></g><g className="cloud c-b"><rect x="104" y="20" width="24" height="3" /><rect x="110" y="17" width="12" height="3" /></g></g>
      <g className="sc-vultures" fill="#1d1233"><g className="vulture v-a"><rect x="0" y="1" width="2" height="1" /><rect x="2" y="0" width="2" height="1" /><rect x="4" y="1" width="2" height="1" /></g><g className="vulture v-b"><rect x="0" y="1" width="2" height="1" /><rect x="2" y="0" width="2" height="1" /><rect x="4" y="1" width="2" height="1" /></g></g>
      <path className="mesa-far" d="M0 62V50H12V44H30V50H38V56H56V62ZM104 62V54H118V46H136V52H146V48H160V62Z" fill="#6a2f5a" />
      <path className="mesa-near" d="M0 70V58H8V54H22V60H30V70ZM122 70V60H130V56H150V62H160V70Z" fill="#3b1c40" />
      <rect x="0" y="70" width="160" height="34" fill="#d19552" />
      {[[0, 74, 60], [70, 78, 90], [20, 83, 50], [100, 88, 60], [0, 94, 160]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height="1.6" fill={i % 2 ? '#b8793f' : '#e3ad68'} />)}
      <rect x="0" y="96" width="160" height="8" fill="#8a5530" />
      <g fill="#3f8a4a"><rect x="9" y="58" width="3" height="14" /><rect x="5" y="62" width="4" height="2" /><rect x="5" y="58" width="2" height="6" /><rect x="12" y="60" width="4" height="2" /><rect x="14" y="56" width="2" height="6" /></g>
      <g fill="#3f8a4a"><rect x="148" y="60" width="3" height="12" /><rect x="144" y="64" width="4" height="2" /><rect x="144" y="60" width="2" height="6" /></g>
      <g className="cactus-big">
        <rect x="77" y="48" width="7" height="35" fill="#3f8a4a" /><rect x="77" y="48" width="2" height="35" fill="#63bb6b" /><rect x="82" y="48" width="2" height="35" fill="#2a6234" /><rect x="78" y="46" width="5" height="2" fill="#3f8a4a" />
        <rect x="69" y="62" width="8" height="3" fill="#3f8a4a" /><rect x="69" y="53" width="3" height="12" fill="#3f8a4a" /><rect x="69" y="53" width="1" height="12" fill="#63bb6b" /><rect x="70" y="51" width="1" height="2" fill="#3f8a4a" />
        <rect x="84" y="58" width="8" height="3" fill="#3f8a4a" /><rect x="89" y="49" width="3" height="12" fill="#3f8a4a" /><rect x="91" y="49" width="1" height="12" fill="#2a6234" /><rect x="90" y="47" width="1" height="2" fill="#3f8a4a" />
        <g fill="#d7ecb0"><rect x="76" y="56" width="1" height="1" /><rect x="84" y="66" width="1" height="1" /><rect x="76" y="72" width="1" height="1" /><rect x="84" y="52" width="1" height="1" /><rect x="68" y="58" width="1" height="1" /><rect x="92" y="54" width="1" height="1" /></g>
        <rect className="cactus-flower" x="79" y="44" width="3" height="3" fill="#ee4ea0" /><rect x="76" y="82" width="9" height="2" fill="#2a6234" />
      </g>
      <g fill="#ecdfc2"><rect x="104" y="81" width="5" height="3" /><rect x="105" y="79" width="3" height="2" /><rect x="105" y="82" width="1" height="1" fill="#2b2b33" /><rect x="107" y="82" width="1" height="1" fill="#2b2b33" /></g>
      <g className="tumble"><rect x="0" y="0" width="5" height="5" fill="none" stroke="#7a4a2c" strokeWidth="1" /><rect x="1.5" y="1.5" width="2" height="2" fill="#7a4a2c" /></g>
      <rect className="dusk-veil" x="0" y="-14" width="160" height="110" fill="#14072e" opacity="0" />
      <g className="sc-stars2" fill="#fff3d6">{[[8, -9], [28, -5], [46, 2], [64, -11], [92, -8], [112, 0], [134, -6], [152, 4], [20, 9], [120, 10]].map(([x, y], i) => <rect key={i} x={x} y={y} width="1.4" height="1.4" style={{ animationDelay: `${i * -0.3}s` }} />)}</g>
      <Cowboy side={1} state={stateFor(1)} /><Cowboy side={2} state={stateFor(2)} />
      {result && !falseStart && <rect className={`bullet bul-${winner}`} x={winner === 1 ? 52 : 108} y="63" width="4" height="1.6" fill="#fff3b0" />}
      {result && <g className={`poof poof-${winner === 1 ? 2 : 1}`} fill="#e3ad68"><rect x={winner === 1 ? 126 : 28} y="80" width="4" height="4" /><rect x={winner === 1 ? 132 : 22} y="76" width="3" height="3" /><rect x={winner === 1 ? 121 : 34} y="77" width="3" height="3" /></g>}
      {phase === 'go' && <text className="bang" x="80" y="22" textAnchor="middle" fontSize="16" fill="#fff3b0" style={{ fontFamily: '"Press Start 2P", monospace' }}>!</text>}
    </svg>
  );
}
