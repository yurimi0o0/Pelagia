// ゲーム全体の画面状態。描画・入力・更新はすべてこのstateで分岐する。
Game.STATES = {
  TITLE: "TITLE",
  STAGE_SELECT: "STAGE_SELECT",
  DIALOGUE: "DIALOGUE",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
  STAGE_CLEAR: "STAGE_CLEAR",
};

Game.state = Game.STATES.TITLE;
Game.lives = Game.CONFIG.player.lives;
Game.score = 0;
Game.scoreBreakdown = { kills: 0, miniboss: 0, boss: 0, noMissBonus: 0, clearBonus: 0 };
Game.runStats = { noMiss: true };
Game.runMode = "STORY"; // "STORY" | "PRACTICE" -- 通しプレイか面選択からの単発プレイか
Game.currentStageNumber = 1;
Game.lastResult = null;

Game.setState = function setState(next) {
  Game.state = next;
};

// --- セーブデータ(進行度/ハイスコア) ---------------------------------
// プレビュー環境などlocalStorageが使えない場合でも落ちないよう、
// 読み書きは必ずtry-catchで囲み、失敗時はメモリ上の初期値のまま進行する。
Game.SAVE_KEY = "pelagia_save_v1";
Game.saveData = { clearedThrough: 0, highScores: {} };

Game.loadSaveData = function loadSaveData() {
  try {
    const raw = window.localStorage.getItem(Game.SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Game.saveData.clearedThrough = Number(parsed.clearedThrough) || 0;
      Game.saveData.highScores = (parsed.highScores && typeof parsed.highScores === "object") ? parsed.highScores : {};
    }
  } catch (e) {
    // localStorage不可の環境。初期値のまま続行する。
  }
};

Game.persistSaveData = function persistSaveData() {
  try {
    window.localStorage.setItem(Game.SAVE_KEY, JSON.stringify(Game.saveData));
  } catch (e) {
    // 保存できなくてもゲームは続行する(このセッション中はメモリ上の値が使われる)。
  }
};

Game.markStageCleared = function markStageCleared(stageNumber) {
  if (stageNumber > Game.saveData.clearedThrough) {
    Game.saveData.clearedThrough = stageNumber;
    Game.persistSaveData();
  }
};

Game.recordHighScore = function recordHighScore(stageNumber, score) {
  const key = String(stageNumber);
  const prev = Game.saveData.highScores[key] || 0;
  if (score > prev) {
    Game.saveData.highScores[key] = score;
    Game.persistSaveData();
    return true;
  }
  return false;
};

// --- スコア ---------------------------------------------------------
Game.addScore = function addScore(amount, category) {
  Game.score += amount;
  if (category && Object.prototype.hasOwnProperty.call(Game.scoreBreakdown, category)) {
    Game.scoreBreakdown[category] += amount;
  }
};

// 1面(またはstage.phases)を最後まで終えた時に呼ぶ。クリアボーナス/ノーミスボーナスを乗せ、
// 通しプレイの時だけ進行度とハイスコアを保存する(練習プレイは記録に残さない)。
Game.finalizeStageResult = function finalizeStageResult() {
  Game.addScore(Game.CONFIG.score.clearBonus, "clearBonus");
  if (Game.runStats.noMiss) Game.addScore(Game.CONFIG.score.noMissBonus, "noMissBonus");

  let isNewBest = false;
  let bestScore = Game.score;
  if (Game.runMode === "STORY") {
    Game.markStageCleared(Game.currentStageNumber);
    isNewBest = Game.recordHighScore(Game.currentStageNumber, Game.score);
    bestScore = Game.saveData.highScores[String(Game.currentStageNumber)] || Game.score;
  }

  Game.lastResult = {
    isNewBest,
    bestScore,
    score: Game.score,
    breakdown: Object.assign({}, Game.scoreBreakdown),
    runMode: Game.runMode,
  };
};

// stageNumberを指定して1面を最初から始める。プール・敵・ボスをすべて初期状態に戻す。
// Game.runMode は呼び出し側(ui.js)が事前にSTORY/PRACTICEをセットしておく。
Game.startRun = function startRun(stageNumber) {
  Game.currentStageNumber = stageNumber;
  Game.lives = Game.CONFIG.player.lives;
  Game.score = 0;
  Game.scoreBreakdown = { kills: 0, miniboss: 0, boss: 0, noMissBonus: 0, clearBonus: 0 };
  Game.runStats = { noMiss: true };
  Game.lastResult = null;

  Game.player.init();
  Game.playerBullets.items.forEach((b) => { b.active = false; });
  Game.enemyBullets.items.forEach((b) => { b.active = false; });
  Game.grunts.length = 0;
  Game.pendingGruntSpawns.length = 0;
  Game.activeBoss = null;

  Game.setState(Game.STATES.PLAYING);
  Game.startStage(Game.STAGES[stageNumber]);
};

// 被弾時の共通入口：見た目のミス処理(点滅+中央復帰)はplayer側、残機管理はここ。
Game.onPlayerHit = function onPlayerHit() {
  Game.player.applyMiss();
  Game.runStats.noMiss = false;
  Game.lives -= 1;
  if (Game.lives <= 0) {
    Game.lives = 0;
    Game.setState(Game.STATES.GAME_OVER);
  }
};
