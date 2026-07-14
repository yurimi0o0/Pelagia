Game.assets = {
  background: null,
  backgroundReady: false,
  playerBack: null,
  playerBackReady: false,
  bosses: {},
  grunts: {},
  portraits: {},
};

Game.loadImage = function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ image, ok: true });
    image.onerror = () => resolve({ image: null, ok: false });
    image.src = src;
  });
};

Game.loadAssets = async function loadAssets() {
  const cfg = Game.CONFIG.assets;

  const [bg, playerBack, bossLena, bossRione, eelGrunt, fishGrunt, portraitLena, portraitRione] = await Promise.all([
    Game.loadImage(cfg.background),
    Game.loadImage(cfg.playerBack),
    Game.loadImage(cfg.bossLena),
    Game.loadImage(cfg.bossRione),
    Game.loadImage(cfg.enemyLenaGrunt),
    Game.loadImage(cfg.enemyRioneGrunt),
    Game.loadImage(cfg.portraitLena),
    Game.loadImage(cfg.portraitRione),
  ]);

  Game.assets.background = bg.image;
  Game.assets.backgroundReady = bg.ok;

  Game.assets.playerBack = playerBack.image;
  Game.assets.playerBackReady = playerBack.ok;

  Game.assets.bosses.lena = { image: bossLena.image, ready: bossLena.ok };
  Game.assets.bosses.rione = { image: bossRione.image, ready: bossRione.ok };

  Game.assets.grunts.eelGrunt = { image: eelGrunt.image, ready: eelGrunt.ok };
  Game.assets.grunts.fishGrunt = { image: fishGrunt.image, ready: fishGrunt.ok };

  Game.assets.portraits.lena = { image: portraitLena.image, ready: portraitLena.ok };
  Game.assets.portraits.rione = { image: portraitRione.image, ready: portraitRione.ok };
};

Game.drawBackground = function drawBackground(ctx) {
  const w = Game.CONFIG.world;
  if (Game.assets.backgroundReady) {
    ctx.drawImage(Game.assets.background, 0, 0, w.width, w.height);
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, w.height);
  gradient.addColorStop(0, Game.CONFIG.colors.fieldTop);
  gradient.addColorStop(1, Game.CONFIG.colors.fieldBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w.width, w.height);
};
