<template>
	<uni-popup ref="popupRef" type="center" :is-mask-click="false" background-color="#fff">
		<view class="edit-popup-container">
			<view class="popup-header">
				<text class="title">✏️ 编辑点评</text>
			</view>

			<view class="popup-content">
				<view class="target-info">
					给 <text class="highlight">{{ reviewData.targetName || '商友' }}</text> 的评价
				</view>

				<!-- 【新增】评价类型选择 -->
				<view class="action-buttons">
					<view class="action-btn like-btn" :class="{ active: currentIsLike === 1 }" @click="selectLike(1)">
						<uni-icons type="hand-up-filled" size="20"
							:color="currentIsLike === 1 ? '#fff' : '#FF8500'"></uni-icons>
						<text>好评/点赞</text>
					</view>
					<view class="action-btn dislike-btn" :class="{ active: currentIsLike === 2 }"
						@click="selectLike(2)">
						<uni-icons type="hand-down-filled" size="20"
							:color="currentIsLike === 2 ? '#fff' : '#666'"></uni-icons>
						<text>改进/点踩</text>
					</view>
				</view>

				<view class="input-area">
					<textarea v-model="content" class="review-textarea" placeholder="请输入评价内容..." maxlength="500" />
					<view class="word-count">{{ content.length }}/500</view>
				</view>
			</view>

			<view class="popup-footer">
				<button class="btn cancel-btn" @click="close">取消</button>
				<button class="btn save-btn" @click="handleSave" :disabled="loading">
					{{ loading ? '保存中...' : '保存修改' }}
				</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	const props = defineProps({
		reviewData: {
			type: Object,
			default: () => ({})
		}
	});

	const emit = defineEmits(['close', 'save']);

	const popupRef = ref(null);
	const content = ref('');
	const currentIsLike = ref(1); // 1赞 2踩
	const loading = ref(false);

	const open = () => {
		content.value = props.reviewData.reviewContent || '';
		currentIsLike.value = props.reviewData.isLike || 1; // 回显赞踩状态
		popupRef.value.open();
	};

	const close = () => {
		popupRef.value.close();
		emit('close');
	};

	const selectLike = (val) => {
		currentIsLike.value = val;
	};

	const handleSave = () => {
		// 允许内容为空吗？如果不允许，取消注释下面这行
		// if (!content.value.trim()) { uni.showToast({ title: '内容不能为空', icon: 'none' }); return; }

		loading.value = true;
		emit('save', {
			id: props.reviewData.id,
			reviewContent: content.value,
			isLike: currentIsLike.value, // 提交新的赞踩状态
			// 保持其他字段
			userId: props.reviewData.userId,
			reviewedId: props.reviewData.reviewedId,
			isAnonymous: props.reviewData.isAnonymous
		}, () => {
			loading.value = false;
			close();
		});
	};

	defineExpose({
		open,
		close
	});
</script>

<style lang="scss" scoped>
	.edit-popup-container {
		width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		padding: 30rpx;
	}

	.popup-header {
		text-align: center;
		margin-bottom: 30rpx;

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.target-info {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 20rpx;

		.highlight {
			color: #FF8500;
			font-weight: bold;
			margin: 0 6rpx;
		}
	}

	.review-textarea {
		width: 100%;
		height: 240rpx;
		background-color: #f5f7fa;
		border-radius: 12rpx;
		padding: 20rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.word-count {
		text-align: right;
		font-size: 22rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.popup-footer {
		display: flex;
		gap: 20rpx;
		margin-top: 30rpx;

		.btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			font-weight: bold;

			&::after {
				border: none;
			}
		}

		.cancel-btn {
			background-color: #f5f5f5;
			color: #666;
		}

		.save-btn {
			background: linear-gradient(to right, #FF8500, #FF6B00);
			color: #fff;
		}
	}

	.action-buttons {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;

		.action-btn {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 16rpx;
			border-radius: 12rpx;
			background: #f9f9f9;
			border: 2rpx solid transparent;
			transition: all 0.2s;
			font-size: 26rpx;
			gap: 8rpx;

			&.like-btn.active {
				background-color: #FF8500;
				border-color: #FF8500;
				color: #fff;
			}

			&.dislike-btn.active {
				background-color: #666;
				border-color: #666;
				color: #fff;
			}
		}
	}

	/* 复用之前的样式 */
	.edit-popup-container {
		width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		padding: 30rpx;
	}

	.popup-header {
		text-align: center;
		margin-bottom: 30rpx;

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.target-info {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 20rpx;

		.highlight {
			color: #FF8500;
			font-weight: bold;
			margin: 0 6rpx;
		}
	}

	.review-textarea {
		width: 100%;
		height: 240rpx;
		background-color: #f5f7fa;
		border-radius: 12rpx;
		padding: 20rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.word-count {
		text-align: right;
		font-size: 22rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.popup-footer {
		display: flex;
		gap: 20rpx;
		margin-top: 30rpx;

		.btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			font-weight: bold;

			&::after {
				border: none;
			}
		}

		.cancel-btn {
			background-color: #f5f5f5;
			color: #666;
		}

		.save-btn {
			background: linear-gradient(to right, #FF8500, #FF6B00);
			color: #fff;
		}
	}
</style>