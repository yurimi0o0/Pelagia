// ゲーム全体の画面状態。描画・入力・更新はすべてこのstateで分岐する。
Game.STATES = {
  TITLE: "TITLE",
  STAGE_SELECT: "STAGE_SELECT",
  DIALOGUE: "DIALOGUE",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
  STAGE_CLEAR: "STAGE_CLEAR",
  ENDING: "ENDING",
  FINAL_CLEAR: "FINAL_CLEAR",
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
Game.saveData = {
  clearedThrough: 0,
  highScores: {},
  fullCleared: false, // 3面をSTORYで一度でもクリアしたか(=本編クリア済み)
  endingSeen: false, // エンディングを一度でも見たか(将来の分岐エンド用にfullClearedとは意図的に分離)
  totalBestScore: 0, // 1〜3面合計スコアの自己ベスト
};

// 1〜3面のGame.scoreを合算する一時変数。メモリのみ保持(セーブしない)。
// STORY通しプレイは各面ごとに個別のstartRun呼び出しなので、ここに積み上げていく。
Game.storyTotalScore = 0;

Game.loadSaveData = function loadSaveData() {
  try {
    const raw = window.localStorage.getItem(Game.SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Game.saveData.clearedThrough = Number(parsed.clearedThrough) || 0;
      Game.saveData.highScores = (parsed.highScores && typeof parsed.highScores === "object") ? parsed.highScores : {};
      Game.saveData.fullCleared = !!parsed.fullCleared;
      Game.saveData.endingSeen = !!parsed.endingSeen;
      Game.saveData.totalBestScore = Number(parsed.totalBestScore) || 0;
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
    Game.storyTotalScore += Game.score;
  }

  Game.lastResult = {
    isNewBest,
    bestScore,
    score: Game.score,
    breakdown: Object.assign({}, Game.scoreBreakdown),
    runMode: Game.runMode,
  };
};

// 3面分の合計スコアを自己ベストと比較して記録する。3面クリア(エンディング開始)時にだけ呼ぶ。
Game.finalizeStoryTotalScore = function finalizeStoryTotalScore() {
  const total = Game.storyTotalScore;
  let isNewBestTotal = false;
  if (total > Game.saveData.totalBestScore) {
    Game.saveData.totalBestScore = total;
    isNewBestTotal = true;
    Game.persistSaveData();
  }
  Game.lastResult = Game.lastResult || {};
  Game.lastResult.totalScore = total;
  Game.lastResult.isNewBestTotal = isNewBestTotal;
  Game.lastResult.bestTotalScore = Game.saveData.totalBestScore;
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
  Game.clearActiveLasers();
  Game.grunts.length = 0;
  Game.pendingGruntSpawns.length = 0;
  Game.activeBoss = null;
  Game.cutsceneActors = {};
  Game.cutsceneImage = null;
  Game.dialogue.fadeOverlay = null;

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
