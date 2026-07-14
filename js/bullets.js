// 自機ショット。プール化して生成/破棄コストを避ける。
Game.playerBullets = Game.createPool(Game.CONFIG.pool.playerBullets, () => ({
  x: 0,
  y: 0,
  vy: 0,
  radius: 0,
}));

Game.spawnPlayerBullet = function spawnPlayerBullet(x, y) {
  const cfg = Game.CONFIG.shot;
  Game.playerBullets.spawn((b) => {
    b.x = x;
    b.y = y;
    b.vy = -cfg.speed;
    b.radius = cfg.radius;
  });
};

Game.updatePlayerBullets = function updatePlayerBullets(dt) {
  Game.playerBullets.forEachActive((b) => {
    b.y += b.vy * dt;
    if (b.y < -20) b.active = false;
  });
};

Game.drawPlayerBullets = function drawPlayerBullets(ctx) {
  const cfg = Game.CONFIG.shot;
  ctx.save();
  Game.playerBullets.forEachActive((b) => {
    ctx.beginPath();
    ctx.fillStyle = cfg.glowColor;
    ctx.arc(b.x, b.y, b.radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = cfg.color;
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};
