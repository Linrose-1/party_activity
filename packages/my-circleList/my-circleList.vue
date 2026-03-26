<template>
	<view class="page-container">
		<view class="sticky-header-circle">
			<view class="search-wrapper">
				<uni-easyinput prefixIcon="search" v-model="circleSearchKey" placeholder="搜索圈友姓名"
					@confirm="handleCircleSearch" @clear="handleCircleSearch"></uni-easyinput>
			</view>
			<view class="circle-sub-tabs">
				<view class="sub-tab-item" :class="{ active: circleAddInitiator === 0 }" @click="switchCircleFilter(0)">
					我圈的人</view>
				<view class="sub-tab-item" :class="{ active: circleAddInitiator === 1 }" @click="switchCircleFilter(1)">
					圈我的人</view>
			</view>
		</view>

		<view class="new-apply-entry" @click="openApplyPopup">
			<view class="entry-left">
				<view class="icon-box"><uni-icons type="personadd-filled" size="24" color="#fff"></uni-icons></view>
				<text class="entry-title">新的圈友</text>
			</view>
			<view class="entry-right">
				<view v-if="newApplyCount > 0" class="badge">{{ newApplyCount }}</view>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>
		</view>

		<view class="friend-list">
			<view class="friend-card" v-for="friend in circleFriendList" :key="friend.id"
				@click="navigateToBusinessCard(friend)">
				<image class="friend-avatar" :src="friend.avatar || '/static/images/default-avatar.png'"
					mode="aspectFill" @click.stop="handleAvatarClick(friend)">
				</image>
				<view class="friend-info">
					<view class="info-header">
						<text class="friend-name">{{ friend.realName || friend.nickname || '匿名用户' }}</text>
						<!-- 1. 关系标签：保持与商友页面一致 -->
						<view class="relation-tags"
							v-if="friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1">
							<text v-if="friend.friendParentFlag === 1" class="tag fellow-circle">同圈</text>
							<text v-if="friend.fellowTownspeopleCityFlag === 1" class="tag fellow-townsman">同乡</text>
							<text v-if="friend.peerFlag === 1" class="tag peer">同行</text>
							<text v-if="friend.classmateFlag === 1" class="tag classmate">同学</text>
						</view>
					</view>

					<!-- 3. 公司职位精简显示：取[0]位数据 -->
					<view class="friend-company">
						<uni-icons type="briefcase-filled" size="14" color="#888"></uni-icons>
						<text>{{ formatCompanyInfo(friend) }}</text>
					</view>

					<!-- 2. 新增：邀请/成为圈友时间 -->
					<view class="invite-time-row" v-if="friend.followTime || friend.createTime">
						<text>成为圈友于 {{ formatTimestamp(friend.followTime || friend.createTime) }}</text>
					</view>
				</view>

				<view class="action-area" @click.stop="confirmDeleteFriend(friend)">
					<view class="status-box">
						<uni-icons type="checkbox-filled" size="18" color="#4cd964"></uni-icons>
						<text class="friend-status">已圈</text>
					</view>
					<text class="del-txt">解除</text>
				</view>
			</view>
		</view>
		<uni-load-more :status="circleLoadStatus" v-if="circleFriendList.length > 0"></uni-load-more>

		<AvatarLongPressMenu ref="avatarMenuRef" />


		<CircleApplyPopup ref="applyPopupRef" @refresh="handleAuditSuccess" />
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js'; // 引入登录守卫
	import CircleApplyPopup from '@/components/CircleApplyPopup.vue';
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';

	// --- 状态变量 ---
	const circleFriendList = ref([]);
	const circlePageNo = ref(1);
	const circleLoadStatus = ref('more');
	const circleSearchKey = ref('');
	const circleAddInitiator = ref(0);
	const newApplyList = ref([]);
	const newApplyCount = ref(0);
	const avatarMenuRef = ref(null);
	const applyPopupRef = ref(null);

	// --- 数据获取 ---
	const fetchCircleList = async (isRefresh = false) => {
		if (circleLoadStatus.value === 'loading') return;
		if (isRefresh) circlePageNo.value = 1;
		circleLoadStatus.value = 'loading';

		const params = {
			pageNo: circlePageNo.value,
			pageSize: 10,
			status: 1,
			addInitiator: circleAddInitiator.value
		};
		if (circleSearchKey.value.trim()) params.searchKey = circleSearchKey.value.trim();

		const {
			data
		} = await request('/app-api/member/user/friend/list', {
			method: 'GET',
			data: params
		});
		if (data) {
			circleFriendList.value = isRefresh ? data.list : [...circleFriendList.value, ...data.list];
			circleLoadStatus.value = circleFriendList.value.length >= data.total ? 'noMore' : 'more';
			circlePageNo.value++;
		}
		uni.stopPullDownRefresh();
	};

	// 获取待处理列表
	const getNewApplyList = async () => {
		const {
			data
		} = await request('/app-api/member/user/friend/list', {
			method: 'GET',
			data: {
				pageNo: 1,
				pageSize: 10,
				status: 0
			}
		});
		if (data) {
			newApplyList.value = data.list;
			newApplyCount.value = data.total;
		}
	};

	// --- 辅助处理函数 ---

	/**
	 * 格式化公司和职位信息
	 * 逻辑：companyName 和 positionTitle 分别按逗号/中文逗号分割，取第一个元素拼接
	 */
	const formatCompanyInfo = (item) => {
		const companyRaw = item.companyName || '';
		const positionRaw = item.positionTitle || '';

		// 兼容中文逗号和英文逗号，同时兼容“丨”
		const companies = companyRaw.split(/[,，丨]/);
		const positions = positionRaw.split(/[,，丨]/);

		const company = companies[0]?.trim() || '';
		const position = positions[0]?.trim() || '';

		if (company && position) return `${company} · ${position}`;
		return company || position || '暂无公司信息';
	};

	/**
	 * 格式化时间戳
	 */
	const formatTimestamp = (ts) => {
		if (!ts) return '';
		const d = new Date(Number(ts));
		return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
	};

	// --- 事件监听 ---
	const openApplyPopup = () => applyPopupRef.value.open(newApplyList.value);
	const handleAuditSuccess = () => {
		getNewApplyList();
		fetchCircleList(true);
	};
	const switchCircleFilter = (type) => {
		circleAddInitiator.value = type;
		fetchCircleList(true);
	};
	const handleCircleSearch = () => fetchCircleList(true);

	const confirmDeleteFriend = (friend) => {
		uni.showModal({
			title: '提示',
			content: `确定要与 ${friend.realName || friend.nickname} 解除互圈吗？`,
			confirmColor: '#ff4d4f',
			success: async (res) => {
				if (res.confirm) deleteFriend(friend);
			}
		});
	};

	const deleteFriend = async (friend) => {
		await request(`/app-api/member/user/friend/del`, {
			method: 'POST',
			data: {
				id: friend.fid
			}
		});
		fetchCircleList(true);
	};

	const navigateToBusinessCard = (user) => uni.navigateTo({
		url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname || user.realName)}&avatar=${encodeURIComponent(user.avatar || '')}&fromShare=1`
	});

	/**
	 * 【核心优化】处理头像点击
	 */
	const handleAvatarClick = async (friend) => {
		// 1. 权限拦截
		if (!await checkLoginGuard()) return;

		// 2. 构造基础数据传给弹窗
		const userParams = {
			id: friend.id,
			name: friend.realName || friend.nickname || '圈友',
			avatar: friend.avatar || '',
			isEnterpriseSource: false
		};

		// 3. 打开弹窗 (组件内部会自动请求信用分、会员等级等数据)
		avatarMenuRef.value.open(userParams);
	};

	onMounted(() => {
		fetchCircleList(true);
		getNewApplyList();
	});
	onPullDownRefresh(() => {
		fetchCircleList(true);
		getNewApplyList();
	});
	onReachBottom(() => fetchCircleList());
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #f7f8fa;
	}

	.sticky-header-circle {
		position: sticky;
		top: 0;
		z-index: 10;
		background: #fff;
		border-bottom: 1rpx solid #eee;
	}

	.search-wrapper {
		padding: 20rpx;
	}

	.circle-sub-tabs {
		display: flex;
		border-top: 1rpx solid #f5f5f5;
	}

	.sub-tab-item {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		font-size: 26rpx;
		color: #666;

		&.active {
			color: #FF6B00;
			font-weight: bold;
			position: relative;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background: #FF6B00;
			}
		}
	}

	.new-apply-entry {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #fff;
		padding: 24rpx 30rpx;
		margin: 20rpx;
		border-radius: 16rpx;
	}

	.entry-left {
		display: flex;
		align-items: center;
	}

	.icon-box {
		width: 80rpx;
		height: 80rpx;
		background: #FF6B00;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.entry-title {
		font-size: 30rpx;
		font-weight: bold;
	}

	.badge {
		background: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
		margin-right: 10rpx;
	}

	.friend-list {
		padding: 0 20rpx;
	}

	.friend-card {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.friend-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.friend-info {
		flex: 1;
		min-width: 0;
	}

	.info-header {
		display: flex;
		align-items: center;
		margin-bottom: 6rpx;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.friend-name {
		font-size: 30rpx;
		font-weight: bold;
	}

	.relation-tags {
		display: flex;
		gap: 8rpx;
	}

	.tag {
		font-size: 18rpx;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;

		&.fellow-circle {
			background: #f3e5f5;
			color: #9c27b0;
		}

		&.fellow-townsman {
			background: #e8f5e9;
			color: #388e3c;
		}

		&.peer {
			background: #e3f2fd;
			color: #1976d2;
		}

		&.classmate {
			background: #fff3e0;
			color: #ef6c00;
		}
	}

	.friend-company {
		font-size: 24rpx;
		color: #666;
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 6rpx;
	}

	.invite-time-row {
		margin-top: 12rpx;
		font-size: 20rpx;
		color: #bbb;
	}

	.action-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-left: 20rpx;
	}

	.status-box {
		display: flex;
		align-items: center;
		margin-bottom: 4rpx;
	}

	.friend-status {
		font-size: 20rpx;
		color: #4cd964;
		margin-left: 4rpx;
	}

	.del-txt {
		font-size: 18rpx;
		color: #999;
		text-decoration: underline;
	}
</style>