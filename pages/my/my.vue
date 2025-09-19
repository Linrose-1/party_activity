<template>
	<view class="container">
		<!-- ==================== 数字身份模块 ==================== -->
		<view class="user-header">
			<!-- 模块标题与操作按钮 -->
			<view class="section-header">
				<text class="section-title-main white-text">数字身份</text>
				<!-- 只有登录后才显示操作按钮 -->
				<view class="header-actions" v-if="isLogin">
					<text class="header-action-btn" @tap="onEdit">编辑 ›</text>
					<text class="header-action-btn" @tap="onViewAccountDetail">查看 ›</text>
				</view>
			</view>

			<!-- 根据登录状态显示不同内容 -->
			<template v-if="isLogin">
				<!-- 用户信息主体 -->
				<!-- 整个区域可点击，跳转到账户详情 -->
				<view class="user-info-wrapper" @tap="onViewAccountDetail">
					<view class="user-info-main">
						<!-- 头像区域，阻止事件冒泡，单独处理编辑跳转 -->
						<view class="avatar" @click.stop="onEdit">
							<image class="avatar-img"
								:src="userInfo.avatar || '../../static/images/default-avatar.png'" />
						</view>
						<view class="user-details">
							<view class="user-name">
								{{ userInfo.nickname || '未设置昵称' }}
								<text class="badge"
									v-if="userInfo.topUpLevel && userInfo.topUpLevel.name">{{ userInfo.topUpLevel.name }}</text>
							</view>
							<view v-if="userInfo.nickname === '微信用户'" class="edit-prompt-tip" @click="onEdit">
								点击设置个性化昵称 >
							</view>
							<view class="user-title">{{ userTitleAndCompany }}</view>
							<view class="user-company">
								我的邀请人：<span style="font-weight: bold;">{{ userInfo.parentName || '无' }}</span>
							</view>
						</view>
					</view>
					<text v-if="userInfo.id" class="user-id-display">ID: {{ userInfo.virtualId }}</text>
				</view>

				<!-- 账户信息网格 -->
				<view class="account-grid">
					<view class="account-item" v-for="item in accountList" :key="item.label"
						@tap.stop="navigateToAccountDetail(item)">
						<view class="account-value">{{ item.value }}</view>
						<view class="account-label">{{ item.label }}</view>
					</view>
				</view>
			</template>

			<!-- 如果未登录，显示登录提示 -->
			<template v-else>
				<view class="login-prompt" @click="skipToLogin">
					<view class="login-prompt-avatar">
						<uni-icons type="person-filled" size="30" color="#FF8C00"></uni-icons>
					</view>
					<view class="login-prompt-text">点击去登录</view>
					<view class="login-prompt-arrow">›</view>
				</view>
			</template>
		</view>

		<!-- ==================== 名片分享模块 ==================== -->
		<view class="card-section">
			<view class="section-header">
				<text class="section-title-main">名片分享</text>
				<text class="view-all" @tap="onViewDetail">分享 ›</text>
			</view>
			<view class="ai-card">
				<view class="qrcode-section" @tap="onViewDetail">
					<text class="qrcode-title">微信二维码 - 扫码添加好友</text>
					<view class="qrcode-container">
						<image class="qrcode-img"
							:src="userInfo.wechatQrCodeUrl || '../../static/images/default-qrcode.png'" />
					</view>
				</view>
				<view class="contact-info">
					<view class="contact-item" @tap="copyToClipboard(userInfo.shardCode)">
						<text class="iconfont">我的邀请码：</text>
						<text style="font-weight: bold;">{{ userInfo.shardCode || '暂无' }}</text>
						<text class="copy-btn">复制</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ==================== 功能中心模块 ==================== -->
		<view class="features-section">
			<view class="section-header">
				<text class="section-title-main">功能中心</text>
			</view>
			<view class="features-list">
				<view class="feature-item" v-for="item in featureList" :key="item.name"
					@tap="navigateToFeature(item.path)">
					<img :src="item.icon" alt="" class="feature-icon" />
					<view class="feature-content">
						<view class="feature-name">{{ item.name }}</view>
						<view class="feature-desc">{{ item.desc }}</view>
					</view>
					<text class="chevron-icon">›</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed // 引入 computed
	} from 'vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'; // 引入 onLoad
	import request from '../../utils/request.js';

	onMounted(() => {
		getUserInfo();
	});

	onLoad(() => {
		getUserInfo();
	});

	onShow(() => {
		checkLoginStatusAndFetchData();

	});

	const userInfo = ref({})
	const isLogin = ref(false);

	// 【新增】一个整合的函数，用于检查登录状态并获取数据
	const checkLoginStatusAndFetchData = () => {
		const token = uni.getStorageSync('token'); // 或者检查 userId
		if (token) {
			isLogin.value = true;
			// 只有登录了才去获取用户信息
			getUserInfo();
		} else {
			isLogin.value = false;
			// 未登录时，清空旧的用户信息，防止显示上个用户的数据
			userInfo.value = {};
		}
	};

	//获取用户的基本信息
	const getUserInfo = async () => {
		try {
			// 【优化】只有在 isLogin 为 true 时才发请求，双重保险
			if (!isLogin.value) return;

			const {
				data,
				error
			} = await request('/app-api/member/user/get', {
				method: 'GET',
			});
			if (!error && data) {
				userInfo.value = data;
				console.log('getUserInfo userInfo:', userInfo.value);
			} else {
				console.log('获取用户信息失败:', error);
				// 如果获取用户信息失败（比如token过期），也应该更新为未登录状态
				isLogin.value = false;
				userInfo.value = {};
			}
		} catch (err) {
			console.log('请求异常:', err);
			isLogin.value = false;
			userInfo.value = {};
		}
	};

	// 使用 computed 创建动态的账户信息列表
	const accountList = computed(() => {
		const user = userInfo.value;
		return [{
				value: user.currExperience || 0,
				label: '我的贡分',
				path: '/pages/my-account/my-account'
			},
			{
				value: user.activityCount || 0,
				label: '我的聚会',
				path: '/pages/my-active/my-active'
			},
			{
				value: user.postCount || 0,
				label: '我的商机',
				path: '/pages/my-opportunity/my-opportunity'
			},
			{
				value: user.point || 0,
				label: '我的智米',
				path: '/pages/my-account/my-account'
			}
		]
	})

	// 使用 computed 优雅地处理职位和公司的显示逻辑
	// 【优化】处理未登录时的情况
	const userTitleAndCompany = computed(() => {
		// 1. 未登录时的判断保持不变
		if (!isLogin.value) return '登录后查看';

		// 2. 【核心修改】从完整的字符串中提取第一项
		const titlesString = userInfo.value.professionalTitle; // e.g., "XXX协会会长,it工作者"
		const companiesString = userInfo.value.companyName; // e.g., "公司一,公司2"

		let firstTitle = '';
		// 如果 professionalTitle 存在，则分割字符串并取第一个元素
		if (titlesString) {
			firstTitle = titlesString.split(',')[0].trim();
		}

		let firstCompany = '';
		// 如果 companyName 存在，则分割字符串并取第一个元素
		if (companiesString) {
			firstCompany = companiesString.split(',')[0].trim();
		}

		// 3. 根据提取出的第一项进行拼接
		if (firstTitle && firstCompany) {
			return `${firstTitle} | ${firstCompany}`;
		}

		// 4. 如果只有一个存在，或都为空，则返回存在的那个或默认文本
		return firstTitle || firstCompany || '暂未设置职位和公司';
	});

	const featureList = ref([{
			name: '我的订单',
			desc: '查看您的所有支付订单',
			icon: '../../static/icon/订单.png',
			path: '/pages/my-order/my-order'
		},
		{
			name: '我的聚会',
			desc: '已报名/已发布的聚会',
			icon: '../../static/icon/聚会.png',
			path: '/pages/my-active/my-active'
		},
		{
			name: '我的关注',
			desc: '查看您关注的商友',
			icon: '../../static/icon/加关注.png',
			path: '/pages/my-follow/my-follow'
		},
		{
			name: '我的商机',
			desc: '查看您发布的商机',
			icon: '../../static/icon/商机.png',
			path: '/pages/my-opportunity/my-opportunity'
		},
		{
			name: '我的收藏',
			desc: '收藏的聚会和商机',
			icon: '../../static/icon/收藏.png',
			path: '/pages/my-collection/my-collection'
		},
		{
			name: '我的推荐',
			desc: '查看您的推荐店铺',
			icon: '../../static/icon/推荐.png',
			path: '/pages/my-shopRecommend/my-shopRecommend'
		},
		{
			name: '我的聚店',
			desc: '查看您的聚店信息',
			icon: '../../static/icon/店铺.png',
			path: '/pages/my-shop/my-shop'
		},
		{
			name: '系统建议',
			desc: '提供您对本平台的建议',
			icon: '../../static/icon/系统建议.png',
			path: '/pages/my-systemSuggestions/my-systemSuggestions'
		},
		{
			name: '用户协议',
			desc: '查看用户协议、隐私协议等',
			icon: '../../static/icon/protocols.png',
			path: '/pages/user-agreement/user-agreement'
		},
	])

	const navigateToFeature = (path) => {
		uni.navigateTo({
			url: path
		})
	}

	const onEdit = () => {
		uni.navigateTo({
			url: '/pages/my-edit/my-edit'
		})
	}

	const onViewAccountDetail = () => {
		uni.navigateTo({
			url: '/pages/my-account/my-account'
		});
	}

	const navigateToAccountDetail = (item) => {
		if (item && item.path) {
			uni.navigateTo({
				url: item.path
			});
		}
	};


	const copyToClipboard = (text) => {
		if (!text) {
			uni.showToast({
				title: '没有可复制的内容',
				icon: 'none'
			});
			return;
		}
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'none'
				})
			}
		})
	}

	const saveQrcode = () => {
		uni.showToast({
			title: '二维码已保存',
			icon: 'none'
		})
	}

	const shareQrcode = () => {
		uni.showToast({
			title: '二维码已分享',
			icon: 'none'
		})
	}

	const onViewDetail = () => {
		uni.navigateTo({
			url: '/pages/my-businessCard/my-businessCard'
		})
	}

	const skipToLogin = () => {
		uni.navigateTo({
			url: '/pages/index/index'
			// url: '/pages/login/login'
		})
	}
</script>

<style scoped>
	/* --- 页面基础 --- */
	.container {
		padding: 30rpx;
		background-color: #f9f9f9;
	}

	/* --- 1. 数字身份模块 (user-header) --- */
	.user-header {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		padding: 30rpx;
		border-radius: 20rpx;
		color: white;
		display: flex;
		flex-direction: column;
		margin-bottom: 30rpx;
	}

	/* 1.1 模块头部：标题与操作按钮 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		width: 100%;
	}

	.section-title-main {
		font-size: 32rpx;
		font-weight: bold;
		color: #FF8000;
	}

	.white-text {
		color: white;
	}

	.header-actions {
		display: flex;
		gap: 20rpx;
	}

	.header-action-btn {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.2);
		padding: 8rpx 18rpx;
		border-radius: 30rpx;
	}

	/* ==================== 【【【核心修复】】】 ==================== */
	/* 1.2 用户信息主体 */
	.user-info-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		/* (1) 关键：改为垂直堆叠 */
	}

	.user-info-main {
		display: flex;
		align-items: center;
		width: 100%;
		/* 确保 main 部分撑满宽度 */
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 10rpx;
		overflow: hidden;
		margin-right: 30rpx;
		flex-shrink: 0;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-details {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
	}

	.badge {
		background: #ffd700;
		color: #8a6d00;
		padding: 6rpx 14rpx;
		border-radius: 20rpx;
		margin-left: 10rpx;
		font-size: 22rpx;
		flex-shrink: 0;
	}

	.user-title,
	.user-company {
		font-size: 24rpx;
		margin-top: 6rpx;
		opacity: 0.9;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-id-display {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
		background-color: rgba(0, 0, 0, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 10rpx;
		align-self: flex-end;
		/* (2) 关键：使其在自己的行内靠右 */
		margin-top: 10rpx;
		/* (3) 关键：与上方信息拉开距离 */
	}

	/* ========================================================== */

	/* 1.3 账户信息网格 */
	.account-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 1rpx solid rgba(255, 255, 255, 0.2);
	}

	.account-item {
		text-align: center;
		padding: 10rpx 0;
		border-radius: 12rpx;
		transition: background-color 0.2s;
	}

	.account-item:active {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.account-value {
		font-size: 36rpx;
		color: #fff;
		font-weight: bold;
	}

	.account-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	/* 1.4 未登录状态 */
	.login-prompt {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
	}

	.login-prompt-avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.login-prompt-text {
		font-size: 36rpx;
		font-weight: bold;
		color: white;
	}

	.login-prompt-arrow {
		margin-left: auto;
		font-size: 40rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	/* --- 2. 名片分享模块 (card-section) --- */
	.card-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.card-section .section-header {
		margin-bottom: 20rpx;
	}

	.view-all {
		font-size: 26rpx;
		padding: 8rpx 18rpx;
		border-radius: 30rpx;
		background: #f5f5f5;
		color: #666;
	}

	.ai-card {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		padding: 30rpx;
		border-radius: 20rpx;
		color: white;
	}

	.qrcode-section {
		text-align: center;
		color: white;
	}

	.qrcode-title {
		font-size: 26rpx;
		margin-bottom: 20rpx;
	}

	.qrcode-container {
		width: 200rpx;
		height: 200rpx;
		margin: 0 auto;
		background: white;
		padding: 10rpx;
		border-radius: 12rpx;
		margin-top: 20rpx;
	}

	.qrcode-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.contact-info {
		display: grid;
		grid-template-columns: 1fr;
		gap: 15rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 20rpx;
		border-radius: 20rpx;
		margin: 30rpx 0;
	}

	.contact-item {
		display: flex;
		align-items: center;
		font-size: 26rpx;
	}

	.copy-btn {
		margin-left: auto;
		font-size: 24rpx;
		color: #fff;
		background: rgba(255, 255, 255, 0.3);
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
		flex-shrink: 0;
	}

	/* --- 3. 功能中心模块 (features-section) --- */
	.features-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.features-list {
		margin-top: 20rpx;
	}

	.feature-item {
		display: flex;
		align-items: center;
		background: #f9f9f5;
		padding: 20rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
	}

	.feature-item:last-child {
		margin-bottom: 0;
	}

	.feature-icon {
		width: 60rpx;
		height: 60rpx;
		margin-right: 20rpx;
	}

	.feature-content {
		flex: 1;
		min-width: 0;
	}

	.feature-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.feature-desc {
		font-size: 24rpx;
		color: #999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chevron-icon {
		font-size: 30rpx;
		color: #ccc;
		margin-left: auto;
	}
</style>