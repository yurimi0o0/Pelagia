// 内部解像度(world)を画面に収めてスケール表示するための変換情報。
Game.viewport = {
  dpr: 1,
  cssWidth: 0,
  cssHeight: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  viewWidth: 0,
  viewHeight: 0,
};

Game.resizeCanvas = function resizeCanvas() {
  const canvas = Game.canvas;
  const v = Game.viewport;
  v.dpr = window.devicePixelRatio || 1;
  v.cssWidth = window.innerWidth;
  v.cssHeight = window.innerHeight;
  canvas.width = Math.floor(v.cssWidth * v.dpr);
  canvas.height = Math.floor(v.cssHeight * v.dpr);
  canvas.style.width = `${v.cssWidth}px`;
  canvas.style.height = `${v.cssHeight}px`;
  Game.updateViewport();
};

Game.updateViewport = function updateViewport() {
  const v = Game.viewport;
  const w = Game.CONFIG.world;
  v.scale = Math.min(v.cssWidth / w.width, v.cssHeight / w.height);
  v.viewWidth = w.width * v.scale;
  v.viewHeight = w.height * v.scale;
  v.offsetX = (v.cssWidth - v.viewWidth) / 2;
  v.offsetY = (v.cssHeight - v.viewHeight) / 2;
};

Game.screenToWorld = function screenToWorld(clientX, clientY) {
  const v = Game.viewport;
  return {
    x: (clientX - v.offsetX) / v.scale,
    y: (clientY - v.offsetY) / v.scale,
  };
};
