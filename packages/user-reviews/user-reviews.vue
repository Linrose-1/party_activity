<template>
	<view class="container">
		<!-- 1. 顶部 Tabs -->
		<view class="tabs">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
				赞踩
				<view class="active-line" v-if="currentTab === 0"></view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
				评分
				<view class="active-line" v-if="currentTab === 1"></view>
			</view>
		</view>

		<!-- 2. Tab 内容区 -->
		<view class="content-body">

			<!-- ================== Tab 1: 赞踩模块 ================== -->
			<view v-if="currentTab === 0">

				<!-- 提交反馈卡片 -->
				<view class="feedback-card">
					<view v-if="isSelf" class="self-placeholder"
						style="padding: 40rpx; text-align: center; color: #999;">
						<uni-icons type="info" size="30" color="#ccc"></uni-icons>
						<view style="margin-top: 20rpx; font-size: 28rpx;">不能对自己进行评价</view>
					</view>

					<block v-else>
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
								<text :style="{ color: reviewForm.isLike === 1 ? '#fff' : '#FF6A00' }">点赞</text>
							</view>
							<view class="action-btn dislike-btn" :class="{ active: reviewForm.isLike === 2 }"
								@click="selectLike(2)">
								<uni-icons type="hand-down-filled" size="24"
									:color="reviewForm.isLike === 2 ? '#fff' : '#666'"></uni-icons>
								<text :style="{ color: reviewForm.isLike === 2 ? '#fff' : '#666' }">点踩</text>
							</view>
						</view>

						<!-- 评价内容输入 -->
						<view class="input-area">
							<text class="input-label">评语（好评/改进）：</text>
							<textarea v-model="reviewForm.reviewContent" placeholder="例如：专业、靠谱、合作愉快... 或：经验不足、沟通不畅..."
								class="review-textarea" maxlength="200" />
						</view>

						<view class="submit-action-bar" style="display: flex; align-items: center; gap: 20rpx;">
							<button class="submit-review-btn" :disabled="isReviewSubmitting" @click="handleReviewSubmit"
								style="flex: 1;">
								{{ isReviewSubmitting ? '处理中...' : (isReviewEditMode ? '修改评价' : '提交评价') }}
							</button>

							<!-- 仅在编辑模式（已有评价）下显示垃圾桶 -->
							<view v-if="isReviewEditMode" class="delete-icon-box" @click="handleReviewDelete"
								style="padding: 10rpx; display: flex; align-items: center;">
								<uni-icons type="trash-filled" size="26" color="#dd524d"></uni-icons>
							</view>
						</view>
					</block>
				</view>

				<!-- 2.2 最近反馈列表 -->
				<view v-if="recentReviews.length > 0" class="recent-list-section">
					<view class="section-title">📝 最近评价</view>

					<view class="review-list">
						<view v-for="item in recentReviews" :key="item.id" class="review-item">
							<view class="review-icon">
								<uni-icons v-if="item.isLike === 1" type="hand-up-filled" size="18"
									color="#FF6A00"></uni-icons>
								<uni-icons v-else type="hand-down-filled" size="18" color="#999"></uni-icons>
							</view>
							<!-- 内容回显逻辑 -->
							<view class="review-content-text">
								{{ item.reviewContent || (item.isLike === 1 ? '点了个赞' : '踩了一下') }}
							</view>
							<view class="review-time">{{ formatTime(item.createTime) }}</view>
						</view>
					</view>

					<view class="view-all-btn" @click="goToAllReviews">
						查看全部 {{ totalReviews }} 条评价 →
					</view>
				</view>

			</view>

			<!-- ================== Tab 2: 评分模块 ================== -->
			<view v-if="currentTab === 1">

				<!--去评分入口 -->
				<view class="section-header-title">
					<view class="standard-title">
						<uni-icons type="compose" size="16" color="#FF8C00"></uni-icons>
						<text>商友评分</text>
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

				<UserScoreBoard :datasets="radarDatasets" />
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
	// import MyRadarChart from '@/components/MyRadarChart.vue';
	import UserScoreBoard from '@/components/UserScoreBoard.vue';

	// ==========================================
	// 1. API 定义区域
	// ==========================================

	const ReviewApi = {
		// 创建评论（赞/踩）
		create: (data) => request('/app-api/member/user-review/create', {
			method: 'POST',
			data
		}),
		// 获取评论分页
		getPage: (params) => request('/app-api/member/user-review/page', {
			method: 'GET',
			data: params
		}),
		// 更新评论
		update: (data) => request('/app-api/member/user-review/update', {
			method: 'PUT',
			data
		}),
		// 获取我的点评列表 (这里用于查"我发给某人"的)
		getMyList: (params) => request('/app-api/member/user-review/my-list', {
			method: 'GET',
			data: params
		}),
		// 删除接口
		delete: (id) => request(`/app-api/member/user-review/delete?id=${id}`, {
			method: 'DELETE'
		})
	};

	const ScoreApi = {
		// 获取综合统计或自我评价统计 (type: 0自评, 3综合)
		getStatistics: (userId, type) => request('/app-api/member/user-scores/complexStatistics', {
			method: 'GET',
			data: {
				userId,
				type
			}
		}),
		// 获取详细评分信息
		getInfo: (userId) => request('/app-api/member/user-scores/getInfo', {
			method: 'GET',
			data: {
				userId
			}
		}),
		// 保存评分
		save: (data) => request('/app-api/member/user-scores/saveOrUpdate', {
			method: 'POST',
			data
		})
	};

	// ==========================================
	// 2. 状态变量区域
	// ==========================================

	// --- 全局状态 ---
	const currentTab = ref(0);
	const targetUserId = ref(null); // 被操作人 ID
	const currentUserId = ref(null); // 当前登录人 ID
	const isSelf = ref(false);

	// --- Tab 1 (赞踩) 状态 ---
	const isReviewSubmitting = ref(false);
	const reviewForm = reactive({
		isLike: 1, // 1:点赞, 2:点踩
		reviewContent: ''
	});
	const recentReviews = ref([]);
	const totalReviews = ref(0);
	const reviewRecordId = ref(null); // 存储我给该用户的评价ID
	const isReviewEditMode = ref(false); // 标记是否处于编辑模式

	// --- Tab 2 (评分) 状态 ---
	const isSubmitting = ref(false);
	const scoreRecordId = ref(null);
	const radarDatasets = ref([]);
	// 评分数据模型 (用于历史数据回显或提交)
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

		isSelf.value = String(targetUserId.value) === String(currentUserId.value);
	});

	onMounted(() => {
		if (targetUserId.value) {
			// 初始化 Tab 1 数据
			fetchRecentReviews(); // 别人的评价
			fetchMyReviewToTarget(); // 我给他的评价
			// 初始化 Tab 2 数据
			fetchMyHistoryScore();
			fetchRadarStatistics();
		}
	});

	// ==========================================
	// 4. 方法逻辑区域
	// ==========================================

	// --- 通用方法 ---
	const switchTab = (index) => {
		currentTab.value = index;
	};

	const formatTime = (timeStr) => {
		if (!timeStr) return '';
		const date = new Date(timeStr);
		return `${date.getMonth() + 1}-${date.getDate()}`;
	};

	// --- Tab 1: 赞踩业务 ---

	// 获取我给目标用户的历史评价
	const fetchMyReviewToTarget = async () => {
		try {
			const {
				data,
				error
			} = await ReviewApi.getMyList({
				reviewedId: targetUserId.value,
				// 关键：后端 my-list 接口文档说支持 userId 筛选，
				// 且 isOwn=1 表示我发出的。为了精准，最好加上 userId=currentUserId
				// 或者 isOwn=1 (取决于后端实现，通常 my-list 默认就是查自己的)
				// 根据文档：isOwn: 0点评我的，1我点评的
				isOwn: 1,
				pageNo: 1,
				pageSize: 1
			});

			if (!error && data && data.list && data.list.length > 0) {
				// 找到了历史评价
				const myReview = data.list[0];

				// 回显数据
				reviewForm.isLike = myReview.isLike;
				reviewForm.reviewContent = myReview.reviewContent;
				reviewRecordId.value = myReview.id;

				isReviewEditMode.value = true; // 标记为编辑模式
				console.log('✅ 回显我的历史评价:', myReview);
			} else {
				// 没评过
				isReviewEditMode.value = false;
				reviewRecordId.value = null;
			}
		} catch (e) {
			console.error('获取我的评价失败', e);
		}
	};

	const selectLike = (val) => {
		reviewForm.isLike = val;
	};

	const handleReviewSubmit = async () => {
		if (!reviewForm.isLike) {
			uni.showToast({
				title: '请选择评价类型',
				icon: 'none'
			});
			return;
		}

		if (isReviewSubmitting.value) return; // 防抖
		isReviewSubmitting.value = true;

		try {
			let error;

			if (isReviewEditMode.value && reviewRecordId.value) {
				// === 更新逻辑 ===
				const payload = {
					id: reviewRecordId.value, // 必填
					userId: currentUserId.value,
					reviewedId: targetUserId.value,
					isLike: reviewForm.isLike,
					reviewContent: reviewForm.reviewContent,
					isAnonymous: 1, // 保持匿名
					starRating: 0
				};
				const res = await ReviewApi.update(payload);
				error = res.error;
			} else {
				// === 新增逻辑 ===
				const payload = {
					userId: currentUserId.value,
					reviewedId: targetUserId.value,
					isLike: reviewForm.isLike,
					reviewContent: reviewForm.reviewContent,
					isAnonymous: 1,
					starRating: 0
				};
				const res = await ReviewApi.create(payload);
				error = res.error;
			}

			if (!error) {
				uni.showToast({
					title: isReviewEditMode.value ? '修改成功' : '提交成功',
					icon: 'success'
				});

				// 提交成功后，重新拉取一下，确保 ID 和状态同步（特别是新增转修改的情况）
				await fetchMyReviewToTarget();

				// 刷新下方的最近列表（如果我的评价正好在前5条里）
				fetchRecentReviews();
			} else {
				const msg = typeof error === 'string' ? error : (error.msg || '操作失败');
				uni.showToast({
					title: msg,
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

	const fetchRecentReviews = async () => {
		try {
			const {
				data,
				error
			} = await ReviewApi.getPage({
				reviewedId: targetUserId.value,
				pageNo: 1,
				pageSize: 5
			});

			if (!error && data) {
				recentReviews.value = data.list || [];
				totalReviews.value = data.total || 0;
			}
		} catch (e) {
			console.error('获取最近反馈失败', e);
		}
	};

	/**
	 * 删除我的评价
	 */
	const handleReviewDelete = () => {
		if (!reviewRecordId.value) return;

		uni.showModal({
			title: '确认删除',
			content: '确定要删除您对该商友的评价吗？',
			confirmColor: '#FF8C00',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '删除中...'
					});
					try {
						const {
							error
						} = await ReviewApi.delete(reviewRecordId.value);
						if (!error) {
							uni.showToast({
								title: '已删除',
								icon: 'success'
							});

							// 重置表单状态
							reviewForm.isLike = 1;
							reviewForm.reviewContent = '';
							reviewRecordId.value = null;
							isReviewEditMode.value = false;

							// 刷新下方列表
							fetchRecentReviews();
						} else {
							uni.showToast({
								title: error.msg || '删除失败',
								icon: 'none'
							});
						}
					} catch (e) {
						uni.showToast({
							title: '网络异常',
							icon: 'none'
						});
					} finally {
						uni.hideLoading();
					}
				}
			}
		});
	};

	const goToAllReviews = () => {
		uni.navigateTo({
			url: `/packages/user-review-list/user-review-list?userId=${targetUserId.value}`
		});
	};

	// --- Tab 2: 评分业务 ---

	const goToRatePage = () => {
		uni.navigateTo({
			url: `/pages/my-edit-label/my-edit-label?id=${targetUserId.value}`
		});
	};

	// 获取并计算雷达图数据
	const fetchRadarStatistics = async () => {
		try {
			// 并发请求：0=自评，3=综合
			const [selfRes, friendRes, complexRes] = await Promise.all([
				ScoreApi.getStatistics(targetUserId.value, 0),
				ScoreApi.getStatistics(targetUserId.value, 1),
				ScoreApi.getStatistics(targetUserId.value, 3)
			]);

			const newDatasets = [];

			// 组装自我评价数据
			if (!selfRes.error && selfRes.data) {
				newDatasets.push({
					name: '自我评价',
					data: [
						selfRes.data.avg1 || 0,
						selfRes.data.avg2 || 0,
						selfRes.data.avg3 || 0,
						selfRes.data.avg4 || 0
					],
					color: '#FF7D00'
				});
			}

			if (!friendRes.error && friendRes.data) {
				newDatasets.push({
					name: '商友评价',
					data: [
						friendRes.data.avg1 || 0,
						friendRes.data.avg2 || 0,
						friendRes.data.avg3 || 0,
						friendRes.data.avg4 || 0
					],
					color: '#4CAF50'
				});
			}

			// 组装综合评价数据
			if (!complexRes.error && complexRes.data) {
				newDatasets.push({
					name: '综合评价',
					data: [
						complexRes.data.avg1 || 0,
						complexRes.data.avg2 || 0,
						complexRes.data.avg3 || 0,
						complexRes.data.avg4 || 0
					],
					color: '#1890FF'
				});
			}

			radarDatasets.value = newDatasets;
		} catch (e) {
			console.error('获取统计数据失败', e);
		}
	};

	// 获取历史评分 (用于回显逻辑)
	const fetchMyHistoryScore = async () => {
		try {
			const {
				data,
				error
			} = await ScoreApi.getInfo(targetUserId.value);

			if (!error && data) {
				console.log('✅ 获取到历史评分:', data);
				if (data.id) scoreRecordId.value = data.id;

				Object.keys(scores.value).forEach(key => {
					if (data[key] !== undefined && data[key] !== null) {
						scores.value[key] = data[key];
					}
				});
			}
		} catch (e) {
			console.error('获取历史评分异常:', e);
		}
	};

	// 辅助: 获取雷达图表格数值
	const getScoreValue = (datasetIndex, dimIndex) => {
		const ds = radarDatasets.value[datasetIndex];
		if (ds && ds.data) {
			const val = ds.data[dimIndex];
			return val !== undefined ? val : '-';
		}
		return '-';
	};

	/**
	 * 提交评分
	 * 注意：当前页面模板主要用于展示，通过 goToRatePage 跳转评分。
	 * 保留此方法以兼容潜在的逻辑调用。
	 */
	const submitScores = async () => {
		if (isSubmitting.value) return;

		isSubmitting.value = true;
		uni.showLoading({
			title: '提交中...'
		});

		const payload = {
			...scores.value,
			id: scoreRecordId.value,
			scorerId: targetUserId.value, // 被评分人
			userId: currentUserId.value // 评分人
		};

		try {
			const {
				data,
				error
			} = await ScoreApi.save(payload);

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
	/* 保持原有样式，仅优化格式 */
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
	}

	/* Tabs */
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

	/* Feedback Card */
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

	/* Recent List */
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

	/* Tab 2 Styles */
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

	/* Radar Chart */
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

			&.total {
				color: #1890FF;
			}
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
		margin: 30rpx auto;

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