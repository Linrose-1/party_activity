<template>
	<view class="recommend-list-page">
		<!-- 顶部沉浸式导航栏 -->
		<!-- <view class="nav-header">
			<view class="back-icon" @click="goBack">
				<uni-icons type="left" size="24" color="#FFF"></uni-icons>
			</view>
			<view class="title-area">
				<text class="main-title">AI 智能推荐</text>
				<text class="sub-title">为您匹配全球精英人脉</text>
			</view>
			<view class="refresh-action" @click="fetchList">
				<uni-icons type="refresh" size="20" color="#FF6F00"></uni-icons>
				<text>换一批</text>
			</view>
		</view> -->

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
								<text class="verify-tag" v-if="user.isComplete">已认证</text>
							</view>
							<text class="title">{{ user.professionalTitle || '精英人士' }}</text>
						</view>
						<view class="match-score">
							<text class="score-val">{{ 90 + (index % 10) }}</text>
							<text class="score-unit">% 匹配</text>
						</view>
					</view>

					<view class="card-info">
						<view class="info-row">
							<text class="label">当前机构</text>
							<text class="val">{{ user.companyName || '保密机构' }}</text>
						</view>
						<view class="info-row">
							<text class="label">教育背景</text>
							<text class="val">{{ user.school || '知名大学' }}</text>
						</view>
					</view>

					<view class="tag-box">
						<view class="tag" v-for="(tag, tidx) in user.matchTags" :key="tidx">{{ tag }}</view>
					</view>

					<view class="card-footer">
						<view class="location">
							<uni-icons type="location" size="14" color="#8E8E93"></uni-icons>
							<text>{{ user.locationAddressStr || '全国' }}</text>
						</view>
						<view class="connect-btn">立即连接</view>
					</view>
				</view>

				<!-- 加载状态 -->
				<view v-if="users.length === 0 && !loading" class="empty-state">
					<image src="/static/images/empty.png" mode="aspectFit"></image>
					<text>暂无推荐商友</text>
				</view>
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

	const fetchList = async () => {
		loading.value = true;
		uni.showLoading({
			title: 'AI智能匹配中...'
		});

		// 对接接口：不需要传参数
		const {
			data,
			error
		} = await request('/app-api/member/user/random-recommend', {
			method: 'GET'
		});

		uni.hideLoading();
		loading.value = false;

		if (!error && data) {
			// 数据清洗与标签处理
			users.value = data.map(u => {
				const tags = [];
				if (u.classmateFlag) tags.push('同校校友');
				if (u.peerFlag) tags.push('行业同行');
				if (u.fellowTownspeopleFlag) tags.push('家乡同乡');
				if (u.matchTagCount > 0) tags.push(`${u.matchTagCount}项需求匹配`);
				if (tags.length === 0) tags.push('优质商友');

				// 处理数组或逗号分隔的字符串，取第一个元素显示
				const getFirstItem = (value) => {
					if (!value) return '';
					if (Array.isArray(value) && value.length > 0) {
						return value[0];
					}
					// 处理逗号分隔的字符串
					if (typeof value === 'string' && value.includes(',')) {
						return value.split(',')[0].trim();
					}
					return value;
				};

				return {
					...u,
					matchTags: tags,
					companyName: getFirstItem(u.companyName) || '保密机构',
					school: getFirstItem(u.school) || '知名大学',
					positionTitle: getFirstItem(u.positionTitle) || '',
					professionalTitle: getFirstItem(u.professionalTitle) || '精英人士'
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
		background-color: #1A1A1A; // 黑色底，延续高端感
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 导航栏 */
	.nav-header {
		padding: 100rpx 40rpx 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(to bottom, #2A2A2A, #1A1A1A);

		.title-area {
			flex: 1;
			margin-left: 20rpx;

			.main-title {
				color: #FFF;
				font-size: 36rpx;
				font-weight: bold;
				display: block;
			}

			.sub-title {
				color: rgba(255, 255, 255, 0.5);
				font-size: 20rpx;
			}
		}

		.refresh-action {
			display: flex;
			align-items: center;
			gap: 8rpx;
			background: rgba(255, 111, 0, 0.1);
			padding: 12rpx 24rpx;
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
		padding: 0 30rpx 60rpx;
	}

	/* 推荐名片样式 - 优化为更紧凑高级的样式 */
	.user-card {
		background: #FFF;
		border-radius: 32rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);

		.card-header {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;

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
				}

				.title {
					font-size: 24rpx;
					color: #8E8E93;
					display: block;
					margin-top: 4rpx;
				}
			}

			.match-score {
				text-align: center;

				.score-val {
					font-size: 36rpx;
					font-weight: bold;
					color: #FF6F00;
					display: block;
					line-height: 1;
				}

				.score-unit {
					font-size: 18rpx;
					color: #FF6F00;
					opacity: 0.8;
				}
			}
		}

		.card-info {
			background: #F8F9FA;
			border-radius: 20rpx;
			padding: 20rpx;

			.info-row {
				display: flex;
				margin-bottom: 8rpx;

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
			margin-top: 24rpx;

			.tag {
				background: #FFF5EE;
				color: #A0522D;
				font-size: 22rpx;
				padding: 6rpx 16rpx;
				border-radius: 8rpx;
			}
		}

		.card-footer {
			margin-top: 30rpx;
			padding-top: 24rpx;
			border-top: 1px solid #F0F0F0;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.location {
				color: #8E8E93;
				font-size: 24rpx;
				display: flex;
				align-items: center;
				gap: 6rpx;
			}

			.connect-btn {
				background: #1A1A1A;
				color: #FFF;
				font-size: 24rpx;
				font-weight: bold;
				padding: 14rpx 36rpx;
				border-radius: 40rpx;
			}
		}
	}

	.empty-state {
		padding-top: 200rpx;
		text-align: center;

		image {
			width: 200rpx;
			height: 200rpx;
			opacity: 0.3;
		}

		text {
			color: rgba(255, 255, 255, 0.4);
			font-size: 26rpx;
			margin-top: 20rpx;
			display: block;
		}
	}
</style>