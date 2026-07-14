Game.circleHit = function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
};

// 点と線分の最短距離の2乗(線分を点t=[0,1]にクランプして射影する標準的な式)。
Game.pointSegmentDistSq = function pointSegmentDistSq(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq > 0 ? ((px - x1) * dx + (py - y1) * dy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + dx * t;
  const cy = y1 + dy * t;
  const ex = px - cx;
  const ey = py - cy;
  return ex * ex + ey * ey;
};

Game.laserHit = function laserHit(px, py, pr, laser) {
  if (laser.phase !== "fire") return false; // warn/fadeは無害
  const x2 = laser.x + Math.cos(laser.angle) * laser.length;
  const y2 = laser.y + Math.sin(laser.angle) * laser.length;
  const r = pr + laser.fireWidth / 2;
  return Game.pointSegmentDistSq(px, py, laser.x, laser.y, x2, y2) <= r * r;
};

Game.resolveCollisions = function resolveCollisions() {
  // 自機弾 → 雑魚・ボス
  Game.playerBullets.forEachActive((b) => {
    if (!b.active) return;

    for (let i = 0; i < Game.grunts.length; i += 1) {
      const g = Game.grunts[i];
      if (!g.alive) continue;
      if (Game.circleHit(b.x, b.y, b.radius, g.x, g.y, g.radius)) {
        b.active = false;
        Game.damageGrunt(g, Game.CONFIG.shot.damage);
        return;
      }
    }

    const boss = Game.activeBoss;
    if (boss && boss.alive && !boss.defeated && Game.circleHit(b.x, b.y, b.radius, boss.x, boss.y, boss.radius)) {
      b.active = false;
      Game.damageBoss(boss, Game.CONFIG.shot.damage);
    }
  });

  if (Game.player.isInvulnerable()) return;

  const cfg = Game.CONFIG.player;
  const hx = Game.player.x + cfg.hitOffsetX;
  const hy = Game.player.y + cfg.hitOffsetY;
  const hr = cfg.hitRadius;
  let hit = false;

  Game.enemyBullets.forEachActive((b) => {
    if (hit || !b.active || b.fake) return; // 囮弾は見た目だけで当たり判定を持たない
    if (Game.circleHit(hx, hy, hr, b.x, b.y, b.radius)) {
      b.active = false;
      hit = true;
    }
  });

  if (!hit) {
    Game.enemyLasers.forEachActive((l) => {
      if (hit) return;
      if (Game.laserHit(hx, hy, hr, l)) hit = true;
    });
  }

  if (!hit) {
    for (let i = 0; i < Game.grunts.length && !hit; i += 1) {
      const g = Game.grunts[i];
      if (g.alive && Game.circleHit(hx, hy, hr, g.x, g.y, g.radius)) hit = true;
    }
  }

  if (!hit) {
    const boss = Game.activeBoss;
    if (boss && boss.alive && !boss.defeated && Game.circleHit(hx, hy, hr, boss.x, boss.y, boss.radius)) {
      hit = true;
    }
  }

  if (hit) Game.onPlayerHit();
};
