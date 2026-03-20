<template>
	<view class="trace-page">
		<view class="list-container" v-if="list.length > 0">
			<view class="trace-item" v-for="item in list" :key="item.id">
				<!-- 1. 访客（静默用户）头像 -->
				<image :src="item.memberUser?.avatar || defaultSilentAvatar" class="u-avatar silent-avatar"
					mode="aspectFill"></image>

				<view class="u-info">
					<view class="u-top">
						<text class="u-name">{{ item.memberUser.nickname || '商友' }}</text>
						<text class="u-time">邀请于{{ formatTime(item.memberUser.createTime) }}</text>
					</view>

					<!-- 2. 邀请者信息展示 -->
					<view class="inviter-box" v-if="item.memberUser?.parentUser">
						<view class="inviter-label">邀请人</view>
						<view class="inviter-user">
							<image :src="item.memberUser.parentUser.avatar" class="mini-avatar"></image>
							<text class="mini-name">{{ item.memberUser.parentUser.nickname || '系统推荐' }}</text>
						</view>
					</view>

					<!-- 3. 浏览次数（仅后端有返回时显示，通常仅创建者可见） -->
					<view class="u-stats" v-if="item.viewCount">
						<uni-icons type="eye" size="14" color="#999"></uni-icons>
						<text class="u-count">累计浏览 {{ item.viewCount }} 次</text>
					</view>
				</view>
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

	const targetId = ref(null);
	const targetType = ref('post');
	const list = ref([]);
	const pageNo = ref(1);
	const loadingStatus = ref('more');
	const defaultSilentAvatar =
		'https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png';

	onLoad((options) => {
		targetId.value = options.id;
		targetType.value = options.type || 'post';
		uni.setNavigationBarTitle({
			title: '潜在商友列表'
		});
		loadData(true);
	});

	const loadData = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			list.value = [];
		}
		loadingStatus.value = 'loading';

		try {
			const {
				data,
				error
			} = await request('/app-api/member/target-view/silent-login-page', {
				method: 'GET',
				data: {
					targetId: targetId.value,
					targetType: targetType.value,
					pageNo: pageNo.value,
					pageSize: 20
				}
			});

			// 【日志打印】
			console.log('------------------------------------');
			console.log('📁 静默用户接口请求参数:', {
				targetId: targetId.value,
				targetType: targetType.value
			});
			console.log('✅ 静默用户接口返回原始数据:', data);
			if (data && data.list) {
				console.log('👤 第一位用户信息详情 (memberUser):', data.list[0]?.memberUser);
				console.log('🤝 第一位邀请人信息详情 (parentUser):', data.list[0]?.memberUser?.parentUser);
			}
			console.log('------------------------------------');

			if (!error && data) {
				const newList = data.list || [];
				list.value = isRefresh ? newList : [...list.value, ...newList];
				loadingStatus.value = list.value.length >= data.total ? 'noMore' : 'more';
				pageNo.value++;
			} else {
				loadingStatus.value = 'noMore';
			}
		} catch (e) {
			console.error('加载异常:', e);
			loadingStatus.value = 'more';
		}
	};

	const formatTime = (ts) => {
		if (!ts) return '';
		const date = new Date(Number(ts) || ts);

		const Y = date.getFullYear();
		const M = String(date.getMonth() + 1).padStart(2, '0');
		const D = String(date.getDate()).padStart(2, '0');
		const h = date.getHours();
		const m = String(date.getMinutes()).padStart(2, '0');

		// 返回格式：2024-10-25 14:30
		return `${Y}-${M}-${D} ${h}:${m}`;
	};
</script>

<style scoped>
	.inviter-box {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
		padding: 10rpx 20rpx;
		background: #fdf2e9;
		border-radius: 12rpx;
		width: fit-content;
	}

	.inviter-label {
		font-size: 20rpx;
		color: #FF6A00;
		margin-right: 16rpx;
		font-weight: bold;
	}

	.inviter-user {
		display: flex;
		align-items: center;
	}

	.mini-avatar {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	.mini-name {
		font-size: 24rpx;
		color: #666;
	}

	.silent-avatar {
		border: 2rpx solid #FF6A00;
	}

	.trace-page {
		background: #f8f9fa;
		min-height: 100vh;
		padding: 20rpx 30rpx;
	}

	.trace-item {
		background: #fff;
		border-radius: 24rpx;
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

	.silent-avatar {
		border: 2rpx solid #FF6A00;
		background: #FFF5EE;
	}

	.u-info {
		flex: 1;
		min-width: 0;
	}

	.u-top {
		display: flex;
		justify-content: space-between;
		margin-bottom: 6rpx;
	}

	.u-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.u-time {
		font-size: 24rpx;
		color: #bbb;
	}

	.u-assoc-row {
		display: flex;
		align-items: center;
		margin: 10rpx 0;
		background-color: #FFF9F5;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		width: fit-content;
	}

	.u-assoc-text {
		font-size: 24rpx;
		color: #FF6A00;
		margin-left: 8rpx;
	}

	.u-stats {
		margin-top: 10rpx;
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.u-count {
		font-size: 22rpx;
		color: #999;
	}

	.empty-box {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
	}

	.empty-img {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}

	.bottom-tips {
		padding: 40rpx;
		text-align: center;
		font-size: 22rpx;
		color: #ccc;
	}
</style>