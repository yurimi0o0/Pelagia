// 敵弾。こちらもプール化。パターン関数を増やしていけば弾幕の種類を足せる形にしておく。
Game.enemyBullets = Game.createPool(Game.CONFIG.pool.enemyBullets, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 0,
  life: 0,
}));

// 全方位ばらまき（ジェリーフィッシュのパルス攻撃、というテイスト）。
Game.fireRadialBurst = function fireRadialBurst(x, y) {
  const cfg = Game.CONFIG.enemyBullet;
  for (let i = 0; i < cfg.count; i += 1) {
    const angle = (Math.PI * 2 * i) / cfg.count;
    Game.enemyBullets.spawn((b) => {
      b.x = x;
      b.y = y;
      b.vx = Math.cos(angle) * cfg.speed;
      b.vy = Math.sin(angle) * cfg.speed;
      b.radius = cfg.radius;
      b.life = cfg.lifetime;
    });
  }
};

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
    ctx.fillStyle = cfg.glowColor;
    ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = cfg.color;
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};
