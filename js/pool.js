// 弾はスマホでも重くならないよう、生成/破棄せずに使い回すオブジェクトプールで扱う。
Game.createPool = function createPool(size, factory) {
  const items = [];
  for (let i = 0; i < size; i += 1) {
    const item = factory();
    item.active = false;
    items.push(item);
  }

  return {
    items,

    // 空きスロットを1つ確保してinitで初期化する。空きが無ければ何もしない(取りこぼしても実害が小さい弾のため)。
    spawn(init) {
      const item = items.find((it) => !it.active);
      if (!item) return null;
      item.active = true;
      init(item);
      return item;
    },

    forEachActive(fn) {
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].active) fn(items[i]);
      }
    },
  };
};
