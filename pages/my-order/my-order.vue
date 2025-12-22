<template>
	<view class="container">
		<!-- 1. 顶部 Tab -->
		<view class="tabs-header">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">全部</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">智米充值</view>
			<view class="tab-item" :class="{ active: currentTab === 2 }" @click="switchTab(2)">会员开通</view>
		</view>

		<!-- 2. 列表区域 -->
		<view class="order-list">
			<view class="order-card" v-for="(item, index) in orderList" :key="item.id" @click="goToDetail(item)">
				<!-- 头部：时间和状态 -->
				<view class="card-header">
					<text class="time">{{ formatTime(item.createTime) }}</text>
					<text class="status" :class="getStatusClass(item.payStatus)">
						{{ getStatusText(item.payStatus) }}
					</text>
				</view>

				<!-- 内容区 -->
				<view class="card-body">
					<!-- 图标 -->
					<view class="icon-box" :class="item.payType === 2 ? 'member-bg' : 'zhimi-bg'">
						<uni-icons :type="item.payType === 2 ? 'vip-filled' : 'star-filled'" size="24" color="#fff">
						</uni-icons>
					</view>

					<!-- 信息 -->
					<view class="info-box">
						<view class="title-row">
							<text class="title">{{ item.payType === 2 ? '会员开通' : '智米充值' }}</text>
							<text class="amount">¥{{ item.amount }}</text>
						</view>
						<view class="desc-row">
							<text class="desc">{{ item.remark || (item.payType === 2 ? '会员服务' : '充值余额') }}</text>
						</view>
						<view class="order-no-row">
							订单号: {{ item.orderNo || '生成中...' }}
						</view>
					</view>
				</view>

				<!-- 底部操作区 (仅未支付显示) -->
				<view class="card-footer" v-if="item.payStatus === 0">
					<view class="total-text">需付款：<text class="highlight">¥{{ item.amount }}</text></view>
					<button class="repay-btn" @click.stop="handleRepay(item)" :disabled="isPaying" :loading="isPaying">
						重新支付
					</button>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more :status="loadingStatus" v-if="orderList.length > 0 || loadingStatus === 'loading'" />

			<!-- 空状态 -->
			<view v-if="orderList.length === 0 && loadingStatus === 'noMore'" class="empty-state">
				<uni-icons type="cart" size="60" color="#ddd"></uni-icons>
				<text>暂无订单记录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// --- 状态 ---
	const currentTab = ref(0); // 0:全部, 1:智米, 2:会员
	const orderList = ref([]);
	const pageNo = ref(1);
	const pageSize = 10;
	const loadingStatus = ref('more');
	const isPaying = ref(false);

	onMounted(() => {
		loadData(true);
	});

	onPullDownRefresh(() => {
		loadData(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			loadData(false);
		}
	});

	// --- 数据获取 ---
	const loadData = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading') return;
		loadingStatus.value = 'loading';

		if (isRefresh) {
			pageNo.value = 1;
			orderList.value = [];
		}

		try {
			const params = {
				pageNo: pageNo.value,
				pageSize: pageSize
			};
			// 如果不是全部，则传 payType
			if (currentTab.value !== 0) {
				params.payType = currentTab.value;
			}

			// 假设列表接口地址是 /page (根据你的项目习惯推测)
			const {
				data,
				error
			} = await request('/app-api/member/user-post-pay-record/page', {
				method: 'GET',
				data: params
			});

			if (error) throw new Error(error);

			const list = data.list || [];
			orderList.value = isRefresh ? list : [...orderList.value, ...list];

			if (list.length < pageSize) {
				loadingStatus.value = 'noMore';
			} else {
				loadingStatus.value = 'more';
				pageNo.value++;
			}
		} catch (e) {
			console.error('加载订单失败', e);
			loadingStatus.value = 'more';
		} finally {
			uni.stopPullDownRefresh();
		}
	};

	// --- 交互 ---
	const switchTab = (index) => {
		if (currentTab.value === index) return;
		currentTab.value = index;
		loadData(true);
	};

	const goToDetail = (item) => {
		uni.navigateTo({
			url: `/pages/my-order-detail/my-order-detail?id=${item.id}`
		});
	};

	// --- 支付逻辑 (复用) ---
	const handleRepay = async (item) => {
		if (!item.orderNo) {
			return uni.showToast({
				title: '订单号无效',
				icon: 'none'
			});
		}
		isPaying.value = true;
		uni.showLoading({
			title: '正在支付...'
		});

		try {
			// 1. 获取支付参数
			const {
				data: payParams,
				error
			} = await request('/app-api/member/user-post-pay-record/pay', {
				method: 'POST',
				data: {
					orderNo: item.orderNo
				}
			});

			if (error) throw new Error(error);

			// 2. 调起微信支付
			await new Promise((resolve, reject) => {
				uni.requestPayment({
					provider: 'weixin',
					...payParams,
					success: resolve,
					fail: (err) => {
						if (err.errMsg.includes('cancel')) reject(new Error('取消支付'));
						else reject(new Error('支付失败'));
					}
				});
			});

			uni.hideLoading();
			uni.showToast({
				title: '支付成功',
				icon: 'success'
			});
			// 支付成功后刷新列表状态
			setTimeout(() => loadData(true), 1000);

		} catch (e) {
			uni.hideLoading();
			if (e.message !== '取消支付') {
				uni.showToast({
					title: e.message || '支付异常',
					icon: 'none'
				});
			}
		} finally {
			isPaying.value = false;
		}
	};

	// --- 工具函数 ---
	const formatTime = (ts) => {
		if (!ts) return '';
		const d = new Date(ts);
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
	};

	const getStatusText = (status) => {
		return status === 1 ? '✅ 支付成功' : '⏳ 待支付';
	};

	const getStatusClass = (status) => {
		return status === 1 ? 'status-success' : 'status-pending';
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-top: 100rpx;
	}

	/* Tab 样式 */
	.tabs-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 90rpx;
		background: #fff;
		display: flex;
		align-items: center;
		z-index: 10;
		border-bottom: 1rpx solid #eee;

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #666;
			line-height: 90rpx;
			position: relative;

			&.active {
				color: #FF6E00;
				font-weight: bold;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: #FF6E00;
				}
			}
		}
	}

	/* 列表样式 */
	.order-list {
		padding: 20rpx;
	}

	.order-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		font-size: 24rpx;

		.time {
			color: #999;
		}

		.status-success {
			color: #52c41a;
		}

		.status-pending {
			color: #ff9800;
		}
	}

	.card-body {
		display: flex;
		align-items: flex-start;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.icon-box {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;

		&.zhimi-bg {
			background: #4facfe;
		}

		&.member-bg {
			background: #ffb347;
		}
	}

	.info-box {
		flex: 1;

		.title-row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 8rpx;

			.title {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}

			.amount {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.desc-row {
			margin-bottom: 8rpx;

			.desc {
				font-size: 26rpx;
				color: #666;
			}
		}

		.order-no-row {
			font-size: 22rpx;
			color: #999;
		}
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 20rpx;

		.total-text {
			font-size: 26rpx;
			color: #333;

			.highlight {
				font-size: 32rpx;
				font-weight: bold;
				color: #FF6E00;
			}
		}

		.repay-btn {
			margin: 0;
			font-size: 26rpx;
			background: #FF6E00;
			color: #fff;
			border-radius: 30rpx;
			padding: 0 30rpx;
			line-height: 56rpx;

			&::after {
				border: none;
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;
		color: #999;
		font-size: 28rpx;

		.uni-icons {
			margin-bottom: 20rpx;
		}
	}
</style>