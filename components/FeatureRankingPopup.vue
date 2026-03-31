<template>
	<uni-popup ref="popup" type="center" :mask-click="true">
		<view class="ranking-container">
			<!-- 头部标题区 -->
			<view class="ranking-header">
				<text class="title">今日 | 功能榜单</text>
				<uni-icons type="closeempty" size="24" color="#fff" @click="close" class="close-icon" />
			</view>

			<!-- 中间富文本内容区 -->
			<scroll-view scroll-y="true" class="ranking-content">
				<view class="rich-text-wrapper">
					<rich-text :nodes="htmlContent"></rich-text>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="ranking-footer">
				<button class="confirm-btn" @click="close">我知道了</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import request from '@/utils/request.js';

	const popup = ref(null);
	const htmlContent = ref('');

	/**
	 * 打开并加载数据
	 */
	const open = async (isAuto = false) => {
		console.log('组件 open 方法被调用, isAuto:', isAuto);
		try {
			const {
				data,
				error
			} = await request('/app-api/member/config/featureRanking', {
				method: 'GET'
			});

			// 如果后端报错（如 500 次数超限），这里 error 会有值
			if (error) {
				console.warn('后端返回错误，静默不弹窗:', error);
				return;
			}

			if (!data) {
				console.warn('榜单内容为空');
				return;
			}

			htmlContent.value = data;

			// 确保 Ref 已经挂载
			if (popup.value) {
				popup.value.open();

				// 只有真正弹出来了，才记录今天已看
				if (isAuto) {
					const today = new Date().toISOString().slice(0, 10);
					uni.setStorageSync('last_seen_feature_ranking', today);
					console.log('已记录今日已看状态');
				}
			}
		} catch (e) {
			console.error('弹窗内部逻辑崩溃:', e);
		}
	};

	const close = () => {
		popup.value.close();
	};

	// 暴露给父组件
	defineExpose({
		open
	});
</script>

<style lang="scss" scoped>
	// 定义主题色
	$gofor-primary: #FF730E;

	.ranking-container {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		max-height: 80vh;
	}

	.ranking-header {
		background: linear-gradient(135deg, $gofor-primary, #FF8C37);
		padding: 30rpx;
		position: relative;
		text-align: center;

		.title {
			color: #fff;
			font-size: 34rpx;
			font-weight: bold;
			letter-spacing: 2rpx;
		}

		.close-icon {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
		}
	}

	.ranking-content {
		flex: 1;
		padding: 30rpx;
		box-sizing: border-box;

		.rich-text-wrapper {
			font-size: 28rpx;
			color: #444;
			line-height: 1.6;

			// 对富文本内部样式做一点简单的重置
			::v-deep h2,
			::v-deep h3 {
				margin: 20rpx 0 10rpx;
				color: #333;
			}

			::v-deep p {
				margin-bottom: 15rpx;
			}
		}
	}

	.ranking-footer {
		padding: 30rpx;
		border-top: 1rpx solid #eee;

		.confirm-btn {
			background-color: $gofor-primary;
			color: #fff;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			border: none;

			&::after {
				border: none;
			}
		}
	}
</style>