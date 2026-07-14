Game.clamp = function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

Game.damp = function damp(current, target, strength, dt) {
  return current + (target - current) * (1 - Math.exp(-strength * dt));
};
