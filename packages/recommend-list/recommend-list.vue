<template>
	<view class="recommend-list-page">
		<!-- 顶部沉浸式导航栏 - 已为您取消注释并优化样式 -->
		<view class="nav-header">
			<view class="title-area">
				<text class="main-title">AI 智能推荐</text>
				<text class="sub-title">为您匹配深度连接的商道精英</text>
			</view>
		</view>

		<scroll-view scroll-y class="list-scroll">
			<view class="list-container">
				<!-- 商友名片卡片 -->
				<view class="user-card" v-for="(user, index) in users" :key="user.id" @click="goToDetail(user)">
					<view class="card-header">
						<image :src="user.avatar || '/static/images/default-avatar.png'" class="avatar"
							mode="aspectFill" />
						<view class="meta">
							<view class="name-row">
								<text class="name">{{ user.nickname }}</text>
								<!-- 优先判断实名认证 -->
								<text class="verify-tag" v-if="user.idCert === 1">已实名</text>
								<text class="verify-tag info-complete" v-else-if="user.isComplete === 1">已认证</text>
							</view>
							<text class="title">{{ user.professionalTitle || '暂未设置社会职务' }}</text>
						</view>
					</view>

					<view class="card-info">
						<view class="info-row">
							<text class="label">当前公司</text>
							<text class="val">{{ user.companyName || '暂未设置公司' }}</text>
						</view>
						<view class="info-row">
							<text class="label">教育背景</text>
							<text class="val">{{ user.school || '暂未设置学校' }}</text>
						</view>
					</view>

					<!-- 动态推荐理由标签 -->
					<view class="tag-box">
						<view class="tag" v-for="(tag, tidx) in user.matchTags" :key="tidx">{{ tag }}</view>
					</view>

					<view class="card-footer">
						<view class="location">
							<uni-icons type="location-filled" size="14" color="#8E8E93"></uni-icons>
							<text>{{ user.locationAddressStr || '暂未设置商务/办公地' }}</text>
						</view>
						<view class="connect-btn">详细数字身份</view>
					</view>
				</view>

				<!-- 加载状态 -->
				<view v-if="users.length === 0 && !loading" class="empty-state">
					<image src="/static/images/empty.png" mode="aspectFit"></image>
					<text>暂无推荐商友</text>
				</view>

				<view class="bottom-safe-area"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	const users = ref([]);
	const loading = ref(false);

	/**
	 * 获取智能推荐列表
	 */
	const fetchList = async () => {
		loading.value = true;
		uni.showLoading({
			title: 'AI智能匹配中...'
		});

		const {
			data,
			error
		} = await request('/app-api/member/user/random-recommend', {
			method: 'GET'
		});

		uni.hideLoading();
		loading.value = false;

		if (!error && data) {
			const getFirstItem = (value) => {
				if (!value) return '';
				if (Array.isArray(value) && value.length > 0) return value[0];
				if (typeof value === 'string' && value.includes(',')) return value.split(',')[0].trim();
				return value;
			};

			users.value = data.map(u => {
				// 1. 处理匹配关系标签 (与首页逻辑对齐)
				const tags = [];
				if (u.classmateFlag === 1) tags.push('同学');
				if (u.peerFlag === 1) tags.push('同行');
				if (u.fellowTownspeopleFlag === 1) tags.push('同乡');
				if (u.friendParentFlag === 1) tags.push('同圈');
				if (tags.length === 0) tags.push('深度契合');

				// 2. 返回清洗后的对象
				return {
					...u,
					matchTags: tags,
					companyName: getFirstItem(u.companyName),
					school: getFirstItem(u.school),
					professionalTitle: getFirstItem(u.professionalTitle)
				};
			});
		}
	};

	const goToDetail = async (user) => {
		const canProceed = await checkLoginGuard();
		if (canProceed) {
			uni.navigateTo({
				url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}`
			});
		}
	};

	const goBack = () => uni.navigateBack();

	onLoad(() => {
		fetchList();
	});
</script>

<style lang="scss" scoped>
	.recommend-list-page {
		background-color: #1A1A1A;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.nav-header {
		padding: 100rpx 40rpx 40rpx;
		display: flex;
		align-items: center;
		background: linear-gradient(to bottom, #2A2A2A, #1A1A1A);
		z-index: 10;

		.title-area {
			flex: 1;
			margin-left: 24rpx;

			.main-title {
				color: #FFF;
				font-size: 36rpx;
				font-weight: bold;
			}

			.sub-title {
				color: rgba(255, 255, 255, 0.4);
				font-size: 20rpx;
				display: block;
				margin-top: 4rpx;
			}
		}

		.refresh-action {
			display: flex;
			align-items: center;
			gap: 8rpx;
			background: rgba(255, 111, 0, 0.15);
			padding: 10rpx 24rpx;
			border-radius: 40rpx;

			text {
				color: #FF6F00;
				font-size: 24rpx;
				font-weight: bold;
			}
		}
	}

	.list-scroll {
		flex: 1;
		height: 0;
	}

	.list-container {
		padding: 30rpx;
	}

	.user-card {
		background: #FFF;
		border-radius: 32rpx;
		padding: 32rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.3);

		.card-header {
			display: flex;
			align-items: center;
			margin-bottom: 28rpx;

			.avatar {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				background: #F0F0F0;
			}

			.meta {
				flex: 1;
				margin-left: 20rpx;

				.name {
					font-size: 32rpx;
					font-weight: bold;
					color: #1A1A1A;
				}

				.verify-tag {
					margin-left: 12rpx;
					font-size: 18rpx;
					color: #52C41A;
					background: #F6FFED;
					padding: 2rpx 10rpx;
					border-radius: 4rpx;

					&.info-complete {
						color: #FF6F00;
						background: #FFF7E6;
					}
				}

				.title {
					font-size: 24rpx;
					color: #8E8E93;
					display: block;
					margin-top: 6rpx;
				}
			}

			.match-score {
				text-align: right;

				.score-val {
					font-size: 38rpx;
					font-weight: 800;
					color: #FF6F00;
					display: block;
					line-height: 1;
				}

				.score-unit {
					font-size: 18rpx;
					color: #FF6F00;
					font-weight: bold;
				}
			}
		}

		.card-info {
			background: #F8F9FA;
			border-radius: 20rpx;
			padding: 24rpx;

			.info-row {
				display: flex;
				margin-bottom: 12rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.label {
					width: 120rpx;
					font-size: 22rpx;
					color: #8E8E93;
				}

				.val {
					flex: 1;
					font-size: 24rpx;
					color: #333;
					font-weight: 500;
				}
			}
		}

		.tag-box {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
			margin-top: 28rpx;

			.tag {
				background: #FFF5EE;
				color: #A0522D;
				font-size: 22rpx;
				padding: 6rpx 18rpx;
				border-radius: 100rpx;
			}
		}

		.card-footer {
			margin-top: 32rpx;
			padding-top: 28rpx;
			border-top: 1px solid #F0F0F0;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.location {
				color: #8E8E93;
				font-size: 24rpx;
				display: flex;
				align-items: center;
				gap: 8rpx;
			}

			.connect-btn {
				background: #1A1A1A;
				color: #FFF;
				font-size: 24rpx;
				font-weight: bold;
				padding: 16rpx 40rpx;
				border-radius: 40rpx;
			}
		}
	}

	.empty-state {
		padding-top: 200rpx;
		text-align: center;

		image {
			width: 240rpx;
			height: 240rpx;
			opacity: 0.2;
		}

		text {
			color: rgba(255, 255, 255, 0.4);
			font-size: 26rpx;
			margin-top: 30rpx;
			display: block;
		}
	}

	.bottom-safe-area {
		height: env(safe-area-inset-bottom);
		padding-bottom: 30rpx;
	}
</style>