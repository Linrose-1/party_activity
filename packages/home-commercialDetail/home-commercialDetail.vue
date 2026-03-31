<template>
	<view class="business-opportunity-detail-app">
		<view class="container">
			<!-- 商机卡片 -->
			<view class="opportunity-card">
				<!-- 1. 作者信息区 -->
				<view class="author-info" @click="handleAuthorClick">
					<view class="author-avatar-wrapper">
						<image :src="postDetail.avatar" mode="aspectFill" class="author-avatar"
							:class="{ 'is-ent': postDetail.isEnterpriseSource }"></image>
						<image v-if="postDetail.isEnterpriseSource" src="/static/icon/企业认证.png"
							class="blue-v-badge-detail" />
					</view>

					<view class="author-details">
						<view class="name-and-badge">
							<view class="author-name">{{ postDetail.user }}</view>
							<view v-if="postDetail.isEntVerified" class="badge-premium-detail ent-auth">
								<uni-icons type="vip-filled" size="10" color="#fff"></uni-icons>
								<text>企业认证</text>
							</view>
							<view v-if="postDetail.isIdVerified" class="badge-soft-detail id-auth">
								<text>已实名</text>
							</view>
						</view>

						<view class="time-and-actions">
							<view class="post-time">
								<uni-icons type="redo" size="14" color="#888"></uni-icons> {{ postDetail.time }}
							</view>
							<view class="header-right-action" v-if="loggedInUserId">
								<button v-if="loggedInUserId !== postDetail.userId" class="follow-button mini-style"
									:class="{ 'followed': postDetail.isFollowedUser }"
									@click.stop="toggleFollow(postDetail)">
									{{ postDetail.isFollowedUser ? '已关注' : '关注' }}
								</button>
								<button v-else class="edit-button-detail mini-style" @click.stop="handleEdit">
									<uni-icons type="compose" size="14" color="#FF6A00"></uni-icons>
									<text>编辑</text>
								</button>
							</view>
						</view>
					</view>
				</view>

				<!-- 标题 -->
				<view style="font-weight: 700;font-size: 36rpx;" class="post-selectable">
					<text v-if="postDetail.postType == 1" class="detail-type-tag hunter">创业猎伙</text>
					<text v-else-if="postDetail.postType == 2" class="detail-type-tag business-hunter">商机分享+创业猎伙</text>
					<text v-else-if="postDetail.postType == 3" class="detail-type-tag connection">商友连接</text>
					<text v-else class="detail-type-tag business">商机分享</text>
					{{postDetail.postTitle}}
				</view>

				<!-- 内容 -->
				<view class="opportunity-content post-selectable">
					{{ postDetail.content }}
				</view>

				<!-- ===== 猎伙专属信息卡片（仅 postType == 1 或 postType == 2 时展示）===== -->
				<view v-if="postDetail.postType == 1 || postDetail.postType == 2" class="liehuo-info-card">
					<!-- 紧急程度 -->
					<view class="liehuo-row" v-if="postDetail.urgentLevel">
						<text class="liehuo-key">紧急程度</text>
						<view class="urgency-badge" :class="{
								'urgency-normal': postDetail.urgentLevel === 1,
								'urgency-urgent': postDetail.urgentLevel === 2,
								'urgency-super':  postDetail.urgentLevel === 3
							}">
							{{ urgentLevelText(postDetail.urgentLevel) }}
						</view>
					</view>

					<!-- 猎伙类型 -->
					<view class="liehuo-row" v-if="postDetail.partnerTypeLabels && postDetail.partnerTypeLabels.length">
						<text class="liehuo-key">猎伙类型</text>
						<view class="partner-types-wrap">
							<text v-for="(label, idx) in postDetail.partnerTypeLabels" :key="idx"
								class="partner-type-tag">{{ label }}</text>
						</view>
					</view>

					<!-- 预期投入 -->
					<view
						v-if="postDetail.expectedInvestmentObj && hasInvestmentContent(postDetail.expectedInvestmentObj)">
						<view class="liehuo-divider"></view>
						<view class="liehuo-row liehuo-invest-title">
							<text class="liehuo-key">预期投入</text>
						</view>
						<view v-for="(val, key) in postDetail.expectedInvestmentObj" :key="key"
							class="liehuo-invest-row">
							<text class="invest-key">{{ key }}</text>
							<text class="invest-val">{{ val }}</text>
						</view>
					</view>

					<!-- 感兴趣人数 -->
					<view class="liehuo-interest-count" v-if="postDetail.interestCount > 0">
						<uni-icons type="person-filled" size="14" color="#1890FF"></uni-icons>
						<text>{{ postDetail.interestCount }} 人感兴趣</text>
					</view>
				</view>
				<!-- ===== 猎伙专属信息卡片 结束 ===== -->

				<!-- 视频 -->
				<view v-if="postDetail.video" class="post-video-container">
					<video :src="postDetail.video" class="post-video" controls object-fit="contain"></video>
				</view>

				<!-- 图片 -->
				<view v-else-if="postDetail.images && postDetail.images.length"
					:class="['post-images', 'images-count-' + postDetail.images.length]">
					<view v-for="(image, imgIndex) in postDetail.images" :key="imgIndex" class="image-wrapper"
						@click.stop="previewBusinessImage(postDetail.images, imgIndex)">
						<image :src="image" class="post-image" mode="aspectFill" />
					</view>
				</view>

				<!-- 标签 -->
				<view class="tags">
					<view class="tag" v-for="(tag, index) in postDetail.tags" :key="index">{{ tag }}</view>
				</view>

				<!-- 互动按钮区 -->
				<view class="interactions">
					<view class="interaction-btn" :class="{ active: postDetail.userAction === 'like' }"
						@click="toggleAction(postDetail, 'like')">
						<uni-icons :type="postDetail.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" size="18"
							:color="postDetail.userAction === 'like' ? '#e74c3c' : '#666'"></uni-icons>
						<span>{{ postDetail.likes }}</span>
					</view>
					<view class="interaction-btn" :class="{ active: postDetail.userAction === 'dislike' }"
						@click="toggleAction(postDetail, 'dislike')">
						<uni-icons :type="postDetail.userAction === 'dislike' ? 'hand-down-filled' : 'hand-down'"
							size="18" :color="postDetail.userAction === 'dislike' ? '#3498db' : '#666'"></uni-icons>
						<span>{{ postDetail.dislikes }}</span>
					</view>
					<view class="interaction-btn" @click="openSharePopup">
						<uni-icons type="redo" size="18" color="#666"></uni-icons>
						<text style="font-size: 26rpx;">分享</text>
					</view>
					<view class="interaction-btn" :class="{ active: postDetail.saved }"
						@click="toggleBookmark(postDetail)">
						<uni-icons :type="postDetail.saved ? 'star-filled' : 'star'" size="18"
							:color="postDetail.saved ? '#FF6A00' : '#666'"></uni-icons>
						{{ postDetail.saved ? '已收藏' : '收藏' }}
					</view>
					<view class="interaction-btn delete-action"
						v-if="loggedInUserId && loggedInUserId === postDetail.userId" @click.stop="deletePost">
						<uni-icons type="trash" size="20" color="#e74c3c"></uni-icons>
					</view>
				</view>

				<!-- ===== 感兴趣 + 留言按钮区 ===== -->
				<view
					v-if="(postDetail.postType == 1 || postDetail.postType == 2) && loggedInUserId && loggedInUserId !== postDetail.userId"
					class="interest-btn-wrap" :class="{ 'double-btns': postDetail.isInterested }">
					<!-- 感兴趣按钮 -->
					<view class="interest-btn" :class="{ 'interested': postDetail.isInterested }"
						@click="toggleInterest">
						<text class="interest-icon">{{ postDetail.isInterested ? '✅' : '🤝' }}</text>
						<text class="btn-text">{{ postDetail.isInterested ? '已感兴趣' : '我感兴趣' }}</text>
					</view>

					<!-- 留言按钮：仅在已表达兴趣后显示 -->
					<view v-if="postDetail.isInterested" class="message-action-btn" @click="goToHunterInteraction">
						<uni-icons type="chat-filled" size="20" color="#fff"></uni-icons>
						<text class="btn-text">互动留言</text>
					</view>
				</view>
				<!-- ===== 感兴趣 + 留言按钮区 结束 ===== -->
			</view>

			<!-- 浏览留痕模块 -->
			<view class="viewer-module-card" v-if="postDetail && postDetail.isReadTrace === 1 && viewerTotal > 0">
				<view class="viewer-header" @click="goToTraceList">
					<view class="left-title">
						<view class="title-indicator"></view>
						<text class="title-txt">最近浏览</text>

						<view class="view-count-wrap" v-if="postDetail.targetViewNum > 0">
							<uni-icons type="eye" size="16" color="#333"></uni-icons>
							<text class="total-num">{{ postDetail.targetViewNum }}</text>
						</view>
					</view>
					<view class="right-more">
						<text>浏览详情</text>
						<uni-icons type="right" size="14" color="#999"></uni-icons>
					</view>
				</view>
				<view class="viewer-content" @click="goToTraceList">
					<view class="avatar-stack">
						<view class="avatar-item" v-for="(item, index) in viewerList" :key="item.id">
							<image :src="item.memberUser.avatar" class="v-avatar" mode="aspectFill"></image>
						</view>
						<view class="avatar-item" v-if="postDetail.hasSilentLoginUser === 1">
							<image
								src="https://img.gofor.club/post/20251231/1gcYJWmdcqe0de467fbd77b15cffaa30eb05468f5f7f_1767178458259.png"
								class="v-avatar silent-avatar" mode="aspectFill"></image>
						</view>
						<view v-if="viewerTotal > 7" class="more-dots">
							<text class="dot"></text>
							<text class="dot"></text>
							<text class="dot"></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 评论区 -->
			<template v-if="postDetail.commentFlag">
				<view class="comments-section">
					<view class="section-title">
						<uni-icons type="chatbubble-filled" size="20" color="#FF6A00"></uni-icons> 评论
						({{ comments.length }})
					</view>
					<view class="comment-list">
						<view class="comment" v-for="comment in comments" :key="comment.id"
							:class="{ 'is-reply': comment.parentId !== 0 }" :data-comment-id="comment.id">
							<image :src="comment.avatar" mode="" class="comment-avatar"
								@click="!comment.anonymous && navigateToBusinessCard({ id: comment.userId, name: comment.user, avatar: comment.avatar })">
							</image>
							<view class="comment-content">
								<view class="comment-header">
									<view class="commenter-name">{{ comment.user || '匿名用户' }}</view>
								</view>
								<view class="comment-time">{{ comment.time }}</view>
								<view class="comment-text">{{ comment.text }}</view>

								<!-- 评论图片 -->
								<view v-if="comment.imageUrls && comment.imageUrls.length > 0" class="comment-images">
									<view v-for="(img, imgIndex) in comment.imageUrls" :key="imgIndex"
										class="comment-image-item"
										@click="previewCommentImage(comment.imageUrls, imgIndex)">
										<image :src="img" mode="aspectFill" class="comment-image"></image>
									</view>
								</view>

								<view class="comment-actions">
									<view class="comment-action" @click="replyComment(comment)">
										<uni-icons type="chatbubble" size="16" color="#666"></uni-icons> 回复
									</view>
									<view v-if="loggedInUserId == comment.userId" class="comment-action delete-btn"
										@click="deleteComment(comment.id)">
										<uni-icons type="trash" size="14" color="#999"></uni-icons> 删除
									</view>
								</view>
							</view>
						</view>
						<view v-if="comments.length === 0" class="no-comments-message">
							暂无评论，快来发表第一条评论吧！
						</view>
					</view>
				</view>

				<!-- 底部悬浮评论栏 -->
				<view class="add-comment-bar" :style="{ bottom: keyboardHeight + 'px' }">
					<view class="input-container">
						<view class="anon-switch" :class="{ 'is-active': isAnonymous }"
							@click="isAnonymous = !isAnonymous">
							<uni-icons :type="isAnonymous ? 'eye-slash-filled' : 'eye-filled'" size="18"
								:color="isAnonymous ? '#FF6A00' : '#999'"></uni-icons>
							<text>{{ isAnonymous ? '匿名' : '显名' }}</text>
						</view>
						<view class="vertical-line"></view>
						<textarea auto-height maxlength="200" v-model="newCommentText"
							:placeholder="commentInputPlaceholder" :adjust-position="false" class="bar-textarea"
							cursor-spacing="10"></textarea>

						<!-- 图片上传按钮 -->
						<view v-if="!imageUrls || imageUrls.length === 0" class="image-upload-btn"
							@click="handleChooseImage">
							<uni-icons type="image" size="24" color="#999"></uni-icons>
						</view>

						<view class="send-btn"
							:class="{ 'can-send': newCommentText.trim().length > 0 || (imageUrls && imageUrls.length > 0) }"
							@click="addComment">
							<uni-icons type="paperplane-filled" size="20" color="#fff"></uni-icons>
						</view>
					</view>

					<!-- 已选择的图片预览 -->
					<view v-if="imageUrls && imageUrls.length > 0" class="selected-images-container">
						<view v-for="(img, index) in imageUrls" :key="index" class="selected-image-item">
							<image :src="img" mode="aspectFill" class="selected-image"
								@click="previewImage(imageUrls, index)"></image>
							<view class="remove-image" @click="removeImage(index)">×</view>
						</view>
						<view class="image-comment-hint">
							发布图片评论需消耗2智米
						</view>
					</view>
				</view>
			</template>

			<view v-else class="comments-disabled-message">
				<uni-icons type="info-filled" size="20" color="#999"></uni-icons>
				该商机不可评论
			</view>
		</view>

		<!-- 分享弹窗 -->
		<uni-popup ref="sharePopup" type="bottom" background-color="#fff">
			<view class="share-popup-content">
				<view class="share-popup-title">分享到</view>
				<view class="share-title-editor">
					<text class="editor-label">自定义标题:</text>
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

		<view v-if="showTimelineGuide" class="timeline-guide-mask" @click="hideTimelineGuide">
			<image src="/static/icons/share-guide-arrow.png" class="guide-arrow"></image>
			<view class="guide-text">
				<text>点击右上角</text>
				<text>分享到朋友圈</text>
			</view>
		</view>

		<!-- ===== 感兴趣成功反馈弹窗 ===== -->
		<view v-if="showInterestSuccessModal" class="interest-modal-mask" @click="closeInterestModal">
			<view class="interest-modal-box" @click.stop>
				<view class="interest-modal-title">🎉 兴趣已表达！</view>
				<view class="interest-modal-divider"></view>
				<view class="interest-modal-body">
					<text class="interest-modal-text">发布者将收到您的意向</text>
					<text class="interest-modal-text">如果对方也觉得合适</text>
					<text class="interest-modal-text">会主动与您联系</text>
				</view>
				<view class="interest-modal-actions">
					<view class="interest-modal-btn confirm" @click="closeInterestModal">好的</view>
					<view class="interest-modal-btn secondary" @click="goToMoreLiehuo">查看其他猎伙</view>
				</view>
			</view>
		</view>
		<!-- ===== 感兴趣弹窗 结束 ===== -->

		<PointsFeedbackPopup ref="pointsPopup" />
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
		computed,
		onUnmounted,
		nextTick
	} from 'vue';
	import {
		onLoad,
		onReady,
		onShareAppMessage,
		onShareTimeline,
		onBackPress
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import {
		getInviteCode,
		checkLoginGuard
	} from '../../utils/user.js';
	import uploadFile from '../../utils/upload.js';
	import feedback from '@/utils/feedback.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	const hasDataChanged = ref(false);
	const isLoading = ref(true);
	const postId = ref(null);
	const loggedInUserId = ref(null);
	const showFollowButton = ref(false);
	const isActionInProgress = ref(false);
	const defaultAvatarUrl = '/static/icon/default-avatar.png';

	// 感兴趣弹窗显示状态
	const showInterestSuccessModal = ref(false);

	// ===== 猎伙紧急程度映射 =====
	const partnerTypeMap = {
		'1': '求贤若渴',
		'2': '产品众筹',
		'3': '项目合作',
		'4': '其他合作',
		'5': '寻找资源',
	};

	/**
	 * 根据 urgentLevel 返回文字
	 * @param {number} level
	 */
	const urgentLevelText = (level) => {
		const map = {
			1: '普通',
			2: '紧急',
			3: '特急'
		};
		return map[level] || '';
	};

	/**
	 * 判断预期投入对象是否有内容
	 * @param {object} obj
	 */
	const hasInvestmentContent = (obj) => {
		return obj && Object.keys(obj).length > 0;
	};

	const postDetail = reactive({
		id: null,
		user: '',
		userId: null,
		avatar: '',
		enterpriseId: null,
		isEnterpriseSource: false,
		isEntVerified: false,
		time: '',
		content: '',
		images: [],
		video: '',
		tags: [],
		likes: 0,
		dislikes: 0,
		userAction: null,
		saved: false,
		isFollowedUser: false,
		cardFlag: true,
		commentFlag: true,
		businessCoverImageUrl: '',
		postType: 0,
		// ===== 猎伙专属字段 =====
		urgentLevel: null, // 紧急程度：1普通 2紧急 3特急
		partnerTypeLabels: [], // 猎伙类型标签数组（供展示用）
		expectedInvestmentObj: null, // 预期投入（解析后的对象）
		interestCount: 0, // 感兴趣人数
		isInterested: false, // 当前用户是否已表达感兴趣
		targetViewNum: 0, // 总阅读人数
		hasSilentLoginUser: 0, // 是否有静默用户查看
	});

	// 评论图片相关
	const imageUrls = ref([]);

	const viewerList = ref([]);
	const viewerTotal = ref(0);
	const comments = ref([]);
	const newCommentText = ref('');
	const replyToCommentId = ref(0);
	const replyToNickname = ref('');
	const targetCommentId = ref(null);
	const isAnonymous = ref(false);
	const pointsPopup = ref(null);
	const sharePopup = ref(null);
	const customShareTitle = ref('');
	const showTimelineGuide = ref(false);
	const keyboardHeight = ref(0);

	const commentInputPlaceholder = computed(() => {
		return replyToNickname.value ? `回复 @${replyToNickname.value}` : '发表你的评论...';
	});

	function formatTimestamp(timestamp) {
		if (!timestamp) return '刚刚';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}`;
	}

	onLoad((options) => {
		if (options.scrollTo === 'comments') {
			onReady(() => {
				scrollToCommentsSection();
			});
		}

		console.log(`✅ [商机详情页] onLoad options: ${JSON.stringify(options)}`);

		if (options && options.inviteCode) {
			uni.setStorageSync('pendingInviteCode', options.inviteCode);
		}
		if (options && options.commentId) {
			targetCommentId.value = options.commentId;
		}

		loggedInUserId.value = uni.getStorageSync('userId');

		if (options && options.id) {
			postId.value = options.id;
			getBusinessOpportunitiesDetail();
		} else {
			console.error('未接收到商机ID');
			uni.showToast({
				title: '加载失败，无效的商机',
				icon: 'none'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		}

		// 处理分享点击加分逻辑
		if (options && options.sharerId) {
			const sharerId = options.sharerId;
			const bizId = options.id;
			if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
				console.log('用户点击了自己的分享链接，不计分。');
			} else if (sharerId && loggedInUserId.value && bizId) {
				triggerShareHitApi(sharerId, bizId);
			} else if (sharerId && bizId) {
				uni.setStorageSync('pendingShareReward', {
					sharerId,
					bizId
				});
			}
		}

		uni.showShareMenu({
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	onMounted(() => {
		uni.onKeyboardHeightChange(res => {
			keyboardHeight.value = res.height;
		});
	});

	onUnmounted(() => {
		uni.offKeyboardHeightChange();
	});

	/** 返回时若数据有变更则通知首页刷新 */
	onBackPress(() => {
		if (hasDataChanged.value) {
			uni.$emit('postUpdated');
		}
	});

	// ===== 分享相关 =====

	const openSharePopup = () => {
		customShareTitle.value = postDetail.postTitle || '发现一个商机，快来看看吧！';
		sharePopup.value.open();
	};

	const closeSharePopup = () => {
		sharePopup.value.close();
	};

	const guideShareTimeline = () => {
		closeSharePopup();
		showTimelineGuide.value = true;
	};

	const hideTimelineGuide = () => {
		showTimelineGuide.value = false;
	};

	onShareAppMessage((res) => {
		closeSharePopup();
		const sharerId = uni.getStorageSync('userId');
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';
		const inviteCode = getInviteCode();

		let sharePath = `/packages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`;
		if (sharerId) sharePath += `&sharerId=${sharerId}`;
		if (inviteCode) sharePath += `&inviteCode=${inviteCode}`;

		let shareImageUrl = 'https://img.gofor.club/logo_share.jpg';
		if (postDetail.businessCoverImageUrl) shareImageUrl = postDetail.businessCoverImageUrl;
		else if (postDetail.images && postDetail.images.length > 0) shareImageUrl = postDetail.images[0];

		return {
			title: finalTitle,
			path: sharePath,
			imageUrl: shareImageUrl
		};
	});

	onShareTimeline(() => {
		const sharerId = uni.getStorageSync('userId');
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';
		const inviteCode = getInviteCode();

		let queryString = `id=${postDetail.id}&from=timeline`;
		if (sharerId) queryString += `&sharerId=${sharerId}`;
		if (inviteCode) queryString += `&inviteCode=${inviteCode}`;

		let shareImageUrl = 'https://img.gofor.club/logo_share.jpg';
		if (postDetail.businessCoverImageUrl) shareImageUrl = postDetail.businessCoverImageUrl;
		else if (postDetail.images && postDetail.images.length > 0) shareImageUrl = postDetail.images[0];

		return {
			title: finalTitle,
			query: queryString,
			imageUrl: shareImageUrl
		};
	});

	/** 调用分享命中接口为分享者加贡分 */
	const triggerShareHitApi = async (sharerId, bizId) => {
		if (!sharerId || !bizId) return;
		const {
			error
		} = await request('/app-api/member/experience-record/share-experience-hit', {
			method: 'POST',
			data: {
				type: 32,
				shareUserId: sharerId,
				bizId
			}
		});
		if (error) console.error('调用分享加分接口失败:', error);
	};

	// ===== 详情获取 =====

	/** 获取商机/猎伙详情并填充 postDetail */
	const getBusinessOpportunitiesDetail = async () => {
		isLoading.value = true;
		showFollowButton.value = false;
		try {
			const result = await request('/app-api/member/business-opportunities/get', {
				method: 'GET',
				data: {
					id: postId.value
				}
			});

			if (result && !result.error && result.data) {
				const item = result.data;
				const isEnt = item.isEnterprise === 1 && item.enterpriseInfo;
				const pubType = item.enterprisePublishType;

				postDetail.id = item.id;
				postDetail.userId = item.userId;
				postDetail.isEnterpriseSource = !!isEnt;
				postDetail.enterpriseId = isEnt ? item.enterpriseInfo.id : null;

				if (isEnt) {
					if (pubType === 1) {
						// 1. 品牌发布：显示品牌Logo和品牌名称
						postDetail.user = item.enterpriseInfo.brandName || '未设置品牌名';
						postDetail.avatar = item.enterpriseInfo.logoUrl || defaultAvatarUrl;
					} else {
						// 0. 企业发布：显示企业Logo和企业名称
						postDetail.user = item.enterpriseInfo.enterpriseName || '未设置企业名';
						postDetail.avatar = item.enterpriseInfo.enterpriseLogo || item.enterpriseInfo.logoUrl ||
							defaultAvatarUrl;
					}
				} else {
					// 个人发布逻辑保持不变
					postDetail.user = item.memberUser?.nickname || '匿名用户';
					postDetail.avatar = item.memberUser?.avatar || defaultAvatarUrl;
				}

				// postDetail.user = isEnt ? item.enterpriseInfo.enterpriseName : (item.memberUser?.nickname ||
				// 	'匿名用户');
				// postDetail.avatar = isEnt ? item.enterpriseInfo.logoUrl : (item.memberUser?.avatar ||
				// 	defaultAvatarUrl);
				postDetail.isEntVerified = isEnt && item.enterpriseInfo.status === 3;
				postDetail.isIdVerified = !isEnt && item.memberUser?.idCert === 1;
				postDetail.content = item.postContent;
				postDetail.postTitle = item.postTitle;
				postDetail.video = item.postVideo || '';
				postDetail.businessCoverImageUrl = item.businessCoverImageUrl || '';
				postDetail.images = item.postImg ? String(item.postImg).split(',').filter(img => img) : [];
				postDetail.likes = item.likesCount || 0;
				postDetail.dislikes = item.dislikesCount || 0;
				postDetail.time = formatTimestamp(item.createTime);
				postDetail.saved = item.followFlag === 1;
				postDetail.isFollowedUser = item.followUserFlag === 1;
				postDetail.userAction = item.userLikeStr || null;
				postDetail.cardFlag = item.cardFlag;
				postDetail.isReadTrace = item.isReadTrace;
				postDetail.targetViewNum = item.targetViewNum || 0; // 同步总人数
				postDetail.hasSilentLoginUser = item.hasSilentLoginUser || 0; // 同步静默用户标识
				postDetail.commentFlag = item.commentFlag;
				postDetail.postType = item.postType || 0;
				postDetail.tags = item.tags || [];

				// ===== 还原猎伙专属字段 =====
				if (item.postType == 1 || item.postType == 2) {
					postDetail.urgentLevel = item.urgentLevel || null;

					// partnerTypes 为逗号分隔字符串，转为标签数组
					postDetail.partnerTypeLabels = item.partnerTypes ?
						item.partnerTypes.split(',').filter(v => v).map(v => partnerTypeMap[v] || v) : [];

					// expectedInvestment 为 JSON 字符串，解析为对象
					if (item.expectedInvestment) {
						try {
							postDetail.expectedInvestmentObj = JSON.parse(item.expectedInvestment);
						} catch (e) {
							postDetail.expectedInvestmentObj = null;
						}
					} else {
						postDetail.expectedInvestmentObj = null;
					}

					// 感兴趣相关
					postDetail.interestCount = item.interestCount || 0;
					// userInterested: 0-未感兴趣 1-已感兴趣
					postDetail.isInterested = item.userInterested === 1;
				}
				// ===== 猎伙字段还原结束 =====

				if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
					showFollowButton.value = true;
				}

				if (item.isReadTrace === 1) {
					getViewerList();
				}

				if (item.checkContribution === 1) {
					setTimeout(() => {
						if (pointsPopup.value) pointsPopup.value.show('阅读商机详情', 10);
					}, 500);
				}

				getCommentList();
			} else {
				uni.showToast({
					title: '获取详情失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error("获取商机详情失败:", error);
			uni.showToast({
				title: '网络请求异常',
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
		}
	};

	/** 获取浏览记录列表 */
	const getViewerList = async () => {
		const {
			data
		} = await request('/app-api/member/target-view/page', {
			method: 'GET',
			data: {
				targetId: postId.value,
				targetType: 'post',
				pageNo: 1,
				pageSize: 7
			}
		});
		if (data) {
			viewerList.value = data.list || [];
			viewerTotal.value = data.total || 0;
		}
	};

	// ===== 感兴趣功能 =====

	/**
	 * 切换感兴趣状态
	 * 未感兴趣 → 调用 express 接口 → 弹出成功提示
	 * 已感兴趣 → 调用 cancel 接口 → 静默取消
	 */
	const toggleInterest = async () => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		isActionInProgress.value = true;

		const wasInterested = postDetail.isInterested;

		// 乐观更新
		postDetail.isInterested = !wasInterested;
		postDetail.interestCount += wasInterested ? -1 : 1;
		if (postDetail.interestCount < 0) postDetail.interestCount = 0;

		try {
			if (!wasInterested) {
				// 表达感兴趣：POST JSON body
				const {
					error
				} = await request('/app-api/member/target-interest/express', {
					method: 'POST',
					data: {
						id: 0,
						userId: uni.getStorageSync('userId') || 0,
						targetType: 'post',
						targetId: postDetail.id,
					}
				});
				if (error) throw new Error(error);
				// 成功弹出反馈弹窗
				showInterestSuccessModal.value = true;
			} else {
				// 取消感兴趣：POST Query 参数
				const {
					error
				} = await request(
					`/app-api/member/target-interest/cancel?targetType=post&targetId=${postDetail.id}`, {
						method: 'POST'
					}
				);
				if (error) throw new Error(error);
				uni.showToast({
					title: '已取消',
					icon: 'none'
				});
			}
		} catch (err) {
			// 回滚
			postDetail.isInterested = wasInterested;
			postDetail.interestCount += wasInterested ? 1 : -1;
			uni.showToast({
				title: String(err.message || '操作失败'),
				icon: 'none'
			});
		} finally {
			setTimeout(() => {
				isActionInProgress.value = false;
			}, 500);
		}
	};

	/** 关闭感兴趣成功弹窗 */
	const closeInterestModal = () => {
		showInterestSuccessModal.value = false;
	};

	/** 跳转到猎伙列表（查看其他猎伙） */
	const goToMoreLiehuo = () => {
		closeInterestModal();
		// 返回首页并切换到猎伙 Tab（tabIndex=4）
		uni.navigateBack();
	};

	/** 
	 * 跳转到猎伙一对一互动页面 
	 */
	const goToHunterInteraction = () => {
		// 携带商机ID进入互动页
		// 由于是意向人主动发起，不需要传对方userId，后端会自动识别当前登录人与发布者的关系
		uni.navigateTo({
			url: `/packages/interaction-message/interaction-message?targetId=${postDetail.id}`
		});
	};

	// ===== 作者相关 =====

	/** 点击作者区域跳转名片 */
	const handleAuthorClick = () => {
		if (!postDetail.cardFlag) {
			return uni.showToast({
				title: '作者已关闭名片查看',
				icon: 'none'
			});
		}
		if (postDetail.isEnterpriseSource) {
			if (!postDetail.enterpriseId) return;
			uni.navigateTo({
				url: `/packages/enterprise-card/enterprise-card?id=${postDetail.enterpriseId}`
			});
		} else {
			navigateToBusinessCard({
				id: postDetail.userId,
				name: postDetail.user,
				avatar: postDetail.avatar
			});
		}
	};

	/** 跳转到浏览记录详情页 */
	const goToTraceList = () => {
		// 确保 postId 有值
		const id = postDetail.id;
		// 确保 hasSilentLoginUser 被正确传入
		const hasSilent = postDetail.hasSilentLoginUser || 0;

		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${id}&type=post&hasSilent=${hasSilent}`
		});
	};

	// ===== 评论相关 =====

	const flattenComments = (apiComments, replyToUser = null) => {
		let flatList = [];
		if (!Array.isArray(apiComments)) return flatList;
		apiComments.forEach(comment => {
			const userVO = comment.memberUserBaseVO || {};
			const isAnon = comment.anonymous === 1;
			const displayName = isAnon ? '匿名用户' : (userVO.nickname || '匿名用户');
			const displayAvatar = isAnon ? '/static/icon/default-avatar.png' : userVO.avatar;
			let displayText = comment.content;
			if (replyToUser) displayText = `回复 @${replyToUser}: ${displayText}`;

			// 处理 imageUrls 字段的数据格式问题
			let imageUrls = comment.imageUrls || [];
			if (Array.isArray(imageUrls) && imageUrls.length > 0) {
				// 检查是否是字符串格式而非数组格式
				if (typeof imageUrls[0] === 'string' && imageUrls[0].startsWith('["') && imageUrls[0].endsWith(
						'"]')) {
					try {
						// 尝试解析字符串格式的数组
						const parsed = JSON.parse(imageUrls[0]);
						imageUrls = Array.isArray(parsed) ? parsed : imageUrls;
					} catch (e) {
						// 如果解析失败，保持原始格式
						console.error('解析imageUrls失败:', e);
					}
				}
			}

			flatList.push({
				id: comment.id,
				userId: comment.userId,
				user: displayName,
				avatar: displayAvatar,
				time: formatTimestamp(comment.createTime),
				text: displayText,
				parentId: comment.parentId,
				anonymous: isAnon,
				rawNickname: displayName,
				imageUrls: imageUrls // 使用处理后的imageUrls
			});

			if (comment.childrenList && comment.childrenList.length > 0) {
				flatList = flatList.concat(flattenComments(comment.childrenList, displayName));
			}
		});
		return flatList;
	};

	/** 获取评论列表 */
	const getCommentList = async () => {
		try {
			const result = await request('/app-api/member/comment/select-type-target-id', {
				method: 'GET',
				data: {
					targetType: 'post',
					targetId: postId.value
				}
			});
			if (result && !result.error && Array.isArray(result.data)) {
				comments.value = flattenComments(result.data);
				if (targetCommentId.value) {
					nextTick(() => {
						scrollToTargetComment(targetCommentId.value);
					});
				}
			} else {
				comments.value = [];
			}
		} catch (error) {
			console.error('请求评论列表异常:', error);
		}
	};

	/** 设置回复目标 */
	const replyComment = async (comment) => {
		if (!await checkLoginGuard()) return;
		replyToCommentId.value = comment.id;
		replyToNickname.value = comment.user;
		uni.showToast({
			title: `正在回复 ${comment.user}`,
			icon: 'none'
		});
	};

	/** 发布评论 */
	const addComment = async () => {
		if (!await checkLoginGuard()) return;
		const content = newCommentText.value.trim();
		if (!content && (!imageUrls.value || imageUrls.value.length === 0)) return uni.showToast({
			title: '评论内容或图片不能为空',
			icon: 'none'
		});
		if (!loggedInUserId.value) return uni.showToast({
			title: '请先登录再评论',
			icon: 'none'
		});

		uni.showLoading({
			title: '发布中...'
		});
		try {
			const result = await request('/app-api/member/comment/create', {
				method: 'POST',
				data: {
					userId: loggedInUserId.value,
					targetId: postId.value,
					targetType: 'post',
					parentId: replyToCommentId.value,
					content,
					imageUrls: imageUrls.value, // 添加图片URL数组
					anonymous: isAnonymous.value ? 1 : 0
				}
			});
			if (result && !result.error) {
				uni.showToast({
					title: '评论成功',
					icon: 'success'
				});
				newCommentText.value = '';
				replyToCommentId.value = 0;
				replyToNickname.value = '';
				imageUrls.value = []; // 清空图片数组
				await getCommentList();
				const currentTotalCount = comments.value.length;
				uni.$emit('postInteractionChanged', {
					postId: postId.value,
					type: 'comment',
					totalCount: currentTotalCount
				});
				isAnonymous.value = false;
			} else {
				uni.showToast({
					title: result.error?.message || '评论失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('创建评论异常:', error);
			uni.showToast({
				title: '评论失败，请稍后重试',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};

	/** 删除评论（需二次确认） */
	const deleteComment = (commentId) => {
		uni.showModal({
			title: '提示',
			content: '确定删除这条评论吗？',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '删除中...'
					});
					const {
						error
					} = await request(`/app-api/member/comment/delete?id=${commentId}`, {
						method: 'DELETE'
					});
					uni.hideLoading();
					if (!error) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						getCommentList();
					} else {
						uni.showToast({
							title: error || '删除失败',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	// ===== 评论图片功能 =====

	/**
	 * 选择并上传图片（限制为1张，单张限5MB）
	 */
	const handleChooseImage = async () => {
		uni.chooseImage({
			count: 1, // 限制为1张
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const validFiles = res.tempFiles.filter(file => file.size <= 5 * 1024 * 1024);
				if (res.tempFiles.length > validFiles.length) {
					uni.showToast({
						title: '部分文件过大(>5MB)，已忽略',
						icon: 'none'
					});
				}
				if (validFiles.length === 0) return;

				uni.showLoading({
					title: `正在上传...`,
					mask: true
				});
				const uploadPromises = validFiles.map(file => uploadFile(file, {
					directory: 'comment'
				}));
				const results = await Promise.all(uploadPromises);
				uni.hideLoading();

				const successfulUrls = [];
				results.forEach(result => {
					if (result.data) successfulUrls.push(result.data);
					else console.error('上传失败:', result.error);
				});

				imageUrls.value = successfulUrls; // 直接赋值，而不是push

				if (successfulUrls.length < validFiles.length) {
					uni.showToast({
						title: '部分图片上传失败',
						icon: 'none'
					});
				}
			},
		});
	};

	/**
	 * 删除已选择的图片
	 */
	const removeImage = (index) => {
		uni.showModal({
			title: '提示',
			content: '确定删除这张图片吗？',
			success: (res) => {
				if (res.confirm) {
					imageUrls.value.splice(index, 1);
				}
			}
		});
	};

	/**
	 * 预览已选择的图片
	 */
	const previewImage = (urls, index) => {
		uni.previewImage({
			urls: urls,
			current: index,
			loop: true
		});
	};

	/**
	 * 预览评论中的图片
	 */
	const previewCommentImage = (urls, index) => {
		uni.previewImage({
			urls: urls,
			current: index,
			loop: true
		});
	};

	// ===== 点赞/踩/收藏/关注 =====

	/** 切换点赞或点踩，含乐观更新与失败回滚 */
	/** 切换点赞或点踩，含乐观更新与失败回滚 */
	const toggleAction = async (post, clickedAction) => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		isActionInProgress.value = true;

		const originalAction = post.userAction; // 记录操作前的状态
		const originalLikes = post.likes;
		const originalDislikes = post.dislikes;

		// --- 1. 计算要发送给后端的 action 值 ---
		let apiActionToSend = clickedAction;
		if (originalAction === clickedAction) {
			// 如果操作前的状态和当前点击的按钮一致，说明是“取消”操作
			apiActionToSend = 'cancel';
		}

		// --- 2. 乐观更新 UI (这部分保持你的逻辑即可) ---
		if (originalAction === clickedAction) {
			// 取消
			post.userAction = null;
			if (clickedAction === 'like') post.likes--;
			else post.dislikes--;
		} else {
			// 新增或切换
			if (clickedAction === 'like') {
				post.likes++;
				if (originalAction === 'dislike') post.dislikes--;
			} else {
				post.dislikes++;
				if (originalAction === 'like') post.likes--;
			}
			post.userAction = clickedAction;
		}

		try {
			// --- 3. 调用接口，发送计算好的 apiActionToSend ---
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: post.id,
					targetType: 'post',
					action: apiActionToSend // 【关键修改】：使用计算后的值
				}
			});

			if (!error) {
				hasDataChanged.value = true;
				// 同步给首页
				uni.$emit('postInteractionChanged', {
					postId: post.id,
					type: 'action',
					userAction: post.userAction,
					likes: post.likes,
					dislikes: post.dislikes
				});
			} else {
				// API失败，回滚UI
				post.userAction = originalAction;
				post.likes = originalLikes;
				post.dislikes = originalDislikes;
				uni.showToast({
					title: `操作失败: ${error}`,
					icon: 'none'
				});
			}
		} catch (err) {
			// 网络异常，回滚UI
			post.userAction = originalAction;
			post.likes = originalLikes;
			post.dislikes = originalDislikes;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			isActionInProgress.value = false;
		}
	};
	// const toggleAction = async (post, clickedAction) => {
	// 	if (!await checkLoginGuard()) return;
	// 	if (isActionInProgress.value) return;
	// 	isActionInProgress.value = true;

	// 	const originalAction = post.userAction;
	// 	const originalLikes = post.likes;
	// 	const originalDislikes = post.dislikes;

	// 	if (post.userAction === clickedAction) {
	// 		post.userAction = null;
	// 		if (clickedAction === 'like') post.likes--;
	// 		else post.dislikes--;
	// 	} else {
	// 		if (clickedAction === 'like') {
	// 			post.likes++;
	// 			if (originalAction === 'dislike') post.dislikes--;
	// 		} else {
	// 			post.dislikes++;
	// 			if (originalAction === 'like') post.likes--;
	// 		}
	// 		post.userAction = clickedAction;
	// 	}

	// 	try {
	// 		const {
	// 			error
	// 		} = await request('/app-api/member/like-action/add', {
	// 			method: 'POST',
	// 			data: {
	// 				targetId: post.id,
	// 				targetType: 'post',
	// 				action: clickedAction
	// 			}
	// 		});
	// 		if (!error) {
	// 			hasDataChanged.value = true;
	// 			uni.$emit('postInteractionChanged', {
	// 				postId: post.id,
	// 				type: 'action',
	// 				userAction: post.userAction,
	// 				likes: post.likes,
	// 				dislikes: post.dislikes
	// 			});
	// 		}
	// 		if (error) {
	// 			post.userAction = originalAction;
	// 			post.likes = originalLikes;
	// 			post.dislikes = originalDislikes;
	// 			uni.showToast({
	// 				title: `操作失败: ${error}`,
	// 				icon: 'none'
	// 			});
	// 		}
	// 	} catch (err) {
	// 		post.userAction = originalAction;
	// 		post.likes = originalLikes;
	// 		post.dislikes = originalDislikes;
	// 		uni.showToast({
	// 			title: '操作失败，请重试',
	// 			icon: 'none'
	// 		});
	// 	} finally {
	// 		isActionInProgress.value = false;
	// 	}
	// };

	/** 关注/取关用户 */
	const toggleFollow = async (post) => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) return uni.showToast({
			title: '请先登录',
			icon: 'none'
		});
		isActionInProgress.value = true;

		const originalFollowState = post.isFollowedUser;
		post.isFollowedUser = !post.isFollowedUser;
		const isAdding = post.isFollowedUser;
		const apiUrl = isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		try {
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: {
					userId: loggedInUserId.value,
					targetId: post.userId,
					targetType: 'post_user'
				}
			});
			if (!error) {
				hasDataChanged.value = true;
				uni.showToast({
					title: isAdding ? '关注成功' : '已取消关注',
					icon: 'success'
				});
				uni.$emit('userFollowStatusChanged', {
					userId: post.userId,
					isFollowed: post.isFollowedUser
				});
			} else {
				throw new Error(error);
			}
		} catch (err) {
			post.isFollowedUser = originalFollowState;
			uni.showToast({
				title: typeof err === 'string' ? err : '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			setTimeout(() => {
				isActionInProgress.value = false;
			}, 500);
		}
	};

	/** 收藏/取消收藏 */
	const toggleBookmark = async (post) => {
		if (!await checkLoginGuard()) return;
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) return uni.showToast({
			title: '请先登录',
			icon: 'none'
		});
		isActionInProgress.value = true;

		const originalSavedState = post.saved;
		post.saved = !post.saved;
		const isAdding = post.saved;
		const apiUrl = isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		try {
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: {
					userId: loggedInUserId.value,
					targetId: post.id,
					targetType: 'post'
				}
			});
			if (!error) {
				hasDataChanged.value = true;
				uni.showToast({
					title: isAdding ? '收藏成功' : '已取消收藏',
					icon: 'success'
				});
				uni.$emit('postInteractionChanged', {
					postId: post.id,
					type: 'save',
					isSaved: post.saved
				});
			} else {
				throw new Error(error);
			}
		} catch (err) {
			post.saved = originalSavedState;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			setTimeout(() => {
				isActionInProgress.value = false;
			}, 500);
		}
	};

	/** 删除商机（需二次确认） */
	const deletePost = () => {
		uni.showModal({
			title: '确认删除',
			content: '您确定要删除这条商机吗？删除后将无法恢复。',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '删除中...'
					});
					const {
						error
					} = await request('/app-api/member/business-opportunities/delete', {
						method: 'POST',
						data: {
							id: postDetail.id
						}
					});
					uni.hideLoading();
					if (error) return uni.showToast({
						title: '删除失败: ' + error,
						icon: 'none'
					});
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
					setTimeout(() => uni.navigateBack(), 1500);
				}
			}
		});
	};

	/** 跳转到编辑页 */
	const handleEdit = () => {
		if (!postId.value) return;
		uni.navigateTo({
			url: `/packages/home-opportunitiesPublish/home-opportunitiesPublish?id=${postId.value}`
		});
	};

	/** 预览图片 */
	const previewBusinessImage = (urls, current) => {
		uni.previewImage({
			urls,
			current: urls[current]
		});
	};

	/** 跳转到个人名片页 */
	const navigateToBusinessCard = (user) => {
		if (!postDetail.cardFlag) {
			return uni.showToast({
				title: '作者已关闭名片查看',
				icon: 'none'
			});
		}
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(user.name)}` +
			`&avatar=${encodeURIComponent(user.avatar)}`;
		uni.navigateTo({
			url
		});
	};

	// ===== 滚动定位 =====

	const scrollToCommentsSection = () => {
		setTimeout(() => {
			const query = uni.createSelectorQuery();
			query.select('.comments-section').boundingClientRect();
			query.selectViewport().scrollOffset();
			query.exec(res => {
				if (res && res[0] && res[1]) {
					uni.pageScrollTo({
						scrollTop: res[1].scrollTop + res[0].top,
						duration: 300
					});
				}
			});
		}, 100);
	};

	/**
	 * 精准定位到目标评论
	 */
	const scrollToTargetComment = (commentId) => {
		if (!commentId) return;

		// 增加延迟，确保 v-for 已经完成了 DOM 的渲染
		// 500ms 是一个比较稳妥的数值
		setTimeout(() => {
			const query = uni.createSelectorQuery();

			// 核心修复：确保 ID 转换为字符串，并使用更稳固的选择器
			const idSelector = `[data-comment-id="${commentId}"]`;

			query.select(idSelector).boundingClientRect();
			query.selectViewport().scrollOffset();

			query.exec(res => {
				// res[0] 是元素位置，res[1] 是当前滚动位置
				if (res && res[0]) {
					console.log('✅ 找到目标评论元素，准备滚动', res[0].top);
					uni.pageScrollTo({
						// 目标位置 = 当前滚动位 + 元素相对顶部的距离 - 预留的偏移量(100rpx)
						scrollTop: res[1].scrollTop + res[0].top - 100,
						duration: 300
					});

					// 可选：给定位的评论加一个高亮动画或提示
					uni.showToast({
						title: '已定位到该评论',
						icon: 'none'
					});
				} else {
					// 如果 res[0] 为空，说明还是没找到 DOM 节点
					console.warn('❌ 未找到评论元素，执行兜底：跳转到评论区顶部');
					scrollToCommentsSection();
				}
			});
		}, 600); // 稍微调高延迟，确保渲染完成
	};
</script>

<style scoped>
	/* ==================================================================
	 * 页面主体与全局样式
	 * ================================================================== */
	.business-opportunity-detail-app {
		background-color: #f8f9fa;
		color: #333;
		line-height: 1.6;
		max-width: 750rpx;
		margin: 0 auto;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.container {
		padding-bottom: 140rpx;
	}

	.comments-disabled-message {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
		color: #999;
	}

	/* ==================================================================
	 * 商机卡片
	 * ================================================================== */
	.opportunity-card {
		background: white;
		border-radius: 36rpx;
		margin: 40rpx 30rpx;
		padding: 44rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
		border: 2rpx solid #eee;
		position: relative;
		overflow: hidden;
	}

	.opportunity-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 10rpx;
		height: 100%;
		background: #FF6A00;
		border-top-left-radius: 36rpx;
		border-bottom-left-radius: 36rpx;
	}

	/* --- 作者信息 --- */
	.author-info {
		display: flex;
		align-items: center;
		margin-bottom: 36rpx;
	}

	.name-and-badge {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 6rpx;
	}

	.author-avatar-wrapper {
		position: relative;
		width: 112rpx;
		height: 112rpx;
	}

	.author-avatar.is-ent {
		border-radius: 24rpx !important;
	}

	.blue-v-badge-detail {
		position: absolute;
		bottom: -2rpx;
		right: -2rpx;
		width: 38rpx;
		height: 38rpx;
		background-color: #fff;
		border-radius: 50%;
		border: 4rpx solid #fff;
		z-index: 5;
	}

	.badge-premium-detail {
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
		font-size: 18rpx;
		font-weight: bold;
		color: #fff;
		background: linear-gradient(90deg, #FFB347 0%, #FF8600 100%);
		box-shadow: 0 4rpx 8rpx rgba(255, 134, 0, 0.15);
	}

	.badge-soft-detail {
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
		font-size: 18rpx;
		background-color: rgba(64, 158, 255, 0.1);
		color: #409EFF;
		border: 1rpx solid rgba(64, 158, 255, 0.2);
	}

	.author-avatar {
		width: 112rpx;
		height: 112rpx;
		border-radius: 10rpx;
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 48rpx;
		position: relative;
		border: 4rpx solid white;
		box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.3);
		transition: transform 0.3s;
	}

	.author-details {
		margin-left: 30rpx;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.author-name {
		font-weight: 700;
		font-size: 36rpx;
		color: #333;
		margin-bottom: 6rpx;
		white-space: normal;
		word-break: break-all;
	}

	.time-and-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.post-time {
		font-size: 26rpx;
		color: #888;
		display: flex;
		align-items: center;
	}

	.post-time uni-icons {
		margin-right: 10rpx;
	}

	/* --- 关注/编辑按钮 --- */
	.follow-button {
		background-color: #FF6A00;
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 10rpx 28rpx;
		font-size: 26rpx;
		font-weight: 500;
		white-space: nowrap;
		line-height: 1.5;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 8rpx rgba(255, 106, 0, 0.2);
		flex-shrink: 0;
	}

	.follow-button.mini-style {
		padding: 6rpx 20rpx;
		font-size: 24rpx;
	}

	.follow-button::after {
		border: none;
	}

	.follow-button.followed {
		background: #e0e0e0;
		color: #666;
		box-shadow: none;
	}

	.edit-button-detail {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		padding: 8rpx 24rpx;
		background-color: #FFF5EE;
		border: 1rpx solid rgba(255, 106, 0, 0.3);
		border-radius: 40rpx;
		height: auto;
		line-height: 1.4;
		margin: 0;
	}

	.edit-button-detail text {
		font-size: 24rpx;
		color: #FF6A00;
		font-weight: bold;
	}

	.edit-button-detail::after {
		border: none;
	}

	.edit-button-detail:active {
		background-color: #FFE8D9;
	}

	/* --- 类型标签 --- */
	.detail-type-tag {
		font-size: 22rpx;
		padding: 4rpx 10rpx;
		border-radius: 8rpx;
		margin-right: 12rpx;
		font-weight: normal;
		display: inline-block;
		vertical-align: middle;
		transform: translateY(-4rpx);
	}

	.detail-type-tag.business {
		color: #FF6A00;
		background-color: #FFF0E6;
	}

	.detail-type-tag.hunter {
		color: #1890FF;
		background-color: #E6F7FF;
	}

	.detail-type-tag.connection {
		color: #722ed1;
		background-color: #f9f0ff;
		border: 1rpx solid rgba(114, 46, 209, 0.3);
	}

	.detail-type-tag.business-hunter {
		color: #52c41a;
		background-color: #f6ffed;
		border: 1rpx solid rgba(82, 196, 26, 0.3);
	}

	/* --- 商机内容 --- */
	.opportunity-content {
		white-space: pre-line;
		margin: 20rpx 0;
		font-size: 32rpx;
		color: #444;
		line-height: 1.7;
		padding: 0 10rpx;
	}

	/* ==================== 猎伙专属信息卡片 ==================== */
	.liehuo-info-card {
		background: #f0f7ff;
		border: 1rpx solid #cce3ff;
		border-radius: 16rpx;
		padding: 24rpx 28rpx;
		margin: 24rpx 0;
	}

	.liehuo-row {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.liehuo-row:last-child {
		margin-bottom: 0;
	}

	.liehuo-key {
		font-size: 26rpx;
		color: #555;
		width: 120rpx;
		flex-shrink: 0;
	}

	/* 紧急程度徽章 */
	.urgency-badge {
		font-size: 24rpx;
		padding: 4rpx 20rpx;
		border-radius: 30rpx;
		font-weight: bold;
	}

	.urgency-normal {
		background: #f5f5f5;
		color: #666;
		border: 1rpx solid #e0e0e0;
	}

	.urgency-urgent {
		background: #FF8C00;
		color: #fff;
	}

	.urgency-super {
		background: #FF3B30;
		color: #fff;
	}

	/* 猎伙类型标签 */
	.partner-types-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.partner-type-tag {
		font-size: 24rpx;
		color: #1890FF;
		background: #E6F7FF;
		border: 1rpx solid rgba(24, 144, 255, 0.3);
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}

	/* 预期投入 */
	.liehuo-divider {
		height: 1rpx;
		background: #d6eaff;
		margin: 12rpx 0;
	}

	.liehuo-invest-title {
		margin-bottom: 12rpx;
	}

	.liehuo-invest-row {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
		border-bottom: 1rpx solid #e8f2ff;
	}

	.liehuo-invest-row:last-child {
		border-bottom: none;
	}

	.invest-key {
		width: 140rpx;
		font-size: 26rpx;
		color: #888;
		flex-shrink: 0;
	}

	.invest-val {
		flex: 1;
		font-size: 26rpx;
		color: #333;
	}

	/* 感兴趣人数 */
	.liehuo-interest-count {
		display: flex;
		align-items: center;
		gap: 6rpx;
		margin-top: 16rpx;
		padding-top: 12rpx;
		border-top: 1rpx solid #d6eaff;
	}

	.liehuo-interest-count text {
		font-size: 24rpx;
		color: #1890FF;
	}

	/* ==================== 感兴趣 + 留言按钮区优化 ==================== */
	.interest-btn-wrap {
		margin-top: 30rpx;
		padding: 30rpx 40rpx;
		border-top: 2rpx solid #f8f8f8;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* 当只有一个按钮时的默认样式：居中且较宽 */
	.interest-btn-wrap .interest-btn {
		width: 480rpx;
		/* 只有单个按钮时的宽度 */
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		border-radius: 50rpx;
		font-size: 30rpx;
		font-weight: bold;
		background: linear-gradient(to right, #1890FF, #40a9ff);
		color: #fff;
		box-shadow: 0 8rpx 20rpx rgba(24, 144, 255, 0.2);
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	/* 当有两个按钮时的容器调整 */
	.interest-btn-wrap.double-btns {
		gap: 24rpx;
	}

	/* 当有两个按钮时，感兴趣按钮和留言按钮平分空间 */
	.interest-btn-wrap.double-btns .interest-btn,
	.interest-btn-wrap.double-btns .message-action-btn {
		flex: 1;
		/* 关键：平分空间 */
		width: auto;
		/* 重置固定宽度 */
		max-width: none;
		height: 90rpx;
	}

	/* 已感兴趣状态样式：变浅或变白 */
	.interest-btn.interested {
		background: #fff !important;
		color: #52c41a !important;
		border: 2rpx solid #52c41a !important;
		box-shadow: none !important;
	}

	/* 留言按钮样式 */
	.message-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		border-radius: 50rpx;
		background: linear-gradient(to right, #FF730E, #FF8C00);
		/* 主题橙 */
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 20rpx rgba(255, 115, 14, 0.2);
	}

	.interest-btn:active,
	.message-action-btn:active {
		opacity: 0.8;
		transform: scale(0.96);
	}

	.btn-text {
		white-space: nowrap;
	}

	/* .interest-btn.interested {
		background: #fff;
		color: #52c41a;
		border: 2rpx solid #52c41a;
		box-shadow: none;
	}

	.interest-btn:active {
		opacity: 0.8;
		transform: scale(0.97);
	}

	.interest-icon {
		font-size: 28rpx;
	} */

	/* ==================== 感兴趣成功弹窗 ==================== */
	.interest-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.interest-modal-box {
		background: #fff;
		border-radius: 28rpx;
		width: 580rpx;
		overflow: hidden;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
	}

	.interest-modal-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		padding: 40rpx 40rpx 20rpx;
	}

	.interest-modal-divider {
		height: 1rpx;
		background: #f0f0f0;
		margin: 0 40rpx;
	}

	.interest-modal-body {
		padding: 30rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
	}

	.interest-modal-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	.interest-modal-actions {
		display: flex;
		border-top: 1rpx solid #f0f0f0;
	}

	.interest-modal-btn {
		flex: 1;
		text-align: center;
		padding: 30rpx;
		font-size: 30rpx;
		font-weight: 500;
	}

	.interest-modal-btn.confirm {
		color: #1890FF;
		border-right: 1rpx solid #f0f0f0;
	}

	.interest-modal-btn.secondary {
		color: #666;
	}

	.interest-modal-btn:active {
		background: #f9f9f9;
	}

	/* ==================== 视频/图片 ==================== */
	.post-images {
		display: grid;
		gap: 10rpx;
		margin: 30rpx 0;
		grid-template-columns: repeat(3, 1fr);
	}

	.image-wrapper {
		width: 100%;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		aspect-ratio: 1 / 1;
	}

	.post-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.images-count-1 {
		grid-template-columns: minmax(0, 2fr) 1fr;
	}

	.images-count-2,
	.images-count-4 {
		grid-template-columns: repeat(2, 1fr);
	}

	.post-video-container {
		width: 100%;
		border-radius: 12rpx;
		overflow: hidden;
		margin: 30rpx 0;
		background-color: #000;
	}

	.post-video {
		width: 100%;
		display: block;
	}

	/* ==================== 标签 ==================== */
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin: 40rpx 0;
	}

	.tag {
		background: rgba(255, 106, 0, 0.1);
		color: #FF6A00;
		padding: 14rpx 32rpx;
		border-radius: 40rpx;
		font-size: 26rpx;
		font-weight: 500;
		border: 2rpx solid rgba(255, 106, 0, 0.2);
	}

	/* ==================== 互动按钮区 ==================== */
	.interactions {
		display: flex;
		justify-content: space-around;
		border-top: 2rpx solid #f0f0f0;
		padding-top: 36rpx;
		margin-top: 30rpx;
	}

	.interaction-btn {
		display: flex;
		align-items: center;
		color: #666;
		font-size: 30rpx;
		transition: all 0.2s;
		padding: 10rpx 20rpx;
		border-radius: 16rpx;
	}

	.interaction-btn:active {
		background: rgba(255, 106, 0, 0.08);
	}

	.interaction-btn uni-icons {
		margin-right: 16rpx;
	}

	.interaction-btn.active {
		color: #FF6A00;
	}

	.interaction-btn.delete-action {
		padding: 10rpx;
	}

	.interaction-btn.delete-action:active {
		background: rgba(231, 76, 60, 0.1);
		border-radius: 50%;
	}

	/* ==================== 浏览留痕模块 ==================== */
	.viewer-module-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin: 20rpx 30rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
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
		background-color: #FF6A00;
		border-radius: 4rpx;
		margin-right: 12rpx;
	}

	.title-txt {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.view-count-wrap {
		display: flex;
		align-items: center;
		margin-left: 20rpx;
		background: #f0f0f0;
		padding: 1rpx 16rpx;
		border-radius: 30rpx;
	}

	/* 注意：这里不要嵌套在 .view-count-wrap 里面 */
	.view-count-wrap .total-num {
		font-size: 24rpx;
		color: #333;
		font-weight: bold;
		margin-left: 6rpx;
	}

	/* --- 优化：静默用户头像样式 --- */
	.silent-avatar {
		border: 2rpx solid #FF6A00 !important;
		background-color: #FFF5EE;
	}

	/* 留痕模块卡片触发样式 */
	.viewer-module-card:active {
		background-color: #fafafa;
	}

	.title-count {
		font-size: 24rpx;
		color: #FF6A00;
		background: rgba(255, 106, 0, 0.1);
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

	.viewer-content {
		display: flex;
		flex-direction: column;
	}

	.avatar-stack {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.avatar-item {
		margin-right: 16rpx;
		margin-bottom: 10rpx;
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
		margin-top: 10rpx;
	}

	.viewer-module-card:active {
		background-color: #fafafa;
	}

	/* ==================== 评论图片样式 ==================== */
	.comment-images {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin: 10rpx 0;
	}

	.comment-image-item {
		width: 240rpx;
		height: 240rpx;
		border-radius: 12rpx;
		overflow: hidden;
		position: relative;
		flex-shrink: 0;
	}

	.comment-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.comment-image-item:active {
		opacity: 0.7;
	}

	/* ==================== 评论区 ==================== */
	.comments-section {
		background: white;
		border-radius: 36rpx;
		margin: 0 30rpx 60rpx;
		padding: 44rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
		border: 2rpx solid #eee;
	}

	.section-title {
		font-size: 40rpx;
		font-weight: 700;
		margin-bottom: 50rpx;
		padding-bottom: 30rpx;
		border-bottom: 2rpx solid #f0f0f0;
		color: #333;
		display: flex;
		align-items: center;
	}

	.section-title uni-icons {
		margin-right: 24rpx;
		color: #FF6A00;
		background: rgba(255, 106, 0, 0.1);
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.comment-list {
		margin-top: 30rpx;
	}

	.comment {
		display: flex;
		margin-bottom: 50rpx;
		padding-bottom: 40rpx;
		border-bottom: 2rpx solid #f5f5f5;
	}

	.comment:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.comment.is-reply {
		margin-left: 20rpx;
		width: calc(100% - 20rpx);
	}

	.comment-avatar {
		width: 92rpx;
		height: 92rpx;
		border-radius: 10rpx;
		background: linear-gradient(135deg, #FF8C00, #FF6A00);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 36rpx;
		flex-shrink: 0;
		border: 4rpx solid white;
		box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.2);
		transition: transform 0.3s;
	}

	.comment-content {
		margin-left: 30rpx;
		flex-grow: 1;
	}

	.comment-header {
		margin-bottom: 12rpx;
	}

	.commenter-name {
		font-weight: 600;
		font-size: 32rpx;
		color: #333;
	}

	.comment-time {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 16rpx;
	}

	.comment-text {
		font-size: 30rpx;
		color: #555;
		line-height: 1.6;
		background: #fafafa;
		padding: 24rpx 30rpx;
		border-radius: 24rpx;
		border: 2rpx solid #f0f0f0;
	}

	.comment-actions {
		display: flex;
		margin-top: 24rpx;
		margin-left: 10rpx;
	}

	.comment-action {
		color: #666;
		font-size: 26rpx;
		margin-right: 40rpx;
		display: flex;
		align-items: center;
	}

	.comment-action uni-icons {
		margin-right: 10rpx;
	}

	.comment-action:active {
		color: #FF6A00;
	}

	.no-comments-message {
		text-align: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 28rpx;
	}

	/* ==================== 底部评论栏 ==================== */
	.add-comment-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		border-top: 1rpx solid #f0f0f0;
		z-index: 999;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.input-container {
		flex: 1;
		background: #f5f7fa;
		border-radius: 40rpx;
		padding: 14rpx 20rpx;
		display: flex;
		align-items: center;
		min-height: 80rpx;
		box-sizing: border-box;
		transition: all 0.3s;
		border: 2rpx solid transparent;
	}

	.selected-images-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		padding: 10rpx 0;
	}

	.image-comment-hint {
		width: 100%;
		font-size: 24rpx;
		color: #ff6a00;
		padding: 10rpx 0;
		text-align: center;
	}

	.selected-image-item {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.selected-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.remove-image {
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		width: 30rpx;
		height: 30rpx;
		background-color: #ff4d4f;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		font-weight: bold;
		line-height: 1;
		z-index: 2;
	}

	.image-upload-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		margin-left: 10rpx;
		padding: 10rpx;
		flex-shrink: 0;
	}

	.send-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-left: 20rpx;
		margin-bottom: 5rpx;
		align-self: flex-end;
	}

	.send-btn.can-send {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
	}

	.send-btn:deep(.uni-icons) {
		display: block;
		line-height: 1;
	}

	.input-container:focus-within {
		background: #fff;
		border-color: #FF6A00;
		box-shadow: 0 0 0 4rpx rgba(255, 106, 0, 0.1);
	}

	.anon-switch {
		display: flex;
		align-items: center;
		padding: 0 10rpx;
		flex-shrink: 0;
	}

	.anon-switch uni-icons {
		margin-right: 6rpx;
	}

	.anon-switch text {
		font-size: 24rpx;
		color: #666;
		font-weight: 500;
	}

	.anon-switch.is-active text {
		color: #FF6A00;
	}

	.vertical-line {
		width: 2rpx;
		height: 32rpx;
		background-color: #e0e0e0;
		margin: 0 16rpx;
		flex-shrink: 0;
	}

	.bar-textarea {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		width: 100%;
		padding: 0;
		line-height: 1.5;
		max-height: 200rpx;
		min-height: 40rpx;
	}

	.send-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		flex-shrink: 0;
		margin-bottom: 2rpx;
	}

	.send-btn.can-send {
		background: linear-gradient(135deg, #FF8C00, #FF6A00);
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
		transform: scale(1.05);
	}

	.send-btn:active {
		transform: scale(0.95);
	}

	/* ==================== 分享弹窗 ==================== */
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

	/* ==================== 朋友圈引导遮罩 ==================== */
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

	/* ============ 文本选择支持 ============ */
	.post-selectable {
		/* 允许文本被选择 */
		user-select: text;
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;

		/* 确保长按时显示系统菜单 */
		-webkit-touch-callout: auto;
	}
</style>