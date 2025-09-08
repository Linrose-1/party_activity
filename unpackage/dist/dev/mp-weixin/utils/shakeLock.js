"use strict";
const common_vendor = require("../common/vendor.js");
const isShakeLocked = common_vendor.ref(false);
const lockShake = (duration = 3e3) => {
  if (isShakeLocked.value)
    return;
  isShakeLocked.value = true;
  common_vendor.index.__f__("log", "at utils/shakeLock.js:14", `[ShakeLock] 摇一摇已锁定，将在 ${duration / 1e3} 秒后自动解锁。`);
  setTimeout(() => {
    isShakeLocked.value = false;
    common_vendor.index.__f__("log", "at utils/shakeLock.js:19", "[ShakeLock] 摇一摇已解锁。");
  }, duration);
};
function useShakeLock() {
  return {
    isShakeLocked,
    lockShake
  };
}
exports.useShakeLock = useShakeLock;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/shakeLock.js.map
