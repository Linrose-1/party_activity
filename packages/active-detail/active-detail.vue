<template>
	<!-- 使用 v-if 确保在数据加载完成后再渲染主要内容，避免闪烁和错误 -->
	<view v-if="activityDetail" class="page">

		<!-- 聚会封面 -->
		<view class="banner-section">
			<!-- 如果有图片才显示 swiper -->
			<swiper v-if="bannerImages.length > 0" class="banner-swiper" circular indicator-dots autoplay
				:interval="4000" :duration="500">
				<swiper-item v-for="(img, index) in bannerImages" :key="index">
					<image :src="img" class="banner-image" mode="aspectFill" @click="previewBanner(index)" />
				</swiper-item>
			</swiper>

			<!-- 默认占位图 (防止没有图片时塌陷) -->
			<view v-else class="banner-placeholder">
				<uni-icons type="image" size="40" color="#ccc"></uni-icons>
			</view>

			<!-- 标签浮层 (保持在轮播图之上) -->
			<view class="tags-overlay" v-if="activityDetail.tags && activityDetail.tags.length > 0">
				<text class="event-cover-text">{{ activityDetail.tags.join(' · ') }}</text>
			</view>
		</view>

		<!-- 聚会状态显示 -->
		<view v-if="statusInfo.text" class="status-banner" :style="{ backgroundColor: statusInfo.color }">
			{{ statusInfo.text }}
		</view>

		<!-- 最低起聚名额提示 -->
		<view v-if="showLimitSlotsTip" class="limit-slots-tip">
			<uni-icons type="info-filled" color="#e6a23c" size="16" style="margin-right: 10rpx;"></uni-icons>
			当前报名人数未达到最低起聚名额 ({{ activityDetail.limitSlots }}人)，聚会可能被取消；若有收费聚会组织者将退回报名费用。
		</view>

		<!-- 聚会信息 -->
		<view class="event-header">
			<!-- 动态绑定聚会标题 -->
			<text class="event-title">{{ activityDetail.activityTitle }}</text>
			<view class="event-meta">
				<uni-icons type="calendar" size="18" color="#FF6B00" />
				<!-- 动态绑定格式化后的聚会时间 -->
				<text>{{ formattedActivityTime }}</text>
			</view>
			<view class="event-meta">
				<uni-icons type="location" size="18" color="#FF6B00" />
				<!-- 动态绑定聚会地点 -->
				<text>{{ activityDetail.locationAddress }}</text>
			</view>
			<view class="event-stats">
				<view class="stat-item">
					<!-- 动态绑定已报名人数 -->
					<view class="stat-value">{{ participantTotal || 0 }}</view>
					<view class="stat-label">已报名</view>
				</view>
				<view class="stat-item">
					<!-- 动态绑定总名额 -->
					<view class="stat-value">{{ activityDetail.totalSlots }}</view>
					<view class="stat-label">总名额</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">
						<!-- 根据 activityFunds 判断显示费用还是免费 -->
						<text v-if="activityDetail.activityFunds === 1">¥{{ activityDetail.registrationFee }}</text>
						<text v-else-if="activityDetail.activityFunds === 2">免费</text>
					</view>
					<view class="stat-label">报名费</view>
				</view>
			</view>
		</view>

		<!-- 聚会介绍 -->
		<view class="event-content">
			<view class="section-title">聚会介绍</view>
			<!-- 动态绑定聚会介绍 -->
			<view class="event-description">{{ activityDetail.activityDescription }}</view>

			<text class="section-title">聚会内容</text>
			<!-- 动态绑定聚会环节 -->
			<view class="activity-grid">
				<view class="activity-item" v-for="item in activityDetail.memberActivitySessionList" :key="item.id">
					<view class="activity-title">{{ item.sessionTitle }}</view>
					<view class="activity-desc">{{ item.sessionDescription }}</view>
				</view>
			</view>
		</view>

		<!-- 主办方 -->
		<view class="organizer-section">
			<view class="organizer-title">聚会组织者</view>
			<view class="organizer-info" @click="navigateToBusinessCard(activityDetail.memberUser, true)">
				<view class="organizer-avatar">
					<!-- <uni-icons type="person-filled" size="24" color="#fff" /> -->
					<img :src="activityDetail.memberUser.avatar" alt="" class="organizer-avatar" />
				</view>
				<view>
					<!-- 动态绑定组织者单位 -->
					<view class="organizer-name">{{ activityDetail.memberUser.nickname }}</view>
					<!-- 动态绑定组织者联系电话 -->
					<view class="organizer-company">联系电话: {{ activityDetail.organizerContactPhone }}</view>
				</view>
			</view>
		</view>

		<!-- 商圈信息 -->
		<!-- 使用 v-if 判断是否存在关联聚店信息 -->
		<view v-if="activityDetail.memberStoreRespVO" class="business-section"
			@click="navigateToStoreDetail(activityDetail.memberStoreRespVO)">
			<view class="business-title">聚会聚店</view>
			<view class="business-info">
				<view class="business-logo">
					<!-- 可以使用聚店的封面图 -->
					<image v-if="activityDetail.memberStoreRespVO.storeCoverImageUrl"
						:src="activityDetail.memberStoreRespVO.storeCoverImageUrl" class="store-logo-image" />
					<uni-icons v-else type="shop-filled" size="24" color="#fff" />
				</view>
				<view class="business-details">
					<!-- 动态绑定聚店信息 -->
					<text class="business-name">{{ activityDetail.memberStoreRespVO.storeName }}</text>
					<view class="business-meta">
						<view style="font-size: 25rpx;margin: 10rpx 0;">
							{{ activityDetail.memberStoreRespVO.fullAddress }}
						</view>
						<view style="font-size: 25rpx;margin: 10rpx 0;">
							{{ activityDetail.memberStoreRespVO.contactPhone }}
						</view>

					</view>
				</view>
			</view>
		</view>

		<!-- 聚会贡分（暂时写死，如果后端有返回则替换） -->
		<view class="organizer-section">
			<view class="organizer-title">聚会贡分</view>
			<view class="organizer-info">
				<view class="organizer-name">参与本次聚会，聚会结束可以获得<span style="color: #ff6b00;">100</span>贡分</view>
			</view>
		</view>

		<!-- 参与用户头像组 -->
		<view class="participants-section">
			<view class="participants-header">
				<view class="participants-title">参与用户</view>
				<!-- 只有当有用户报名时才显示 "查看全部" -->
				<view v-if="participantTotal > 0" class="view-all-link" @click="viewAllUsers">查看全部 ></view>
			</view>

			<!-- 如果有报名用户，则显示头像列表 -->
			<view v-if="participantList.length > 0" class="participants-body">
				<view class="avatar-group">
					<!-- 循环展示报名用户的头像 -->
					<image v-for="participant in participantList" :key="participant.id"
						:src="participant.memberUser.avatar" class="avatar-item" />
					<!-- 如果总人数超过了当前显示的头像数，显示一个省略提示 -->
					<view v-if="participantTotal > participantList.length" class="avatar-item more-avatars">
						...
					</view>
				</view>
				<text class="total-registered-info">
					<!-- 使用动态的总人数 -->
					<text class="registered-count">{{ participantTotal }}</text> 人已报名
				</text>
			</view>

			<!-- 如果没有报名用户，则显示提示信息 -->
			<view v-else class="no-participants">
				<text>暂无用户报名，快来成为第一个参与者吧！</text>
			</view>
		</view>

		<!-- 根据 activityFunds 判断是否显示赞助商信息 -->
		<view class="sponsor-section" v-if="activityDetail.activityFunds === 2">
			<view class="section-title">赞助单位</view>
			<view class="sponsor-info">
				<!-- 动态绑定公司Logo和名称 -->
				<image :src="activityDetail.companyLogo" class="sponsor-logo"></image>
				<view class="sponsor-details">
					<view class="sponsor-name">{{ activityDetail.companyName }}</view>
					<view class="sponsor-description">感谢{{ activityDetail.companyName }}对本次聚会的大力支持！</view>
				</view>
			</view>
		</view>

		<!-- 动态绑定报名截止时间 -->
		<view style="margin: 20rpx auto; flex: 1; text-align: center;">
			报名时间：
			<span style="color: #ff1a3c;">
				{{ formattedRegistrationTimes.start }} - {{ formattedRegistrationTimes.end }}
			</span>
		</view>

		<view style="width: 100%;height: 100rpx;"></view>



		<!-- 操作栏 -->
		<view class="action-bar" v-if="!isActionBarHidden">
			<view class="action-btn share-btn" @click="openSharePopup">
				<text> 🔗聚会分享</text>
			</view>

			<view class="action-btn register-btn" :class="{ 'disabled': !isRegistrationActive }"
				:disabled="!isRegistrationActive" @click="register">
				<text> ➕立即报名</text>
			</view>
		</view>

		<!-- 自定义分享弹窗  -->
		<uni-popup ref="sharePopup" type="bottom" background-color="#fff" @change="onPopupChange">
			<view class="share-popup-content">
				<view class="share-popup-title">自定义分享内容</view>
				<view class="share-title-editor">
					<text class="editor-label">标题:</text>
					<input class="editor-input" v-model="customShareTitle" placeholder="请输入分享标题" />
				</view>
				<view class="share-channels">
					<!-- 分享到好友的按钮，现在带上了 open-type="share" -->
					<button class="share-channel-btn" open-type="share">
						<uni-icons type="weixin" size="30" color="#07c160"></uni-icons>
						<text>微信好友</text>
					</button>
					<!-- 分享到朋友圈的引导按钮 -->
					<button class="share-channel-btn" @click="guideShareTimeline">
						<uni-icons type="pyq" size="30" color="#53a046"></uni-icons>
						<text>朋友圈</text>
					</button>
				</view>
				<view class="share-popup-cancel" @click="closeSharePopup">取消</view>
			</view>
		</uni-popup>

		<!-- 分享到朋友圈的引导遮罩层 -->
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
	} from 'vue'
	import {
		onLoad,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app'
	import request from '../../utils/request.js';
	import {
		getInviteCode
	} from '../../utils/user.js';

	const activityId = ref(null);
	// 创建一个 ref 来存储整个聚会详情对象
	const activityDetail = ref(null);

	// 分享弹窗和引导蒙层的状态变量
	const sharePopup = ref(null);
	const customShareTitle = ref('');
	const showTimelineGuide = ref(false);

	// 用于控制底部操作栏显示/隐藏的状态变量
	const isActionBarHidden = ref(false);

	//获取当前登录用户的ID
	const loggedInUserId = ref(null);

	// 创建 ref 存储报名用户列表和总数
	const participantList = ref([]);
	const participantTotal = ref(0);

	onLoad((options) => {
		if (options && options.inviteCode) {
			const inviteCode = options.inviteCode;
			console.log(`✅ [活动详情页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
			uni.setStorageSync('pendingInviteCode', inviteCode);
		}

		loggedInUserId.value = uni.getStorageSync('userId');

		if (options.id) {
			activityId.value = options.id;
			// 在拿到 ID 后直接调用数据获取函数
			getActiveDetail();
			// 在获取聚会详情后，接着获取报名用户列表
			getParticipantList();
		} else {
			console.error('未接收到聚会ID！');
			uni.showToast({
				title: '加载聚会详情失败，缺少ID',
				icon: 'none'
			});
		}

		// ==================== 处理分享点击加分逻辑 ====================
		if (options && options.sharerId) {
			const sharerId = options.sharerId;
			const bizId = options.id; // 聚会ID就是 bizId

			// 1. 如果是本人点击，不处理
			if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
				console.log('用户点击了自己的聚会分享链接，不计分。');
			}
			// 2. 如果是其他已登录用户点击，直接调用接口加分
			else if (sharerId && loggedInUserId.value && bizId) {
				console.log('其他用户点击了聚会分享链接，且已登录，准备为分享者加分。');
				triggerShareHitApi(sharerId, bizId);
			}
			// 3. 如果是未登录用户点击，暂存信息
			else if (sharerId && bizId) {
				console.log('用户点击了聚会分享链接，但尚未登录。暂存分享信息。');
				// 将分享者ID、聚会ID和类型作为一个对象进行缓存
				uni.setStorageSync('pendingShareReward', {
					sharerId: sharerId,
					bizId: bizId,
					type: 31 // 明确是分享聚会
				});
			}
		}
		// =======================================================================

		// 允许从右上角菜单发起分享
		uni.showShareMenu({
			withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	/**
	 * @description 计算当前登录用户是否为本次聚会的组织者
	 */
	const isOrganizer = computed(() => {
		// 安全检查，确保数据都已加载
		if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser) {
			return false;
		}
		// 比较当前登录用户ID和聚会组织者ID
		return parseInt(loggedInUserId.value) === activityDetail.value.memberUser.id;
	});

	const isRegistrationActive = computed(() => {
		// 如果聚会详情还没加载出来，则默认不可报名
		if (!activityDetail.value) {
			return false;
		}
		// 只有当 status 为 2 (报名中) 时，才返回 true
		return activityDetail.value.status === 2;
	});

	// 模拟参与用户头像
	const avatars = [
		'https://randomuser.me/api/portraits/women/1.jpg',
		'https://randomuser.me/api/portraits/men/2.jpg',
		'https://randomuser.me/api/portraits/women/3.jpg',
		'https://randomuser.me/api/portraits/men/4.jpg'
	]

	// 【新增】计算属性，用于格式化时间
	const formatDateTime = (timestamp) => {
		if (!timestamp) return '时间待定';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	};

	// uni-popup 状态变化时的事件处理函数
	const onPopupChange = (e) => {
		// e.show 是 uni-popup 派发出来的值，true 表示弹窗打开，false 表示弹窗关闭
		isActionBarHidden.value = e.show;
	};

	// 用于聚会时间的计算属性
	const formattedActivityTime = computed(() => {
		if (!activityDetail.value) return '';
		const start = formatDateTime(activityDetail.value.startDatetime);
		const end = formatDateTime(activityDetail.value.endDatetime);
		return `${start} 至 ${end}`;
	});

	//用于报名截止时间的计算属性
	const formattedRegistrationEndTime = computed(() => {
		if (!activityDetail.value) return '';
		return formatDateTime(activityDetail.value.registrationEndDatetime);
	});
	const formattedRegistrationTimes = computed(() => {
		if (!activityDetail.value) return {
			start: '',
			end: ''
		};

		return {
			start: formatDateTime(activityDetail.value.registrationStartDatetime),
			end: formatDateTime(activityDetail.value.registrationEndDatetime)
		};
	});


	// 用于聚会状态显示的计算属性
	const statusInfo = computed(() => {
		if (!activityDetail.value) return {
			text: '',
			color: ''
		};
		const statusMap = {
			0: {
				text: '聚会已取消',
				color: '#909399'
			},
			1: {
				text: '聚会未开始',
				color: '#f9ae3d'
			},
			2: {
				text: '正在报名中',
				color: '#4cd964'
			},
			3: {
				text: '聚会即将开始',
				color: '#007aff'
			},
			4: {
				text: '聚会进行中',
				color: '#dd524d'
			},
			5: {
				text: '聚会已结束',
				color: '#8f8f94'
			},
			6: {
				text: '聚会待退款',
				color: '#e6a23c'
			},
		};
		return statusMap[activityDetail.value.status] || {
			text: '状态未知',
			color: '#909399'
		};
	});

	// 用于判断是否显示“起聚名额”提示的计算属性
	const showLimitSlotsTip = computed(() => {
		if (!activityDetail.value) return false;
		// 只有在“未开始”或“报名中”且报名人数少于最低名额时显示
		const relevantStatus = [1, 2].includes(activityDetail.value.status);
		const notEnoughPeople = (activityDetail.value.joinCount || 0) < activityDetail.value.limitSlots;
		return relevantStatus && notEnoughPeople;
	});

	const getActiveDetail = async () => {
		if (!activityId.value) return; // 确保有 ID 才请求
		const result = await request('/app-api/member/activity/get', {
			method: 'GET',
			data: {
				id: activityId.value
			}
		});
		if (result && !result.error) {
			// 【修改】将获取到的数据赋值给 activityDetail
			activityDetail.value = result.data;
			console.log('getActiveDetail result:', activityDetail.value);
		} else {
			console.log('请求失败:', result ? result.error : '无返回结果');
		}
	};

	// 获取报名用户列表的方法
	const getParticipantList = async () => {
		if (!activityId.value) return;

		// 为了在详情页只显示部分头像，我们只请求少量数据，比如前 8 个
		const {
			data,
			error
		} = await request('/app-api/member/activity-join/list', {
			method: 'GET',
			data: {
				activityId: activityId.value,
				pageNo: 1,
				pageSize: 8 // 只获取少量用于预览
			}
		});

		if (error) {
			console.error('获取报名用户列表失败:', error);
			return;
		}

		if (data && data.list) {
			participantList.value = data.list;
			participantTotal.value = data.total;
			console.log('获取到的报名用户列表:', participantList.value);
			console.log('总报名人数:', participantTotal.value);
		}
	};

	// 用于格式化聚店营业时间的计算属性
	// 【请使用这个最终修正版的函数】
	const formattedOperatingHours = computed(() => {
		const operatingHoursStr = activityDetail.value?.memberStoreRespVO?.operatingHours;
		if (!operatingHoursStr) {
			return ['暂无营业时间'];
		}

		try {
			const data = JSON.parse(operatingHoursStr);
			const regularHours = data?.business_hours?.regular;
			const specialDates = data?.business_hours?.special_dates;

			if (!regularHours && (!specialDates || specialDates.length === 0)) {
				return ['暂无营业时间'];
			}

			const resultLines = [];

			// 1. 处理常规营业时间
			if (regularHours) {
				const dayMap = {
					monday: '周一',
					tuesday: '周二',
					wednesday: '周三',
					thursday: '周四',
					friday: '周五',
					saturday: '周六',
					sunday: '周日',
				};
				const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

				dayOrder.forEach(dayKey => {
					const dayInfo = regularHours[dayKey];
					if (dayInfo && dayInfo.is_open) {
						const chineseDay = dayMap[dayKey];
						const isNextDay = dayInfo.close < dayInfo.open;
						const timeString = `${dayInfo.open} - ${isNextDay ? '次日' : ''}${dayInfo.close}`;
						resultLines.push(`${chineseDay}: ${timeString}`);
					}
				});
			}

			// 2. 处理特殊营业日期
			if (specialDates && specialDates.length > 0) {
				if (resultLines.length > 0) {
					resultLines.push('');
				}
				resultLines.push('【特殊营业时间】');

				specialDates.forEach(special => {
					let line = special.date;
					if (special.description) {
						line += ` (${special.description})`;
					}

					if (special.is_open) {
						// 【修正点】在这里定义 isNextDay 变量
						const isNextDay = special.close < special.open;
						// 【修正点】在这里正确使用 isNextDay 变量
						line += `: ${special.open} - ${isNextDay ? '次日' : ''}${special.close}`;
					} else {
						line += `: 休息`;
					}
					resultLines.push(line);
				});
			}

			if (resultLines.length === 0) {
				return ['商家未设置营业时间'];
			}

			return resultLines;

		} catch (e) {
			console.error('解析营业时间JSON失败:', e);
			console.error('原始字符串:', operatingHoursStr);
			return ['营业时间格式有误'];
		}
	});


	// 打开分享弹窗的方法
	const openSharePopup = () => {
		// 设置输入框的默认值为聚会标题
		customShareTitle.value = activityDetail.value.activityTitle || '发现一个很棒的聚会，快来看看吧！';
		sharePopup.value.open();
	};

	// 关闭分享弹窗的方法
	const closeSharePopup = () => {
		sharePopup.value.close();
	};

	// 引导用户分享到朋友圈的方法
	const guideShareTimeline = () => {
		closeSharePopup();
		showTimelineGuide.value = true;
	};

	// 隐藏引导遮罩的方法
	const hideTimelineGuide = () => {
		showTimelineGuide.value = false;
	};

	// 调用分享命中接口的函数
	const triggerShareHitApi = async (sharerId, bizId) => {
		if (!sharerId || !bizId) return;

		console.log(`准备为分享者 (ID: ${sharerId}) 增加贡分, 关联聚会ID: ${bizId}`);

		const {
			error
		} = await request('/app-api/member/experience-record/share-experience-hit', {
			method: 'POST',
			data: {
				type: 31, // 31 代表 "分享聚会奖励"
				shareUserId: sharerId,
				bizId: bizId
			}
		});

		if (error) {
			console.error('调用分享加分接口失败:', error);
		} else {
			console.log(`成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
		}
	};

	//轮播图数据源
	const bannerImages = computed(() => {
		if (!activityDetail.value) return [];

		// 1. 优先使用新字段：聚会图集
		if (activityDetail.value.activityCoverImageUrls && activityDetail.value.activityCoverImageUrls.length >
			0) {
			return activityDetail.value.activityCoverImageUrls;
		}

		// 2. 降级使用旧字段：封面图
		if (activityDetail.value.coverImageUrl) {
			return [activityDetail.value.coverImageUrl];
		}

		return [];
	});

	// 预览轮播图
	const previewBanner = (index) => {
		uni.previewImage({
			urls: bannerImages.value,
			current: index
		});
	};

	// onShareAppMessage 逻辑
	onShareAppMessage((res) => {
		console.log("触发分享给好友", res);
		closeSharePopup();

		// 获取分享者自己的用户ID
		const sharerId = uni.getStorageSync('userId');
		const finalTitle = customShareTitle.value || activityDetail.value.activityTitle || '发现一个很棒的聚会，快来看看吧！';

		const inviteCode = getInviteCode();


		// 在路径中添加 sharerId 参数
		let sharePath = `/packages/active-detail/active-detail?id=${activityDetail.value.id}`;
		if (sharerId) {
			sharePath += `&sharerId=${sharerId}`;
		}

		if (inviteCode) {
			sharePath += `&inviteCode=${inviteCode}`;
		}

		return {
			title: finalTitle,
			path: sharePath, // 使用拼接后的路径
			imageUrl: activityDetail.value.coverImageUrl || '/static/default-share-image.png'
		};
	});

	onShareTimeline(() => {
		console.log("触发分享到朋友圈");

		// 获取分享者自己的用户ID
		const sharerId = uni.getStorageSync('userId');
		const finalTitle = customShareTitle.value || activityDetail.value.activityTitle || '发现一个很棒的聚会，快来看看吧！';

		// 获取邀请码
		const inviteCode = getInviteCode();

		// 在 query 中添加 sharerId 和 inviteCode 参数
		let queryString = `id=${activityDetail.value.id}&from=timeline`;
		if (sharerId) {
			queryString += `&sharerId=${sharerId}`;
		}
		//如果邀请码存在，则拼接到 query 中
		if (inviteCode) {
			queryString += `&inviteCode=${inviteCode}`;
		}

		return {
			title: finalTitle,
			query: queryString, // 使用拼接后的 query
			imageUrl: activityDetail.value.coverImageUrl || '/static/default-share-image.png'
		}
	});

	function share() {
		uni.showToast({
			title: '已分享到微信朋友圈',
			icon: 'none'
		})
	}

	function register() {
		if (!isRegistrationActive.value) {
			uni.showToast({
				title: '当前非报名时间',
				icon: 'none'
			});
			return; // 阻止跳转
		}
		uni.navigateTo({
			url: `/packages/active-enroll/active-enroll?id=${activityId.value}`
		})
	}

	function viewAllUsers() {
		if (participantTotal.value === 0) {
			uni.showToast({
				title: '暂无用户报名',
				icon: 'none'
			});
			return;
		}

		// 构建基础 URL
		let url = `/pages/activity-participants/activity-participants?id=${activityId.value}`;

		// 如果是组织者，则在 URL 中添加一个标识
		if (isOrganizer.value) {
			url += '&isOrganizer=1';
		}

		console.log('跳转到报名列表页, URL:', url);

		uni.navigateTo({
			url: url
		});
	}


	/**
	 * 跳转到申请兑换名片页面
	 * @param {object} user - 包含用户信息的对象 (id, nickname, avatar)
	 * @param {boolean} isFreeView - 是否免费查看，默认为 false
	 */
	const navigateToBusinessCard = (user, isFreeView = false) => {
		if (!user || !user.id) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}

		const defaultAvatar = '/static/images/default-avatar.png';
		const name = user.nickname || '匿名用户';
		const avatarUrl = user.avatar || defaultAvatar;

		let url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(name)}` +
			`&avatar=${encodeURIComponent(avatarUrl)}`;

		// 如果需要免费查看，则添加 fromShare=1 参数
		if (isFreeView) {
			url += '&fromShare=1';
			console.log(`[免费查看] 跳转到名片申请页, UserID: ${user.id}`);
		} else {
			console.log(`[标准流程] 跳转到名片申请页, UserID: ${user.id}`);
		}

		uni.navigateTo({
			url: url
		});
	};

	/**
	 * 跳转到聚店详情页面
	 * @param {object} store - 包含聚店信息的对象 (id)
	 */
	const navigateToStoreDetail = (store) => {
		// 1. 安全检查
		if (!store || !store.id) {
			uni.showToast({
				title: '无法查看聚店详情',
				icon: 'none'
			});
			return;
		}

		const targetPath = '/pages/shop-detail/shop-detail'; // <--- 请确认此路径是否正确！

		// 2. 构建URL
		const url = `${targetPath}?id=${store.id}`;

		console.log('从聚会详情页跳转到聚店详情页, URL:', url);

		// 3. 执行跳转
		uni.navigateTo({
			url: url
		});
	};
</script>

<style lang="scss" scoped>
	/* ==================================================================
	 * 页面主体与全局样式
	 * ================================================================== */
	.page {
		padding-bottom: 120rpx;
		background-color: #f8f8f8;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin: 30rpx 0 20rpx;
		border-left: 10rpx solid #FF6B00;
		padding-left: 20rpx;
	}

	/* ==================================================================
	 * 页面内容模块
	 * ================================================================== */

	/* --- 聚会封面 --- */
	/* 轮播图容器 */
	.banner-section {
		position: relative;
		width: 100%;
		/* 保持 5:4 比例，或者固定高度，根据设计稿来 */
		/* 100vw * 0.8 = 750rpx * 0.8 = 600rpx */
		height: 600rpx;
		background-color: #f0f0f0;
	}

	.banner-swiper {
		width: 100%;
		height: 100%;
	}

	.banner-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.banner-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #eee;
	}

	/* 标签浮层 (复用之前的文字样式，调整定位) */
	.tags-overlay {
		position: absolute;
		bottom: 20rpx;
		left: 20rpx;
		z-index: 10;
	}

	.event-cover-text {
		/* 保持原有的文字样式 */
		color: white;
		font-size: 26rpx;
		font-weight: bold;
		padding: 8rpx 16rpx;
		background-color: rgba(0, 0, 0, 0.4);
		border-radius: 8rpx;
	}

	.event-cover {
		width: 100%;
		aspect-ratio: 5 / 4;
		background: linear-gradient(45deg, #ff9a9e, #fad0c4);
		display: flex;
		/* 垂直对齐方式: 从 center 改为 flex-end (底部对齐) */
		align-items: flex-end;
		/* 水平对齐方式: 从 center 改为 flex-start (左侧对齐) */
		justify-content: flex-start;
		padding: 20rpx;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
		/* 添加相对定位，为遮罩层提供定位上下文 */
		box-sizing: border-box;
		/* 确保 padding 不会撑大容器 */
	}

	/* 新增一个伪元素作为渐变遮罩，确保文字在任何背景下都清晰可见 */
	.event-cover::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 50%;
		/* 遮罩层高度为封面的一半 */
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
		z-index: 1;
	}

	.event-cover-text {
		color: white;
		font-size: 32rpx;
		/* 稍微缩小一点字体以适应角落 */
		font-weight: bold;
		text-align: left;
		padding: 10rpx 20rpx;
		background-color: rgba(0, 0, 0, 0.3);
		/* 给文字一个半透明背景，进一步提升可读性 */
		border-radius: 10rpx;
		position: relative;
		/* 确保文字在遮罩层之上 */
		z-index: 2;
	}

	/* --- 状态与提示横幅 --- */
	.status-banner {
		color: #fff;
		padding: 10rpx 30rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: bold;
	}

	.limit-slots-tip {
		background-color: #fdf6ec;
		color: #e6a23c;
		padding: 20rpx 30rpx;
		font-size: 26rpx;
		display: flex;
		align-items: center;
	}

	/* --- 通用内容卡片样式 --- */
	.event-header,
	.event-content,
	.organizer-section,
	.business-section,
	.participants-section,
	.sponsor-section {
		background: #fff;
		margin: 30rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	/* --- 聚会头部信息 (Header Card) --- */
	.event-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.event-meta {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		margin: 10rpx;
		gap: 10rpx;
	}

	.event-stats {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
	}

	.stat-item {
		flex: 1;
		text-align: center;
	}

	.stat-value {
		font-size: 32rpx;
		color: #FF6B00;
		font-weight: bold;
	}

	.stat-label {
		font-size: 24rpx;
		color: #888;
	}

	/* --- 聚会介绍 (Content Card) --- */
	.event-description {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		margin-bottom: 20rpx;
	}

	.activity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30rpx;
		margin-top: 20rpx;
	}

	.activity-item {
		background: #f9f9f9;
		border-radius: 20rpx;
		padding: 30rpx;
		text-align: center;
	}

	.activity-title {
		color: #FF6B00;
		font-weight: bold;
		font-size: 32rpx;
		margin-bottom: 10rpx;
	}

	.activity-desc {
		font-size: 24rpx;
		color: #666;
	}

	/* --- 组织者、商圈、赞助商通用样式 --- */
	.organizer-title,
	.business-title,
	.participants-title,
	.sponsor-title {
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.organizer-info,
	.business-info,
	.sponsor-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.organizer-avatar,
	.business-logo {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(45deg, #ffb347, #ffcc33);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.store-logo-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.sponsor-logo {
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
		object-fit: contain;
		background-color: #f0f0f0;
		border: 1rpx solid #eee;
	}

	.organizer-name,
	.business-name,
	.sponsor-name {
		font-weight: bold;
		font-size: 28rpx;
	}

	.organizer-company,
	.business-meta text,
	.sponsor-description {
		font-size: 24rpx;
		color: #666;
	}

	/* --- 参与用户 --- */
	.participants-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10rpx;
	}

	.participants-body {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-left: 10rpx;
	}

	.view-all-link {
		font-size: 24rpx;
		color: #3a7bd5;
		cursor: pointer;
	}

	.avatar-group {
		display: flex;
		position: relative;
	}

	.avatar-item {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
		object-fit: cover;
		margin-left: -20rpx;
		background: #f0f0f0;
	}

	.more-avatars {
		background: #FF6B00;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.total-registered-info {
		font-size: 26rpx;
		color: #666;
	}

	.registered-count {
		color: #FF6B00;
		font-weight: bold;
	}

	/* ==================================================================
	 * 浮动与弹窗元素 (最高层级)
	 * ================================================================== */

	/* --- 底部固定操作栏 --- */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		display: flex;
		padding: 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -5rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		padding: 24rpx;
		margin: 0 10rpx;
		text-align: center;
		border-radius: 16rpx;
		font-weight: bold;
		font-size: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn.share-btn {
		/* 将原来的灰色背景替换为绿色渐变 */
		background: linear-gradient(to right, #4cd964, #34a853);
		/* 文字颜色改为白色以适应深色背景 */
		color: #fff;
	}

	.action-btn.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: #fff;
	}

	.action-btn.register-btn.disabled {
		background: #c8c9cc;
		color: #fff;
		pointer-events: none;
	}

	/* --- 自定义分享弹窗 --- */
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
	}

	.share-channel-btn::after {
		border: none;
	}

	.channel-icon-image {
		width: 60rpx;
		height: 60rpx;
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

	/* --- 朋友圈引导蒙层 --- */
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
	}

	.guide-text text {
		display: block;
		margin-bottom: 10rpx;
	}

	/* --- 参与用户 --- */
	.no-participants {
		padding: 20rpx 0;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}
</style>