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
					<text class="value">{{ userInfo.birthday || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">常住地</text>
					<text class="value">{{ userInfo.areaName || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">出生地</text>
					<text class="value">{{ userInfo.residenceName || '未填写' }}</text>
				</view>
				<view class="info-item">
					<text class="label">籍贯</text>
					<text class="value">{{ userInfo.nativePlace || '未填写' }}</text>
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

		<!-- 3. 数字标签 - 雷达图 -->
		<view class="info-section">
			<view class="section-header">
				<uni-icons type="map-filled" size="24" :color="themeColor"></uni-icons>
				<text class="section-title">数字标签 (自我评价)</text>
			</view>

			<view class="chart-wrapper">
				<!-- 【核心修改】使用 v-if 控制图表的渲染时机 -->
				<qiun-data-charts v-if="canRenderChart" type="radar" :opts="chartOptions" :chart-data="chartData"
					canvas-id="userRadarChart" :canvas2d="true" />
				<!-- 【可选】可以加一个加载中的占位符 -->
				<view v-else class="chart-loading">
					<text>图表加载中...</text>
				</view>
			</view>

			<view class="chart-legend" v-if="canRenderChart">
				<view class="legend-item" v-for="(item, index) in chartData.categories" :key="index">
					<view class="dot" :style="{ backgroundColor: chartOptions.color[index] || '#999' }"></view>
					<text>{{ item }}: {{ chartData.series[0].data[index] }}分</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, reactive, nextTick } from 'vue'; // 【新增】引入 nextTick
	import { onLoad } from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	// 状态管理
	const themeColor = '#FF7800';
	const userInfo = ref(null);

	// 雷达图数据与配置
	const chartData = ref({});
	const chartOptions = reactive({
		color: [themeColor],
		padding: [5, 5, 5, 5],
		legend: { show: false },
		extra: {
			radar: {
				max: 10,
				labelColor: '#666666',
				gridColor: '#e6e6e6',
				border: true,
			}
		}
	});
	// 【新增】创建一个状态，用于控制图表是否渲染
	const canRenderChart = ref(false);

	// 生命周期
	onLoad((options) => {
		if (options.user) {
			try {
				const userData = JSON.parse(decodeURIComponent(options.user));
				userInfo.value = userData;
				uni.setNavigationBarTitle({
					title: `${userData.nickname || '用户'}的详情`
				});
				if (userData.id) {
					fetchScoreStatistics(userData.id);
				}
			} catch (e) {
				console.error("解析用户信息失败", e);
				uni.showToast({ title: '加载用户信息失败', icon: 'none' });
			}
		} else {
			uni.showToast({ title: '缺少用户信息', icon: 'none', duration: 2000 });
			setTimeout(() => uni.navigateBack(), 2000);
		}
	});

	// API 调用
	const fetchScoreStatistics = async (userId) => {
		const { data, error } = await request('/app-api/member/user-scores/complexStatistics', {
			method: 'GET',
			data: { userId: userId, type: 0 }
		});
		
		const defaultScores = { avg1: 0, avg2: 0, avg3: 0, avg4: 0 };

		if (error) {
			console.error('获取评分统计失败:', error);
			drawChart(defaultScores); // 即使失败也用默认数据绘制
			return;
		}
		
		drawChart(data || defaultScores); // 使用获取到的数据或默认数据绘制
	};

	// 辅助方法
	const drawChart = (scores) => {
		chartData.value = {
			categories: ["基础信用", "协助态度", "专业能力", "精神格局"],
			series: [{
				name: "自我评价",
				data: [
					scores.avg1 || 0,
					scores.avg2 || 0,
					scores.avg3 || 0,
					scores.avg4 || 0
				]
			}]
		};

		// 【核心修改】数据准备好后，在下一个UI更新周期再显示图表
		nextTick(() => {
			canRenderChart.value = true;
		});
	};

	const formatSex = (sex) => {
		if (sex === 1) return '男';
		if (sex === 2) return '女';
		return '未设置';
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
		height: 500rpx;
	}
	
	.chart-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
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