<template>
	<view class="activity-card">
		<!-- ========== 1. 发布者操作栏（保持原样） ========== -->
		<view v-if="isOwner" class="owner-action-bar" @click.stop>
			<view class="owner-btn" @click.stop="showOwnerMoreActions">
				<uni-icons type="more-filled" size="14" color="#FF6B00" />
				<text>更多</text>
			</view>
			<view class="owner-divider" />
			<view v-if="activity.statusStr === '活动取消' || activity.statusStr === '聚会取消'"
				class="owner-btn owner-btn--danger" @click.stop="handleManageRefunds('all')">
				<uni-icons type="wallet" size="14" color="#f56c6c" />
				<text class="danger-text">处理退款</text>
			</view>
			<view v-if="activity.statusStr === '活动取消' || activity.statusStr === '聚会取消'" class="owner-divider" />
			<view class="owner-btn" @click.stop="goToRegisteredUsers">
				<uni-icons type="person-filled" size="14" color="#FF6B00" />
				<text>报名确认</text>
				<view v-if="activity.pendingConfirmCount > 0" class="owner-badge">
					{{ activity.pendingConfirmCount }}
				</view>
			</view>
			<template v-if="activity.paddingReturnCount > 0">
				<view class="owner-divider" />
				<view class="owner-btn owner-btn--alert" @click.stop="handleManageRefunds('individual')">
					<uni-icons type="notification-filled" size="14" color="#fff" />
					<text>处理申请</text>
					<view class="owner-badge owner-badge--white">{{ activity.paddingReturnCount }}</view>
				</view>
			</template>
		</view>

		<view @click="handleCardClick">
			<!-- ========== 2. 封面区域：整合标题、Tag、组织者 ========== -->
			<view class="card-cover-wrapper">
				<image :src="activity.coverImageUrl" class="activity-image" mode="aspectFill" />

				<!-- 左上角 Tag -->
				<view class="tags-stack">
					<!-- 聚会类型标签 -->
					<view class="tag-overlay" v-if="activity.tags && activity.tags.length > 0">
						{{ activity.tags[0] }}
					</view>

					<!-- 聚会状态标签（移到了堆叠容器内） -->
					<view v-if="activity.statusStr" :class="['status-tag', getStatusClass(activity.statusStr)]">
						{{ activity.statusStr }}
					</view>
				</view>

				<!-- 右上角 组织者（毛玻璃效果） -->
				<view class="organizer-overlay">
					<image :src="activity.memberUser.avatar" class="org-avatar" mode="aspectFill" />
					<text class="org-nickname">{{ activity.memberUser.nickname || '主办方' }}</text>
				</view>

				<!-- 底部标题遮罩：渐变阴影，文字最多两行 -->
				<view class="title-blur-box">
					<text class="activity-title">{{ activity.activityTitle }}</text>
				</view>
			</view>

			<!-- ========== 3. 基本信息：文字标签化 ========== -->
			<view class="info-content">
				<view class="info-item">
					<text class="info-label">聚会时间：</text>
					<text class="info-text">{{ formattedDate }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">报名时间：</text>
					<text class="info-text">{{ formattedRegDate }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">聚会地点：</text>
					<text class="info-text text-ellipsis">{{ activity.locationAddress || '线上聚会' }}</text>
				</view>
			</view>
		</view>

		<!-- ========== 4. 阅读留痕（按钮组上方） ========== -->
		<view class="post-view-trace"
			v-if="activity.isReadTrace === 1 && (activity.targetViews?.length > 0 || activity.hasSilentLoginUser === 1)"
			@click.stop="handleViewTrace">
			<view class="view-avatar-row">
				<template
					v-for="(viewer, vIdx) in (activity.targetViews || []).slice(0, activity.hasSilentLoginUser === 1 ? 7 : 8)"
					:key="vIdx">
					<image :src="viewer.memberUser?.avatar || '/static/icon/default-avatar.png'" class="tiny-avatar"
						mode="aspectFill" />
				</template>
				<image v-if="activity.hasSilentLoginUser === 1"
					src="https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png"
					class="tiny-avatar silent-avatar" mode="aspectFill" />
				<text class="view-count-txt">等{{ activity.targetViewNum || 0 }}位商友看过</text>
			</view>
			<uni-icons type="right" size="12" color="#ccc" />
		</view>

		<!-- ========== 5. 底部：互动数 + 按钮（合并为一行） ========== -->
		<view class="card-footer">
			<view class="activity-interactions">
				<view class="interaction-btn" @click.stop="handleAction('like')">
					<uni-icons :type="activity.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="18"
						:color="activity.userLikeStr === 'like' ? '#FF6B00' : '#888'" />
					<text :class="{ active: activity.userLikeStr === 'like' }">{{ activity.likesCount || 0 }}</text>
				</view>
				<view class="interaction-btn" @click.stop="handleAction('dislike')">
					<uni-icons :type="activity.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'" size="18"
						:color="activity.userLikeStr === 'dislike' ? '#3498db' : '#888'" />
					<text
						:class="{ 'active-dislike': activity.userLikeStr === 'dislike' }">{{ activity.dislikesCount || 0 }}</text>
				</view>
				<view class="interaction-btn">
					<uni-icons type="chatbubble" size="18" color="#888" />
					<text>{{ activity.commonCount || 0 }}</text>
				</view>
			</view>

			<view class="action-buttons">
				<view class="btn-mini btn-favorite" @click.stop="toggleFavorite">
					<uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="16" color="#FF6B00" />
					<text>{{ isFavorite ? '已收' : '收藏' }}</text>
				</view>
				<view class="btn-mini btn-primary" :class="{ 'btn-disabled': isRegistrationDisabled }"
					@click.stop="handleRegisterClick">
					立即报名
				</view>
			</view>
		</view>

		<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />
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
		if (!props.activity.startDatetime) return '待定';
		const date = new Date(props.activity.startDatetime);
		const pad = n => n.toString().padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} 开始`;
	});

	const formattedRegDate = computed(() => {
		if (!props.activity.registrationStartDatetime) return '待定';
		const date = new Date(props.activity.registrationStartDatetime);
		const pad = n => n.toString().padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} 开始`
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

	/**
	 * 跳转到浏览记录，携带 hasSilent 参数
	 */
	const handleViewTrace = () => {
		const hasSilent = props.activity.hasSilentLoginUser || 0;
		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${props.activity.id}&type=activity&hasSilent=${hasSilent}`
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
		padding: 24rpx;
		margin: 24rpx auto;
		position: relative;
		overflow: hidden;
	}

	/* ── 发布者操作栏 ── */
	.owner-action-bar {
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		background: #fff8f3;
		border: 1rpx solid #ffe0c8;
		border-radius: 12rpx;
		padding: 0 8rpx;
		margin-bottom: 20rpx;
		height: 60rpx;
	}

	.owner-btn {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: 0 16rpx;

		text {
			font-size: 22rpx;
			color: $primary;
			font-weight: 500;
		}

		&--alert {
			background: linear-gradient(135deg, $primary, #FF8C00);
			border-radius: 10rpx;

			text {
				color: #fff;
			}
		}
	}

	.owner-divider {
		width: 1rpx;
		height: 24rpx;
		background: #f0d4c0;
	}

	.owner-badge {
		position: absolute;
		top: -6rpx;
		right: 0;
		background: #f56c6c;
		color: #fff;
		font-size: 16rpx;
		height: 24rpx;
		min-width: 24rpx;
		line-height: 24rpx;
		text-align: center;
		border-radius: 12rpx;
		padding: 0 4rpx;
		border: 2rpx solid #fff8f3;

		&--white {
			background: #fff;
			color: $primary;
			border-color: $primary;
		}
	}

	/* ── 封面区重构 ── */
	.card-cover-wrapper {
		position: relative;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
	}

	.activity-image {
		width: 100%;
		aspect-ratio: 5 / 3.2;
		display: block;
	}

	.organizer-overlay {
		position: absolute;
		top: 16rpx;
		right: 16rpx;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(8px);
		padding: 4rpx 12rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;

		.org-avatar {
			width: 32rpx;
			height: 32rpx;
			border-radius: 50%;
		}

		.org-nickname {
			font-size: 18rpx;
			color: #333;
			font-weight: bold;
		}
	}

	.tags-stack {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		display: flex;
		flex-direction: column;
		/* 垂直排列 */
		align-items: flex-start;
		/* 左对齐 */
		gap: 12rpx;
		/* 两个标签之间的间距 */
		z-index: 10;
	}

	/* 聚会类型标签 - 修改为 static（由父容器控制位置） */
	.tag-overlay {
		background: rgba($primary, 0.95);
		color: #fff;
		font-size: 24rpx;
		padding: 6rpx 20rpx;
		border-radius: 10rpx;
		font-weight: bold;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
	}

	.status-tag {
		font-size: 18rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		color: #fff;
		font-weight: bold;
		z-index: 2;

		&.enrolled {
			background: #52c41a;
		}

		&.upcoming {
			background: $primary;
		}

		&.ended,
		&.canceled {
			background: #999;
		}
	}

	.title-blur-box {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.7);
		/* 70% 白底 */
		// backdrop-filter: blur(20px);
		/* 强模糊 */
		-webkit-backdrop-filter: blur(60px);
		padding: 24rpx 24rpx 20rpx;
		border-top: 1rpx solid rgba(255, 255, 255, 0.4);
		border-radius: 20rpx 20rpx 0 0;


		.activity-title {
			color: #000;
			font-size: 30rpx;
			font-weight: 900;
			line-height: 1.4;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}
	}

	/* ── 基本信息 ── */
	.info-content {
		padding: 0 4rpx;
		margin-bottom: 20rpx;

		.info-item {
			display: flex;
			margin-bottom: 8rpx;
			font-size: 24rpx;
			line-height: 1.4;
		}

		.info-label {
			color: $primary;
			flex-shrink: 0;
			font-weight: 500;
		}

		.info-text {
			color: #666;
			flex: 1;
		}
	}

	/* ── 阅读留痕 ── */
	.post-view-trace {
		padding: 16rpx 0;
		border-top: 1rpx solid #f5f5f5;
		border-bottom: 1rpx solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.view-avatar-row {
		display: flex;
		align-items: center;
	}

	.tiny-avatar {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		border: 2rpx solid #fff;
		margin-right: -8rpx;
	}

	.silent-avatar {
		border: 2rpx solid $primary !important;
		background: #fff;
	}

	.view-count-txt {
		font-size: 20rpx;
		color: #999;
		margin-left: 20rpx;
	}

	/* ── 底部操作行 ── */
	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.activity-interactions {
		display: flex;
		gap: 24rpx;

		.interaction-btn {
			display: flex;
			align-items: center;
			gap: 4rpx;
			font-size: 24rpx;
			color: #888;

			.active {
				color: $primary;
				font-weight: bold;
			}
		}
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.btn-mini {
		height: 56rpx;
		padding: 0 20rpx;
		border-radius: 28rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		font-weight: bold;
	}

	.btn-primary {
		background: linear-gradient(to right, $primary, #FF8C00);
		color: #fff;

		&.btn-disabled {
			background: #eee !important;
			color: #ccc;
		}
	}

	.btn-favorite {
		background: #fff1e8;
		color: $primary;
		gap: 6rpx;
	}

	.text-ellipsis {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>