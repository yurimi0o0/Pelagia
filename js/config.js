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
    // 現状このPNGはアルファ無し(RGB)で透過チェッカー柄が焼き込まれているため、
    // 差し替え待ちのプレースホルダーとして扱う（下のplayer.isPlaceholderを参照）。
    playerBack: "assets/player_back.png",
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
    isPlaceholder: true,
    spriteWidth: 64,
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

  // 敵の定義データ。新しい敵を足す時はここにエントリを増やすだけでよい形を目指す。
  enemy: {
    testDrone: {
      hp: 30,
      radius: 20,
      bobAmplitude: 18,
      bobSpeed: 1.6,
      color: "#ffb3d1",
      coreColor: "#fff3fa",
      shotInterval: 1.4,
    },
  },

  enemyBullet: {
    count: 12,
    speed: 90,
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

  pool: {
    playerBullets: 120,
    enemyBullets: 240,
  },

  debug: {
    showHitCircle: true,
    showEnemyHitCircle: true,
  },
};

// ステージ1の敵配置データ（今回はテスト用に1体のみ）。
// ステップBで道中ウェーブを足す時はここに spawns を増やしていく想定。
Game.STAGE1 = {
  spawns: [
    { type: "testDrone", x: 180, y: 130 },
  ],
};
