<template>
	<view>
		<uni-popup ref="popup" type="center" :mask-click="true">
			<view class="menu-card">
				<!-- 1. 头部信息区：采用精致的渐变色和分层排版 -->
				<view class="card-header">
					<view class="avatar-wrapper">
						<image :src="targetUser.avatar || defaultAvatar" class="menu-avatar" mode="aspectFill"></image>
					</view>

					<view class="user-info">
						<view class="user-name">{{ targetUser.name || '商友' }}</view>

						<!-- 第一行：会员与头衔标签 (毛玻璃质感) -->
						<view class="mini-tags-line" v-if="targetUser.pinyinName || targetUser.title">
							<text class="mini-tag" v-if="targetUser.pinyinName"
								@click.stop="handleAction('navToMember')">
								{{ targetUser.pinyinName }}
							</text>
							<text class="mini-tag" v-if="targetUser.title" @click.stop="handleAction('navToMember')">
								{{ targetUser.title }}
							</text>
						</view>

						<!-- 第二行：信用信息胶囊 (紧凑型布局) -->
						<view class="credit-info-row" v-if="creditLevel || totalScore">
							<!-- 胶囊 1：信用等级 -->
							<view class="mini-capsule" v-if="creditLevel" @click.stop="handleAction('navToCredit')">
								<uni-icons type="vip-filled" size="12" color="#fff"></uni-icons>
								<text class="capsule-text">{{ creditLevel }}</text>
								<!-- <uni-icons type="right" size="10" color="rgba(255,255,255,0.7)"></uni-icons> -->
							</view>

							<!-- 胶囊 2：信用分数 -->
							<view class="mini-capsule" v-if="totalScore">
								<text class="capsule-text">猩友信用：{{ totalScore }}分</text>
								<!-- <uni-icons type="right" size="10" color="rgba(255,255,255,0.7)"></uni-icons> -->
							</view>
						</view>

						<!-- 兜底文案 -->
						<view class="user-desc"
							v-if="!targetUser.pinyinName && !targetUser.title && !creditLevel && !totalScore">
							与您相遇在猩聚社
						</view>
					</view>

					<!-- 关闭按钮 -->
					<view class="close-icon" @click="close">
						<uni-icons type="closeempty" size="20" color="#fff"></uni-icons>
					</view>
				</view>

				<!-- 2. 操作按钮区 (3x2 布局) -->
				<view class="action-grid">
					<view class="grid-item" @click="handleAction('viewCard')">
						<view class="icon-box"><uni-icons type="person" size="26" color="#FF7009" /></view>
						<text class="item-text">查看名片</text>
					</view>

					<view class="grid-item" :class="isSelf ? 'disabled' : ''" @click="handleAction('viewPath')">
						<view class="icon-box" :class="{ 'path-style': !isSelf }">
							<uni-icons type="staff-filled" size="26" :color="isSelf ? '#ccc' : '#FF7009'" />
						</view>
						<text class="item-text">{{ isSelf ? '本人' : '人脉链路' }}</text>
					</view>

					<view class="grid-item" @click="handleAction('comment')">
						<view class="icon-box"><uni-icons type="star" size="26" color="#FF7009" /></view>
						<text class="item-text">商友点评</text>
					</view>

					<view class="grid-item" :class="isSelf ? 'disabled' : ''" @click="handleAction('inviteCircle')">
						<view class="icon-box">
							<uni-icons type="paperplane-filled" size="26" :color="isSelf ? '#ccc' : '#FF7009'" />
						</view>
						<text class="item-text">{{ isSelf ? '本人' : '邀入我圈' }}</text>
					</view>

					<view class="grid-item" :class="isSelf ? 'disabled' : ''" @click="handleAction('addCircle')">
						<view class="icon-box">
							<uni-icons type="plusempty" size="26" :color="isSelf ? '#ccc' : '#FF7009'" />
						</view>
						<text class="item-text">{{ isSelf ? '本人' : '加入TA圈' }}</text>
					</view>

					<view class="grid-item" @click="handleAction('resourceMatch')">
						<view class="icon-box"><uni-icons type="search" size="26" color="#FF7009" /></view>
						<text class="item-text">资源匹配</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 3. 内置：加圈与邀圈的确认弹窗 -->
		<AddCircleConfirmPopup ref="addCircleRef" @success="onSocialSuccess" />
		<InviteCircleConfirmPopup ref="inviteCircleRef" @success="onSocialSuccess" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import request from '@/utils/request.js';
	import AddCircleConfirmPopup from '@/components/AddCircleConfirmPopup.vue';
	import InviteCircleConfirmPopup from '@/components/InviteCircleConfirmPopup.vue';

	const emit = defineEmits(['actionSuccess']);

	// --- 状态变量 ---
	const popup = ref(null);
	const addCircleRef = ref(null);
	const inviteCircleRef = ref(null);
	const targetUser = ref({});
	const creditLevel = ref('');
	const totalScore = ref(0);
	const defaultAvatar = '/static/icon/default-avatar.png';

	const PATHS = {
		personalCard: '/packages/applicationBusinessCard/applicationBusinessCard',
		enterpriseCard: '/packages/enterprise-card/enterprise-card',
		relationshipPath: '/packages/relationship-path/relationship-path',
		reviews: '/packages/user-reviews/user-reviews',
		resourceMatch: '/packages/resource-match/resource-match'
	};

	/**
	 * [计算属性] 判定是否为“我本人”
	 */
	const isSelf = computed(() => {
		const loggedInId = uni.getStorageSync('userId');
		const managerId = targetUser.value.managerId || targetUser.value.id;
		return loggedInId && managerId && String(loggedInId) === String(managerId);
	});

	/**
	 * [方法] 开启弹窗并异步补全所有标签数据
	 * @param {Object} user 包含id, name, avatar的基础对象
	 */
	const open = async (user) => {
		targetUser.value = {
			...user
		};
		creditLevel.value = '';
		totalScore.value = 0;
		popup.value.open();

		if (user.id) {
			// 并行获取：简要资料(等级/头衔) 与 信用分数据
			Promise.all([
				fetchSimpleInfo(user.id),
				fetchCreditData(user.id)
			]);
		}
	};

	/**
	 * 获取简要资料（会员等级与身份头衔）
	 */
	const fetchSimpleInfo = async (userId) => {
		try {
			const {
				data
			} = await request('/app-api/member/user/getSimpleUserInfo', {
				method: 'GET',
				data: {
					readUserId: userId,
					notPay: 1
				}
			});
			if (data) {
				targetUser.value.pinyinName = data.topUpLevel?.name || '';
				targetUser.value.title = data.level?.name || '';
				targetUser.value.name = data.realName || data.nickname || targetUser.value.name;
			}
		} catch (e) {
			console.error(e);
		}
	};

	/**
	 * 获取其他用户信用分数据
	 */
	const fetchCreditData = async (userId) => {
		const {
			data
		} = await request(`/app-api/member/user/other_credit-score/${userId}`, {
			method: 'GET'
		});
		if (data) {
			creditLevel.value = data.creditLevel;
			totalScore.value = data.totalScore;
		}
	};

	const close = () => popup.value.close();

	/**
	 * [核心逻辑] 统一处理点击动作
	 * @param {String} type 动作类型
	 */
	const handleAction = (type) => {
		// 本人禁用社交操作
		const socialTypes = ['addCircle', 'inviteCircle', 'viewPath'];
		if (isSelf.value && socialTypes.includes(type)) return;

		const user = targetUser.value;

		switch (type) {
			case 'navToMember':
				uni.navigateTo({
					url: '/packages/my-member/my-member'
				});
				break;
			case 'navToCredit':
				uni.navigateTo({
					url: `/packages/credit-score/credit-score?userId=${user.id}`
				});
				break;
			case 'viewCard':
				if (user.isEnterpriseSource) {
					uni.navigateTo({
						url: `${PATHS.enterpriseCard}?id=${user.id}`
					});
				} else {
					uni.navigateTo({
						url: `${PATHS.personalCard}?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || '')}`
					});
				}
				break;
			case 'viewPath':
				uni.navigateTo({
					url: `${PATHS.relationshipPath}?targetUserId=${user.id}&name=${encodeURIComponent(user.name)}`
				});
				break;
			case 'comment':
				uni.navigateTo({
					url: `${PATHS.reviews}?userId=${user.id}`
				});
				break;
			case 'resourceMatch':
				uni.navigateTo({
					url: `${PATHS.resourceMatch}?targetUserId=${user.id}`
				});
				break;
			case 'addCircle':
				addCircleRef.value.open(user);
				break;
			case 'inviteCircle':
				inviteCircleRef.value.open(user);
				break;
		}
	};

	const onSocialSuccess = (id) => emit('actionSuccess', id);

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.menu-card {
		width: 620rpx;
		background-color: #fff;
		border-radius: 32rpx;
		overflow: hidden;
		position: relative;
	}

	/* --- 头部样式优化 --- */
	.card-header {
		background: linear-gradient(135deg, #FF7009, #FF9A44);
		padding: 50rpx 30rpx;
		display: flex;
		align-items: center;
		position: relative;
	}

	.avatar-wrapper {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.5);
		overflow: hidden;
		margin-right: 24rpx;
		background: #f0f0f0;
	}

	.menu-avatar {
		width: 100%;
		height: 100%;
	}

	.user-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;

		.user-name {
			font-size: 38rpx;
			font-weight: bold;
			color: #fff;
			margin-bottom: 8rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.user-desc {
			font-size: 22rpx;
			color: rgba(255, 255, 255, 0.8);
			margin-top: 10rpx;
		}
	}

	/* 第一行标签：毛玻璃质感 */
	.mini-tags-line {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 4rpx;
	}

	.mini-tag {
		display: inline-block;
		font-size: 20rpx;
		color: #fff;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		background: rgba(255, 255, 255, 0.18);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		line-height: 1.2;

		&:active {
			background: rgba(255, 255, 255, 0.3);
		}
	}

	/* 信用信息行容器 */
	.credit-info-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 16rpx;
	}

	/* 独立胶囊通用样式 */
	.mini-capsule {
		display: inline-flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.15);
		/* 稍微提高一点透明度，让边界更清晰 */
		padding: 6rpx 18rpx;
		border-radius: 40rpx;
		gap: 6rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		width: fit-content;
		transition: background 0.2s;

		.capsule-text {
			font-size: 20rpx;
			color: #fff;
			font-weight: 500;
			line-height: 1;
		}

		&:active {
			background: rgba(255, 255, 255, 0.3);
		}
	}

	.close-icon {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 10rpx;
		opacity: 0.8;
	}

	/* --- 操作网格优化 --- */
	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 50rpx 20rpx;
		padding: 50rpx 20rpx 60rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: all 0.2s;

		&:active {
			transform: scale(0.92);
			opacity: 0.8;
		}

		.icon-box {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 16rpx;
			border: 2rpx solid #FF7009;
			background: #fff;
			box-shadow: 0 6rpx 16rpx rgba(255, 112, 9, 0.1);
		}

		.icon-box.path-style {
			background-color: #FFF5EE;
		}

		.item-text {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}

		&.disabled {
			pointer-events: none;

			.icon-box {
				background-color: #f8f8f8;
				border-color: #eee;
				box-shadow: none;
			}

			.item-text {
				color: #ccc;
			}
		}
	}
</style>