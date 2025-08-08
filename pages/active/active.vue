<template>
	<view class="container">
		<!-- 顶部标题和搜索 -->
		<view class="header">
			<view class="search-bar">
				<uni-icons type="search" size="18" color="rgba(255, 255, 255, 0.7)" />
				<input type="text" placeholder="搜索活动" placeholder-class="placeholder" v-model="searchKeyword"
					:placeholder-style="'color: white; opacity: 0.7;'" />
			</view>
		</view>

		<!-- 【新增】轮播图区域 -->
		<view v-if="bannerList.length > 0" class="swiper-section">
			<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000"
				:duration="500">
				<swiper-item v-for="banner in bannerList" :key="banner.id">
					<view class="swiper-item">
						<!-- 轮播图图片 -->
						<image :src="banner.imageUrl" mode="aspectFill" class="swiper-image"></image>
						<!-- 轮播图标题 (如果存在) -->
						<view v-if="banner.title" class="swiper-title">{{ banner.title }}</view>
					</view>
				</swiper-item>
			</swiper>
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
								<!-- 修改这里的绑定 -->
								<picker @change="bindTypePickerChange" :value="typeIndex" :range="typePickerRange">
									<view class="uni-input">{{ typePickerRange[typeIndex] }}</view>
								</picker>
							</view>
						</view>
					</view>

					<!-- 选择状态 -->
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
				:is-login="isLogin" @updateFavoriteStatus="handleFavoriteChange" />
		</view>

		<!-- 根据新的状态变量来显示提示 -->
		<view v-if="!hasMore && activitiesData.length > 0" class="no-more-content">
			暂无更多活动
		</view>

		<!-- 如果希望在列表为空时也显示提示，可以添加一个空状态 -->
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
		onPullDownRefresh,
		onShow
	} from '@dcloudio/uni-app';
	import ActivityCard from '@/components/ActivityCard.vue';
	import request from '../../utils/request.js';

	// --- 核心状态 ---
	const loading = ref(false); // 是否正在加载中
	const hasMore = ref(true); // 是否还有更多数据
	const pageNo = ref(1); // 当前页码
	const pageSize = 10; // 每页加载10条
	const activitiesData = ref([]);
	const isLogin = ref(false);
	const bannerList = ref([]);

	// --- 筛选条件状态 ---
	const searchKeyword = ref('');
	// 活动类型
	const typeList = ref([]); // 从后端获取的类型列表
	const typeIndex = ref(0); // Picker 使用的索引
	const selectedCategory = ref(''); // 发送给后端的类型值
	// 活动状态
	const statusList = ref([]); // 从后端获取的状态列表
	const statusIndex = ref(0); // Picker 使用的索引
	// 位置信息
	const selectedLocationInfo = ref(null);

	// --- 计算属性 (用于 Picker 的显示) ---
	const typePickerRange = computed(() => {
		const labels = typeList.value.map(item => item.label);
		return ['全部类型', ...labels];
	});

	const statusPickerRange = computed(() => {
		const labels = statusList.value.map(item => item.label);
		return ['全部状态', ...labels];
	});

	// --- 生命周期函数 ---

	/**
	 * 【核心修改 3】使用 onShow 刷新所有数据
	 * 每次进入页面时都会触发，确保数据是最新的
	 */
	onShow(() => {
		// 1. 检查登录状态
		const token = uni.getStorageSync('token');
		isLogin.value = !!token;
		console.log('页面显示，当前登录状态:', isLogin.value);

		// 2. 初始化页面数据
		initializePage();
	});

	// 下拉刷新
	onPullDownRefresh(async () => {
		console.log('用户触发了下拉刷新');
		await initializePage(); // 下拉刷新也调用完整初始化流程
		uni.stopPullDownRefresh();
	});

	// 上拉加载更多
	onReachBottom(() => {
		console.log('滑动到底部，触发加载更多');
		if (hasMore.value && !loading.value) {
			getActiveList(true); // 加载更多
		}
	});

	// --- 核心逻辑方法 ---

	/**
	 * 页面初始化函数
	 * - 重置状态
	 * - 并行获取所有筛选条件
	 * - 获取第一页活动列表
	 */
	const initializePage = async () => {
		uni.showLoading({
			title: '加载中...'
		});
		try {
			// 重置列表状态，但不重置筛选条件
			pageNo.value = 1;
			hasMore.value = true;
			activitiesData.value = [];

			// 并行获取类型和状态列表，提高效率
			await Promise.all([
				fetchBanners(), 
				fetchActivityTypeList(),
				fetchActivityStatusList()
			]);

			// 筛选条件加载完毕后，获取第一页的活动列表
			await getActiveList(false);

		} catch (error) {
			console.error("页面初始化失败:", error);
			uni.showToast({
				title: '数据加载失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 获取轮播图数据
	 */
	const fetchBanners = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/banner-rec/list', {
			method: 'GET',
			data: {
				positionCode: '0', // 固定参数
				pageNo: 1,
				pageSize: 50
			}
		});

		if (error) {
			console.error('获取轮播图失败:', error);
			bannerList.value = []; // 即使失败也保证页面能继续加载
			return; // 不抛出错误，避免中断 Promise.all
		}

		if (data && data.list) {
			// 根据 sort 字段排序，确保显示顺序正确
			bannerList.value = data.list.sort((a, b) => a.sort - b.sort);
			console.log('轮播图数据获取成功:', bannerList.value);
		} else {
			bannerList.value = [];
		}
	};

	/**
	 * 获取活动类型列表
	 */
	const fetchActivityTypeList = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/dict-data/type', {
			data: {
				type: "member_activity_category"
			}
		});
		if (error) {
			console.error('获取活动类型列表失败:', error);
			throw new Error('获取类型失败'); // 抛出错误，让 Promise.all 捕获
		}
		// 将获取到的数据赋值给我们定义的 ref
		typeList.value = data || [];
		console.log('动态活动类型列表获取成功:', typeList.value);
	};

	const fetchActivityStatusList = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/activity/status-list');
		if (error) {
			console.error('获取活动状态列表失败:', error);
			throw new Error('获取状态失败');
		}
		statusList.value = data || [];
		console.log('动态活动状态列表获取成功:', statusList.value);
	};

	/**
	 * 获取活动列表的核心方法
	 * @param {boolean} isLoadMore - 是否为加载更多
	 */
	const getActiveList = async (isLoadMore = false) => {
		if (loading.value) return;
		if (isLoadMore && !hasMore.value) return;

		loading.value = true;

		// 如果是刷新，确保页码是1
		if (!isLoadMore) {
			pageNo.value = 1;
		}

		// 处理状态参数
		const selectedStatusItem = statusIndex.value > 0 ? statusList.value[statusIndex.value - 1] : null;

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			name: searchKeyword.value,
			category: selectedCategory.value, // 使用动态选择的类型值
			status: selectedStatusItem ? selectedStatusItem.value : '', // 使用动态选择的状态值
			longitude: selectedLocationInfo.value ? selectedLocationInfo.value.longitude : '',
			latitude: selectedLocationInfo.value ? selectedLocationInfo.value.latitude : ''
		};

		try {
			console.log('发起活动列表请求, 参数:', params);
			const result = await request('/app-api/member/activity/list', {
				method: 'GET',
				data: params
			});

			if (result && !result.error && result.data) {
				const {
					list = [], total = 0
				} = result.data;

				if (isLoadMore) {
					activitiesData.value.push(...list);
				} else {
					activitiesData.value = list;
				}

				// 更新分页状态
				hasMore.value = activitiesData.value.length < total;
				// 成功后页码+1
				pageNo.value++;

			} else {
				console.error('获取活动列表失败:', result ? result.error : '无有效返回');
				hasMore.value = false;
			}
		} catch (error) {
			console.error('请求异常:', error);
			hasMore.value = false;
		} finally {
			loading.value = false;
		}
	};

	// --- 事件处理器 ---

	// 类型选择器改变
	const bindTypePickerChange = (e) => {
		const newIndex = Number(e.detail.value);
		typeIndex.value = newIndex;
		if (newIndex === 0) {
			selectedCategory.value = ''; // "全部类型"
		} else {
			// newIndex-1 对应 typeList 里的索引
			selectedCategory.value = typeList.value[newIndex - 1].value;
		}
	};

	// 状态选择器改变
	const bindStatusPickerChange = (e) => {
		statusIndex.value = e.detail.value;
	};

	// 位置选择
	const openMapToChooseLocation = () => {
		uni.chooseLocation({
			success: (res) => {
				selectedLocationInfo.value = {
					name: res.name,
					address: res.address,
					latitude: res.latitude,
					longitude: res.longitude
				};
			},
			fail: (err) => {
				console.log('选择位置失败:', err);
			}
		});
	};

	// 子组件收藏状态变更
	const handleFavoriteChange = (event) => {
		const activityToUpdate = activitiesData.value.find(activity => activity.id === event.id);
		if (activityToUpdate) {
			activityToUpdate.followFlag = event.newFollowFlag;
		}
	};

	// 发布活动
	const publishActivity = () => {
		if (!isLogin.value) {
			uni.showModal({
				title: '温馨提示',
				content: '登录后才能发布活动，是否立即登录？',
				confirmText: '去登录',
				cancelText: '再看看',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}
				}
			});
			return;
		}
		uni.navigateTo({
			url: '/pages/active-publish/active-publish'
		});
	};

	// --- 监听器 ---

	// 监听所有筛选条件的变化，自动重新搜索
	watch(
		[searchKeyword, selectedCategory, statusIndex, selectedLocationInfo],
		(newValue, oldValue) => {
			console.log('筛选条件变化，重新搜索...');
			// 调用 getActiveList(false) 来刷新列表，而不是追加
			getActiveList(false);
		}, {
			deep: true // deep: true 对监听 selectedLocationInfo 对象变化是必需的
		}
	);
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
			// color: rgba(255, 255, 255, 0.7);
			color: white !important;
		}
	}

	/* 轮播图样式 */
	.swiper-section {
		margin: 20rpx 32rpx;
		border-radius: 16rpx;
		overflow: hidden; // 确保圆角对内部图片生效
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.swiper {
		height: 300rpx; // 您可以根据需要调整高度
	}

	.swiper-item {
		position: relative; // 作为标题定位的父容器
		width: 100%;
		height: 100%;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.swiper-title {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 36rpx;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5); // 增加文字描边，提高可读性
		pointer-events: none; // 让点击事件可以穿透标题
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