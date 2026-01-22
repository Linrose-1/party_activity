<template>
	<view class="container">
		<template v-if="userInfo">
			<!-- 1. 贡分数值展示区 (可用 + 累计) -->
			<view class="section-card">
				<view class="section-title-box">
					<view class="main-title">
						<uni-icons type="medal-filled" size="22" color="#FF6B00"></uni-icons>
						<text>我的贡分</text>
					</view>
					<text class="sub-desc">贡分是衡量平台社交贡献度的核心指标，可用于提升等级及参与智米分配。</text>
				</view>

				<view class="balance-display-card">
					<view class="display-item">
						<text class="num">{{ userInfo.currExperience || 0 }}</text>
						<text class="label">可用贡分</text>
					</view>
					<view class="display-divider"></view>
					<view class="display-item">
						<text class="num total">{{ userInfo.totalExperience || 0 }}</text>
						<text class="label">累计贡分</text>
					</view>
				</view>

				<!-- 业务说明 -->
				<view class="explanation-box">
					<view class="exp-item">
						<uni-icons type="info" size="14" color="#FF6B00"></uni-icons>
						<text>可用贡分：是指累计贡分减除已参与平台智米分配计算之后的贡分余额。</text>
					</view>
					<view class="exp-item">
						<uni-icons type="info" size="14" color="#FF6B00"></uni-icons>
						<text>累计贡分：是累计获得的历史贡分。</text>
					</view>
				</view>
			</view>

			<!-- 2. 获得方式 (完整还原 8 个原始任务) -->
			<view class="section-card">
				<view class="section-header">
					<text class="title">获得方式</text>
					<text class="title-tip">完成任务，提升等级</text>
				</view>
				<view class="task-grid">
					<view class="task-card" v-for="(task, index) in tasks" :key="index" @click="handleTaskClick(task)">
						<view class="task-icon-wrap">
							<uni-icons :type="task.icon" size="24" color="#FF6B00"></uni-icons>
						</view>
						<view class="task-content">
							<view class="task-name-row">
								<text class="task-name">{{ task.name }}</text>
								<text class="task-points">{{ task.points }}</text>
							</view>
							<text class="task-desc">{{ task.desc }}</text>
						</view>
						<uni-icons type="right" size="14" color="#DDD"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 3. 最近获得的记录 (预览 5 条) -->
			<view class="section-card">
				<view class="section-header">
					<text class="title">最近记录</text>
					<view class="view-all" @click="goToAllRecords">
						查看全部 <uni-icons type="right" size="14" color="#999"></uni-icons>
					</view>
				</view>

				<view class="record-list" v-if="recentRecords.length > 0">
					<view class="record-item" v-for="(item, index) in recentRecords" :key="index">
						<view class="record-left">
							<text class="record-title">{{ item.title }}</text>
							<text class="record-date">{{ formatDate(item.createTime) }}</text>
						</view>
						<view class="record-right" :class="{ 'plus': item.experience > 0 }">
							{{ item.experience > 0 ? '+' : '' }}{{ item.experience }}
						</view>
					</view>
				</view>
				<view v-else class="empty-tip">暂无贡分记录</view>
			</view>
		</template>

		<view v-else class="loading-placeholder">
			<uni-load-more status="loading"></uni-load-more>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import request from '@/utils/request.js';

	const userInfo = ref(null);
	const recentRecords = ref([]);

	// --- 完整还原 8 个原始任务数据 ---
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
		}
	]);

	const tabBarPaths = ['/pages/active/active', '/pages/home/home'];

	onMounted(() => {
		fetchUserInfo();
		fetchRecentRecords();
	});

	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get');
		if (!error) userInfo.value = data;
	};

	const fetchRecentRecords = async () => {
		// 接入新接口，获取前 5 条
		const {
			data,
			error
		} = await request('/app-api/member/experience-record/my-experience-list', {
			data: {
				pageNo: 1,
				pageSize: 5
			}
		});
		if (!error && data) {
			recentRecords.value = data.list;
		}
	};

	const formatDate = (ts) => {
		const d = new Date(ts);
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
	};

	const goToAllRecords = () => {
		uni.navigateTo({
			url: '/packages/experience-records/experience-records'
		});
	};

	const handleTaskClick = (task) => {
		if (!task.path) return;
		if (task.isTabBar || tabBarPaths.includes(task.path)) {
			uni.switchTab({
				url: task.path
			});
		} else {
			uni.navigateTo({
				url: task.path
			});
		}
	};
</script>

<style scoped>
	.container {
		background-color: #F8F9FB;
		min-height: 100vh;
		padding: 24rpx;
	}

	.section-card {
		background-color: #ffffff;
		border-radius: 32rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	.section-title-box {
		margin-bottom: 32rpx;
	}

	.main-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
	}

	.sub-desc {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
		display: block;
		line-height: 1.4;
	}

	.balance-display-card {
		background: linear-gradient(135deg, #FFFBF8 0%, #FFF5EE 100%);
		border-radius: 24rpx;
		display: flex;
		padding: 40rpx 0;
		border: 1rpx solid #FFEDDF;
	}

	.display-item {
		flex: 1;
		text-align: center;
	}

	.num {
		font-size: 44rpx;
		font-weight: bold;
		color: #FF6B00;
		display: block;
	}

	.num.total {
		color: #333;
	}

	.label {
		font-size: 26rpx;
		color: #666;
		margin-top: 10rpx;
		display: block;
	}

	.display-divider {
		width: 1rpx;
		height: 60rpx;
		background: #FFEDDF;
		align-self: center;
	}

	.explanation-box {
		margin-top: 24rpx;
		background: #FDFCFB;
		padding: 20rpx;
		border-radius: 16rpx;
		border: 1rpx dashed #FFEDDF;
	}

	.exp-item {
		display: flex;
		gap: 10rpx;
		font-size: 22rpx;
		color: #888;
		margin-bottom: 10rpx;
		line-height: 1.5;
	}

	.exp-item:last-child {
		margin-bottom: 0;
	}

	/* 获得方式列表 - 调整为单列更清晰地展示描述 */
	.task-grid {
		margin-top: 20rpx;
	}

	.task-card {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background: #F9F9F9;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		border: 1rpx solid #F0F0F0;
	}

	.task-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background: #fff;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.task-content {
		flex: 1;
	}

	.task-name-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6rpx;
	}

	.task-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.task-points {
		font-size: 24rpx;
		color: #FF6B00;
		font-weight: bold;
	}

	.task-desc {
		font-size: 22rpx;
		color: #999;
	}

	/* 底部记录列表 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.section-header .title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.title-tip {
		font-size: 22rpx;
		color: #BBB;
		margin-left: 16rpx;
		font-weight: normal;
	}

	.view-all {
		font-size: 24rpx;
		color: #999;
		display: flex;
		align-items: center;
	}

	.record-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #F5F5F5;
	}

	.record-item:last-child {
		border-bottom: none;
	}

	.record-title {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 6rpx;
		display: block;
	}

	.record-date {
		font-size: 22rpx;
		color: #bbb;
	}

	.record-right {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.record-right.plus {
		color: #FF6B00;
	}

	.empty-tip {
		text-align: center;
		color: #ccc;
		padding: 60rpx;
		font-size: 24rpx;
	}

	.loading-placeholder {
		padding-top: 30vh;
	}
</style>