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

			<!-- Tab 1: 赞踩 -->
			<view v-if="currentTab === 0">

				<!-- 2.1 提交反馈区 -->
				<view class="feedback-card">
					<view class="card-header">
						<text class="title">为商友提供反馈</text>
						<text class="subtitle">（您的评价将完全匿名，帮助TA变得更好）</text>
					</view>

					<!-- 赞踩按钮组 -->
					<view class="action-buttons">
						<view class="action-btn like-btn" :class="{ active: reviewForm.isLike === 1 }"
							@click="selectLike(1)">
							<uni-icons type="hand-up-filled" size="24"
								:color="reviewForm.isLike === 1 ? '#fff' : '#FF6A00'"></uni-icons>
							<text :style="{ color: reviewForm.isLike === 1 ? '#fff' : '#FF6A00' }">好评/点赞</text>
						</view>
						<view class="action-btn dislike-btn" :class="{ active: reviewForm.isLike === 2 }"
							@click="selectLike(2)">
							<uni-icons type="hand-down-filled" size="24"
								:color="reviewForm.isLike === 2 ? '#fff' : '#666'"></uni-icons>
							<text :style="{ color: reviewForm.isLike === 2 ? '#fff' : '#666' }">改进/点踩</text>
						</view>
					</view>

					<!-- 评价内容输入 -->
					<view class="input-area">
						<text class="input-label">反馈原因（选填）：</text>
						<textarea v-model="reviewForm.reviewContent" placeholder="例如：专业、靠谱、合作愉快... 或：经验不足、沟通不畅..."
							class="review-textarea" maxlength="200" />
					</view>

					<button class="submit-review-btn" :disabled="isReviewSubmitting" @click="submitReview">
						{{ isReviewSubmitting ? '提交中...' : '提交反馈' }}
					</button>
				</view>

				<!-- 2.2 最近反馈列表 -->
				<view v-if="recentReviews.length > 0" class="recent-list-section">
					<view class="section-title">📝 最近反馈</view>

					<view class="review-list">
						<view v-for="item in recentReviews" :key="item.id" class="review-item">
							<view class="review-icon">
								<uni-icons v-if="item.isLike === 1" type="hand-up-filled" size="18"
									color="#FF6A00"></uni-icons>
								<uni-icons v-else type="hand-down-filled" size="18" color="#999"></uni-icons>
							</view>
							<!-- 如果内容为空，给一个默认文案 -->
							<view class="review-content-text">
								{{ item.reviewContent || (item.isLike === 1 ? '点了个赞' : '踩了一下') }}
							</view>
							<view class="review-time">{{ formatTime(item.createTime) }}</view>
						</view>
					</view>

					<view class="view-all-btn" @click="goToAllReviews">
						查看全部 {{ totalReviews }} 条反馈 →
					</view>
				</view>

			</view>

			<!-- Tab 2: 评分 -->
			<view v-if="currentTab === 1">

				<!-- 2.0 雷达图统计 -->
				<view class="chart-section" v-if="radarDatasets.length > 0">
					<view class="standard-title" style="margin-bottom: 30rpx;">
						<uni-icons type="data-filled" size="16" color="#1890FF"></uni-icons>
						<text>用户评分统计</text>
					</view>

					<view class="chart-wrapper">
						<MyRadarChart :categories="['基础信用', '协作态度', '专业能力', '精神格局']" :datasets="radarDatasets" />
					</view>
					<!-- 图例说明 -->
					<view class="score-compare-table">
						<!-- 表头 -->
						<view class="table-row header-row">
							<view class="col dim">维度</view>
							<view class="col val self">自我</view>
							<view class="col val total">综合</view>
						</view>

						<!-- 数据行 -->
						<view class="table-row" v-for="(dim, index) in ['基础信用', '协作态度', '专业能力', '精神格局']" :key="index">
							<view class="col dim">{{ dim }}</view>
							<view class="col val self">{{ getScoreValue(0, index) }}</view>
							<view class="col val total">{{ getScoreValue(1, index) }}</view>
						</view>
					</view>
				</view>

				<!-- 2.1 评分标准 -->
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

				<view class="section-header-title">
					<view class="standard-title">
						<uni-icons type="compose" size="16" color="#FF8C00"></uni-icons>
						<text>用户评分</text>
					</view>
				</view>
				<view class="rate-entry-card" @click="goToRatePage">
					<view class="left-col">
						<view class="entry-title">去评分</view>
						<view class="entry-desc">从多个维度对商友进行评价</view>
					</view>
					<view class="right-col">
						<uni-icons type="right" size="20" color="#ccc"></uni-icons>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import ScoreForm from '@/components/ScoreForm.vue';
	import MyRadarChart from '@/components/MyRadarChart.vue';

	// --- 全局状态 ---
	const currentTab = ref(0); // 默认显示赞踩 Tab
	const targetUserId = ref(null); // 被评分/被点评人 ID
	const currentUserId = ref(null); // 当前登录用户 ID

	// --- Tab 1 (赞踩) 相关状态 ---
	const isReviewSubmitting = ref(false);
	const reviewForm = reactive({
		isLike: 1, // 1:点赞, 2:点踩
		reviewContent: ''
	});
	const recentReviews = ref([]);
	const totalReviews = ref(0);

	// --- Tab 2 (评分) 相关状态 ---
	const isSubmitting = ref(false);
	const scoreRecordId = ref(null);
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
	const radarDatasets = ref([]);

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

	onMounted(() => {
		// 1. 加载最近反馈 (Tab 1)
		if (targetUserId.value) {
			fetchRecentReviews();
			fetchMyHistoryScore();
			fetchRadarStatistics();
		}


	});

	// --- Tab 1 方法 ---

	// 选择赞/踩
	const selectLike = (val) => {
		reviewForm.isLike = val;
	};

	// 提交点评 (赞踩)
	const submitReview = async () => {
		if (!reviewForm.isLike) {
			uni.showToast({
				title: '请选择评价类型',
				icon: 'none'
			});
			return;
		}

		isReviewSubmitting.value = true;

		try {
			const payload = {
				userId: currentUserId.value, // 点评人
				reviewedId: targetUserId.value, // 被点评人
				isLike: reviewForm.isLike,
				reviewContent: reviewForm.reviewContent,
				isAnonymous: 1, // 强制匿名
				starRating: 0
			};

			const {
				error
			} = await request('/app-api/member/user-review/create', {
				method: 'POST',
				data: payload
			});

			if (!error) {
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				});
				// 重置表单
				reviewForm.reviewContent = '';
				// 刷新列表
				fetchRecentReviews();
			} else {
				const errorMsg = typeof error === 'string' ? error : (error.msg || '提交失败');
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			isReviewSubmitting.value = false;
		}
	};

	// 获取最近反馈 (分页取前5条)
	const fetchRecentReviews = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-review/page', {
				method: 'GET',
				data: {
					reviewedId: targetUserId.value,
					pageNo: 1,
					pageSize: 5
				}
			});

			if (!error && data) {
				recentReviews.value = data.list || [];
				totalReviews.value = data.total || 0;
			}
		} catch (e) {
			console.error('获取最近反馈失败', e);
		}
	};

	// 跳转全部列表
	const goToAllReviews = () => {
		uni.navigateTo({
			url: `/packages/user-review-list/user-review-list?userId=${targetUserId.value}`
		});
	};

	// 工具: 时间格式化
	const formatTime = (timeStr) => {
		if (!timeStr) return '';
		const date = new Date(timeStr);
		// 简单的月-日格式，如 1-15
		return `${date.getMonth() + 1}-${date.getDate()}`;
	};

	// --- Tab 2 方法 ---
	const goToRatePage = () => {
		uni.navigateTo({
			url: `/pages/my-edit-label/my-edit-label?id=${targetUserId.value}`
		});
	};

	// 获取雷达图统计数据
	const fetchRadarStatistics = async () => {
		try {
			// 并发请求 type=0 (自评) 和 type=3 (综合)
			const [selfRes, complexRes] = await Promise.all([
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId: targetUserId.value,
						type: 0
					}
				}),
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId: targetUserId.value,
						type: 3
					}
				})
			]);

			const newDatasets = [];

			// 处理自我评价
			if (!selfRes.error && selfRes.data) {
				newDatasets.push({
					name: '自我评价',
					data: [
						selfRes.data.avg1 || 0,
						selfRes.data.avg2 || 0,
						selfRes.data.avg3 || 0,
						selfRes.data.avg4 || 0
					],
					color: '#FF7D00' // 橙色
				});
			}

			// 处理综合评价
			if (!complexRes.error && complexRes.data) {
				newDatasets.push({
					name: '综合评价',
					data: [
						complexRes.data.avg1 || 0,
						complexRes.data.avg2 || 0,
						complexRes.data.avg3 || 0,
						complexRes.data.avg4 || 0
					],
					color: '#1890FF' // 蓝色
				});
			}

			radarDatasets.value = newDatasets;

		} catch (e) {
			console.error('获取统计数据失败', e);
		}
	};

	// 获取指定数据集(datasetIndex)的指定维度(dimIndex)分数
	const getScoreValue = (datasetIndex, dimIndex) => {
		if (radarDatasets.value[datasetIndex] &&
			radarDatasets.value[datasetIndex].data) {
			const val = radarDatasets.value[datasetIndex].data[dimIndex];
			return val !== undefined ? val : '-';
		}
		return '-';
	};

	// 获取我给对方的历史评分
	const fetchMyHistoryScore = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-scores/getInfo', {
				method: 'GET',
				data: {
					userId: targetUserId.value // 只需传被评分人的 ID
				}
			});

			if (!error && data) {
				console.log('✅ 获取到历史评分:', data);

				// 1. 保存记录 ID (用于提交时 update)
				if (data.id) {
					scoreRecordId.value = data.id;
				}

				// 2. 回显分数到 scores 对象
				// 遍历 scores 的 key，如果 data 中有对应值且不为 null，则赋值
				Object.keys(scores.value).forEach(key => {
					// 注意：后端可能返回 0 或者 null，我们要显示出来
					if (data[key] !== undefined && data[key] !== null) {
						scores.value[key] = data[key];
					}
				});
			}
		} catch (e) {
			console.error('获取历史评分异常:', e);
		}
	};

	// 提交评分 (多维度打分)
	const submitScores = async () => {
		if (isSubmitting.value) return;

		isSubmitting.value = true;
		uni.showLoading({
			title: '提交中...'
		});

		const payload = {
			...scores.value,
			id: scoreRecordId.value,
			// 注意参数名: scorerId 是被评分人(target), userId 是评分人(me)
			// (根据之前沟通的接口定义修正)
			scorerId: targetUserId.value,
			userId: currentUserId.value
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
				// 评分成功后可能不需要刷新页面，直接返回或停留在当前页
				// setTimeout(() => { uni.navigateBack(); }, 1500);
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

	/* Tab 1: 反馈卡片 */
	.feedback-card {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		margin-bottom: 30rpx;
	}

	.card-header {
		text-align: center;
		margin-bottom: 30rpx;

		.title {
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 8rpx;
		}

		.subtitle {
			font-size: 24rpx;
			color: #999;
		}
	}

	.action-buttons {
		display: flex;
		gap: 30rpx;
		margin-bottom: 30rpx;

		.action-btn {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 20rpx;
			border-radius: 16rpx;
			background: #f9f9f9;
			border: 2rpx solid transparent;
			transition: all 0.2s;

			uni-icons {
				margin-bottom: 10rpx;
			}

			text {
				font-size: 28rpx;
				font-weight: 500;
			}

			&.like-btn.active {
				background-color: #FF6A00;
				border-color: #FF6A00;
			}

			&.dislike-btn.active {
				background-color: #666;
				border-color: #666;
			}
		}
	}

	.input-area {
		margin-bottom: 30rpx;

		.input-label {
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 16rpx;
			display: block;
		}

		.review-textarea {
			width: 100%;
			height: 160rpx;
			background: #f5f5f5;
			border-radius: 12rpx;
			padding: 20rpx;
			box-sizing: border-box;
			font-size: 28rpx;
		}
	}

	.submit-review-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: #fff;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: bold;
		border: none;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.7;
		}
	}

	/* Tab 1: 最近反馈列表 */
	.recent-list-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-left: 10rpx;
		border-left: 8rpx solid #FF8C00;
	}

	.review-item {
		display: flex;
		align-items: flex-start;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.review-icon {
			margin-right: 16rpx;
			margin-top: 4rpx;
		}

		.review-content-text {
			flex: 1;
			font-size: 28rpx;
			color: #333;
			line-height: 1.5;
		}

		.review-time {
			font-size: 24rpx;
			color: #999;
			margin-left: 20rpx;
			white-space: nowrap;
		}
	}

	.view-all-btn {
		text-align: center;
		color: #FF8C00;
		font-size: 28rpx;
		padding-top: 30rpx;
		font-weight: 500;
	}

	/* Tab 2: 评分相关样式 */
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

	/* 雷达图区域 */
	.chart-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.chart-wrapper {
		width: 100%;
		height: 500rpx;
		/* 高度自定 */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.score-compare-table {
		margin-top: 30rpx;
		border: 1rpx solid #eee;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.table-row {
		display: flex;
		border-bottom: 1rpx solid #eee;

		&:last-child {
			border-bottom: none;
		}

		&.header-row {
			background-color: #f9f9f9;
			font-weight: bold;
			color: #333;
		}

		.col {
			flex: 1;
			padding: 16rpx 0;
			text-align: center;
			font-size: 24rpx;

			&.dim {
				flex: 1.5;
				color: #333;
				text-align: left;
				padding-left: 30rpx;
			}

			&.self {
				color: #FF7D00;
			}

			/* 橙色对应自我 */
			&.total {
				color: #1890FF;
			}

			/* 蓝色对应综合 */
		}
	}

	.rate-entry-card {
		background: #FF720E;
		padding: 40rpx 30rpx;
		border-radius: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		margin-top: 30rpx;

		&:active {
			background-color: #fafafa;
		}

		.entry-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #fff;
			margin-bottom: 8rpx;
		}

		.entry-desc {
			font-size: 24rpx;
			color: #d9d9d9;
		}
	}
</style>