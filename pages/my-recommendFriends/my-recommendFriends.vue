<template>
	<view class="page-container">
		<!-- 商友列表 -->
		<view class="friend-list">
			<view class="friend-card" v-for="friend in friendList" :key="friend.id">
				<image 
					class="friend-avatar" 
					:src="friend.avatar || '/static/images/default-avatar.png'" 
					mode="aspectFill"
					@error="handleImageError(friend)"
				></image>
				<view class="friend-info">
					<view class="info-header">
						<text class="friend-name">{{ friend.nickname || friend.realName || '匿名用户' }}</text>
						<view class="friend-company">
							<uni-icons type="briefcase-filled" size="14" color="#888"></uni-icons>
							<text>{{ friend.companyName || '暂无公司信息' }}</text>
						</view>
					</view>
					<view class="friend-title">
						<uni-icons type="person-filled" size="14" color="#888"></uni-icons>
						<text>{{ friend.professionalTitle || '暂无职位' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载更多组件 -->
		<uni-load-more :status="loadStatus" v-if="friendList.length > 0 || loadStatus === 'loading'"></uni-load-more>

		<!-- 空状态 -->
		<view class="empty-container" v-if="friendList.length === 0 && loadStatus === 'noMore'">
			<image class="empty-image" src="/static/images/empty-box.png" mode="widthFix"></image>
			<text class="empty-text">您还没有推荐过商友哦</text>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
	import request from '@/utils/request.js'; // 确保路径正确

	// --- 响应式状态 ---
	const friendList = ref([]);
	const pageNo = ref(1);
	const pageSize = ref(10);
	const total = ref(0);
	const loadStatus = ref('more'); // 'more', 'loading', 'noMore'

	// --- API 调用 ---
	const getShareUserList = async (isRefresh = false) => {
		// 防止重复加载
		if (loadStatus.value === 'loading') return;
		// 如果不是刷新且已无更多数据，则不执行
		if (!isRefresh && loadStatus.value === 'noMore') return;

		// 如果是刷新操作，重置状态
		if (isRefresh) {
			pageNo.value = 1;
			friendList.value = [];
			loadStatus.value = 'more';
		}

		loadStatus.value = 'loading';
		
		const { data, error } = await request('/app-api/member/user/share-user-list', {
			method: 'GET',
			data: {
				pageNo: pageNo.value,
				pageSize: pageSize.value
			}
		});

		// 停止下拉刷新动画
		if (isRefresh) {
			uni.stopPullDownRefresh();
		}
		
		if (error) {
			loadStatus.value = 'more'; // 加载失败，允许重试
			uni.showToast({ title: error, icon: 'none' });
			return;
		}

		if (data && data.list) {
			friendList.value.push(...data.list);
			total.value = data.total;
			
			// 判断是否还有更多数据
			if (friendList.value.length >= total.value) {
				loadStatus.value = 'noMore';
			} else {
				loadStatus.value = 'more';
				pageNo.value++; // 准备加载下一页
			}
		} else {
			loadStatus.value = 'noMore';
		}
	};
	
	// --- 图片加载失败处理 ---
	const handleImageError = (item) => {
		// 你可以给 item 一个默认图片，以防止无限循环的错误
		// 这里假设静态文件夹里有一个 default-avatar.png
		item.avatar = '/static/images/default-avatar.png';
	};

	// --- 生命周期钩子 ---
	onLoad(() => {
		uni.showLoading({ title: '正在加载...' });
		getShareUserList(true).finally(() => {
			uni.hideLoading();
		});
	});

	onPullDownRefresh(() => {
		getShareUserList(true);
	});

	onReachBottom(() => {
		getShareUserList();
	});
</script>

<style scoped>
	.page-container {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.friend-list {
		padding: 20rpx;
	}

	.friend-card {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		transition: transform 0.2s ease-in-out;
	}
	.friend-card:active {
		transform: scale(0.98);
	}

	.friend-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 30rpx;
		flex-shrink: 0;
		background-color: #eee;
	}

	.friend-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.info-header {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.friend-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.friend-company,
	.friend-title {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
	}
	
	.friend-company uni-icons,
	.friend-title uni-icons {
		margin-right: 10rpx;
	}
	
	.friend-company text,
	.friend-title text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		color: #999;
	}

	.empty-image {
		width: 300rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 28rpx;
	}
</style>