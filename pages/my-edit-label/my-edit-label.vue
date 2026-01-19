<template>
	<view class="container">
		<view class="page-header">
			<view class="header-title-box">
				<text class="page-title">{{ isSelf ? '数字标签（自我评价）' : '给商友评分' }}</text>
				<text class="page-subtitle">{{ isSelf ? '请对自己以下维度的表现进行1-10分评估' : '请对TA以下维度的表现进行1-10分评估' }}</text>
			</view>

			<!-- 评分标准卡片 -->
			<view class="standard-card">
				<view class="standard-title">
					<uni-icons type="info-filled" size="16" color="#FF8C00"></uni-icons>
					<text>评分参考标准</text>
				</view>

				<view class="standard-grid">
					<view class="standard-item level-6">
						<view class="score-range">10分</view>
						<view class="score-desc">杰出</view>
					</view>
					<view class="standard-item level-5">
						<view class="score-range">8-9分</view>
						<view class="score-desc">优秀</view>
					</view>
					<view class="standard-item level-4">
						<view class="score-range">6-7分</view>
						<view class="score-desc">较好</view>
					</view>
					<view class="standard-item level-3">
						<view class="score-range">4-5分</view>
						<view class="score-desc">一般</view>
					</view>
					<view class="standard-item level-2">
						<view class="score-range">2-3分</view>
						<view class="score-desc">较差</view>
					</view>
					<view class="standard-item level-1">
						<view class="score-range">0-1分</view>
						<view class="score-desc">极差</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 评分区域 -->
		<view class="score-sections">
			<!-- 双向绑定 scores 对象 -->
			<ScoreForm v-model="scores" />
		</view>

		<!-- 提交按钮 -->
		<view class="footer">
			<button class="submit-btn" :disabled="isSubmitting" @click="submitScores">
				{{ isSubmitting ? '保存中...' : '保存评分' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js'; // 统一引用路径
	import ScoreForm from '@/components/ScoreForm.vue';

	// ==========================================
	// 1. API 定义区域
	// ==========================================
	const ScoreApi = {
		/**
		 * 保存或更新用户评分
		 */
		saveOrUpdate: (scoreData) => {
			return request('/app-api/member/user-scores/saveOrUpdate', {
				method: 'POST',
				data: scoreData
			});
		},
		/**
		 * 获取用户评分
		 * @param {Number|String} userId - 当前登录用户ID
		 * @param {Number|String} scorerId - 被评分/查看的用户ID
		 */
		getInfo: (userId, scorerId) => {
			return request('/app-api/member/user-scores/getInfo', {
				method: 'GET',
				data: {
					userId,
					scorerId
				}
			});
		}
	};

	// ==========================================
	// 2. 状态变量区域
	// ==========================================

	// 用户身份相关
	const currentUserId = ref(null); // 当前登录用户 (Me)
	const targetUserId = ref(null); // 目标用户 (Target)
	const isSelf = ref(false); // 是否是自己给自己评分

	// 业务数据相关
	const scoreRecordId = ref(null); // 现有评分记录ID
	const isSubmitting = ref(false); // 提交锁

	// 评分数据模型
	const scores = ref({
		punctuality: 0,
		promiseKeep: 0,
		lawAbiding: 0,
		responsible: 0,
		sincere: 0,
		tolerance: 0,
		altruism: 0,
		empathy: 0,
		focus: 0,
		efficient: 0,
		detailOriented: 0,
		expandVision: 0,
		contribution: 0,
		humility: 0,
		foresight: 0,
		mission: 0
	});

	// ==========================================
	// 3. 生命周期区域
	// ==========================================

	onLoad((options) => {
		currentUserId.value = uni.getStorageSync('userId');

		// 确定目标用户：有id则为他人，无id则为自己
		if (options.id) {
			targetUserId.value = options.id;
		} else {
			targetUserId.value = currentUserId.value;
		}

		console.log("查看用户id:", targetUserId)

		// 判断身份关系
		isSelf.value = String(targetUserId.value) === String(currentUserId.value);

		// 设置导航栏标题
		uni.setNavigationBarTitle({
			title: isSelf.value ? '数字标签(自我评价)' : '商友评分'
		});
	});

	onMounted(() => {
		fetchScores();
	});

	// ==========================================
	// 4. 方法逻辑区域
	// ==========================================

	/**
	 * 获取已有评分数据
	 */
	const fetchScores = async () => {
		// 【优化 1】每次请求前，先重置分数为 0，防止看到上一个人的数据
		scoreRecordId.value = null;
		Object.keys(scores.value).forEach(key => {
			scores.value[key] = 0;
		});

		// 安全检查
		if (!currentUserId.value || !targetUserId.value) {
			console.error("缺少 ID 信息:", {
				me: currentUserId.value,
				target: targetUserId.value
			});
			return;
		}

		uni.showLoading({
			title: '加载中...'
		});

		try {
			// 【优化 2】显式使用 .value，确保传给接口的是字符串/数字而不是 Ref 对象
			const me = String(currentUserId.value);
			const target = String(targetUserId.value);

			console.log(`🚀 发起请求 -> userId(我): ${me}, scorerId(目标): ${target}`);

			const {
				data,
				error
			} = await ScoreApi.getInfo(me, target);

			if (!error && data) {
				console.log('✅ 接口返回数据:', data);

				// 【优化 3】校验返回的数据是否真的是我们要的那条记录
				// 如果后端返回的 scorerId 和我们请求的 target 不一致，说明后端逻辑可能有误或返回了默认自评
				if (String(data.scorerId) !== target) {
					console.warn('⚠️ 后端返回的被评分人 ID 与请求不符，可能不存在历史评分');
					return;
				}

				scoreRecordId.value = data.id;
				// 回显分数
				Object.keys(scores.value).forEach(key => {
					if (data[key] !== undefined && data[key] !== null) {
						scores.value[key] = data[key];
					}
				});
			} else {
				console.log('💡 未找到该评价记录，显示默认分');
			}
		} catch (e) {
			console.error('[Fetch Error]', e);
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 提交评分
	 */
	const submitScores = async () => {
		// 1. 防重复提交检查
		if (isSubmitting.value) return;

		// 2. 登录态检查
		const userId = uni.getStorageSync('userId');
		if (!userId) {
			uni.showToast({
				title: '无法获取用户信息，请重新登录',
				icon: 'none'
			});
			return;
		}

		// 3. 准备提交
		isSubmitting.value = true;
		uni.showLoading({
			title: '正在保存...'
		});

		// 4. 组装参数 (保持原代码逻辑)
		const payload = {
			...scores.value,
			id: scoreRecordId.value, // 记录ID (新增为null)
			scorerId: targetUserId.value, // 被评分人
			userId: currentUserId.value // 评分人 (操作者)
		};

		// 5. 调用接口
		const {
			data: newRecord,
			error
		} = await ScoreApi.saveOrUpdate(payload);

		uni.hideLoading();
		isSubmitting.value = false;

		// 6. 结果处理
		if (error) {
			console.error('评分保存失败:', error);
			uni.showToast({
				title: `保存失败: ${error}`,
				icon: 'none'
			});
			return;
		}

		uni.showToast({
			title: '保存成功！',
			icon: 'success'
		});

		// 更新ID，防止再次提交变成新增
		if (newRecord && newRecord.id) {
			scoreRecordId.value = newRecord.id;
		}

		// 延迟返回上一页
		setTimeout(() => {
			uni.navigateBack();
		}, 1500);
	};
</script>

<style scoped lang="scss">
	/* 保持原有样式，仅优化缩进 */
	.container {
		background-color: #f9f9f9;
		min-height: 100vh;
		padding: 30rpx 30rpx 140rpx;
		box-sizing: border-box;
	}

	.page-header {
		margin-bottom: 30rpx;
	}

	.header-title-box {
		margin-bottom: 20rpx;
		padding-left: 10rpx;

		.page-title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 8rpx;
			display: block;
		}

		.page-subtitle {
			font-size: 26rpx;
			color: #666;
		}
	}

	.standard-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.standard-title {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 20rpx;

		text {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.standard-grid {
		display: flex;
		justify-content: space-between;
		gap: 10rpx;
	}

	.standard-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16rpx 0;
		border-radius: 12rpx;
		background-color: #f5f5f5;

		.score-range {
			font-size: 24rpx;
			font-weight: bold;
			margin-bottom: 4rpx;
		}

		.score-desc {
			font-size: 22rpx;
			opacity: 0.9;
		}

		&.level-6 {
			background-color: #FFF0E6;
			color: #FF6A00;
		}

		/* 杰出 */
		&.level-5 {
			background-color: #FFF7E6;
			color: #FF9C38;
		}

		/* 优秀 */
		&.level-4 {
			background-color: #E8F5E9;
			color: #4CAF50;
		}

		/* 较好 */
		&.level-3 {
			background-color: #E3F2FD;
			color: #2196F3;
		}

		/* 一般 */
		&.level-2 {
			background-color: #FFF3E0;
			color: #FF9800;
		}

		/* 较差 */
		&.level-1 {
			background-color: #FBE9E7;
			color: #FF5722;
		}

		/* 极差 */
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		border-top: 1px solid #f0f0f0;
		z-index: 100;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
		border-radius: 44rpx;
		font-size: 32rpx;
		border: none;

		&[disabled] {
			opacity: 0.6;
		}

		&::after {
			border: none;
		}
	}

	.score-sections {
		margin-bottom: 80rpx;
	}
</style>