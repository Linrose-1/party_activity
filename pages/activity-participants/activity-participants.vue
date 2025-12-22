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
	const pageSize = ref(10);
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
		// 1. 加载中或没有更多数据时，直接返回
		if (loadingStatus.value === 'loading' || loadingStatus.value === 'noMore') return;

		loadingStatus.value = 'loading';

		if (isFirstLoad) {
			pageNo.value = 1;
			participantList.value = [];
			isEmpty.value = false;
			// 重置状态，防止之前是 noMore 导致进不来，但在 isFirstLoad 时我们要强制刷新
			loadingStatus.value = 'loading';
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
			loadingStatus.value = 'more';
			return;
		}

		if (data && data.list) {
			// 追加数据
			participantList.value = [...participantList.value, ...data.list];
			total.value = data.total;

			// 关键判断：
			// 1. 如果当前列表长度 >= 总数
			// 2. 或者 当前接口返回的数据条数 < pageSize (说明是最后一页不满的情况)
			if (participantList.value.length >= total.value || data.list.length < pageSize.value) {
				loadingStatus.value = 'noMore';
			} else {
				loadingStatus.value = 'more';
				pageNo.value++; // 准备下一页
			}

			if (isFirstLoad && data.list.length === 0) {
				isEmpty.value = true;
			}
		} else {
			// 接口数据异常处理
			loadingStatus.value = 'noMore';
			if (isFirstLoad) isEmpty.value = true;
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

		let url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
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
		padding-bottom: 40rpx;
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