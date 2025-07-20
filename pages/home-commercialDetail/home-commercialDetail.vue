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
							@click="navigateToBusinessCard(postDetail.userId)"></image>
						<view class="avatar-tooltip">点击获取联系方式</view>
					</view>
					<view class="author-details">
						<view class="author-name">{{ postDetail.user }}</view>
						<view class="post-time">
							<uni-icons type="redo" size="14" color="#888"></uni-icons> {{ postDetail.time }}
						</view>
					</view>
					<button v-if="showFollowButton" class="follow-button"
						:class="{ 'followed': postDetail.isFollowedUser }" @click.stop="toggleFollow(postDetail)">
						{{ postDetail.isFollowedUser ? '已关注' : '关注' }}
					</button>
				</view>
				<view style="font-weight: 700;font-size: 36rpx;">{{postDetail.postTitle}}</view>
				<view class="opportunity-content">
					{{ postDetail.content }}
				</view>
				<view class="post-images" v-if="postDetail.images && postDetail.images.length">
					<view v-for="(image, imgIndex) in postDetail.images" :key="imgIndex" class="image-wrapper">
						<img :src="image" alt="商机图片" class="post-image"
							@click.stop="previewImage(postDetail.images, imgIndex)" />
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
								@click="navigateToBusinessCard(comment.userId)"></image>
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
		// 分享时，关闭弹窗，体验更好
		closeSharePopup();

		// 核心逻辑：优先使用用户自定义的标题，如果为空，则使用商机标题作为备选
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';

		return {
			title: finalTitle,
			path: `/pages/home-commercialDetail/home-commercialDetail?id=${postDetail.id}`,
			imageUrl: postDetail.images.length > 0 ? postDetail.images[0] : '/static/logo.png'
		};
	});

	// ==================== 定义分享到朋友圈的内容 ====================
	onShareTimeline(() => {
		console.log("触发分享到朋友圈");
	
		// 1. 优先使用用户在弹窗中编辑的自定义标题
		//    如果用户没编辑（或弹窗没打开），则使用商机的原始标题
		//    如果商机标题也没有，则使用一个通用的默认标题
		const finalTitle = customShareTitle.value || postDetail.postTitle || '发现一个商机，快来看看吧！';
	
		// 2. 封面图片逻辑保持简单：
		//    优先用商机的第一张图，如果没有则用一个默认的logo
		const finalImageUrl = postDetail.images.length > 0 ? postDetail.images[0] : '/static/logo.png'; // 请确保/static/logo.png存在
	
		// 3. 返回最终的分享对象
		return {
			title: finalTitle,
			// query参数会附加到当前页面路径后面
			query: `id=${postDetail.id}&from=timeline`,
			imageUrl: finalImageUrl
		}
	});

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
				postDetail.user = item.memberUser.nickname || '匿名用户';
				postDetail.avatar = item.memberUser.avatar;
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
		const isAdding = !post.isFollowedUser;
		const apiUrl = isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		uni.showLoading({
			title: '请稍候...'
		});

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.userId,
				targetType: 'post_user'
			};

			const result = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});

			if (result && result.error) {
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error("关注/取关用户异常:", error);
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
			await getBusinessOpportunitiesDetail();
			isActionInProgress.value = false;
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
		const isAdding = !post.saved;
		const apiUrl = isAdding ? '/app-api/member/follow/add' : '/app-api/member/follow/del';

		uni.showLoading({
			title: '请稍候...'
		});

		try {
			const requestData = {
				userId: loggedInUserId.value,
				targetId: post.id,
				targetType: 'post'
			};

			const result = await request(apiUrl, {
				method: 'POST',
				data: requestData
			});

			if (result && result.error) {
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				});
			}

		} catch (error) {
			console.error("收藏/取消收藏商机异常:", error);
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
			await getBusinessOpportunitiesDetail();
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
	const navigateToBusinessCard = (userId) => {
		// 首先检查 cardFlag 是否为 false
		if (!postDetail.cardFlag) {
			uni.showToast({
				title: '作者已关闭名片查看',
				icon: 'none'
			});
			return;
		}

		// 然后检查 userId 是否有效
		if (!userId) {
			uni.showToast({
				title: '无法查看该用户主页',
				icon: 'none'
			});
			return;
		}

		uni.navigateTo({
			url: `/pages/applicationBusinessCard/applicationBusinessCard?userId=${userId}`
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
		border-radius: 50%;
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

	/* --- 商机内容、图片、标签 --- */
	.opportunity-content {
		margin: 20rpx 0;
		font-size: 32rpx;
		color: #444;
		line-height: 1.7;
		padding: 0 10rpx;
	}

	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.image-wrapper {
		width: calc((100% - 32rpx) / 3);
		aspect-ratio: 1 / 1;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.post-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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
		border-radius: 50%;
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