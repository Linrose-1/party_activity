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
				<view class="info-item">
					<text class="label">出生日期</text>
					<text class="value">{{ formatBirthday(userInfo.birthday) }}</text>
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

		<!-- 2. 职业与社交信息 -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="flag-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">职业与社交</text>
			</view>
			<view class="info-grid">
				<view class="info-item">
					<text class="label">行业</text>
					<text class="value">{{ userInfo.industryName || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">职业</text>
					<text class="value">{{ userInfo.professionalTitle || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">公司/机构</text>
					<text class="value">{{ userInfo.companyName || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">毕业学校</text>
					<text class="value">{{ userInfo.school || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">邮箱</text>
					<text class="value">{{ userInfo.contactEmail || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">爱好</text>
					<text class="value">{{ userInfo.hobby || '未填写' }}</text>
				</view>
				<view class="info-item wide">
					<text class="label">个人简介</text>
					<text class="value bio">{{ userInfo.personalBio || '这位朋友很酷，什么也没留下。' }}</text>
				</view>
				<view class="info-item wide">
					<text class="label">微信二维码</text>
					<image v-if="userInfo.wechatQrCodeUrl" class="qrcode-value" :src="userInfo.wechatQrCodeUrl"
						mode="aspectFit" @click="previewImage(userInfo.wechatQrCodeUrl)" />
					<text v-else class="value">未上传</text>
				</view>
			</view>
		</view>

		<!-- 3. 数字标签 - 雷达图 (使用自定义组件) -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="map-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">数字标签 (自我评价)</text>
			</view>

			<view class="chart-wrapper">
				<MyRadarChart
					v-if="radarSeriesData.length > 0"
					:categories="radarCategories"
					:series-data="radarSeriesData"
					:theme-color="themeColor"
				/>
				<!-- 如果数据未加载完成，可以显示一个加载提示 -->
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
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import request from '@/utils/request.js';

// 导入我们自己写的雷达图组件
import MyRadarChart from '@/components/MyRadarChart.vue';

const themeColor = '#FF7D00';
const userInfo = ref(null);

// 为雷达图组件准备数据
const radarCategories = ref(["基础信用", "协助态度", "专业能力", "精神格局"]);
const radarSeriesData = ref([]); // 初始为空，从 API 获取

onLoad(async (options) => {
	const userId = options.id;
	if (!userId) {
		uni.showToast({ title: '参数错误', icon: 'none' });
		return uni.navigateBack();
	}
	
	uni.showLoading({ title: '正在加载...' });
	try {
		const userRes = await request('/app-api/member/user/get', { method: 'GET', data: { id: userId } });
		if (userRes.error || !userRes.data) throw new Error('获取用户信息失败');

		userInfo.value = userRes.data;
		uni.setNavigationBarTitle({ title: `${userRes.data.nickname || '用户'}的详情` });

		// 获取用户信息后再获取图表数据
		await fetchScoreStatistics(userId);

	} catch (e) {
		uni.showToast({ title: e.message, icon: 'none' });
	} finally {
		uni.hideLoading();
	}
});

const fetchScoreStatistics = async (userId) => {
	try {
		const { data, error } = await request('/app-api/member/user-scores/complexStatistics', {
			method: 'GET',
			data: { userId, type: 0 }
		});

		if (error) {
			throw new Error('获取评分数据失败');
		}

		// 将获取的数据填充到为雷达图准备的 ref 变量中
		radarSeriesData.value = [
			data?.avg1 || 0,
			data?.avg2 || 0,
			data?.avg3 || 0,
			data?.avg4 || 0
		];
	} catch (e) {
		console.error(e.message);
		// 即使失败，也填充一个默认值，避免页面因为数据问题无法渲染
		radarSeriesData.value = [0, 0, 0, 0];
	}
};

const formatSex = (sex) => {
	if (sex === 1) return '男';
	if (sex === 2) return '女';
	return '未设置';
};

/**
 * 【新增】格式化生日时间戳
 * @param {number|null|undefined} timestamp - 后端返回的生日时间戳
 * @returns {string} - 格式化后的 "YYYY-MM-DD" 字符串，或 "未填写"
 */
const formatBirthday = (timestamp) => {
    // 检查时间戳是否有效（非 null、非 undefined、非 0）
	if (!timestamp) {
		return '未填写';
	}
	
	try {
		const date = new Date(timestamp);
		// getFullYear() 等方法可能会因为无效的 date 对象（比如 new Date(null)）而报错，所以放在 try-catch 里更安全
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	} catch (e) {
		console.error("无效的生日时间戳:", timestamp, e);
		return '日期无效';
	}
};

const previewImage = (url) => {
	if (!url) return;
	uni.previewImage({ urls: [url] });
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

		&.wide {
			grid-column: 1 / -1;
		}
	}

	.label {
		font-size: 26rpx;
		color: #909399;
		margin-bottom: 12rpx;
	}

	.value {
		font-size: 28rpx;
		color: #303133;
		font-weight: 500;
		word-break: break-all;
	}

	.bio {
		line-height: 1.6;
	}

	.avatar-value {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
	}

	.qrcode-value {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
		border: 1rpx solid #e6e6e6;
	}

	.chart-wrapper {
		position: relative;
		width: 100%;
		height: 600rpx; /* 适当增加高度，给文字标签留出空间 */
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