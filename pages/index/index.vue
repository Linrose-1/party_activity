<template>
	<view class="login-container">
		<view class="header">
			<image class="logo" src="https://img.gofor.club/logo.png" mode="aspectFit"></image>
			<text class="welcome-text">欢迎来到猩聚社</text>
			<text class="slogan-text">链接商机，共创未来</text>
		</view>

		<view class="form-wrapper">
			<!-- 1. 头像和昵称：老用户隐藏 -->
			<view class="profile-section" v-if="!isOldUser">
				<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image class="avatar" :src="avatarUrl || '/static/images/default-avatar.png'"></image>
				</button>
				<text class="avatar-hint">点击上传头像(首次登录必填)</text>

				<view class="form-item nickName-item">
					<uni-icons type="person-filled" size="22" :color="PRIMARY_COLOR"></uni-icons>
					<text class="label">用户名</text>
					<input class="input" type="nickName" placeholder="请输入昵称(首次登录必填)" v-model="nickName" />
				</view>
			</view>

			<!-- 2. 手机号：新老用户都需要，因为需要重新获取加密 code 登录 -->
			<view class="form-item">
				<uni-icons type="phone-filled" size="22" :color="PRIMARY_COLOR"></uni-icons>
				<text class="label">手机号</text>
				<button v-if="!phoneCode" class="get-phone-btn" open-type="getPhoneNumber"
					@getphonenumber="getPhoneNumber">
					手机号快捷登录
				</button>
				<text v-else class="input-display" style="color: #4CAF50;">已完成手机授权</text>
			</view>

			<!-- 3. 邀请码：老用户且已有上级时隐藏 -->
			<view class="form-item" v-if="!isOldUser && !hasParent">
				<uni-icons type="paperplane-filled" size="22" :color="PRIMARY_COLOR"></uni-icons>
				<text class="label">邀请码</text>
				<input v-model="inviteCode" class="input" type="text" placeholder="请输入邀请码(首次登录必填)" />
			</view>
		</view>

		<view class="actions-wrapper">
			<view class="agreement-section">
				<view @click="toggleAgreement" class="checkbox-wrapper">
					<checkbox :checked="agreed" color="#FF7600" style="transform:scale(0.7)" />
				</view>
				<view class="agreement-text">
					我已阅读并同意<text class="link" @click="skipToAgreement(0)">《用户协议》</text>和<text class="link"
						@click="skipToAgreement(1)">《隐私政策》</text>
				</view>
			</view>

			<button class="login-btn" :disabled="isLoginDisabled" @tap="handleLogin">
				立即登录
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';
	import {
		getInviteCode
	} from '../../utils/user.js';

	// --- 1. 状态管理 ---
	const isOldUser = ref(false); // 是否为已绑定手机号的老用户
	const loginCode = ref(''); // uni.login 获取的登录凭证
	const phoneCode = ref(''); // 微信手机号授权凭证
	const nickName = ref(null); // 用户昵称，可由用户输入或授权填充
	const avatarUrl = ref(null); // 用户头像URL，通过授权获取
	const inviteCode = ref(''); // 邀请码
	const agreed = ref(false); // 是否同意协议
	const hasParent = ref(false); // 标记是否已绑定上级
	const upstreamInviteCode = ref(''); // 用于存储从上游分享链接中捕获到的邀请码

	// --- 2. 计算属性 ---
	const isLoginDisabled = computed(() => {
		// 基础条件：必须同意协议
		if (!agreed.value) return true;

		if (isOldUser.value) {
			// 老用户：只需要授权手机号（phoneCode）即可登录
			return !phoneCode.value;
		} else {
			// 新用户：头像、昵称、手机号 缺一不可
			return !avatarUrl.value || !phoneCode.value || !nickName.value || !nickName.value.trim();
		}
	});

	// --- 3. 生命周期钩子 ---
	// onLoad(() => {
	// 	// 页面加载时，预先获取登录凭证 code
	// 	getLoginCode();

	// 	// 检查并自动填充通过分享链接带来的邀请码
	// 	const pendingInviteCode = uni.getStorageSync('pendingInviteCode');
	// 	if (pendingInviteCode) {
	// 		console.log('✅ [登录页] 读取到暂存的邀请码:', pendingInviteCode);
	// 		inviteCode.value = pendingInviteCode;
	// 		uni.removeStorageSync('pendingInviteCode');
	// 	}
	// });
	onLoad(async (options) => {
		getLoginCode();

		console.log('🔄 [登录页] 页面加载，正在预加载最新 Token...');
		performSilentLoginForBind().then(success => {
			if (success) {
				console.log('✅ [登录页] Token 预加载成功');
			} else {
				console.warn('⚠️ [登录页] Token 预加载失败，将在点击登录时重试');
			}
		});

		// 检查并处理传入的邀请码
		// 优先级：URL参数 > 本地缓存的pendingInviteCode
		const codeFromUrl = options?.inviteCode;
		const codeFromStorage = uni.getStorageSync('pendingInviteCode');

		let finalInviteCode = '';

		if (codeFromUrl) {
			console.log('✅ [登录页] 从 URL 参数中捕获到邀请码:', codeFromUrl);
			finalInviteCode = codeFromUrl;
			// 如果 URL 有，就不用 storage 里的了，并把它清除
			if (codeFromStorage) {
				uni.removeStorageSync('pendingInviteCode');
			}
		} else if (codeFromStorage) {
			console.log('✅ [登录页] 从本地缓存读取到暂存的邀请码:', codeFromStorage);
			finalInviteCode = codeFromStorage;
			uni.removeStorageSync('pendingInviteCode');
		}

		if (finalInviteCode) {
			// 1. 填充输入框，供用户注册使用
			inviteCode.value = finalInviteCode;
			// 2. 存入页面级变量，供本页再次分享时使用
			upstreamInviteCode.value = finalInviteCode;
		}

		//检查是否已绑定上级 (静默登录可能已绑定)
		const token = uni.getStorageSync('token');
		if (token) {
			try {
				// 调用获取用户信息接口
				const {
					data
				} = await request('/app-api/member/user/get', {
					method: 'GET'
				});
				if (data && data.parentId) {
					hasParent.value = true;
					console.log('✅ 用户已绑定上级 (ID:', data.parentId, ')，隐藏邀请码输入框');
				}
			} catch (e) {
				console.error('预检用户信息失败', e);
			}
		}
	});

	// --- 4. 授权相关方法 ---

	/**
	 * @description 处理微信头像选择事件
	 * @param {object} e - 事件对象，包含头像的临时路径
	 */
	const onChooseAvatar = (e) => {
		const tempAvatarPath = e.detail.avatarUrl;
		if (tempAvatarPath) {
			console.log('✅ 用户选择了头像，临时路径:', tempAvatarPath);
			// 选择头像后，立即上传
			uploadAvatar(tempAvatarPath);
		} else {
			console.error('❌ 获取头像临时路径失败');
		}
	};

	/**
	 * @description 【新增】上传头像到服务器
	 * @param {string} filePath - 头像的本地临时路径
	 */
	const uploadAvatar = async (filePath) => {
		uni.showLoading({
			title: '头像上传中...',
			mask: true
		});
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'avatar'
		});
		uni.hideLoading();

		if (result.data) {
			avatarUrl.value = result.data; // 将上传成功后的【服务器URL】赋值
			uni.showToast({
				title: '头像设置成功',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: result.error || '上传失败',
				icon: 'none'
			});
		}
	};

	/**
	 * @description 调用 uni.login 获取登录凭证
	 */
	const getLoginCode = async () => {
		try {
			const res = await uni.login({
				provider: 'weixin'
			});
			loginCode.value = res.code;
			console.log('✅ 获取 loginCode 成功:', loginCode.value);
		} catch (error) {
			console.error('❌ 获取 loginCode 失败', error);
			uni.showToast({
				title: '登录准备失败，请重试',
				icon: 'none'
			});
		}
	};

	/**
	 * @description 获取用户微信绑定的手机号
	 */
	const getPhoneNumber = (e) => {
		if (e.detail.code) {
			console.log("getPhoneNumber获取到的值：", e.detail)
			phoneCode.value = e.detail.code;
			uni.showToast({
				title: '手机号授权成功',
				icon: 'none'
			});
		} else {
			uni.showToast({
				title: '您拒绝了授权',
				icon: 'error'
			});
		}
	};


	/**
	 * @description 切换协议勾选状态
	 */
	const toggleAgreement = () => {
		agreed.value = !agreed.value;
	};

	// --- 5. 核心登录逻辑 ---
	/**
	 * 登录前置预检：静默登录 + 获取用户信息
	 * 判断用户是否为已注册手机号的老用户
	 */
	const performSilentLoginForBind = async () => {
		try {
			const loginRes = await uni.login({
				provider: 'weixin'
			});
			if (!loginRes.code) return false;

			// 1. 执行静默登录拿 Token
			const silentResult = await request('/app-api/member/auth/weixin-mini-app-login', {
				method: 'POST',
				data: {
					loginCode: loginRes.code,
					state: 'default',
					shardCode: inviteCode.value
				}
			});

			if (silentResult.data && silentResult.data.accessToken) {
				uni.setStorageSync('token', silentResult.data.accessToken);
				uni.setStorageSync('userId', silentResult.data.userId);

				// 2. 【核心优化】：获取用户信息，检查是否绑定了手机号
				const {
					data: userInfo
				} = await request('/app-api/member/user/get', {
					method: 'GET'
				});

				if (userInfo) {
					// 如果有手机号，判定为老用户
					if (userInfo.mobile) {
						isOldUser.value = true;
						nickName.value = userInfo.nickname;
						avatarUrl.value = userInfo.avatar;
						console.log('✨ [检测] 该用户为老用户，已跳过资料填写');
					}

					// 检查是否有上级
					if (userInfo.parentId) {
						hasParent.value = true;
					}
					return true;
				}
			}
		} catch (e) {
			console.error('前置预检异常:', e);
		}
		return false;
	};
	/**
	 * @description 处理一键登录
	 */
	const handleLogin = async () => {
		if (isLoginDisabled.value) return;

		uni.showLoading({
			title: '正在登录...'
		});

		try {
			const payload = {
				phoneCode: phoneCode.value,
				telephone: "",
				nickName: nickName.value,
				avatar: avatarUrl.value,
				shardCode: inviteCode.value,
			};

			// 无论是新老用户，统一调用 bind/info 接口（后端会处理：老用户更新信息，新用户创建绑定）
			const loginResult = await request('/app-api/member/auth/bind/info', {
				method: 'POST',
				data: payload
			});

			if (loginResult.error) {
				if (loginResult.error.code === 453) {
					uni.showToast({
						title: loginResult.error.msg,
						icon: 'none',
						duration: 3000
					});
				} else {
					throw new Error(loginResult.error.msg || '登录失败');
				}
				return;
			}

			// 成功后的清理与重定向
			uni.clearStorage();
			await performSilentLogin(); // 重新获取正式 Token

			uni.hideLoading();
			uni.showToast({
				title: isOldUser.value ? '欢迎回来' : '登录成功',
				icon: 'success'
			});

			setTimeout(() => {
				uni.switchTab({
					url: '/pages/home/home'
				});
			}, 1500);

		} catch (error) {
			uni.hideLoading();
			uni.showToast({
				title: error.message || '系统异常',
				icon: 'none'
			});
		}
	};

	/**
	 * @description 登录成功后，获取并缓存完整的用户信息
	 */
	const fetchAndCacheUserInfo = async () => {
		uni.showLoading({
			title: '正在同步信息...'
		});
		const {
			data: fullUserInfo,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (error) {
			// 这是一个非关键步骤，即使失败也只给提示，不中断流程
			console.error('❌ [登录后] 获取用户信息失败:', error);
			uni.showToast({
				title: '用户信息同步失败',
				icon: 'none'
			});
			return;
		}
		console.log('✅ [登录后] 成功获取并缓存用户信息:', JSON.parse(JSON.stringify(fullUserInfo)));
		uni.setStorageSync('userInfo', JSON.stringify(fullUserInfo));
	};

	/**
	 * @description 登录成功后，处理待发放的分享奖励
	 * @param {string|number} currentUserId - 当前登录用户的ID
	 */
	const handlePendingShareReward = async (currentUserId) => {
		const pendingReward = uni.getStorageSync('pendingShareReward');
		if (pendingReward && pendingReward.sharerId && pendingReward.bizId && pendingReward.type && pendingReward
			.sharerId !== currentUserId) {
			console.log(`✅ [登录后] 检测到待处理分享奖励`, pendingReward);
			const {
				error
			} = await request('/app-api/member/experience-record/share-experience-hit', {
				method: 'POST',
				data: {
					type: pendingReward.type,
					shareUserId: pendingReward.sharerId,
					bizId: pendingReward.bizId
				}
			});
			if (error) {
				console.error('❌ [登录后] 调用分享加分接口失败:', error);
			} else {
				console.log(`✅ [登录后] 成功为分享者(ID: ${pendingReward.sharerId})触发奖励`);
			}
			uni.removeStorageSync('pendingShareReward');
		}
	};

	// --- 6. 页面跳转 ---

	/**
	 * @description 跳转到用户协议页面
	 */
	const skipToAgreement = (type) => {
		uni.navigateTo({
			url: `/pages/user-agreement/user-agreement?tab=${type}`
		});
	};


	// ==========================================================
	// --- 分享功能逻辑 ---
	// ==========================================================

	/**
	 * @description 监听用户点击“分享给好友”
	 */
	onShareAppMessage(() => {
		console.log('[分享] 用户在登录页发起了分享');

		// 【核心逻辑】决定使用哪个邀请码
		// 1. 优先使用从上游分享链接中捕获到的邀请码 (实现了邀请关系传递)
		// 2. 如果没有上游邀请码，再尝试获取当前可能已登录用户的邀请码（虽然在登录页不太可能，但作为兜底逻辑）
		// 3. 如果都没有，则不带邀请码（或者可以设置一个官方码作为最终兜底）
		const finalInviteCode = upstreamInviteCode.value || getInviteCode();

		console.log(`[分享] 登录页最终使用的邀请码: ${finalInviteCode}`);

		let sharePath = '/pages/index/index'; // 分享的目标页面
		if (finalInviteCode) {
			sharePath += `?inviteCode=${finalInviteCode}`;
		}

		const shareContent = {
			title: '猩聚社丨精英商友·跨域社交工具 Gofor Gathering ☞☞',
			path: sharePath,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};

		console.log('[分享] 登录页分享给好友的内容:', JSON.stringify(shareContent));

		return shareContent;
	});



	/**
	 * @description 监听用户点击“分享到朋友圈”
	 */
	onShareTimeline(() => {
		console.log('[分享] 用户在登录页分享到朋友圈');

		const finalInviteCode = upstreamInviteCode.value || getInviteCode();
		console.log(`[分享] 登录页朋友圈分享最终使用的邀请码: ${finalInviteCode}`);

		let queryString = '';
		if (finalInviteCode) {
			queryString = `inviteCode=${finalInviteCode}`;
		}

		const shareContent = {
			title: '猩聚社丨精英商友·跨域社交工具 Gofor Gathering ☞☞',
			query: queryString,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};

		console.log('[分享] 登录页分享到朋友圈的内容:', JSON.stringify(shareContent));

		return shareContent;
	});

	/**
	 * 微信登录成换绑的用户（与home.vue的方法一致可封装调用）
	 * 尝试使用 wx.login 获取 code 直接调用登录接口
	 */
	const performSilentLogin = async () => {
		try {
			// 1. 获取微信 loginCode
			const loginRes = await uni.login({
				provider: 'weixin'
			});
			if (!loginRes || !loginRes.code) {
				return;
			}

			// 2. 检查是否有暂存的邀请码
			const pendingInviteCode = uni.getStorageSync('pendingInviteCode');

			// 3. 构造请求参数，只传 loginCode 和必要的邀请码
			const payload = {
				loginCode: loginRes.code,
				state: 'default',
				shardCode: pendingInviteCode || ''
			};

			// 4. 调用后端接口
			const {
				data,
				error
			} = await request('/app-api/member/auth/weixin-mini-app-login', {
				method: 'POST',
				data: payload
			});

			// 5. 登录成功处理
			if (!error && data && data.accessToken) {
				console.log('✅ 静默登录成功!', data);
				// 存储 Token 和 UserId
				uni.setStorageSync('token', data.accessToken);
				uni.setStorageSync('userId', data.userId);

				// // 【关键】登录成功后，立即更新状态并刷新数据
				// isLogin.value = true;
				// loggedInUserId.value = data.userId;

				// 刷新用户信息和列表
				fetchCurrentUserInfo();
				// getBusinessOpportunitiesList(true);

				// 如果之前使用了邀请码，现在可以清除了
				// if (pendingInviteCode) {
				// 	uni.removeStorageSync('pendingInviteCode');
				// }
			} else {
				// 失败不弹窗，保持静默
				console.log('静默登录未成功 (可能是非新用户需手机号或接口异常):', error);
			}
		} catch (e) {
			console.error('静默登录流程异常:', e);
		}
	};

	//微信登录完还需要获取用户信息
	const fetchCurrentUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (error) {
			console.error("首页实时获取用户信息失败:", error);
			// 失败时可以考虑使用缓存数据作为兜底
			currentUserInfo.value = getCachedUserInfo();
		} else {
			// currentUserInfo.value = data;
			// console.log("首页实时获取用户信息成功:", currentUserInfo.value);
			// // 【重要】获取成功后，用新数据更新本地缓存
			uni.setStorageSync('userInfo', JSON.stringify(data));
		}
	};
</script>

<style lang="scss" scoped>
	/* --- 1. 页面整体布局 --- */
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		/* 内容从顶部开始排列 */
		min-height: 100vh;
		background: #f8f9fa;
		padding: 80rpx 50rpx 50rpx;
		box-sizing: border-box;
	}

	/* --- 2. 顶部 Header 区域 --- */
	.header {
		text-align: center;
		margin-bottom: 60rpx;

		.logo {
			width: 150rpx;
			height: 150rpx;
			border-radius: 50%;
			margin-bottom: 20rpx;
			background-color: #eee;
		}

		.welcome-text {
			display: block;
			font-size: 48rpx;
			font-weight: bold;
			color: #333;
		}

		.slogan-text {
			display: block;
			font-size: 28rpx;
			color: #999;
			margin-top: 10rpx;
		}
	}

	/* --- 3. 表单容器 --- */
	.form-wrapper {
		width: 100%;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 20rpx 40rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	/* --- 4. 表单项通用样式 --- */
	.form-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.label {
			width: 150rpx;
			font-size: 30rpx;
			color: #333;
			margin-left: 20rpx;
			flex-shrink: 0;
			/* 防止标签被压缩 */
		}

		.input {
			flex: 1;
			font-size: 30rpx;
			color: #333;
			min-width: 0;
			/* flex 布局下防止溢出 */
		}

		::v-deep .input-placeholder {
			text-align: left;
			color: #ccc;
		}

		// 如果上面不生效，可以尝试下面这个
		.input::placeholder {
			text-align: left;
			color: #ccc;
		}

		.input-display {
			font-size: 30rpx;
			color: #333;
		}

		.get-phone-btn {
			flex: 1;
			background: none;
			border: none;
			text-align: left;
			padding: 0;
			margin: 0;
			font-size: 30rpx;
			color: #007aff;
			line-height: 1.5;

			&::after {
				border: none;
			}
		}
	}

	/* --- 5. 【核心】头像与昵称的特定样式 --- */
	.profile-section {
		display: flex;
		flex-direction: column;
		align-items: center; // 所有内容居中
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.avatar-wrapper {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%; // 改为圆形
		padding: 0;
		margin: 0;
		border: 4rpx solid #eee;
		overflow: hidden;
		background-color: #f7f7f7;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

		&::after {
			border: none;
		}

		.avatar {
			width: 100%;
			height: 100%;
		}
	}

	.avatar-hint {
		font-size: 24rpx;
		color: #999;
		margin-top: 15rpx;
		margin-bottom: 30rpx; // 与下方的昵称输入框拉开距离
	}

	.nickName-item {
		width: 100%; // 昵称输入框占满宽度
		padding: 0 !important; // 移除 form-item 的默认 padding
		border-bottom: none !important; // 移除 form-item 的默认下划线
	}


	/* --- 6. 底部操作区 --- */
	.actions-wrapper {
		width: 100%;
		margin-top: 60rpx;
	}

	.agreement-section {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 40rpx;

		.checkbox-wrapper {
			display: flex;
			align-items: center;
			padding-right: 10rpx;
		}

		.agreement-text {
			font-size: 24rpx;
			color: #999;
			line-height: 1.5;
		}

		.link {
			color: #FF7600;
			text-decoration: underline;
			margin: 0 4rpx;
		}
	}

	.login-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
		background: linear-gradient(135deg, #FF8C00, #FF7600);
		box-shadow: 0 10rpx 30rpx rgba(255, 118, 0, 0.3);
		transition: all 0.3s ease;

		&[disabled] {
			background: #fabd8d;
			box-shadow: none;
			color: #fff;
			opacity: 0.8;
		}

		&::after {
			border: none;
		}
	}
</style>