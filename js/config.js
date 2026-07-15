// Pelagia: 全モジュール共通の名前空間。以後の全ファイルはこの Game に生やしていく。
window.Game = window.Game || {};

// 調整しそうな数値・アセットパスをここに集約する（既存方針を継続）。
Game.CONFIG = {
  world: {
    width: 360,
    height: 640,
  },

  assets: {
    background1: "assets/bg_stage1.jpg",
    background2: "assets/bg_stage2.png",
    background3: "assets/bg_stage3.png",
    playerBack: "assets/player_back.png",
    bossLena: "assets/boss_lena.png",
    bossRione: "assets/boss_rione.png",
    bossCoralia: "assets/boss_coralia.png",
    bossEscar: "assets/boss_escar.png",
    bossOria: "assets/boss_oria.png",
    bossMedi: "assets/boss_medi.png",
    bossMediSerious: "assets/boss_medi_serious.png",
    enemyLenaGrunt: "assets/enemy_lena_grunt.png",
    enemyRioneGrunt: "assets/enemy_rione_grunt.png",
    enemyCoraliaGrunt: "assets/enemy_coralia_grunt.png",
    enemyEscarGrunt: "assets/enemy_escar_grunt.png",
    enemyMediGrunt1: "assets/enemy_medi_grunt1.png",
    enemyMediGrunt2: "assets/enemy_medi_grunt2.png",
    enemyOriaGrunt: "assets/enemy_oria_grunt.png",
    portraitLena: "assets/portrait_lena.png",
    portraitRione: "assets/portrait_rione.png",
    portraitCoralia: "assets/portrait_coralia.png",
    portraitEscar: "assets/portrait_escar.png",
    portraitShera: "assets/portrait_shera.png",
    portraitOria: "assets/portrait_oria.png",
    portraitMedi: "assets/portrait_medi.png",
    portraitMediSerious: "assets/portrait_medi_serious.png",
    // エンディング1枚絵(未提供)。ファイルが無ければ描画側がグラデーションで代替する。
    ending1: "assets/ending_1.png",
    ending2: "assets/ending_2.png",
  },

  colors: {
    pageBackground: "#10121b",
    outerFill: "#161827",
    fieldTop: "#12213a",
    fieldBottom: "#050814",
    fieldBorder: "rgba(210, 225, 255, 0.18)",
    hitFill: "rgba(255, 80, 160, 0.95)",
    hitStroke: "rgba(255, 255, 255, 0.9)",
    hitStrokeInvuln: "rgba(255, 255, 255, 0.95)",
    sway: "rgba(148, 205, 255, 0.42)",
    swayAccent: "rgba(194, 170, 255, 0.35)",
  },

  player: {
    // 実素材(526x996, 縦長比率0.528)にほぼ合わせたサイズ。
    isPlaceholder: false,
    spriteWidth: 59,
    spriteHeight: 112,
    startX: 180,
    startY: 500,
    // 自機をつかめる範囲(ワールド座標オフセット)。判定円の少し上から足元の少し下まで、
    // タップではなくドラッグでしか動かせないようにするための「掴み判定」に使う。
    grabPaddingX: 16,
    grabTopPadding: 10,
    grabBottomPadding: 16,
    followStrength: 14,
    maxTiltRad: 0.18,
    tiltResponsiveness: 10,
    tiltFromVelocity: 0.018,
    swayStrength: 0.24,
    swayResponsiveness: 8,
    hitRadius: 5,
    hitOffsetX: 0,
    hitOffsetY: -16,
    lives: 3,
  },

  shot: {
    interval: 0.12,
    speed: 420,
    radius: 3,
    damage: 1,
    muzzleOffsetY: -40,
    color: "rgba(220, 242, 255, 0.95)",
    glowColor: "rgba(150, 210, 255, 0.45)",
  },

  // 敵弾のデフォルト見た目。パターン個別に color/glowColor/radius を上書き可能(enemyBullets.js参照)。
  // lifetimeは「画面外に出たら消える」判定とは別の保険用の寿命。低速弾(featherFallの45px/s等)が
  // 画面端(対角線734px相当)に届く前に消えてしまっていたため、最も遅いパターンでも余裕を持って
  // 端まで届く値まで引き上げてある。個別に短くしたい理由がない限りパターン側では上書きしない。
  enemyBullet: {
    radius: 4.5,
    lifetime: 18,
    color: "rgba(255, 176, 214, 0.9)",
    glowColor: "rgba(255, 200, 230, 0.4)",
  },

  // 直線レーザーのデフォルト見た目/尺(enemyLasers.js参照)。3面のオリア/メディで初めて使う。
  enemyLaser: {
    warnDuration: 0.55,
    fireDuration: 0.5,
    fadeDuration: 0.25,
    warnWidth: 2,
    fireWidth: 7,
    length: 460,
    color: "rgba(180, 210, 255, 0.92)",
    glowColor: "rgba(200, 225, 255, 0.4)",
    warnColor: "rgba(255, 255, 255, 0.55)",
  },

  miss: {
    flashDuration: 0.9,
    flashInterval: 0.08,
  },

  boss: {
    defeatFlashDuration: 1.0,
    defeatFlashInterval: 0.08,
    entryDuration: 1.2,
    // 立ち絵差し替え(本気モード移行)の演出尺。メディの3→4パターン目でのみ使う。
    formFlashDuration: 1.1,
  },

  score: {
    eelGrunt: 100,
    fishGrunt: 120,
    lionfishGrunt: 110,
    anglerGrunt: 130,
    mediGrunt: 140,
    oriaGrunt: 150,
    miniboss: 3000,
    boss: 10000,
    clearBonus: 2000,
    noMissBonus: 5000,
  },

  pool: {
    playerBullets: 120,
    enemyBullets: 420,
    enemyLasers: 16,
  },

  ui: {
    pauseButton: { x: 320, y: 10, w: 30, h: 30 },
    // 神話的な雰囲気を出すため、セリフ体＋金/真珠色を基調にする。
    // Webフォントは読み込まず(外部依存無しの方針を継続)、OS標準の明朝/セリフにフォールバックさせる。
    titleFont: "'Times New Roman', 'Hiragino Mincho ProN', 'Noto Serif JP', serif",
    bodyFont: "'Times New Roman', 'Hiragino Mincho ProN', 'Noto Serif JP', serif",
    textColor: "#f3ecda",
    subTextColor: "rgba(232, 216, 178, 0.78)",
    accentGold: "#e3c98a",
    accentGoldBright: "#f8e7b8",
    accentGoldDim: "rgba(227, 201, 138, 0.5)",
    buttonFill: "rgba(20, 24, 20, 0.28)",
    buttonStroke: "rgba(227, 201, 138, 0.75)",
    overlayFill: "rgba(8, 10, 16, 0.62)",
    lifeColor: "rgba(248, 209, 140, 0.95)",
    dimTextColor: "rgba(210, 210, 220, 0.42)",
    // 台詞中に人名が出てきた時だけこの色にする(金系のテキスト/アクセントと被らない寒色)。
    nameHighlight: "#a7d8ff",
  },

  debug: {
    showHitCircle: true,
    showEnemyHitCircle: true,
  },
};
