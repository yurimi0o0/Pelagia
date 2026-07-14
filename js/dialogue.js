// 簡易ビジュアルノベル風の会話エンジン。台詞データ自体(誰が何を言うか)は
// BOSS_DEFS(boss.js)やSTAGEデータ(stage1.js)側に持たせ、ここでは
// 「渡された行配列を1行ずつタップで送る」だけの汎用処理にする。
Game.SPEAKER_PORTRAITS = {
  "レーナ": "lena",
  "リオネ": "rione",
  "コーリア": "coralia",
  "エスカー": "escar",
  "シェーラ": "shera",
};

// 台詞文中にこれらの名前が現れたら色を変える(「名乗り」演出の代わり)。
// 長い名前を先に判定しないと部分一致で崩れるので長さ降順に並べておく。
Game.CHARACTER_NAMES = [
  "ジェリー", "レーナ", "リオネ", "コーリア", "エスカー", "シェーラ", "シェリー", "オリア", "メディ",
].sort((a, b) => b.length - a.length);

Game.dialogue = {
  lines: [],
  index: 0,
  onComplete: null,
};

// lines: [{speaker, text}, ...] / onComplete: 全行送り終えた後に呼ばれるコールバック(省略可)
Game.startDialogue = function startDialogue(lines, onComplete) {
  if (!lines || lines.length === 0) {
    if (onComplete) onComplete();
    return;
  }
  Game.dialogue.lines = lines;
  Game.dialogue.index = 0;
  Game.dialogue.onComplete = onComplete || null;
  Game.setState(Game.STATES.DIALOGUE);
};

Game.advanceDialogue = function advanceDialogue() {
  Game.dialogue.index += 1;
  if (Game.dialogue.index >= Game.dialogue.lines.length) {
    const cb = Game.dialogue.onComplete;
    Game.dialogue.onComplete = null;
    Game.setState(Game.STATES.PLAYING);
    if (cb) cb();
  }
};

(function () {
  // テキストを「名前と、それ以外」の文字単位の列に分解する。人名は1文字ずつでも
  // isName:true のフラグを引き継ぐので、後段の折り返し処理は普通の文字列と同じに扱える。
  function tokenizeChars(text) {
    const names = Game.CHARACTER_NAMES;
    const chars = [];
    let i = 0;
    while (i < text.length) {
      const matched = names.find((name) => text.startsWith(name, i));
      if (matched) {
        Array.from(matched).forEach((ch) => chars.push({ ch, isName: true }));
        i += matched.length;
      } else {
        chars.push({ ch: text[i], isName: false });
        i += 1;
      }
    }
    return chars;
  }

  // 日本語は単語区切りが無いので、文字単位で幅を測って折り返す。
  function wrapChars(ctx, chars, maxWidth) {
    const lines = [];
    let current = [];
    let currentWidth = 0;
    chars.forEach((entry) => {
      const w = ctx.measureText(entry.ch).width;
      if (current.length > 0 && currentWidth + w > maxWidth) {
        lines.push(current);
        current = [];
        currentWidth = 0;
      }
      current.push(entry);
      currentWidth += w;
    });
    if (current.length) lines.push(current);
    return lines;
  }

  Game.drawDialogueBox = function drawDialogueBox(ctx) {
    const line = Game.dialogue.lines[Game.dialogue.index];
    if (!line) return;
    const w = Game.CONFIG.world;
    const ui = Game.CONFIG.ui;

    ctx.save();
    ctx.fillStyle = "rgba(4, 6, 12, 0.35)";
    ctx.fillRect(0, 0, w.width, w.height);

    const boxX = 14;
    const boxY = 468;
    const boxW = w.width - 28;
    const boxH = 150;

    // 話者の立ち絵(等身大の全身画像。ボス勢のみ用意がある)。自機側の台詞では出さない。
    // 画像自体はクロップせず、会話ボックスの裏に下半身が隠れる形で「お腹から上」だけ見せる。
    // 足は画面に入らなくてもよいので、大きめに表示して迫力を優先する。
    const portraitKey = Game.SPEAKER_PORTRAITS[line.speaker];
    const portrait = portraitKey && Game.assets.portraits[portraitKey];
    if (portrait && portrait.ready) {
      const img = portrait.image;
      const ph = 580;
      const pw = ph * (img.width / img.height);
      const bellyFraction = 0.465; // 画像上端からおよそ「お腹」までの割合
      const centerX = 230; // 画面よりやや右寄りに立たせる
      const px = centerX - pw / 2;
      const py = boxY + 8 - ph * bellyFraction;
      ctx.globalAlpha = 0.98;
      ctx.drawImage(img, px, py, pw, ph);
      ctx.globalAlpha = 1;
    }

    // 立ち絵の下半身を隠すため、ボックスはほぼ不透明にする。
    ctx.fillStyle = "rgba(9, 11, 19, 0.94)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = ui.accentGoldDim;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = ui.buttonStroke;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ui.accentGoldBright;
    ctx.font = `700 15px ${ui.bodyFont}`;
    ctx.fillText(line.speaker, boxX + 18, boxY + 28);

    ctx.font = `400 15px ${ui.bodyFont}`;
    const wrapped = wrapChars(ctx, tokenizeChars(line.text), boxW - 36);
    wrapped.forEach((lineChars, i) => {
      let x = boxX + 18;
      const y = boxY + 54 + i * 22;
      lineChars.forEach((entry) => {
        ctx.fillStyle = entry.isName ? ui.nameHighlight : ui.textColor;
        ctx.fillText(entry.ch, x, y);
        x += ctx.measureText(entry.ch).width;
      });
    });

    if (Math.floor(performance.now() / 450) % 2 === 0) {
      ctx.textAlign = "right";
      ctx.fillStyle = ui.accentGold;
      ctx.font = `600 12px ${ui.bodyFont}`;
      ctx.fillText("▼ タップで続ける", boxX + boxW - 14, boxY + boxH - 14);
    }

    ctx.restore();
  };
})();
