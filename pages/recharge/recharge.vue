<template>
	<view class="recharge-container">
		<view class="header-section">
			<h1 class="page-title">充值中心</h1>
			<p class="page-subtitle">请填写真实的付款信息以便我们尽快为您审核</p>
		</view>

		<!-- 步骤一：扫码支付 -->
		<view class="form-card">
			<view class="card-header">
				<view class="step-indicator">1</view>
				<h2 class="card-title">扫码支付</h2>
			</view>
			<view class="qrcode-section">
				<!-- 【需求5】付款码展示 -->
				<!-- 1. :src 动态绑定到 paymentQRCodeUrl -->
				<!-- 2. 添加一个 v-if 判断，只在 URL 加载成功后显示图片 -->
				<image v-if="paymentQRCodeUrl" :src="paymentQRCodeUrl" class="qrcode-image" mode="aspectFit"
					@click="previewQRCode"></image>

				<!-- (可选) 添加一个加载中或加载失败的占位符 -->
				<view v-else class="qrcode-placeholder">
					<uni-load-more status="loading" contentText.loading="收款码加载中..."></uni-load-more>
				</view>
				<p class="qrcode-tip">请扫码完成支付</p>
			</view>
		</view>

		<!-- 步骤二：填写凭证 -->
		<view class="form-card">
			<view class="card-header">
				<view class="step-indicator">2</view>
				<h2 class="card-title">填写凭证并提交审核</h2>
			</view>

			<!-- 【需求1 & 8】充值类型选择 -->
			<view class="form-item">
				<label class="form-label required">充值类型</label>
				<view class="recharge-type-selector">
					<button @click="selectRechargeType(2)" :class="{'active': form.payType === 2}">会员充值</button>
					<button @click="selectRechargeType(1)" :class="{'active': form.payType === 1}">智米充值</button>
				</view>
				<view v-if="form.payType === 2" class="type-tip" @click="goToMemberDetails">
					<uni-icons type="info" size="14" color="#FF6E00"></uni-icons>
					充值会员前，请务必查看 <text class="link-text">会员条款及权益</text>。
				</view>
			</view>

			<!-- 【需求1】付款金额 -->
			<view class="form-item">
				<label class="form-label required">付款金额</label>
				<input class="form-input" type="digit" v-model="form.amount" placeholder="请输入您实际支付的金额" />
			</view>

			<!-- 【需求1 & 2】支付订单号 -->
			<view class="form-item">
				<label class="form-label required">支付订单号</label>
				<input class="form-input" type="text" v-model="form.payNo" placeholder="请输入微信/支付宝的交易单号" />
				<p class="form-tip">
					<uni-icons type="help" size="14" color="#999"></uni-icons>
					请在微信/支付宝的账单详情中查找并复制。
				</p>
			</view>

			<!-- 【需求1 & 3】支付凭证 -->
			<view class="form-item">
				<label class="form-label required">支付凭证</label>
				<uni-file-picker v-model="imageValue" fileMediatype="image" mode="grid" @select="handleFileSelect"
					@delete="handleFileDelete" limit="3" title="最多选择3张图片" />
				<p class="form-tip">
					<uni-icons type="help" size="14" color="#999"></uni-icons>
					请上传包含订单号的支付成功截图。
				</p>
			</view>

			<!-- 【需求1】付款备注 -->
			<view class="form-item">
				<label class="form-label">付款备注</label>
				<textarea class="form-textarea" v-model="form.remark" placeholder="如有需要，请在此填写备注信息（可选）"
					maxlength="200" />
			</view>
		</view>

		<!-- 【需求4】安全提示 -->
		<view class="security-notice">
			<uni-icons type="shield-filled" size="18" color="#FF6E00"></uni-icons>
			<text>为了保障您的资金安全，请务必填写真实的订单号和凭证截图，以便我们快速确认您的充值，防止他人盗用。</text>
		</view>

		<!-- 【需求7】提交按钮 -->
		<view class="submit-button-container">
			<button class="submit-button" @click="handleSubmit" :disabled="isSubmitting" :loading="isSubmitting">
				{{ isSubmitting ? '正在提交...' : '确认提交' }}
			</button>
		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import uploadFile from '@/utils/upload.js'; // 确保路径正确
	import request from '@/utils/request.js'; // 确保路径正确

	// --- 页面状态 ---
	const isSubmitting = ref(false);
	const userInfo = ref(null); // 用于获取 userId
	const paymentQRCodeUrl = ref('');

	// --- 表单数据 ---
	const form = reactive({
		payType: null, // 1-智米, 2-会员
		amount: '',
		payNo: '',
		remark: '',
		imageUrls: [], // 存储上传成功后的 URL
	});

	// uni-file-picker 的 v-model
	const imageValue = ref([]);

	// --- 页面加载逻辑 ---
	onLoad((options) => {
		// 从上个页面接收充值类型参数
		if (options.type === 'membership') {
			form.payType = 2; // 默认选中会员充值
		} else if (options.type === 'points') {
			form.payType = 1; // 默认选中智米充值
		}
		// 获取用户信息以备提交时使用
		// fetchUserInfo();
	});
	/**
	 * 在 onMounted 中执行所有初始化数据请求
	 */
	onMounted(() => {
		// 使用 Promise.all 并行获取用户信息和平台配置，提高效率
		Promise.all([
			fetchUserInfo(),
			fetchPlatformConfig()
		]).catch(error => {
			console.error("初始化页面数据时发生错误:", error);
			// 可以在这里做一个统一的错误提示
		});
	});

	// --- API 调用 ---
	/**
	 * 获取平台配置信息（包括收款码URL）
	 */
	const fetchPlatformConfig = async () => {
		const {
			data,
			error
		} = await request('/app-api/system/platformConfig/getPlatformConfig');

		if (error) {
			console.error("获取平台配置失败:", error);
			uni.showToast({
				title: '收款码加载失败，请刷新重试',
				icon: 'none'
			});
			return;
		}

		if (data && data.paymentUrl) {
			paymentQRCodeUrl.value = data.paymentUrl;
			console.log("成功获取收款码URL:", paymentQRCodeUrl.value);
		} else {
			console.error("平台配置中未找到 paymentUrl");
			uni.showToast({
				title: '无法获取收款码',
				icon: 'none'
			});
		}
	};
	/**
	 * 获取当前登录用户信息
	 */
	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get');
		if (error) {
			console.error("获取用户信息失败:", error);
			uni.showToast({
				title: '无法获取用户信息，请重新登录',
				icon: 'none'
			});
			return;
		}
		userInfo.value = data;
		console.log("获取用户信息:", userInfo.value);
	};

	/**
	 * 创建用户付款记录的接口调用
	 * @param {object} payload - 提交给后端的数据
	 */
	const createPaymentRecord = (payload) => {
		return request('/app-api/member/user-post-pay-record/create', {
			method: 'POST',
			data: payload
		});
	};


	// --- 事件处理器 ---
	/**
	 * 选择充值类型
	 * @param {number} type - 1 for points, 2 for membership
	 */
	const selectRechargeType = (type) => {
		form.payType = type;
	};

	/**
	 * 预览二维码
	 */
	const previewQRCode = () => {
		// 增加一个安全检查，防止在URL加载失败时点击报错
		if (!paymentQRCodeUrl.value) {
			uni.showToast({
				title: '二维码正在加载中...',
				icon: 'none'
			});
			return;
		}
		uni.previewImage({
			urls: [paymentQRCodeUrl.value] // 使用动态获取的 URL
		});
	};

	/**
	 * uni-file-picker: 选择文件后的处理
	 * @param {object} e - 事件对象，包含选择的临时文件
	 */
	const handleFileSelect = async (e) => {
		isSubmitting.value = true; // 开始上传，禁用提交按钮
		uni.showLoading({
			title: '图片上传中...'
		});

		for (const tempFile of e.tempFiles) {
			const {
				data: url,
				error
			} = await uploadFile(tempFile);
			if (error) {
				uni.hideLoading();
				isSubmitting.value = false;
				uni.showToast({
					title: `图片上传失败: ${error}`,
					icon: 'none'
				});
				// 从 uni-file-picker 的模型中移除失败的文件
				const index = imageValue.value.findIndex(item => item.uuid === tempFile.uuid);
				if (index > -1) {
					imageValue.value.splice(index, 1);
				}
				return; // 中断上传
			}
			// 上传成功，将 URL 存入我们的 form.imageUrls
			form.imageUrls.push(url);
		}
		uni.hideLoading();
		isSubmitting.value = false; // 上传完成，恢复提交按钮
	};

	/**
	 * uni-file-picker: 删除文件后的处理
	 * @param {object} e - 事件对象，包含被删除的文件
	 */
	const handleFileDelete = (e) => {
		// 找出被删除文件对应的上传成功 URL 并从 form.imageUrls 中移除
		const removedFile = e.tempFile;
		// 注意：这里的匹配逻辑依赖于 uploadFile 是否返回了原始文件名或可识别信息
		// 一个更稳健的做法是在 handleFileSelect 时建立映射关系
		// 为简化，这里假设文件上传和删除顺序一致 (通常是这样)
		const index = imageValue.value.findIndex(item => item.url === removedFile.url);
		if (index > -1) {
			form.imageUrls.splice(index, 1);
		}
	};

	/**
	 * 跳转到会员详情页
	 */
	const goToMemberDetails = () => {
		uni.navigateTo({
			url: '/pages/my-memberDetails/my-memberDetails'
		});
	};

	/**
	 * 提交表单
	 */
	const handleSubmit = async () => {
		// 表单校验
		if (!form.payType) {
			return uni.showToast({
				title: '请选择充值类型',
				icon: 'none'
			});
		}
		if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
			return uni.showToast({
				title: '请输入有效的付款金额',
				icon: 'none'
			});
		}
		if (!form.payNo.trim()) {
			return uni.showToast({
				title: '请输入支付订单号',
				icon: 'none'
			});
		}
		if (form.imageUrls.length === 0) {
			return uni.showToast({
				title: '请上传支付凭证',
				icon: 'none'
			});
		}
		if (!userInfo.value || !userInfo.value.id) {
			return uni.showToast({
				title: '无法获取用户信息，请重试',
				icon: 'none'
			});
		}

		isSubmitting.value = true;
		uni.showLoading({
			title: '正在提交...'
		});

		// 准备提交的数据
		const payload = {
			userId: userInfo.value.id,
			amount: parseFloat(form.amount),
			payNo: form.payNo.trim(),
			imageUrls: form.imageUrls.join(','), // 将 URL 数组拼接成字符串
			remark: form.remark.trim(),
			payType: form.payType,
		};

		const {
			data: recordId,
			error
		} = await createPaymentRecord(payload);

		uni.hideLoading();
		isSubmitting.value = false;

		if (error) {
			return uni.showToast({
				title: `提交失败: ${error}`,
				icon: 'none'
			});
		}

		// 提交成功
		uni.showModal({
			title: '提交成功',
			content: `您的充值申请已提交，ID为 ${recordId}，请耐心等待后台审核。`,
			showCancel: false,
			success: () => {
				uni.navigateBack(); // 成功后返回上一页
			}
		});
	};
</script>

<style lang="scss" scoped>
	// 【需求6】定义主题色
	$theme-color: #FF6E00;

	.recharge-container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding: 30rpx;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	.header-section {
		text-align: center;
		margin-bottom: 40rpx;
		padding: 20rpx 0;

		.page-title {
			font-size: 48rpx;
			font-weight: bold;
			color: $theme-color;
		}

		.page-subtitle {
			font-size: 28rpx;
			color: #888;
			margin-top: 10rpx;
		}
	}

	.form-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.step-indicator {
		width: 48rpx;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		border-radius: 50%;
		background-color: $theme-color;
		color: white;
		font-weight: bold;
		font-size: 32rpx;
		margin-right: 20rpx;
	}

	.card-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
	}

	.qrcode-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;

		.qrcode-image {
			width: 350rpx;
			height: 350rpx;
			border-radius: 16rpx;
			border: 1px solid #eee;
		}

		.qrcode-placeholder {
			width: 350rpx;
			height: 350rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f7f7f7;
			border-radius: 16rpx;
			border: 1px solid #eee;
		}

		.qrcode-tip {
			font-size: 28rpx;
			color: #666;
		}
	}

	.form-item {
		margin-bottom: 40rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.form-label {
		display: block;
		font-size: 30rpx;
		color: #333;
		margin-bottom: 20rpx;
		font-weight: 500;

		&.required::after {
			content: '*';
			color: #ff4d4f;
			margin-left: 8rpx;
		}
	}

	.recharge-type-selector {
		display: flex;
		gap: 30rpx;

		button {
			flex: 1;
			background-color: #f5f5f5;
			color: #555;
			border: 1px solid #e0e0e0;
			transition: all 0.2s ease;
			font-size: 28rpx;

			&.active {
				background-color: $theme-color;
				color: white;
				border-color: $theme-color;
				font-weight: bold;
			}

			&::after {
				border: none;
			}
		}
	}

	.type-tip {
		margin-top: 20rpx;
		padding: 15rpx 20rpx;
		background-color: #fff8f0;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #888;
		display: flex;
		align-items: center;

		.link-text {
			color: $theme-color;
			text-decoration: underline;
			margin: 0 8rpx;
			font-weight: 500;
		}
	}

	.form-input {
		width: 100%;
		height: 90rpx;
		padding: 0 30rpx;
		background-color: #f7f7f7;
		border-radius: 16rpx;
		font-size: 30rpx;
		color: #333;
		border: 1px solid transparent;
		box-sizing: border-box;
		transition: border-color 0.2s;

		&:focus {
			border-color: $theme-color;
			background-color: #fff;
		}
	}

	.form-textarea {
		width: 100%;
		height: 180rpx;
		padding: 20rpx 30rpx;
		background-color: #f7f7f7;
		border-radius: 16rpx;
		font-size: 30rpx;
		color: #333;
		box-sizing: border-box;
		border: 1px solid transparent;
		transition: border-color 0.2s;

		&:focus {
			border-color: $theme-color;
			background-color: #fff;
		}
	}

	.form-tip {
		font-size: 26rpx;
		color: #999;
		margin-top: 15rpx;
		display: flex;
		align-items: center;

		.uni-icons {
			margin-right: 8rpx;
		}
	}

	::v-deep .uni-file-picker__container {
		justify-content: flex-start;
	}

	.security-notice {
		display: flex;
		align-items: flex-start;
		gap: 15rpx;
		padding: 25rpx;
		background-color: #fff8f0;
		border-radius: 16rpx;
		color: #666;
		font-size: 26rpx;
		line-height: 1.6;
	}

	.submit-button-container {
		margin-top: 50rpx;
		padding-bottom: 40rpx;
	}

	.submit-button {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background: linear-gradient(135deg, $theme-color, darken($theme-color, 10%));
		color: white;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 48rpx;
		border: none;
		box-shadow: 0 10rpx 30rpx rgba($theme-color, 0.3);
		transition: all 0.2s;

		&[disabled] {
			background: #ccc;
			box-shadow: none;
			color: #888;
		}

		&::after {
			border: none;
		}
	}
</style>