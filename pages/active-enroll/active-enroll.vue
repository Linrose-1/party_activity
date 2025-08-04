<template>
	<view class="container">
		<view class="header">
			<!-- 【修改】动态绑定活动标题 -->
			<h1>{{ activityDetail ? activityDetail.activityTitle : '活动报名' }}</h1>
		</view>

		<!-- 步骤指示器 -->
		<view class="step-indicator">
			<view class="step" :class="{ active: currentStep >= 1 }">
				<view class="step-circle">1</view>
				<view class="step-text">填写信息</view>
			</view>
			<view class="step" :class="{ active: currentStep >= 2 }">
				<view class="step-circle">2</view>
				<view class="step-text">支付费用</view>
			</view>
			<view class="step" :class="{ active: currentStep >= 3 }">
				<view class="step-circle">3</view>
				<view class="step-text">完成报名</view>
			</view>
		</view>

		<!-- 【修改】使用 v-if 确保数据加载后再渲染 -->
		<view class="section" v-if="activityDetail">
			<view class="section-title">
				<uni-icons type="person" size="18" color="#FF6E00"></uni-icons>
				<span>组织者信息</span>
			</view>
			<view class="info-box">
				<!-- 【修改】动态绑定组织者单位和电话 -->
				<view><strong>单位：</strong> {{ activityDetail.organizerUnitName }}</view>
				<view><strong>电话：</strong> {{ activityDetail.organizerContactPhone }}</view>
				<!-- 【修改】动态绑定活动时间和地点 -->
				<view><strong>活动时间：</strong> {{ formatRangeTime(activityDetail.startDatetime, activityDetail.endDatetime) }}</view>
				<view><strong>报名时间：</strong> {{ formattedRegistrationTime }}</view>
				<view><strong>活动地点：</strong> {{ activityDetail.locationAddress }}</view>
			</view>
		</view>

		<!-- 第一步：填写信息 -->
		<view class="section" v-if="currentStep === 1">
			<view class="section-title">
				<uni-icons type="compose" size="18" color="#FF6E00"></uni-icons>
				<span>填写报名信息</span>
			</view>

			<!-- 【修改】formData 的字段与后端接口对应 -->
			<view class="input-item">
				<label for="name">姓名</label>
				<uni-easyinput type="text" v-model="formData.userName" placeholder="请输入您的姓名"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>
			<view class="input-item">
				<label for="phone">手机号</label>
				<uni-easyinput type="tel" v-model="formData.userPhone" placeholder="请输入手机号"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>
			<view class="input-item">
				<label for="company">单位/学校</label>
				<uni-easyinput type="text" v-model="formData.contactAddress" placeholder="请输入单位或学校名称"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>
			
			<!-- 【新增】当需要排队时，显示申请理由输入框 -->
			<view class="input-item" v-if="isQueuing">
				<label for="remark">申请理由（排队中）</label>
				<uni-easyinput type="textarea" autoHeight v-model="formData.remark" placeholder="当前报名人数已满，填写申请理由可提高审核通过率"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>

			<button class="btn" :class="{ 'btn-disabled': !canSubmitStep1 }" @click="confirmSignup">
				下一步：支付报名费
			</button>
		</view>

		<!-- 第二步：支付费用 -->
		<view class="section" v-if="currentStep === 2 && activityDetail">
			<view class="section-title">
				<uni-icons type="shop" size="18" color="#FF6E00"></uni-icons>
				<!-- 【修改】动态绑定报名费用 -->
				<span>支付报名费用 <span class="price-tag">¥{{ activityDetail.registrationFee }}</span></span>
			</view>

			<view class="qr-code">
				<!-- 【修改】动态绑定收款码 -->
				<img :src="activityDetail.organizerPaymentQrCodeUrl" alt="微信支付二维码" />
				<view class="qr-note">请使用微信扫码完成支付</view>
			</view>

			<view class="section-title">
				<uni-icons type="image" size="18" color="#FF6E00"></uni-icons>
				<span>上传付款凭证</span>
			</view>
			
			<!-- 【修改】使用真实上传逻辑 -->
			<view class="upload-box" @click="chooseImage">
				<view v-if="!formData.paymentScreenshotUrl">
					<view class="upload-icon">
						<uni-icons type="plus" size="24" color="#FF6E00"></uni-icons>
					</view>
					<view class="upload-text">点击上传付款截图</view>
					<view class="upload-text" style="font-size: 24rpx; margin-top: 10rpx">
						支持JPG、PNG格式，小于5MB
					</view>
				</view>
				<img v-else :src="formData.paymentScreenshotUrl" class="preview-image" alt="付款截图" />
			</view>
			<view class="prompt">
				ⓘ请上传带支付订单号的付款凭证截图
			</view>

			<!-- 【修改】绑定真实的提交方法 -->
			<button class="btn" :class="{ 'btn-disabled': !formData.paymentScreenshotUrl }" @click="joinActivity">
				提交报名信息
			</button>
		</view>

		<!-- 第三步：完成报名 -->
		<view v-if="currentStep === 3">
			<view class="success-message">
				<view class="success-icon">🎉</view>
				<view>恭喜您报名成功！</view>
				<!-- <view style="font-size: 28rpx; color: #666; margin-top: 30rpx">
					我们已发送确认短信至您的手机
				</view>
				<view style="font-size: 28rpx; color: #FF6E00; margin-top: 10rpx">
					{{ formData.userPhone }}
				</view> -->
			</view>

			<view class="section" v-if="activityDetail">
				<view class="info-box">
					<view><strong>活动名称：</strong> {{ activityDetail.activityTitle }}</view>
					<view><strong>报名编号：</strong> {{ generateTicketNumber() }}</view>
					<view><strong>报名时间：</strong> {{ currentDate }}</view>
					<view><strong>温馨提示：</strong> 请于活动开始前15分钟携带本页面截图签到</view>
				</view>
			</view>

			<button class="btn" @click="backToHome" style="margin: 30rpx">
				返回首页
			</button>
		</view>

		<view class="footer">
			<p>创新科技活动策划部 © 2023 版权所有</p>
			<p>客服电话: 021-68881234 | 服务时间: 9:00-18:00</p>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		reactive,
		onMounted // 移除了 onMounted，因为在 onLoad 里调用了
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	const currentStep = ref(1);
	
	const formData = reactive({
		userName: '',
		userPhone: '',
		contactAddress: '',
		remark: '',
		paymentScreenshotUrl: '' // 用于存储上传后的真实网络URL
	});

	const activityId = ref(null);
	const activityDetail = ref(null);

	onLoad((options) => {
		if (options.id) {
			activityId.value = options.id;
			getActiveDetail(); // 在拿到 ID 后直接调用数据获取函数
		} else {
			console.error('未接收到活动ID！');
			uni.showToast({ title: '加载活动详情失败，缺少ID', icon: 'none' });
		}
	});

	const currentDate = new Date().toLocaleString('zh-CN', {
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit',
	}).replace(/\//g, '-');
	
	const formatRangeTime = (start, end) => {
			const format = (timestamp) => {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			}
			return `${format(start)} - ${format(end)}`;
		}
	
	    // 【新增】用于报名时间的计算属性
	    const formattedRegistrationTime = computed(() => {
	        if (!activityDetail.value) return '待定';
	        return formatRangeTime(activityDetail.value.registrationStartDatetime, activityDetail.value.registrationEndDatetime);
	    });
	
	const isQueuing = computed(() => {
		if (!activityDetail.value) return false;
		return (activityDetail.value.joinCount || 0) >= activityDetail.value.totalSlots;
	});

	const canSubmitStep1 = computed(() => {
		const baseValid = formData.userName.trim() && /^1[3-9]\d{9}$/.test(formData.userPhone);
		if (isQueuing.value) {
			return baseValid && formData.remark.trim();
		}
		return baseValid;
	});

	const confirmSignup = () => {
		if (!canSubmitStep1.value) {
			if (!formData.userName.trim()) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
			if (!/^1[3-9]\d{9}$/.test(formData.userPhone)) { uni.showToast({ title: '请输入有效的手机号', icon: 'none' }); return; }
			if (isQueuing.value && !formData.remark.trim()) { uni.showToast({ title: '报名已满，请填写申请理由', icon: 'none' }); return; }
		}
		currentStep.value = 2;
	};
	
	const chooseImage = () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const file = res.tempFiles[0];
	
					// (可选) 文件大小校验
					const maxSize = 5 * 1024 * 1024; // 5MB
					if (file.size > maxSize) {
						return uni.showToast({ title: '文件大小不能超过5MB', icon: 'none' });
					}
	
					uni.showLoading({ title: '上传中...', mask: true });
	
					// 【关键】直接调用导入的 uploadFile 工具函数
					// 为付款凭证指定一个清晰的目录名，方便后端管理
					const result = await uploadFile(file, { directory: 'payment-proof' });
	
					uni.hideLoading();
	
					if (result.data) {
						// 上传成功，将返回的真实URL赋值给 formData
						formData.paymentScreenshotUrl = result.data;
						uni.showToast({ title: '上传成功', icon: 'success' });
					} else {
						console.error("上传失败:", result.error);
						uni.showToast({ title: result.error || '上传失败', icon: 'none' });
					}
				}
			});
		};


	const getActiveDetail = async () => {
		if (!activityId.value) return;
		const result = await request('/app-api/member/activity/get', {
			method: 'GET',
			data: { id: activityId.value }
		});
		if (result && !result.error) {
			activityDetail.value = result.data;
		} else {
			console.log('请求失败:', result ? result.error : '无返回结果');
		}
	};

	const joinActivity = async () => {
		if (!formData.paymentScreenshotUrl) {
			uni.showToast({ title: '请上传付款截图', icon: 'none' });
			return;
		}
		
		uni.showLoading({ title: '提交中...', mask: true });

		const userId = uni.getStorageSync('userId');
		if (!userId) {
			uni.hideLoading();
			uni.showToast({ title: '无法获取用户信息，请重新登录', icon: 'none' });
			return;
		}

		const params = {
			activityId: activityId.value,
			userId: userId,
			registeredAt: new Date().toISOString(),
			paymentScreenshotUrl: formData.paymentScreenshotUrl,
			userName: formData.userName,
			userPhone: formData.userPhone,
			contactAddress: formData.contactAddress,
			remark: formData.remark
		};

		const result = await request('/app-api/member/activity-join/join-activity', {
			method: 'POST',
			data: params
		});
		
		uni.hideLoading();

		if (result && !result.error) {
			uni.showToast({ title: '报名成功！', icon: 'success' });
			currentStep.value = 3;
		} else {
			console.log('报名失败:', result ? result.error : '无返回结果');
			uni.showToast({ title: result.error || '报名失败，请重试', icon: 'none' });
		}
	};

	const generateTicketNumber = () => {
		const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
		const randomLetter = letters[Math.floor(Math.random() * letters.length)];
		const randomNumbers = Math.floor(100000 + Math.random() * 900000);
		return `TK${randomLetter}${randomNumbers}`;
	};

	const backToHome = () => {
		uni.navigateBack();
	};
</script>


<style scoped>
	/* body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  padding: 20rpx;
} */
	.container {
		max-width: 500px;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.header {
		text-align: center;
		background: linear-gradient(135deg, #ff6e00 0%, #ff8e3d 100%);
		color: white;
		padding: 40rpx 0;
		margin-bottom: 20rpx;
	}

	.header h1 {
		font-size: 36rpx;
		font-weight: bold;
		letter-spacing: 1rpx;
	}

	.section {
		margin-bottom: 40rpx;
		padding: 0 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff6e00;
		border-left: 8rpx solid #ff6e00;
		padding-left: 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
	}

	.section-title .icon {
		margin-right: 10rpx;
		font-size: 36rpx;
	}

	.info-box {
		background: #fff8f2;
		border: 1rpx solid #ffd9c4;
		padding: 25rpx 30rpx;
		border-radius: 12rpx;
		line-height: 1.6;
		font-size: 28rpx;
	}

	.info-box view {
		margin: 15rpx 0;
	}

	label {
		display: block;
		margin: 20rpx 0 10rpx;
		font-weight: bold;
		font-size: 28rpx;
	}

	.input-item {
		margin-bottom: 30rpx;
	}

	.btn {
		padding: 10rpx;
		background: linear-gradient(135deg, #ff6e00 0%, #ff8e3d 100%);
		color: white;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s;
		text-align: center;
		margin: 20rpx 0;
		box-shadow: 0 4rpx 12rpx rgba(255, 110, 0, 0.2);
	}

	.btn:active {
		transform: translateY(4rpx);
		box-shadow: 0 2rpx 6rpx rgba(255, 110, 0, 0.2);
	}

	.btn-disabled {
		background: #ccc;
		box-shadow: none;
		opacity: 0.7;
		cursor: not-allowed;
	}

	.qr-code {
		text-align: center;
		margin: 30rpx 0;
		padding: 20rpx;
		background: #fff8f2;
		border-radius: 16rpx;
	}

	.qr-code img {
		width: 300rpx;
		height: 300rpx;
		border-radius: 16rpx;
		border: 1rpx solid #eee;
		background: white;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.qr-note {
		color: #ff6e00;
		font-size: 26rpx;
		margin-top: 20rpx;
		font-weight: bold;
	}

	.price-tag {
		background: #ff6e00;
		color: white;
		padding: 10rpx 20rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
		display: inline-block;
		margin-left: 20rpx;
	}

	.success-message {
		text-align: center;
		color: #4caf50;
		font-size: 36rpx;
		font-weight: bold;
		padding: 60rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.success-icon {
		font-size: 80rpx;
		margin-bottom: 30rpx;
		animation: bounce 0.8s ease-in-out;
	}

	.upload-box {
		background: #f8f8f8;
		border: 2rpx dashed #ddd;
		border-radius: 16rpx;
		padding: 40rpx 20rpx;
		text-align: center;
		margin: 30rpx 0;
		transition: all 0.3s;
		cursor: pointer;
	}
	
	.prompt{
		color: #999;
		font-size: 28rpx;
	}

	.upload-box.active {
		border-color: #ff6e00;
		background: #fff8f2;
	}

	.upload-icon {
		font-size: 60rpx;
		color: #ff6e00;
		margin-bottom: 20rpx;
	}

	.upload-text {
		color: #666;
		font-size: 26rpx;
	}

	.preview-image {
		width: 300rpx;
		height: 300rpx;
		border-radius: 16rpx;
		margin: 0 auto;
		display: block;
		border: 1rpx solid #eee;
		object-fit: cover;
		/* Ensure image covers the area */
	}

	.step-indicator {
		display: flex;
		justify-content: center;
		margin: 30rpx 0;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 200rpx;
		position: relative;
	}

	.step:not(:last-child)::after {
		content: '';
		position: absolute;
		top: 30rpx;
		right: -60rpx;
		width: 120rpx;
		height: 4rpx;
		background: #ddd;
		z-index: 1;
		/* Ensure line is behind circle */
	}

	.step.active:not(:last-child)::after {
		background: #ff6e00;
	}

	.step-circle {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background: #ddd;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 15rpx;
		z-index: 2;
	}

	.step.active .step-circle {
		background: #ff6e00;
	}

	.step-text {
		font-size: 26rpx;
		color: #999;
		text-align: center;
	}

	.step.active .step-text {
		color: #ff6e00;
		font-weight: bold;
	}

	@keyframes bounce {

		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}

		40% {
			transform: translateY(-30rpx);
		}

		60% {
			transform: translateY(-15rpx);
		}
	}

	.footer {
		text-align: center;
		padding: 30rpx;
		color: #999;
		font-size: 24rpx;
		border-top: 1rpx solid #eee;
		margin-top: 30rpx;
	}
</style>