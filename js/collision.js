Game.circleHit = function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
};

Game.resolveCollisions = function resolveCollisions() {
  Game.playerBullets.forEachActive((b) => {
    if (!b.active) return;
    for (let i = 0; i < Game.enemies.length; i += 1) {
      const e = Game.enemies[i];
      if (!e.alive) continue;
      if (Game.circleHit(b.x, b.y, b.radius, e.x, e.y, e.radius)) {
        b.active = false;
        Game.damageEnemy(e, Game.CONFIG.shot.damage);
        break;
      }
    }
  });

  if (!Game.player.isInvulnerable()) {
    const cfg = Game.CONFIG.player;
    const hx = Game.player.x + cfg.hitOffsetX;
    const hy = Game.player.y + cfg.hitOffsetY;
    const hr = cfg.hitRadius;

    Game.enemyBullets.forEachActive((b) => {
      if (!b.active || Game.player.isInvulnerable()) return;
      if (Game.circleHit(hx, hy, hr, b.x, b.y, b.radius)) {
        b.active = false;
        Game.player.applyMiss();
      }
    });
  }
};
