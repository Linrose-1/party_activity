<template>
	<view class="records-container">
		<view class="filter-sticky">
			<!-- 类型切换 -->
			<view class="tabs-box">
				<view v-for="(item, index) in tabOptions" :key="index" class="tab-item"
					:class="{ active: queryParams.type === item.value }" @click="handleTabChange(item.value)">
					{{ item.label }}
					<view class="line" v-if="queryParams.type === item.value"></view>
				</view>
			</view>

			<!-- 时间筛选 -->
			<view class="date-filter-bar">
				<uni-datetime-picker v-model="dateRange" type="daterange" @change="handleDateChange">
					<view class="date-picker-trigger">
						<uni-icons type="calendar" size="16" color="#666"></uni-icons>
						<text class="date-text">{{ dateRangeText }}</text>
					</view>
				</uni-datetime-picker>
				<text class="reset-link" v-if="dateRange.length" @click="resetFilter">重置</text>
			</view>
		</view>

		<view class="list-content">
			<view v-if="recordList.length > 0">
				<view class="record-card" v-for="(item, index) in recordList" :key="index">
					<view class="card-top">
						<text class="title">{{ item.title }}</text>
						<text class="amount" :class="{ 'is-plus': item.experience > 0 }">
							{{ item.experience > 0 ? '+' : '' }}{{ item.experience }}
						</text>
					</view>
					<text class="desc">{{ item.description }}</text>
					<view class="card-bottom">
						<text class="time">{{ formatFullTime(item.createTime) }}</text>
						<!-- <text class="biz-tag" v-if="item.typeStr">{{ item.typeStr }}</text> -->
					</view>
				</view>
				<uni-load-more :status="loadingStatus"></uni-load-more>
			</view>
			<view v-else-if="loadingStatus !== 'loading'" class="empty-box">暂无相关记录</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const tabOptions = [{
			label: '全部',
			value: ''
		},
		{
			label: '累计贡分',
			value: '0'
		},
		{
			label: '可用贡分',
			value: '1'
		}
	];

	const recordList = ref([]);
	const loadingStatus = ref('more');
	const dateRange = ref([]);
	const queryParams = ref({
		pageNo: 1,
		pageSize: 15,
		type: '' // 0 累计, 1 当前
	});

	const dateRangeText = computed(() => {
		return dateRange.value.length === 2 ? `${dateRange.value[0]} 至 ${dateRange.value[1]}` : '按时间筛选';
	});

	onMounted(() => loadData(true));
	onPullDownRefresh(() => loadData(true));
	onReachBottom(() => {
		if (loadingStatus.value === 'noMore') return;
		queryParams.value.pageNo++;
		loadData(false);
	});

	const loadData = async (isRefresh = false) => {
		if (isRefresh) {
			queryParams.value.pageNo = 1;
			loadingStatus.value = 'loading';
		}

		const sendData = {
			...queryParams.value
		};
		// 处理日期参数（参考智米页面的经验，先按数组传，待确认格式）
		if (dateRange.value.length === 2) {
			sendData.createTime = [dateRange.value[0] + ' 00:00:00', dateRange.value[1] + ' 23:59:59'];
		}

		const {
			data,
			error
		} = await request('/app-api/member/experience-record/my-experience-list', {
			data: sendData
		});

		uni.stopPullDownRefresh();
		if (error) return;

		recordList.value = isRefresh ? data.list : [...recordList.value, ...data.list];
		loadingStatus.value = recordList.value.length >= data.total ? 'noMore' : 'more';
	};

	const handleTabChange = (val) => {
		queryParams.value.type = val;
		loadData(true);
	};

	const handleDateChange = (val) => {
		dateRange.value = val;
		loadData(true);
	};

	const resetFilter = () => {
		dateRange.value = [];
		loadData(true);
	};

	const formatFullTime = (ts) => {
		const d = new Date(ts);
		return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
	};
</script>

<style scoped>
	.records-container {
		min-height: 100vh;
		background: #F8F9FB;
	}

	.filter-sticky {
		position: sticky;
		top: 0;
		z-index: 10;
		background: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.tabs-box {
		display: flex;
		height: 88rpx;
		border-bottom: 1rpx solid #eee;
	}

	.tab-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #FF6B00;
		font-weight: bold;
	}

	.tab-item.active .line {
		position: absolute;
		bottom: 0;
		width: 40rpx;
		height: 4rpx;
		background: #FF6B00;
	}

	.date-filter-bar {
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.date-picker-trigger {
		background: #F5F5F5;
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		color: #666;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.reset-link {
		font-size: 24rpx;
		color: #FF6B00;
	}

	.list-content {
		padding: 20rpx;
	}

	.record-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12rpx;
	}

	.title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
	}

	.amount {
		font-size: 34rpx;
		font-weight: bold;
	}

	.amount.is-plus {
		color: #FF6B00;
	}

	.desc {
		font-size: 26rpx;
		color: #888;
		margin-bottom: 16rpx;
		display: block;
	}

	.card-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.time {
		font-size: 22rpx;
		color: #bbb;
	}

	.biz-tag {
		font-size: 20rpx;
		background: #FFF5EE;
		color: #FF6B00;
		padding: 4rpx 12rpx;
		border-radius: 4rpx;
	}

	.empty-box {
		text-align: center;
		padding-top: 100rpx;
		color: #999;
	}
</style>