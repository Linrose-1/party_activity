// src/utils/feedback.js

// 1. 定义音效文件的 URL
const POINTS_GAINED_SOUND_URL = 'https://img.gofor.club/20251119/retro-coin-4-236671_1763536579022.mp3';

// 2. 创建并配置一个全局的 InnerAudioContext
// 这样做可以避免在每次调用时都创建新的实例，但需要管理好播放状态
const audioContext = uni.createInnerAudioContext();
audioContext.src = POINTS_GAINED_SOUND_URL;
audioContext.autoplay = false; // 禁止自动播放

// 3. 封装核心反馈函数
/**
 * @description 显示获得贡分的反馈，包括音效和弹窗榜文。
 * @param {string} actionName - 触发获得贡分的行为名称，例如 '分享名片', '每日签到' 等。
 * @param {number|string} points - 获得的贡分数量。
 */
export function showPointsGainedFeedback(actionName, points) {
	// 安全检查，如果参数不合法则不执行
	if (!actionName || !points || points <= 0) {
		console.warn('showPointsGainedFeedback调用失败：缺少 actionName 或 points 参数。');
		return;
	}

	// --- 播放音效 ---
	// 每次播放前，先停止上一次可能未播放完的音效并回到起点
	audioContext.stop();
	audioContext.seek(0);
	audioContext.play();

	audioContext.onPlay(() => {
		console.log('贡分音效开始播放');
	});
	audioContext.onError((res) => {
		console.error('贡分音效播放错误:', res.errMsg);
	});


	// --- 显示榜文弹窗 ---
	const content = `恭喜您，今日${actionName}，您已获得 ${points} 贡分！\n(贡分可用于获得参与平台分享的权益)`;

	uni.showModal({
		title: '恭喜获得贡分！',
		content: content,
		showCancel: false, // 只保留一个确认按钮
		confirmText: '太棒了！', // 自定义按钮文字
		success: (res) => {
			if (res.confirm) {
				console.log('用户确认了贡分提示');
			}
		}
	});
}

// 默认导出一个包含所有反馈函数的对象（方便未来扩展）
export default {
	showPointsGainedFeedback
};