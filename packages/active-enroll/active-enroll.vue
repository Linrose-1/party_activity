<template>
	<view class="page user-select-text">
		<!-- 顶部渐变标题 -->
		<view class="header-banner">
			<text class="header-title">{{ activityDetail ? activityDetail.activityTitle : '聚会报名' }}</text>
		</view>

		<!-- 步骤指示器 -->
		<view class="step-indicator">
			<view class="step" :class="{ active: currentStep >= 1 }">
				<view class="step-circle">1</view>
				<text class="step-text">填写信息</text>
			</view>
			<view class="step" :class="{ active: currentStep >= 2 }">
				<view class="step-circle">2</view>
				<text class="step-text">支付费用</text>
			</view>
			<view class="step" :class="{ active: currentStep >= 3 }">
				<view class="step-circle">3</view>
				<text class="step-text">完成报名</text>
			</view>
		</view>

		<!-- 基础信息卡片 -->
		<view class="section-card" v-if="activityDetail">
			<view class="section-header">
				<view class="header-mark"></view>
				<text class="section-title">组织者信息</text>
			</view>
			<view class="info-content">
				<view class="info-row"><text class="label">组织者：</text><text
						class="val">{{ activityDetail.organizerUnitName }}</text></view>
				<view class="info-row"><text class="label">聚会时间：</text><text
						class="val">{{ formatRangeTime(activityDetail.startDatetime, activityDetail.endDatetime) }}</text>
				</view>
				<view class="info-row"><text class="label">聚会地点：</text><text
						class="val">{{ activityDetail.locationAddress }}</text></view>
			</view>
		</view>

		<!-- 第一步：填写信息 -->
		<view class="section-card" v-if="currentStep === 1">
			<view class="section-header">
				<view class="header-mark"></view>
				<text class="section-title">填写报名信息</text>
			</view>

			<view class="form-group">
				<view class="input-item">
					<text class="form-label">姓名</text>
					<uni-easyinput v-model="formData.userName" placeholder="请输入姓名" :styles="inputStyles" />
				</view>
				<view class="input-item">
					<text class="form-label">手机号</text>
					<uni-easyinput type="tel" v-model="formData.userPhone" placeholder="请输入手机号" :styles="inputStyles" />
				</view>
				<view class="input-item">
					<text class="form-label">单位/机构/组织</text>
					<uni-easyinput v-model="formData.contactAddress" placeholder="请输入单位或组织名称" :styles="inputStyles" />
				</view>
				<view class="input-item" v-if="isQueuing">
					<text class="form-label">申请理由（当前已满额排队中）</text>
					<uni-easyinput type="textarea" autoHeight v-model="formData.remark" placeholder="请填写申请理由"
						:styles="inputStyles" />
				</view>
			</view>

			<button class="action-btn" :class="{ 'btn-disabled': !canSubmitStep1 }" @click="confirmSignup">
				{{ step1ButtonText }}
			</button>
		</view>

		<!-- 第二步：支付费用 -->
		<view class="section-card" v-if="currentStep === 2 && activityDetail">
			<view class="section-header">
				<view class="header-mark"></view>
				<text class="section-title">支付报名费</text>
				<text class="price-tag">¥{{ activityDetail.registrationFee }}</text>
			</view>

			<view class="payment-box">
				<image v-if="activityDetail.organizerPaymentQrCodeUrl" :src="activityDetail.organizerPaymentQrCodeUrl"
					class="qr-image" mode="widthFix" show-menu-by-longpress @click="previewQrCode" />
				<text class="qr-tip">长按或点击放大识别二维码支付</text>
			</view>

			<view class="section-header" style="margin-top: 40rpx;">
				<view class="header-mark"></view>
				<text class="section-title">上传付款凭证</text>
			</view>

			<view class="upload-area" @click="chooseImage">
				<image v-if="formData.paymentScreenshotUrl" :src="formData.paymentScreenshotUrl" class="preview-img"
					mode="aspectFill" />
				<view v-else class="upload-placeholder">
					<uni-icons type="camera-filled" size="30" color="#FF62B1"></uni-icons>
					<text>点击上传支付成功截图</text>
				</view>
			</view>
			<text class="prompt-text">提示：请上传带订单号的微信支付账单详情页截图</text>

			<view class="agreement-box">
				<label class="checkbox-row" @click="toggleAgreement">
					<radio :checked="agreedToTerms" color="#FF62B1" style="transform:scale(0.7)" />
					<text class="agree-txt">我已阅读并同意 <text class="link"
							@click.stop="navigateToAgreement">《用户协议》</text></text>
				</label>

				<view class="risk-card">
					<text class="risk-title">猩聚会风险提示</text>
					<text class="risk-desc">本平台仅提供聚会组织工具，请用户务必基于实际风险判断参与。组织者对聚会中的商业社交风险负有全部责任。</text>
				</view>
			</view>

			<button class="action-btn" :class="{ 'btn-disabled': !formData.paymentScreenshotUrl || !agreedToTerms }"
				@click="joinActivity">
				提交报名申请
			</button>
		</view>

		<!-- 第三步：完成报名 -->
		<view v-if="currentStep === 3" class="result-page">
			<view class="status-box">
				<icon v-if="activityDetail?.joinStatus === 2" type="success" size="26" color="#4caf50" />
				<icon v-else type="waiting" size="26" color="#FF62B1" />
				<text class="result-title">{{ activityDetail?.joinStatus === 2 ? '报名成功' : '报名已提交，等待确认' }}</text>
				<text class="result-desc">
					{{ activityDetail?.joinStatus === 2 ? '期待您的准时参与！' : '您的申请已提交给组织者，审核结果将通过消息通知。' }}
				</text>
			</view>

			<!-- 核销码门票卡片 -->
			<view v-if="activityDetail?.joinStatus === 2 && verifyQrCodeBase64" class="verify-ticket-container">
				<view class="ticket-top">
					<text class="ticket-title">参会凭证</text>
					<view class="ticket-dashed-line"></view>
				</view>

				<view class="ticket-body" @click="previewVerifyQrCode">
					<view class="qr-wrapper">
						<!-- 1. 加载中状态 -->
						<view v-if="isQrLoading" class="qr-status-box">
							<uni-load-more status="loading" :iconSize="20" color="#FF62B1"
								:contentText="{contentrefresh: '正在生成核销码...'}"></uni-load-more>
						</view>

						<!-- 2. 加载失败状态 -->
						<view v-else-if="qrLoadError" class="qr-status-box" @click.stop="getVerifyQrCode">
							<uni-icons type="refresh-filled" size="30" color="#999"></uni-icons>
							<text class="error-txt">生成失败，点击重试</text>
						</view>

						<!-- 3. 正常显示 -->
						<block v-else-if="verifyQrCodeBase64">
							<image :src="verifyQrCodeBase64" class="main-qr-img" mode="aspectFit" />
							<view class="qr-mask">
								<uni-icons type="search" size="24" color="#fff"></uni-icons>
								<text>点击放大出示</text>
							</view>
						</block>
					</view>
					<text class="qr-sub-hint">签到时请向组织者出示此码</text>
				</view>

				<view class="ticket-footer">
					<text>NO. {{ activityId }}-{{ loggedInUserId }}</text>
				</view>

				<!-- 装饰用的圆孔（门票剪裁感） -->
				<view class="hole hole-left"></view>
				<view class="hole hole-right"></view>
			</view>

			<view class="section-card">
				<view class="info-content">
					<view class="info-row"><text class="label">聚会名称：</text><text
							class="val">{{ activityDetail?.activityTitle }}</text></view>
					<view class="info-row"><text class="label">提交时间：</text><text class="val">{{ currentDate }}</text>
					</view>
				</view>
			</view>

			<button class="action-btn outline" @click="backToHome">返回</button>
		</view>

		<!-- 【新增】邀请码输入弹窗 -->
		<uni-popup ref="invitePopup" :mask-click="false">
			<view class="invite-modal">
				<text class="modal-title">🔒 需输入邀请码</text>
				<text class="modal-desc">此聚会为专邀聚会，请输入邀请码后继续报名</text>
				<view class="modal-input-wrap">
					<input class="modal-input" v-model="inputInviteCode" placeholder="请输入邀请码" />
				</view>
				<view class="modal-btns">
					<button class="m-btn cancel" @click="cancelInvite">返回</button>
					<button class="m-btn confirm" @click="verifyInviteCode">确定</button>
				</view>
			</view>
		</uni-popup>

		<SmartGuidePopup ref="smartGuidePopupRef" :scenario="3" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		reactive,
		watch
	} from 'vue';
	import {
		onLoad,
		onReady
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';
	import {
		isScenario3User
	} from '@/utils/user.js';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';

	// =========================================================
	// 1. 工具函数 (必须放在最顶部，供变量初始化使用)
	// =========================================================

	/**
	 * 全平台通用：获取当前格式化时间 (YYYY-MM-DD HH:mm:ss)
	 */
	const getFormattedNow = () => {
		const now = new Date();
		const pad = (n) => n.toString().padStart(2, '0');
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	};

	/**
	 * 全平台通用：格式化时间段展示
	 */
	const formatRangeTime = (start, end) => {
		const format = (timestamp) => {
			if (!timestamp) return '';
			const date = new Date(timestamp);
			const pad = (n) => n.toString().padStart(2, '0');
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}
		return start && end ? `${format(start)} - ${format(end)}` : '时间待定';
	};

	/**
	 * 生成前端模拟报名号
	 */
	const generateTicketNumber = () => {
		const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
		const randomLetter = letters[Math.floor(Math.random() * letters.length)];
		const randomNumbers = Math.floor(100000 + Math.random() * 900000);
		return `TK${randomLetter}${randomNumbers}`;
	};

	// =========================================================
	// 2. 响应式变量声明
	// =========================================================

	// 状态管理
	const currentStep = ref(1); // 当前步骤：1信息、2支付、3结果
	const isLoading = ref(false);
	const isUserVerified = ref(true);
	const agreedToTerms = ref(false);
	const currentDate = ref(getFormattedNow()); // 提交时间
	const ticketNumber = ref(generateTicketNumber());

	// 数据存储
	const activityId = ref(null);
	const activityDetail = ref(null);
	const loggedInUserId = ref(null);
	const verifyQrCodeBase64 = ref(''); // 核销码图片
	const inputInviteCode = ref(''); // 用户输入的邀请码
	const verifiedInviteCode = ref(''); // 校验通过或URL自带的邀请码
	const receivedExCode = ref(''); // 存储从 URL 接收到的专属码
	const receivedInviteCode = ref('');
	const receivedExclusiveInviteCode = ref('');

	// 表单对象
	const formData = reactive({
		userName: '',
		userPhone: '',
		contactAddress: '',
		remark: '',
		paymentScreenshotUrl: ''
	});

	// UI 引用
	const smartGuidePopupRef = ref(null);
	const invitePopup = ref(null);

	const FORM_CACHE_KEY = 'active_enroll_form_cache';

	const isQrLoading = ref(false); // 是否正在加载二维码
	const qrLoadError = ref(false); // 是否加载失败

	// =========================================================
	// 3. 计算属性
	// =========================================================
	/**
	 * 判断是否免支付 (核心逻辑)
	 */
	const isActuallyFree = computed(() => {
		// 1. 聚会本身费用为 0
		const isFeeZero = activityDetail.value?.registrationFee === 0;
		// 2. 或者：拥有专属免单码
		const hasExCode = !!receivedExclusiveInviteCode.value;

		return isFeeZero || hasExCode;
	});

	/**
	 * 判断当前用户是否为组织者本人 (用于免邀、管理权限)
	 */
	const isOrganizer = computed(() => {
		if (!loggedInUserId.value || !activityDetail.value?.memberUser) return false;
		return Number(loggedInUserId.value) === Number(activityDetail.value.memberUser.id);
	});

	/**
	 * 报名按钮文案
	 */
	const step1ButtonText = computed(() => {
		return isActuallyFree.value ? '立即免费报名' : '下一步：支付报名费';
	});

	/**
	 * 是否处于名额满额排队状态
	 */
	const isQueuing = computed(() => {
		if (!activityDetail.value) return false;
		return (activityDetail.value.joinCount || 0) >= activityDetail.value.totalSlots;
	});

	/**
	 * 步骤1校验
	 */
	const canSubmitStep1 = computed(() => {
		const baseValid = formData.userName.trim() && /^1[3-9]\d{9}$/.test(formData.userPhone);
		return isQueuing.value ? (baseValid && formData.remark.trim()) : baseValid;
	});

	/**
	 * 报名时间格式化
	 */
	const formattedRegistrationTime = computed(() => {
		if (!activityDetail.value) return '待定';
		return formatRangeTime(activityDetail.value.registrationStartDatetime, activityDetail.value
			.registrationEndDatetime);
	});

	// =========================================================
	// 4. 业务功能函数
	// =========================================================

	/**
	 * 获取聚会详情及报名状态
	 */
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
				activityDetail.value = data;

				const isVerified = verifiedInviteCode.value || receivedExclusiveInviteCode.value;

				if (data.requireInviteCode === 1 &&
					data.joinStatus === 0 &&
					!isVerified && // <-- 这里是关键：如果已经有任何一种码了，就不弹窗
					!isOrganizer.value) {

					invitePopup.value.open();
				}

				// 根据 joinStatus 决定显示哪个步骤 (0: 未报, 1: 待确, 2: 已报)
				if (data.joinStatus === 1 || data.joinStatus === 2) {
					if (data.memberActivityJoinResp) {
						formData.userName = data.memberActivityJoinResp.userName || '';
						formData.userPhone = data.memberActivityJoinResp.userPhone || '';
						formData.paymentScreenshotUrl = data.memberActivityJoinResp.paymentScreenshotUrl || '';
					}
					currentStep.value = 3;
				} else {
					currentStep.value = 1;
				}
			}
		} catch (e) {
			uni.hideLoading();
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		}
	};

	/**
	 * 校验邀请码
	 */
	const verifyInviteCode = () => {
		if (!inputInviteCode.value) return uni.showToast({
			title: '请输入邀请码',
			icon: 'none'
		});
		if (inputInviteCode.value === activityDetail.value.inviteCode) {
			verifiedInviteCode.value = inputInviteCode.value;
			invitePopup.value.close();
			uni.showToast({
				title: '验证通过',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: '邀请码错误',
				icon: 'none'
			});
		}
	};

	/**
	 * 生成参会核销码 (小程序码)
	 */
	const getVerifyQrCode = async () => {
		if (!activityId.value) return;

		const userId = uni.getStorageSync('userId');
		isQrLoading.value = true;
		qrLoadError.value = false;

		try {
			const {
				data,
				error
			} = await request('/app-api/member/social-user/wxa-qrcode', {
				method: 'POST',
				data: {
					scene: `a=${activityId.value}&u=${userId}`,
					path: "packages/active-verify/active-verify",
					width: 430,
					checkPath: false,
					hyaline: true
				}
			});

			if (!error && data) {
				verifyQrCodeBase64.value = `data:image/png;base64,${data}`;
			} else {
				qrLoadError.value = true;
			}
		} catch (e) {
			qrLoadError.value = true;
		} finally {
			isQrLoading.value = false;
		}
	};

	/**
	 * 提交报名信息
	 */
	const joinActivity = async () => {
		if (!isActuallyFree.value) {
			// 只有在真正需要付费时，才检查截图和协议
			if (!formData.paymentScreenshotUrl) {
				uni.showToast({
					title: '请上传付款截图',
					icon: 'none'
				});
				return;
			}
			if (!agreedToTerms.value) {
				uni.showToast({
					title: '请先同意用户协议',
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

		const params = {
			activityId: activityId.value,
			userId: userId,
			registeredAt: new Date().toISOString(),
			paymentScreenshotUrl: formData.paymentScreenshotUrl,
			userName: formData.userName,
			userPhone: formData.userPhone,
			contactAddress: formData.contactAddress,
			remark: formData.remark,
			// 普通邀请码：如果是组织者本人就传他自己的码，否则传收到的码
			inviteCode: isOrganizer.value ? (activityDetail.value.inviteCode || '') : receivedInviteCode.value,

			// 专属邀请码：传收到的码（如果有的话）
			exclusiveInviteCode: receivedExclusiveInviteCode.value
		};

		const result = await request('/app-api/member/activity-join/join-activity', {
			method: 'POST',
			data: params
		});

		uni.hideLoading();

		if (result && !result.error) {
			uni.showToast({
				title: '报名成功！',
				icon: 'success'
			});
			const dynamicKey = FORM_CACHE_KEY + '_' + activityId.value;
			uni.removeStorageSync(dynamicKey);

			uni.$emit('refreshActivityList');
			currentDate.value = getFormattedNow();
			await getActiveDetail();
		} else {
			uni.showToast({
				title: result.error?.msg || '报名失败',
				icon: 'none'
			});
		}
	};

	/**
	 * 自动预填用户信息
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
				if (!formData.userName) formData.userName = data.realName || data.nickname || '';
				if (!formData.userPhone) formData.userPhone = data.mobile || '';
				if (!formData.contactAddress) formData.contactAddress = data.companyName || '';
				console.log('✅ 个人资料自动补全完成');
			}
		} catch (e) {}
	};

	// --- 交互辅助 ---
	const chooseImage = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			success: async (res) => {
				uni.showLoading({
					title: '上传中...'
				});
				const result = await uploadFile(res.tempFiles[0], {
					directory: 'payment-proof'
				});
				uni.hideLoading();
				if (result.data) formData.paymentScreenshotUrl = result.data;
			}
		});
	};

	const previewQrCode = () => {
		if (activityDetail.value?.organizerPaymentQrCodeUrl) {
			uni.previewImage({
				urls: [activityDetail.value.organizerPaymentQrCodeUrl]
			});
		}
	};

	const previewVerifyQrCode = () => {
		if (verifyQrCodeBase64.value) {
			uni.previewImage({
				urls: [verifyQrCodeBase64.value]
			});
		}
	};

	const toggleAgreement = () => agreedToTerms.value = !agreedToTerms.value;
	const navigateToAgreement = () => uni.navigateTo({
		url: '/pages/user-agreement/user-agreement'
	});
	const cancelInvite = () => uni.navigateBack();
	const confirmSignup = () => {
		if (!canSubmitStep1.value) return;

		// 【核心修改】使用 isActuallyFree 判定
		if (isActuallyFree.value) {
			// 如果免单（包括专属码情况），直接提交，不跳到第二步
			joinActivity();
		} else {
			// 否则进入第二步：支付和上传凭证
			currentStep.value = 2;
		}
	};
	const backToHome = () => uni.navigateBack();

	// =========================================================
	// 5. 生命周期钩子
	// =========================================================

	onLoad((options) => {
		console.log('📥 [报名页-接收] 参数:', options);
		// 接收普通邀请码
		if (options.inviteCode) {
			receivedInviteCode.value = options.inviteCode;
			// 兼容之前的逻辑：将其赋值给已验证变量，防止弹窗
			verifiedInviteCode.value = options.inviteCode;
		}
		// 接收专属免费码
		if (options.exclusiveInviteCode) {
			receivedExclusiveInviteCode.value = options.exclusiveInviteCode;
			console.log('✅ [报名页] 收到专属免单码，准予免码通行');
		}

		// 2. 基本参数初始化
		activityId.value = options.id;
		loggedInUserId.value = uni.getStorageSync('userId');

		if (!activityId.value) {
			uni.showToast({
				title: '缺少ID',
				icon: 'none'
			});
			return setTimeout(() => uni.navigateBack(), 1500);
		}

		// 3. 加载详情
		getActiveDetail();

		// 4. 逻辑解耦，确保预填始终有机会执行
		// 第一步：先尝试恢复草稿（用户之前填了一半的内容）
		const dynamicKey = FORM_CACHE_KEY + '_' + activityId.value;
		const cachedData = uni.getStorageSync(dynamicKey);
		if (cachedData) {
			try {
				const parsed = JSON.parse(cachedData);
				Object.assign(formData, parsed);
				console.log('📝 已恢复本聚会的专属草稿');
			} catch (e) {
				console.error('解析草稿失败');
			}
		}

		// 第二步：无论有没有草稿，都调用预填接口
		// 该接口内部会判断：如果字段为空才填，如果不为空（说明草稿里有）则不覆盖
		fetchAndPrefillUserInfo();
	});

	onReady(() => {
		if (isScenario3User()) smartGuidePopupRef.value?.open();
	});

	// =========================================================
	// 6. 监听器
	// =========================================================

	// 监听表单并存入缓存
	watch(formData, (newVal) => {
		if (activityId.value) {
			const dynamicKey = FORM_CACHE_KEY + '_' + activityId.value;
			uni.setStorageSync(dynamicKey, JSON.stringify(newVal));
		}
	}, {
		deep: true
	});

	// 报名成功后(状态变为2)，自动获取核销码
	watch(() => activityDetail.value?.joinStatus, (newVal) => {
		if (newVal === 2) getVerifyQrCode();
	});
</script>


<style lang="scss" scoped>
	$theme-color: #FF62B1;

	.page {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-bottom: 60rpx;
	}

	/* 顶部 Banner */
	.header-banner {
		background: linear-gradient(135deg, $theme-color 0%, darken($theme-color, 10%) 100%);
		height: 180rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.header-title {
			color: #fff;
			font-size: 34rpx;
			font-weight: bold;
			padding: 0 40rpx;
			text-align: center;
		}
	}

	/* 步骤指示器 */
	.step-indicator {
		display: flex;
		justify-content: center;
		margin: -40rpx 30rpx 30rpx;
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.step {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;

			&.active {
				.step-circle {
					background: $theme-color;
				}

				.step-text {
					color: $theme-color;
					font-weight: bold;
				}
			}

			&:not(:last-child)::after {
				content: '';
				position: absolute;
				top: 30rpx;
				right: -50%;
				width: 100%;
				height: 2rpx;
				background: #eee;
				z-index: 1;
			}
		}

		.step-circle {
			width: 50rpx;
			height: 50rpx;
			border-radius: 50%;
			background: #ddd;
			color: #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24rpx;
			z-index: 2;
			margin-bottom: 10rpx;
		}

		.step-text {
			font-size: 24rpx;
			color: #999;
		}
	}

	/* ==================== [补全] 结果页状态样式 ==================== */
	.result-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;

		.status-box {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-bottom: 20rpx;

			.result-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-top: 30rpx;
			}

			.result-desc {
				font-size: 26rpx;
				color: #999;
				text-align: center;
				padding: 0 60rpx;
				margin-top: 16rpx;
				line-height: 1.6;
			}
		}
	}

	/* --- 核销码门票卡片样式 --- */
	.verify-ticket-container {
		background: #fff;
		margin: 40rpx 30rpx;
		border-radius: 24rpx;
		position: relative;
		box-shadow: 0 10rpx 40rpx rgba(255, 98, 177, 0.15);
		overflow: hidden;
		border: 1rpx solid rgba(255, 98, 177, 0.1);

		.ticket-top {
			padding: 30rpx;
			text-align: center;

			.ticket-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #FF62B1;
				letter-spacing: 4rpx;
			}
		}

		.ticket-dashed-line {
			margin-top: 20rpx;
			border-top: 2rpx dashed #eee;
			position: relative;
		}

		.ticket-body {
			padding: 40rpx 0;
			display: flex;
			flex-direction: column;
			align-items: center;

			.qr-wrapper {
				position: relative;
				width: 340rpx;
				height: 340rpx;
				padding: 10rpx;
				background: #fff;
				border: 2rpx solid #f9f9f9;
				border-radius: 16rpx;

				.main-qr-img {
					width: 100%;
					height: 100%;
				}

				.qr-mask {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					background: rgba(0, 0, 0, 0.3);
					height: 60rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8rpx;
					color: #fff;
					font-size: 20rpx;
					border-bottom-left-radius: 16rpx;
					border-bottom-right-radius: 16rpx;
				}
			}

			.qr-sub-hint {
				margin-top: 30rpx;
				font-size: 24rpx;
				color: #999;
			}
		}

		.ticket-footer {
			background: #fafafa;
			padding: 20rpx;
			text-align: center;
			font-size: 20rpx;
			color: #ccc;
			font-family: monospace;
		}

		.hole {
			width: 30rpx;
			height: 30rpx;
			background: #f8f8f8;
			border-radius: 50%;
			position: absolute;
			top: 85rpx;
			z-index: 2;
			border: 1rpx solid rgba(255, 98, 177, 0.05);
		}

		.hole-left {
			left: -15rpx;
			box-shadow: inset -4rpx 0 6rpx rgba(0, 0, 0, 0.02);
		}

		.hole-right {
			right: -15rpx;
			box-shadow: inset 4rpx 0 6rpx rgba(0, 0, 0, 0.02);
		}
	}

	/* 核销码状态容器（加载中和失败） */
	.qr-status-box {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #fcfcfc;

		.error-txt {
			font-size: 24rpx;
			color: #999;
			margin-top: 10rpx;
		}

		:deep(.uni-load-more__text) {
			font-size: 22rpx !important;
			color: #FF62B1 !important;
		}
	}

	/* 通用卡片 */
	.section-card {
		background: #fff;
		margin: 24rpx;
		padding: 30rpx;
		border-radius: 20rpx;

		.section-header {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;

			.header-mark {
				width: 8rpx;
				height: 32rpx;
				background: $theme-color;
				border-radius: 4rpx;
				margin-right: 16rpx;
			}

			.section-title {
				font-size: 30rpx;
				font-weight: bold;
				color: $theme-color;
			}

			.price-tag {
				margin-left: auto;
				color: #ff1a3c;
				font-size: 36rpx;
				font-weight: bold;
			}
		}
	}

	/* 信息展示与表单 */
	.info-content {
		background: #fff9fb;
		padding: 20rpx;
		border-radius: 12rpx;

		.info-row {
			display: flex;
			margin-bottom: 12rpx;
			font-size: 26rpx;

			.label {
				color: $theme-color;
				width: 140rpx;
			}

			.val {
				color: #555;
				flex: 1;
			}
		}
	}

	.input-item {
		margin-bottom: 30rpx;

		.form-label {
			display: block;
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 16rpx;
		}
	}

	/* 支付与上传 */
	.payment-box {
		text-align: center;
		padding: 40rpx;
		background: #fafafa;
		border-radius: 20rpx;

		.qr-image {
			width: 320rpx;
			height: 320rpx;
			border: 1rpx solid #eee;
		}

		.qr-tip {
			display: block;
			margin-top: 20rpx;
			font-size: 24rpx;
			color: $theme-color;
			font-weight: bold;
		}
	}

	.upload-area {
		width: 100%;
		height: 360rpx;
		background: #fdfdfd;
		border: 2rpx dashed #ddd;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		.preview-img {
			width: 100%;
			height: 100%;
		}

		.upload-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #999;
			font-size: 26rpx;
			gap: 10rpx;
		}
	}

	.prompt-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 20rpx;
		display: block;
	}

	/* ==================== [补全] 协议与风险提示样式 ==================== */
	.agreement-box {
		margin-top: 40rpx;

		.checkbox-row {
			display: flex;
			align-items: center;
			margin-bottom: 30rpx;

			.agree-txt {
				font-size: 26rpx;
				color: #666;
				margin-left: 12rpx;

				.link {
					color: $theme-color;
					font-weight: bold;
					text-decoration: underline;
				}
			}
		}

		.risk-card {
			background-color: #fcfcfc;
			padding: 24rpx;
			border-radius: 16rpx;
			border: 1rpx solid #f0f0f0;

			.risk-title {
				font-size: 24rpx;
				font-weight: bold;
				color: #444;
				display: block;
				margin-bottom: 12rpx;
				text-align: center;
			}

			.risk-desc {
				font-size: 22rpx;
				color: #999;
				line-height: 1.6;
				text-align: justify;
			}
		}
	}

	/* 按钮 */
	.action-btn {
		width: 100%;
		height: 90rpx;
		background: linear-gradient(to right, $theme-color, darken($theme-color, 5%));
		color: #fff;
		border-radius: 45rpx;
		font-weight: bold;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 40rpx;

		&.btn-disabled {
			background: #e0e0e0 !important;
			color: #fff;
		}

		&.outline {
			background: #fff;
			color: $theme-color;
			border: 2rpx solid $theme-color;
		}
	}

	/* 邀请码弹窗保持原样... */
	.invite-modal {
		width: 600rpx;
		background: #fff;
		border-radius: 30rpx;
		padding: 50rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.modal-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}

		.modal-desc {
			font-size: 26rpx;
			color: #999;
			text-align: center;
			margin-bottom: 40rpx;
		}

		.modal-input-wrap {
			width: 100%;
			background: #f5f5f5;
			border-radius: 12rpx;
			padding: 20rpx;
			margin-bottom: 40rpx;

			.modal-input {
				font-size: 32rpx;
				text-align: center;
				font-weight: bold;
				color: $theme-color;
			}
		}

		.modal-btns {
			display: flex;
			width: 100%;
			gap: 20rpx;

			.m-btn {
				flex: 1;
				height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.cancel {
				background: #f5f5f5;
				color: #666;
			}

			.confirm {
				background: $theme-color;
				color: #fff;
			}
		}
	}
</style>