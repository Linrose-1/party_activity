<template>
	<view class="container">
		<!-- 只有在用户信息加载后才显示内容 -->
		<template v-if="userInfo">
			<!-- 贡分获取区域 -->
			<view class="points-section">
				<view class="points-header">
					<view class="points-title">
						<uni-icons type="compose" size="24" color="#FF6B00"></uni-icons> 当前贡分
					</view>
					<view class="points-value">{{ userInfo.currExperience }}</view>
				</view>
				<p class="section-desc">
					通过完成以下任务获取贡分，提升您的社交等级：
				</p>
				<view class="task-grid">
					<view class="task-card" v-for="(task, index) in tasks" :key="index" @click="handleTaskClick(task)">
						<view class="task-header">
							<view class="task-icon">
								<uni-icons :type="task.icon" size="24" color="#FF6B00"></uni-icons>
							</view>
							<view class="task-name">{{ task.name }}</view>
						</view>
						<view class="task-desc">{{ task.desc }}</view>
						<view class="task-footer">
							<span class="task-points">{{ task.points }}</span>
							<view class="task-action-icon">
								<uni-icons type="forward" size="20" color="#FF6B00"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 贡分历史记录 -->
			<view class="history-section">
				<view class="history-title">
					<uni-icons type="bars" size="24" color="#FF6B00"></uni-icons> 贡分历史记录
				</view>

				<view v-if="historyList.length === 0 && historyLoadStatus === 'noMore'" class="history-empty">
					<uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
					<text>暂无贡分记录</text>
				</view>

				<view v-else class="history-list">
					<view class="history-item" v-for="(record, index) in historyList"
						:key="record.createTime + '-' + index">
						<!-- ... 历史记录项内容无变化 ... -->
						<view class="history-icon"
							:class="{ 'positive-bg': record.experience >= 0, 'negative-bg': record.experience < 0 }">
							<uni-icons :type="record.experience >= 0 ? 'arrow-up' : 'arrow-down'" size="20"
								:color="record.experience >= 0 ? '#28a745' : '#dc3545'">
							</uni-icons>
						</view>
						<view class="history-details">
							<view class="history-task">{{ record.title }}</view>
							<view class="history-date">{{ formatTimestamp(record.createTime) }}</view>
						</view>
						<view class="history-points"
							:class="{ 'positive': record.experience >= 0, 'negative': record.experience < 0 }">
							{{ record.experience > 0 ? '+' : '' }}{{ record.experience }}
						</view>
					</view>
				</view>

				<uni-load-more v-if="historyList.length > 0 || historyLoadStatus === 'loading'"
					:status="historyLoadStatus" :contentText="{
						contentdown: '上拉显示更多',
						contentrefresh: '正在加载...',
						contentnomore: '—— 我是有底线的 ——'
					}"></uni-load-more>
			</view>
		</template>

		<!-- 【【【核心修复】】】 页面加载中占位 -->
		<view v-else class="loading-placeholder">
			<!-- 不再使用错误的 contentText 属性 -->
			<uni-load-more status="loading"></uni-load-more>
			<!-- 将自定义文本放在组件外部 -->
			<text class="loading-text">正在加载您的贡分信息...</text>
		</view>
	</view>

</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	const userInfo = ref(null);
	const historyList = ref([]);
	const historyPageNo = ref(1);
	const historyPageSize = ref(10);
	const historyTotal = ref(0);
	const historyLoadStatus = ref('more');

	const tasks = ref([{
			icon: 'flag',
			name: '发起聚会',
			desc: '成功发起并举办一次聚会',
			points: '+30分/次',
			path: '/packages/active-publish/active-publish'
		},
		{
			icon: 'calendar',
			name: '参与聚会',
			desc: '参加平台组织的聚会',
			points: '+100分/次',
			path: '/pages/active/active',
			isTabBar: true
		},
		{
			icon: 'chat',
			name: '分享聚会',
			desc: '分享有价值的聚会',
			points: '+80分/次',
			path: '/pages/active/active',
			isTabBar: true
		},
		{
			icon: 'shop',
			name: '聚店推荐',
			desc: '推荐优质店铺入驻平台',
			points: '+50分/家',
			path: '/pages/my-shopRecommend/my-shopRecommend'
		},
		{
			icon: 'paperplane',
			name: '系统共建',
			desc: '为平台提供有效的建议',
			points: '+10分/条',
			path: '/pages/my-systemSuggestions/my-systemSuggestions'
		},
		{
			icon: 'personadd',
			name: '分享名片',
			desc: '分享个人名片卡片',
			points: '+50分/人',
			path: '/packages/my-businessCard/my-businessCard'
		},
		{
			icon: 'redo',
			name: '邀请注册',
			desc: '邀请新用户进行注册',
			points: '+50分/人',
			path: '/pages/index/index'
		},
		{
			icon: 'star',
			name: '其他贡献',
			desc: '用户在平台的其他贡献',
			points: '+n分',
			path: '/packages/getPoints/getPoints'
		},
	]);

	const tabBarPaths = ['/pages/active/active', '/pages/home/home'];

	onMounted(() => {
		fetchUserInfo();
		getHistoryList(true);
	});

	onReachBottom(() => {
		getHistoryList();
	});

	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (!error) {
			userInfo.value = data;
		} else {
			console.error("获取用户信息失败:", error);
		}
	};

	const getHistoryList = async (isRefresh = false) => {
		if (historyLoadStatus.value === 'loading' || (historyLoadStatus.value === 'noMore' && !isRefresh)) {
			return;
		}
		if (isRefresh) {
			historyPageNo.value = 1;
			historyList.value = [];
			historyLoadStatus.value = 'more';
		}
		historyLoadStatus.value = 'loading';

		const {
			data,
			error
		} = await request('/app-api/member/experience-record/page', {
			method: 'GET',
			data: {
				pageNo: historyPageNo.value,
				pageSize: historyPageSize.value,
			},
		});

		if (error) {
			historyLoadStatus.value = 'more';
			uni.showToast({
				title: `历史记录加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}

		if (data && data.list && data.list.length > 0) {
			historyList.value.push(...data.list);
			historyTotal.value = data.total;
			if (historyList.value.length >= historyTotal.value) {
				historyLoadStatus.value = 'noMore';
			} else {
				historyLoadStatus.value = 'more';
				historyPageNo.value++;
			}
		} else {
			// 如果 data.list 为空或不存在，说明没有更多数据了
			historyLoadStatus.value = 'noMore';
		}
	};

	const handleTaskClick = (task) => {
		if (!task.path) {
			uni.showToast({
				title: '敬请期待该任务上线',
				icon: 'none'
			});
			return;
		}

		if (task.isTabBar || tabBarPaths.includes(task.path)) {
			uni.switchTab({
				url: task.path,
				fail: (err) => {
					console.error('switchTab 失败:', err);
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
					console.error('navigateTo 失败:', err);
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		}
	};

	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	};
</script>

<style scoped>
	/* ... 其他样式无变化 ... */
	.container {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding: 30rpx;
	}

	/* --- 【【【核心修复】】】 --- */
	.loading-placeholder {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.loading-text {
		color: #999;
		font-size: 28rpx;
		margin-top: 10rpx;
	}

	.points-section {
		background: white;
		border-radius: 40rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.points-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.points-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: flex;
		align-items: center;
	}

	.points-title uni-icons {
		margin-right: 12rpx;
	}

	.points-value {
		font-size: 48rpx;
		font-weight: bold;
		color: #FF6B00;
	}

	.section-desc {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 40rpx;
	}

	.task-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30rpx;
	}

	.task-card {
		background: #f9f9f9;
		border-radius: 30rpx;
		padding: 30rpx;
		transition: all 0.2s ease-in-out;
		border: 2rpx solid #eee;
		display: flex;
		flex-direction: column;
	}

	.task-card:active {
		transform: scale(0.98);
		background-color: #f0f0f0;
	}

	.task-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.task-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 20rpx;
		background: #fff5e6;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.task-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.task-desc {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 30rpx;
		line-height: 1.4;
		flex-grow: 1;
	}

	.task-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
	}

	.task-points {
		display: inline-block;
		background: rgba(255, 107, 0, 0.1);
		color: #FF6B00;
		padding: 8rpx 20rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
		font-weight: 600;
	}

	.task-action-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
	}

	.history-section {
		background: white;
		border-radius: 40rpx;
		padding: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.history-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		color: #333;
		display: flex;
		align-items: center;
	}

	.history-title uni-icons {
		margin-right: 20rpx;
	}

	.history-list {}

	.history-item {
		display: flex;
		padding: 30rpx 0;
		border-bottom: 2rpx solid #f0f0f0;
		align-items: center;
	}

	.history-item:last-child {
		border-bottom: none;
	}

	.history-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}

	.history-icon.positive-bg {
		background-color: #e8f5e9;
	}

	.history-icon.negative-bg {
		background-color: #fce4e4;
	}

	.history-details {
		flex: 1;
		min-width: 0;
	}

	.history-task {
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.history-date {
		font-size: 26rpx;
		color: #888;
	}

	.history-points {
		font-weight: bold;
		font-size: 32rpx;
	}

	.history-points.positive {
		color: #28a745;
	}

	.history-points.negative {
		color: #dc3545;
	}

	.history-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		color: #999;
		font-size: 28rpx;
	}

	.history-empty text {
		margin-top: 20rpx;
	}
</style>