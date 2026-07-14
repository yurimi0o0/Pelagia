// メニュー/HUD/ボスHPバーの描画とタップ判定。ワールド座標(360x640)固定でレイアウトする。
// 神話的な雰囲気にするため、セリフ体＋金/真珠色のアクセントと、
// 石版のような二重枠+四隅の金具で装飾する（drawTabletFrame）。
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

  // 石版風の二重枠＋四隅の金具。ボタン/パネルはすべてこの上にテキストを乗せる。
  function drawTabletFrame(ctx, rect) {
    const ui = Game.CONFIG.ui;
    ctx.save();
    ctx.fillStyle = ui.buttonFill;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 4);
    ctx.fill();

    ctx.strokeStyle = ui.accentGoldDim;
    ctx.lineWidth = 1;
    roundRect(ctx, rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 2);
    ctx.stroke();

    ctx.strokeStyle = ui.buttonStroke;
    ctx.lineWidth = 1.5;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 4);
    ctx.stroke();

    const tick = 6;
    ctx.strokeStyle = ui.accentGold;
    ctx.lineWidth = 1.5;
    [
      [rect.x, rect.y, 1, 1],
      [rect.x + rect.w, rect.y, -1, 1],
      [rect.x, rect.y + rect.h, 1, -1],
      [rect.x + rect.w, rect.y + rect.h, -1, -1],
    ].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * tick);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * tick, y);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawButton(ctx, rect, label, fontSize) {
    const ui = Game.CONFIG.ui;
    drawTabletFrame(ctx, rect);
    ctx.save();
    ctx.fillStyle = ui.textColor;
    ctx.font = `600 ${fontSize || 17}px ${ui.bodyFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.restore();
  }

  // 見出しの下に添える、菱形の飾りを中心に置いた区切り線。
  function drawDivider(ctx, cx, y, width) {
    const ui = Game.CONFIG.ui;
    ctx.save();
    ctx.strokeStyle = ui.accentGoldDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - width / 2, y);
    ctx.lineTo(cx - 9, y);
    ctx.moveTo(cx + 9, y);
    ctx.lineTo(cx + width / 2, y);
    ctx.stroke();

    ctx.fillStyle = ui.accentGold;
    ctx.beginPath();
    ctx.moveTo(cx, y - 5);
    ctx.lineTo(cx + 5, y);
    ctx.lineTo(cx, y + 5);
    ctx.lineTo(cx - 5, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 淡い後光を重ねた見出し文字。
  function drawGlowTitle(ctx, text, cx, cy, fontSize) {
    const ui = Game.CONFIG.ui;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${fontSize}px ${ui.titleFont}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";

    ctx.shadowColor = "rgba(248, 231, 184, 0.55)";
    ctx.shadowBlur = 22;
    ctx.fillStyle = ui.accentGoldBright;
    ctx.fillText(text, cx, cy);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = ui.textColor;
    ctx.fillText(text, cx, cy);
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
    drawDim(ctx, "rgba(6, 10, 20, 0.42)");

    drawGlowTitle(ctx, "PELAGIA", w.width / 2, 250, 48);
    drawDivider(ctx, w.width / 2, 278, 200);

    ctx.textAlign = "center";
    ctx.font = `italic 400 14px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText("— 海神たちの眠る聖域 —", w.width / 2, 302);

    if (Math.floor(performance.now() / 500) % 2 === 0) {
      ctx.font = `600 15px ${ui.bodyFont}`;
      ctx.fillStyle = ui.accentGold;
      ctx.fillText("TAP TO BEGIN", w.width / 2, 430);
    }
    ctx.restore();
  };

  Game.drawStageSelect = function drawStageSelect(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, "rgba(6, 10, 20, 0.42)");

    drawGlowTitle(ctx, "STAGE SELECT", w.width / 2, 108, 22);
    drawDivider(ctx, w.width / 2, 128, 160);

    drawTabletFrame(ctx, RECTS.stage1Button);
    ctx.textAlign = "center";
    ctx.fillStyle = ui.accentGoldBright;
    ctx.font = `700 20px ${ui.titleFont}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("STAGE I", RECTS.stage1Button.x + RECTS.stage1Button.w / 2, RECTS.stage1Button.y + 32);
    ctx.fillStyle = ui.subTextColor;
    ctx.font = `400 12px ${ui.bodyFont}`;
    ctx.fillText("深海の回廊", RECTS.stage1Button.x + RECTS.stage1Button.w / 2, RECTS.stage1Button.y + 49);

    drawButton(ctx, RECTS.backToTitle, "戻る", 12);
    ctx.restore();
  };

  Game.drawPauseOverlay = function drawPauseOverlay(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, ui.overlayFill);

    drawGlowTitle(ctx, "PAUSED", w.width / 2, 262, 28);
    drawDivider(ctx, w.width / 2, 282, 140);

    drawButton(ctx, RECTS.resume, "つづける");
    drawButton(ctx, RECTS.quitToTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawGameOver = function drawGameOver(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, ui.overlayFill);

    drawGlowTitle(ctx, "GAME OVER", w.width / 2, 244, 28);
    drawDivider(ctx, w.width / 2, 264, 140);

    ctx.textAlign = "center";
    ctx.font = `italic 400 15px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText(`SCORE ${Game.score}`, w.width / 2, 288);

    drawButton(ctx, RECTS.retry, "リトライ");
    drawButton(ctx, RECTS.toTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawStageClear = function drawStageClear(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, ui.overlayFill);

    drawGlowTitle(ctx, "STAGE CLEAR", w.width / 2, 244, 26);
    drawDivider(ctx, w.width / 2, 264, 140);

    ctx.textAlign = "center";
    ctx.font = `italic 400 15px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText(`SCORE ${Game.score}`, w.width / 2, 288);

    drawButton(ctx, RECTS.toTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawHUD = function drawHUD(ctx) {
    const ui = Game.CONFIG.ui;
    ctx.save();

    // 背景の明るさに関わらずHUDが読めるよう、上部に薄い帯を敷く。
    const vignette = ctx.createLinearGradient(0, 0, 0, 60);
    vignette.addColorStop(0, "rgba(6, 10, 18, 0.42)");
    vignette.addColorStop(1, "rgba(6, 10, 18, 0)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, Game.CONFIG.world.width, 60);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.font = `600 11px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText("LIFE", 14, 20);
    for (let i = 0; i < Game.lives; i += 1) {
      const cx = 48 + i * 16;
      ctx.save();
      ctx.translate(cx, 16);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = ui.lifeColor;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }

    ctx.font = `600 13px ${ui.bodyFont}`;
    ctx.fillStyle = ui.textColor;
    ctx.fillText(`SCORE ${Game.score}`, 14, 38);

    const pb = ui.pauseButton;
    drawTabletFrame(ctx, pb);
    ctx.fillStyle = ui.accentGold;
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
    const barY = 56;
    const barW = 320;
    const barH = 9;
    const ratio = Math.max(boss.hp, 0) / boss.maxHp;

    ctx.save();
    ctx.textAlign = "left";
    ctx.font = `italic 600 12px ${ui.bodyFont}`;
    ctx.fillStyle = ui.accentGoldBright;
    ctx.fillText(def.name, barX, barY - 5);

    ctx.fillStyle = "rgba(8, 10, 18, 0.6)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = boss.isMainBoss ? "rgba(214, 196, 255, 0.9)" : "rgba(255, 157, 122, 0.9)";
    ctx.fillRect(barX, barY, barW * ratio, barH);
    ctx.strokeStyle = ui.accentGoldDim;
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
