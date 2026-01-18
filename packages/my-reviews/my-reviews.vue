<template>
	<view class="container">
		<!-- 1. 顶部 Tabs -->
		<view class="tabs">
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
				我发出的点评
				<view class="active-line" v-if="currentTab === 1"></view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
				我收到的点评
				<view class="active-line" v-if="currentTab === 0"></view>
			</view>
		</view>

		<!-- 2. 内容列表 -->
		<view class="list-container">

			<!-- 仅在“我收到的”Tab 显示统计 (Mock数据) -->
			<view v-if="currentTab === 0 && reviewList.length > 0" class="stats-header">
				<text class="stats-title">共收到 {{ total }} 条评价</text>
				<view class="stats-tags">
					<view class="tag like">👍 {{ stats.likes }} 条正面</view>
					<view class="tag dislike">👎 {{ stats.dislikes }} 条改进</view>
				</view>
			</view>

			<!-- 列表 -->
			<view class="review-card" v-for="item in reviewList" :key="item.id">
				<!-- 卡片头部：用户信息 -->
				<view class="card-header">
					<!-- 头像：如果是“我收到的”且匿名，显示匿名头像；否则显示真实头像 -->
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
			<uni-load-more :status="loadingStatus"
				v-if="reviewList.length > 0 || loadingStatus === 'loading'"></uni-load-more>

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

	// --- 状态 ---
	const currentTab = ref(1); // 1=我发出的, 0=我收到的
	const reviewList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadingStatus = ref('more');
	const stats = ref({
		likes: 0,
		dislikes: 0
	}); // 统计数据(Mock)

	// 编辑相关
	const editPopup = ref(null);
	const currentEditItem = ref({});

	// --- 生命周期 ---
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

	// --- 方法 ---

	const switchTab = (tab) => {
		if (currentTab.value === tab) return;
		currentTab.value = tab;
		fetchList(true);
	};

	const fetchList = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading' && !isRefresh) return;

		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'more';
		}
		loadingStatus.value = 'loading';

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-review/my-list', {
				method: 'GET',
				data: {
					isOwn: currentTab.value, // 1我发出的, 0我收到的
					pageNo: pageNo.value,
					pageSize: pageSize.value
				}
			});

			if (isRefresh) uni.stopPullDownRefresh();

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

				// 简单统计 (真实场景应由后端返回)
				if (isRefresh && currentTab.value === 0) {
					// 注意：这里只能统计已加载的，或者让后端加接口
					// 暂时 Mock 演示效果
					stats.value.likes = reviewList.value.filter(i => i.isLike === 1).length;
					stats.value.dislikes = reviewList.value.filter(i => i.isLike === 2).length;
				}
			} else {
				loadingStatus.value = 'noMore';
			}
		} catch (e) {
			loadingStatus.value = 'more';
			if (isRefresh) uni.stopPullDownRefresh();
		}
	};

	// 辅助：获取头像
	const getAvatar = (item) => {
		// 假设 UserReviewRespVO 包含 memberUserBaseVO
		// 如果是我收到的(Tab=0)且匿名(isAnonymous=1)，显示默认图
		if (currentTab.value === 0 && item.isAnonymous === 1) {
			return '/static/icon/default-avatar.png'; // 匿名头像
		}
		// 否则显示真实头像
		// 注意：my-list 接口对于"我发出的"，需要显示 reviewedUser 的头像
		// 对于 "我收到的"，显示 user 的头像
		// 需确认后端返回结构，这里假设 memberUserBaseVO 是对方的信息
		return item.memberUserBaseVO?.avatar || '/static/icon/default-avatar.png';
	};

	// 辅助：获取名字
	const getName = (item) => {
		if (currentTab.value === 0 && item.isAnonymous === 1) {
			return '匿名用户';
		}
		return item.memberUserBaseVO?.nickname || '未知用户';
	};

	// 辅助：获取职位/角色
	const getRole = (item) => {
		if (currentTab.value === 0 && item.isAnonymous === 1) return '';
		// 假设有 levelName 或 positionTitle
		return item.memberUserBaseVO?.levelName || '';
	};

	// 操作：打开编辑
	const openEdit = (item) => {
		// 构造传给弹窗的数据，确保包含对方名字用于展示
		currentEditItem.value = {
			...item,
			targetName: getName(item)
		};
		editPopup.value.open();
	};

	// 操作：保存编辑
	const onSaveReview = async (formData, done) => {
		try {
			const {
				error
			} = await request('/app-api/member/user-review/update', {
				method: 'PUT',
				data: formData
			});

			if (!error) {
				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
				// 更新本地列表
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

	// 操作：删除
	const handleDelete = (item) => {
		uni.showModal({
			title: '确认删除',
			content: '删除后无法恢复，确定要删除这条点评吗？',
			confirmColor: '#FF8500',
			success: async (res) => {
				if (res.confirm) {
					// 【核心修改】将 id 拼接到 URL 上，或者 data 设为 null/undefined
					// 如果 request.js 封装支持 data 为 query 参数（对于 DELETE/GET），则不用动。
					// 但通常 DELETE 请求在 uni.request 中 data 会被放到 body 里（这就变成了 JSON）。
					// 最稳妥的方式：直接拼接到 URL。

					const {
						error
					} = await request(`/app-api/member/user-review/delete?id=${item.id}`, {
						method: 'DELETE',
						// data: { id: item.id } // 移除这个
					});

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

	const formatTime = (str) => {
		if (!str) return '';
		const d = new Date(str);
		// 简单格式化：2024年1月15日 或 3天前 (这里用简单日期)
		return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
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
				padding: 6rpx 16rpx;
				border-radius: 8rpx;

				&.like {
					background-color: #FFF0E6;
					color: $theme-color;
				}

				&.dislike {
					background-color: #f5f5f5;
					color: #666;
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