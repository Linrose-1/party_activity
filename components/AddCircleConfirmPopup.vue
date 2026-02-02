<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="confirm-card">
			<view class="card-title">建立圈友关系✅ </view>

			<view class="card-content">
				<view class="text-line">
					与 <text class="highlight">{{ targetUser.name }}</text> 建立圈友关系
				</view>
				<view class="divider"></view>
				<view class="desc-item">
					<text>将您加入到TA的圈友网络中</text>
				</view>
				<view class="fee-notice">
					<uni-icons type="info-filled" size="14" color="#FF7009"></uni-icons>
					<text class="notice-text">注：加入TA圈需扣除 1 智米。若对方拒绝，智米将原路退回。</text>
				</view>
			</view>

			<view class="card-actions">
				<button class="btn cancel" @click="close">取消</button>
				<button class="btn confirm" @click="confirm" :loading="loading">确认加入</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import request from '@/utils/request.js'; // 确保路径正确

	const popup = ref(null);
	const targetUser = ref({});
	const loading = ref(false);
	const emit = defineEmits(['success']);

	// 打开弹窗，传入目标用户对象 { id, name }
	const open = (user) => {
		targetUser.value = user || {
			name: '商友'
		};
		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	// 确认并调用接口
	const confirm = async () => {
		if (!targetUser.value.id) {
			uni.showToast({
				title: '用户ID缺失',
				icon: 'none'
			});
			return;
		}

		loading.value = true;
		try {
			const url = `/app-api/member/user/friend/apply/${targetUser.value.id}`;
			const {
				error
			} = await request(url, {
				method: 'POST'
			});

			if (!error) {
				uni.showToast({
					title: '申请已发送',
					icon: 'success'
				});
				emit('success', targetUser.value.id); // 通知父组件成功
				close();
			} else {
				uni.showToast({
					title: error || '申请失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.confirm-card {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		padding: 40rpx 30rpx;
	}

	.card-title {
		font-size: 34rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 40rpx;
		color: #333;
	}

	.card-content {
		margin-bottom: 50rpx;
	}

	.text-line {
		font-size: 30rpx;
		text-align: center;
		margin-bottom: 30rpx;
		color: #333;
	}

	.highlight {
		color: #FF7009;
		font-weight: bold;
		margin: 0 8rpx;
	}

	.divider {
		height: 1rpx;
		background-color: #eee;
		margin: 30rpx 0;
	}

	.desc-item {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 8rpx;
		text-align: center;
	}

	/* 扣费提示框样式 */
	.fee-notice {
		margin-top: 30rpx;
		background-color: #FFF9F5; // 极浅的橙色背景
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		display: flex;
		align-items: flex-start; // 顶部对齐
		gap: 10rpx;

		.notice-text {
			flex: 1;
			font-size: 24rpx;
			color: #FF7009; // 使用主题色
			line-height: 1.4;
			text-align: left;
		}
	}

	/* 适当微调 card-content 底部边距 */
	.card-content {
		margin-bottom: 40rpx;
	}

	.sub-text {
		font-size: 24rpx;
		color: #999;
	}

	.card-actions {
		display: flex;
		gap: 30rpx;
	}

	.btn {
		flex: 1;
		font-size: 30rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;

		&::after {
			border: none;
		}
	}

	.cancel {
		background-color: #f5f5f5;
		color: #666;
	}

	.confirm {
		background: linear-gradient(135deg, #FF7009, #FF9A44);
		color: #fff;
	}
</style>