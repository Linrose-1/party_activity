<template>
	<view class="refund-process-page">
		<!-- 顶部信息栏 -->
		<view class="info-banner">
			<uni-icons type="info-filled" color="#FF6B00" size="18"></uni-icons>
			<text>请为提交申请的用户办理退款1</text>
		</view>

		<!-- 聚会信息卡片 -->
		<view class="card activity-card">
			<view class="card-title">聚会信息1</view>
			<view class="activity-details">
				<image :src="activityInfo.image" class="activity-image" mode="aspectFill" />
				<view class="info-text-group">
					<view class="activity-title">{{ activityInfo.title }}</view>
					<view class="info-line">
						<uni-icons type="calendar-filled" color="#999" size="16"></uni-icons>
						<text>{{ activityInfo.date }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 选项卡 -->
		<view class="tabs-container">
			<view :class="['tab-item', { 'active': currentTab === 0 }]" @click="switchTab(0)">
				待处理
			</view>
			<view :class="['tab-item', { 'active': currentTab === 1 }]" @click="switchTab(1)">
				已完成
			</view>
		</view>

		<!-- 用户列表 -->
		<scroll-view scroll-y class="list-scroll-view">
			<!-- 待处理列表 -->
			<view v-show="currentTab === 0">
				<view class="list-header">
					<uni-icons type="person-filled" color="#FF6B00" size="20"></uni-icons>
					<text>待退款用户 ({{ pendingUsers.length }}人)</text>
				</view>
				<view v-if="pendingUsers.length > 0" class="list-content">
					<view v-for="user in pendingUsers" :key="user.id" class="card item-card">
						<view class="user-info">
							<image :src="user.avatar" class="avatar" mode="aspectFill" />
							<text class="name">{{ user.name }}</text>
						</view>
						<view class="qr-code-section">
							<view class="section-title">用户收款码</view>
							<image :src="user.qrCodeUrl" class="qr-code-image" mode="aspectFit"
								@click="previewImage(user.qrCodeUrl)" />
						</view>
						<view class="proof-section">
							<button class="upload-proof-btn" @click="uploadProof(user)">
								<uni-icons type="plusempty" color="#FF6B00" size="16"></uni-icons>
								上传转账凭证
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
				<view class="list-header">
					<uni-icons type="checkbox-filled" color="#4caf50" size="20"></uni-icons>
					<text>已完成退款 ({{ completedUsers.length }}人)</text>
				</view>
				<view v-if="completedUsers.length > 0" class="list-content">
					<view v-for="user in completedUsers" :key="user.id" class="card item-card">
						<view class="user-info">
							<image :src="user.avatar" class="avatar" mode="aspectFill" />
							<text class="name">{{ user.name }}</text>
							<view class="status-badge completed">已完成</view>
						</view>
						<view class="proof-display">
							<view class="section-title">退款凭证</view>
							<image :src="user.refundProofUrl" class="proof-image" mode="aspectFit"
								@click="previewImage(user.refundProofUrl)" />
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
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	const currentTab = ref(0); // 0: 待处理, 1: 已完成
	const activityInfo = ref({});
	const refundList = ref([]); // 重命名，更贴切

	// 根据Tab过滤用户列表
	const pendingUsers = computed(() =>
		refundList.value.filter(u => u.refundStatus === 'pending')
	);
	const completedUsers = computed(() =>
		refundList.value.filter(u => u.refundStatus === 'completed')
	);


	onLoad((options) => {
		const activityId = options.id;
		// 模拟加载数据
		activityInfo.value = {
			id: activityId,
			title: '宠物爱好者交流聚会',
			image: '../../static/abc.png',
			date: '2023年12月2日 10:00-14:00',
		};

		// 模拟从服务器获取的申请退款的用户列表
		refundList.value = [{
				id: 201,
				name: '赵六',
				avatar: '../../static/avatar4.png',
				qrCodeUrl: '../../static/qrcode.png',
				refundProofUrl: null,
				refundStatus: 'pending', // 状态：待处理
			},
			{
				id: 202,
				name: '孙七',
				avatar: '../../static/avatar5.png',
				qrCodeUrl: '../../static/qrcode.png',
				refundProofUrl: null,
				refundStatus: 'pending',
			},
			{
				id: 203,
				name: '周八',
				avatar: '../../static/avatar6.png',
				qrCodeUrl: '../../static/qrcode.png',
				refundProofUrl: '../../static/proof.png',
				refundStatus: 'completed', // 状态：已完成
			}
		];
	});

	const switchTab = (index) => {
		currentTab.value = index;
	}

	const previewImage = (url) => {
		if (!url) return;
		uni.previewImage({
			urls: [url],
		});
	};

	// 上传凭证的核心操作
	const uploadProof = (user) => {

		// --- 第一步：确认此函数是否被调用 ---
		console.log('✅✅✅ [SMOKE TEST] uploadProof function has been TRIGGERED! ✅✅✅');
		console.log('User object received:', user);

		uni.showModal({
			title: '测试',
			content: '您点击了上传按钮，函数已成功触发！',
			showCancel: false
		});


		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				console.log('【调试信息】 uni.chooseImage 返回的原始 res 对象是：', res);

				// --- 【核心修复】 使用双重检查逻辑获取文件路径 ---
				let tempFilePath = '';
				if (res.tempFilePaths && res.tempFilePaths.length > 0) {
					// 优先使用 tempFilePaths
					tempFilePath = res.tempFilePaths[0];
				} else if (res.tempFiles && res.tempFiles.length > 0 && res.tempFiles[0].path) {
					// 如果 tempFilePaths 不可用，则从 tempFiles[0].path 中获取
					tempFilePath = res.tempFiles[0].path;
				}

				// 如果两种方式都无法获取到路径，则中断操作
				if (!tempFilePath) {
					uni.showToast({
						title: '未能获取到图片文件，请重试',
						icon: 'none',
						duration: 3000
					});
					console.error('【严重错误】 无法从 chooseImage 的返回值中提取任何有效路径!', res);
					return;
				}

				console.log('【最终提取路径】', tempFilePath);

				// -------------------- 后续逻辑完全不变 --------------------

				uni.showLoading({
					title: '凭证上传中...',
					mask: true
				});

				try {
					const uploadResult = await uploadFile({
						path: tempFilePath
					}, {
						directory: 'refund-proof'
					});

					if (uploadResult.error) {
						const errorMsg = typeof uploadResult.error === 'object' ? uploadResult.error.msg :
							uploadResult.error;
						throw new Error(errorMsg || '上传失败');
					}

					const proofUrlFromServer = uploadResult.data;

					// 调用后端接口确认退款
					const confirmResult = await request('/app-api/member/activity/confirm-refund', {
						method: 'POST',
						data: {
							activityId: activityInfo.value.id,
							applyUserId: user.id,
							refundProofUrl: proofUrlFromServer
						}
					});

					if (confirmResult.error) {
						const errorMsg = typeof confirmResult.error === 'object' ? confirmResult.error
							.msg : confirmResult.error;
						throw new Error(errorMsg || '确认退款失败');
					}

					uni.hideLoading();

					// 更新UI
					const targetUser = refundList.value.find(u => u.id === user.id);
					if (targetUser) {
						targetUser.refundProofUrl = proofUrlFromServer;
						targetUser.refundStatus = 'completed';
					}

					uni.showToast({
						title: '操作成功',
						icon: 'success'
					});

				} catch (err) {
					uni.hideLoading();
					uni.showToast({
						title: err.message || '操作失败，请重试',
						icon: 'none',
						duration: 3000
					});
				}
			},
			fail: (err) => {
				console.error('【调试信息】 uni.chooseImage 的 fail 回调触发！', err);
				if (err.errMsg && !err.errMsg.includes('cancel')) {
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			}
		});
	};
	// const uploadProof = async (user) => {
	// 	uni.chooseImage({
	// 		count: 1,
	// 		success: (res) => {
	// 			const tempFilePath = res.tempFilePaths[0];

	// 			uni.showLoading({
	// 				title: '凭证上传中...',
	// 				mask: true
	// 			});

	// 			// 模拟上传和后台处理
	// 			setTimeout(() => {
	// 				// TODO: 实际项目中，上传图片到服务器，成功后更新状态
	// 				const targetUser = refundList.value.find(u => u.id === user.id);
	// 				if (targetUser) {
	// 					targetUser.refundProofUrl = tempFilePath;
	// 					targetUser.refundStatus = 'completed'; // 关键：更新状态，自动移到“已完成”
	// 				}
	// 				uni.hideLoading();
	// 				uni.showToast({
	// 					title: '凭证上传成功',
	// 					icon: 'success'
	// 				});
	// 			}, 1000);
	// 		}
	// 	});
	// };
</script>

<style lang="scss" scoped>
	/* 完全复用 refund-manage.vue 的样式 */
	.refund-process-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f7fa;
	}

	.info-banner {
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
			width: 120rpx;
			height: 120rpx;
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
		height: 1px; // 修复高度问题
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