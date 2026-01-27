<template>
	<view class="auth-page">
		<!-- 1. 认证企业信息展示 -->
		<view class="section-card ent-header">
			<view class="header-main">
				<uni-icons type="vip-filled" size="30" color="#FF8600"></uni-icons>
				<view class="title-group">
					<text class="main-t">企业/品牌认证</text>
					<text class="sub-t">申请认证以获取专属身份标识及更多权益</text>
				</view>
			</view>
			<view class="ent-info-box">
				<text class="label">当前认证企业</text>
				<text class="ent-name">{{ enterpriseName || '数据读取中...' }}</text>
			</view>
		</view>

		<!-- 2. 材料上传表单 -->
		<view class="section-card form-section">
			<view class="group-title">认证材料上传</view>
			<view class="upload-desc">请上传真实有效的证明材料，平台将在1-3个工作日内完成审核。</view>

			<view class="image-grid">
				<!-- 已上传图片预览 -->
				<view class="image-item" v-for="(img, index) in certImages" :key="index">
					<image :src="img" mode="aspectFill" @click="previewImage(index)" />
					<view class="del-btn" @click="handleDelete(index)">×</view>
				</view>

				<!-- 添加按钮 -->
				<view class="upload-btn" @click="handleChooseImage" v-if="certImages.length < 6">
					<uni-icons type="camera-filled" size="32" color="#ccc"></uni-icons>
					<text>添加材料</text>
				</view>
			</view>

			<!-- 认证指南 -->
			<view class="guide-box">
				<view class="guide-title">💡 认证建议：</view>
				<text class="guide-txt">1. 提交清晰的【营业执照】原件照片或加盖公章的复印件；</text>
				<text class="guide-txt">2. 若为品牌，请补充提供【商标注册证】或【授权委托书】；</text>
				<text class="guide-txt">3. 图片清晰且四角完整，支持 jpg/png 格式，单张不超过5MB。</text>
			</view>
		</view>

		<!-- 3. 提交操作 -->
		<view class="footer">
			<button class="submit-btn" :loading="loading" @click="handleSubmit">
				{{ loading ? '正在提交申请...' : '立即提交认证' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js';

	// --- 变量定义 ---
	const enterpriseId = ref(null);
	const enterpriseName = ref('');
	const certImages = ref([]); // 后端要求 Array 格式
	const loading = ref(false);

	/**
	 * 页面初始化：接收列表页传参
	 */
	onLoad((options) => {
		if (options.enterpriseId) {
			enterpriseId.value = options.enterpriseId;
			enterpriseName.value = decodeURIComponent(options.enterpriseName || '');
		} else {
			uni.showToast({
				title: '参数缺失',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		}
	});

	/**
	 * 选择图片并上传至云端
	 */
	const handleChooseImage = () => {
		uni.chooseImage({
			count: 6 - certImages.value.length,
			success: async (res) => {
				uni.showLoading({
					title: '正在上传材料...'
				});

				const uploadedList = [];
				for (let path of res.tempFilePaths) {
					const result = await uploadFile({
						path
					}, {
						directory: 'enterprise_cert'
					});
					if (result.data) uploadedList.push(result.data);
				}

				uni.hideLoading();
				certImages.value = [...certImages.value, ...uploadedList];
			}
		});
	};

	/**
	 * 删除某张图片
	 */
	const handleDelete = (index) => {
		certImages.value.splice(index, 1);
	};

	/**
	 * 预览图片大图
	 */
	const previewImage = (index) => {
		uni.previewImage({
			urls: certImages.value,
			current: index
		});
	};

	/**
	 * 核心：提交认证申请
	 */
	const handleSubmit = async () => {
		// 前置校验
		if (certImages.value.length === 0) {
			return uni.showToast({
				title: '请至少上传一张证明材料',
				icon: 'none'
			});
		}

		loading.value = true;
		uni.showLoading({
			title: '正在提交审核',
			mask: true
		});

		// 构造 AppMemberCertReqVO 实体
		const payload = {
			certName: enterpriseName.value,
			certSource: certImages.value, // 后端要求 Array<String>
			certType: 2, // 固定：2 代表企业认证
			userEnterpriseId: Number(enterpriseId.value)
		};

		try {
			const {
				error
			} = await request('/app-api/member/user-enterprise-info/submit-review-enterprise', {
				method: 'POST',
				data: payload
			});

			uni.hideLoading();
			loading.value = false;

			if (!error) {
				uni.showModal({
					title: '申请已提交',
					content: '您的认证申请已进入审核队列，请耐心等待 1-3 个工作日。',
					showCancel: false,
					confirmColor: '#FF8600',
					success: () => {
						uni.navigateBack(); // 成功后回退到列表页
					}
				});
			} else {
				uni.showToast({
					title: error,
					icon: 'none'
				});
			}
		} catch (e) {
			uni.hideLoading();
			loading.value = false;
			uni.showToast({
				title: '提交失败，请检查网络',
				icon: 'none'
			});
		}
	};
</script>

<style scoped lang="scss">
	$theme: #FF8600;

	.auth-page {
		min-height: 100vh;
		background-color: #F7F8FA;
		padding: 30rpx;
	}

	.section-card {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
	}

	/* 头部展示 */
	.ent-header {
		.header-main {
			display: flex;
			align-items: center;
			gap: 20rpx;
			margin-bottom: 40rpx;

			.title-group {
				display: flex;
				flex-direction: column;

				.main-t {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
				}

				.sub-t {
					font-size: 22rpx;
					color: #999;
					margin-top: 4rpx;
				}
			}
		}

		.ent-info-box {
			background-color: #FFF9F5;
			padding: 24rpx;
			border-radius: 16rpx;
			border: 1rpx solid rgba($theme, 0.1);

			.label {
				font-size: 24rpx;
				color: #999;
				display: block;
				margin-bottom: 8rpx;
			}

			.ent-name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}
		}
	}

	/* 表单内容区域 */
	.group-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 12rpx;
	}

	.upload-desc {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	/* 图片网格布局 */
	.image-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		margin-bottom: 40rpx;

		.image-item {
			position: relative;
			aspect-ratio: 1/1;
			border-radius: 12rpx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}

			.del-btn {
				position: absolute;
				top: 0;
				right: 0;
				background: rgba(0, 0, 0, 0.5);
				color: #fff;
				width: 40rpx;
				height: 40rpx;
				text-align: center;
				line-height: 36rpx;
				border-bottom-left-radius: 12rpx;
				font-size: 32rpx;
			}
		}

		.upload-btn {
			aspect-ratio: 1/1;
			background: #F9F9FA;
			border: 2rpx dashed #ddd;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 10rpx;

			text {
				font-size: 22rpx;
				color: #bbb;
			}
		}
	}

	/* 指南区域 */
	.guide-box {
		background: #F8F8F8;
		padding: 24rpx;
		border-radius: 12rpx;

		.guide-title {
			font-size: 24rpx;
			font-weight: bold;
			color: #666;
			margin-bottom: 10rpx;
		}

		.guide-txt {
			font-size: 22rpx;
			color: #999;
			line-height: 1.6;
			display: block;
		}
	}

	/* 底部按钮 */
	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 24rpx 40rpx 50rpx;
		box-sizing: border-box;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

		.submit-btn {
			background: linear-gradient(135deg, #FF9D4D, $theme);
			color: #fff;
			height: 90rpx;
			border-radius: 45rpx;
			font-size: 30rpx;
			font-weight: bold;
			box-shadow: 0 8rpx 16rpx rgba($theme, 0.2);

			&::after {
				border: none;
			}

			&:active {
				opacity: 0.8;
			}
		}
	}
</style>