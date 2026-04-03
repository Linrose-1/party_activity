<template>
	<view class="comment-page">
		<!-- 评论列表区域 -->
		<scroll-view scroll-y class="comment-scroll" @scrolltolower="onReachBottom"
			:scroll-into-view="scrollToCommentId" :scroll-with-animation="true">
			<view class="comment-list" v-if="comments.length > 0">
				<view class="comment-item" v-for="comment in comments" :key="comment.id" :id="'comment-' + comment.id"
					:class="{'is-reply': comment.parentId !== 0, 'is-highlight': highlightId === comment.id}">
					<!-- 头像和内容行 -->
					<view class="comment-header-row">
						<image :src="comment.avatar" class="c-avatar" mode="aspectFill" @click="goUserCard(comment)">
						</image>

						<view class="c-body">
							<view class="c-header">
								<text class="c-name">{{ comment.user }}</text>
								<text class="c-time">{{ comment.time }}</text>
							</view>

							<view class="c-text" @longpress="handleLongPress(comment.text)">
								<text v-if="comment.replyTo" class="reply-to">@{{ comment.replyTo }} </text>
								{{ comment.text }}
							</view>

							<!-- 评论图片展示 -->
							<view v-if="comment.imageUrls && comment.imageUrls.length > 0" class="comment-images">
								<view v-for="(img, imgIndex) in comment.imageUrls" :key="imgIndex"
									class="comment-image-item" @click="previewImage(comment.imageUrls, imgIndex)">
									<image :src="img" mode="aspectFill" class="comment-image"></image>
								</view>
							</view>

							<view class="c-actions">
								<view class="action-btn" @click="startReply(comment)">
									<uni-icons type="chatbubble" size="14" color="#666"></uni-icons>
									<text>回复</text>
								</view>
								<view v-if="loggedInUserId == comment.userId" class="action-btn delete"
									@click="deleteComment(comment.id)">
									<uni-icons type="trash" size="14" color="#999"></uni-icons>
									<text>删除</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view v-else class="empty-holder">
				<uni-icons type="chatbubble-filled" size="60" color="#e0e0e0" class="empty-icon"></uni-icons>
				<text>抢个沙发，发表第一条评论吧！</text>
			</view>

			<view :style="{ height: (keyboardHeight + 120) + 'px' }"></view>
		</scroll-view>

		<!-- 底部悬浮评论栏 -->
		<view class="add-comment-bar" :style="{ bottom: keyboardHeight + 'px' }">
			<view class="input-container">
				<!-- 匿名开关 -->
				<view class="anon-switch" :class="{ 'is-active': isAnonymous }" @click="isAnonymous = !isAnonymous">
					<uni-icons :type="isAnonymous ? 'eye-slash-filled' : 'eye-filled'" size="18"
						:color="isAnonymous ? '#FF6A00' : '#999'"></uni-icons>
					<text>{{ isAnonymous ? '匿名' : '显名' }}</text>
				</view>

				<view class="vertical-line"></view>

				<textarea auto-height maxlength="200" v-model="newCommentText" :placeholder="placeholderText"
					:adjust-position="false" class="bar-textarea" cursor-spacing="10"></textarea>

				<!-- 图片上传按钮 -->
				<view v-if="!imageUrls || imageUrls.length === 0" class="image-upload-btn" @click="handleChooseImage">
					<uni-icons type="image" size="24" color="#999"></uni-icons>
				</view>

				<!-- 发送按钮 -->
				<view class="send-btn"
					:class="{ 'can-send': (newCommentText.trim().length > 0 || (imageUrls && imageUrls.length > 0)) }"
					@click="handleSend">
					<uni-icons type="paperplane-filled" size="22" color="#ffff7f"></uni-icons>
				</view>
			</view>

			<!-- 已选择的图片预览 -->
			<view v-if="imageUrls && imageUrls.length > 0" class="selected-images-container">
				<view v-for="(img, index) in imageUrls" :key="index" class="selected-image-item">
					<image :src="img" mode="aspectFill" class="selected-image" @click="previewImage(imageUrls, index)">
					</image>
					<view class="remove-image" @click="removeImage(index)">×</view>
				</view>
				<view class="image-comment-hint">
					发布图片评论需消耗2智米
				</view>
			</view>
		</view>

		<!-- 长按复制菜单 -->
		<view v-if="copyMenu.show" class="copy-mask" @click="copyMenu.show = false">
			<view class="copy-content" @click.stop="executeCopy">复制</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onUnmounted,
		nextTick
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import uploadFile from '@/utils/upload.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	const targetId = ref(null);
	const targetType = ref('');
	const comments = ref([]);
	const loggedInUserId = ref(uni.getStorageSync('userId'));

	const newCommentText = ref('');
	const isAnonymous = ref(false);
	const replyToId = ref(0);
	const replyToName = ref('');
	const keyboardHeight = ref(0);

	const scrollToCommentId = ref(''); // scroll-into-view 绑定值
	const highlightId = ref(null); // 高亮评论 id
	const scrollTop = ref(0);
	const scrollTopKey = ref(0); // 强制触发用

	// 图片相关
	const imageUrls = ref([]);

	const placeholderText = computed(() =>
		replyToName.value ? `回复 @${replyToName.value}` : '友善评论，文明互动...'
	);

	// onLoad((options) => {
	// 	targetId.value = options.id;
	// 	targetType.value = options.type;

	// 	const titleMap = {
	// 		'activity': '聚会评论',
	// 		'store': '聚店评论'
	// 	};
	// 	uni.setNavigationBarTitle({
	// 		title: titleMap[targetType.value] || '评论'
	// 	});

	// 	fetchComments();

	// 	uni.onKeyboardHeightChange(res => {
	// 		keyboardHeight.value = res.height;
	// 	});
	// });
	onLoad((options) => {
		targetId.value = options.id;
		targetType.value = options.type;

		const titleMap = {
			'activity': '聚会评论',
			'store': '聚店评论'
		};
		uni.setNavigationBarTitle({
			title: titleMap[targetType.value] || '评论'
		});

		fetchComments().then(() => {
			if (options.commentId) {
				const id = options.commentId;
				highlightId.value = Number(id);
				setTimeout(() => {
					highlightId.value = null;
				}, 2500);

				// 【核心修复】：双重异步定位
				// 1. 先确保 ID 为空
				scrollToCommentId.value = '';

				nextTick(() => {
					// 2. 延迟等待列表彻底完成布局计算
					setTimeout(() => {
						scrollToCommentId.value = 'comment-' + id;
						console.log('✅ 已强制触发滚动定位:', scrollToCommentId.value);
					}, 400); // 略微调高延迟到 400ms，避开页面进入动画
				});
			}
		});


		uni.onKeyboardHeightChange(res => {
			keyboardHeight.value = res.height;
		});
	});

	onUnmounted(() => {
		uni.offKeyboardHeightChange();
	});

	// 滚动到指定评论
	const scrollToComment = (commentId) => {
		scrollToCommentId.value = 'comment-' + commentId;
	};

	/**
	 * 获取评论列表并格式化为扁平结构
	 */
	const fetchComments = async () => {
		const {
			data
		} = await request('/app-api/member/comment/select-type-target-id', {
			method: 'GET',
			data: {
				targetId: targetId.value,
				targetType: targetType.value
			}
		});
		if (data) {
			comments.value = flattenComments(data);
		}
	};

	/**
	 * 将树形评论数据展平为一维列表
	 * @param {Array} apiData - 后端返回的评论数据
	 * @param {string|null} replyTo - 父级评论用户名（用于显示 @xxx）
	 */
	const flattenComments = (apiData, replyTo = null) => {
		let list = [];
		apiData.forEach(c => {
			const isAnon = c.anonymous === 1;
			const name = isAnon ? '匿名商友' : (c.memberUserBaseVO?.nickname || '商友');
			const avatar = isAnon ? '/static/icon/default-avatar.png' : c.memberUserBaseVO?.avatar;

			// 处理 imageUrls 字段的数据格式问题
			let imageUrls = c.imageUrls || [];
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

			list.push({
				id: c.id,
				userId: c.userId,
				user: name,
				avatar: avatar,
				time: formatTime(c.createTime),
				text: c.content,
				parentId: c.parentId,
				replyTo: replyTo,
				isAnon: isAnon,
				// 添加并处理图片字段
				imageUrls: imageUrls
			});
			if (c.childrenList) {
				list = list.concat(flattenComments(c.childrenList, name));
			}
		});
		return list;
	};

	/**
	 * 通知详情页评论数据已变化
	 * 详情页 onShow 会监听此事件并重新拉取评论预览
	 */
	const emitCommentChanged = () => {
		uni.$emit('commentChanged', {
			targetId: targetId.value,
			targetType: targetType.value,
			totalCount: comments.value.length
		});
	};

	/**
	 * 点击"回复"，设置回复目标
	 * @param {object} comment - 被回复的评论对象
	 */
	const startReply = (comment) => {
		replyToId.value = comment.id;
		replyToName.value = comment.user;
		uni.showToast({
			title: `回复 @${comment.user}`,
			icon: 'none'
		});
	};

	/**
	 * 发送评论
	 * 发布成功后刷新本页列表，并 emit 事件通知详情页更新预览
	 */
	const handleSend = async () => {
		if (!await checkLoginGuard()) return;
		if (!newCommentText.value.trim() && (!imageUrls.value || imageUrls.value.length === 0)) return;

		uni.showLoading({
			title: '发布中...'
		});

		const {
			error
		} = await request('/app-api/member/comment/create', {
			method: 'POST',
			data: {
				userId: loggedInUserId.value,
				targetId: targetId.value,
				targetType: targetType.value,
				parentId: replyToId.value || 0,
				content: newCommentText.value,
				anonymous: isAnonymous.value ? 1 : 0,
				imageUrls: imageUrls.value // 添加图片字段
			}
		});

		uni.hideLoading();

		if (!error) {
			uni.showToast({
				title: '发布成功'
			});
			newCommentText.value = '';
			replyToId.value = 0;
			replyToName.value = '';
			isAnonymous.value = false;
			imageUrls.value = []; // 清空图片
			// 先刷新本页列表，再 emit（确保 totalCount 是最新值）
			await fetchComments();
			emitCommentChanged();
		}
	};

	/**
	 * 删除评论
	 * 删除成功后刷新本页列表，并 emit 事件通知详情页更新预览
	 * @param {string|number} id - 评论 ID
	 */
	const deleteComment = (id) => {
		uni.showModal({
			title: '提示',
			content: '确定删除此评论吗？',
			success: async (res) => {
				if (res.confirm) {
					const {
						error
					} = await request(`/app-api/member/comment/delete?id=${id}`, {
						method: 'DELETE'
					});
					if (!error) {
						await fetchComments();
						emitCommentChanged();
					}
				}
			}
		});
	};

	/**
	 * 跳转至用户名片页（匿名评论不可点击）
	 * @param {object} comment - 评论对象
	 */
	const goUserCard = (comment) => {
		if (comment.isAnon) return;
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${comment.userId}&name=${encodeURIComponent(comment.user)}&avatar=${encodeURIComponent(comment.avatar)}`
		});
	};

	/**
	 * 格式化时间戳为 M-D HH:mm 格式
	 * @param {number} ts - 时间戳（毫秒）
	 */
	const formatTime = (ts) => {
		const d = new Date(ts);
		return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
	};

	// 长按复制
	const copyMenu = reactive({
		show: false,
		text: ''
	});

	const handleLongPress = (text) => {
		copyMenu.text = text;
		copyMenu.show = true;
	};

	const executeCopy = () => {
		uni.setClipboardData({
			data: copyMenu.text,
			success: () => {
				copyMenu.show = false;
			}
		});
	};

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
	 * 预览图片
	 * @param {Array} urls - 图片URL数组
	 * @param {Number} current - 当前图片索引
	 */
	const previewImage = (urls, current) => {
		uni.previewImage({
			urls: urls,
			current: current
		});
	};

	/**
	 * 删除已选择的图片
	 * @param {Number} index - 图片索引
	 */
	const removeImage = (index) => {
		imageUrls.value.splice(index, 1);
	};
</script>

<style scoped>
	.comment-page {
		height: 100vh;
		overflow: hidden;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
	}

	.comment-scroll {
		flex: 1;
		height: 0;
		width: 100%;
	}

	.comment-header-row {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		width: 100%;
	}

	.comment-item {
		background-color: #fff;
		padding: 30rpx;
		display: flex;
		margin-bottom: 2rpx;
		flex-direction: column;
	}

	.comment-item.is-reply {
		padding-left: 30rpx;
		padding-top: 30rpx;
		background-color: #fafafa;
	}

	.c-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
		background-color: #f0f0f0;
		flex-shrink: 0;
	}

	.c-body {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.c-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10rpx;
	}

	.c-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.c-time {
		font-size: 22rpx;
		color: #bbb;
	}

	.c-text {
		font-size: 28rpx;
		color: #444;
		line-height: 1.6;
		word-break: break-all;
	}

	.reply-to {
		color: #007AFF;
		margin-right: 8rpx;
	}

	.c-actions {
		display: flex;
		gap: 30rpx;
		margin-top: 20rpx;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		font-size: 24rpx;
		color: #666;
	}

	.action-btn.delete {
		color: #ff4d4f;
	}

	/* ── 底部评论栏 ── */
	.add-comment-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx 24rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
		border-top: 1rpx solid #f0f0f0;
		z-index: 1001;
		/* 确保在最上层 */
		box-sizing: border-box;
	}

	.input-container {
		display: flex;
		align-items: center;
		flex: 1;
		background: #f5f7fa;
		border-radius: 40rpx;
		padding: 14rpx 20rpx;
		min-height: 80rpx;
		box-sizing: border-box;
		transition: all 0.3s;
		border: 2rpx solid transparent;
		gap: 10rpx;
	}

	.anon-switch {
		display: flex;
		align-items: center;
		padding: 0 10rpx;
		transition: all 0.3s;
		flex-shrink: 0;
		flex-wrap: nowrap;
	}

	.anon-switch uni-icons {
		margin-right: 6rpx;
	}

	.anon-switch text {
		font-size: 24rpx;
		color: #666;
		font-weight: 500;
		white-space: nowrap;
	}

	.anon-switch.is-active text {
		color: #FF6A00;
	}

	.bar-textarea {
		flex: 1;
		padding: 6rpx 10rpx;
		font-size: 28rpx;
		line-height: 1.4;
		color: #333;
		background: transparent;
		border: none;
		outline: none;
		min-height: 40rpx;
		max-height: 160rpx;
		height: auto;
		margin: 0 10rpx;
	}

	.vertical-line {
		width: 2rpx;
		height: 40rpx;
		background-color: #ddd;
		margin: 0 10rpx;
		flex-shrink: 0;
		align-self: center;
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
	}

	.send-btn.can-send {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
	}

	.send-btn:deep(.uni-icons) {
		display: block;
		line-height: 1;
	}

	/* 评论图片样式 */
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
		flex-shrink: 0;
	}

	.comment-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* ── 复制菜单 ── */
	.copy-mask {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.copy-content {
		background: #fff;
		padding: 30rpx 100rpx;
		border-radius: 12rpx;
		font-size: 32rpx;
	}

	/* ── 空状态 ── */
	.empty-holder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		color: #999;
		font-size: 28rpx;
	}

	.empty-icon {
		margin-bottom: 20rpx;
		opacity: 0.5;
	}

	.empty-img {
		width: 240rpx;
		height: 240rpx;
		margin-bottom: 20rpx;
	}

	.is-highlight {
		animation: highlight-flash 3s ease-out forwards;
	}

	@keyframes highlight-flash {
		0% {
			background-color: #fff3e0;
		}

		80% {
			background-color: #fff3e0;
		}

		100% {
			background-color: #fff;
		}
	}
</style>