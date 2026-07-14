Game.input = {
  isDown: false,
  pointerId: null,
  worldX: 0,
  worldY: 0,
};

Game.setupInput = function setupInput() {
  const canvas = Game.canvas;
  const input = Game.input;
  input.worldX = Game.CONFIG.player.startX;
  input.worldY = Game.CONFIG.player.startY;

  function applyPointer(event) {
    const world = Game.screenToWorld(event.clientX, event.clientY);
    input.worldX = world.x;
    input.worldY = world.y;
    Game.player.setTargetFromPointer(world.x, world.y);
  }

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const world = Game.screenToWorld(event.clientX, event.clientY);

    // プレイ中でも一時停止ボタンだけは自機操作より優先する
    if (Game.state === Game.STATES.PLAYING && Game.isPauseButtonHit(world.x, world.y)) {
      Game.setState(Game.STATES.PAUSED);
      return;
    }

    // プレイ中以外はタップ＝メニュー操作。自機のドラッグ追従は始めない。
    if (Game.state !== Game.STATES.PLAYING) {
      Game.handleTap(world.x, world.y);
      return;
    }

    input.isDown = true;
    input.pointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    applyPointer(event);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!input.isDown || event.pointerId !== input.pointerId) return;
    if (Game.state !== Game.STATES.PLAYING) return;
    event.preventDefault();
    applyPointer(event);
  });

  const releasePointer = (event) => {
    if (event.pointerId !== input.pointerId) return;
    event.preventDefault();
    input.isDown = false;
    input.pointerId = null;
  };

  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);
  canvas.addEventListener("lostpointercapture", () => {
    input.isDown = false;
    input.pointerId = null;
  });
};
