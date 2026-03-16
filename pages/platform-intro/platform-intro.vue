<template>
	<view class="container">
		<!-- 1. 平台介绍富文本 -->
		<view class="rich-text-area post-selectable">
			<rich-text :nodes="content"></rich-text>
		</view>

		<!-- 2. 分割线 -->
		<view class="divider-section" v-if="content">
			<view class="line"></view>
			<text>专属邀请</text>
			<view class="line"></view>
		</view>

		<!-- 3. 二维码组件：直接展示，不再由父页面控制显隐 -->
		<ShareQrCode path="pages/home/home" label="首页邀约码" />

		<view class="footer-spacer"></view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		getInviteCode
	} from '@/utils/user.js';
	import ShareQrCode from '@/components/ShareQrCode.vue';

	const content = ref('');
	const platformName = ref('平台介绍');

	onLoad(() => {
		// 1. 进入页面即开启系统加载动画
		uni.showLoading({
			title: '正在加载...',
			mask: true
		});

		fetchPlatformInfo();

		// 2. 开启分享菜单
		uni.showShareMenu({
			menus: ['shareAppMessage', 'shareTimeline']
		});

		// 3. 3秒后无论如何关闭加载动画（兜底逻辑）
		setTimeout(() => {
			uni.hideLoading();
		}, 3000);
	});

	const fetchPlatformInfo = async () => {
		try {
			const {
				data
			} = await request('/app-api/system/platformConfig/getPlatformConfig');
			if (data) {
				content.value = data.content || '';
				platformName.value = data.name || '平台介绍';
				uni.setNavigationBarTitle({
					title: platformName.value
				});
			}
		} finally {
			// 获取完内容后尝试关闭加载
			uni.hideLoading();
		}
	};

	// ==================== 分享转发功能 ====================

	onShareAppMessage(() => {
		const inviteCode = getInviteCode();
		// 携带当前登录用户的邀请码
		const sharePath = `/pages/platform-intro/platform-intro?inviteCode=${inviteCode}`;
		
		console.log("带分享码：",sharePath)

		return {
			title: platformName.value + ' | 猩聚社精英商友社区',
			path: sharePath,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	onShareTimeline(() => {
		const inviteCode = getInviteCode();
		return {
			title: platformName.value,
			query: `inviteCode=${inviteCode}`,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});
</script>

<style scoped lang="scss">
	.container {
		padding: 30rpx;
		background-color: #fff;
		min-height: 100vh;
	}

	.rich-text-area {
		margin-bottom: 60rpx;
	}

	.divider-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
		margin: 40rpx 0;

		.line {
			flex: 1;
			height: 1rpx;
			background-color: #eee;
		}

		text {
			font-size: 24rpx;
			color: #ccc;
		}
	}

	.footer-spacer {
		height: 100rpx;
	}

	/* ============ 文本选择支持 ============ */
	.post-selectable {
		user-select: text;
		-webkit-user-select: text;
		-webkit-touch-callout: auto;
	}
</style>