<template>
	<view class="page-container">
		<view class="header">
			<text class="title">贡分任务中心</text>
			<text class="subtitle">完成以下任务，加速您的社交等级提升</text>
		</view>

		<!-- 任务列表 -->
		<view class="task-list-wrapper">
			<!-- 循环渲染每个任务分类 -->
			<view v-for="category in taskCategories" :key="category.title" class="task-category">
				<!-- 分类标题 -->
				<view class="category-title">
					<uni-icons :type="category.icon" size="20" :color="themeColor"></uni-icons>
					<text>{{ category.title }}</text>
				</view>
				<!-- 分类下的任务列表 -->
				<view class="task-items">
					<view v-for="task in category.tasks" :key="task.name" class="task-card">
						<view class="task-info">
							<text class="task-name">{{ task.name }}</text>
							<view class="task-rewards">
								<text class="reward-item">每次: <text
										class="reward-value">+{{ task.points }}</text></text>
								<text class="reward-item">每日上限: <text
										class="reward-value">{{ task.dailyLimit }}</text></text>
							</view>
						</view>
						<button class="action-btn" @click="handleTaskClick(task)">去完成</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	// --- 页面配置 ---
	const themeColor = ref('#FF862D');

	// --- 核心数据：任务列表 ---
	// 将所有任务按逻辑分类
	const taskCategories = ref([{
			title: '分享与互动',
			icon: 'redo-filled',
			tasks: [{
					name: '分享名片奖励',
					points: 50,
					dailyLimit: '10次/天',
					path: '/pages/my-businessCard/my-businessCard'
				},
				{
					name: '分享聚会奖励',
					points: 80,
					dailyLimit: '3次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
				{
					name: '分享商机奖励',
					points: 50,
					dailyLimit: '5次/天',
					path: '/pages/home/home',
					isTabBar: true
				},
				// {
				// 	name: '关注用户',
				// 	points: 5,
				// 	dailyLimit: 100,
				// 	path: '/pages/home/home',
				// 	isTabBar: true
				// },
			]
		},
		{
			title: '内容贡献',
			icon: 'compose',
			tasks: [{
					name: '成功发布评论',
					points: 15,
					dailyLimit: '10次/天',
					path: '/pages/home/home',
					isTabBar: true
				},
				{
					name: '成功推荐门店',
					points: 50,
					dailyLimit: '5次/天',
					path: '/pages/shop-recommend/shop-recommend'
				},
				{
					name: '成功申请入驻',
					points: 100,
					dailyLimit: '不限',
					path: null
				},
				{
					name: '完成完整的数字身份编辑',
					points: 120,
					dailyLimit: '1次',
					path: '/packages/my-edit/my-edit'
				},
				{
					name: '数字身份更新',
					points: 30,
					dailyLimit: '1次/天',
					path: '/packages/my-edit/my-edit'
				},
			]
		},
		{
			title: '核心参与',
			icon: 'paperplane-filled',
			tasks: [{
					name: '参加聚会',
					points: 100,
					dailyLimit: '5次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
				{
					name: '阅读聚会详情',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
				{
					name: '阅读商机详情',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/home/home',
					isTabBar: true
				},
				{
					name: '阅览聚店详情',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/shop/shop',
					isTabBar: true
				},
				{
					name: '收藏聚会',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
				{
					name: '收藏商机',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/home/home',
					isTabBar: true
				},
				{
					name: '赞踩商机',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/home/home',
					isTabBar: true
				},
				{
					name: '匿名举报或建议商机',
					points: 20,
					dailyLimit: '5次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
				{
					name: '赞踩聚会',
					points: 10,
					dailyLimit: '5次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
				{
					name: '举报聚会',
					points: 20,
					dailyLimit: '5次/天',
					path: '/pages/active/active',
					isTabBar: true
				},
			]
		},
		{
			title: '消费与特殊奖励',
			icon: 'money-filled',
			tasks: [{
					name: '支付名片获得贡分',
					points: 20,
					dailyLimit: '5次/天',
					path: null
				}, // 假设这个没有直接跳转入口
				{
					name: '用户参加活动让利',
					points: 80,
					dailyLimit: '5次/天',
					path: null
				},
				{
					name: '用户参加活动平台让利',
					points: 80,
					dailyLimit: '5次/天',
					path: null
				},
				{
					name: '店铺因活动成功举办获得贡分',
					points: 100,
					dailyLimit: '5次/天',
					path: null
				},
			]
		}
	]);

	// 定义 TabBar 页面路径列表，用于跳转判断
	// ‼️ 请根据您项目的 pages.json 确认这些路径是否正确
	const tabBarPaths = ['/pages/home/home', '/pages/active/active', '/pages/shop/shop', '/pages/my/my'];

	// --- 方法 ---
	/**
	 * @description 处理任务卡片的点击事件，智能判断跳转方式
	 */
	const handleTaskClick = (task) => {
		if (!task.path) {
			uni.showToast({
				title: '此奖励为被动获取，无直接入口',
				icon: 'none'
			});
			return;
		}

		// 判断是否是 TabBar 页面
		if (task.isTabBar || tabBarPaths.includes(task.path)) {
			uni.switchTab({
				url: task.path,
				fail: (err) => {
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		} else {
			uni.navigateTo({
				url: task.path,
				fail: (err) => {
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		}
	};
</script>

<style lang="scss" scoped>
	.page-container {
		background-color: #f7f8fa;
		min-height: 100vh;
	}

	.header {
		background: linear-gradient(135deg, v-bind(themeColor), #FF6B00);
		color: white;
		padding: 60rpx 40rpx 80rpx;
		text-align: center;
		border-bottom-left-radius: 60rpx;
		border-bottom-right-radius: 60rpx;

		.title {
			display: block;
			font-size: 48rpx;
			font-weight: bold;
			text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
		}

		.subtitle {
			display: block;
			font-size: 28rpx;
			margin-top: 10rpx;
			opacity: 0.9;
		}
	}

	.task-list-wrapper {
		padding: 30rpx;
		// margin-top: -40rpx; // 让列表区域向上嵌入header，更有层次感
		position: relative;
	}

	.task-category {
		margin-bottom: 40rpx;
	}

	.category-title {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.uni-icons {
			margin-right: 15rpx;
		}

		text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.task-items {
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
	}

	.task-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}
	}

	.task-info {
		flex: 1;
		min-width: 0;
	}

	.task-name {
		display: block;
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 10rpx;
	}

	.task-rewards {
		display: flex;
		align-items: center;
		gap: 30rpx;
		font-size: 24rpx;
		color: #999;
	}

	.reward-value {
		color: v-bind(themeColor);
		font-weight: bold;
		margin-left: 8rpx;
	}

	.action-btn {
		height: 60rpx;
		line-height: 60rpx;
		padding: 0 30rpx;
		margin: 0 0 0 20rpx; // 与左侧信息拉开距离
		font-size: 26rpx;
		font-weight: 500;
		color: #fff;
		background-color: v-bind(themeColor);
		border-radius: 30rpx;
		flex-shrink: 0;

		&::after {
			border: none;
		}
	}
</style>