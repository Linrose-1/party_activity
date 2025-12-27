<template>
	<view class="recharge-container">
		<!-- 1. 顶部 Tab 切换 -->
		<view class="tabs-header">
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
				智米充值
				<view class="active-line" v-if="currentTab === 1"></view>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 2 }" @click="switchTab(2)">
				会员充值
				<view class="active-line" v-if="currentTab === 2"></view>
			</view>
		</view>

		<view class="content-body">
			<!-- ==================== Tab 1: 智米充值 ==================== -->
			<view v-if="currentTab === 1" class="tab-content">
				<view class="section-title">💰 选择充值面额 (人民币)</view>

				<!-- 快捷金额网格 -->
				<view class="amount-grid">
					<view v-for="(item, index) in zhimiOptions" :key="index" class="grid-item"
						:class="{ active: selectedZhimiIndex === index }" @click="selectZhimiOption(index)">
						<view class="item-price">{{ item }}元</view>
						<view class="item-desc">得{{ item }}智米</view>
					</view>
				</view>

				<!-- 自定义金额 -->
				<view class="custom-amount-section">
					<view class="section-title">💎 自定义充值金额</view>
					<view class="input-wrapper">
						<input type="digit" v-model="customAmount" placeholder="请输入金额" class="custom-input"
							@input="onCustomInput" />
						<text class="unit">元</text>
					</view>
					<view class="tip-text">1元 = 1智米，最小充值 1 元</view>
				</view>
			</view>

			<!-- ==================== Tab 2: 会员充值 ==================== -->
			<view v-if="currentTab === 2" class="tab-content">

				<!-- 1. 当前等级与权益入口 -->
				<view class="section-header">
					<view class="current-level-info">
						当前等级：<text class="highlight">{{ currentMemberLevelName }}</text>
					</view>
					<view class="details-link" @click="goToMemberDetails">
						查看权益详情
						<uni-icons type="right" size="12" color="#FF6E00"></uni-icons>
					</view>
				</view>

				<!-- 2. 会员列表 -->
				<view class="member-list">
					<!-- 【修复】key 改为 level.level -->
					<view v-for="(level, index) in memberLevels" :key="level.level" class="member-card" :class="{ 
							active: selectedLevelNum === level.level, 
							disabled: level.isChoice === 0 
						}" @click="selectMemberLevel(level)">

						<!-- 不可充值遮罩文字 -->
						<view v-if="level.isChoice === 0" class="disabled-mask">
							不可选
						</view>

						<view class="card-left">
							<view class="level-name">{{ level.name }}</view>
							<view class="level-desc">{{ level.duration || '永久' }}</view>
							<!-- 原价显示 -->
							<view class="original-price">
								原价: ¥{{ level.price }}
							</view>
						</view>

						<view class="card-right">
							<view class="price-label">需付差价</view>
							<view class="price-wrapper">
								<text class="currency">¥</text>
								<!-- 显示差价 -->
								<text class="price">{{ level.experience }}</text>
							</view>

							<!-- 选中状态指示器 -->
							<view class="radio-circle">
								<!-- 【修复】判断条件改为 level.level -->
								<view v-if="selectedLevelNum === level.level" class="radio-inner"></view>
							</view>
						</view>
					</view>
				</view>

				<!-- 3. 差价说明 -->
				<view class="price-diff-tip">
					<uni-icons type="info" size="14" color="#999"></uni-icons>
					<text>差价说明：高等级费用 - （ 当前等级费用 - （当前等级费用/365）* 已用天数）</text>
				</view>
			</view>
		</view>

		<!-- ==================== 底部结算区 ==================== -->
		<view class="footer-bar">
			<view class="compliance-text">
				基于国家对积分的管理条例，购买智米后，智米用于平台商业生态的服务与产品消耗，智米的使用余额不能提现与变现，请确认后支付。
			</view>

			<view class="action-area">
				<view class="total-info">
					<view class="label">应付金额：</view>
					<!-- 显示计算后的金额 -->
					<view class="amount">¥ {{ payAmount }}</view>
				</view>
				<button class="pay-btn" @click="handleRecharge" :disabled="isPaying || parseFloat(payAmount) < 0"
					:loading="isPaying">
					{{ isPaying ? '支付中...' : '立即支付' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	// --- 状态变量 ---
	const currentTab = ref(1);
	const isPaying = ref(false);
	const userInfo = ref(null);

	// --- 智米充值数据 ---
	const zhimiOptions = [10, 20, 50, 100, 500];
	const selectedZhimiIndex = ref(0);
	const customAmount = ref('');

	// --- 会员充值数据 ---
	const memberLevels = ref([]);

	// 【修复】使用 selectedLevelNum 代替 selectedMemberId，因为接口可能没返回 id
	const selectedLevelNum = ref(null);

	const currentMemberLevelName = ref('加载中...');

	// --- 计算属性 ---
	const payAmount = computed(() => {
		if (currentTab.value === 1) {
			// 智米模式
			if (customAmount.value) {
				return parseFloat(customAmount.value).toFixed(2);
			}
			if (selectedZhimiIndex.value !== -1) {
				return zhimiOptions[selectedZhimiIndex.value].toFixed(2);
			}
			return '0.00';
		} else {
			// 【修复】会员模式：使用 level 字段查找选中项
			const level = memberLevels.value.find(item => item.level === selectedLevelNum.value);
			// 返回 experience 差价
			return level ? Number(level.experience).toFixed(2) : '0.00';
		}
	});

	// --- 生命周期 ---
	onLoad((options) => {
		if (options.type === 'membership') {
			currentTab.value = 2;
		}
	});

	onMounted(async () => {
		await fetchUserInfo();
		fetchMemberLevels();
	});

	// --- 交互逻辑 ---
	const switchTab = (index) => {
		currentTab.value = index;
		if (index === 1) {
			customAmount.value = '';
			selectedZhimiIndex.value = 0;
		}
	};

	const selectZhimiOption = (index) => {
		selectedZhimiIndex.value = index;
		customAmount.value = '';
	};

	const onCustomInput = () => {
		if (customAmount.value) {
			selectedZhimiIndex.value = -1;
		}
	};

	const selectMemberLevel = (level) => {
		// 核心逻辑：isChoice 为 0 时不可选
		if (level.isChoice === 0) {
			uni.showToast({
				title: '该等级不可选',
				icon: 'none'
			});
			return;
		}
		// 【修复】使用 level 字段进行选中标记
		selectedLevelNum.value = level.level;
	};

	const fetchUserInfo = async () => {
		const {
			data
		} = await request('/app-api/member/user/get');
		if (data) {
			userInfo.value = data;
			currentMemberLevelName.value = data.topUpLevel?.name || data.topUpLevelName || '普通用户';
		}
	};

	const fetchMemberLevels = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/top-up-level/list');
		if (!error && data) {
			// 排序
			const sortedList = data.sort((a, b) => a.level - b.level);
			memberLevels.value = sortedList;

			// 自动选中：找到第一个 isChoice === 1 的等级
			const firstChoice = sortedList.find(item => item.isChoice === 1);
			if (firstChoice) {
				// 【修复】使用 level 字段
				selectedLevelNum.value = firstChoice.level;
			}
		}
	};

	const goToMemberDetails = () => {
		// 【修复】使用 selectedLevelNum
		uni.navigateTo({
			url: `/pages/my-memberDetails/my-memberDetails?level=${selectedLevelNum.value || 1}`
		});
	};

	// --- 核心支付逻辑 ---

	const createOrder = async () => {
		// 找到选中的对象
		const selectedLevelObj = memberLevels.value.find(l => l.level === selectedLevelNum.value);

		let payload = {
			userId: userInfo.value.id,
			payType: currentTab.value,
			remark: currentTab.value === 2 ?
				`购买会员:${selectedLevelObj?.name}` : '充值智米'
		};

		if (currentTab.value === 2) {
			// 会员充值
			// 【修复】尝试传 id，如果 id 不存在，传 level，或者根据后端文档需求
			// 这里优先取 id，没有则取 level (视后端接口定义而定)
			payload.levelId = selectedLevelObj.id || selectedLevelObj.level;
		} else {
			// 智米充值
			payload.amount = parseFloat(payAmount.value);
		}

		console.log('1. 开始创建订单, 参数:', payload);

		const {
			data,
			error
		} = await request('/app-api/member/user-post-pay-record/create', {
			method: 'POST',
			data: payload
		});

		if (error) throw new Error(error);
		return data;
	};

	const getPayParams = async (orderNo) => {
		console.log('正在获取支付签名，订单号:', orderNo);
		const {
			data,
			error
		} = await request('/app-api/member/user-post-pay-record/pay', {
			method: 'POST',
			data: {
				orderNo: orderNo.orderNo
			}
		});
		if (error) throw new Error(error);
		return data;
	};

	const requestWxPayment = (params) => {
		return new Promise((resolve, reject) => {
			uni.requestPayment({
				provider: 'weixin',
				...params,
				success: (res) => resolve(res),
				fail: (err) => {
					if (err.errMsg.includes('cancel')) {
						reject(new Error('用户取消支付'));
					} else {
						reject(new Error('支付失败，请重试'));
					}
				}
			});
		});
	};

	const handleRecharge = async () => {
		if (!checkLoginGuard()) return;

		const amount = parseFloat(payAmount.value);

		// 允许 0 元订单 (如免费升级)
		if (amount < 0) {
			return uni.showToast({
				title: '支付金额异常',
				icon: 'none'
			});
		}
		if (currentTab.value === 1 && amount < 1) {
			return uni.showToast({
				title: '智米最小充值 1 元',
				icon: 'none'
			});
		}

		isPaying.value = true;
		uni.showLoading({
			title: '正在创建订单...',
			mask: true
		});

		try {
			const orderNo = await createOrder();

			// 如果是 0 元订单，可能不需要拉起支付，视后端逻辑而定
			// 这里假设所有订单都要走获取参数流程

			uni.showLoading({
				title: '请求支付中...'
			});
			const payParams = await getPayParams(orderNo);
			await requestWxPayment(payParams);

			uni.hideLoading();
			uni.showToast({
				title: '支付成功',
				icon: 'success',
				duration: 2000
			});

			setTimeout(() => {
				uni.navigateBack();
			}, 1500);

		} catch (error) {
			uni.hideLoading();
			const msg = error.message || '支付异常';
			if (msg === '用户取消支付') {
				uni.showToast({
					title: '已取消支付',
					icon: 'none'
				});
			} else {
				uni.showModal({
					title: '支付失败',
					content: msg,
					showCancel: false
				});
			}
		} finally {
			isPaying.value = false;
		}
	};
</script>

<style lang="scss" scoped>
	/* 保持原有样式不变 */
	$theme-color: #FF6E00;
	$bg-color: #f5f6fa;

	.recharge-container {
		min-height: 100vh;
		background-color: $bg-color;
		display: flex;
		flex-direction: column;
		padding-bottom: 350rpx;
	}

	/* ... (此处省略未改动的样式，请保留你原有的样式代码) ... */

	/* 为了完整性，这里补充关键样式 */
	.tabs-header {
		display: flex;
		background-color: #fff;
		padding: 0 30rpx;
		height: 100rpx;
		align-items: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 30rpx;
			color: #666;
			position: relative;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 500;
			transition: all 0.3s;

			&.active {
				color: $theme-color;
				font-size: 32rpx;
				font-weight: bold;
			}

			.active-line {
				position: absolute;
				bottom: 0;
				width: 40rpx;
				height: 6rpx;
				background-color: $theme-color;
				border-radius: 6rpx;
			}
		}
	}

	.content-body {
		padding: 30rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		margin-top: 10rpx;
	}

	/* 智米充值样式 */
	.amount-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		margin-bottom: 40rpx;

		.grid-item {
			background-color: #fff;
			border: 2rpx solid transparent;
			border-radius: 16rpx;
			padding: 30rpx 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			transition: all 0.2s;

			.item-price {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.item-desc {
				font-size: 22rpx;
				color: #999;
				margin-top: 6rpx;
			}

			&.active {
				border-color: $theme-color;
				background-color: #fff8f0;

				.item-price {
					color: $theme-color;
				}

				.item-desc {
					color: $theme-color;
				}
			}
		}
	}

	.custom-amount-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;

		.input-wrapper {
			display: flex;
			align-items: center;
			border-bottom: 1rpx solid #eee;
			padding: 20rpx 0;
			margin-top: 10rpx;

			.custom-input {
				flex: 1;
				font-size: 40rpx;
				font-weight: bold;
				height: 60rpx;
			}

			.unit {
				font-size: 28rpx;
				color: #333;
				margin-left: 10rpx;
			}
		}

		.tip-text {
			font-size: 24rpx;
			color: #999;
			margin-top: 20rpx;
		}
	}

	/* 会员充值样式 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		margin-top: 10rpx;

		.current-level-info {
			font-size: 30rpx;
			color: #333;
			font-weight: bold;

			.highlight {
				color: $theme-color;
				margin-left: 10rpx;
			}
		}
	}

	/* 查看详情链接样式 */
	.details-link {
		font-size: 26rpx;
		color: $theme-color;
		display: flex;
		align-items: center;
		padding: 10rpx;
	}

	.details-link uni-icons {
		margin-left: 4rpx;
	}

	.member-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.member-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 2rpx solid transparent;
		position: relative;
		overflow: hidden;

		/* 推荐标签样式 */
		.recommend-tag {
			position: absolute;
			top: 0;
			left: 0;
			background: linear-gradient(to right, #ff4d4f, #ff7875);
			color: white;
			font-size: 20rpx;
			padding: 4rpx 12rpx;
			border-bottom-right-radius: 12rpx;
		}

		&.active {
			border-color: $theme-color;
			background-color: #fff8f0;
		}

		&.disabled {
			background-color: #f0f0f0;
			opacity: 0.8;

			.level-name,
			.original-price,
			.currency,
			.price {
				color: #999 !important;
			}

			.radio-circle {
				background-color: #e0e0e0;
				border-color: #ccc;
			}
		}

		.disabled-mask {
			position: absolute;
			right: 0;
			top: 0;
			background-color: #ccc;
			color: #fff;
			font-size: 20rpx;
			padding: 4rpx 12rpx;
			border-bottom-left-radius: 12rpx;
		}

		.card-left {
			.level-name {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.level-desc {
				font-size: 24rpx;
				color: #666;
			}

			.original-price {
				font-size: 24rpx;
				color: #999;
				text-decoration: line-through;
				margin-top: 4rpx;
			}
		}

		.card-right {
			display: flex;
			align-items: center;

			.price-label {
				font-size: 22rpx;
				color: #999;
				margin-right: 10rpx;
			}

			.price-wrapper {
				display: flex;
				align-items: baseline;
				margin-right: 20rpx;
			}

			.currency {
				font-size: 24rpx;
				color: #333;
			}

			.price {
				font-size: 40rpx;
				font-weight: bold;
				color: #333;
				margin-left: 4rpx;
			}

			.radio-circle {
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				border: 2rpx solid #ddd;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #fff;

				.radio-inner {
					width: 20rpx;
					height: 20rpx;
					border-radius: 50%;
					background-color: $theme-color;
				}
			}
		}

		&.active .radio-circle {
			border-color: $theme-color;
		}

		&.active .price,
		&.active .currency {
			color: $theme-color;
		}
	}

	.price-diff-tip {
		margin-top: 30rpx;
		font-size: 22rpx;
		color: #999;
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: flex-start;
		line-height: 1.5;

		uni-icons {
			margin-right: 8rpx;
			margin-top: 4rpx;
		}
	}

	/* 底部结算栏 */
	.footer-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
		display: flex;
		flex-direction: column;
	}

	.compliance-text {
		font-size: 22rpx;
		color: #999;
		background-color: #fcfcfc;
		padding: 16rpx 30rpx;
		line-height: 1.4;
		border-bottom: 1rpx solid #eee;
	}

	.action-area {
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		justify-content: space-between;

		.total-info {
			display: flex;
			align-items: baseline;

			.label {
				font-size: 28rpx;
				color: #333;
			}

			.amount {
				font-size: 40rpx;
				font-weight: bold;
				color: $theme-color;
			}
		}

		.pay-btn {
			background: linear-gradient(135deg, $theme-color, #ff8c00);
			color: white;
			font-size: 30rpx;
			font-weight: bold;
			padding: 0 60rpx;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			margin: 0;

			&[disabled] {
				background: #ccc;
				color: #fff;
			}

			&::after {
				border: none;
			}
		}
	}
</style>