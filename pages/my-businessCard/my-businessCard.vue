<template>
	<view class="container">
		<!-- 1. 悬浮分享按钮：仅在数据加载成功后显示 -->
		<view class="share-fab" v-if="userInfo" @click="openSharePopup">
			<uni-icons type="undo-filled" size="24" color="#fff"></uni-icons>
		</view>

		<!-- 2. 页面状态处理：加载、错误、成功 -->
		<!-- 加载中 -->
		<view v-if="isLoading" class="status-indicator">
			<uni-load-more status="loading" contentText="正在加载名片..."></uni-load-more>
		</view>

		<!-- 加载失败 -->
		<view v-else-if="errorMsg" class="status-indicator error-state">
			<uni-icons type="closeempty" size="50" color="#999"></uni-icons>
			<text class="error-text">{{ errorMsg }}</text>
		</view>

		<!-- 加载成功，显示内容 -->
		<template v-else-if="userInfo">
			<view class="card-header">
				<view class="header-title">
					{{ isViewingOwnCard ? '我的数字名片' : 'TA的数字名片' }}
				</view>
				<view class="header-subtitle">实时身份，及时连接！</view>
			</view>

			<MyCard :avatar="userInfo.avatar" :name="userInfo.realName || userInfo.nickname"
				:remark-name="userInfo.remarkName" :is-viewing-own-card="isViewingOwnCard"
				@editRemark="handleEditRemark" :pinyin-name="userInfo.pinyinName" :title="userInfo.titleName"
				:era="userInfo.era" :company-name="userInfo.companyName" :position-title="userInfo.positionTitle"
				:industry="userInfo.industry" :professional-title="userInfo.professionalTitle"
				:have-resources="userInfo.haveResources" :need-resources="userInfo.needResources"
				:signature="userInfo.signature" :personal-bio="userInfo.personalBio"
				:contact-info="formattedContactInfo" :show-user-qr-code="!!userInfo.wechatQrCodeUrl"
				:user-we-chat-qr-code-url="userInfo.wechatQrCodeUrl" :shard-code="userInfo.shardCode"
				:dynamic-qr-code-url="promotionQrCodeBase64"
				platform-qr-code-url="https://img.gofor.club/mmexport1759211962539.jpg"
				@goToOpportunities="handleGoToOpportunities" />

			<!-- 编辑提示：仅在查看自己的名片时显示 -->
			<view v-if="isViewingOwnCard" class="edit-hint">
				名片信息可在 <text @click="goToEdit" class="edit-link">个人资料</text> 中编辑
			</view>
		</template>

		<!-- 3. 自定义分享弹窗 (逻辑不变) -->
		<uni-popup ref="sharePopup" type="bottom" background-color="#fff">
			<view class="share-popup-content">
				<view class="share-popup-title">自定义分享内容</view>
				<view class="share-title-editor">
					<text class="editor-label">标题:</text>
					<input class="editor-input" v-model="customShareTitle" placeholder="请输入分享标题" />
				</view>
				<view class="share-channels">
					<button class="share-channel-btn" open-type="share">
						<uni-icons type="weixin" size="30" color="#07c160"></uni-icons>
						<text>微信好友</text>
					</button>
					<button class="share-channel-btn" @click="guideShareTimeline">
						<uni-icons type="pyq" size="30" color="#53a046"></uni-icons>
						<text>朋友圈</text>
					</button>
				</view>
				<view class="share-popup-cancel" @click="closeSharePopup">取消</view>
			</view>
		</uni-popup>

		<!-- 4. 分享到朋友圈的引导遮罩层 (逻辑不变) -->
		<view v-if="showTimelineGuide" class="timeline-guide-mask" @click="hideTimelineGuide">
			<image src="/static/icons/share-guide-arrow.png" class="guide-arrow"></image>
			<view class="guide-text">
				<text>点击右上角</text>
				<text>分享到朋友圈</text>
			</view>
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
	import MyCard from '../../components/MyCard.vue';
	import request from '../../utils/request.js';
	// import {
	// 	showPointsGainedFeedback
	// } from '../../utils/feedback.js';

	// --- 1. 状态管理：更清晰的状态变量 ---
	const userInfo = ref(null);
	const isLoading = ref(true);
	const errorMsg = ref('');
	const isViewingOwnCard = ref(true); // 默认是查看自己的名片
	const targetUserId = ref(null); // 仅在查看他人名片时有值
	const fromShare = ref(false);
	const promotionQrCodeUrl = ref('');
	const promotionQrCodeBase64 = ref('');

	// 分享UI相关的状态
	const sharePopup = ref(null);
	const customShareTitle = ref('');
	const showTimelineGuide = ref(false);


	// --- 2. 页面生命周期与初始化 ---
	onLoad(async (options) => {
		// 1. 获取本地 Token
		const token = uni.getStorageSync('token');

		// 2. 初始化最终参数对象，处理可能的 scene 参数 (扫码进入)
		let finalOptions = options || {};

		if (finalOptions.scene) {
			const sceneStr = decodeURIComponent(finalOptions.scene);
			console.log(`✅ [名片页] 在 onLoad 中检测到 scene: ${sceneStr}`);
			const sceneParams = {};
			sceneStr.split('&').forEach(item => {
				const parts = item.split('=');
				if (parts[0] && parts[1]) {
					sceneParams[parts[0]] = parts[1];
				}
			});
			console.log('✅ [名片页] scene 解析结果:', sceneParams);
			// 将解析后的 scene 参数合并到 finalOptions 中
			finalOptions = {
				...finalOptions,
				...sceneParams
			};
		}

		console.log('[my-businessCard] onLoad 触发。最终选项:', JSON.stringify(finalOptions));

		// 3. 捕获并暂存邀请码 (无论是否登录都执行，防止邀请关系丢失)
		const inviteCode = finalOptions.c || finalOptions.inviteCode;
		if (inviteCode) {
			console.log('✅ [邀请码] 捕获邀请码，暂存本地:', inviteCode);
			uni.setStorageSync('pendingInviteCode', inviteCode);
		}

		// 4. 游客模式判断 (日志记录)
		if (!token) {
			console.log('⚠️ 当前为游客模式（未登录），尝试允许查看名片数据...');
			// 【关键】这里不再 return，让代码继续往下走
		}

		// 5. 确定当前查看的目标 ID 和身份
		const loggedInUserId = uni.getStorageSync('userId');
		const targetId = finalOptions.i || finalOptions.id;

		if (finalOptions.fromShare && finalOptions.fromShare === '1') {
			fromShare.value = true;
		}

		if (targetId) {
			// 情况 A: 有目标ID -> 查看他人 (无论是否登录)
			// 注意：如果已登录且 targetId == loggedInUserId，逻辑上也是看自己，但 isViewingOwnCard 设为 false 也没大问题，
			// 或者你可以加个判断: if (loggedInUserId && targetId == loggedInUserId) isViewingOwnCard.value = true;
			// 这里保持你原有的逻辑结构：
			if (loggedInUserId && targetId == loggedInUserId) {
				isViewingOwnCard.value = true;
			} else {
				isViewingOwnCard.value = false;
				targetUserId.value = targetId;
			}
		} else {
			// 情况 B: 没有目标ID
			if (token) {
				// 已登录 -> 查看自己的名片
				isViewingOwnCard.value = true;
			} else {
				// 未登录且没目标ID -> 游客误入 -> 强制去登录页
				console.warn('游客模式且无目标ID，无法展示内容，跳转登录页');
				uni.reLaunch({
					url: '/pages/index/index'
				});
				return;
			}
		}

		// 6. 执行页面初始化 (加载数据)
		// 注意：fetchTargetUserInfo 调用的接口需要后端放行 Auth
		initializePage();

		// 7. 处理分享奖励 (内部有判断 loggedInUserId，游客调用安全)
		handleShareReward(finalOptions);
	});
	// onLoad((options) => {

	// 	// ================= 【新增逻辑开始】 =================
	// 	// 1. 第一步：立刻检查本地是否有 Token
	// 	const token = uni.getStorageSync('token');

	// 	if (!token) {
	// 		// 2. 如果没登录，先处理可能携带的邀请码（防止邀请关系丢失）
	// 		// 这一步很重要！即使未登录，也要先把链接里的邀请码存下来
	// 		let tempOptions = options || {};
	// 		// 解析 Scene (扫码情况)
	// 		if (tempOptions.scene) {
	// 			const sceneStr = decodeURIComponent(tempOptions.scene);
	// 			sceneStr.split('&').forEach(item => {
	// 				const parts = item.split('=');
	// 				if (parts[0] && parts[1]) {
	// 					tempOptions[parts[0]] = parts[1];
	// 				}
	// 			});
	// 		}

	// 		// 捕获邀请码并存入缓存
	// 		const inviteCode = tempOptions.c || tempOptions.inviteCode;
	// 		if (inviteCode) {
	// 			console.log('✅ [未登录拦截] 捕获邀请码，暂存本地:', inviteCode);
	// 			uni.setStorageSync('pendingInviteCode', inviteCode);
	// 		}

	// 		// 3. 停止加载动画，避免转圈圈
	// 		isLoading.value = false;

	// 		// 4. 弹出强制引导窗
	// 		uni.showModal({
	// 			title: '温馨提示',
	// 			content: '查看商友名片需要先登录\n登录后重新打开分享链接查看名片',
	// 			showCancel: false, // 不显示“取消”按钮，强制引导
	// 			confirmText: '去登录',
	// 			confirmColor: '#FF6E00', // 配合你的主题色
	// 			success: (res) => {
	// 				if (res.confirm) {
	// 					// 跳转到登录页
	// 					// 注意：这里使用 reLaunch 或 redirectTo，避免用户点左上角返回又回到白屏页
	// 					uni.reLaunch({
	// 						url: '/pages/index/index'
	// 					});
	// 				}
	// 			}
	// 		});

	// 		// 5. 【关键】阻断后续代码执行！
	// 		// 这样就不会去调用 fetchTargetUserInfo，也不会报错了
	// 		return;
	// 	}
	// 	// ================= 【新增逻辑结束】 =================


	// 	let finalOptions = options || {};

	// 	// 1. 检查是否存在 scene 参数 (扫码进入)
	// 	if (options && options.scene) {
	// 		const sceneStr = decodeURIComponent(options.scene);
	// 		console.log(`✅ [名片页] 在 onLoad 中检测到 scene: ${sceneStr}`);
	// 		const sceneParams = {};
	// 		sceneStr.split('&').forEach(item => {
	// 			const parts = item.split('=');
	// 			if (parts[0] && parts[1]) {
	// 				sceneParams[parts[0]] = parts[1];
	// 			}
	// 		});
	// 		console.log('✅ [名片页] scene 解析结果:', sceneParams);
	// 		// 2. 将解析后的参数合并到 finalOptions 中
	// 		finalOptions = {
	// 			...finalOptions,
	// 			...sceneParams
	// 		};
	// 	}

	// 	// 3. 后续所有逻辑都从 finalOptions 中取值
	// 	const inviteCode = finalOptions.c || finalOptions.inviteCode;
	// 	if (inviteCode) {
	// 		console.log(`✅ [名片页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
	// 		uni.setStorageSync('pendingInviteCode', inviteCode);
	// 	}

	// 	console.log('[my-businessCard] onLoad 触发。已收到的选项:', JSON.stringify(options));

	// 	const loggedInUserId = uni.getStorageSync('userId');

	// 	if (finalOptions.fromShare && finalOptions.fromShare === '1') {
	// 		fromShare.value = true;
	// 	}

	// 	const targetId = finalOptions.i || finalOptions.id;
	// 	if (targetId && targetId != loggedInUserId) {
	// 		isViewingOwnCard.value = false;
	// 		targetUserId.value = targetId;
	// 	} else {
	// 		isViewingOwnCard.value = true;
	// 	}

	// 	// 统一的页面初始化入口
	// 	initializePage();

	// 	// 处理分享点击带来的奖励逻辑
	// 	handleShareReward(finalOptions);
	// });

	/**
	 * @description 页面初始化总函数，负责数据加载和状态管理
	 */
	const initializePage = async () => {
		isLoading.value = true;
		errorMsg.value = '';
		userInfo.value = null; // 每次加载前重置

		try {
			const rawData = isViewingOwnCard.value ?
				await fetchOwnUserInfo() :
				await fetchTargetUserInfo(targetUserId.value);

			if (!rawData) throw new Error('未能获取到名片信息');

			userInfo.value = adaptUserInfo(rawData);

			await fetchPromotionQrCode();

		} catch (err) {
			// 现在这里捕获的错误会更准确
			console.error('页面初始化失败:', err.message);
			const ignoredErrors = [
				'权限不足，已引导至申请页。',
				'GUEST_ACCESS_DENIED'
			];

			if (!ignoredErrors.includes(err.message)) {
				errorMsg.value = err.message || '加载失败，请稍后重试';
			}
		} finally {
			isLoading.value = false;
		}
	};

	// --- 3. 数据获取与适配 ---

	/**
	 * @description 获取自己的名片信息
	 */
	const fetchOwnUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (error) throw new Error(error);
		return data;
	};

	/**
	 * @description 获取推广小程序码的函数
	 */
	const fetchPromotionQrCode = async () => {
		// 】在这里定义并获取 token
		const token = uni.getStorageSync('token');

		// 如果未登录（游客模式），直接跳过生成推广码
		if (!token) {
			console.log('游客模式，跳过生成推广小程序码');
			return;
		}

		// 确保在调用此函数时，userInfo 已经加载完毕
		if (!userInfo.value) {
			console.warn('无法生成小程序码，因为用户信息尚未加载。');
			return;
		}

		console.log('🚀 [二维码生成] 开始生成小程序码...');

		// 1. 获取 scene 字符串
		const scene = generateSceneString();
		if (!scene) {
			console.error('❌ [二维码生成] 生成 scene 失败，无法继续。');
			return;
		}
		console.log(`✅ [二维码生成] 使用的 scene: ${scene}`);


		// 2. 准备请求体
		const payload = {
			scene: scene,
			path: "pages/my-businessCard/my-businessCard",
			width: 430,
			autoColor: true,
			checkPath: true,
			hyaline: true
		};

		// 3. 调用接口
		const {
			data: base64Image,
			error
		} = await request('/app-api/member/social-user/wxa-qrcode', {
			method: 'POST',
			data: payload
		});

		// 4. 处理返回结果
		if (error) {
			console.error('❌ [二维码生成] 调用接口失败:', error);
			// 只有在非静默失败时才弹窗，这里可以选择不弹窗以免打扰游客体验
			// uni.showToast({ title: '生成分享码失败', icon: 'none' });
			return;
		}

		// 5. 存储并打印
		// 检查并添加 Base64 前缀，以便可以直接在 image 标签中使用
		const finalBase64 = base64Image.startsWith('data:image') ?
			base64Image :
			`data:image/png;base64,${base64Image}`;

		promotionQrCodeBase64.value = finalBase64;

		console.log('✅ [二维码生成] 成功获取并存储了小程序码 Base64 数据');
	};



	/**
	 * @description 生成携带所有参数的小程序页面路径
	 * @returns {string} - 返回拼接好的完整路径，例如 "pages/my-businessCard/my-businessCard?id=123&..."
	 */
	const generateSceneString = () => {
		if (!userInfo.value) return '';

		// 参数源
		const cardOwnerId = userInfo.value.id;
		const inviteCode = userInfo.value.shardCode;
		const sharerId = uni.getStorageSync('userId');

		// 使用数组和 join 的方式手动拼接，确保兼容性
		const params = [];
		// 注意：这里的 key 必须与后端解码时使用的 key 完全一致
		if (cardOwnerId) params.push(`i=${cardOwnerId}`); // id -> i
		if (sharerId) params.push(`s=${sharerId}`); // sharerId -> s
		if (inviteCode) params.push(`c=${inviteCode}`); // inviteCode -> c
		params.push('fs=1'); // fromShare=1 -> fs=1 (这个值是固定的)

		const scene = params.join('&');

		// 【关键】检查长度，如果超长，则需要进一步优化（例如省略某些参数）
		if (scene.length > 32) {
			console.warn(`生成的 scene 字符串长度为 ${scene.length}，超过了32个字符的限制！Scene: ${scene}`);
			// 这里可以根据业务优先级决定省略哪个参数，例如，如果邀请码最重要，可以考虑去掉 sharerId
			// 这是一个降级策略，需要您根据业务来定
			// const simplifiedParams = [];
			// if (cardOwnerId) simplifiedParams.push(`i=${cardOwnerId}`);
			// if (inviteCode) simplifiedParams.push(`c=${inviteCode}`);
			// return simplifiedParams.join('&');
		}

		console.log("scene", scene)

		return scene;
	};

	/**
	 * @description 获取他人的名片信息
	 */
	const fetchTargetUserInfo = async (userId) => {
		const requestData = {
			readUserId: userId
		};
		// 如果是分享链接进来的，加上这个参数（按后端要求）
		if (fromShare.value) {
			requestData.notPay = 1;
		}

		console.log('[名片页] 游客/用户请求名片数据:', JSON.stringify(requestData));

		const {
			data,
			error
		} = await request('/app-api/member/user/read-card', {
			method: 'POST',
			data: requestData
		});

		// 1. 如果请求成功 (error 为 null)
		if (!error) {
			console.log('✅ 获取名片成功');
			return data;
		}

		// 2. 如果请求失败 (有 error)
		console.error('获取名片失败:', error);

		// 这里处理一种特殊情况：万一后端还是返回了 401 (虽然你在工具里测是通的，但为了保险)
		const token = uni.getStorageSync('token');
		if (!token) {
			// 如果是游客，且真的报错了，才提示去登录
			uni.showModal({
				title: '提示',
				content: '当前为游客模式，如无法查看完整信息，请尝试登录',
				confirmText: '去登录',
				cancelText: '暂不登录',
				success: (res) => {
					if (res.confirm) uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			});
			// 返回 null，让页面保持空状态或显示默认图，不要抛出异常导致红字报错
			return null;
		}

		// 如果是已登录用户报错，抛出异常让外层处理
		throw new Error(typeof error === 'string' ? error : (error.msg || '获取失败'));
	};
	// const fetchTargetUserInfo = async (userId) => {
	// 	// 【修改点】在这里构建请求参数
	// 	const requestData = {
	// 		readUserId: userId
	// 	};

	// 	// 如果是通过免费分享链接进来的，就加上 notPay: 1
	// 	if (fromShare.value) {
	// 		requestData.notPay = 1;
	// 	}

	// 	console.log('[my-businessCard] 准备使用参数调用 /read-card:', JSON.stringify(requestData));

	// 	const {
	// 		data,
	// 		error
	// 	} = await request('/app-api/member/user/read-card', {
	// 		method: 'POST',
	// 		data: requestData
	// 	});
	// 	if (error) {
	// 		// 如果是查看他人名片时出错
	// 		if (!isViewingOwnCard.value) {
	// 			// 使用 uni.showModal 来显示支持换行的长文本
	// 			uni.showModal({
	// 				title: '温馨提示',
	// 				// 【关键】在这里使用 \n 实现换行
	// 				content: '请点击左上角的“屋子”图标，\n到“猩世界”注册或登陆，\n体验“猩聚社”商友社交工具!',
	// 				showCancel: false, // 只保留一个“确定”按钮
	// 				confirmText: '我知道了',
	// 				success: (res) => {
	// 					// 当用户点击“我知道了”后，再执行页面跳转
	// 					if (res.confirm) {
	// 						uni.redirectTo({
	// 							url: `/pages/business-card-apply/business-card-apply?id=${userId}&name=${encodeURIComponent('目标用户')}&fromShare=${fromShare.value ? '1' : '0'}`
	// 						});
	// 					}
	// 				}
	// 			});
	// 			// 【重要】返回一个 Promise.reject，让外层 catch 知道这里出错了，
	// 			// 并且不再继续执行后面的 userInfo.value 赋值等操作。
	// 			// 抛出的消息仅用于控制台调试。
	// 			return Promise.reject(new Error('权限不足，已引导至申请页。'));
	// 		}
	// 		// 如果是查看自己的卡片出错，则正常抛出错误让页面显示
	// 		else {
	// 			throw new Error(error);
	// 		}
	// 	}

	// 	// 如果没有错误，正常返回数据
	// 	return data;
	// };

	/**
	 * @description 适配不同接口返回的用户数据，统一为组件所需格式
	 */
	const adaptUserInfo = (rawUserData) => {
		if (!rawUserData) return null;
		return {
			id: rawUserData.id,
			// --- 身份核心信息 ---
			avatar: rawUserData.avatar,
			realName: rawUserData.realName,
			nickname: rawUserData.nickname,
			remarkName: rawUserData.remarkName,
			pinyinName: rawUserData.topUpLevel?.name || rawUserData.topUpLevelName || '', // 会员等级
			titleName: rawUserData.level?.name || rawUserData.levelName || '', // 身份头衔
			era: rawUserData.era, // 新增：年代

			// --- 职业与社会信息 ---
			companyName: rawUserData.companyName,
			positionTitle: rawUserData.positionTitle, // 新增：职务
			industry: rawUserData.industry, // 新增：行业
			professionalTitle: rawUserData.professionalTitle, // 新增：社会职务

			// --- 资源信息 ---
			haveResources: rawUserData.haveResources, // 新增：我有资源
			needResources: rawUserData.needResources, // 新增：我需资源

			// --- 个人展示信息 ---
			signature: rawUserData.signature, // 新增：个性签名
			personalBio: rawUserData.personalBio, // 新增：个人简介

			// --- 联系方式 (保持不变) ---
			mobile: rawUserData.mobile,
			contactEmail: rawUserData.contactEmail,
			locationAddressStr: rawUserData.locationAddressStr,

			// --- 二维码与邀请码 ---
			wechatQrCodeUrl: rawUserData.wechatQrCodeUrl,
			shardCode: rawUserData.shardCode,
		};
	};

	// --- 4. 计算属性 ---
	const formattedContactInfo = computed(() => {
		if (!userInfo.value) return [];
		return [{
				icon: 'phone-filled',
				label: '手机',
				value: userInfo.value.mobile || '未设置'
			},
			{
				icon: 'email-filled',
				label: '邮箱',
				value: userInfo.value.contactEmail || '未设置'
			},
			{
				icon: 'location-filled',
				label: '地址',
				value: userInfo.value.locationAddressStr || '未设置'
			}
		];
	});

	// --- 5. 分享相关逻辑 ---

	/**
	 * @description 处理分享链接被点击后的奖励逻辑
	 */
	const handleShareReward = (options) => {
		// 【核心修改】兼容 sharerId 和缩写 s
		const sharerId = options.s || options.sharerId;

		if (!options || !sharerId) return;

		// 【核心修改】兼容 id 和缩写 i
		const bizId = options.i || options.id;

		const loggedInUserId = uni.getStorageSync('userId');

		// 本人点击，不处理
		if (sharerId == loggedInUserId) {
			console.log('用户点击了自己的分享链接，不计分。');
			return;
		}

		// 已登录用户点击，直接加分
		if (loggedInUserId) {
			console.log('其他已登录用户点击，准备为分享者加分。');
			triggerShareHitApi(sharerId, bizId);
		}
		// 未登录用户点击，暂存信息
		else {
			console.log('未登录用户点击，暂存分享信息。');
			uni.setStorageSync('pendingShareReward', {
				sharerId,
				bizId,
				type: 30 // 30 代表 "分享名片奖励"
			});
		}
	};

	/**
	 * @description 调用分享命中接口，为分享者增加贡分
	 */
	const triggerShareHitApi = async (sharerId, bizId) => {
		if (!sharerId || !bizId) return;
		const {
			error
		} = await request('/app-api/member/experience-record/share-experience-hit', {
			method: 'POST',
			data: {
				type: 30,
				shareUserId: sharerId,
				bizId: bizId
			}
		});
		if (error) {
			console.error('调用分享名片加分接口失败:', error);
		} else {
			console.log(`成功为分享者(ID: ${sharerId})触发贡分增加`);

			// const pointsGained = data?.experience || 1; // 优先用后端返回的值，否则默认为 1

			// showPointsGainedFeedback('分享名片', pointsGained);
		}
	};

	// 监听“分享给好友”
	onShareAppMessage(() => {
		closeSharePopup();
		if (!userInfo.value) return {
			title: '一张很棒的电子名片'
		};

		const loggedInUserId = uni.getStorageSync('userId');
		const cardOwnerId = userInfo.value.id; // 分享路径中的ID应始终是名片所有者的ID

		const inviteCode = userInfo.value.shardCode;

		let sharePath = `/pages/my-businessCard/my-businessCard?id=${cardOwnerId}&fromShare=1`;
		// 分享者ID是当前登录用户的ID
		if (loggedInUserId) {
			sharePath += `&sharerId=${loggedInUserId}`;
		}

		if (inviteCode) {
			sharePath += `&inviteCode=${inviteCode}`;
		}

		const finalTitle = customShareTitle.value ||
			`这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

		const shareContent = {
			title: finalTitle,
			path: sharePath,
			imageUrl: userInfo.value.avatar,
		};

		// ===================== LOG START: 分享数据 =====================
		console.log('[my-businessCard] 分享好友内容:', JSON.stringify(shareContent));
		// ===================== LOG END ===============================

		return shareContent;
	});

	// 监听“分享到朋友圈”
	onShareTimeline(() => {
		hideTimelineGuide();
		if (!userInfo.value) return {
			title: '一张很棒的电子名片'
		};

		const loggedInUserId = uni.getStorageSync('userId');
		const cardOwnerId = userInfo.value.id;

		// 【确认】此逻辑已存在且正确：从名片信息中获取邀请码
		const inviteCode = userInfo.value.shardCode;

		let queryString = `id=${cardOwnerId}&fromShare=1`;
		if (loggedInUserId) {
			queryString += `&sharerId=${loggedInUserId}`;
		}

		// 【确认】此逻辑已存在且正确：将邀请码拼接到 query 字符串中
		if (inviteCode) {
			queryString += `&inviteCode=${inviteCode}`;
		}

		const finalTitle = customShareTitle.value ||
			`这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

		const shareContent = {
			title: finalTitle,
			query: queryString,
			imageUrl: userInfo.value.avatar,
		};

		console.log('[my-businessCard] 生成时间轴共享内容:', JSON.stringify(shareContent));

		return shareContent;
	});

	// --- 6. 事件处理器 ---

	// 备注相关方法 ---
	/**
	 * 处理点击编辑备注的事件
	 */
	const handleEditRemark = () => {
		uni.showModal({
			title: '修改备注名',
			content: userInfo.value.remarkName || '', // 将当前备注作为默认值
			editable: true, // 开启输入框模式
			placeholderText: '请输入备注名',
			success: async (res) => {
				if (res.confirm) {
					// 用户点击了确认
					const newRemarkName = res.content.trim();

					// 调用API保存备注
					const success = await saveUserRemark(newRemarkName);

					if (success) {
						// 如果保存成功，立即更新本地UI，无需重新请求整个页面
						userInfo.value.remarkName = newRemarkName;
						uni.showToast({
							title: '备注已更新',
							icon: 'success'
						});
					}
				}
			}
		});
	};

	/**
	 * 调用API保存用户备注
	 * @param {string} remark - 新的备注名
	 * @returns {Promise<boolean>}
	 */
	const saveUserRemark = async (remark) => {
		if (!targetUserId.value) return false;

		const {
			data,
			error
		} = await request('/app-api/member/user-remark/addOrUpdateRemarkName', {
			method: 'POST',
			data: {
				toUserId: targetUserId.value,
				remarkName: remark,
			}
		});

		if (error) {
			uni.showToast({
				title: `保存失败: ${error}`,
				icon: 'none'
			});
			return false;
		}

		return true; // 返回 true 表示成功
	};

	const goToEdit = () => uni.navigateTo({
		url: '/packages/my-edit/my-edit'
	});
	const openSharePopup = () => {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showModal({
				title: '提示',
				content: '登录后才能分享名片哦',
				confirmText: '去登录',
				success: (res) => {
					if (res.confirm) uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			});
			return;
		}

		customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
		sharePopup.value.open();
	};
	const closeSharePopup = () => sharePopup.value.close();
	const guideShareTimeline = () => {
		closeSharePopup();
		showTimelineGuide.value = true;
	};
	const hideTimelineGuide = () => showTimelineGuide.value = false;

	/**
	 * 【新增】处理跳转到商友圈页面的事件
	 */
	const handleGoToOpportunities = () => {
		if (!userInfo.value || !userInfo.value.id) {
			uni.showToast({
				title: '无法获取用户信息',
				icon: 'none'
			});
			return;
		}

		// 携带用户ID和名字进行跳转
		const url =
			`/packages/user-opportunities/user-opportunities?userId=${userInfo.value.id}&userName=${encodeURIComponent(userInfo.value.realName || userInfo.value.nickname)}`;

		uni.navigateTo({
			url
		});
	};
</script>

<style lang="scss" scoped>
	/* 页面基础布局样式 */
	.container {
		background: linear-gradient(135deg, #f8f9fa, #e9ecef);
		color: #333;
		line-height: 1.6;
		padding: 40rpx 30rpx;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-top: 80rpx;
		box-sizing: border-box;
	}

	.card-header {
		text-align: center;
		margin-bottom: 60rpx;

		.header-title {
			font-size: 56rpx;
			font-weight: 700;
			color: #333;
			margin-bottom: 20rpx;
		}

		.header-subtitle {
			font-size: 32rpx;
			color: #777;
		}
	}

	.edit-hint {
		color: #888;
		font-size: 28rpx;
		margin-top: 40rpx;

		.edit-link {
			color: #007aff;
			text-decoration: underline;
			font-weight: bold;
			margin: 0 8rpx;
		}
	}

	/* 悬浮分享按钮 */
	.share-fab {
		position: fixed;
		top: 180rpx;
		right: 30rpx;
		width: 90rpx;
		height: 90rpx;
		background: linear-gradient(135deg, #3a7bd5, #00d2ff);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
		z-index: 99;
		transition: transform 0.2s ease;

		&:active {
			transform: scale(0.95);
		}
	}

	/* 新增：加载和错误状态的容器样式 */
	.status-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		width: 100%;
	}

	.error-state {
		.error-text {
			font-size: 30rpx;
			color: #888;
			margin-top: 20rpx;
		}
	}

	/* --- 分享弹窗与引导蒙层样式 (保持不变) --- */
	.share-popup-content {
		padding: 30rpx;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
	}

	.share-popup-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 40rpx;
	}

	.share-title-editor {
		display: flex;
		align-items: center;
		background-color: #f7f7f7;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 40rpx;
	}

	.editor-label {
		font-size: 28rpx;
		color: #666;
		margin-right: 20rpx;
	}

	.editor-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.share-channels {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		margin-bottom: 40rpx;
	}

	.share-channel-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: transparent;
		padding: 0;
		margin: 0;
		border: none;
		line-height: 1.5;

		&::after {
			border: none;
		}
	}

	.share-channel-btn text {
		font-size: 24rpx;
		color: #666;
		margin-top: 10rpx;
	}

	.share-popup-cancel {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		background-color: #f0f0f0;
		border-radius: 45rpx;
		font-size: 30rpx;
		color: #333;
	}

	.timeline-guide-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.7);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		padding-right: 20rpx;
		box-sizing: border-box;
	}

	.guide-arrow {
		width: 150rpx;
		height: 150rpx;
		margin-top: 10rpx;
		margin-right: 20rpx;
	}

	.guide-text {
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		margin-top: 20rpx;

		text {
			display: block;
			margin-bottom: 10rpx;
		}
	}
</style>