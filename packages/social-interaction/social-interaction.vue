<template>
	<view class="container">
		<view class="menu-list">

			<!-- 1. 点评互动 -->
			<view class="menu-item" @click="navigateTo('reviews')">
				<view class="icon-box review">
					<uni-icons type="chatboxes-filled" size="24" color="#fff"></uni-icons>
				</view>
				<view class="content">
					<view class="title">点评互动</view>
					<view class="desc">查看与回复他人的点评</view>
				</view>
				<!-- 使用 reviewUnreadCount -->
				<view class="badge" v-if="unreadState.reviewUnreadCount > 0">
					{{ unreadState.reviewUnreadCount > 99 ? '99+' : unreadState.reviewUnreadCount }}
				</view>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>

			<!-- 2. 猎伙互动 -->
			<view class="menu-item" @click="navigateTo('hunter')">
				<view class="icon-box hunter">
					<uni-icons type="staff-filled" size="24" color="#fff"></uni-icons>
				</view>
				<view class="content">
					<view class="title">猎伙互动</view>
					<view class="desc">寻找合作伙伴或团队成员</view>
				</view>
				<!-- 使用 hunterInterestCount -->
				<view class="badge" v-if="unreadState.hunterInterestCount > 0">
					{{ unreadState.hunterInterestCount > 99 ? '99+' : unreadState.hunterInterestCount }}
				</view>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>

			<!-- 3. 商机互动 -->
			<view class="menu-item" @click="navigateTo('business')">
				<view class="icon-box business">
					<uni-icons type="shop-filled" size="24" color="#fff"></uni-icons>
				</view>
				<view class="content">
					<view class="title">商机互动</view>
					<view class="desc">查看商友与我发布商机的互动</view>
				</view>
				<!-- 使用 businessOpCommentCount (商机评论未读) -->
				<view class="badge" v-if="unreadState.businessOpCommentCount > 0">
					{{ unreadState.businessOpCommentCount > 99 ? '99+' : unreadState.businessOpCommentCount }}
				</view>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>

		</view>
	</view>
</template>

<script setup>
	import {
		onShow
	} from '@dcloudio/uni-app';
	import {
		checkLoginGuard
	} from '@/utils/user.js';
	// 引入全局未读状态
	import {
		unreadState,
		fetchGlobalUnread
	} from '@/utils/unread.js';

	onShow(() => {
		// 每次进入页面刷新一次未读数
		fetchGlobalUnread();
	});

	const navigateTo = async (type) => {
		if (!await checkLoginGuard()) return;

		switch (type) {
			case 'reviews':
				uni.navigateTo({
					url: '/packages/my-reviews/my-reviews'
				});
				break;
			case 'hunter':
				uni.navigateTo({
					url: '/packages/hunter-interaction/hunter-interaction'
				});
				break;
			case 'business':
				uni.navigateTo({
					url: '/packages/business-interaction/business-interaction'
				});
				break;
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding: 30rpx;
	}

	.menu-list {
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 36rpx 30rpx;
		border-bottom: 1rpx solid #f9f9f9;
		position: relative;

		&:active {
			background-color: #fafafa;
		}

		&:last-child {
			border-bottom: none;
		}
	}

	.icon-box {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;

		&.review {
			background: linear-gradient(135deg, #FF9A9E, #fecfef);
		}

		&.hunter {
			background: linear-gradient(135deg, #a18cd1, #fbc2eb);
		}

		&.business {
			background: linear-gradient(135deg, #84fab0, #8fd3f4);
		}
	}

	.content {
		flex: 1;

		.title {
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 6rpx;
		}

		.desc {
			font-size: 24rpx;
			color: #999;
		}
	}

	/* 角标样式优化：更显眼的数字红点 */
	.badge {
		background-color: #ff4d4f;
		color: #fff;
		font-size: 22rpx;
		font-weight: bold;
		min-width: 36rpx;
		height: 36rpx;
		line-height: 36rpx;
		text-align: center;
		border-radius: 18rpx;
		padding: 0 10rpx;
		margin-right: 14rpx;
		box-shadow: 0 4rpx 8rpx rgba(255, 77, 79, 0.3);
	}
</style>