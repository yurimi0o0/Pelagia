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
    // レーナは事情を知らず、ただ"面白そうな獲物"としてジェリーに絡んでくる。
    dialogue: {
      beforeBattle: [
        { speaker: "レーナ", text: "……お。めずらしい。こんな浅いとこの子が、なんでこんな下まで来てるんだい？" },
        { speaker: "ジェリー", text: "深海灯を探しに行くの。通してくれる？" },
        { speaker: "レーナ", text: "ふうん、まぁ、無謀だと思うけど" },
        { speaker: "レーナ", text: "あぁ、でもちょうどいいや。暇だったんだ。" },
        { speaker: "レーナ", text: "そこの浅瀬の魚。ちょっと遊びな。六英傑のあたしから逃げ切れたら通してあげる。ここはまだ浅い所だし。" },
      ],
      afterDefeat: [
        { speaker: "レーナ", text: "……へえ。やるじゃん。思ったより強いんだね、あんた。" },
        { speaker: "レーナ", text: "いいよ、行きな。深いとこは、あんたが思ってるよりずっと物騒だけど。" },
        { speaker: "ジェリー", text: "うん……ありがとう、レーナ。" },
        { speaker: "レーナ", text: "礼はいらないよ。あたしはただ、面白い方を選んだだけ。" },
      ],
    },
    // 設定資料の弾幕描写(蛇行する高速弾/岩陰から飛び出す弾列/左右から挟む噛みつき弾)に対応する3形態。
    patterns: [
      {
        kind: "serpentineFast",
        hpThreshold: 0.66,
        params: {
          interval: 0.35,
          speed: 190,
          radius: 3.5,
          color: "rgba(130, 225, 195, 0.92)",
          glowColor: "rgba(150, 240, 210, 0.4)",
          waveAmp: 26,
          waveFreq: 6.5,
        },
      },
      {
        kind: "ambushRows",
        hpThreshold: 0.33,
        params: {
          interval: 1.3,
          rowCount: 4,
          rowSpacing: 60,
          speed: 150,
          radius: 4,
          color: "rgba(120, 200, 255, 0.9)",
          glowColor: "rgba(150, 220, 255, 0.4)",
        },
      },
      {
        kind: "pincerBite",
        params: {
          interval: 1.0,
          speed: 170,
          radius: 4.5,
          color: "rgba(255, 120, 130, 0.92)",
          glowColor: "rgba(255, 160, 170, 0.4)",
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
    // リオネは"知っていて、心配して"止める。1面ボスだが実は一番ジェリーに優しい。
    dialogue: {
      beforeBattle: [
        { speaker: "リオネ", text: "そこまで。……あなた、浅海の子ね。" },
        { speaker: "ジェリー", text: "お願い、通して。深海灯を探しに行くの。" },
        { speaker: "リオネ", text: "深海灯。……ここから先へ行って、生きて帰れるの？" },
        { speaker: "ジェリー", text: "帰るよ。光を持って、みんなのところに帰る。" },
        { speaker: "リオネ", text: "（…この子は、何も知らないのね。）" },
        { speaker: "リオネ", text: "ごめんなさい。わたしは、浅海のものをここから先へ行かすことはできない。" },
        { speaker: "リオネ", text: "わたしはここで引き返す者を導く者であり続ける。……それが、六英傑の一人として、あなたを守ることでもあるから。" },
      ],
      afterDefeat: [
        { speaker: "リオネ", text: "……強い子。止められなかったわね。" },
        { speaker: "リオネ", text: "行きなさい。でも、覚えておいて。" },
        { speaker: "リオネ", text: "あなたが探しているものは、あなたが思っているものとは、違うかもしれない。" },
        { speaker: "ジェリー", text: "？ どういう…" },
        { speaker: "リオネ", text: "……いいえ。行けば、わかる。気をつけて。" },
      ],
    },
    // 設定資料の弾幕描写(翼のように開く弾/雪や羽根の白い光弾/ゆっくり降りる透明弾)に対応する3形態。
    patterns: [
      {
        kind: "wingSpread",
        hpThreshold: 0.66,
        params: {
          interval: 1.0,
          pairs: 4,
          spreadAngle: 0.22,
          baseAngle: Math.PI / 2,
          speed: 85,
          radius: 4,
          color: "rgba(210, 225, 255, 0.92)",
          glowColor: "rgba(210, 225, 255, 0.4)",
        },
      },
      {
        kind: "featherFall",
        hpThreshold: 0.33,
        params: {
          interval: 0.22,
          speed: 45,
          radius: 4,
          color: "rgba(255, 255, 255, 0.92)",
          glowColor: "rgba(255, 255, 255, 0.35)",
          waveAmp: 18,
          waveFreq: 1.8,
        },
      },
      {
        kind: "clearDrops",
        // 最終形態に入る直前だけ挟む短い一言。
        beforePattern: [{ speaker: "リオネ", text: "決意は強いのね。" }],
        params: {
          interval: 0.5,
          count: 3,
          spreadAngle: 0.5,
          speed: 55,
          radius: 7,
          color: "rgba(220, 235, 255, 0.85)",
          glowColor: "rgba(220, 235, 255, 0.3)",
          ring: true,
        },
      },
    ],
  },
};

// 弾幕パターンの実装。boss.patternState はパターン切り替え時にリセットされるスクラッチ領域。
Game.BOSS_PATTERNS = {
  // レーナ第1形態：ウツボのように波打ちながら自機へ向かう高速弾(enemyBullets.jsのwaveで蛇行させる)。
  serpentineFast(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    Game.fireAngledBullet(boss.x, boss.y, angle, params.speed, {
      ...params,
      wave: { amp: params.waveAmp, freq: params.waveFreq },
    });
  },

  // レーナ第2形態：岩陰(画面端)から交互に飛び出す弾の列で不意打ちする。
  ambushRows(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    boss.patternState.side = boss.patternState.side === "left" ? "right" : "left";
    const fromLeft = boss.patternState.side === "left";
    const startY = Game.player.y - ((params.rowCount - 1) * params.rowSpacing) / 2;
    for (let i = 0; i < params.rowCount; i += 1) {
      const y = startY + i * params.rowSpacing;
      const x = fromLeft ? -10 : Game.CONFIG.world.width + 10;
      Game.fireAngledBullet(x, y, fromLeft ? 0 : Math.PI, params.speed, params);
    }
  },

  // レーナ第3形態：画面の左右から自機を挟むように噛みつく2発。
  pincerBite(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const w = Game.CONFIG.world;
    const left = { x: -10, y: p.y - 40 };
    const right = { x: w.width + 10, y: p.y - 40 };
    Game.fireAngledBullet(left.x, left.y, Math.atan2(p.y - left.y, p.x - left.x), params.speed, params);
    Game.fireAngledBullet(right.x, right.y, Math.atan2(p.y - right.y, p.x - right.x), params.speed, params);
  },

  // リオネ第1形態：翼を開くように左右対称へ広がる弾の対。規則的で読みやすい。
  wingSpread(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    for (let i = 1; i <= params.pairs; i += 1) {
      const offset = i * params.spreadAngle;
      Game.fireAngledBullet(boss.x, boss.y, params.baseAngle - offset, params.speed, params);
      Game.fireAngledBullet(boss.x, boss.y, params.baseAngle + offset, params.speed, params);
    }
  },

  // リオネ第2形態：雪や羽根のように、画面上から白い弾がゆらゆら降ってくる。
  featherFall(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const w = Game.CONFIG.world;
    const x = 20 + Math.random() * (w.width - 40);
    Game.fireAngledBullet(x, -10, Math.PI / 2, params.speed, {
      ...params,
      wave: { amp: params.waveAmp, freq: params.waveFreq },
    });
  },

  // リオネ最終形態：ゆっくり降りてくる透明(輪郭のみ)の弾。優しいが逃げ場を絞る。
  clearDrops(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const base = Math.PI / 2;
    for (let i = 0; i < params.count; i += 1) {
      const offset = (i - (params.count - 1) / 2) * params.spreadAngle;
      Game.fireAngledBullet(boss.x, boss.y, base + offset, params.speed, params);
    }
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

      // 次のパターンに専用の一言があれば、弾を出す前に挟む(DIALOGUE状態で今フレームはここまで)。
      const nextPattern = patterns[boss.patternIndex];
      if (nextPattern.beforePattern) {
        Game.startDialogue(nextPattern.beforePattern, null);
        return;
      }
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
