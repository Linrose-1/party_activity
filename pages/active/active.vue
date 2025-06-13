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
			<ActivityCard v-for="(activity, index) in filteredActivities" :key="index" :activity="activity" />
		</view>

		<view v-if="filteredActivities.length > 0" class="no-more-content">
			暂无更多活动
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
		computed
	} from 'vue';
	import ActivityCard from '@/components/ActivityCard.vue';

	// 搜索关键词
	const searchKeyword = ref('');

	// 分类筛选
	const activeCategory = ref('全部类型');

	// 获取当前日期
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

	// 响应式数据
	const title = ref('picker');
	const array = ref(['全部类型', '交流会', '沙龙', '峰会', '分享会', '其他']);
	const index = ref(0);
	const date = ref(getDate({
		format: true
	}));

	// 计算属性
	const startDate = computed(() => getDate('start'));
	const endDate = computed(() => getDate('end'));

	// 方法
	const bindPickerChange = (e) => {
		console.log('picker发送选择改变，携带值为', e.detail.value);
		index.value = e.detail.value;
	};

	const bindDateChange = (e) => {
		date.value = e.detail.value;
	};

	const selectedLocationInfo = ref(null); // 用于存储地图选择结果
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
			},
			fail: (err) => {
				console.log('选择位置失败:', err);
				if (err.errMsg.includes('cancel')) {
					// 用户取消了选择
				} else {
					uni.showToast({
						title: '选择位置失败',
						icon: 'none'
					});
				}
			}
		});
	}

	const activitiesData = ref([{
			id: 1,
			title: "互联网创业者交流会",
			image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
			date: "2025-05-28 14:00-16:00",
			location: "上海市浦东新区张江高科技园区",
			participants: {
				current: 32,
				total: 50
			},
			tags: ["交流会", "线下活动"],
			organizer: "张经理"
		},
		{
			id: 2,
			title: "2025金融科技峰会",
			image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
			date: "2025-06-15 09:00-17:00",
			location: "上海国际会议中心",
			participants: {
				current: 180,
				total: 200
			},
			tags: ["峰会", "线下活动"],
			organizer: "李主管"
		},
		{
			id: 3,
			title: "AI技术分享会",
			image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
			date: "2025-06-05 19:00-21:00",
			location: "北京市海淀区中关村创业大街",
			participants: {
				current: 45,
				total: 60
			},
			tags: ["分享会", "线下活动"],
			organizer: "王教授"
		},
		{
			id: 4,
			title: "当代艺术沙龙",
			image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
			date: "2025-06-10 15:00-17:00",
			location: "广州市天河区艺术中心",
			participants: {
				current: 28,
				total: 40
			},
			tags: ["沙龙", "线下活动", "其他"],
			organizer: "陈馆长"
		}

	])

	// 计算过滤后的活动列表
	const filteredActivities = computed(() => {
		let result = [...activitiesData.value];

		// 分类筛选
		if (activeCategory.value !== '全部类型') {
			result = result.filter(activity =>
				activity.tags.includes(activeCategory.value)
			);
		}

		// 搜索筛选
		if (searchKeyword.value) {
			const keyword = searchKeyword.value.toLowerCase();
			result = result.filter(activity =>
				activity.title.toLowerCase().includes(keyword) ||
				activity.location.toLowerCase().includes(keyword)
			);
		}

		return result;
	});

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