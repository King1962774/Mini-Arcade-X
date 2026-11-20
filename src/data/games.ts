export type GameId = 'western' | 'memory' | 'orbital';
export type Category = 'WESTERN' | 'ARCADE';

export interface GameMeta {
  id: GameId;
  number: string;
  title: string;
  subtitle: string;
  category: Category;
  descriptor: string;
  summary: string;
  players: string;
  controls: string;
  palette: string[];
  texture: string;
  details: string[];
}

export const games: GameMeta[] = [
  {
    id: 'western', number: '01', title: 'Duelo del Oeste', subtitle: 'Reflejos 1v1 o contra el robot', category: 'WESTERN',
    descriptor: 'Un desierto. Una señal. Solo una mano más rápida.',
    summary: 'Un duelo de reflejos con espera impredecible, falso inicio y desempate. Elige un rival humano o una máquina y decide cuántas victorias hacen falta para reclamar la estrella.',
    players: '1 — 2 jugadores', controls: 'P1: F · P2: J / → · táctil disponible',
    palette: ['#e7ae5a', '#f46a4e', '#78d6da'], texture: 'west',
    details: ['P1 contra el robot o duelo local', 'Tres perfiles de reacción del bot', 'Meta configurable de 1 a 5 victorias', 'Desierto al atardecer con cactus, buitres y polvo'],
  },
  {
    id: 'memory', number: '02', title: 'Mission Memory', subtitle: 'Memoria de secuencias orbitales', category: 'ARCADE',
    descriptor: 'Memoriza la ruta. Mantén la Tierra a salvo.',
    summary: 'El Registro D transmite una secuencia cada vez más larga. Observa los destellos de los dos mandos, repite la ruta y conserva tus escudos para llegar a la órbita final.',
    players: '1 — 2 turnándose', controls: 'A / ←: P1 · D / →: P2 · pista asistida',
    palette: ['#46e6d2', '#a06df0', '#ef4fa1'], texture: 'space',
    details: ['Cuatro niveles con ritmo y límites propios', 'Ayudas y escudos según dificultad', 'Puntuación, rango de piloto y récord local', 'Cielo estrellado, cometa y Tierra ilustrada'],
  },
  {
    id: 'orbital', number: '03', title: 'Duelo Orbital', subtitle: '2 jugadores, una nave por piloto', category: 'ARCADE',
    descriptor: 'Dos pilotos. Un campo de asteroides. Sin tregua.',
    summary: 'Batalla espacial local con movimiento vertical, disparos, misiles y rayos cargados. Elige un perfil de combate; el primero en ganar dos rondas se queda con la órbita.',
    players: '2 jugadores local', controls: 'P1: W/S + F/G · P2: ↑/↓ + Enter/Shift',
    palette: ['#46e6d2', '#ffb838', '#ee4ea0'], texture: 'orbital',
    details: ['Tres modos: puro, caos y turbo', 'Bala, doble toque, abanico y rayo', 'Combo de impactos: Super Nova', 'Rondas al mejor de tres y eventos orbitales'],
  },
];

export const westernDifficulties = [
  { name: 'Novato', range: '650—1050 ms', blurb: 'Un principiante, fácil de anticipar.', min: 650, max: 1050 },
  { name: 'Forajido', range: '360—620 ms', blurb: 'Rival de reflejos equilibrados.', min: 360, max: 620 },
  { name: 'Sheriff', range: '180—340 ms', blurb: 'La mano más rápida del condado.', min: 180, max: 340 },
] as const;

export const memoryDifficulties = [
  { name: 'Cadete', subtitle: 'Para pilotos novatos', start: 3, max: 8, shields: 3, hints: 3, on: 420, gap: 260, time: 0, color: '#46e6d2' },
  { name: 'Explorador', subtitle: 'El equilibrio perfecto', start: 4, max: 10, shields: 2, hints: 2, on: 320, gap: 200, time: 3500, color: '#4696f0' },
  { name: 'Comandante', subtitle: 'Solo para los valientes', start: 5, max: 12, shields: 2, hints: 1, on: 240, gap: 140, time: 2600, color: '#ffb838' },
  { name: 'Leyenda', subtitle: 'Una sola oportunidad', start: 6, max: 16, shields: 1, hints: 0, on: 180, gap: 100, time: 1800, color: '#ee4ea0' },
] as const;

export const orbitalModes = [
  { name: 'Duelo puro', subtitle: 'Solo habilidad', speed: 46, events: 'Sin eventos orbitales', suddenDeath: 42, color: '#46e6d2' },
  { name: 'Caos orbital', subtitle: 'Asteroides, meteoritos', speed: 50, events: 'Eventos normales', suddenDeath: 39, color: '#a06df0' },
  { name: 'Turbo Nova', subtitle: 'Todo más rápido', speed: 66, events: 'Eventos frecuentes', suddenDeath: 32, color: '#ffb838' },
] as const;

export const hardware = {
  board: 'ESP32 DevKit (WROOM)',
  display: 'TFT SPI ST7789 · módulo GMT024-10',
  resolution: '320 × 240 px en el firmware',
  libraries: 'Adafruit GFX + Adafruit ST7735/ST7789',
  buzzer: 'Zumbador pasivo en GPIO 33',
  note: 'El archivo CONEXIONES.md menciona pantallas de 240 × 320; el firmware configura SCR_W 320 y SCR_H 240 con rotación horizontal.',
};

export const connections = [
  ['TFT · GND', 'GND'], ['TFT · VCC', '3V3'], ['TFT · SCK', 'GPIO 18'], ['TFT · SDA / MOSI', 'GPIO 23'],
  ['TFT · RST', 'GPIO 17'], ['TFT · DC', 'GPIO 16'], ['TFT · CS', 'GPIO 5'], ['P1 · botón izquierdo', 'GPIO 25'],
  ['P2 · botón derecho', 'GPIO 26'], ['CENTRO', 'GPIO 27'], ['Buzzer pasivo', 'GPIO 33'],
] as const;

/** Controles y jugadores de cada cartucho, desglosados desde los textos del catálogo. */
export interface KeyGroup { label: string; keys: string[] }
export interface PilotGuide { who: string; groups: KeyGroup[] }
export const keyGuide: Record<GameId, { pilots: PilotGuide[]; note?: string }> = {
  western: { pilots: [{ who: 'P1', groups: [{ label: 'DISPARAR', keys: ['F'] }] }, { who: 'P2', groups: [{ label: 'DISPARAR', keys: ['J', '→'] }] }], note: 'TÁCTIL DISPONIBLE' },
  memory: { pilots: [{ who: 'P1', groups: [{ label: 'PULSAR', keys: ['A', '←'] }] }, { who: 'P2', groups: [{ label: 'PULSAR', keys: ['D', '→'] }] }], note: 'PISTA ASISTIDA' },
  orbital: { pilots: [{ who: 'P1', groups: [{ label: 'MOVER', keys: ['W', 'S'] }, { label: 'ATACAR', keys: ['F', 'G'] }] }, { who: 'P2', groups: [{ label: 'MOVER', keys: ['↑', '↓'] }, { label: 'ATACAR', keys: ['Enter', 'Shift'] }] }] },
};
/** P2 opcional (robot o turnos) u obligatorio. */
export const seats: Record<GameId, { p2Required: boolean; p2Alt?: string }> = {
  western: { p2Required: false, p2Alt: 'ROBOT' },
  memory: { p2Required: false, p2Alt: 'TURNOS' },
  orbital: { p2Required: true },
};
