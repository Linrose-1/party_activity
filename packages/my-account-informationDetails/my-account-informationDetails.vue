<!-- /pages/user-detail/user-detail.vue -->
<template>
	<view class="page-container" v-if="userInfo">
		<!-- 1. 基本资料 -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="person-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">基本资料</text>
			</view>
			<view class="info-grid">
				<view class="info-item">
					<text class="label">头像</text>
					<image class="avatar-value" :src="userInfo.avatar || '/static/default-avatar.png'"
						mode="aspectFill" />
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
				<!-- 【优化1】显示出生年代 -->
				<view class="info-item">
					<text class="label">出生年代</text>
					<text class="value">{{ userInfo.era || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">常住地</text>
					<text class="value">{{ userInfo.locationAddressStr || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">出生地</text>
					<text class="value">{{ userInfo.birthplaceStr || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">籍贯</text>
					<text class="value">{{ userInfo.nativePlaceStr || '未填写' }}</text>
				</view>
			</view>
		</view>

		<!-- 【优化2】职业与社交信息 (全新重构) -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="flag-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">职业与社交</text>
			</view>
			<view class="list-container">
				<!-- 商协会职务 -->
				<view class="list-item wide-item">
					<text class="label">商协会职务</text>
					<view class="tag-group">
						<view v-for="(item, index) in splitToArray(userInfo.professionalTitle)" :key="index"
							class="tag">{{ item }}</view>
						<text v-if="!userInfo.professionalTitle" class="value-placeholder">未填写</text>
					</view>
				</view>

				<!-- 公司/行业/职务 组合 -->
				<view class="list-item wide-item">
					<text class="label">公司/行业/职务</text>
					<view class="company-group">
						<view v-for="(company, index) in formattedCompanies" :key="index" class="company-card">
							<view class="company-name">{{ company.name || '公司名称未填写' }}</view>
							<view class="company-details">
								<text class="detail-item">{{ company.industry || '行业未填写' }}</text>
								<text class="detail-separator">|</text>
								<text class="detail-item">{{ company.position || '职务未填写' }}</text>
							</view>
						</view>
						<text v-if="formattedCompanies.length === 0" class="value-placeholder">未填写</text>
					</view>
				</view>

				<!-- 毕业学校 -->
				<view class="list-item wide-item">
					<text class="label">毕业学校</text>
					<view class="tag-group">
						<view v-for="(item, index) in splitToArray(userInfo.school)" :key="index" class="tag school">
							{{ item }}
						</view>
						<text v-if="!userInfo.school" class="value-placeholder">未填写</text>
					</view>
				</view>

				<!-- 爱好 -->
				<view class="list-item wide-item">
					<text class="label">爱好</text>
					<view class="tag-group">
						<view v-for="(item, index) in splitToArray(userInfo.hobby)" :key="index" class="tag hobby">
							{{ item }}
						</view>
						<text v-if="!userInfo.hobby" class="value-placeholder">未填写</text>
					</view>
				</view>

				<!-- 联系方式 -->
				<view class="list-item">
					<text class="label">邮箱</text>
					<text class="value">{{ userInfo.contactEmail || '未填写' }}</text>
				</view>
				<view class="list-item">
					<text class="label">微信二维码</text>
					<image v-if="userInfo.wechatQrCodeUrl" class="qrcode-value" :src="userInfo.wechatQrCodeUrl"
						mode="aspectFit" @click="previewImage(userInfo.wechatQrCodeUrl)" />
					<text v-else class="value-placeholder">未上传</text>
				</view>
			</view>
		</view>

		<!-- 【优化3 & 4】个人简介、资源与匹配 -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="chat-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">简介与资源</text>
			</view>
			<view class="list-container">
				<!-- 个性签名 -->
				<view class="list-item wide-item signature-item">
					<uni-icons type="sound" size="20" color="#666" class="quote-icon-left"></uni-icons>
					<text class="signature-text">{{ userInfo.signature || '这位朋友很酷，什么也没留下。' }}</text>
					<uni-icons type="sound-filled" size="20" color="#666" class="quote-icon-right"></uni-icons>
				</view>
				<!-- 个人简介 -->
				<view class="list-item wide-item">
					<text class="label">个人简介</text>
					<text class="value bio">{{ userInfo.personalBio || '未填写' }}</text>
				</view>
				<!-- 我有资源 -->
				<view class="list-item wide-item resource-item">
					<text class="label have-resource">我有的资源</text>
					<view class="resource-list">
						<view v-for="(item, index) in splitToArray(userInfo.haveResources)" :key="index"
							class="resource-line">{{ item }}</view>
						<text v-if="!userInfo.haveResources" class="value-placeholder">未填写</text>
					</view>
				</view>
				<!-- 我需资源 -->
				<view class="list-item wide-item resource-item">
					<text class="label need-resource">我需的资源</text>
					<view class="resource-list">
						<view v-for="(item, index) in splitToArray(userInfo.needResources)" :key="index"
							class="resource-line">{{ item }}</view>
						<text v-if="!userInfo.needResources" class="value-placeholder">未填写</text>
					</view>
				</view>
				<!-- 资源匹配按钮 -->
				<view class="match-button-wrapper">
					<button class="match-button" @click="goToResourceMatch">
						<uni-icons type="link" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
						资源匹配
					</button>
				</view>
			</view>
		</view>

		<!-- 5. 数字标签 (保持不变) -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="map-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">数字标签 (自我评价)</text>
			</view>
			<view class="chart-wrapper">
				<MyRadarChart v-if="radarSeriesData.length > 0" :categories="radarCategories"
					:series-data="radarSeriesData" :theme-color="themeColor" />
				<view v-else class="chart-loading">正在加载图表...</view>
			</view>
			<view class="chart-legend" v-if="radarSeriesData.length > 0">
				<view class="legend-item" v-for="(item, index) in radarCategories" :key="index">
					<view class="dot" :style="{ backgroundColor: themeColor }"></view>
					<text>{{ item }}: {{ radarSeriesData[index] }}分</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import MyRadarChart from '@/components/MyRadarChart.vue';

	const themeColor = '#FF7D00';
	const userInfo = ref(null);
	const radarCategories = ref(["基础信用", "协助态度", "专业能力", "精神格局"]);
	const radarSeriesData = ref([]);

	onLoad(async (options) => {
		const userId = options.id;
		if (!userId) {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
			return uni.navigateBack();
		}
		uni.showLoading({
			title: '正在加载...'
		});
		try {
			const userRes = await request('/app-api/member/user/get', {
				method: 'GET',
				data: {
					id: userId
				}
			});
			if (userRes.error || !userRes.data) throw new Error('获取用户信息失败');
			userInfo.value = userRes.data;
			uni.setNavigationBarTitle({
				title: `${userRes.data.nickname || '用户'}的详情`
			});
			await fetchScoreStatistics(userId);
		} catch (e) {
			uni.showToast({
				title: e.message,
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	});

	/**
	 * 【新增】工具函数：将逗号或换行符分隔的字符串转为数组
	 * @param {string|null|undefined} str - 输入的字符串
	 * @returns {Array<string>} - 返回处理后的数组
	 */
	const splitToArray = (str) => {
		if (!str) return [];
		// 使用正则表达式匹配逗号或换行符，并过滤掉空字符串
		return str.split(/[,，\n]/).map(item => item.trim()).filter(item => item);
	};

	/**
	 * 【新增】计算属性：将公司、行业、职务数据格式化为对象数组
	 */
	const formattedCompanies = computed(() => {
		if (!userInfo.value) return [];
		const companies = splitToArray(userInfo.value.companyName);
		const industries = splitToArray(userInfo.value.industry);
		const positions = splitToArray(userInfo.value.positionTitle);

		const maxLength = Math.max(companies.length, industries.length, positions.length);
		if (maxLength === 0) return [];

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

	const fetchScoreStatistics = async (userId) => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-scores/complexStatistics', {
				method: 'GET',
				data: {
					userId,
					type: 0
				}
			});
			if (error) throw new Error('获取评分数据失败');
			radarSeriesData.value = [
				data?.avg1 || 0,
				data?.avg2 || 0,
				data?.avg3 || 0,
				data?.avg4 || 0
			];
		} catch (e) {
			console.error(e.message);
			radarSeriesData.value = [0, 0, 0, 0];
		}
	};

	const formatSex = (sex) => {
		if (sex === 1) return '男';
		if (sex === 2) return '女';
		return '未设置';
	};

	const goToResourceMatch = () => {
		console.log('跳转到资源匹配页面');
		uni.showToast({
			title: '资源匹配功能即将上线',
			icon: 'none'
		});
	};

	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url]
		});
	};
</script>

<style lang="scss" scoped>
	/* --- 全局与基础 --- */
	.page-container {
		background-color: #f9f9fa;
		padding: 24rpx;
		min-height: 100vh;
	}

	.info-section {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.section-header {
		display: flex;
		align-items: center;
		padding-bottom: 24rpx;
		margin-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #303133;
		margin-left: 16rpx;
	}

	.label {
		font-size: 26rpx;
		color: #909399;
		margin-bottom: 12rpx;
		display: block; // 确保标签独占一行
	}

	.value {
		font-size: 28rpx;
		color: #303133;
		font-weight: 500;
		word-break: break-all;
	}

	.value-placeholder {
		font-size: 28rpx;
		color: #c0c4cc;
	}

	/* --- 1. 基本资料 (Grid 布局) --- */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30rpx;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		background-color: #f5f7fa;
		padding: 20rpx;
		border-radius: 12rpx;
	}

	.avatar-value {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
	}

	/* --- 2. 职业与社交 (全新 List 布局) --- */
	.list-container {
		display: flex;
		flex-direction: column;
		gap: 30rpx; // 列表项之间的间距
	}

	.list-item {
		background-color: #f5f7fa;
		padding: 20rpx;
		border-radius: 12rpx;

		&.wide-item {
			// 默认就是宽的，这个类可以备用
		}
	}

	.tag-group {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.tag {
		background-color: #e8f3ff;
		color: #409eff;
		padding: 8rpx 20rpx;
		border-radius: 8rpx;
		font-size: 26rpx;

		&.school {
			background-color: #f0f9eb;
			color: #67c23a;
		}

		&.hobby {
			background-color: #fdf6ec;
			color: #e6a23c;
		}
	}

	.company-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.company-card {
		background-color: #fff;
		border: 1rpx solid #eef;
		padding: 24rpx;
		border-radius: 12rpx;
	}

	.company-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #303133;
		margin-bottom: 12rpx;
	}

	.company-details {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #606266;
	}

	.detail-separator {
		margin: 0 16rpx;
		color: #dcdfe6;
	}

	.qrcode-value {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		border: 1rpx solid #e6e6e6;
	}

	/* --- 3. 简介与资源 --- */
	.signature-item {
		background-color: #fafafa;
		text-align: center;
		font-style: italic;
		color: #606266;
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.signature-text {
		margin: 0 20rpx;
		font-size: 28rpx;
	}

	.bio {
		line-height: 1.6;
	}

	.resource-item {
		.label {
			font-weight: bold;
			font-size: 28rpx;

			&.have-resource {
				color: #67c23a;
			}

			&.need-resource {
				color: #e6a23c;
			}
		}
	}

	.resource-list {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.resource-line {
		font-size: 28rpx;
		color: #303133;
		padding-left: 20rpx;
		position: relative;

		&::before {
			content: '·';
			position: absolute;
			left: 0;
			color: #909399;
		}
	}

	.match-button-wrapper {
		margin-top: 20rpx;
	}

	.match-button {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		color: #fff;
		border: none;
		border-radius: 40rpx;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		line-height: 80rpx;

		&::after {
			border: none;
		}
	}

	/* --- 4. 雷达图 (样式不变) --- */
	.chart-wrapper {
		position: relative;
		width: 100%;
		height: 600rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.chart-loading {
		color: #999;
		font-size: 28rpx;
	}

	.chart-legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20rpx;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f2f5;
	}

	.legend-item {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #666;
	}

	.dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}
</style>