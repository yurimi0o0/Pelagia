// 簡易ビジュアルノベル風の会話エンジン。台詞データ自体(誰が何を言うか)は
// BOSS_DEFS(boss.js)やSTAGEデータ(stage1.js等)側に持たせ、ここでは
// 「渡されたstep配列を順番に送る」汎用処理にする。
//
// --- 使い方(演出コマンドの足し方) ---
// 会話配列に { speaker, text } だけ並べれば今まで通りタップ送りの台詞になる(type省略="line")。
// 好きな行の間に次のstepを1個差し込むと、その位置で自動再生される:
//   { type: "move",   target, to:{x,y}, duration, skippable }  … cutsceneActorを移動
//   { type: "fade",   color, duration, direction:"out"|"in" }  … 全画面フェード(out=暗く/明るく, in=戻す)
//   { type: "image",  key, transitionDuration }                … 1枚絵を表示/クロスフェード切替
//   { type: "wait",   duration }                                … 何もせず自動で送る(間)
//   { type: "action", run() {...} }                             … 即時実行して次へ(演出トリガー用)
// 新しいエンディング(NORMAL/BAD等)や別の演出も、この配列を1本書くだけで足せる。
Game.SPEAKER_PORTRAITS = {
  "レーナ": "lena",
  "リオネ": "rione",
  "コーリア": "coralia",
  "エスカー": "escar",
  "シェーラ": "shera",
  "オリア": "oria",
  "メディ": "medi",
};

// 台詞文中にこれらの名前が現れたら色を変える(「名乗り」演出の代わり)。
// 長い名前を先に判定しないと部分一致で崩れるので長さ降順に並べておく。
Game.CHARACTER_NAMES = [
  "ジェリー", "レーナ", "リオネ", "コーリア", "エスカー", "シェーラ", "オリア", "メディ",
].sort((a, b) => b.length - a.length);

// エンディング1枚絵が未提供の間、プレースホルダーに添えるキャプション。
Game.ILLUSTRATION_LABELS = {};

// 演出stepが動かす舞台上の登場人物(祭壇へ歩くジェリー等)の座標レジストリ。
// 専用スプライトが無いキャラはGame.drawCutsceneActorsが簡易シルエットで代替表示する。
Game.cutsceneActors = {};

// 現在表示中の1枚絵({key, alpha, prevKey}か、無ければnull)。imageステップで切り替わる。
Game.cutsceneImage = null;

Game.dialogue = {
  steps: [],
  index: 0,
  onComplete: null,
  stepState: {},
  returnState: null,
  fadeOverlay: null, // { color, alpha } — fadeステップが書き込む全画面オーバーレイ
};

// steps: [{speaker,text} | {type,...}, ...]
// opts: { enterState(既定DIALOGUE), returnState(既定PLAYING。nullを渡すとonComplete側が遷移を担う) }
Game.startCutscene = function startCutscene(steps, onComplete, opts) {
  const options = opts || {};
  if (!steps || steps.length === 0) {
    if (onComplete) onComplete();
    return;
  }
  Game.dialogue.steps = steps;
  Game.dialogue.onComplete = onComplete || null;
  Game.dialogue.returnState = options.returnState !== undefined ? options.returnState : Game.STATES.PLAYING;
  Game.setState(options.enterState || Game.STATES.DIALOGUE);
  Game.enterDialogueStep(0);
};

// 既存呼び出し(boss.js/stageRunner.js)互換の薄いラッパー。lines: [{speaker,text}, ...]
Game.startDialogue = function startDialogue(lines, onComplete) {
  Game.startCutscene(lines, onComplete, { enterState: Game.STATES.DIALOGUE, returnState: Game.STATES.PLAYING });
};

Game.finishCutscene = function finishCutscene() {
  const cb = Game.dialogue.onComplete;
  Game.dialogue.onComplete = null;
  if (Game.dialogue.returnState) Game.setState(Game.dialogue.returnState);
  if (cb) cb();
};

Game.enterDialogueStep = function enterDialogueStep(index) {
  const dialogue = Game.dialogue;
  const step = dialogue.steps[index];
  dialogue.index = index;

  if (!step) {
    Game.finishCutscene();
    return;
  }

  const type = step.type || "line";
  dialogue.stepState = { type, elapsed: 0, duration: 0 };
  const ss = dialogue.stepState;

  if (type === "action") {
    if (step.run) step.run();
    Game.advanceDialogueStep();
    return;
  }

  if (type === "wait" || type === "titlecard") {
    ss.duration = (type === "titlecard" ? step.holdDuration : step.duration) || 0;
  } else if (type === "move") {
    const actor = Game.cutsceneActors[step.target] || (Game.cutsceneActors[step.target] = { x: step.to.x, y: step.to.y });
    ss.duration = step.duration || 0;
    ss.target = step.target;
    ss.from = { x: actor.x, y: actor.y };
    ss.to = { x: step.to.x, y: step.to.y };
  } else if (type === "fade") {
    ss.duration = step.duration || 0;
    ss.from = step.direction === "in" ? 1 : 0;
    ss.to = step.direction === "in" ? 0 : 1;
    Game.dialogue.fadeOverlay = { color: step.color, alpha: ss.from };
  } else if (type === "image") {
    ss.duration = step.transitionDuration || 0;
    ss.prevKey = Game.cutsceneImage ? Game.cutsceneImage.key : null;
    ss.nextKey = step.key;
    Game.cutsceneImage = { key: ss.nextKey, alpha: ss.duration > 0 ? 0 : 1, prevKey: ss.prevKey };
  }
  // type === "line" はここで何もしない。タップ(advanceDialogue)を待つ。
};

Game.advanceDialogueStep = function advanceDialogueStep() {
  Game.enterDialogueStep(Game.dialogue.index + 1);
};

// 毎フレーム呼ぶ(DIALOGUE/ENDING状態のみ)。時間経過で進むstep(wait/fade/move/image/titlecard)を進める。
Game.updateDialogue = function updateDialogue(dt) {
  const dialogue = Game.dialogue;
  const step = dialogue.steps[dialogue.index];
  if (!step) return;
  const type = step.type || "line";
  if (type === "line" || type === "action") return;

  const ss = dialogue.stepState;
  ss.elapsed += dt;
  const t = ss.duration > 0 ? Game.clamp(ss.elapsed / ss.duration, 0, 1) : 1;

  if (type === "move") {
    const actor = Game.cutsceneActors[ss.target];
    if (actor) {
      actor.x = ss.from.x + (ss.to.x - ss.from.x) * t;
      actor.y = ss.from.y + (ss.to.y - ss.from.y) * t;
    }
  } else if (type === "fade") {
    Game.dialogue.fadeOverlay.alpha = ss.from + (ss.to - ss.from) * t;
  } else if (type === "image") {
    Game.cutsceneImage = { key: ss.nextKey, alpha: t, prevKey: ss.prevKey };
  }

  if (t >= 1) {
    if (type === "fade" && ss.to === 0) Game.dialogue.fadeOverlay = null;
    if (type === "image") Game.cutsceneImage = { key: ss.nextKey, alpha: 1, prevKey: null };
    Game.advanceDialogueStep();
  }
};

// タップの入口(ui.jsから呼ばれる)。lineは常に送る。自動送りstepはskippable!==falseなら早送りする。
Game.advanceDialogue = function advanceDialogue() {
  const dialogue = Game.dialogue;
  const step = dialogue.steps[dialogue.index];
  if (!step) {
    Game.finishCutscene();
    return;
  }
  const type = step.type || "line";

  if (type === "line") {
    Game.advanceDialogueStep();
    return;
  }
  if (type === "action") return; // 即時実行済みでこの状態には留まらない

  if (step.skippable === false) return;

  const ss = dialogue.stepState;
  if (type === "move") {
    const actor = Game.cutsceneActors[ss.target];
    if (actor) { actor.x = ss.to.x; actor.y = ss.to.y; }
  } else if (type === "fade") {
    Game.dialogue.fadeOverlay.alpha = ss.to;
    if (ss.to === 0) Game.dialogue.fadeOverlay = null;
  } else if (type === "image") {
    Game.cutsceneImage = { key: ss.nextKey, alpha: 1, prevKey: null };
  }
  Game.advanceDialogueStep();
};

Game.drawFadeOverlay = function drawFadeOverlay(ctx) {
  const overlay = Game.dialogue.fadeOverlay;
  if (!overlay || overlay.alpha <= 0) return;
  const w = Game.CONFIG.world;
  ctx.save();
  ctx.globalAlpha = Game.clamp(overlay.alpha, 0, 1);
  ctx.fillStyle = overlay.color;
  ctx.fillRect(0, 0, w.width, w.height);
  ctx.restore();
};

Game.drawCutsceneImage = function drawCutsceneImage(ctx) {
  const img = Game.cutsceneImage;
  if (!img) return;
  const w = Game.CONFIG.world;

  function drawOne(key, alpha) {
    if (alpha <= 0 || !key) return;
    const asset = Game.assets.illustrations[key];
    ctx.save();
    ctx.globalAlpha = alpha;
    if (asset && asset.ready) {
      ctx.drawImage(asset.image, 0, 0, w.width, w.height);
    } else {
      // 未提供の1枚絵はグラデーション+タイトル文字で代替する(後から画像を差し替えるだけでよい)。
      const gradient = ctx.createLinearGradient(0, 0, 0, w.height);
      gradient.addColorStop(0, "#1c1636");
      gradient.addColorStop(1, "#060814");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w.width, w.height);
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(227, 201, 138, 0.75)";
      ctx.font = `italic 400 15px ${Game.CONFIG.ui.bodyFont}`;
      ctx.fillText(Game.ILLUSTRATION_LABELS[key] || key, w.width / 2, w.height / 2);
    }
    ctx.restore();
  }

  drawOne(img.prevKey, 1 - img.alpha);
  drawOne(img.key, img.alpha);
};

// 専用スプライト未提供のキャラを、クラゲ状の簡易シルエットで仮描画する(差し替え可能)。
Game.drawCutsceneActors = function drawCutsceneActors(ctx) {
  Object.keys(Game.cutsceneActors).forEach((key) => {
    const actor = Game.cutsceneActors[key];
    ctx.save();
    ctx.translate(actor.x, actor.y);
    ctx.fillStyle = "rgba(210, 230, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(0, -4, 15, Math.PI, 0);
    ctx.quadraticCurveTo(15, 16, 0, 12);
    ctx.quadraticCurveTo(-15, 16, -15, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(160, 200, 255, 0.7)";
    ctx.lineWidth = 1.5;
    [-8, 0, 8].forEach((ox) => {
      ctx.beginPath();
      ctx.moveTo(ox, 10);
      ctx.quadraticCurveTo(ox * 1.4, 24, ox * 0.6, 36);
      ctx.stroke();
    });
    ctx.restore();
  });
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
    const line = Game.dialogue.steps[Game.dialogue.index];
    if (!line || (line.type && line.type !== "line")) return; // 演出stepの間はテキスト欄を出さない
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
