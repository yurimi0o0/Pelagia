// 敵弾。プール化した上で、角度/リング/自機狙いなど複数パターンから同じプールへ生成する。
// 見た目(color/glowColor/radius)は呼び出し側でパターンごとに上書きできる。
Game.enemyBullets = Game.createPool(Game.CONFIG.pool.enemyBullets, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 0,
  life: 0,
  color: null,
  glowColor: null,
}));

(function () {
  function spawnEnemyBullet(x, y, vx, vy, opts) {
    const cfg = Game.CONFIG.enemyBullet;
    return Game.enemyBullets.spawn((b) => {
      b.x = x;
      b.y = y;
      b.vx = vx;
      b.vy = vy;
      b.radius = (opts && opts.radius) || cfg.radius;
      b.life = (opts && opts.life) || cfg.lifetime;
      b.color = (opts && opts.color) || null;
      b.glowColor = (opts && opts.glowColor) || null;
    });
  }

  Game.fireAngledBullet = function fireAngledBullet(x, y, angle, speed, opts) {
    return spawnEnemyBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, opts);
  };

  // 全方位に count 発。rotationOffset で開始角をずらせるので、回転リングにも使える。
  Game.fireRing = function fireRing(x, y, count, rotationOffset, speed, opts) {
    for (let i = 0; i < count; i += 1) {
      const angle = rotationOffset + (Math.PI * 2 * i) / count;
      spawnEnemyBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, opts);
    }
  };
})();

Game.updateEnemyBullets = function updateEnemyBullets(dt) {
  const w = Game.CONFIG.world;
  Game.enemyBullets.forEachActive((b) => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0 || b.x < -20 || b.x > w.width + 20 || b.y < -20 || b.y > w.height + 20) {
      b.active = false;
    }
  });
};

Game.drawEnemyBullets = function drawEnemyBullets(ctx) {
  const cfg = Game.CONFIG.enemyBullet;
  ctx.save();
  Game.enemyBullets.forEachActive((b) => {
    ctx.beginPath();
    ctx.fillStyle = b.glowColor || cfg.glowColor;
    ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = b.color || cfg.color;
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};
