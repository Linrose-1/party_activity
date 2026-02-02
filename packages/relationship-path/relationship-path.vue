<template>
	<view class="page-container">
		<!-- 1. 顶部概览卡片：直观显示您与目标商友的连接概况 -->
		<view class="summary-card" v-if="paths.length > 0">
			<view class="summary-header">
				<text class="user-me">您</text>
				<uni-icons type="arrow-right" size="20" color="#FF6E00"></uni-icons>
				<text class="user-target">{{ targetName }}</text>
			</view>
			<view class="summary-details">
				<view class="s-item">
					<text class="s-label">关系距离：</text>
					<text class="s-val">{{ minDegree }}度人脉</text>
				</view>
				<view class="s-item">
					<text class="s-label">发现路径：</text>
					<text class="s-val">{{ totalPathCount }}条</text>
				</view>
			</view>
		</view>

		<!-- 2. 路径列表展示区 -->
		<scroll-view scroll-y class="path-scroll">
			<view class="path-group" v-for="(group, gIdx) in paths" :key="gIdx">
				<!-- 分组标题：如 1度人脉、2度人脉 -->
				<view class="group-title" v-if="group.degreePathUsers.length > 0">
					<uni-icons type="fire-filled" size="16" color="#FF6E00"></uni-icons>
					<text>{{ group.degreePathNum }}度人脉路径</text>
				</view>

				<view class="path-list">
					<!-- 渲染每一条具体的连接路径 -->
					<view class="path-card" v-for="(path, pIdx) in group.degreePathUsers" :key="pIdx">
						<view class="path-card-header">
							<text class="path-no">路径索引 {{ pIdx + 1 }}</text>
							<text class="path-tag">信任背书</text>
						</view>

						<!-- 链路可视化：横向排布的用户节点 -->
						<view class="chain-box">
							<view class="chain-item" v-for="(user, uIdx) in path" :key="user.id">
								<!-- 用户节点：点击可跳转至对应的个人名片 -->
								<view class="user-node" @click="goUserCard(user, uIdx)">
									<image :src="user.avatar || '/static/icon/default-avatar.png'" mode="aspectFill"
										class="node-avatar"></image>
									<text
										class="node-name">{{ uIdx === 0 ? '您' : (user.realName || user.nickname) }}</text>
								</view>

								<!-- 连接箭头：最后一位用户后不再显示 -->
								<view class="node-connector" v-if="uIdx < path.length - 1">
									<view class="arrow-line"></view>
									<text class="action-label">连接</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 状态处理：加载中或空状态 -->
			<view v-if="isLoading" class="state-box">
				<uni-load-more status="loading" contentText="正在计算最优人脉路径..."></uni-load-more>
			</view>
			<view v-else-if="paths.length === 0" class="state-box empty">
				<image src="/static/icon/empty-path.png" mode="aspectFit" class="empty-img"></image>
				<text>暂未找到您与该商友的直接关系链路</text>
				<button class="invite-now" @click="handleInviteAction">立即申请建立连接</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// --- 状态定义 ---
	const targetUserId = ref(null); // 目标用户ID
	const targetName = ref('商友'); // 目标用户姓名
	const paths = ref([]); // 路径数组
	const isLoading = ref(true); // 加载状态
	const defaultAvatar = 'https://img.gofor.club/mmexport1759211962539.jpg'; // 默认头像

	/**
	 * 页面加载：初始化目标信息并请求接口
	 */
	onLoad((options) => {
		console.log('人脉链路页收到参数:', options);
		if (options.targetUserId) {
			targetUserId.value = options.targetUserId;
			if (options.name) {
				// decodeURIComponent 会把 %E5%95%86%E5%8F%8B 转回 "商友"
				targetName.value = decodeURIComponent(options.name);
			} else {
				targetName.value = '商友';
			}

			console.log('👤 解析后的目标姓名:', targetName.value);
			// 设置原生导航栏标题
			uni.setNavigationBarTitle({
				title: `与 ${targetName.value} 的关系链路`
			});
			fetchContactLink();
		}
	});

	/**
	 * [接口方法] 获取六度人脉链路数据
	 */
	const fetchContactLink = async () => {
		isLoading.value = true;
		const {
			data,
			error
		} = await request('/app-api/member/user/friend/contact-friend-link', {
			method: 'GET',
			data: {
				targetUserId: targetUserId.value
			}
		});
		isLoading.value = false;
		if (!error && data) {
			// 过滤并存储有效的人脉路径
			paths.value = data.filter(item => item.degreePathUsers && item.degreePathUsers.length > 0);
		}
	};

	/**
	 * [计算属性] 获取最近的人脉层级（1度/2度...）
	 */
	const minDegree = computed(() => {
		if (paths.value.length === 0) return 0;
		return paths.value[0].degreePathNum;
	});

	/**
	 * [计算属性] 计算本次查询找到的所有路径总数
	 */
	const totalPathCount = computed(() => {
		return paths.value.reduce((sum, item) => sum + item.degreePathUsers.length, 0);
	});

	/**
	 * [核心跳转方法] 点击头像跳转至个人名片页面
	 * @param {Object} user 用户对象
	 * @param {Number} uIdx 节点索引（用于判断是否为本人）
	 */
	const goUserCard = (user, uIdx) => {
		// if (!user || !user.id) {
		// 	uni.showToast({
		// 		title: '无法查看该用户主页',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

		// 1. 准备跳转参数
		const id = user.id;
		const name = uIdx === 0 ? '我' : (user.realName || user.nickname || '商友');
		const avatarUrl = user.avatar || defaultAvatar;

		// 2. 按照指定格式跳转至名片页面
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;

		uni.navigateTo({
			url
		});
	};

	/**
	 * [方法] 处理空状态下的邀请连接动作
	 */
	const handleInviteAction = () => {
		uni.showToast({
			title: '连接请求已发送',
			icon: 'none'
		});
	};
</script>

<style scoped lang="scss">
	/* 主题色变量 */
	$theme: #FF6E00;

	.page-container {
		background-color: #F4F7F9;
		min-height: 100vh;
		padding: 20rpx;
	}

	/* 顶部概览卡片 */
	.summary-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);

		.summary-header {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 30rpx;
			margin-bottom: 30rpx;

			.user-me,
			.user-target {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
			}

			.user-target {
				color: $theme;
			}
		}

		.summary-details {
			display: flex;
			justify-content: space-around;
			border-top: 2rpx solid #f5f5f5;
			padding-top: 30rpx;

			.s-item {
				display: flex;
				align-items: center;

				.s-label {
					font-size: 26rpx;
					color: #999;
				}

				.s-val {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
			}
		}
	}

	/* 路径分组标题 */
	.group-title {
		padding: 20rpx 10rpx;
		font-size: 28rpx;
		font-weight: bold;
		color: #666;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	/* 路径详情卡片 */
	.path-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

		.path-card-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30rpx;

			.path-no {
				font-size: 24rpx;
				color: #bbb;
			}

			.path-tag {
				font-size: 20rpx;
				color: $theme;
				background: rgba($theme, 0.1);
				padding: 4rpx 12rpx;
				border-radius: 4rpx;
			}
		}
	}

	/* 链路盒子：处理自动换行 */
	.chain-box {
		display: flex;
		align-items: flex-start;
		flex-wrap: wrap;
		row-gap: 40rpx;

		.chain-item {
			display: flex;
			align-items: center;
		}
	}

	/* 用户节点样式 */
	.user-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 110rpx;

		.node-avatar {
			width: 84rpx;
			height: 84rpx;
			border-radius: 50%;
			border: 4rpx solid #fff;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			background: #f8f8f8;
		}

		.node-name {
			font-size: 22rpx;
			color: #333;
			margin-top: 12rpx;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 100%;
			font-weight: 500;
		}
	}

	/* 连接器：线条+文字 */
	.node-connector {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80rpx;

		.arrow-line {
			width: 50rpx;
			height: 2rpx;
			background: #ddd;
			position: relative;
			margin-top: 40rpx;

			&::after {
				content: '';
				position: absolute;
				right: 0;
				top: -6rpx;
				width: 0;
				height: 0;
				border-left: 10rpx solid #ddd;
				border-top: 8rpx solid transparent;
				border-bottom: 8rpx solid transparent;
			}
		}

		.action-label {
			font-size: 18rpx;
			color: #bbb;
			margin-top: 10rpx;
		}
	}

	/* 异常状态容器 */
	.state-box {
		padding: 100rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		&.empty text {
			color: #999;
			margin-top: 30rpx;
			text-align: center;
		}

		.empty-img {
			width: 240rpx;
			height: 240rpx;
		}

		.invite-now {
			margin-top: 60rpx;
			background: linear-gradient(to right, $theme, #FF9546);
			color: #fff;
			border-radius: 40rpx;
			font-size: 28rpx;
			width: 320rpx;
			font-weight: bold;
			box-shadow: 0 6rpx 16rpx rgba($theme, 0.3);
		}
	}
</style>