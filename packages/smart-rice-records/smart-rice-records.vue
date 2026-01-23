<template>
	<view class="records-container">
		<!-- 顶部筛选区域 (吸顶) -->
		<view class="filter-sticky">
			<!-- 1. 类型切换 (Tabs) -->
			<view class="tabs-box">
				<view v-for="(item, index) in tabOptions" :key="index" class="tab-item"
					:class="{ active: currentTab === item.value }" @click="handleTabChange(item.value)">
					{{ item.label }}
					<view class="line" v-if="currentTab === item.value"></view>
				</view>
			</view>

			<!-- 2. 时间范围筛选 -->
			<view class="date-filter-bar">
				<uni-datetime-picker v-model="range" type="daterange" @change="handleDateChange" :clear-icon="true">
					<view class="date-picker-trigger">
						<uni-icons type="calendar" size="18" color="#666"></uni-icons>
						<text class="date-text">{{ dateRangeText }}</text>
						<uni-icons type="bottom" size="14" color="#999"></uni-icons>
					</view>
				</uni-datetime-picker>

				<view class="reset-btn" v-if="range.length > 0" @click="resetDate">重置</view>
			</view>
		</view>

		<!-- 列表区域 (增加顶部间距避免被遮挡) -->
		<view class="list-content">
			<view v-if="recordList.length > 0">
				<view class="record-card" v-for="item in recordList" :key="item.id">
					<view class="card-main">
						<view class="info">
							<text class="title">{{ item.title }}</text>
							<text class="desc">{{ item.description }}</text>
							<text class="time">{{ formatFullTime(item.createTime) }}</text>
						</view>
						<view class="amount" :class="{ 'is-plus': item.point > 0 }">
							{{ item.point > 0 ? '+' : '' }}{{ item.point }}
						</view>
					</view>
				</view>
				<uni-load-more :status="loadingStatus"></uni-load-more>
			</view>

			<!-- 空状态 -->
			<view v-else-if="loadingStatus !== 'loading'" class="empty-box">
				<image src="/static/empty-data.png" mode="aspectFit" class="empty-img"></image>
				<text>暂无相关记录</text>
			</view>
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

	// --- 筛选状态 ---
	const tabOptions = [{
			label: '全部',
			value: 'all'
		},
		{
			label: '收入',
			value: 'true'
		}, // addStatus: true
		{
			label: '支出',
			value: 'false'
		} // addStatus: false
	];
	const currentTab = ref('all');
	const range = ref([]); // 选中的日期范围 [开始日期, 结束日期]

	// --- 列表状态 ---
	const recordList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(15);
	const loadingStatus = ref('more');

	// 计算显示的日期文字
	const dateRangeText = computed(() => {
		if (range.value && range.value.length === 2) {
			return `${range.value[0]} 至 ${range.value[1]}`;
		}
		return '选择时间范围';
	});

	onMounted(() => {
		loadData(true);
	});

	// 加载数据逻辑
	const loadData = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'loading';
		}

		// 组装请求参数
		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize.value
		};

		// 筛选1：积分增减状态
		if (currentTab.value !== 'all') {
			params.addStatus = currentTab.value === 'true';
		}

		// 筛选2：时间范围 —— 修改这里以匹配后端要求的 [0] [1] 格式
		if (range.value && range.value.length === 2) {
			// 使用中括号字符串作为键名，强制生成后端需要的 createTime[0] 和 createTime[1]
			params['createTime[0]'] = range.value[0] + ' 00:00:00';
			params['createTime[1]'] = range.value[1] + ' 23:59:59';
		}

		const {
			data,
			error
		} = await request('/app-api/member/point/record/my-point-list', {
			data: params
		});

		if (error) {
			loadingStatus.value = 'more';
			return;
		}

		const list = data.list || [];
		recordList.value = isRefresh ? list : [...recordList.value, ...list];
		loadingStatus.value = recordList.value.length >= data.total ? 'noMore' : 'more';
	};

	// --- 事件处理 ---

	// 切换 Tab
	const handleTabChange = (val) => {
		currentTab.value = val;
		loadData(true);
	};

	// 日期改变
	const handleDateChange = (val) => {
		range.value = val;
		loadData(true);
	};

	// 重置日期
	const resetDate = () => {
		range.value = [];
		loadData(true);
	};

	// 下拉刷新
	onPullDownRefresh(async () => {
		await loadData(true);
		uni.stopPullDownRefresh();
	});

	// 上拉加载
	onReachBottom(() => {
		if (loadingStatus.value === 'noMore' || loadingStatus.value === 'loading') return;
		pageNo.value++;
		loadData(false);
	});

	// 时间格式化
	const formatFullTime = (timestamp) => {
		const date = new Date(timestamp);
		return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
	};
</script>

<style scoped>
	.records-container {
		min-height: 100vh;
		background-color: #F8F9FB;
	}

	/* 筛选区域吸顶 */
	.filter-sticky {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: #fff;
		padding-bottom: 10rpx;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	/* Tabs 样式 */
	.tabs-box {
		display: flex;
		height: 90rpx;
		border-bottom: 1rpx solid #eee;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #FF6F00;
		font-weight: bold;
	}

	.tab-item .line {
		position: absolute;
		bottom: 0;
		width: 40rpx;
		height: 6rpx;
		background-color: #FF6F00;
		border-radius: 3rpx;
	}

	/* 日期筛选条样式 */
	.date-filter-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
	}

	.date-picker-trigger {
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		color: #666;
	}

	.date-text {
		margin: 0 10rpx;
	}

	.reset-btn {
		margin-left: 20rpx;
		font-size: 24rpx;
		color: #FF6F00;
	}

	/* 列表样式 */
	.list-content {
		padding: 20rpx;
	}

	.record-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.card-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 6rpx;
	}

	.desc {
		font-size: 24rpx;
		color: #888;
		margin-bottom: 10rpx;
	}

	.time {
		font-size: 22rpx;
		color: #bbb;
	}

	.amount {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.amount.is-plus {
		color: #FF6F00;
	}

	/* 空状态 */
	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;
		color: #999;
		font-size: 26rpx;
	}

	.empty-img {
		width: 240rpx;
		height: 240rpx;
		margin-bottom: 20rpx;
	}
</style>