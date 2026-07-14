Game.circleHit = function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
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
    if (hit || !b.active) return;
    if (Game.circleHit(hx, hy, hr, b.x, b.y, b.radius)) {
      b.active = false;
      hit = true;
    }
  });

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
