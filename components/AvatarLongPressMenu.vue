<template>
	<view>
		<uni-popup ref="popup" type="center" :mask-click="true">
			<view class="menu-card">
				<!-- 1. 头部信息区 -->
				<view class="card-header">
					<view class="avatar-wrapper">
						<image :src="targetUser.avatar || defaultAvatar" class="menu-avatar" mode="aspectFill"></image>
					</view>
					<view class="user-info">
						<view class="user-name">{{ targetUser.name || '商友' }}</view>

						<!-- 第一行：会员与头衔 -->
						<view class="mini-tags-line" v-if="targetUser.pinyinName || targetUser.title">
							<text class="mini-tag" v-if="targetUser.pinyinName"
								@click.stop="handleAction('navToMember')">
								{{ targetUser.pinyinName }}
							</text>
							<text class="mini-tag" v-if="targetUser.title" @click.stop="handleAction('navToMember')">
								{{ targetUser.title }}
							</text>
						</view>

						<!-- 第二行：信用信息 -->
						<view class="mini-credit-line" v-if="creditLevel || totalScore"
							@click.stop="handleAction('navToCredit')">
							<text class="credit-text" v-if="creditLevel">{{ creditLevel }}</text>
							<text class="score-text" v-if="totalScore">猩球信用：{{ totalScore }}分</text>
							<uni-icons type="right" size="10" color="rgba(255,255,255,0.8)"></uni-icons>
						</view>

						<!-- 兜底文案：仅在没有任何标签数据时显示 -->
						<view class="user-desc"
							v-if="!targetUser.pinyinName && !targetUser.title && !creditLevel && !totalScore">
							与您相遇在猩聚社
						</view>
					</view>
					<view class="close-icon" @click="close">
						<uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
					</view>
				</view>

				<!-- 2. 操作按钮区 (3x2 布局) -->
				<view class="action-grid">
					<!-- 查看名片 -->
					<view class="grid-item primary-outline" @click="handleAction('viewCard')">
						<view class="icon-box"><uni-icons type="person" size="26" color="#FF7009" /></view>
						<text class="item-text">查看名片</text>
					</view>

					<!-- 人脉链路 -->
					<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
						@click="handleAction('viewPath')">
						<view class="icon-box" :class="{ 'path-style': !isSelf }">
							<uni-icons type="staff-filled" size="26" :color="isSelf ? '#999' : '#FF7009'" />
						</view>
						<text class="item-text">{{ isSelf ? '本人' : '人脉链路' }}</text>
					</view>

					<!-- 商友点评 -->
					<view class="grid-item primary-outline" @click="handleAction('comment')">
						<view class="icon-box"><uni-icons type="star" size="26" color="#FF7009" /></view>
						<text class="item-text">商友点评</text>
					</view>

					<!-- 邀入我圈 -->
					<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
						@click="handleAction('inviteCircle')">
						<view class="icon-box"><uni-icons type="paperplane-filled" size="26"
								:color="isSelf ? '#999' : '#FF7009'" /></view>
						<text class="item-text">{{ isSelf ? '本人' : '邀入我圈' }}</text>
					</view>

					<!-- 加入TA圈 -->
					<view class="grid-item" :class="isSelf ? 'disabled' : 'primary-outline'"
						@click="handleAction('addCircle')">
						<view class="icon-box"><uni-icons type="plusempty" size="26"
								:color="isSelf ? '#999' : '#FF7009'" /></view>
						<text class="item-text">{{ isSelf ? '本人' : '加入TA圈' }}</text>
					</view>

					<!-- 资源匹配 -->
					<view class="grid-item primary-outline" @click="handleAction('resourceMatch')">
						<view class="icon-box"><uni-icons type="search" size="26" color="#FF7009" /></view>
						<text class="item-text">资源匹配</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 3. 内置：加圈与邀圈的确认弹窗 (实现内部闭环) -->
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

	// --- Props 定义 ---
	const props = defineProps({
		// 支持外部传入路径覆盖默认配置
		config: {
			type: Object,
			default: () => ({})
		}
	});

	const emit = defineEmits(['actionSuccess']);

	// --- 状态变量 ---
	const creditLevel = ref('');
	const totalScore = ref(0);
	const popup = ref(null);
	const addCircleRef = ref(null);
	const inviteCircleRef = ref(null);
	const targetUser = ref({});
	const defaultAvatar = '/static/icon/default-avatar.png';

	/**
	 * 默认业务路径配置
	 */
	const PATHS = {
		personalCard: '/packages/applicationBusinessCard/applicationBusinessCard',
		enterpriseCard: '/packages/enterprise-card/enterprise-card',
		relationshipPath: '/packages/relationship-path/relationship-path',
		reviews: '/packages/user-reviews/user-reviews',
		resourceMatch: '/packages/resource-match/resource-match'
	};

	/**
	 * [计算属性] 判定是否为“我本人”或“我的企业”
	 */
	const isSelf = computed(() => {
		const loggedInId = uni.getStorageSync('userId');
		const managerId = targetUser.value.managerId || targetUser.value.id;
		return loggedInId && managerId && String(loggedInId) === String(managerId);
	});

	/**
	 * [方法] 打开菜单
	 */
	const open = async (user) => {
		// 1. 立即展示已有的基础信息 (头像、名字)
		targetUser.value = {
			...user
		};
		creditLevel.value = '';
		totalScore.value = 0;
		popup.value.open();

		// 2. 如果没有标签信息，主动去后端拉取简要资料（免智米接口）
		if (user.id) {
			try {
				const {
					data
				} = await request('/app-api/member/user/getSimpleUserInfo', {
					method: 'GET',
					data: {
						readUserId: user.id,
						notPay: 1
					}
				});
				if (data) {
					// 补全缺失的标签字段
					targetUser.value.pinyinName = data.topUpLevelName;
					targetUser.value.title = data.levelName;
				}
			} catch (e) {
				console.error('获取用户简要信息失败', e);
			}

			// 3. 同时获取信用数据
			fetchCreditData(user.id);
		}
	};

	/**
	 * [方法] 关闭菜单
	 */
	const close = () => popup.value.close();

	/**
	 * 获取其他用户信用数据
	 */
	const fetchCreditData = async (userId) => {
		const {
			data,
			error
		} = await request(`/app-api/member/user/other_credit-score/${userId}`, {
			method: 'GET'
		});
		if (!error && data) {
			creditLevel.value = data.creditLevel;
			totalScore.value = data.totalScore;
		}
	};

	/**
	 * [核心逻辑] 统一处理点击动作
	 */
	const handleAction = (type) => {
		// 1. 权限拦截：本人不可操作社交项
		const socialTypes = ['addCircle', 'inviteCircle', 'viewPath'];
		if (isSelf.value && socialTypes.includes(type)) return;

		const user = targetUser.value;

		if (type === 'navToMember') {
			uni.navigateTo({
				url: '/packages/my-member/my-member'
			});
			close();
			return;
		}
		if (type === 'navToCredit') {
			uni.navigateTo({
				url: `/packages/credit-score/credit-score?userId=${user.id}`
			});
			close();
			return;
		}

		// 2. 分流处理
		switch (type) {
			case 'viewCard': // 3. 查看名片 (自动分流：企业 vs 个人)
				if (user.isEnterpriseSource) {
					uni.navigateTo({
						url: `${PATHS.enterpriseCard}?id=${user.id}`
					});
				} else {
					const url =
						`${PATHS.personalCard}?id=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || '')}`;
					uni.navigateTo({
						url
					});
				}
				break;

			case 'viewPath': // 4. 人脉链路
				uni.navigateTo({
					url: `${PATHS.relationshipPath}?targetUserId=${user.id}&name=${encodeURIComponent(user.name || '商友')}`
				});
				break;

			case 'comment': // 5. 商友点评
				uni.navigateTo({
					url: `${PATHS.reviews}?userId=${user.id}`
				});
				break;

			case 'resourceMatch': // 6. 资源匹配
				uni.navigateTo({
					url: `${PATHS.resourceMatch}?targetUserId=${user.id}`
				});
				break;

			case 'addCircle': // 7. 加入TA圈 (唤起内部组件)
				addCircleRef.value.open(user);
				break;

			case 'inviteCircle': // 8. 邀入我圈 (唤起内部组件)
				inviteCircleRef.value.open(user);
				break;
		}

		close(); // 操作后关闭菜单
	};

	/**
	 * [方法] 内部弹窗操作成功后的回调
	 */
	const onSocialSuccess = (id) => {
		emit('actionSuccess', id);
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	/* 样式保持 3x2 布局及 #FF7009 主题色 */
	.menu-card {
		width: 620rpx;
		background-color: #fff;
		border-radius: 32rpx;
		overflow: hidden;
		position: relative;
	}

	.card-header {
		background: linear-gradient(135deg, #FF7009, #FF9A44);
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
	}

	.avatar-wrapper {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.6);
		overflow: hidden;
		margin-right: 24rpx;
	}

	.menu-avatar {
		width: 100%;
		height: 100%;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
		padding-right: 20rpx;

		.user-name {
			font-size: 34rpx;
			font-weight: bold;
			color: #fff;
			display: block;
			/* 确保占行 */
			margin-bottom: 6rpx;
		}

		.user-desc {
			font-size: 24rpx;
			color: rgba(255, 255, 255, 0.8);
			display: block;
			margin-top: 10rpx;
		}
	}

	.mini-tags-line {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 8rpx;
		/* 解决由于数据未加载时可能的高度塌陷 */
		min-height: 30rpx;
	}

	/* 核心修正：确保标签可见 */
	.mini-tag {
		display: inline-block !important;
		/* 强制 text 表现为块，否则背景色不显示 */
		font-size: 20rpx;
		color: #fff;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		background: rgba(255, 255, 255, 0.2);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		line-height: 1.2;
	}

	.mini-credit-line {
		display: inline-flex !important;
		/* 确保能在一行排列并显示背景 */
		align-items: center;
		background: rgba(255, 255, 255, 0.15);
		padding: 6rpx 18rpx;
		border-radius: 30rpx;
		margin-top: 14rpx;
		gap: 8rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.2);
	}

	/* 标签行布局优化 */
	.mini-tags-line {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 10rpx;
	}

	.mini-tag {
		font-size: 20rpx;
		color: #fff;
		padding: 4rpx 14rpx;
		/* 增加一点内边距，呼吸感更好 */
		border-radius: 8rpx;
		background: rgba(255, 255, 255, 0.18);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
	}

	/* 信用分行布局优化 */
	.mini-credit-line {
		display: inline-flex;
		align-items: center;
		/* 核心修改：使用白色半透明背景，适配橙色渐变 */
		background: rgba(255, 255, 255, 0.15);
		padding: 6rpx 18rpx;
		border-radius: 30rpx;
		/* 胶囊形状 */
		margin-top: 14rpx;
		gap: 8rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.2);

		.credit-text {
			font-size: 20rpx;
			color: #fff;
			font-weight: bold;
		}

		.score-text {
			font-size: 20rpx;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	/* 操作网格间距优化 */
	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 44rpx 20rpx;
		/* 增加水平间距到 20rpx */
		padding: 50rpx 30rpx;
		/* 增加左右内边距 */
	}

	/* 头部标签行布局 */
	.mini-tags-line {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 8rpx;
	}

	.mini-tag {
		font-size: 20rpx;
		color: #fff;
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
		background: rgba(255, 255, 255, 0.15);
		border: 1rpx solid rgba(255, 255, 255, 0.3);

		&:active {
			background: rgba(255, 255, 255, 0.3);
		}
	}

	/* 信用分行布局 */
	.mini-credit-line {
		display: inline-flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.1);
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		margin-top: 12rpx;
		gap: 8rpx;

		.credit-text {
			font-size: 20rpx;
			color: #fff;
			font-weight: bold;
		}

		.score-text {
			font-size: 20rpx;
			color: rgba(255, 255, 255, 0.9);
		}

		&:active {
			background: rgba(0, 0, 0, 0.2);
		}
	}

	/* 调整原有描述文字，防止重叠 */
	.user-desc {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.close-icon {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 10rpx;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 40rpx 10rpx;
		padding: 50rpx 20rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		&:active {
			transform: scale(0.95);
			opacity: 0.8;
		}

		.icon-box {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 12rpx;
			border: 2rpx solid #FF7009;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		}

		.icon-box.path-style {
			background-color: #FFF5EE;
		}

		.item-text {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}
	}

	.grid-item.disabled {
		pointer-events: none;

		.icon-box {
			background-color: #f2f2f2;
			border-color: #ddd;
			box-shadow: none;
		}

		.item-text {
			color: #bbb;
		}
	}
</style>