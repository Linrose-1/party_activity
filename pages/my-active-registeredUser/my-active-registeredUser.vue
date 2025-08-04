<template>
	<view class="page-container">
		<!-- 活动信息头部卡片 -->
		<view v-if="activityInfo" class="activity-header-card">
			<view class="header-title-row">
				<uni-icons type="flag-filled" size="20" color="#FF7900"></uni-icons>
				<text class="header-title">{{ activityInfo.activityTitle }}</text>
			</view>
			<view class="header-info-row">
				<uni-icons type="calendar" size="16" color="#909399"></uni-icons>
				<text class="info-text">{{ formatTime(activityInfo.startDatetime) }}</text>
			</view>
			<view class="header-info-row">
				<uni-icons type="map-pin" size="16" color="#909399"></uni-icons>
				<text class="info-text">{{ activityInfo.locationAddress || '线上活动' }}</text>
			</view>
		</view>

		<!-- 用户列表 -->
		<scroll-view scroll-y class="user-list-scroll" refresher-enabled :refresher-triggered="refreshing"
			@refresherrefresh="onRefresh" @scrolltolower="onReachBottom">

			<view v-if="userList.length > 0" class="user-list">
				<view v-for="item in userList" :key="item.id" class="user-card">
					<!-- 卡片头部: 用户信息和状态 -->
					<view class="card-header">
						<image class="avatar" :src="item.memberUser.avatar || '/static/default-avatar.png'"
							mode="aspectFill"></image>
						<view class="user-info">
							<text class="nickname">{{ item.memberUser.nickname || '匿名用户' }}</text>
							<text class="time">报名于: {{ formatTime(item.registeredAt) }}</text>
						</view>
						<view :class="['status-tag', getStatusClass(item.paymentStatusStr)]">
							{{ item.paymentStatusStr }}
						</view>
					</view>

					<!-- 卡片中部: 付款凭证 -->
					<view v-if="item.paymentScreenshotUrl" class="payment-proof">
						<text class="proof-label">付款凭证:</text>
						<image class="proof-image" :src="item.paymentScreenshotUrl" mode="aspectFit"
							@click="previewImage(item.paymentScreenshotUrl)"></image>
					</view>
					<view v-else class="payment-proof-empty">
						<text>暂未上传付款凭证</text>
					</view>
					
					<!-- 【新增】驳回原因显示 -->
					<view v-if="item.rejectMsg" class="rejection-reason">
						<uni-icons type="info-filled" size="16" color="#f56c6c"></uni-icons>
						<text class="reason-label">驳回原因:</text>
						<text class="reason-text">{{ item.rejectMsg }}</text>
					</view>

					<!-- 卡片底部: 操作按钮 -->
					<view v-if="item.paymentStatusStr === '待确定'" class="card-actions">
						<button class="btn btn-reject" @click.stop="handleReject(item)">驳回</button>
						<button class="btn btn-confirm" @click.stop="handleConfirm(item)">确认收款</button>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state">
				<uni-icons type="staff-filled" size="60" color="#c8c9cc"></uni-icons>
				<text class="empty-text">还没有用户报名哦</text>
			</view>

			<!-- 加载更多 -->
			<view v-if="loading && userList.length > 0" class="loading-more">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			<view v-if="!hasMore && userList.length > 0" class="loading-more">
				<uni-load-more status="noMore"></uni-load-more>
			</view>

		</scroll-view>
	</view>
</template>

<script setup>
	// ... script 部分无任何变化 ...
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const activityInfo = ref(null);
	const userList = ref([]);
	const loading = ref(false);
	const refreshing = ref(false);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const hasMore = ref(true);

	onLoad((options) => {
		if (options.item) {
			try {
				const itemData = JSON.parse(decodeURIComponent(options.item));
				activityInfo.value = itemData;
				uni.setNavigationBarTitle({
					title: '报名用户管理'
				});
				handleRefresh();
			} catch (e) {
				console.error("解析活动信息失败", e);
				uni.showToast({
					title: '加载活动信息失败',
					icon: 'none'
				});
			}
		}
	});

	const getRegisteredUsers = async () => {
		if (loading.value) return;
		if (pageNo.value > 1 && !hasMore.value) {
			return;
		}
		loading.value = true;
		const params = {
			activityId: activityInfo.value.id,
			pageNo: pageNo.value,
			pageSize: pageSize.value,
		};
		const {
			data,
			error
		} = await request('/app-api/member/activity-join/list', {
			method: 'GET',
			data: params
		});
		loading.value = false;
		if (refreshing.value) {
			refreshing.value = false;
		}
		if (error) {
			uni.showToast({
				title: error || '加载失败',
				icon: 'none'
			});
			return;
		}
		if (data && data.list) {
			const newList = data.list;
			userList.value = pageNo.value === 1 ? newList : [...userList.value, ...newList];
			hasMore.value = userList.value.length < data.total;
			if (hasMore.value) {
				pageNo.value++;
			}
		}
	};

	const onRefresh = () => {
		if (refreshing.value) return;
		refreshing.value = true;
		handleRefresh();
	};

	const handleRefresh = () => {
		pageNo.value = 1;
		hasMore.value = true;
		userList.value = [];
		getRegisteredUsers();
	};

	const onReachBottom = () => {
		if (hasMore.value && !loading.value) {
			getRegisteredUsers();
		}
	};

	const handleConfirm = (item) => {
		uni.showModal({
			title: '确认收款',
			content: `确定要为用户“${item.memberUser.nickname}”确认报名吗？`,
			confirmColor: '#FF7900',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '正在提交...'
					});
					const {
						error
					} = await request('/app-api/member/activity-join/confirm-user-join', {
						method: 'POST',
						data: {
							id: item.id,
							activityId: item.activityId
						}
					});
					uni.hideLoading();
					if (error) {
						uni.showToast({
							title: error,
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: '确认成功',
							icon: 'success'
						});
						handleRefresh();
					}
				}
			}
		});
	};

	const handleReject = (item) => {
		uni.showModal({
			title: `即将驳回用户“${item.memberUser.nickname}”的报名申请。`,
			content: '',
			editable: true,
			placeholderText: '请输入驳回原因（必填）',
			confirmColor: '#FF7900',
			success: async (res) => {
				if (res.confirm) {
					if (!res.content || res.content.trim() === '') {
						uni.showToast({
							title: '驳回原因不能为空',
							icon: 'none'
						});
						return;
					}
					uni.showLoading({
						title: '正在提交...'
					});
					const {
						error
					} = await request('/app-api/member/activity-join/reject-user-join', {
						method: 'POST',
						data: {
							id: item.id,
							rejectMsg: res.content
						}
					});
					uni.hideLoading();
					if (error) {
						uni.showToast({
							title: error,
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: '驳回成功',
							icon: 'success'
						});
						handleRefresh();
					}
				}
			}
		});
	};

	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url],
			current: url
		});
	};

	const formatTime = (timestamp) => {
		if (!timestamp) return '时间待定';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	};

	const getStatusClass = (statusStr) => {
		const classMap = {
			'待确定': 'status-pending',
			'已支付': 'status-confirmed',
			'已驳回': 'status-rejected',
			'替补': 'status-substitute',
			'已退款': 'status-refunded',
		};
		return classMap[statusStr] || 'status-default';
	};
</script>

<style lang="scss" scoped>
	// ... .page-container 到 .payment-proof-empty 样式无变化 ...
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f7fa;
	}
	.activity-header-card {
		background-color: #fff;
		padding: 24rpx 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		.header-title-row {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			.header-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #303133;
				margin-left: 12rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}
		}
		.header-info-row {
			display: flex;
			align-items: center;
			font-size: 26rpx;
			color: #606266;
			&:not(:last-child) {
				margin-bottom: 12rpx;
			}
			.info-text {
				margin-left: 12rpx;
			}
		}
	}
	.user-list-scroll {
		flex: 1;
		height: 1px;
	}
	.user-list {
		padding: 0 24rpx 24rpx;
	}
	.user-card,
	.empty-state {
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	}
	.card-header {
		display: flex;
		align-items: center;
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}
	.avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #eee;
		flex-shrink: 0;
	}
	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.nickname {
		font-size: 30rpx;
		font-weight: 600;
		color: #303133;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.time {
		font-size: 24rpx;
		color: #909399;
		margin-top: 8rpx;
	}
	.status-tag {
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		white-space: nowrap;
		font-weight: 500;
		margin-left: 16rpx;
		&.status-pending {
			background-color: #fdf6ec;
			color: #FF7900;
		}
		&.status-confirmed {
			background-color: #f0f9eb;
			color: #67c23a;
		}
		&.status-rejected,
		&.status-refunded {
			background-color: #fef0f0;
			color: #f56c6c;
		}
		&.status-substitute,
		&.status-default {
			background-color: #f4f4f5;
			color: #909399;
		}
	}
	.payment-proof {
		padding: 24rpx 0;
		display: flex;
		align-items: flex-start;
		.proof-label {
			font-size: 28rpx;
			color: #606266;
			margin-right: 20rpx;
			line-height: 1.5;
		}
		.proof-image {
			width: 160rpx;
			height: 160rpx;
			border-radius: 12rpx;
			background-color: #f5f5f5;
			border: 1rpx solid #eee;
			transition: transform 0.2s;
			&:active {
				transform: scale(0.95);
			}
		}
	}
	.payment-proof-empty {
		padding: 40rpx 0;
		font-size: 28rpx;
		color: #909399;
		text-align: center;
	}

	/* 【新增】驳回原因样式 */
	.rejection-reason {
		display: flex;
		align-items: flex-start;
		background-color: #fef0f0;
		padding: 16rpx 20rpx;
		border-radius: 12rpx;
		margin-top: 10rpx;

		.reason-label {
			font-size: 26rpx;
			font-weight: 600;
			color: #f56c6c;
			margin: 0 10rpx;
			flex-shrink: 0; // 防止标签换行
		}

		.reason-text {
			font-size: 26rpx;
			color: #f56c6c;
			line-height: 1.5;
			flex: 1;
		}
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		padding-top: 20rpx;
		margin-top: 20rpx; // 调整与上方内容的间距
		border-top: 1rpx solid #f0f2f5;
	}
	.btn {
		margin: 0;
		padding: 0 32rpx;
		height: 64rpx;
		line-height: 64rpx;
		border-radius: 32rpx;
		font-size: 26rpx;
		font-weight: 500;
		border: 1px solid transparent;
		&::after {
			border: none;
		}
		&-reject {
			background-color: #fff;
			color: #f56c6c;
			border-color: #f56c6c;
		}
		&-confirm {
			background: linear-gradient(135deg, #FF9500, #FF7900);
			color: #fff;
			border: none;
		}
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		color: #909399;
		margin: 0 24rpx;
	}
	.empty-text {
		font-size: 28rpx;
		margin-top: 20rpx;
	}
	.loading-more {
		padding: 20rpx 0;
	}
</style>