<template>
	<uni-popup ref="popupRef" type="center" :is-mask-click="false" background-color="#fff" @change="onChange">
		<view class="pay-popup-container">
			<view class="popup-header">
				<text class="title">{{ title }}</text>
				<uni-icons type="closeempty" size="20" color="#999" @click="close" class="close-icon"></uni-icons>
			</view>

			<view class="popup-content">
				<!-- 支付说明 -->
				<view class="pay-desc">{{ content }}</view>

				<!-- 价格展示 -->
				<view class="price-display">
					<text class="currency">💎</text>
					<text class="amount">{{ price }}</text>
					<text class="unit">智米</text>
				</view>

				<!-- 余额展示 -->
				<view class="balance-info" :class="{ 'insufficient': !isBalanceEnough }">
					<text>当前余额：{{ userBalance }} 智米</text>
					<text v-if="!isBalanceEnough" class="warning-text">(余额不足)</text>
				</view>
			</view>

			<view class="popup-footer">
				<!-- 余额不足时显示充值按钮 -->
				<button  class="btn btn-recharge" @click="goToRecharge">
					充值智米
				</button>

				<!-- 余额充足时显示支付按钮 -->
				<button  class="btn btn-pay" :loading="isPaying" :disabled="isPaying" @click="handlePay">
					立即支付
				</button>

				<button class="btn btn-cancel" @click="close" :disabled="isPaying">再想想</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import request from '@/utils/request.js';

	const props = defineProps({
		title: {
			type: String,
			default: '确认支付'
		},
		content: {
			type: String,
			default: '确认使用智米开启该服务吗？'
		},
		price: {
			type: Number,
			required: true
		},
		// 可选：如果传入 apiPath，组件内部自动发起请求
		apiPath: {
			type: String,
			default: ''
		},
		apiMethod: {
			type: String,
			default: 'POST'
		},
		apiData: {
			type: Object,
			default: () => ({})
		}
	});

	const emit = defineEmits(['success', 'close']);

	const popupRef = ref(null);
	const userBalance = ref(0);
	const isPaying = ref(false);

	// 计算余额是否充足
	const isBalanceEnough = computed(() => {
		return userBalance.value >= props.price;
	});

	// 打开弹窗并获取最新余额
	const open = async () => {
		popupRef.value.open();
		await fetchUserBalance();
	};

	const close = () => {
		popupRef.value.close();
		emit('close');
	};

	const onChange = (e) => {
		if (!e.show) emit('close');
	};

	// 获取用户余额
	const fetchUserBalance = async () => {
		const {
			data
		} = await request('/app-api/member/user/get');
		if (data) {
			// 假设余额字段是 experience (贡分) 或者 zhimi (智米)，请根据实际字段修改
			// 这里假设是 zhimi，或者如果是用贡分支付就改为 experience
			// 根据你之前的代码逻辑，这里似乎是用 "智米" 支付，需确认后端字段
			// 假设后端字段名为 point 或 zhimi
			userBalance.value = data.point || 0; // 【请确认这里字段名】
		}
	};

	const goToRecharge = () => {
		close();
		uni.navigateTo({
			url: '/packages/recharge/recharge?type=zhimi' // 假设有这个参数控制跳到智米Tab
		});
	};

	const handlePay = async () => {
		if (!props.apiPath) {
			// 如果没传 API，直接抛出成功事件，让父组件处理逻辑
			emit('success');
			close();
			return;
		}

		isPaying.value = true;
		try {
			const {
				error
			} = await request(props.apiPath, {
				method: props.apiMethod,
				data: props.apiData
			});

			if (error) {
				// 特殊处理：如果是 453 业务错误，request.js 返回的是对象
				const msg = typeof error === 'string' ? error : (error.msg || '支付失败');
				uni.showToast({
					title: msg,
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				});
				emit('success');
				// 延迟关闭，给用户看成功提示
				setTimeout(() => {
					close();
				}, 1000);
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			isPaying.value = false;
		}
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.pay-popup-container {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		padding: 30rpx;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.popup-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;

		.pay-desc {
			font-size: 28rpx;
			color: #666;
			text-align: center;
			margin-bottom: 30rpx;
			line-height: 1.5;
		}

		.price-display {
			display: flex;
			align-items: baseline;
			color: #FF6A00;
			margin-bottom: 20rpx;

			.currency {
				font-size: 32rpx;
				margin-right: 8rpx;
			}

			.amount {
				font-size: 60rpx;
				font-weight: bold;
				line-height: 1;
			}

			.unit {
				font-size: 24rpx;
				margin-left: 8rpx;
				color: #999;
			}
		}

		.balance-info {
			font-size: 24rpx;
			color: #999;
			background-color: #f8f8f8;
			padding: 10rpx 20rpx;
			border-radius: 30rpx;

			&.insufficient {
				color: #ff4d4f;
				background-color: #fff1f0;
			}

			.warning-text {
				margin-left: 10rpx;
			}
		}
	}

	.popup-footer {
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.btn {
			width: 100%;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			font-weight: bold;

			&::after {
				border: none;
			}
		}

		.btn-pay {
			background: linear-gradient(135deg, #FF6A00, #FF8C00);
			color: #fff;
		}

		.btn-recharge {
			background: linear-gradient(135deg, #3a7bd5, #00d2ff);
			color: #fff;
		}

		.btn-cancel {
			background-color: #f5f5f5;
			color: #666;
		}
	}
</style>