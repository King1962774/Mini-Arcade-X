import { Icon } from './Icon';

export type SiteSection = 'home' | 'system' | 'game';

interface SiteHeaderProps {
  section: SiteSection;
  onNavigate: (section: 'home' | 'system') => void;
  onSound: () => void;
  soundOn: boolean;
}

export function SiteHeader({ section, onNavigate, onSound, soundOn }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button className="brand-lockup" onClick={() => onNavigate('home')} aria-label="Volver al inicio">
        <img src="/logo.svg" alt="" width="40" height="40" />
        <span><strong>FRONTERA<span>_</span>DIGITAL</strong><small>ARCHIVO ARCADE · ESP32</small></span>
      </button>
      <nav className="top-nav" aria-label="Navegación principal">
        <button className={section === 'home' || section === 'game' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('home')}><span>01</span> Arcade</button>
        <button className={section === 'system' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('system')}><span>02</span> Sistema</button>
      </nav>
      <div className="header-tools">
        <span className="live-chip"><i /> SISTEMA LISTO</span>
        <button className="icon-button sound-toggle" onClick={onSound} aria-label={soundOn ? 'Silenciar' : 'Activar sonido'} title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}>
          <Icon name={soundOn ? 'sound' : 'mute'} />
        </button>
      </div>
    </header>
  );
}
