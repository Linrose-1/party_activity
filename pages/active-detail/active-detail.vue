<template>
	<view class="page">

		<!-- 活动封面 -->
		<view class="event-cover">
			<text class="event-cover-text">创业者交流会 · 资源共享 · 经验分享</text>
		</view>

		<!-- 活动信息 -->
		<view class="event-header">
			<text class="event-title">互联网创业者交流会</text>
			<view class="event-meta">
				<uni-icons type="calendar" size="18" color="#FF6B00" /><text>2025-06-15 14:00-17:00</text>
			</view>
			<view class="event-meta">
				<uni-icons type="location" size="18" color="#FF6B00" /><text>上海市浦东新区张江高科技园区</text>
			</view>
			<view class="event-stats">
				<view class="stat-item">
					<view class="stat-value">32</view>
					<view class="stat-label">已报名</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">50</view>
					<view class="stat-label">总名额</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">100</view>
					<view class="stat-label">报名费</view>
				</view>
			</view>
		</view>

		<!-- 活动介绍 -->
		<view class="event-content">
			<view class="section-title">活动介绍</view>
			<view class="event-description">
				本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。活动将邀请多位成功创业者分享他们的创业历程、经验教训以及对未来趋势的洞察。参与者将有机会与行业专家面对面交流，拓展人脉资源，寻找潜在合作伙伴。
				活动将涵盖多个主题，包括产品创新、市场拓展、融资策略等。无论您是初创企业创始人，还是准备创业的行业新人，都能从本次活动中获得启发和价值。
			</view>

			<text class="section-title">活动内容</text>
			<view class="activity-grid">
				<view class="activity-item" v-for="(item, index) in activities" :key="index">
					<!-- <view class="activity-icon">
            <uni-icons :type="item.icon" size="20" color="#fff" />
          </view> -->
					<view class="activity-title">{{ item.title }}</view>
					<view class="activity-desc">{{ item.desc }}</view>
				</view>
			</view>
		</view>

		<!-- 主办方 -->
		<view class="organizer-section">
			<view class="organizer-title">活动组织者</view>
			<view class="organizer-info">
				<view class="organizer-avatar">
					<uni-icons type="person-filled" size="24" color="#fff" />
				</view>
				<view>
					<view class="organizer-name">张经理</view>
					<view class="organizer-company">创新科技活动策划部</view>
				</view>
			</view>
		</view>


		<!-- 商圈信息 -->
		<view class="business-section">
			<view class="business-title">活动聚店</view>
			<view class="business-info">
				<view class="business-logo">
					<uni-icons type="shop-filled" size="24" color="#fff" />
				</view>
				<view class="business-details">
					<text class="business-name">创客空间咖啡厅</text>
					<view class="business-meta">
						<view style="font-size: 25rpx;margin: 10rpx 0;">📍 张江高科技园区88号</view>
						<view style="font-size: 25rpx;margin: 10rpx 0;">📞 021-68881234</view>
						<view style="font-size: 25rpx;margin: 10rpx 0;">🕒 09:00-22:00 (每日营业)</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 活动贡分 -->
		<view class="organizer-section">
			<view class="organizer-title">活动贡分</view>
			<view class="organizer-info">
				<view class="organizer-name">参与本次活动，活动结束可以获得<span style="color: #ff6b00;">10</span>贡分</view>
			</view>
		</view>


		<!-- 参与用户头像组 -->
		<view class="participants-section">
			<view class="participants-header">
				<view class="participants-title">参与用户</view>
				<view class="view-all-link" @click="viewAllUsers">查看全部 ></view>
			</view>
			<view class="participants-body">
				<view class="avatar-group">
					<image v-for="(avatar, index) in avatars" :key="index" :src="avatar" class="avatar-item" />
					<view class="avatar-item more-avatars">+28</view>
				</view>
				<text class="total-registered-info">
					<text class="registered-count">32</text> 人已报名
				</text>
			</view>
		</view>
		
		<view style="margin: 20rpx auto;flex: 1; text-align: center;">报名截止时间：<span style="color: #ff1a3c;">2025-6-30 13:45:00</span></view>

		<!-- 操作栏 -->
		<view class="action-bar">
			<view class="action-btn share-btn" @click="share">
				<text> 🔗分享</text>
			</view>
			<view class="action-btn register-btn" @click="register">
				<text> ➕立即报名</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'

	const avatars = [
		'https://randomuser.me/api/portraits/women/1.jpg',
		'https://randomuser.me/api/portraits/men/2.jpg',
		'https://randomuser.me/api/portraits/women/3.jpg',
		'https://randomuser.me/api/portraits/men/4.jpg'
	]

	const activities = [{
			icon: 'sound',
			title: '主题演讲',
			desc: '行业大咖分享创业经验'
		},
		{
			icon: 'group',
			title: '圆桌论坛',
			desc: '创业者互动讨论'
		},
		{
			icon: 'person',
			title: '自由交流',
			desc: '拓展人脉资源'
		},
		{
			icon: 'coffee',
			title: '茶歇时间',
			desc: '精致茶点与饮品'
		}
	]


	function share() {
		uni.showToast({
			title: '已分享到微信朋友圈',
			icon: 'none'
		})
	}

	function register() {
		uni.navigateTo({
		  url:'/pages/active-enroll/active-enroll'
		})
	}

	function viewAllUsers() {
		uni.showToast({
			title: '查看全部参与用户',
			icon: 'none'
		})
	}
</script>

<style lang="scss" scoped>
	.page {
		padding-bottom: 120rpx;
		background-color: #f8f8f8;
	}

	.top-nav {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		color: white;
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		font-size: 32rpx;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.page-title {
		flex: 1;
		text-align: center;
		font-weight: bold;
	}

	.event-cover {
		height: 400rpx;
		background: linear-gradient(45deg, #ff9a9e, #fad0c4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		padding: 20rpx;
	}

	.event-header,
	.event-content,
	.organizer-section,
	.business-section,
	.participants-section {
		background: #fff;
		margin: 30rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.participants-header{
		display: flex;
		justify-content: space-between;
		margin-bottom: 10rpx;
		
		.view-all-link{
			font-size: 24rpx;
			color: #3a7bd5;
			cursor: pointer;
		}
	}

	.event-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.event-meta {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		margin: 10rpx;
		gap: 10rpx;
	}

	.event-stats {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
	}

	.stat-item {
		flex: 1;
		text-align: center;
	}

	.stat-value {
		font-size: 32rpx;
		color: #FF6B00;
		font-weight: bold;
	}

	.stat-label {
		font-size: 24rpx;
		color: #888;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin: 30rpx 0 20rpx;
		border-left: 10rpx solid #FF6B00;
		padding-left: 20rpx;
	}

	.event-description {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		margin-bottom: 20rpx;
	}

	.activity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30rpx;
		margin-top: 20rpx;
	}

	.activity-item {
		background: #f9f9f9;
		border-radius: 20rpx;
		padding: 30rpx;
		text-align: center;
	}

	.activity-icon {
		width: 80rpx;
		height: 80rpx;
		background: #FF6B00;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20rpx;
	}

	.activity-title {
		color: #FF6B00;
		font-weight: bold;
		font-size: 32rpx;
		margin-bottom: 10rpx;
	}

	.activity-desc {
		font-size: 24rpx;
		color: #666;
	}
	
	.organizer-title,
	.business-title,
	.participants-title{
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.organizer-info,
	.business-info,
	.participants-body {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.organizer-avatar,
	.business-logo {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(45deg, #ffb347, #ffcc33);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.organizer-name,
	.business-name {
		font-weight: bold;
		font-size: 28rpx;
	}

	.organizer-company,
	.business-meta text {
		font-size: 24rpx;
		color: #666;
	}

	.avatar-group {
		display: flex;
		position: relative;
	}

	.avatar-item {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
		object-fit: cover;
		margin-left: -20rpx;
		background: #f0f0f0;
	}

	.more-avatars {
		background: #FF6B00;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.total-registered-info {
		font-size: 26rpx;
		color: #666;
	}

	.registered-count {
		color: #FF6B00;
		font-weight: bold;
	}

	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		display: flex;
		padding: 20rpx;
		box-shadow: 0 -5rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		padding: 24rpx;
		margin: 0 10rpx;
		text-align: center;
		border-radius: 16rpx;
		font-weight: bold;
	}

	.share-btn {
		background: #f0f0f0;
		color: #333;
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: #fff;
	}
</style>