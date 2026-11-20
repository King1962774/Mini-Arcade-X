import { useCallback, useState } from 'react';
import type { GameId } from './data/games';
import { SiteHeader, type SiteSection } from './components/SiteHeader';
import { BootScreen } from './screens/BootScreen';
import { HubScreen } from './screens/HubScreen';
import { SystemScreen } from './screens/SystemScreen';
import { WesternScreen } from './screens/WesternScreen';
import { MemoryScreen } from './screens/MemoryScreen';
import { OrbitalScreen } from './screens/OrbitalScreen';

export default function App() {
  const [booted, setBooted] = useState(() => {
    try { return sessionStorage.getItem('fd-boot-seen') === '1'; } catch { return false; }
  });
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [section, setSection] = useState<SiteSection>('home');
  const [soundOn, setSoundOn] = useState(true);
  const [wipe, setWipe] = useState(0);
  const finishBoot = useCallback(() => {
    try { sessionStorage.setItem('fd-boot-seen', '1'); } catch { /* Navegación privada */ }
    setBooted(true);
  }, []);
  const navigate = useCallback((target: 'home' | 'system') => {
    setActiveGame(null);
    setSection(target);
    setWipe((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const launch = useCallback((game: GameId) => {
    setActiveGame(game);
    setSection('game');
    setWipe((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const exitGame = useCallback(() => {
    setActiveGame(null);
    setSection('home');
    setWipe((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {!booted && <BootScreen onComplete={finishBoot} />}
      {wipe > 0 && <div key={wipe} className="cart-wipe" aria-hidden="true">{Array.from({ length: 8 }, (_, n) => <i key={n} style={{ '--n': n } as React.CSSProperties} />)}<b>CARGANDO…</b></div>}
      <div className="site-shell">
        <div className="ambient-grid" aria-hidden="true" />
        <SiteHeader section={section} onNavigate={navigate} onSound={() => setSoundOn((value) => !value)} soundOn={soundOn} />
        <main id="main-content">
          {section === 'system' && <SystemScreen onBack={() => navigate('home')} />}
          {section === 'game' && activeGame === 'western' && <WesternScreen onBack={exitGame} soundOn={soundOn} />}
          {section === 'game' && activeGame === 'memory' && <MemoryScreen onBack={exitGame} soundOn={soundOn} />}
          {section === 'game' && activeGame === 'orbital' && <OrbitalScreen onBack={exitGame} soundOn={soundOn} />}
          {section === 'home' && <HubScreen onLaunch={launch} onSystem={() => navigate('system')} soundOn={soundOn} />}
        </main>
      </div>
    </>
  );
}
