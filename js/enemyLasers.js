// 直線レーザー。enemyBullets.jsの点弾プールとは別プールにする
// (warn/fire/fadeという時間経過フェーズを持つ点で点弾と性質が違うため)。
// warnフェーズは予告線のみで無害、fireフェーズだけ実際に当たる。
Game.enemyLasers = Game.createPool(Game.CONFIG.pool.enemyLasers, () => ({
  x: 0,
  y: 0,
  angle: 0,
  angularVelocity: 0,
  length: 0,
  phase: "warn", // "warn" -> "fire" -> "fade"
  age: 0,
  phaseAge: 0,
  warnDuration: 0,
  fireDuration: 0,
  fadeDuration: 0,
  warnWidth: 0,
  fireWidth: 0,
  color: null,
  glowColor: null,
  warnColor: null,
  followBoss: false, // trueならbossRefの座標を毎フレーム追う(触手レーザーのように本体基準で動く)
  bossRef: null,
}));

Game.fireLaser = function fireLaser(x, y, angle, opts) {
  const cfg = Game.CONFIG.enemyLaser;
  return Game.enemyLasers.spawn((l) => {
    l.x = x;
    l.y = y;
    l.angle = angle;
    l.angularVelocity = (opts && opts.angularVelocity) || 0;
    l.length = (opts && opts.length) || cfg.length;
    l.phase = "warn";
    l.age = 0;
    l.phaseAge = 0;
    l.warnDuration = (opts && opts.warnDuration) != null ? opts.warnDuration : cfg.warnDuration;
    l.fireDuration = (opts && opts.fireDuration) != null ? opts.fireDuration : cfg.fireDuration;
    l.fadeDuration = (opts && opts.fadeDuration) != null ? opts.fadeDuration : cfg.fadeDuration;
    l.warnWidth = (opts && opts.warnWidth) || cfg.warnWidth;
    l.fireWidth = (opts && opts.fireWidth) || cfg.fireWidth;
    l.color = (opts && opts.color) || cfg.color;
    l.glowColor = (opts && opts.glowColor) || cfg.glowColor;
    l.warnColor = (opts && opts.warnColor) || cfg.warnColor;
    l.followBoss = !!(opts && opts.followBoss);
    l.bossRef = (opts && opts.bossRef) || null;
  });
};

Game.updateEnemyLasers = function updateEnemyLasers(dt) {
  Game.enemyLasers.forEachActive((l) => {
    l.age += dt;
    l.phaseAge += dt;
    l.angle += l.angularVelocity * dt;
    if (l.followBoss && l.bossRef) {
      l.x = l.bossRef.x;
      l.y = l.bossRef.y;
    }

    if (l.phase === "warn" && l.phaseAge >= l.warnDuration) {
      l.phase = "fire";
      l.phaseAge = 0;
    } else if (l.phase === "fire" && l.phaseAge >= l.fireDuration) {
      l.phase = "fade";
      l.phaseAge = 0;
    } else if (l.phase === "fade" && l.phaseAge >= l.fadeDuration) {
      l.active = false;
    }
  });
};

// パターン切り替え/ボス撃破など、レーザーを寿命前に強制終了させたい時に使う。
Game.clearActiveLasers = function clearActiveLasers() {
  Game.enemyLasers.items.forEach((l) => { l.active = false; });
};

Game.drawEnemyLasers = function drawEnemyLasers(ctx) {
  Game.enemyLasers.forEachActive((l) => {
    const x2 = l.x + Math.cos(l.angle) * l.length;
    const y2 = l.y + Math.sin(l.angle) * l.length;

    ctx.save();
    if (l.phase === "warn") {
      // 予告線：明滅する細い線で「ここに来る」ことだけ伝える。まだ当たらない。
      const blinkOn = Math.floor(l.age / 0.12) % 2 === 0;
      ctx.globalAlpha = blinkOn ? 0.85 : 0.3;
      ctx.strokeStyle = l.warnColor;
      ctx.lineWidth = l.warnWidth;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else {
      const fadeAlpha = l.phase === "fade" ? Math.max(0, 1 - l.phaseAge / l.fadeDuration) : 1;
      ctx.globalAlpha = fadeAlpha;

      ctx.strokeStyle = l.glowColor;
      ctx.lineWidth = l.fireWidth * 2.1;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.fireWidth;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = Math.max(1, l.fireWidth * 0.35);
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  });
};
