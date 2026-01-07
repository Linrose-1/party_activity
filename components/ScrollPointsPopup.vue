<template>
	<uni-popup ref="popup" type="center" :mask-click="true">
		<view class="points-popup-container">
			<!-- 1. 顶部 Header -->
			<view class="popup-header">
				<view class="title-row">
					<text class="title-icon">📊</text>
					<text class="title-text">昨日贡分明细</text>
				</view>
				<uni-icons type="closeempty" size="24" color="#fff" @click="close" class="close-btn"></uni-icons>
			</view>

			<view class="popup-body">
				<!-- 2. 总分概览 -->
				<view class="total-score-box">
					<text class="label">昨日共获得</text>
					<view class="score-row">
						<text class="score">{{ totalExperience }}</text>
						<text class="unit">贡分</text>
						<text class="coin-icon">💰</text>
					</view>
				</view>

				<!-- 3. 滚动列表 -->
				<scroll-view scroll-y class="details-scroll">
					<view class="list-container">
						<view v-for="(item, index) in list" :key="index" class="detail-item">
							<view class="item-left">
								<!-- 小图标装饰 -->
								<view class="dot"></view>
								<view class="item-info">
									<text class="item-title">{{ item.title }}</text>
									<!-- 如果次数大于1，显示次数 -->
									<text class="item-sub" v-if="item.num > 1">累计 {{ item.num }} 次</text>
								</view>
							</view>
							<view class="item-right">
								<text class="item-score">+{{ item.totalExperience }}</text>
								<text class="item-unit">分</text>
							</view>
						</view>

						<!-- 空状态 -->
						<view v-if="list.length === 0" class="empty-list">
							昨日暂无贡分记录，继续加油！
						</view>
					</view>
				</scroll-view>

				<!-- 4. 底部 Slogan -->
				<view class="slogan-box">
					今日继续活跃，赚取更多贡分 💪
				</view>

				<!-- 5. 底部按钮 -->
				<view class="popup-footer">
					<button class="action-btn" @click="goToMyPoints">我的贡分</button>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	const popup = ref(null);
	const totalExperience = ref(0);
	const list = ref([]);

	// 打开弹窗，传入接口返回的 data 对象
	const open = (data) => {
		if (!data) return;
		totalExperience.value = data.totalExperience || 0;
		list.value = data.experienceStatisticsList || [];
		popup.value.open();
	};

	const close = () => {
		popup.value.close();
	};

	const goToMyPoints = () => {
		close();
		uni.navigateTo({
			url: '/packages/my-points/my-points'
		});
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.points-popup-container {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		/* 模拟深蓝色高级感背景 */
		background: linear-gradient(180deg, #2b3245 0%, #fff 150rpx);
	}

	/* --- 顶部 Header --- */
	.popup-header {
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: transparent;
		/* 透出父级渐变 */
	}

	.title-row {
		display: flex;
		align-items: center;
	}

	.title-icon {
		font-size: 36rpx;
		margin-right: 12rpx;
	}

	.title-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffd700;
		/* 金色标题 */
		letter-spacing: 2rpx;
	}

	.close-btn {
		opacity: 0.8;
	}

	.popup-body {
		flex: 1;
		background-color: #f9f9fc;
		border-top-left-radius: 30rpx;
		border-top-right-radius: 30rpx;
		padding: 40rpx 30rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* --- 总分概览 --- */
	.total-score-box {
		text-align: center;
		margin-bottom: 30rpx;
	}

	.label {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 8rpx;
		display: block;
	}

	.score-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.score {
		font-size: 56rpx;
		font-weight: 800;
		color: #28a745;
		/* 绿色突出 */
		font-family: 'Helvetica Neue', sans-serif;
	}

	.unit {
		font-size: 26rpx;
		color: #333;
		margin: 0 8rpx;
		font-weight: 500;
	}

	.coin-icon {
		font-size: 32rpx;
	}

	/* --- 列表滚动区 --- */
	.details-scroll {
		width: 100%;
		max-height: 500rpx;
		/* 限制最大高度，触发滚动 */
		background-color: #fff;
		border-radius: 16rpx;
		border: 1rpx solid #eee;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	.list-container {
		padding: 10rpx 0;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 30rpx;
		border-bottom: 1rpx dashed #eee;

		&:last-child {
			border-bottom: none;
		}
	}

	.item-left {
		display: flex;
		align-items: flex-start;
		flex: 1;
	}

	.dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background-color: #FF6B00;
		/* 橙色点缀 */
		margin-top: 14rpx;
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.item-info {
		display: flex;
		flex-direction: column;
	}

	.item-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 4rpx;
	}

	.item-sub {
		font-size: 22rpx;
		color: #999;
	}

	.item-right {
		display: flex;
		align-items: baseline;
		margin-left: 20rpx;
	}

	.item-score {
		font-size: 32rpx;
		font-weight: bold;
		color: #28a745;
		/* 绿色 */
	}

	.item-unit {
		font-size: 22rpx;
		color: #999;
		margin-left: 4rpx;
	}

	.empty-list {
		padding: 40rpx;
		text-align: center;
		color: #ccc;
		font-size: 26rpx;
	}

	/* --- 底部区域 --- */
	.slogan-box {
		margin: 30rpx 0;
		font-size: 24rpx;
		color: #888;
		font-style: italic;
	}

	.popup-footer {
		width: 100%;
	}

	.action-btn {
		background: linear-gradient(135deg, #1c2438, #36415a);
		/* 深蓝高级感 */
		color: #ffd700;
		/* 金色文字 */
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: bold;
		height: 80rpx;
		line-height: 80rpx;
		box-shadow: 0 6rpx 16rpx rgba(28, 36, 56, 0.3);

		&:active {
			opacity: 0.9;
			transform: scale(0.98);
		}

		&::after {
			border: none;
		}
	}
</style>