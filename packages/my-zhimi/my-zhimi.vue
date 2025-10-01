<template>
	<view class="container">
		<!-- 只有在用户信息加载后才显示内容 -->
		<template v-if="userInfo">
			<!-- 我的智米模块 -->
			<view class="smart-rice-section">
				<view class="smart-rice-header">
					<view class="smart-rice-title">
						<uni-icons type="wallet" size="24" color="#FF6B00"></uni-icons> 我的智米
					</view>
					<view class="smart-rice-value">{{ userInfo.point }} 智米</view>
				</view>
				<view class="smart-rice-info">
					<p>智米是平台内的通用积分，可用于兑换平台内指定的虚拟服务或实体商品。</p>
				</view>
				<view class="smart-rice-actions">
					<button class="action-button exchange-button" @click="handleExchangeSmartRice">
						<uni-icons type="forward" size="20" color="#fff"></uni-icons> 申请兑换
					</button>
					<button class="action-button recharge-button" @click="handleRechargeSmartRice">
						<uni-icons type="wallet" size="20" color="#fff"></uni-icons> 立即充值
					</button>
				</view>
				<!-- 您可以根据需要添加更多说明或智米历史记录入口 -->
				<!-- <p class="smart-rice-note">
					<uni-icons type="info-filled" size="18" color="#FF6B00"></uni-icons> 智米充值请联系平台客服。
				</p> -->
			</view>

			<!-- 可以在此位置添加 "智米明细"、"如何获取" 等其他相关模块 -->
			<!-- <view class="related-section">
				<view class="related-item" @click="showComingSoon">
					<uni-icons type="list" size="22" color="#666"></uni-icons>
					<text>智米明细</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
				<view class="related-item" @click="showComingSoon">
					<uni-icons type="help" size="22" color="#666"></uni-icons>
					<text>如何获取智米</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view> -->
		</template>

		<!-- 加载中的占位符 -->
		<view v-else class="loading-placeholder">
			<uni-load-more status="loading" contentText="正在加载您的智米信息..."></uni-load-more>
		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	// ‼️ 请确保此路径相对于您新文件的位置是正确的
	import request from '../../utils/request.js';

	// 1. 数据状态
	const userInfo = ref(null);

	// 2. 生命周期函数
	onMounted(() => {
		// 页面加载时，获取最新的用户信息
		fetchUserInfo();
	});

	// 3. 数据获取方法
	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});

		if (error) {
			uni.showToast({
				title: `加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}
		userInfo.value = data;
	};

	// 4. 事件处理方法
	/**
	 * @description 处理点击 "申请兑换"
	 */
	const handleExchangeSmartRice = () => {
		uni.showToast({
			title: '兑换功能正在开发中...',
			icon: 'none'
		});
		// 示例跳转: uni.navigateTo({ url: '/pages/exchange/exchange' });
	};

	/**
	 * @description 处理点击 "立即充值"
	 */
	const handleRechargeSmartRice = () => {
		uni.navigateTo({
			url: '/pages/recharge/recharge' // 跳转到统一的充值页面
		});
	};

	/**
	 * @description 敬请期待提示
	 */
	const showComingSoon = () => {
		uni.showToast({
			title: '功能即将上线，敬请期待',
			icon: 'none'
		});
	};
</script>

<style scoped>
	/* 页面整体容器 */
	.container {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding: 30rpx;
	}

	/* 加载占位符样式 */
	.loading-placeholder {
		padding-top: 200rpx;
	}

	/* --- 我的智米模块核心样式 (从原页面抽取) --- */
	.smart-rice-section {
		background: linear-gradient(to right, #fefefe, #f9f9f9);
		border-radius: 40rpx;
		padding: 50rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
		border: 2rpx solid #eee;
	}

	.smart-rice-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.smart-rice-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: flex;
		align-items: center;
	}

	.smart-rice-title uni-icons {
		margin-right: 12rpx;
	}

	.smart-rice-value {
		font-size: 48rpx;
		font-weight: bold;
		color: #FF6B00;
	}

	.smart-rice-info {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 60rpx;
	}

	.smart-rice-actions {
		display: flex;
		justify-content: space-around;
		gap: 30rpx;
		margin-bottom: 20rpx;
		/* 调整与底部的距离 */
	}

	.action-button {
		flex: 1;
		height: 90rpx;
		border-radius: 50rpx;
		border: none;
		color: white;
		font-size: 32rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	/* 移除 button 默认边框，uni-app 中需要这样写 */
	.action-button::after {
		border: none;
	}

	.exchange-button {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
	}

	.recharge-button {
		background: linear-gradient(to right, #007bff, #0056b3);
	}

	.action-button uni-icons {
		margin-right: 15rpx;
	}

	.action-button:hover {
		transform: translateY(-5rpx);
		box-shadow: 0 12rpx 25rpx rgba(0, 0, 0, 0.2);
	}

	/* --- 新增的相关功能模块样式 --- */
	.related-section {
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.related-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		font-size: 30rpx;
		color: #333;
	}

	.related-item:not(:last-child) {
		border-bottom: 1rpx solid #f0f0f0;
	}

	.related-item uni-icons:first-child {
		margin-right: 20rpx;
	}

	.related-item text {
		flex: 1;
	}
</style>