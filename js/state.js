// ゲーム全体の画面状態。描画・入力・更新はすべてこのstateで分岐する。
Game.STATES = {
  TITLE: "TITLE",
  STAGE_SELECT: "STAGE_SELECT",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
  STAGE_CLEAR: "STAGE_CLEAR",
};

Game.state = Game.STATES.TITLE;
Game.lives = Game.CONFIG.player.lives;
Game.score = 0;
Game.pausedFromState = null;

Game.setState = function setState(next) {
  Game.state = next;
};

// タイトル/セレクトから1面を最初から始める。プール・敵・ボスをすべて初期状態に戻す。
Game.startRun = function startRun() {
  Game.lives = Game.CONFIG.player.lives;
  Game.score = 0;

  Game.player.init();
  Game.playerBullets.items.forEach((b) => { b.active = false; });
  Game.enemyBullets.items.forEach((b) => { b.active = false; });
  Game.grunts.length = 0;
  Game.pendingGruntSpawns.length = 0;
  Game.activeBoss = null;

  Game.startStage(Game.STAGE1);
  Game.setState(Game.STATES.PLAYING);
};

// 被弾時の共通入口：見た目のミス処理(点滅+中央復帰)はplayer側、残機管理はここ。
Game.onPlayerHit = function onPlayerHit() {
  Game.player.applyMiss();
  Game.lives -= 1;
  if (Game.lives <= 0) {
    Game.lives = 0;
    Game.setState(Game.STATES.GAME_OVER);
  }
};
