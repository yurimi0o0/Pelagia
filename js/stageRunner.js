// ステージ進行の汎用エンジン。stage.phases を順番に消化するだけなので、
// 2面以降を足す時は phases のデータを増やすだけで済む（ロジック側の変更は不要な想定）。
// phase.type: "waves"(時間経過で spawns を発火し、durationで次へ) / "miniboss" / "boss"(撃破で次へ)
//
// 会話(stage.dialogue.stageStart / BOSS_DEFS[key].dialogue.beforeBattle)は
// DIALOGUE状態を経由させて先に流し切ってから本編を進める。DIALOGUE中は
// game.jsのupdate()がPLAYING以外を素通りするため、このファイルのupdate系も
// 自動的に止まる(=ボスや道中の時計も会話中は進まない)。
//
// waves→次フェーズ(=中ボス/ボスの会話)への遷移は、durationが経過していても
// ザコ敵が画面上に残っている/湧き待ちの間は待つ(全滅または画面外退場を確認してから)。
// 会話中に雑魚が動き回っているのは不自然、という指摘への対応。
Game.stageRunner = {
  stage: null,
  phaseIndex: 0,
  phaseTimer: 0,
  spawnedFlags: null,
};

Game.startStage = function startStage(stage) {
  Game.stageRunner.stage = stage;
  const lines = stage.dialogue && stage.dialogue.stageStart;
  Game.startDialogue(lines, () => Game.enterStagePhase(0));
};

Game.enterStagePhase = function enterStagePhase(index) {
  const runner = Game.stageRunner;
  const stage = runner.stage;
  runner.phaseIndex = index;
  runner.phaseTimer = 0;
  runner.spawnedFlags = new Set();

  if (index >= stage.phases.length) {
    // 最終面をSTORYでクリアした時だけ、通常のSTAGE_CLEARではなく真のエンディングへ分岐する。
    // 練習プレイでの3面クリアはこれまで通りSTAGE_CLEARのまま(セーブもSTORY限定のため)。
    if (stage.isFinalStage && Game.runMode === "STORY") {
      Game.startEndingSequence();
    } else {
      Game.finalizeStageResult();
      Game.setState(Game.STATES.STAGE_CLEAR);
    }
    return;
  }

  const phase = stage.phases[index];
  if (phase.type === "miniboss" || phase.type === "boss") {
    const def = Game.BOSS_DEFS[phase.key];
    const lines = def.dialogue && def.dialogue.beforeBattle;
    Game.startDialogue(lines, () => {
      Game.spawnBoss(phase.key, phase.x, phase.y, phase.type === "boss");
    });
  }
};

Game.updateStageRunner = function updateStageRunner(dt) {
  const runner = Game.stageRunner;
  if (!runner.stage) return;
  const phase = runner.stage.phases[runner.phaseIndex];
  if (!phase) return;
  runner.phaseTimer += dt;

  if (phase.type === "waves") {
    phase.spawns.forEach((spawn, i) => {
      if (!runner.spawnedFlags.has(i) && runner.phaseTimer >= spawn.t) {
        runner.spawnedFlags.add(i);
        Game.spawnWave(runner.stage.waves[spawn.wave]);
      }
    });
    const allGruntsCleared = Game.grunts.length === 0 && Game.pendingGruntSpawns.length === 0;
    if (runner.phaseTimer >= phase.duration && allGruntsCleared) {
      Game.enterStagePhase(runner.phaseIndex + 1);
    }
  } else if (phase.type === "miniboss" || phase.type === "boss") {
    if (!Game.activeBoss) {
      Game.enterStagePhase(runner.phaseIndex + 1);
    }
  }
};
