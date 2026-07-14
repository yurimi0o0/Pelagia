Game.assets = {
  backgrounds: {},
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

  const [
    bg1, bg2, playerBack,
    bossLena, bossRione, bossCoralia, bossEscar,
    eelGrunt, fishGrunt, coraliaGrunt, escarGrunt,
    portraitLena, portraitRione,
  ] = await Promise.all([
    Game.loadImage(cfg.background1),
    Game.loadImage(cfg.background2),
    Game.loadImage(cfg.playerBack),
    Game.loadImage(cfg.bossLena),
    Game.loadImage(cfg.bossRione),
    Game.loadImage(cfg.bossCoralia),
    Game.loadImage(cfg.bossEscar),
    Game.loadImage(cfg.enemyLenaGrunt),
    Game.loadImage(cfg.enemyRioneGrunt),
    Game.loadImage(cfg.enemyCoraliaGrunt),
    Game.loadImage(cfg.enemyEscarGrunt),
    Game.loadImage(cfg.portraitLena),
    Game.loadImage(cfg.portraitRione),
  ]);

  Game.assets.backgrounds[1] = { image: bg1.image, ready: bg1.ok };
  Game.assets.backgrounds[2] = { image: bg2.image, ready: bg2.ok };

  Game.assets.playerBack = playerBack.image;
  Game.assets.playerBackReady = playerBack.ok;

  Game.assets.bosses.lena = { image: bossLena.image, ready: bossLena.ok };
  Game.assets.bosses.rione = { image: bossRione.image, ready: bossRione.ok };
  Game.assets.bosses.coralia = { image: bossCoralia.image, ready: bossCoralia.ok };
  Game.assets.bosses.escar = { image: bossEscar.image, ready: bossEscar.ok };

  Game.assets.grunts.eelGrunt = { image: eelGrunt.image, ready: eelGrunt.ok };
  Game.assets.grunts.fishGrunt = { image: fishGrunt.image, ready: fishGrunt.ok };
  Game.assets.grunts.lionfishGrunt = { image: coraliaGrunt.image, ready: coraliaGrunt.ok };
  Game.assets.grunts.anglerGrunt = { image: escarGrunt.image, ready: escarGrunt.ok };

  Game.assets.portraits.lena = { image: portraitLena.image, ready: portraitLena.ok };
  Game.assets.portraits.rione = { image: portraitRione.image, ready: portraitRione.ok };
  // コーリア/エスカーの専用立ち絵はまだ無いので、届くまでSD戦闘絵をそのまま会話にも使う。
  Game.assets.portraits.coralia = Game.assets.bosses.coralia;
  Game.assets.portraits.escar = Game.assets.bosses.escar;
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
