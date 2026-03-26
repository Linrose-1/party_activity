<template>
	<view class="container">
		<!-- 1. 顶部标题背景区 -->
		<view class="header-bg">
			<view class="header-content">
				<text class="title">赞助商名单</text>
				<text class="subtitle">感谢以下单位对本次聚会的大力支持</text>
			</view>
		</view>

		<!-- 2. 赞助商列表 -->
		<view class="sponsor-list">
			<view class="sponsor-card" v-for="(item, index) in sponsorList" :key="item.id" @click="goToDetail(item)">
				<!-- 排名序号 -->
				<view class="rank-tag">{{ index + 1 }}</view>

				<view class="card-inner">
					<image :src="item.logoUrl || '/static/images/default-store.png'" class="sp-logo"
						mode="aspectFill" />

					<view class="sp-info">
						<text class="sp-name">{{ item.sponsorName }}</text>
						<text class="sp-intro text-ellipsis">{{ item.introduction || '致力为商友提供优质资源与服务' }}</text>

						<!-- 赞助类型标签 (根据接口 sponsorType 判断) -->
						<view class="tag-row">
							<text class="type-tag" v-if="item.sponsorType === 1">资金赞助</text>
							<text class="type-tag" v-else-if="item.sponsorType === 2">实物赞助</text>
							<text class="type-tag" v-else>合作伙伴</text>
						</view>
					</view>

					<view class="arrow-box">
						<text class="view-txt">详情</text>
						<uni-icons type="right" size="14" color="#FF62B1"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 3. 空状态 -->
		<view class="empty-state" v-if="sponsorList.length === 0">
			<uni-icons type="info" size="60" color="#ddd"></uni-icons>
			<text>暂无赞助商信息</text>
		</view>

		<view class="footer-tip">—— 猩聚社 · 精英商友跨域社交 ——</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';

	const sponsorList = ref([]);
	const activityId = ref(null);

	onLoad((options) => {
		// 1. 接收聚会ID，用于跳转详情
		if (options.activityId) {
			activityId.value = options.activityId;
		}

		// 2. 解析传入的赞助商对象数组
		if (options.data) {
			try {
				const decodedData = decodeURIComponent(options.data);
				sponsorList.value = JSON.parse(decodedData);
				console.log('✅ 赞助商数据解析成功:', sponsorList.value);
			} catch (e) {
				console.error('❌ 解析赞助商数据失败:', e);
				uni.showToast({
					title: '数据加载失败',
					icon: 'none'
				});
			}
		}
	});

	/**
	 * 跳转到赞助商详情页
	 */
	const goToDetail = (item) => {
		uni.navigateTo({
			url: `/pages/sponsor-detail/sponsor-detail?sponsorId=${item.id}&activityId=${activityId.value}`
		});
	};
</script>

<style lang="scss" scoped>
	$theme-color: #FF62B1;

	.container {
		min-height: 100vh;
		background-color: #F8F9FB;
		padding-bottom: 60rpx;
	}

	/* 顶部背景 */
	.header-bg {
		background: linear-gradient(135deg, $theme-color 0%, #FF85C1 100%);
		height: 200rpx;
		padding: 40rpx;
		display: flex;
		align-items: center;
		border-radius: 0 0 60rpx 60rpx;
	}

	.header-content {
		.title {
			color: #fff;
			font-size: 44rpx;
			font-weight: 900;
			display: block;
			letter-spacing: 2rpx;
		}

		.subtitle {
			color: rgba(255, 255, 255, 0.8);
			font-size: 24rpx;
			margin-top: 10rpx;
			display: block;
		}
	}

	/* 列表区域 */
	.sponsor-list {
		padding: 0 30rpx;
		margin-top: -40rpx; // 向上偏移覆盖圆角
	}

	.sponsor-card {
		position: relative;
		background-color: #fff;
		border-radius: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);
		overflow: hidden;

		&:active {
			transform: scale(0.98);
			background-color: #fafafa;
		}

		.rank-tag {
			position: absolute;
			top: 0;
			left: 0;
			background: rgba($theme-color, 0.1);
			color: $theme-color;
			font-size: 20rpx;
			font-weight: bold;
			padding: 4rpx 16rpx;
			border-radius: 0 0 20rpx 0;
		}
	}

	.card-inner {
		display: flex;
		align-items: center;
		padding: 30rpx;
		padding-left: 40rpx;

		.sp-logo {
			width: 110rpx;
			height: 110rpx;
			border-radius: 50%;
			border: 4rpx solid #F0F0F0;
			flex-shrink: 0;
		}

		.sp-info {
			flex: 1;
			margin-left: 24rpx;
			min-width: 0;

			.sp-name {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				display: block;
			}

			.sp-intro {
				font-size: 24rpx;
				color: #999;
				margin-top: 6rpx;
				display: block;
			}
		}
	}

	.tag-row {
		display: flex;
		margin-top: 12rpx;

		.type-tag {
			font-size: 20rpx;
			color: $theme-color;
			background: rgba($theme-color, 0.08);
			padding: 2rpx 14rpx;
			border-radius: 6rpx;
			border: 1rpx solid rgba($theme-color, 0.2);
		}
	}

	.arrow-box {
		display: flex;
		align-items: center;
		gap: 4rpx;
		margin-left: 20rpx;

		.view-txt {
			font-size: 22rpx;
			color: $theme-color;
			font-weight: bold;
		}
	}

	.text-ellipsis {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.empty-state {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #ccc;
		font-size: 28rpx;
		gap: 20rpx;
	}

	.footer-tip {
		text-align: center;
		font-size: 22rpx;
		color: #ddd;
		margin-top: 60rpx;
		letter-spacing: 2rpx;
	}
</style>