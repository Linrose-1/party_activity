<template>
	<view class="business-opportunity-detail-app">
		<view class="container">
			<!-- 商机卡片 (保持不变) -->
			<view class="opportunity-card">
				<!-- ... 此处省略商机卡片的所有内容，保持原样即可 ... -->
				<view class="author-info">
					<view class="author-avatar-wrapper">
						<!-- <view class="author-avatar" @click="navigateToBusinessCard(postDetail.userId)">
							{{ postDetail.user.charAt(0) }}
						</view> -->
						<image :src="postDetail.avatar" mode="" class="author-avatar"
							@click="navigateToBusinessCard({ id: postDetail.userId, name: postDetail.user, avatar: postDetail.avatar })">
						</image>
						<view class="avatar-tooltip">点击获取联系方式</view>
					</view>
					<view class="author-details">
						<view class="author-name">{{ postDetail.user }}</view>
						<view class="post-time">
							<uni-icons type="redo" size="14" color="#888"></uni-icons> {{ postDetail.time }}
						</view>
					</view>
					<!-- 如果是访客，显示关注按钮 -->
					<button v-if="showFollowButton" class="follow-button"
						:class="{ 'followed': postDetail.isFollowedUser }" @click.stop="toggleFollow(postDetail)">
						{{ postDetail.isFollowedUser ? '已关注' : '关注' }}
					</button>
					<!-- 如果是作者本人，显示删除按钮 -->
					<button v-else-if="loggedInUserId && loggedInUserId === postDetail.userId"
						class="follow-button delete-post-button" @click.stop="deletePost">
						<uni-icons type="trash" size="14" color="#e74c3c"></uni-icons>
						删除
					</button>
				</view>
				<view style="font-weight: 700;font-size: 36rpx;">{{postDetail.postTitle}}</view>
				<view class="opportunity-content">
					{{ postDetail.content }}
				</view>
				<view class="post-images" v-if="postDetail.images && postDetail.images.length"
					:class="['images-count-' + postDetail.images.length]">
					<!-- 直接遍历所有图片 -->
					<view v-for="(image, imgIndex) in postDetail.images" :key="imgIndex" class="image-wrapper"
						@click.stop="previewImage(postDetail.images, imgIndex)">
						<image :src="image" class="post-image"
							:mode="postDetail.images.length === 1 ? 'widthFix' : 'aspectFill'" />
					</view>
				</view>
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

			<!-- ==================== 模板修改点 1: 评论区改造 ==================== -->
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
								@click="navigateToBusinessCard({ id: comment.userId, name: comment.user, avatar: comment.avatar })">
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
								</view>
							</view>
						</view>
						<view v-if="comments.length === 0" class="no-comments-message">
							暂无评论，快来发表第一条评论吧！
						</view>
					</view>
				</view>

				<!-- 底部添加评论区域 -->
				<view class="add-comment">
					<input type="text" v-model="newCommentText" :placeholder="commentInputPlaceholder"
						@confirm="addComment" confirm-type="send" />
					<button @click="addComment">发送</button>
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
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
		computed
	} from 'vue';
	import {
		onLoad,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';

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
		time: '',
		content: '',
		images: [],
		tags: [],
		likes: 0,
		dislikes: 0,
		userAction: null,
		saved: false,
		isFollowedUser: false,
		cardFlag: true,
		commentFlag: true,
	});

	const comments = ref([]);
	const newCommentText = ref('');
	const replyToCommentId = ref(0);
	const replyToNickname = ref('');

	const sharePopup = ref(null); // 用于获取 uni-popup 组件实例
	const customShareTitle = ref(''); // 用于存储用户自定义的分享标题
	const showTimelineGuide = ref(false);

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

		// ==================== 新增：处理分享点击逻辑 ====================
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
			withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});
	});

	onMounted(() => {});

	// 【新增】打开分享弹窗的方法
	const openSharePopup = () => {
		// 设置输入框的默认值为商机标题
		customShareTitle.value = postDetail.postTitle || '发现一个商机，快来看看吧！';
		// 打开弹窗
		sharePopup.value.open();
	};

	// 【新增】关闭分享弹窗的方法
	const closeSharePopup = () => {
		sharePopup.value.close();
	};

	// 【新增】引导用户分享到朋友圈的方法
	const guideShareTimeline = () => {
		// 1. 先关闭底部的分享弹窗
		closeSharePopup();

		// 2. 显示右上角的引导遮罩
		showTimelineGuide.value = true;

		// 重要：确保此时 onShareTimeline 返回的内容是用户刚刚编辑好的
		// 因为 onShareTimeline 是一个生命周期钩子，它会自己读取我们设置好的 customShareTitle 等变量
		// 所以我们在这里不需要做什么特殊处理，只需要显示引导即可
	};

	// 【新增】隐藏引导遮罩的方法
	const hideTimelineGuide = () => {
		showTimelineGuide.value = false;
	};

	// ==================== 定义分享给好友的内容 ====================
	onShareAppMessage((res) => {
		console.log("触发分享给好友", res);
		// 分享时，关闭弹窗
		closeSharePopup();

		// 新增：获取分享者自己的用户ID
		const sharerId = uni.getStorageSync('userId');

		// 优先使用用户自定义的标题，如果为空，则使用商机标题作为备选
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';

		// 修改：在路径中添加 sharerId 参数
		let sharePath = `/pages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`;
		if (sharerId) {
			sharePath += `&sharerId=${sharerId}`;
		}

		return {
			title: finalTitle,
			path: sharePath, // 使用拼接后的路径
			imageUrl: postDetail.images.length > 0 ? postDetail.images[0] : '/static/logo.png'
		};
	});

	// ==================== 定义分享到朋友圈的内容 ====================
	onShareTimeline(() => {
		console.log("触发分享到朋友圈");

		// 新增：获取分享者自己的用户ID
		const sharerId = uni.getStorageSync('userId');

		// 1. 优先使用用户在弹窗中编辑的自定义标题
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';

		// 2. 封面图片逻辑
		const finalImageUrl = postDetail.images.length > 0 ? postDetail.images[0] : '/static/logo.png';

		// 3. 修改：在 query 中添加 sharerId 参数
		let queryString = `id=${postDetail.id}&from=timeline`;
		if (sharerId) {
			queryString += `&sharerId=${sharerId}`;
		}

		// 4. 返回最终的分享对象
		return {
			title: finalTitle,
			query: queryString, // 使用拼接后的 query
			imageUrl: finalImageUrl
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
				postDetail.id = item.id;
				postDetail.content = item.postContent;
				postDetail.postTitle = item.postTitle;
				postDetail.images = item.postImg ? String(item.postImg).split(',').filter(img => img) : [];
				postDetail.likes = item.likesCount || 0;
				postDetail.dislikes = item.dislikesCount || 0;
				postDetail.time = formatTimestamp(item.createTime);
				postDetail.user = item.memberUser?.nickname || '匿名用户';
				postDetail.avatar = item.memberUser?.avatar || defaultAvatarUrl;
				postDetail.userId = item.userId;
				postDetail.saved = item.followFlag === 1;
				postDetail.isFollowedUser = item.followUserFlag === 1;
				postDetail.userAction = item.userLikeStr || null;
				postDetail.cardFlag = item.cardFlag;
				postDetail.commentFlag = item.commentFlag;

				if (loggedInUserId.value && item.userId && loggedInUserId.value != item.userId) {
					showFollowButton.value = true;
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

	const flattenComments = (apiComments, replyToUser = null) => {
		let flatList = [];
		if (!Array.isArray(apiComments)) return flatList;
		apiComments.forEach(comment => {
			const userVO = comment.memberUserBaseVO || {};
			let displayText = comment.content;
			if (replyToUser) {
				displayText = `回复 @${replyToUser}: ${displayText}`;
			}
			flatList.push({
				id: comment.id,
				userId: comment.userId,
				user: userVO.nickname || '匿名用户',
				avatar: userVO.avatar,
				time: formatTimestamp(comment.createTime),
				text: displayText,
				parentId: comment.parentId
			});
			if (comment.childrenList && comment.childrenList.length > 0) {
				const childComments = flattenComments(comment.childrenList, userVO.nickname || '匿名用户');
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

	const replyComment = (comment) => {
		replyToCommentId.value = comment.id;
		replyToNickname.value = comment.user;
		uni.showToast({
			title: `正在回复 ${comment.user}`,
			icon: 'none'
		});
	};

	const addComment = async () => {
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
				await getCommentList();
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



	// ==================== 核心修改点: 完善 toggleAction (点赞/点踩) 方法 ====================
	const toggleAction = async (item, clickedAction) => {
		if (isActionInProgress.value) return; // 防止重复点击
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;
		uni.showLoading({
			title: '请稍候...'
		});

		// 决定要发送给API的action值
		// 如果再次点击已激活的按钮，则取消（发送空字符串）
		// 否则，设置为新点击的action
		const apiActionToSend = item.userAction === clickedAction ? '' : clickedAction;

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: item.id, // 目标是商机的ID
				targetType: 'post', // 类型是post
				action: apiActionToSend, // 发送 'like', 'dislike', 或 ''
			};

			console.log('点赞/踩/取消 操作, 请求:', requestData);

			const result = await request('/app-api/member/like-action/add', {
				method: 'POST',
				data: requestData,
			});

			if (result && result.error) {
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			}

		} catch (error) {
			console.error("点赞/踩操作异常:", error);
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 无论成功与否，都关闭loading，然后刷新详情页数据以同步UI
			uni.hideLoading();
			await getBusinessOpportunitiesDetail();
			isActionInProgress.value = false; // 解锁
		}
	};

	// ==================== 关注/取消关注用户 ====================
	// ==================== 关注/取消关注用户 (已修正为乐观UI更新) ====================
	const toggleFollow = async (post) => {
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;

		// 1. 保存原始状态，用于请求失败时回滚
		const originalFollowState = post.isFollowedUser;

		// 2.【核心】立即修改本地数据，UI瞬间响应
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

			// 3. 在后台发送API请求
			const result = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});

			// 4. 处理API返回结果
			if (result && result.error) {
				// 如果API返回失败，将UI状态回滚到原始状态
				post.isFollowedUser = originalFollowState;
				uni.showToast({
					title: result.error || '操作失败',
					icon: 'none'
				});
			} else {
				// API成功，给出成功提示，UI已是最新，无需任何操作
				uni.showToast({
					title: successMessage,
					icon: 'success'
				});
			}
		} catch (error) {
			console.error("关注/取关用户异常:", error);
			// 如果网络请求异常，同样回滚UI状态
			post.isFollowedUser = originalFollowState;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 5. 无论成功失败，最后都解锁
			isActionInProgress.value = false;
		}
	};


	// ==================== 收藏/取消收藏商机 ====================
	// ==================== 收藏/取消收藏商机 (已修正为乐观UI更新) ====================
	const toggleBookmark = async (post) => {
		if (isActionInProgress.value) return;
		if (!loggedInUserId.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		isActionInProgress.value = true;

		// 1. 保存原始状态
		const originalSavedState = post.saved;

		// 2.【核心】立即修改本地数据，UI瞬间响应
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

			// 3. 在后台发送API请求
			const result = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});
			console.log("触发收藏", result)

			// 4. 处理API返回结果
			if (result && result.error) {
				// API失败，回滚UI
				post.saved = originalSavedState;
				uni.showToast({
					title: result.error || '操作失败',
					icon: 'none'
				});
			} else {
				// API成功，给出成功提示
				uni.showToast({
					title: successMessage,
					icon: 'success'
				});
			}
		} catch (error) {
			console.error("收藏/取消收藏商机异常:", error);
			// 网络异常，回滚UI
			post.saved = originalSavedState;
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			// 5. 解锁
			isActionInProgress.value = false;
		}
	};

	// const shareOpportunity = () => {
	// 	uni.showToast({
	// 		title: '分享功能即将上线',
	// 		icon: 'none'
	// 	});
	// };
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

		// 【核心修改】构建带有多参数的URL
		// 使用 encodeURIComponent 确保名字和URL中的特殊字符不会导致问题
		const url = `/pages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
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

	.author-avatar-wrapper {
		position: relative;
		flex-shrink: 0;
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
	}

	.author-name {
		font-weight: 700;
		font-size: 36rpx;
		color: #333;
		margin-bottom: 6rpx;
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
		margin-left: 20rpx;
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

	/* --- 商机内容、图片、标签 --- */
	.opportunity-content {
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

	/* --- 核心：根据图片数量调整网格布局 --- */

	/* 默认（3张及3张以上）: 3列网格 */
	.post-images {
		grid-template-columns: repeat(3, 1fr);
	}

	.image-wrapper {
		aspect-ratio: 1 / 1;
		/* 多图时，保持1:1的正方形比例 */
	}


	/* Case 1: 只有 1 张图片 */
	.images-count-1 .image-wrapper {
		grid-column: 1 / -1;
		/* 占据整行 */
		aspect-ratio: unset;
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

	/* ==================================================================
	 * 评论区 (.comments-section)
	 * ================================================================== */
	.comments-section {
		background: white;
		border-radius: 36rpx;
		margin: 0 30rpx 40rpx;
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

	/* --- 底部固定评论框 --- */
	.add-comment {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		display: flex;
		align-items: center;
		background: white;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.05);
		border-top: 2rpx solid #e0e0e0;
		z-index: 99;
		box-sizing: border-box;
	}

	.add-comment input {
		flex-grow: 1;
		background: #f5f5f5;
		border: 2rpx solid #e0e0e0;
		border-radius: 50rpx;
		padding: 24rpx 40rpx;
		font-size: 30rpx;
		outline: none;
		transition: all 0.3s;
		margin-right: 24rpx;
	}

	.add-comment input:focus {
		border-color: #FF6A00;
		box-shadow: 0 0 0 4rpx rgba(255, 106, 0, 0.2);
	}

	.add-comment button {
		background: #FF6A00;
		color: white;
		border: none;
		border-radius: 50rpx;
		padding: 0 40rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-weight: 500;
		transition: background 0.3s;
		box-shadow: 0 6rpx 20rpx rgba(255, 106, 0, 0.3);
		-webkit-appearance: none;
		flex-shrink: 0;
	}

	.add-comment button::after {
		border: none;
	}

	.add-comment button:active {
		background: #e05a00;
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
</style>