<template>
	<view class="container">
		<template v-if="userInfo">
			<!-- 我的智米核心模块 -->
			<view class="smart-rice-section">
				<!-- 1. 标题与说明 -->
				<view class="section-title-box">
					<view class="main-title">
						<uni-icons type="wallet-filled" size="22" color="#FF6F00"></uni-icons>
						<text>我的智米</text>
					</view>
					<text class="sub-desc">智米是平台内的通用积分，可用于兑换平台内指定的服务或商品。</text>
				</view>

				<!-- 2. 数值展示区 -->
				<view class="balance-display-card">
					<view class="display-item">
						<text class="num">{{ userInfo.point || 0 }}</text>
						<text class="label">可用智米</text>
						<text class="hint">当前剩余可用</text>
					</view>
					<view class="display-divider"></view>
					<view class="display-item">
						<text class="num total">{{ userInfo.totalPoint || 0 }}</text>
						<text class="label">累计智米</text>
						<text class="hint">历史获得总额</text>
					</view>
				</view>

				<!-- 3. 操作按钮 -->
				<view class="smart-rice-actions">
					<button class="action-button exchange-btn" @click="handleExchangeSmartRice">申请兑换</button>
					<button class="action-button recharge-btn" @click="handleRechargeSmartRice">立即充值</button>
				</view>
			</view>

			<!-- 最近智米明细预览 -->
			<view class="record-preview-section">
				<view class="section-header">
					<text class="title">最近明细</text>
					<view class="view-all" @click="goToAllRecords">
						查看全部 <uni-icons type="right" size="14" color="#999"></uni-icons>
					</view>
				</view>

				<view class="record-list" v-if="recentRecords.length > 0">
					<view class="record-item" v-for="item in recentRecords" :key="item.id">
						<view class="record-left">
							<text class="record-title">{{ item.title }}</text>
							<text class="record-date">{{ formatDate(item.createTime) }}</text>
						</view>
						<view class="record-right" :class="{ 'plus': item.point > 0 }">
							{{ item.point > 0 ? '+' : '' }}{{ item.point }}
						</view>
					</view>
				</view>
				<view v-else class="empty-tip">暂无智米记录</view>
			</view>
		</template>

		<!-- 加载中 -->
		<view v-else class="loading-placeholder">
			<uni-load-more status="loading" contentText="加载中..."></uni-load-more>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import request from '@/utils/request.js';

	const userInfo = ref(null);
	const recentRecords = ref([]);

	onMounted(() => {
		fetchUserInfo();
		fetchRecentRecords();
	});

	// 获取用户信息（包含可用智米 point 和 累计智米 totalPoint）
	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get');
		if (!error) userInfo.value = data;
	};

	// 获取最近 5 条记录
	const fetchRecentRecords = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/point/record/my-point-list', {
			data: {
				pageNo: 1,
				pageSize: 5
			}
		});
		if (!error && data) {
			recentRecords.value = data.list;
		}
	};

	const formatDate = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	};

	const goToAllRecords = () => {
		uni.navigateTo({
			url: '/packages/smart-rice-records/smart-rice-records'
		});
	};

	const handleExchangeSmartRice = () => {
		uni.showToast({
			title: '兑换功能正在开发中',
			icon: 'none'
		});
	};

	const handleRechargeSmartRice = () => {
		uni.navigateTo({
			url: '/packages/recharge/recharge'
		});
	};
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #F8F9FB;
		padding: 30rpx;
	}

	/* 顶部模块 */
	.smart-rice-section {
		background-color: #ffffff;
		border-radius: 32rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	.section-title-box {
		margin-bottom: 40rpx;
	}

	.main-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 12rpx;
	}

	.sub-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
		display: block;
	}

	/* 数值展示卡片 */
	.balance-display-card {
		background: linear-gradient(135deg, #FFFBF8 0%, #FFF5EE 100%);
		border: 1rpx solid #FFEDDF;
		border-radius: 24rpx;
		display: flex;
		padding: 40rpx 0;
		margin-bottom: 40rpx;
	}

	.display-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.display-divider {
		width: 1rpx;
		height: 80rpx;
		background-color: #FFEDDF;
		align-self: center;
	}

	.num {
		font-size: 48rpx;
		font-weight: bold;
		color: #FF6F00;
		margin-bottom: 8rpx;
	}

	.num.total {
		color: #333;
	}

	.label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 4rpx;
	}

	.hint {
		font-size: 20rpx;
		color: #999;
	}

	/* 按钮操作 */
	.smart-rice-actions {
		display: flex;
		gap: 24rpx;
	}

	.action-button {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 28rpx;
		font-weight: bold;
	}

	.action-button::after {
		border: none;
	}

	.exchange-btn {
		background-color: #fff;
		color: #FF6F00;
		border: 2rpx solid #FF6F00;
	}

	.recharge-btn {
		background-color: #FF6F00;
		color: #fff;
	}

	/* 最近明细预览 */
	.record-preview-section {
		background-color: #ffffff;
		border-radius: 32rpx;
		padding: 30rpx 40rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #F5F5F5;
	}

	.section-header .title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.view-all {
		font-size: 24rpx;
		color: #999;
	}

	.record-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #F5F5F5;
	}

	.record-item:last-child {
		border-bottom: none;
	}

	.record-left {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.record-title {
		font-size: 28rpx;
		color: #333;
	}

	.record-date {
		font-size: 22rpx;
		color: #bbb;
	}

	.record-right {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.record-right.plus {
		color: #FF6F00;
	}

	.empty-tip {
		text-align: center;
		padding: 60rpx 0;
		color: #ccc;
		font-size: 26rpx;
	}

	.loading-placeholder {
		padding-top: 30vh;
	}
</style>