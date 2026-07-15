// 中ボス/ボスの定義データ。新しいボスを足す時はここにエントリを増やすだけでよい形にしている。
// patterns は上から順に適用され、hpThreshold(残HP割合)か duration(秒)のどちらかに達すると次へ進む。
// 最後の1個はしきい値/時間を無視し、HP0になるまで継続する。
Game.BOSS_FALLBACK_COLORS = {
  lena: "#ff9d7a",
  rione: "#c9b6ff",
  coralia: "#ff6f6f",
  escar: "#7a6fdc",
  oria: "#7ab8ff",
  medi: "#c090e8",
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
          // 見づらいとの指摘を受けて弾を少し大きく。
          radius: 5.5,
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
          // 弾が画面端まで届くようになった上で「ヌルゲー」との指摘を受け、間隔短縮+増速。
          interval: 0.82,
          pairs: 4,
          spreadAngle: 0.22,
          baseAngle: Math.PI / 2,
          speed: 100,
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
          // さらに増速+揺れ幅を広げ、単純に見切りやすいだけの弾にならないようにした。
          interval: 0.15,
          lanes: 6,
          speed: 54,
          radius: 4,
          color: "rgba(255, 255, 255, 0.92)",
          glowColor: "rgba(255, 255, 255, 0.35)",
          waveAmp: 30,
          waveFreq: 2.4,
        },
      },
      {
        kind: "clearDrops",
        // 最終形態に入る直前だけ挟む短い一言。
        beforePattern: [{ speaker: "リオネ", text: "決意は強いのね。" }],
        params: {
          // エスカーの最終形態(自機狙いの扇+囮)と見た目が近いとの指摘を受け、
          // 自機狙いの扇ではなく、少しずつ回転しながら広がる全方位のリングに変更した。
          interval: 0.55,
          count: 10,
          rotStep: 0.16,
          speed: 62,
          radius: 7,
          // 透明弾(ring:true)は見えづらかったので不透明な弾に変更した
          // (画面端に届く前に消えていた件は既定lifetimeの引き上げで解消済み)。
          color: "rgba(230, 240, 255, 0.92)",
          glowColor: "rgba(220, 235, 255, 0.4)",
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
        { speaker: "エスカー", text: "何度も言われているから流石に懲りてるわよ〜。シェーラもしつこいわね。" },
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
          // まだ難しいとの指摘が続いたため、間隔を広げ揺れも穏やかにしてさらに読みやすくした。
          interval: 0.62,
          count: 3,
          spreadAngle: 0.3,
          speed: 110,
          radius: 3.5,
          color: "rgba(255, 214, 120, 0.92)",
          glowColor: "rgba(255, 230, 160, 0.4)",
          waveAmp: 12,
          waveFreq: 4.2,
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

  oria: {
    name: "オリア",
    epithet: "第六英傑",
    title: "黒鱗の騎士",
    sprite: "assets/boss_oria.png",
    spriteWidth: 130,
    spriteHeight: 130,
    radius: 42,
    hp: 260,
    // オリアは最強の騎士。他中ボスより格上として、HPも一段高く3パターン構成にしている。
    dialogue: {
      beforeBattle: [
        { speaker: "オリア", text: "そこまでだ、浅海の子。" },
        { speaker: "ジェリー", text: "あなたも、わたしを止めるの…？" },
        { speaker: "オリア", text: "六英傑が一、黒鱗の騎士オリア。この門より奥へは、何人たりとも通さぬ。" },
        { speaker: "オリア", text: "……お前がここまで来た理由も、その覚悟も、見せてもらった。お前が正しい可能性は、認めよう。" },
        { speaker: "オリア", text: "だが、私は任務を捨てられない。全てを捨ててでも、守らねばならぬものがある。" },
        { speaker: "オリア", text: "恨むなら、己の運命を恨め。——来い。" },
      ],
      afterDefeat: [
        { speaker: "オリア", text: "……見事。私の槍を、抜けたか。すみません、メディ様…。" },
        { speaker: "オリア", text: "行け。この先におわすのは、我らが女王。……英傑護メディ様だ。" },
        { speaker: "オリア", text: "ひとつ言っておく。あの方は、お前を斬りはしない。だが——お前が一番、恐れるべき相手だ。" },
        { speaker: "ジェリー", text: "恐れる…？" },
        { speaker: "オリア", text: "真実は、刃よりも深く刺さる。……行くがいい。" },
      ],
    },
    // 設定資料の「波状白黒弾/三叉槍直線レーザー/高速突進」の3形態(潮流反転は今回不採用)。
    patterns: [
      {
        kind: "tideWaves",
        hpThreshold: 0.66,
        params: {
          interval: 0.85,
          count: 9,
          speed: 98,
          white: { radius: 4, color: "rgba(255, 255, 255, 0.95)", glowColor: "rgba(210, 225, 255, 0.4)" },
          black: { radius: 4.5, color: "rgba(28, 30, 52, 0.95)", glowColor: "rgba(140, 160, 230, 0.45)" },
        },
      },
      {
        kind: "tridentLaser",
        hpThreshold: 0.33,
        params: {
          interval: 2.1,
          spreadAngle: 0.32,
          laser: {
            length: 500,
            warnDuration: 0.6,
            fireDuration: 0.55,
            fadeDuration: 0.25,
            warnWidth: 2,
            fireWidth: 7,
            color: "rgba(190, 215, 255, 0.95)",
            glowColor: "rgba(210, 230, 255, 0.4)",
            warnColor: "rgba(255, 255, 255, 0.6)",
          },
        },
      },
      {
        kind: "dashCharge",
        // 最終形態：高速突進+着地際の自機狙い弾。ボス本体が動く初めてのパターンなので
        // suppressSway(patternState)でアイドル揺れを止め、突進の座標計算と競合しないようにする。
        // 3つめの弾幕に入る直前だけ挟む短い一言(設定資料の位置に合わせて2→3ではなくここに設定)。
        beforePattern: [{ speaker: "オリア", text: "お前の気持ちもわかる。ただ、メディ様に会わせる訳にはいかない。" }],
        params: {
          waitDuration: 1.1,
          chargeDuration: 0.28,
          returnDuration: 0.6,
          chargeDepth: 260,
          burstPause: 0.25,
          burstCount: 5,
          burstSpread: 0.5,
          burstSpeed: 190,
          bullet: { radius: 4.5, color: "rgba(150, 190, 255, 0.92)", glowColor: "rgba(180, 210, 255, 0.4)" },
        },
      },
    ],
  },

  medi: {
    name: "メディ",
    epithet: "英傑護",
    title: "深淵の冠主",
    // sprites: 通常/本気モードの2枚を持つラスボス。drawBoss側はdef.spritesが無い他ボスでは
    // 今まで通り単一def.spriteを描くので、既存ボスへの影響はない。
    sprites: {
      default: { key: "medi", width: 112, height: 149 },
      serious: { key: "mediSerious", width: 112, height: 149 },
    },
    radius: 46,
    hp: 900,
    dialogue: {
      beforeBattle: [
        // 前回の対戦で本気形態のまま終わっていても、登場時は必ず通常の立ち絵に戻す。
        { type: "action", run: () => { Game.SPEAKER_PORTRAITS["メディ"] = "medi"; } },
        { speaker: "メディ", text: "……よく来ました。ここまで、ひとりで。" },
        { speaker: "ジェリー", text: "あなたが、メディ…。深海灯を、守ってる。" },
        { speaker: "メディ", text: "全てが滞りない。美しい。……あなたが来たことさえ、この海の流れのひとつ。" },
        { speaker: "ジェリー", text: "お願い。深海灯を、わたしにください。浅海が、死んじゃう。あの光があれば——" },
        { speaker: "メディ", text: "あなたが光を必要としていることは、知っています。" },
        { speaker: "メディ", text: "ですが、その光を失えば、この海の底にいる者たちは生きられない。否、海全てが破滅に陥る。" },
        { speaker: "メディ", text: "……そして、あなたは。その光がどういうものかも、知らないでしょう？" },
        { speaker: "ジェリー", text: "それでも！ わたしは、諦めない。だからここまで来たんだ。これたんだ。" },
        { speaker: "メディ", text: "……ええ。ならば、見せてください。あなたの願いを。" },
        { speaker: "メディ", text: "深淵の冠主メディ。わたしが、最後の「あれ」の前の壁です。" },
      ],
      // 撃破後はそのまま真相開示(D-2)へ。移動/フェード等の演出stepはdialogue.jsの拡張(D-1)で解釈される。
      afterDefeat: [
        // 戦闘の名残(残弾/レーザー)を消し、ジェリーを定位置へ戻してから真相開示に入る。
        {
          type: "action",
          run: () => {
            Game.enemyBullets.items.forEach((b) => { b.active = false; });
            Game.clearActiveLasers();
            Game.player.init();
          },
        },
        { speaker: "メディ", text: "いいでしょう。深海灯は、この祭壇の先にあります。……取りに行きなさい。" },
        { speaker: "ジェリー", text: "！ …いいの？" },
        { speaker: "メディ", text: "ええ。どうぞ。——掴めるものなら。" },

        // isPlayer:trueなので、専用シルエットではなく自機の実スプライトが祭壇まで歩く。
        { type: "move", target: "jelly", isPlayer: true, to: { x: 180, y: 260 }, duration: 1.6 },
        { type: "action", run: () => Game.beginAltarReachEffect() },
        { type: "wait", duration: 1.0 },

        { speaker: "ジェリー", text: "これが…深海灯…。あったかい、光…。" },
        { speaker: "ジェリー", text: "（手を伸ばす）……あれ。" },
        { speaker: "ジェリー", text: "つかめ、ない…？ 手が、すり抜ける…どうして。" },
        { speaker: "メディ", text: "だから言ったでしょう。あなたはそれを、持つことはできません。" },
        { speaker: "ジェリー", text: "どういう…こと。目の前に、あるのに。" },
        { speaker: "メディ", text: "PELAGIA(ペラギア)。それが、この光の本当の名。……ではなく、私はそう呼んでます。" },
        { speaker: "メディ", text: "明かりのような実体物ではなく、概念に近いもの。" },
        { speaker: "メディ", text: "鏡のような。水面のような。……触れれば、失われてしまうもの。" },
        { speaker: "メディ", text: "探していたのでしょうが、それそのものは、常にある。探すも何も。そこに。" },
        { speaker: "ジェリー", text: "わたし、じゃ…持って帰れないの…？ じゃあ、浅海は——" },
        { speaker: "メディ", text: "……まだ、わからないのですね。" },
        { speaker: "メディ", text: "あなたもまた、その一部なのです。" },
        { speaker: "メディ", text: "PELAGIA(ペラギア)は私たち海そのものを集めたもの。" },

        { type: "fade", color: "#eaf6ff", duration: 1.4, direction: "out" },
        { type: "wait", duration: 0.8 },
        { type: "fade", color: "#eaf6ff", duration: 1.4, direction: "in" },

        { speaker: "ジェリー", text: "……あ。" },
        { speaker: "ジェリー", text: "それは、光は、持って帰れるものじゃ、ないんだ。なかったん…ですね。" },
        { speaker: "ジェリー", text: "……じゃあどうすれば浅海を戻せるの……？" },
        { speaker: "メディ", text: "気づきましたね。" },
        { speaker: "メディ", text: "ただ、知った。それだけで、じゅうぶんです。" },
        { speaker: "メディ", text: "浅海は光を失ったのではない。あなたが光を見失っただけ。" },
        { speaker: "ジェリー", text: "…見失った、だけ。" },
        { speaker: "ジェリー", text: "じゃあ、戻ればそれで全て終わるの？" },
        { speaker: "メディ", text: "ええ。行っておいで。全てを忘れるかもしれないけれど、海は全て覚えているから。" },
      ],
    },
    // 設定資料の「青と赤の二重弾幕/クラゲの傘/触手状レーザー/最終パターン」の4形態。
    // (七英傑技再現は今回不採用。最終形態は"最終スペル"ではなく"最終パターン《PELAGIA》"と呼ぶ)
    patterns: [
      {
        kind: "duoColorBarrage",
        hpThreshold: 0.75,
        params: {
          blueInterval: 0.85,
          blueCount: 3,
          blueSpread: 0.22,
          blueSpeed: 150,
          blue: { radius: 4, color: "rgba(120, 190, 255, 0.92)", glowColor: "rgba(160, 210, 255, 0.4)" },
          redInterval: 1.3,
          redCount: 12,
          redRotStep: 0.26,
          redSpeed: 92,
          red: { radius: 4.5, color: "rgba(255, 110, 130, 0.92)", glowColor: "rgba(255, 150, 170, 0.4)" },
        },
      },
      {
        kind: "jellyfishCanopy",
        hpThreshold: 0.5,
        params: {
          interval: 0.55,
          count: 16,
          rotStep: 0.14,
          speed: 68,
          bullet: { radius: 4.5, ring: true, color: "rgba(210, 170, 255, 0.9)", glowColor: "rgba(220, 190, 255, 0.4)" },
        },
      },
      {
        kind: "tentacleLasers",
        hpThreshold: 0.25,
        params: {
          // 下側に安置ができるとの指摘を受け、(1)左右逆回転をやめ全レーザーを同方向に統一して
          // 隙間の間隔を一定に保ち、(2)一定間隔で位相をずらした新しい束を出し直し、
          // (3)メディ自身もゆっくり左右に揺れて起点を動かす、の3点で固定の安置を作らせない。
          count: 6,
          rotStep: 0.35,
          angularSpeed: 0.3,
          interval: 3.5,
          swaySpeed: 0.5,
          swayRange: 42,
          laser: {
            length: 420,
            warnDuration: 0.6,
            fireDuration: 5.2,
            fadeDuration: 0.4,
            warnWidth: 2,
            fireWidth: 6,
            color: "rgba(200, 150, 255, 0.92)",
            glowColor: "rgba(215, 175, 255, 0.4)",
            warnColor: "rgba(255, 255, 255, 0.6)",
          },
        },
      },
      {
        kind: "pelagiaFinale",
        // 4つめの弾幕前。ここで通常→本気モードへ立ち絵を差し替える(会話の途中で同期させる)。
        beforePattern: [
          { speaker: "メディ", text: "……久しぶりに揺らされました。これも流れのひとつなら仕方がありませんが……。" },
          { type: "action", run: () => { Game.triggerBossFormFlash(Game.activeBoss, "serious"); Game.SPEAKER_PORTRAITS["メディ"] = "mediSerious"; } },
          { speaker: "メディ", text: "英傑護として最後まで戦いましょうか。" },
        ],
        params: {
          // 「もっと豪華に」との指摘を受け、各フェーズを単一要素から複数要素の同時展開に強化し、
          // 締めくくりの4フェーズ目として全要素を一度に展開する"climax"を追加した(理不尽な密度には
          // せず、intervalは0.5〜2秒台を維持して間合いを確保している)。
          stages: [
            {
              // 二重リングの開花。
              duration: 4.5,
              interval: 0.5,
              ring: { count: 16, rotStep: 0.13, speed: 84, bullet: { radius: 4, color: "rgba(140, 195, 255, 0.92)", glowColor: "rgba(170, 210, 255, 0.4)" } },
              innerRing: { count: 10, rotStep: -0.22, speed: 136, bullet: { radius: 3.5, color: "rgba(255, 240, 210, 0.92)", glowColor: "rgba(255, 245, 225, 0.4)" } },
            },
            {
              // 自機狙いの太い扇+背景の緩いリングを同時展開。
              duration: 3.5,
              interval: 0.5,
              aimed: { count: 4, spread: 0.22, speed: 180, bullet: { radius: 4.5, color: "rgba(255, 120, 140, 0.92)", glowColor: "rgba(255, 160, 180, 0.4)" } },
              ring: { count: 10, rotStep: 0.3, speed: 58, bullet: { radius: 4, color: "rgba(140, 195, 255, 0.7)", glowColor: "rgba(170, 210, 255, 0.3)" } },
            },
            {
              // 回転レーザーの束(前形態より本数を増強)。
              duration: 4,
              interval: 2.0,
              laser: {
                count: 4,
                sweepSpeed: 0.18,
                laser: {
                  length: 480,
                  warnDuration: 0.7,
                  fireDuration: 0.8,
                  fadeDuration: 0.3,
                  warnWidth: 2,
                  fireWidth: 6,
                  color: "rgba(215, 180, 255, 0.92)",
                  glowColor: "rgba(225, 195, 255, 0.4)",
                  warnColor: "rgba(255, 255, 255, 0.6)",
                },
              },
            },
            {
              // 締めの"climax"：リング/自機狙い/レーザーを同時展開する最も豪華な瞬間。
              duration: 3.2,
              interval: 0.6,
              ring: { count: 14, rotStep: 0.18, speed: 90, bullet: { radius: 4, color: "rgba(140, 195, 255, 0.92)", glowColor: "rgba(170, 210, 255, 0.4)" } },
              aimed: { count: 3, spread: 0.26, speed: 170, bullet: { radius: 4.5, color: "rgba(255, 120, 140, 0.92)", glowColor: "rgba(255, 160, 180, 0.4)" } },
              laser: {
                count: 3,
                sweepSpeed: 0.22,
                laser: {
                  length: 460,
                  warnDuration: 0.6,
                  fireDuration: 0.7,
                  fadeDuration: 0.3,
                  warnWidth: 2,
                  fireWidth: 6,
                  color: "rgba(255, 240, 210, 0.92)",
                  glowColor: "rgba(255, 245, 225, 0.4)",
                  warnColor: "rgba(255, 255, 255, 0.65)",
                },
              },
            },
          ],
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

    // 真ん中に安置ができないよう、中央にも1発撃ってから左右のペアを広げる。
    Game.fireAngledBullet(boss.x, boss.y, params.baseAngle, params.speed, params);
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

  // リオネ最終形態：全方位へ広がる花びら/雪のようなリング。少しずつ回転させながら
  // 連続で出すことで、隣り合うリング同士が互い違いに重なって隙間を作らせない。
  clearDrops(boss, pattern, dt) {
    const params = pattern.params;
    const ps = boss.patternState;
    ps.timer = (ps.timer || 0) - dt;
    if (ps.timer > 0) return;
    ps.timer = params.interval;
    ps.rot = (ps.rot || 0) + params.rotStep;
    Game.fireRing(boss.x, boss.y, params.count, ps.rot, params.speed, params);
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
    // 珊瑚シェイプはangle=-PI/2回転でy方向に最大±10ずれる粒がある。画面外判定(height+20)より
    // 手前で生まれないと、生成直後にその粒だけ即座に消えてしまう(以前の+24はこの余裕が無かった)。
    for (let i = 0; i < params.columns; i += 1) {
      const x = ((i + 0.5) / params.columns + offset) * w.width;
      Game.fireShapeCluster(x, w.height + 5, Game.BULLET_SHAPES.coral, -Math.PI / 2, params.speed, params);
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

  // オリア第1形態：画面上部を横断する弾の列を、白/黒(濃紺)交互に押し寄せる波として連続発射する。
  tideWaves(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;
    boss.patternState.wave = (boss.patternState.wave || 0) + 1;

    const style = boss.patternState.wave % 2 === 1 ? params.white : params.black;
    const w = Game.CONFIG.world;
    for (let i = 0; i < params.count; i += 1) {
      const x = ((i + 0.5) / params.count) * w.width;
      Game.fireAngledBullet(x, -10, Math.PI / 2, params.speed, style);
    }
  },

  // オリア第2形態：三叉槍の3本から自機狙い±扇状オフセットで直線レーザーを同時展開する。
  tridentLaser(boss, pattern, dt) {
    const params = pattern.params;
    boss.patternState.timer = (boss.patternState.timer || 0) - dt;
    if (boss.patternState.timer > 0) return;
    boss.patternState.timer = params.interval;

    const p = Game.player;
    const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
    [-params.spreadAngle, 0, params.spreadAngle].forEach((offset) => {
      Game.fireLaser(boss.x, boss.y, baseAngle + offset, params.laser);
    });
  },

  // オリア最終形態：自機付近へ高速突進→着地際に自機狙いの弾を撒く→元の位置へ戻る、を繰り返す。
  // ボス本体が動く初めてのパターンなので、移動中はpatternState.suppressSwayでアイドル揺れを止める。
  dashCharge(boss, pattern, dt) {
    const params = pattern.params;
    const ps = boss.patternState;
    if (!ps.phase) {
      ps.phase = "wait";
      ps.timer = params.waitDuration;
    }
    ps.timer -= dt;

    if (ps.phase === "wait") {
      if (ps.timer <= 0) {
        ps.phase = "charge";
        ps.suppressSway = true;
        ps.fromX = boss.x;
        ps.fromY = boss.y;
        ps.toX = Game.clamp(Game.player.x, 40, Game.CONFIG.world.width - 40);
        ps.toY = Math.min(boss.baseY + params.chargeDepth, Game.player.y - 70);
        ps.duration = params.chargeDuration;
        ps.elapsed = 0;
      }
      return;
    }

    if (ps.phase === "charge" || ps.phase === "return") {
      ps.elapsed += dt;
      const t = Math.min(1, ps.elapsed / ps.duration);
      const eased = ps.phase === "charge" ? 1 - (1 - t) * (1 - t) : t * t;
      boss.x = ps.fromX + (ps.toX - ps.fromX) * eased;
      boss.y = ps.fromY + (ps.toY - ps.fromY) * eased;
      if (t >= 1) {
        if (ps.phase === "charge") {
          const angle = Math.atan2(Game.player.y - boss.y, Game.player.x - boss.x);
          for (let i = 0; i < params.burstCount; i += 1) {
            const offset = (i - (params.burstCount - 1) / 2) * params.burstSpread;
            Game.fireAngledBullet(boss.x, boss.y, angle + offset, params.burstSpeed, params.bullet);
          }
          ps.phase = "burstWait";
          ps.timer = params.burstPause;
        } else {
          ps.phase = "wait";
          ps.timer = params.waitDuration;
          ps.suppressSway = false;
        }
      }
      return;
    }

    if (ps.phase === "burstWait" && ps.timer <= 0) {
      ps.phase = "return";
      ps.fromX = boss.x;
      ps.fromY = boss.y;
      ps.toX = boss.baseX;
      ps.toY = boss.baseY;
      ps.duration = params.returnDuration;
      ps.elapsed = 0;
    }
  },

  // メディ第1形態：青(自機狙い扇)と赤(回転リング)の2系統を同時に撃ち分ける二重弾幕。
  duoColorBarrage(boss, pattern, dt) {
    const params = pattern.params;
    const ps = boss.patternState;
    ps.blueTimer = (ps.blueTimer || 0) - dt;
    ps.redTimer = (ps.redTimer || 0) - dt;

    if (ps.blueTimer <= 0) {
      ps.blueTimer = params.blueInterval;
      const p = Game.player;
      const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
      for (let i = 0; i < params.blueCount; i += 1) {
        const offset = (i - (params.blueCount - 1) / 2) * params.blueSpread;
        Game.fireAngledBullet(boss.x, boss.y, angle + offset, params.blueSpeed, params.blue);
      }
    }

    if (ps.redTimer <= 0) {
      ps.redTimer = params.redInterval;
      ps.redRot = (ps.redRot || 0) + params.redRotStep;
      Game.fireRing(boss.x, boss.y, params.redCount, ps.redRot, params.redSpeed, params.red);
    }
  },

  // メディ第2形態：巨大なクラゲの傘のように、回転しながら広がるリングを連続発射して画面を覆う。
  jellyfishCanopy(boss, pattern, dt) {
    const params = pattern.params;
    const ps = boss.patternState;
    ps.timer = (ps.timer || 0) - dt;
    if (ps.timer > 0) return;
    ps.timer = params.interval;
    ps.rot = (ps.rot || 0) + params.rotStep;
    Game.fireRing(boss.x, boss.y, params.count, ps.rot, params.speed, params.bullet);
  },

  // メディ第3形態：触手のように、ボスを中心に追従しながらゆっくり回転する直線レーザーを複数展開する。
  tentacleLasers(boss, pattern, dt) {
    const params = pattern.params;
    const ps = boss.patternState;

    // メディ自身をゆっくり左右に揺らし、レーザーの起点(=隙間の位置)を固定させない。
    ps.swayPhase = (ps.swayPhase || 0) + dt;
    ps.suppressSway = true;
    boss.x = boss.baseX + Math.sin(ps.swayPhase * params.swaySpeed) * params.swayRange;

    ps.timer = (ps.timer || 0) - dt;
    if (ps.timer > 0) return;
    ps.timer = params.interval;
    ps.rot = (ps.rot || 0) + params.rotStep;
    // 左右逆回転をやめ、全レーザーを同方向・等間隔にすることで隙間の幅を一定に保つ。
    // 一定間隔で位相をずらした束を出し直すので、隙間の位置自体は時間とともに移動し続ける。
    for (let i = 0; i < params.count; i += 1) {
      const angle = ps.rot + (Math.PI * 2 * i) / params.count;
      Game.fireLaser(boss.x, boss.y, angle, {
        ...params.laser,
        angularVelocity: params.angularSpeed,
        followBoss: true,
        bossRef: boss,
      });
    }
  },

  // メディ最終形態「PELAGIA」：1〜3形態の要素(リング/自機狙い/回転レーザー)を短い内部フェーズとして
  // 順に繰り返す締めの一連。各フェーズは複数要素(ring/innerRing/aimed/laser)を同時展開でき、
  // 最終フェーズは全要素を重ねる"climax"にして華やかさを出す。理不尽な密度にはせず、
  // intervalは0.5秒以上を保って間合いを確保している。
  pelagiaFinale(boss, pattern, dt) {
    const params = pattern.params;
    const ps = boss.patternState;
    if (ps.stage == null) {
      ps.stage = 0;
      ps.stageTimer = 0;
      ps.fireTimer = 0;
    }
    ps.stageTimer += dt;
    ps.fireTimer -= dt;

    const stageDef = params.stages[ps.stage];
    if (ps.fireTimer <= 0) {
      ps.fireTimer = stageDef.interval;

      if (stageDef.ring) {
        ps.ringRot = (ps.ringRot || 0) + stageDef.ring.rotStep;
        Game.fireRing(boss.x, boss.y, stageDef.ring.count, ps.ringRot, stageDef.ring.speed, stageDef.ring.bullet);
      }
      if (stageDef.innerRing) {
        ps.innerRingRot = (ps.innerRingRot || 0) + stageDef.innerRing.rotStep;
        Game.fireRing(boss.x, boss.y, stageDef.innerRing.count, ps.innerRingRot, stageDef.innerRing.speed, stageDef.innerRing.bullet);
      }
      if (stageDef.aimed) {
        const p = Game.player;
        const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
        for (let i = 0; i < stageDef.aimed.count; i += 1) {
          const offset = (i - (stageDef.aimed.count - 1) / 2) * stageDef.aimed.spread;
          Game.fireAngledBullet(boss.x, boss.y, angle + offset, stageDef.aimed.speed, stageDef.aimed.bullet);
        }
      }
      if (stageDef.laser) {
        for (let i = 0; i < stageDef.laser.count; i += 1) {
          const angle = (Math.PI * 2 * i) / stageDef.laser.count + ps.stageTimer * stageDef.laser.sweepSpeed;
          Game.fireLaser(boss.x, boss.y, angle, stageDef.laser.laser);
        }
      }
    }

    if (ps.stageTimer >= stageDef.duration) {
      ps.stage = (ps.stage + 1) % params.stages.length;
      ps.stageTimer = 0;
      ps.fireTimer = 0;
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
    spriteKey: "default", // def.spritesを持つボス(メディ)だけが使う。無いボスは無視される。
    formTransition: null,
  };
  Game.activeBoss = boss;
  return boss;
};

// 立ち絵差し替え(通常→本気モード等)を開始する。会話中の{type:'action'}stepから呼ばれる想定。
Game.triggerBossFormFlash = function triggerBossFormFlash(boss, key) {
  if (!boss) return;
  const def = Game.BOSS_DEFS[boss.key];
  if (!def.sprites || !def.sprites[key] || boss.spriteKey === key) return;
  boss.formTransition = {
    fromKey: boss.spriteKey,
    toKey: key,
    timer: 0,
    duration: Game.CONFIG.boss.formFlashDuration,
  };
  boss.spriteKey = key;
};

Game.damageBoss = function damageBoss(boss, amount) {
  if (boss.defeated) return;
  boss.hp = Math.max(0, boss.hp - amount);
  if (boss.hp <= 0) {
    boss.alive = false;
    boss.defeated = true;
    boss.defeatTimer = Game.CONFIG.boss.defeatFlashDuration;
    Game.clearActiveLasers();
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

  if (boss.formTransition) {
    boss.formTransition.timer += dt;
    if (boss.formTransition.timer >= boss.formTransition.duration) boss.formTransition = null;
  }

  boss.entryProgress = Math.min(1, boss.entryProgress + dt / Game.CONFIG.boss.entryDuration);
  const eased = 1 - (1 - boss.entryProgress) * (1 - boss.entryProgress);
  // suppressSway: 突進のようにパターン側がboss.x/yを直接動かす間だけ、通常のアイドル揺れを止める。
  if (!boss.patternState.suppressSway) {
    boss.y = boss.baseY - (1 - eased) * 160;
    boss.x = boss.baseX + (boss.entryProgress >= 1 ? Math.sin(boss.age * 0.6) * 22 : 0);
  }

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
      Game.clearActiveLasers(); // 前パターンのレーザーを寿命前に終わらせ、次パターンに持ち越させない

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

  function drawFallbackCircle() {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.arc(0, 0, boss.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = Game.BOSS_FALLBACK_COLORS[boss.key] || "#c9b6ff";
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (def.sprites) {
    // 複数立ち絵を持つボス(メディ)：formTransition中は旧絵→新絵をクロスフェード+白発光で繋ぐ。
    const spriteInfo = def.sprites[boss.spriteKey] || def.sprites.default;
    const spriteImg = Game.assets.bosses[spriteInfo.key];
    const t = boss.formTransition
      ? Game.clamp(boss.formTransition.timer / boss.formTransition.duration, 0, 1)
      : 1;

    if (boss.formTransition) {
      const fromInfo = def.sprites[boss.formTransition.fromKey] || def.sprites.default;
      const fromImg = Game.assets.bosses[fromInfo.key];
      if (fromImg && fromImg.ready) {
        ctx.globalAlpha = 1 - t;
        ctx.drawImage(fromImg.image, -fromInfo.width / 2, -fromInfo.height / 2, fromInfo.width, fromInfo.height);
        ctx.globalAlpha = 1;
      }
    }

    if (spriteImg && spriteImg.ready) {
      ctx.globalAlpha = boss.formTransition ? t : 1;
      ctx.drawImage(spriteImg.image, -spriteInfo.width / 2, -spriteInfo.height / 2, spriteInfo.width, spriteInfo.height);
      ctx.globalAlpha = 1;
    } else if (!boss.formTransition) {
      drawFallbackCircle();
    }

    if (boss.formTransition) {
      // t=0.5付近をピークにした白い発光を加算合成で重ね、切り替えの"間"を持たせる。
      const flashAlpha = Math.sin(t * Math.PI);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = flashAlpha * 0.65;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(0, 0, spriteInfo.width * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (img && img.ready) {
    ctx.drawImage(img.image, -def.spriteWidth / 2, -def.spriteHeight / 2, def.spriteWidth, def.spriteHeight);
  } else {
    drawFallbackCircle();
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
