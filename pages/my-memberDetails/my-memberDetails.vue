<template>
	<view class="page-container">
		<!-- 1. 顶部吸顶 Tab 导航 -->
		<view class="main-nav">
			<view v-for="(level, index) in membershipLevels" :key="level.level" class="nav-item"
				@click="switchTab(index)">
				<text class="nav-text" :class="{ 'active': currentTab === index }">
					{{ level.shortName }}
				</text>
				<view class="nav-indicator" v-if="currentTab === index"></view>
			</view>
		</view>

		<!-- 2. 内容区域 (Swiper + ScrollView) -->
		<!-- 使用 flex 布局让 swiper 占据剩余高度 -->
		<swiper class="content-swiper" :current="currentTab" @change="onSwiperChange">
			<swiper-item v-for="(item, index) in membershipLevels" :key="item.level">
				<scroll-view scroll-y class="card-scroll-view">
					<view class="card-wrapper">

						<!-- 核心卡片容器，根据等级动态绑定主题类名 -->
						<view class="membership-card" :class="'theme-level-' + item.level">

							<!-- A. 卡片头部 (渐变背景) -->
							<view class="card-header">
								<view class="icon-box">
									<!-- 优先展示接口返回的 icon 图片 -->
									<image v-if="item.icon" :src="item.icon" class="level-icon-img" mode="aspectFit" />

									<!-- 如果接口 icon 为空，则降级显示 uni-icons 默认图标 -->
									<!-- <uni-icons v-else :type="getLevelIcon(item.level)" size="48"
										:color="item.themeColor"></uni-icons> -->
								</view>
								<text class="level-name">{{ item.name }}</text>
								<view class="price-row">
									<text class="price-val">{{ formatPrice(item.price) }}</text>
									<text class="duration"> / {{ item.duration }}</text>
								</view>
							</view>

							<!-- B. 数据统计条 (智米/贡分) -->
							<view class="stats-box">
								<view class="stat-item">
									<text class="stat-label">智米：</text>
									<text class="stat-value">{{ item.zhimiNum }} 个</text>
								</view>
								<view class="stat-divider"></view>
								<view class="stat-item">
									<text class="stat-label">贡分：</text>
									<text class="stat-value">{{ item.gongfenNum }} 个</text>
								</view>
							</view>

							<!-- C. 权益列表 -->
							<view class="benefits-section">
								<view class="section-title">基本权益</view>

								<view class="benefit-list">
									<view v-for="(benefit, bIndex) in item.parsedContent" :key="bIndex"
										class="benefit-item">
										<view class="check-icon">
											<uni-icons type="checkmarkempty" size="16" color="#07c160"></uni-icons>
										</view>
										<text class="benefit-text">{{ benefit }}</text>
									</view>

									<!-- 如果没有权益内容 -->
									<view v-if="!item.parsedContent || item.parsedContent.length === 0"
										class="empty-benefit">
										暂无特定权益描述
									</view>
								</view>
							</view>

						</view>

						<!-- 底部占位 -->
						<view style="height: 60rpx;"></view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	// ======================= 数据状态 =======================
	const membershipLevels = ref([]);
	const currentTab = ref(0);
	const initialTargetLevel = ref(null);

	// ======================= 生命周期 =======================
	onLoad((options) => {
		if (options && options.level) {
			initialTargetLevel.value = Number(options.level);
		}
	});

	onMounted(() => {
		fetchMembershipLevels();
	});

	// ======================= 数据处理 =======================
	const fetchMembershipLevels = async () => {
		uni.showLoading({
			title: '加载中...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/top-up-level/list');
		uni.hideLoading();

		if (error) {
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		if (data && data.length > 0) {
			const sortedData = data.sort((a, b) => a.level - b.level);

			membershipLevels.value = sortedData.map(item => {
				let parsedContent = [];

				// 1. 固定权益
				parsedContent.push('可使用智米消耗平台服务与产品');

				// 2. 解析动态权益
				try {
					if (item.content) {
						const rights = JSON.parse(item.content);

						// 商机发布
						if (rights.business !== undefined) {
							parsedContent.push(`可进行商机发布 ${rights.business}次/月`);
						}

						// 猎伙发布
						if (rights.partnerBusiness !== undefined) {
							parsedContent.push(`可进行猎伙发布 ${rights.partnerBusiness}次/月`);
						}

						// 聚会发布
						if (rights.activity !== undefined) {
							parsedContent.push(`可进行聚会发布 ${rights.activity}次/月`);
						}

						// 名片分享
						if (rights.shareUserCard !== undefined) {
							const shareCount = rights.shareUserCard >= 999999 ? '无限制' :
								`${rights.shareUserCard}次`;
							parsedContent.push(`可名片分享 ${shareCount}/月`);
						}
					}
				} catch (e) {
					console.error('解析权益 JSON 失败', e);
				}

				// 3. 固定权益
				parsedContent.push('可使用贡分参与平台权益的二次分配，获得智米');

				const themeColor = getThemeColor(item.level);

				return {
					...item,
					parsedContent, // 这里已经是生成的文案数组了，模板直接循环即可
					themeColor,
					shortName: item.name.replace('会员', '')
				};
			});

			if (initialTargetLevel.value !== null) {
				const targetIndex = membershipLevels.value.findIndex(item => item.level === initialTargetLevel
					.value);
				if (targetIndex !== -1) {
					currentTab.value = targetIndex;
				}
			}
		}
	};

	// ======================= 辅助逻辑 =======================

	const switchTab = (index) => {
		currentTab.value = index;
	};

	const onSwiperChange = (e) => {
		currentTab.value = e.detail.current;
	};

	const formatPrice = (price) => {
		return price == 0 ? '免费' : `¥${price}`;
	};

	// 根据等级 ID 返回对应的图标名称 (Uni-icons)
	const getLevelIcon = (level) => {
		// 1:玄铁, 2:青铜, 3:白银, 4:黄金, 5:黑钻
		// 映射到 uni-icons 的图标名
		switch (Number(level)) {
			case 1:
				return 'shield-filled'; // 玄铁-盾牌
			case 2:
				return 'medal-filled'; // 青铜-奖章
			case 3:
				return 'vip-filled'; // 白银-VIP
			case 4:
				return 'star-filled'; // 黄金-星星
			case 5:
				return 'pyq'; // 黑钻-皇冠(用朋友圈图标代替，或者换 color-filled)
			default:
				return 'vip-filled';
		}
	};

	// 获取主题文字颜色 (用于图标等)
	const getThemeColor = (level) => {
		switch (Number(level)) {
			case 1:
				return '#5F6C7B'; // 玄铁灰
			case 2:
				return '#CD7F32'; // 青铜色
			case 3:
				return '#7F9eb2'; // 白银蓝灰
			case 4:
				return '#E6A23C'; // 黄金
			case 5:
				return '#333333'; // 黑钻
			default:
				return '#333';
		}
	};
</script>

<style lang="scss" scoped>
	/* --- 页面布局 --- */
	.page-container {
		background-color: #F5F7FA;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* --- 1. 顶部 Tab 导航 --- */
	.main-nav {
		background-color: #fff;
		padding: 0 20rpx;
		height: 90rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
		z-index: 10;
	}

	.nav-item {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		padding: 0 20rpx;
	}

	.nav-text {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
		transition: all 0.3s;

		&.active {
			font-size: 30rpx;
			color: #333;
			font-weight: bold;
		}
	}

	.nav-indicator {
		position: absolute;
		bottom: 10rpx;
		width: 40rpx;
		height: 6rpx;
		background: linear-gradient(90deg, #FF8C00, #FF6B00);
		border-radius: 3rpx;
	}

	/* --- 2. Swiper 内容区 --- */
	.content-swiper {
		flex: 1;
		/* 占据剩余高度 */
		height: 0;
		/* 配合 flex:1 使用 */
	}

	.card-scroll-view {
		height: 100%;
	}

	.card-wrapper {
		padding: 40rpx 30rpx;
	}

	/* --- 3. 会员卡片主体 --- */
	.membership-card {
		background-color: #fff;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
		position: relative;
	}

	/* --- A. 头部设计 (根据等级变换颜色) --- */
	.card-header {
		height: 360rpx;
		/* 增加高度，包含图标和文字 */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #333;
		padding-bottom: 60rpx;
		/* 留出空间给 Stats Box */
	}

	.icon-box {
		margin-bottom: 20rpx;
		opacity: 0.9;
	}

	.level-icon-img {
		width: 100rpx;
		/* 设置合适的宽度，约等于 size=48 的图标大小 */
		height: 100rpx;
		display: block;
		/* 消除图片底部间隙 */
	}

	.level-name {
		font-size: 48rpx;
		font-weight: 800;
		margin-bottom: 16rpx;
		letter-spacing: 2rpx;
	}

	.price-row {
		font-size: 30rpx;
		opacity: 0.8;

		.price-val {
			font-weight: bold;
			font-size: 34rpx;
		}
	}

	/* --- 主题配色方案 (背景渐变) --- */
	/* 1. 玄铁 (灰蓝/钢色) */
	.theme-level-1 .card-header {
		background: linear-gradient(180deg, #CFD9DF 0%, #E2EBF0 100%);
		color: #4A5568;
	}

	/* 2. 青铜 (铜色/淡褐) */
	.theme-level-2 .card-header {
		background: linear-gradient(180deg, #E6DADA 0%, #F4EBEB 100%);
		/* 或者用更像截图的浅色 */
		background: linear-gradient(180deg, #EADBC8 0%, #F5EFE6 100%);
		color: #8D6E63;
	}

	/* 3. 白银 (银白/灰) */
	.theme-level-3 .card-header {
		background: linear-gradient(180deg, #E0E0E0 0%, #F5F5F5 100%);
		color: #616161;
	}

	/* 4. 黄金 (金黄/淡黄) */
	.theme-level-4 .card-header {
		background: linear-gradient(180deg, #FFE082 0%, #FFF8E1 100%);
		color: #856404;
	}

	/* 5. 黑钻 (深灰/黑) */
	.theme-level-5 .card-header {
		background: linear-gradient(180deg, #424242 0%, #757575 100%);
		color: #FFD700;
		/* 金色文字 */
	}

	/* --- B. 悬浮数据统计条 --- */
	.stats-box {
		position: relative;
		margin: -50rpx 30rpx 0;
		/* 负 margin 实现悬浮覆盖效果 */
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx 0;
		display: flex;
		align-items: center;
		justify-content: space-around;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid #f0f0f0;
	}

	.stat-item {
		display: flex;
		align-items: center;
		font-size: 28rpx;
	}

	.stat-label {
		color: #666;
	}

	.stat-value {
		font-weight: bold;
		color: #333;
		margin-left: 8rpx;
	}

	.stat-divider {
		width: 1rpx;
		height: 30rpx;
		background-color: #eee;
	}

	/* --- C. 权益列表 --- */
	.benefits-section {
		padding: 50rpx 40rpx;
	}

	.section-title {
		font-size: 34rpx;
		font-weight: 800;
		color: #2c3e50;
		margin-bottom: 30rpx;
	}

	.benefit-list {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.benefit-item {
		display: flex;
		align-items: flex-start;
	}

	.check-icon {
		margin-top: 4rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.benefit-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.6;
		text-align: justify;
	}

	.empty-benefit {
		text-align: center;
		color: #999;
		font-size: 26rpx;
		padding: 20rpx 0;
	}
</style>