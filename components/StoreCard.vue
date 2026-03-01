<template>
	<view class="store-card" @click="handleCardClick">
		<!-- 左侧：封面图 + 互动统计 -->
		<view class="card-left">
			<view class="card-image-wrapper">
				<image :src="coverImage" mode="aspectFill" class="card-image" lazy-load></image>
			</view>

			<!-- 赞踩评论：放在图片正下方 -->
			<view class="card-interaction-row">
				<view class="mini-interaction" :class="{ active: store.userLikeStr === 'like' }"
					@click.stop="handleAction('like')">
					<uni-icons :type="store.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="14"
						:color="store.userLikeStr === 'like' ? '#ff6b00' : '#999'" />
					<text>{{ store.likesCount || 0 }}</text>
				</view>
				<view class="mini-interaction" :class="{ active: store.userLikeStr === 'dislike' }"
					@click.stop="handleAction('dislike')">
					<uni-icons :type="store.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'" size="14"
						:color="store.userLikeStr === 'dislike' ? '#3498db' : '#999'" />
					<text>{{ store.dislikesCount || 0 }}</text>
				</view>
				<view class="mini-interaction">
					<uni-icons type="chatbubble" size="14" color="#999" />
					<text>{{ store.commonCount || 0 }}</text>
				</view>
			</view>
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

			<!-- 2. 中部：描述 + 均价 -->
			<view class="card-body">
				<text class="store-desc">{{ store.storeDescription || '暂无介绍' }}</text>

				<!-- 均价：独占一行，不与按钮争空间，再长也不变形 -->
				<view class="price-info" v-if="store.averageConsumptionRange">
					<!-- <text class="price-label">人均</text> -->
					<text class="price-value">¥{{ store.averageConsumptionRange }}</text>
				</view>
			</view>

			<!-- 3. 底部：按钮组 -->
			<view class="card-footer">
				<view class="action-buttons">
					<!-- 聚店详情按钮 -->
					<view class="btn btn-primary-light" @click.stop="handleCardClick">
						<text>聚店详情</text>
					</view>
					<!-- 发起聚会按钮 -->
					<view class="btn btn-outline" @click.stop="handleInitiateParty">
						<text>发起聚会</text>
					</view>
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
		checkLoginGuard
	} from '../utils/user.js';

	const props = defineProps({
		store: {
			type: Object,
			required: true,
		},
	});

	const emit = defineEmits(['click-card', 'update-like']);

	/**
	 * 处理点赞 / 踩操作
	 * 先校验登录状态；若已是该操作则取消，否则执行对应操作
	 * @param {'like'|'dislike'} clickedAction - 用户点击的操作类型
	 */
	const handleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		// 若当前状态与点击操作相同，则视为取消；否则执行新操作
		const apiAction = props.store.userLikeStr === clickedAction ? 'cancel' : clickedAction;
		emit('update-like', {
			id: props.store.id,
			action: apiAction,
			clickedAction: clickedAction
		});
	};

	/**
	 * 计算封面图地址
	 * 优先取列表第一张 → 单张字段 → 默认占位图
	 */
	const coverImage = computed(() => {
		if (props.store.storeCoverImageUrls && props.store.storeCoverImageUrls.length > 0) {
			return props.store.storeCoverImageUrls[0];
		}
		if (props.store.storeCoverImageUrl) {
			return props.store.storeCoverImageUrl;
		}
		return '/static/images/default-store.png';
	});

	/**
	 * 计算距离展示文本
	 * 优先使用后端返回的格式化字符串，其次将数字格式化为 x.xkm
	 */
	const displayDistance = computed(() => {
		if (props.store.distanceKm) return props.store.distanceKm;
		if (typeof props.store.distance === 'number') {
			return props.store.distance.toFixed(1) + 'km';
		}
		return '';
	});

	/**
	 * 点击卡片主体，向父组件抛出店铺数据
	 */
	const handleCardClick = () => {
		emit('click-card', props.store);
	};

	/**
	 * 点击"发起聚会"按钮
	 * 先校验登录状态，通过后携带店铺参数跳转到活动发布页
	 */
	const handleInitiateParty = async () => {
		if (!await checkLoginGuard()) return;
		if (!props.store || !props.store.id) return;
		const url =
			`/packages/active-publish/active-publish?storeId=${props.store.id}&storeName=${encodeURIComponent(props.store.storeName)}`;
		uni.navigateTo({
			url
		});
	};
</script>

<style lang="scss" scoped>
	$primary: #ff6b00;

	/* ── 卡片容器 ── */
	.store-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		display: flex;
		gap: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

		&:active {
			background-color: #f9f9f9;
		}
	}

	/* ── 左侧：图片 + 互动统计 ── */
	.card-left {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		width: 180rpx;
	}

	.card-image-wrapper {
		width: 180rpx;
		height: 180rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f5f5f5;
	}

	.card-image {
		width: 100%;
		height: 100%;
	}

	/* 赞踩评论行：图片正下方，三项均分宽度 */
	.card-interaction-row {
		width: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.mini-interaction {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 20rpx;
		color: #999;

		&.active {
			color: $primary;
		}
	}

	/* ── 右侧内容区 ── */
	.card-content {
		flex: 1;
		min-width: 0;
		/* 允许 flex 子元素正常收缩 */
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	/* ── 1. 头部：店名 + 距离 ── */
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
	}

	/* ── 2. 中部：描述 + 均价 ── */
	.card-body {
		flex: 1;
		margin-bottom: 12rpx;
	}

	.store-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 均价：独占一行，文字再长也不变形，极端长度时自动换行兜底 */
	.price-info {
		display: flex;
		align-items: baseline;
		gap: 6rpx;
		margin-top: 10rpx;
		flex-wrap: wrap;

		.price-label {
			font-size: 22rpx;
			color: #999;
		}

		.price-value {
			font-size: 26rpx;
			color: $primary;
			font-weight: 600;
		}
	}

	/* ── 3. 底部：按钮组 ── */
	.card-footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.action-buttons {
		display: flex;
		gap: 12rpx;
	}

	/* 按钮基础样式 */
	.btn {
		font-size: 26rpx;
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		min-width: 120rpx;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 详情按钮：浅橙色背景 */
	.btn-primary-light {
		background-color: #fff5ec;
		color: $primary;
		border: 1rpx solid rgba($primary, 0.25);
	}

	/* 发起聚会按钮：空心橙边框 */
	.btn-outline {
		border: 1rpx solid $primary;
		color: $primary;
		background-color: transparent;
	}
</style>