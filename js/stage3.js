// 3面(無光王宮)固有のデータ。1・2面と同じ構造で組んである。
// 最終面なので、雑魚は3種類(メディモチーフのクラゲ2種+オリアモチーフのシャチ)を混ぜ、
// 弾速/間隔は最終面としての緊張感を残しつつ、詰みやすい密度にならないよう抑えている。
const STAGE3_WAVES = {
  // 中央に3体、少し間隔を空けて縦に落ちてくるクラゲ
  columnCenterMedi: [
    { type: "mediGrunt1", delay: 0, move: { kind: "straightDown", params: { x: 120, y0: -20, speed: 68 } } },
    { type: "mediGrunt1", delay: 0.22, move: { kind: "straightDown", params: { x: 180, y0: -20, speed: 68 } } },
    { type: "mediGrunt1", delay: 0.44, move: { kind: "straightDown", params: { x: 240, y0: -20, speed: 68 } } },
  ],

  // 左右から弧を描いて入ってくるシャチのペア
  sideArcsOria: [
    {
      type: "oriaGrunt",
      delay: 0,
      move: { kind: "arcFromSide", params: { side: -1, targetX: 110, y0: -20, vy: 56, curveStrength: 120, curveDecay: 0.95 } },
    },
    {
      type: "oriaGrunt",
      delay: 0.12,
      flip: true,
      move: { kind: "arcFromSide", params: { side: 1, targetX: 250, y0: -20, vy: 56, curveStrength: 120, curveDecay: 0.95 } },
    },
  ],

  // 横に揺れながら降りてくる単発弾持ちのクラゲ3体
  sineRowMedi: [
    { type: "mediGrunt2", delay: 0, move: { kind: "sineDive", params: { x0: 90, y0: -20, vy: 56, amplitude: 26, frequency: 1.9 } } },
    { type: "mediGrunt2", delay: 0.28, move: { kind: "sineDive", params: { x0: 180, y0: -20, vy: 56, amplitude: 26, frequency: 1.9 } } },
    { type: "mediGrunt2", delay: 0.56, move: { kind: "sineDive", params: { x0: 270, y0: -20, vy: 56, amplitude: 26, frequency: 1.9 } } },
  ],

  // シャチのV字編隊で直進
  vFormationOria: [
    { type: "oriaGrunt", delay: 0, move: { kind: "straightDown", params: { x: 180, y0: -20, speed: 62 } } },
    { type: "oriaGrunt", delay: 0.1, move: { kind: "straightDown", params: { x: 148, y0: -50, speed: 62 } } },
    { type: "oriaGrunt", delay: 0.1, flip: true, move: { kind: "straightDown", params: { x: 212, y0: -50, speed: 62 } } },
  ],

  // 3種混成の波。終盤専用だが、同時に抱え込みすぎない数と速度に抑える。
  mixedRush: [
    { type: "mediGrunt1", delay: 0, move: { kind: "straightDown", params: { x: 100, y0: -20, speed: 70 } } },
    { type: "oriaGrunt", delay: 0.15, move: { kind: "arcFromSide", params: { side: -1, targetX: 150, y0: -20, vy: 60, curveStrength: 110, curveDecay: 0.95 } } },
    { type: "oriaGrunt", delay: 0.15, flip: true, move: { kind: "arcFromSide", params: { side: 1, targetX: 210, y0: -20, vy: 60, curveStrength: 110, curveDecay: 0.95 } } },
    { type: "mediGrunt2", delay: 0.35, move: { kind: "sineDive", params: { x0: 260, y0: -20, vy: 58, amplitude: 24, frequency: 2.0 } } },
    { type: "mediGrunt1", delay: 0.5, move: { kind: "straightDown", params: { x: 200, y0: -20, speed: 70 } } },
  ],
};

// 真相開示シーン専用の一過性演出：「深海灯に手を伸ばすが、すり抜ける」明滅リング。
// ジェリー自身(自機の実スプライト、move stepがisPlayer:trueで直接動かす)は消さず、
// 光側だけが明滅することで「掴めない」を表現する。
// 経過時間はperformance.now()基準にして、汎用のupdateDialogueには手を加えずに済ませている。
Game.altarReachEffect = null;

Game.beginAltarReachEffect = function beginAltarReachEffect() {
  Game.altarReachEffect = { startedAt: performance.now(), duration: 1400 };
};

Game.drawAltarReachEffect = function drawAltarReachEffect(ctx) {
  const fx = Game.altarReachEffect;
  if (!fx) return;
  const elapsed = performance.now() - fx.startedAt;
  if (elapsed > fx.duration) {
    Game.altarReachEffect = null;
    return;
  }
  const t = elapsed / fx.duration;
  const alpha = Math.sin(t * Math.PI); // 0→1→0の明滅
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = "rgba(255, 244, 214, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(Game.player.x, Game.player.y - 40, 18 + t * 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

Game.STAGE3 = {
  title: "無光王宮",
  isFinalStage: true, // stageRunnerがフェーズ終了時にENDINGへ分岐する目印(D-3)
  waves: STAGE3_WAVES,
  dialogue: {
    stageStart: [
      { speaker: "ジェリー", text: "ここが…海の、いちばん深いところ。" },
      { speaker: "ジェリー", text: "光がない。なんにも、見えない…。" },
      { speaker: "ジェリー", text: "でも、感じる。この奥に、深海灯がある。もうすぐ、もうすぐなんだ。" },
    ],
  },
  phases: [
    {
      type: "waves",
      duration: 15,
      spawns: [
        { t: 0.6, wave: "columnCenterMedi" },
        { t: 3.5, wave: "sideArcsOria" },
        { t: 6.5, wave: "sineRowMedi" },
        { t: 9.5, wave: "vFormationOria" },
        { t: 12.6, wave: "columnCenterMedi" },
      ],
    },
    { type: "miniboss", key: "oria", x: 180, y: 130 },
    {
      type: "waves",
      duration: 17,
      spawns: [
        { t: 0.5, wave: "sideArcsOria" },
        { t: 3.2, wave: "sineRowMedi" },
        { t: 6.3, wave: "mixedRush" },
        { t: 9.8, wave: "vFormationOria" },
        { t: 12.8, wave: "columnCenterMedi" },
        { t: 15.2, wave: "sideArcsOria" },
      ],
    },
    { type: "boss", key: "medi", x: 180, y: 150 },
  ],
};
