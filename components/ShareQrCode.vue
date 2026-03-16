<template>
	<view class="qr-wrap" v-if="qrBase64">
		<view class="qr-box" @click="handlePreview">
			<image :src="qrBase64" mode="aspectFit" class="qr-img" show-menu-by-longpress></image>
			<view class="qr-tag">点击预览/长按发送</view>
		</view>
		<text class="qr-label">{{ label }}</text>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		generatePromotionQrCode
	} from '@/utils/qrcode.js';

	const props = defineProps({
		path: {
			type: String,
			required: true
		},
		label: {
			type: String,
			default: '您的专属邀请码'
		},
		params: {
			type: Object,
			default: () => ({})
		}
	});

	const qrBase64 = ref('');

	onMounted(async () => {
		// 组件内部静默生成，生成好了 v-if 就会让它跳出来
		try {
			const res = await generatePromotionQrCode(props.path, props.params);
			if (res) {
				qrBase64.value = res;
			}
		} catch (e) {
			console.error('生成二维码失败', e);
		}
	});

	const handlePreview = () => {
		if (qrBase64.value) {
			uni.previewImage({
				urls: [qrBase64.value]
			});
		}
	};
</script>

<style scoped lang="scss">
	.qr-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
	}

	.qr-box {
		position: relative;
		width: 300rpx;
		height: 300rpx;
		border: 8rpx solid #FF6A00;
		border-radius: 20rpx;
		overflow: hidden;
		background: #fff;
	}

	.qr-img {
		width: 100%;
		height: 100%;
	}

	.qr-tag {
		position: absolute;
		bottom: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		font-size: 20rpx;
		text-align: center;
		padding: 4rpx 0;
	}

	.qr-label {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #666;
		font-weight: bold;
	}
</style>