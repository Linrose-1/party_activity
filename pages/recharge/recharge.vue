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
				<view class="section-header">
					<view class="section-title">👑 选择会员等级</view>
					<view class="details-link" @click="goToMemberDetails">
						查看权益详情
						<uni-icons type="right" size="12" color="#FF6E00"></uni-icons>
					</view>
				</view>

				<view class="member-list">
					<view v-for="(level, index) in memberLevels" :key="index" class="member-card"
						:class="{ active: selectedMemberId === level.id, recommended: level.isRecommended }"
						@click="selectMemberLevel(level)">

						<!-- 推荐标签 -->
						<view v-if="level.isRecommended" class="recommend-tag">推荐</view>

						<view class="card-left">
							<view class="level-name">{{ level.name }}</view>
							<view class="level-desc">{{ level.desc }}</view>
						</view>
						<view class="card-right">
							<text class="currency">¥</text>
							<text class="price">{{ level.price }}</text>
							<text class="period">/{{ level.period }}</text>
							<view class="radio-circle">
								<view v-if="selectedMemberId === level.id" class="radio-inner"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ==================== 底部结算区 ==================== -->
		<view class="footer-bar">
			<!-- 合规提示文案 -->
			<view class="compliance-text">
				基于国家对积分的管理条例，购买智米后，智米用于平台商业生态的服务与产品消耗，智米的使用余额不能提现与变现，请确认后支付。
			</view>

			<view class="action-area">
				<view class="total-info">
					<view class="label">应付金额：</view>
					<view class="amount">¥ {{ payAmount || '0.00' }}</view>
				</view>
				<button class="pay-btn" @click="handleRecharge" :disabled="isPaying || payAmount <= 0"
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
	const currentTab = ref(1); // 1-智米, 2-会员
	const isPaying = ref(false);
	const userInfo = ref(null);

	// --- 智米充值数据 ---
	const zhimiOptions = [10, 20, 50, 100, 500];
	const selectedZhimiIndex = ref(0); // 默认选中第一个
	const customAmount = ref('');

	// --- 会员充值数据 (可以是静态配置，也可以从后台获取) ---
	const memberLevels = ref([{
			id: 1,
			name: '玄铁会员',
			price: 10,
			period: '月',
			desc: '基础功能体验',
			isRecommended: false
		},
		{
			id: 2,
			name: '青铜会员',
			price: 100,
			period: '月',
			desc: '进阶商友特权',
			isRecommended: false
		},
		{
			id: 3,
			name: '白银会员',
			price: 365,
			period: '年',
			desc: '超高性价比首选',
			isRecommended: true
		},
		{
			id: 4,
			name: '黄金会员',
			price: 3650,
			period: '年',
			desc: '尊享全部权益',
			isRecommended: false
		},
		{
			id: 5,
			name: '黑钻会员',
			price: 36500,
			period: '年',
			desc: '顶级身份象征',
			isRecommended: false
		}
	]);
	const selectedMemberId = ref(3); // 默认选中白银

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
			return 0;
		} else {
			// 会员模式
			const level = memberLevels.value.find(item => item.id === selectedMemberId.value);
			return level ? level.price.toFixed(2) : 0;
		}
	});

	// --- 生命周期 ---
	onLoad((options) => {
		if (options.type === 'membership') {
			currentTab.value = 2;
		}
	});

	onMounted(() => {
		fetchUserInfo();
		// fetchMemberLevels();
	});

	// --- 交互逻辑 ---
	const switchTab = (index) => {
		currentTab.value = index;
		// 切换时重置一些状态
		if (index === 1) {
			customAmount.value = '';
			selectedZhimiIndex.value = 0;
		}
	};

	const selectZhimiOption = (index) => {
		selectedZhimiIndex.value = index;
		customAmount.value = ''; // 清空自定义输入
	};

	const onCustomInput = () => {
		if (customAmount.value) {
			selectedZhimiIndex.value = -1; // 取消快捷选中
		}
	};

	const selectMemberLevel = (level) => {
		selectedMemberId.value = level.id;
	};

	const fetchUserInfo = async () => {
		const {
			data
		} = await request('/app-api/member/user/get');
		if (data) userInfo.value = data;
	};

	// 从后端获取会员等级
	// const fetchMemberLevels = async () => {
	// 	const {
	// 		data,
	// 		error
	// 	} = await request('/app-api/member/top-up-level/list');
	// 	if (!error && data) {
	// 		// 排序并设置默认选中
	// 		memberLevels.value = data.sort((a, b) => a.experience - b.experience);
	// 		// ... (设置 selectedMemberId 的逻辑)
	// 	}
	// };

	// 跳转到会员详情页
	const goToMemberDetails = () => {
		// 找到当前选中的等级对象
		const currentLevel = memberLevels.value.find(item => item.id === selectedMemberId.value);

		// 获取对应的 level 值（后端用于排序的数字，例如 1, 2, 3）
		// 如果没选中，默认传 1
		const targetLevelNum = currentLevel ? currentLevel.level : 1;

		uni.navigateTo({
			// 带上参数，让详情页自动定位到对应的 Tab
			url: `/pages/my-memberDetails/my-memberDetails?level=${targetLevelNum}`
		});
	};

	// --- 核心支付逻辑 ---

	/**
	 * 第一步：创建订单
	 * 根据后端新需求调整参数：
	 * 1. 会员充值：传 payType=2, levelId, userId (不传 amount)
	 * 2. 智米充值：传 payType=1, amount, userId
	 */
	const createOrder = async () => {
		let payload = {
			userId: userInfo.value.id,
			payType: currentTab.value, // 1-智米, 2-会员
			remark: currentTab.value === 2 ?
				`购买会员:${memberLevels.value.find(l=>l.id===selectedMemberId.value)?.name}` : '充值智米'
		};

		if (currentTab.value === 2) {
			// --- 会员充值特殊逻辑 ---
			// 1. 传递 levelId
			payload.levelId = selectedMemberId.value;
			// 2. 根据要求，不需要传 amount (后端自己算)
			// 如果你原来的逻辑依赖 amount 做前端展示，没关系，这里不传给后端即可
		} else {
			// --- 智米充值逻辑 (保持不变) ---
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

		// 后端直接返回 orderNo
		return data;
	};

	/**
	 * 2. 获取微信支付参数 (Step 2)
	 * 调用 /pay 接口
	 */
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
		return data; // 返回 { timeStamp, nonceStr, package ... }
	};

	/**
	 * 3. 调起微信支付 (Step 3)
	 */
	const requestWxPayment = (params) => {
		return new Promise((resolve, reject) => {
			uni.requestPayment({
				provider: 'weixin',
				timeStamp: params.timeStamp,
				nonceStr: params.nonceStr,
				package: params.package,
				signType: params.signType,
				paySign: params.paySign,
				success: (res) => {
					console.log('微信支付成功:', res);
					resolve(res);
				},
				fail: (err) => {
					console.error('微信支付失败/取消:', err);
					// 用户取消支付 err.errMsg 通常包含 'cancel'
					if (err.errMsg.includes('cancel')) {
						reject(new Error('用户取消支付'));
					} else {
						reject(new Error('支付失败，请重试'));
					}
				}
			});
		});
	};

	/**
	 * 主支付流程
	 */
	const handleRecharge = async () => {
		// 1. 权限与参数校验
		if (!checkLoginGuard()) return;

		if (parseFloat(payAmount.value) <= 0) {
			return uni.showToast({
				title: '支付金额异常',
				icon: 'none'
			});
		}

		// 智米充值最小金额限制
		if (currentTab.value === 1 && parseFloat(payAmount.value) < 1) {
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
			// Step 1: 创建订单，获取 orderNo
			const orderNo = await createOrder();
			console.log('订单创建成功，订单号:', orderNo);

			uni.showLoading({
				title: '请求支付中...'
			});

			// Step 2: 获取支付签名
			const payParams = await getPayParams(orderNo);

			// Step 3: 拉起微信支付
			await requestWxPayment(payParams);

			// Step 4: 支付成功处理
			uni.hideLoading();
			uni.showToast({
				title: '支付成功',
				icon: 'success',
				duration: 2000
			});

			// 延迟刷新或返回
			setTimeout(() => {
				// 刷新用户信息以更新余额/会员状态
				// fetchUserInfo(); 
				// 或者返回上一页
				uni.navigateBack();
			}, 1500);

		} catch (error) {
			uni.hideLoading();
			const msg = error.message || '支付异常';
			console.error('支付流程中断:', error);

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
	$theme-color: #FF6E00;
	$bg-color: #f5f6fa;

	.recharge-container {
		min-height: 100vh;
		background-color: $bg-color;
		display: flex;
		flex-direction: column;
		/* 留出底部操作栏的高度 */
		padding-bottom: 350rpx;
	}

	/* 顶部 Tab */
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

		/* 推荐的高亮样式 */
		&.recommended {
			/* border-color: #FFD700; */
		}

		.card-left {
			.level-name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 8rpx;
			}

			.level-desc {
				font-size: 24rpx;
				color: #999;
			}
		}

		.card-right {
			display: flex;
			align-items: baseline;

			.currency {
				font-size: 24rpx;
				color: #333;
			}

			.price {
				font-size: 40rpx;
				font-weight: bold;
				color: #333;
				margin: 0 4rpx;
			}

			.period {
				font-size: 24rpx;
				color: #999;
				margin-right: 20rpx;
			}

			.radio-circle {
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				border: 2rpx solid #ddd;
				display: flex;
				align-items: center;
				justify-content: center;

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
		/* 适配 iPhone X 底部安全区 */
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