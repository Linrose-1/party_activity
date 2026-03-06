<template>
	<view class="container">
		<!-- 1. 平台介绍富文本 -->
		<view class="rich-text-area post-selectable">
			<rich-text :nodes="content"></rich-text>
		</view>

		<!-- 2. 分割线 (美化) -->
		<view class="divider-section" v-if="content">
			<view class="line"></view>
			<text>专属邀请</text>
			<view class="line"></view>
		</view>

		<!-- 3. 使用封装好的二维码组件 -->
		<ShareQrCode path="pages/home/home" label="首页邀约码" />
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	// 引入组件
	import ShareQrCode from '@/components/ShareQrCode.vue';

	const content = ref('');

	onLoad(() => {
		fetchPlatformInfo();
	});

	const fetchPlatformInfo = async () => {
		const {
			data
		} = await request('/app-api/system/platformConfig/getPlatformConfig');
		if (data) {
			content.value = data.content || '';
			uni.setNavigationBarTitle({
				title: data.name || '平台介绍'
			});
		}
	};
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
	
	/* ============ 文本选择支持 ============ */
	.post-selectable {
	  /* 允许文本被选择 */
	  user-select: text;
	  -webkit-user-select: text;
	  -moz-user-select: text;
	  -ms-user-select: text;
	  
	  /* 确保长按时显示系统菜单 */
	  -webkit-touch-callout: auto;
	}
</style>