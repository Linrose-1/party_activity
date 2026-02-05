<template>
	<view class="rank-page">
		<!-- 1. 顶部荣誉背景区 -->
		<view class="rank-header">
			<view class="rank-title-box">
				<text class="rank-main-title">猩球贡献榜</text>
				<text class="rank-sub-title">致敬每一位为生态共建贡献力量的商友</text>
			</view>

			<!-- 2. 前三名领奖台 -->
			<view class="podium" v-if="topThree.length > 0">
				<!-- 亚军 (Rank 2) -->
				<view class="podium-item rank-2" v-if="topThree[1]" @click="goCard(topThree[1])">
					<view class="avatar-wrap">
						<image :src="topThree[1].avatar || defaultAvatar" mode="aspectFill" class="avatar" />
						<view class="crown silver">2</view>
					</view>
					<text class="name">{{ topThree[1].realName || topThree[1].nickname }}</text>
					<text class="score">{{ topThree[1].experience }} 贡分</text>
				</view>

				<!-- 冠军 (Rank 1) -->
				<view class="podium-item rank-1" v-if="topThree[0]" @click="goCard(topThree[0])">
					<view class="avatar-wrap">
						<image :src="topThree[0].avatar || defaultAvatar" mode="aspectFill" class="avatar" />
						<view class="crown gold">
							<uni-icons type="vip-filled" size="18" color="#fff"></uni-icons>
						</view>
					</view>
					<text class="name">{{ topThree[0].realName || topThree[0].nickname }}</text>
					<text class="score">{{ topThree[0].experience }} 贡分</text>
				</view>

				<!-- 季军 (Rank 3) -->
				<view class="podium-item rank-3" v-if="topThree[2]" @click="goCard(topThree[2])">
					<view class="avatar-wrap">
						<image :src="topThree[2].avatar || defaultAvatar" mode="aspectFill" class="avatar" />
						<view class="crown bronze">3</view>
					</view>
					<text class="name">{{ topThree[2].realName || topThree[2].nickname }}</text>
					<text class="score">{{ topThree[2].experience }} 贡分</text>
				</view>
			</view>
		</view>

		<!-- 3. 4-20名 列表区 -->
		<view class="rank-list-content">
			<view class="list-header">
				<text>本月贡献排行</text>
				<text class="limit-tip">仅展示前20名</text>
			</view>

			<view v-if="loading" class="loading-box">
				<uni-load-more status="loading" />
			</view>

			<view v-else class="list-wrap">
				<view class="rank-item" v-for="(user, index) in others" :key="user.id" @click="goCard(user)">
					<!-- 排名序号 -->
					<view class="rank-num">{{ index + 4 }}</view>

					<!-- 用户信息 -->
					<image :src="user.avatar || defaultAvatar" mode="aspectFill" class="u-avatar"
						@click.stop="handleAvatarClick(user)" />

					<view class="u-info">
						<view class="u-top">
							<text class="u-name">{{ user.realName || user.nickname }}</text>
							<text class="u-level" v-if="user.topUpLevelName">{{ user.topUpLevelName }}</text>
						</view>
						<view class="u-desc text-ellipsis">
							{{ user.positionTitle || '精英商友' }} | {{ user.companyName || '平台建设者' }}
						</view>
					</view>

					<!-- 贡分值 -->
					<view class="u-score">
						<text class="score-val">{{ user.experience }}</text>
						<text class="score-unit">贡分</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 头像操作菜单 (复用组件) -->
		<AvatarLongPressMenu ref="menuRef" @action="handleMenuAction" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';

	// --- 常量与状态 ---
	const defaultAvatar = 'https://img.gofor.club/mmexport1759211962539.jpg';
	const rankingList = ref([]);
	const loading = ref(false);
	const menuRef = ref(null);

	onMounted(() => {
		fetchRanking();
	});

	// 下拉刷新
	onPullDownRefresh(async () => {
		await fetchRanking();
		uni.stopPullDownRefresh();
	});

	/**
	 * [接口方法] 获取猩球榜单数据
	 */
	const fetchRanking = async () => {
		loading.value = true;
		const {
			data,
			error
		} = await request('/app-api/member/user/contribution-ranking', {
			method: 'GET'
		});
		loading.value = false;

		if (!error && data) {
			rankingList.value = data;
		} else if (error) {
			uni.showToast({
				title: error,
				icon: 'none'
			});
		}
	};

	/**
	 * [计算属性] 提取前三名
	 */
	const topThree = computed(() => {
		return rankingList.value.slice(0, 3);
	});

	/**
	 * [计算属性] 提取4-20名
	 */
	const others = computed(() => {
		return rankingList.value.slice(3);
	});

	/**
	 * [跳转] 跳转至个人名片
	 */
	const goCard = (user) => {
		const name = user.realName || user.nickname;
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(user.avatar)}`
		});
	};

	/**
	 * [方法] 点击头像呼起操作菜单
	 */
	const handleAvatarClick = (user) => {
		menuRef.value.open({
			id: user.id,
			name: user.realName || user.nickname,
			avatar: user.avatar,
			managerId: user.id
		});
	};

	/**
	 * [回调] 菜单动作处理
	 */
	const handleMenuAction = ({
		type,
		user
	}) => {
		if (type === 'viewCard') goCard(user);
		// 其他加圈、链路逻辑保持组件原有实现
	};
</script>

<style scoped lang="scss">
	$theme: #FF7D00;

	.rank-page {
		background-color: #F8F9FB;
		min-height: 100vh;
	}

	/* 1. 顶部荣誉背景 */
	.rank-header {
		background: linear-gradient(180deg, $theme 0%, #FFAC70 100%);
		padding: 60rpx 30rpx 40rpx;
		border-radius: 0 0 60rpx 60rpx;
		color: #fff;

		.rank-title-box {
			text-align: center;
			margin-bottom: 60rpx;

			.rank-main-title {
				font-size: 48rpx;
				font-weight: 900;
				display: block;
				letter-spacing: 4rpx;
			}

			.rank-sub-title {
				font-size: 24rpx;
				opacity: 0.8;
				margin-top: 10rpx;
				display: block;
			}
		}
	}

	/* 2. 领奖台样式 */
	.podium {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 20rpx;
		margin-bottom: 20rpx;

		.podium-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;

			.avatar-wrap {
				position: relative;
				margin-bottom: 16rpx;

				.avatar {
					border: 6rpx solid #fff;
					box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
				}

				.crown {
					position: absolute;
					bottom: -10rpx;
					left: 50%;
					transform: translateX(-50%);
					width: 44rpx;
					height: 44rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24rpx;
					font-weight: bold;
					color: #fff;
					border: 4rpx solid #fff;

					&.gold {
						background: linear-gradient(135deg, #FFD700, #FFA500);
						width: 56rpx;
						height: 56rpx;
						bottom: -15rpx;
					}

					&.silver {
						background: #B8C4D9;
					}

					&.bronze {
						background: #CD7F32;
					}
				}
			}

			.name {
				font-size: 28rpx;
				font-weight: bold;
				width: 160rpx;
				text-align: center;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.score {
				font-size: 22rpx;
				opacity: 0.9;
				margin-top: 4rpx;
			}

			&.rank-1 {
				order: 2;
				margin-bottom: 40rpx; // 冠军居中且最高

				.avatar {
					width: 160rpx;
					height: 160rpx;
					border-radius: 50%;
				}
			}

			&.rank-2 {
				order: 1;

				.avatar {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
				}
			}

			&.rank-3 {
				order: 3;

				.avatar {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
				}
			}
		}
	}

	/* 3. 列表区域 */
	.rank-list-content {
		padding: 40rpx 30rpx;

		.list-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.limit-tip {
				font-size: 22rpx;
				color: #999;
				font-weight: normal;
			}
		}
	}

	.rank-item {
		background: #fff;
		border-radius: 24rpx;
		padding: 24rpx 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

		.rank-num {
			width: 60rpx;
			font-size: 32rpx;
			font-style: italic;
			color: #BBB;
			font-weight: bold;
		}

		.u-avatar {
			width: 90rpx;
			height: 90rpx;
			border-radius: 50%;
			margin-right: 20rpx;
			background: #f0f0f0;
		}

		.u-info {
			flex: 1;
			min-width: 0;

			.u-top {
				display: flex;
				align-items: center;
				gap: 10rpx;
				margin-bottom: 6rpx;
			}

			.u-name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}

			.u-level {
				font-size: 18rpx;
				color: $theme;
				border: 1rpx solid $theme;
				padding: 2rpx 10rpx;
				border-radius: 20rpx;
			}

			.u-desc {
				font-size: 24rpx;
				color: #999;
			}
		}

		.u-score {
			text-align: right;

			.score-val {
				font-size: 36rpx;
				font-weight: 800;
				color: $theme;
				display: block;
				line-height: 1;
			}

			.score-unit {
				font-size: 20rpx;
				color: #999;
			}
		}
	}

	.text-ellipsis {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.loading-box {
		padding-top: 100rpx;
	}
</style>