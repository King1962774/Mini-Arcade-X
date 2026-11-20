# Plan de implementación — Arcade ESP32

## Objetivo y alcance
Crear una experiencia web en español que convierta el contenido interactivo de `ConsolaArcade` en un arcade jugable desde el navegador. El catálogo real del Hub contiene tres juegos activos —**Duelo del Oeste**, **Mission Memory** y **Duelo Orbital**—, más información del sistema. Se representarán también el encendido (`Boot.ino`), categorías, guía de controles, estado/acerca del proyecto y las transiciones de introducción, espera, cuenta atrás, partida y resultado presentes en el firmware. La referencia es el código adjunto; el juego web funcionará de forma autónoma y no controlará el ESP32.

### Contenido y comportamiento
- **Inicio y Hub:** arranque animado, navegación por categorías Oeste / Arcade / Sistema, tarjetas completas de los juegos, estado de la consola, controles, versión/datos del hardware y recorrido hacia cada experiencia.
- **Duelo del Oeste:** práctica contra robot o duelo local para dos personas; dificultad de robot Novato, Forajido y Sheriff con rangos de reacción del firmware (650–1050, 360–620 y 180–340 ms); menú de victorias para ganar; espera aleatoria de 3000–8000 ms; escena del saloon del oeste, falsa salida, señal, reacción, duelo, victoria/derrota y desempate cuando aplique.
- **Mission Memory:** intro espacial y secuencia galáctica, fondos estelares, Tierra/planetas y cometa; cuatro dificultades (Cadete, Explorador, Comandante y Leyenda) con longitudes, escudos, ayudas y tiempos tomados de `Juego_MemoriaD.ino`; observación y repetición de secuencias, fallos con escudo, avance de nivel, temporizador por señal, combo y fórmula de puntuación del firmware, más pantalla de resultado/rango/record.
- **Duelo Orbital:** juego local para dos personas con tres modos del firmware (Duelo puro, Caos orbital y Turbo Nova), 40 puntos de casco y 3 vidas por piloto, pérdida de vida y reaparición protegida; cuenta atrás, arena estelar, naves, disparos/especiales y sucesos orbitales; rondas al mejor de tres, HUD, resultado de ronda/partida y controles para escritorio y tacto.
- **Controles:** teclado y botones táctiles equivalentes para jugar; pausar, reiniciar y volver al Hub. Guardar récords locales donde corresponda.
- Las pantallas informativas describen el firmware sin fingir telemetría real en vivo de un ESP32 que no está conectado al sitio.

## Implementación
Sitio cliente sin autenticación, servidor, base de datos ni Redis: React + TypeScript + Vite, con la lógica de juego y datos locales, persistencia de récords en `localStorage`, animaciones CSS y escenas Canvas/SVG responsivas. Separar catálogo/datos, lógica y pantallas por archivos para facilitar iteración; el lienzo de cada juego mantendrá sus fondos y estados propios. No se añadirá una dependencia de hardware ni se afirmará sincronización con el ESP32. No se requieren imágenes externas: fondos, sprites y detalles se construirán con Canvas/CSS/SVG para dar vida a los gráficos originales.

### Estructura propuesta
- `src/main.tsx`, `src/App.tsx`: entrada y navegación global.
- `src/data/games.ts`: catálogo, descripciones y parámetros transcritos del firmware.
- `src/components/`: navegación, tarjetas, HUD, paneles, botones, controles táctiles y elementos de escena reutilizables.
- `src/screens/BootScreen.tsx`, `HubScreen.tsx`, `SystemScreen.tsx`: encendido, categorías y apartados de sistema.
- `src/screens/WesternScreen.tsx`, `MemoryScreen.tsx`, `OrbitalScreen.tsx`: pantallas y ciclo jugable independiente de cada juego.
- `src/games/western/`, `src/games/memory/`, `src/games/orbital/`: estado, reglas, controles y render de cada juego.
- `src/styles/`: tokens globales, layout responsivo y estilos separados por pantalla/juego.
- `public/manus-routes.json`: manifiesto de rutas. `app.config.ts`: metadatos del proyecto.

## Diseño visual
Tres direcciones consideradas (probabilidades asignadas a alternativas poco frecuentes y seleccionadas de forma aleatoria entre ellas): **archivo ciberwestern-orbital** (0,08), **terminal arcade Y2K** (0,05), **museo retro de hardware** (0,03). Se elige **archivo ciberwestern-orbital**, el más coherente con la mezcla real de saloon, memoria galáctica y duelo de naves.

- **Movimiento:** retrofuturismo arcade de recreativa, con gráfica pixel-art reinterpretada en un panel editorial actual.
- **Principios:** fidelidad a la identidad de cada juego; jerarquía entre ficha detallada y escena jugable; información técnica legible; controles inclusivos de teclado y tacto.
- **Color:** azul noche y tinta para unificar el sistema; cian/índigo para el espacio, ámbar/terracota para el oeste, y magenta como señal de peligro. Cian brillante `#46E6D2` será el color distintivo del arcade.
- **Composición:** cabecera compacta, índice lateral persistente en escritorio, panel ancho para la escena de juego y una columna de dossier con reglas, parámetros y control; en móvil, navegación plegable y paneles apilados.
- **Motivos:** emblema estrella de sheriff intersectado por un anillo orbital; líneas horizontales CRT discretas y constelaciones de puntos.
- **Interacción/movimiento:** cambios de pantalla como transiciones de cartucho, pulsos de espera, estrellas titilantes, transiciones de escena suaves y reacción visual clara ante cada tecla/impacto; respetar `prefers-reduced-motion`.
- **Tipografía:** Space Grotesk para títulos/UI y Space Mono para métricas, instrucciones y rotulado de arcade, con alternativas del sistema.
- **Marca:** «Frontera Digital», archivo jugable de una consola de bolsillo; personalidad: vibrante, artesanal, exploradora. Voz breve y directa: «El saloon abre en unos segundos.» / «Memoriza la ruta. Mantén la Tierra a salvo.»
- **Logotipo:** estrella de sheriff geométrica con anillo orbital y rastro pixelado; color de marca cian.

## Revisión visual 8-bit — solicitud 2026-11-18
La iteración debe hacer más evidente el acabado de videojuego retro de la consola ESP32: sustituir parte de la presentación editorial lisa por pixel-art de bordes duros, marcos tipo cartucho y tipografía arcade legible. Mantener la paleta existente de cian, índigo, ámbar, terracota y magenta para conservar la identidad de cada juego.

- Aplicar una capa de estilos retro desacoplada de la hoja base; usar tipografía de píxel para rotulado y métricas, y tipografía de terminal retro para titulares y textos de juego, sin sacrificar la legibilidad.
- Añadir movimiento ambiental continuo en el Hub y las escenas del Oeste, Mission Memory y Duelo Orbital: estrellas/polvo en deriva, CRT y escaneo suave, elementos de escena con idle por pasos, y reacción visual breve a estados de juego.
- Dar mayor definición visual a la Tierra, los pilotos y las tarjetas; renderizar la arena orbital desde una superficie de baja resolución con escalado nearest-neighbour para hacer el pixelado parte del arte, no solo un filtro.
- Respetar `prefers-reduced-motion`, mantener controles y mecánicas actuales sin cambios, conservar el diseño adaptable y evitar telemetría o conexión ESP32 ficticias.

## Flujo de trabajo
Tras confirmar este plan, crearé el `TODO.md` con los resultados requeridos, configuraré diagnósticos para los lenguajes del proyecto, implementaré cada pantalla y juego en sus módulos separados, iniciaré el Preview administrado una vez que haya contenido funcional y revisaré sus respuestas HTTP, el manifiesto de rutas y los diagnósticos. Finalizaré los cambios en un checkpoint del proyecto; publicar el sitio es un paso separado.
