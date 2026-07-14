// 2面(誘灯迷宮)固有のデータ。1面(stage1.js)と同じ構造で組んである。
// 編隊(waves)は面ごとに独立したオブジェクトにして、他ステージのwavesと名前が衝突しないようにしている。
const STAGE2_WAVES = {
  // 中央に3体、少し間隔を空けて縦に落ちてくるミノカサゴ
  columnCenterLion: [
    { type: "lionfishGrunt", delay: 0, move: { kind: "straightDown", params: { x: 120, y0: -20, speed: 68 } } },
    { type: "lionfishGrunt", delay: 0.25, move: { kind: "straightDown", params: { x: 180, y0: -20, speed: 68 } } },
    { type: "lionfishGrunt", delay: 0.5, move: { kind: "straightDown", params: { x: 240, y0: -20, speed: 68 } } },
  ],

  // 左右から弧を描いて入ってくるチョウチンアンコウのペア
  sideArcsAngler: [
    {
      type: "anglerGrunt",
      delay: 0,
      move: { kind: "arcFromSide", params: { side: -1, targetX: 110, y0: -20, vy: 55, curveStrength: 140, curveDecay: 0.9 } },
    },
    {
      type: "anglerGrunt",
      delay: 0.15,
      flip: true,
      move: { kind: "arcFromSide", params: { side: 1, targetX: 250, y0: -20, vy: 55, curveStrength: 140, curveDecay: 0.9 } },
    },
  ],

  // 横に揺れながら降りてくるミノカサゴ3体
  sineRowLion: [
    { type: "lionfishGrunt", delay: 0, move: { kind: "sineDive", params: { x0: 90, y0: -20, vy: 58, amplitude: 34, frequency: 2.0 } } },
    { type: "lionfishGrunt", delay: 0.3, move: { kind: "sineDive", params: { x0: 180, y0: -20, vy: 58, amplitude: 34, frequency: 2.0 } } },
    { type: "lionfishGrunt", delay: 0.6, move: { kind: "sineDive", params: { x0: 270, y0: -20, vy: 58, amplitude: 34, frequency: 2.0 } } },
  ],

  // チョウチンアンコウのV字編隊で直進
  vFormationAngler: [
    { type: "anglerGrunt", delay: 0, move: { kind: "straightDown", params: { x: 180, y0: -20, speed: 62 } } },
    { type: "anglerGrunt", delay: 0.1, move: { kind: "straightDown", params: { x: 150, y0: -50, speed: 62 } } },
    { type: "anglerGrunt", delay: 0.1, flip: true, move: { kind: "straightDown", params: { x: 210, y0: -50, speed: 62 } } },
  ],
};

Game.STAGE2 = {
  title: "誘灯迷宮",
  waves: STAGE2_WAVES,
  dialogue: {
    stageStart: [
      { speaker: "ジェリー", text: "ここ…暗い。さっきまでの明るい海と、全然ちがう。" },
      { speaker: "ジェリー", text: "光が、あちこちで揺れてる…？ どれが本物なんだろう。" },
      { speaker: "ジェリー", text: "…立ち止まってちゃだめだ。深海灯は、もっと奥にあるはず。" },
    ],
  },
  phases: [
    {
      type: "waves",
      duration: 13,
      spawns: [
        { t: 0.6, wave: "columnCenterLion" },
        { t: 3.5, wave: "sideArcsAngler" },
        { t: 6.5, wave: "sineRowLion" },
        { t: 9.5, wave: "vFormationAngler" },
      ],
    },
    { type: "miniboss", key: "coralia", x: 180, y: 130 },
    {
      type: "waves",
      duration: 15,
      spawns: [
        { t: 0.5, wave: "sideArcsAngler" },
        { t: 3.5, wave: "sineRowLion" },
        { t: 6.5, wave: "columnCenterLion" },
        { t: 9, wave: "sideArcsAngler" },
        { t: 12, wave: "vFormationAngler" },
      ],
    },
    { type: "boss", key: "escar", x: 180, y: 150 },
  ],
};
