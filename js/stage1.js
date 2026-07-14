// 1面固有のデータ。編隊(WAVES)は ENEMY_DEFS の type と MOVEMENTS の kind を組み合わせて作る。
// 新しい編隊を足したい時はここに1エントリ増やすだけでよい。
Game.WAVES = {
  // 中央に3体、少し間隔を空けて縦に落ちてくる
  columnCenter: [
    { type: "eelGrunt", delay: 0, move: { kind: "straightDown", params: { x: 120, y0: -20, speed: 70 } } },
    { type: "eelGrunt", delay: 0.25, move: { kind: "straightDown", params: { x: 180, y0: -20, speed: 70 } } },
    { type: "eelGrunt", delay: 0.5, move: { kind: "straightDown", params: { x: 240, y0: -20, speed: 70 } } },
  ],

  // 左右から弧を描いて中央寄りに入ってくる魚のペア
  sideArcs: [
    {
      type: "fishGrunt",
      delay: 0,
      move: { kind: "arcFromSide", params: { side: -1, targetX: 110, y0: -20, vy: 55, curveStrength: 140, curveDecay: 0.9 } },
    },
    {
      type: "fishGrunt",
      delay: 0.15,
      flip: true,
      move: { kind: "arcFromSide", params: { side: 1, targetX: 250, y0: -20, vy: 55, curveStrength: 140, curveDecay: 0.9 } },
    },
  ],

  // 横に揺れながら降りてくる3体
  sineRow: [
    { type: "eelGrunt", delay: 0, move: { kind: "sineDive", params: { x0: 90, y0: -20, vy: 60, amplitude: 36, frequency: 2.2 } } },
    { type: "eelGrunt", delay: 0.3, move: { kind: "sineDive", params: { x0: 180, y0: -20, vy: 60, amplitude: 36, frequency: 2.2 } } },
    { type: "eelGrunt", delay: 0.6, move: { kind: "sineDive", params: { x0: 270, y0: -20, vy: 60, amplitude: 36, frequency: 2.2 } } },
  ],

  // 魚のV字編隊で直進
  vFormationFish: [
    { type: "fishGrunt", delay: 0, move: { kind: "straightDown", params: { x: 180, y0: -20, speed: 65 } } },
    { type: "fishGrunt", delay: 0.1, move: { kind: "straightDown", params: { x: 150, y0: -50, speed: 65 } } },
    { type: "fishGrunt", delay: 0.1, flip: true, move: { kind: "straightDown", params: { x: 210, y0: -50, speed: 65 } } },
  ],
};

Game.STAGE1 = {
  phases: [
    {
      type: "waves",
      duration: 13,
      spawns: [
        { t: 0.6, wave: "columnCenter" },
        { t: 3.5, wave: "sideArcs" },
        { t: 6.5, wave: "sineRow" },
        { t: 9.5, wave: "vFormationFish" },
      ],
    },
    { type: "miniboss", key: "lena", x: 180, y: 130 },
    {
      type: "waves",
      duration: 15,
      spawns: [
        { t: 0.5, wave: "sideArcs" },
        { t: 3.5, wave: "sineRow" },
        { t: 6.5, wave: "columnCenter" },
        { t: 9, wave: "sideArcs" },
        { t: 12, wave: "vFormationFish" },
      ],
    },
    { type: "boss", key: "rione", x: 180, y: 150 },
  ],
};
