// 中ボス/ボスの定義データ。新しいボスを足す時はここにエントリを増やすだけでよい形にしている。
// patterns は上から順に適用され、hpThreshold(残HP割合)か duration(秒)のどちらかに達すると次へ進む。
// 最後の1個はしきい値/時間を無視し、HP0になるまで継続する。
Game.BOSS_FALLBACK_COLORS = {
  lena: "#ff9d7a",
  rione: "#c9b6ff",
  coralia: "#ff6f6f",
  escar: "#7a6fdc",
};

Game.BOSS_DEFS = {
  lena: {
    name: "レーナ",
    epithet: "第四英傑",
    title: "裂潮の猟姫",
    sprite: "assets/boss_lena.png",
    spriteWidth: 127,
    spriteHeight: 130,
    radius: 40,
    hp: 150,
    // レーナは事情を知らず、ただ"面白そうな獲物"としてジェリーに絡んでくる。
    dialogue: {
      beforeBattle: [
        { speaker: "レーナ", text: "……お。めずらしいな。こんな浅いとこの子が、なんでこんな下まで来てるんだ？" },
        { speaker: "ジェリー", text: "深海灯を探しに行くの。通してくれる？" },
        { speaker: "レーナ", text: "ふうん、まぁ、無謀だと思うが。" },
        { speaker: "レーナ", text: "あぁ、でもちょうどいいか。暇だったんだ。" },
        { speaker: "レーナ", text: "そこの浅瀬の魚。ちょっと遊びな。この六英傑のレーナから逃げ切れたら通してあげよう。ここはまだ浅い所だから、怒られないだろう。" },
      ],
      afterDefeat: [
        { speaker: "レーナ", text: "……へえ。思ったより強いんだね、あんた。" },
        { speaker: "レーナ", text: "いいよ、行きな。深いとこは、あんたが思ってるよりずっと物騒だとおもうが。" },
      ],
    },
    // 設定資料の弾幕描写のうち、岩陰から飛び出す弾列/左右から挟む噛みつき弾の2形態のみ採用。
    // (蛇行する高速弾は難易度が高すぎたため削除。2パターン構成でHPを再配分した。)
    patterns: [
      {
        kind: "ambushRows",
        hpThreshold: 0.5,
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
    epithet: "第一英傑",
    title: "白光の先導者",
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
        { speaker: "リオネ", text: "わたしはここで引き返す者を導く者であり続ける。……それが、六英傑の一人として、あなたを守ることでもあり、わたしリオネの指名であるから。" },
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
          // 安置が多いとの指摘を受け、間隔短縮+レーン巡回(後述)で画面幅を満遍なく埋めるように調整。
          interval: 0.15,
          lanes: 6,
          speed: 45,
          radius: 4,
          color: "rgba(255, 255, 255, 0.92)",
          glowColor: "rgba(255, 255, 255, 0.35)",
          waveAmp: 24,
          waveFreq: 2.2,
        },
      },
      {
        kind: "clearDrops",
        // 最終形態に入る直前だけ挟む短い一言。
        beforePattern: [{ speaker: "リオネ", text: "決意は強いのね。" }],
        params: {
          // 安置が多いとの指摘を受け、弾数/扇の角度を増やし、間隔を詰めた。
          interval: 0.42,
          count: 5,
          spreadAngle: 0.85,
          speed: 55,
          radius: 7,
          color: "rgba(220, 235, 255, 0.85)",
          glowColor: "rgba(220, 235, 255, 0.3)",
          ring: true,
        },
      },
    ],
  },

  coralia: {
    name: "コーリア",
    epithet: "第二英傑",
    title: "紅礁の女公",
    sprite: "assets/boss_coralia.png",
    spriteWidth: 98,
    spriteHeight: 128,
    radius: 36,
    hp: 160,
    // コーリアは浅海を信用していない。誇り高く、短気で、縄張りを侵す者を露骨に敵視する。
    dialogue: {
      beforeBattle: [
        { speaker: "コーリア", text: "……また上の者が、深海から何かを奪いに来たのか。" },
        { speaker: "ジェリー", text: "奪うんじゃないよ。深海灯を、借りに——" },
        { speaker: "コーリア", text: "借りる？ 笑わせるでない。昔もそう言って、妾らの珊瑚を、宝物を、根こそぎ持っていったであろう。" },
        { speaker: "コーリア", text: "浅海の子。そなたを信じる理由が、妾には一つもないのよ。" },
        { speaker: "コーリア", text: "美しさは全てを凌駕する。……この海を乱す者は、この六英傑のコーリアが通さまい。" },
      ],
      afterDefeat: [
        { speaker: "コーリア", text: "ふむ……。力は認めてあげようではないか。" },
        { speaker: "コーリア", text: "だが、ゆめゆめ忘れるな。この先にいるのは、妾みたいに正直な相手ばかりではない。" },
      ],
    },
    // 設定資料の弾幕描写(珊瑚の枝のように分岐する赤弾/画面下から成長する弾列)に対応する2形態。
    // どちらも2-Aの「形のある弾(珊瑚型クラスタ)」を使う。
    patterns: [
      {
        kind: "coralBranch",
        hpThreshold: 0.5,
        params: {
          // 全体的にヌルすぎるとの指摘を受け、間隔を大幅に詰めて弾速も上げた。
          interval: 0.85,
          speed: 105,
          radius: 4,
          color: "rgba(255, 110, 110, 0.92)",
          glowColor: "rgba(255, 150, 150, 0.4)",
        },
      },
      {
        kind: "coralGrowth",
        params: {
          // 固定3列は安置になりやすいので列数を増やし、波ごとに半列分ずらして安置を固定させない。
          interval: 1.2,
          columns: 4,
          speed: 78,
          radius: 4,
          color: "rgba(255, 90, 90, 0.92)",
          glowColor: "rgba(255, 140, 140, 0.4)",
        },
      },
    ],
  },

  escar: {
    name: "エスカー",
    epithet: "第五英傑",
    title: "誘灯の魔光",
    sprite: "assets/boss_escar.png",
    spriteWidth: 106,
    spriteHeight: 130,
    radius: 36,
    hp: 620,
    // エスカーは力押しではなく"惑わし"のトリッキーなボス。深海灯を自分のものにしたい欲がある。
    dialogue: {
      // 会話開始時点でエスカーとシェーラはすでに言い争っている(ジェリーはまだ登場していない体)。
      beforeBattle: [
        { speaker: "シェーラ", text: "エスカー。何度言ったらわかるの。英傑のくせに深海灯を奪うことしか考えていない。" },
        { speaker: "エスカー", text: "何度も言われているから流石に懲りてるわよ〜。シェリーもしつこいわね。" },
        { speaker: "エスカー", text: "浅海の子が来てるらしいのよっ？気になるじゃない♪" },
        { speaker: "シェーラ", text: "やはりあの浅海の子を…。" },
        { speaker: "シェーラ", text: "知らないことは罪ではありません。ですが、知らずに壊すことは罪になります。あの子は、何も知らない。" },
        { speaker: "エスカー", text: "だからいいんじゃないの。何も知らないほうが、よく光るわ♪" },
        { speaker: "ジェリー", text: "……あの、深海灯って、いいました…？" },
        { speaker: "エスカー", text: "あらあら♪ ちょうどいいところに。ようこそ、迷える光の子。" },
        { speaker: "エスカー", text: "ねえ、あなた。深海灯が欲しいんでしょう？ なら——わたしのものにおなりなさい♪" },
        { speaker: "ジェリー", text: "え——っ、ちょっ、なに、引っぱらな…！" },
        { speaker: "シェーラ", text: "（あぁ…始まってしまった…。）" },
        { speaker: "エスカー", text: "ここまで来たあなたは、英傑になる素質があるはずだわ♪ほら、わたしがぜんぶ、いいようにしてあげる♪" },
        { speaker: "ジェリー", text: "英傑だからなんなんですか！わたしは、全て終わったらみんなのところに帰るの。あなたのものになんて、ならない！" },
      ],
      afterDefeat: [
        { speaker: "エスカー", text: "……あーあ。逃げられちゃった。つまんないの♪" },
        { speaker: "エスカー", text: "でも面白かったわ。いいわよ、行きなさい。どうせこの先で、いやでも”わかる”んだから。" },
        { speaker: "シェーラ", text: "迷える子。ひとつだけ。" },
        { speaker: "シェーラ", text: "光は、探すものだと思っているでしょう。でも——本当にそうなのか、その目で確かめなさい。" },
        { speaker: "ジェリー", text: "？" },
        { speaker: "シェーラ", text: "……行きなさい。単純に信じるだけでは、生きられませんよ。" },
      ],
    },
    // エスカーは"惑わし"担当。揺れる通常弾/大弾+隙間の小弾/囮弾(見た目だけの偽物混入)の3形態。
    patterns: [
      {
        kind: "jitterField",
        hpThreshold: 0.66,
        params: {
          interval: 0.5,
          count: 3,
          spreadAngle: 0.3,
          speed: 110,
          radius: 3.5,
          color: "rgba(255, 214, 120, 0.92)",
          glowColor: "rgba(255, 230, 160, 0.4)",
          waveAmp: 20,
          waveFreq: 5.5,
        },
      },
      {
        kind: "bigSmallCombo",
        hpThreshold: 0.33,
        params: {
          interval: 1.6,
          bigSpeed: 45,
          smallSpeed: 150,
          smallCount: 4,
          smallSpreadAngle: 0.5,
          big: { radius: 13, color: "rgba(255, 200, 90, 0.85)", glowColor: "rgba(255, 220, 140, 0.35)" },
          small: { radius: 3, color: "rgba(255, 235, 190, 0.95)", glowColor: "rgba(255, 240, 210, 0.4)" },
        },
      },
      {
        kind: "decoyMix",
        // 最終形態に入る直前だけ挟む短いやり取り。
        beforePattern: [
          { speaker: "エスカー", text: "手強いわねっ。本気を出すしかないわね…。" },
          { speaker: "シェーラ", text: "小さい子をやめるのはっ…" },
          { speaker: "エスカー", text: "シェーラは戦えないんだからっ♪いくわよっ♪" },
        ],
        params: {
          interval: 0.45,
          count: 5,
          spreadAngle: 0.26,
          speed: 130,
          fakeChance: 0.5,
          radius: 4,
          color: "rgba(255, 225, 140, 0.92)",
          glowColor: "rgba(255, 235, 180, 0.4)",
        },
      },
    ],
  },
};

// 珊瑚型クラスタの形状データ(コアと分岐する小弾の相対座標)。2-Aの「形のある弾」機能で使う。
Game.BULLET_SHAPES = {
  coral: [
    { x: 0, y: 0 },
    { x: -5, y: -7 }, { x: 5, y: -7 },
    { x: -10, y: -15 }, { x: 10, y: -15 },
    { x: -3, y: -13 }, { x: 3, y: -13 },
    { x: 0, y: -20 },
  ],
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
  // 完全ランダムな位置だと運悪く安置ができるので、レーン(lanes)を順番に巡回して
  // 画面幅を均等に埋めつつ、レーン内だけ揺らして自然さを保つ。
  featherFall(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const w = Game.CONFIG.world;
    const lanes = params.lanes;
    boss.patternState.lane = ((boss.patternState.lane || 0) + 1) % lanes;
    const laneWidth = (w.width - 40) / lanes;
    const x = 20 + laneWidth * (boss.patternState.lane + 0.5) + (Math.random() - 0.5) * laneWidth * 0.6;
    Game.fireAngledBullet(x, -10, Math.PI / 2, params.speed, {
      ...params,
      wave: { amp: params.waveAmp, freq: params.waveFreq },
    });
  },

  // リオネ最終形態：ゆっくり降りてくる透明(輪郭のみ)の弾。優しいが逃げ場を絞る。
  // 扇の向きをゆっくり左右へ揺らし、両端の隙間が固定の安置にならないようにする。
  clearDrops(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;
    boss.patternState.wobble = (boss.patternState.wobble || 0) + 0.35;

    const base = Math.PI / 2 + Math.sin(boss.patternState.wobble) * 0.25;
    for (let i = 0; i < params.count; i += 1) {
      const offset = (i - (params.count - 1) / 2) * params.spreadAngle;
      Game.fireAngledBullet(boss.x, boss.y, base + offset, params.speed, params);
    }
  },

  // コーリア第1形態：自機へ向けて珊瑚型クラスタを撃つ。枝分かれした赤弾のかたまり。
  coralBranch(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    Game.fireShapeCluster(boss.x, boss.y, Game.BULLET_SHAPES.coral, angle, params.speed, params);
  },

  // コーリア第2形態：画面下から珊瑚型クラスタが何本も「生えて」くる。1面が上から降る弾中心
  // だったのに対して、下から来る動きで新鮮さを出す。
  coralGrowth(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;
    // 列の間に固定の安置ができないよう、波ごとに半列分だけ左右へずらす。
    boss.patternState.shift = !boss.patternState.shift;

    const w = Game.CONFIG.world;
    const offset = boss.patternState.shift ? 0.5 / params.columns : 0;
    for (let i = 0; i < params.columns; i += 1) {
      const x = ((i + 0.5) / params.columns + offset) * w.width;
      Game.fireShapeCluster(x, w.height + 24, Game.BULLET_SHAPES.coral, -Math.PI / 2, params.speed, params);
    }
  },

  // エスカー第1形態：自機狙いの扇状弾を、既存のwave機能で揺らして素直に避けにくくする。
  jitterField(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
    for (let i = 0; i < params.count; i += 1) {
      const offset = (i - (params.count - 1) / 2) * params.spreadAngle;
      Game.fireAngledBullet(boss.x, boss.y, baseAngle + offset, params.speed, {
        ...params,
        wave: { amp: params.waveAmp, freq: params.waveFreq, phase: i * 1.7 },
      });
    }
  },

  // エスカー第2形態：判定の大きい低速弾の合間に小弾を撒く。大弾に気を取られると小弾に当たる。
  bigSmallCombo(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    Game.fireAngledBullet(boss.x, boss.y, angle, params.bigSpeed, params.big);
    for (let i = 0; i < params.smallCount; i += 1) {
      const offset = (i - (params.smallCount - 1) / 2) * params.smallSpreadAngle;
      Game.fireAngledBullet(boss.x, boss.y, angle + offset, params.smallSpeed, params.small);
    }
  },

  // エスカー最終形態：本物そっくりだが当たらない囮弾(fake)を本物に混ぜる。見た目は完全に同じ。
  decoyMix(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
    for (let i = 0; i < params.count; i += 1) {
      const offset = (i - (params.count - 1) / 2) * params.spreadAngle;
      const isFake = Math.random() < params.fakeChance;
      Game.fireAngledBullet(boss.x, boss.y, baseAngle + offset, params.speed, { ...params, fake: isFake });
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
    ctx.fillStyle = Game.BOSS_FALLBACK_COLORS[boss.key] || "#c9b6ff";
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
