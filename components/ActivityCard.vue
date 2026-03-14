<template>
	<view class="activity-card">
		<view @click="handleCardClick">

			<!-- ========== 【新增】发布者操作栏：封面正上方，仅本人发布的聚会显示 ========== -->
			<!-- 完全对齐「我的聚会」原始按钮组逻辑，从右向左排布 -->
			<view v-if="isOwner" class="owner-action-bar" @click.stop>

				<!-- 更多（最左）：内含 参会名单 / 取消聚会（限状态） / 修改编辑 -->
				<view class="owner-btn" @click.stop="showOwnerMoreActions">
					<uni-icons type="more-filled" size="14" color="#FF6B00" />
					<text>更多</text>
				</view>

				<view class="owner-divider" />

				<!-- 处理退款（取消状态才显示） -->
				<view v-if="activity.statusStr === '活动取消' || activity.statusStr === '聚会取消'"
					class="owner-btn owner-btn--danger" @click.stop="handleManageRefunds('all')">
					<uni-icons type="wallet" size="14" color="#f56c6c" />
					<text class="danger-text">处理退款</text>
				</view>
				<view v-if="activity.statusStr === '活动取消' || activity.statusStr === '聚会取消'" class="owner-divider" />

				<!-- 报名商友（始终显示）：带待确认红点 -->
				<view class="owner-btn" @click.stop="goToRegisteredUsers">
					<uni-icons type="person-filled" size="14" color="#FF6B00" />
					<text>报名商友</text>
					<view v-if="activity.pendingConfirmCount > 0" class="owner-badge">
						{{ activity.pendingConfirmCount }}
					</view>
				</view>

				<!-- 处理申请（最右，最醒目，有待处理才显示） -->
				<template v-if="activity.paddingReturnCount > 0">
					<view class="owner-divider" />
					<view class="owner-btn owner-btn--alert" @click.stop="handleManageRefunds('individual')">
						<uni-icons type="notification-filled" size="14" color="#fff" />
						<text>处理申请</text>
						<view class="owner-badge owner-badge--white">{{ activity.paddingReturnCount }}</view>
					</view>
				</template>

			</view>

			<!-- ========== 封面图 ========== -->
			<view class="card-cover-wrapper">
				<image :src="activity.coverImageUrl" class="activity-image" mode="aspectFill" />
				<view v-if="activity.statusStr" :class="['status-tag', getStatusClass(activity.statusStr)]">
					{{ activity.statusStr }}
				</view>
			</view>

			<!-- ========== 卡片内容 ========== -->
			<view class="activity-header">
				<text class="activity-title">{{ activity.activityTitle }}</text>
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

			<!-- 标签 + 互动数 -->
			<view class="activity-tags-row">
				<view class="activity-tags">
					<view v-for="(tag, index) in activity.tags" :key="index" class="tag">{{ tag }}</view>
				</view>
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

		<!-- ========== 底部：组织者 + 收藏/报名 ========== -->
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
				<!-- 本人发布的聚会不显示报名按钮 -->
				<button v-if="!isOwner" class="btn btn-primary" :class="{ 'btn-disabled': isRegistrationDisabled }"
					@click.stop="handleRegisterClick">报名</button>
			</view>
		</view>
	</view>

	<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />
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
		checkLoginGuard,
		isScenario3User
	} from '../utils/user.js';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';

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

	const smartGuidePopupRef = ref(null);

	const emit = defineEmits(['updateFavoriteStatus', 'updateLikeStatus']);

	const isFavorite = ref(props.activity.followFlag === 1);
	const loading = ref(false);

	// ── 判断是否本人发布 ──
	// memberUser.id 与本地存储的 userId 对比，用 == 兼容类型不一致
	const isOwner = computed(() => {
		const userId = uni.getStorageSync('userId');
		return !!userId && props.activity.memberUser?.id == userId;
	});

	const isRegistrationDisabled = computed(() => {
		// 包含 "已结束"、"活动取消"、"聚会取消" 等不可报名状态
		const disabledStatuses = ['已结束', '活动取消', '聚会取消', '已取消'];
		return disabledStatuses.includes(props.activity.statusStr);
	});

	// ── 格式化 ──
	const formattedDate = computed(() => {
		if (!props.activity.startDatetime) return '时间待定';
		const date = new Date(props.activity.startDatetime);
		const pad = n => n.toString().padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

	// ── 普通互动 ──
	const handleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		const apiAction = props.activity.userLikeStr === clickedAction ? 'cancel' : clickedAction;
		emit('updateLikeStatus', {
			id: props.activity.id,
			action: apiAction,
			clickedAction
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
		if (isRegistrationDisabled.value) return;
		uni.navigateTo({
			url: `/packages/active-enroll/active-enroll?id=${props.activity.id}`
		});
	};

	const toggleFavorite = async () => {
		if (loading.value) return;
		if (!await checkLoginGuard('登录并绑定手机号后才能收藏聚会，是否立即登录？')) return;
		loading.value = true;
		const original = isFavorite.value;
		isFavorite.value = !isFavorite.value;
		const endpoint = isFavorite.value ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
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
					title: isFavorite.value ? '收藏成功' : '已取消收藏',
					icon: 'success'
				});
				emit('updateFavoriteStatus', {
					id: props.activity.id,
					newFollowFlag: isFavorite.value ? 1 : 0
				});

				if (isScenario3User()) {
					// 延迟一秒弹出，避免跟上面的 Toast 提示重叠，体验更好
					setTimeout(() => {
						smartGuidePopupRef.value?.open();
					}, 1000);
				}
			} else {
				isFavorite.value = original;
				uni.showToast({
					title: error || '操作失败',
					icon: 'none'
				});
			}
		} catch {
			isFavorite.value = original;
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};

	// ── 发布者专属操作 ──

	const goToRegisteredUsers = () => {
		uni.navigateTo({
			url: `/pages/my-active-registeredUser/my-active-registeredUser?item=${encodeURIComponent(JSON.stringify(props.activity))}`
		});
	};

	const goToEdit = () => {
		uni.navigateTo({
			url: `/packages/active-publish/active-publish?mode=edit&id=${props.activity.id}`
		});
	};

	const handleManageRefunds = (mode) => {
		uni.navigateTo({
			url: `/pages/my-active-manage/my-active-manage?item=${encodeURIComponent(JSON.stringify(props.activity))}&mode=${mode}`
		});
	};

	const showOwnerMoreActions = () => {
		const itemList = [];
		const availableActions = {};

		// 参会名单（始终显示）
		itemList.push('参会名单');
		availableActions['参会名单'] = () => uni.navigateTo({
			url: `/packages/participant-detail/participant-detail?id=${props.activity.id}`
		});

		// 取消聚会（限状态）
		if (['未开始', '报名中', '活动即将开始', '进行中'].includes(props.activity.statusStr)) {
			itemList.push('取消聚会');
			availableActions['取消聚会'] = confirmCancelActivity;
		}

		// 修改编辑（始终显示）
		itemList.push('修改编辑');
		availableActions['修改编辑'] = () => uni.navigateTo({
			url: `/packages/active-publish/active-publish?mode=edit&id=${props.activity.id}`
		});

		uni.showActionSheet({
			itemList,
			success: (res) => {
				const tappedItem = itemList[res.tapIndex];
				if (availableActions[tappedItem]) availableActions[tappedItem]();
			},
			fail: (res) => {
				console.log(res.errMsg);
			}
		});
	};

	const confirmCancelActivity = () => {
		uni.showModal({
			title: '警告',
			content: '确定要取消此聚会吗？此操作不可逆。',
			confirmColor: '#f44336',
			success: async (res) => {
				if (!res.confirm) return;
				uni.showLoading({
					title: '正在取消...'
				});
				const result = await request('/app-api/member/activity/delete', {
					method: 'POST',
					data: {
						id: props.activity.id
					}
				});
				uni.hideLoading();
				if (result && !result.error) {
					uni.showToast({
						title: '聚会已取消',
						icon: 'success'
					});
					uni.$emit('activityCanceled', {
						id: props.activity.id
					});
				} else {
					const msg = typeof result.error === 'object' ?
						(result.error.msg || JSON.stringify(result.error)) :
						(result.error || '操作失败');
					uni.showToast({
						title: msg,
						icon: 'none'
					});
				}
			}
		});
	};
</script>

<style lang="scss" scoped>
	$primary: #FF6B00;

	.activity-card {
		background: white;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
		padding: 32rpx;
		margin: 32rpx auto;
		position: relative;
		overflow: hidden;
	}

	// ── 【核心】发布者操作栏：封面正上方，从右向左排布 ──
	.owner-action-bar {
		display: flex;
		flex-direction: row-reverse; // 从右向左
		align-items: center;
		background: #fff8f3;
		border: 1rpx solid #ffe0c8;
		border-radius: 16rpx;
		padding: 0 8rpx;
		margin-bottom: 20rpx;
		height: 68rpx;
	}

	.owner-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 10rpx 18rpx;
		border-radius: 12rpx;
		position: relative;
		flex-shrink: 0;

		&:active {
			background: rgba(255, 107, 0, 0.1);
		}

		text {
			font-size: 24rpx;
			color: $primary;
			font-weight: 500;
		}

		// 橙色高亮变体（处理申请）
		&--alert {
			background: linear-gradient(135deg, #FF6B00, #FF8C00);
			border-radius: 14rpx;
			margin-left: 4rpx;

			text {
				color: #fff;
			}

			&:active {
				opacity: 0.88;
			}
		}
	}

	.danger-text {
		color: #f56c6c !important;
	}

	.owner-divider {
		width: 1rpx;
		height: 28rpx;
		background: #f0d4c0;
		flex-shrink: 0;
	}

	// 红点徽标
	.owner-badge {
		position: absolute;
		top: 4rpx;
		right: 4rpx;
		background: #f56c6c;
		color: #fff;
		font-size: 18rpx;
		height: 26rpx;
		min-width: 26rpx;
		line-height: 26rpx;
		text-align: center;
		border-radius: 13rpx;
		padding: 0 5rpx;
		border: 2rpx solid #fff8f3;

		&--orange {
			background: $primary;
		}

		// 白色版（用于深色按钮上）
		&--white {
			background: #fff;
			color: $primary;
			border-color: $primary;
		}
	}

	// ── 封面图 ──
	.card-cover-wrapper {
		position: relative;
		margin-bottom: 30rpx;
	}

	.activity-image {
		width: 100%;
		aspect-ratio: 5 / 4;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		display: block;
	}

	.status-tag {
		position: absolute;
		top: 16rpx;
		right: 16rpx;
		font-size: 22rpx;
		padding: 6rpx 18rpx;
		border-radius: 20rpx;
		font-weight: 600;
		color: #fff;
		backdrop-filter: blur(4px);

		&.enrolled,
		&.ongoing {
			background: rgba(39, 174, 96, 0.85);
		}

		&.upcoming {
			background: rgba(250, 140, 22, 0.85);
		}

		&.ended {
			background: rgba(144, 147, 153, 0.85);
		}

		&.refund_pending {
			background: rgba(64, 158, 255, 0.85);
		}

		&.canceled {
			background: rgba(245, 108, 108, 0.85);
		}
	}

	// ── 内容区 ──
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
		color: $primary;
		font-weight: 500;

		text {
			margin-left: 8rpx;
		}
	}

	.activity-tags-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		gap: 16rpx;
	}

	.activity-tags {
		display: flex;
		gap: 16rpx;
		flex-wrap: wrap;
		flex: 1;
		min-width: 0;
	}

	.tag {
		background: #fff0e5;
		color: $primary;
		padding: 8rpx 20rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		border: 2rpx solid #ffdcc7;
		white-space: nowrap;
	}

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

	// ── 底部 ──
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
		display: flex;
		align-items: center;

		text {
			margin-left: 10rpx;
		}
	}

	.btn-primary {
		background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
		color: white;

		&.btn-disabled {
			background: #DCDFE6 !important; // 灰色背景
			color: #FFFFFF !important;
			border: none;

			// 移除点击态效果
			&:active {
				opacity: 1;
			}
		}
	}

	.btn-favorite {
		background: #ffe7d8;
		color: $primary;

		&:active {
			opacity: 0.9;
		}
	}
</style>