<template>
	<!-- user-select-text 类允许全页面文字可选择复制 -->
	<view v-if="activityDetail" class="page user-select-text">

		<!-- 1. 封面轮播区 -->
		<view class="banner-section">
			<swiper v-if="bannerImages.length > 0" class="banner-swiper" circular indicator-dots autoplay
				:interval="4000" :duration="500">
				<swiper-item v-for="(img, index) in bannerImages" :key="index">
					<image :src="img" class="banner-image" mode="aspectFill" @click="previewBanner(index)" />
				</swiper-item>
			</swiper>

			<!-- 1. 左上角：聚会类型 (从原左下角移来) -->
			<view class="tags-overlay-top" v-if="activityDetail.tags && activityDetail.tags.length > 0">
				<text class="event-cover-tag">{{ activityDetail.tags.join(' · ') }}</text>
			</view>

			<!-- 2. 右下角：用户的报名状态 -->
			<view class="join-status-overlay">
				<view class="status-pill" :class="'join-status-' + activityDetail.joinStatus">
					<uni-icons :type="joinStatusInfo.icon" size="14" color="#fff"></uni-icons>
					<text>{{ joinStatusInfo.text }}</text>
				</view>
			</view>

			<!-- 3. 左下角：赞助商迷你缩略区 -->
			<view class="sponsor-mini-card" v-if="sponsorList && sponsorList.length > 0" @click.stop="goToSponsorList">
				<!-- 赞助商列表容器：自动显示 1 个或 2 个 -->
				<view class="sponsor-mini-list">
					<view class="sp-mini-item" v-for="(item, index) in sponsorList.slice(0, 2)" :key="item.id">
						<image :src="item.logoUrl || '/static/images/default-avatar.png'" class="sp-mini-logo"
							mode="aspectFill" />
						<text class="sp-mini-name">{{ item.sponsorName }}</text>
					</view>
				</view>

				<!-- 引导标识：位于所有赞助商下方 -->
				<view class="sp-mini-more-box">
					<text class="sp-mini-more">>>></text>
				</view>
			</view>

			<!-- 原有的聚会状态标签 (移至右上角) 保持逻辑 -->
			<view v-if="statusInfo.text" class="status-tag" :style="{ backgroundColor: statusInfo.color }">
				{{ statusInfo.text }}
			</view>
		</view>

		<!-- 最低起聚名额提示 -->
		<view v-if="limitSlotsInfo" class="limit-slots-tip"
			:style="{ color: limitSlotsInfo.color, backgroundColor: limitSlotsInfo.bgColor, borderColor: limitSlotsInfo.color }">
			<uni-icons :type="limitSlotsInfo.isReached ? 'checkbox-filled' : 'info-filled'"
				:color="limitSlotsInfo.color" size="16" style="margin-right: 10rpx;"></uni-icons>
			<text>{{ limitSlotsInfo.text }}</text>
		</view>

		<!-- 2. 聚会基础信息区 -->
		<view class="event-header">
			<text class="event-title">{{ activityDetail.activityTitle }}</text>

			<view class="info-list">
				<view class="info-item">
					<text class="info-label">聚会时间：</text>
					<text class="info-value">{{ formattedActivityTime }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">报名时间：</text>
					<text class="info-value highlight">{{ formattedRegistrationTimes.start }} 至
						{{ formattedRegistrationTimes.end }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">导航地址：</text>
					<!-- 蓝色下划线，点击导航 -->
					<text class="info-value nav-link"
						@click="openLocationMap">{{ activityDetail.locationAddress }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">聚会地点：</text>
					<text class="info-value">{{ activityDetail.activityLocation || "未公开地点"}}</text>
				</view>
				<view class="info-item" v-if="activityDetail.memberStoreRespVO">
					<text class="info-label">本次聚店：</text>
					<text class="info-value nav-link clickable-venue"
						@click="navigateToStoreDetail(activityDetail.memberStoreRespVO)">
						{{ activityDetail.memberStoreRespVO.storeName }}
					</text>
				</view>
				<view class="info-item invite-item-block" v-if="isOrganizer && activityDetail.inviteCode">
					<text class="info-label">邀请码：</text>
					<view class="invite-content-box">
						<view class="code-line">
							<text class="info-value theme-text bold-code">{{ activityDetail.inviteCode }}</text>
							<text class="copy-tag theme-copy-btn" @click="copyInviteCode">复制</text>
						</view>
						<!-- 【说明】 -->
						<text class="invite-usage-hint">(请复制专属邀请码发给受邀人员完成邀约)</text>
					</view>
				</view>
				<view class="info-item invite-item-block exclusive-block"
					v-if="isOrganizer && activityDetail.exclusiveInviteCode">
					<text class="info-label">专属码：</text>
					<view class="invite-content-box">
						<view class="code-line">
							<!-- 逻辑：根据 isExclusiveVisible 判断显示明文还是星号 -->
							<text class="info-value theme-text bold-code">
								{{ isExclusiveVisible ? activityDetail.exclusiveInviteCode : '**********' }}
							</text>
							<view class="eye-btn" @click="isExclusiveVisible = !isExclusiveVisible">
								<uni-icons :type="isExclusiveVisible ? 'eye-filled' : 'eye-slash-filled'" size="20"
									color="#FF62B1" />
							</view>
							<text v-if="isExclusiveVisible" class="copy-tag theme-copy-btn"
								@click="copyExclusiveCode">复制</text>
						</view>
						<text class="invite-usage-hint warning-hint">此为专属免费码。转发给商友后，对方可免支付报名（AA聚会亦有效），请谨慎分享！</text>
					</view>
				</view>
			</view>

			<view class="event-stats">
				<view class="stat-item" @click="viewAllUsers">
					<view class="stat-value">{{ participantTotal || 0 }}</view>
					<view class="stat-label underlined">已报名</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{ activityDetail.totalSlots }}</view>
					<view class="stat-label">总名额</view>
				</view>
				<view class="stat-item" @click="register">
					<view class="stat-value">
						<text
							v-if="[1, 3].includes(activityDetail.activityFunds)">¥{{ activityDetail.registrationFee }}</text>
						<text v-else-if="activityDetail.activityFunds === 2">免费</text>
					</view>
					<view class="stat-label underlined">报名费</view>
				</view>
			</view>
		</view>

		<!-- 3. 聚会介绍与环节 -->
		<view class="event-content">
			<view class="content-section" style="margin-top: 40rpx;">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">聚会内容</text>
				</view>
				<!-- 隐私遮罩 -->
				<view v-if="isContentLocked" class="private-mask">
					<uni-icons type="eye-slash-filled" size="30" color="#FF62B1"></uni-icons>
					<text class="mask-text">聚会流程暂不公开</text>
				</view>
				<view v-else class="timeline-box">
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
			<view class="content-section">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">聚会介绍</text>
				</view>
				<view v-if="isContentLocked" class="private-mask">
					<uni-icons type="locked-filled" size="30" color="#FF62B1"></uni-icons>
					<text class="mask-text">非公开内容，需获取聚会邀请码报名之后才可查看信息内容</text>
				</view>
				<view v-else class="event-description-text">{{ activityDetail.activityDescription }}</view>
			</view>
		</view>

		<!-- 4. 组织者 -->
		<view class="organizer-section">
			<view class="section-header-row">
				<view class="header-mark"></view>
				<text class="section-title">聚会组织者</text>
				<text class="click-hint">>>></text>
			</view>
			<view class="organizer-info" @click="navigateToBusinessCard(activityDetail.memberUser, true)">
				<view class="organizer-avatar-wrap">
					<image :src="activityDetail.memberUser.avatar" class="organizer-avatar-img" mode="aspectFill" />
				</view>
				<view>
					<view class="organizer-name">{{ activityDetail.memberUser.nickname }}</view>
					<view class="organizer-company">联系电话: {{ activityDetail.organizerContactPhone || "未公开联系方式" }}</view>
				</view>
			</view>
		</view>

		<!-- 5. 聚店信息 -->
		<!-- <view v-if="activityDetail.memberStoreRespVO" class="business-section"
			@click="navigateToStoreDetail(activityDetail.memberStoreRespVO)">
			<view class="section-header-row">
				<view class="header-mark"></view>
				<text class="section-title">聚会聚店</text>
				<text class="click-hint">>>></text>
			</view>
			<view class="business-info">
				<view class="business-logo">
					<image v-if="activityDetail.memberStoreRespVO.storeCoverImageUrl"
						:src="activityDetail.memberStoreRespVO.storeCoverImageUrl" class="store-logo-image" />
					<uni-icons v-else type="shop-filled" size="24" color="#fff" />
				</view>
				<view class="business-details">
					<text class="business-name">{{ activityDetail.memberStoreRespVO.storeName }}</text>
					<view class="business-meta">
						<view class="meta-line">{{ activityDetail.memberStoreRespVO.fullAddress }}</view>
						<view class="meta-line">{{ activityDetail.memberStoreRespVO.contactPhone }}</view>
					</view>
				</view>
			</view>
		</view> -->

		<!-- 6. 贡分说明 -->
		<view class="organizer-section">
			<view class="section-header-row">
				<view class="header-mark"></view>
				<text class="section-title">聚会贡分</text>
			</view>
			<view class="organizer-info">
				<view class="organizer-name">参与本次聚会，聚会结束可以获得<text class="theme-text">100</text>贡分</view>
			</view>
		</view>

		<!-- 7. 参与用户 -->
		<!-- <view class="participants-section">
			<view class="participants-header">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">参与用户</text>
				</view>
				<view v-if="participantTotal > 0" class="view-all-link" @click="viewAllUsers">>>></view>
			</view>
			<view v-if="participantList.length > 0" class="participants-body">
				<view class="avatar-group">
					<image v-for="participant in participantList" :key="participant.id"
						:src="participant.memberUser.avatar" class="avatar-item" />
					<view v-if="participantTotal > participantList.length" class="avatar-item more-avatars">...</view>
				</view>
				<view class="total-registered-info">
					<text class="registered-count theme-text">{{ participantTotal }}</text>
					<text> 人已报名</text>
				</view>
			</view>
			<view v-else class="no-participants">暂无用户报名</view>
		</view> -->

		<!-- 8. 赞助单位 -->
		<view class="sponsor-section" v-if="sponsorList && sponsorList.length > 0">
			<view class="section-header-row">
				<view class="section-header-row">
					<view class="header-mark"></view>
					<text class="section-title">赞助单位</text>
					<text class="count-tag">({{ sponsorList.length }})</text>
				</view>
			</view>
			<view v-if="isContentLocked" class="private-mask" style="padding: 20rpx;">
				<text class="mask-text">赞助商信息已隐藏</text>
			</view>
			<scroll-view v-else scroll-x class="sponsor-scroll" enable-flex>
				<view class="sponsor-item-card" v-for="item in sponsorList" :key="item.id"
					@click="navigateToSponsorDetail(item)">
					<image v-if="item.logoUrl" :src="item.logoUrl" mode="aspectFit" class="sp-logo"></image>
					<view v-else class="sp-logo-placeholder"><text>LOGO</text></view>
					<view class="sp-name text-ellipsis">{{ item.sponsorName }}</view>
				</view>
			</scroll-view>
		</view>

		<!-- 9. 浏览留痕 -->
		<view class="viewer-module-card"
			v-if="activityDetail && activityDetail.isReadTrace === 1 && (viewerTotal > 0 || activityDetail.hasSilentLoginUser === 1)">
			<view class="viewer-header" @click="goToTraceList">
				<view class="section-header-row" style="margin-bottom: 0;">
					<view class="header-mark"></view>
					<text class="section-title">最近浏览</text>
					<view class="view-count-wrap" v-if="activityDetail.targetViewNum > 0">
						<uni-icons type="eye" size="16" color="#333"></uni-icons>
						<text class="total-num">{{ activityDetail.targetViewNum }}</text>
					</view>
				</view>
				<view v-if="activityDetail.targetViewNum > 0" class="view-all-link" @click="goToTraceList">>>></view>
				<!-- <view class="right-more">
					<text>详情</text>
					<uni-icons type="right" size="14" color="#FF62B1"></uni-icons>
				</view> -->
			</view>
			<view class="viewer-content" @click="goToTraceList">
				<view class="avatar-stack">
					<view class="avatar-stack-item" v-for="item in viewerList" :key="item.id">
						<image :src="item.memberUser?.avatar || '/static/icon/default-avatar.png'" class="v-avatar"
							mode="aspectFill"></image>
					</view>
					<view class="avatar-stack-item" v-if="activityDetail.hasSilentLoginUser === 1">
						<image
							src="https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png"
							class="v-avatar silent-avatar-border" mode="aspectFill"></image>
					</view>
				</view>
			</view>
		</view>

		<!-- 10. 商友评论 -->
		<view class="comment-preview-card" @click="goToCommentPage">
			<view class="preview-header">
				<view class="section-header-row" style="margin-bottom: 0;">
					<view class="header-mark"></view>
					<text class="section-title">商友评论</text>
					<text class="title-count" v-if="commentTotal > 0">{{ commentTotal }}</text>
				</view>
				<view v-if="commentTotal > 0" class="view-all-link" @click="goToCommentPage">>>></view>

				<!-- <view class="right-more">
					<text>查看全部</text>
					<uni-icons type="right" size="14" color="#FF62B1"></uni-icons>
				</view> -->
			</view>
			<view class="preview-list" v-if="commentPreviewList.length > 0">
				<view class="preview-item" v-for="c in commentPreviewList" :key="c.id">
					<text
						class="p-user">{{ c.anonymous === 1 ? '匿名商友' : (c.memberUserBaseVO?.nickname || '商友') }}:</text>
					<text class="p-content">{{ c.content }}</text>
				</view>
			</view>
			<view v-else class="preview-empty">暂无评论，点击发表第一条评论</view>
		</view>

		<!-- 11. 赞踩互动 -->
		<view class="interaction-capsule-section">
			<view class="capsule-container">
				<view class="capsule-item" :class="{ 'active': activityDetail.userLikeStr === 'like' }"
					@click="toggleAction('like')">
					<uni-icons :type="activityDetail.userLikeStr === 'like' ? 'hand-up-filled' : 'hand-up'" size="22"
						:color="activityDetail.userLikeStr === 'like' ? '#FF62B1' : '#666'"></uni-icons>
					<text class="count">{{ activityDetail.likesCount || 0 }}</text>
					<text class="label">靠谱</text>
				</view>
				<view class="capsule-divider"></view>
				<view class="capsule-item" :class="{ 'dislike-active': activityDetail.userLikeStr === 'dislike' }"
					@click="toggleAction('dislike')">
					<uni-icons :type="activityDetail.userLikeStr === 'dislike' ? 'hand-down-filled' : 'hand-down'"
						size="22" :color="activityDetail.userLikeStr === 'dislike' ? '#3498db' : '#666'"></uni-icons>
					<text class="count">{{ activityDetail.dislikesCount || 0 }}</text>
					<text class="label">无感</text>
				</view>
			</view>
		</view>

		<view style="height: 120rpx;"></view>

		<!-- 12. 底部操作栏 -->
		<view class="action-bar" v-if="!isActionBarHidden">
			<view class="action-btn share-btn" @click="openSharePopup">
				<text>🔗 智能分享</text>
			</view>
			<view class="action-btn register-btn"
				:class="{ 'disabled': !isRegistrationActive && activityDetail.joinStatus === 0 }" @click="register">
				<text>{{ activityDetail.joinStatus > 0 ? '🎫 聚会核销码' : '➕ 立即报名' }}</text>
			</view>
		</view>

		<!-- 分享弹窗 -->
		<uni-popup ref="sharePopup" type="bottom" background-color="#fff" @change="onPopupChange">
			<view class="share-popup-content">
				<view class="share-popup-title">自定义分享内容</view>

				<view class="share-title-editor">
					<text class="editor-label">分享标题:</text>
					<input class="editor-input" v-model="customShareTitle" placeholder="请输入分享标题" />
				</view>

				<!-- 发起人专属：携带邀请码开关 -->
				<view class="share-option-group"
					v-if="isOrganizer && (activityDetail.requireInviteCode === 1 || activityDetail.exclusiveInviteCode)">
					<view class="option-header">携带码设置 (单选)：</view>

					<radio-group @change="handleShareTypeChange">
						<!-- 1. 不携带 -->
						<label class="share-radio-item">
							<radio value="NONE" :checked="shareCodeType === 'NONE'" color="#FF62B1" />
							<text>不携带任何邀请码</text>
						</label>

						<!-- 2. 普通邀请码 -->
						<label class="share-radio-item" v-if="activityDetail.requireInviteCode === 1">
							<radio value="STANDARD" :checked="shareCodeType === 'STANDARD'" color="#FF62B1" />
							<view class="radio-txt-box">
								<text>携带聚会邀请码</text>
								<text class="sub-hint">受邀人需输入此码，且仍需支付报名费</text>
							</view>
						</label>

						<!-- 3. 专属免费码 -->
						<label class="share-radio-item" v-if="activityDetail.exclusiveInviteCode">
							<radio value="EXCLUSIVE" :checked="shareCodeType === 'EXCLUSIVE'" color="#FF62B1" />
							<view class="radio-txt-box">
								<text class="warning-text">携带专属免费邀请码</text>
								<text class="sub-hint">受邀人可直接免单报名成功，请谨慎！</text>
							</view>
						</label>
					</radio-group>
				</view>

				<view class="share-channels">
					<button class="share-channel-btn" open-type="share">
						<uni-icons type="weixin" size="34" color="#07c160"></uni-icons>
						<text>微信好友</text>
					</button>
					<button class="share-channel-btn" @click="guideShareTimeline">
						<uni-icons type="pyq" size="34" color="#53a046"></uni-icons>
						<text>朋友圈</text>
					</button>
				</view>
				<view class="share-popup-cancel" @click="closeSharePopup">取消</view>
			</view>
		</uni-popup>

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
	const includeInviteCodeInShare = ref(true);
	const currentStandardCode = ref(''); // 用来保存 URL 传进来的普通邀请码
	const currentExclusiveCode = ref(''); // 用来保存 URL 传进来的专属免费码

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
	const isExclusiveVisible = ref(false);
	const shareCodeType = ref('STANDARD');

	// ─── 贡分弹窗 ───
	const pointsPopup = ref(null);

	// 用来暂存 URL 传来的码
	const currentMeetingInviteCode = ref('');


	// ─── 生命周期 ───

	onLoad((options) => {
		console.log('📥 [详情页-接收] URL参数为:', options);
		// 1. 捕获普通邀请码
		if (options.inviteCode) {
			currentStandardCode.value = options.inviteCode;
		}

		// 2. 捕获专属免费码
		if (options.exclusiveInviteCode) {
			currentExclusiveCode.value = options.exclusiveInviteCode;
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
	 * 优化起聚名额提示逻辑
	 */
	const limitSlotsInfo = computed(() => {
		if (!activityDetail.value || !activityDetail.value.limitSlots) return null;

		// 获取当前人数和目标人数
		const currentCount = Number(participantTotal.value || activityDetail.value.joinCount || 0);
		const targetCount = Number(activityDetail.value.limitSlots);

		// 仅在"未开始(1)"或"报名中(2)"状态下提示
		const inRelevantStatus = [1, 2].includes(activityDetail.value.status);
		if (!inRelevantStatus) return null;

		const isReached = currentCount >= targetCount;

		return {
			isReached,
			text: isReached ?
				`该聚会已达到起聚人数（${targetCount}人），聚会将如期进行！` : `该聚会未达到起聚人数（${targetCount}人），聚会可能会被取消，敬请咨询聚会发起人。`,
			// 达到显示绿色，未达到显示主题色（粉色）
			color: isReached ? '#1FD6FE' : '#FF62B1',
			bgColor: isReached ? 'rgba(79, 172, 254, 0.08)' : 'rgba(255, 98, 177, 0.08)'
		};
	});

	const handleShareTypeChange = (e) => {
		shareCodeType.value = e.detail.value;
	};

	const copyExclusiveCode = () => {
		uni.setClipboardData({
			data: activityDetail.value.exclusiveInviteCode,
			success: () => uni.showToast({
				title: '专属码已复制',
				icon: 'none'
			})
		});
	};

	// 1. 用户的报名状态信息计算
	const joinStatusInfo = computed(() => {
		// 关键修复：显式判断数值，防止 0 被当作 null 处理
		// 逻辑：如果存在 activityDetail 且 joinStatus 不为 null/undefined，取原值，否则默认为 0
		const status = (activityDetail.value && activityDetail.value.joinStatus !== null && activityDetail.value
				.joinStatus !== undefined) ?
			activityDetail.value.joinStatus :
			0;

		const map = {
			0: {
				text: '未报名',
				icon: 'info',
				color: '#999'
			},
			1: {
				text: '待确认',
				icon: 'auth',
				color: '#f39c12'
			},
			2: {
				text: '已报名',
				icon: 'checkbox-filled',
				color: '#2ecc71'
			}
		};

		// 如果返回的状态码不在 0,1,2 范围内，兜底返回 0 的配置
		return map[status] || map[0];
	});

	/**
	 * 判断内容是否被锁定（非公开聚会且未获得详情数据）
	 */
	const isContentLocked = computed(() => {
		if (!activityDetail.value) return false;
		// 条件：非公开 (isPublic:0) 且后端没给关键数据 (比如介绍为空)
		// 注意：已报名用户后端会返回数据，此时 activityDescription 不为空，会自动解锁
		return activityDetail.value.isPublic === 0 && !activityDetail.value.activityDescription;
	});

	/**
	 * 切换分享时是否携带邀请码
	 */
	const toggleShareInviteCode = (e) => {
		includeInviteCodeInShare.value = e.detail.value;
	};

	/**
	 * 复制邀请码
	 */
	const copyInviteCode = () => {
		uni.setClipboardData({
			data: activityDetail.value.inviteCode,
			success: () => uni.showToast({
				title: '已复制',
				icon: 'none'
			})
		});
	};

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
		// 状态 2: 报名中, 状态 4: 进行中
		return [2, 4].includes(activityDetail.value.status);
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
				color: '#FF62B1'
			}, // 主题色
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

	const showLimitSlotsTip = computed(() => {
		if (!activityDetail.value) return false;

		// 仅在"未开始(1)"或"报名中(2)"状态下提示
		const inRelevantStatus = [1, 2].includes(activityDetail.value.status);

		// 获取当前真实报名人数（取 participantTotal 和 joinCount 中较大的一个，双重保险）
		const currentCount = Number(participantTotal.value || activityDetail.value.joinCount || 0);
		const requiredCount = Number(activityDetail.value.limitSlots || 0);

		// 如果起聚人数设置为0或未设置，则不提示
		if (requiredCount <= 0) return false;

		// 判断逻辑：当前人数 < 起聚人数
		const notEnough = currentCount < requiredCount;

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

	// 地图导航
	const openLocationMap = () => {
		if (!activityDetail.value.latitude || !activityDetail.value.longitude) {
			uni.showToast({
				title: '暂无位置经纬度信息',
				icon: 'none'
			});
			return;
		}
		uni.openLocation({
			latitude: Number(activityDetail.value.latitude),
			longitude: Number(activityDetail.value.longitude),
			name: activityDetail.value.activityLocation,
			address: activityDetail.value.locationAddress
		});
	};

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

			if (activityDetail.value) {
				activityDetail.value.joinCount = data.total;
			}
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
		let url = '/packages/activity-participants/activity-participants?id=' + activityId.value;
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

	// 2. 跳转到赞助商列表页
	const goToSponsorList = () => {
		// 将整个赞助商列表序列化传递
		const sponsorData = encodeURIComponent(JSON.stringify(sponsorList.value));
		uni.navigateTo({
			url: `/packages/sponsor-list/sponsor-list?data=${sponsorData}&activityId=${activityId.value}`
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

		const inv = currentStandardCode.value || '';
		const exc = currentExclusiveCode.value || '';

		console.log('🔗 [详情页 -> 报名页] 携带参数:', {
			inv,
			exc
		});

		uni.navigateTo({
			url: `/packages/active-enroll/active-enroll?id=${activityId.value}&inviteCode=${inv}&exclusiveInviteCode=${exc}`
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
	 * 跳转到浏览留痕完整列表页
	 * 增加了 hasSilent 参数传递
	 */
	const goToTraceList = () => {
		const hasSilent = activityDetail.value.hasSilentLoginUser || 0;
		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${activityId.value}&type=activity&hasSilent=${hasSilent}`
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
		const globalInviteCode = getInviteCode(); // 用户的系统分销码

		const finalTitle = customShareTitle.value || activityDetail.value?.activityTitle || '邀请你参加聚会';

		// 基础路径
		let sharePath = `/packages/active-detail/active-detail?id=${activityId.value}`;

		// 【核心逻辑：二选一】
		// 根据单选框 shareCodeType 的值，决定拼接哪一个业务码
		if (shareCodeType.value === 'STANDARD') {
			// 普通邀请码 -> 传给 inviteCode
			sharePath += `&inviteCode=${activityDetail.value.inviteCode}`;
		} else if (shareCodeType.value === 'EXCLUSIVE') {
			// 专属免费码 -> 传给 exclusiveInviteCode
			sharePath += `&exclusiveInviteCode=${activityDetail.value.exclusiveInviteCode}`;
		}

		// 拼接分销和操作者信息
		if (sharerId) sharePath += `&sharerId=${sharerId}`;
		if (globalInviteCode) sharePath += `&c=${globalInviteCode}`;

		console.log('🚀 [详情页-分享中] 最终生成的路径:', sharePath);

		return {
			title: finalTitle,
			path: sharePath,
			imageUrl: activityDetail.value?.coverImageUrl || ''
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
	// 1. 定义全局主题色变量
	$theme-color: #FF62B1;

	// 2. 启用全页面文字选择复制
	.user-select-text {
		user-select: text;
		-webkit-user-select: text;
	}

	.page {
		padding-bottom: 120rpx;
		background-color: #f8f8f8;
	}

	/* ── 封面轮播 ── */
	.banner-section {
		position: relative;
		width: 100%;
		height: 560rpx;
		background-color: #eee;

		.status-tag {
			position: absolute;
			top: 30rpx;
			right: 0;
			padding: 10rpx 24rpx;
			border-radius: 40rpx 0 0 40rpx;
			color: #fff;
			font-size: 24rpx;
			font-weight: bold;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			z-index: 20;
		}
	}

	.banner-section {
		position: relative;
		overflow: hidden;

		/* 1. 左上角类型标签 */
		.tags-overlay-top {
			position: absolute;
			top: 30rpx;
			left: 30rpx;
			z-index: 10;

			.event-cover-tag {
				background-color: rgba($theme-color, 0.9);
				color: #fff;
				font-size: 22rpx;
				padding: 6rpx 18rpx;
				border-radius: 8rpx;
				font-weight: bold;
			}
		}

		/* 2. 右下角报名状态 */
		.join-status-overlay {
			position: absolute;
			bottom: 30rpx;
			right: 30rpx;
			z-index: 10;

			.status-pill {
				display: flex;
				align-items: center;
				gap: 8rpx;
				padding: 10rpx 24rpx;
				border-radius: 40rpx;
				color: #fff;
				font-size: 24rpx;
				font-weight: bold;
				box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);

				&.join-status-0 {
					background: rgba(0, 0, 0, 0.5);
				}

				// 未报名
				&.join-status-1 {
					background: #f39c12;
				}

				// 待确认
				&.join-status-2 {
					background: #2ecc71;
				}

				// 已报名
			}
		}

		/* 3. 左下角赞助商迷你区 (磨砂效果) */
		.sponsor-mini-card {
			position: absolute;
			bottom: 20rpx;
			left: 20rpx;
			z-index: 10;
			/* 宽度固定，高度随内容自适应 */
			width: 150rpx;
			padding: 16rpx 0rpx;
			border-radius: 20rpx;
			background: rgba(255, 255, 255, 0.45); // 稍微提高一点亮白度
			backdrop-filter: blur(15px);
			-webkit-backdrop-filter: blur(15px);
			border: 1rpx solid rgba(255, 255, 255, 0.3);
			display: flex;
			flex-direction: column; // 整体竖排
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

			.sponsor-mini-list {
				display: flex;
				flex-direction: column; // 赞助商项竖着排
				gap: 16rpx;
			}

			.sp-mini-item {
				display: flex;
				flex-direction: column; // Logo 和 名称也竖着排
				align-items: center; // 居中对齐
				justify-content: center;
				text-align: center;

				.sp-mini-logo {
					width: 64rpx; // 稍微增大一点 Logo，因为现在是单列
					height: 64rpx;
					border-radius: 50%;
					background: #fff;
					border: 2rpx solid rgba(255, 255, 255, 0.8);
					margin-bottom: 6rpx;
				}

				.sp-mini-name {
					font-size: 18rpx;
					color: #000;
					font-weight: bold;
					width: 100%;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: 1.2;
				}
			}

			.sp-mini-more-box {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 12rpx;
				padding-top: 8rpx;
				border-top: 1rpx solid rgba(255, 255, 255, 0.2); // 增加一条若有若无的分割线

				.sp-mini-more {
					font-size: 20rpx;
					color: $theme-color; // 主题粉色
					font-weight: 900;
					line-height: 1;
					letter-spacing: 2rpx; // 让 >>> 更舒展
				}
			}

			&:active {
				opacity: 0.9;
				transform: scale(0.96);
			}
		}
	}

	.banner-swiper,
	.banner-image {
		width: 100%;
		height: 100%;
	}

	.tags-overlay {
		position: absolute;
		bottom: 20rpx;
		left: 20rpx;

		.event-cover-text {
			color: white;
			font-size: 24rpx;
			padding: 6rpx 16rpx;
			background: rgba(0, 0, 0, 0.5);
			border-radius: 6rpx;
		}
	}

	.event-cover-text {
		color: white;
		font-size: 26rpx;
		font-weight: bold;
		padding: 8rpx 16rpx;
		background-color: rgba(0, 0, 0, 0.4);
		border-radius: 8rpx;
	}

	.invite-item-block {
		align-items: flex-start !important; // 让“邀请码：”标签与内容顶部对齐

		.invite-content-box {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		.code-line {
			display: flex;
			align-items: center;
		}

		.bold-code {
			font-size: 34rpx;
			font-weight: 800;
			letter-spacing: 2rpx;
		}

		/* 复制按钮 - 主色调重构 */
		.theme-copy-btn {
			font-size: 22rpx;
			color: $theme-color;
			background: rgba($theme-color, 0.1);
			border: 1rpx solid rgba($theme-color, 0.3);
			padding: 4rpx 20rpx;
			border-radius: 30rpx;
			margin-left: 24rpx;
			font-weight: bold;

			&:active {
				background: rgba($theme-color, 0.2);
				transform: scale(0.95);
			}
		}

		/* 邀请码下方提示语 */
		.invite-usage-hint {
			font-size: 22rpx;
			color: #999;
			margin-top: 10rpx;
			line-height: 1.4;
		}
	}


	/* 专属码特殊样式 */
	.exclusive-block {
		margin-top: 10rpx;
		background: rgba($theme-color, 0.02);
		border-radius: 12rpx;

		.code-line {
			display: flex;
			align-items: center;

			.eye-btn {
				padding: 0 20rpx;
			}
		}

		.warning-hint {
			color: #ff4d4f !important;
			font-weight: bold;
		}
	}

	/* 分享弹窗单选组 */
	.share-option-group {
		padding: 30rpx;
		background: #fdfdfd;
		border-radius: 16rpx;
		margin-bottom: 30rpx;

		.option-header {
			font-size: 26rpx;
			color: #666;
			margin-bottom: 20rpx;
		}

		.share-radio-item {
			display: flex;
			align-items: flex-start;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f5f5f5;

			.radio-txt-box {
				margin-left: 20rpx;
				display: flex;
				flex-direction: column;

				.warning-text {
					color: #FF62B1;
					font-weight: bold;
				}

				.sub-hint {
					font-size: 22rpx;
					color: #999;
					margin-top: 6rpx;
				}
			}
		}
	}


	/* ── 基础信息重构 ── */
	.event-header {
		background: #fff;
		margin: 24rpx;
		padding: 30rpx;
		border-radius: 20rpx;

		.event-title {
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 30rpx;
			display: block;
			color: #FF62B1;
		}

		.info-list {
			margin-bottom: 30rpx;

			.info-item {
				display: flex;
				margin-bottom: 24rpx;
				line-height: 1.5;

				.info-label {
					font-size: 26rpx;
					color: $theme-color; // 标签用主题色
					flex-shrink: 0;
					width: 130rpx;
				}

				.info-value {
					font-size: 26rpx;
					color: #555;
					flex: 1;

					&.highlight {
						color: #FF62B1;
						font-weight: 500;
					}

					&.nav-link {
						color: #3a7bd5;
						text-decoration: underline;
						font-weight: 500;
					}
				}
			}
		}
	}

	/* ── 状态横幅 & 提示 ── */
	.status-banner {
		color: #fff;
		padding: 10rpx 30rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: bold;
	}

	// .limit-slots-tip {
	// 	background-color: #fdf6ec;
	// 	color: #e6a23c;
	// 	padding: 20rpx 30rpx;
	// 	font-size: 26rpx;
	// 	display: flex;
	// 	align-items: center;
	// }

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

	/* 1. 起聚名额提示框样式 */
	.limit-slots-tip {
		padding: 20rpx 30rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		margin: 24rpx;
		border-radius: 12rpx;
		border: 1rpx solid; // 颜色通过内联 style 控制
		line-height: 1.4;
	}

	/* 2. 聚店名称下划线 */
	.clickable-venue {
		text-decoration: underline;
		font-weight: bold;
		/* 继承 nav-link 的颜色，通常为蓝色或主题色 */
	}

	/* 3. 统计项文字下划线 */
	.stat-label.underlined {
		display: inline-block;
		position: relative;
		padding-bottom: 4rpx;

		&::after {
			content: '';
			position: absolute;
			left: 10%;
			right: 10%;
			bottom: 0;
			height: 2rpx;
			background-color: $theme-color; // 使用主题粉色下划线
			opacity: 0.6;
		}
	}

	/* 调整 stat-item 点击反馈 */
	.stat-item {
		&:active {
			opacity: 0.7;
		}
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

	/* ── 贡分/统计样式 ── */
	.theme-text {
		color: $theme-color !important;
		font-weight: bold;
	}

	.event-stats {
		display: flex;
		justify-content: space-between;
		padding-top: 30rpx;
		border-top: 1rpx solid #f0f0f0;

		.stat-item {
			text-align: center;

			.stat-value {
				font-size: 36rpx;
				color: $theme-color;
				font-weight: bold;
			}

			.stat-label {
				font-size: 24rpx;
				color: #999;
				margin-top: 4rpx;
			}
		}
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

		.header-mark {
			width: 8rpx;
			height: 32rpx;
			background: $theme-color;
			border-radius: 4rpx;
			margin-right: 16rpx;
		}

		.section-title {
			font-size: 32rpx;
			font-weight: 800; // 粗体
			color: $theme-color; // 主题色
		}

		.click-hint {
			margin-left: auto;
			/* 关键：自动推到最右边 */
			font-size: 24rpx;
			color: $theme-color;
			font-weight: bold;
			letter-spacing: 2rpx;
			/* 让 >>> 更有间隔感 */
			opacity: 0.8;

			&:active {
				opacity: 1;
			}
		}
	}

	.event-description-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.8;
		text-align: justify;
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* 1. 最低起聚名额提示 - 主色调重构 */
	.limit-slots-tip.theme-tip {
		background-color: rgba($theme-color, 0.05); // 极浅的主题背景
		color: $theme-color; // 主题色文字
		border: 1rpx solid rgba($theme-color, 0.1); // 淡淡的边框线
		padding: 20rpx 30rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		margin: 24rpx;
		border-radius: 12rpx;
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
		font-size: 32rpx;
		display: block;
		margin-bottom: 6rpx;
	}

	.meta-line {
		font-size: 26rpx;
		color: #888888;
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
		color: $theme-color;
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
			color: $theme-color;
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

	/* 标题旁的人数背景 */
	.view-count-wrap {
		display: flex;
		align-items: center;
		margin-left: 20rpx;
		background: #f0f0f0;
		padding: 4rpx 16rpx;
		border-radius: 30rpx;
	}

	.view-count-wrap .total-num {
		font-size: 24rpx;
		color: #333;
		font-weight: bold;
		margin-left: 6rpx;
	}

	/* 静默头像特殊边框 */
	.silent-avatar-border {
		border: 2rpx solid #FF6B00 !important;
		background-color: #FFF5EE;
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
	/* ── 底部按钮渐变重构 ── */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		display: flex;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -5rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 100;

		.action-btn {
			flex: 1;
			height: 90rpx;
			margin: 0 10rpx;
			border-radius: 50rpx;
			font-weight: bold;
			font-size: 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			&.share-btn {
				background: linear-gradient(135deg, #4facfe, #00f2fe);
				color: #fff;
			}

			&.register-btn {
				background: linear-gradient(to right, lighten($theme-color, 15%), $theme-color);
				color: #fff;

				&.disabled {
					background: #ccc;
				}
			}
		}
	}

	/* ── 其余通用卡片 ── */
	.event-content,
	.organizer-section,
	.business-section,
	.participants-section,
	.sponsor-section,
	.viewer-module-card,
	.comment-preview-card {
		background: #fff;
		margin: 24rpx;
		padding: 30rpx;
		border-radius: 20rpx;
	}

	.timeline-item .dot {
		border-color: $theme-color;
	}

	.count-tag,
	.title-count {
		font-size: 24rpx;
		color: $theme-color;
		margin-left: 10rpx;
	}

	.capsule-item.active {

		.count,
		.label {
			color: $theme-color;
		}
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

	/* 隐私遮罩样式 */
	.private-mask {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fff9fb;
		border: 2rpx dashed rgba($theme-color, 0.2);
		border-radius: 16rpx;
		padding: 60rpx 40rpx;
		margin: 20rpx 0;

		.mask-text {
			font-size: 26rpx;
			color: $theme-color;
			text-align: center;
			margin-top: 20rpx;
			line-height: 1.6;
			font-weight: 500;
		}
	}

	/* 邀请码信息项 */
	.info-item {
		.copy-tag {
			font-size: 22rpx;
			background: #f0f0f0;
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
			margin-left: 20rpx;

			&:active {
				background: #e0e0e0;
			}
		}
	}

	/* 分享弹窗选项 */
	.share-option-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		background: #fff8fb;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
		border: 1rpx solid rgba($theme-color, 0.1);

		.option-label {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}
	}
</style>