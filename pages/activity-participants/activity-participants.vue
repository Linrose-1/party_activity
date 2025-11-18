<template>
	<view class="page-container">
		<view class="participant-list">
			<view v-for="item in participantList" :key="item.id" class="participant-item"
				@click="viewParticipantCard(item)">
				<image :src="item.memberUser.avatar" class="avatar" mode="aspectFill"></image>
				<view class="info">
					<text class="name">{{ item.memberUser.nickname || '匿名用户' }}</text>
				</view>
				<text class="time">{{ formatJoinTime(item.createTime) }}</text>
			</view>
		</view>

		<!-- 加载状态提示 -->
		<uni-load-more :status="loadingStatus"></uni-load-more>

		<!-- 空状态 -->
		<view v-if="isEmpty" class="empty-state">
			<uni-icons type="staff-filled" size="60" color="#ccc"></uni-icons>
			<text>暂无报名记录</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	const activityId = ref(null);
	const participantList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(15);
	const total = ref(0);
	const loadingStatus = ref('more');
	const isEmpty = ref(false);
	const isOrganizer = ref(false);

	onLoad((options) => {
		if (options.id) {
			activityId.value = options.id;
			uni.setNavigationBarTitle({
				title: '报名用户'
			});
			getParticipantList(true);
		}

		// ==================== 接收并设置组织者状态 ====================
		if (options.isOrganizer && options.isOrganizer === '1') {
			isOrganizer.value = true;
			console.log('✅ [报名列表页] 当前用户是组织者，可以免费查看所有报名者名片。');
		}
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') {
			getParticipantList();
		}
	});

	const getParticipantList = async (isFirstLoad = false) => {
		if (loadingStatus.value === 'loading') return;
		loadingStatus.value = 'loading';

		if (isFirstLoad) {
			pageNo.value = 1;
			participantList.value = [];
			isEmpty.value = false;
		}

		const {
			data,
			error
		} = await request('/app-api/member/activity-join/list', {
			method: 'GET',
			data: {
				activityId: activityId.value,
				pageNo: pageNo.value,
				pageSize: pageSize.value
			}
		});

		if (error) {
			console.error('获取报名用户列表失败:', error);
			loadingStatus.value = 'more';
			return;
		}

		if (data && data.list) {
			participantList.value = [...participantList.value, ...data.list];
			total.value = data.total;

			if (participantList.value.length >= total.value) {
				loadingStatus.value = 'noMore';
			} else {
				loadingStatus.value = 'more';
				pageNo.value++;
			}

			if (isFirstLoad && data.list.length === 0) {
				isEmpty.value = true;
			}
		} else {
			loadingStatus.value = 'noMore';
			if (isFirstLoad) {
				isEmpty.value = true;
			}
		}
	};

	const formatJoinTime = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const M = date.getMonth() + 1;
		const D = date.getDate();
		return `${M}月${D}日`;
	};

	// ==================== 导航到名片页的函数 ====================
	/**
	 * 查看报名用户的名片
	 * @param {object} participantItem - 包含 memberUser 信息的列表项
	 */
	const viewParticipantCard = (participantItem) => {
		const user = participantItem.memberUser;
		if (!user || !user.id) {
			uni.showToast({
				title: '无法获取用户信息',
				icon: 'none'
			});
			return;
		}

		const name = user.nickname || '匿名用户';
		const avatar = user.avatar || ''; // 目标页面会处理默认头像

		let url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatar)}`;

		// 如果当前用户是组织者，则添加免费查看参数
		if (isOrganizer.value) {
			url += '&fromShare=1';
		}

		uni.navigateTo({
			url: url
		});
	};
</script>

<style lang="scss" scoped>
	.page-container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.participant-list {
		background-color: #fff;
	}

	.participant-item {
		display: flex;
		align-items: center;
		padding: 24rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		/* 为点击增加一个过渡效果 */
		transition: background-color 0.2s;

		&:last-child {
			border-bottom: none;
		}

		/* 增加点击态的样式 */
		&:active {
			background-color: #f9f9f9;
		}
	}

	.avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}

	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.name {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.time {
		font-size: 26rpx;
		color: #999;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		color: #999;
		font-size: 28rpx;

		text {
			margin-top: 20rpx;
		}
	}
</style>