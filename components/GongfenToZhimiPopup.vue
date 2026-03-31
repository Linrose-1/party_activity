<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="convert-container">
			<!-- 头部 -->
			<view class="convert-header">
				<text class="title">猩聚社 丨 智米分配</text>
			</view>

			<!-- 内容区 -->
			<view class="convert-body" v-if="data">
				<view class="congrats-section">
					<image src="/static/icons/money-bag.png" class="award-icon" />
					<view class="congrats-text">
						恭喜您！根据共建共享的原则，按照您的社区贡献记录与猩聚社平台所得智米，本次您将获得的智米分配为
						<text class="highlight">{{ data.allocatedPoint }}</text> 个！期待您的持续共建！
					</view>
				</view>

				<view class="stats-grid">
					<view class="stats-item" @click="navTo('gongfen')">
						<text class="label">可用贡分</text>
						<text class="value">{{ data.availableExperience }}</text>
					</view>
					<view class="stats-item" @click="navTo('zhimi')">
						<text class="label">可用智米</text>
						<text class="value">{{ data.availablePoint }}</text>
					</view>
					<view class="stats-item" @click="navTo('gongfen')">
						<text class="label">累计贡分</text>
						<text class="value sub">{{ data.totalExperience }}</text>
					</view>
					<view class="stats-item" @click="navTo('zhimi')">
						<text class="label">累计智米</text>
						<text class="value sub">{{ data.totalPoint }}</text>
					</view>
				</view>

				<view class="nav-hint">点击上方数值可查看记录</view>
			</view>

			<!-- 操作区 -->
			<view class="convert-footer">
				<button class="confirm-btn" :loading="isSubmitting" @click="handleConfirm">确认分配</button>
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
	const data = ref(null);
	const isSubmitting = ref(false);

	// 打开弹窗并预载数据
	const open = async (isAuto = false) => {
		try {
			// 1. 检查今日是否已自动弹出过（频控优化，节省3次额度）
			if (isAuto) {
				const today = new Date().toISOString().slice(0, 10);
				if (uni.getStorageSync('last_seen_zhimi_alloc') === today) return;
			}

			// 2. 获取待确认记录
			const {
				data: resData,
				error
			} = await request('/app-api/member/contribution-convert/pending-confirm', {
				method: 'GET'
			});

			// 如果报错(500)或没数据，静默退出
			if (error || !resData || resData.allocatedPoint <= 0) {
				return;
			}

			data.value = resData;
			popup.value.open();

			// 3. 标记今日已弹过
			if (isAuto) {
				const today = new Date().toISOString().slice(0, 10);
				uni.setStorageSync('last_seen_zhimi_alloc', today);
			}
		} catch (e) {
			console.error('Pending Confirm Error:', e);
		}
	};

	// 执行确认分配
	const handleConfirm = async () => {
		if (isSubmitting.value) return;
		isSubmitting.value = true;

		try {
			const {
				data: success,
				error
			} = await request('/app-api/member/contribution-convert/confirm', {
				method: 'POST'
			});

			if (!error && success) {
				uni.showToast({
					title: '确认分配成功',
					icon: 'success'
				});
				setTimeout(() => {
					popup.value.close();
				}, 1000);
			} else {
				uni.showToast({
					title: error || '确认失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	const navTo = (type) => {
		const url = type === 'gongfen' ? '/packages/my-points/my-points' : '/packages/my-zhimi/my-zhimi';
		uni.navigateTo({
			url
		});
	};

	defineExpose({
		open
	});
</script>

<style lang="scss" scoped>
	$gofor-primary: #FF730E;

	.convert-container {
		width: 620rpx;
		background: #fff;
		border-radius: 32rpx;
		overflow: hidden;
	}

	.convert-header {
		background: linear-gradient(135deg, $gofor-primary, #FF8C00);
		padding: 40rpx 30rpx;
		text-align: center;

		.title {
			color: #fff;
			font-size: 36rpx;
			font-weight: bold;
		}
	}

	.convert-body {
		padding: 40rpx 30rpx;
	}

	.congrats-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;

		.award-icon {
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 20rpx;
		}

		.congrats-text {
			font-size: 28rpx;
			color: #333;
			line-height: 1.6;
			text-align: center;

			.highlight {
				color: $gofor-primary;
				font-size: 40rpx;
				font-weight: bold;
				margin: 0 10rpx;
			}
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		background: #F8F9FA;
		padding: 24rpx;
		border-radius: 16rpx;
	}

	.stats-item {
		display: flex;
		flex-direction: column;

		.label {
			font-size: 22rpx;
			color: #999;
			margin-bottom: 4rpx;
		}

		.value {
			font-size: 30rpx;
			color: #333;
			font-weight: bold;
		}

		.value.sub {
			color: #666;
			font-size: 26rpx;
		}
	}

	.nav-hint {
		font-size: 22rpx;
		color: #ccc;
		text-align: center;
		margin-top: 20rpx;
	}

	.convert-footer {
		padding: 0 30rpx 40rpx;

		.confirm-btn {
			background: $gofor-primary;
			color: #fff;
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 44rpx;
			font-size: 32rpx;
			font-weight: bold;

			&::after {
				border: none;
			}
		}
	}
</style>