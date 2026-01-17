<template>
	<view class="container">
		<!-- 1. 顶部 Tabs -->
		<view class="tabs">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="currentTab = 0">
				赞踩
				<view class="active-line" v-if="currentTab === 0"></view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="currentTab = 1">
				评分
				<view class="active-line" v-if="currentTab === 1"></view>
			</view>
		</view>

		<!-- 2. Tab 内容区 -->
		<view class="content-body">

			<!-- Tab 1: 赞踩 (占位) -->
			<view v-if="currentTab === 0" class="placeholder-box">
				<text>赞踩功能</text>
			</view>

			<!-- Tab 2: 评分 -->
			<view v-if="currentTab === 1">
				<!-- 2.1 评分标准 (复用之前设计) -->
				<view class="standard-card">
					<view class="standard-title">
						<uni-icons type="info-filled" size="16" color="#FF8C00"></uni-icons>
						<text>评分参考标准</text>
					</view>
					<view class="standard-grid">
						<view class="standard-item level-6"><text class="score-range">10分</text><text
								class="score-desc">杰出</text></view>
						<view class="standard-item level-5"><text class="score-range">8-9分</text><text
								class="score-desc">优秀</text></view>
						<view class="standard-item level-4"><text class="score-range">6-7分</text><text
								class="score-desc">较好</text></view>
						<view class="standard-item level-3"><text class="score-range">4-5分</text><text
								class="score-desc">一般</text></view>
						<view class="standard-item level-2"><text class="score-range">2-3分</text><text
								class="score-desc">较差</text></view>
						<view class="standard-item level-1"><text class="score-range">0-1分</text><text
								class="score-desc">极差</text></view>
					</view>
				</view>

				<!-- 2.2 评分表单 (复用组件) -->
				<view class="score-form-wrapper">
					<ScoreForm v-model="scores" />
				</view>

				<!-- 2.3 提交按钮 -->
				<view class="footer-spacer"></view> <!-- 占位防止被底部按钮遮挡 -->
				<view class="footer-bar">
					<button class="submit-btn" :disabled="isSubmitting" @click="submitScores">
						{{ isSubmitting ? '提交中...' : '提交评价' }}
					</button>
				</view>
			</view>

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
	import request from '@/utils/request.js';
	import ScoreForm from '@/components/ScoreForm.vue';

	// --- 状态管理 ---
	const currentTab = ref(1); // 默认显示评分 Tab
	const targetUserId = ref(null); // 被评分人 ID
	const currentUserId = ref(null); // 当前登录用户 ID (评分人)
	const isSubmitting = ref(false);
	const scoreRecordId = ref(null); // 如果是修改已有评价，需要记录 ID

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

	// --- 生命周期 ---
	onLoad((options) => {
		if (options.userId) {
			targetUserId.value = options.userId;
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		}

		currentUserId.value = uni.getStorageSync('userId');
	});

	onMounted(async () => {
		// 如果需要回显"我给他的历史评分"，可以在这里调用 getInfo 接口
		// 假设接口 getInfo 支持传 scorerId 来查询特定人的评价
		// await fetchMyHistoryScore();
	});

	// --- 方法 ---

	// 获取历史评分 (可选，如果需求是每次都新评则不需要)
	const fetchMyHistoryScore = async () => {
		// TODO: 根据后端接口实际情况实现回显逻辑
		// 示例：
		// const { data } = await request('/app-api/member/user-scores/getInfo', {
		// 	 method: 'GET',
		// 	 data: { userId: targetUserId.value, scorerId: currentUserId.value } 
		// });
		// if (data) {
		// 	 scoreRecordId.value = data.id;
		// 	 Object.assign(scores.value, data);
		// }
	};

	const submitScores = async () => {
		if (isSubmitting.value) return;

		// 基础校验：至少评一项？或者全部必填？
		// 这里假设允许部分 0 分

		isSubmitting.value = true;
		uni.showLoading({
			title: '提交中...'
		});

		const payload = {
			...scores.value,
			id: scoreRecordId.value, // 如果是新增则为 null
			scorerId: targetUserId.value, // 传被评价人的 ID
			userId: currentUserId.value // 传自己的 ID
		};

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-scores/saveOrUpdate', {
				method: 'POST',
				data: payload
			});

			uni.hideLoading();

			if (error) {
				uni.showToast({
					title: error.msg || '提交失败',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: '评价成功',
					icon: 'success'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		} catch (e) {
			uni.hideLoading();
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
	}

	/* Tabs 样式 */
	.tabs {
		display: flex;
		background-color: #fff;
		height: 88rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 10;

		.tab-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			color: #666;
			position: relative;
			font-weight: 500;
			transition: all 0.3s;

			&.active {
				color: #FF8C00;
				font-weight: bold;
				font-size: 32rpx;
			}

			.active-line {
				position: absolute;
				bottom: 0;
				width: 40rpx;
				height: 6rpx;
				background-color: #FF8C00;
				border-radius: 6rpx;
			}
		}
	}

	.content-body {
		padding: 30rpx;
		flex: 1;
	}

	.placeholder-box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 400rpx;
		color: #999;
		font-size: 32rpx;
	}

	/* 评分标准卡片 (复用样式) */
	.standard-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		margin-bottom: 30rpx;
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

		&.level-5 {
			background-color: #FFF7E6;
			color: #FF9C38;
		}

		&.level-4 {
			background-color: #E8F5E9;
			color: #4CAF50;
		}

		&.level-3 {
			background-color: #E3F2FD;
			color: #2196F3;
		}

		&.level-2 {
			background-color: #FFF3E0;
			color: #FF9800;
		}

		&.level-1 {
			background-color: #FBE9E7;
			color: #FF5722;
		}
	}

	.score-form-wrapper {
		padding-bottom: 20rpx;
	}

	.footer-spacer {
		height: 120rpx;
	}

	.footer-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
		z-index: 99;
		box-sizing: border-box;
	}

	.submit-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: #fff;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: bold;
		border: none;

		&[disabled] {
			opacity: 0.7;
		}

		&::after {
			border: none;
		}
	}
</style>