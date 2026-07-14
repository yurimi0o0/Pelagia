Game.assets = {
  backgrounds: {},
  playerBack: null,
  playerBackReady: false,
  bosses: {},
  grunts: {},
  portraits: {},
  illustrations: {},
};

Game.loadImage = function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ image, ok: true });
    image.onerror = () => resolve({ image: null, ok: false });
    image.src = src;
  });
};

// アセットの宣言的マニフェスト。新しい絵を足す時はここに1行増やすだけでよい
// (以前は位置引数のPromise.allを手作業で並べていて、3面以降で本数が増えると事故りやすかった)。
// bucket:"playerBack" だけは Game.assets.playerBack/playerBackReady という特別な形で使われている
// 既存の参照(player.js)を壊さないよう、ロード後に個別代入する。
Game.ASSET_MANIFEST = function buildAssetManifest(cfg) {
  return [
    { bucket: "backgrounds", key: 1, path: cfg.background1 },
    { bucket: "backgrounds", key: 2, path: cfg.background2 },
    { bucket: "backgrounds", key: 3, path: cfg.background3 },
    { bucket: "playerBack", key: "playerBack", path: cfg.playerBack },

    { bucket: "bosses", key: "lena", path: cfg.bossLena },
    { bucket: "bosses", key: "rione", path: cfg.bossRione },
    { bucket: "bosses", key: "coralia", path: cfg.bossCoralia },
    { bucket: "bosses", key: "escar", path: cfg.bossEscar },
    { bucket: "bosses", key: "oria", path: cfg.bossOria },
    { bucket: "bosses", key: "medi", path: cfg.bossMedi },
    { bucket: "bosses", key: "mediSerious", path: cfg.bossMediSerious },

    { bucket: "grunts", key: "eelGrunt", path: cfg.enemyLenaGrunt },
    { bucket: "grunts", key: "fishGrunt", path: cfg.enemyRioneGrunt },
    { bucket: "grunts", key: "lionfishGrunt", path: cfg.enemyCoraliaGrunt },
    { bucket: "grunts", key: "anglerGrunt", path: cfg.enemyEscarGrunt },
    { bucket: "grunts", key: "mediGrunt1", path: cfg.enemyMediGrunt1 },
    { bucket: "grunts", key: "mediGrunt2", path: cfg.enemyMediGrunt2 },
    { bucket: "grunts", key: "oriaGrunt", path: cfg.enemyOriaGrunt },

    { bucket: "portraits", key: "lena", path: cfg.portraitLena },
    { bucket: "portraits", key: "rione", path: cfg.portraitRione },
    { bucket: "portraits", key: "coralia", path: cfg.portraitCoralia },
    { bucket: "portraits", key: "escar", path: cfg.portraitEscar },
    // シェーラは戦闘に出ないのでbossesエントリは無く、会話用の立ち絵だけ持つ。
    { bucket: "portraits", key: "shera", path: cfg.portraitShera },
    { bucket: "portraits", key: "oria", path: cfg.portraitOria },
    { bucket: "portraits", key: "medi", path: cfg.portraitMedi },
    { bucket: "portraits", key: "mediSerious", path: cfg.portraitMediSerious },

    // エンディング1枚絵。未提供の間はready:falseのままになり、描画側がグラデーションで代替する。
    { bucket: "illustrations", key: "ending1", path: cfg.ending1 },
    { bucket: "illustrations", key: "ending2", path: cfg.ending2 },
  ];
};

Game.loadAssets = async function loadAssets() {
  const cfg = Game.CONFIG.assets;
  const manifest = Game.ASSET_MANIFEST(cfg);

  const loaded = await Promise.all(manifest.map((entry) => Game.loadImage(entry.path)));

  manifest.forEach((entry, i) => {
    const result = loaded[i];
    if (entry.bucket === "playerBack") {
      Game.assets.playerBack = result.image;
      Game.assets.playerBackReady = result.ok;
      return;
    }
    Game.assets[entry.bucket][entry.key] = { image: result.image, ready: result.ok };
  });
};

Game.drawBackground = function drawBackground(ctx) {
  const w = Game.CONFIG.world;
  const bg = Game.assets.backgrounds[Game.currentStageNumber || 1];
  if (bg && bg.ready) {
    ctx.drawImage(bg.image, 0, 0, w.width, w.height);
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, w.height);
  gradient.addColorStop(0, Game.CONFIG.colors.fieldTop);
  gradient.addColorStop(1, Game.CONFIG.colors.fieldBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w.width, w.height);
};
