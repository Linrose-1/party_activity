<template>
	<view class="nearby-container">
		<view class="header">
			<view class="tabs-wrapper">
				<uni-segmented-control :current="currentTab" :values="tabItems" style-type="button"
					active-color="#FF6B00" @clickItem="handleTabClick" />
			</view>
		</view>

		<!-- 2. 主内容区域 -->
		<view class="content-area">
			<!-- 摇一摇界面 (初始状态) -->
			<view v-if="!shaken" class="shake-container">
				<view class="shake-btn" @click="triggerShakeSequence">
					<uni-icons type="hand-up" size="60" color="#FFFFFF" class="shake-icon" />
					<text>摇一摇</text>
				</view>
				<text class="shake-hint">点击按钮或晃动手机，发现附近的活动和商友</text>
			</view>
			
			<!-- 加载中界面 -->
			<view v-else-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">正在发现附近内容...</text>
			</view>

			<!-- 结果列表界面 -->
			<view v-else class="list-container fade-in">
				<!-- 活动列表 -->
				<view v-show="currentTab === 0">
					<view class="list-title">
						<uni-icons type="calendar-filled" size="20" color="#FF6B00" />
						<text>附近活动</text>
					</view>
					<ActivityCard v-for="activity in activities" :key="activity.id" :activity="activity"
						@refreshList="triggerShakeSequence" />
					<view v-if="!activityHasMore && activities.length > 0" class="no-more-content">
						暂无更多活动
					</view>
					<view v-if="activities.length === 0" class="no-more-content">
						附近暂无活动，去别处看看吧
					</view>
				</view>

				<!-- 商友列表 -->
				<view v-show="currentTab === 1">
					<view class="list-title">
						<uni-icons type="staff-filled" size="20" color="#FF6B00" />
						<text>附近商友</text>
					</view>
					
					<view v-for="business in businesses" :key="business.id" class="business-card">
						<image :src="business.avatar || '/static/images/default-avatar.png'" mode="aspectFill"
							class="business-avatar" />
						<view class="business-info">
							<view class="business-name">
								{{ business.nickname }}
							</view>
							
							<!-- 【核心修改】显示真实的职位和公司 -->
							<view class="card-position" v-if="business.professionalTitle">
								<text class="iconfont">👤</text> {{ business.professionalTitle }}
							</view>
							<view class="card-company" v-if="business.companyName">
								<text class="iconfont">🏢</text> {{ business.companyName }}
							</view>
						</view>
						
						<button class="connect-btn" @click="handleConnect(business)" :disabled="business.loading"
							:class="{ 'connected': business.isFollowed }">
							{{ business.isFollowed ? '已关注' : '关注' }}
						</button>
					</view>
					
					<view v-if="!businessHasMore && businesses.length > 0" class="no-more-content">
						暂无更多商友
					</view>
					<view v-if="businesses.length === 0" class="no-more-content">
						附近暂无商友
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		onUnmounted
	} from 'vue';
	import {
		onReachBottom
	} from '@dcloudio/uni-app';
	import ActivityCard from '@/components/ActivityCard.vue';
	import request from '../../utils/request.js';

	// --- 状态管理 ---
	const currentTab = ref(0);
	const tabItems = ['活动', '商友'];
	const shaken = ref(false);
	const loading = ref(false);
	const shakeDebounce = ref(true);
	const userLocation = ref(null);

	// 【修改】为活动和商友分别创建分页状态
	const activityPageNo = ref(1);
	const activityHasMore = ref(true);
	const businessPageNo = ref(1);
	const businessHasMore = ref(true);

	// --- 数据 ---
	const activities = ref([]);
	const businesses = ref([]);

	// --- 方法 ---
	const handleTabClick = (e) => {
		currentTab.value = e.currentIndex;
	};

	const startShake = () => triggerShakeSequence();

	const triggerShakeSequence = () => {
		if (!shakeDebounce.value) return;
		shakeDebounce.value = false;
		getLocationAndProceed();
	};

	const getLocationAndProceed = () => {
	    uni.getLocation({
	        type: 'gcj02',
	        success: async (res) => { // 【修改】将此回调函数改为 async
	            console.log('✅ 获取用户位置成功:', res);
	            userLocation.value = {
	                latitude: res.latitude,
	                longitude: res.longitude,
	            };
	            shaken.value = true;
	            
	            // 【核心修改】使用 Promise.all 并行执行两个请求
	            loading.value = true; // 开始加载
	            uni.vibrateShort();   // 震动一次即可
	
	            try {
	                // 等待两个请求都完成
	                await Promise.all([
	                    getNearbyActivities(false),
	                    getNearbyBusinesses(false)
	                ]);
	                console.log('✅ 附近活动和商友数据均已加载完毕');
	            } catch (error) {
	                console.error('❌ 加载初始数据时发生错误:', error);
	            } finally {
	                // 无论成功或失败，最后都结束加载状态
	                loading.value = false;
	                // 允许用户再次摇一摇
	                setTimeout(() => {
	                    shakeDebounce.value = true;
	                }, 1000);
	            }
	        },
	        fail: (err) => {
	            console.error('❌ 获取位置失败:', err);
	            // ... 错误处理逻辑保持不变 ...
	            shakeDebounce.value = true;
	        }
	    });
	};

	// 获取附近活动列表的方法 (保持不变)
	const getNearbyActivities = async (isLoadMore = false) => {
	    // 【修改】简化入口判断，只判断是否在加载更多
	    if (isLoadMore && (!activityHasMore.value || loading.value)) return;
	
	    if(isLoadMore) loading.value = true; // 加载更多时，单独控制loading
	
	    if (!isLoadMore) {
	        activityPageNo.value = 1;
	        activities.value = [];
	        activityHasMore.value = true;
	    }
	    const params = {
	        pageNo: activityPageNo.value,
	        pageSize: 10,
	        longitude: userLocation.value.longitude,
	        latitude: userLocation.value.latitude,
	    };
	    
	    // 【修改】请求逻辑保持不变，但移除 try...catch 和 finally
	    const result = await request('/app-api/member/activity/list', {
	        method: 'GET',
	        data: params
	    });
	    
	    if (result && !result.error && result.data) {
	        const list = result.data.list || [];
	        activities.value = isLoadMore ? [...activities.value, ...list] : list;
	        if (activities.value.length >= result.data.total) activityHasMore.value = false;
	        activityPageNo.value++;
	    } else {
	        activityHasMore.value = false;
	    }
	
	    if(isLoadMore) loading.value = false; // 加载更多结束
	};

	/**
	 * 【核心新增】获取附近商友列表的方法
	 * @param {boolean} isLoadMore - 是否为加载更多操作
	 */
	const getNearbyBusinesses = async (isLoadMore = false) => {
	    // 【修改】简化入口判断
	    if (isLoadMore && (!businessHasMore.value || loading.value)) return;
	    
	    if(isLoadMore) loading.value = true; // 加载更多时，单独控制loading
	
	    if (!isLoadMore) {
	        businessPageNo.value = 1;
	        businesses.value = [];
	        businessHasMore.value = true;
	    }
	
	    const params = {
	        pageNo: businessPageNo.value,
	        pageSize: 10,
	        longitude: userLocation.value.longitude,
	        latitude: userLocation.value.latitude,
	    };
	
	    console.log('发起附近商友列表请求, 参数:', params); // 现在这个log能正常打印了
	    const result = await request('/app-api/member/user/list', {
	        method: 'GET',
	        data: params
	    });
		console.log('发起附近商友列表result:', result); 
	
	    if (result && !result.error && result.data) {
	        const list = result.data.list || [];
	        list.forEach(item => {
	            item.isFollowed = false; 
	            item.loading = false;
	        });
	        businesses.value = isLoadMore ? [...businesses.value, ...list] : list;
	        if (businesses.value.length >= result.data.total) {
	            businessHasMore.value = false;
	        }
	        businessPageNo.value++;
	    } else {
	        console.error('获取附近商友列表失败:', result.error);
	        businessHasMore.value = false;
	    }
	
	    if(isLoadMore) loading.value = false; // 加载更多结束
	};


	/**
	 * 【核心新增】处理关注/取消关注商友的逻辑
	 * @param {object} business - 被点击的商友对象
	 */
	const handleConnect = async (business) => {
		business.loading = true;
		const userId = uni.getStorageSync('userId');
		if (!userId) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			business.loading = false;
			return;
		}

		// 假设关注/取关接口与活动收藏类似
		const endpoint = business.isFollowed ? '/app-api/member/follow/del' : '/app-api/member/follow/add';
		const successMessage = business.isFollowed ? '已取消关注' : '关注成功';

		const payload = {
			userId: userId,
			targetId: business.id,
			targetType: "post_user" // 【关键】目标类型为用户
		};

		const result = await request(endpoint, {
			method: 'POST',
			data: payload
		});

		if (result && !result.error) {
			uni.showToast({
				title: successMessage,
				icon: 'success'
			});
			// 操作成功后，直接更新UI状态
			business.isFollowed = !business.isFollowed;
		} else {
			uni.showToast({
				title: result.error || '操作失败',
				icon: 'none'
			});
		}
		business.loading = false;
	};

	// --- 生命周期钩子 ---
	onMounted(() => {
		uni.onAccelerometerChange((res) => {
			if (Math.abs(res.x) > 1.5 && Math.abs(res.y) > 1.5) {
				triggerShakeSequence();
			}
		});
	});

	onUnmounted(() => uni.stopAccelerometer());

	// 【修改】页面触底，根据当前Tab加载更多
	onReachBottom(() => {
		if (loading.value) return;

		if (currentTab.value === 0 && activityHasMore.value) {
			console.log('滑动到底部，加载更多附近活动...');
			getNearbyActivities(true);
		} else if (currentTab.value === 1 && businessHasMore.value) {
			console.log('滑动到底部，加载更多附近商友...');
			getNearbyBusinesses(true);
		}
	});
</script>


<style lang="scss" scoped>
	/* 样式部分保持不变，仅新增 loading-container 和 no-more-content */
	.nearby-container {
		background-color: #f8f9fa;
		min-height: 100vh;
	}

	/* 顶部导航 */
	.header {
		background-color: #fff;
		color: white;
		padding: 20rpx 30rpx;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		padding-top: var(--status-bar-height);

		.tabs-wrapper {
			margin: 0 auto;
		}
	}

	.content-area {
		padding: 0 32rpx;
	}

	/* 摇一摇区域 */
	.shake-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 70vh;
		text-align: center;
	}

	.shake-btn {
		width: 360rpx;
		height: 360rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 44rpx;
		font-weight: bold;
		box-shadow: 0 20rpx 50rpx rgba(255, 107, 0, 0.4);
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.95);
			box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.5);
		}
	}

	.shake-icon {
		animation: pulse 2s infinite;
	}

	.shake-hint {
		margin-top: 60rpx;
		font-size: 28rpx;
		color: #666;
		max-width: 600rpx;
		line-height: 1.6;
	}

	/* 【修改】将原 loading-container 样式用于列表加载中 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		/* 调整为列表内的间距 */
		color: #666;
	}

	.loading-spinner {
		width: 50rpx;
		height: 50rpx;
		border: 4rpx solid #e0e0e0;
		border-top-color: #ff6b00;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}

	.loading-text {
		font-size: 28rpx;
	}

	/* 【新增】暂无更多提示 */
	.no-more-content {
		text-align: center;
		color: #999;
		padding: 30rpx 0;
		font-size: 28rpx;
	}

	/* 列表区域 */
	.list-container {
		padding-top: 30rpx;
	}

	.list-title {
		font-size: 40rpx;
		font-weight: 600;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;

		text {
			margin-left: 16rpx;
		}
	}

	/* 商友卡片样式 (活动卡片样式由组件自身决定) */
	.business-card {
		background: white;
		border-radius: 24rpx;
		padding: 30rpx;
		display: flex;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);

		.business-avatar {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
			margin-right: 30rpx;
			border: 4rpx solid #ff8c00;
		}

		.card-position,
		.card-company {
			font-size: 26rpx;
			margin-bottom: 5rpx;
			opacity: 0.95;
		}

		.business-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.business-name {
			font-size: 34rpx;
			font-weight: 600;
			margin-bottom: 10rpx;
		}

		.distance {
			color: #ff6b00;
			font-weight: normal;
		}

		.business-position {
			color: #666;
			margin-bottom: 16rpx;
			font-size: 26rpx;
		}

		.business-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;
		}

		.business-tag {
			background: #f0f2f5;
			color: #666;
			padding: 6rpx 20rpx;
			border-radius: 40rpx;
			font-size: 24rpx;
		}

		.connect-btn {
			background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
			color: white;
			border: none;
			padding: 0 30rpx;
			border-radius: 40rpx;
			font-weight: 500;
			align-self: center;
			font-size: 26rpx;
			margin-left: 20rpx;

			&::after {
				border: none;
			}
		}

		/* 【新增】已关注按钮的样式 */
		.connect-btn.connected {
			background: #f0f2f5;
			color: #999;
		}
	}

	/* 动画 */
	@keyframes pulse {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.1);
		}

		100% {
			transform: scale(1);
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.fade-in {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.iconfont {
			margin-right: 10rpx;
		}
</style>