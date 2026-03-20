<template>
	<view class="container">
		<!-- 实名认证引导提示 -->
		<!-- <view v-if="!isUserVerified" class="auth-reminder" @click="goToAuthPage">
			<uni-icons type="info-filled" size="18" color="#e6a23c"></uni-icons>
			<text class="reminder-text">为保障活动用户安全，请先进行实名认证，点击前往</text>
			<text class="reminder-arrow">›</text>
		</view> -->


		<view class="header">
			<!-- 动态绑定聚会标题 -->
			<h1>{{ activityDetail ? activityDetail.activityTitle : '聚会报名' }}</h1>
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

		<!-- 使用 v-if 确保数据加载后再渲染 -->
		<view class="section" v-if="activityDetail">
			<view class="section-title">
				<!-- <uni-icons type="person" size="18" color="#FF6E00"></uni-icons> -->
				<span>组织者信息</span>
			</view>
			<view class="info-box">
				<view><span class="info-label">组织者：</span> {{ activityDetail.organizerUnitName }}</view>
				<view><span class="info-label">电话：</span> {{ activityDetail.organizerContactPhone }}</view>
				<view><span class="info-label">聚会时间：</span>
					{{ formatRangeTime(activityDetail.startDatetime, activityDetail.endDatetime) }}
				</view>
				<view><span class="info-label">报名时间：</span> {{ formattedRegistrationTime }}</view>
				<view><span class="info-label">聚会地点：</span> {{ activityDetail.locationAddress }}</view>
			</view>
		</view>

		<!-- 第一步：填写信息 -->
		<view class="section" v-if="currentStep === 1">
			<view class="section-title">
				<!-- <uni-icons type="compose" size="18" color="#FF6E00"></uni-icons> -->
				<span>填写报名信息</span>
			</view>

			<!-- 【修改】formData 的字段与后端接口对应 -->
			<view class="input-item">
				<label for="name">姓名</label>
				<uni-easyinput type="text" v-model="formData.userName" placeholder="请输入您的姓名"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>
			<view class="input-item">
				<label for="phone">手机</label>
				<uni-easyinput type="tel" v-model="formData.userPhone" placeholder="请输入手机号"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>
			<view class="input-item">
				<label for="company">所在机公司/机构/组织</label>
				<uni-easyinput type="text" v-model="formData.contactAddress" placeholder="请输入单位或学校名称"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>

			<!-- 当需要排队时，显示申请理由输入框 -->
			<view class="input-item" v-if="isQueuing">
				<label for="remark">申请理由（排队中）</label>
				<uni-easyinput type="textarea" autoHeight v-model="formData.remark"
					placeholder="当前报名人数已满，填写申请理由可提高审核通过率"
					:styles="{ borderColor: '#eee', borderRadius: '12rpx' }"></uni-easyinput>
			</view>

			<button class="btn" :class="{ 'btn-disabled': !canSubmitStep1 }" @click="confirmSignup">
				{{ step1ButtonText }}
			</button>
		</view>

		<!-- 第二步：支付费用 -->
		<view class="section" v-if="currentStep === 2 && activityDetail">
			<view class="section-title">
				<!-- <uni-icons type="shop" size="18" color="#FF6E00"></uni-icons> -->
				<!-- 动态绑定报名费用 -->
				<span>支付报名费用 <span class="price-tag">¥{{ activityDetail.registrationFee }}</span></span>
			</view>

			<view class="qr-code">
				<!-- 动态绑定收款码 -->
				<image v-if="activityDetail.organizerPaymentQrCodeUrl" :src="activityDetail.organizerPaymentQrCodeUrl"
					class="qr-code-image" mode="widthFix" @click="previewQrCode" alt="微信支付二维码" show-menu-by-longpress
					binderror="onImageError" bindload="onImageLoad" :style="{ width: '400rpx', height: '400rpx' }" />
				<view class="qr-note">请使用微信扫码完成支付</view>
			</view>

			<view class="section-title">
				<uni-icons type="image" size="18" color="#FF6E00"></uni-icons>
				<span>上传付款凭证</span>
			</view>

			<!-- 【修改】使用真实上传逻辑 -->
			<view class="upload-box" @click="chooseImage">
				<view v-if="!formData.paymentScreenshotUrl">
					<!-- <view class="upload-icon">
						<uni-icons type="plus" size="24" color="#FF6E00"></uni-icons>
					</view> -->
					<view class="upload-text">点击上传付款截图</view>
					<view class="upload-text" style="font-size: 24rpx; margin-top: 10rpx">
						支持JPG、PNG格式，小于5MB
					</view>
				</view>
				<img v-else :src="formData.paymentScreenshotUrl" class="preview-image" alt="付款截图" />
			</view>
			<view class="prompt">
				ⓘ请上传带支付订单号的付款凭证截图（微信支付-->账单详情页）
			</view>

			<view class="agreement-section">
				<!-- 用户协议勾选框 -->
				<view class="agreement-checkbox">
					<radio :checked="agreedToTerms" @click="toggleAgreement" color="#FF6E00"
						style="transform:scale(0.8)" />
					<view class="agreement-text">
						我已充分知悉并同意
						<text class="link" @click.stop="navigateToAgreement">《用户协议》</text>
					</view>
				</view>

				<!-- 风险提示 -->
				<view class="risk-warning">
					<view class="risk-title">猩聚会聚会风险提示</view>
					<view class="risk-content">
						猩聚会为平台用户提供自主化的主题聚会/聚会的组织工具，平台会通过腾讯风控系统对小程序的风控措施与要求，对聚会上传的文案与图片进行基本审核，但对主题聚会/聚会组织者以及聚会/聚会本身的动机与环境不能给予足够完善或全面的审核，请用户务必基于实际风险判断决定是否参与主题聚会/聚会；主题聚会/聚会组织者有义务与责任，共同监督与杜绝欺瞒、诈骗甚至人身安全等商业社交风险的发生，并对聚会/聚会中发生的以上商业社交风险负有全部责任。
					</view>
				</view>
			</view>

			<!-- 绑定真实的提交方法 -->
			<button class="btn" :class="{ 'btn-disabled': !formData.paymentScreenshotUrl || !agreedToTerms }"
				@click="joinActivity">
				提交报名信息
			</button>
		</view>

		<!-- 第三步：完成报名 -->
		<view v-if="currentStep === 3">
			<!-- 情况 A: 待确认 (joinStatus === 1) -->
			<view v-if="activityDetail && activityDetail.joinStatus === 1" class="success-message">
				<view class="success-icon" style="font-size: 60rpx;">⏳</view> <!-- 换个沙漏图标 -->
				<view class="status-title">报名已提交，等待确认</view>
				<view class="status-desc" style="font-size: 28rpx; color: #666; margin-top: 20rpx; padding: 0 40rpx;">
					您的报名申请已提交给组织者，请耐心等待审核。审核结果将通过系统消息通知您。
				</view>
			</view>

			<!-- 情况 B: 已报名成功 (joinStatus === 2 或 刚刚提交成功) -->
			<view v-else class="success-message">
				<view class="success-icon">🎉</view>
				<view class="status-title">报名成功</view>
				<view class="status-desc" style="font-size: 28rpx; color: #666; margin-top: 20rpx;">
					您的报名已通过确认，期待您的到来！
				</view>
			</view>

			<view class="section" v-if="activityDetail">
				<view class="info-box">
					<view><span class="info-label">聚会名称：</span> {{ activityDetail.activityTitle }}</view>
					<view><span class="info-label">报名时间：</span> {{ currentDate }}</view>
					<view><span class="info-label">温馨提示：</span> 请于聚会开始前15分钟携带本页面截图签到</view>
					<!-- <view><strong>报名编号：</strong> {{ generateTicketNumber() }}</view> -->
				</view>
			</view>

			<button class="btn" @click="backToHome" style="margin: 30rpx">
				返回首页
			</button>
		</view>

		<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		reactive,
		onMounted,
		watch
	} from 'vue';
	import {
		onLoad,
		onReady
	} from '@dcloudio/uni-app'
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';
	import {
		isScenario3User
	} from '@/utils/user.js';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';

	const isUserVerified = ref(true); // 默认为 true，避免页面闪烁

	const smartGuidePopupRef = ref(null);

	// 检查用户实名认证状态的函数
	const checkUserVerificationStatus = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (!error && data) {
			// 如果 idCard 字段为空或 null，则视为未实名
			isUserVerified.value = !!data.idCard;
		} else {
			// 获取用户信息失败，也按未认证处理，但这里我们先假设已认证，避免不必要的打扰
			// 真正的拦截会在提交时由后端完成
			isUserVerified.value = false; // 或者根据业务需要设为 false
			console.log('获取用户信息失败，无法确认实名状态。');
		}
	};

	// 跳转到实名认证页面的函数
	const goToAuthPage = () => {
		uni.navigateTo({
			url: '/packages/my-auth/my-auth'
		});
	};

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

	const agreedToTerms = ref(false);

	const ticketNumber = ref('');

	// 定义缓存 Key
	const FORM_CACHE_KEY = 'active_enroll_form_cache';

	/**
	 * 获取当前用户资料并预填表单
	 */
	const fetchAndPrefillUserInfo = async () => {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/get', {
				method: 'GET'
			});

			if (!error && data) {
				// 只有当表单对应字段为空时才进行填充，避免覆盖用户的手动输入（如果缓存恢复了数据的话）
				if (!formData.userName) {
					formData.userName = data.realName || data.nickname || '';
				}
				if (!formData.userPhone) {
					formData.userPhone = data.mobile || '';
				}
				if (!formData.contactAddress) {
					// 将用户的公司名称填充到“所在公司/机构/组织”字段
					formData.contactAddress = data.companyName || '';
				}
				console.log('✅ 已根据用户资料自动预填报名信息');
			}
		} catch (e) {
			console.error('自动预填信息失败:', e);
		}
	};

	onLoad((options) => {
		// checkUserVerificationStatus();

		if (options.id) {
			activityId.value = options.id;
			// 现在 getActiveDetail 会处理所有逻辑
			getActiveDetail();
		} else {
			console.error('未接收到聚会ID！');
			uni.showToast({
				title: '加载聚会详情失败，缺少ID',
				icon: 'none'
			});
			// 如果没有ID，直接返回，避免后续执行
			setTimeout(() => uni.navigateBack(), 1500);
		}

		let hasCache = false;

		// 尝试恢复缓存的表单数据
		try {
			const cachedData = uni.getStorageSync(FORM_CACHE_KEY);
			if (cachedData) {
				const parsedData = JSON.parse(cachedData);
				// 逐个字段恢复，避免覆盖 formData 的响应式引用
				formData.userName = parsedData.userName || '';
				formData.userPhone = parsedData.userPhone || '';
				formData.contactAddress = parsedData.contactAddress || '';
				formData.remark = parsedData.remark || '';
				formData.paymentScreenshotUrl = parsedData.paymentScreenshotUrl || '';

				console.log('已恢复上次未提交的报名信息');

				hasCache = true;
			}
		} catch (e) {
			console.error('读取缓存失败', e);
		}

		if (!hasCache) {
			fetchAndPrefillUserInfo();
		}
	});

	onReady(() => {
		// 页面加载完了，用户可以开始写内容了，此时弹出引导
		if (isScenario3User()) {
			smartGuidePopupRef.value?.open();
		}
	});

	// 监听 formData 变化，实时写入缓存
	// deep: true 确保监听对象内部属性的变化
	watch(formData, (newVal) => {
		// 使用防抖或者是简单的直接保存（uni.setStorage 是异步的，setStorageSync 是同步的）
		// 考虑到输入频率，可以用一个简单的防抖，或者直接保存（数据量小影响不大）
		try {
			uni.setStorageSync(FORM_CACHE_KEY, JSON.stringify(newVal));
		} catch (e) {
			console.error('保存缓存失败', e);
		}
	}, {
		deep: true
	});

	// 切换协议勾选状态的方法
	const toggleAgreement = () => {
		agreedToTerms.value = !agreedToTerms.value;
	};

	// 跳转到用户协议页面的方法
	const navigateToAgreement = () => {
		uni.navigateTo({
			url: '/pages/user-agreement/user-agreement'
		});
	};

	const currentDate = new Date().toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
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
		return formatRangeTime(activityDetail.value.registrationStartDatetime, activityDetail.value
			.registrationEndDatetime);
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
			if (!formData.userName.trim()) {
				uni.showToast({
					title: '请输入姓名',
					icon: 'none'
				});
				return;
			}
			if (!/^1[3-9]\d{9}$/.test(formData.userPhone)) {
				uni.showToast({
					title: '请输入有效的手机号',
					icon: 'none'
				});
				return;
			}
			if (isQueuing.value && !formData.remark.trim()) {
				uni.showToast({
					title: '报名已满，请填写申请理由',
					icon: 'none'
				});
				return;
			}
			return;
		}

		// 判断活动是否免费
		if (activityDetail.value && activityDetail.value.registrationFee === 0) {
			// 如果是免费活动，直接调用提交方法
			console.log('免费活动，直接提交报名');
			joinActivity();
		} else {
			// 如果是收费活动，按原逻辑进入第二步
			console.log('收费活动，进入支付步骤');
			currentStep.value = 2;
		}

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
					return uni.showToast({
						title: '文件大小不能超过5MB',
						icon: 'none'
					});
				}

				uni.showLoading({
					title: '上传中...',
					mask: true
				});

				// 【关键】直接调用导入的 uploadFile 工具函数
				// 为付款凭证指定一个清晰的目录名，方便后端管理
				const result = await uploadFile(file, {
					directory: 'payment-proof'
				});

				uni.hideLoading();

				if (result.data) {
					// 上传成功，将返回的真实URL赋值给 formData
					formData.paymentScreenshotUrl = result.data;
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				} else {
					console.error("上传失败:", result.error);
					uni.showToast({
						title: result.error || '上传失败',
						icon: 'none'
					});
				}
			}
		});
	};


	const getActiveDetail = async () => {
		if (!activityId.value) return;

		uni.showLoading({
			title: '加载中...',
			mask: true
		});

		try {
			const result = await request('/app-api/member/activity/get', {
				method: 'GET',
				data: {
					id: activityId.value
				}
			});

			uni.hideLoading();

			if (result && !result.error) {
				const data = result.data;
				console.log('getActiveDetail result:', data);

				activityDetail.value = data; // 先赋值，后续逻辑依赖它

				// 获取 joinStatus，如果没有则默认为 0 (未报名)
				// 注意：有些后端可能放在 data.joinStatus，也可能放在 data.memberActivityJoinResp.joinStatus
				// 根据你的描述是 activity/get 接口直接返回，假设在 data 根层级，或者你需要确认一下层级
				// 这里假设字段在 data.joinStatus (如果是在 memberActivityJoinResp 里，请改为 data.memberActivityJoinResp?.joinStatus)
				// 补充：根据之前的代码结构，已报名信息在 memberActivityJoinResp 里，建议优先检查那里，或者根目录

				// 假设 joinStatus 在 data 根目录下 (根据你提供的接口描述)
				// 同时也兼容旧逻辑 (检查 memberActivityJoinResp)
				let status = 0;
				if (data.joinStatus !== undefined) {
					status = data.joinStatus;
				} else if (data.memberActivityJoinResp) {
					// 兼容旧数据的推断逻辑
					status = 2; // 有 resp 视为已报名/待确认，具体细分可能看后端旧字段
				}

				console.log('当前报名状态 joinStatus:', status);

				if (status === 2) {
					// === 2 已报名 (报名成功) ===
					console.log('状态：已报名，跳转成功页');
					ticketNumber.value = generateTicketNumber(); // 或从后端取

					// 预填信息
					if (data.memberActivityJoinResp) {
						formData.userName = data.memberActivityJoinResp.userName || '';
						formData.userPhone = data.memberActivityJoinResp.userPhone || '';
						formData.paymentScreenshotUrl = data.memberActivityJoinResp.paymentScreenshotUrl || '';
					}
					currentStep.value = 3;

				} else if (status === 1) {
					// === 1 待确认 (新增逻辑) ===
					console.log('状态：待确认，跳转等待页');
					// 也可以复用步骤3的界面，只是文案不同
					// 预填信息
					if (data.memberActivityJoinResp) {
						formData.userName = data.memberActivityJoinResp.userName || '';
						formData.userPhone = data.memberActivityJoinResp.userPhone || '';
					}
					currentStep.value = 3; // 复用结果页

				} else {
					// === 0 未报名 ===
					console.log('状态：未报名，进入填写页');
					currentStep.value = 1;
				}
			} else {
				console.log('请求失败:', result ? result.error : '无返回结果');
				uni.showToast({
					title: result.error || '获取聚会信息失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.hideLoading();
			console.error('获取聚会详情时发生异常:', e);
			uni.showToast({
				title: '网络异常，请稍后重试',
				icon: 'none'
			});
		}
	};

	const joinActivity = async () => {
		// 判断活动是否免费，以便跳过支付相关的验证
		const isFree = activityDetail.value && activityDetail.value.registrationFee === 0;
		// 只有在收费活动时，才执行以下验证
		if (!isFree) {
			if (!formData.paymentScreenshotUrl) {
				uni.showToast({
					title: '请上传付款截图',
					icon: 'none'
				});
				return;
			}
			if (!agreedToTerms.value) {
				uni.showToast({
					title: '请先阅读并同意用户协议',
					icon: 'none'
				});
				return;
			}
		}

		uni.showLoading({
			title: '提交中...',
			mask: true
		});

		const userId = uni.getStorageSync('userId');
		if (!userId) {
			uni.hideLoading();
			uni.showToast({
				title: '无法获取用户信息，请重新登录',
				icon: 'none'
			});
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
			// 报名成功
			uni.showToast({
				title: '报名成功！',
				icon: 'success'
			});

			// 提交成功，清除缓存
			uni.removeStorageSync(FORM_CACHE_KEY);

			// 通知列表页刷新（这样列表里的报名人数、状态才会更新）
			uni.$emit('refreshActivityList');

			await getActiveDetail();
		} else {
			// 报名失败，处理错误
			const error = result.error;

			// 判断是否是 453 未实名错误
			// if (typeof error === 'object' && error !== null && error.code === 453) {
			// 	// 弹出提示框引导用户去认证
			// 	uni.showModal({
			// 		title: '认证提醒',
			// 		content: error.msg || '报名聚会需要先完成实名认证，是否现在就去认证？',
			// 		confirmText: '去认证',
			// 		cancelText: '取消',
			// 		success: (res) => {
			// 			if (res.confirm) {
			// 				// 用户确认，跳转到实名认证页面
			// 				uni.navigateTo({
			// 					url: '/packages/my-auth/my-auth'
			// 				});
			// 			}
			// 		}
			// 	});
			// } else {
			// 	// 其他所有类型的错误
			// 	uni.showToast({
			// 		title: (typeof error === 'string' ? error : error.msg) || '报名失败，请重试',
			// 		icon: 'none'
			// 	});
			// }
			uni.showToast({
				title: (typeof error === 'string' ? error : error.msg) || '报名失败，请重试',
				icon: 'none'
			});
		}
	};

	/**
	 * ==================== 预览二维码 ====================
	 */
	const previewQrCode = () => {
		// 确保 activityDetail 和其中的 URL 存在，防止报错
		if (activityDetail.value && activityDetail.value.organizerPaymentQrCodeUrl) {
			uni.previewImage({
				// uni.previewImage 需要一个 URL 数组
				urls: [activityDetail.value.organizerPaymentQrCodeUrl],
				// 指定当前要显示的图片，因为只有一个，所以就是它自己
				current: activityDetail.value.organizerPaymentQrCodeUrl
			});
		}
	};

	const generateTicketNumber = () => {
		if (!ticketNumber.value) {
			const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
			const randomLetter = letters[Math.floor(Math.random() * letters.length)];
			const randomNumbers = Math.floor(100000 + Math.random() * 900000);
			ticketNumber.value = `TK${randomLetter}${randomNumbers}`;
		}
		return ticketNumber.value;
	};

	const step1ButtonText = computed(() => {
		if (activityDetail.value && activityDetail.value.registrationFee === 0) {
			return '提交报名';
		}
		return '下一步：支付报名费';
	});

	const backToHome = () => {
		uni.navigateBack();
	};
</script>


<style scoped>
	.container {
		max-width: 500px;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.auth-reminder {
		display: flex;
		align-items: center;
		padding: 20rpx;
		/* 为了美观，可以调整外边距，让它在白色容器内部显示 */
		margin: 20rpx 30rpx 0;
		background-color: #fdf6ec;
		border: 1rpx solid #faecd8;
		border-radius: 12rpx;
		color: #e6a23c;
		font-size: 26rpx;
	}

	.reminder-text {
		flex: 1;
		margin: 0 16rpx;
	}

	.reminder-arrow {
		font-size: 32rpx;
		color: #c0c4cc;
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

	.info-label {
		font-weight: bold;
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

	.qr-code .qr-code-image {
		/* 使用新的 class 选择器 */
		width: 400rpx;
		/* 可以适当调大宽度，让二维码更清晰 */
		/* height: 300rpx;  <--  关键：删除或注释掉固定的 height 属性 */
		border-radius: 16rpx;
		border: 1rpx solid #eee;
		background: white;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: block;
		/* 确保图片表现为块级元素，便于居中 */
		margin: 0 auto;
		/* 水平居中图片 */
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

	.prompt {
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

	.agreement-section {
		margin-top: 40rpx;
		margin-bottom: 20rpx;
	}

	.agreement-checkbox {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.agreement-text {
		font-size: 26rpx;
		color: #606266;
		margin-left: 10rpx;
	}

	.agreement-text .link {
		color: #FF6E00;
		/* 主题色 */
		text-decoration: none;
		/* 去掉下划线，如果需要可以保留 */
	}

	.risk-warning {
		background-color: #f5f5f5;
		border-radius: 12rpx;
		padding: 20rpx;
		font-size: 24rpx;
		color: #909399;
		line-height: 1.6;
	}

	.risk-title {
		font-weight: bold;
		color: #606266;
		margin-bottom: 10rpx;
		text-align: center;
	}
</style>