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
		<!-- <view class="score-sections">
			<view class="section-card" v-for="category in scoreCategories" :key="category.title">
				<view class="section-header">
					<text class="section-title">{{ category.title }}</text>
				</view>
				<view class="section-content">
					<view class="score-item" v-for="item in category.items" :key="item.key">
						<text class="item-label">{{ item.label }}</text>
						<uni-rate 
							v-model="scores[item.key]" 
							:max="10" 
							:size="22"
							color="#c0c0c0"
							active-color="#FF8C00"
							:allow-half="false" 
						/>
					</view>
				</view>
			</view>
		</view> -->

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
	import request from '../../utils/request.js';
	import ScoreForm from '@/components/ScoreForm.vue';

	// 完善评分API的封装
	const ScoreApi = {
		/**
		 * 保存或更新用户评分
		 * @param {object} scoreData
		 */
		saveOrUpdate: (scoreData) => {
			// 假设接口是 /saveOrUpdate，请根据实际情况修改
			return request('/app-api/member/user-scores/saveOrUpdate', {
				method: 'POST',
				data: scoreData
			});
		},
		/**
		 * 获取用户评分
		 * @param {string|number} userId
		 */
		getMyScores: (userId) => {
			return request('/app-api/member/user-scores/getInfo', {
				method: 'GET',
				data: {
					userId: userId
				}
			});
		}
	};

	// 评分项结构定义 (无变化)
	// const scoreCategories = ref([{
	// 		title: '基础信用',
	// 		items: [{
	// 				label: '守时',
	// 				key: 'punctuality'
	// 			},
	// 			{
	// 				label: '守诺',
	// 				key: 'promiseKeep'
	// 			},
	// 			{
	// 				label: '守法',
	// 				key: 'lawAbiding'
	// 			},
	// 			{
	// 				label: '尽责',
	// 				key: 'responsible'
	// 			},
	// 		]
	// 	},
	// 	{
	// 		title: '协作态度',
	// 		items: [{
	// 				label: '真诚',
	// 				key: 'sincere'
	// 			},
	// 			{
	// 				label: '包容',
	// 				key: 'tolerance'
	// 			},
	// 			{
	// 				label: '利他',
	// 				key: 'altruism'
	// 			},
	// 			{
	// 				label: '共情',
	// 				key: 'empathy'
	// 			}
	// 		]
	// 	},
	// 	{
	// 		title: '专业能力',
	// 		items: [{
	// 				label: '专注',
	// 				key: 'focus'
	// 			},
	// 			{
	// 				label: '高效',
	// 				key: 'efficient'
	// 			},
	// 			{
	// 				label: '细致',
	// 				key: 'detailOriented'
	// 			},
	// 			{
	// 				label: '拓局',
	// 				key: 'expandVision'
	// 			}
	// 		]
	// 	},
	// 	{
	// 		title: '精神格局',
	// 		items: [{
	// 				label: '贡献',
	// 				key: 'contribution'
	// 			},
	// 			{
	// 				label: '谦逊',
	// 				key: 'humility'
	// 			},
	// 			{
	// 				label: '远见',
	// 				key: 'foresight'
	// 			},
	// 			{
	// 				label: '使命',
	// 				key: 'mission'
	// 			}
	// 		]
	// 	}
	// ]);

	// 存储所有评分项的分数 (无变化)
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

	const scoreRecordId = ref(null); // 存储已有评分记录的ID
	const isSubmitting = ref(false); // 防止重复提交

	const targetUserId = ref(null); // 被评分人 (Target)
	const currentUserId = ref(null); // 评分人 (Me)
	const isSelf = ref(false);

	/**
	 * 页面加载时，获取用户ID并拉取已有评分
	 */
	onLoad((options) => {
		currentUserId.value = uni.getStorageSync('userId');

		// id 传的是被评分人的 ID
		if (options.id) {
			targetUserId.value = options.id;
		} else {
			// 没传默认给自己打分
			targetUserId.value = currentUserId.value;
		}

		// 判断是否是自己给自己打分
		isSelf.value = String(targetUserId.value) === String(currentUserId.value);

		uni.setNavigationBarTitle({
			title: isSelf.value ? '数字标签(自我评价)' : '商友评分'
		});
	});

	onMounted(() => {
		// 调用获取方法
		fetchScores();
	});

	// 定义 fetchScores 方法
	const fetchScores = async () => {
		uni.showLoading({
			title: '加载中...'
		});
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-scores/getInfo', {
				method: 'GET',
				data: {
					// 根据文档：userId 为被评分人
					userId: targetUserId.value
				}
			});

			if (!error && data) {
				scoreRecordId.value = data.id;
				// 回显分数
				Object.keys(scores.value).forEach(key => {
					if (data[key] !== undefined && data[key] !== null) {
						scores.value[key] = data[key];
					}
				});
			}
		} catch (e) {
			console.error(e);
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 提交评分的方法
	 */
	const submitScores = async () => {
		if (isSubmitting.value) return;

		const userInfo = uni.getStorageSync('userInfo');
		const userId = uni.getStorageSync('userId');

		if (!userId) {
			uni.showToast({
				title: '无法获取用户信息，请重新登录',
				icon: 'none'
			});
			return;
		}

		isSubmitting.value = true;
		uni.showLoading({
			title: '正在保存...'
		});

		const payload = {
			...scores.value,
			id: scoreRecordId.value, // 如果是首次评分，id为null
			scorerId: targetUserId.value, // 被评分人
			userId: currentUserId.value // 评分人 (自己)
		};

		// 【注意】请确保保存接口的地址是正确的
		const {
			data: newRecord,
			error
		} = await ScoreApi.saveOrUpdate(payload);

		uni.hideLoading();
		isSubmitting.value = false;

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

		// 接口文档未明确指出保存接口是否返回新的ID，如果返回，可以更新
		if (newRecord && newRecord.id) {
			scoreRecordId.value = newRecord.id;
		}

		setTimeout(() => {
			uni.navigateBack();
		}, 1500);
	};
</script>

<style scoped lang="scss">
	/* 样式无变化，保持原样 */
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

		/* 颜色分级样式 */
		&.level-6 {
			background-color: #FFF0E6;
			color: #FF6A00;
		}

		/* 杰出 - 深橙 */
		&.level-5 {
			background-color: #FFF7E6;
			color: #FF9C38;
		}

		/* 优秀 - 浅橙 */
		&.level-4 {
			background-color: #E8F5E9;
			color: #4CAF50;
		}

		/* 较好 - 绿 */
		&.level-3 {
			background-color: #E3F2FD;
			color: #2196F3;
		}

		/* 一般 - 蓝 */
		&.level-2 {
			background-color: #FFF3E0;
			color: #FF9800;
		}

		/* 较差 - 黄 */
		&.level-1 {
			background-color: #FBE9E7;
			color: #FF5722;
		}

		/* 极差 - 红 */
	}

	.section-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.section-header {
		padding-bottom: 20rpx;
		border-bottom: 1px solid #f0f0f0;
		margin-bottom: 20rpx;

		.section-title {
			font-size: 34rpx;
			font-weight: 600;
			color: #333;
		}
	}

	.score-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
	}

	.item-label {
		font-size: 30rpx;
		color: #555;
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
	
	.score-sections{
		margin-bottom: 80rpx;
	}
</style>