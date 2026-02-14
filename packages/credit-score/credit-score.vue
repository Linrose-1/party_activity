<template>
	<view class="credit-container">
		<!-- 头部：总分展示区 -->
		<view class="header-card">
			<view class="score-circle">
				<text class="score-num">{{ scoreData.totalScore || 0 }}</text>
				<text class="score-label">总信用分</text>
			</view>
			<view class="level-badge">
				<text class="level-icon">{{ getLevelIcon(scoreData.creditLevel) }}</text>
				<text class="level-name">{{ scoreData.creditLevel || '待提升' }}</text>
			</view>
			<text class="update-tip">分数根据您的商友互动及资料实时更新</text>
		</view>

		<!-- 六大维度得分详情 -->
		<view class="dimension-section">
			<view class="section-title">
				<view class="title-line"></view>
				<text>信用维度分析</text>
			</view>

			<view class="dimension-list">
				<!-- 1. 贡分权重 -->
				<view class="dimension-item">
					<view class="item-top">
						<view class="label-group">
							<uni-icons type="medal-filled" size="20" color="#FF8300"></uni-icons>
							<text class="label">贡分权重</text>
						</view>
						<text class="value">{{ scoreData.contributionScore }}<text class="max">/300</text></text>
					</view>
					<view class="progress-bg">
						<view class="progress-bar" :style="{ width: (scoreData.contributionScore/300*100) + '%' }">
						</view>
					</view>
				</view>

				<!-- 2. 智米权重 -->
				<view class="dimension-item">
					<view class="item-top">
						<view class="label-group">
							<uni-icons type="coin-filled" size="20" color="#FF8300"></uni-icons>
							<text class="label">智米权重</text>
						</view>
						<text class="value">{{ scoreData.pointScore }}<text class="max">/200</text></text>
					</view>
					<view class="progress-bg">
						<view class="progress-bar" :style="{ width: (scoreData.pointScore/200*100) + '%' }"></view>
					</view>
				</view>

				<!-- 3. 商友互动 -->
				<view class="dimension-item">
					<view class="item-top">
						<view class="label-group">
							<uni-icons type="chat-filled" size="20" color="#FF8300"></uni-icons>
							<text class="label">商友互动</text>
						</view>
						<text class="value">{{ scoreData.interactionScore }}<text class="max">/200</text></text>
					</view>
					<view class="progress-bg">
						<view class="progress-bar" :style="{ width: (scoreData.interactionScore/200*100) + '%' }">
						</view>
					</view>
				</view>

				<!-- 4. 数字身份 -->
				<view class="dimension-item">
					<view class="item-top">
						<view class="label-group">
							<uni-icons type="person-filled" size="20" color="#FF8300"></uni-icons>
							<text class="label">数字身份</text>
						</view>
						<text class="value">{{ scoreData.digitalIdentityScore }}<text class="max">/100</text></text>
					</view>
					<view class="progress-bg">
						<view class="progress-bar" :style="{ width: (scoreData.digitalIdentityScore/100*100) + '%' }">
						</view>
					</view>
				</view>

				<!-- 5. 基础信息 -->
				<view class="dimension-item">
					<view class="item-top">
						<view class="label-group">
							<uni-icons type="info-filled" size="20" color="#FF8400"></uni-icons>
							<text class="label">基础信息</text>
						</view>
						<text class="value">{{ scoreData.basicInfoScore }}<text class="max">/150</text></text>
					</view>
					<view class="progress-bg">
						<view class="progress-bar" :style="{ width: (scoreData.basicInfoScore/150*100) + '%' }"></view>
					</view>
				</view>

				<!-- 6. 实名认证 -->
				<view class="dimension-item">
					<view class="item-top">
						<view class="label-group">
							<uni-icons type="auth-filled" size="20" color="#FF8400"></uni-icons>
							<text class="label">实名认证</text>
						</view>
						<text class="value">{{ scoreData.realNameAuthScore }}<text class="max">/50</text></text>
					</view>
					<view class="progress-bg">
						<view class="progress-bar" :style="{ width: (scoreData.realNameAuthScore/50*100) + '%' }">
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 信用等级规则卡片 -->
		<view class="rule-card">
			<view class="section-title">
				<view class="title-line"></view>
				<text>等级划分说明</text>
			</view>
			<view class="rule-list">
				<view class="rule-item" v-for="(rule, index) in rules" :key="index"
					:class="{active: scoreData.creditLevel === rule.name}">
					<text class="rule-icon">{{ rule.icon }}</text>
					<text class="rule-name">{{ rule.name }}</text>
					<text class="rule-range">{{ rule.range }}分</text>
				</view>
			</view>
		</view>

		<view class="bottom-spacer"></view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import request from '@/utils/request.js';

	const scoreData = ref({
		totalScore: 0,
		contributionScore: 0,
		pointScore: 0,
		interactionScore: 0,
		digitalIdentityScore: 0,
		basicInfoScore: 0,
		realNameAuthScore: 0,
		creditLevel: ''
	});

	const rules = [{
			name: '钻石商友',
			icon: '💎',
			range: '900-1000'
		},
		{
			name: '金牌商友',
			icon: '🥇',
			range: '800-899'
		},
		{
			name: '银牌商友',
			icon: '🥈',
			range: '700-799'
		},
		{
			name: '铜牌商友',
			icon: '🥉',
			range: '600-699'
		},
		{
			name: '优质商友',
			icon: '⭐',
			range: '500-599'
		},
		{
			name: '待提升',
			icon: '⚠️',
			range: '<500'
		}
	];

	const getLevelIcon = (level) => {
		const rule = rules.find(r => r.name === level);
		return rule ? rule.icon : '⚠️';
	};

	const fetchCreditScore = async () => {
		uni.showLoading({
			title: '计算中...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/user/credit-score', {
			method: 'GET'
		});
		uni.hideLoading();

		if (!error && data) {
			scoreData.value = data;
		}
	};

	onMounted(() => {
		fetchCreditScore();
	});
</script>

<style lang="scss" scoped>
	$theme-color: #FF8300;

	.credit-container {
		background-color: #F8F9FB;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	/* 头部样式 */
	.header-card {
		background: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
		height: 520rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #FFF;
		border-radius: 0 0 80rpx 80rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);

		.score-circle {
			width: 240rpx;
			height: 240rpx;
			border: 6rpx solid rgba($theme-color, 0.3);
			border-radius: 50%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			background: rgba(255, 131, 0, 0.05);
			box-shadow: 0 0 40rpx rgba($theme-color, 0.1);

			.score-num {
				font-size: 80rpx;
				font-weight: bold;
				color: $theme-color;
				line-height: 1;
			}

			.score-label {
				font-size: 24rpx;
				color: #999;
				margin-top: 10rpx;
			}
		}

		.level-badge {
			margin-top: 40rpx;
			background: rgba(255, 255, 255, 0.1);
			padding: 10rpx 40rpx;
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			gap: 12rpx;
			border: 1rpx solid rgba(255, 255, 255, 0.1);

			.level-icon {
				font-size: 32rpx;
			}

			.level-name {
				font-size: 30rpx;
				font-weight: bold;
				color: #FFBD70;
			}
		}

		.update-tip {
			font-size: 22rpx;
			color: rgba(255, 255, 255, 0.4);
			margin-top: 30rpx;
		}
	}

	/* 标题样式 */
	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;

		.title-line {
			width: 8rpx;
			height: 32rpx;
			background: $theme-color;
			border-radius: 4rpx;
			margin-right: 16rpx;
		}

		text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	/* 维度列表样式 */
	.dimension-section {
		margin: -40rpx 30rpx 30rpx;
		background: #FFF;
		border-radius: 32rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.dimension-list {
			.dimension-item {
				margin-bottom: 36rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.item-top {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 16rpx;

					.label-group {
						display: flex;
						align-items: center;
						gap: 12rpx;

						.label {
							font-size: 28rpx;
							color: #444;
							font-weight: 500;
						}
					}

					.value {
						font-size: 30rpx;
						font-weight: bold;
						color: #333;

						.max {
							font-size: 22rpx;
							color: #999;
							font-weight: normal;
						}
					}
				}

				.progress-bg {
					height: 12rpx;
					background: #F0F0F0;
					border-radius: 6rpx;
					overflow: hidden;

					.progress-bar {
						height: 100%;
						background: linear-gradient(90deg, #FFBD70, $theme-color);
						border-radius: 6rpx;
						transition: width 0.6s ease;
					}
				}
			}
		}
	}

	/* 规则卡片样式 */
	.rule-card {
		margin: 0 30rpx;
		background: #FFF;
		border-radius: 32rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.rule-list {
			.rule-item {
				display: flex;
				align-items: center;
				padding: 24rpx 0;
				border-bottom: 1rpx solid #F5F5F5;

				&:last-child {
					border-bottom: none;
				}

				&.active {
					background: rgba($theme-color, 0.05);
					border-radius: 12rpx;
					padding: 24rpx 20rpx;
					margin: 0 -10rpx;

					.rule-name {
						color: $theme-color;
					}
				}

				.rule-icon {
					font-size: 36rpx;
					width: 60rpx;
				}

				.rule-name {
					flex: 1;
					font-size: 28rpx;
					color: #666;
					margin-left: 20rpx;
				}

				.rule-range {
					font-size: 26rpx;
					color: #999;
					font-family: Arial;
				}
			}
		}
	}

	.bottom-spacer {
		height: 60rpx;
	}
</style>