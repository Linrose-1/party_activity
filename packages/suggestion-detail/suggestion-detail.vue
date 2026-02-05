<!-- packages/suggestion-detail/suggestion-detail.vue -->
<template>
	<view class="detail-page" v-if="detail">
		<view class="container">
			<!-- 1. 状态与标题 -->
			<view class="header-card">
				<view class="status-row">
					<text class="status-tag"
						:class="'status-' + detail.status">{{ getStatusText(detail.status) }}</text>
					<text class="time-txt">{{ formatTime(detail.createTime) }} 发布</text>
				</view>
				<view class="main-title">{{ detail.title }}</view>
			</view>

			<!-- 2. 作者信息 -->
			<view class="author-bar" @click="goUserCard(detail.memberUser?.id)">
				<image :src="detail.memberUser?.avatar || defaultAvatar" mode="aspectFill" class="u-avatar" />
				<view class="u-info">
					<text class="u-name">{{ detail.memberUser?.nickname || '匿名商友' }}</text>
					<text class="u-desc">{{ detail.memberUser?.professionalTitle || '平台共建商友' }}</text>
				</view>
				<uni-icons type="right" size="14" color="#ccc"></uni-icons>
			</view>

			<!-- 3. 建议正文 -->
			<view class="content-card">
				<view class="section-title">建议详情</view>
				<text class="content-text" selectable>{{ detail.content }}</text>

				<!-- 图片展示 -->
				<view class="image-gallery" v-if="imageList.length">
					<image v-for="(img, index) in imageList" :key="index" :src="img" mode="widthFix" class="detail-img"
						@click="previewImage(index)" />
				</view>
			</view>
		</view>

		<!-- 4. 底部操作栏 (如果是本人，显示编辑按钮) -->
		<view class="footer-bar" v-if="isOwner">
			<button class="edit-btn" @click="goEdit">编辑建议内容</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	const detail = ref(null);
	const defaultAvatar = '/static/icon/default-avatar.png';
	const loggedInUserId = uni.getStorageSync('userId');

	onLoad((options) => {
		if (options.id) {
			fetchDetail(options.id);
		}
	});

	/**
	 * [接口方法] 获取建议详情
	 */
	const fetchDetail = async (id) => {
		uni.showLoading({
			title: '正在加载...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/suggestion/get', {
			method: 'GET',
			data: {
				id
			}
		});
		uni.hideLoading();
		if (data) detail.value = data;
	};

	// 判定是否为发布者本人
	const isOwner = computed(() => {
		return detail.value && detail.value.creator == loggedInUserId;
	});

	// 解析图片数组
	const imageList = computed(() => {
		return detail.value?.img ? detail.value.img.split(',').filter(Boolean) : [];
	});

	const getStatusText = (s) => {
		const map = {
			0: '待处理',
			1: '已采纳',
			2: '处理中'
		};
		return map[s] || '已公示';
	};

	const formatTime = (ts) => {
		if (!ts) return '';
		const d = new Date(ts);
		return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
	};

	const previewImage = (index) => {
		uni.previewImage({
			urls: imageList.value,
			current: index
		});
	};

	const goUserCard = (id) => {
		if (!id) return;
		uni.navigateTo({
			url: `/packages/my-businessCard/my-businessCard?id=${id}`
		});
	};

	const goEdit = () => {
		uni.navigateTo({
			url: `/pages/my-systemSuggestions/my-systemSuggestions?id=${detail.value.id}`
		});
	};
</script>

<style scoped lang="scss">
	.detail-page {
		min-height: 100vh;
		background-color: #F8F9FA;
		padding-bottom: 150rpx;
	}

	.container {
		padding: 30rpx;
	}

	.header-card {
		background: #fff;
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 24rpx;

		.status-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 24rpx;

			.status-tag {
				font-size: 22rpx;
				padding: 6rpx 20rpx;
				border-radius: 8rpx;
				font-weight: bold;

				&.status-0 {
					background: #f5f5f5;
					color: #999;
				}

				&.status-1 {
					background: #EFFFF4;
					color: #4CAF50;
				}
			}

			.time-txt {
				font-size: 24rpx;
				color: #bbb;
			}
		}

		.main-title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
			line-height: 1.4;
		}
	}

	.author-bar {
		background: #fff;
		border-radius: 30rpx;
		padding: 30rpx 40rpx;
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;

		.u-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 24rpx;
			background: #f0f0f0;
		}

		.u-info {
			flex: 1;

			.u-name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				display: block;
			}

			.u-desc {
				font-size: 24rpx;
				color: #999;
			}
		}
	}

	.content-card {
		background: #fff;
		border-radius: 30rpx;
		padding: 40rpx;

		.section-title {
			font-size: 28rpx;
			color: #999;
			font-weight: bold;
			margin-bottom: 30rpx;
			border-left: 8rpx solid #FF852B;
			padding-left: 20rpx;
		}

		.content-text {
			font-size: 32rpx;
			color: #444;
			line-height: 1.8;
			text-align: justify;
		}
	}

	.image-gallery {
		margin-top: 40rpx;

		.detail-img {
			width: 100%;
			border-radius: 16rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		}
	}

	.footer-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		padding: 30rpx 40rpx 50rpx;
		box-sizing: border-box;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

		.edit-btn {
			background: #FF852B;
			color: #fff;
			border-radius: 50rpx;
			font-weight: bold;
			font-size: 30rpx;
		}
	}
</style>