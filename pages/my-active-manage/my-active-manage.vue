<template>
	<view class="refund-manage-page">
		<!-- 顶部警告栏 -->
		<view class="warning-banner">
			<uni-icons type="info-filled" color="#FF6B00" size="18"></uni-icons>
			<text>{{ bannerText }}</text>
		</view>

		<!-- 聚会信息卡片 -->
		<view class="card activity-card">
			<view class="card-title">聚会信息</view>
			<view class="activity-details">
				<image :src="activityInfo.image" class="activity-image" mode="aspectFill" />
				<view class="info-text-group">
					<view class="activity-title">{{ activityInfo.title }}</view>
					<view class="info-line">
						<uni-icons type="calendar-filled" color="#999" size="16"></uni-icons>
						<text>{{ activityInfo.date }}</text>
					</view>
					<view v-if="activityInfo.location" class="info-line">
						<uni-icons type="location-filled" color="#999" size="16"></uni-icons>
						<text>{{ activityInfo.location }}</text>
					</view>
					<view v-if="activityInfo.participants" class="info-line">
						<uni-icons type="staff-filled" color="#999" size="16"></uni-icons>
						<text>{{ activityInfo.participants.current }}人报名</text>
					</view>
				</view>
			</view>
			<view v-if="activityInfo.totalRefundAmount" class="divider"></view>
			<view v-if="activityInfo.totalRefundAmount" class="refund-total">
				<text class="label">需退款总额</text>
				<text class="amount">¥{{ activityInfo.totalRefundAmount }}</text>
			</view>
		</view>

		<!-- 选项卡 -->
		<view class="tabs-container">
			<view :class="['tab-item', { 'active': currentTab === 0 }]" @click="switchTab(0)">
				待处理 <text v-if="pendingUsers.length > 0">({{ pendingUsers.length }})</text>
			</view>
			<view :class="['tab-item', { 'active': currentTab === 1 }]" @click="switchTab(1)">
				已完成 <text v-if="completedUsers.length > 0">({{ completedUsers.length }})</text>
			</view>
		</view>

		<!-- 用户列表 -->
		<scroll-view scroll-y class="list-scroll-view">
			<!-- 待处理列表 -->
			<view v-show="currentTab === 0">
				<view v-if="pendingUsers.length > 0" class="list-content">
					<view v-for="user in pendingUsers" :key="user.id" class="card item-card">
						<view class="user-info">
							<!-- 容错处理: 优先用 memberUser 里的信息 -->
							<image :src="user.memberUser?.avatar || '../../static/avatar-placeholder.png'"
								class="avatar" mode="aspectFill" />
							<text class="name">{{ user.memberUser?.nickname || '未知用户' }}</text>
						</view>
						<view class="qr-code-section">
							<view class="section-title">用户收款码</view>
							<image :src="user.refundScreenshotUrl" class="qr-code-image" mode="aspectFit"
								@click="previewImage(user.refundScreenshotUrl)" />
						</view>
						<view class="proof-section">
							<button class="upload-proof-btn" @click="uploadProof(user)">
								<uni-icons type="plusempty" color="#FF6B00" size="16"></uni-icons>
								{{ staticWords.uploadTransferVoucher || '上传转账凭证' }}
							</button>
						</view>
					</view>
				</view>
				<view v-else class="list-empty">
					<text>所有用户退款均已处理完毕 🎉</text>
				</view>
			</view>

			<!-- 已完成列表 -->
			<view v-show="currentTab === 1">
				<view v-if="completedUsers.length > 0" class="list-content">
					<view v-for="user in completedUsers" :key="user.id" class="card item-card">
						<view class="user-info">
							<image :src="user.memberUser?.avatar || '../../static/avatar-placeholder.png'"
								class="avatar" mode="aspectFill" />
							<text class="name">{{ user.memberUser?.nickname || '未知用户' }}</text>
							<view class="status-badge completed">已完成</view>
						</view>
						<view class="proof-display">
							<view class="section-title">退款凭证</view>
							<image :src="user.refundConfirmScreenshotUrl" class="proof-image" mode="aspectFit"
								@click="previewImage(user.refundConfirmScreenshotUrl)" />
						</view>
					</view>
				</view>
				<view v-else class="list-empty">
					<text>暂无已完成的退款记录</text>
				</view>
			</view>
		</scroll-view>
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
	// 导入工具模块
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	// ==================== 页面状态定义 ====================
	const currentTab = ref(0); // 当前选中的标签页，0=待处理，1=已完成
	const activityInfo = ref({}); // 聚会基本信息
	const fullActivityData = ref(null); // 完整的聚会数据对象
	const participantList = ref([]); // 参与者列表
	// const bannerText = ref(''); // 顶部警告栏文本
	const pageMode = ref('individual'); // 页面模式：individual=个人退款，group=集体退款

	const staticWords = ref({
		// 可以预设一些默认值，防止接口还没返回时页面空白
		individual_refund_banner: '请为提交申请的用户办理退款',
		group_refund_banner: '聚会已取消，请为所有报名用户办理退款',
		// ... 其他你需要的 key
	});

	const bannerText = computed(() => {
		if (pageMode.value === 'individual') {
			// 如果接口返回了对应的 key，就用接口的，否则用默认值
			return staticWords.value.individual_refund_banner || '请为提交申请的用户办理退款1';
		} else {
			return staticWords.value.group_refund_banner || '聚会已取消，请为所有报名用户办理退款1';
		}
	});

	// ==================== 计算属性 ====================
	/**
	 * 获取待处理的用户列表（支付状态为3）
	 */
	const pendingUsers = computed(() =>
		participantList.value.filter(u => u.paymentStatus === '3')
	);

	/**
	 * 获取已完成的用户列表（支付状态为6）
	 */
	const completedUsers = computed(() =>
		participantList.value.filter(u => u.paymentStatus === '6')
	);

	// ==================== 页面生命周期 ====================
	/**
	 * 页面加载时初始化数据
	 * @param {Object} options - 页面参数
	 * @param {string} options.item - 聚会数据的JSON字符串
	 * @param {string} options.mode - 页面模式
	 */
	onLoad((options) => {
		// 解析传递的聚会数据
		if (options.item) {
			try {
				const decodedData = decodeURIComponent(options.item);
				const parsedData = JSON.parse(decodedData);
				fullActivityData.value = parsedData;

				// 提取聚会基本信息
				activityInfo.value = {
					id: parsedData.id,
					title: parsedData.activityTitle,
					image: parsedData.coverImageUrl,
					date: formatDateTime(parsedData.startDatetime),
					location: parsedData.locationAddress || '线上聚会',
					participants: {
						current: parsedData.joinCount || 0
					},
					totalRefundAmount: null
				};
			} catch (e) {
				console.error("解析聚会数据失败:", e);
				return;
			}
		}

		// 设置页面模式和提示文案
		pageMode.value = options.mode || 'individual';
		// pageMode.value = options.mode || 'individual';
		// bannerText.value = pageMode.value === 'individual' ?
		// 	'请为提交申请的用户办理退款' :
		// 	'聚会已取消，请为所有报名用户办理退款';

		// 获取退款列表
		fetchRefundList();

		// 对接后端接口获取静态词配置
		fetchStaticWord();
	});

	// ==================== 数据获取方法 ====================
	/**
	 * 获取退款用户列表
	 * 根据当前标签页状态获取对应的退款用户数据
	 */
	const fetchRefundList = async () => {
		if (!fullActivityData.value) return;

		uni.showLoading({
			title: '加载中...'
		});

		// 根据当前标签页确定要查询的支付状态
		const statusToFetch = currentTab.value === 0 ? '3' : '6';

		const params = {
			activityId: fullActivityData.value.id,
			paymentStatus: statusToFetch,
			pageNo: 1,
			pageSize: 100
		};

		try {
			const result = await request('/app-api/member/activity-join/list', {
				method: 'GET',
				data: params
			});
			participantList.value = result.data ? result.data.list || [] : [];
		} catch (error) {
			uni.showToast({
				title: '加载列表失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 获取静态词配置
	 * 对接后端接口 /app-api/member/config/getStaticWord
	 */
	const fetchStaticWord = async () => {
		try {
			const result = await request('/app-api/member/config/getStaticWord', {
				method: 'GET'
			});

			if (!result.error && result.data) {
				// 将接口返回的对象合并到 staticWords 中
				// 假设接口返回结构是 { individual_refund_banner: "...", ... }
				staticWords.value = {
					...staticWords.value,
					...result.data
				};

				console.log('【静态词已储存】', staticWords.value);
			}
		} catch (error) {
			console.error('获取静态词配置失败:', error);
		}
	};

	// ==================== 业务操作方法 ====================
	/**
	 * 上传退款凭证
	 * @param {Object} user - 用户对象
	 */
	const uploadProof = (user) => {
		// 1. 让用户选择图片
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				// 2. 使用双重检查逻辑，安全地获取文件路径
				let tempFilePath = '';
				if (res.tempFilePaths && res.tempFilePaths.length > 0) {
					// 优先使用官方推荐的 tempFilePaths
					tempFilePath = res.tempFilePaths[0];
				} else if (res.tempFiles && res.tempFiles.length > 0 && res.tempFiles[0].path) {
					// 如果 tempFilePaths 不可用，则使用 tempFiles[0].path 作为备用方案
					tempFilePath = res.tempFiles[0].path;
				}

				// 如果两种方式都无法获取到路径，则提示用户并中断操作
				if (!tempFilePath) {
					uni.showToast({
						title: '未能获取到图片文件，请重试',
						icon: 'none'
					});
					console.error('【严重错误】 无法从 chooseImage 的返回值中提取任何有效路径!', res);
					return;
				}

				uni.showLoading({
					title: '正在上传并确认...'
				});

				try {
					// 3. 使用正确的参数格式 { path: ... } 来调用 uploadFile
					const uploadResult = await uploadFile({
						path: tempFilePath
					}, {
						directory: 'refund_proof'
					});

					if (uploadResult.error) {
						// 如果上传失败（包括内容安全检查失败），直接抛出错误
						const errorMsg = typeof uploadResult.error === 'object' ? uploadResult.error.msg :
							uploadResult.error;
						throw new Error(errorMsg || '上传失败');
					}

					// 获取上传成功后的凭证 URL
					const proofUrl = uploadResult.data;

					// 4. 调用后端接口确认退款
					const payload = {
						id: user.id,
						refundConfirmScreenshotUrl: proofUrl
					};

					const confirmResult = await request(
						'/app-api/member/activity-join/confirm-join-user-refund', {
							method: 'POST',
							data: payload
						});

					if (confirmResult.error) {
						const errorMsg = typeof confirmResult.error === 'object' ? confirmResult.error
							.msg : confirmResult.error;
						throw new Error(errorMsg || '确认失败');
					}

					uni.showToast({
						title: '操作成功',
						icon: 'success'
					});

					// 5. 实时刷新UI：重新请求当前tab的列表，确保数据最新
					fetchRefundList();

				} catch (error) {
					// 统一处理所有可能的错误
					uni.showToast({
						title: error.message || '操作失败',
						icon: 'none',
						duration: 3000
					});
				} finally {
					// 无论成功失败，都确保关闭 loading
					uni.hideLoading();
				}
			},
			fail: (err) => {
				// 处理用户取消选择等情况
				if (err.errMsg && !err.errMsg.includes('cancel')) {
					console.error('选择图片失败:', err);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			}
		});
	};

	// ==================== 事件处理方法 ====================
	/**
	 * 切换标签页
	 * @param {number} index - 标签页索引
	 */
	const switchTab = (index) => {
		if (currentTab.value === index) return;
		currentTab.value = index;
		fetchRefundList();
	};

	/**
	 * 预览图片
	 * @param {string} url - 图片URL
	 */
	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url]
		});
	};

	// ==================== 辅助工具方法 ====================
	/**
	 * 格式化日期时间
	 * @param {string} dateTimeStr - 日期时间字符串
	 * @returns {string} 格式化后的日期（YYYY-MM-DD）
	 */
	const formatDateTime = (dateTimeStr) => {
		if (!dateTimeStr) return '时间待定';
		const date = new Date(dateTimeStr);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		return `${Y}-${M}-${D}`;
	};
</script>

<style lang="scss" scoped>
	.refund-manage-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f7fa;
	}

	.warning-banner {
		display: flex;
		align-items: center;
		padding: 16rpx 32rpx;
		background-color: #fffbe6;
		color: #d46b08;
		font-size: 26rpx;
		flex-shrink: 0;

		text {
			margin-left: 12rpx;
		}
	}

	.card {
		background-color: #fff;
		margin: 0 24rpx 24rpx 24rpx;
		border-radius: 16rpx;
		padding: 32rpx;
		box-sizing: border-box;
	}

	.activity-card {
		margin-top: 24rpx;

		.card-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #1c1e21;
			position: relative;
			padding-left: 24rpx;
			margin-bottom: 24rpx;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 8rpx;
				height: 32rpx;
				background-color: #FF6B00;
				border-radius: 4rpx;
			}
		}

		.activity-details {
			display: flex;
			align-items: flex-start;
		}

		.activity-image {
			width: 140rpx;
			height: 140rpx;
			border-radius: 12rpx;
			margin-right: 24rpx;
			flex-shrink: 0;
		}

		.info-text-group {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 8rpx;
		}

		.activity-title {
			font-size: 30rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 8rpx;
		}

		.info-line {
			display: flex;
			align-items: center;
			font-size: 26rpx;
			color: #666;

			text {
				margin-left: 12rpx;
			}
		}

		.divider {
			height: 1rpx;
			background-color: #f0f2f5;
			margin: 24rpx 0;
		}

		.refund-total {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.label {
				font-size: 28rpx;
				color: #666;
			}

			.amount {
				font-size: 40rpx;
				font-weight: bold;
				color: #FF6B00;
			}
		}
	}

	.tabs-container {
		display: flex;
		background-color: #fff;
		margin: 0 24rpx 24rpx 24rpx;
		border-radius: 16rpx;
		overflow: hidden;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 24rpx 0;
			font-size: 30rpx;
			color: #666;
			position: relative;
			transition: color 0.3s, font-weight 0.3s;

			&.active {
				color: #FF6B00;
				font-weight: 600;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 6rpx;
					background-color: #FF6B00;
					border-radius: 3rpx;
				}
			}
		}
	}

	.list-scroll-view {
		flex: 1;
		height: 1px;
	}

	.list-content {
		padding: 0 24rpx;
		padding-bottom: 24rpx;
	}

	.list-header {
		display: flex;
		align-items: center;
		padding: 0 8rpx 24rpx 8rpx;

		uni-icons {
			margin-right: 12rpx;
		}

		text {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}
	}

	.item-card {
		margin: 0 0 24rpx 0;
		padding: 24rpx;

		.user-info {
			display: flex;
			align-items: center;
			padding-bottom: 24rpx;
			margin-bottom: 24rpx;
			border-bottom: 1rpx solid #f0f2f5;

			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}

			.name {
				font-size: 30rpx;
				font-weight: 600;
				color: #333;
			}

			.status-badge {
				margin-left: auto;
				font-size: 24rpx;
				padding: 4rpx 12rpx;
				border-radius: 6rpx;

				&.completed {
					background-color: #e8f5e9;
					color: #4caf50;
				}
			}
		}

		.section-title {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 16rpx;
		}

		.qr-code-section {
			.qr-code-image {
				width: 200rpx;
				height: 200rpx;
				border-radius: 8rpx;
				background-color: #f5f5f5;
				border: 1rpx solid #eee;
			}
		}

		.proof-section {
			display: flex;
			justify-content: flex-end;
			margin-top: 24rpx;
			padding-top: 24rpx;
			border-top: 1rpx solid #f0f2f5;

			.upload-proof-btn {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				background: #fff;
				color: #FF6B00;
				border: 1rpx solid #FF6B00;
				height: 64rpx;
				line-height: 64rpx;
				padding: 0 24rpx;
				font-size: 26rpx;
				border-radius: 32rpx;
				margin: 0;

				&:after {
					border: none;
				}
			}
		}

		.proof-display {
			.proof-image {
				width: 150rpx;
				height: 150rpx;
				border-radius: 8rpx;
			}
		}
	}

	.list-empty {
		text-align: center;
		padding: 80rpx 0;
		color: #999;
		font-size: 28rpx;
	}
</style>