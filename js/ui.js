// メニュー/HUD/ボスHPバーの描画とタップ判定。ワールド座標(360x640)固定でレイアウトする。
(function () {
  const RECTS = {
    stage1Button: { x: 90, y: 300, w: 180, h: 60 },
    backToTitle: { x: 16, y: 16, w: 90, h: 30 },
    resume: { x: 90, y: 330, w: 180, h: 50 },
    quitToTitle: { x: 90, y: 396, w: 180, h: 50 },
    retry: { x: 90, y: 360, w: 180, h: 50 },
    toTitle: { x: 90, y: 426, w: 180, h: 50 },
  };

  function hitRect(x, y, rect) {
    return !!rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawButton(ctx, rect, label, fontSize) {
    const ui = Game.CONFIG.ui;
    ctx.save();
    ctx.fillStyle = ui.buttonFill;
    ctx.strokeStyle = ui.buttonStroke;
    ctx.lineWidth = 1.5;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ui.textColor;
    ctx.font = `600 ${fontSize || 18}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.restore();
  }

  function drawDim(ctx, fill) {
    const w = Game.CONFIG.world;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, w.width, w.height);
  }

  Game.drawTitle = function drawTitle(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, "rgba(8, 12, 24, 0.35)");

    ctx.textAlign = "center";
    ctx.fillStyle = ui.textColor;
    ctx.font = "700 46px sans-serif";
    ctx.fillText("PELAGIA", w.width / 2, 260);

    ctx.font = "500 14px sans-serif";
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText("bullet-dodge under the sea", w.width / 2, 292);

    if (Math.floor(performance.now() / 500) % 2 === 0) {
      ctx.font = "600 16px sans-serif";
      ctx.fillStyle = ui.textColor;
      ctx.fillText("TAP TO START", w.width / 2, 430);
    }
    ctx.restore();
  };

  Game.drawStageSelect = function drawStageSelect(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, "rgba(8, 12, 24, 0.35)");

    ctx.textAlign = "center";
    ctx.fillStyle = ui.textColor;
    ctx.font = "700 24px sans-serif";
    ctx.fillText("STAGE SELECT", w.width / 2, 120);

    drawButton(ctx, RECTS.stage1Button, "STAGE 1");
    drawButton(ctx, RECTS.backToTitle, "< タイトル", 12);
    ctx.restore();
  };

  Game.drawPauseOverlay = function drawPauseOverlay(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, ui.overlayFill);

    ctx.textAlign = "center";
    ctx.fillStyle = ui.textColor;
    ctx.font = "700 30px sans-serif";
    ctx.fillText("PAUSED", w.width / 2, 270);

    drawButton(ctx, RECTS.resume, "つづける");
    drawButton(ctx, RECTS.quitToTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawGameOver = function drawGameOver(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, ui.overlayFill);

    ctx.textAlign = "center";
    ctx.fillStyle = ui.textColor;
    ctx.font = "700 30px sans-serif";
    ctx.fillText("GAME OVER", w.width / 2, 250);

    ctx.font = "500 16px sans-serif";
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText(`SCORE ${Game.score}`, w.width / 2, 285);

    drawButton(ctx, RECTS.retry, "リトライ");
    drawButton(ctx, RECTS.toTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawStageClear = function drawStageClear(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, ui.overlayFill);

    ctx.textAlign = "center";
    ctx.fillStyle = ui.textColor;
    ctx.font = "700 28px sans-serif";
    ctx.fillText("STAGE CLEAR", w.width / 2, 250);

    ctx.font = "500 16px sans-serif";
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText(`SCORE ${Game.score}`, w.width / 2, 285);

    drawButton(ctx, RECTS.toTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawHUD = function drawHUD(ctx) {
    const ui = Game.CONFIG.ui;
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.font = "600 11px sans-serif";
    ctx.fillStyle = ui.textColor;
    ctx.fillText("LIFE", 14, 20);
    for (let i = 0; i < Game.lives; i += 1) {
      ctx.beginPath();
      ctx.fillStyle = ui.lifeColor;
      ctx.arc(46 + i * 16, 16, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "600 13px sans-serif";
    ctx.fillStyle = ui.textColor;
    ctx.fillText(`SCORE ${Game.score}`, 14, 36);

    const pb = ui.pauseButton;
    ctx.fillStyle = ui.buttonFill;
    ctx.strokeStyle = ui.buttonStroke;
    ctx.lineWidth = 1.5;
    roundRect(ctx, pb.x, pb.y, pb.w, pb.h, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ui.textColor;
    ctx.fillRect(pb.x + 9, pb.y + 7, 4, 16);
    ctx.fillRect(pb.x + 17, pb.y + 7, 4, 16);

    ctx.restore();
  };

  Game.drawBossBar = function drawBossBar(ctx) {
    const boss = Game.activeBoss;
    if (!boss) return;
    const def = Game.BOSS_DEFS[boss.key];
    const ui = Game.CONFIG.ui;
    const barX = 20;
    const barY = 46;
    const barW = 320;
    const barH = 10;
    const ratio = Math.max(boss.hp, 0) / boss.maxHp;

    ctx.save();
    ctx.textAlign = "left";
    ctx.font = "600 12px sans-serif";
    ctx.fillStyle = ui.textColor;
    ctx.fillText(def.name, barX, barY - 4);

    ctx.fillStyle = "rgba(10, 14, 24, 0.55)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = boss.isMainBoss ? "rgba(214, 196, 255, 0.9)" : "rgba(255, 157, 122, 0.9)";
    ctx.fillRect(barX, barY, barW * ratio, barH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1);
    ctx.restore();
  };

  Game.isPauseButtonHit = function isPauseButtonHit(x, y) {
    return hitRect(x, y, Game.CONFIG.ui.pauseButton);
  };

  Game.handleTap = function handleTap(x, y) {
    const S = Game.STATES;

    if (Game.state === S.TITLE) {
      Game.setState(S.STAGE_SELECT);
      return;
    }

    if (Game.state === S.STAGE_SELECT) {
      if (hitRect(x, y, RECTS.stage1Button)) Game.startRun();
      else if (hitRect(x, y, RECTS.backToTitle)) Game.setState(S.TITLE);
      return;
    }

    if (Game.state === S.PAUSED) {
      if (hitRect(x, y, RECTS.resume)) Game.setState(S.PLAYING);
      else if (hitRect(x, y, RECTS.quitToTitle)) Game.setState(S.TITLE);
      return;
    }

    if (Game.state === S.GAME_OVER) {
      if (hitRect(x, y, RECTS.retry)) Game.startRun();
      else if (hitRect(x, y, RECTS.toTitle)) Game.setState(S.TITLE);
      return;
    }

    if (Game.state === S.STAGE_CLEAR) {
      if (hitRect(x, y, RECTS.toTitle)) Game.setState(S.TITLE);
    }
  };
})();
