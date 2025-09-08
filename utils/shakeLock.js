import { ref } from 'vue';

// 创建一个全局响应式的锁状态
const isShakeLocked = ref(false);

/**
 * 锁定摇一摇功能
 * @param {number} duration - 锁定时长（毫秒），默认3秒
 */
const lockShake = (duration = 3000) => {
  if (isShakeLocked.value) return; // 如果已经锁定，则不重复操作
  
  isShakeLocked.value = true;
  console.log(`[ShakeLock] 摇一摇已锁定，将在 ${duration / 1000} 秒后自动解锁。`);
  
  // 设置一个定时器，在指定时间后自动解锁
  setTimeout(() => {
    isShakeLocked.value = false;
    console.log('[ShakeLock] 摇一摇已解锁。');
  }, duration);
};

// 导出状态和锁定方法
export function useShakeLock() {
  return {
    isShakeLocked,
    lockShake,
  };
}