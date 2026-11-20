import { orbitalModes } from '../../data/games';

export type ShotStyle = 'pulse' | 'fan' | 'beam' | 'missile' | 'nova';
export interface Pilot {
  x: number; y: number; hp: number; lives: number; energy: number; combo: number;
  invulnerableUntil: number; flashUntil: number; cooldown: number; facing: -1 | 1;
}
interface Shot { x: number; y: number; vx: number; vy: number; owner: 0 | 1; kind: ShotStyle; radius: number; age: number; life: number; damage: number }
interface Rock { x: number; y: number; vx: number; vy: number; r: number; spin: number; angle: number; hp: number }
interface Burst { x: number; y: number; life: number; max: number; color: string; size: number; kind: 'spark' | 'nova' | 'beam' }
export interface OrbitalSim { pilots: [Pilot, Pilot]; shots: Shot[]; rocks: Rock[]; bursts: Burst[]; elapsed: number; nextRock: number; suddenTick: number; sudden: boolean; ended: boolean }
export interface OrbitalHud { hp: [number, number]; lives: [number, number]; energy: [number, number]; combo: [number, number]; elapsed: number; sudden: boolean }

const WIDTH = 960;
const HEIGHT = 500;
const colors = ['#46e6d2', '#ffb838'] as const;

export function createOrbitalSim(): OrbitalSim {
  return {
    pilots: [
      { x: 125, y: 250, hp: 40, lives: 3, energy: 100, combo: 0, invulnerableUntil: 0, flashUntil: 0, cooldown: 0, facing: 1 },
      { x: 835, y: 250, hp: 40, lives: 3, energy: 100, combo: 0, invulnerableUntil: 0, flashUntil: 0, cooldown: 0, facing: -1 },
    ],
    shots: [], rocks: [], bursts: [], elapsed: 0, nextRock: 0, suddenTick: 0, sudden: false, ended: false,
  };
}

export function fireOrbital(sim: OrbitalSim, owner: 0 | 1, style: ShotStyle, now: number, chargeMs = 1300): boolean {
  const pilot = sim.pilots[owner];
  if (now < pilot.cooldown || sim.ended) return false;
  if (style === 'nova' && pilot.combo < 3) return false;
  const cost = style === 'pulse' ? 0 : style === 'fan' ? 8 : style === 'beam' ? 18 : style === 'missile' ? 22 : 0;
  if (pilot.energy < cost) return false;
  pilot.energy -= cost;
  const dir = pilot.facing;
  const color = colors[owner];
  pilot.cooldown = now + (style === 'beam' ? 460 : style === 'nova' ? 360 : style === 'missile' ? 330 : style === 'fan' ? 230 : 120);

  if (style === 'beam') {
    const charge = Math.max(0, Math.min(1, chargeMs / 1300));
    sim.bursts.push({ x: pilot.x + dir * 28, y: pilot.y, life: 0.23, max: 0.23, color, size: 0, kind: 'beam' });
    const rival = sim.pilots[1 - owner];
    if (Math.abs(rival.y - pilot.y) < 35 + charge * 18) hitPilot(sim, (1 - owner) as 0 | 1, 14 + Math.round(charge * 26), now, true, owner);
    for (const shot of sim.shots) if (shot.owner !== owner && Math.abs(shot.y - pilot.y) < 34 + charge * 18) shot.life = -1;
    if (charge > 0.95) pilot.energy = 0;
    return true;
  }
  if (style === 'fan') {
    for (const angle of [-0.34, -0.17, 0, 0.17, 0.34]) {
      sim.shots.push({ x: pilot.x + dir * 28, y: pilot.y, vx: dir * 650, vy: angle * 470, owner, kind: style, radius: 5, age: 0, life: 1.55, damage: 7 });
    }
    return true;
  }
  if (style === 'missile') {
    sim.shots.push({ x: pilot.x + dir * 29, y: pilot.y, vx: dir * 430, vy: 0, owner, kind: style, radius: 8, age: 0, life: 2.6, damage: 16 });
    return true;
  }
  if (style === 'nova') {
    pilot.combo = 0;
    pilot.cooldown = now + 350;
    sim.shots.push({ x: pilot.x + dir * 29, y: pilot.y, vx: dir * 330, vy: 0, owner, kind: style, radius: 13, age: 0, life: 2.8, damage: 22 });
    sim.bursts.push({ x: pilot.x + dir * 30, y: pilot.y, life: 0.32, max: 0.32, color: '#ef4fa1', size: 17, kind: 'nova' });
    return true;
  }
  sim.shots.push({ x: pilot.x + dir * 27, y: pilot.y, vx: dir * 760, vy: (Math.random() - 0.5) * 92, owner, kind: style, radius: 4, age: 0, life: 1.8, damage: 10 });
  return true;
}

export function specialOrbital(sim: OrbitalSim, owner: 0 | 1, now: number): 'missile' | 'nova' | 'empty' {
  const pilot = sim.pilots[owner];
  if (sim.ended || now < pilot.cooldown) return 'empty';
  if (pilot.combo >= 3) return fireOrbital(sim, owner, 'nova', now) ? 'nova' : 'empty';
  return fireOrbital(sim, owner, 'missile', now) ? 'missile' : 'empty';
}

function hitPilot(sim: OrbitalSim, target: 0 | 1, amount: number, now: number, byFoe = true, attacker?: 0 | 1) {
  const pilot = sim.pilots[target];
  if (now < pilot.invulnerableUntil || pilot.lives === 0) return;
  if (byFoe) {
    const source = attacker ?? (1 - target) as 0 | 1;
    sim.pilots[source].combo = Math.min(3, sim.pilots[source].combo + 1);
  }
  const damage = sim.sudden ? amount * 2 : amount;
  pilot.hp = Math.max(0, pilot.hp - damage);
  pilot.energy = Math.min(100, pilot.energy + 6);
  pilot.flashUntil = now + 120;
  pilot.invulnerableUntil = now + 400;
  sim.bursts.push({ x: pilot.x - pilot.facing * 12, y: pilot.y, life: 0.32, max: 0.32, color: '#ff666c', size: 18, kind: 'spark' });
  if (pilot.hp <= 0) {
    pilot.lives = Math.max(0, pilot.lives - 1);
    sim.bursts.push({ x: pilot.x, y: pilot.y, life: 0.62, max: 0.62, color: colors[target], size: 52, kind: 'nova' });
    if (pilot.lives > 0) {
      pilot.hp = 40;
      pilot.invulnerableUntil = now + 1600;
      pilot.energy = 100;
    } else {
      pilot.hp = 0;
    }
  }
}

export function stepOrbitalSim(sim: OrbitalSim, keys: Set<string>, dt: number, modeIndex: number, now: number): 0 | 1 | null {
  if (sim.ended) return null;
  const mode = orbitalModes[modeIndex];
  sim.elapsed += dt;
  sim.sudden = sim.elapsed >= mode.suddenDeath;
  for (let index = 0; index < 2; index++) {
    const p = sim.pilots[index];
    const up = index === 0 ? keys.has('w') : keys.has('arrowup');
    const down = index === 0 ? keys.has('s') : keys.has('arrowdown');
    const dir = (down ? 1 : 0) - (up ? 1 : 0);
    p.y = Math.max(55, Math.min(445, p.y + dir * mode.speed * 5.6 * dt));
    p.energy = Math.min(100, p.energy + 16 * dt);
  }

  const eventInterval = modeIndex === 0 ? Infinity : modeIndex === 1 ? 3.0 : 1.35;
  if (sim.elapsed >= sim.nextRock && eventInterval !== Infinity) {
    sim.nextRock = sim.elapsed + eventInterval * (0.7 + Math.random() * 0.65);
    const radius = 12 + Math.random() * 14;
    const laneY = 65 + Math.random() * 370;
    const fromTop = Math.random() > 0.5;
    sim.rocks.push({ x: 215 + Math.random() * 530, y: fromTop ? 28 : 472, vx: (Math.random() - 0.5) * 86, vy: fromTop ? 105 + Math.random() * 78 : -(105 + Math.random() * 78), r: radius, spin: (Math.random() - 0.5) * 3.8, angle: Math.random() * 6.2, hp: 2 });
    if (modeIndex === 2 && Math.random() > 0.45) sim.rocks.push({ x: Math.random() > 0.5 ? 275 : 685, y: laneY, vx: Math.random() > 0.5 ? 96 : -96, vy: (Math.random() - 0.5) * 34, r: 10 + Math.random() * 9, spin: 2.4, angle: 0, hp: 1 });
  }

  for (const rock of sim.rocks) {
    rock.x += rock.vx * dt; rock.y += rock.vy * dt; rock.angle += rock.spin * dt;
    for (let i = 0; i < 2; i++) {
      const p = sim.pilots[i];
      if (Math.hypot(rock.x - p.x, rock.y - p.y) < rock.r + 18) {
        hitPilot(sim, i as 0 | 1, 13, now, false);
        rock.hp = 0;
      }
    }
  }
  sim.rocks = sim.rocks.filter((r) => r.hp > 0 && r.y > -45 && r.y < HEIGHT + 45 && r.x > -45 && r.x < WIDTH + 45);

  for (const shot of sim.shots) {
    shot.age += dt;
    if (shot.kind === 'missile' || shot.kind === 'nova') {
      const target = sim.pilots[1 - shot.owner];
      const desired = Math.max(-200, Math.min(200, (target.y - shot.y) * 2.4));
      shot.vy += (desired - shot.vy) * Math.min(1, dt * (shot.kind === 'nova' ? 1.25 : 2.2));
    }
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    const rivalIndex = (1 - shot.owner) as 0 | 1;
    const rival = sim.pilots[rivalIndex];
    const hitRadius = shot.kind === 'nova' ? 58 : shot.radius + 20;
    if (Math.hypot(shot.x - rival.x, shot.y - rival.y) < hitRadius) {
      if (shot.kind === 'nova') {
        sim.bursts.push({ x: shot.x, y: shot.y, life: 0.75, max: 0.75, color: '#ef4fa1', size: 58, kind: 'nova' });
        for (const rivalShot of sim.shots) if (rivalShot.owner !== shot.owner && Math.hypot(rivalShot.x - shot.x, rivalShot.y - shot.y) < 58) rivalShot.life = -1;
      }
      hitPilot(sim, rivalIndex, shot.damage, now, true, shot.owner);
      shot.life = -1;
    } else {
      for (const rock of sim.rocks) {
        if (Math.hypot(shot.x - rock.x, shot.y - rock.y) < rock.r + shot.radius) {
          rock.hp -= 1; shot.life = -1;
          sim.bursts.push({ x: shot.x, y: shot.y, life: 0.22, max: 0.22, color: '#c1f6ec', size: 13, kind: 'spark' });
          break;
        }
      }
    }
    shot.life -= dt;
  }
  sim.shots = sim.shots.filter((s) => s.life > 0 && s.x > -40 && s.x < WIDTH + 40 && s.y > -40 && s.y < HEIGHT + 40);
  for (const burst of sim.bursts) burst.life -= dt;
  sim.bursts = sim.bursts.filter((b) => b.life > 0);

  if (sim.sudden && sim.elapsed >= sim.suddenTick) {
    sim.suddenTick = sim.elapsed + 2.8;
    if (sim.elapsed > mode.suddenDeath + 1) {
      hitPilot(sim, 0, 3, now, false); hitPilot(sim, 1, 3, now, false);
    }
  }
  if (sim.pilots[0].lives === 0 || sim.pilots[1].lives === 0 || (sim.elapsed > mode.suddenDeath + 18 && sim.sudden)) {
    sim.ended = true;
    return sim.pilots[0].lives === sim.pilots[1].lives ? (sim.pilots[0].hp === sim.pilots[1].hp ? (Math.random() > 0.5 ? 0 : 1) : sim.pilots[0].hp > sim.pilots[1].hp ? 0 : 1) : sim.pilots[0].lives > sim.pilots[1].lives ? 0 : 1;
  }
  return null;
}


const SHIP = ['d.d....', '.dmm...', '.mmwwnn', '.dmm...', 'd.d....'];
const PAL = [{ m: '#46e6d2', d: '#14807e', n: '#e6fffb' }, { m: '#ffb838', d: '#a85a14', n: '#fff3cc' }];
const snap = (v: number) => Math.round(v / 4) * 4;
function cell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) { ctx.fillStyle = c; ctx.fillRect(snap(x), snap(y), w, h); }
function disc(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, c: string) {
  for (let dy = -n; dy <= n; dy++) { const hw = Math.floor(Math.sqrt(n * n + n * 0.6 - dy * dy)); cell(ctx, x - hw * 8 - 4, y + dy * 8 - 4, hw * 16 + 8, 8, c); }
}

export function drawOrbitalScene(ctx: CanvasRenderingContext2D, sim: OrbitalSim, modeIndex: number, now: number, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#060b1a'); bg.addColorStop(0.52, '#111431'); bg.addColorStop(1, '#080b19');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
  for (const [cx, cy, rr, col] of [[200, 120, 160, '#7b4bd0'], [770, 390, 180, '#1fb5b0'], [480, 440, 120, '#d0407f']] as Array<[number, number, number, string]>) {
    ctx.fillStyle = col; ctx.globalAlpha = 0.07;
    for (let gx = -rr; gx <= rr; gx += 8) for (let gy = -rr; gy <= rr; gy += 8) if (((gx + gy) / 8) % 2 === 0 && Math.hypot(gx, gy) < rr * (0.7 + 0.12 * Math.sin(now * 0.0006 + cx))) ctx.fillRect(snap(cx + gx), snap(cy + gy), 8, 8);
  }
  ctx.globalAlpha = 1;
  ctx.save();
  for (let i = 0; i < 100; i++) {
    const drift = now * (0.008 + (i % 4) * 0.004);
    const x = ((i * 113 + 17 - drift) % width + width) % width;
    const y = (i * 67 + 23 + Math.sin(now * 0.00035 + i) * 5) % height;
    const opacity = 0.22 + 0.55 * ((Math.sin(now * 0.001 + i * 4.7) + 1) / 2);
    ctx.globalAlpha = opacity; ctx.fillStyle = i % 7 === 0 ? '#f8c96d' : '#a7d9ec';
    const size = i % 11 === 0 ? 4 : i % 3 === 0 ? 2 : 1;
    ctx.fillRect(Math.floor(x / 4) * 4, Math.floor(y / 4) * 4, size, size);
  }
  ctx.globalAlpha = 0.4 + 0.18 * Math.sin(now * 0.0012);
  ctx.fillStyle = modeIndex === 2 ? '#a06df0' : '#46e6d2';
  ctx.fillRect(Math.floor(width * 0.53 / 4) * 4, Math.floor(height * 0.29 / 4) * 4, 8, 4);
  ctx.globalAlpha = 1;
  const halo = ctx.createRadialGradient(width * 0.5, height * 0.5, 4, width * 0.5, height * 0.5, 230);
  halo.addColorStop(0, modeIndex === 2 ? 'rgba(152,75,228,.17)' : 'rgba(57,170,200,.11)'); halo.addColorStop(1, 'rgba(5,10,25,0)');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, width, height);
  // A faraway pixel planet bobs behind the duel while a short meteor crosses the sky.
  const pixel = (value: number) => Math.floor(value / 4) * 4;
  const planetX = pixel(width * 0.76 + Math.sin(now * 0.00032) * 12);
  const planetY = pixel(height * 0.29 + Math.sin(now * 0.00055) * 7);
  ctx.globalAlpha = 0.56;
  ctx.fillStyle = '#705cae';
  for (let i = 0; i < 11; i++) {
    const angle = i * Math.PI * 2 / 11;
    ctx.fillRect(pixel(planetX + 17 + Math.cos(angle) * 27), pixel(planetY + 13 + Math.sin(angle) * 18), 4, 4);
  }
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = '#514b9c'; ctx.fillRect(planetX, planetY + 4, 40, 24);
  ctx.fillStyle = '#7f77d0'; ctx.fillRect(planetX + 4, planetY, 28, 4); ctx.fillRect(planetX + 4, planetY + 28, 28, 4);
  ctx.fillStyle = '#a37ed4'; ctx.fillRect(planetX + 8, planetY + 8, 8, 4); ctx.fillRect(planetX + 24, planetY + 16, 8, 4);
  ctx.fillStyle = '#34386e'; ctx.fillRect(planetX + 4, planetY + 20, 12, 4);
  const cometX = ((now * 0.13) % (width + 120)) - 60;
  const cometY = height * 0.17 + Math.sin(now * 0.001) * 11;
  for (let i = 4; i >= 0; i--) {
    ctx.globalAlpha = (1 - i / 6) * 0.78;
    ctx.fillStyle = i === 0 ? '#fff6c8' : '#8fffea';
    ctx.fillRect(pixel(cometX - i * 10), pixel(cometY - i * 3), Math.max(4, 12 - i * 2), 4);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(119,134,195,.13)'; ctx.setLineDash([5, 10]); ctx.beginPath(); ctx.moveTo(width / 2, 32); ctx.lineTo(width / 2, height - 32); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(89,155,202,.18)'; ctx.beginPath(); ctx.ellipse(width / 2, height / 2, 190, 58, -0.19, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(74,99,159,.3)'; ctx.beginPath(); ctx.arc(width / 2 + 118, height / 2 - 14, 12, 0, Math.PI * 2); ctx.fill();

  for (const rock of sim.rocks) {
    const n = Math.max(2, Math.round(rock.r / 8));
    disc(ctx, rock.x, rock.y, n, '#6b7490'); disc(ctx, rock.x + 4, rock.y + 4, n - 1, '#4d546e');
    cell(ctx, rock.x - n * 8, rock.y - n * 8, 8, 8, '#a9b2cf');
    const k = Math.floor(rock.angle * 1.3) % 4; cell(ctx, rock.x + (k % 2 ? 8 : -8), rock.y + (k > 1 ? 8 : -4), 8, 8, '#2f3550');
  }
  for (const shot of sim.shots) {
    const c = colors[shot.owner]; const d = Math.sign(shot.vx) || 1;
    for (let t = 1; t <= 3; t++) { ctx.globalAlpha = 0.5 - t * 0.12; cell(ctx, shot.x - d * (14 + t * 12), shot.y - 4, 8, 8, c); }
    ctx.globalAlpha = 1;
    if (shot.kind === 'nova') { disc(ctx, shot.x, shot.y, 3, '#ef4fa1'); disc(ctx, shot.x, shot.y, 2, '#fff4fd'); }
    else if (shot.kind === 'missile') { cell(ctx, shot.x - 16, shot.y - 4, 28, 8, '#f7f1da'); cell(ctx, shot.x + 12, shot.y - 4, 8, 8, '#ee4ea0'); cell(ctx, shot.x - 28, shot.y - 4, 12, 8, '#ff9d43'); }
    else if (shot.kind === 'fan') { cell(ctx, shot.x - 8, shot.y - 4, 16, 8, c); }
    else { cell(ctx, shot.x - 14, shot.y - 4, 28, 8, c); cell(ctx, shot.x - 6, shot.y - 4, 16, 4, '#ffffff'); }
  }
  ctx.shadowBlur = 0;
  for (const burst of sim.bursts) {
    const ratio = burst.life / burst.max;
    ctx.globalAlpha = Math.max(0.05, ratio);
    if (burst.kind === 'beam') { ctx.strokeStyle = burst.color; ctx.lineWidth = 11 * ratio + 2; ctx.shadowBlur = 19; ctx.shadowColor = burst.color; ctx.beginPath(); ctx.moveTo(burst.x, burst.y); ctx.lineTo(burst.x < width / 2 ? width - 60 : 60, burst.y); ctx.stroke(); ctx.shadowBlur = 0; }
    else { ctx.strokeStyle = burst.color; ctx.lineWidth = burst.kind === 'nova' ? 3 : 2; ctx.beginPath(); ctx.arc(burst.x, burst.y, burst.size * (1 - ratio * 0.65), 0, Math.PI * 2); ctx.stroke(); if (burst.kind === 'nova') { ctx.fillStyle = burst.color; ctx.globalAlpha = 0.12 * ratio; ctx.beginPath(); ctx.arc(burst.x, burst.y, burst.size * 0.68, 0, Math.PI * 2); ctx.fill(); } }
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < 2; i++) {
    const pilot = sim.pilots[i]; const dir = i === 0 ? 1 : -1; const pal = PAL[i];
    if (now < pilot.invulnerableUntil && Math.floor(now / 80) % 2 === 0) continue;
    const white = now < pilot.flashUntil; const py = snap(pilot.y); const px0 = snap(pilot.x);
    if (now < pilot.invulnerableUntil) { ctx.strokeStyle = pal.m; ctx.globalAlpha = 0.6; ctx.lineWidth = 4; ctx.strokeRect(px0 - 40, py - 32, 80, 64); ctx.globalAlpha = 1; }
    const fl = 1 + (Math.floor(now / 70) % 3);
    for (let k = 0; k < fl; k++) cell(ctx, px0 + dir * (-4 * 8 - k * 8) - 4, py - 4, 8, 8, k === 0 ? '#fff0b0' : k === 1 ? '#ffb838' : '#ee6a3a');
    SHIP.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch === '.') return;
      const color = white ? '#ffffff' : ch === 'm' ? pal.m : ch === 'd' ? pal.d : ch === 'n' ? pal.n : '#0c1528';
      cell(ctx, px0 + dir * (c - 3) * 8 - 4, py + (r - 2) * 8 - 4, 8, 8, color);
    }));
    cell(ctx, px0 + dir * 1 * 8 - 4, py - 12, 8, 4, white ? '#fff' : pal.n);
  }
  ctx.restore();
}
