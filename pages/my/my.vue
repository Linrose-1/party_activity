<template>
	<view class="container">
		<!-- ==================== 数字身份模块 ==================== -->
		<view class="user-header">
			<!-- 模块标题与操作按钮 -->
			<view class="section-header">
				<text class="section-title-main white-text">数字身份</text>
				<!-- 【优化 2】只有登录后才显示操作按钮，并去掉了 "查看" -->
				<view class="header-actions" v-if="isLogin">
					<text class="header-action-btn" @tap="onEdit"> >>> </text>
				</view>
			</view>

			<!-- 根据登录状态显示不同内容 -->
			<template v-if="isLogin">
				<!-- 用户信息主体 -->
				<!-- 整个区域可点击，跳转到编辑资料 -->
				<view class="user-info-wrapper" @tap="onViewAccountDetail">
					<view class="user-info-main">
						<!-- 头像区域 -->
						<view class="avatar" @click.stop="onEdit">
							<image class="avatar-img"
								:src="userInfo.avatar || '../../static/images/default-avatar.png'" />
						</view>
						<view class="user-details">
							<view class="user-name">
								<!-- 将昵称文本包裹起来 -->
								<text class="nickname-text">{{ userInfo.nickname || '未设置昵称' }}</text>
								<text class="badge"
									v-if="userInfo.topUpLevel && userInfo.topUpLevel.name">{{ userInfo.topUpLevel.name }}</text>
								<text class="badge social-badge" v-if="userInfo.level && userInfo.level.name">
									{{ userInfo.level.name }}
								</text>
							</view>
							<view v-if="userInfo.nickname === '微信用户'" class="edit-prompt-tip" @click="onEdit">
								点击设置个性化昵称 >
							</view>
							<!-- 【优化 1】分行显示商协会职务和公司/职务 -->
							<view class="user-title">{{ userProfessionalTitleDisplay }}</view>
							<view class="user-company">{{ userCompanyAndPositionDisplay }}</view>
							<view class="user-company" style="margin-top: 8rpx;">
								我的邀请人：<span style="font-weight: bold;">{{ userInfo.parentName || '无' }}</span>
							</view>
						</view>
					</view>
					<text v-if="userInfo.id" class="user-id-display">ID: {{ userInfo.virtualId }}</text>
				</view>

				<!-- 【优化 3】账户信息网格，现在会有 5 项 -->
				<view class="account-grid">
					<view class="account-item" v-for="item in accountList" :key="item.label"
						@tap.stop="navigateToAccountDetail(item)">
						<view class="account-value">{{ item.value }}</view>
						<view class="account-label">{{ item.label }}</view>
					</view>
				</view>
			</template>

			<!-- 如果未登录，显示登录提示 (此部分无变化) -->
			<template v-else>
				<!-- 将点击事件移动到最外层容器上 -->
				<view class="login-prompt" @click="handleLoginClick">
					<!-- 头像图标 -->
					<view class="login-prompt-avatar">
						<uni-icons type="person-filled" size="30" color="#FF8C00"></uni-icons>
					</view>

					<!-- 登录提示文字 -->
					<view class="login-prompt-text">点击去登录</view>

					<!-- 右侧箭头 -->
					<view class="login-prompt-arrow">›</view>
				</view>
			</template>
		</view>

		<!-- ==================== 名片分享模块 ==================== -->
		<!-- <view class="card-section">
			<view class="section-header">
				<text class="section-title-main">名片分享</text>
				<text class="view-all" @tap="onViewDetail">分享 ›</text>
			</view>
			<view class="ai-card">
				<view class="qrcode-section" @tap="onViewDetail">
					<text class="qrcode-title">微信二维码 - 扫码添加好友</text>
					<view class="qrcode-container">
						<image class="qrcode-img"
							:src="userInfo.wechatQrCodeUrl || '../../static/images/default-qrcode.png'" />
					</view>
				</view>
				<view class="contact-info">
					<view class="contact-item" @tap="copyToClipboard(userInfo.shardCode)">
						<text class="iconfont">我的邀请码：</text>
						<text style="font-weight: bold;">{{ userInfo.shardCode || '暂无' }}</text>
						<text class="copy-btn">复制</text>
					</view>
				</view>
			</view>
		</view> -->

		<!-- ==================== 社交资产模块 ==================== -->
		<view class="core-features-section">
			<view class="section-header">
				<text class="section-title-main">社交资产</text>
			</view>
			<!-- 网格容器 -->
			<view class="core-features-grid">
				<!-- 使用 v-for 循环生成网格项 -->
				<view class="core-feature-grid-item" v-for="item in coreFeatures" :key="item.name"
					@tap="navigateToCoreFeature(item)">
					<!-- 上：标题 -->
					<view class="grid-item-name">{{ item.name }}</view>
					<!-- 中：图标 -->
					<view class="icon-wrapper">
						<image :src="item.icon" class="feature-icon" mode="aspectFit" />
					</view>
					<!-- 下：描述 -->
					<view class="grid-item-desc">{{ item.desc }}</view>
				</view>
			</view>
		</view>

		<!-- ==================== 功能中心模块 ==================== -->
		<view class="features-section">
			<view class="section-header">
				<text class="section-title-main">创享中心</text>
			</view>
			<view class="features-list">
				<view class="feature-item" v-for="item in featureList" :key="item.name"
					:class="{ 'full-width': item.fullWidth }" @tap="navigateToFeature(item)">
					<!-- 增加一个 inner 容器 -->
					<view class="feature-item-inner">
						<img :src="item.icon" alt="" class="feature-icon" />
						<view class="feature-content">
							<view class="feature-name">{{ item.name }}</view>
							<view class="feature-desc">{{ item.desc }}</view>
						</view>
						<text class="chevron-icon">›</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed // 引入 computed
	} from 'vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'; // 引入 onLoad
	import request from '../../utils/request.js';
	import {
		checkLoginGuard
	} from '../../utils/user.js';

	onMounted(() => {
		getUserInfo();
	});

	onLoad(() => {
		getUserInfo();
	});

	onShow(() => {
		checkLoginStatusAndFetchData();

	});

	const userInfo = ref({})
	const isLogin = ref(false);

	// 【新增】一个整合的函数，用于检查登录状态并获取数据
	const checkLoginStatusAndFetchData = () => {
		const token = uni.getStorageSync('token'); // 或者检查 userId
		if (token) {
			isLogin.value = true;
			// 只有登录了才去获取用户信息
			getUserInfo();
		} else {
			isLogin.value = false;
			// 未登录时，清空旧的用户信息，防止显示上个用户的数据
			userInfo.value = {};
		}
	};

	//获取用户的基本信息
	const getUserInfo = async () => {
		try {
			// 【优化】只有在 isLogin 为 true 时才发请求，双重保险
			if (!isLogin.value) return;

			const {
				data,
				error
			} = await request('/app-api/member/user/get', {
				method: 'GET',
			});
			if (!error && data) {
				userInfo.value = data;
				console.log('getUserInfo userInfo:', userInfo.value);
			} else {
				console.log('获取用户信息失败:', error);
				// 如果获取用户信息失败（比如token过期），也应该更新为未登录状态
				isLogin.value = false;
				userInfo.value = {};
			}
		} catch (err) {
			console.log('请求异常:', err);
			isLogin.value = false;
			userInfo.value = {};
		}
	};

	// 使用 computed 创建动态的账户信息列表
	const accountList = computed(() => {
		const user = userInfo.value;
		return [{
				value: user.activityCount || 0,
				label: '我的聚会',
				path: '/packages/my-active/my-active'
			},
			{
				value: user.postCount || 0,
				label: '我的商机',
				path: '/pages/my-opportunity/my-opportunity'
			},
			{
				value: user.currExperience || 0,
				label: '我的贡分',
				path: '/packages/my-points/my-points'
			},
			{
				value: user.point || 0,
				label: '我的智米',
				path: '/packages/my-zhimi/my-zhimi'
			},
			{
				value: '--', // 或者 '查看'，或其他占位符
				label: '猩球信用',
				path: null // 使用 null 作为特殊标记
			}
		]
	})

	// 显示商协会职务
	const userProfessionalTitleDisplay = computed(() => {
		if (!isLogin.value) return '登录后查看';
		const titles = userInfo.value.professionalTitle; // e.g., "XXX协会会长,it工作者"
		if (titles) {
			return titles.split(',')[0].trim();
		}
		return '暂未设置商协会职务';
	});

	// 显示公司和职位
	const userCompanyAndPositionDisplay = computed(() => {
		if (!isLogin.value) return ''; // 如果上一行是默认文本，这一行可以留空

		const companies = userInfo.value.companyName; // e.g., "公司一,公司2"
		const positions = userInfo.value.positionTitle; // e.g., "总裁,总裁"

		let firstCompany = '';
		if (companies) {
			firstCompany = companies.split(',')[0].trim();
		}

		let firstPosition = '';
		if (positions) {
			firstPosition = positions.split(',')[0].trim();
		}

		if (firstCompany && firstPosition) {
			return `${firstCompany} | ${firstPosition}`;
		}

		return firstCompany || firstPosition || '暂未设置公司和职位';
	});

	// 【优化 3】修改跳转逻辑，处理 "互动信息" 的点击事件
	const navigateToAccountDetail = async (item) => {
		if (!await checkLoginGuard()) return;
		if (item && item.path) {
			uni.navigateTo({
				url: item.path
			});
		} else if (item && item.label === '互动信息') {
			// 如果点击的是 "互动信息"，则弹出提示
			uni.showToast({
				title: '该功能正在开发中',
				icon: 'none'
			});
			// console.log('该功能正在开发'); // 或者使用 console.log 打印
		}
	};


	// 使用 computed 优雅地处理职位和公司的显示逻辑
	// 【优化】处理未登录时的情况
	// const userTitleAndCompany = computed(() => {
	// 	// 1. 未登录时的判断保持不变
	// 	if (!isLogin.value) return '登录后查看';

	// 	// 2. 【核心修改】从完整的字符串中提取第一项
	// 	const titlesString = userInfo.value.professionalTitle; // e.g., "XXX协会会长,it工作者"
	// 	const companiesString = userInfo.value.companyName; // e.g., "公司一,公司2"

	// 	let firstTitle = '';
	// 	// 如果 professionalTitle 存在，则分割字符串并取第一个元素
	// 	if (titlesString) {
	// 		firstTitle = titlesString.split(',')[0].trim();
	// 	}

	// 	let firstCompany = '';
	// 	// 如果 companyName 存在，则分割字符串并取第一个元素
	// 	if (companiesString) {
	// 		firstCompany = companiesString.split(',')[0].trim();
	// 	}

	// 	// 3. 根据提取出的第一项进行拼接
	// 	if (firstTitle && firstCompany) {
	// 		return `${firstTitle} | ${firstCompany}`;
	// 	}

	// 	// 4. 如果只有一个存在，或都为空，则返回存在的那个或默认文本
	// 	return firstTitle || firstCompany || '暂未设置职位和公司';
	// });

	const coreFeatures = ref([{
			name: '商友邀请',
			desc: '您的商脉金库',
			icon: '../../static/icon/商友邀请.png',
			iconBg: 'linear-gradient(135deg, #00DBDE, #FC00FF)',
			path: '/packages/my-friendInvitation/my-friendInvitation'
		},
		{
			name: '社交互动',
			desc: '您的互动信息',
			icon: '../../static/icon/社交互动.png',
			iconBg: 'linear-gradient(135deg, #4158D0, #C850C0)',
			// key: 'membershipCenter'
			path: '/packages/social-interaction/social-interaction'
		},
		{
			name: '用户中心',
			desc: '您的用户等级',
			icon: '../../static/icon/会员中心.png',
			iconBg: 'linear-gradient(135deg, #FFD700, #FFA500)',
			// key: 'membershipCenter'
			path: '/packages/my-member/my-member'
		},
		{
			name: '名片分享',
			desc: '连接精英商友',
			icon: '../../static/icon/我的名片.png',
			iconBg: 'linear-gradient(135deg, #30CFD0, #330867)',
			path: '/packages/my-businessCard/my-businessCard'
		},

		{
			name: '猩球榜单',
			desc: '猩球贡献榜单',
			icon: '../../static/icon/注册.png',
			iconBg: 'linear-gradient(135deg, #30CFD0, #330867)',
			key: 'membershipCenter'
			// path: '/pages/index/index'
		},
		// {
		// 	name: '精准投放',
		// 	desc: '广告精准触达',
		// 	icon: '../../static/icon/广告投放.png',
		// 	iconBg: 'linear-gradient(135deg, #FAD961, #F76B1C)',
		// 	key: 'precisionTargeting'
		// }
	]);


	//  "人脉金库" 模块的跳转逻辑处理
	const navigateToCoreFeature = async (item) => {
		if (!await checkLoginGuard()) return;
		// 优先处理有特殊 key 的项
		if (item.key) {
			switch (item.key) {
				case 'digitalIdentity':
					// 需要拼接用户ID
					if (userInfo.value && userInfo.value.id) {
						uni.navigateTo({
							url: `/packages/my-account-informationDetails/my-account-informationDetails?id=${userInfo.value.id}`
						});
					} else {
						uni.showToast({
							title: '无法获取用户信息',
							icon: 'none'
						});
					}
					return;
				case 'precisionTargeting':
				case 'membershipCenter': // 会员中心也暂时作为开发中
					uni.showToast({
						title: '该功能正在开发中',
						icon: 'none'
					});
					return;
			}
		}

		// 对于有 path 的项，直接跳转
		if (item.path) {
			uni.navigateTo({
				url: item.path
			});
		}
	};

	const featureList = ref([
		// 第 1 行
		// {
		// 	name: '我的商机',
		// 	desc: '查看您发布的商机内容',
		// 	icon: '../../static/icon/商机.png',
		// 	path: '/pages/my-opportunity/my-opportunity'
		// },
		// {
		// 	name: '我的聚会',
		// 	desc: '已报名/已发布的聚会',
		// 	icon: '../../static/icon/聚会.png',
		// 	path: '/packages/my-active/my-active'
		// },
		// 第 2 行
		{
			name: '我的推荐',
			desc: '查看您的推荐聚店信息',
			icon: '../../static/icon/推荐.png',
			path: '/pages/my-shopRecommend/my-shopRecommend'
		},
		{
			name: '我的聚店',
			desc: '查看您的所有聚店信息',
			icon: '../../static/icon/店铺.png',
			path: '/pages/my-shop/my-shop'
		},
		// 第 3 行
		{
			name: '我的收藏',
			desc: '查看您收藏的聚会和商机',
			icon: '../../static/icon/收藏.png',
			path: '/packages/my-collection/my-collection'
		},
		{
			name: '我的关注',
			desc: '查看您关注的商友信息',
			icon: '../../static/icon/加关注.png',
			path: '/pages/my-follow/my-follow'
		},
		// 第 4 行
		{
			name: '我的订单',
			desc: '查看您的所有支付订单信息',
			icon: '../../static/icon/订单.png',
			path: '/pages/my-order/my-order'
		},
		{
			name: '我的券包',
			desc: '查看您的猩友优惠券',
			icon: '../../static/icon/我的券包.png',
			path: null
		},
		{
			name: '时空共享',
			desc: '一键共享创业社交空间',
			icon: '../../static/icon/时空共享.png',
			path: null
		}, // 新增
		{
			name: '我的评论',
			desc: '查看对您发布的评论信息',
			icon: '../../static/icon/我的评论.png',
			path: null
		}, // 新增
		// 第 5 行
		// {
		// 	name: '邀请注册',
		// 	desc: '连接全球精英商友',
		// 	icon: '../../static/icon/精准投放.png',
		// 	path: '/pages/index/index'
		// }, // 新增

		{
			name: '资源匹配',
			desc: '智能匹配供需资源对应的商友',
			icon: '../../static/icon/资源匹配.png',
			path: null
		}, // 新增
		{
			name: '数字营销',
			desc: '广告精准触达',
			icon: '../../static/icon/广告投放2.0.png',
			path: null
		},
		// 第 6 行
		{
			name: '系统共建',
			desc: '提供您对本平台的建议',
			icon: '../../static/icon/系统建议.png',
			path: '/packages/my-systemConstruction/my-systemConstruction'
		},
		{
			name: '用户协议',
			desc: '查看用户协议、隐私协议等',
			icon: '../../static/icon/protocols.png',
			path: '/pages/user-agreement/user-agreement'
		},
		{
			name: '平台客服',
			desc: '联系我们，获取帮助',
			icon: '../../static/icon/customer-service.png', // 假设您有一个客服图标
			path: null, // path 为 null, 我们将通过 key 来特殊处理
			key: 'customerService', // 定义一个唯一的 key
			phone: '18024545855', // 【请在这里替换成您的真实客服电话】
			fullWidth: true
		},
		// 单独成行
		{
			name: '平台认证',
			desc: '通过认证，开启更多功能',
			icon: '../../static/icon/平台认证.png',
			path: '/pages/my-auth/my-auth',
			fullWidth: true
		} // 新增，带特殊标记
	]);

	const navigateToFeature = async (item) => {
		if (!await checkLoginGuard()) return;
		// 1. 优先处理有特殊 key 的项
		if (item && item.key === 'customerService') {
			// 检查电话号码是否存在
			if (!item.phone) {
				uni.showToast({
					title: '客服电话未设置',
					icon: 'none'
				});
				return;
			}
			// 调用 uni-app 的拨打电话 API
			uni.makePhoneCall({
				phoneNumber: item.phone,
				success: () => {
					console.log('拨打电话成功');
				},
				fail: (err) => {
					console.log('拨打电话失败:', err);
					// 用户取消拨打也会进入 fail 回调，可以不做提示
				}
			});
			// 执行完后结束函数
			return;
		}

		// 2. 处理有 path 的普通跳转项 (保持原有逻辑)
		if (item && item.path) {
			uni.navigateTo({
				url: item.path
			});
		}
		// 3. 处理其他开发中的项 (保持原有逻辑)
		else {
			uni.showToast({
				title: '该功能正在开发中',
				icon: 'none'
			});
		}
	};


	const onEdit = async () => {
		if (!await checkLoginGuard()) return;

		uni.navigateTo({
			// url: '/packages/my-edit/my-edit'
			url: `/packages/my-account-informationDetails/my-account-informationDetails?id=${userInfo.value.id}`
		})
	}

	const onViewAccountDetail = async () => {
		if (!await checkLoginGuard()) return;

		uni.navigateTo({
			url: '/packages/my-edit/my-edit'
		});
	}


	const copyToClipboard = async (text) => {
		if (!await checkLoginGuard()) return;
		if (!text) {
			uni.showToast({
				title: '没有可复制的内容',
				icon: 'none'
			});
			return;
		}
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'none'
				})
			}
		})
	}

	const saveQrcode = () => {
		uni.showToast({
			title: '二维码已保存',
			icon: 'none'
		})
	}

	const shareQrcode = () => {
		uni.showToast({
			title: '二维码已分享',
			icon: 'none'
		})
	}

	// 处理点击登录区域的逻辑
	const handleLoginClick = async () => {
		// 调用智能守卫
		// 1. 如果是老用户：守卫内部会静默登录 -> 存Token -> 返回 true
		// 2. 如果是新用户：守卫内部会弹窗 -> 用户点去登录 -> 跳转 -> 返回 false
		const isLoggedIn = await checkLoginGuard();

		if (isLoggedIn) {
			// 守卫返回 true，说明找回了老用户身份，且本地 Token 已更新
			// 此时我们需要刷新一下当前页面的 UI（头像、昵称等）
			uni.showToast({
				title: '欢迎回来',
				icon: 'success'
			});

			// 刷新数据
			isLogin.value = true;
			getUserInfo(); // 重新获取并渲染用户信息
		}
	};

	const skipToLogin = async () => {
		const token = uni.getStorageSync("token")
		console.log("asdasdasd", !token)
		if (!token) {
			try {
				wx.showLoading({
					title: '登录中，请稍后...',
					mask: true // 防止用户重复点击
				});
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
		} else {
			wx.showModal({
				title: '用户未注册',
				content: '点击确定即可跳转注册页面',
				showCancel: false, // 隐藏取消按钮
				confirmText: '确定',
				success: (res) => {
					uni.navigateTo({
						url: '/pages/index/index'
						// url: '/pages/login/login'
					})
				}
			});
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
			wx.hideLoading();
		} else {
			// currentUserInfo.value = data;
			// console.log("首页实时获取用户信息成功:", currentUserInfo.value);
			// // 【重要】获取成功后，用新数据更新本地缓存
			uni.setStorageSync('userInfo', JSON.stringify(data));
			console.log("mobile", data.mobile)
			if (!data.mobile) {
				wx.showModal({
					title: '用户未注册',
					content: '点击确定即可跳转注册页面',
					showCancel: false, // 隐藏取消按钮
					confirmText: '确定',
					success: (res) => {
						uni.navigateTo({
							url: '/pages/index/index'
							// url: '/pages/login/login'
						})
					}
				});
				wx.hideLoading();
			} else {
				wx.showModal({
					title: '登录成功',
					content: '点击确定即可跳转主页',
					showCancel: false, // 隐藏取消按钮
					confirmText: '确定',
					success: (res) => {
						uni.switchTab({
							url: '/pages/home/home' // 【重要】首页是Tab页，必须用 switchTab
						});
					}
				});
				wx.hideLoading();
			}
		}
		wx.hideLoading();
	};
</script>

<style scoped>
	/* --- 页面基础 --- */
	.container {
		padding: 30rpx;
		background-color: #f9f9f9;
	}

	/* --- 1. 数字身份模块 (user-header) --- */
	.user-header {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		padding: 30rpx;
		border-radius: 20rpx;
		color: white;
		display: flex;
		flex-direction: column;
		margin-bottom: 30rpx;
	}

	/* 1.1 模块头部：标题与操作按钮 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		width: 100%;
	}

	.section-title-main {
		font-size: 32rpx;
		font-weight: bold;
		color: #FF8000;
	}

	.white-text {
		color: white;
	}

	.header-actions {
		display: flex;
		gap: 20rpx;
	}

	.header-action-btn {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.2);
		padding: 8rpx 18rpx;
		border-radius: 30rpx;
	}

	/* ==================== 【【【核心修复】】】 ==================== */
	/* 1.2 用户信息主体 */
	.user-info-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		/* (1) 关键：改为垂直堆叠 */
	}

	.user-info-main {
		display: flex;
		align-items: center;
		width: 100%;
		/* 确保 main 部分撑满宽度 */
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 10rpx;
		overflow: hidden;
		margin-right: 30rpx;
		flex-shrink: 0;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-details {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		/* 【新增】确保父容器也能处理溢出 */
		overflow: hidden;
		gap: 10rpx;
	}

	/* 【新增】专门为昵称文本添加截断样式 */
	.nickname-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		/* 【关键】让它可以被压缩，给徽章留出空间 */
		flex-shrink: 1;
		min-width: 0;
		/* 配合 flex-shrink */
	}

	.badge {
		background: #ffd700;
		color: #8a6d00;
		padding: 6rpx 14rpx;
		border-radius: 20rpx;
		/* margin-left: 10rpx; */
		font-size: 22rpx;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.social-badge {
		background: #e0f2fe;
		/* 一个柔和的蓝色 */
		color: #0c5494;
		/* 深蓝色文字 */
	}

	.user-title,
	.user-company {
		font-size: 24rpx;
		margin-top: 6rpx;
		opacity: 0.9;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-id-display {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
		background-color: rgba(0, 0, 0, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 10rpx;
		align-self: flex-end;
		/* (2) 关键：使其在自己的行内靠右 */
		margin-top: 10rpx;
		/* (3) 关键：与上方信息拉开距离 */
	}

	/* ========================================================== */

	/* 1.3 账户信息网格 */
	.account-grid {
		display: grid;
		/* 【优化 3】关键样式修改：从 4 列改为 5 列 */
		grid-template-columns: repeat(5, 1fr);
		gap: 10rpx;
		/* 可以适当减小间距以容纳更多项 */
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 1rpx solid rgba(255, 255, 255, 0.2);
	}

	.account-item {
		text-align: center;
		padding: 10rpx 0;
		border-radius: 12rpx;
		transition: background-color 0.2s;
	}

	.account-item:active {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.account-value {
		font-size: 34rpx;
		/* 可以适当减小字体大小 */
		color: #fff;
		font-weight: bold;
	}

	.account-label {
		font-size: 22rpx;
		/* 可以适当减小字体大小 */
		color: rgba(255, 255, 255, 0.8);
	}

	/* 1.4 未登录状态 */
	/* 1.4 未登录状态 */
	.login-prompt {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
	}

	.login-prompt-avatar {
		width: 140rpx;
		/* 保持原样 */
		height: 140rpx;
		/* 保持原样 */
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		flex-shrink: 0;
		/* 防止被压缩 */
	}

	/* 登录提示文字样式 */
	.login-prompt-text {
		font-size: 36rpx;
		font-weight: bold;
		color: white;
	}

	/* 右箭头样式，使用 margin-left: auto 自动推到最右侧 */
	.login-prompt-arrow {
		margin-left: auto;
		font-size: 40rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	/* --- 2. 名片分享模块 (card-section) --- */
	/* .card-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.card-section .section-header {
		margin-bottom: 20rpx;
	}

	.view-all {
		font-size: 26rpx;
		padding: 8rpx 18rpx;
		border-radius: 30rpx;
		background: #f5f5f5;
		color: #666;
	}

	.ai-card {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		padding: 30rpx;
		border-radius: 20rpx;
		color: white;
	}

	.qrcode-section {
		text-align: center;
		color: white;
	}

	.qrcode-title {
		font-size: 26rpx;
		margin-bottom: 20rpx;
	}

	.qrcode-container {
		width: 200rpx;
		height: 200rpx;
		margin: 0 auto;
		background: white;
		padding: 10rpx;
		border-radius: 12rpx;
		margin-top: 20rpx;
	}

	.qrcode-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.contact-info {
		display: grid;
		grid-template-columns: 1fr;
		gap: 15rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 20rpx;
		border-radius: 20rpx;
		margin: 30rpx 0;
	}

	.contact-item {
		display: flex;
		align-items: center;
		font-size: 26rpx;
	}

	.copy-btn {
		margin-left: auto;
		font-size: 24rpx;
		color: #fff;
		background: rgba(255, 255, 255, 0.3);
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
		flex-shrink: 0;
	} */

	/* --- 【【【新增】】】 人脉金库模块样式 --- */
	.core-features-section {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.core-features-section .section-header {
		margin-bottom: 30rpx;
	}

	/* 网格布局容器 */
	.core-features-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 20rpx;
	}

	/* 单个网格项 */
	.core-feature-grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		border-radius: 18rpx;
		background-color: #f8f9fa;
		text-align: center;
		transition: transform 0.2s ease-in-out;
	}

	.core-feature-grid-item:active {
		transform: scale(0.95);
	}

	/* 上：标题 */
	.grid-item-name {
		font-size: 26rpx;
		color: #333;
		font-weight: 800;
	}

	/* 【核心修改 ①】: 图标的父容器，现在只负责定义尺寸和形状 */
	.core-feature-grid-item .icon-wrapper {
		width: 90rpx;
		height: 90rpx;
		margin: 16rpx 0;
		flex-shrink: 0;
		/* 移除所有背景和阴影相关的样式 */
		/* background: ...; (已删除) */
		/* box-shadow: ...; (已删除) */
		/* border-radius: 50%; (保留或删除均可，因为 image 会覆盖它) */
	}

	/* 【核心修改 ②】: 图标本身，让它撑满父容器 */
	.core-feature-grid-item .feature-icon {
		width: 100%;
		/* 宽度撑满父容器 */
		height: 100%;
		/* 高度撑满父容器 */
		/* object-fit: contain;  在 uni-app 的 image 组件中，通常由 template 里的 mode="aspectFit" 控制，
			                            但加上这行可以作为双重保险，确保在 web 端也表现一致 */
	}

	/* 下：描述 */
	.grid-item-desc {
		font-size: 18rpx;
		color: #999;
	}

	/* --- 3. 功能中心模块 (features-section) --- */
	.features-section {
		background: #fff;
		padding: 30rpx 20rpx;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.features-section .section-header {
		padding: 0 10rpx;
	}

	.features-list {
		margin-top: 30rpx;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
	}

	.feature-item {
		display: flex;
		flex-direction: column;
		/* 改为垂直布局，方便内容对齐 */
		justify-content: center;
		/* 垂直居中内容 */
		background: #f7f8fa;
		padding: 30rpx 20rpx;
		border-radius: 20rpx;
		transition: background-color 0.2s;
		box-sizing: border-box;
		min-width: 0;
		/* 【推荐】增加最小高度，确保所有卡片视觉上等高 */
		min-height: 180rpx;
	}

	/* 将内容重新包装一下，以便使用 flex-start 对齐 */
	.feature-item-inner {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.feature-item:active {
		background-color: #eff0f2;
	}

	.feature-item.full-width {
		grid-column: 1 / -1;
		background: linear-gradient(135deg, #fef9e7, #fdf2e9);
		/* 单独成行的可以不那么高 */
		min-height: auto;
		flex-direction: row;
		/* 单独成行的恢复水平布局 */
	}

	.feature-icon {
		width: 60rpx;
		height: 60rpx;
		margin-right: 20rpx;
	}

	.feature-content {
		flex: 1;
		min-width: 0;
	}

	.feature-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
		/* 给标题和描述之间增加一点间距 */
	}

	/* 【【【核心修改】】】 */
	.feature-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.4;
		/* 设置合适的行高 */

		/* 移除强制单行 */
		/* white-space: nowrap; */

		/* 实现最多两行文本截断 */
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		/* 限制在一个块元素显示的文本的行数 */
		-webkit-box-orient: vertical;
	}

	.chevron-icon {
		font-size: 30rpx;
		color: #ccc;
		margin-left: auto;
	}
</style>