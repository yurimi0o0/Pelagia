// 敵は数が少ないので配列で管理（数百規模になる弾だけプール化すれば十分）。
Game.enemies = [];

Game.spawnEnemy = function spawnEnemy(defKey, x, y) {
  const def = Game.CONFIG.enemy[defKey];
  const enemy = {
    defKey,
    x,
    y,
    baseX: x,
    baseY: y,
    hp: def.hp,
    maxHp: def.hp,
    radius: def.radius,
    age: 0,
    shotTimer: def.shotInterval * 0.5,
    alive: true,
  };
  Game.enemies.push(enemy);
  return enemy;
};

Game.spawnStage = function spawnStage(stage) {
  stage.spawns.forEach((s) => Game.spawnEnemy(s.type, s.x, s.y));
};

Game.damageEnemy = function damageEnemy(enemy, amount) {
  enemy.hp -= amount;
  if (enemy.hp <= 0) enemy.alive = false;
};

Game.updateEnemies = function updateEnemies(dt) {
  const enemies = Game.enemies;
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const e = enemies[i];
    const def = Game.CONFIG.enemy[e.defKey];

    e.age += dt;
    e.x = e.baseX + Math.sin(e.age * def.bobSpeed) * def.bobAmplitude;

    e.shotTimer -= dt;
    if (e.shotTimer <= 0) {
      e.shotTimer += def.shotInterval;
      Game.fireRadialBurst(e.x, e.y);
    }

    if (!e.alive) enemies.splice(i, 1);
  }
};

Game.drawEnemies = function drawEnemies(ctx) {
  Game.enemies.forEach((e) => {
    const def = Game.CONFIG.enemy[e.defKey];

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.arc(0, 0, e.radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = def.color;
    ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = def.coreColor;
    ctx.arc(0, 0, e.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const barW = e.radius * 2;
    const barH = 4;
    const hpRatio = Math.max(e.hp, 0) / e.maxHp;
    ctx.save();
    ctx.translate(e.x - barW / 2, e.y - e.radius - 12);
    ctx.fillStyle = "rgba(10, 14, 24, 0.55)";
    ctx.fillRect(0, 0, barW, barH);
    ctx.fillStyle = "#ffe3ef";
    ctx.fillRect(0, 0, barW * hpRatio, barH);
    ctx.restore();

    if (Game.CONFIG.debug.showEnemyHitCircle) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  });
};
