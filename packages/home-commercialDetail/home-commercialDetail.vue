<template>
	<view class="business-opportunity-detail-app">
		<view class="container">
			<!-- 商机卡片 -->
			<view class="opportunity-card">
				<!-- 1. 修改后的作者信息区 -->
				<view class="author-info" @click="handleAuthorClick">
					<!-- 头像包裹容器 -->
					<view class="author-avatar-wrapper">
						<image :src="postDetail.avatar" mode="aspectFill" class="author-avatar"
							:class="{ 'is-ent': postDetail.isEnterpriseSource }"></image>
						<!-- 蓝V标识 -->
						<image v-if="postDetail.isEnterpriseSource" src="/static/icon/企业认证.png"
							class="blue-v-badge-detail" />
					</view>

					<view class="author-details">
						<view class="name-and-badge">
							<view class="author-name">{{ postDetail.user }}</view>
							<!-- 企业认证勋章 (status 3) -->
							<view v-if="postDetail.isEntVerified" class="badge-premium-detail ent-auth">
								<uni-icons type="vip-filled" size="10" color="#fff"></uni-icons>
								<text>企业认证</text>
							</view>
							<!-- 个人实名标识 -->
							<view v-if="postDetail.isIdVerified" class="badge-soft-detail id-auth">
								<text>已实名</text>
							</view>
						</view>

						<view class="time-and-actions">
							<view class="post-time">
								<uni-icons type="redo" size="14" color="#888"></uni-icons> {{ postDetail.time }}
							</view>
							<!-- 关注/删除按钮逻辑保持不变 -->
							<button v-if="showFollowButton" class="follow-button mini-style"
								:class="{ 'followed': postDetail.isFollowedUser }"
								@click.stop="toggleFollow(postDetail)">
								{{ postDetail.isFollowedUser ? '已关注' : '关注' }}
							</button>
							<button v-else-if="loggedInUserId && loggedInUserId === postDetail.userId"
								class="follow-button delete-post-button mini-style" @click.stop="deletePost">
								<uni-icons type="trash" size="12" color="#e74c3c"></uni-icons>
								删除
							</button>
						</view>
					</view>
				</view>
				<!-- <view class="author-info">
					<view class="author-avatar-wrapper">
						<image :src="postDetail.avatar" mode="" class="author-avatar"
							@click="navigateToBusinessCard({ id: postDetail.userId, name: postDetail.user, avatar: postDetail.avatar })">
						</image>
					</view>
					<view class="author-details">
						<view class="author-name">{{ postDetail.user }}</view>
						<view class="time-and-actions">
							<view class="post-time">
								<uni-icons type="redo" size="14" color="#888"></uni-icons> {{ postDetail.time }}
							</view>
							<button v-if="showFollowButton" class="follow-button mini-style"
								:class="{ 'followed': postDetail.isFollowedUser }"
								@click.stop="toggleFollow(postDetail)">
								{{ postDetail.isFollowedUser ? '已关注' : '关注' }}
							</button>
							<button v-else-if="loggedInUserId && loggedInUserId === postDetail.userId"
								class="follow-button delete-post-button mini-style" @click.stop="deletePost">
								<uni-icons type="trash" size="12" color="#e74c3c"></uni-icons>
								删除
							</button>
						</view>
					</view>
				</view> -->
				<view style="font-weight: 700;font-size: 36rpx;"
					@longpress.stop="handleLongPress(postDetail.postTitle)">
					<text v-if="postDetail.postType == 1" class="detail-type-tag hunter">创业猎伙</text>
					<text v-else-if="postDetail.postType == 3" class="detail-type-tag connection">商友连接</text>
					<text v-else class="detail-type-tag business">商机分享</text>
					{{postDetail.postTitle}}
				</view>
				<view class="opportunity-content" @longpress.stop="handleLongPress(postDetail.content)">
					{{ postDetail.content }}
				</view>
				<!-- ==================== 【视频/图片】 ==================== -->

				<!-- Case 1: 如果存在视频，则优先渲染视频播放器 -->
				<view v-if="postDetail.video" class="post-video-container">
					<video :src="postDetail.video" class="post-video" controls object-fit="contain"></video>
				</view>

				<!-- Case 2: 如果没有视频，但存在图片，则渲染图片网格 (保持原有逻辑) -->
				<view v-else-if="postDetail.images && postDetail.images.length"
					:class="['post-images', 'images-count-' + postDetail.images.length]">
					<view v-for="(image, imgIndex) in postDetail.images" :key="imgIndex" class="image-wrapper"
						@click.stop="previewImage(postDetail.images, imgIndex)">
						<!-- <image :src="image" class="post-image"
							:mode="postDetail.images.length === 1 ? 'widthFix' : 'aspectFill'" /> -->
						<image :src="image" class="post-image" mode="aspectFill" />
					</view>
				</view>

				<!-- ============================================================ -->
				<view class="tags">
					<view class="tag" v-for="(tag, index) in postDetail.tags" :key="index">
						{{ tag }}
					</view>
				</view>
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
						<uni-icons type="redo" size="18" color="#666"></uni-icons> 分享
					</view>
					<!-- <button class="interaction-btn share-btn" open-type="share">
						<uni-icons type="redo" size="18" color="#666"></uni-icons> 分享
					</button> -->
					<view class="interaction-btn" :class="{ active: postDetail.saved }"
						@click="toggleBookmark(postDetail)">
						<uni-icons :type="postDetail.saved ? 'star-filled' : 'star'" size="18"
							:color="postDetail.saved ? '#FF6A00' : '#666'"></uni-icons>
						{{ postDetail.saved ? '已收藏' : '收藏' }}
					</view>

				</view>
			</view>

			<!-- 浏览留痕模块 -->
			<view class="viewer-module-card"
				v-if="postDetail && postDetail.userId == loggedInUserId && postDetail.isReadTrace === 1 && viewerTotal > 0">
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
							<image :src="item.memberUser.avatar" class="v-avatar" mode="aspectFill"></image>
						</view>
						<view v-if="viewerTotal > 7" class="more-dots">
							<text class="dot"></text>
							<text class="dot"></text>
							<text class="dot"></text>
						</view>
					</view>
					<view class="viewer-tips">
						已有 {{ viewerTotal }} 位商友阅读了您的商机
					</view>
				</view>
			</view>

			<!-- ==================== 评论区 ==================== -->
			<template v-if="postDetail.commentFlag">
				<view class="comments-section">
					<view class="section-title">
						<uni-icons type="chatbubble-filled" size="20" color="#FF6A00"></uni-icons> 评论
						({{ comments.length }})
					</view>

					<view class="comment-list">
						<view class="comment" v-for="comment in comments" :key="comment.id"
							:class="{ 'is-reply': comment.parentId !== 0 }">
							<image :src="comment.avatar" mode="" class="comment-avatar"
								@click="!comment.anonymous && navigateToBusinessCard({ id: comment.userId, name: comment.user, avatar: comment.avatar })">
							</image>
							<view class="comment-content">
								<view class="comment-header">
									<view class="commenter-name">{{ comment.user || '匿名用户' }}</view>
									<view class="comment-time">{{ comment.time }}</view>
								</view>
								<view class="comment-text">{{ comment.text }}</view>
								<view class="comment-actions">
									<view class="comment-action" @click="replyComment(comment)">
										<uni-icons type="chatbubble" size="16" color="#666"></uni-icons> 回复
									</view>

									<!-- 只有当前登录用户 === 评论发布者时才显示 -->
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

				<!-- 底部添加评论区域 -->
				<!-- <view class="add-comment" :style="{ bottom: keyboardHeight + 'px' }">
					<textarea auto-height maxlength="200" v-model="newCommentText"
						:placeholder="commentInputPlaceholder" :adjust-position="false"
						class="comment-textarea"></textarea>

					<view class="anonymous-checkbox" @click="isAnonymous = !isAnonymous">
						<uni-icons :type="isAnonymous ? 'checkbox-filled' : 'circle'" size="20"
							:color="isAnonymous ? '#FF6A00' : '#ccc'"></uni-icons>
						<text>匿名</text>
					</view>

					<button @click="addComment">发送</button>
				</view> -->
				<!-- 底部悬浮评论栏 -->
				<view class="add-comment-bar" :style="{ bottom: keyboardHeight + 'px' }">
					<view class="input-container">
						<!-- 匿名开关：放在输入框左侧内部 -->
						<view class="anon-switch" :class="{ 'is-active': isAnonymous }"
							@click="isAnonymous = !isAnonymous">
							<uni-icons :type="isAnonymous ? 'eye-slash-filled' : 'eye-filled'" size="18"
								:color="isAnonymous ? '#FF6A00' : '#999'"></uni-icons>
							<text>{{ isAnonymous ? '匿名' : '显名' }}</text>
						</view>

						<!-- 分割线 -->
						<view class="vertical-line"></view>

						<!-- 输入框 -->
						<textarea auto-height maxlength="200" v-model="newCommentText"
							:placeholder="commentInputPlaceholder" :adjust-position="false" class="bar-textarea"
							cursor-spacing="10"></textarea>
					</view>

					<!-- 发送按钮 -->
					<view class="send-btn" :class="{ 'can-send': newCommentText.trim().length > 0 }"
						@click="addComment">
						<uni-icons type="paperplane-filled" size="20" color="#fff"></uni-icons>
					</view>
				</view>
			</template>
			<!-- 如果不允许评论，则显示提示信息 -->
			<view v-else class="comments-disabled-message">
				<uni-icons type="info-filled" size="20" color="#999"></uni-icons>
				该商机不可评论
			</view>
		</view>

		<uni-popup ref="sharePopup" type="bottom" background-color="#fff">
			<view class="share-popup-content">
				<view class="share-popup-title">分享到</view>
				<view class="share-title-editor">
					<text class="editor-label">自定义标题:</text>
					<input class="editor-input" v-model="customShareTitle" placeholder="请输入分享标题" />
				</view>
				<view class="share-channels">
					<!-- 在弹窗内放置真正的分享按钮 -->
					<button class="share-channel-btn" open-type="share">
						<uni-icons type="weixin" size="30" color="#07c160"></uni-icons>
						<text>微信好友</text>
					</button>
					<!-- 如果需要，也可以添加分享到朋友圈的引导 -->

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

		<!-- ==================== 9. 居中长按复制菜单 ==================== -->
		<view v-if="copyMenu.show" class="copy-menu-mask" @click="hideCopyMenu">
			<view class="copy-menu-content" @click.stop>
				<view class="copy-menu-item" @click="executeCopy">复制</view>
			</view>
		</view>

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
	import feedback from '@/utils/feedback.js';
	import PointsFeedbackPopup from '@/components/PointsFeedbackPopup.vue';

	const hasDataChanged = ref(false);

	const isLoading = ref(true);
	const postId = ref(null);
	const loggedInUserId = ref(null);
	const showFollowButton = ref(false);

	const isActionInProgress = ref(false);

	const defaultAvatarUrl = '/static/icon/default-avatar.png';

	const postDetail = reactive({
		id: null,
		user: '',
		userId: null,
		avatar: '', // 显示的头像 (个人头像或企业Logo)
		enterpriseId: null, // 如果是企业发布，存储企业主键ID
		isEnterpriseSource: false, // 身份标记
		isEntVerified: false, // 企业是否认证 (status 3)
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
	});

	const viewerList = ref([]);
	const viewerTotal = ref(0);

	const comments = ref([]);
	const newCommentText = ref('');
	const replyToCommentId = ref(0);
	const replyToNickname = ref('');

	const isAnonymous = ref(false);

	const pointsPopup = ref(null); // 定义 ref

	const sharePopup = ref(null); // 用于获取 uni-popup 组件实例
	const customShareTitle = ref(''); // 用于存储用户自定义的分享标题
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
			// 由于页面渲染需要时间，我们不能在 onLoad 中立即滚动
			// onReady 钩子会在页面初次渲染完成后触发
			onReady(() => {
				scrollToCommentsSection();
			});
		}

		console.log(`✅ [商机详情页] 在 onLoad 中捕获到 options: ${JSON.stringify(options)}`);
		if (options && options.inviteCode) {
			const inviteCode = options.inviteCode;
			console.log(`✅ [商机详情页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
			uni.setStorageSync('pendingInviteCode', inviteCode);
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

		// ==================== 处理分享点击逻辑 ====================
		if (options && options.sharerId) {
			const sharerId = options.sharerId;
			const bizId = options.id; // 商机ID就是从options.id获取

			// 1. 检查点击者是否是分享者本人
			if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
				console.log('用户点击了自己的分享链接，不计分。');
			}
			// 2. 如果点击者不是分享者本人，并且已登录
			else if (sharerId && loggedInUserId.value && bizId) {
				console.log('其他用户点击了分享链接，且已登录，准备加分。');
				// 调用时传入 sharerId 和 bizId
				triggerShareHitApi(sharerId, bizId);
			}
			// 3. 如果点击者未登录
			else if (sharerId && bizId) {
				console.log('用户点击了分享链接，但尚未登录。暂存 sharerId 和 bizId。');
				// 将分享者ID和商机ID作为一个对象进行缓存
				uni.setStorageSync('pendingShareReward', {
					sharerId: sharerId,
					bizId: bizId
				});
			}
		}
		// =============================================================

		// 允许从右上角菜单发起分享
		uni.showShareMenu({
			// withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	onMounted(() => {
		// 监听键盘高度变化
		uni.onKeyboardHeightChange(res => {
			console.log('键盘高度变化:', res.height);
			keyboardHeight.value = res.height;
		});
	});

	onUnmounted(() => {
		// 页面卸载时，取消监听，避免内存泄漏
		uni.offKeyboardHeightChange();
	});

	/**
	 * 监听物理返回键或左上角返回按钮
	 * 这是发出通知的最佳时机
	 */
	onBackPress((options) => {
		if (hasDataChanged.value) {
			console.log('详情页数据已变更，发出通知: postUpdated');
			uni.$emit('postUpdated');
		}
	});


	// 打开分享弹窗的方法
	const openSharePopup = () => {
		// 设置输入框的默认值为商机标题
		customShareTitle.value = postDetail.postTitle || '发现一个商机，快来看看吧！';
		// 打开弹窗
		sharePopup.value.open();
	};

	// 关闭分享弹窗的方法
	const closeSharePopup = () => {
		sharePopup.value.close();
	};

	// 引导用户分享到朋友圈的方法
	const guideShareTimeline = () => {
		// 1. 先关闭底部的分享弹窗
		closeSharePopup();

		// 2. 显示右上角的引导遮罩
		showTimelineGuide.value = true;

		// 重要：确保此时 onShareTimeline 返回的内容是用户刚刚编辑好的
		// 因为 onShareTimeline 是一个生命周期钩子，它会自己读取我们设置好的 customShareTitle 等变量
		// 所以我们在这里不需要做什么特殊处理，只需要显示引导即可
	};

	// 隐藏引导遮罩的方法
	const hideTimelineGuide = () => {
		showTimelineGuide.value = false;
	};

	const scrollToCommentsSection = () => {
		// 使用 nextTick 确保 DOM 已经更新
		// Vue 3 Composition API 中需要从 'vue' 导入 nextTick
		// import { nextTick } from 'vue';

		// 如果没有导入 nextTick, 可以用 setTimeout 替代，效果类似但 nextTick 更精确
		setTimeout(() => {
			const query = uni.createSelectorQuery();
			query.select('.comments-section').boundingClientRect();
			query.selectViewport().scrollOffset(); // 获取页面总滚动距离
			query.exec(res => {
				if (res && res[0] && res[1]) {
					const elementTop = res[0].top; // 元素距离视口顶部的距离
					const scrollTop = res[1].scrollTop; // 当前页面的滚动距离
					const finalScrollTop = scrollTop + elementTop;

					console.log(`准备滚动到评论区, 计算位置: ${finalScrollTop}`);
					uni.pageScrollTo({
						scrollTop: finalScrollTop,
						duration: 300
					});
				} else {
					console.warn('无法找到 .comments-section 元素进行滚动');
				}
			});
		}, 100); // 延迟100毫秒，给页面渲染留出更充足的时间
	};

	// ==================== 定义分享给好友的内容 ====================
	onShareAppMessage((res) => {
		console.log("触发分享给好友", res);
		// 分享时，关闭弹窗
		closeSharePopup();

		// 获取分享者自己的用户ID
		const sharerId = uni.getStorageSync('userId');

		// 优先使用用户自定义的标题，如果为空，则使用商机标题作为备选
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';

		const inviteCode = getInviteCode();

		//在路径中添加 sharerId 参数
		let sharePath = `/packages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`;
		if (sharerId) {
			sharePath += `&sharerId=${sharerId}`;
		}

		if (inviteCode) {
			sharePath += `&inviteCode=${inviteCode}`;
		}

		console.log('分享商机（好友），携带邀请码:', inviteCode);

		// 计算分享图片 URL
		let shareImageUrl = 'https://img.gofor.club/logo_share.jpg'; // 默认图

		if (postDetail.businessCoverImageUrl) {
			// 1. 优先使用视频封面
			shareImageUrl = postDetail.businessCoverImageUrl;
		} else if (postDetail.images && postDetail.images.length > 0) {
			// 2. 其次使用第一张配图
			shareImageUrl = postDetail.images[0];
		}

		return {
			title: finalTitle,
			path: sharePath, // 使用拼接后的路径
			imageUrl: shareImageUrl,
			// imageUrl: postDetail.images.length > 0 ? postDetail.images[0] : 'https://img.gofor.club/logo_share.jpg'
		};
	});

	// ==================== 定义分享到朋友圈的内容 ====================
	onShareTimeline(() => {
		console.log("触发分享到朋友圈");

		// 获取分享者自己的用户ID
		const sharerId = uni.getStorageSync('userId');

		// 1. 优先使用用户在弹窗中编辑的自定义标题
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';

		// 获取邀请码
		const inviteCode = getInviteCode();

		// 2. 封面图片逻辑
		const finalImageUrl = postDetail.images.length > 0 ? postDetail.images[0] :
			'https://img.gofor.club/logo_share.jpg';

		// 3. 在 query 中添加 sharerId 和 inviteCode 参数
		let queryString = `id=${postDetail.id}&from=timeline`;
		if (sharerId) {
			queryString += `&sharerId=${sharerId}`;
		}
		// 如果邀请码存在，则拼接到 query 中
		if (inviteCode) {
			queryString += `&inviteCode=${inviteCode}`;
		}

		// 计算分享图片 URL
		let shareImageUrl = 'https://img.gofor.club/logo_share.jpg'; // 默认图

		if (postDetail.businessCoverImageUrl) {
			// 1. 优先使用视频封面
			shareImageUrl = postDetail.businessCoverImageUrl;
		} else if (postDetail.images && postDetail.images.length > 0) {
			// 2. 其次使用第一张配图
			shareImageUrl = postDetail.images[0];
		}

		// 4. 返回最终的分享对象
		return {
			title: finalTitle,
			query: queryString, // 使用拼接后的 query
			imageUrl: shareImageUrl,
		}
	});

	// 调用“分享命中”接口为分享者加贡分
	const triggerShareHitApi = async (sharerId, bizId) => {
		// sharerId 是分享者的ID, bizId 是商机的ID
		if (!sharerId || !bizId) return;

		console.log(`准备为分享者 (ID: ${sharerId}) 增加贡分, 关联商机ID: ${bizId}`);

		const {
			error
		} = await request('/app-api/member/experience-record/share-experience-hit', {
			method: 'POST',
			data: {
				type: 32, // 32 代表 "分享商机奖励"
				shareUserId: sharerId,
				bizId: bizId // 新增：传递关联的商机ID
			}
		});

		if (error) {
			console.error('调用分享加分接口失败:', error);
		} else {
			console.log(`成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
		}
	};

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
			console.log("商机详情", result)
			if (result && !result.error && result.data) {
				const item = result.data;
				const isEnt = item.isEnterprise === 1 && item.enterpriseInfo;

				postDetail.id = item.id;
				postDetail.userId = item.userId; // 帖子管理者ID
				postDetail.isEnterpriseSource = !!isEnt;
				postDetail.enterpriseId = isEnt ? item.enterpriseInfo.id : null;
				postDetail.user = isEnt ? item.enterpriseInfo.enterpriseName : (item.memberUser?.nickname ||
					'匿名用户');
				postDetail.avatar = isEnt ? item.enterpriseInfo.logoUrl : (item.memberUser?.avatar ||
					defaultAvatarUrl);
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
				postDetail.commentFlag = item.commentFlag;
				postDetail.postType = item.postType || 0;

				if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
					showFollowButton.value = true;
				}

				if (item.userId == loggedInUserId.value && item.isReadTrace === 1) {
					console.log('✅ 是本人发布的商机且开启了留痕，正在获取浏览记录...');
					getViewerList();
				} else {
					console.log('ℹ️ 非本人或未开启留痕，不显示浏览记录');
				}

				if (item.checkContribution === 1) {
					setTimeout(() => {
						// 使用组件的 show 方法，传入名称和分数
						if (pointsPopup.value) {
							pointsPopup.value.show('阅读商机详情', 10);
						}
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

	// 获取浏览记录方法
	const getViewerList = async () => {
		const {
			data
		} = await request('/app-api/member/business-opportunities-view/page', {
			method: 'GET',
			data: {
				businessOpportunitiesId: postId.value,
				pageNo: 1,
				pageSize: 7
			}
		});

		console.log('📊 浏览记录接口返回:', data);

		if (data) {
			viewerList.value = data.list || [];
			viewerTotal.value = data.total || 0;

			// 打印这个来确认 v-if 的三个条件
			console.log('🧐 显示留痕判断条件:', {
				'是否本人': postDetail.userId == loggedInUserId.value,
				'是否开启留痕': postDetail.isReadTrace === 1,
				'浏览总数': viewerTotal.value
			});
		}
	};

	/**
	 * [方法] 处理作者区域点击跳转
	 * 逻辑：如果是企业身份，跳转到企业名片；如果是个人身份，跳转到个人名片。
	 */
	const handleAuthorClick = () => {
		// 1. 权限检查：如果作者关闭了名片查看，则拦截
		if (!postDetail.cardFlag) {
			return uni.showToast({
				title: '作者已关闭名片查看',
				icon: 'none'
			});
		}

		// 2. 根据身份进行分流跳转
		if (postDetail.isEnterpriseSource) {
			// --- 场景 A：企业发布的商机 ---
			if (!postDetail.enterpriseId) return;
			uni.navigateTo({
				url: `/packages/enterprise-card/enterprise-card?id=${postDetail.enterpriseId}`
			});
		} else {
			// --- 场景 B：个人发布的商机 ---
			// 构造符合 navigateToBusinessCard 方法的对象
			const userObj = {
				id: postDetail.userId,
				name: postDetail.user,
				avatar: postDetail.avatar
			};
			navigateToBusinessCard(userObj);
		}
	};

	const goToTraceList = () => {
		uni.navigateTo({
			url: `/packages/user-view-trace/user-view-trace?id=${postId.value}`
		});
	};

	const flattenComments = (apiComments, replyToUser = null) => {
		let flatList = [];
		if (!Array.isArray(apiComments)) return flatList;
		apiComments.forEach(comment => {
			const userVO = comment.memberUserBaseVO || {};

			// ---【修改点 1：处理匿名逻辑】---
			const isAnon = comment.anonymous === 1;
			const displayName = isAnon ? '匿名用户' : (userVO.nickname || '匿名用户');
			// 匿名时使用默认头像（你需要准备一个默认图），或者留空让模板处理
			const displayAvatar = isAnon ? '/static/icon/default-avatar.png' : userVO.avatar;

			// 处理回复时的文本显示
			let displayText = comment.content;
			if (replyToUser) {
				displayText = `回复 @${replyToUser}: ${displayText}`;
			}

			flatList.push({
				id: comment.id,
				userId: comment.userId,
				user: displayName, // 使用处理后的名字
				avatar: displayAvatar, // 使用处理后的头像
				time: formatTimestamp(comment.createTime),
				text: displayText,
				parentId: comment.parentId,
				anonymous: isAnon, // 【新增】保存匿名状态
				// 【新增】保存原始昵称，供子评论回复时引用（如果匿名，子评论回复时也应显示“回复 @匿名用户”）
				rawNickname: displayName
			});

			// 递归处理子评论，传递当前处理后的名字作为 replyToUser
			if (comment.childrenList && comment.childrenList.length > 0) {
				const childComments = flattenComments(comment.childrenList, displayName);
				flatList = flatList.concat(childComments);
			}
		});
		return flatList;
	};

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
			} else {
				comments.value = [];
			}
		} catch (error) {
			console.error('请求评论列表异常:', error);
		}
	};

	const replyComment = async (comment) => {
		if (!await checkLoginGuard()) return;

		replyToCommentId.value = comment.id;
		replyToNickname.value = comment.user;
		uni.showToast({
			title: `正在回复 ${comment.user}`,
			icon: 'none'
		});
	};

	const addComment = async () => {
		if (!await checkLoginGuard()) return;

		const content = newCommentText.value.trim();
		if (!content) {
			uni.showToast({
				title: '评论内容不能为空',
				icon: 'none'
			});
			return;
		}
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录再评论',
				icon: 'none'
			});
			return;
		}
		uni.showLoading({
			title: '发布中...'
		});
		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: postId.value,
				targetType: 'post',
				parentId: replyToCommentId.value,
				content: content,
				anonymous: isAnonymous.value ? 1 : 0
			};
			const result = await request('/app-api/member/comment/create', {
				method: 'POST',
				data: requestData
			});
			if (result && !result.error) {
				uni.showToast({
					title: '评论成功',
					icon: 'success'
				});
				newCommentText.value = '';
				replyToCommentId.value = 0;
				replyToNickname.value = '';
				// 1. 等待列表刷新，确保 comments.value 是最新的
				await getCommentList();

				// 2. 【核心修改】获取当前最新的总数
				const currentTotalCount = comments.value.length;

				// 3. 发射事件，带上 totalCount
				uni.$emit('postInteractionChanged', {
					postId: postId.value,
					type: 'comment',
					totalCount: currentTotalCount // 直接告诉首页现在的总数是多少
				});

				isAnonymous.value = false; // 发送成功后重置勾选框
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

	// 删除评论函数
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
						method: 'DELETE',
						// data: {} 
					});

					uni.hideLoading();

					if (!error) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						getCommentList(); // 刷新列表
						// 这里如果你想做得更细致，可以像发布评论一样更新首页的评论数
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



	// ==================== 完善 toggleAction (点赞/点踩) 方法 ====================
	const toggleAction = async (post, clickedAction) => {
		if (!await checkLoginGuard()) return;

		if (isActionInProgress.value) return;
		isActionInProgress.value = true;

		// 1. 备份原始状态，用于请求失败时回滚
		const originalAction = post.userAction;
		const originalLikes = post.likes;
		const originalDislikes = post.dislikes;

		// 2. 乐观更新UI (与首页完全一致)
		if (post.userAction === clickedAction) {
			post.userAction = null;
			if (clickedAction === 'like') post.likes--;
			else post.dislikes--;
		} else {
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
			// 3. 向后端发送请求，action 值始终是 'like' 或 'dislike'
			const {
				error
			} = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: {
					targetId: post.id,
					targetType: 'post',
					action: clickedAction,
				},
			});
			if (!error) {
				hasDataChanged.value = true; // 操作成功，标记数据已变
				// 发射点赞状态变更事件
				uni.$emit('postInteractionChanged', {
					postId: post.id,
					type: 'action',
					userAction: post.userAction,
					likes: post.likes,
					dislikes: post.dislikes
				});
			}

			// 4. 如果API返回错误，则回滚UI
			if (error) {
				post.userAction = originalAction;
				post.likes = originalLikes;
				post.dislikes = originalDislikes;
				uni.showToast({
					title: `操作失败: ${error}`,
					icon: 'none'
				});
			}
			// 如果成功，什么都不用做，因为UI已经是最新状态了

		} catch (err) {
			// 5. 如果网络异常，同样回滚UI
			post.userAction = originalAction;
			post.likes = originalLikes;
			post.dislikes = originalDislikes;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 6. 解锁
			isActionInProgress.value = false;
		}
	};

	// ==================== 关注/取消关注用户 ====================
	const toggleFollow = async (post) => {
		if (!await checkLoginGuard()) return;

		// 1. 防抖/节流
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;

		// 2. 保存原始状态
		const originalFollowState = post.isFollowedUser;

		// 3. 乐观更新
		post.isFollowedUser = !post.isFollowedUser;

		const isAdding = post.isFollowedUser;
		const apiUrl = isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMessage = isAdding ? '关注成功' : '已取消关注';

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.userId,
				targetType: 'post_user'
			};

			// 4. 发送请求并解构 error
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});

			if (!error) {
				hasDataChanged.value = true; // 标记数据已变
				uni.showToast({
					title: successMessage,
					icon: 'success'
				});
				// 通知首页更新该用户的关注状态
				uni.$emit('userFollowStatusChanged', {
					userId: post.userId,
					isFollowed: post.isFollowedUser
				});
			} else {
				throw new Error(error); // 抛出错误以回滚状态
			}
		} catch (err) {
			console.error("关注/取关用户异常:", err);
			// 5. 回滚状态
			post.isFollowedUser = originalFollowState;
			uni.showToast({
				title: typeof err === 'string' ? err : '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 6. 延时解锁 (500ms 防抖)
			setTimeout(() => {
				isActionInProgress.value = false;
			}, 500);
		}
	};

	// ==================== 收藏/取消收藏商机 ====================
	const toggleBookmark = async (post) => {
		if (!await checkLoginGuard()) return;

		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;

		const originalSavedState = post.saved;
		post.saved = !post.saved;

		const isAdding = post.saved;
		const apiUrl = isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del';
		const successMessage = isAdding ? '收藏成功' : '已取消收藏';

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.id,
				targetType: 'post'
			};

			// 【修复】解构 error
			const {
				error
			} = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});

			if (!error) {
				hasDataChanged.value = true;
				uni.showToast({
					title: successMessage,
					icon: 'success'
				});

				// 发射收藏状态变更事件
				uni.$emit('postInteractionChanged', {
					postId: post.id,
					type: 'save',
					isSaved: post.saved
				});
			} else {
				throw new Error(error);
			}
		} catch (err) {
			console.error("收藏/取消收藏商机异常:", err);
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

	const previewImage = (urls, current) => {
		uni.previewImage({
			urls: urls,
			current: urls[current]
		});
	};
	const navigateToBusinessCard = (user) => {
		// 首先检查 cardFlag 是否为 false (这个逻辑保持不变)
		if (!postDetail.cardFlag) {
			uni.showToast({
				title: '作者已关闭名片查看',
				icon: 'none'
			});
			return;
		}

		// 然后检查 userId 是否有效
		if (!user || !user.id) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}

		// 使用 encodeURIComponent 确保名字和URL中的特殊字符不会导致问题
		const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
			`&name=${encodeURIComponent(user.name)}` +
			`&avatar=${encodeURIComponent(user.avatar)}`;

		uni.navigateTo({
			url: url
		});
	};

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
							id: postDetail.id // 使用详情页的商机ID
						}
					});
					uni.hideLoading();
					if (error) {
						uni.showToast({
							title: '删除失败: ' + error,
							icon: 'none'
						});
						return;
					}
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
					// 延迟1.5秒后返回上一页，确保用户能看到提示
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			}
		});
	};


	//简化长按复制菜单的状态，不再需要坐标
	const copyMenu = reactive({
		show: false,
		text: '', // 准备要复制的文本
	});

	//长按处理函数，现在它只负责显示菜单
	const handleLongPress = (textToCopy) => {
		if (!textToCopy) return;
		copyMenu.text = textToCopy;
		copyMenu.show = true;
	};

	// 【executeCopy 函数保持不变】
	const executeCopy = () => {
		if (!copyMenu.text) return;
		uni.setClipboardData({
			data: copyMenu.text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'none'
				});
			},
			fail: (err) => {
				console.error('setClipboardData failed in detail page:', err);
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				});
			},
			complete: () => {
				// 复制完成后隐藏菜单
				hideCopyMenu();
			}
		});
	};

	// 点击遮罩层或取消按钮隐藏菜单
	const hideCopyMenu = () => {
		copyMenu.show = false;
		copyMenu.text = ''; // 清空文本
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
		/* 为了让页面内容不被底部评论框遮挡，可以根据 add-comment 的高度动态调整 */
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
	 * 商机卡片 (.opportunity-card)
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

	/* 详情页作者区域加固 */
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

	/* 详情页头像圆角控制 */
	.author-avatar.is-ent {
		border-radius: 24rpx !important;
	}

	/* 右下角蓝V详情版 */
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

	/* 认证勋章设计 (详情版) */
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

	.author-avatar:active {
		transform: scale(1.05);
	}

	.avatar-tooltip {
		position: absolute;
		bottom: -56rpx;
		left: 50%;
		transform: translateX(-50%);
		color: #888;
		font-size: 22rpx;
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
	}

	.author-details {
		margin-left: 30rpx;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		/* 让内部元素垂直排列 */
		display: flex;
		flex-direction: column;
		justify-content: center;
		/* 垂直居中 */
	}

	.author-name {
		font-weight: 700;
		font-size: 36rpx;
		color: #333;
		margin-bottom: 6rpx;

		/* 移除单行省略样式，允许换行 */
		white-space: normal;
		/* 允许正常换行 */
		word-break: break-all;
		/* 允许在任意字符处换行，防止长英文单词溢出 */
		/* 移除 overflow: hidden 和 text-overflow: ellipsis */
	}

	/* 时间和按钮的容器样式 */
	.time-and-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* 让时间和按钮分别靠两边 */
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

	.follow-button {
		background-color: #FF6A00;
		color: white;
		border: none;
		border-radius: 40rpx;
		padding: 10rpx 28rpx;
		font-size: 26rpx;
		font-weight: 500;
		/* margin-left: 20rpx; */
		white-space: nowrap;
		-webkit-appearance: none;
		line-height: 1.5;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2rpx 8rpx rgba(255, 106, 0, 0.2);
		flex-shrink: 0;
	}

	.follow-button.mini-style {
		padding: 6rpx 20rpx;
		/* 减小内边距 */
		font-size: 24rpx;
		/* 减小字体大小 */
		height: auto;
		/* 高度自适应 */
		line-height: 1.4;
		/* 调整行高 */
		/* 减小删除按钮的图标大小 */
	}

	.follow-button::after {
		border: none;
	}

	.follow-button:active {
		opacity: 0.8;
		transform: translateY(1rpx);
	}

	.follow-button.followed {
		background: #e0e0e0;
		color: #666;
		box-shadow: none;
	}

	.delete-post-button {
		background-color: #f5f5f5;
		/* 使用一个中性的灰色背景 */
		color: #e74c3c;
		/* 文本和图标使用危险红色 */
		box-shadow: none;
		/* 移除阴影，使其不那么突出 */
	}

	.delete-post-button:active {
		background-color: #e0e0e0;
		/* 点击时颜色变深一点 */
	}

	/* 详情页标签样式 */
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

	/* --- 商机内容、图片、标签 --- */
	.opportunity-content {
		white-space: pre-line;
		margin: 20rpx 0;
		font-size: 32rpx;
		color: #444;
		line-height: 1.7;
		padding: 0 10rpx;
	}

	.post-images {
		display: grid;
		gap: 10rpx;
		/* 网格间距 */
		margin: 30rpx 0;
	}

	.image-wrapper {
		width: 100%;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.post-image {
		width: 100%;
		height: 100%;
		display: block;
		/* 消除 image 标签底部空隙 */
	}

	/* ==================== 视频容器和播放器样式 ==================== */
	.post-video-container {
		width: 100%;
		border-radius: 12rpx;
		overflow: hidden;
		margin: 30rpx 0;
		background-color: #000;
		/* 视频加载时的背景色 */
	}

	.post-video {
		width: 100%;
		display: block;
		/* 移除 video 标签底部可能存在的空隙 */
	}

	/* ===================================================================== */

	/* --- 核心：根据图片数量调整网格布局 --- */

	/* 默认（3张及3张以上）: 3列网格 */
	.post-images {
		grid-template-columns: repeat(3, 1fr);
	}

	.image-wrapper {
		aspect-ratio: 1 / 1;
		/* 多图时，保持1:1的正方形比例 */
	}

	.images-count-1 {
		/* 让单张图的网格容器宽度不是100%，比如 70%，使其不会显得过大 */
		/* 注意：这里是修改父容器的样式，而不是 .image-wrapper */
		grid-template-columns: minmax(0, 2fr) 1fr;
		/* 让第一列占据 2/3 宽度 */
	}

	/* Case 1: 只有 1 张图片 */
	.images-count-1 .image-wrapper {
		/* grid-column: 1 / -1; */
		/* 占据整行 */
		/* aspect-ratio: unset; */
		/* 移除正方形限制，让图片以原始比例显示 */
	}

	/* Case 2: 有 2 张或 4 张图片 */
	.images-count-2,
	.images-count-4 {
		grid-template-columns: repeat(2, 1fr);
		/* 2列网格，布局更美观 */
	}

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

	/* --- 交互按钮区 --- */
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


	.viewer-section {
		margin-top: 30rpx;
		padding-top: 20rpx;
		border-top: 2rpx solid #f5f5f5;
	}

	.viewer-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.viewer-title {
		font-size: 26rpx;
		color: #666;
		font-weight: bold;
	}

	.viewer-title .count {
		color: #FF6A00;
		margin-left: 8rpx;
	}

	.more-link {
		font-size: 24rpx;
		color: #999;
	}

	.avatar-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.viewer-avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		border: 2rpx solid #fff;
	}

	.avatar-more {
		width: 64rpx;
		height: 64rpx;
		background: #f0f0f0;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 24rpx;
	}

	/* 浏览留痕模块卡片容器 */
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


	/* ==================================================================
	 * 评论区 (.comments-section)
	 * ================================================================== */
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

	/* 子评论的缩进样式 */
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

	.comment-avatar:active {
		transform: scale(1.05);
	}

	.comment-content {
		margin-left: 30rpx;
		flex-grow: 1;
	}

	.comment-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.commenter-name {
		font-weight: 600;
		font-size: 32rpx;
		color: #333;
	}

	.comment-time {
		font-size: 24rpx;
		color: #888;
		margin-left: 24rpx;
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

	/* ==================================================================
	 * 浮动与弹窗元素 (底部评论框, 分享弹窗, 引导蒙层)
	 * ================================================================== */

	/* =========================================
	   底部悬浮评论栏 (新设计)
	   ========================================= */
	.add-comment-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx 24rpx;
		/* 适配底部安全区 */
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		border-top: 1rpx solid #f0f0f0;
		z-index: 999;
		box-sizing: border-box;
		display: flex;
		align-items: flex-end;
		/* 底部对齐，适应多行输入 */
		gap: 20rpx;
	}

	/* 输入框容器 (胶囊状) */
	.input-container {
		flex: 1;
		background: #f5f7fa;
		border-radius: 40rpx;
		/* 大圆角 */
		padding: 14rpx 20rpx;
		display: flex;
		align-items: center;
		/* 垂直居中 */
		min-height: 80rpx;
		box-sizing: border-box;
		transition: all 0.3s;
		border: 2rpx solid transparent;
	}

	.input-container:focus-within {
		background: #fff;
		border-color: #FF6A00;
		box-shadow: 0 0 0 4rpx rgba(255, 106, 0, 0.1);
	}

	/* 匿名开关 */
	.anon-switch {
		display: flex;
		align-items: center;
		padding: 0 10rpx;
		transition: all 0.3s;
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

	/* 垂直分割线 */
	.vertical-line {
		width: 2rpx;
		height: 32rpx;
		background-color: #e0e0e0;
		margin: 0 16rpx;
		flex-shrink: 0;
	}

	/* 文本域 */
	.bar-textarea {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		width: 100%;
		/* 移除默认内边距 */
		padding: 0;
		line-height: 1.5;
		max-height: 200rpx;
		/* 限制最大高度 */
		min-height: 40rpx;
	}

	/* 发送按钮 (圆形) */
	.send-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #e0e0e0;
		/* 默认禁用色 */
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		flex-shrink: 0;
		margin-bottom: 2rpx;
		/* 微调对齐 */
	}

	/* 可发送状态 */
	.send-btn.can-send {
		background: linear-gradient(135deg, #FF8C00, #FF6A00);
		box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
		transform: scale(1.05);
	}

	.send-btn:active {
		transform: scale(0.95);
	}

	.comment-textarea {
		flex-grow: 1;
		background: #f5f5f5;
		border: 2rpx solid #e0e0e0;
		border-radius: 40rpx;
		/* 保持圆角 */
		padding: 18rpx 40rpx;
		/* 调整内边距使其垂直居中 */
		font-size: 30rpx;
		outline: none;
		transition: all 0.3s;
		margin-right: 24rpx;
		line-height: 1.5;
		/* 设置合适的行高 */
		box-sizing: border-box;
		min-height: 80rpx;
		/* 与按钮高度保持一致 */
	}

	.comment-textarea:focus {
		border-color: #FF6A00;
		box-shadow: 0 0 0 4rpx rgba(255, 106, 0, 0.2);
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

	/* =========================
	 * 9. 居中长按复制菜单样式
	 * ========================= */
	.copy-menu-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		/* 半透明遮罩 */
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
		/* 确保在最上层 */
	}

	.copy-menu-content {
		background-color: white;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.copy-menu-item {
		padding: 24rpx 80rpx;
		font-size: 32rpx;
		color: #333;
		text-align: center;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.copy-menu-item:last-child {
		border-bottom: none;
	}

	/* 增加一个点击效果 */
	.copy-menu-item:active {
		background-color: #f7f7f7;
	}
</style>