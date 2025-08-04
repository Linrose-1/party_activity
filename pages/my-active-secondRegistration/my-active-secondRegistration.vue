<template>
	<view class="page-container">
		<!-- ... template部分无任何变化 ... -->
		<view v-if="activityInfo" class="info-card">
			<view class="card-title">活动信息</view>
			<view class="card-content">
				<view class="info-item">
					<text class="label">活动标题:</text>
					<text class="value">{{ activityInfo.activityTitle }}</text>
				</view>
				<view class="info-item">
					<text class="label">开始时间:</text>
					<text class="value">{{ formatTime(activityInfo.startDatetime) }}</text>
				</view>
			</view>
		</view>
		<view class="info-card rejection-card">
			<view class="card-title">驳回原因</view>
			<view class="card-content">
				<text class="rejection-text">{{ rejectionMsg }}</text>
			</view>
		</view>
		<view class="info-card">
			<view class="card-title">凭证信息</view>
			<view class="card-content proof-section">
				<view class="proof-item">
					<text class="proof-label">原凭证:</text>
					<image :src="oldProofUrl" class="proof-image" mode="aspectFill" @click="previewImage([oldProofUrl])" />
				</view>
				<view class="proof-item">
					<text class="proof-label">新凭证:</text>
					<view class="uploader" @click="handleChooseImage">
						<image v-if="newProofLocalPath" :src="newProofLocalPath" class="proof-image" mode="aspectFill" />
						<uni-icons v-else type="plusempty" size="40" color="#c8c9cc"></uni-icons>
						<text v-if="!newProofLocalPath" class="uploader-text">点击上传</text>
					</view>
				</view>
			</view>
		</view>
		<view class="footer">
			<button class="submit-btn" :disabled="!newProofLocalPath || isSubmitting" @click="handleSubmit">
				{{ isSubmitting ? '提交中...' : '确认并提交' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js';

	// ... 其他状态管理和生命周期函数无变化 ...
	const activityInfo = ref(null);
	const rejectionMsg = ref('');
	const oldProofUrl = ref('');
	const enrollmentInfo = ref(null);
	const newProofLocalPath = ref('');
	const isSubmitting = ref(false);

	onLoad((options) => {
		if (options.item) {
			try {
				const itemData = JSON.parse(decodeURIComponent(options.item));
				activityInfo.value = itemData;
				enrollmentInfo.value = itemData.memberActivityJoinResp;
				rejectionMsg.value = enrollmentInfo.value.rejectMsg;
				oldProofUrl.value = enrollmentInfo.value.paymentScreenshotUrl;
				uni.setNavigationBarTitle({ title: '重新上传支付凭证' });
			} catch (e) {
				console.error("解析数据失败", e);
				uni.showToast({ title: '页面数据加载失败', icon: 'none' });
			}
		}
	});

	const handleChooseImage = () => {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				newProofLocalPath.value = res.tempFilePaths[0];
			},
		});
	};

	/**
	 * 【核心修改】处理提交逻辑，增加对“审核中”错误的特殊处理
	 */
	const handleSubmit = async () => {
		if (!newProofLocalPath.value) {
			uni.showToast({ title: '请先选择新的支付凭证', icon: 'none' });
			return;
		}
		if (isSubmitting.value) return;

		isSubmitting.value = true;
		uni.showLoading({ title: '正在上传凭证...' });

		// 1. 使用uploadFile上传图片到云存储
		const uploadResult = await uploadFile({ path: newProofLocalPath.value });

		// 2. 【关键】检查上传结果
		if (uploadResult.error) {
			uni.hideLoading();
			isSubmitting.value = false;

			// 2.1 如果是“审核中”的特定错误
			if (uploadResult.error.includes('审核中')) {
				uni.showToast({
					title: '图片正在安全审核，请稍后重试',
					icon: 'none',
					duration: 2500
				});
			} else {
				// 2.2 其他上传错误
				uni.showToast({
					title: `上传失败: ${uploadResult.error}`,
					icon: 'none',
					duration: 2500
				});
			}
			// 无论哪种上传错误，都终止本次提交
			return;
		}
		
		// 3. 上传成功，继续提交业务信息
		try {
			const newImageUrl = uploadResult.data;
			uni.showLoading({ title: '正在提交信息...' });

			const params = {
				id: enrollmentInfo.value.id,
				activityId: activityInfo.value.id,
				userId: enrollmentInfo.value.userId,
				paymentScreenshotUrl: newImageUrl,
			};

			const submitResult = await request('/app-api/member/activity-join/upload-payment-img', {
				method: 'POST',
				data: params,
			});

			if (submitResult.error) {
				// 业务接口返回的错误
				throw new Error(submitResult.error);
			}

			uni.hideLoading();
			uni.showToast({
				title: '提交成功，请等待审核',
				icon: 'success',
				duration: 2000,
			});

			setTimeout(() => {
				uni.navigateBack();
			}, 2000);

		} catch (err) {
			uni.hideLoading();
			isSubmitting.value = false;
			uni.showToast({
				title: err.message || '操作失败，请重试',
				icon: 'none',
			});
		}
	};
	
	const previewImage = (urls) => {
		uni.previewImage({ urls });
	};

	const formatTime = (timestamp) => {
		if (!timestamp) return '未知';
		const date = new Date(timestamp);
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
	};
</script>

<style lang="scss" scoped>
	/* ... style部分无任何变化 ... */
	.page-container {
		background-color: #f5f7fa;
		padding: 24rpx;
		min-height: 100vh;
	}
	.info-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #303133;
		padding-bottom: 20rpx;
		margin-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f2f5;
	}
	.info-item {
		display: flex;
		font-size: 28rpx;
		line-height: 1.6;
		&:not(:last-child) {
			margin-bottom: 16rpx;
		}
		.label {
			color: #909399;
			margin-right: 16rpx;
			flex-shrink: 0;
		}
		.value {
			color: #303133;
			flex: 1;
		}
	}
	.rejection-card {
		.card-content {
			background-color: #fef0f0;
			padding: 20rpx;
			border-radius: 12rpx;
		}
		.rejection-text {
			font-size: 28rpx;
			color: #f56c6c;
			line-height: 1.6;
		}
	}
	.proof-section {
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
		gap: 30rpx;
	}
	.proof-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}
	.proof-label {
		font-size: 26rpx;
		color: #606266;
		margin-bottom: 16rpx;
	}
	.proof-image {
		width: 250rpx;
		height: 250rpx;
		border-radius: 12rpx;
		background-color: #f5f5f5;
	}
	.uploader {
		width: 250rpx;
		height: 250rpx;
		border-radius: 12rpx;
		border: 2rpx dashed #dcdfe6;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #fafafa;
		.uploader-text {
			font-size: 24rpx;
			color: #909399;
			margin-top: 8rpx;
		}
	}
	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		border-top: 1rpx solid #f0f2f5;
	}
	.submit-btn {
		background: linear-gradient(135deg, #FF9500, #FF7900);
		color: #fff;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		border-radius: 44rpx;
		border: none;
		&[disabled] {
			background: #fab37b;
			color: #fffde6;
		}
	}
</style>