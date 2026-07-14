// 面選択画面が参照するステージ一覧。2面/3面はまだ内容が無いのでロック枠として並べておき、
// 実装済みステージを増やす時はここに STAGES へのエントリと ROSTER への1行を足すだけでよい。
Game.STAGES = {
  1: Game.STAGE1,
};

Game.STAGE_ROSTER = [
  { number: 1, name: Game.STAGE1.title, implemented: true },
  { number: 2, name: "???", implemented: false },
  { number: 3, name: "???", implemented: false },
];
