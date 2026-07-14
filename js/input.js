Game.input = {
  isDown: false,
  pointerId: null,
};

Game.setupInput = function setupInput() {
  const canvas = Game.canvas;
  const input = Game.input;

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

    // 自機に触れた時だけドラッグ開始。タップしただけではその場に飛ばない。
    if (!Game.player.isPointInGrabZone(world.x, world.y)) return;

    input.isDown = true;
    input.pointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    Game.player.beginDrag(world.x, world.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!input.isDown || event.pointerId !== input.pointerId) return;
    if (Game.state !== Game.STATES.PLAYING) return;
    event.preventDefault();
    const world = Game.screenToWorld(event.clientX, event.clientY);
    Game.player.dragTo(world.x, world.y);
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
