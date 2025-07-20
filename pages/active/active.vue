<template>
	<view class="container">
		<!-- 顶部标题和搜索 -->
		<view class="header">
			<view class="search-bar">
				<uni-icons type="search" size="18" color="rgba(255, 255, 255, 0.7)" />
				<input type="text" placeholder="搜索活动" placeholder-class="placeholder" v-model="searchKeyword" />
			</view>
		</view>

		<!-- 筛选区域 -->
		<uni-collapse>
			<uni-collapse-item title="活动筛选" :open="true" class="collapse-title">
				<view class="filters">
					<!-- 选择类型 -->
					<view class="uni-list">
						<view class="uni-list-cell">
							<view class="uni-list-cell-left register-btn">
								选择类型
							</view>
							<view class="uni-list-cell-db">
								<picker @change="bindPickerChange" :value="index" :range="array">
									<view class="uni-input">{{array[index]}}</view>
								</picker>
							</view>
						</view>
					</view>

					<!-- 【新增】选择状态 -->
					<view class="uni-list">
						<view class="uni-list-cell">
							<view class="uni-list-cell-left register-btn">
								选择状态
							</view>
							<view class="uni-list-cell-db">
								<!-- 绑定到新的动态数据 statusPickerRange -->
								<picker @change="bindStatusPickerChange" :value="statusIndex"
									:range="statusPickerRange">
									<view class="uni-input">{{ statusPickerRange[statusIndex] }}</view>
								</picker>
							</view>
						</view>
					</view>

					<!-- 选择日期 -->
					<view class="uni-list">
						<view class="uni-list-cell">
							<view class="uni-list-cell-left register-btn">
								选择日期
							</view>
							<view class="uni-list-cell-db">
								<picker mode="date" :value="date" :start="startDate" :end="endDate"
									@change="bindDateChange">
									<view class="uni-input">{{date}}</view>
								</picker>
							</view>
						</view>
					</view>

					<!-- 选择位置 -->
					<view class="uni-list">
						<view class="uni-list-cell">
							<view class="uni-list-cell-left register-btn">
								选择位置
							</view>
							<view class="uni-list-cell-db">
								<view @click="openMapToChooseLocation" class="uni-input">
									<!-- 显示选择结果 -->
									<text
										v-if="selectedLocationInfo">{{ selectedLocationInfo.address || selectedLocationInfo.name }}</text>
									<text v-else class="placeholder">点击选择位置</text>
									<text class="arrow">></text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</uni-collapse-item>
		</uni-collapse>

		<!-- 活动列表 -->
		<view class="activity-list" scroll-y="true">
			<ActivityCard v-for="(activity, index) in activitiesData" :key="activity.id" :activity="activity"
			    @updateFavoriteStatus="handleFavoriteChange" />
		</view>

		<!-- 【修改后】根据新的状态变量来显示提示 -->
		<view v-if="!hasMore && activitiesData.length > 0" class="no-more-content">
			暂无更多活动
		</view>

		<!-- 【可选新增】如果希望在列表为空时也显示提示，可以添加一个空状态 -->
		<view v-if="!loading && activitiesData.length === 0" class="no-more-content">
			暂无活动，快去发布一个吧！
		</view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<view class="action-btn register-btn" @click="publishActivity">
				<uni-icons type="plus" size="18" color="white" />
				<text>发布活动</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import ActivityCard from '@/components/ActivityCard.vue';
	import request from '../../utils/request.js';

	const loading = ref(false); // 是否正在加载中
	const hasMore = ref(true); // 是否还有更多数据
	const pageNo = ref(1); // 当前页码
	const pageSize = 10; // 每页加载10条

	const activitiesData = ref([]);

	// 页面挂载时，首先获取一次活动列表
	onMounted(() => {
		fetchActivityStatusList(); // 先获取筛选条件
		getActiveList();
	});

	// 滑动到底部时触发，用于分页加载
	onReachBottom(() => {
		console.log('滑动到底部，触发加载更多');
		if (hasMore.value && !loading.value) {
			getActiveList(true); // 调用 getActiveList 并传入 true 表示是加载更多
		}
	});
	
	onPullDownRefresh(() => {
			console.log('用户触发了下拉刷新');
			// 刷新操作，应该传入 false
			getActiveList(false);
		});


	const getDate = (type) => {
		const date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();

		if (type === 'start') {
			year = year - 10;
		} else if (type === 'end') {
			year = year + 10;
		}

		month = month > 9 ? month : '0' + month;
		day = day > 9 ? day : '0' + day;
		return `${year}-${month}-${day}`;
	};

	// --- 筛选条件 ---
	const searchKeyword = ref('');
	const array = ref(['全部类型', '交流会', '沙龙', '峰会', '分享会', '创业猎伙', '其他']);
	const index = ref(0);
	const activeCategory = ref('全部类型');
	const date = ref(getDate({
		format: true
	}));
	const statusList = ref([]); // 用于存储从接口获取的原始状态列表 [{label, value}, ...]
	const statusIndex = ref(0); // 依然用于 Picker 的 value
	const selectedStatus = ref('全部状态');
	const selectedLocationInfo = ref(null);

	const statusPickerRange = computed(() => {
		// 从原始列表提取 label，并在最前面添加 "全部状态"
		const labels = statusList.value.map(item => item.label);
		return ['全部状态', ...labels];
	});

	const fetchActivityStatusList = async () => {
		// 使用您提供的 request 工具和接口文档信息
		const {
			data,
			error
		} = await request('/app-api/member/activity/status-list');

		if (error) {
			console.error('获取活动状态列表失败:', error);
			uni.showToast({
				title: '获取状态失败',
				icon: 'none'
			});
			return;
		}

		// 将获取到的数据赋值给我们定义的 ref
		statusList.value = data;
		console.log('动态活动状态列表获取成功:', statusList.value);
	};

	// 计算属性
	const startDate = computed(() => getDate('start'));
	const endDate = computed(() => getDate('end'));


	// --- 方法 ---

	// 类型选择器改变
	const bindPickerChange = (e) => {
		index.value = e.detail.value;
		activeCategory.value = array.value[e.detail.value];
		// 【修改】筛选条件变化后，不再手动调用，交由 watch 处理
	};

	// 日期选择器改变 (注意：日期筛选暂未加入 getActiveList 的 params，如需使用请参照其他筛选条件添加)
	const bindDateChange = (e) => {
		date.value = e.detail.value;
	};

	// 状态选择器改变
	const bindStatusPickerChange = (e) => {
		statusIndex.value = e.detail.value;
	};

	// 位置选择
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				console.log('选择位置成功:', res);
				selectedLocationInfo.value = {
					name: res.name,
					address: res.address,
					latitude: res.latitude,
					longitude: res.longitude
				};
				// 【修改】筛选条件变化后，不再手动调用，交由 watch 处理
			},
			fail: (err) => {
				console.log('选择位置失败:', err);
			}
		});
	}

	/**
	 * 【核心修改】重构 getActiveList 方法
	 * @param {boolean} isLoadMore - 是否为加载更多操作。true: 追加数据; false: 刷新列表
	 */
	const getActiveList = async (isLoadMore = false) => {
		// 如果正在加载中，则直接返回，防止重复请求
		if (loading.value) {
			return;
		}
		// 如果是加载更多，但已经没有更多数据了，也直接返回
		if (isLoadMore && !hasMore.value) {
			return;
		}

		loading.value = true;

		// 如果不是加载更多（即是刷新或新搜索），则重置分页和数据
		if (!isLoadMore) {
			pageNo.value = 1;
			activitiesData.value = [];
			hasMore.value = true;
		}

		// 状态中文到数字的映射，后端通常使用数字
		let statusValue = ''; // 默认为空，查询全部
		if (statusIndex.value > 0) {
			// 如果选择的不是 "全部状态"
			// statusIndex.value - 1 是因为我们的 Picker Range 比原始数据多了一个 "全部状态"
			const selectedItem = statusList.value[statusIndex.value - 1];
			if (selectedItem) {
				statusValue = selectedItem.value; // 获取对应的数字 value
			}
		}

		// 构造请求参数
		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			name: searchKeyword.value, // 搜索框内容
			category: activeCategory.value === '全部类型' ? '' : activeCategory.value, // 活动类型
			status: statusValue, // 活动状态
			longitude: selectedLocationInfo.value ? selectedLocationInfo.value.longitude : '', // 经度
			latitude: selectedLocationInfo.value ? selectedLocationInfo.value.latitude : '' // 纬度
		};

		try {
			console.log('发起活动列表请求, 参数:', params);
			// 调用封装的请求方法
			const result = await request('/app-api/member/activity/list', {
				method: 'GET',
				data: params
			});

			// 【关键修改】修正成功条件的判断逻辑
			if (result && !result.error && result.data) {
				// 从 result.data 中解构出列表数据，并提供一个空数组作为默认值
				const list = result.data.list || [];

				if (isLoadMore) {
					// 加载更多：追加数据
					activitiesData.value = [...activitiesData.value, ...list];
				} else {
					// 刷新/搜索：直接替换数据
					activitiesData.value = list;
				}

				// 判断是否还有更多数据
				// 后端返回的 total 是总条数，我们可以用当前已加载的数量和总数比较
				// result.data.total 是后端返回的总条目数
				if (activitiesData.value.length >= result.data.total) {
					hasMore.value = false;
				} else {
					hasMore.value = true;
				}

				// 如果成功获取到数据，页码 +1，为下一次加载做准备
				pageNo.value++;

				console.log('活动列表获取成功:', activitiesData.value);
			} else {
				// 请求失败或 code 不为 0
				console.error('获取活动列表失败:', result);
				hasMore.value = false; // 出错时也认为没有更多数据了
			}
		} catch (error) {
			console.error('请求异常:', error);
			hasMore.value = false; // 异常时也认为没有更多数据了
		} finally {
			loading.value = false; // 结束加载状态
			uni.stopPullDownRefresh(); 
		}
	};
	
	// 在 活动列表页 的 <script setup> 中
	
	const handleFavoriteChange = (event) => {
	  // event 就是子组件emit过来的对象, e.g., { id: ..., newFollowFlag: ... }
	  
	  // 1. 在当前的活动列表数据(activitiesData)中找到需要更新的那一项
	  const activityToUpdate = activitiesData.value.find(activity => activity.id === event.id);
	
	  // 2. 如果找到了，就直接修改它的 followFlag 属性
	  if (activityToUpdate) {
	    activityToUpdate.followFlag = event.newFollowFlag;
	    console.log(`已更新活动ID ${event.id} 的收藏状态为: ${event.newFollowFlag}`);
	  }
	};

	// 当任何一个筛选条件改变时，都触发一次新的搜索（不是加载更多）
	watch(
			[searchKeyword, activeCategory, statusIndex, selectedLocationInfo],
			() => {
				console.log('筛选条件变化，重新搜索...');
				getActiveList(false);
			}, { deep: true }
		);


	// 发布活动
	const publishActivity = () => {
		uni.navigateTo({
			url: '/pages/active-publish/active-publish'
		})
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f8f9fa;
		padding-bottom: 120rpx;
		min-height: 100vh;
	}

	/* 顶部导航 */
	.header {
		position: sticky;
		top: 0;
		background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
		color: white;
		padding: 30rpx 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-bottom: 30rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: 600;
	}

	.search-bar {
		display: flex;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 40rpx;
		padding: 10rpx 30rpx;
		align-items: center;

		input {
			flex: 1;
			border: none;
			background: transparent;
			color: white;
			font-size: 28rpx;
			margin-left: 16rpx;
			height: 50rpx;
		}

		.placeholder {
			color: rgba(255, 255, 255, 0.7);
		}
	}

	/* 筛选区域 */
	.collapse-title {
		color: #FF6B00;
	}

	.filters {
		padding: 24rpx 32rpx;
		background: white;
		border-bottom: 2rpx solid #eee;
	}

	.uni-list {
		margin: 15rpx auto;

		.uni-list-cell {
			display: flex;
		}

		.uni-list-cell-left {
			padding: 10rpx;
			border-radius: 10rpx;
		}

		.uni-list-cell-db {
			margin-left: 10rpx;
			padding: 10rpx;
			background-color: #FFF0E5;
			min-width: 500rpx;

			.uni-input {
				margin-left: 10rpx;
			}
		}
	}


	/* 活动列表 */
	.activity-list {
		padding: 0 32rpx;
	}

	/* 暂无更多内容提示 */
	.no-more-content {
		text-align: center;
		color: #999;
		padding: 30rpx 0;
		font-size: 28rpx;
		margin-top: 20rpx;
	}

	/* 底部操作栏 */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		display: flex;
		padding: 20rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 18rpx;
		border-radius: 16rpx;
		font-weight: 500;
		font-size: 32rpx;

		text {
			margin-left: 12rpx;
		}
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
	}
</style>