<template>
	<view class="store-card" @click="handleCardClick">
		<!-- 左侧：封面图 -->
		<view class="card-image-wrapper">
			<image :src="coverImage" mode="aspectFill" class="card-image" lazy-load></image>
			<!-- 可选：左上角标签 (如分类) -->
			<!-- <view class="category-tag" v-if="store.categoryStr">{{ store.categoryStr }}</view> -->
		</view>

		<!-- 右侧：内容区 -->
		<view class="card-content">
			<!-- 1. 头部：店名 + 距离 -->
			<view class="card-header">
				<text class="store-name">{{ store.storeName }}</text>
				<view class="distance-badge" v-if="displayDistance">
					<text>{{ displayDistance }}</text>
				</view>
			</view>

			<!-- 2. 中部：描述/简介 -->
			<view class="card-body">
				<text class="store-desc">{{ store.storeDescription || '暂无介绍' }}</text>
			</view>

			<!-- 3. 底部：人均 + 按钮 -->
			<view class="card-footer">
				<!-- 左侧显示人均消费 (如果有) -->
				<view class="price-info" v-if="store.averageConsumptionRange">
					<text>人均 {{ store.averageConsumptionRange }}</text>
				</view>
				<view class="price-info" v-else></view> <!-- 占位 -->

				<view class="action-buttons">
					<!-- 发起聚会按钮 (次要操作，用空心或浅色) -->
					<view class="btn btn-outline" @click.stop="handleInitiateParty">
						<text>发起聚会</text>
					</view>

					<!-- 详情按钮 (主要操作，虽然点击卡片也能进，但保留按钮引导性更强) -->
					<!-- <view class="btn btn-primary" @click.stop="handleCardClick">
						<text>详情</text>
					</view> -->
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		computed
	} from 'vue';
	import {
		getInviteCode,
		checkLoginGuard 
	} from '../utils/user.js';

	const props = defineProps({
		store: {
			type: Object,
			required: true,
		},
	});

	const emit = defineEmits(['click-card']);

	// 计算封面图：优先取列表的第一张，没有则取单张字段，再没有用默认图
	const coverImage = computed(() => {
		if (props.store.storeCoverImageUrls && props.store.storeCoverImageUrls.length > 0) {
			return props.store.storeCoverImageUrls[0];
		}
		if (props.store.storeCoverImageUrl) {
			return props.store.storeCoverImageUrl;
		}
		return '/static/images/default-store.png'; // 请替换为您的默认图路径
	});

	// 计算距离显示
	const displayDistance = computed(() => {
		if (props.store.distanceKm) return props.store.distanceKm;
		if (typeof props.store.distance === 'number') {
			return props.store.distance.toFixed(1) + 'km';
		}
		return '';
	});

	const handleCardClick = () => {
		emit('click-card', props.store);
	};

	const handleInitiateParty = () => {
		if (!checkLoginGuard()) return;
		if (!props.store || !props.store.id) return;
		const url =
			`/packages/active-publish/active-publish?storeId=${props.store.id}&storeName=${encodeURIComponent(props.store.storeName)}`;
		uni.navigateTo({
			url
		});
	};
</script>

<style lang="scss" scoped>
	.store-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		display: flex;
		/* Flex 布局实现左图右文 */
		gap: 24rpx;
		/* 图片和内容的间距 */
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

		&:active {
			background-color: #f9f9f9;
		}
	}

	/* 左侧图片 */
	.card-image-wrapper {
		width: 180rpx;
		height: 180rpx;
		flex-shrink: 0;
		/* 防止被压缩 */
		border-radius: 12rpx;
		overflow: hidden;
		position: relative;
		background-color: #f5f5f5;
	}

	.card-image {
		width: 100%;
		height: 100%;
	}

	/* 右侧内容 */
	.card-content {
		flex: 1;
		min-width: 0;
		/* 关键：允许子元素在 flex 容器中收缩 */
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	/* 1. 头部 */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8rpx;
	}

	.store-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		line-height: 1.4;

		/* 限制店名最多显示1行，超出省略 (美团风格通常是单行) */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		margin-right: 10rpx;
	}

	.distance-badge {
		font-size: 22rpx;
		color: #666;
		flex-shrink: 0;
		padding-top: 4rpx;
		/* 微调对齐 */
	}

	/* 2. 描述 */
	.card-body {
		flex: 1;
		margin-bottom: 12rpx;
	}

	.store-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;

		/* 限制显示两行，超出省略 */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 3. 底部 */
	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.price-info {
		font-size: 24rpx;
		color: #ff6b00;
		font-weight: 500;
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.btn {
		font-size: 24rpx;
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 空心按钮样式 (发起聚会) */
	.btn-outline {
		border: 1rpx solid #ff6b00;
		color: #ff6b00;
		background-color: transparent;
	}

	/* 实心按钮样式 (详情) */
	/* .btn-primary {
		background: linear-gradient(to right, #ff8c00, #ff6b00);
		color: #fff;
		border: none;
	} */
</style>