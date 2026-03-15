<template>
	<view class="page-container">
		<view class="content-area">
			<!-- 1. 邀请新商友模块 -->
			<view class="invite-tools-section">
				<view class="section-title">邀请新商友</view>
				<view class="tools-grid">
					<view class="tool-item" v-for="(item, index) in inviteTools" :key="index"
						@click="handleToolClick(item)">
						<view class="tool-item-inner">
							<image :src="item.icon" class="tool-icon" mode="aspectFit"></image>
							<view class="tool-content">
								<view class="tool-name">{{ item.name }}</view>
								<view class="tool-desc">{{ item.desc }}</view>
							</view>
							<text class="chevron-icon">›</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 2. 我邀请的人（显示邀请人卡片） -->
			<view class="inviter-section">
				<view v-if="platformInfo.name" class="inviter-card platform-card" @click="goToPlatformIntro">
					<view class="inviter-avatar">
						<image :src="platformInfo.img" class="inviter-avatar-img platform-img" mode="aspectFill">
						</image>
					</view>
					<view class="inviter-info">
						<view class="inviter-name">{{ platformInfo.name }} <text class="tag-platform">平台</text></view>
						<view class="inviter-desc">点击查看平台介绍与首页邀约码</view>
					</view>
					<!-- <uni-icons type="right" size="16" color="#ccc"></uni-icons> -->
				</view>

				<view v-if="userInfo && userInfo.parentName" class="section-title" style="margin-top: 30rpx;">我的邀请人
				</view>

				<view v-if="userInfo && userInfo.parentName" class="inviter-card" @click="viewParentCard">
					<view class="inviter-avatar">
						<image v-if="userInfo.parentAvatar" :src="userInfo.parentAvatar" class="inviter-avatar-img"
							mode="aspectFill"></image>
						<view v-else class="avatar-placeholder">{{ userInfo.parentName.charAt(0) }}</view>
					</view>
					<view class="inviter-info">
						<view class="inviter-name">{{ userInfo.parentName }}</view>
						<view v-if="userInfo.parentName === '猩聚社'" class="inviter-desc">平台直属</view>
					</view>
				</view>

				<view v-if="userInfo && !userInfo.parentName" class="empty-container" style="padding-top: 40rpx;">
					<text class="empty-text" style="font-size: 24rpx;">您不是通过个人邀请加入的哦</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const userInfo = ref(null);
	const platformInfo = ref({});

	const inviteTools = ref([{
			name: '注册邀请',
			desc: '注册分享邀请',
			icon: '/static/icon/精准投放.png',
			path: '/pages/index/index'
		},
		{
			name: '名片邀请',
			desc: '名片分享邀请',
			icon: '/static/icon/我的名片.png',
			path: '/packages/my-businessCard/my-businessCard'
		},
		{
			name: '发贴邀请',
			desc: '商机分享邀友',
			icon: '/static/icon/商机.png',
			path: '/packages/home-opportunitiesPublish/home-opportunitiesPublish'
		},
		{
			name: '聚会邀请',
			desc: '聚会分享邀友',
			icon: '/static/icon/聚会.png',
			path: '/packages/active-publish/active-publish'
		}
	]);

	const initializePage = async () => {
		await Promise.all([fetchUserInfo(), fetchPlatformConfig()]);
		uni.stopPullDownRefresh();
	};

	const fetchUserInfo = async () => {
		const {
			data
		} = await request('/app-api/member/user/get');
		if (data) userInfo.value = data;
	};

	const fetchPlatformConfig = async () => {
		const {
			data
		} = await request('/app-api/system/platformConfig/getPlatformConfig');
		if (data) platformInfo.value = data;
	};

	const goToPlatformIntro = () => uni.navigateTo({
		url: '/pages/platform-intro/platform-intro'
	});

	const viewParentCard = () => {
		const url =
			`/packages/applicationBusinessCard/applicationBusinessCard?id=${userInfo.value.parentId}&name=${encodeURIComponent(userInfo.value.parentName)}&avatar=${encodeURIComponent(userInfo.value.parentAvatar || '')}&fromShare=1`;
		uni.navigateTo({
			url
		});
	};

	const handleToolClick = (item) => uni.navigateTo({
		url: item.path
	});

	onMounted(() => initializePage());
	onPullDownRefresh(() => initializePage());
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding: 20rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.invite-tools-section {
		padding: 20rpx;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
	}

	.tool-item {
		background: #fff;
		padding: 30rpx 20rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.tool-item-inner {
		display: flex;
		align-items: center;
	}

	.tool-icon {
		width: 70rpx;
		height: 70rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.tool-content {
		flex: 1;
		min-width: 0;
	}

	.tool-name {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 4rpx;
	}

	.tool-desc {
		font-size: 20rpx;
		color: #999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chevron-icon {
		font-size: 30rpx;
		color: #ddd;
	}

	.inviter-section {
		padding: 20rpx;
	}

	.inviter-card {
		display: flex;
		align-items: center;
		padding: 40rpx;
		background: #fff;
		border-radius: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.06);
		margin-top: 10rpx;
	}

	.inviter-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #FF6E00, #ff8c00);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.inviter-avatar-img {
		width: 100%;
		height: 100%;
	}

	.platform-card {
		background-color: #fcfcfc;
		border: 1rpx solid #eee;

		.platform-img {
			width: 70%;
			height: 70%;
		}
	}

	.tag-platform {
		font-size: 18rpx;
		background: #FF6E00;
		color: #fff;
		padding: 2rpx 8rpx;
		border-radius: 4rpx;
		margin-left: 8rpx;
	}

	.inviter-name {
		font-size: 32rpx;
		font-weight: bold;
	}

	.inviter-desc {
		font-size: 24rpx;
		color: #666;
		margin-top: 4rpx;
	}

	.empty-container {
		text-align: center;
		color: #999;
	}
</style>