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
				<icon v-if="activityDetail?.joinStatus === 2" type="success" size="60" color="#4caf50" />
				<icon v-else type="waiting" size="60" color="#FF62B1" />
				<text class="result-title">{{ activityDetail?.joinStatus === 2 ? '报名成功' : '报名已提交，等待确认' }}</text>
				<text class="result-desc">
					{{ activityDetail?.joinStatus === 2 ? '期待您的准时参与！' : '您的申请已提交给组织者，审核结果将通过消息通知。' }}
				</text>
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

	const loggedInUserId = ref(null);
	const activityId = ref(null);
	const activityDetail = ref(null);

	const agreedToTerms = ref(false);

	const ticketNumber = ref('');

	const invitePopup = ref(null);
	const inputInviteCode = ref('');
	const verifiedInviteCode = ref(''); // 已验证通过的码

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
		console.log('📥 [报名页-接收] 收到参数:', options);

		if (options.meetingInviteCode) {
			// 核心：将收到的码赋值给验证变量
			verifiedInviteCode.value = options.meetingInviteCode;
			console.log('✅ [报名页] 邀请码已透传并自动验证成功:', verifiedInviteCode.value);
		}

		const storageUserId = uni.getStorageSync('userId');
		loggedInUserId.value = storageUserId;

		console.log('当前登录用户ID:', loggedInUserId.value);

		if (options.id) {
			activityId.value = options.id;
			// 现在 getActiveDetail 会处理所有逻辑
			// if (options.meetingInviteCode) {
			// 	verifiedInviteCode.value = options.meetingInviteCode;
			// }
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

	/**
	 * 计算属性：判断当前用户是否为组织者本人
	 */
	const isOrganizer = computed(() => {
		// 增加严谨的空值判断
		if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser) {
			return false;
		}
		// 统一转为 Number 进行比较，防止字符串和数字类型不匹配
		return Number(loggedInUserId.value) === Number(activityDetail.value.memberUser.id);
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

	const cancelInvite = () => {
		uni.navigateBack();
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

	/**
	 * 验证邀请码
	 */
	const verifyInviteCode = () => {
		if (!inputInviteCode.value) return uni.showToast({
			title: '请输入邀请码',
			icon: 'none'
		});

		// 简单的本地校验（如果后端没给专门接口，直接比对详情里的 inviteCode）
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

				// 【调试输出】
				console.log('🕵️ [报名页] 身份判定 - 是否本人:', isOrganizer.value);
				console.log('🕵️ [报名页] 状态判定 - 已验证码:', verifiedInviteCode.value);


				// 【核心优化逻辑】
				// 满足以下全部条件才弹出邀请码框：
				// 1. 后端配置需要邀请码 (requireInviteCode === 1)
				// 2. 当前用户还没报名 (joinStatus === 0)
				// 3. URL里没带自动验证码 (!verifiedInviteCode.value)
				// 4. 【新增】当前用户不是组织者本人 (!isOrganizer.value)

				if (activityDetail.value.requireInviteCode === 1 &&
					activityDetail.value.joinStatus === 0 &&
					!verifiedInviteCode.value &&
					!isOrganizer.value) { // <-- 关键拦截：如果是本人，直接跳过弹窗

					invitePopup.value.open();
				}

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
			remark: formData.remark,
			inviteCode: isOrganizer.value ? (activityDetail.value.inviteCode || '') : verifiedInviteCode.value
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

	/* 邀请码弹窗 */
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