<template>
	<view class="page">
		<!-- 顶部标题区 -->
		<view class="page-header">
			<view class="header-title-row">
				<text class="header-title">互动信息</text>
				<text class="header-subtitle" v-if="postTitle">{{ postTitle }}</text>
			</view>
			<view class="header-count" v-if="interestList.length > 0">
				<text class="count-num">{{ interestList.length }}</text>
				<text class="count-label">位商友感兴趣</text>
			</view>
		</view>

		<!-- 筛选 Tab -->
		<view class="filter-bar">
			<view v-for="tab in filterTabs" :key="tab.value" class="filter-tab"
				:class="{ active: activeFilter === tab.value }" @click="activeFilter = tab.value">
				{{ tab.label }}
				<text v-if="tab.value === 'unread' && unreadCount > 0" class="tab-badge">{{ unreadCount }}</text>
			</view>
		</view>

		<!-- 列表内容 -->
		<view class="list-container">
			<!-- 加载中 -->
			<view v-if="isLoading" class="loading-wrap">
				<uni-icons type="spinner-cycle" size="32" color="#FF6A00" class="spin-icon"></uni-icons>
				<text class="loading-text">正在加载...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="filteredList.length === 0" class="empty-wrap">
				<text class="empty-icon">🤝</text>
				<text class="empty-title">
					{{ activeFilter === 'unread' ? '暂无未读意向' : '暂无感兴趣的商友' }}
				</text>
				<text class="empty-desc">发布优质猎伙信息，吸引更多商友！</text>
			</view>

			<!-- 列表 -->
			<view v-else>
				<view v-for="item in filteredList" :key="item.id" class="interest-card"
					:class="{ unread: !item.isRead }" @click="handleCardClick(item)">
					<!-- 未读红点 -->
					<view v-if="!item.isRead" class="unread-dot"></view>

					<!-- 头像 -->
					<view class="card-avatar-wrap">
						<image :src="item.avatar || defaultAvatar" class="card-avatar" mode="aspectFill" />
					</view>

					<!-- 用户信息 -->
					<view class="card-info">
						<view class="card-name-row">
							<text class="card-name">{{ item.nickname }}</text>
							<text v-if="!item.isRead" class="unread-tag">未读</text>
							<text v-else class="read-tag">已读</text>
						</view>
						<text class="card-time">
							<uni-icons type="time" size="12" color="#bbb"></uni-icons>
							{{ item.timeLabel }}
						</text>
					</view>

					<!-- 操作按钮 -->
					<view class="card-actions" @click.stop>
						<!-- 查看名片 -->
						<view class="action-btn card-btn" @click="viewBusinessCard(item)">
							<uni-icons type="contact" size="16" color="#FF6A00"></uni-icons>
							<text>名片</text>
						</view>
						<!-- 复制联系方式 -->
						<view class="action-btn contact-btn" :class="{ 'no-contact': !item.mobile }"
							@click="copyContact(item)">
							<uni-icons type="phone-filled" size="16" :color="item.mobile ? '#fff' : '#ccc'"></uni-icons>
							<text>{{ item.mobile ? '联系' : '未留' }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

	const defaultAvatar = '/static/icon/default-avatar.png';

	const isLoading = ref(true);
	const postId = ref(null);
	const postTitle = ref('');
	const rawList = ref([]); // 原始 targetInterests 数组
	const readIds = ref(new Set()); // 本地已读 ID 集合（用 storage 持久化）

	// 筛选 Tab
	const filterTabs = [{
			label: '全部',
			value: 'all'
		},
		{
			label: '今日',
			value: 'today'
		},
		{
			label: '未读',
			value: 'unread'
		},
	];
	const activeFilter = ref('all');

	// ===== 计算属性 =====

	/** 处理后的完整列表 */
	const interestList = computed(() => {
		return rawList.value.map(item => {
			const user = item.memberUser || {};
			return {
				id: item.id,
				userId: item.userId,
				nickname: user.nickname || '匿名用户',
				avatar: user.avatar || defaultAvatar,
				mobile: user.mobile || '',
				createTime: item.createTime,
				timeLabel: formatTime(item.createTime),
				isToday: isToday(item.createTime),
				isRead: readIds.value.has(item.id),
			};
		});
	});

	/** 未读数量 */
	const unreadCount = computed(() => interestList.value.filter(i => !i.isRead).length);

	/** 根据筛选条件过滤 */
	const filteredList = computed(() => {
		switch (activeFilter.value) {
			case 'today':
				return interestList.value.filter(i => i.isToday);
			case 'unread':
				return interestList.value.filter(i => !i.isRead);
			default:
				return interestList.value;
		}
	});

	// ===== 生命周期 =====

	onLoad(async (options) => {
		if (!options || !options.id) {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
			return;
		}
		postId.value = options.id;

		// 从 storage 读取已读 ID
		loadReadIds();

		// 获取详情数据
		await fetchDetail();
	});

	// ===== 数据获取 =====

	/**
	 * 调用商机详情接口获取 targetInterests 列表
	 */
	const fetchDetail = async () => {
		isLoading.value = true;
		try {
			const {
				data,
				error
			} = await request('/app-api/member/business-opportunities/get', {
				method: 'GET',
				data: {
					id: postId.value
				}
			});

			if (error || !data) {
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
				return;
			}

			postTitle.value = data.postTitle || '';

			// targetInterests 即感兴趣用户列表，按时间倒序排列
			const list = Array.isArray(data.targetInterests) ? data.targetInterests : [];
			rawList.value = list.sort((a, b) => b.createTime - a.createTime);

		} catch (e) {
			console.error('获取猎伙互动信息失败:', e);
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
		}
	};

	// ===== 已读管理（本地 storage）=====

	/** 从 storage 读取已读 ID 集合 */
	const loadReadIds = () => {
		try {
			const key = `liehuo_read_${postId.value}`;
			const saved = uni.getStorageSync(key);
			if (saved) {
				readIds.value = new Set(JSON.parse(saved));
			}
		} catch (e) {
			console.error('读取已读记录失败:', e);
		}
	};

	/**
	 * 将某条记录标记为已读并持久化
	 * @param {number} id - targetInterest 记录 id
	 */
	const markAsRead = (id) => {
		if (readIds.value.has(id)) return;
		readIds.value.add(id);
		try {
			const key = `liehuo_read_${postId.value}`;
			uni.setStorageSync(key, JSON.stringify([...readIds.value]));
		} catch (e) {
			console.error('保存已读记录失败:', e);
		}
	};

	// ===== 交互操作 =====

	/**
	 * 点击卡片：标记已读
	 * @param {object} item
	 */
	const handleCardClick = (item) => {
		markAsRead(item.id);
	};

	/**
	 * 查看商友名片
	 * @param {object} item
	 */
	const viewBusinessCard = (item) => {
		markAsRead(item.id);
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard` +
				`?id=${item.userId}` +
				`&name=${encodeURIComponent(item.nickname)}` +
				`&avatar=${encodeURIComponent(item.avatar)}`
		});
	};

	/**
	 * 复制联系方式（手机号）
	 * @param {object} item
	 */
	const copyContact = (item) => {
		if (!item.mobile) {
			uni.showToast({
				title: '该用户暂未留下联系方式',
				icon: 'none'
			});
			return;
		}
		markAsRead(item.id);
		uni.setClipboardData({
			data: item.mobile,
			success: () => {
				uni.showToast({
					title: '联系方式已复制',
					icon: 'success'
				});
			},
			fail: () => {
				uni.showToast({
					title: '复制失败，请手动记录',
					icon: 'none'
				});
			}
		});
	};

	// ===== 工具函数 =====

	/**
	 * 格式化时间戳为可读字符串
	 * @param {number} ts - 毫秒时间戳
	 */
	const formatTime = (ts) => {
		if (!ts) return '';
		const now = Date.now();
		const diff = now - ts;
		const min = Math.floor(diff / 60000);
		const hour = Math.floor(diff / 3600000);

		if (min < 1) return '刚刚';
		if (min < 60) return `${min}分钟前`;
		if (hour < 24) return `${hour}小时前`;

		const d = new Date(ts);
		const M = (d.getMonth() + 1).toString().padStart(2, '0');
		const D = d.getDate().toString().padStart(2, '0');
		const h = d.getHours().toString().padStart(2, '0');
		const m = d.getMinutes().toString().padStart(2, '0');
		return `${M}-${D} ${h}:${m}`;
	};

	/**
	 * 判断时间戳是否为今天
	 * @param {number} ts
	 */
	const isToday = (ts) => {
		if (!ts) return false;
		const d = new Date(ts);
		const now = new Date();
		return d.getFullYear() === now.getFullYear() &&
			d.getMonth() === now.getMonth() &&
			d.getDate() === now.getDate();
	};
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #f5f7fa;
	}

	/* ==================== 顶部标题区 ==================== */
	.page-header {
		background: linear-gradient(135deg, #1890FF, #40a9ff);
		padding: 40rpx 40rpx 50rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		border-radius: 0 0 40rpx 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.25);
	}

	.header-title-row {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.header-title {
		font-size: 44rpx;
		font-weight: 800;
		color: #fff;
		letter-spacing: 2rpx;
	}

	.header-subtitle {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		max-width: 420rpx;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.header-count {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20rpx;
		padding: 12rpx 24rpx;
		backdrop-filter: blur(10px);
	}

	.count-num {
		font-size: 48rpx;
		font-weight: 900;
		color: #fff;
		line-height: 1;
	}

	.count-label {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 4rpx;
	}

	/* ==================== 筛选 Tab ==================== */
	.filter-bar {
		display: flex;
		margin: 24rpx 30rpx 0;
		background: #fff;
		border-radius: 24rpx;
		padding: 8rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.filter-tab {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		font-size: 28rpx;
		color: #999;
		border-radius: 18rpx;
		transition: all 0.2s;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
	}

	.filter-tab.active {
		background: linear-gradient(135deg, #1890FF, #40a9ff);
		color: #fff;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
	}

	.tab-badge {
		background: #ff4d4f;
		color: #fff;
		font-size: 18rpx;
		min-width: 32rpx;
		height: 32rpx;
		border-radius: 16rpx;
		text-align: center;
		line-height: 32rpx;
		padding: 0 6rpx;
	}

	/* ==================== 列表区域 ==================== */
	.list-container {
		padding: 20rpx 30rpx 40rpx;
	}

	/* 加载状态 */
	.loading-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 120rpx 0;
		gap: 20rpx;
	}

	.spin-icon {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-size: 28rpx;
		color: #999;
	}

	/* 空状态 */
	.empty-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 100rpx 0;
		gap: 16rpx;
	}

	.empty-icon {
		font-size: 80rpx;
	}

	.empty-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.empty-desc {
		font-size: 26rpx;
		color: #bbb;
	}

	/* ==================== 感兴趣卡片 ==================== */
	.interest-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 28rpx 28rpx 36rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
		position: relative;
		overflow: hidden;
		transition: transform 0.15s;
	}

	.interest-card:active {
		transform: scale(0.985);
	}

	/* 未读卡片左侧蓝色竖条 */
	.interest-card.unread::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 8rpx;
		height: 100%;
		background: linear-gradient(to bottom, #1890FF, #40a9ff);
		border-radius: 4rpx 0 0 4rpx;
	}

	/* 未读红点 */
	.unread-dot {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 16rpx;
		height: 16rpx;
		background: #ff4d4f;
		border-radius: 50%;
		border: 3rpx solid #fff;
	}

	/* 头像 */
	.card-avatar-wrap {
		flex-shrink: 0;
	}

	.card-avatar {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		border: 4rpx solid #f0f0f0;
		background: #f5f5f5;
	}

	/* 用户信息 */
	.card-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.card-name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.card-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #222;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 240rpx;
	}

	.unread-tag {
		font-size: 20rpx;
		color: #1890FF;
		background: rgba(24, 144, 255, 0.1);
		border: 1rpx solid rgba(24, 144, 255, 0.3);
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.read-tag {
		font-size: 20rpx;
		color: #bbb;
		background: #f5f5f5;
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.card-time {
		font-size: 24rpx;
		color: #bbb;
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	/* 操作按钮组 */
	.card-actions {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: 500;
	}

	/* 查看名片按钮 */
	.card-btn {
		background: #FFF5EE;
		color: #FF6A00;
		border: 1rpx solid rgba(255, 106, 0, 0.25);
	}

	.card-btn:active {
		background: #FFE8D9;
	}

	/* 复制联系方式按钮 */
	.contact-btn {
		background: linear-gradient(135deg, #1890FF, #40a9ff);
		color: #fff;
		box-shadow: 0 4rpx 10rpx rgba(24, 144, 255, 0.25);
	}

	.contact-btn:active {
		opacity: 0.85;
	}

	/* 无联系方式时禁用样式 */
	.contact-btn.no-contact {
		background: #f0f0f0;
		color: #ccc;
		box-shadow: none;
	}
</style>