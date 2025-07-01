<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="user-header">
			<view class="user-info">
				<view class="avatar">
					<!-- 动态绑定头像，提供一个默认头像以防链接为空 -->
					<image class="avatar-img" :src="userInfo.avatar || '../../static/images/default-avatar.png'" />
				</view>
				<view class="user-details">
					<view class="user-name">
						<!-- 动态绑定昵称和会员等级 -->
						{{ userInfo.nickname }}
						<text class="badge" v-if="userInfo.topUpLevel && userInfo.topUpLevel.name">{{ userInfo.topUpLevel.name }}</text>
					</view>
					<!-- 使用计算属性动态显示职位和公司 -->
					<view class="user-title">{{ userTitleAndCompany }}</view>
					<view class="user-company">
						<!-- 动态绑定邀请人 -->
						我的邀请人：<span style="font-weight: bold;">{{ userInfo.parentName || '无' }}</span>
					</view>
				</view>
			</view>
			<view class="edit-btn" @tap="onEdit">编辑</view>
		</view>

		<!-- 账户信息 -->
		<view class="account-section">
			<view class="section-header">
				<text class="section-title-main">账户信息</text>
				<text class="view-all" @tap="onViewAll">查看全部 ›</text>
			</view>
			<view class="account-grid">
				<!-- v-for 循环使用计算属性 accountList -->
				<view class="account-item" v-for="item in accountList" :key="item.label">
					<view class="account-value">{{ item.value }}</view>
					<view class="account-label">{{ item.label }}</view>
				</view>
			</view>
		</view>

		<!-- AI名片 -->
		<view class="card-section">
			<view class="section-header">
				<text class="section-title-main">我的名片</text>
				<text class="view-all" @tap="onViewDetail">查看 ›</text>
			</view>

			<view class="ai-card">
				<view class="card-top">
					<view class="card-avatar">
						<image class="avatar-img" :src="userInfo.avatar || '../../static/images/default-avatar.png'" />
					</view>
					<view class="card-details">
						<view class="card-name">
							<!-- 优先显示真实姓名，否则显示昵称 -->
							{{ userInfo.realName || userInfo.nickname }} 
							<text class="vip-badge" v-if="userInfo.topUpLevel && userInfo.topUpLevel.name">{{ userInfo.topUpLevel.name }}</text>
						</view>
						<!-- 动态绑定职位和公司 -->
						<view class="card-position" v-if="userInfo.professionalTitle"><text class="iconfont">👤</text> {{ userInfo.professionalTitle }}</view>
						<view class="card-company" v-if="userInfo.companyName"><text class="iconfont">🏢</text> {{ userInfo.companyName }}</view>
					</view>
				</view>

				<view class="contact-info">
					<!-- 动态绑定邀请码并传入复制函数 -->
					<view class="contact-item" @tap="copyToClipboard(userInfo.shardCode)">
						<text class="iconfont">我的邀请码：</text>
						<text style="font-weight: bold;">{{ userInfo.shardCode || '暂无' }}</text>
						<text class="copy-btn">复制</text>
					</view>
				</view>

				<view class="qrcode-section">
					<text class="qrcode-title">微信二维码 - 扫码添加好友</text>
					<view class="qrcode-container">
						<!-- 动态绑定微信二维码，提供一个默认图 -->
						<image class="qrcode-img" :src="userInfo.wechatQrCodeUrl || '../../static/images/default-qrcode.png'" />
					</view>
					<view class="qrcode-actions">
						<button class="qrcode-btn" @tap="saveQrcode">保存</button>
						<button class="qrcode-btn" @tap="shareQrcode">分享</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
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

		<button style="margin-top: 30rpx;background-color: red;color: white;" @click="skipToLogin">退出登录</button>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed // 引入 computed
	} from 'vue'
	import request from '../../utils/request.js';

	onMounted(() => {
		getUserInfo();
	});

	const userInfo = ref({})

	//获取用户的基本信息
	const getUserInfo = async () => {
		try {
			const result = await request('/app-api/member/user/get', {
				method: 'GET',
			});
			if (result) {
				userInfo.value = result.data;
				console.log('getUserInfo userInfo:', userInfo.value);
			} else {
				console.log('请求业务失败:', result.msg);
			}
		} catch (error) {
			console.log('请求失败:', error);
		}
	};
	
	// 使用 computed 创建动态的账户信息列表
	const accountList = computed(() => {
		const user = userInfo.value;
		return [{
				// API返回的是 currExperience，代表当前贡分
				value: user.currExperience || 0,
				label: '我的贡分'
			},
			{
				value: user.activityCount || 0,
				label: '我的活动'
			},
			{
				value: user.postCount || 0,
				label: '我的商机'
			},
			{
				value: user.point || 0,
				label: '我的智米'
			}
		]
	})
	
	// 使用 computed 优雅地处理职位和公司的显示逻辑
	const userTitleAndCompany = computed(() => {
		const title = userInfo.value.professionalTitle;
		const company = userInfo.value.companyName;
		if (title && company) {
			return `${title} | ${company}`;
		}
		// 如果只有一个，或者都没有，则只显示有的那一个，或显示默认文本
		return title || company || '暂未设置职位和公司';
	});


	const featureList = ref([{
			name: '我的活动',
			desc: '已报名/已发布的活动',
			icon: '../../static/icon/活动.png',
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
			desc: '收藏的活动和商机',
			icon: '../../static/icon/收藏.png',
			path: '/pages/my-collection/my-collection'
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

	const onViewAll = () => {
		uni.navigateTo({
			url: '/pages/my-account/my-account'
		})
	}

	const copyToClipboard = (text) => {
		if (!text) {
			uni.showToast({ title: '没有可复制的内容', icon: 'none' });
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
		})
	}
</script>

<style scoped>
	/* 主页面样式 */

	.container {
		padding: 30rpx;
	}

	.user-header {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		padding: 40rpx;
		border-radius: 20rpx;
		color: white;
		position: relative;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 20rpx;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
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
	}

	.user-title,
	.user-company {
		font-size: 24rpx;
		margin-top: 6rpx;
	}

	.edit-btn {
		position: absolute;
		right: 30rpx;
		top: 30rpx;
		font-size: 24rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		cursor: pointer;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.section-title-main {
		font-size: 32rpx;
		font-weight: bold;
	}

	.view-all {
		font-size: 24rpx;
		color: #3a7bd5;
		cursor: pointer;
	}

	.account-section,
	.features-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-top: 50rpx;
	}

	.account-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
	}

	.account-item {
		text-align: center;
	}

	.account-value {
		font-size: 36rpx;
		color: #FF6B00;
		font-weight: bold;
	}

	.account-label {
		font-size: 24rpx;
		color: #666;
	}

	.feature-item {
		display: flex;
		align-items: center;
		background: #f9f9f9;
		padding: 20rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
	}

	.feature-icon {
		width: 60rpx;
		height: 60rpx;
		font-size: 32rpx;
		color: #FF6B00;
		margin-right: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.feature-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.feature-desc {
		font-size: 24rpx;
		color: #999;
	}

	.chevron-icon {
		font-size: 30rpx;
		color: #ccc;
		margin-left: auto;
	}

	/* MyCard部分样式 */

	.card-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.ai-card {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		padding: 30rpx;
		border-radius: 20rpx;
		color: white;
	}

	.card-top {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.card-avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 30rpx;
		overflow: hidden;
		margin-right: 20rpx;
	}

	.card-name {
		font-size: 36rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.vip-badge {
		background: #ffd700;
		color: #8a6d00;
		padding: 6rpx 14rpx;
		border-radius: 20rpx;
		font-size: 20rpx;
		margin-left: 10rpx;
	}

	.card-position,
	.card-company {
		font-size: 26rpx;
		margin-bottom: 5rpx;
		opacity: 0.95;
	}

	.contact-info {
		display: grid;
		grid-template-columns: 1fr;
		gap: 15rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 20rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
	}

	.contact-item {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		cursor: pointer;
	}

	.copy-btn {
		margin-left: auto;
		font-size: 24rpx;
		color: #fff;
		background: rgba(255, 255, 255, 0.3);
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
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
	}

	.qrcode-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.qrcode-actions {
		display: flex;
		justify-content: center;
		gap: 50rpx;
		margin: 20rpx 0;
	}

	.qrcode-btn {
		background-color: #FF8F3D;
		color: white;
		padding: 10rpx 100rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		cursor: pointer;
	}
</style>