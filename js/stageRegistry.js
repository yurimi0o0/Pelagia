// 面選択画面が参照するステージ一覧。3面はまだ内容が無いのでロック枠として並べておき、
// 実装済みステージを増やす時はここに STAGES へのエントリと ROSTER への1行を足すだけでよい。
Game.STAGES = {
  1: Game.STAGE1,
  2: Game.STAGE2,
};

Game.STAGE_ROSTER = [
  { number: 1, name: Game.STAGE1.title, implemented: true },
  { number: 2, name: Game.STAGE2.title, implemented: true },
  { number: 3, name: "???", implemented: false },
];
