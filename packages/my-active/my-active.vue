<template>
	<view class="page-container">

		<!-- 分段器 (保持原样) -->
		<view class="segmented-container">
			<uni-segmented-control :current="currentTab" :values="tabs" @clickItem="switchTab" style-type="button"
				active-color="#FF6B00" />
		</view>

		<!-- 我的报名聚会 -->
		<view v-show="currentTab === 0" scroll-y class="content-scroll" refresher-enabled
			:refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="onReachBottom">
			<view class="section-header">
				<text class="section-title">✍️ 我报名的聚会</text>
			</view>

			<!-- 聚会列表 -->
			<view v-if="enrolledActivities.length > 0" class="activity-list">
				<view v-for="(item, index) in enrolledActivities" :key="item.id" class="activity-card"
					@click="handleActivityClick(item.id)">

					<!-- 顶部封面与状态 -->
					<view class="card-cover-wrapper">
						<image class="activity-image" :src="item.coverImageUrl" mode="aspectFill" />
						<!-- 状态标签悬浮显示 -->
						<view v-if="item.memberActivityJoinResp.rejectMsg" class="status-badge status-rejected">
							已驳回
						</view>
						<view v-else class="status-badge"
							:class="getStatusClass(item.memberActivityJoinResp.paymentStatusStr)">
							{{ item.memberActivityJoinResp.paymentStatusStr }}
						</view>
					</view>

					<view class="card-body">
						<view class="card-header-row">
							<text class="activity-title">{{ item.activityTitle }}</text>
						</view>

						<view class="info-list">
							<view class="info-item">
								<uni-icons type="calendar" size="14" color="#999" />
								<text class="info-text">{{ formatDateTime(item.startDatetime) }}</text>
							</view>
							<view class="info-item">
								<uni-icons type="map-pin" size="14" color="#999" />
								<text class="info-text">{{ item.locationAddress || '线上聚会' }}</text>
							</view>
							<view class="info-item">
								<uni-icons type="person" size="14" color="#999" />
								<text class="info-text">报名情况:
									{{ item.joinCount || 0 }}/{{ item.totalSlots || '不限' }}人</text>
							</view>
						</view>

						<!-- 驳回原因提示 -->
						<view v-if="item.memberActivityJoinResp.rejectMsg" class="reject-box">
							<uni-icons type="info-filled" color="#f56c6c" size="16"></uni-icons>
							<text class="reject-text">原因: {{ item.memberActivityJoinResp.rejectMsg }}</text>
						</view>

						<view class="card-footer">
							<view class="action-buttons">
								<button
									v-if="['待支付', '已支付', '替补', '待确定'].includes(item.memberActivityJoinResp.paymentStatusStr) && !item.memberActivityJoinResp.rejectMsg"
									class="btn btn-outline-danger" @click.stop="cancelEnroll(item.id)">
									取消报名
								</button>

								<button v-if="item.memberActivityJoinResp.paymentStatusStr === '待退款'"
									class="btn btn-outline-primary" @click.stop="applyForRefund(item)">
									申请退款
								</button>

								<button v-if="item.memberActivityJoinResp.rejectMsg" class="btn btn-gradient-warning"
									@click.stop="navigateToReUpload(item)">
									重新上传
								</button>

								<button class="btn btn-light" @click.stop="viewDetail(item.id)">
									查看详情
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state-placeholder">
				<text class="empty-title">暂无报名聚会</text>
				<text class="empty-desc">快去发现并报名感兴趣的聚会吧</text>
				<button class="primary-btn" @click="navigateToDiscover">去发现</button>
			</view>

		</view>

		<!-- 我的发布聚会 -->
		<view v-show="currentTab === 1" scroll-y class="content-scroll" refresher-enabled
			:refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="onReachBottom">
			<view class="section-header">
				<text class="section-title">📢 我发起的聚会</text>
			</view>

			<!-- 聚会列表 -->
			<view v-if="publishedActivities.length > 0" class="activity-list">
				<view v-for="(item, index) in publishedActivities" :key="item.id" class="activity-card"
					@click="handleActivityClick(item.id)">

					<view class="card-cover-wrapper">
						<image class="activity-image" :src="item.coverImageUrl" mode="aspectFill" />
						<view class="status-badge" :class="getStatusClass(item.statusStr)">
							{{ item.statusStr }}
						</view>
					</view>

					<view class="card-body">
						<view class="card-header-row">
							<text class="activity-title">{{ item.activityTitle }}</text>
						</view>

						<view class="info-list">
							<view class="info-item">
								<uni-icons type="calendar" size="14" color="#999" />
								<text class="info-text">{{ formatDateTime(item.startDatetime) }}</text>
							</view>
							<view class="info-item">
								<uni-icons type="map-pin" size="14" color="#999" />
								<text class="info-text">{{ item.locationAddress || '线上聚会' }}</text>
							</view>
							<view class="info-item">
								<uni-icons type="person" size="14" color="#999" />
								<text class="info-text">报名情况:
									{{ item.joinCount || 0 }}/{{ item.totalSlots || '不限' }}人</text>
							</view>
						</view>

						<view class="card-footer">
							<view class="action-buttons">
								<!-- 核心操作按钮 (始终显示) -->
								<button v-if="item.paddingReturnCount > 0" class="btn btn-gradient-primary icon-btn"
									@click.stop="manageRefunds(item, 'individual')">
									处理申请 <view class="badge-dot">{{ item.paddingReturnCount }}</view>
								</button>

								<!-- 【优化1】为“报名商友”按钮增加待确认提醒 -->
								<button class="btn btn-outline-primary icon-btn"
									@click.stop="navigateToRegisteredUsers(item)">
									报名商友
									<view v-if="item.pendingConfirmCount > 0" class="badge-dot">
										{{ item.pendingConfirmCount }}
									</view>
								</button>

								<button v-if="item.statusStr === '活动取消' || item.statusStr === '聚会取消'"
									class="btn btn-gradient-danger" @click.stop="manageRefunds(item, 'all')">
									处理退款
								</button>

								<!-- 【优化2】新增“更多”按钮 -->
								<button class="btn btn-light" @click.stop="showMoreActions(item)">
									更多
								</button>
							</view>
							
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state-placeholder">
				<text class="empty-title">暂无发布聚会</text>
				<text class="empty-desc">创建一个聚会，邀请大家参与吧</text>
				<button class="primary-btn" @click="navigateToCreate">创建聚会</button>
			</view>

		</view>

		<view v-if="loading" class="loading-more">加载中...</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	// 【修改 3】引入 onShow 生命周期钩子
	import {
		onShow,
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// --- 状态管理 ---
	const currentTab = ref(0);
	const tabs = ref(['我的报名', '我的发起']);
	const refreshing = ref(false);
	const loading = ref(false);

	const enrolledActivities = ref([]);
	const enrolledPageNo = ref(1);
	const enrolledHasMore = ref(true);

	const publishedActivities = ref([]);
	const publishedPageNo = ref(1);
	const publishedHasMore = ref(true);


	// --- 生命周期 ---
	onLoad((options) => {
		if (options && options.currentTab) {
			currentTab.value = parseInt(options.currentTab);
		}
	});
	/**
	 * 【核心修改 3】使用 onShow 刷新数据
	 * 每次进入页面都会触发，确保数据是当前 Tab 最新的。
	 * onLoad 已被移除，因为 onShow 在首次进入时也会执行。
	 */
	onShow(() => {
		console.log("页面显示，刷新当前 Tab 数据");
		// 直接调用下拉刷新的逻辑，实现数据刷新
		handleRefresh();
	});


	// --- 核心方法：获取数据 ---
	const getMyActivitiesList = async (isLoadMore = false) => {
		if (loading.value) return;

		const currentHasMore = currentTab.value === 0 ? enrolledHasMore.value : publishedHasMore.value;
		if (isLoadMore && !currentHasMore) {
			// uni.showToast({ title: '没有更多数据了', icon: 'none' });
			return;
		}

		loading.value = true;

		const currentPageNo = currentTab.value === 0 ? enrolledPageNo.value : publishedPageNo.value;
		const params = {
			pageNo: currentPageNo,
			pageSize: 10,
			tabIndex: currentTab.value
		};

		try {
			const result = await request('/app-api/member/activity/my-list', {
				method: 'GET',
				data: params
			});

			console.log(`获取Tab ${currentTab.value} 的聚会`, result);

			if (result && !result.error && result.data) {
				const list = result.data.list || [];
				const total = result.data.total || 0;

				if (currentTab.value === 0) {
					enrolledActivities.value = isLoadMore ? [...enrolledActivities.value, ...list] : list;
					enrolledHasMore.value = enrolledActivities.value.length < total;
					// 只有在请求成功后才增加页码
					enrolledPageNo.value++;
				} else {
					publishedActivities.value = isLoadMore ? [...publishedActivities.value, ...list] : list;
					publishedHasMore.value = publishedActivities.value.length < total;
					// 只有在请求成功后才增加页码
					publishedPageNo.value++;
				}
			}
		} catch (error) {
			console.error("请求我的聚会列表失败:", error);
		} finally {
			loading.value = false;
			refreshing.value = false;
		}
	};


	// --- 事件处理 ---

	// 切换 Tab
	const switchTab = (e) => {
		if (currentTab.value === e.currentIndex) return;

		currentTab.value = e.currentIndex;
		const list = currentTab.value === 0 ? enrolledActivities.value : publishedActivities.value;
		// 如果切换到的 Tab 列表为空，则加载数据
		if (list.length === 0) {
			handleRefresh();
		}
	};

	// 下拉刷新 (手动触发)
	const onRefresh = () => {
		handleRefresh();
	};

	// 页面滚动到底部 (上拉加载)
	const onReachBottom = () => {
		getMyActivitiesList(true);
	};

	// 统一的刷新处理函数
	const handleRefresh = async () => {
		if (refreshing.value) return;
		refreshing.value = true;

		if (currentTab.value === 0) {
			enrolledPageNo.value = 1;
			enrolledHasMore.value = true;
		} else {
			publishedPageNo.value = 1;
			publishedHasMore.value = true;
		}
		await getMyActivitiesList(false);
	};


	// --- 辅助方法 ---

	/**
	 * @description 【优化2】点击“更多”按钮，弹出操作菜单
	 * @param {object} activityItem - 当前操作的聚会对象
	 */
	const showMoreActions = (activityItem) => {
		// 1. 动态构建操作列表
		const itemList = [];
		const availableActions = {};

		// 根据聚会状态动态添加可执行的操作
		// 参会名单
		itemList.push('参会名单');
		availableActions['参会名单'] = () => navigateToParticipantList(activityItem.id);

		// 取消聚会
		if (['未开始', '报名中', '活动即将开始', '进行中'].includes(activityItem.statusStr)) {
			itemList.push('取消聚会');
			availableActions['取消聚会'] = () => cancelActivity(activityItem.id);
		}

		// 修改编辑
		itemList.push('修改编辑');
		availableActions['修改编辑'] = () => navigateToEdit(activityItem.id);

		// 2. 调用 uni.showActionSheet
		uni.showActionSheet({
			itemList: itemList,
			success: (res) => {
				const tappedItem = itemList[res.tapIndex];
				// 3. 根据用户点击的文本，执行对应的函数
				if (availableActions[tappedItem]) {
					availableActions[tappedItem]();
				}
			},
			fail: (res) => {
				console.log(res.errMsg);
			}
		});
	};

	/**
	 * 【核心修改 1 & 2】根据状态字符串返回对应的 CSS 类名
	 * "pending" -> "待支付"
	 * "paid" -> "已支付"
	 * "pending_refund" -> "待退款"
	 * "refunded" -> "已退款"
	 * "padding" -> "替补"
	 */
	const getStatusClass = (statusStr) => {
		const classMap = {
			// 我的报名状态
			'待支付': 'pending_payment', // 假设用 pending 样式
			'已支付': 'enrolled', // 假设用 enrolled 样式
			'待确定': 'pending',
			'待退款': 'refund_pending',
			'已退款': 'ended', // 假设用 ended 样式
			'替补': 'upcoming', // 假设用 upcoming 样式
			'已驳回': 'status-rejected',

			// 我的发布状态 (保持不变)
			'已取消': 'canceled',
			'未开始': 'upcoming',
			'报名中': 'enrolled',
			'活动即将开始': 'upcoming',
			'进行中': 'ongoing',
			'已结束': 'ended'
		};
		return classMap[statusStr] || '';
	};

	const formatDateTime = (dateTimeStr) => {
		if (!dateTimeStr) return '时间待定';
		const date = new Date(dateTimeStr);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	};


	// --- 页面跳转与操作 (保持不变) ---
	const handleActivityClick = (activityId) => {
		uni.navigateTo({
			url: `/packages/active-detail/active-detail?id=${activityId}`
		});
	};

	const viewDetail = (activityId) => {
		uni.navigateTo({
			url: `/packages/active-detail/active-detail?id=${activityId}`
		});
	};

	const cancelEnroll = (activityId) => {
		uni.showModal({
			title: '提示',
			content: '确定要取消报名吗？',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '正在提交...'
					});
					const result = await request('/app-api/member/activity/quit-activity', {
						method: 'POST',
						data: {
							id: activityId
						}
					});
					uni.hideLoading();

					if (result && !result.error) {
						uni.showToast({
							title: '取消成功',
							icon: 'success'
						});
						handleRefresh();
					} else {
						uni.showToast({
							title: result.error || '操作失败',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	const applyForRefund = (activityItem) => {
		const activityJson = JSON.stringify(activityItem);
		const encodedData = encodeURIComponent(activityJson);
		uni.navigateTo({
			url: `/pages/my-active-apply/my-active-apply?item=${encodedData}`
		});
	};

	const cancelActivity = (activityId) => {
		console.log("一进来就调用")
		uni.showModal({
			title: '警告',
			content: '确定要取消您发布的此聚会吗？此操作不可逆。',
			confirmColor: '#f44336',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '正在删除...'
					});
					const result = await request('/app-api/member/activity/delete', {
						method: 'POST',
						data: {
							id: activityId
						}
					});
					uni.hideLoading();

					if (result && !result.error) {
						uni.showToast({
							title: '聚会已取消',
							icon: 'success'
						});
						handleRefresh();
					} else {
						uni.showToast({
							title: result.error || '操作失败',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	const manageRefunds = (activityItem, mode) => {
		const activityJson = JSON.stringify(activityItem);
		const encodedData = encodeURIComponent(activityJson);
		uni.navigateTo({
			url: `/pages/my-active-manage/my-active-manage?item=${encodedData}&mode=${mode}`
		});
	};

	/**
	 * 【新增】跳转到重新上传凭证页面
	 * @param {object} activityItem - 当前聚会对象
	 */
	const navigateToReUpload = (activityItem) => {
		const activityJson = JSON.stringify(activityItem);
		const encodedData = encodeURIComponent(activityJson);
		uni.navigateTo({
			url: `/pages/my-active-secondRegistration/my-active-secondRegistration?item=${encodedData}`
		});
	};

	/**
	 * 跳转到报名用户页面
	 * @param {object} activityItem - 当前聚会对象
	 */
	const navigateToRegisteredUsers = (activityItem) => {
		const activityJson = JSON.stringify(activityItem);
		const encodedData = encodeURIComponent(activityJson);
		uni.navigateTo({
			url: `/pages/my-active-registeredUser/my-active-registeredUser?item=${encodedData}`
		});
	};

	const navigateToDiscover = () => {
		uni.switchTab({
			url: '/pages/active/active'
		});
	};

	const navigateToCreate = () => {
		uni.navigateTo({
			url: '/packages/active-publish/active-publish'
		});
	};

	// 跳转到编辑页面
	const navigateToEdit = (activityId) => {
		// 跳转到发布页，并携带 mode=edit 和 id 参数
		uni.navigateTo({
			url: `/packages/active-publish/active-publish?mode=edit&id=${activityId}`
		});
	};

	/**
	 * 跳转到参会者清单页面
	 * @param {string|number} activityId - 聚会ID
	 */
	const navigateToParticipantList = (activityId) => {
		uni.navigateTo({
			url: `/packages/participant-detail/participant-detail?id=${activityId}`
		});
	};
</script>


<style lang="scss" scoped>
	/* --- 全局变量 --- */
	$primary-color: #FF6B00;
	$danger-color: #f56c6c;
	$success-color: #4caf50;
	$bg-color: #f5f7fa;
	$card-bg: #ffffff;
	$text-main: #1c1e21;
	$text-sub: #666;

	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $bg-color;
	}

	.segmented-container {
		padding: 20rpx 24rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #f0f2f5;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.content-scroll {
		flex: 1;
		height: 1px;
		padding: 0 24rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		padding: 24rpx 0;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: $text-main;
		}
	}

	.activity-list {
		padding-bottom: 40rpx;
	}

	/* --- 全新卡片样式 --- */
	.activity-card {
		background-color: $card-bg;
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.99);
		}
	}

	/* 图片封面区 */
	.card-cover-wrapper {
		position: relative;
		width: 100%;
		height: 280rpx;
		/* 增加图片高度展示 */
	}

	.activity-image {
		width: 100%;
		height: 100%;
	}

	/* 悬浮状态标签 */
	.status-badge {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		padding: 6rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: #fff;
		background-color: rgba(0, 0, 0, 0.5);
		/* 默认半透明黑 */
		backdrop-filter: blur(4px);
		/* 毛玻璃效果 */

		&.enrolled,
		&.ongoing {
			background-color: $success-color;
		}

		&.pending,
		&.upcoming,
		&.pending_payment {
			background-color: #ff9800;
		}

		&.refund_pending {
			background-color: #2196f3;
		}

		&.canceled,
		&.status-rejected {
			background-color: $danger-color;
		}

		&.ended {
			background-color: #909399;
		}
	}

	.card-body {
		padding: 24rpx;
	}

	.card-header-row {
		margin-bottom: 16rpx;
	}

	.activity-title {
		font-size: 32rpx;
		font-weight: 700;
		color: $text-main;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* 信息列表 */
	.info-list {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		margin-bottom: 20rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: $text-sub;

		.info-text {
			margin-left: 10rpx;
		}
	}

	/* 驳回提示框 */
	.reject-box {
		background-color: #fef0f0;
		padding: 16rpx 20rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: flex-start;
		border: 1rpx solid #fde2e2;

		.reject-text {
			font-size: 24rpx;
			color: $danger-color;
			line-height: 1.4;
			margin-left: 10rpx;
			flex: 1;
		}
	}

	/* 底部操作区 */
	.card-footer {
		border-top: 1rpx solid #f0f2f5;
		/* 这里的 padding 可以保留，作为分割线和滚动区之间的间距 */
		padding-top: 10rpx;
	}

	.action-buttons {
		display: flex;
		justify-content: flex-end;
		/* 按钮靠右对齐 */
		align-items: center;
		gap: 16rpx;
		/* 【关键】允许换行，以防万一按钮过多 */
		flex-wrap: wrap;
	}

	// .action-scroll {
	// 	width: 100%;
	// 	white-space: nowrap;
	// 	/* 移除 scroll-view 上的 padding，避免影响滚动条位置 */
	// }

	// .action-buttons-inner {
	// 	display: flex;
	// 	flex-direction: row;
	// 	justify-content: flex-end;
	// 	align-items: center;
	// 	gap: 16rpx;
	// 	width: max-content;
	// 	min-width: 100%;

	// 	/* 【关键修复】让内部容器的顶部有 padding，从而把按钮“压”下去 */
	// 	/* 20rpx 足够容纳 top: -16rpx 的徽标 */
	// 	padding-top: 20rpx;

	// 	padding-right: 4rpx;
	// 	padding-bottom: 4rpx;
	// }

	/* 3. 关键：针对所有按钮禁止压缩 */
	.btn {
		flex-shrink: 0 !important;
		/* 强制不压缩 */
		white-space: nowrap;
		/* 按钮文字不换行 */
	}

	/* 针对带徽标的按钮容器也要禁止压缩 */
	.icon-btn {
		position: relative;
		overflow: visible;
		/* 允许徽标溢出 */
	}

	.action-buttons {
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.badge-dot {
		position: absolute;
		top: -16rpx;
		right: -10rpx;
		background-color: $danger-color;
		color: #fff;
		font-size: 20rpx;
		height: 32rpx;
		min-width: 32rpx;
		line-height: 32rpx;
		text-align: center;
		border-radius: 16rpx;
		padding: 0 8rpx;
		border: 2rpx solid #fff;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	/* --- 按钮样式重构 --- */
	.btn {
		margin: 0;
		padding: 0 28rpx;
		height: 60rpx;
		line-height: 58rpx;
		/* 扣除边框 */
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;

		&::after {
			border: none;
		}
	}

	/* 浅色按钮 (次要操作) */
	.btn-light {
		background-color: #f5f7fa;
		color: #606266;
		border: 1rpx solid #dcdfe6;
	}

	/* 描边主色按钮 */
	.btn-outline-primary {
		background-color: #fff;
		color: $primary-color;
		border: 1rpx solid $primary-color;
	}

	/* 描边红色按钮 (危险操作) */
	.btn-outline-danger {
		background-color: #fff;
		color: $danger-color;
		border: 1rpx solid $danger-color;
	}

	/* 渐变主色按钮 (核心操作) */
	.btn-gradient-primary {
		background: linear-gradient(135deg, #FF6B00, #FF8C00);
		color: #fff;
		border: none;
		box-shadow: 0 4rpx 10rpx rgba(255, 107, 0, 0.2);
	}

	/* 渐变警告按钮 */
	.btn-gradient-warning {
		background: linear-gradient(135deg, #f56c6c, #ff9090);
		color: #fff;
		border: none;
	}

	.btn-gradient-danger {
		background: linear-gradient(135deg, #f56c6c, #f78989);
		color: #fff;
		border: none;
	}

	/* 带徽标按钮容器 */
	.icon-btn {
		position: relative;
		overflow: visible;
		/* 允许徽标溢出 */
	}

	/* 红色数字徽标 */
	.badge-dot {
		position: absolute;
		top: -16rpx;
		right: -10rpx;
		background-color: $danger-color;
		color: #fff;
		font-size: 20rpx;
		height: 32rpx;
		min-width: 32rpx;
		line-height: 32rpx;
		text-align: center;
		border-radius: 16rpx;
		padding: 0 8rpx;
		border: 2rpx solid #fff;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	/* --- 空状态 --- */
	.empty-state-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;
		background-color: transparent;
		/* 移除白色背景块 */
	}

	.empty-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.empty-desc {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.primary-btn {
		background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
		color: white;
		border: none;
		padding: 0 60rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: 500;
		box-shadow: 0 6rpx 20rpx rgba(255, 107, 0, 0.2);
	}

	.loading-more {
		text-align: center;
		color: #999;
		padding: 20rpx 0;
		font-size: 24rpx;
	}
</style>