<template>
	<view class="trace-page">
		<view class="list-container">
			<view class="trace-item" v-for="item in list" :key="item.id" @click="goCard(item.memberUser)">
				<image :src="item.memberUser.avatar" class="u-avatar" mode="aspectFill"></image>
				<view class="u-info">
					<view class="u-top">
						<text class="u-name">{{ item.memberUser.nickname }}</text>
						<text class="u-time">{{ formatTime(item.createTime) }}</text>
					</view>
					<view class="u-desc text-ellipsis">
						已查看 {{ item.viewCount }} 次
					</view>
				</view>
				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>
		</view>

		<uni-load-more :status="loadingStatus"></uni-load-more>
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
	import request from '@/utils/request.js';

	const postId = ref(null);
	const list = ref([]);
	const pageNo = ref(1);
	const loadingStatus = ref('more');

	onLoad((options) => {
		postId.value = options.id;
		loadData(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') loadData();
	});

	const loadData = async (isRefresh = false) => {
		if (isRefresh) pageNo.value = 1;
		loadingStatus.value = 'loading';

		const {
			data
		} = await request('/app-api/member/business-opportunities-view/page', {
			method: 'GET',
			data: {
				businessOpportunitiesId: postId.value,
				pageNo: pageNo.value,
				pageSize: 20
			}
		});

		if (data) {
			const newList = data.list || [];
			list.value = isRefresh ? newList : [...list.value, ...newList];
			loadingStatus.value = list.value.length >= data.total ? 'noMore' : 'more';
			pageNo.value++;
		}
	};

	const goCard = (user) => {
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`
		});
	};

	const formatTime = (ts) => {
		const date = new Date(ts);
		return `${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
	};
</script>

<style scoped>
	.trace-page {
		background: #f8f9fa;
		min-height: 100vh;
		padding: 20rpx;
	}

	.trace-item {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.u-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 24rpx;
	}

	.u-info {
		flex: 1;
		min-width: 0;
	}

	.u-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.u-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.u-time {
		font-size: 24rpx;
		color: #bbb;
	}

	.u-desc {
		font-size: 26rpx;
		color: #999;
	}

	.text-ellipsis {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>