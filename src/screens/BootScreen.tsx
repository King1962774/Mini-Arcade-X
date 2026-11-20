import { useEffect, useState } from 'react';

interface BootScreenProps { onComplete: () => void }

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const start = window.setTimeout(() => setPhase(1), 400);
    const finish = window.setTimeout(onComplete, 6300);
    const skip = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', skip);
    return () => { window.clearTimeout(start); window.clearTimeout(finish); window.removeEventListener('keydown', skip); };
  }, [onComplete]);

  return (
    <div className={`boot-screen phase-${phase}`} role="dialog" aria-label="Animación de encendido">
      <div className="boot-stars" />
      <p className="boot-present">UN PROYECTO DE <span>CONSOLAS DE BOLSILLO</span></p>
      <div className="boot-horizon"><span className="boot-glow" />
        {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: `${2 + i * 4.1}%`, height: `${16 + (i % 6) * 10}%`, '--delay': `${(i % 7) * -0.33}s` } as React.CSSProperties} />)}
      </div>
      <div className="boot-wordmark"><img src="/logo.svg" alt="" /><span>FRONTERA DIGITAL</span><small>ARCADE SYSTEM · BUILD 01</small></div>
      <button className="boot-skip" onClick={onComplete}>OMITIR INTRO <span>ENTER ↗</span></button>
      <div className="boot-progress"><i /></div>
    </div>
  );
}
