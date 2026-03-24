<template>
	<view class="store-card" @click="handleCardClick">
		<!-- 1. 上半部分：主体内容（左右布局） -->
		<view class="main-body">
			<!-- 左侧：封面图 + 互动统计 -->
			<view class="card-left">
				<view class="card-image-wrapper">
					<image :src="coverImage" mode="aspectFill" class="card-image" lazy-load></image>
				</view>

				<!-- 浏览模式：赞、踩、评论数 -->
				<view class="card-interaction-row" v-if="mode === 'browse'">
					<!-- 点赞 -->
					<view class="mini-interaction" :class="{ active: store.userLikeStr === 'like' }"
						@click.stop="handleAction('like')">
						<uni-icons :type="store.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="14"
							:color="store.userLikeStr === 'like' ? '#ff6b00' : '#999'" />
						<text>{{ store.likesCount || 0 }}</text>
					</view>
					<!-- 点踩 -->
					<view class="mini-interaction" :class="{ active: store.userLikeStr === 'dislike' }"
						@click.stop="handleAction('dislike')">
						<uni-icons :type="store.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'" size="14"
							:color="store.userLikeStr === 'dislike' ? '#3498db' : '#999'" />
						<text>{{ store.dislikesCount || 0 }}</text>
					</view>
					<!-- 评论数 (补回) -->
					<view class="mini-interaction">
						<uni-icons type="chatbubble" size="14" color="#999" />
						<text>{{ store.commonCount || 0 }}</text>
					</view>
				</view>

				<!-- 我的聚店模式：帮创标识 -->
				<view class="helper-tag" v-if="mode === 'mine' && store.isStoreOwner === 0">
					<uni-icons type="flag" size="12" color="#888"></uni-icons>
					<text>帮创聚店</text>
				</view>
			</view>

			<!-- 右侧：文字内容区 -->
			<view class="card-content">
				<view class="content-top">
					<view class="card-header">
						<text class="store-name">{{ store.storeName }}</text>
						<view class="distance-badge" v-if="mode === 'browse' && displayDistance">
							<text>{{ displayDistance }}</text>
						</view>
						<view v-if="mode === 'mine'" class="status-badge" :class="statusClass">
							<text>{{ statusText }}</text>
						</view>
					</view>
					<text class="store-desc">{{ store.storeDescription || '暂无介绍' }}</text>
					<view class="price-info" v-if="store.averageConsumptionRange">
						<text class="price-label">人均</text>
						<text class="price-value">¥{{ store.averageConsumptionRange }}</text>
					</view>
				</view>

				<!-- 底部按钮 -->
				<view class="card-footer">
					<view class="action-buttons">
						<template v-if="mode === 'browse'">
							<view class="btn btn-primary-light" @click.stop="handleCardClick">聚店详情</view>
							<view class="btn btn-outline" @click.stop="handleInitiateParty">发起聚会</view>
						</template>
						<template v-if="mode === 'mine'">
							<view class="btn btn-primary-light" @click.stop="handleViewDetail">详情</view>
							<view class="btn btn-outline" @click.stop="handleEditStore">编辑</view>
						</template>
					</view>
				</view>
			</view>
		</view>

		<!-- 2. 下半部分：阅读留痕（独占一行，最底部） -->
		<view class="post-view-trace"
			v-if="mode === 'browse' && store.isReadTrace === 1 && (store.targetViews?.length > 0 || store.hasSilentLoginUser === 1)"
			@click.stop="handleViewTrace">
			<view class="view-avatar-row">
				<template
					v-for="(viewer, vIdx) in (store.targetViews || []).slice(0, store.hasSilentLoginUser === 1 ? 7 : 8)"
					:key="vIdx">
					<image :src="viewer.memberUser?.avatar || '/static/icon/default-avatar.png'" class="tiny-avatar"
						mode="aspectFill" />
				</template>
				<image v-if="store.hasSilentLoginUser === 1"
					src="https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png"
					class="tiny-avatar silent-avatar" mode="aspectFill" />
				<text class="view-count-txt">等{{ store.targetViewNum || 0 }}位商友看过</text>
			</view>
			<uni-icons type="right" size="12" color="#ccc" />
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
		/**
		 * 卡片使用场景
		 * 'browse' - 浏览模式（默认）：显示赞踩、发起聚会
		 * 'mine'   - 我的聚店模式：显示审核状态、帮创标识、编辑按钮
		 */
		mode: {
			type: String,
			default: 'browse',
		},
	});

	const emit = defineEmits(['click-card', 'update-like', 'edit-store']);

	// ─── 计算属性 ───

	/**
	 * 封面图地址
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
	 * 距离展示文本（仅浏览模式使用）
	 * 优先使用后端格式化字符串，其次将数字格式化为 x.xkm
	 */
	const displayDistance = computed(() => {
		if (props.store.distanceKm) return props.store.distanceKm;
		if (typeof props.store.distance === 'number') {
			return props.store.distance.toFixed(1) + 'km';
		}
		return '';
	});

	/**
	 * 审核状态文字（我的聚店模式使用）
	 * status: 1-正常 2-审核中 0-审核失败
	 */
	const statusText = computed(() => {
		const map = {
			1: '正常',
			2: '审核中',
			0: '审核失败'
		};
		return map[props.store.status] ?? '未知';
	});

	/**
	 * 审核状态对应的 CSS 类名，用于不同颜色区分
	 */
	const statusClass = computed(() => {
		const map = {
			1: 'status-normal',
			2: 'status-pending',
			0: 'status-failed'
		};
		return map[props.store.status] ?? '';
	});

	// ─── 事件处理 ───

	/**
	 * 处理点赞 / 踩操作（仅浏览模式）
	 * 先校验登录；若已是该操作则取消，否则执行
	 * @param {'like'|'dislike'} clickedAction
	 */
	const handleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		const apiAction = props.store.userLikeStr === clickedAction ? 'cancel' : clickedAction;
		emit('update-like', {
			id: props.store.id,
			action: apiAction,
			clickedAction: clickedAction
		});
	};

	/**
	 * 点击卡片主体（浏览模式）或"聚店详情"按钮（两种模式通用）
	 * 向父组件抛出店铺数据，由父组件决定跳转目标
	 */
	const handleCardClick = () => {
		emit('click-card', props.store);
	};

	/**
	 * 我的聚店模式：点击"聚店详情"
	 * 跳转至聚店详情页
	 */
	const handleViewDetail = async () => {
		if (!await checkLoginGuard()) return;
		uni.navigateTo({
			url: `/packages/shop-detail/shop-detail?id=${props.store.id}`
		});
	};

	/**
	 * 跳转到聚店浏览记录，携带 type=store 和 hasSilent 参数
	 */
	const handleViewTrace = () => {
		const hasSilent = props.store.hasSilentLoginUser || 0;
		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${props.store.id}&type=store&hasSilent=${hasSilent}`
		});
	};

	/**
	 * 我的聚店模式：点击"编辑聚店"
	 * 向父组件抛出 edit-store 事件，由父组件跳转到编辑页
	 */
	const handleEditStore = () => {
		emit('edit-store', props.store);
	};

	/**
	 * 浏览模式：点击"发起聚会"
	 * 先校验登录，通过后携带店铺参数跳转到活动发布页
	 */
	const handleInitiateParty = async () => {
		if (!await checkLoginGuard()) return;
		if (!props.store || !props.store.id) return;
		uni.navigateTo({
			url: `/packages/active-publish/active-publish?storeId=${props.store.id}&storeName=${encodeURIComponent(props.store.storeName)}`
		});
	};
</script>

<style lang="scss" scoped>
	$primary: #ff6b00;

	.store-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;

		&:active {
			background-color: #fafafa;
		}
	}

	.main-body {
		display: flex;
		gap: 24rpx;
	}

	/* ── 左侧 ── */
	.card-left {
		flex-shrink: 0;
		width: 180rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.card-image-wrapper {
		width: 180rpx;
		height: 180rpx;
		border-radius: 16rpx;
		overflow: hidden;
		background-color: #f5f5f5;
		margin-bottom: 16rpx;
	}

	.card-image {
		width: 100%;
		height: 100%;
	}

	.card-interaction-row {
		display: flex;
		justify-content: space-between; // 三个图标均匀分布
		width: 100%;
		padding: 0 4rpx;

		.mini-interaction {
			display: flex;
			align-items: center;
			gap: 4rpx;
			font-size: 20rpx; // 稍微调小一点字体以容纳三个图标
			color: #999;

			&.active {
				color: $primary;
			}

			text {
				line-height: 1;
			}
		}
	}

	/* ── 右侧 ── */
	.card-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;

		.store-name {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			flex: 1;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.distance-badge {
			font-size: 22rpx;
			color: #888;
			margin-left: 10rpx;
		}
	}

	.store-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		margin-bottom: 12rpx;
	}

	.price-info {
		display: flex;
		align-items: baseline;
		gap: 4rpx;

		.price-label {
			font-size: 22rpx;
			color: #999;
		}

		.price-value {
			font-size: 28rpx;
			color: $primary;
			font-weight: bold;
		}
	}

	.card-footer {
		margin-top: 16rpx;
		display: flex;
		justify-content: flex-end;
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.btn {
		font-size: 24rpx;
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		font-weight: 500;

		&.btn-primary-light {
			background-color: #fff5ec;
			color: $primary;
		}

		&.btn-outline {
			border: 1rpx solid $primary;
			color: $primary;
		}
	}

	/* ── 阅读留痕 ── */
	.post-view-trace {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f2f2f2;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.view-avatar-row {
		display: flex;
		align-items: center;

		.tiny-avatar {
			width: 36rpx;
			height: 36rpx;
			border-radius: 50%;
			border: 2rpx solid #fff;
			margin-right: -10rpx;
		}

		.silent-avatar {
			border-color: #FF8C00 !important;
		}

		.view-count-txt {
			font-size: 22rpx;
			color: #bbb;
			margin-left: 20rpx;
		}
	}

	.status-badge {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;

		&.status-normal {
			background: #e8f7ee;
			color: #27ae60;
		}

		&.status-pending {
			background: #fff8e6;
			color: #f39c12;
		}

		&.status-failed {
			background: #fff0f0;
			color: #e74c3c;
		}
	}

	.helper-tag {
		margin-top: 10rpx;
		display: flex;
		align-items: center;
		gap: 4rpx;
		background: #f5f5f5;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		color: #888;
		font-size: 20rpx;
	}
</style>