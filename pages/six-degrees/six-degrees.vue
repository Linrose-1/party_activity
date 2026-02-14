<template>
	<view class="six-degrees-container">
		<!-- 沉浸式头部 -->
		<view class="premium-header">
			<!-- 背景装饰：独立出来并设置裁剪 -->
			<view class="header-bg-mask">
				<view class="glow-circle"></view>
				<view class="grid-mesh"></view>
			</view>

			<view class="header-inner">
				<view class="brand-line">
					<text class="brand-name">SIX DEGREES</text>
					<view class="vip-badge-tag">PREMIUM</view>
				</view>

				<view class="title-content">
					<text class="main-title">六度人脉-六度时空，无限商机</text>
					<text class="sub-quote">探索您的人脉网络，发现意想不到的连接</text>
				</view>
			</view>

			<!-- 搜索框：确保在 premium-header 内部但不受 overflow 影响 -->
			<view class="search-wrapper">
				<view class="search-float-box">
					<view class="search-left">
						<uni-icons type="search" size="18" color="#999"></uni-icons>
						<input type="text" placeholder="请输入姓名/行业/学校/资源..." class="search-input" v-model="searchKeyword"
							@confirm="handleSearch" />
					</view>
					<view class="search-action-btn" @click="handleSearch">进入搜索</view>
				</view>
			</view>
		</view>

		<view class="scroll-content">
			<!-- 智能工具 -->
			<view class="tools-section">
				<view class="section-header">
					<text class="section-title">智能工具</text>
				</view>
				<view class="feature-grid">
					<view class="feature-card shake-card" @click="goToShakePage">
						<view class="card-icon-wrap"><text class="icon-emboss">🎯</text></view>
						<view class="card-info">
							<text class="c-title">摇一摇 附近友聚</text>
							<text class="c-desc">精准定位即时商机</text>
						</view>
					</view>

					<view class="feature-card custom-card" @click="goToCustomVisitPage">
						<view class="card-icon-wrap"><text class="icon-emboss">🗓️</text></view>
						<view class="card-info">
							<text class="c-title">自定义 访友搜索</text>
							<text class="c-desc">跨城出差 提前布局</text>
						</view>
						<!-- <view class="cost-tag">需消耗 2 智米</view> -->
					</view>
				</view>
			</view>

			<!-- 智能推荐列表 -->
			<view class="recommend-section">
				<view class="section-header">
					<view class="left">
						<text class="title">智能推荐</text>
						<!-- <text class="subtitle">AI Matchmaking</text> -->
					</view>
					<!-- 换一批功能 -->
					<!-- <text class="refresh-btn" @click="fetchRecommendUsers">换一批</text> -->
				</view>

				<!-- 列表渲染 -->
				<view class="user-card" v-for="(user, index) in recommendUsers" :key="user.id"
					@click="viewUserDetail(user)">
					<view class="card-top">
						<image :src="user.avatar || '/static/images/default-avatar.png'" mode="aspectFill"
							class="avatar-img" />
						<view class="main-meta">
							<view class="name-row">
								<text class="u-name">{{ user.nickname }}</text>
								<text class="u-verify" v-if="user.idCert === 1">已实名</text>
							</view>
							<text class="u-title">{{ user.professionalTitle || '暂未设置社会职务' }}</text>
						</view>
						<view class="connection-tag">
							<text class="dot"></text> 深度匹配
						</view>
					</view>

					<view class="card-body">
						<view class="info-item">
							<text class="label">当前公司</text>
							<text class="val">{{ user.companyName || '暂未设置公司' }}</text>
						</view>
						<view class="info-item">
							<text class="label">教育背景</text>
							<text class="val">{{ user.school || '暂未设置学校' }}</text>
						</view>
					</view>

					<!-- 动态推荐理由 -->
					<view class="reason-box">
						<view class="reason-tag" v-for="(tag, idx) in user.matchTags" :key="idx">
							{{ tag }}
						</view>
					</view>

					<view class="card-footer">
						<text class="location">
							{{ user.locationAddressStr || '暂未设置商务/办公地' }}
						</text>
						<view class="connect-btn">详细数字身份</view>
					</view>
				</view>

				<!-- 无数据展示 -->
				<view class="empty-recommend" v-if="recommendUsers.length === 0">
					<text>暂无推荐，点击换一批试试</text>
				</view>
			</view>

			<!-- 付费档位选择 -->
			<view class="subscription-section">
				<text class="sub-title">获取更多优质推荐</text>
				<view class="tier-container">
					<view class="tier-item" v-for="tier in tiers" :key="tier.id"
						:class="{ active: selectedTier.id === tier.id }" @click="selectedTier = tier">
						<view v-if="tier.hot" class="hot-badge">推荐</view>
						<text class="t-num">{{ tier.count }}位</text>
						<text class="t-price">{{ tier.price }} 智米</text>
						<text class="t-benefit">{{ tier.benefit }}</text>
					</view>
				</view>
				<view class="submit-btn" @click="handleConsumeZhimi">开启扩展人脉</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	const searchKeyword = ref('');
	const recommendUsers = ref([]);

	// 付费档位配置
	const tiers = [{
			id: 1,
			count: 1,
			price: 1,
			benefit: '基础推荐',
			hot: false
		},
		{
			id: 2,
			count: 6,
			price: 5,
			benefit: '加送1位',
			hot: true
		},
		{
			id: 3,
			count: 15,
			price: 10,
			benefit: '买10送5',
			hot: false
		}
	];
	const selectedTier = ref(tiers[1]);

	/**
	 * 获取智能推荐列表
	 */
	const fetchRecommendUsers = async () => {
		uni.showLoading({
			title: 'AI匹配中...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/user/random-recommend', {
			method: 'GET'
		});
		uni.hideLoading();

		if (!error && data) {
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

			// 处理数据，生成推荐理由标签
			recommendUsers.value = data.map(user => {
				const tags = [];
				if (user.classmateFlag) tags.push('同学');
				if (user.peerFlag) tags.push('同行');
				if (user.fellowTownspeopleFlag) tags.push('同乡');
				if (user.friendParentFlag) tags.push('同圈');
				// if (user.matchTagCount > 0) tags.push(`${user.matchTagCount}项资源匹配`);
				if (tags.length === 0) tags.push('深度契合');

				return {
					...user,
					matchTags: tags,
					companyName: getFirstItem(user.companyName) || '暂未设置公司',
					school: getFirstItem(user.school) || '暂未设置学校',
					positionTitle: getFirstItem(user.positionTitle) || '',
					professionalTitle: getFirstItem(user.professionalTitle) || '暂未设置社会职务'
				};
			});
		}
	};

	/**
	 * 处理智米兑换查看次数并跳转
	 */
	const handleConsumeZhimi = async () => {
		// 1. 权限拦截
		const canProceed = await checkLoginGuard(`开启扩展人脉需完善资料并消耗 ${selectedTier.value.price} 智米，是否继续？`);
		if (!canProceed) return;

		// 2. 二次确认
		uni.showModal({
			title: '确认兑换',
			content: `将消耗 ${selectedTier.value.price} 智米开启深度人脉推荐？`,
			confirmColor: '#FF6F00',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '正在开启...'
					});

					// 3. 调用增加推荐查看次数接口 (扣除智米)
					const {
						error
					} = await request(
						`/app-api/member/user/add-recommend-view-count?viewCount=${selectedTier.value.count}`, {
							method: 'POST'
						});

					uni.hideLoading();

					if (!error) {
						uni.showToast({
							title: '开启成功',
							icon: 'success'
						});
						// 4. 【关键优化】：成功后跳转到新页面，展示全部推荐结果
						setTimeout(() => {
							uni.navigateTo({
								url: '/packages/recommend-list/recommend-list'
							});
						}, 800);
					}
				}
			}
		});
	};

	const handleSearch = () => {
		uni.navigateTo({
			url: '/pages/general-search/general-search?keyword=' + encodeURIComponent(searchKeyword.value)
		});
	};

	const goToShakePage = () => {
		uni.navigateTo({
			url: '/packages/location/location?autoShake=true'
		});
	};

	const goToCustomVisitPage = async () => {
		const canProceed = await checkLoginGuard('使用自定义访友搜索需完善资料，是否前往？');
		if (canProceed) {
			uni.navigateTo({
				url: '/pages/relation/relation'
			});
		}
	};

	const viewUserDetail = async (user) => {
		const canProceed = await checkLoginGuard();
		if (canProceed) {
			const defaultAvatar = '/static/icon/default-avatar.png';
			const name = user.nickname || '匿名用户';
			const avatarUrl = user.avatar || defaultAvatar;

			uni.navigateTo({
				url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`
			});
		}
	};

	onShow(() => {
		fetchRecommendUsers();
	});
</script>

<style lang="scss" scoped>
	$primary: #FF6F00;
	$dark: #1A1A1A;
	$gray-light: #F8F9FA;
	$text-main: #2D2D2D;
	$text-sub: #8E8E93;

	$dark-bg: #1A1A1A;

	.premium-header {
		background-color: $dark-bg;
		height: 280rpx;
		padding: 90rpx 40rpx 0;
		position: relative;
		border-radius: 0 0 50rpx 50rpx;
		/* 关键修复：移除这里的 overflow: hidden，否则绝对定位的搜索框会被截断 */
		z-index: 10;

		// 新增一个背景遮罩容器来处理装饰的裁剪
		.header-bg-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border-radius: 0 0 50rpx 50rpx;
			overflow: hidden; // 仅在这里裁剪背景光晕
			z-index: 1;

			.glow-circle {
				position: absolute;
				top: -150rpx;
				right: -100rpx;
				width: 450rpx;
				height: 450rpx;
				background: radial-gradient(circle, rgba($primary, 0.15) 0%, rgba($primary, 0) 70%);
			}

			.grid-mesh {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
					linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
				background-size: 40rpx 40rpx;
			}
		}

		.header-inner {
			position: relative;
			z-index: 2;
		}

		.brand-line {
			display: flex;
			align-items: center;
			margin-bottom: 12rpx;

			.brand-name {
				color: rgba(255, 255, 255, 0.35);
				font-size: 20rpx;
				letter-spacing: 6rpx;
				font-weight: 800;
			}

			.vip-badge-tag {
				margin-left: 20rpx;
				background: linear-gradient(135deg, #FFBD70, $primary);
				color: #fff;
				font-size: 16rpx;
				font-weight: bold;
				padding: 2rpx 14rpx;
				border-radius: 6rpx;
				box-shadow: 0 4rpx 12rpx rgba($primary, 0.2);
			}
		}

		.title-content {
			.main-title {
				color: #FFFFFF;
				font-size: 36rpx;
				font-weight: 700;
				display: block;
			}

			.sub-quote {
				color: rgba(255, 255, 255, 0.5);
				font-size: 22rpx;
				margin-top: 10rpx;
				display: block;
			}
		}
	}

	/* 搜索框定位修复 */
	.search-wrapper {
		position: absolute;
		bottom: -48rpx; // 搜索框高度的一半
		left: 0;
		right: 0;
		padding: 0 36rpx;
		z-index: 20; // 确保在所有 header 元素之上
	}

	.search-float-box {
		background: #FFFFFF;
		height: 96rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		padding: 0 10rpx 0 32rpx;
		/* 增强投影，让悬浮感更强 */
		box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.15);

		.search-left {
			display: flex;
			align-items: center;
			flex: 1;

			.search-input {
				flex: 1;
				margin-left: 20rpx;
				font-size: 28rpx;
				color: #333;
			}
		}

		.search-action-btn {
			background-color: $primary;
			color: #FFFFFF;
			height: 80rpx;
			padding: 0 36rpx;
			border-radius: 18rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			font-weight: 600;

			&:active {
				transform: scale(0.96);
				opacity: 0.9;
			}
		}
	}

	/* 调整下方内容的间距：由于搜索框下移了，所以 padding 也需要相应增加 */
	.scroll-content {
		padding: 100rpx 30rpx 40rpx;
	}

	.six-degrees-container {
		background-color: #F4F5F7;
		min-height: 100vh;
	}

	.premium-header {
		background-color: $dark;
		height: 240rpx;
		padding: 80rpx 40rpx 0;
		position: relative;
		border-radius: 0 0 40rpx 40rpx;

		.brand-name {
			color: rgba(255, 255, 255, 0.3);
			font-size: 20rpx;
			letter-spacing: 4rpx;
			font-weight: bold;
		}

		.title-row {
			display: flex;
		}

		.main-title {
			color: #FFFFFF;
			font-size: 48rpx;
			font-weight: 700;
		}

		.vip-badge {
			margin-left: 16rpx;
			background: linear-gradient(90deg, #FFBD70, $primary);
			color: #fff;
			font-size: 18rpx;
			padding: 4rpx 12rpx;
			border-radius: 4rpx;
		}

		.sub-quote {
			color: rgba(255, 255, 255, 0.5);
			font-size: 22rpx;
			margin-top: 8rpx;
		}
	}

	.search-wrapper {
		position: absolute;
		bottom: -50rpx;
		left: 0;
		right: 0;
		padding: 0 30rpx;
	}

	.search-float-box {
		background: #FFFFFF;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.1);

		.search-input {
			flex: 1;
			margin-left: 16rpx;
			font-size: 28rpx;
		}

		.search-action {
			color: $primary;
			font-weight: 600;
			font-size: 28rpx;
			padding-left: 16rpx;
			border-left: 1px solid #EEE;
		}
	}

	.scroll-content {
		padding: 80rpx 30rpx 40rpx;
	}

	.tools-section {
		margin-bottom: 40rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 700;
			color: $dark;
		}
	}

	.feature-grid {
		display: flex;
		gap: 16rpx;

		.feature-card {
			flex: 1;
			background: #FFF;
			border-radius: 24rpx;
			padding: 26rpx 24rpx;
			display: flex;
			align-items: center;
			position: relative;
			box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);

			.card-icon-wrap {
				width: 72rpx;
				height: 72rpx;
				background: linear-gradient(135deg, #FFF5F0, #FFE8D6);
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 18rpx;

				.icon-emboss {
					font-size: 36rpx;
				}
			}

			.c-title {
				font-size: 28rpx;
				font-weight: 600;
				color: $text-main;
				margin-bottom: 6rpx;
				display: block;
			}

			.c-desc {
				font-size: 22rpx;
				color: $text-sub;
				display: block;
			}

			.cost-tag {
				position: absolute;
				top: 0;
				right: 0;
				background: #FFF0E6;
				color: $primary;
				font-size: 18rpx;
				padding: 4rpx 14rpx;
				border-radius: 0 24rpx 0 16rpx;
				font-weight: 500;
			}
		}
	}

	.recommend-section {
		margin-bottom: 40rpx;

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			margin-bottom: 24rpx;

			.title {
				font-size: 32rpx;
				font-weight: 700;
			}

			.subtitle {
				font-size: 20rpx;
				color: $text-sub;
				margin-left: 12rpx;
			}

			.refresh-btn {
				font-size: 24rpx;
				color: $primary;
				font-weight: bold;
			}
		}
	}

	.user-card {
		background: #FFF;
		border-radius: 32rpx;
		padding: 32rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.03);

		.card-top {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24rpx;

			.avatar-img {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				background: #eee;
				border: 3rpx solid #FFF;
			}

			.main-meta {
				flex: 1;
				margin-left: 20rpx;

				.u-name {
					font-size: 32rpx;
					font-weight: 700;
				}

				.u-verify {
					margin-left: 10rpx;
					font-size: 18rpx;
					color: #52C41A;
					background: #F6FFED;
					padding: 2rpx 8rpx;
					border-radius: 4rpx;
				}

				.u-title {
					font-size: 24rpx;
					color: $text-sub;
					display: block;
					margin-top: 10rpx;
				}
			}

			.connection-tag {
				font-size: 20rpx;
				color: $text-sub;
				display: flex;
				align-items: center;

				.dot {
					width: 8rpx;
					height: 8rpx;
					background: $primary;
					border-radius: 50%;
					margin-right: 8rpx;
				}
			}
		}

		.card-body {
			background: $gray-light;
			border-radius: 20rpx;
			padding: 20rpx 24rpx;

			.info-item {
				display: flex;
				margin-bottom: 10rpx;

				.label {
					width: 110rpx;
					font-size: 22rpx;
					color: $text-sub;
				}

				.val {
					flex: 1;
					font-size: 24rpx;
					color: $text-main;
					font-weight: 500;
				}
			}
		}

		.reason-box {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-top: 24rpx;

			.reason-tag {
				background: #FFF5EE;
				color: #A0522D;
				font-size: 22rpx;
				padding: 6rpx 16rpx;
				border-radius: 100rpx;
			}
		}

		.card-footer {
			margin-top: 32rpx;
			padding-top: 24rpx;
			border-top: 1px solid rgba(0, 0, 0, 0.03);
			display: flex;
			justify-content: space-between;
			align-items: center;

			.location {
				font-size: 22rpx;
				color: $text-sub;
			}

			.connect-btn {
				background: $dark;
				color: #FFF;
				font-size: 24rpx;
				padding: 14rpx 28rpx;
				border-radius: 100rpx;
				font-weight: 600;
			}
		}
	}

	.subscription-section {
		margin-top: 40rpx;
		padding: 32rpx;
		background: #FFF;
		border-radius: 32rpx;

		.sub-title {
			font-size: 28rpx;
			font-weight: 700;
			display: block;
			text-align: center;
			margin-bottom: 32rpx;
		}

		.tier-container {
			display: flex;
			gap: 16rpx;
			margin-bottom: 32rpx;

			.tier-item {
				flex: 1;
				border: 2rpx solid #EEE;
				border-radius: 20rpx;
				padding: 24rpx 8rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;

				&.active {
					border-color: $primary;
					background: #FFF9F5;

					.t-num {
						color: $primary;
					}
				}

				.hot-badge {
					position: absolute;
					top: -12rpx;
					background: $primary;
					color: #fff;
					font-size: 16rpx;
					padding: 2rpx 10rpx;
					border-radius: 100rpx;
				}

				.t-num {
					font-size: 30rpx;
					font-weight: 700;
				}

				.t-price {
					font-size: 22rpx;
					color: $text-sub;
					margin: 4rpx 0;
				}

				.t-benefit {
					font-size: 18rpx;
					color: $primary;
					font-weight: 500;
				}
			}
		}

		.submit-btn {
			background: linear-gradient(135deg, $dark 0%, #333 100%);
			color: #FFF;
			height: 90rpx;
			border-radius: 45rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			font-weight: 700;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		}
	}

	.empty-recommend {
		text-align: center;
		padding: 60rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>