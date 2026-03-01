<template>
	<view class="activity-card">
		<view @click="handleCardClick">
			<image :src="activity.coverImageUrl" class="activity-image" mode="aspectFill" />

			<view class="activity-header">
				<text class="activity-title">{{ activity.activityTitle }}</text>
				<view v-if="activity.statusStr" :class="['status-tag', getStatusClass(activity.statusStr)]">
					{{ activity.statusStr }}
				</view>
			</view>

			<view class="activity-info">
				<uni-icons type="calendar" size="16" color="#FF6B00" />
				<text>{{ formattedDate }}</text>
			</view>

			<view class="activity-info">
				<uni-icons type="location" size="16" color="#FF6B00" />
				<text>{{ activity.locationAddress || '线上聚会' }}</text>
			</view>

			<view class="activity-stats">
				<view class="participants">
					{{ activity.joinCount || 0 }}/{{ activity.totalSlots || '不限' }} 人参与
				</view>
				<view v-if="formattedDistance" class="activity-distance">
					<uni-icons type="paperplane-filled" size="16" color="#FF6B00" />
					<text>{{ formattedDistance }}</text>
				</view>
			</view>

			<!-- Tags + 赞踩评论数：同一行，左右分布 -->
			<view class="activity-tags-row">
				<!-- 左侧：标签组 -->
				<view class="activity-tags">
					<view v-for="(tag, index) in activity.tags" :key="index" class="tag">
						{{ tag }}
					</view>
				</view>

				<!-- 右侧：赞踩评论数，flex-shrink:0 保证不被 tags 挤压 -->
				<view class="activity-interactions">
					<view class="interaction-btn" :class="{ active: activity.userLikeStr === 'like' }"
						@click.stop="handleAction('like')">
						<uni-icons :type="activity.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="18"
							:color="activity.userLikeStr === 'like' ? '#e74c3c' : '#666'" />
						<text>{{ activity.likesCount || 0 }}</text>
					</view>
					<view class="interaction-btn" :class="{ active: activity.userLikeStr === 'dislike' }"
						@click.stop="handleAction('dislike')">
						<uni-icons :type="activity.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'"
							size="18" :color="activity.userLikeStr === 'dislike' ? '#3498db' : '#666'" />
						<text>{{ activity.dislikesCount || 0 }}</text>
					</view>
					<view class="interaction-btn">
						<uni-icons type="chatbubble" size="18" color="#666" />
						<text>{{ activity.commonCount || 0 }}</text>
					</view>
				</view>
			</view>

		</view>

		<view class="activity-footer">
			<view class="organizer">
				<uni-icons type="contact-filled" size="16" color="#FF6B00" />
				<text>{{ activity.memberUser.nickname || '主办方' }}</text>
			</view>
			<view class="action-buttons">
				<button class="btn btn-favorite" @click.stop="toggleFavorite" :disabled="loading">
					<uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="16" color="#FF6B00" />
					<text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
				</button>
				<button class="btn btn-primary" @click.stop="handleRegisterClick">报名</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		defineProps,
		defineEmits,
		ref,
		computed
	} from 'vue';
	import request from '../utils/request.js';
	import {
		checkLoginGuard
	} from '../utils/user.js';

	const props = defineProps({
		activity: {
			type: Object,
			required: true
		},
		isLogin: {
			type: Boolean,
			default: false
		}
	});

	const emit = defineEmits(['updateFavoriteStatus', 'updateLikeStatus']);

	const isFavorite = ref(props.activity.followFlag === 1);
	const loading = ref(false);

	const formattedDate = computed(() => {
		if (!props.activity.startDatetime) return '时间待定';
		const date = new Date(props.activity.startDatetime);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	});

	const formattedDistance = computed(() => {
		if (typeof props.activity.distance === 'number') {
			return `${props.activity.distance.toFixed(2)} km`;
		}
		return null;
	});

	const getStatusClass = (statusStr) => {
		const classMap = {
			'已取消': 'canceled',
			'未开始': 'upcoming',
			'报名中': 'enrolled',
			'即将开始': 'upcoming',
			'进行中': 'ongoing',
			'已结束': 'ended',
			'待退款': 'refund_pending'
		};
		return classMap[statusStr] || '';
	};

	const handleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		const apiAction = props.activity.userLikeStr === clickedAction ? 'cancel' : clickedAction;
		emit('updateLikeStatus', {
			id: props.activity.id,
			action: apiAction,
			clickedAction: clickedAction
		});
	};

	const handleCardClick = async () => {
		if (!await checkLoginGuard('登录并绑定手机号后才能查看聚会详情，是否立即登录？')) return;
		uni.navigateTo({
			url: `/packages/active-detail/active-detail?id=${props.activity.id}`
		});
	};

	const handleRegisterClick = async () => {
		if (!await checkLoginGuard('登录并绑定手机号后才能报名聚会，是否立即登录？')) return;
		uni.navigateTo({
			url: `/packages/active-enroll/active-enroll?id=${props.activity.id}`
		});
	};

	const toggleFavorite = async () => {
		if (loading.value) return;
		if (!await checkLoginGuard('登录并绑定手机号后才能收藏聚会，是否立即登录？')) return;

		loading.value = true;
		const originalFavoriteStatus = isFavorite.value;
		isFavorite.value = !isFavorite.value;

		const endpoint = isFavorite.value ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMessage = isFavorite.value ? '收藏成功' : '已取消收藏';

		try {
			const {
				error
			} = await request(endpoint, {
				method: 'POST',
				data: {
					userId: uni.getStorageSync('userId'),
					targetId: props.activity.id,
					targetType: 'activity'
				}
			});
			if (!error) {
				uni.showToast({
					title: successMessage,
					icon: 'success'
				});
				emit('updateFavoriteStatus', {
					id: props.activity.id,
					newFollowFlag: isFavorite.value ? 1 : 0
				});
			} else {
				isFavorite.value = originalFavoriteStatus;
				uni.showToast({
					title: error || '操作失败',
					icon: 'none'
				});
			}
		} catch (err) {
			isFavorite.value = originalFavoriteStatus;
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};
</script>

<style lang="scss" scoped>
	.activity-card {
		background: white;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
		padding: 32rpx;
		margin: 32rpx auto;
		position: relative;
		overflow: hidden;
	}

	.activity-image {
		width: 100%;
		aspect-ratio: 5 / 4;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		object-fit: cover;
	}

	.activity-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 20rpx;
		margin-bottom: 24rpx;
	}

	.activity-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #1c1e21;
		flex: 1;
	}

	.status-tag {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		white-space: nowrap;

		&.enrolled,
		&.ongoing {
			background-color: #e8f5e9;
			color: #27ae60;
		}

		&.upcoming {
			background-color: #fff0e5;
			color: #fa8c16;
		}

		&.ended {
			background-color: #f0f2f5;
			color: #909399;
		}

		&.refund_pending {
			background-color: #ecf5ff;
			color: #409eff;
		}

		&.canceled {
			background-color: #fef0f0;
			color: #f56c6c;
		}
	}

	.activity-info {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
		color: #606770;
		font-size: 28rpx;

		text {
			margin-left: 16rpx;
		}
	}

	.activity-stats {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
		font-size: 26rpx;
		color: #65676b;
	}

	.participants {
		background: #f0f2f5;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
	}

	.activity-distance {
		display: flex;
		align-items: center;
		color: #FF6B00;
		font-weight: 500;

		text {
			margin-left: 8rpx;
		}
	}

	/* ── Tags + 赞踩同一行 ── */
	.activity-tags-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		gap: 16rpx;
	}

	/* 左侧标签组：可换行，不挤占右侧 */
	.activity-tags {
		display: flex;
		gap: 16rpx;
		flex-wrap: wrap;
		flex: 1;
		min-width: 0;
	}

	.tag {
		background: #fff0e5;
		color: #FF6B00;
		padding: 8rpx 20rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		border: 2rpx solid #ffdcc7;
		white-space: nowrap;
	}

	/* 右侧互动数：不被压缩 */
	.activity-interactions {
		display: flex;
		align-items: center;
		gap: 24rpx;
		flex-shrink: 0;
	}

	.interaction-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		color: #666;
		font-size: 26rpx;

		&.active {
			font-weight: bold;
		}
	}

	.activity-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 30rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #f0f2f5;
	}

	.organizer {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #606770;

		text {
			margin-left: 10rpx;
		}
	}

	.action-buttons {
		display: flex;
		gap: 24rpx;
	}

	.btn {
		padding: 4rpx 24rpx;
		border-radius: 12rpx;
		font-weight: 500;
		font-size: 28rpx;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: all 0.3s;

		text {
			margin-left: 10rpx;
		}
	}

	.btn-primary {
		background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
		color: white;

		&:active {
			opacity: 0.9;
			transform: translateY(-4rpx);
		}
	}

	.btn-favorite {
		background: #ffe7d8;
		color: #FF6B00;

		&:active {
			opacity: 0.9;
			transform: translateY(-4rpx);
		}
	}
</style>