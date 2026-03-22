<template>
	<view class="trace-page">
		<view class="list-container" v-if="list.length > 0">
			<view class="trace-item" v-for="item in list" :key="item.id" @click="goCard(item.memberUser)">
				<!-- 头像区域 -->
				<image :src="item.memberUser?.avatar || defaultAvatar" class="u-avatar" mode="aspectFill"></image>

				<!-- 信息区域 -->
				<view class="u-info">
					<view class="u-top">
						<text class="u-name">{{ item.memberUser?.nickname || '匿名商友' }}</text>
						<text class="u-time">{{ formatTime(item.createTime) }}</text>
					</view>

					<!-- 商务背景展示 (公司 & 职位) -->
					<view class="u-assoc-row">
						<uni-icons type="staff" size="14" color="#FF6A00"></uni-icons>
						<text class="u-assoc-text" :class="{ 'is-empty': !item.memberUser?.associationName }">
							{{ getAssociationJob(item.memberUser) }}
						</text>
					</view>


					<!-- 查看次数统计 -->
					<view class="u-stats" v-if="item.viewCount !== null && item.viewCount !== undefined">
						<uni-icons type="eye" size="14" color="#999"></uni-icons>
						<text class="u-count">已查看 {{ item.viewCount || 1 }} 次</text>
					</view>
				</view>

				<uni-icons type="right" size="16" color="#ccc"></uni-icons>
			</view>

			<!-- 静默用户入口：当正常列表加载完且有静默用户时显示 -->
			<view class="silent-entry-card" v-if="hasSilent"
				@click="goSilentList">
				<view class="trace-item silent-item">
					<image
						src="https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png"
						class="u-avatar silent-avatar-border" mode="aspectFill"></image>
					<view class="u-info">
						<view class="u-top">
							<text class="u-name">潜在商友</text>
							<text class="u-tag">意向访客</text>
						</view>
						<view class="u-desc">点击查看通过分享进入的潜在商友列表</view>
					</view>
					<uni-icons type="right" size="16" color="#FF6A00"></uni-icons>
				</view>
			</view>

			<!-- 3. 空状态：只有既没有普通用户，也没有静默用户时才显示 -->
			<view v-if="list.length === 0 && !hasSilent && loadingStatus === 'noMore'" class="empty-box">
				<image src="/static/icon/empty.png" class="empty-img"></image>
				<text>暂无浏览记录</text>
			</view>

			<uni-load-more :status="loadingStatus"></uni-load-more>
		</view>
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

	// 核心参数
	const targetId = ref(null);
	const targetType = ref('post'); // 默认为商机类型

	const hasSilent = ref(false);

	const list = ref([]);
	const pageNo = ref(1);
	const loadingStatus = ref('more');

	const defaultAvatar = '/static/icon/default-avatar.png';

	onLoad((options) => {
		console.log("options",options)
		// 1. 接收 ID
		targetId.value = options.id;

		// 2. 接收类型并设置页面标题
		// 类型：post-商机，store-聚店, activity-聚会
		if (options.type) {
			targetType.value = options.type;
		}

		// 根据类型动态设置导航栏标题
		const titleMap = {
			'post': '商机浏览记录',
			'store': '聚店浏览记录',
			'activity': '聚会浏览记录'
		};
		uni.setNavigationBarTitle({
			title: titleMap[targetType.value] || '浏览记录'
		});

		if (options.hasSilent == 1) {
			hasSilent.value = true;
		}

		loadData(true);
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') loadData();
	});

	/**
	 * 加载数据
	 */
	const loadData = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			list.value = [];
		}
		loadingStatus.value = 'loading';

		try {
			// 调用新的通用接口
			const {
				data,
				error
			} = await request('/app-api/member/target-view/page', {
				method: 'GET',
				data: {
					targetId: targetId.value,
					targetType: targetType.value, // 动态传入类型 (post/store/activity)
					pageNo: pageNo.value,
					pageSize: 20
				}
			});

			if (!error && data) {
				const newList = data.list || [];
				list.value = isRefresh ? newList : [...list.value, ...newList];

				// 判断是否还有更多
				if (list.value.length >= data.total) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;
				}
			} else {
				loadingStatus.value = 'more';
				if (error) uni.showToast({
					title: error,
					icon: 'none'
				});
			}
		} catch (e) {
			loadingStatus.value = 'more';
			console.error('加载留痕数据失败:', e);
		}
	};

	/**
	 * 跳转名片
	 */
	const goCard = (user) => {
		if (!user || !user.id) return;
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname || '')}&avatar=${encodeURIComponent(user.avatar || '')}`
		});
	};

	// 跳转到静默用户专用列表页
	const goSilentList = () => {
		uni.navigateTo({
			url: `/packages/silent-view-trace/silent-view-trace?id=${targetId.value}&type=${targetType.value}`
		});
	};

	/**
	 * [优化] 解析商协会职务显示
	 * 逻辑：取 associationName 和 professionalTitle 的第一个元素拼接
	 */
	const getAssociationJob = (user) => {
		if (!user) return '暂未填写商协会职务';

		// 后端返回的是逗号分隔的字符串，先进行切割 (兼容中英文逗号)
		const assocList = (user.associationName || '').split(/[,，]/).filter(s => s.trim());
		const titleList = (user.professionalTitle || '').split(/[,，]/).filter(s => s.trim());

		// 提取第一项
		const firstAssoc = assocList[0] || '';
		const firstTitle = titleList[0] || '';

		// 拼接显示
		if (firstAssoc && firstTitle) {
			return `${firstAssoc}·${firstTitle}`;
		} else if (firstAssoc || firstTitle) {
			return firstAssoc || firstTitle;
		}

		return '暂未填写商协会职务';
	};

	/**
	 * 时间格式化
	 */
	const formatTime = (ts) => {
		if (!ts) return '';
		const date = new Date(ts);
		const M = date.getMonth() + 1;
		const D = date.getDate();
		const h = date.getHours();
		const m = String(date.getMinutes()).padStart(2, '0');
		return `${M}月${D}日 ${h}:${m}`;
	};
</script>

<style scoped>
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
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	.u-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		background-color: #f0f0f0;
	}

	.u-info {
		flex: 1;
		min-width: 0;
	}

	.u-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
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

	/* 商务信息行 */
	/* 商协会职务行样式 */
	.u-assoc-row {
		display: flex;
		align-items: center;
		margin: 10rpx 0;
		background-color: #FFF9F5;
		/* 极浅的橙色背景 */
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		width: fit-content;
		/* 宽度自适应内容 */
		max-width: 100%;
	}

	.u-assoc-text {
		font-size: 24rpx;
		color: #FF6A00;
		/* 使用主题橙色 */
		margin-left: 8rpx;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 暂未填写时的弱化样式 */
	.u-assoc-text.is-empty {
		color: #999;
	}

	.u-assoc-row .uni-icons {
		flex-shrink: 0;
	}

	/* 调整统计行间距 */
	.u-stats {
		margin-top: 4rpx;
		padding-left: 10rpx;
	}

	/* 统计行 */
	.u-stats {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.u-count {
		font-size: 22rpx;
		color: #999;
	}

	.silent-border {
		border: 2rpx solid #FF6A00 !important;
	}

	.u-tag-intent {
		font-size: 20rpx;
		background: #FF6A00;
		color: #fff;
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
	}

	.silent-bg {
		background-color: #FFF5EE !important;
	}

	/* 空状态样式 */
	.empty-box {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 28rpx;
	}

	.empty-img {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}

	.silent-entry-card {
		margin-top: 10rpx;
	}

	.silent-item {
		border: 2rpx dashed #FF6A00;
		background: #FFF9F5;
	}

	.silent-avatar-border {
		border: 2rpx solid #FF6A00;
	}

	.u-tag {
		font-size: 20rpx;
		background: #FF6A00;
		color: #fff;
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
		margin-left: 10rpx;
	}

	.u-desc {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}
</style>