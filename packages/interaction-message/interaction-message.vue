<template>
	<view class="interaction-page">
		<!-- 头部状态提示 -->
		<view class="privacy-notice">
			<uni-icons type="info" size="14" color="#FF730E"></uni-icons>
			<text>一对一私密留言，仅您与商机发布者可见</text>
		</view>

		<!-- 聊天列表区 -->
		<scroll-view class="chat-list" scroll-y :scroll-into-view="scrollTarget" :scroll-with-animation="true"
			:style="{ paddingBottom: inputBarHeight + 'px' }">
			<view class="message-container">
				<view v-for="(item) in commentList" :key="item.id" :id="'msg-' + item.id" class="message-group"
					:class="{ 'is-me': item.owner === 1 }">
					<image :src="item.memberUserBaseVO?.avatar || '/static/icon/default-avatar.png'" class="user-avatar"
						mode="aspectFill" />
					<view class="message-content-box">
						<view class="user-name">{{ item.memberUserBaseVO?.nickname || '商友' }}</view>
						<view class="bubble">
							<text class="text-content">{{ item.content }}</text>
						</view>
						<view class="message-time">{{ formatTime(item.createTime) }}</view>
					</view>
				</view>
				<!-- 底部锚点 -->
				<view id="chat-bottom-anchor"></view>
			</view>

			<view v-if="commentList.length === 0 && !isLoading" class="empty-state">
				<uni-icons type="chat-filled" size="50" color="#eee" />
				<text>暂无互动记录，发条留言开始沟通吧</text>
			</view>
		</scroll-view>

		<!-- 底部输入栏 -->
		<view class="input-footer" :style="{ paddingBottom: safeBottomHeight + 'px' }" @layout="onInputBarLayout">
			<view class="input-wrapper">
				<textarea class="main-input" v-model="content" auto-height :adjust-position="false" :cursor-spacing="20"
					placeholder="请输入您的留言..." maxlength="500" @focus="onInputFocus" @blur="onInputBlur" />
				<view class="send-btn" :class="{ 'active': content.trim() }" @click="handleSend">
					发送
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		nextTick
	} from 'vue';
	import {
		onLoad,
		onUnload
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const targetId = ref(null);
	const viewUserId = ref(undefined);
	const commentList = ref([]);
	const content = ref('');
	const isLoading = ref(false);

	// 滚动锚点：通过切换 id 字符串来触发 scroll-view 滚动
	const scrollTarget = ref('');

	// 底部安全高度（iPhone 底部圆角区）
	const safeBottomHeight = ref(0);

	// 输入栏整体高度，用于给 scroll-view 预留空间，防止遮挡
	const inputBarHeight = ref(60); // 先给一个默认值（px），onLayout 后会更新

	// 键盘高度
	const keyboardHeight = ref(0);

	onLoad((options) => {
		const sys = uni.getSystemInfoSync();
		safeBottomHeight.value = sys.safeAreaInsets?.bottom ?? 0;

		// 初始化输入栏高度预估（输入框本身约 50px + padding 约 20px + 安全区）
		inputBarHeight.value = 70 + safeBottomHeight.value;

		targetId.value = options.targetId;
		if (options.userId && options.userId !== 'null' && options.userId !== 'undefined') {
			viewUserId.value = options.userId;
		}

		// 监听键盘高度变化
		uni.onKeyboardHeightChange(res => {
			keyboardHeight.value = res.height;
			// 键盘弹出时，追加键盘高度到 scroll-view 底部 padding，确保内容不被遮挡
			const sys = uni.getSystemInfoSync();
			const baseHeight = 70 + safeBottomHeight.value;
			inputBarHeight.value = res.height > 0 ? baseHeight + res.height : baseHeight;
			// 键盘弹出后滚动到底部
			if (res.height > 0) {
				scrollToBottom();
			}
		});

		fetchComments();
	});

	onUnload(() => {
		uni.offKeyboardHeightChange();
	});

	/** 键盘弹出时滚动到底部 */
	const onInputFocus = () => {
		// 延迟等待键盘动画完成
		setTimeout(() => {
			scrollToBottom();
		}, 350);
	};

	const onInputBlur = () => {
		// 键盘收起，恢复正常底部高度
		inputBarHeight.value = 70 + safeBottomHeight.value;
	};

	/** 获取留言列表 */
	const fetchComments = async () => {
		isLoading.value = true;
		const queryParams = {
			targetId: targetId.value,
			targetType: 'partner_post',
			pageNo: 1,
			pageSize: 100
		};
		if (viewUserId.value) {
			queryParams.userId = viewUserId.value;
		}

		const {
			data,
			error
		} = await request('/app-api/member/comment/partner-post-comment-list', {
			method: 'GET',
			data: queryParams
		});

		if (!error && data?.list) {
			// 接口返回[新...旧]，反转为[旧...新]，最新消息在底部
			commentList.value = [...data.list].reverse();
			scrollToBottom();
		}
		isLoading.value = false;
	};

	/** 发送留言 */
	const handleSend = async () => {
		const text = content.value.trim();
		if (!text) return;

		const loggedInUserId = uni.getStorageSync('userId');
		uni.showLoading({
			title: '发送中',
			mask: true
		});

		const payload = {
			userId: loggedInUserId,
			targetId: targetId.value,
			targetType: 'partner_post',
			content: text,
			anonymous: 0,
			id: 0
		};
		if (viewUserId.value) payload.replyUserId = viewUserId.value;

		const {
			error
		} = await request('/app-api/member/comment/create', {
			method: 'POST',
			data: payload
		});

		uni.hideLoading();
		if (!error) {
			content.value = '';
			await fetchComments(); // fetchComments 内部会调用 scrollToBottom
		} else {
			uni.showToast({
				title: error || '发送失败',
				icon: 'none'
			});
		}
	};

	/**
	 * 滚动到底部
	 * 核心：先清空 scrollTarget，再在下一帧 + setTimeout 后重新赋值
	 * 这样 scroll-view 才能检测到值的变化并触发滚动
	 */
	const scrollToBottom = () => {
		nextTick(() => {
			scrollTarget.value = '';
			setTimeout(() => {
				scrollTarget.value = 'chat-bottom-anchor';
			}, 100);
		});
	};

	/** 格式化时间（兼容时间戳和字符串） */
	const formatTime = (time) => {
		if (!time) return '';
		let date;
		if (typeof time === 'number') {
			date = new Date(time);
		} else if (typeof time === 'string') {
			const normalized = time.replace('T', ' ').replace(/-/g, '/');
			date = new Date(normalized);
			if (isNaN(date.getTime())) {
				return time.replace('T', ' ').substring(5, 16);
			}
		} else {
			return '';
		}
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		return `${M}-${D} ${h}:${m}`;
	};
</script>

<style lang="scss" scoped>
	$gofor-primary: #FF730E;

	.interaction-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f4f5f7;
	}

	.privacy-notice {
		background: #fffbe6;
		padding: 16rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8rpx;
		font-size: 22rpx;
		color: #ed6a0c;
		border-bottom: 1rpx solid #ffe58f;
		flex-shrink: 0; // 禁止被压缩
	}

	/* scroll-view 撑满剩余高度 */
	.chat-list {
		flex: 1;
		// 注意：padding-bottom 通过 :style 动态绑定，在这里只写左右上
		padding: 30rpx 30rpx 0;
		box-sizing: border-box;
		// 关键：overflow 让内容可以滚动
		overflow: hidden;
	}

	.message-container {
		// 给底部锚点留一个最小高度，确保最后一条消息不被输入栏遮住
		padding-bottom: 20rpx;
	}

	.message-group {
		display: flex;
		margin-bottom: 40rpx;

		.user-avatar {
			width: 84rpx;
			height: 84rpx;
			border-radius: 12rpx;
			margin-right: 20rpx;
			background: #eee;
			flex-shrink: 0;
		}

		.message-content-box {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			max-width: 75%;
		}

		.user-name {
			font-size: 24rpx;
			color: #999;
			margin-bottom: 8rpx;
			margin-left: 4rpx;
		}

		.bubble {
			background: #fff;
			padding: 20rpx 28rpx;
			border-radius: 4rpx 28rpx 28rpx 28rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
			word-break: break-all;

			.text-content {
				font-size: 30rpx;
				color: #333;
				line-height: 1.5;
			}
		}

		.message-time {
			font-size: 20rpx;
			color: #bbb;
			margin-top: 12rpx;
			margin-left: 4rpx;
		}

		// 我的留言（右侧）
		&.is-me {
			flex-direction: row-reverse;

			.user-avatar {
				margin-right: 0;
				margin-left: 20rpx;
			}

			.message-content-box {
				align-items: flex-end;
			}

			.bubble {
				background: $gofor-primary;
				border-radius: 28rpx 4rpx 28rpx 28rpx;

				.text-content {
					color: #fff;
				}
			}

			.message-time,
			.user-name {
				margin-left: 0;
				margin-right: 4rpx;
			}
		}
	}

	/* 输入栏：fixed 定位保持贴底 */
	.input-footer {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx 30rpx;
		// padding-bottom 通过 :style 动态绑定，这里只写默认值
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		border-top: 1rpx solid #eee;
		z-index: 100;

		.input-wrapper {
			display: flex;
			align-items: flex-end;
			gap: 20rpx;
		}

		.main-input {
			flex: 1;
			background: #f5f5f5;
			border-radius: 20rpx;
			padding: 20rpx 30rpx;
			font-size: 30rpx;
			max-height: 200rpx;
			min-height: 40rpx;
			box-sizing: border-box;
		}

		.send-btn {
			background: #e0e0e0;
			color: #fff;
			width: 120rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			border-radius: 40rpx;
			font-size: 28rpx;
			font-weight: bold;
			transition: all 0.2s;
			flex-shrink: 0;

			&.active {
				background: $gofor-primary;
				box-shadow: 0 4rpx 10rpx rgba(255, 115, 14, 0.2);
			}

			&:active {
				opacity: 0.8;
			}
		}
	}

	.empty-state {
		padding-top: 300rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #ccc;
		font-size: 26rpx;
		gap: 20rpx;
	}
</style>