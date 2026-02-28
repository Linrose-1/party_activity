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

		<!-- 聚会介绍与环节 -->
		<view class="event-content">
			<!-- 模块：聚会介绍 -->
			<view class="content-section">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">聚会介绍</text>
				</view>
				<!-- 支持换行的文本容器 -->
				<view class="event-description-text">
					{{ activityDetail.activityDescription }}
				</view>
			</view>

			<!-- 模块：聚会环节 (时间轴样式) -->
			<view class="content-section" style="margin-top: 40rpx;">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">聚会内容</text>
				</view>

				<view class="timeline-box">
					<view class="timeline-item" v-for="(item, index) in activityDetail.memberActivitySessionList"
						:key="item.id">
						<!-- 左侧线条 -->
						<view class="timeline-line-col">
							<view class="dot"></view>
							<!-- 最后一项不显示连接线 -->
							<view class="line" v-if="index !== activityDetail.memberActivitySessionList.length - 1">
							</view>
						</view>

						<!-- 右侧内容 -->
						<view class="timeline-content-col">
							<view class="session-name">{{ item.sessionTitle }}</view>
							<view class="session-detail">{{ item.sessionDescription }}</view>
						</view>
					</view>
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

		<!-- 赞助商信息 (修改后：横向滚动品牌墙) -->
		<view class="sponsor-section" v-if="sponsorList && sponsorList.length > 0">
			<view class="section-title">
				赞助单位 <text style="font-size: 24rpx; color:#999; margin-left: 10rpx;">({{ sponsorList.length }})</text>
			</view>

			<scroll-view scroll-x class="sponsor-scroll" enable-flex>
				<view class="sponsor-item-card" v-for="(item, index) in sponsorList" :key="item.id"
					@click="navigateToSponsorDetail(item)">
					<!-- Logo: 有图显示图，没图显示默认图标 -->
					<image v-if="item.logoUrl" :src="item.logoUrl" mode="aspectFit" class="sp-logo"></image>
					<view v-else class="sp-logo-placeholder">
						<text>LOGO</text>
					</view>

					<view class="sp-name text-ellipsis">{{ item.sponsorName }}</view>

					<!-- 标签：显示类型（现金/物品/混合） -->
					<view class="sp-tag-row">
						<!-- 情况1：纯现金 -->
						<view v-if="item.sponsorType === 1" class="sp-tag money">现金</view>
						<!-- 情况2：纯物品 -->
						<view v-else-if="item.sponsorType === 2" class="sp-tag goods">物品</view>
						<!-- 情况3：混合 (现金+物品) -->
						<view v-else-if="item.sponsorType === 3" class="sp-tag mixed">
							<text class="tag-icon">💰</text>+<text class="tag-icon">🎁</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>



		<!-- ==================== 浏览留痕模块 ==================== -->
		<view class="viewer-module-card" v-if="activityDetail && activityDetail.isReadTrace === 1 && viewerTotal > 0">
			<view class="viewer-header" @click="goToTraceList">
				<view class="left-title">
					<view class="title-indicator"></view>
					<text class="title-txt">最近浏览</text>
					<text class="title-count">{{ viewerTotal }}</text>
				</view>
				<view class="right-more">
					<text>浏览详情</text>
					<uni-icons type="right" size="14" color="#999"></uni-icons>
				</view>
			</view>

			<view class="viewer-content" @click="goToTraceList">
				<view class="avatar-stack">
					<view class="avatar-item" v-for="(item, index) in viewerList" :key="item.id">
						<image :src="item.memberUser?.avatar || '/static/icon/default-avatar.png'" class="v-avatar"
							mode="aspectFill"></image>
					</view>
					<view v-if="viewerTotal > 7" class="more-dots">
						<text class="dot"></text>
						<text class="dot"></text>
						<text class="dot"></text>
					</view>
				</view>
				<view class="viewer-tips">
					已有 {{ viewerTotal }} 位商友关注了您的聚会
				</view>
			</view>
		</view>

		<!-- 评论预览模块 -->
		<view class="comment-preview-card">
			<view class="preview-header" @click="goToCommentPage">
				<view class="left-title">
					<view class="title-indicator"></view>
					<text class="title-txt">商友评论</text>
					<text class="title-count" v-if="commentTotal > 0">{{ commentTotal }}</text>
				</view>
				<view class="right-more">
					<text>查看全部</text>
					<uni-icons type="right" size="14" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 简单评论列表 (展示最新2条) -->
			<view class="preview-list" v-if="commentPreviewList.length > 0" @click="goToCommentPage">
				<view class="preview-item" v-for="c in commentPreviewList" :key="c.id">
					<text
						class="p-user">{{ c.anonymous === 1 ? '匿名商友' : (c.memberUserBaseVO?.nickname || '商友') }}:</text>
					<text class="p-content">{{ c.content }}</text>
				</view>
			</view>

			<!-- 无评论时的占位 -->
			<view v-else class="preview-empty" @click="goToCommentPage">
				<uni-icons type="chatbubble" size="18" color="#ccc"></uni-icons>
				<text>暂无评论，点击发表第一条评论</text>
			</view>
		</view>

		<!-- 动态绑定报名截止时间 -->
		<view style="margin: 20rpx auto; flex: 1; text-align: center;">
			报名时间：
			<span style="color: #ff1a3c;">
				{{ formattedRegistrationTimes.start }} - {{ formattedRegistrationTimes.end }}
			</span>
		</view>

		<!-- 新增：聚会赞踩互动区 (去掉了评论数，视觉更精简) -->
		<view class="interaction-capsule-section">
			<view class="capsule-container">
				<!-- 点赞按钮 -->
				<view class="capsule-item like" :class="{ active: activityDetail.userLikeStr === 'like' }"
					@click="toggleAction('like')">
					<uni-icons :type="activityDetail.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="22"
						:color="activityDetail.userLikeStr === 'like' ? '#FF6B00' : '#666'"></uni-icons>
					<text class="count">{{ activityDetail.likesCount || 0 }}</text>
					<text class="label">靠谱</text>
				</view>

				<view class="capsule-divider"></view>

				<!-- 点踩按钮 -->
				<view class="capsule-item dislike" :class="{ active: activityDetail.userLikeStr === 'dislike' }"
					@click="toggleAction('dislike')">
					<uni-icons :type="activityDetail.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'"
						size="22" :color="activityDetail.userLikeStr === 'dislike' ? '#3498db' : '#666'"></uni-icons>
					<text class="count">{{ activityDetail.dislikesCount || 0 }}</text>
					<text class="label">无感</text>
				</view>
			</view>
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


		<PointsFeedbackPopup ref="pointsPopup" />
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
		getInviteCode,
		checkLoginGuard
	} from '../../utils/user.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	const activityId = ref(null);
	// 创建一个 ref 来存储整个聚会详情对象
	const activityDetail = ref(null);

	const sponsorList = ref([]);

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

	const pointsPopup = ref(null);

	const viewerList = ref([]);
	const viewerTotal = ref(0);

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
			getCommentPreview();
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
			// withShareTicket: true,
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
			// 将获取到的数据赋值给 activityDetail
			activityDetail.value = result.data;

			getViewerList(activityId.value);

			if (result.data.memberSponsorList && Array.isArray(result.data.memberSponsorList)) {
				sponsorList.value = result.data.memberSponsorList;
			} else {
				sponsorList.value = [];
			}

			if (result.data.checkContribution === 1) {
				setTimeout(() => {
					if (pointsPopup.value) {
						pointsPopup.value.show('阅读聚会详情', 10);
					}
				}, 500);
			}

			console.log('getActiveDetail result:', activityDetail.value);
			console.log('解析到的赞助商列表:', sponsorList.value);
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
	const openSharePopup = async () => {
		if (!await checkLoginGuard()) return;
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

	// [方法] 获取浏览记录
	const getViewerList = async (id) => {
		// 只有本人创建的聚会，后端接口才会返回数据
		const {
			data
		} = await request('/app-api/member/target-view/page', {
			method: 'GET',
			data: {
				targetId: id,
				targetType: 'activity', // 【关键】设置为 activity
				pageNo: 1,
				pageSize: 7
			}
		});

		if (data) {
			viewerList.value = data.list || [];
			viewerTotal.value = data.total || 0;
		}
	};

	const commentPreviewList = ref([]);
	const commentTotal = ref(0);

	const getCommentPreview = async () => {
		if (!activityId.value) return;
		const {
			data
		} = await request('/app-api/member/comment/select-type-target-id', {
			method: 'GET',
			data: {
				targetId: activityId.value, // 或者是 storeId
				targetType: 'activity' // 或者是 'store'
			}
		});
		if (data && Array.isArray(data)) {
			commentTotal.value = data.length;
			// 只取前2条做预览
			commentPreviewList.value = data.slice(0, 2);
		}
	};

	const isActionInProgress = ref(false);

	const toggleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		isActionInProgress.value = true;

		// 1. 备份原始数据用于回滚
		const originalAction = activityDetail.value.userLikeStr;
		const originalLikes = activityDetail.value.likesCount;
		const originalDislikes = activityDetail.value.dislikesCount;

		// 2. 确定发给后端的 action
		const apiAction = originalAction === clickedAction ? 'cancel' : clickedAction;

		// 3. 乐观更新 UI
		if (apiAction === 'cancel') {
			activityDetail.value.userLikeStr = null;
			clickedAction === 'like' ? activityDetail.value.likesCount-- : activityDetail.value.dislikesCount--;
		} else {
			activityDetail.value.userLikeStr = clickedAction;
			if (clickedAction === 'like') {
				activityDetail.value.likesCount++;
				if (originalAction === 'dislike') activityDetail.value.dislikesCount--;
			} else {
				activityDetail.value.dislikesCount++;
				if (originalAction === 'like') activityDetail.value.likesCount--;
			}
		}

		try {
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: activityId.value,
					targetType: 'activity', // 聚会类型
					action: apiAction
				}
			});
			if (error) throw new Error(error);
		} catch (e) {
			// 出错回滚
			activityDetail.value.userLikeStr = originalAction;
			activityDetail.value.likesCount = originalLikes;
			activityDetail.value.dislikesCount = originalDislikes;
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};

	const goToCommentPage = () => {
		uni.navigateTo({
			url: `/packages/comment-page/comment-page?id=${activityId.value}&type=activity`
		});
	};

	// [方法] 跳转至完整留痕列表页
	const goToTraceList = () => {
		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${activityId.value}&type=activity`
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

	const register = async () => {
		if (!await checkLoginGuard()) return;

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

	// 【新增】跳转到赞助商详情页的方法
	const navigateToSponsorDetail = (item) => {
		if (!item.id) return;
		// 携带 sponsorId 和 activityId 跳转
		uni.navigateTo({
			url: `/pages/sponsor-detail/sponsor-detail?sponsorId=${item.id}&activityId=${activityId.value}`
		});
	};


	/**
	 * 跳转到申请兑换名片页面
	 * @param {object} user - 包含用户信息的对象 (id, nickname, avatar)
	 * @param {boolean} isFreeView - 是否免费查看，默认为 false
	 */
	const navigateToBusinessCard = (user, isFreeView = false) => {
		// if (!user || !user.id) {
		// 	uni.showToast({
		// 		title: '无法查看该用户主页',
		// 		icon: 'none'
		// 	});
		// 	return;
		// }

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

		const targetPath = '/packages/shop-detail/shop-detail'; // <--- 请确认此路径是否正确！

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

	/* --- 内容区域容器 --- */
	.event-content {
		background: #fff;
		margin: 24rpx;
		padding: 40rpx 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
	}

	.section-header-row {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.header-mark {
		width: 8rpx;
		height: 32rpx;
		background: linear-gradient(to bottom, #FF6B00, #ffb347);
		border-radius: 4rpx;
		margin-right: 16rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #333;
	}

	/* --- 聚会介绍文本优化 --- */
	.event-description-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		/* 增加行高，提升阅读体验 */
		text-align: justify;
		/* 两端对齐 */
		white-space: pre-wrap;
		/* 【关键】保留换行符和空格 */
		word-break: break-all;
		/* 防止长单词溢出 */
	}

	/* --- 时间轴样式 (Timeline) --- */
	.timeline-box {
		padding-left: 10rpx;
		/* 稍微缩进 */
	}

	.timeline-item {
		display: flex;
		/* 不需要 margin-bottom，靠内容撑开 */
	}

	.timeline-line-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 40rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background-color: #fff;
		border: 6rpx solid #FF6B00;
		margin-top: 8rpx;
		/* 微调对齐标题 */
		box-sizing: border-box;
	}

	.line {
		width: 2rpx;
		background-color: #e0e0e0;
		flex: 1;
		/* 自动填满高度 */
		margin-top: 8rpx;
		min-height: 40rpx;
		/* 保证最小高度 */
	}

	.timeline-content-col {
		flex: 1;
		padding-bottom: 40rpx;
		/* 每个环节的下间距 */
	}

	.session-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
		line-height: 1.4;
	}

	.session-detail {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
		background-color: #f9f9f9;
		/* 给描述加个浅底色 */
		padding: 20rpx;
		border-radius: 12rpx;
		white-space: pre-wrap;
		/* 描述也支持换行 */
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

	/* 聚会详情赞踩互动区样式 */
	.interaction-capsule-section {
		display: flex;
		justify-content: center;
		margin: 40rpx 30rpx 10rpx;
	}

	.capsule-container {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border-radius: 60rpx;
		padding: 10rpx 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		border: 1rpx solid #f0f0f0;
	}

	.capsule-item {
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
		transition: all 0.2s ease;
	}

	.capsule-item .count {
		font-size: 32rpx;
		font-weight: bold;
		margin: 0 8rpx 0 12rpx;
		color: #333;
	}

	.capsule-item .label {
		font-size: 24rpx;
		color: #999;
	}

	/* 激活状态 */
	.capsule-item.like.active .count,
	.capsule-item.like.active .label {
		color: #FF6B00;
	}

	.capsule-item.dislike.active .count,
	.capsule-item.dislike.active .label {
		color: #3498db;
	}

	.capsule-divider {
		width: 2rpx;
		height: 40rpx;
		background-color: #eee;
		margin: 0 30rpx;
	}

	.capsule-item:active {
		transform: scale(0.9);
		opacity: 0.7;
	}

	/* 浏览留痕模块样式 (聚会版) */
	.viewer-module-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;
	}

	.viewer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.left-title {
		display: flex;
		align-items: center;
	}

	.title-indicator {
		width: 6rpx;
		height: 28rpx;
		background-color: #FF6B00;
		border-radius: 4rpx;
		margin-right: 12rpx;
	}

	.title-txt {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.title-count {
		font-size: 24rpx;
		color: #FF6B00;
		background: rgba(255, 107, 0, 0.1);
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
		margin-left: 12rpx;
	}

	.right-more {
		display: flex;
		align-items: center;
	}

	.right-more text {
		font-size: 24rpx;
		color: #999;
		margin-right: 4rpx;
	}

	.avatar-stack {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 16rpx;
	}

	.avatar-item {
		margin-right: 16rpx;
	}

	.v-avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		border: 2rpx solid #fff;
		background-color: #f5f5f5;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.more-dots {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background-color: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dot {
		width: 6rpx;
		height: 6rpx;
		background-color: #ccc;
		border-radius: 50%;
		margin: 0 2rpx;
	}

	.viewer-tips {
		font-size: 24rpx;
		color: #bbb;
	}

	.viewer-module-card:active {
		background-color: #fafafa;
	}

	.comment-preview-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.preview-list {
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 12rpx;
	}

	.preview-item {
		font-size: 26rpx;
		line-height: 1.6;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		/* 超过2行省略 */
		overflow: hidden;
	}

	.preview-item:last-child {
		margin-bottom: 0;
	}

	.p-user {
		color: #FF6B00;
		font-weight: bold;
		margin-right: 12rpx;
	}

	.p-content {
		color: #555;
	}

	.preview-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
		color: #bbb;
		font-size: 26rpx;
		gap: 12rpx;
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



	/* 赞助商横向滚动容器 */
	.sponsor-scroll {
		display: flex;
		white-space: nowrap;
		width: 100%;
		padding: 10rpx 0;
	}

	.sponsor-item-card {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		width: 200rpx;
		/* 卡片宽度 */
		margin-right: 24rpx;
		background: #fff;
		border: 1rpx solid #f0f0f0;
		border-radius: 16rpx;
		padding: 24rpx 16rpx;
		box-sizing: border-box;
		flex-shrink: 0;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	.sp-logo {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		/* 圆形Logo */
		background: #fff;
		margin-bottom: 16rpx;
		border: 1rpx solid #f5f5f5;
	}

	.sp-logo-placeholder {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: #f0f0f0;
		margin-bottom: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ccc;
		font-size: 20rpx;
		font-weight: bold;
	}

	.sp-name {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
		width: 100%;
		text-align: center;
		margin-bottom: 12rpx;
	}

	/* 单行省略 */
	.text-ellipsis {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.sp-tag-row {
		display: flex;
		justify-content: center;
		margin-top: 8rpx;
	}

	.sp-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;

		&.money {
			color: #FF6F00;
			background: #FFF0E0;
			border: 1rpx solid rgba(255, 111, 0, 0.2);
		}

		&.goods {
			color: #19be6b;
			background: #e1f3d8;
			border: 1rpx solid rgba(25, 190, 107, 0.2);
		}

		&.mixed {
			color: #722ed1;
			background: #f9f0ff;
			border: 1rpx solid rgba(114, 46, 209, 0.2);
		}
	}

	.tag-icon {
		font-size: 18rpx;
		margin: 0 2rpx;
	}

	.detail-interactions {
		display: flex;
		justify-content: space-around;
		align-items: center;
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 0 30rpx 30rpx;
		padding: 24rpx 0;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;
	}

	.interaction-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
		color: #666;
		font-size: 28rpx;
		padding: 10rpx 30rpx;
		border-radius: 40rpx;
		transition: all 0.2s;
	}

	.interaction-item text {
		font-weight: 500;
	}

	.interaction-item:active {
		background-color: #f5f5f5;
	}

	/* 激活状态下的微调 */
	.interaction-item.active text {
		color: inherit;
		/* 颜色由图标决定，或者此处指定特定颜色 */
	}
</style>