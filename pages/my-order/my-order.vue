<template>
	<view class="page-container">
		<!-- 顶部搜索区域 -->
		<view class="search-bar-sticky">
			<view class="search-bar">
				<uni-icons type="search" size="20" color="#999"></uni-icons>
				<input class="search-input" v-model="searchQuery" placeholder="输入支付订单号搜索" @confirm="handleSearch"
					confirm-type="search" />
				<button class="search-button" @click="handleSearch">搜索</button>
			</view>
		</view>

		<!-- 订单列表区域 -->
		<scroll-view class="record-list-container" scroll-y="true" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="isRefreshing" @refresherrefresh="onPullDownRefresh">

			<!-- 订单卡片列表 -->
			<view class="record-card" v-for="record in recordList" :key="record.id">
				<view class="card-header">
					<view class="remark">{{ record.remark || '无备注' }}</view>
					<view class="status-badge" :style="{ backgroundColor: getStatusInfo(record.status).color }">
						{{ getStatusInfo(record.status).text }}
					</view>
				</view>

				<view class="card-body">
					<view class="info-row">
						<text class="label">付款金额：</text>
						<text class="value amount">¥ {{ (record.amount || 0).toFixed(2) }}</text>
					</view>
					<view class="info-row">
						<text class="label">支付单号：</text>
						<text class="value">{{ record.payNo }}</text>
					</view>
					<view class="info-row">
						<text class="label">提交时间：</text>
						<text class="value">{{ formatTimestamp(record.createTime) }}</text>
					</view>
					<view class="info-row" v-if="record.imageUrls">
						<text class="label">支付凭证：</text>
						<view class="image-previews">
							<image v-for="(img, index) in record.imageUrls.split(',')" :key="index" :src="img"
								mode="aspectFill" class="preview-thumb" @click="previewImages(record.imageUrls, index)">
							</image>
						</view>
					</view>
				</view>

				<!-- 【需求】驳回信息和操作 -->
				<view class="card-footer rejected-section" v-if="record.status === 4 && record.errMsg">
					<view class="rejected-info">
						<uni-icons type="info-filled" color="#D9534F" size="18"></uni-icons>
						<text class="rejected-label">驳回原因：</text>
						<text class="rejected-msg">{{ record.errMsg }}</text>
					</view>
					<button class="re-upload-button" @click="handleReupload(record)">重新上传</button>
				</view>
			</view>

			<!-- 加载状态 -->
			<uni-load-more v-if="recordList.length > 0 || loadStatus !== 'more'" :status="loadStatus"></uni-load-more>

			<!-- 空状态 -->
			<view class="empty-state" v-if="recordList.length === 0 && loadStatus === 'noMore'">
				<uni-icons type="list" size="60" color="#e0e0e0"></uni-icons>
				<text class="empty-text">暂无付款记录</text>
			</view>

		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh,
		onShow
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js'; // 确保路径正确

	// --- 状态变量 ---
	const recordList = ref([]);
	const searchQuery = ref('');
	const pageNo = ref(1);
	const pageSize = 10;
	const hasMore = ref(true);
	const loadStatus = ref('more'); // 'more', 'loading', 'noMore'
	const isRefreshing = ref(false);
	const userInfo = ref(null); // 用于存储用户信息，特别是 userId

	// --- 生命周期函数 ---
	onShow(() => {
		// 使用 onShow 确保每次进入页面都能刷新数据
		// 比如从重新上传页回来后，列表应该更新
		initPage();
	});

	onPullDownRefresh(() => {
		isRefreshing.value = true;
		getRecordPage(true);
	});

	onReachBottom(() => {
		if (hasMore.value) {
			getRecordPage();
		}
	});

	// --- 核心逻辑 ---

	/**
	 * 初始化页面，获取用户信息并加载第一页数据
	 */
	const initPage = async () => {
		const { data, error } = await request('/app-api/member/user/get');
		if (error) {
			uni.showToast({ title: '获取用户信息失败', icon: 'none' });
			return;
		}
		userInfo.value = data;
		// 获取到用户信息后，再加载列表
		await getRecordPage(true);
	};

	/**
	 * 获取付款记录分页的核心函数
	 * @param {boolean} isRefresh - 是否为刷新操作
	 */
	const getRecordPage = async (isRefresh = false) => {
		if (loadStatus.value === 'loading') return;
		if (isRefresh) {
			pageNo.value = 1;
			hasMore.value = true;
			recordList.value = [];
		}
		if (!hasMore.value) {
			loadStatus.value = 'noMore';
			return;
		}

		loadStatus.value = 'loading';

		const params = {
			pageNo: pageNo.value,
			pageSize: pageSize,
			userId: userInfo.value.id, // 使用当前用户的ID
			payNo: searchQuery.value.trim(),
		};

		const { data, error } = await request('/app-api/member/user-post-pay-record/page', {
			method: 'GET',
			data: params
		});

		isRefreshing.value = false;

		if (error) {
			loadStatus.value = 'more';
			uni.showToast({ title: `加载失败: ${error}`, icon: 'none' });
			return;
		}

		const newList = data.list || [];
		const total = data.total || 0;

		if (isRefresh) {
			recordList.value = newList;
		} else {
			recordList.value.push(...newList);
		}

		// 更新分页状态
		if (recordList.value.length >= total) {
			hasMore.value = false;
			loadStatus.value = 'noMore';
		} else {
			hasMore.value = true;
			loadStatus.value = 'more';
			pageNo.value++;
		}
	};


	// --- 事件处理器 ---

	/**
	 * 处理搜索按钮点击
	 */
	const handleSearch = () => {
		getRecordPage(true);
	};

	/**
	 * 处理重新上传按钮点击
	 * @param {object} record - 被点击的订单记录
	 */
	const handleReupload = (record) => {
		// ‼️ 请确保 'my-active-secondRegistration' 页面存在
		// 可以将订单ID或其他信息通过URL参数传递
		uni.navigateTo({
			url: `/pages/my-active-secondRegistration/my-active-secondRegistration?id=${record.id}`
		});
	};
	
	/**
	 * 预览凭证图片
	 * @param {string} imageUrls - 逗号分隔的图片URL字符串
	 * @param {number} currentIndex - 当前点击的图片索引
	 */
	const previewImages = (imageUrls, currentIndex) => {
		const urls = imageUrls.split(',');
		uni.previewImage({
			urls: urls,
			current: currentIndex
		});
	};


	// --- 辅助函数 ---

	/**
	 * 根据状态码返回文本和颜色
	 * @param {number} status - 状态码
	 */
	const getStatusInfo = (status) => {
		switch (status) {
			case 1:
				return { text: '待确认', color: '#007BFF' };
			case 2:
				return { text: '确认支付', color: '#28A745' };
			case 3:
				return { text: '已操作数据', color: '#6C757D' };
			case 4:
				return { text: '驳回', color: '#D9534F' };
			default:
				return { text: '未知', color: '#6C757D' };
		}
	};
	
	/**
	 * 格式化时间戳
	 * @param {number} timestamp - 时间戳
	 */
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return 'N/A';
		const date = new Date(timestamp);
		return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
	};

</script>

<style lang="scss" scoped>
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar-sticky {
		position: sticky;
		top: 0;
		background-color: #ffffff;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 40rpx;
		padding: 0 10rpx 0 25rpx;
	}

	.search-input {
		flex: 1;
		height: 70rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}

	.search-button {
		background: #FF6E00;
		color: white;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 26rpx;
		border-radius: 30rpx;
		padding: 0 30rpx;
		margin-left: 10rpx;
		border: none;

		&::after {
			border: none;
		}
	}

	.record-list-container {
		flex: 1;
		height: 0; // 关键：让 scroll-view 在 flex 布局中正确计算高度
	}
	
	.record-card {
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		overflow: hidden;
	}
	
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.remark {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
		
		.status-badge {
			padding: 8rpx 20rpx;
			border-radius: 30rpx;
			color: white;
			font-size: 24rpx;
			font-weight: 500;
		}
	}
	
	.card-body {
		padding: 30rpx;
	}
	
	.info-row {
		display: flex;
		align-items: flex-start;
		font-size: 28rpx;
		margin-bottom: 20rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.label {
			color: #888;
			width: 160rpx;
			flex-shrink: 0;
		}
		
		.value {
			color: #333;
			flex: 1;
			word-break: break-all;
			
			&.amount {
				color: #FF6E00;
				font-weight: bold;
				font-size: 32rpx;
			}
		}
	}
	
	.image-previews {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.preview-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		background-color: #f0f0f0;
	}
	
	.card-footer.rejected-section {
		background-color: #FFF4F4;
		padding: 25rpx 30rpx;
		border-top: 1rpx solid #FFE0E0;
	}
	
	.rejected-info {
		display: flex;
		align-items: flex-start;
		color: #D9534F;
		font-size: 26rpx;
		margin-bottom: 20rpx;
		
		.rejected-label {
			font-weight: 500;
			margin: 0 10rpx;
			flex-shrink: 0;
		}
		.rejected-msg {
			flex: 1;
			line-height: 1.5;
		}
	}
	
	.re-upload-button {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background-color: #FF6E00;
		color: white;
		font-size: 30rpx;
		border-radius: 40rpx;
		
		&::after {
			border: none;
		}
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 150rpx 0;
		
		.empty-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #999;
		}
	}
</style>