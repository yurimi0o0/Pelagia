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
  cast: [], // このシーンに登場する立ち絵持ちの話者(最大2人、初登場順)。会話中は画面に残り続ける。
};

// steps全体を見て、立ち絵を持つ話者を初登場順に最大2人まで拾う(ジェリー等、立ち絵の無い話者は対象外)。
// 2人いれば左右に常駐、1人なら中央に常駐させ、喋っていない方/時だけ薄暗くする。
Game.computeDialogueCast = function computeDialogueCast(steps) {
  const cast = [];
  (steps || []).forEach((step) => {
    const type = step.type || "line";
    if (type !== "line") return;
    if (step.speaker && Game.SPEAKER_PORTRAITS[step.speaker] && cast.indexOf(step.speaker) === -1) {
      cast.push(step.speaker);
    }
  });
  return cast.slice(0, 2);
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
  Game.dialogue.cast = Game.computeDialogueCast(steps);
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

  // 行頭に来てはいけない句読点類(禁則処理)。「。」だけが次の行に取り残されるのを防ぐため、
  // 該当する文字は前の行の末尾に詰め戻す。
  const LINE_START_FORBIDDEN = new Set(["。", "、", "！", "？", "」", "』", "】", "）", ".", ",", "!", "?", ")", "…"]);

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

    // 禁則処理：行頭が句読点だけにならないよう、前の行の末尾へ詰める。
    for (let i = 1; i < lines.length; i += 1) {
      while (lines[i].length > 0 && LINE_START_FORBIDDEN.has(lines[i][0].ch)) {
        lines[i - 1].push(lines[i].shift());
      }
    }
    return lines.filter((line) => line.length > 0);
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

    // 話者の立ち絵(等身大の全身画像。ボス勢のみ用意がある)。自機(ジェリー)は立ち絵を持たない。
    // 画像自体はクロップせず、会話ボックスの裏に下半身が隠れる形で「お腹から上」だけ見せる。
    // 足は画面に入らなくてもよいので、大きめに表示して迫力を優先する。
    // cast(このシーンの立ち絵持ち、最大2人)は会話の間ずっと画面に残り、喋っていない方/時は薄暗くする。
    const cast = Game.dialogue.cast || [];
    const bellyFraction = 0.465; // 画像上端からおよそ「お腹」までの割合
    const layouts = cast.length >= 2
      ? [{ centerX: 92, ph: 430 }, { centerX: 268, ph: 430 }]
      : [{ centerX: 230, ph: 580 }];

    cast
      .map((speaker, i) => ({ speaker, layout: layouts[i] }))
      .sort((a, b) => (a.speaker === line.speaker ? 1 : 0) - (b.speaker === line.speaker ? 1 : 0)) // 喋っている方を最後に描いて手前に出す
      .forEach(({ speaker, layout }) => {
        const portraitKey = Game.SPEAKER_PORTRAITS[speaker];
        const portrait = portraitKey && Game.assets.portraits[portraitKey];
        if (!portrait || !portrait.ready) return;
        const img = portrait.image;
        const ph = layout.ph;
        const pw = ph * (img.width / img.height);
        const px = layout.centerX - pw / 2;
        const py = boxY + 8 - ph * bellyFraction;
        ctx.globalAlpha = speaker === line.speaker ? 0.98 : 0.55;
        ctx.drawImage(img, px, py, pw, ph);
        ctx.globalAlpha = 1;
      });

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
