// メニュー/HUD/ボスHPバー/リザルトの描画とタップ判定。ワールド座標(360x640)固定でレイアウトする。
// 神話的な雰囲気にするため、セリフ体＋金/真珠色のアクセントと、
// 石版のような二重枠+四隅の金具で装飾する（drawTabletFrame）。
(function () {
  const RECTS = {
    storyButton: { x: 70, y: 356, w: 220, h: 56 },
    practiceButton: { x: 70, y: 426, w: 220, h: 56 },
    endingReplayButton: { x: 70, y: 496, w: 220, h: 40 },

    finalClearToTitle: { x: 40, y: 486, w: 130, h: 46 },
    finalClearToStageSelect: { x: 190, y: 486, w: 130, h: 46 },

    backToTitle: { x: 16, y: 16, w: 90, h: 30 },
    stageSlot1: { x: 40, y: 150, w: 280, h: 74 },
    stageSlot2: { x: 40, y: 236, w: 280, h: 74 },
    stageSlot3: { x: 40, y: 322, w: 280, h: 74 },

    resume: { x: 90, y: 330, w: 180, h: 50 },
    quitToTitle: { x: 90, y: 396, w: 180, h: 50 },

    retry: { x: 90, y: 360, w: 180, h: 50 },
    toTitle: { x: 90, y: 426, w: 180, h: 50 },

    resultToTitle: { x: 40, y: 486, w: 130, h: 46 },
    resultToStageSelect: { x: 190, y: 486, w: 130, h: 46 },
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

  function toRoman(n) {
    return ["", "I", "II", "III"][n] || String(n);
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

  function drawStageSlot(ctx, rect, entry) {
    const ui = Game.CONFIG.ui;
    const cleared = entry.number <= Game.saveData.clearedThrough;
    const playable = entry.implemented && cleared;

    ctx.save();
    if (!playable) ctx.globalAlpha = 0.55;
    drawTabletFrame(ctx, rect);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = playable ? ui.accentGoldBright : ui.dimTextColor;
    ctx.font = `700 18px ${ui.titleFont}`;
    ctx.fillText(`STAGE ${toRoman(entry.number)}`, rect.x + 18, rect.y + 30);

    ctx.fillStyle = playable ? ui.subTextColor : ui.dimTextColor;
    ctx.font = `400 13px ${ui.bodyFont}`;
    ctx.fillText(entry.implemented ? entry.name : "???", rect.x + 18, rect.y + 50);

    ctx.textAlign = "right";
    ctx.font = `600 12px ${ui.bodyFont}`;
    if (!entry.implemented) {
      ctx.fillStyle = ui.dimTextColor;
      ctx.fillText("COMING SOON", rect.x + rect.w - 16, rect.y + 30);
    } else if (!cleared) {
      ctx.fillStyle = ui.dimTextColor;
      ctx.fillText("本編クリアで解放", rect.x + rect.w - 16, rect.y + 30);
    } else {
      const best = Game.saveData.highScores[String(entry.number)] || 0;
      ctx.fillStyle = ui.accentGold;
      ctx.fillText(`BEST ${best.toLocaleString()}`, rect.x + rect.w - 16, rect.y + 30);
    }
    ctx.restore();
  }

  Game.drawTitle = function drawTitle(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    ctx.save();
    drawDim(ctx, "rgba(6, 10, 20, 0.42)");

    drawGlowTitle(ctx, "PELAGIA", w.width / 2, 232, 44);
    drawDivider(ctx, w.width / 2, 258, 190);

    ctx.textAlign = "center";
    ctx.font = `italic 400 14px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText("— 海霊たちの眠る聖域 —", w.width / 2, 282);

    if (Game.saveData.fullCleared) {
      ctx.font = `700 13px ${ui.bodyFont}`;
      ctx.fillStyle = ui.accentGold;
      ctx.fillText("☆ CLEAR ☆", w.width / 2, 304);
    }

    drawButton(ctx, RECTS.storyButton, "通しプレイ");
    drawButton(ctx, RECTS.practiceButton, "面選択（練習）");
    if (Game.saveData.endingSeen) {
      drawButton(ctx, RECTS.endingReplayButton, "エンディング回想", 14);
    }

    ctx.font = `400 11px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText("面選択ではクリア済みの海域に挑めます", w.width / 2, 552);
    ctx.restore();
  };

  Game.drawStageSelect = function drawStageSelect(ctx) {
    const w = Game.CONFIG.world;
    ctx.save();
    drawDim(ctx, "rgba(6, 10, 20, 0.42)");

    drawGlowTitle(ctx, "STAGE SELECT", w.width / 2, 96, 22);
    drawDivider(ctx, w.width / 2, 116, 150);

    Game.STAGE_ROSTER.forEach((entry, i) => {
      drawStageSlot(ctx, RECTS[`stageSlot${i + 1}`], entry);
    });

    drawButton(ctx, RECTS.backToTitle, "戻る", 12);
    ctx.restore();
  };

  Game.drawPauseOverlay = function drawPauseOverlay(ctx) {
    const w = Game.CONFIG.world;
    ctx.save();
    drawDim(ctx, Game.CONFIG.ui.overlayFill);

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
    ctx.fillText(`SCORE ${Game.score.toLocaleString()}`, w.width / 2, 288);

    drawButton(ctx, RECTS.retry, "リトライ");
    drawButton(ctx, RECTS.toTitle, "タイトルへ");
    ctx.restore();
  };

  Game.drawStageClear = function drawStageClear(ctx) {
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;
    const result = Game.lastResult || {
      score: Game.score,
      breakdown: Game.scoreBreakdown,
      isNewBest: false,
      bestScore: Game.score,
      runMode: Game.runMode,
    };

    ctx.save();
    drawDim(ctx, ui.overlayFill);

    drawGlowTitle(ctx, "STAGE CLEAR", w.width / 2, 104, 26);
    drawDivider(ctx, w.width / 2, 124, 150);

    const rows = [
      ["撃破スコア", result.breakdown.kills],
      ["中ボス討伐", result.breakdown.miniboss],
      ["ボス討伐", result.breakdown.boss],
      ["クリアボーナス", result.breakdown.clearBonus],
      ["ノーミスボーナス", result.breakdown.noMissBonus],
    ];

    const panelX = 40;
    const panelY = 156;
    const panelW = 280;
    ctx.font = `400 13px ${ui.bodyFont}`;
    rows.forEach(([label, value], i) => {
      const y = panelY + i * 22;
      ctx.textAlign = "left";
      ctx.fillStyle = ui.subTextColor;
      ctx.fillText(label, panelX, y);
      ctx.textAlign = "right";
      ctx.fillStyle = value > 0 ? ui.textColor : ui.dimTextColor;
      ctx.fillText(value.toLocaleString(), panelX + panelW, y);
    });

    const totalY = panelY + rows.length * 22 + 12;
    ctx.strokeStyle = ui.accentGoldDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX, totalY - 16);
    ctx.lineTo(panelX + panelW, totalY - 16);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = `700 19px ${ui.titleFont}`;
    ctx.fillStyle = ui.accentGoldBright;
    ctx.fillText("TOTAL", panelX, totalY + 6);
    ctx.textAlign = "right";
    ctx.fillText(result.score.toLocaleString(), panelX + panelW, totalY + 6);

    ctx.textAlign = "center";
    ctx.font = `italic 400 13px ${ui.bodyFont}`;
    if (result.runMode === "PRACTICE") {
      ctx.fillStyle = ui.subTextColor;
      ctx.fillText("練習プレイ（記録には残りません）", w.width / 2, totalY + 34);
    } else if (result.isNewBest) {
      ctx.fillStyle = ui.accentGold;
      ctx.fillText("自己ベスト更新！", w.width / 2, totalY + 34);
    } else {
      ctx.fillStyle = ui.subTextColor;
      ctx.fillText(`自己ベスト ${result.bestScore.toLocaleString()}`, w.width / 2, totalY + 34);
    }

    // 通しプレイで次の面が既にあるなら、タイトルへ戻すより先に進める方が自然なので差し替える。
    const canProceed = result.runMode === "STORY" && !!Game.STAGES[Game.currentStageNumber + 1];
    drawButton(ctx, RECTS.resultToTitle, canProceed ? "次の面へ" : "タイトルへ", 14);
    drawButton(ctx, RECTS.resultToStageSelect, "面選択へ", 14);
    ctx.restore();
  };

  Game.drawHUD = function drawHUD(ctx) {
    const ui = Game.CONFIG.ui;
    ctx.save();

    // 背景の明るさに関わらずHUDが読めるよう、上部に薄い帯を敷く。
    const vignette = ctx.createLinearGradient(0, 0, 0, 46);
    vignette.addColorStop(0, "rgba(6, 10, 18, 0.46)");
    vignette.addColorStop(1, "rgba(6, 10, 18, 0)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, Game.CONFIG.world.width, 46);

    ctx.textBaseline = "alphabetic";

    ctx.textAlign = "left";
    ctx.font = `600 11px ${ui.bodyFont}`;
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText("LIFE", 14, 20);
    for (let i = 0; i < Game.lives; i += 1) {
      const cx = 46 + i * 15;
      ctx.save();
      ctx.translate(cx, 16);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = ui.lifeColor;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }

    ctx.textAlign = "right";
    ctx.font = `600 12px ${ui.bodyFont}`;
    ctx.fillStyle = ui.textColor;
    ctx.fillText(`SCORE ${Game.score.toLocaleString()}`, Game.CONFIG.ui.pauseButton.x - 12, 20);

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
    const barY = 50;
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

    if (Game.state === S.DIALOGUE || Game.state === S.ENDING) {
      Game.advanceDialogue();
      return;
    }

    if (Game.state === S.FINAL_CLEAR) {
      if (hitRect(x, y, RECTS.finalClearToTitle)) Game.setState(S.TITLE);
      else if (hitRect(x, y, RECTS.finalClearToStageSelect)) Game.setState(S.STAGE_SELECT);
      return;
    }

    if (Game.state === S.TITLE) {
      if (hitRect(x, y, RECTS.storyButton)) {
        // 「1面から順に進む」通しプレイ：次に挑む面(=クリア済みの続き)が実装済みならそこから、
        // なければ1面からやり直す(全部クリア済み/未実装面しか無い場合のフォールバック)。
        const nextStage = Game.saveData.clearedThrough + 1;
        const startingFresh = !Game.STAGES[nextStage] || nextStage === 1;
        if (startingFresh) Game.storyTotalScore = 0; // 周回の先頭からなら合計スコアをリセット
        Game.runMode = "STORY";
        Game.startRun(Game.STAGES[nextStage] ? nextStage : 1);
      } else if (hitRect(x, y, RECTS.practiceButton)) {
        Game.setState(S.STAGE_SELECT);
      } else if (Game.saveData.endingSeen && hitRect(x, y, RECTS.endingReplayButton)) {
        Game.playEndingReplay();
      }
      return;
    }

    if (Game.state === S.STAGE_SELECT) {
      if (hitRect(x, y, RECTS.backToTitle)) {
        Game.setState(S.TITLE);
        return;
      }
      Game.STAGE_ROSTER.some((entry, i) => {
        const rect = RECTS[`stageSlot${i + 1}`];
        if (hitRect(x, y, rect) && entry.implemented && entry.number <= Game.saveData.clearedThrough) {
          Game.runMode = "PRACTICE";
          Game.startRun(entry.number);
          return true;
        }
        return false;
      });
      return;
    }

    if (Game.state === S.PAUSED) {
      if (hitRect(x, y, RECTS.resume)) Game.setState(S.PLAYING);
      else if (hitRect(x, y, RECTS.quitToTitle)) Game.setState(S.TITLE);
      return;
    }

    if (Game.state === S.GAME_OVER) {
      if (hitRect(x, y, RECTS.retry)) Game.startRun(Game.currentStageNumber);
      else if (hitRect(x, y, RECTS.toTitle)) Game.setState(S.TITLE);
      return;
    }

    if (Game.state === S.STAGE_CLEAR) {
      const result = Game.lastResult;
      const canProceed = result && result.runMode === "STORY" && !!Game.STAGES[Game.currentStageNumber + 1];
      if (hitRect(x, y, RECTS.resultToTitle)) {
        if (canProceed) {
          Game.runMode = "STORY";
          Game.startRun(Game.currentStageNumber + 1);
        } else {
          Game.setState(S.TITLE);
        }
      } else if (hitRect(x, y, RECTS.resultToStageSelect)) {
        Game.setState(S.STAGE_SELECT);
      }
    }
  };

  // ending.js(別モジュール)からも同じ石版/見出しの見た目を使えるように公開する。
  Game.hitRect = hitRect;
  Game.drawTabletFrame = drawTabletFrame;
  Game.drawButton = drawButton;
  Game.drawDivider = drawDivider;
  Game.drawGlowTitle = drawGlowTitle;
  Game.drawDim = drawDim;
  Game.uiRects = RECTS;
})();
