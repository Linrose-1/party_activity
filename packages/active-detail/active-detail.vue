<template>
	<!-- 使用 v-if 确保在数据加载完成后再渲染主要内容，避免闪烁和错误 -->
	<view v-if="activityDetail" class="page">

		<!-- 聚会封面轮播 -->
		<view class="banner-section">
			<swiper v-if="bannerImages.length > 0" class="banner-swiper" circular indicator-dots autoplay
				:interval="4000" :duration="500">
				<swiper-item v-for="(img, index) in bannerImages" :key="index">
					<image :src="img" class="banner-image" mode="aspectFill" @click="previewBanner(index)" />
				</swiper-item>
			</swiper>

			<!-- 无封面图时的占位 -->
			<view v-else class="banner-placeholder">
				<uni-icons type="image" size="40" color="#ccc"></uni-icons>
			</view>

			<!-- 标签浮层 -->
			<view class="tags-overlay" v-if="activityDetail.tags && activityDetail.tags.length > 0">
				<text class="event-cover-text">{{ activityDetail.tags.join(' · ') }}</text>
			</view>
		</view>

		<!-- 聚会状态横幅 -->
		<view v-if="statusInfo.text" class="status-banner" :style="{ backgroundColor: statusInfo.color }">
			{{ statusInfo.text }}
		</view>

		<!-- 最低起聚名额提示 -->
		<view v-if="showLimitSlotsTip" class="limit-slots-tip">
			<uni-icons type="info-filled" color="#e6a23c" size="16" style="margin-right: 10rpx;"></uni-icons>
			当前报名人数未达到最低起聚名额 ({{ activityDetail.limitSlots }}人)，聚会可能被取消；若有收费聚会组织者将退回报名费用。
		</view>

		<!-- 聚会基础信息 -->
		<view class="event-header">
			<text class="event-title">{{ activityDetail.activityTitle }}</text>
			<view class="event-meta">
				<uni-icons type="calendar" size="18" color="#FF6B00" />
				<text>{{ formattedActivityTime }}</text>
			</view>
			<view class="event-meta">
				<uni-icons type="location" size="18" color="#FF6B00" />
				<text>{{ activityDetail.locationAddress }}</text>
			</view>
			<view class="event-stats">
				<view class="stat-item">
					<view class="stat-value">{{ participantTotal || 0 }}</view>
					<view class="stat-label">已报名</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{ activityDetail.totalSlots }}</view>
					<view class="stat-label">总名额</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">
						<text
							v-if="[1, 3].includes(activityDetail.activityFunds)">¥{{ activityDetail.registrationFee }}</text>
						<text v-else-if="activityDetail.activityFunds === 2">免费</text>
					</view>
					<view class="stat-label">报名费</view>
				</view>
			</view>
		</view>

		<!-- 聚会介绍与环节 -->
		<view class="event-content">
			<!-- 聚会介绍 -->
			<view class="content-section">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">聚会介绍</text>
				</view>
				<view class="event-description-text">
					{{ activityDetail.activityDescription }}
				</view>
			</view>

			<!-- 聚会环节（时间轴） -->
			<view class="content-section" style="margin-top: 40rpx;">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">聚会内容</text>
				</view>
				<view class="timeline-box">
					<view class="timeline-item" v-for="(item, index) in activityDetail.memberActivitySessionList"
						:key="item.id">
						<view class="timeline-line-col">
							<view class="dot"></view>
							<view class="line" v-if="index !== activityDetail.memberActivitySessionList.length - 1">
							</view>
						</view>
						<view class="timeline-content-col">
							<view class="session-name">{{ item.sessionTitle }}</view>
							<view class="session-detail">{{ item.sessionDescription }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 聚会组织者 -->
		<view class="organizer-section">
			<view class="organizer-title">聚会组织者</view>
			<view class="organizer-info" @click="navigateToBusinessCard(activityDetail.memberUser, true)">
				<view class="organizer-avatar-wrap">
					<!-- 修复：<img> → <image>，小程序不支持原生 HTML img 标签 -->
					<image :src="activityDetail.memberUser.avatar" class="organizer-avatar-img" mode="aspectFill" />
				</view>
				<view>
					<view class="organizer-name">{{ activityDetail.memberUser.nickname }}</view>
					<view class="organizer-company">联系电话: {{ activityDetail.organizerContactPhone }}</view>
				</view>
			</view>
		</view>

		<!-- 关联聚店信息 -->
		<view v-if="activityDetail.memberStoreRespVO" class="business-section"
			@click="navigateToStoreDetail(activityDetail.memberStoreRespVO)">
			<view class="business-title">聚会聚店</view>
			<view class="business-info">
				<view class="business-logo">
					<image v-if="activityDetail.memberStoreRespVO.storeCoverImageUrl"
						:src="activityDetail.memberStoreRespVO.storeCoverImageUrl" class="store-logo-image" />
					<uni-icons v-else type="shop-filled" size="24" color="#fff" />
				</view>
				<view class="business-details">
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

		<!-- 聚会贡分说明 -->
		<!-- 修复：<span> → <text>，小程序不支持原生 HTML span 标签 -->
		<view class="organizer-section">
			<view class="organizer-title">聚会贡分</view>
			<view class="organizer-info">
				<view class="organizer-name">参与本次聚会，聚会结束可以获得<text style="color: #ff6b00;">100</text>贡分</view>
			</view>
		</view>

		<!-- 参与用户 -->
		<view class="participants-section">
			<view class="participants-header">
				<view class="participants-title">参与用户</view>
				<view v-if="participantTotal > 0" class="view-all-link" @click="viewAllUsers">查看全部 ></view>
			</view>
			<view v-if="participantList.length > 0" class="participants-body">
				<!-- 头像组独占一行 -->
				<view class="avatar-group">
					<image v-for="participant in participantList" :key="participant.id"
						:src="participant.memberUser.avatar" class="avatar-item" />
					<view v-if="participantTotal > participantList.length" class="avatar-item more-avatars">
						...
					</view>
				</view>
				<!-- 人数统计独占一行，显示在头像下方 -->
				<view class="total-registered-info">
					<text class="registered-count">{{ participantTotal }}</text>
					<text> 人已报名</text>
				</view>
			</view>
			<view v-else class="no-participants">
				<text>暂无用户报名，快来成为第一个参与者吧！</text>
			</view>
		</view>

		<!-- 赞助商（横向滚动） -->
		<view class="sponsor-section" v-if="sponsorList && sponsorList.length > 0">
			<view class="section-title">
				赞助单位
				<text style="font-size: 24rpx; color:#999; margin-left: 10rpx;">({{ sponsorList.length }})</text>
			</view>
			<scroll-view scroll-x class="sponsor-scroll" enable-flex>
				<view class="sponsor-item-card" v-for="(item, index) in sponsorList" :key="item.id"
					@click="navigateToSponsorDetail(item)">
					<image v-if="item.logoUrl" :src="item.logoUrl" mode="aspectFit" class="sp-logo"></image>
					<view v-else class="sp-logo-placeholder">
						<text>LOGO</text>
					</view>
					<view class="sp-name text-ellipsis">{{ item.sponsorName }}</view>
					<view class="sp-tag-row">
						<view v-if="item.sponsorType === 1" class="sp-tag money">现金</view>
						<view v-else-if="item.sponsorType === 2" class="sp-tag goods">物品</view>
						<view v-else-if="item.sponsorType === 3" class="sp-tag mixed">
							<text class="tag-icon">💰</text>+<text class="tag-icon">🎁</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 浏览留痕模块 -->
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
					<view class="avatar-stack-item" v-for="(item, index) in viewerList" :key="item.id">
						<!-- 修复：可选链 ?. 兼容性写法 -->
						<image
							:src="item.memberUser && item.memberUser.avatar ? item.memberUser.avatar : '/static/icon/default-avatar.png'"
							class="v-avatar" mode="aspectFill"></image>
					</view>
					<view v-if="viewerTotal > 7" class="more-dots">
						<text class="mdot"></text>
						<text class="mdot"></text>
						<text class="mdot"></text>
					</view>
				</view>
				<view class="viewer-tips">
					已有 {{ viewerTotal }} 位商友关注了您的聚会
				</view>
			</view>
		</view>



		<!-- 评论预览：整体可点击，回到详情页时 onShow 自动刷新 -->
		<view class="comment-preview-card" @click="goToCommentPage">
			<view class="preview-header">
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
			<view class="preview-list" v-if="commentPreviewList.length > 0">
				<view class="preview-item" v-for="c in commentPreviewList" :key="c.id">
					<!-- 修复：可选链兼容写法 -->
					<text
						class="p-user">{{ c.anonymous === 1 ? '匿名商友' : (c.memberUserBaseVO && c.memberUserBaseVO.nickname ? c.memberUserBaseVO.nickname : '商友') }}:</text>
					<text class="p-content">{{ c.content }}</text>
				</view>
			</view>
			<view v-else class="preview-empty">
				<uni-icons type="chatbubble" size="18" color="#ccc"></uni-icons>
				<text>暂无评论，点击发表第一条评论</text>
			</view>
		</view>

		<!-- 报名时间 -->
		<view style="margin: 20rpx auto; flex: 1; text-align: center;">
			报名时间：
			<!-- 修复：<span> → <text> -->
			<text style="color: #ff1a3c;">
				{{ formattedRegistrationTimes.start }} - {{ formattedRegistrationTimes.end }}
			</text>
		</view>

		<!-- 赞踩互动胶囊 -->
		<view class="interaction-capsule-section">
			<view class="capsule-container">
				<!-- 修复：激活类名改为独立平铺类，避免 WXSS &嵌套报错 -->
				<view class="capsule-item" :class="activityDetail.userLikeStr === 'like' ? 'capsule-like-active' : ''"
					@click="toggleAction('like')">
					<uni-icons :type="activityDetail.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="22"
						:color="activityDetail.userLikeStr === 'like' ? '#FF6B00' : '#666'"></uni-icons>
					<text class="count">{{ activityDetail.likesCount || 0 }}</text>
					<text class="label">靠谱</text>
				</view>
				<view class="capsule-divider"></view>
				<view class="capsule-item"
					:class="activityDetail.userLikeStr === 'dislike' ? 'capsule-dislike-active' : ''"
					@click="toggleAction('dislike')">
					<uni-icons :type="activityDetail.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'"
						size="22" :color="activityDetail.userLikeStr === 'dislike' ? '#3498db' : '#666'"></uni-icons>
					<text class="count">{{ activityDetail.dislikesCount || 0 }}</text>
					<text class="label">无感</text>
				</view>
			</view>
		</view>

		<view style="width: 100%; height: 100rpx;"></view>

		<!-- 底部操作栏 -->
		<view class="action-bar" v-if="!isActionBarHidden">
			<view class="action-btn share-btn" @click="openSharePopup">
				<text>🔗聚会分享</text>
			</view>
			<view class="action-btn register-btn" :class="{ 'disabled': !isRegistrationActive }"
				:disabled="!isRegistrationActive" @click="register">
				<text>➕立即报名</text>
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

		<!-- 朋友圈分享引导遮罩 -->
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
	} from 'vue';
	import {
		onLoad,
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import {
		getInviteCode,
		checkLoginGuard
	} from '../../utils/user.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	// ─── 核心数据 ───
	const activityId = ref(null);
	const activityDetail = ref(null);
	const sponsorList = ref([]);
	const loggedInUserId = ref(null);

	// ─── 报名用户 ───
	const participantList = ref([]);
	const participantTotal = ref(0);

	// ─── 浏览留痕 ───
	const viewerList = ref([]);
	const viewerTotal = ref(0);

	// ─── 评论预览 ───
	const commentPreviewList = ref([]);
	const commentTotal = ref(0);

	// ─── 互动防重复点击 ───
	const isActionInProgress = ref(false);

	// ─── 分享弹窗 ───
	const sharePopup = ref(null);
	const customShareTitle = ref('');
	const showTimelineGuide = ref(false);
	const isActionBarHidden = ref(false);

	// ─── 贡分弹窗 ───
	const pointsPopup = ref(null);


	// ─── 生命周期 ───

	onLoad((options) => {
		// 落地页邀请码：暂存供后续注册流程使用
		if (options && options.inviteCode) {
			uni.setStorageSync('pendingInviteCode', options.inviteCode);
		}

		loggedInUserId.value = uni.getStorageSync('userId');

		if (!options.id) {
			console.error('[聚会详情] 缺少聚会ID');
			uni.showToast({
				title: '加载聚会详情失败，缺少ID',
				icon: 'none'
			});
			return;
		}

		activityId.value = options.id;
		getActiveDetail();
		getParticipantList();
		getCommentPreview();

		// 处理分享落地加分逻辑
		if (options.sharerId) {
			const sharerId = options.sharerId;
			const bizId = options.id;

			if (sharerId === loggedInUserId.value) {
				// 用户点击了自己发出的分享链接，不计分
				console.log('[分享加分] 本人点击，跳过');
			} else if (loggedInUserId.value && bizId) {
				// 已登录，直接为分享者触发加分
				triggerShareHitApi(sharerId, bizId);
			} else if (bizId) {
				// 未登录，暂存等登录后处理
				uni.setStorageSync('pendingShareReward', {
					sharerId,
					bizId,
					type: 31
				});
			}
		}

		// 允许右上角菜单发起分享
		uni.showShareMenu({
			menus: ['shareAppMessage', 'shareTimeline']
		});
	});

	/**
	 * 每次回到详情页时重新拉取评论预览
	 * 评论页发布/删除评论成功后，用户返回时 onShow 自动触发此处刷新
	 * 无需依赖 uni.$emit，onShow 机制更简洁可靠
	 */
	onShow(() => {
		if (activityId.value) {
			getCommentPreview();
		}
	});


	// ─── 计算属性 ───

	/**
	 * 判断当前登录用户是否为本次聚会的组织者
	 * 用于决定报名列表页是否显示管理入口
	 */
	const isOrganizer = computed(() => {
		if (!loggedInUserId.value || !activityDetail.value || !activityDetail.value.memberUser) return false;
		return parseInt(loggedInUserId.value) === activityDetail.value.memberUser.id;
	});

	/**
	 * 判断当前是否处于可报名状态（status === 2 表示"报名中"）
	 * 控制底部"立即报名"按钮的激活/禁用
	 */
	const isRegistrationActive = computed(() => {
		if (!activityDetail.value) return false;
		return activityDetail.value.status === 2;
	});

	/**
	 * 格式化聚会起止时间，返回 "开始时间 至 结束时间"
	 */
	const formattedActivityTime = computed(() => {
		if (!activityDetail.value) return '';
		return formatDateTime(activityDetail.value.startDatetime) + ' 至 ' + formatDateTime(activityDetail.value
			.endDatetime);
	});

	/**
	 * 格式化报名开始和截止时间，返回 { start, end }
	 */
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

	/**
	 * 根据聚会 status 返回对应的状态文字和颜色
	 * 用于顶部状态横幅的动态样式绑定
	 */
	const statusInfo = computed(() => {
		if (!activityDetail.value) return {
			text: '',
			color: ''
		};
		const map = {
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
			}
		};
		return map[activityDetail.value.status] || {
			text: '状态未知',
			color: '#909399'
		};
	});

	/**
	 * 判断是否显示"起聚名额未达到"提示
	 * 仅在"未开始"或"报名中"、且当前报名人数不足最低名额时显示
	 */
	const showLimitSlotsTip = computed(() => {
		if (!activityDetail.value) return false;
		const inRelevantStatus = [1, 2].includes(activityDetail.value.status);
		const notEnough = (activityDetail.value.joinCount || 0) < activityDetail.value.limitSlots;
		return inRelevantStatus && notEnough;
	});

	/**
	 * 封面轮播图数组
	 * 优先使用图集字段 activityCoverImageUrls，降级使用单张封面 coverImageUrl
	 */
	const bannerImages = computed(() => {
		if (!activityDetail.value) return [];
		if (activityDetail.value.activityCoverImageUrls && activityDetail.value.activityCoverImageUrls.length >
			0) {
			return activityDetail.value.activityCoverImageUrls;
		}
		if (activityDetail.value.coverImageUrl) {
			return [activityDetail.value.coverImageUrl];
		}
		return [];
	});


	// ─── 工具函数 ───

	/**
	 * 格式化时间戳为 YYYY-MM-DD HH:mm 格式
	 * @param {number} timestamp - 毫秒时间戳
	 * @returns {string} 格式化后的时间字符串，无值时返回 "时间待定"
	 */
	const formatDateTime = (timestamp) => {
		if (!timestamp) return '时间待定';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return Y + '-' + M + '-' + D + ' ' + h + ':' + m;
	};


	// ─── 数据请求 ───

	/**
	 * 获取聚会详情
	 * 同时处理赞助商列表解析和阅读贡分弹窗触发
	 * 成功后调用 getViewerList（传 activityId.value，修复传 Ref 对象的 bug）
	 */
	const getActiveDetail = async () => {
		if (!activityId.value) return;

		const result = await request('/app-api/member/activity/get', {
			method: 'GET',
			data: {
				id: activityId.value
			}
		});

		if (result && !result.error) {
			activityDetail.value = result.data;

			// 修复：传 activityId.value（字符串/数字），原来传的是 Ref 对象导致接口参数错误
			getViewerList(activityId.value);

			sponsorList.value = (result.data.memberSponsorList && Array.isArray(result.data.memberSponsorList)) ?
				result.data.memberSponsorList : [];

			// 后端标记需要触发贡分弹窗时，延迟 500ms 弹出（等页面渲染完成）
			if (result.data.checkContribution === 1) {
				setTimeout(() => {
					if (pointsPopup.value) pointsPopup.value.show('阅读聚会详情', 10);
				}, 500);
			}
		} else {
			console.error('[聚会详情] 获取失败:', result ? result.error : '无返回');
		}
	};

	/**
	 * 获取报名用户列表（仅取前 8 条，用于详情页头像预览）
	 */
	const getParticipantList = async () => {
		if (!activityId.value) return;

		const {
			data,
			error
		} = await request('/app-api/member/activity-join/list', {
			method: 'GET',
			data: {
				activityId: activityId.value,
				pageNo: 1,
				pageSize: 8
			}
		});

		if (error) {
			console.error('[报名列表] 获取失败:', error);
			return;
		}
		if (data && data.list) {
			participantList.value = data.list;
			participantTotal.value = data.total;
		}
	};

	/**
	 * 获取浏览留痕列表（仅本人创建的聚会后端才返回数据）
	 * @param {string|number} id - 聚会 ID（注意：传值而非 Ref）
	 */
	const getViewerList = async (id) => {
		const {
			data
		} = await request('/app-api/member/target-view/page', {
			method: 'GET',
			data: {
				targetId: id,
				targetType: 'activity',
				pageNo: 1,
				pageSize: 7
			}
		});

		if (data) {
			viewerList.value = data.list || [];
			viewerTotal.value = data.total || 0;
		}
	};

	/**
	 * 获取评论预览（最新 2 条 + 总数）
	 * 在 onLoad 初次加载和 onShow 返回页面时都会调用
	 * 确保从评论页评论/删除后返回时，预览数据保持最新
	 */
	const getCommentPreview = async () => {
		if (!activityId.value) return;

		const {
			data
		} = await request('/app-api/member/comment/select-type-target-id', {
			method: 'GET',
			data: {
				targetId: activityId.value,
				targetType: 'activity'
			}
		});

		if (data && Array.isArray(data)) {
			commentTotal.value = data.length;
			commentPreviewList.value = data.slice(0, 2);
		}
	};


	// ─── 互动操作 ───

	/**
	 * 切换点赞 / 踩
	 * 采用乐观更新策略：先更新 UI，接口失败后回滚
	 * 成功后通过 uni.$emit 通知聚会列表页精准更新对应卡片字段
	 * 避免返回列表时数据不同步（原代码缺少此 emit，为 bug）
	 * @param {'like'|'dislike'} clickedAction - 用户点击的操作类型
	 */
	const toggleAction = async (clickedAction) => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		isActionInProgress.value = true;

		// 备份原始状态，用于接口失败时回滚
		const originalAction = activityDetail.value.userLikeStr;
		const originalLikes = activityDetail.value.likesCount;
		const originalDislikes = activityDetail.value.dislikesCount;

		// 已是当前操作则取消（toggle），否则执行新操作
		const apiAction = originalAction === clickedAction ? 'cancel' : clickedAction;

		// 乐观更新本地 UI
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
					targetType: 'activity',
					action: apiAction
				}
			});

			if (error) throw new Error(error);

			// 通知聚会列表页更新对应卡片的赞踩字段，避免返回列表时数据不一致
			uni.$emit('activityInteractionChanged', {
				id: Number(activityId.value),
				type: 'action',
				userLikeStr: activityDetail.value.userLikeStr,
				likesCount: activityDetail.value.likesCount,
				dislikesCount: activityDetail.value.dislikesCount
			});
		} catch (e) {
			// 接口失败，回滚本地状态
			activityDetail.value.userLikeStr = originalAction;
			activityDetail.value.likesCount = originalLikes;
			activityDetail.value.dislikesCount = originalDislikes;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};


	// ─── 页面操作 ───

	/**
	 * 打开分享弹窗，默认标题为聚会名称
	 * 需先校验登录状态
	 */
	const openSharePopup = async () => {
		if (!await checkLoginGuard()) return;
		customShareTitle.value = (activityDetail.value && activityDetail.value.activityTitle) ||
			'发现一个很棒的聚会，快来看看吧！';
		sharePopup.value.open();
	};

	/**
	 * 关闭分享弹窗
	 */
	const closeSharePopup = () => {
		sharePopup.value.close();
	};

	/**
	 * 引导用户分享到朋友圈
	 * 关闭弹窗并显示右上角操作指引遮罩
	 */
	const guideShareTimeline = () => {
		closeSharePopup();
		showTimelineGuide.value = true;
	};

	/**
	 * 隐藏朋友圈分享引导遮罩（用户点击遮罩任意位置关闭）
	 */
	const hideTimelineGuide = () => {
		showTimelineGuide.value = false;
	};

	/**
	 * uni-popup 开关状态回调
	 * 弹窗打开时隐藏底部操作栏，避免视觉遮挡
	 * @param {{ show: boolean }} e - 弹窗状态事件对象
	 */
	const onPopupChange = (e) => {
		isActionBarHidden.value = e.show;
	};

	/**
	 * 预览封面图大图模式
	 * @param {number} index - 当前点击图片的索引
	 */
	const previewBanner = (index) => {
		uni.previewImage({
			urls: bannerImages.value,
			current: index
		});
	};

	/**
	 * 跳转到完整报名用户列表页
	 * 若为组织者，携带 isOrganizer 参数以显示管理功能
	 */
	const viewAllUsers = () => {
		if (participantTotal.value === 0) {
			uni.showToast({
				title: '暂无用户报名',
				icon: 'none'
			});
			return;
		}
		let url = '/pages/activity-participants/activity-participants?id=' + activityId.value;
		if (isOrganizer.value) url += '&isOrganizer=1';
		uni.navigateTo({
			url
		});
	};

	/**
	 * 跳转到评论页（评论页和聚店共用同一个页面，通过 type 区分）
	 */
	const goToCommentPage = () => {
		uni.navigateTo({
			url: '/packages/comment-page/comment-page?id=' + activityId.value + '&type=activity'
		});
	};

	/**
	 * 跳转到浏览留痕完整列表页
	 */
	const goToTraceList = () => {
		uni.navigateTo({
			url: '/packages/user-view-trace/user-view-trace?id=' + activityId.value + '&type=activity'
		});
	};

	/**
	 * 点击"立即报名"
	 * 先校验登录，再校验是否处于报名中状态，通过后跳转报名页
	 */
	const register = async () => {
		if (!await checkLoginGuard()) return;
		if (!isRegistrationActive.value) {
			uni.showToast({
				title: '当前非报名时间',
				icon: 'none'
			});
			return;
		}
		uni.navigateTo({
			url: '/packages/active-enroll/active-enroll?id=' + activityId.value
		});
	};

	/**
	 * 跳转到赞助商详情页
	 * @param {object} item - 赞助商数据对象，需包含 id 字段
	 */
	const navigateToSponsorDetail = (item) => {
		if (!item.id) return;
		uni.navigateTo({
			url: '/pages/sponsor-detail/sponsor-detail?sponsorId=' + item.id + '&activityId=' + activityId
				.value
		});
	};

	/**
	 * 跳转到用户名片申请页
	 * @param {object} user - 用户对象 { id, nickname, avatar }
	 * @param {boolean} isFreeView - 是否免费查看（从组织者卡片点击时为 true）
	 */
	const navigateToBusinessCard = (user, isFreeView = false) => {
		const name = user.nickname || '匿名用户';
		const avatarUrl = user.avatar || '/static/images/default-avatar.png';
		let url = '/packages/applicationBusinessCard/applicationBusinessCard?id=' + user.id +
			'&name=' + encodeURIComponent(name) +
			'&avatar=' + encodeURIComponent(avatarUrl);
		if (isFreeView) url += '&fromShare=1';
		uni.navigateTo({
			url
		});
	};

	/**
	 * 跳转到关联聚店详情页
	 * @param {object} store - 聚店对象，需包含 id 字段
	 */
	const navigateToStoreDetail = (store) => {
		if (!store || !store.id) {
			uni.showToast({
				title: '无法查看聚店详情',
				icon: 'none'
			});
			return;
		}
		uni.navigateTo({
			url: '/packages/shop-detail/shop-detail?id=' + store.id
		});
	};


	// ─── 分享加分 ───

	/**
	 * 调用分享命中接口，为分享者增加贡分
	 * 当已登录用户通过分享链接进入详情页时触发
	 * @param {string} sharerId - 发起分享的用户 ID
	 * @param {string} bizId - 被分享的聚会 ID
	 */
	const triggerShareHitApi = async (sharerId, bizId) => {
		if (!sharerId || !bizId) return;
		const {
			error
		} = await request('/app-api/member/experience-record/share-experience-hit', {
			method: 'POST',
			data: {
				type: 31,
				shareUserId: sharerId,
				bizId
			}
		});
		if (error) {
			console.error('[分享加分] 接口失败:', error);
		} else {
			console.log('[分享加分] 成功触发, sharerId:', sharerId);
		}
	};


	// ─── 分享配置 ───

	/**
	 * 分享给好友
	 * 在分享路径中携带分享者 ID 和邀请码，用于落地页加分和邀请绑定
	 */
	onShareAppMessage(() => {
		closeSharePopup();
		const sharerId = uni.getStorageSync('userId');
		const inviteCode = getInviteCode();
		const finalTitle = customShareTitle.value ||
			(activityDetail.value && activityDetail.value.activityTitle) ||
			'发现一个很棒的聚会，快来看看吧！';

		let sharePath = '/packages/active-detail/active-detail?id=' + (activityDetail.value && activityDetail.value
			.id);
		if (sharerId) sharePath += '&sharerId=' + sharerId;
		if (inviteCode) sharePath += '&inviteCode=' + inviteCode;

		return {
			title: finalTitle,
			path: sharePath,
			imageUrl: (activityDetail.value && activityDetail.value.coverImageUrl) ||
				'/static/default-share-image.png'
		};
	});

	/**
	 * 分享到朋友圈
	 * 朋友圈不支持 path，改用 query 参数携带分享者 ID 和邀请码
	 */
	onShareTimeline(() => {
		const sharerId = uni.getStorageSync('userId');
		const inviteCode = getInviteCode();
		const finalTitle = customShareTitle.value ||
			(activityDetail.value && activityDetail.value.activityTitle) ||
			'发现一个很棒的聚会，快来看看吧！';

		let queryString = 'id=' + (activityDetail.value && activityDetail.value.id) + '&from=timeline';
		if (sharerId) queryString += '&sharerId=' + sharerId;
		if (inviteCode) queryString += '&inviteCode=' + inviteCode;

		return {
			title: finalTitle,
			query: queryString,
			imageUrl: (activityDetail.value && activityDetail.value.coverImageUrl) ||
				'/static/default-share-image.png'
		};
	});
</script>

<style lang="scss" scoped>
	.page {
		padding-bottom: 120rpx;
		background-color: #f8f8f8;
	}

	/* ── 封面轮播 ── */
	.banner-section {
		position: relative;
		width: 100%;
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

	.tags-overlay {
		position: absolute;
		bottom: 20rpx;
		left: 20rpx;
		z-index: 10;
	}

	.event-cover-text {
		color: white;
		font-size: 26rpx;
		font-weight: bold;
		padding: 8rpx 16rpx;
		background-color: rgba(0, 0, 0, 0.4);
		border-radius: 8rpx;
	}

	/* ── 状态横幅 & 提示 ── */
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

	/* ── 通用卡片 ── */
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

	/* ── 聚会基础信息 ── */
	.event-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		display: block;
	}

	.event-meta {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		margin: 10rpx 0;
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

	/* ── 内容区 ── */
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

	.event-description-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		text-align: justify;
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* ── 时间轴 ── */
	.timeline-box {
		padding-left: 10rpx;
	}

	.timeline-item {
		display: flex;
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
		box-sizing: border-box;
	}

	.line {
		width: 2rpx;
		background-color: #e0e0e0;
		flex: 1;
		margin-top: 8rpx;
		min-height: 40rpx;
	}

	.timeline-content-col {
		flex: 1;
		padding-bottom: 40rpx;
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
		padding: 20rpx;
		border-radius: 12rpx;
		white-space: pre-wrap;
	}

	/* ── 组织者 ── */
	.organizer-title,
	.business-title,
	.participants-title {
		font-weight: bold;
		font-size: 30rpx;
		margin-bottom: 20rpx;
		display: block;
	}

	.organizer-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.organizer-avatar-wrap {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		background: linear-gradient(45deg, #ffb347, #ffcc33);
	}

	.organizer-avatar-img {
		width: 100%;
		height: 100%;
	}

	.organizer-name {
		font-weight: bold;
		font-size: 28rpx;
		display: block;
		margin-bottom: 6rpx;
	}

	.organizer-company {
		font-size: 24rpx;
		color: #666;
	}

	/* ── 关联聚店 ── */
	.business-section {
		&:active {
			background-color: #fafafa;
		}
	}

	.business-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.business-logo {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		overflow: hidden;
		background: linear-gradient(45deg, #ffb347, #ffcc33);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.store-logo-image {
		width: 100%;
		height: 100%;
	}

	.business-details {
		flex: 1;
		min-width: 0;
	}

	.business-name {
		font-weight: bold;
		font-size: 28rpx;
		display: block;
		margin-bottom: 6rpx;
	}

	/* ── 参与用户 ── */
	.participants-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.participants-body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
		margin-left: 10rpx;
	}

	.view-all-link {
		font-size: 24rpx;
		color: #3a7bd5;
	}

	.avatar-group {
		display: flex;
	}

	.avatar-item {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
		margin-left: -20rpx;
		background: #f0f0f0;

		&:first-child {
			margin-left: 0;
		}
	}

	.more-avatars {
		background: #FF6B00;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 24rpx;
	}

	.total-registered-info {
		font-size: 26rpx;
		color: #666;
		margin-top: 16rpx;
	}

	.registered-count {
		color: #FF6B00;
		font-weight: bold;
	}

	.no-participants {
		padding: 20rpx 0;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}

	/* ── 赞助商 ── */
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

	/* ── 浏览留痕 ── */
	.viewer-module-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;

		&:active {
			background-color: #fafafa;
		}
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

		text {
			font-size: 24rpx;
			color: #999;
			margin-right: 4rpx;
		}
	}

	.avatar-stack {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 16rpx;
	}

	.avatar-stack-item {
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

	/* 修复：留痕省略点改为 .mdot，避免与时间轴 .dot 冲突 */
	.mdot {
		width: 6rpx;
		height: 6rpx;
		background-color: #ccc;
		border-radius: 50%;
		margin: 0 2rpx;
		display: inline-block;
	}

	.viewer-tips {
		font-size: 24rpx;
		color: #bbb;
	}

	/* ── 赞踩胶囊 ── */
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

		&:active {
			transform: scale(0.9);
			opacity: 0.7;
		}
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

	/* 修复：激活样式用独立类名，避免 WXSS 不支持 & 嵌套报错 */
	.capsule-like-active .count,
	.capsule-like-active .label {
		color: #FF6B00;
	}

	.capsule-dislike-active .count,
	.capsule-dislike-active .label {
		color: #3498db;
	}

	.capsule-divider {
		width: 2rpx;
		height: 40rpx;
		background-color: #eee;
		margin: 0 30rpx;
	}

	/* ── 评论预览 ── */
	.comment-preview-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #f0f0f0;

		&:active {
			background-color: #fafafa;
		}
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
		overflow: hidden;

		&:last-child {
			margin-bottom: 0;
		}
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

	/* ── 底部操作栏 ── */
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
		background: linear-gradient(to right, #4cd964, #34a853);
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

	/* ── 分享弹窗 ── */
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

		text {
			font-size: 24rpx;
			color: #666;
			margin-top: 10rpx;
		}
	}

	.share-channel-btn::after {
		border: none;
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

	/* ── 朋友圈引导遮罩 ── */
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