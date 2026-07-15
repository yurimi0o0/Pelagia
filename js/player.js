Game.player = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  prevX: 0,
  prevY: 0,
  velocityX: 0,
  velocityY: 0,
  tilt: 0,
  sway: 0,
  shotTimer: 0,
  missFlashTimer: 0,
  dragAnchorX: 0,
  dragAnchorY: 0,
};

Game.player.init = function init() {
  const cfg = Game.CONFIG.player;
  const p = Game.player;
  p.x = p.targetX = p.prevX = cfg.startX;
  p.y = p.targetY = p.prevY = cfg.startY;
  p.velocityX = 0;
  p.velocityY = 0;
  p.tilt = 0;
  p.sway = 0;
  p.shotTimer = 0;
  p.missFlashTimer = 0;
};

// 自機の現在位置(x,y)基準の「掴める範囲」。判定円の少し上〜足元の少し下まで。
// ここに触れた時だけドラッグ開始できる(タップでその場に飛ぶ操作は廃止)。
Game.player.isPointInGrabZone = function isPointInGrabZone(worldX, worldY) {
  const cfg = Game.CONFIG.player;
  const p = Game.player;
  const left = p.x - cfg.spriteWidth / 2 - cfg.grabPaddingX;
  const right = p.x + cfg.spriteWidth / 2 + cfg.grabPaddingX;
  const top = p.y + cfg.hitOffsetY - cfg.grabTopPadding;
  const bottom = p.y + cfg.spriteHeight / 2 + cfg.grabBottomPadding;
  return worldX >= left && worldX <= right && worldY >= top && worldY <= bottom;
};

// 掴んだ瞬間の指と自機の相対位置(アンカー)を覚えておく。以後はこのオフセットを保ったまま
// 指に追従させるので、ドラッグ開始時に自機がその場から動かない(=タップで飛ばない)。
Game.player.beginDrag = function beginDrag(worldX, worldY) {
  const p = Game.player;
  p.dragAnchorX = worldX - p.x;
  p.dragAnchorY = worldY - p.y;
};

Game.player.dragTo = function dragTo(worldX, worldY) {
  const cfg = Game.CONFIG.player;
  const p = Game.player;
  const halfW = cfg.spriteWidth / 2;
  const halfH = cfg.spriteHeight / 2;
  p.targetX = Game.clamp(worldX - p.dragAnchorX, halfW, Game.CONFIG.world.width - halfW);
  p.targetY = Game.clamp(worldY - p.dragAnchorY, halfH, Game.CONFIG.world.height - halfH);
};

// 被弾時の処理。位置は動かさず、その場で無敵時間ぶん点滅させるだけにする
// (以前は強制的に中央へ戻していたが、プレイ感を損なうため廃止)。
Game.player.applyMiss = function applyMiss() {
  const cfg = Game.CONFIG.miss;
  Game.player.missFlashTimer = cfg.flashDuration;
};

Game.player.update = function update(dt) {
  const cfg = Game.CONFIG.player;
  const p = Game.player;

  p.prevX = p.x;
  p.prevY = p.y;
  p.x = Game.damp(p.x, p.targetX, cfg.followStrength, dt);
  p.y = Game.damp(p.y, p.targetY, cfg.followStrength, dt);

  const halfW = cfg.spriteWidth / 2;
  const halfH = cfg.spriteHeight / 2;
  p.x = Game.clamp(p.x, halfW, Game.CONFIG.world.width - halfW);
  p.y = Game.clamp(p.y, halfH, Game.CONFIG.world.height - halfH);

  p.velocityX = (p.x - p.prevX) / Math.max(dt, 0.0001);
  p.velocityY = (p.y - p.prevY) / Math.max(dt, 0.0001);

  const desiredTilt = Game.clamp(
    p.velocityX * cfg.tiltFromVelocity,
    -cfg.maxTiltRad,
    cfg.maxTiltRad,
  );
  p.tilt = Game.damp(p.tilt, desiredTilt, cfg.tiltResponsiveness, dt);

  const desiredSway = Game.clamp(-p.velocityX * cfg.swayStrength * 0.01, -1, 1);
  p.sway = Game.damp(p.sway, desiredSway, cfg.swayResponsiveness, dt);

  if (p.missFlashTimer > 0) {
    p.missFlashTimer = Math.max(0, p.missFlashTimer - dt);
  }

  // オートショット：押しっぱなし不要、一定間隔で自動連射する。
  const shotCfg = Game.CONFIG.shot;
  p.shotTimer -= dt;
  if (p.shotTimer <= 0) {
    p.shotTimer += shotCfg.interval;
    Game.spawnPlayerBullet(p.x, p.y + shotCfg.muzzleOffsetY);
  }
};

Game.player.isInvulnerable = function isInvulnerable() {
  return Game.player.missFlashTimer > 0;
};

Game.player.drawSway = function drawSway(ctx) {
  const p = Game.player;
  const baseY = p.y + 22;
  const starts = [-24, -14, -5, 6, 16, 25];

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  starts.forEach((startX, index) => {
    const side = startX < 0 ? -1 : 1;
    const length = 44 + (index % 3) * 10;
    const sway = p.sway * (12 + index * 1.4);
    const x = p.x + startX;
    const y = baseY + Math.abs(startX) * 0.18;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + sway * 0.55 - side * 5,
      y + length * 0.32,
      x + sway + side * 5,
      y + length * 0.68,
      x + sway * 0.35,
      y + length,
    );
    ctx.strokeStyle = index % 2 === 0 ? Game.CONFIG.colors.sway : Game.CONFIG.colors.swayAccent;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + sway * 0.35, y + length, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232, 242, 255, 0.55)";
    ctx.fill();
  });

  ctx.restore();
};

Game.player.draw = function draw(ctx) {
  const cfg = Game.CONFIG.player;
  const p = Game.player;

  ctx.save();
  if (p.missFlashTimer > 0) {
    const blinkOn = Math.floor(p.missFlashTimer / Game.CONFIG.miss.flashInterval) % 2 === 0;
    ctx.globalAlpha = blinkOn ? 0.3 : 1;
  }

  ctx.translate(p.x, p.y);
  ctx.rotate(p.tilt);

  const shouldDrawImage = Game.assets.playerBackReady && !cfg.isPlaceholder;
  if (shouldDrawImage) {
    ctx.drawImage(
      Game.assets.playerBack,
      -cfg.spriteWidth / 2,
      -cfg.spriteHeight / 2,
      cfg.spriteWidth,
      cfg.spriteHeight,
    );
  } else {
    Game.drawFallbackPlayer(ctx, cfg.spriteWidth, cfg.spriteHeight);
  }

  ctx.restore();
};

// 本番画像未設定でも操作感を見られるよう、この子の配色に寄せた簡易シルエットを描く。
Game.drawFallbackPlayer = function drawFallbackPlayer(ctx, w, h) {
  ctx.save();
  ctx.shadowColor = "rgba(130, 175, 255, 0.35)";
  ctx.shadowBlur = 8;

  const hairGradient = ctx.createLinearGradient(0, -h * 0.48, 0, -h * 0.12);
  hairGradient.addColorStop(0, "#d9f4ff");
  hairGradient.addColorStop(1, "#7fbdf3");
  ctx.fillStyle = hairGradient;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.31, w * 0.32, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7b75d7";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "rgba(246, 244, 255, 0.92)";
  ctx.beginPath();
  ctx.moveTo(-w * 0.24, -h * 0.1);
  ctx.quadraticCurveTo(0, -h * 0.2, w * 0.24, -h * 0.1);
  ctx.lineTo(w * 0.16, h * 0.14);
  ctx.quadraticCurveTo(0, h * 0.2, -w * 0.16, h * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const skirtGradient = ctx.createLinearGradient(0, h * 0.04, 0, h * 0.34);
  skirtGradient.addColorStop(0, "#d9f2ff");
  skirtGradient.addColorStop(1, "#8bbdf7");
  ctx.fillStyle = skirtGradient;
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, h * 0.08);
  ctx.quadraticCurveTo(0, h * 0.28, w * 0.42, h * 0.08);
  ctx.quadraticCurveTo(w * 0.32, h * 0.34, 0, h * 0.31);
  ctx.quadraticCurveTo(-w * 0.32, h * 0.34, -w * 0.42, h * 0.08);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(105, 155, 229, 0.82)";
  ctx.lineWidth = 3;
  [-9, 9].forEach((legX) => {
    ctx.beginPath();
    ctx.moveTo(legX, h * 0.26);
    ctx.lineTo(legX, h * 0.47);
    ctx.stroke();
  });

  ctx.fillStyle = "#9bd2ff";
  [-10, 10].forEach((shoeX) => {
    ctx.beginPath();
    ctx.ellipse(shoeX, h * 0.5, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
};

Game.player.drawHitCircle = function drawHitCircle(ctx) {
  const cfg = Game.CONFIG.player;
  const p = Game.player;
  const hitX = p.x + cfg.hitOffsetX;
  const hitY = p.y + cfg.hitOffsetY;
  const invuln = Game.player.isInvulnerable();

  ctx.save();
  ctx.beginPath();
  ctx.arc(hitX, hitY, cfg.hitRadius, 0, Math.PI * 2);
  ctx.fillStyle = Game.CONFIG.colors.hitFill;
  ctx.fill();
  ctx.lineWidth = invuln ? 2 : 1.5;
  ctx.strokeStyle = invuln ? Game.CONFIG.colors.hitStrokeInvuln : Game.CONFIG.colors.hitStroke;
  ctx.stroke();
  ctx.restore();
};
