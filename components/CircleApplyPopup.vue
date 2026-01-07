<template>
	<uni-popup ref="popup" type="bottom" background-color="#f5f7fa" @change="onPopupChange">
		<view class="apply-popup-container">

			<!-- 1. 顶部 Header -->
			<view class="popup-header">
				<text class="title">新的圈友</text>
				<uni-icons type="closeempty" size="24" color="#999" @click="close"></uni-icons>
			</view>

			<!-- 2. Tab 切换 (修复点击逻辑) -->
			<view class="popup-tabs">
				<!-- Tab 0: 申请入我圈 (addInitiator=0) -->
				<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
					申请入我圈
					<!-- 红点逻辑：假设外部传入的 pendingCount 是总数，这里简单处理，或者你需要分开统计 -->
					<view class="badge-dot" v-if="pendingCount > 0 && currentTab !== 0"></view>
				</view>
				<!-- Tab 1: 邀请入TA圈 (addInitiator=1) -->
				<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
					邀请入TA圈
				</view>
			</view>

			<!-- 3. 列表区域 -->
			<scroll-view scroll-y class="apply-list" @scrolltolower="loadMore">
				<view v-if="list.length > 0">
					<view v-for="(item, index) in list" :key="item.id" class="apply-card">
						<view class="user-info">
							<image :src="item.avatar || '/static/images/default-avatar.png'" class="avatar"
								mode="aspectFill"></image>
							<view class="info-content">
								<view class="name-row">
									<text class="name">{{ item.realName || item.nickname }}</text>
									<text class="time">{{ formatTime(item.createTime) }}</text>
								</view>

								<!-- 公司/职位 -->
								<view class="desc">
									{{ item.companyName || '暂无公司' }}
									<text v-if="item.positionTitle"> | {{ item.positionTitle }}</text>
								</view>

								<!-- 共同点标签 -->
								<view class="common-tags">
									<text v-if="item.fellowTownspeopleFlag === 1" class="tag">同乡</text>
									<text v-if="item.peerFlag === 1" class="tag">同行</text>
									<text v-if="item.classmateFlag === 1" class="tag">同学</text>
								</view>

								<!-- 【新增】根据 Tab 显示不同的申请类型文案 -->
								<view class="apply-type-tip">
									{{ currentTab === 0 ? '申请加入您的圈子' : '邀请您加入TA的圈子' }}
								</view>
							</view>
						</view>

						<!-- 4. 操作区 (修复：两个Tab都需要操作) -->
						<view class="action-row">
							<!-- 无论哪个 Tab，都是待处理状态，都需要同意/拒绝 -->
							<button class="btn reject" @click="handleAudit(item, false)">拒绝</button>
							<button class="btn agree" @click="handleAudit(item, true)">同意</button>
						</view>
					</view>

					<uni-load-more :status="loadingStatus"
						v-if="list.length >= 10 || loadingStatus === 'loading'"></uni-load-more>
				</view>

				<!-- 空状态 -->
				<view v-else-if="!loading" class="empty-tip">
					<uni-icons type="email" size="40" color="#ddd"></uni-icons>
					<view class="empty-text">暂无{{ currentTab === 0 ? '入圈申请' : '入圈邀请' }}</view>
				</view>
			</scroll-view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import request from '@/utils/request.js';

	const popup = ref(null);
	const list = ref([]);
	const currentTab = ref(0); // 默认 Tab 0 (申请入我圈)
	const pageNo = ref(1);
	const pageSize = 10;
	const loadingStatus = ref('more');
	const loading = ref(false);
	const pendingCount = ref(0);

	const emit = defineEmits(['refresh']);

	// 打开弹窗
	const open = (newApplyList, totalCount = 0) => {
		// 默认显示 Tab 0 (申请入我圈)，这是最常见的场景
		currentTab.value = 0;
		pendingCount.value = totalCount;

		// 这里的逻辑需要注意：
		// 如果 newApplyList 是从外部传进来的，要确认它是属于 Tab 0 的数据还是 Tab 1 的数据？
		// 既然有了 Tab 切换，建议打开时重新加载当前 Tab 的数据，保证准确性。
		loadData(true);

		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	// 切换 Tab
	const switchTab = (tabIndex) => {
		if (currentTab.value === tabIndex) return;
		currentTab.value = tabIndex;
		loadData(true);
	};

	// 加载数据
	const loadData = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading') return;

		if (isRefresh) {
			pageNo.value = 1;
			list.value = [];
			loadingStatus.value = 'loading';
			loading.value = true;
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/friend/list', {
				method: 'GET',
				data: {
					pageNo: pageNo.value,
					pageSize: pageSize,
					status: 0, // 0 表示申请中
					addInitiator: currentTab.value // 0=TA申请入我圈, 1=TA邀请我入TA圈
				}
			});

			if (!error && data) {
				const newList = data.list || [];
				list.value = isRefresh ? newList : [...list.value, ...newList];

				if (list.value.length >= data.total) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;
				}
			} else {
				loadingStatus.value = 'noMore';
			}
		} catch (e) {
			console.error(e);
			loadingStatus.value = 'more';
		} finally {
			loading.value = false;
		}
	};

	const loadMore = () => {
		if (loadingStatus.value === 'more') {
			loadData(false);
		}
	};

	// 审批操作
	const handleAudit = async (item, isAgree) => {
		uni.showLoading({
			title: '处理中...'
		});
		try {
			const url = `/app-api/member/user/friend/review`;
			const payload = {
				id: item.fid, // 关系记录ID
				// status: isAgree
			};

			const {
				error
			} = await request(url, {
				method: 'POST',
				data: payload
			});

			if (!error) {
				uni.showToast({
					title: isAgree ? '已同意' : '已拒绝',
					icon: 'success'
				});

				// 移除列表项
				list.value = list.value.filter(i => i.id !== item.id);

				// 刷新
				if (list.value.length === 0 && pageNo.value > 1) {
					loadData(true);
				}

				// 通知外部刷新红点等
				emit('refresh');
			} else {
				uni.showToast({
					title: error || '操作失败',
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
	};

	const onPopupChange = (e) => {
		if (!e.show) {
			emit('refresh');
		}
	};

	const formatTime = (time) => {
		if (!time) return '';
		const date = new Date(time);
		return `${date.getMonth() + 1}-${date.getDate()}`;
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	/* 样式部分保持不变，或者根据需要微调 apply-type-tip 的样式 */
	.apply-type-tip {
		font-size: 22rpx;
		color: #999;
		margin-top: 8rpx;
		background-color: #f9f9f9;
		padding: 4rpx 10rpx;
		border-radius: 6rpx;
		display: inline-block;
	}

	/* ... 之前的 CSS ... */
	.apply-popup-container {
		height: 80vh;
		background-color: #f5f7fa;
		border-radius: 24rpx 24rpx 0 0;
		display: flex;
		flex-direction: column;
	}

	.popup-header {
		padding: 30rpx;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 24rpx 24rpx 0 0;
		border-bottom: 1rpx solid #eee;

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	/* Tab 样式 */
	.popup-tabs {
		display: flex;
		background-color: #fff;
		margin-bottom: 2rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 24rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;
			font-weight: 500;

			&.active {
				color: #FF6E00;
				font-weight: bold;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: #FF6E00;
					border-radius: 2rpx;
				}
			}

			.badge-dot {
				position: absolute;
				top: 20rpx;
				right: 60rpx;
				width: 12rpx;
				height: 12rpx;
				background-color: #ff4d4f;
				border-radius: 50%;
			}
		}
	}

	.apply-list {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;
		overflow-y: auto;
	}

	.apply-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
	}

	.user-info {
		display: flex;
		margin-bottom: 24rpx;
	}

	.avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		border: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.info-content {
		flex: 1;
		min-width: 0;
	}

	.name-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6rpx;
	}

	.name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.time {
		font-size: 22rpx;
		color: #999;
	}

	.desc {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 12rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.common-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.tag {
		font-size: 20rpx;
		color: #FF6E00;
		background-color: #fff0e6;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
	}

	.action-row {
		display: flex;
		justify-content: flex-end;
		/* 按钮靠右 */
		gap: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f9f9f9;
	}

	.btn {
		min-width: 140rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 26rpx;
		border-radius: 30rpx;
		margin: 0;
		padding: 0 20rpx;

		&::after {
			border: none;
		}
	}

	.reject {
		background-color: #f5f5f5;
		color: #666;
	}

	.agree {
		background: linear-gradient(135deg, #FF6E00, #FF8C00);
		color: #fff;
	}

	.status-text {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 26rpx;
		color: #999;
		padding: 10rpx 0;
	}

	.empty-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 150rpx;
		color: #ddd;

		.empty-text {
			margin-top: 20rpx;
			font-size: 26rpx;
			color: #999;
		}
	}
</style>