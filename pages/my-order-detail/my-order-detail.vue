<template>
	<view class="detail-container" v-if="orderInfo">
		<!-- 1. 状态头部 -->
		<view class="status-header" :class="orderInfo.payStatus === 1 ? 'bg-success' : 'bg-pending'">
			<view class="status-title">
				<uni-icons :type="orderInfo.payStatus === 1 ? 'checkbox-filled' : 'info-filled'" size="30"
					color="#fff"></uni-icons>
				<text>{{ orderInfo.payStatus === 1 ? '支付成功' : '待支付' }}</text>
			</view>
			<view class="status-desc" v-if="orderInfo.payStatus === 1">感谢您的支持</view>
			<view class="status-desc" v-else>请尽快完成支付</view>
		</view>

		<!-- 2. 商品信息 -->
		<view class="info-card">
			<view class="card-title">商品信息</view>
			<view class="info-item">
				<text class="label">商品名称</text>
				<text class="value">{{ orderInfo.payType === 2 ? '会员开通' : '智米充值' }}</text>
			</view>
			<view class="info-item">
				<text class="label">商品描述</text>
				<text class="value">{{ orderInfo.remark || '-' }}</text>
			</view>
			<view class="info-item">
				<text class="label">支付金额</text>
				<text class="value price">¥{{ orderInfo.amount }}</text>
			</view>
		</view>

		<!-- 3. 订单信息 -->
		<view class="info-card">
			<view class="card-title">订单信息</view>
			<view class="info-item">
				<text class="label">订单编号</text>
				<text class="value copyable" @click="copyText(orderInfo.orderNo)">{{ orderInfo.orderNo }}</text>
			</view>
			<view class="info-item">
				<text class="label">创建时间</text>
				<text class="value">{{ formatTime(orderInfo.createTime) }}</text>
			</view>
			<view class="info-item" v-if="orderInfo.payStatus === 1">
				<text class="label">支付方式</text>
				<text class="value">微信支付</text>
			</view>
		</view>

		<!-- 4. 底部按钮 -->
		<view class="footer-btn">
			<button class="contact-btn" open-type="contact">
				<uni-icons type="headphones" size="18" color="#666"></uni-icons>
				联系客服
			</button>
		</view>
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

	const orderInfo = ref(null);

	onLoad((options) => {
		if (options.id) {
			fetchDetail(options.id);
		}
	});

	const fetchDetail = async (id) => {
		uni.showLoading({
			title: '加载中...'
		});
		try {
			// 假设获取详情接口是 /get
			const {
				data,
				error
			} = await request('/app-api/member/user-post-pay-record/get', {
				method: 'GET',
				data: {
					id
				}
			});
			if (error) throw new Error(error);
			orderInfo.value = data;
		} catch (e) {
			uni.showToast({
				title: '获取详情失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};

	const formatTime = (ts) => {
		if (!ts) return '';
		const d = new Date(ts);
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
	};

	const copyText = (text) => {
		if (!text) return;
		uni.setClipboardData({
			data: text
		});
	};
</script>

<style lang="scss" scoped>
	.detail-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
	}

	.status-header {
		padding: 60rpx 40rpx;
		color: #fff;

		&.bg-success {
			background: linear-gradient(135deg, #52c41a, #85e055);
		}

		&.bg-pending {
			background: linear-gradient(135deg, #ff9800, #ffb74d);
		}

		.status-title {
			display: flex;
			align-items: center;
			font-size: 36rpx;
			font-weight: bold;
			gap: 10rpx;
		}

		.status-desc {
			margin-top: 10rpx;
			font-size: 26rpx;
			opacity: 0.9;
			margin-left: 70rpx;
		}
	}

	.info-card {
		background: #fff;
		margin: 20rpx;
		border-radius: 16rpx;
		padding: 30rpx;

		.card-title {
			font-size: 30rpx;
			font-weight: bold;
			border-left: 6rpx solid #FF6E00;
			padding-left: 20rpx;
			margin-bottom: 30rpx;
		}

		.info-item {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20rpx;
			font-size: 28rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				color: #999;
			}

			.value {
				color: #333;
				max-width: 70%;
				text-align: right;

				&.price {
					color: #FF6E00;
					font-weight: bold;
					font-size: 32rpx;
				}

				&.copyable {
					text-decoration: underline;
				}
			}
		}
	}

	.footer-btn {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

		.contact-btn {
			background: #fff;
			border: 1rpx solid #ddd;
			color: #666;
			font-size: 28rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			border-radius: 40rpx;

			&::after {
				border: none;
			}
		}
	}
</style>