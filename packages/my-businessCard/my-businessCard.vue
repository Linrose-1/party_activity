<template>
	<view class="container">
		<!--  悬浮分享按钮：仅在数据加载成功后显示 -->
		<!-- <view class="share-fab" v-if="userInfo" @click="openSharePopup">
			<uni-icons type="undo-filled" size="24" color="#fff"></uni-icons>
		</view> -->

		<!--  页面状态处理：加载、错误、成功 -->
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
				<!-- 编辑提示：仅在查看自己的名片时显示 -->
				<!-- <view v-if="isViewingOwnCard" class="edit-hint">
					名片信息可在 <text @click="goToEdit" class="edit-link">个人资料</text> 中编辑
				</view> -->
			</view>

			<MyCard :avatar="userInfo.avatar" :name="userInfo.realName || userInfo.nickname"
				:remark-name="userInfo.remarkName" :is-viewing-own-card="isViewingOwnCard"
				@editRemark="handleEditRemark" :pinyin-name="userInfo.pinyinName" :title="userInfo.titleName"
				:era="userInfo.era" :company-list="userInfo.companyList" :association-list="userInfo.associationList"
				:have-resources="userInfo.haveResources" :need-resources="userInfo.needResources"
				:signature="userInfo.signature" :personal-bio="userInfo.personalBio"
				:contact-info="formattedContactInfo" :show-user-qr-code="!!userInfo.wechatQrCodeUrl"
				:user-we-chat-qr-code-url="userInfo.wechatQrCodeUrl" :shard-code="userInfo.shardCode"
				:dynamic-qr-code-url="promotionQrCodeBase64" :radar-datasets="radarDatasets" :credit-level="creditLevel"
				:total-score="totalScore" @goToCredit="handleGoToCredit" @goToMember="handleGoToMember"
				platform-qr-code-url="https://img.gofor.club/mmexport1759211962539.jpg"
				@goToOpportunities="handleGoToOpportunities" />

			<!-- <view style="width: 100%;height: 140rpx;"></view> -->
		</template>

		<!-- ==================== 底部动态操作栏 ==================== -->
		<view class="footer-action-bar" v-if="userInfo" :class="{ 'z-index-low': isAnyPopupOpen }">

			<!-- 场景 A: 未登录用户 -->
			<view v-if="userStatus === 'GUEST'" class="action-group">
				<button class="btn btn-secondary" @click="goToLogin">登录体验</button>
				<button class="btn btn-primary" @click="goToHome">首页预览</button>
			</view>

			<!-- 场景 B: 已登录，陌生人-->
			<!-- my-businessCard.vue 内部修改 -->
			<view v-else-if="userStatus === 'STRANGER'" class="action-group">
				<!-- 1. 加入TA圈 (次要按钮，浅色背景) -->
				<button class="btn btn-ghost-primary" @click="handleAddCircle">加入TA圈</button>

				<!-- 2. 邀入我圈 (主要按钮，品牌渐变) -->
				<button class="btn btn-primary" @click="handleInviteCircle">邀入我圈</button>

				<!-- 3. 智能分享 (独立标识，橙色边框/圆角) -->
				<view class="smart-share-btn" @click="openShareTypePopup">
					<!-- <uni-icons type="paperplane-filled" size="22" color="#FF6A00"></uni-icons> -->
					<text>智能分享</text>
				</view>
			</view>

			<!-- 场景 C: 已登录，已是圈友 -->
			<view v-else-if="userStatus === 'FRIEND'" class="action-group">
				<button class="btn btn-secondary" @click="openShareTypePopup">
					<uni-icons type="paperplane" size="18" color="#fff"></uni-icons> 分享
				</button>
				<button class="btn btn-success" disabled>
					<uni-icons type="star-filled" size="18" color="#fff"></uni-icons> 已互圈
				</button>
			</view>

			<!-- 场景 D: 访问自己的名片 -->
			<view v-else-if="userStatus === 'SELF'" class="action-group">
				<button class="btn btn-secondary" @click="openSharePopup">分享名片</button>
				<button class="btn btn-primary" @click="goToEdit">编辑资料</button>
			</view>

		</view>

		<!-- 4. 分享到朋友圈的引导遮罩层-->
		<view v-if="showTimelineGuide" class="timeline-guide-mask" @click="hideTimelineGuide">
			<image src="/static/icons/share-guide-arrow.png" class="guide-arrow"></image>
			<view class="guide-text">
				<text>点击右上角</text>
				<text>分享到朋友圈</text>
			</view>
		</view>


		<!-- 自定义分享弹窗 -->
		<uni-popup ref="sharePopup" type="bottom" background-color="#fff" @change="onPopupChange">
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

	</view>

	<AddCircleConfirmPopup ref="addCirclePopup" />
	<InviteCircleConfirmPopup ref="inviteCirclePopup" @success="onSocialActionSuccess" />

	<ShareTypePopup ref="shareTypePopupRef" @selectMode="handleShareTypeSelect" @change="onShareTypePopupChange" />

	<!--需求诱发悬浮按钮组 -->
	<!-- 逻辑：只有已完整登录（绑定手机号）的用户才显示此悬浮窗 -->
	<DemandActionFab v-if="userStatus !== 'GUEST' && userStatus !== 'SELF'" />

	<!-- 智能引导弹窗 -->
	<SmartGuidePopup ref="guidePopupRef" :scenario="guideScenario" />

</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onHide,
		onLoad,
		onReady,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import MyCard from '../../components/MyCard.vue';
	import request from '../../utils/request.js';
	import AddCircleConfirmPopup from '@/components/AddCircleConfirmPopup.vue';
	import InviteCircleConfirmPopup from '@/components/InviteCircleConfirmPopup.vue';
	import DemandActionFab from '@/components/DemandActionFab.vue';
	import SmartGuidePopup from '@/components/SmartGuidePopup.vue';
	import {
		getInviteCode,
		getCachedUserInfo,
		checkLoginGuard,
		isUserFullyLoggedIn
	} from '../../utils/user.js'; // 引入工具函数获取登录用户邀请码
	import ShareTypePopup from '@/components/ShareTypePopup.vue'; // 引入新组件

	// --- 1. 状态管理 ---
	const userInfo = ref(null);
	const isLoading = ref(true);
	const errorMsg = ref('');
	const isViewingOwnCard = ref(true); // 默认是查看自己的名片
	const targetUserId = ref(null); // 仅在查看他人名片时有值
	const fromShare = ref(false);
	const promotionQrCodeUrl = ref('');
	const promotionQrCodeBase64 = ref('');
	const remainingShareQuota = ref(0); // 剩余分享次数
	const isQuotaLoaded = ref(false);

	const radarDatasets = ref([]);

	const guideScenario = ref(1);
	const guidePopupRef = ref(null);

	// 分享UI相关的状态
	const sharePopup = ref(null);
	const customShareTitle = ref('');
	const showTimelineGuide = ref(false);
	const isPopupOpen = ref(false);

	const addCirclePopup = ref(null);
	const inviteCirclePopup = ref(null);
	const shareTypePopupRef = ref(null);
	const currentShareMode = ref('PROXY'); // 默认模式， 'SELF' | 'PROXY'
	const isShareTypePopupOpen = ref(false);

	const creditLevel = ref('');
	const totalScore = ref(0);

	// 假设后端返回的名片信息里有一个字段表示是否互圈，比如 isFriend
	// 目前先模拟一下，或者根据需求说明先预留
	/**
	 * 计算当前访问者的身份状态
	 * 返回值: 'GUEST' | 'STRANGER' | 'FRIEND' | 'SELF'
	 */
	const userStatus = computed(() => {
		// 1. 未登录 -> GUEST
		// const token = uni.getStorageSync('token');
		// if (!token) return 'GUEST';
		if (!isUserFullyLoggedIn()) return 'GUEST';

		// 2. 看自己 -> SELF
		if (isViewingOwnCard.value) return 'SELF';

		// 3. 看他人
		// 这里需要依赖 userInfo 中的字段来判断是否互圈
		// 假设 userInfo.value.isFriend === true 表示已互圈
		// 目前暂时没有这个字段，所以除了自己都是 STRANGER (或者你可以手动改这里测试 FRIEND 状态)
		if (userInfo.value && userInfo.value.isFriend) {
			return 'FRIEND';
		}

		// 默认是陌生人
		return 'STRANGER';
	});


	// --- 2. 页面生命周期与初始化 ---
	// onLoad(() => {
	// 	startGuideTimer();
	// });


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
			console.log('测试');
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

		// if (finalOptions.fromShare && finalOptions.fromShare === '1') {
		// 	fromShare.value = true;
		// }
		// if ((finalOptions.fromShare && finalOptions.fromShare === '1') ||
		// 	(finalOptions.fs && finalOptions.fs === '1')) {
		// 	fromShare.value = true;
		// }
		// --- 替换开始 ---
		const isFromShareStr = finalOptions.fromShare || finalOptions.fs;
		console.log('🔍 [Debug] fromShare/fs 原始值:', isFromShareStr);

		if (isFromShareStr === '1' || isFromShareStr === 1) {
			fromShare.value = true;
			console.log('✅ [Debug] 已识别为分享来源，fromShare = true');
		} else {
			console.log('❌ [Debug] 未识别为分享来源');
		}
		// --- 替换结束 ---
		console.log("打印结束")

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
		// 重新定义一个明确的布尔值，用于传参
		const isShareSource = (fromShare.value === true);
		initializePage(isShareSource);

		// 7. 处理分享奖励 (内部有判断 loggedInUserId，游客调用安全)
		handleShareReward(finalOptions);

		// uni.hideShareMenu();
		uni.showShareMenu({
			menus: ['shareAppMessage', 'shareTimeline'] // 关键：必须包含 shareTimeline
		});
		// 启动 6 秒引导逻辑
		startGuideTimer();
	});

	// 在 onLoad 内部或者末尾添加
	// onReady(() => {
	// 	// ======= 调试专用：手动控制显示场景 =======

	// 	// 测试情况 1：全新户 (欢迎语 + 5智米奖励)
	// 	guideScenario.value = 3;

	// 	// 测试情况 2：老游客 (欢迎您再次来到... + 5智米奖励)
	// 	// guideScenario.value = 2; 

	// 	// 测试情况 3：未完善资料 (欢迎语 + 10智米提示 + 3x2按钮)
	// 	// guideScenario.value = 3; 

	// 	// 立即打开，不需要等 6 秒
	// 	if (guidePopupRef.value) {
	// 		console.log('--- 正在测试引导弹窗，场景 ID:', guideScenario.value);
	// 		guidePopupRef.value.open();
	// 	}
	// 	// =======================================
	// });

	/**
	 * @description 页面初始化总函数，负责数据加载和状态管理
	 */
	const initializePage = async (isFromShare = false) => {
		isLoading.value = true;
		errorMsg.value = '';
		userInfo.value = null; // 每次加载前重置

		console.log('🔄 [initializePage] 接收到的 isFromShare:', isFromShare);

		try {
			const rawData = isViewingOwnCard.value ?
				await fetchOwnUserInfo() :
				await fetchTargetUserInfo(targetUserId.value, isFromShare);

			if (!rawData) throw new Error('未能获取到名片信息');

			userInfo.value = adaptUserInfo(rawData);

			if (userInfo.value.id) {
				await fetchRadarStatistics(userInfo.value.id);

				fetchCreditInfo(userInfo.value.id);
			}

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

	// 获取信用等级的方法
	const fetchCreditInfo = async (userId) => {
		try {
			const {
				data,
				error
			} = await request(`/app-api/member/user/other_credit-score/${userId}`, {
				method: 'GET'
			});
			if (!error && data) {
				creditLevel.value = data.creditLevel;
				totalScore.value = data.totalScore; // 【获取总分】
			}
		} catch (e) {
			console.error('获取信用信息失败', e);
		}
	};

	// 4. 处理标签点击跳转
	const handleGoToCredit = () => {
		uni.navigateTo({
			url: '/packages/credit-score/credit-score'
		});
	};

	/**
	 * 跳转到会员/等级中心
	 */
	const handleGoToMember = () => {
		uni.navigateTo({
			url: '/packages/my-member/my-member'
		});
	};

	// 获取雷达图数据
	const fetchRadarStatistics = async (userId) => {
		try {
			// 1. 并发请求：0=自评, 1=商友, 3=综合
			const [selfRes, friendRes, complexRes] = await Promise.all([
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId,
						type: 0
					}
				}),
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId,
						type: 1
					}
				}),
				request('/app-api/member/user-scores/complexStatistics', {
					method: 'GET',
					data: {
						userId,
						type: 3
					}
				})
			]);

			const newDatasets = [];

			// 2. 固定顺序填充 - 索引 0：自我评价
			newDatasets.push({
				name: '自我评价',
				data: (!selfRes.error && selfRes.data) ? [selfRes.data.avg1 || 0, selfRes.data.avg2 || 0,
					selfRes.data.avg3 || 0, selfRes.data.avg4 || 0
				] : [0, 0, 0, 0],
				color: '#FF7D00'
			});

			// 3. 固定顺序填充 - 索引 1：商友评价 (确保 type 1 对应这里)
			newDatasets.push({
				name: '商友评价',
				data: (!friendRes.error && friendRes.data) ? [friendRes.data.avg1 || 0, friendRes.data
					.avg2 || 0, friendRes.data.avg3 || 0, friendRes.data.avg4 || 0
				] : [0, 0, 0, 0],
				color: '#4CAF50'
			});

			// 4. 固定顺序填充 - 索引 2：综合评价 (确保 type 3 对应这里)
			newDatasets.push({
				name: '综合评价',
				data: (!complexRes.error && complexRes.data) ? [complexRes.data.avg1 || 0, complexRes.data
					.avg2 || 0, complexRes.data.avg3 || 0, complexRes.data.avg4 || 0
				] : [0, 0, 0, 0],
				color: '#1890FF'
			});

			// 5. 最后统一赋值
			radarDatasets.value = newDatasets;

			console.log('✅ 评分数据加载完成，顺序：自我(0), 商友(1), 综合(2)');
		} catch (e) {
			console.error('获取评分统计失败', e);
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
			path: "packages/my-businessCard/my-businessCard",
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
	const fetchTargetUserInfo = async (userId, forceFree = false) => {
		const requestData = {
			readUserId: userId,
			// isReadByFriend: friendOwnerUserId.value ? 1 : 0,
			// friendOwnerUserId: friendOwnerUserId.value || 0
		};

		console.log('🛠 [fetchTargetUserInfo] forceFree:', forceFree);

		// 如果是分享链接进来的，加上这个参数（按后端要求）
		if (forceFree) {
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

	// 获取名片分享剩余次数 (rightsType = 4)
	const checkShareQuota = async () => {
		try {
			const {
				data
			} = await request('/app-api/member/top-up-level-rights/get-remaining', {
				method: 'GET',
				data: {
					rightsType: 4
				}
			});
			// 注意：名片这里 -1 代表无限次，所以逻辑稍微不同
			// 如果返回 -1，保留 -1；如果返回数字，保留数字；如果返回 null，视为 0
			if (typeof data === 'number') {
				remainingShareQuota.value = data;
			} else {
				remainingShareQuota.value = 0;
			}

			isQuotaLoaded.value = true;
			console.log('剩余分享次数:', remainingShareQuota.value);
		} catch (e) {
			console.error('获取权益失败', e);
		}
	};

	const deductShareQuota = async () => {
		try {
			await request('/app-api/member/top-up-level-rights/update-share-rights', {
				method: 'PUT'
			});
			// 扣减成功后，重新获取一次最新额度
			checkShareQuota();
		} catch (e) {
			console.log('扣减权益失败', e);
		}
	};

	/**
	 * @description 适配并处理所有项（组织机构、公司行业等）
	 */
	const adaptUserInfo = (rawUserData) => {
		if (!rawUserData) return null;

		// 辅助函数：安全分割字符串为数组
		const splitStr = (str) => str ? String(str).split(',').map(s => s.trim()).filter(s => s) : [];

		const associations = splitStr(rawUserData.associationName);
		const titles = splitStr(rawUserData.professionalTitle);
		// 组装社会职务数组
		const associationList = associations.map((name, i) => ({
			name: name,
			title: titles[i] || ''
		})).filter(item => item.name || item.title);

		const companies = splitStr(rawUserData.companyName);
		const industries = splitStr(rawUserData.industry);
		const positions = splitStr(rawUserData.positionTitle);
		// 组装公司职业数组
		const companyList = companies.map((name, i) => ({
			name: name,
			industry: industries[i] || '',
			position: positions[i] || ''
		})).filter(item => item.name || item.industry || item.position);

		return {
			...rawUserData, // 保留原始数据
			associationList, // 结构化后的数组
			companyList, // 结构化后的数组
			// 下面这些字段如果 MyCard 内部还在用，也要保留
			pinyinName: rawUserData.topUpLevel?.name || rawUserData.topUpLevelName || '',
			titleName: rawUserData.level?.name || rawUserData.levelName || '',
		};
	};

	// --- 4. 计算属性 ---
	const formattedContactInfo = computed(() => {
		if (!userInfo.value) return [];

		const info = [{
				icon: 'phone-filled',
				label: '手机',
				value: userInfo.value.mobile || '未设置'
			},
			{
				icon: 'email-filled',
				label: '邮箱',
				value: userInfo.value.contactEmail || '未设置'
			}
		];
		if (userInfo.value.countryStr) {
			info.push({
				icon: 'map-pin-ellipse', // 使用地图图标
				label: '国家',
				value: userInfo.value.countryStr
			});
		}

		info.push({
			icon: 'location-filled',
			label: '商区',
			value: userInfo.value.locationAddressStr || '未设置'
		});

		info.push({
			icon: 'location-filled',
			label: '家乡',
			value: userInfo.value.nativePlaceStr || '未设置'
		});

		return info;
	});


	const isAnyPopupOpen = computed(() => {
		return isPopupOpen.value || isShareTypePopupOpen.value;
	});

	// 处理新弹窗的状态变化
	const onShareTypePopupChange = (e) => {
		isShareTypePopupOpen.value = e.show;
	};

	
	// --- 5. 分享相关逻辑 ---
	/**
	 * 核心逻辑：6秒后判断身份并弹窗
	 */
	const startGuideTimer = () => {
	    setTimeout(() => {
	        const token = uni.getStorageSync('token');
	        const userInfo = getCachedUserInfo(); 
	
	        // 1. 如果完全没有 token，视为全新户
	        if (!token) {
	            guideScenario.value = 1;
	            if (guidePopupRef.value) guidePopupRef.value.open();
	        } 
	        // 2. 如果有 token 但没有手机号，视为已静默的游客
	        else if (!userInfo || !userInfo.mobile) {
	            guideScenario.value = 2;
	            if (guidePopupRef.value) guidePopupRef.value.open();
	        } 
	        // 3. 如果已绑定手机号，但 isComplete !== 1 (未完善资料)，视为情况3
	        else if (userInfo.isComplete !== 1) {
	            guideScenario.value = 3;
	            if (guidePopupRef.value) guidePopupRef.value.open();
	        }
	        // 4. 其余情况（即 isComplete === 1，已是会员）：直接 return，什么都不弹
	        else {
	            console.log('✅ 用户已完善资料，跳过引导弹窗');
	            return;
	        }
	    }, 6000);
	};

	/**
	 * 打开转发选择弹窗
	 */
	const openShareTypePopup = () => {
		isShareTypePopupOpen.value = true; // 标记打开
		shareTypePopupRef.value.open();
	};

	/**
	 * 处理分享模式选择 (他人名片)
	 */
	const handleShareTypeSelect = (mode) => {
		console.log('用户选择了分享模式:', mode);
		currentShareMode.value = mode;

		// 1. 关闭模式选择弹窗
		if (shareTypePopupRef.value) {
			shareTypePopupRef.value.close();
		}
		isShareTypePopupOpen.value = false; // 立即手动重置标记位

		// 2. 【关键】延迟 300-400ms 执行，避开 uni-popup 关闭动画
		setTimeout(() => {
			// 自动生成初始的自定义标题
			let titlePrefix = mode === 'SELF' ? '【推荐】' : '';
			customShareTitle.value =
				`${titlePrefix}这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

			// 3. 打开自定义内容弹窗
			if (sharePopup.value) {
				sharePopup.value.open();
				isPopupOpen.value = true; // 设置第二个弹窗的标记位
			}
		}, 350);
	};

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

	/**
	 * 监听“分享给好友”
	 * 逻辑：自动识别是按钮触发还是原生菜单触发，并根据 currentShareMode 组装路径
	 */
	onShareAppMessage((res) => {
		// 1. UI 清理：立即关闭所有相关的弹窗
		isPopupOpen.value = false;
		isShareTypePopupOpen.value = false;
		if (sharePopup.value) sharePopup.value.close();
		if (shareTypePopupRef.value) shareTypePopupRef.value.close();

		// 2. 扣减名片分享次数权益（按产品要求，发起分享即视为扣减）
		deductShareQuota();

		// 3. 安全检查：如果用户信息还没加载出来，返回默认标题
		if (!userInfo.value) return {
			title: '名片分享'
		};


		const cardOwnerId = userInfo.value.id; // 当前名片的主人 ID
		const loggedInUserId = uni.getStorageSync('userId'); // 当前执行分享操作的人 ID

		// 4. 确定最终使用的邀请码 (核心逻辑)
		let finalInviteCode = '';

		// 如果是通过页面按钮触发（自发/代发按钮）
		if (res.from === 'button') {
			if (currentShareMode.value === 'SELF') {
				// 【自发模式】：使用当前登录人（分享者）的邀请码
				finalInviteCode = getInviteCode();
				console.log('分享模式：自发(推荐)，使用我的邀请码:', finalInviteCode);
			} else {
				// 【代发模式】：使用名片主人（userInfo）的邀请码
				finalInviteCode = userInfo.value.shardCode;
				console.log('分享模式：代发(原样)，使用TA的邀请码:', finalInviteCode);
			}
		} else {
			// 如果是通过右上角原生菜单触发（默认视为自发推荐）
			finalInviteCode = getInviteCode() || userInfo.value.shardCode;
			console.log('分享模式：原生菜单触发，默认优先使用我的码:', finalInviteCode);
		}

		// 5. 组装分享路径
		// 携带参数：id(名片主), fromShare(来源标记), sharerId(分享人), inviteCode(最终码)
		let sharePath = `/packages/my-businessCard/my-businessCard?id=${cardOwnerId}&fromShare=1`;

		if (loggedInUserId) {
			sharePath += `&sharerId=${loggedInUserId}`;
		}

		if (finalInviteCode) {
			sharePath += `&inviteCode=${finalInviteCode}`;
		}

		// 6. 确定最终标题
		// 如果用户在弹窗里修改了，使用 customShareTitle，否则使用默认文案
		const defaultTitle = `${userInfo.value.realName || userInfo.value.nickname} 的数字名片`;
		const finalTitle = customShareTitle.value || defaultTitle;

		const shareContent = {
			title: finalTitle,
			path: sharePath,
			imageUrl: userInfo.value.avatar, // 使用名片主人的头像作为分享卡片封面
		};

		console.log('🚀 [onShareAppMessage] 最终分享配置:', JSON.stringify(shareContent));

		return shareContent;
	});
	// onShareAppMessage(() => {
	// 	closeSharePopup();

	// 	deductShareQuota();

	// 	if (!userInfo.value) return {
	// 		title: '一张很棒的电子名片'
	// 	};

	// 	const loggedInUserId = uni.getStorageSync('userId');
	// 	const cardOwnerId = userInfo.value.id; // 分享路径中的ID应始终是名片所有者的ID

	// 	const inviteCode = userInfo.value.shardCode;

	// 	let sharePath = `/packages/my-businessCard/my-businessCard?id=${cardOwnerId}&fromShare=1`;
	// 	// 分享者ID是当前登录用户的ID
	// 	if (loggedInUserId) {
	// 		sharePath += `&sharerId=${loggedInUserId}`;
	// 	}

	// 	if (inviteCode) {
	// 		sharePath += `&inviteCode=${inviteCode}`;
	// 	}

	// 	const finalTitle = customShareTitle.value ||
	// 		`这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

	// 	const shareContent = {
	// 		title: finalTitle,
	// 		path: sharePath,
	// 		imageUrl: userInfo.value.avatar,
	// 	};

	// 	// ===================== LOG START: 分享数据 =====================
	// 	console.log('[my-businessCard] 分享好友内容:', JSON.stringify(shareContent));
	// 	// ===================== LOG END ===============================

	// 	return shareContent;
	// });

	// 监听“分享到朋友圈”
	// onShareTimeline(() => {
	// 	hideTimelineGuide();
	// 	if (!userInfo.value) return {
	// 		title: '一张很棒的电子名片'
	// 	};

	// 	const loggedInUserId = uni.getStorageSync('userId');
	// 	const cardOwnerId = userInfo.value.id;

	// 	// 【确认】此逻辑已存在且正确：从名片信息中获取邀请码
	// 	const inviteCode = userInfo.value.shardCode;

	// 	let queryString = `id=${cardOwnerId}&fromShare=1`;
	// 	if (loggedInUserId) {
	// 		queryString += `&sharerId=${loggedInUserId}`;
	// 	}

	// 	// 【确认】此逻辑已存在且正确：将邀请码拼接到 query 字符串中
	// 	if (inviteCode) {
	// 		queryString += `&inviteCode=${inviteCode}`;
	// 	}

	// 	const finalTitle = customShareTitle.value ||
	// 		`这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

	// 	const shareContent = {
	// 		title: finalTitle,
	// 		query: queryString,
	// 		imageUrl: userInfo.value.avatar,
	// 	};

	// 	console.log('[my-businessCard] 生成时间轴共享内容:', JSON.stringify(shareContent));

	// 	return shareContent;
	// });
	// 监听“分享到朋友圈”
	onShareTimeline(() => {
		// 1. 只有点击了我们的引导或原生触发时才会执行
		hideTimelineGuide();

		isPopupOpen.value = false;
		isShareTypePopupOpen.value = false;

		// 2. 核心优化：分享到朋友圈也扣减次数
		deductShareQuota();

		if (!userInfo.value) return {};

		const loggedInUserId = uni.getStorageSync('userId');
		const cardOwnerId = userInfo.value.id;
		const inviteCode = (currentShareMode.value === 'SELF') ? getInviteCode() : userInfo.value.shardCode;

		let queryString = `id=${cardOwnerId}&fromShare=1`;
		if (loggedInUserId) queryString += `&sharerId=${loggedInUserId}`;
		if (inviteCode) queryString += `&inviteCode=${inviteCode}`;

		// 标记当前模式（用于后端统计，如果需要的话）
		queryString += `&m=${currentShareMode.value}`;

		const finalTitle = customShareTitle.value ||
			`这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

		return {
			title: finalTitle,
			query: queryString,
			imageUrl: userInfo.value.avatar,
		};
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
	const openSharePopup = async () => {
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

		// 1. 先检查额度
		await checkShareQuota();

		// 2. 判断额度
		// -1 表示无限次
		if (remainingShareQuota.value !== -1 && remainingShareQuota.value <= 0) {
			uni.showModal({
				title: '分享次数不足',
				content: '您本月的名片分享次数已耗尽。升级会员可获取更多次数。',
				confirmText: '升级会员',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/packages/recharge/recharge?type=membership'
						});
					}
				}
			});
			return;
		}

		// 3. 额度充足，打开弹窗
		currentShareMode.value = 'SELF'; // 自己分享自己一定是 SELF 模式
		customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
		sharePopup.value.open();
		isPopupOpen.value = true;
	};
	const closeSharePopup = () => {
		sharePopup.value.close();
		isPopupOpen.value = false; // 标记弹窗关闭
	};
	const guideShareTimeline = () => {
		closeSharePopup(); // 这会自动把 isPopupOpen 设为 false

		// deductShareQuota();
		isPopupOpen.value = false;

		showTimelineGuide.value = true; // 引导层 z-index 很高，通常没问题
	};

	// 监听 popup 的 change 事件 (防止用户点击遮罩层关闭时状态没同步)
	const onPopupChange = (e) => {
		isPopupOpen.value = e.show;
	}

	const hideTimelineGuide = () => showTimelineGuide.value = false;

	/**
	 * 处理跳转到商友圈页面的事件
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

	const goToLogin = () => {
		uni.reLaunch({
			url: '/pages/index/index'
		});
	};

	const goToHome = () => {
		uni.switchTab({
			url: '/pages/home/home'
		});
	};

	/**
	 * [方法] 处理：加入TA圈 (申请入圈)
	 */
	const handleAddCircle = () => {
		const user = {
			id: userInfo.value.id,
			name: userInfo.value.realName || userInfo.value.nickname
		};
		addCirclePopup.value.open(user);
	};

	/**
	 * [方法] 处理：邀入我圈 (邀请入圈)
	 */
	const handleInviteCircle = () => {
		const user = {
			id: userInfo.value.id,
			name: userInfo.value.realName || userInfo.value.nickname
		};
		inviteCirclePopup.value.open(user);
	};

	/**
	 * [方法] 社交操作成功后的回调
	 */
	const onSocialActionSuccess = (targetId) => {
		console.log('社交操作成功，目标用户ID:', targetId);
		// 可根据业务需求在此处刷新用户信息或更新本地状态
		// initializePage(fromShare.value); 
	};

	/**
	 * 提交申请接口 (逻辑与首页一致)
	 */
	const submitApplyCircle = async (targetUserId) => {
		uni.showLoading({
			title: '申请中...'
		});
		try {
			const url = `/app-api/member/user/friend/apply/${targetUserId}`;
			const {
				error
			} = await request(url, {
				method: 'POST'
			});

			if (!error) {
				uni.showToast({
					title: '申请已发送',
					icon: 'success'
				});
				// 可选：申请成功后，是否需要更新按钮状态？
				// 如果后端没有立即改变 isFriend 状态（需要审核），则按钮保持原样或变为“已申请”
			} else {
				uni.showToast({
					title: error || '申请失败',
					icon: 'none'
				});
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
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
		/* 防止被底部操作栏遮挡 */
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
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

	/* 悬浮分享按钮 (由于有了底部操作栏，这个按钮可以考虑移除，或者仅在某些场景显示) */
	/* 目前暂时隐藏，避免与底部栏冲突 */
	.share-fab {
		display: none;
		/* 
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
		*/
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

	/* ==================== 底部操作栏样式 ==================== */
	.footer-action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
		box-sizing: border-box;
		transition: z-index 0.1s;
	}

	/* 弹窗打开时降低层级 */
	.footer-action-bar.z-index-low {
		z-index: -1 !important;
		opacity: 0;
		pointer-events: none;
		/* 禁止点击 */
	}

	.action-group {
		display: flex;
		gap: 16rpx;
		align-items: center;
		width: 100%;
	}

	.btn-share-mini {
		flex: 0 0 88rpx !important;
		/* 不伸缩，固定宽度 */
		background-color: #f5f5f5 !important;
		padding: 0 !important;
		margin-right: 10rpx;
	}

	.action-group {
		display: flex;
		gap: 20rpx;
		/* 稍微缩小间距 */
		align-items: center;
		width: 100%;
	}

	.btn-share-orange {
		flex: 0 0 88rpx !important;
		/* 固定宽度，不参与平分 */
		height: 88rpx !important;
		background: linear-gradient(to right, #FF8C00, #FF6B00) !important;
		/* 明显的橙色渐变 */
		padding: 0 !important;
		border-radius: 50rpx !important;
		/* 稍微方一点的圆角，更显商务 */
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
	}


	.btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 28rpx;
		font-weight: 600;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;

		&::after {
			border: none;
		}
	}

	.btn-block {
		width: 100%;
		/* 独占一行 */
	}

	/* 样式变体 */
	.btn-primary {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);

		&:active {
			opacity: 0.9;
		}
	}

	.smart-share-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 120rpx;
		height: 88rpx;
		border: 2rpx solid #FF6A00;
		border-radius: 16rpx;
		background: #fff;

		text {
			font-size: 18rpx;
			color: #FF6A00;
			font-weight: bold;
			margin-top: 4rpx;
		}
	}

	.btn-ghost-primary {
		background: rgba(255, 106, 0, 0.05);
		color: #FF6A00;
		border: 2rpx solid rgba(255, 106, 0, 0.2);
	}

	.btn-secondary {
		/* 将原来的灰色背景替换为绿色渐变 */
		background: linear-gradient(to right, #4cd964, #34a853);
		/* 文字颜色改为白色以适应深色背景 */
		color: #fff;
		// border: 1rpx solid #e4e7ed;

		&:active {
			background-color: #eef0f4;
		}
	}

	.btn-success {
		background-color: #52c41a;
		/* 绿色 */
		color: white;
		opacity: 0.8;
		/* 稍微淡一点表示状态 */
	}

	.btn .uni-icons {
		margin-right: 8rpx;
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