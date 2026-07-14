// Pelagia: 全モジュール共通の名前空間。以後の全ファイルはこの Game に生やしていく。
window.Game = window.Game || {};

// 調整しそうな数値・アセットパスをここに集約する（既存方針を継続）。
Game.CONFIG = {
  world: {
    width: 360,
    height: 640,
  },

  assets: {
    background: "assets/bg_stage1.jpg",
    playerBack: "assets/player_back.png",
    bossLena: "assets/boss_lena.png",
    bossRione: "assets/boss_rione.png",
    enemyLenaGrunt: "assets/enemy_lena_grunt.png",
    enemyRioneGrunt: "assets/enemy_rione_grunt.png",
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
    pointerOffsetY: 88,
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
  enemyBullet: {
    radius: 4,
    lifetime: 6,
    color: "rgba(255, 176, 214, 0.9)",
    glowColor: "rgba(255, 200, 230, 0.4)",
  },

  miss: {
    flashDuration: 0.9,
    flashInterval: 0.08,
    recenterX: 180,
    recenterY: 500,
  },

  boss: {
    defeatFlashDuration: 1.0,
    defeatFlashInterval: 0.08,
    entryDuration: 1.2,
  },

  score: {
    eelGrunt: 100,
    fishGrunt: 120,
    miniboss: 3000,
    boss: 10000,
  },

  pool: {
    playerBullets: 120,
    enemyBullets: 420,
  },

  ui: {
    pauseButton: { x: 320, y: 10, w: 30, h: 30 },
    textColor: "#eef4ff",
    subTextColor: "rgba(238, 244, 255, 0.72)",
    buttonFill: "rgba(255, 255, 255, 0.12)",
    buttonStroke: "rgba(238, 244, 255, 0.65)",
    overlayFill: "rgba(6, 9, 18, 0.6)",
    lifeColor: "rgba(255, 120, 180, 0.95)",
  },

  debug: {
    showHitCircle: true,
    showEnemyHitCircle: true,
  },
};
