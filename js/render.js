Game.assets = {
  background: null,
  backgroundReady: false,
  playerBack: null,
  playerBackReady: false,
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
  const [bg, playerBack] = await Promise.all([
    Game.loadImage(Game.CONFIG.assets.background),
    Game.loadImage(Game.CONFIG.assets.playerBack),
  ]);
  Game.assets.background = bg.image;
  Game.assets.backgroundReady = bg.ok;
  // player.isPlaceholder が true の間は読み込めても使わずシルエットのままにする
  // （現状のPNGはアルファ無しで透過チェッカーが焼き込まれているため）。
  Game.assets.playerBack = playerBack.image;
  Game.assets.playerBackReady = playerBack.ok;
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
