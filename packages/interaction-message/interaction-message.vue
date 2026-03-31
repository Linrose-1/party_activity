<template>
	<view class="interaction-page">
		<!-- 头部状态提示 -->
		<view class="privacy-notice" id="header">
			<uni-icons type="info" size="14" color="#FF730E"></uni-icons>
			<text>一对一私密留言，仅您与商机发布者可见</text>
		</view>

		<!-- 聊天列表区 -->
		<!-- 重点 1: padding-bottom 动态计算，确保最后一条消息在输入框上方 -->
		<scroll-view class="chat-list" scroll-y :scroll-into-view="scrollTarget" :scroll-with-animation="true"
			:style="{ height: scrollHeight }">
			<view class="message-container" id="msg-container">
				<!-- 找到 v-for 循环的消息组部分 -->
				<view v-for="(item) in commentList" :key="item.id" :id="'msg-' + item.id" class="message-group"
					:class="{ 'is-me': item.owner == 1 || item.userId == currentUserId }">

					<image :src="item.memberUserBaseVO?.avatar || '/static/icon/default-avatar.png'" class="user-avatar"
						mode="aspectFill" />

					<view class="message-content-box">
						<view class="user-name">{{ item.memberUserBaseVO?.nickname || '商友' }}</view>

						<view class="bubble">
							<text class="text-content">{{ item.content }}</text>
						</view>

						<view class="message-info-row">
							<text class="message-time">{{ formatTime(item.createTime) }}</text>

							<!-- 优化点：判断逻辑增强，使用精致的垃圾桶图标 -->
							<view v-if="item.owner == 1 || item.userId == currentUserId" class="delete-icon-btn"
								@click.stop="handleDeleteClick(item)">
								<uni-icons type="trash" size="16" color="#ff4d4f"></uni-icons>
								<text class="delete-txt">删除</text>
							</view>
						</view>
					</view>
				</view>
				<!-- 底部锚点 -->
				<view id="chat-bottom-anchor" style="height: 1rpx;"></view>
			</view>

			<view v-if="commentList.length === 0 && !isLoading" class="empty-state">
				<uni-icons type="chat-filled" size="50" color="#eee" />
				<text>暂无互动记录，发条留言开始沟通吧</text>
			</view>
		</scroll-view>

		<!-- 底部输入栏 -->
		<!-- 重点 2: bottom 直接绑定键盘高度，paddingBottom 只有键盘收起时才显示安全区 -->
		<view class="input-footer"
			:style="{ bottom: keyboardHeight + 'px', paddingBottom: keyboardHeight > 0 ? '10px' : safeBottomHeight + 'px' }">
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
		nextTick,
		computed
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
	const scrollTarget = ref('');

	const safeBottomHeight = ref(0);
	const keyboardHeight = ref(0);
	const windowHeight = ref(0);

	const currentUserId = ref(uni.getStorageSync('userId'));

	// 重点 3: 动态计算 scroll-view 的高度
	// 公式：窗口高度 - 顶部提示高度 - 输入框高度 - 键盘高度
	const scrollHeight = computed(() => {
		// 预估输入框+间距约 60px
		const footerHeight = keyboardHeight.value > 0 ? 60 : 60 + safeBottomHeight.value;
		return `calc(${windowHeight.value}px - 80rpx - ${footerHeight}px - ${keyboardHeight.value}px)`;
	});

	onLoad((options) => {
		currentUserId.value = uni.getStorageSync('userId');
		
		const sys = uni.getSystemInfoSync();
		windowHeight.value = sys.windowHeight;
		safeBottomHeight.value = sys.safeAreaInsets?.bottom ?? 0;

		targetId.value = options.targetId;
		if (options.userId && options.userId !== 'null' && options.userId !== 'undefined') {
			viewUserId.value = options.userId;
		}

		// 重点 4: 监听键盘高度，手动同步到变量
		uni.onKeyboardHeightChange(res => {
			keyboardHeight.value = res.height;
			if (res.height > 0) {
				scrollToBottom();
			}
		});

		fetchComments();
	});

	onUnload(() => {
		uni.offKeyboardHeightChange();
	});

	const onInputFocus = (e) => {
		// e.detail.height 也可以获取键盘高度
		keyboardHeight.value = e.detail.height || keyboardHeight.value;
		scrollToBottom();
	};

	const onInputBlur = () => {
		keyboardHeight.value = 0;
	};

	const fetchComments = async () => {
		isLoading.value = true;
		const queryParams = {
			targetId: targetId.value,
			targetType: 'partner_post',
			pageNo: 1,
			pageSize: 100
		};
		if (viewUserId.value) queryParams.userId = viewUserId.value;

		const {
			data,
			error
		} = await request('/app-api/member/comment/partner-post-comment-list', {
			method: 'GET',
			data: queryParams
		});

		if (!error && data?.list) {
			commentList.value = [...data.list].reverse();
			scrollToBottom();
		}
		isLoading.value = false;
	};

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
			await fetchComments();
		} else {
			uni.showToast({
				title: error || '发送失败',
				icon: 'none'
			});
		}
	};

	const scrollToBottom = () => {
		nextTick(() => {
			scrollTarget.value = '';
			setTimeout(() => {
				scrollTarget.value = 'chat-bottom-anchor';
			}, 150);
		});
	};

	// 2. 统一删除处理函数
	const handleDeleteClick = (item) => {
		console.log('用户点击删除:', item.id);

		// 震动反馈
		uni.vibrateShort();

		uni.showModal({
			title: '删除留言',
			content: '确定要删除这条信息吗？',
			confirmText: '删除',
			confirmColor: '#ff4d4f',
			success: (res) => {
				if (res.confirm) {
					executeDeleteApi(item.id);
				}
			}
		});
	};

	/**
	 * 真正执行删除接口
	 */
	const executeDeleteApi = async (id) => {
		if (!id) return;

		uni.showLoading({
			title: '正在删除...',
			mask: true
		});

		try {
			const {
				error
			} = await request(`/app-api/member/comment/delete?id=${id}`, {
				method: 'DELETE'
			});

			uni.hideLoading();

			if (!error) {
				uni.showToast({
					title: '已删除',
					icon: 'success'
				});
				// 刷新列表
				await fetchComments();
			} else {
				uni.showToast({
					title: typeof error === 'string' ? error : (error.msg || '删除失败'),
					icon: 'none'
				});
			}
		} catch (e) {
			uni.hideLoading();
			console.error('删除异常:', e);
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		}
	};


	const formatTime = (time) => {
		if (!time) return '';
		let date;
		if (typeof time === 'number') date = new Date(time);
		else if (typeof time === 'string') {
			const normalized = time.replace('T', ' ').replace(/-/g, '/');
			date = new Date(normalized);
			if (isNaN(date.getTime())) return time.replace('T', ' ').substring(5, 16);
		} else return '';

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
		/* 重点 5: 禁止页面整体滚动 */
		overflow: hidden;
	}

	.privacy-notice {
		height: 80rpx;
		/* 固定高度方便计算 */
		background: #fffbe6;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8rpx;
		font-size: 22rpx;
		color: #ed6a0c;
		border-bottom: 1rpx solid #ffe58f;
		flex-shrink: 0;
	}

	.chat-list {
		width: 100%;
		// 高度由 computed 动态计算
		box-sizing: border-box;
	}

	.message-container {
		padding: 30rpx 30rpx 40rpx;
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
			display: flex;
			align-items: center;

			.delete-link {
				margin-left: 20rpx;
				color: #999;
				text-decoration: underline;
				padding: 4rpx 10rpx; // 增加点击区域
			}
		}

		/* 消息底部信息行（包含时间和删除） */
		.message-info-row {
			display: flex;
			align-items: center;
			margin-top: 10rpx;
			gap: 20rpx;
		}

		.message-time {
			font-size: 20rpx;
			color: #bbb;
		}

		/* 精致删除按钮样式 */
		.delete-icon-btn {
			display: flex;
			align-items: center;
			background-color: rgba(255, 77, 79, 0.05); // 极淡的红色背景
			padding: 4rpx 12rpx;
			border-radius: 20rpx;
			transition: all 0.2s;

			.delete-txt {
				font-size: 20rpx;
				color: #ff4d4f;
				margin-left: 4rpx;
				font-weight: 500;
			}

			&:active {
				background-color: rgba(255, 77, 79, 0.15);
				transform: scale(0.9);
			}
		}

		/* 针对自己的消息（右侧）的排版调整 */
		.is-me {
			flex-direction: row-reverse;

			.message-info-row {
				flex-direction: row-reverse; // 让时间和删除按钮也反过来排
			}

			.message-content-box {
				align-items: flex-end;
			}
		}

		// 针对“我发送的”消息，删除按钮在时间前面或调整位置
		.is-me .message-time {
			flex-direction: row-reverse;

			.delete-link {
				margin-left: 0;
				margin-right: 20rpx;
				color: #ff4d4f; // 自己的删除按钮可以用红色，更醒目
			}
		}

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
		}
	}

	.input-footer {
		position: fixed;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 20rpx 30rpx;
		box-sizing: border-box;
		border-top: 1rpx solid #eee;
		z-index: 100;
		transition: bottom 0.1s linear; // 稍微增加过渡让键盘动画更顺滑

		.input-wrapper {
			display: flex;
			align-items: flex-end;
			gap: 20rpx;
		}

		.main-input {
			flex: 1;
			background: #f5f5f5;
			border-radius: 20rpx;
			padding: 18rpx 30rpx;
			font-size: 30rpx;
			max-height: 200rpx;
			min-height: 40rpx;
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
			flex-shrink: 0;

			&.active {
				background: $gofor-primary;
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
	}
</style>