// 雑魚敵の定義データ。新しい雑魚を足す時はここにエントリを増やすだけでよい形にしている。
// shot が null の敵は体当たりのみ（レーナ系のウツボ想定）、shot ありは自機狙いの単発を撃つ（リオネ系の魚想定）。
Game.ENEMY_DEFS = {
  eelGrunt: {
    sprite: "assets/enemy_lena_grunt.png",
    spriteWidth: 42,
    spriteHeight: 46,
    hp: 6,
    radius: 14,
    score: Game.CONFIG.score.eelGrunt,
    shot: null,
  },
  fishGrunt: {
    sprite: "assets/enemy_rione_grunt.png",
    spriteWidth: 46,
    spriteHeight: 23,
    hp: 5,
    radius: 12,
    score: Game.CONFIG.score.fishGrunt,
    // 元は淡い水色で背景に埋もれていたため、暖色寄りの高コントラストな色に変更。
    shot: { interval: 1.6, speed: 130, radius: 4.5, color: "rgba(255, 150, 90, 0.95)", glowColor: "rgba(255, 180, 130, 0.45)" },
  },
  // 2面(誘灯迷宮)の雑魚。コーリア系のミノカサゴは体当たりのみ、エスカー系のチョウチンアンコウは
  // ランタンの光を思わせる単発弾を撃つ。
  lionfishGrunt: {
    sprite: "assets/enemy_coralia_grunt.png",
    spriteWidth: 43,
    spriteHeight: 46,
    hp: 7,
    radius: 15,
    score: Game.CONFIG.score.lionfishGrunt,
    shot: null,
  },
  anglerGrunt: {
    sprite: "assets/enemy_escar_grunt.png",
    spriteWidth: 44,
    spriteHeight: 32,
    hp: 5,
    radius: 13,
    score: Game.CONFIG.score.anglerGrunt,
    shot: { interval: 1.5, speed: 125, radius: 4, color: "rgba(255, 214, 120, 0.95)", glowColor: "rgba(255, 230, 160, 0.45)" },
  },
  // 3面(無光王宮)の雑魚。最終面らしく1・2面よりわずかにHP/弾速/接触判定を強めている。
  // メディモチーフの小型クラゲ2種(1種は単発弾持ち)と、オリアモチーフの高速シャチ。
  mediGrunt1: {
    sprite: "assets/enemy_medi_grunt1.png",
    spriteWidth: 44,
    spriteHeight: 44,
    hp: 7,
    radius: 15,
    score: Game.CONFIG.score.mediGrunt,
    shot: null,
  },
  mediGrunt2: {
    sprite: "assets/enemy_medi_grunt2.png",
    spriteWidth: 44,
    spriteHeight: 44,
    hp: 6,
    radius: 14,
    score: Game.CONFIG.score.mediGrunt,
    shot: { interval: 1.3, speed: 140, radius: 4.5, color: "rgba(200, 160, 255, 0.95)", glowColor: "rgba(220, 190, 255, 0.45)" },
  },
  oriaGrunt: {
    sprite: "assets/enemy_oria_grunt.png",
    spriteWidth: 48,
    spriteHeight: 30,
    hp: 6,
    radius: 14,
    score: Game.CONFIG.score.oriaGrunt,
    shot: null,
  },
};

// 移動パターンのライブラリ。spec.move.params を渡すと age(経過秒)→座標 の関数を返す。
// ウェーブ定義はこのkindを指定するだけで済むので、新しい動きを足す時はここに1つ増やすだけでよい。
Game.MOVEMENTS = {
  straightDown(p) {
    return (age) => ({ x: p.x, y: p.y0 + p.speed * age });
  },
  sineDive(p) {
    return (age) => ({
      x: p.x0 + Math.sin(age * p.frequency) * p.amplitude,
      y: p.y0 + p.vy * age,
    });
  },
  // 画面外の横から弧を描いて入ってきて、そのまま下へ抜けていく。
  arcFromSide(p) {
    return (age) => ({
      x: p.targetX + p.side * p.curveStrength * Math.exp(-age * p.curveDecay),
      y: p.y0 + p.vy * age,
    });
  },
};

Game.grunts = [];
Game.pendingGruntSpawns = [];

Game.spawnWave = function spawnWave(waveDef) {
  waveDef.forEach((spec) => {
    Game.pendingGruntSpawns.push({ spec, timer: spec.delay || 0 });
  });
};

Game.spawnGruntNow = function spawnGruntNow(spec) {
  const def = Game.ENEMY_DEFS[spec.type];
  const moveFn = Game.MOVEMENTS[spec.move.kind](spec.move.params);
  const grunt = {
    type: spec.type,
    age: 0,
    x: 0,
    y: 0,
    hp: def.hp,
    radius: def.radius,
    flip: !!spec.flip,
    moveFn,
    shotTimer: def.shot ? def.shot.interval * (0.4 + Math.random() * 0.4) : 0,
    alive: true,
  };
  const p0 = moveFn(0);
  grunt.x = p0.x;
  grunt.y = p0.y;
  Game.grunts.push(grunt);
  return grunt;
};

Game.damageGrunt = function damageGrunt(grunt, amount) {
  grunt.hp -= amount;
  if (grunt.hp <= 0 && grunt.alive) {
    grunt.alive = false;
    Game.addScore(Game.ENEMY_DEFS[grunt.type].score, "kills");
  }
};

Game.updateGrunts = function updateGrunts(dt) {
  for (let i = Game.pendingGruntSpawns.length - 1; i >= 0; i -= 1) {
    const pending = Game.pendingGruntSpawns[i];
    pending.timer -= dt;
    if (pending.timer <= 0) {
      Game.spawnGruntNow(pending.spec);
      Game.pendingGruntSpawns.splice(i, 1);
    }
  }

  const w = Game.CONFIG.world;
  for (let i = Game.grunts.length - 1; i >= 0; i -= 1) {
    const g = Game.grunts[i];
    const def = Game.ENEMY_DEFS[g.type];

    g.age += dt;
    const pos = g.moveFn(g.age);
    g.x = pos.x;
    g.y = pos.y;

    if (g.alive && def.shot) {
      g.shotTimer -= dt;
      if (g.shotTimer <= 0) {
        g.shotTimer += def.shot.interval;
        const p = Game.player;
        const angle = Math.atan2(p.y - g.y, p.x - g.x);
        Game.fireAngledBullet(g.x, g.y, angle, def.shot.speed, def.shot);
      }
    }

    const offscreen = g.y > w.height + 50 || g.y < -70 || g.x < -70 || g.x > w.width + 70;
    if (!g.alive || offscreen) {
      Game.grunts.splice(i, 1);
    }
  }
};

Game.drawGrunts = function drawGrunts(ctx) {
  Game.grunts.forEach((g) => {
    const def = Game.ENEMY_DEFS[g.type];
    const img = Game.assets.grunts[g.type];

    ctx.save();
    ctx.translate(g.x, g.y);
    if (g.flip) ctx.scale(-1, 1);

    if (img && img.ready) {
      ctx.drawImage(img.image, -def.spriteWidth / 2, -def.spriteHeight / 2, def.spriteWidth, def.spriteHeight);
    } else {
      ctx.beginPath();
      ctx.fillStyle = g.type === "eelGrunt" ? "#8fd0ff" : "#ffd0e6";
      ctx.arc(0, 0, def.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (Game.CONFIG.debug.showEnemyHitCircle) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.arc(g.x, g.y, def.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  });
};
