import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/pixel-arcade.css';
import './styles/motion.css';
import './styles/western.css';
import './styles/polish.css';
import './styles/cards.css';
import './styles/hero-console.css';
import './styles/cartridge.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
