<template>
	<view class="comment-page">
		<!-- 评论列表区域 -->
		<scroll-view scroll-y class="comment-scroll" @scrolltolower="onReachBottom">
			<view class="comment-list" v-if="comments.length > 0">
				<view class="comment-item" v-for="comment in comments" :key="comment.id"
					:class="{'is-reply': comment.parentId !== 0}">
					<!-- 头像 -->
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

			<view v-else class="empty-holder">
				<image src="/static/icon/empty-comment.png" mode="aspectFit" class="empty-img"></image>
				<text>抢个沙发，发表第一条评论吧！</text>
			</view>

			<view style="height: 160rpx;"></view>
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
			</view>

			<view class="send-btn" :class="{ 'can-send': newCommentText.trim().length > 0 }" @click="handleSend">
				<uni-icons type="paperplane-filled" size="22" color="#ffff7f"></uni-icons>
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
		onUnmounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
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

	const placeholderText = computed(() =>
		replyToName.value ? `回复 @${replyToName.value}` : '友善评论，文明互动...'
	);

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

		fetchComments();

		uni.onKeyboardHeightChange(res => {
			keyboardHeight.value = res.height;
		});
	});

	onUnmounted(() => {
		uni.offKeyboardHeightChange();
	});

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

			list.push({
				id: c.id,
				userId: c.userId,
				user: name,
				avatar: avatar,
				time: formatTime(c.createTime),
				text: c.content,
				parentId: c.parentId,
				replyTo: replyTo,
				isAnon: isAnon
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
		if (!newCommentText.value.trim()) return;

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
				anonymous: isAnonymous.value ? 1 : 0
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
</script>

<style scoped>
	.comment-page {
		height: 100vh;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
	}

	.comment-scroll {
		flex: 1;
	}

	.comment-item {
		background-color: #fff;
		padding: 30rpx;
		display: flex;
		margin-bottom: 2rpx;
	}

	.comment-item.is-reply {
		padding-left: 110rpx;
		background-color: #fafafa;
	}

	.c-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
		background-color: #f0f0f0;
	}

	.c-body {
		flex: 1;
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
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		border-top: 1rpx solid #f0f0f0;
		z-index: 999;
		box-sizing: border-box;
		display: flex;
		align-items: flex-end;
		gap: 20rpx;
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
		background-color: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-left: 20rpx;
		margin-bottom: 5rpx;
	}

	.send-btn.can-send {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
	}

	.send-btn:deep(.uni-icons) {
		display: block;
		line-height: 1;
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

	.empty-img {
		width: 240rpx;
		height: 240rpx;
		margin-bottom: 20rpx;
	}
</style>