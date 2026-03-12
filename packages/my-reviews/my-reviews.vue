<template>
	<view class="container">
		<!-- 1. 顶部 Tabs -->
		<view class="tabs">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
				我收到的点评
				<view class="active-line" v-if="currentTab === 0"></view>
			</view>

			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
				我发出的点评
				<view class="active-line" v-if="currentTab === 1"></view>
			</view>

		</view>

		<!-- 2. 内容列表 -->
		<view class="list-container">

			<view v-if="currentTab === 0" class="stats-header">
				<text class="stats-title">共收到 {{ total }} 条评价</text>
				<view class="stats-tags">
					<!-- 改为筛选按钮，点击切换 active 状态 -->
					<view class="tag like" :class="{ active: filterLike === 1 }" @click="toggleFilter(1)">
						👍 好评
					</view>
					<view class="tag dislike" :class="{ active: filterLike === 2 }" @click="toggleFilter(2)">
						👎 改进
					</view>
				</view>
			</view>

			<!-- 列表 -->
			<view class="review-card" v-for="item in reviewList" :key="item.id">
				<!-- 卡片头部：用户信息 -->
				<view class="card-header">
					<!-- 头像逻辑：收到且匿名显示默认，否则显示真实头像 -->
					<image :src="getAvatar(item)" class="avatar" mode="aspectFill" />
					<view class="user-info">
						<view class="name-row">
							<text class="name">{{ getName(item) }}</text>
							<text class="role" v-if="getRole(item)">· {{ getRole(item) }}</text>
						</view>
						<view class="meta-row">
							<view class="type-tag" :class="item.isLike === 1 ? 'like' : 'dislike'">
								{{ item.isLike === 1 ? '👍 正面评价' : '👎 改进建议' }}
							</view>
							<text class="time">{{ formatTime(item.createTime) }}</text>
							<text class="anon-label" v-if="item.isAnonymous === 1 && currentTab === 0">· 匿名</text>
						</view>
					</view>
				</view>

				<!-- 内容 -->
				<view class="card-content">
					<text>{{ item.reviewContent }}</text>
				</view>

				<!-- 操作栏 (仅“我发出的”显示) -->
				<view class="card-actions" v-if="currentTab === 1">
					<view class="action-btn edit" @click="openEdit(item)">
						<uni-icons type="compose" size="16" color="#666"></uni-icons> 编辑此条点评
					</view>
					<view class="action-btn delete" @click="handleDelete(item)">
						<uni-icons type="trash" size="16" color="#999"></uni-icons> 删除
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more :status="loadingStatus" v-if="reviewList.length > 0 || loadingStatus === 'loading'">
			</uni-load-more>

			<!-- 空状态 -->
			<view v-if="reviewList.length === 0 && loadingStatus === 'noMore'" class="empty-state">
				<uni-icons type="chatboxes" size="60" color="#e0e0e0"></uni-icons>
				<text>暂无相关点评</text>
			</view>
		</view>

		<!-- 编辑弹窗 -->
		<EditReviewPopup ref="editPopup" :review-data="currentEditItem" @save="onSaveReview" />
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import EditReviewPopup from '@/components/EditReviewPopup.vue';

	// ==========================================
	// 1. API 定义区域
	// ==========================================
	const ReviewApi = {
		/** 获取我的点评列表 (发出的/收到的) */
		getMyList: (params) => request('/app-api/member/user-review/my-list', {
			method: 'GET',
			data: params
		}),
		/** 更新点评内容 */
		update: (data) => request('/app-api/member/user-review/update', {
			method: 'PUT',
			data: data
		}),
		/** 删除点评 (注意：ID拼接在URL上) */
		delete: (id) => request(`/app-api/member/user-review/delete?id=${id}`, {
			method: 'DELETE'
		})
	};

	// ==========================================
	// 2. 状态变量区域
	// ==========================================

	// 视图状态
	const currentTab = ref(0); // 1=我发出的, 0=我收到的
	const loadingStatus = ref('more'); // more, loading, noMore
	const filterLike = ref(null); // 筛选状态 (null=全部, 1=好评, 2=差评)

	// 数据状态
	const reviewList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);

	// 统计数据 (Mock)
	// const stats = ref({
	// 	likes: 0,
	// 	dislikes: 0
	// });

	// 编辑相关
	const editPopup = ref(null);
	const currentEditItem = ref({});

	// ==========================================
	// 3. 生命周期区域
	// ==========================================

	onMounted(() => {
		fetchList(true);
	});

	onPullDownRefresh(() => {
		fetchList(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			fetchList();
		}
	});

	// ==========================================
	// 4. 方法逻辑区域
	// ==========================================

	// --- 页面交互 ---
	const switchTab = (tab) => {
		if (currentTab.value === tab) return;
		currentTab.value = tab;
		filterLike.value = null;
		fetchList(true);
	};

	// 点击筛选
	const toggleFilter = (val) => {
		if (filterLike.value === val) {
			filterLike.value = null; // 取消筛选，查全部
		} else {
			filterLike.value = val;
		}
		fetchList(true); // 刷新列表
	};

	// --- 数据获取 ---
	const fetchList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'more';
		}
		loadingStatus.value = 'loading';

		try {
			const params = {
				isOwn: currentTab.value,
				pageNo: pageNo.value,
				pageSize: pageSize.value
			};

			// 如果有筛选，带上参数
			if (filterLike.value) {
				params.isLike = filterLike.value;
			}

			const {
				data,
				error
			} = await ReviewApi.getMyList(params);

			if (!error && data) {
				const list = data.list || [];
				reviewList.value = isRefresh ? list : [...reviewList.value, ...list];
				total.value = data.total;

				if (reviewList.value.length >= total.value) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;
				}

				// Mock 统计逻辑 (仅演示)
				// if (isRefresh && currentTab.value === 0) {
				// 	stats.value.likes = reviewList.value.filter(i => i.isLike === 1).length;
				// 	stats.value.dislikes = reviewList.value.filter(i => i.isLike === 2).length;
				// }
			} else {
				loadingStatus.value = 'noMore';
			}
		} catch (e) {
			loadingStatus.value = 'more';
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	// --- 辅助显示函数 (头像/名称/角色/时间) ---

	const getAvatar = (item) => {
		// Tab 0 (我收到的): 强制匿名
		if (currentTab.value === 0) {
			return '/static/icon/default-avatar.png';
		}
		// Tab 1 (我发出的): 显示真实头像
		return item.memberUser?.avatar || '/static/icon/default-avatar.png';
	};

	const getName = (item) => {
		// Tab 0 (我收到的): 强制显示匿名
		if (currentTab.value === 0) {
			return '匿名用户';
		}
		// Tab 1 (我发出的): 显示真实昵称
		return item.memberUser?.nickname || '未知用户';
	};

	const getRole = (item) => {
		if (currentTab.value === 0) return '';
		return item.memberUser?.levelName || '';
	};

	const formatTime = (str) => {
		if (!str) return '';
		const d = new Date(str);
		return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
	};

	// --- 编辑操作 ---

	const openEdit = (item) => {
		currentEditItem.value = {
			...item,
			targetName: getName(item)
		};
		editPopup.value.open();
	};

	const onSaveReview = async (formData, done) => {
		try {
			const {
				error
			} = await ReviewApi.update(formData);

			if (!error) {
				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
				// 更新本地列表数据，避免重新刷新
				const index = reviewList.value.findIndex(i => i.id === formData.id);
				if (index !== -1) {
					reviewList.value[index].reviewContent = formData.reviewContent;
					reviewList.value[index].isLike = formData.isLike;
				}
				done(); // 关闭弹窗
			} else {
				uni.showToast({
					title: error.msg || '修改失败',
					icon: 'none'
				});
				done();
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
			done();
		}
	};

	// --- 删除操作 ---

	const handleDelete = (item) => {
		uni.showModal({
			title: '确认删除',
			content: '删除后无法恢复，确定要删除这条点评吗？',
			confirmColor: '#FF8500',
			success: async (res) => {
				if (res.confirm) {
					// 核心处理：ID 拼接到 URL
					const {
						error
					} = await ReviewApi.delete(item.id);

					if (!error) {
						uni.showToast({
							title: '已删除',
							icon: 'success'
						});
						// 移除本地项
						reviewList.value = reviewList.value.filter(i => i.id !== item.id);
					} else {
						const msg = typeof error === 'string' ? error : (error.msg || '删除失败');
						uni.showToast({
							title: msg,
							icon: 'none'
						});
					}
				}
			}
		});
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF8500;

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
		height: 100rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
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
				color: $theme-color;
				font-weight: bold;
				font-size: 32rpx;
			}

			.active-line {
				position: absolute;
				bottom: 0;
				width: 60rpx;
				height: 6rpx;
				background-color: $theme-color;
				border-radius: 6rpx;
			}
		}
	}

	.list-container {
		padding: 30rpx;
		flex: 1;
	}

	/* 统计头 */
	.stats-header {
		background-color: #fff;
		padding: 24rpx;
		border-radius: 20rpx;
		margin-bottom: 24rpx;

		.stats-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 16rpx;
		}

		.stats-tags {
			display: flex;
			gap: 20rpx;

			.tag {
				font-size: 24rpx;
				padding: 8rpx 20rpx;
				/* 稍微加大点击区域 */
				border-radius: 8rpx;
				transition: all 0.2s;
				border: 2rpx solid transparent; // 预留边框位置

				&.like {
					background-color: #FFF0E6;
					color: $theme-color;

					&.active {
						border-color: $theme-color; // 选中加边框
						font-weight: bold;
					}
				}

				&.dislike {
					background-color: #f5f5f5;
					color: #666;

					&.active {
						border-color: #999;
						background-color: #e0e0e0;
						font-weight: bold;
					}
				}
			}
		}
	}

	/* 列表卡片 */
	.review-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.02);
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
			background-color: #eee;
		}

		.user-info {
			flex: 1;

			.name-row {
				display: flex;
				align-items: center;
				margin-bottom: 6rpx;

				.name {
					font-size: 30rpx;
					font-weight: bold;
					color: #333;
				}

				.role {
					font-size: 24rpx;
					color: #999;
					margin-left: 10rpx;
				}
			}

			.meta-row {
				display: flex;
				align-items: center;
				font-size: 22rpx;

				.type-tag {
					font-weight: bold;
					margin-right: 16rpx;

					&.like {
						color: $theme-color;
					}

					&.dislike {
						color: #666;
					}
				}

				.time {
					color: #ccc;
				}

				.anon-label {
					color: #999;
					margin-left: 8rpx;
				}
			}
		}
	}

	.card-content {
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		margin-bottom: 24rpx;
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
		gap: 30rpx;
		border-top: 1rpx solid #f9f9f9;
		padding-top: 20rpx;

		.action-btn {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			gap: 6rpx;

			&.edit {
				color: $theme-color;
			}

			&.delete {
				color: #999;
			}
		}
	}

	.empty-state {
		padding: 100rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #ccc;
		gap: 20rpx;
	}
</style>