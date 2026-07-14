(function main() {
  const CONFIG = Game.CONFIG;

  function update(dt) {
    Game.player.update(dt);
    Game.updatePlayerBullets(dt);
    Game.updateEnemies(dt);
    Game.updateEnemyBullets(dt);
    Game.resolveCollisions();
  }

  function render() {
    const ctx = Game.ctx;
    const v = Game.viewport;

    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    ctx.clearRect(0, 0, v.cssWidth, v.cssHeight);
    ctx.fillStyle = CONFIG.colors.outerFill;
    ctx.fillRect(0, 0, v.cssWidth, v.cssHeight);

    ctx.save();
    ctx.translate(v.offsetX, v.offsetY);
    ctx.scale(v.scale, v.scale);
    ctx.beginPath();
    ctx.rect(0, 0, CONFIG.world.width, CONFIG.world.height);
    ctx.clip();

    Game.drawBackground(ctx);
    Game.drawEnemies(ctx);
    Game.drawPlayerBullets(ctx);
    Game.player.drawSway(ctx);
    Game.player.draw(ctx);
    if (CONFIG.debug.showHitCircle) Game.player.drawHitCircle(ctx);
    Game.drawEnemyBullets(ctx); // 避けるべき弾は最前面で視認性を優先

    ctx.restore();

    ctx.save();
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    ctx.strokeStyle = CONFIG.colors.fieldBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(v.offsetX + 0.5, v.offsetY + 0.5, v.viewWidth - 1, v.viewHeight - 1);
    ctx.restore();
  }

  function loop(now) {
    const rawDt = (now - Game.lastFrameTime) / 1000;
    const dt = Math.min(rawDt, 1 / 30);
    Game.lastFrameTime = now;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  async function init() {
    Game.canvas = document.getElementById("gameCanvas");
    Game.ctx = Game.canvas.getContext("2d");
    document.documentElement.style.setProperty("--page-bg", CONFIG.colors.pageBackground);

    Game.player.init();
    Game.spawnStage(Game.STAGE1);

    Game.resizeCanvas();
    Game.setupInput();
    window.addEventListener("resize", Game.resizeCanvas);
    window.addEventListener("orientationchange", Game.resizeCanvas);

    await Game.loadAssets();
    Game.lastFrameTime = performance.now();
    requestAnimationFrame(loop);
  }

  init();
})();
