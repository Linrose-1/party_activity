<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="user-header">
			<view class="user-info">
				<view class="avatar">
					<image class="avatar-img" src="https://randomuser.me/api/portraits/men/41.jpg" />
				</view>
				<view class="user-details">
					<view class="user-name">
						王明
						<text class="badge">黄金</text>
					</view>
					<view class="user-title">市场总监 | 创新科技有限公司</view>
					<view class="user-company">
						我的邀请人：<span style="font-weight: bold;">rose</span>
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
				<view class="account-item" v-for="item in accountList" :key="item.label">
					<view class="account-value">{{ item.value }}</view>
					<view class="account-label">{{ item.label }}</view>
				</view>
			</view>
		</view>

		<!-- AI名片，原MyCard.vue代码整合进这里 -->
		<view class="card-section">
			<view class="section-header">
				<text class="section-title-main">我的名片</text>
				<text class="view-all" @tap="onViewDetail">查看 ›</text>
			</view>

			<view class="ai-card">
				<view class="card-top">
					<view class="card-avatar">
						<image class="avatar-img" src="https://randomuser.me/api/portraits/men/41.jpg" />
					</view>
					<view class="card-details">
						<view class="card-name">
							王明 <text class="vip-badge">黄金</text>
						</view>
						<view class="card-position"><text class="iconfont">👤</text> 市场总监</view>
						<view class="card-company"><text class="iconfont">🏢</text> 创新科技有限公司</view>
					</view>
				</view>

				<view class="contact-info">
					<view class="contact-item" @tap="copyToClipboard('138138')">
						<text class="iconfont">我的邀请码：</text>
						<text style="font-weight: bold;">138138</text>
						<text class="copy-btn">复制</text>
					</view>
				</view>

				<view class="qrcode-section">
					<text class="qrcode-title">微信二维码 - 扫码添加好友</text>
					<view class="qrcode-container">
						<image class="qrcode-img"
							src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://weixin.qq.com/r/example" />
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
				<view class="feature-item" v-for="item in featureList" :key="item.name" @tap="navigateToFeature(item.path)">
					<!-- <view class="feature-icon"><text :class="item.icon"></text></view> -->
					<img :src="item.icon" alt="" class="feature-icon"/>
					<!-- <img src="../../static/icon/活动.png" alt="" class="feature-icon"/> -->
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
import { ref } from 'vue'

const accountList = ref([
	{ value: 266, label: '我的贡分' },
	{ value: 15, label: '我的活动' },
	{ value: 15, label: '我的商机' },
	{ value: 0, label: '我的智米' }
])

const featureList = ref([
  { 
    name: '我的活动', 
    desc: '已报名/已发布的活动', 
    icon: '../../static/icon/活动.png',
    path: '/pages/my-active/my-active' 
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
  }
])

const navigateToFeature = (path) => {
  uni.navigateTo({
    url: path
  })
}

const onEdit = () => {
	uni.navigateTo({
		url:'/pages/my-edit/my-edit'
	})
}

const onViewAll = () => {
	uni.showToast({
		title: '查看账户详情',
		icon: 'none'
	})
	uni.navigateTo({
		url:'/pages/my-account/my-account'
	})
}

// MyCard 组件中的函数也放这里
const copyToClipboard = (text) => {
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
	uni.showToast({
		title: '查看名片详情',
		icon: 'none'
	})
	uni.navigateTo({
		url:'/pages/my-businessCard/my-businessCard'
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
	margin-top: 30rpx;
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
	gap: 30rpx;
	margin-top: 20rpx;
}

.qrcode-btn {
	background: rgba(255, 255, 255, 0.3);
	color: white;
	padding: 10rpx 30rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
	cursor: pointer;
}
</style>
