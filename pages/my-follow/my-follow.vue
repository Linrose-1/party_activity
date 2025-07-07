<template>
	<view class="followed-users-page">
		<!-- 导航栏可以根据您的项目结构添加，这里简化处理 -->
		<!-- <uni-nav-bar title="我关注的商友" left-icon="back" @clickLeft="goBack" /> -->
		
		<scroll-view 
			scroll-y
			class="content-scroll"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<view v-if="followedUsers.length > 0" class="user-list">
				<!-- 
					循环 `followedUsers` 数组
					- item.id 是关注记录的唯一ID
					- item.userRespVO 包含了被关注用户的详细信息
				-->
				<view v-for="item in followedUsers" :key="item.id" class="user-card" @click="viewUserDetail(item.userRespVO.id)">
					<!-- 使用 userRespVO 中的头像，如果为空则提供一个默认头像 -->
					<image :src="item.userRespVO.avatar || '/static/images/default-avatar.png'" mode="aspectFill" class="user-avatar" />
					
					<view class="user-info">
						<!-- 显示昵称 -->
						<view class="user-name">{{ item.userRespVO.nickname }}</view>
						
						<!-- 如果有公司信息，则显示 -->
						<view class="user-company" v-if="item.userRespVO.companyName">
							<uni-icons type="flag" size="14" color="#888" />
							<text>{{ item.userRespVO.companyName }}</text>
						</view>
					</view>
					
					<!-- 
						取消关注按钮
						- @click.stop 防止事件冒泡触发卡片点击
						- 传入 item.id (关注记录ID)
					-->
					<button class="unfollow-btn" @click.stop="cancelFollow(item.id)">
						取消关注
					</button>
				</view>
			</view>
			
			<!-- 加载更多 & 空状态提示 -->
			<uni-load-more v-if="followedUsers.length > 0 || loadingStatus === 'loading'" :status="loadingStatus" />
			
			<view v-if="loadingStatus === 'noMore' && followedUsers.length === 0" class="empty-state">
				<uni-icons type="person-filled" size="60" color="#e0e0e0" />
				<text class="empty-text">您还没有关注任何商友</text>
				<button class="primary-btn" @click="goToDiscover">去发现商友</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import request from '../../utils/request.js'; // 引入我们熟悉的请求工具

// --- 状态管理 ---
const followedUsers = ref([]);
const pageNo = ref(1);
const pageSize = 15; // 每页可以加载更多条
const loadingStatus = ref('more'); // 'more', 'loading', 'noMore'
const refreshing = ref(false); // 下拉刷新状态
const userId = ref(null);

// --- 生命周期 ---
onLoad(() => {
	userId.value = uni.getStorageSync('userId');
	if (!userId.value) {
		uni.showToast({ title: '请先登录', icon: 'none' });
		// 可以在这里处理未登录的逻辑，例如跳转到登录页
		return;
	}
	// 页面加载时，获取第一页数据
	getFollowedUsers(true);
});

// --- 核心方法 ---

/**
 * 获取关注的商友列表
 * @param {boolean} isRefresh - 是否为刷新操作
 */
const getFollowedUsers = async (isRefresh = false) => {
	// 防止重复加载
	if (loadingStatus.value === 'loading' || (loadingStatus.value === 'noMore' && !isRefresh)) {
		if (isRefresh) refreshing.value = false;
		return;
	}

	if (isRefresh) {
		pageNo.value = 1;
		followedUsers.value = [];
		loadingStatus.value = 'more';
	}
	
	loadingStatus.value = 'loading';

	const params = {
		pageNo: pageNo.value,
		pageSize: pageSize,
		userId: userId.value,
		targetType: 'user' // 【关键】指定目标类型为用户
	};

	try {
		const { data, error } = await request('/app-api/member/follow/page', {
			method: 'GET',
			data: params
		});
		
		console.log("关注的商友",data)

		if (!error && data) {
			// 从返回数据中过滤出包含有效 userRespVO 的项
			const validUsers = (data.list || []).filter(item => item.userRespVO);
			
			// 清洗数据，防止 null 导致渲染错误
			validUsers.forEach(item => {
				item.userRespVO.nickname = item.userRespVO.nickname || '匿名用户';
			});

			followedUsers.value.push(...validUsers);
			pageNo.value++;
			
			loadingStatus.value = (data.list || []).length < pageSize ? 'noMore' : 'more';

		} else {
			loadingStatus.value = 'noMore';
			uni.showToast({ title: error || '加载失败', icon: 'none' });
		}
	} catch (err) {
		loadingStatus.value = 'noMore';
		uni.showToast({ title: '网络请求异常', icon: 'none' });
	} finally {
		if (isRefresh) {
			refreshing.value = false;
		}
	}
};

/**
 * 取消关注
 * @param {number} followId - 关注记录的ID
 */
const cancelFollow = async (followId) => {
	uni.showModal({
		title: '提示',
		content: '确定要取消关注该商友吗？',
		success: async (res) => {
			if (res.confirm) {
				const { error } = await request('/app-api/member/follow/del', {
					method: 'POST',
					data: {
						targetId: followId,
						userId: userId.value,
						targetType: 'post_user' // 同样需要传入 targetType
					}
				});

				if (!error) {
					uni.showToast({ title: '已取消关注', icon: 'success' });
					// 从列表中移除该用户
					const index = followedUsers.value.findIndex(item => item.id === followId);
					if (index !== -1) {
						followedUsers.value.splice(index, 1);
					}
				} else {
					uni.showToast({ title: error || '操作失败', icon: 'none' });
				}
			}
		}
	});
};

// --- 事件处理 ---

// 下拉刷新
const onRefresh = () => {
	refreshing.value = true;
	getFollowedUsers(true);
};

// 滚动到底部加载更多
const loadMore = () => {
	getFollowedUsers(false);
};

// --- 导航方法 ---

const viewUserDetail = (targetUserId) => {
	// 跳转到用户详情或名片页，这里假设路径为 /pages/user-profile/index
	uni.navigateTo({
		url: `/pages/user-profile/index?id=${targetUserId}`
	});
};

const goToDiscover = () => {
	// 跳转到可以发现商友的页面，例如“附近”或“商机”首页
	uni.switchTab({
		url: '/pages/location/location'
	});
};

const goBack = () => {
	uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.followed-users-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f9fa;
}

.content-scroll {
	flex: 1;
	height: 1px; /* 关键，用于撑开 scroll-view */
}

.user-list {
	padding: 24rpx;
}

.user-card {
	display: flex;
	align-items: center;
	background-color: #fff;
	padding: 30rpx;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	transition: background-color 0.2s;

	&:active {
		background-color: #f9f9f9;
	}
}

.user-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 24rpx;
	flex-shrink: 0;
	border: 1rpx solid #eee;
}

.user-info {
	flex: 1;
	min-width: 0; // 防止内容过长撑开布局
}

.user-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-company {
	font-size: 26rpx;
	color: #888;
	display: flex;
	align-items: center;
	
	text {
		margin-left: 8rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

.unfollow-btn {
	background-color: #f0f2f5;
	color: #666;
	border: none;
	padding: 0 30rpx;
	height: 60rpx;
	line-height: 60rpx;
	border-radius: 40rpx;
	font-size: 26rpx;
	margin-left: 20rpx;
	flex-shrink: 0; // 防止按钮被挤压
	
	&::after {
		border: none;
	}
	
	&:active {
		opacity: 0.8;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
	color: #999;
}

.empty-text {
	font-size: 28rpx;
	margin: 24rpx 0;
}

.primary-btn {
	background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
	color: white;
	border: none;
	padding: 0 48rpx;
	height: 72rpx;
	line-height: 72rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	margin-top: 24rpx;
	
	&::after {
		border: none;
	}
}
</style>