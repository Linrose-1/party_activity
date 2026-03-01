<!-- /pages/user-detail/user-detail.vue -->
<template>
	<view class="page-container" v-if="userInfo">
		<!-- 1. 基本资料卡片 -->
		<view class="info-section">
			<view class="section-header">
				<view class="header-left">
					<uni-icons type="person-filled" size="24" :color="themeColor"></uni-icons>
					<text class="section-title">基本资料</text>
				</view>
				<!-- 编辑按钮：只有查看自己的主页时才显示 -->
				<view v-if="isSelf" class="header-right" @click="goToEdit">
					<uni-icons type="compose" size="20" color="#999"></uni-icons>
					<text class="edit-text">编辑</text>
				</view>
			</view>

			<view class="info-grid">
				<view class="info-item avatar-box">
					<text class="label">头像</text>
					<image class="avatar-value" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"
						@click="previewImage(userInfo.avatar)" />
				</view>
				<view class="info-item">
					<text class="label">昵称</text>
					<text class="value">{{ userInfo.nickname || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">真实姓名</text>
					<text class="value">{{ userInfo.realName || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">性别</text>
					<text class="value">{{ formatSex(userInfo.sex) }}</text>
				</view>
				<view class="info-item">
					<text class="label">出生年代</text>
					<text class="value">{{ userInfo.era || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">商务办公地</text>
					<text class="value">{{ userInfo.locationAddressStr || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">籍贯/出生地</text>
					<text class="value">{{ userInfo.nativePlaceStr || '未填写' }}</text>
				</view>
				<!-- 【UX优化】增加信用等级展示，提升商务主页权威性 -->
				<!-- <view class="info-item" @click="goToCreditDetail">
					<text class="label">猩球信用</text>
					<view class="credit-badge">
						<text class="credit-text">{{ userInfo.levelName || '普通' }}</text>
						<uni-icons type="right" size="10" color="#FF7D00"></uni-icons>
					</view>
				</view> -->
			</view>
		</view>

		<!-- 2. 职业与社交信息 -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="flag-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">职业与社交</text>
			</view>
			<view class="list-container">
				<!-- 商协会职务列表 -->
				<view class="list-item wide-item">
					<text class="label">组织 / 机构 / 职务</text>
					<view class="association-group">
						<view v-for="(item, index) in formattedAssociations" :key="index" class="association-card">
							<view class="association-name">
								<uni-icons type="auth-filled" size="18" color="#C9A063"></uni-icons>
								<text class="name-text">{{ item.name }}</text>
							</view>
							<view class="association-title">
								<text class="title-label">担任职务：</text>
								<text class="title-value">{{ item.title }}</text>
							</view>
						</view>
						<text v-if="formattedAssociations.length === 0" class="value-placeholder">未填写商协会信息</text>
					</view>
				</view>

				<!-- 公司/行业/职务 组合展示 -->
				<view class="list-item wide-item">
					<text class="label">公司 / 行业 / 职务</text>
					<view class="company-group">
						<view v-for="(company, index) in formattedCompanies" :key="index" class="company-card">
							<view class="company-name">{{ company.name || '公司名称未填写' }}</view>
							<view class="company-details">
								<text class="detail-item">{{ company.industry || '行业未填写' }}</text>
								<text class="detail-separator">|</text>
								<text class="detail-item">{{ company.position || '职务未填写' }}</text>
							</view>
						</view>
						<text v-if="formattedCompanies.length === 0" class="value-placeholder">未填写公司职位信息</text>
					</view>
				</view>

				<view class="list-item wide-item">
					<text class="label">毕业学校</text>
					<view class="tag-group">
						<view v-for="(item, index) in splitToArray(userInfo.school)" :key="index" class="tag school">
							{{ item }}
						</view>
						<text v-if="!userInfo.school" class="value-placeholder">未填写</text>
					</view>
				</view>

				<view class="list-item wide-item">
					<text class="label">兴趣爱好</text>
					<view class="tag-group">
						<view v-for="(item, index) in splitToArray(userInfo.hobby)" :key="index" class="tag hobby">
							{{ item }}
						</view>
						<text v-if="!userInfo.hobby" class="value-placeholder">未填写</text>
					</view>
				</view>

				<view class="list-item">
					<text class="label">电子邮箱</text>
					<text class="value">{{ userInfo.contactEmail || '未填写' }}</text>
				</view>

				<view class="list-item">
					<text class="label">微信二维码</text>
					<image v-if="userInfo.wechatQrCodeUrl" class="qrcode-value" :src="userInfo.wechatQrCodeUrl"
						mode="aspectFit" @click="previewImage(userInfo.wechatQrCodeUrl)" />
					<view v-else class="value-placeholder">未上传二维码</view>
				</view>
			</view>
		</view>

		<!-- 3. 简介与资源资源匹配 -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="chat-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">简介与资源</text>
			</view>
			<view class="list-container">
				<!-- 个性签名区 -->
				<view class="list-item wide-item signature-item">
					<uni-icons type="sound" size="18" color="#FF7D00" class="quote-icon-left"></uni-icons>
					<text class="signature-text">{{ userInfo.signature || '这位朋友很酷，什么也没留下。' }}</text>
				</view>

				<view class="list-item wide-item">
					<text class="label">个人简介</text>
					<text class="value bio-text">{{ userInfo.personalBio || '未填写详细简介' }}</text>
				</view>

				<view class="list-item wide-item resource-item">
					<text class="label have-resource">我拥有的资源</text>
					<view v-if="userInfo.haveResources" class="resource-content">{{ userInfo.haveResources }}</view>
					<text v-else class="value-placeholder">未填写资源描述</text>
				</view>

				<view class="list-item wide-item resource-item">
					<text class="label need-resource">我需要的资源</text>
					<view v-if="userInfo.needResources" class="resource-content">{{ userInfo.needResources }}</view>
					<text v-else class="value-placeholder">未填写需求描述</text>
				</view>

				<!-- 【优化】资源匹配按钮跳转 -->
				<view class="match-button-wrapper">
					<button class="match-button" @click="goToResourceMatch">
						<uni-icons type="link" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
						资源智能匹配
					</button>
				</view>
			</view>
		</view>

		<!-- 4. 数字标签（雷达图） -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="map-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">数字评价 (自我评价)</text>
			</view>
			<view class="radar-content">
				<UserScoreBoard v-if="radarDatasets.length > 0" :datasets="radarDatasets" :showCard="false"
					:showTitle="false" />
				<view v-else class="chart-loading">暂无评分统计信息</view>
			</view>
		</view>

		<view class="bottom-spacer"></view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import UserScoreBoard from '@/components/UserScoreBoard.vue';

	const themeColor = '#FF7D00';
	const userInfo = ref(null);
	const targetUserId = ref(null);
	const radarDatasets = ref([]);

	// 当前登录用户的ID
	const currentUserId = uni.getStorageSync('userId');

	/**
	 * 计算属性：判断当前查看的是否为用户本人的主页
	 */
	const isSelf = computed(() => {
		if (!userInfo.value || !currentUserId) return false;
		return String(userInfo.value.id) === String(currentUserId);
	});

	/**
	 * 生命周期：首次加载接收 ID
	 */
	onLoad((options) => {
		if (options.id) {
			targetUserId.value = options.id;
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		}
	});

	/**
	 * 生命周期：页面每次显示时触发 (从编辑页返回也会执行)
	 * 确保用户数据始终是最新的
	 */
	onShow(() => {
		if (targetUserId.value) {
			loadAllPageData(targetUserId.value);
		}
	});

	/**
	 * 统一加载页面所有数据的方法
	 * @param {String} userId 用户ID
	 */
	const loadAllPageData = async (userId) => {
		uni.showLoading({
			title: '同步数据...'
		});
		try {
			await fetchUserInfo(userId);
			await fetchScoreStatistics(userId);
		} catch (e) {
			console.error('页面数据加载异常:', e);
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 获取用户基本资料
	 */
	const fetchUserInfo = async (userId) => {
		const userRes = await request('/app-api/member/user/get', {
			method: 'GET',
			data: {
				id: userId
			}
		});
		if (!userRes.error && userRes.data) {
			userInfo.value = userRes.data;
			uni.setNavigationBarTitle({
				title: isSelf.value ? '我的详细资料' : `${userRes.data.nickname}的详情`
			});
		}
	};

	/**
	 * 获取雷达图评分统计
	 */
	const fetchScoreStatistics = async (userId) => {
		try {
			// 并发获取自评、商友、综合三项数据
			const [selfRes, friendRes, complexRes] = await Promise.all([
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId,
						type: 0
					}
				}),
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId,
						type: 1
					}
				}),
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId,
						type: 3
					}
				})
			]);

			const newDatasets = [];
			const formatData = (res) => (!res.error && res.data) ? [res.data.avg1, res.data.avg2, res.data.avg3,
				res.data.avg4
			] : [0, 0, 0, 0];

			newDatasets.push({
				name: '自我评价',
				data: formatData(selfRes),
				color: '#FF7D00'
			});
			newDatasets.push({
				name: '商友评价',
				data: formatData(friendRes),
				color: '#4CAF50'
			});
			newDatasets.push({
				name: '综合评价',
				data: formatData(complexRes),
				color: '#1890FF'
			});

			radarDatasets.value = newDatasets;
		} catch (e) {
			radarDatasets.value = [];
		}
	};

	/**
	 * 格式化公司和职业组合数据
	 */
	const formattedCompanies = computed(() => {
		if (!userInfo.value) return [];
		const companies = splitToArray(userInfo.value.companyName);
		const industries = splitToArray(userInfo.value.industry);
		const positions = splitToArray(userInfo.value.positionTitle);
		const maxLength = Math.max(companies.length, industries.length, positions.length);

		const result = [];
		for (let i = 0; i < maxLength; i++) {
			result.push({
				name: companies[i] || '',
				industry: industries[i] || '',
				position: positions[i] || ''
			});
		}
		return result;
	});

	/**
	 * 格式化商协会和职务组合数据
	 */
	const formattedAssociations = computed(() => {
		if (!userInfo.value) return [];
		const associations = splitToArray(userInfo.value.associationName);
		const titles = splitToArray(userInfo.value.professionalTitle);
		const maxLength = Math.max(associations.length, titles.length);

		const result = [];
		for (let i = 0; i < maxLength; i++) {
			result.push({
				name: associations[i] || '组织名称未填写',
				title: titles[i] || '职务未填写'
			});
		}
		return result;
	});

	/**
	 * 字符串转数组工具函数
	 */
	const splitToArray = (str) => {
		if (!str) return [];
		return str.split(/[,，\n]/).map(item => item.trim()).filter(item => item);
	};

	/**
	 * 格式化性别
	 */
	const formatSex = (sex) => {
		if (sex === 1) return '男';
		if (sex === 2) return '女';
		return '保密';
	};

	/**
	 * 跳转到资源匹配
	 */
	const goToResourceMatch = () => {
		uni.navigateTo({
			url: '/packages/resource-match/resource-match'
		});
	};

	/**
	 * 跳转到信用分详情
	 */
	const goToCreditDetail = () => {
		uni.navigateTo({
			url: '/packages/credit-score/credit-score'
		});
	};

	/**
	 * 图片预览
	 */
	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url]
		});
	};

	/**
	 * 跳转到编辑资料页
	 */
	const goToEdit = () => {
		uni.navigateTo({
			url: '/packages/my-edit/my-edit'
		});
	};
</script>

<style lang="scss" scoped>
	.page-container {
		background-color: #f9f9fa;
		padding: 24rpx;
		min-height: 100vh;
	}

	.info-section {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.section-header {
		display: flex;
		align-items: center;
		padding-bottom: 24rpx;
		margin-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f2f5;

		.header-left {
			display: flex;
			align-items: center;
		}

		.section-title {
			font-size: 32rpx;
			font-weight: 700;
			color: #333;
			margin-left: 16rpx;
		}

		.header-right {
			margin-left: auto;
			display: flex;
			align-items: center;
			padding: 10rpx 20rpx;
			background-color: #f5f7fa;
			border-radius: 30rpx;

			&:active {
				opacity: 0.7;
				transform: scale(0.95);
			}
		}

		.edit-text {
			font-size: 26rpx;
			color: #666;
			margin-left: 6rpx;
		}
	}

	.label {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 10rpx;
		display: block;
	}

	.value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		word-break: break-all;
	}

	.value-placeholder {
		font-size: 26rpx;
		color: #ccc;
	}

	/* 基本资料网格 */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24rpx;

		.info-item {
			background-color: #f8fafc;
			padding: 24rpx;
			border-radius: 16rpx;

			&.avatar-box {
				grid-column: span 1;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}
		}

		.avatar-value {
			width: 90rpx;
			height: 90rpx;
			border-radius: 50%;
			border: 4rpx solid #fff;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		}

		.credit-badge {
			display: flex;
			align-items: center;
			background: rgba(255, 125, 0, 0.1);
			padding: 4rpx 12rpx;
			border-radius: 8rpx;
			width: fit-content;

			.credit-text {
				font-size: 24rpx;
				color: #FF7D00;
				font-weight: bold;
				margin-right: 4rpx;
			}
		}
	}

	/* 列表容器 */
	.list-container {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.list-item {
		background-color: #f8fafc;
		padding: 24rpx;
		border-radius: 16rpx;

		.tag-group {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
		}

		.tag {
			padding: 6rpx 20rpx;
			border-radius: 8rpx;
			font-size: 24rpx;

			&.school {
				background-color: #eef9f0;
				color: #4caf50;
			}

			&.hobby {
				background-color: #fff7e6;
				color: #fa8c16;
			}
		}
	}

	/* 商协会卡片 */
	.association-card {
		background: linear-gradient(135deg, #ffffff 0%, #fffcf5 100%);
		border: 1rpx solid #fdf5e6;
		padding: 20rpx;
		border-radius: 16rpx;
		margin-bottom: 16rpx;

		.association-name {
			display: flex;
			align-items: center;
			margin-bottom: 8rpx;

			.name-text {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-left: 10rpx;
			}
		}

		.association-title {
			font-size: 26rpx;
			padding-left: 48rpx;

			.title-label {
				color: #999;
			}

			.title-value {
				color: #C9A063;
				font-weight: bold;
			}
		}
	}

	/* 公司卡片 */
	.company-card {
		background-color: #fff;
		border: 1rpx solid #edf2f7;
		padding: 24rpx;
		border-radius: 16rpx;

		.company-name {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 12rpx;
		}

		.company-details {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #666;

			.detail-separator {
				margin: 0 16rpx;
				color: #e2e8f0;
			}
		}
	}

	.qrcode-value {
		width: 140rpx;
		height: 140rpx;
		border-radius: 12rpx;
		background: #fff;
		padding: 6rpx;
		border: 1rpx solid #eee;
	}

	/* 签名与简介 */
	.signature-item {
		background: #fffcf8;
		border: 1rpx dashed #ffe8cc;
		padding: 30rpx;
		border-radius: 16rpx;

		.signature-text {
			font-size: 28rpx;
			color: #844200;
			font-style: italic;
			margin-left: 12rpx;
		}
	}

	.bio-text {
		line-height: 1.8;
		color: #555;
	}

	.resource-content {
		font-size: 28rpx;
		color: #333;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-all;
		margin-top: 8rpx;
	}

	.match-button-wrapper {
		margin-top: 10rpx;
	}

	.match-button {
		background: linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%);
		color: #fff;
		border-radius: 50rpx;
		font-size: 30rpx;
		font-weight: bold;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 20rpx rgba(255, 107, 0, 0.2);

		&:active {
			transform: translateY(2rpx);
			opacity: 0.9;
		}

		&::after {
			border: none;
		}
	}

	.chart-loading {
		padding: 60rpx;
		text-align: center;
		color: #ccc;
		font-size: 26rpx;
	}

	.bottom-spacer {
		height: 60rpx;
	}
</style>