<template>
	<view class="nearby-container">
		<view class="header">
			<view class="tabs-wrapper">
				<uni-segmented-control :current="currentTab" :values="tabItems" style-type="button"
					active-color="#FF6B00" @clickItem="handleTabClick" />
			</view>
		</view>

		<view class="content-area">
			<!-- 1. 摇一摇界面 (v-if="!shaken") -->
			<view v-if="!shaken" class="shake-container">
				<view class="shake-btn" @click="triggerShakeSequence">
					<uni-icons type="hand-up" size="60" color="#FFFFFF" class="shake-icon" />
					<text>摇一摇</text>
				</view>
				<text class="shake-hint">点击按钮或晃动手机，发现附近的活动和商友</text>
			</view>

			<!-- 2. 加载中界面 (v-else-if="loading") -->
			<view v-else-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">正在发现附近内容...</text>
			</view>

			<!-- 3. 结果列表界面 (v-else) -->
			<view v-else class="list-container fade-in">
				<!-- 活动列表 -->
				<view v-show="currentTab === 0">
					<view class="list-title">
						<uni-icons type="calendar-filled" size="20" color="#FF6B00" />
						<text>附近活动</text>
					</view>
					<ActivityCard v-for="activity in activities" :key="activity.id" :activity="activity" />
					<uni-load-more :status="activityLoadingStatus"></uni-load-more>
					<view v-if="activities.length === 0 && activityLoadingStatus === 'noMore'" class="no-more-content">
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
						<image :src="business.avatar || '/static/images/default-avatar.png'" mode="aspectFill" class="business-avatar" />
						<view class="business-info">
							<view class="business-name">{{ business.nickname }}</view>
							<view class="card-position" v-if="business.professionalTitle">
								<text class="iconfont">👤</text> {{ business.professionalTitle }}
							</view>
							<view class="card-company" v-if="business.companyName">
								<text class="iconfont">🏢</text> {{ business.companyName }}
							</view>
						</view>
						<!-- 【核心修改】按钮状态绑定到 followFlag，并调用统一的 handleFollowAction 方法 -->
						<button class="connect-btn" 
							:class="{ 'connected': business.followFlag === 1 }"
							@click.stop="handleFollowAction(business)">
							{{ business.followFlag === 1 ? '已关注' : '关注' }}
						</button>
					</view>
					<uni-load-more :status="businessLoadingStatus"></uni-load-more>
					<view v-if="businesses.length === 0 && businessLoadingStatus === 'noMore'" class="no-more-content">
						附近暂无商友，去别处看看吧
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onReachBottom, onShow, onHide } from '@dcloudio/uni-app';
import ActivityCard from '@/components/ActivityCard.vue';
import request from '../../utils/request.js';

let shakeAudioContext = null;

// --- 状态管理 ---
const currentTab = ref(0);
const tabItems = ['活动', '商友'];
const shaken = ref(false);       // 是否已经摇过并显示结果
const loading = ref(false);      // 是否正在加载数据（摇动后）
const shakeDebounce = ref(true); // 摇一摇的防抖
const userLocation = ref(null);

// 分页和加载状态
const activityPageNo = ref(1);
const businessPageNo = ref(1);
const activityLoadingStatus = ref('more');
const businessLoadingStatus = ref('more');
const isFollowActionInProgress = ref(false);

// 数据
const activities = ref([]);
const businesses = ref([]);

// --- 【核心修改】重置页面状态的函数 ---
const resetState = () => {
	console.log("页面状态已重置");
	shaken.value = false;
	loading.value = false;
	activities.value = [];
	businesses.value = [];
	activityPageNo.value = 1;
	businessPageNo.value = 1;
	activityLoadingStatus.value = 'more';
	businessLoadingStatus.value = 'more';
	shakeDebounce.value = true;
};

// --- 方法 ---
const handleTabClick = (e) => {
	currentTab.value = e.currentIndex;
};

const triggerShakeSequence = () => {
	if (!shakeDebounce.value) return;

	if (shakeAudioContext) {
		shakeAudioContext.stop();
		shakeAudioContext.play();
	}

	shakeDebounce.value = false;
	getLocationAndProceed();
};

const getLocationAndProceed = () => {
	uni.showLoading({ title: '正在定位...', mask: true });
	uni.getLocation({
		type: 'gcj02',
		success: async (res) => {
			uni.hideLoading();
			userLocation.value = {
				latitude: res.latitude,
				longitude: res.longitude,
			};
			shaken.value = true;   // 标记为已摇过
			loading.value = true; // 开始显示加载动画
			uni.vibrateShort();

			try {
				// 并发请求活动和商友列表
				await Promise.all([
					getNearbyActivities(true),
					getNearbyBusinesses(true)
				]);
			} catch (error) {
				console.error('加载初始数据时发生错误:', error);
			} finally {
				loading.value = false; // 结束加载动画，显示结果
				setTimeout(() => {
					shakeDebounce.value = true;
				}, 1000); // 1秒后允许再次摇动
			}
		},
		fail: (err) => {
			uni.hideLoading();
			uni.showToast({ title: '获取位置失败', icon: 'none' });
			shakeDebounce.value = true;
		}
	});
};

const getNearbyActivities = async (isRefresh = false) => {
	if (activityLoadingStatus.value === 'loading' && !isRefresh) return;
	activityLoadingStatus.value = 'loading';

	if (isRefresh) {
		activityPageNo.value = 1;
		activities.value = [];
	}

	try {
		const { data, error } = await request('/app-api/member/activity/list', {
			method: 'GET',
			data: {
				pageNo: activityPageNo.value,
				pageSize: 10,
				longitude: userLocation.value.longitude,
				latitude: userLocation.value.latitude,
			}
		});

		if (error) throw new Error(error);

		const list = data.list || [];
		activities.value = isRefresh ? list : [...activities.value, ...list];
		activityLoadingStatus.value = activities.value.length >= data.total ? 'noMore' : 'more';
		if (activityLoadingStatus.value === 'more') activityPageNo.value++;
		
	} catch(err) {
		activityLoadingStatus.value = 'more';
	}
};

const getNearbyBusinesses = async (isRefresh = false) => {
	if (businessLoadingStatus.value === 'loading' && !isRefresh) return;
	businessLoadingStatus.value = 'loading';
	
	if (isRefresh) {
		businessPageNo.value = 1;
		businesses.value = [];
	}
	
	try {
		const { data, error } = await request('/app-api/member/user/list', {
			method: 'GET',
			data: {
				pageNo: businessPageNo.value,
				pageSize: 10,
				longitude: userLocation.value.longitude,
				latitude: userLocation.value.latitude,
			}
		});

		if (error) throw new Error(error);

		const list = data.list || [];
		businesses.value = isRefresh ? list : [...businesses.value, ...list];
		businessLoadingStatus.value = businesses.value.length >= data.total ? 'noMore' : 'more';
		if(businessLoadingStatus.value === 'more') businessPageNo.value++;

	} catch (err) {
		businessLoadingStatus.value = 'more';
	}
};

// --- 【核心修改】关注/取关功能 ---
const handleFollowAction = async (user) => {
    if (isFollowActionInProgress.value) return;

    const currentUserId = uni.getStorageSync('userId');
    if (!currentUserId) {
        uni.showModal({
            title: '需要登录',
            content: '关注功能需要登录后才能使用，是否前往登录？',
            success: (res) => {
                if (res.confirm) {
                    uni.navigateTo({ url: '/pages/login/login' });
                }
            }
        });
        return;
    }
    
    isFollowActionInProgress.value = true;
    
    // 【核心修改】使用 `followFlag`
    const originalFollowStatus = user.followFlag;
    const newFollowStatus = originalFollowStatus === 1 ? 0 : 1;
    const apiUrl = newFollowStatus === 1 ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
    const successMsg = newFollowStatus === 1 ? '关注成功' : '已取消关注';

    user.followFlag = newFollowStatus; // 乐观更新
    
    try {
        const { error } = await request(apiUrl, {
            method: 'POST',
            data: {
                userId: currentUserId,
                targetId: user.id,
                targetType: 'post_user'
            }
        });
        
        if (error) throw new Error(error);
        
        uni.showToast({ title: successMsg, icon: 'success' });
        
    } catch (err) {
        user.followFlag = originalFollowStatus; // 失败回滚
        uni.showToast({ title: err.message || '操作失败，请重试', icon: 'none' });
    } finally {
        isFollowActionInProgress.value = false;
    }
};

// --- 生命周期钩子 ---
onShow(() => {
    // 【核心修改】每次进入页面，都重置状态，回到初始的摇一摇界面
	resetState();

	shakeAudioContext = uni.createInnerAudioContext();
	shakeAudioContext.src = 'https://img.gofor.club/wechat_shake.mp3';
	
	uni.onAccelerometerChange((res) => {
		if (Math.abs(res.x) > 1.2 && Math.abs(res.y) > 1.2) { // 稍微调高灵敏度
			triggerShakeSequence();
		}
	});
});

onHide(() => {
	uni.stopAccelerometer();
	if (shakeAudioContext) {
		shakeAudioContext.destroy();
		shakeAudioContext = null;
	}
});

onReachBottom(() => {
	if (currentTab.value === 0 && activityLoadingStatus.value === 'more') {
		getNearbyActivities();
	} else if (currentTab.value === 1 && businessLoadingStatus.value === 'more') {
		getNearbyBusinesses();
	}
});
</script>


<style lang="scss" scoped>
/* 您的样式完全不用修改，这里省略以保持简洁 */
.nearby-container {
	background-color: #f8f9fa;
	min-height: 100vh;
}
.header {
	background-color: #fff;
	padding: 20rpx 30rpx;
	position: sticky; top: 0;
	z-index: 100;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	padding-top: var(--status-bar-height);
	.tabs-wrapper { margin: 0 auto; }
}
.content-area {
	padding: 0 32rpx;
}
.shake-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 70vh;
	text-align: center;
}
.shake-btn {
	width: 320rpx; height: 320rpx; border-radius: 50%;
	background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
	display: flex; flex-direction: column; align-items: center; justify-content: center;
	color: white; font-size: 40rpx; font-weight: bold;
	box-shadow: 0 20rpx 50rpx rgba(255, 107, 0, 0.3);
	transition: all 0.2s ease;
	&:active {
		transform: scale(0.95);
		box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.4);
	}
}
.shake-icon { animation: pulse 2s infinite; }
.shake-hint {
	margin-top: 40rpx; font-size: 28rpx; color: #666;
	max-width: 600rpx; line-height: 1.6;
}
.loading-container {
	display: flex; flex-direction: column; align-items: center; justify-content: center;
	padding: 80rpx 0; color: #666;
}
.loading-spinner {
	width: 50rpx; height: 50rpx;
	border: 4rpx solid #e0e0e0;
	border-top-color: #ff6b00;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}
.loading-text { font-size: 28rpx; }
.no-more-content {
	text-align: center; color: #999;
	padding: 30rpx 0; font-size: 28rpx;
}
.list-container {
	padding-top: 30rpx;
}
.list-title {
	font-size: 36rpx; font-weight: 600; margin-bottom: 30rpx;
	display: flex; align-items: center;
	text { margin-left: 16rpx; }
}
.business-card {
	background: white; border-radius: 24rpx; padding: 30rpx;
	display: flex; align-items: center; margin-bottom: 30rpx;
	box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
	.business-avatar {
		width: 120rpx; height: 120rpx; border-radius: 50%;
		margin-right: 30rpx; flex-shrink: 0;
	}
	.card-position, .card-company {
		font-size: 26rpx; color: #666; margin-top: 8rpx;
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	.business-info {
		flex: 1; min-width: 0;
	}
	.business-name {
		font-size: 32rpx; font-weight: 600; margin-bottom: 10rpx;
	}
	.connect-btn {
		background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
		color: white; border: none; padding: 0 30rpx;
		height: 60rpx; line-height: 60rpx; border-radius: 40rpx;
		font-weight: 500; align-self: center; font-size: 26rpx;
		margin-left: 20rpx; white-space: nowrap;
		&::after { border: none; }
	}
	.connect-btn.connected {
		background: #f0f2f5; color: #999;
	}
}
@keyframes pulse {
	0% { transform: scale(1); }
	50% { transform: scale(1.1); }
	100% { transform: scale(1); }
}
@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
.fade-in {
	animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}
.iconfont { margin-right: 10rpx; }
</style>