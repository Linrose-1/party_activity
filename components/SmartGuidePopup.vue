<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="guide-card">
			<!-- 1. 右上角关闭按钮 -->
			<view class="close-icon-top" @click="close">
				<uni-icons type="closeempty" size="24" color="#ccc"></uni-icons>
			</view>

			<!-- 顶部欢迎标题：字号已调小 -->
			<view class="guide-header">
				<text class="guide-title">{{ welcomeTitle }}</text>
			</view>

			<!-- 按钮操作区 -->
			<view class="guide-body">

				<!-- 情况 1 & 2 的按钮布局 -->
				<block v-if="scenario === 1 || scenario === 2">
					<!-- 按钮 1：浏览商友圈 -->
					<view class="action-card" @click="handleAction('home')">
						<view class="card-left">
							<view class="icon-circle gray">
								<uni-icons type="home-filled" size="22" color="#FF6A00" />
							</view>
						</view>
						<view class="card-right">
							<text class="btn-title">浏览商友圈</text>
							<text class="btn-desc">也可点击左上角“屋子”图标，浏览商友圈！</text>
						</view>
					</view>

					<!-- 按钮 2：登录注册 (高亮) -->
					<view class="action-card highlight" @click="handleAction('login')">
						<view class="card-left">
							<view class="icon-circle white">
								<uni-icons type="personadd-filled" size="22" color="#FF6A00" />
							</view>
						</view>
						<view class="card-right">
							<text class="btn-title">登录注册</text>
							<text class="btn-desc">立即体验，获得猩聚社登陆奖励5智米！</text>
						</view>
					</view>
				</block>

				<!-- 情况 3 的按钮布局 -->
				<block v-else-if="scenario === 3">
					<view class="action-card highlight" @click="handleAction('edit')">
						<view class="card-left">
							<view class="icon-circle white">
								<uni-icons type="compose" size="22" color="#FF6A00" />
							</view>
						</view>
						<view class="card-right">
							<text class="btn-title">完善资料</text>
							<text class="btn-desc">完善资料您可获赠10智米，解锁猩聚社创新社交功能</text>
						</view>
					</view>

				</block>

			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';

	const props = defineProps({
		scenario: {
			type: Number,
			default: 1
		} // 1:新户, 2:老游客, 3:未完善资料
	});

	const popup = ref(null);

	const welcomeTitle = computed(() => {
		if (props.scenario === 1) return "欢迎来到猩聚社——精英商友跨域社交社区！";
		if (props.scenario === 2) return "欢迎您再次来到猩聚社——精英商友跨域社交社区！";
		if (props.scenario === 3) return "欢迎来到猩聚社——精英商友跨域社交社区！完善资料您可获赠10智米，解锁猩聚社创新社交功能";
		return "";
	});

	const open = () => popup.value.open();
	const close = () => popup.value.close();

	const handleAction = (type) => {
		popup.value.close();
		if (type === 'home') uni.switchTab({
			url: '/pages/home/home'
		});
		if (type === 'login') uni.navigateTo({
			url: '/pages/index/index'
		});
		if (type === 'edit') uni.navigateTo({
			url: '/packages/my-edit/my-edit'
		});
	};

	defineExpose({
		open
	});
</script>

<style lang="scss" scoped>
	.guide-card {
		width: 620rpx;
		background-color: #fff;
		border-radius: 40rpx;
		padding: 60rpx 40rpx 40rpx;
		/* 增加顶部内边距给X留空间 */
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
		position: relative; // 必须设置，让关闭按钮定位
	}

	/* 右上角 X 按钮 */
	.close-icon-top {
		position: absolute;
		top: 18rpx;
		right: 24rpx;
		padding: 10rpx;
		z-index: 10;
	}

	.guide-header {
		margin-bottom: 44rpx;
		padding: 0 10rpx;
	}

	/* 标题字号调小至 28rpx */
	.guide-title {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
		line-height: 1.6;
		text-align: center;
		display: block;
	}

	.guide-body {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.action-card {
		display: flex;
		align-items: center;
		padding: 24rpx;
		border-radius: 20rpx;
		background-color: #f9f9f9;
		border: 1rpx solid #eee;
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			background-color: #f2f2f2;
		}

		.card-left {
			margin-right: 20rpx;
			flex-shrink: 0;

			.icon-circle {
				width: 72rpx;
				height: 72rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				&.gray {
					background-color: #eee;
				}

				&.white {
					background-color: #fff;
				}
			}
		}

		.card-right {
			display: flex;
			flex-direction: column;
			flex: 1;

			.btn-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 4rpx;
			}

			.btn-desc {
				font-size: 20rpx;
				color: #888;
				line-height: 1.4;
			}
		}
	}

	/* 高亮样式 */
	.action-card.highlight {
		background: linear-gradient(135deg, #FF8C00, #FF6A00);
		border: none;
		box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.2);

		.btn-title {
			color: #fff;
		}

		.btn-desc {
			color: rgba(255, 255, 255, 0.85);
		}
	}

	.bottom-skip {
		text-align: center;
		font-size: 24rpx;
		color: #bbb;
		padding-top: 20rpx;
	}
</style>