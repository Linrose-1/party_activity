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
				<!-- 示例角标 -->
				<!-- <view class="badge">2</view> -->
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>

			<!-- 3. 商机互动 -->
			<view class="menu-item" @click="navigateTo('business')">
				<view class="icon-box business">
					<uni-icons type="shop-filled" size="24" color="#fff"></uni-icons>
				</view>
				<view class="content">
					<view class="title">商机互动</view>
					<view class="desc">发现潜在商业机会与合作</view>
				</view>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>

		</view>
	</view>
</template>

<script setup>
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	const navigateTo = async (type) => {
		if (!await checkLoginGuard()) return;

		switch (type) {
			case 'reviews':
				uni.navigateTo({
					url: '/packages/my-reviews/my-reviews'
				});
				break;
			case 'hunter':
				uni.showToast({
					title: '猎伙互动功能开发中',
					icon: 'none'
				});
				break;
			case 'business':
				uni.showToast({
					title: '商机互动功能开发中',
					icon: 'none'
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
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
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
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;

		&.review {
			background: linear-gradient(135deg, #FF9A9E, #FECFEF);
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

	.badge {
		background-color: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		padding: 2rpx 10rpx;
		border-radius: 20rpx;
		margin-right: 10rpx;
	}
</style>