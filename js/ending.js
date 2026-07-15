// 3面クリア後の真のエンディング＋全クリアリザルト。
// 台詞そのものはdialogue.jsの汎用会話エンジン(D-1)に流し込むだけで、専用の状態遷移コードは
// 「フェーズ終了→ENDING→FINAL_CLEAR」の橋渡しと、1枚絵/リザルトの描画だけに留めている。
Game.ILLUSTRATION_LABELS.ending1 = "光を受け取る";
Game.ILLUSTRATION_LABELS.ending2 = "浅海に還る";

// 1枚目(ending1)は真相開示中の「……あ。」以降で既に表示されている
// (Game.MEDI_LIGHT_REVEAL_STEPS、boss.js参照)。ここでは2枚目に切り替えるところから。
Game.ENDING_STEPS = [
  { type: "image", key: "ending2", transitionDuration: 1.2 },
  { type: "wait", duration: 0.6 },
  { speaker: "ジェリー", text: "終わりは、ある。" },
  { speaker: "ジェリー", text: "ただ、輪廻は、終わらない。" },
  { type: "titlecard", lines: ["── PELAGIA ／ TRUE END ──", "『泡となり海となる』"], holdDuration: 4 },
];

Game.startEndingSequence = function startEndingSequence() {
  // エンディングへ入る直前にも念のため戦闘の名残を一掃しておく
  // (真相開示の冒頭で既に行っているので、ここに到達する時点では通常は空のはず)。
  Game.enemyBullets.items.forEach((b) => { b.active = false; });
  Game.clearActiveLasers();
  Game.player.init();

  Game.finalizeStageResult(); // 3面自体のクリア処理(クリア/ノーミスボーナス, ハイスコア, clearedThrough)
  Game.finalizeStoryTotalScore(); // 3面合計スコアの記録
  Game.saveData.fullCleared = true;
  Game.saveData.endingSeen = true;
  Game.persistSaveData();
  Game.startCutscene(Game.ENDING_STEPS, () => Game.setState(Game.STATES.FINAL_CLEAR),
    { enterState: Game.STATES.ENDING, returnState: null });
};

// 回想再生：スコア/セーブへの書き込みは一切行わない。「これが…深海灯…」から最後まで
// (真相開示の後半+エンディング)を通しで再生し、終わったらタイトルへ戻す。
Game.playEndingReplay = function playEndingReplay() {
  const steps = [...Game.MEDI_LIGHT_REVEAL_STEPS, ...Game.ENDING_STEPS];
  Game.startCutscene(steps, () => Game.setState(Game.STATES.TITLE),
    { enterState: Game.STATES.ENDING, returnState: null });
};

Game.drawTitlecard = function drawTitlecard(ctx, step) {
  const w = Game.CONFIG.world;
  const ui = Game.CONFIG.ui;
  const lines = step.lines || [];

  ctx.save();
  ctx.fillStyle = "rgba(4, 6, 12, 0.78)";
  ctx.fillRect(0, 0, w.width, w.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const startY = w.height / 2 - ((lines.length - 1) * 32) / 2;
  lines.forEach((text, i) => {
    ctx.font = `700 ${i === 0 ? 20 : 24}px ${ui.titleFont}`;
    ctx.shadowColor = "rgba(248, 231, 184, 0.55)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = ui.accentGoldBright;
    ctx.fillText(text, w.width / 2, startY + i * 32);
    ctx.shadowBlur = 0;
  });
  ctx.restore();
};

Game.drawEndingScene = function drawEndingScene(ctx) {
  Game.drawCutsceneImage(ctx);

  const step = Game.dialogue.steps[Game.dialogue.index];
  const type = step && (step.type || "line");
  if (type === "titlecard") {
    Game.drawTitlecard(ctx, step);
  } else if (type === "line") {
    Game.drawDialogueBox(ctx);
  }

  Game.drawFadeOverlay(ctx);
};

Game.drawFinalClear = function drawFinalClear(ctx) {
  const w = Game.CONFIG.world;
  const ui = Game.CONFIG.ui;
  const result = Game.lastResult || {
    totalScore: Game.storyTotalScore,
    isNewBestTotal: false,
    bestTotalScore: Game.saveData.totalBestScore,
  };

  ctx.save();
  Game.drawDim(ctx, ui.overlayFill);

  Game.drawGlowTitle(ctx, "TRUE END CLEAR", w.width / 2, 96, 22);
  Game.drawDivider(ctx, w.width / 2, 116, 170);

  const rows = [
    ["第一面 透光庭園", Game.saveData.highScores["1"] || 0],
    ["第二面 誘灯迷宮", Game.saveData.highScores["2"] || 0],
    ["第三面 無光王宮", Game.saveData.highScores["3"] || 0],
  ];

  const panelX = 40;
  const panelY = 160;
  const panelW = 280;
  ctx.font = `400 13px ${ui.bodyFont}`;
  rows.forEach(([label, value], i) => {
    const y = panelY + i * 24;
    ctx.textAlign = "left";
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText(label, panelX, y);
    ctx.textAlign = "right";
    ctx.fillStyle = ui.textColor;
    ctx.fillText(`BEST ${value.toLocaleString()}`, panelX + panelW, y);
  });

  const totalY = panelY + rows.length * 24 + 14;
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
  ctx.fillText((result.totalScore || 0).toLocaleString(), panelX + panelW, totalY + 6);

  ctx.textAlign = "center";
  ctx.font = `italic 400 13px ${ui.bodyFont}`;
  if (result.isNewBestTotal) {
    ctx.fillStyle = ui.accentGold;
    ctx.fillText("合計自己ベスト更新！", w.width / 2, totalY + 34);
  } else {
    ctx.fillStyle = ui.subTextColor;
    ctx.fillText(`合計自己ベスト ${(result.bestTotalScore || 0).toLocaleString()}`, w.width / 2, totalY + 34);
  }

  Game.drawButton(ctx, Game.uiRects.finalClearToTitle, "タイトルへ", 14);
  Game.drawButton(ctx, Game.uiRects.finalClearToStageSelect, "面選択へ", 14);
  ctx.restore();
};
