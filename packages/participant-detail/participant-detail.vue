<template>
	<view class="page-container">
		<!-- 1. 统计信息栏 -->
		<!-- <view class="stats-bar">
			<text>共 <text class="highlight">{{ total }}</text> 人报名</text>
		</view> -->

		<view class="tips-bar">
			<uni-icons type="info" size="14" color="#909399"></uni-icons>
			<text>表格仅展示部分信息，完整内容请“下载到邮箱”查看</text>
		</view>

		<!-- 2. 表格容器 (使用 scroll-view 实现滚动) -->
		<!-- scroll-y 必须要有确定的高度，这里通过 calc 计算剩余高度 -->
		<scroll-view scroll-y scroll-x class="table-scroll" enable-flex="true" @scrolltolower="loadMore"
			:lower-threshold="50">
			<view class="table-wrapper">
				<!-- 表头 (Sticky 吸顶) -->
				<view class="table-header">
					<view class="th cell-name">姓名</view>
					<view class="th cell-nickname">昵称</view>
					<view class="th cell-gender">性别</view>
					<!-- <view class="th cell-era">年代</view> -->
					<view class="th cell-mobile">手机</view>
					<!-- <view class="th cell-company">公司</view> -->
					<!-- <view class="th cell-level">社交级别</view> -->
					<!-- <view class="th cell-job">职务</view> -->
					<!-- <view class="th cell-vip">会员级别</view> -->
				</view>

				<!-- 数据行 -->
				<view v-for="(item, index) in list" :key="index" class="table-row"
					:class="{ 'stripe': index % 2 === 1 }">
					<view class="td cell-name">{{ item.realName || '-' }}</view>
					<view class="td cell-nickname">{{ item.nickname || '-' }}</view>
					<view class="td cell-gender">{{ getGenderText(item.sex) }}</view>
					<!-- <view class="td cell-era">{{ item.era || '-' }}</view> -->
					<view class="td cell-mobile">{{ item.mobile || '-' }}</view>
					<!-- <view class="td cell-company">{{ item.companyName || '-' }}</view> -->
					<!-- <view class="td cell-job">{{ item.professionalTitle || '-' }}</view> -->
					<!-- <view class="td cell-level">{{ item.level || '-' }}</view> -->
					<!-- <view class="td cell-vip">{{ item.topUpLevel || '-' }}</view> -->
				</view>

				<!-- 加载状态 -->
				<uni-load-more :status="loadingStatus" v-if="list.length > 0 || loadingStatus === 'loading'" />

				<!-- 空状态 -->
				<view v-if="list.length === 0 && loadingStatus === 'noMore'" class="empty-state">
					<uni-icons type="staff" size="50" color="#ccc"></uni-icons>
					<text>暂无参会人员</text>
				</view>
			</view>
		</scroll-view>

		<!-- 3. 底部操作栏 -->
		<view class="footer-bar safe-area-bottom">
			<button class="export-btn" @click="handleExport" :disabled="list.length === 0">
				<uni-icons type="email-filled" size="18" color="#fff" style="margin-right: 8rpx;"></uni-icons>
				下载到邮箱
			</button>
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

	// --- 状态管理 ---
	const activityId = ref('');
	const organizerId = ref('');
	const list = ref([]);
	const total = ref(0);
	const pageNo = ref(1);
	const pageSize = 10;
	const loadingStatus = ref('more'); // more, loading, noMore

	// --- 生命周期 ---
	onLoad((options) => {
		if (options.id) {
			activityId.value = options.id;
			// 通常 organizerId 是当前登录用户（或者是从上一页传过来的）
			// 这里假设后端接口如果是查“我的发布”，organizerId 可以传当前 userId
			organizerId.value = uni.getStorageSync('userId');

			loadData(true);
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		}
	});

	// --- 数据加载 ---
	const loadData = async (isRefresh = false) => {
		if (loadingStatus.value === 'loading') return;
		if (!isRefresh && loadingStatus.value === 'noMore') return;

		loadingStatus.value = 'loading';
		if (isRefresh) {
			pageNo.value = 1;
			list.value = [];
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/participant-detail', {
				method: 'GET',
				data: {
					activityId: activityId.value,
					// organizerId: organizerId.value,
					pageNo: pageNo.value,
					pageSize: pageSize
				}
			});

			if (!error && data) {
				const newList = data.list || [];
				list.value = isRefresh ? newList : [...list.value, ...newList];
				total.value = data.total || 0;

				if (list.value.length >= total.value) {
					loadingStatus.value = 'noMore';
				} else {
					loadingStatus.value = 'more';
					pageNo.value++;

					if (list.value.length < 12) {
						console.log('数据量较少，自动加载下一页...');
						// 使用 nextTick 或 setTimeout 避免递归过快
						setTimeout(() => {
							loadMore();
						}, 200);
					}
				}
			} else {
				loadingStatus.value = 'more'; // 失败允许重试
				uni.showToast({
					title: error || '加载失败',
					icon: 'none'
				});
			}
		} catch (e) {
			loadingStatus.value = 'more';
			console.error(e);
		}

		console.log(`加载完成: 当前数量=${list.value.length}, 总数=${total.value}, 状态=${loadingStatus.value}`);
	};

	const loadMore = () => {
		loadData(false);
	};

	// --- 辅助方法 ---
	const getGenderText = (sex) => {
		if (sex === 1) return '男';
		if (sex === 2) return '女';
		return '未知';
	};

	// --- 导出功能 ---
	const handleExport = () => {
		if (list.value.length === 0) return;

		uni.showModal({
			title: '导出到邮箱',
			content: '',
			editable: true, // 显示输入框
			placeholderText: '请输入接收邮箱地址',
			confirmText: '发送',
			success: async (res) => {
				if (res.confirm) {
					const email = res.content.trim();
					if (!validateEmail(email)) {
						uni.showToast({
							title: '邮箱格式不正确',
							icon: 'none'
						});
						return;
					}

					await sendExportRequest(email);
				}
			}
		});
	};

	const validateEmail = (email) => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	};

	const sendExportRequest = async (email) => {
		uni.showLoading({
			title: '文件生成中...',
			mask: true
		});

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/export-to-email', {
				method: 'POST',
				data: {
					activityId: activityId.value,
					email: email
				}
			});

			uni.hideLoading();

			if (!error && data === true) {
				uni.showModal({
					title: '发送成功',
					content: '参会者清单已发送到您的邮箱，请查收。',
					showCancel: false,
					confirmText: '知道了'
				});
			} else {
				uni.showToast({
					title: error || '发送失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.hideLoading();
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		}
	};
</script>

<style lang="scss" scoped>
	$primary-color: #FF6B00;
	$header-bg: #f5f7fa;
	$border-color: #ebeef5;
	$text-main: #333;
	$text-sub: #666;

	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #fff;
		position: relative;
	}

	/* 统计栏 */
	.stats-bar {
		padding: 20rpx 30rpx;
		background-color: #fff8e1;
		/* 浅黄色背景提示 */
		color: #ff8f00;
		font-size: 28rpx;
		font-weight: 500;
		border-bottom: 1rpx solid #ffe0b2;

		.highlight {
			font-weight: bold;
			margin: 0 4rpx;
			font-size: 32rpx;
		}
	}

	/* 温馨提示条 */
	.tips-bar {
		background-color: #f4f4f5;
		color: #909399;
		font-size: 24rpx;
		padding: 12rpx 30rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	/* 表格滚动区 */
	.table-scroll {
		flex: 1;
		height: 0;
		/* 配合 flex 布局 */
		width: 100%;
		overflow: hidden;
		// white-space: nowrap;
		/* 允许横向滚动（虽然这里主要做纵向，但为了不换行） */
	}

	.table-wrapper {
		display: inline-block;
		/* 关键：让容器宽度随内容撑开 */
		min-width: 100%;
		padding-bottom: 40rpx;
		vertical-align: top;
		/* 防止底部出现不明空隙 */
	}

	/* 表格行通用样式 */
	.table-header,
	.table-row {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		border-bottom: 1rpx solid $border-color;
		/* 关键：让行宽根据子元素自动撑开，不换行 */
		width: max-content;
		min-width: 100%;
		/* 至少占满屏幕宽 */
		box-sizing: border-box;
	}

	/* 表头样式 */
	.table-header {
		background-color: $header-bg;
		position: sticky;
		top: 0;
		z-index: 10;
		height: 80rpx;

		.th {
			font-size: 26rpx;
			font-weight: bold;
			color: $text-main;
			padding: 0 10rpx;
			flex-shrink: 0;
			/* 防止压缩 */
			text-align: center;
		}
	}

	/* 数据行样式 */
	.table-row {
		height: 90rpx;
		background-color: #fff;

		&.stripe {
			background-color: #fafafa;
			/* 斑马纹 */
		}

		.td {
			font-size: 26rpx;
			color: $text-sub;
			padding: 0 10rpx;
			flex-shrink: 0;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	/* 列宽定义 (总宽度超过 100% 时会出现横向滚动条，这是符合预期的表格体验) */
	.cell-name {
		width: 140rpx;
	}

	.cell-nickname {
		width: 160rpx;
	}

	.cell-gender {
		width: 80rpx;
	}

	.cell-era {
		width: 120rpx;
	}

	.cell-mobile {
		width: 200rpx;
	}

	.cell-company {
		width: 220rpx;
	}

	.cell-job {
		width: 160rpx;
	}

	.cell-level {
		width: 140rpx;
	}

	.cell-vip {
		width: 140rpx;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		color: #ccc;

		text {
			font-size: 28rpx;
			margin-top: 20rpx;
		}
	}

	/* 底部操作栏 */
	.footer-bar {
		padding: 20rpx 30rpx;
		background-color: #fff;
		border-top: 1rpx solid $border-color;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
	}

	.safe-area-bottom {
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.export-btn {
		background: linear-gradient(135deg, $primary-color, #ff8c00);
		color: #fff;
		border-radius: 44rpx;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;

		&::after {
			border: none;
		}

		&:active {
			opacity: 0.9;
		}

		&[disabled] {
			background: #e0e0e0;
			color: #999;
		}
	}
</style>