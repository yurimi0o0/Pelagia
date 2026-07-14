// 中ボス/ボスの定義データ。新しいボスを足す時はここにエントリを増やすだけでよい形にしている。
// patterns は上から順に適用され、hpThreshold(残HP割合)か duration(秒)のどちらかに達すると次へ進む。
// 最後の1個はしきい値/時間を無視し、HP0になるまで継続する。
Game.BOSS_DEFS = {
  lena: {
    name: "レーナ",
    sprite: "assets/boss_lena.png",
    spriteWidth: 127,
    spriteHeight: 130,
    radius: 40,
    hp: 150,
    // 台詞はPELAGIA設定資料のレーナの口癖/決め台詞から。
    dialogue: {
      beforeBattle: [
        { speaker: "レーナ", text: "暇だね。そこの魚、遊びな。" },
        { speaker: "ジェリー", text: "わ、私は魚じゃ…！" },
      ],
      afterDefeat: [
        { speaker: "レーナ", text: "私が英傑なのは強いからだ。理屈なんかどうでもいい。" },
      ],
    },
    patterns: [
      {
        kind: "aimedRapid",
        params: {
          interval: 0.5,
          speed: 160,
          spread: 3,
          spreadAngle: 0.24,
          radius: 3.5,
          color: "rgba(255, 150, 120, 0.92)",
          glowColor: "rgba(255, 180, 140, 0.4)",
        },
      },
    ],
  },

  rione: {
    name: "リオネ",
    sprite: "assets/boss_rione.png",
    spriteWidth: 101,
    spriteHeight: 128,
    radius: 34,
    hp: 600,
    // 台詞はPELAGIA設定資料のリオネの口癖/決め台詞から。
    dialogue: {
      beforeBattle: [
        { speaker: "リオネ", text: "ここから先へ行って、生きて帰れるの？" },
        { speaker: "ジェリー", text: "それでも、行かなきゃいけないの。" },
      ],
      afterDefeat: [
        { speaker: "リオネ", text: "浅海のものを立ち入らせない。私はここで導く者であり続ける。" },
        { speaker: "ジェリー", text: "ごめんね…でも、ありがとう。" },
      ],
    },
    patterns: [
      {
        kind: "rotatingRing",
        hpThreshold: 0.66,
        params: {
          count: 16,
          interval: 1.1,
          rotationSpeed: 0.6,
          speed: 70,
          radius: 4,
          color: "rgba(190, 220, 255, 0.9)",
          glowColor: "rgba(190, 220, 255, 0.4)",
        },
      },
      {
        kind: "gentleSpiral",
        hpThreshold: 0.33,
        params: {
          arms: 2,
          interval: 0.12,
          turnSpeed: 1.6,
          speed: 75,
          radius: 4,
          color: "rgba(214, 196, 255, 0.9)",
          glowColor: "rgba(214, 196, 255, 0.4)",
        },
      },
      {
        kind: "mirrorFarewell",
        params: {
          interval: 0.9,
          speed: 95,
          radius: 4.5,
          color: "rgba(255, 238, 250, 0.95)",
          glowColor: "rgba(255, 238, 250, 0.4)",
        },
      },
    ],
  },
};

// 弾幕パターンの実装。boss.patternState はパターン切り替え時にリセットされるスクラッチ領域。
Game.BOSS_PATTERNS = {
  // レーナ：自機狙いを扇状3wayで連射する、手数の多い攻撃的なパターン。
  aimedRapid(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
    const count = params.spread || 1;
    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : (i - (count - 1) / 2) * params.spreadAngle;
      Game.fireAngledBullet(boss.x, boss.y, baseAngle + offset, params.speed, params);
    }
  },

  // リオネ第1形態：ゆっくり回転するリング。隙間があり避けやすい規則的な弾幕。
  rotatingRing(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.rotation = (boss.patternState.rotation || 0) + params.rotationSpeed * dt;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;
    Game.fireRing(boss.x, boss.y, params.count, boss.patternState.rotation, params.speed, params);
  },

  // リオネ第2形態：ゆっくり回る腕から花びら状に弾を撒く。
  gentleSpiral(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.angle = (boss.patternState.angle || 0) + params.turnSpeed * dt;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;
    for (let i = 0; i < params.arms; i += 1) {
      const angle = boss.patternState.angle + (Math.PI * 2 * i) / params.arms;
      Game.fireAngledBullet(boss.x, boss.y, angle, params.speed, params);
    }
  },

  // リオネ最終形態：自機へ向けて左右対称に2発。引き止めるような、優しいが逃げ場を絞る弾。
  mirrorFarewell(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const dx = p.x - boss.x;
    const dy = p.y - boss.y;
    Game.fireAngledBullet(boss.x, boss.y, Math.atan2(dy, dx), params.speed, params);
    Game.fireAngledBullet(boss.x, boss.y, Math.atan2(dy, -dx), params.speed, params);
  },
};

Game.activeBoss = null;

Game.spawnBoss = function spawnBoss(key, x, y, isMainBoss) {
  const def = Game.BOSS_DEFS[key];
  const boss = {
    key,
    x,
    y,
    baseX: x,
    baseY: y,
    hp: def.hp,
    maxHp: def.hp,
    radius: def.radius,
    isMainBoss: !!isMainBoss,
    age: 0,
    entryProgress: 0,
    patternIndex: 0,
    patternTimer: 0,
    patternState: {},
    alive: true,
    defeated: false,
    defeatTimer: 0,
  };
  Game.activeBoss = boss;
  return boss;
};

Game.damageBoss = function damageBoss(boss, amount) {
  if (boss.defeated) return;
  boss.hp = Math.max(0, boss.hp - amount);
  if (boss.hp <= 0) {
    boss.alive = false;
    boss.defeated = true;
    boss.defeatTimer = Game.CONFIG.boss.defeatFlashDuration;
    // 撃破演出(光の粒になって鎮まる)用に、飛び散る粒子の角度/速度/大きさを一度だけ決めておく。
    boss.defeatSeed = Array.from({ length: 14 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 40 + Math.random() * 70,
      size: 2 + Math.random() * 2.5,
    }));
  }
};

Game.updateBoss = function updateBoss(dt) {
  const boss = Game.activeBoss;
  if (!boss) return;

  if (boss.defeated) {
    boss.defeatTimer -= dt;
    if (boss.defeatTimer <= 0) {
      // 世界観上「撃破=死亡」ではないため、ここでは消滅演出が終わっただけ扱い。
      // 台詞(あれば)を挟んでから道中/クリアへ進む(stageRunnerがactiveBoss==nullを見て次フェーズへ進める)。
      Game.activeBoss = null;
      Game.addScore(
        boss.isMainBoss ? Game.CONFIG.score.boss : Game.CONFIG.score.miniboss,
        boss.isMainBoss ? "boss" : "miniboss",
      );
      const def = Game.BOSS_DEFS[boss.key];
      Game.startDialogue(def.dialogue && def.dialogue.afterDefeat, null);
    }
    return;
  }

  const def = Game.BOSS_DEFS[boss.key];
  boss.age += dt;

  boss.entryProgress = Math.min(1, boss.entryProgress + dt / Game.CONFIG.boss.entryDuration);
  const eased = 1 - (1 - boss.entryProgress) * (1 - boss.entryProgress);
  boss.y = boss.baseY - (1 - eased) * 160;
  boss.x = boss.baseX + (boss.entryProgress >= 1 ? Math.sin(boss.age * 0.6) * 22 : 0);

  const patterns = def.patterns;
  const pattern = patterns[boss.patternIndex];
  boss.patternTimer += dt;
  const hpRatio = boss.hp / boss.maxHp;
  const isLast = boss.patternIndex === patterns.length - 1;
  if (!isLast) {
    const thresholdHit = pattern.hpThreshold != null && hpRatio <= pattern.hpThreshold;
    const durationHit = pattern.duration != null && boss.patternTimer >= pattern.duration;
    if (thresholdHit || durationHit) {
      boss.patternIndex += 1;
      boss.patternTimer = 0;
      boss.patternState = {};
    }
  }

  if (boss.entryProgress >= 1) {
    Game.BOSS_PATTERNS[def.patterns[boss.patternIndex].kind](boss, def.patterns[boss.patternIndex], dt);
  }
};

Game.drawBoss = function drawBoss(ctx) {
  const boss = Game.activeBoss;
  if (!boss) return;
  const def = Game.BOSS_DEFS[boss.key];
  const img = Game.assets.bosses[boss.key];
  const defeatProgress = boss.defeated
    ? 1 - boss.defeatTimer / Game.CONFIG.boss.defeatFlashDuration
    : 0;

  ctx.save();
  ctx.translate(boss.x, boss.y);
  if (boss.defeated) {
    const blinkOn = Math.floor(boss.defeatTimer / Game.CONFIG.boss.defeatFlashInterval) % 2 === 0;
    ctx.globalAlpha = (blinkOn ? 1 : 0.3) * Math.max(0.15, 1 - defeatProgress * 0.6);
    const scale = 1 - defeatProgress * 0.25;
    ctx.scale(scale, scale);
  }

  if (img && img.ready) {
    ctx.drawImage(img.image, -def.spriteWidth / 2, -def.spriteHeight / 2, def.spriteWidth, def.spriteHeight);
  } else {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.arc(0, 0, boss.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = boss.key === "lena" ? "#ff9d7a" : "#c9b6ff";
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 撃破演出：戦闘終了の合図として、光の輪と粒子が静かに広がって消える(=消滅ではなく鎮まるイメージ)。
  if (boss.defeated) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - defeatProgress) * 0.8;
    ctx.strokeStyle = "rgba(255, 244, 214, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.radius * (1 + defeatProgress * 3), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    boss.defeatSeed.forEach((p) => {
      const dist = p.speed * defeatProgress;
      const x = boss.x + Math.cos(p.angle) * dist;
      const y = boss.y + Math.sin(p.angle) * dist;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - defeatProgress);
      ctx.fillStyle = "rgba(255, 240, 210, 0.95)";
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  if (Game.CONFIG.debug.showEnemyHitCircle && !boss.defeated) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};
