<template>
	<view class="activity-card">
		<!-- 将点击事件的参数传入 -->
		<view @click="handleCardClick">
			<!-- 绑定正确的图片字段 -->
			<image :src="activity.coverImageUrl" class="activity-image" mode="aspectFill" />

			<view class="activity-header">
				<text class="activity-title">{{ activity.activityTitle }}</text>
				<!-- 显示聚会状态的标签 -->
				<view v-if="activity.statusStr" :class="['status-tag', getStatusClass(activity.statusStr)]">
					{{ activity.statusStr }}
				</view>
			</view>

			<view class="activity-info">
				<uni-icons type="calendar" size="16" color="#FF6B00" />
				<!-- 使用格式化后的日期 -->
				<text>{{ formattedDate }}</text>
			</view>

			<view class="activity-info">
				<uni-icons type="location" size="16" color="#FF6B00" />
				<!-- 绑定正确的地点字段 (locationAddress) -->
				<text>{{ activity.locationAddress || '线上聚会' }}</text>
			</view>

			<!-- 将距离显示移入此区域 -->
			<view class="activity-stats">
				<view class="participants">
					<!-- 绑定正确的报名人数(joinCount)和总名额(totalSlots) -->
					{{ activity.joinCount || 0 }}/{{ activity.totalSlots || '不限' }} 人参与
				</view>
				<!-- 活动距离显示，放置在行末 -->
				<view v-if="formattedDistance" class="activity-distance">
					<uni-icons type="paperplane-filled" size="16" color="#FF6B00" />
					<text>{{ formattedDistance }}</text>
				</view>
			</view>

			<view class="activity-tags">
				<!-- 后端返回的 tags 是一个数组，可以直接使用 -->
				<view v-for="(tag, index) in activity.tags" :key="index" class="tag">
					{{ tag }}
				</view>
			</view>

		</view>

		<view class="activity-footer">
			<view class="organizer">
				<uni-icons type="contact-filled" size="16" color="#FF6B00" />
				<!-- 绑定正确的组织者字段 (organizerUnitName) -->
				<text>{{ activity.memberUser.nickname || '主办方' }}</text>
			</view>
			<view class="action-buttons">
				<!-- 添加 :disabled="loading" 防止重复点击 -->
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
		checkLoginGuard // 【新增】导入权限卫士
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

	const emit = defineEmits(['updateFavoriteStatus']);
	const isFavorite = ref(props.activity.followFlag === 1);

	const loading = ref(false);

	const formattedDate = computed(() => {
		if (!props.activity.startDatetime) {
			return '时间待定';
		}
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
		return null; // 如果没有distance字段或不是数字，则不显示
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

	// 一个统一的函数来处理需要登录的操作
	const requireLogin = (actionCallback, message) => {
		if (props.isLogin) {
			// 如果已登录，直接执行回调函数
			actionCallback();
		} else {
			// 如果未登录，弹出提示
			uni.showModal({
				title: '温馨提示',
				content: message || '您还未登录，登录后才能进行此操作哦！',
				confirmText: '去登录',
				cancelText: '再看看',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}
				}
			});
		}
	};

	// 卡片主体点击事件
	const handleCardClick = () => {
		// 使用统一卫士，如果校验未通过，自动弹窗并拦截
		if (!checkLoginGuard('登录并绑定手机号后才能查看聚会详情，是否立即登录？')) return;

		// 校验通过，执行跳转
		uni.navigateTo({
			url: `/packages/active-detail/active-detail?id=${props.activity.id}`
		});
	};

	// 报名按钮点击事件
	const handleRegisterClick = () => {
		if (!checkLoginGuard('登录并绑定手机号后才能报名聚会，是否立即登录？')) return;

		uni.navigateTo({
			url: `/packages/active-enroll/active-enroll?id=${props.activity.id}`
		});
	};

	const toggleFavorite = async () => {
		if (loading.value) {
			return;
		}
		if (!checkLoginGuard('登录并绑定手机号后才能收藏聚会，是否立即登录？')) return;

		loading.value = true;
		const userId = uni.getStorageSync('userId');
		const originalFavoriteStatus = isFavorite.value;
		isFavorite.value = !isFavorite.value;
		const endpoint = isFavorite.value ? '/app-api/member/follow/add' :
			'/app-api/member/follow/del';
		const successMessage = isFavorite.value ? '收藏成功' : '已取消收藏';
		const payload = {
			userId,
			targetId: props.activity.id,
			targetType: "activity"
		};

		try {
			const {
				error
			} = await request(endpoint, {
				method: 'POST',
				data: payload
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
	}

	const registerActivity = (activityId) => {
		uni.navigateTo({
			url: `/packages/active-enroll/active-enroll?id=${activityId}`
		})
	};

	const detailActivity = (activityId) => {
		uni.navigateTo({
			url: `/packages/active-detail/active-detail?id=${activityId}`
		});
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
		/* ⭐ 设置为 5:4 比例 */
		// height: 320rpx;
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
		/* 占据剩余空间，防止标题过长时状态标签被挤下去 */
	}

	/* 【核心修改】状态标签样式 */
	.status-tag {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		white-space: nowrap;

		/* 报名中/进行中 (绿色 - 活力) */
		&.enrolled,
		&.ongoing {
			background-color: #e8f5e9;
			color: #27ae60;
		}

		/* 未开始/即将开始 (橙色 - 提醒, 使用App主题色) */
		&.upcoming {
			background-color: #fff0e5;
			color: #fa8c16;
		}

		/* 已结束 (灰色 - 失效) */
		&.ended {
			background-color: #f0f2f5;
			color: #909399;
		}

		/* 待退款 (蓝色 - 信息) */
		&.refund_pending {
			background-color: #ecf5ff;
			color: #409eff;
		}

		/* 已取消 (红色 - 警告) */
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
		/* 覆盖父级的灰色 */
		font-weight: 500;
		margin-bottom: -150rpx;

		text {
			margin-left: 8rpx;
			/* 图标和文字间距 */
		}
	}

	.activity-tags {
		display: flex;
		gap: 16rpx;
		margin-bottom: 30rpx;
		flex-wrap: wrap;
	}

	.tag {
		background: #fff0e5;
		color: #FF6B00;
		padding: 8rpx 20rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		border: 2rpx solid #ffdcc7;
	}


	/* 底部区域样式 */
	.activity-footer {
		display: flex;
		justify-content: space-between;
		/* 左右两端对齐 */
		align-items: center;
		/* 垂直居中 */
		margin-top: 30rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #f0f2f5;
		/* 添加分割线 */
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

	/* 按钮区域样式 */
	.action-buttons {
		display: flex;
		gap: 24rpx;
		/* 恢复按钮间距 */
	}

	/* 基础按钮样式 */
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

	/* 主要按钮样式 (报名按钮) */
	.btn-primary {
		background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
		color: white;

		&:active {
			opacity: 0.9;
			transform: translateY(-4rpx);
		}
	}

	/* 收藏按钮样式 */
	.btn-favorite {
		background: #ffe7d8;
		color: #FF6B00;

		&:active {
			opacity: 0.9;
			transform: translateY(-4rpx);
		}
	}
</style>