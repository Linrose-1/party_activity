<template>
	<view class="page-container">
		<!-- 1. 顶部吸顶 Tab 导航 -->
		<view class="main-nav">
			<!-- 使用 v-for 动态生成 Tab -->
			<text v-for="(level, index) in membershipLevels" :key="level.level" class="nav-link"
				:class="{ 'active': currentTab === index }" @click="switchTab(index)">
				{{ level.name.replace('会员', '') }} <!-- 简化显示，例如 "玄铁会员" -> "玄铁" -->
			</text>
		</view>

		<!-- 2. 页面主内容区域 -->
		<view class="content-wrapper">
			<view class="header">
				<text class="title">会员等级与权益</text>
				<text class="subtitle">探索不同等级的专属权益，开启您的价值之旅</text>
			</view>

			<!-- 3. Swiper 滑动容器，用于展示权益图片 -->
			<!-- 动态绑定 style，使其高度可变 -->
			<swiper class="membership-swiper" :current="currentTab" :style="{ height: currentSwiperHeight }"
				@change="onSwiperChange">
				<swiper-item v-for="(level, index) in membershipLevels" :key="level.level" class="swiper-item">
					<!-- 监听图片的 @load 事件以计算高度 -->
					<image :src="level.backgroundUrl" class="benefit-image" mode="widthFix"
						@load="onImageLoad($event, index)" />
				</swiper-item>
			</swiper>

		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	// ‼️ 请确保此路径相对于您文件的位置是正确的
	import request from '../../utils/request.js';

	// ======================= 数据状态 =======================
	// 存储从接口获取的会员等级列表
	const membershipLevels = ref([]);
	// 当前激活的 Tab 和 Swiper 的索引
	const currentTab = ref(0);

	// --- 动态高度计算所需状态 ---
	// 1. 获取一次屏幕宽度，用于后续计算
	const screenWidth = uni.getSystemInfoSync().windowWidth;
	// 2. 创建一个数组，用于存储每张图片计算后的显示高度
	const imageHeights = ref([]);

	const initialTargetLevel = ref(null);

	// 3. 创建一个计算属性，用于动态返回当前 Swiper 应有的高度 (单位: px)
	const currentSwiperHeight = computed(() => {
		const height = imageHeights.value[currentTab.value];
		if (height) {
			// 如果高度已计算出来，则使用该高度
			return `${height}px`;
		}
		// 如果高度尚未计算（例如图片还未加载），给一个默认的最小高度防止塌陷
		return '300px';
	});

	// ======================= 生命周期 =======================
	onLoad((options) => {
		// options 对象包含了上一个页面传递过来的所有参数
		if (options && options.level) {
			// 将字符串参数转为数字并存储起来
			initialTargetLevel.value = Number(options.level);
		}
	});

	onMounted(() => {
		fetchMembershipLevels();
	});

	// ======================= 数据获取 =======================
	/**
	 * @description 从接口获取会员等级列表
	 */
	const fetchMembershipLevels = async () => {
		uni.showLoading({
			title: '加载中...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/top-up-level/list');
		uni.hideLoading();

		if (error) {
			uni.showToast({
				title: `加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}

		if (data && data.length > 0) {
			// 按 level 字段排序，确保显示顺序正确
			membershipLevels.value = data.sort((a, b) => a.level - b.level);

			if (initialTargetLevel.value !== null) {
				// 查找目标 level 在数组中的索引
				const targetIndex = membershipLevels.value.findIndex(item => item.level === initialTargetLevel
					.value);

				// 如果找到了（targetIndex !== -1），则设置 currentTab
				if (targetIndex !== -1) {
					currentTab.value = targetIndex;
				}
			}
		}
	};

	// ======================= 交互逻辑 =======================
	/**
	 * @description 点击 Tab 时切换
	 * @param {number} index - 被点击的 Tab 的索引
	 */
	const switchTab = (index) => {
		if (currentTab.value !== index) {
			currentTab.value = index;
		}
	};

	/**
	 * @description Swiper 滑动时触发，同步更新 Tab
	 * @param {object} e - Swiper change 事件对象
	 */
	const onSwiperChange = (e) => {
		// e.detail.current 是当前滑块的索引
		currentTab.value = e.detail.current;
	};

	/**
	 * @description 当图片加载完成时触发，计算并存储其应有的显示高度
	 * @param {object} e - 图片 load 事件对象
	 * @param {number} index - 当前图片的索引
	 */
	const onImageLoad = (e, index) => {
		// 从事件对象中获取图片的原始宽度和高度
		const originalWidth = e.detail.width;
		const originalHeight = e.detail.height;

		// 计算图片在屏幕中的实际显示宽度
		// 屏幕总宽度(px) - 左右内边距(40rpx * 2)
		// 需要将 rpx 转换为 px: 1rpx = screenWidth / 750 px
		const imagePaddingInPx = 80 * (screenWidth / 750);
		const imageDisplayWidth = screenWidth - imagePaddingInPx;

		// 根据宽高比，计算图片应有的显示高度
		const imageDisplayHeight = (imageDisplayWidth / originalWidth) * originalHeight;

		// 将计算出的高度存入数组中对应的位置
		imageHeights.value[index] = imageDisplayHeight;
	};
</script>

<style lang="scss" scoped>
	/* --- 基础与布局 --- */
	.page-container {
		background-color: #f4f7f9;
		min-height: 100vh;
	}

	.content-wrapper {
		padding: 40rpx;
	}

	.header {
		text-align: center;
		margin-bottom: 40rpx;

		.title {
			display: block;
			font-size: 52rpx;
			font-weight: 800;
			color: #2c3e50;
			margin-bottom: 10rpx;
		}

		.subtitle {
			display: block;
			font-size: 28rpx;
			color: #7f8c8d;
		}
	}

	/* --- 吸顶导航 Tab --- */
	.main-nav {
		position: sticky;
		top: 0;
		/* 如果有原生导航栏，H5端可能需要 var(--window-top) */
		background-color: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		z-index: 100;
		padding: 15rpx 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: flex;
		justify-content: space-around;
		/* 改为 space-around 使其均匀分布 */
		align-items: center;
	}

	.nav-link {
		color: #555;
		font-weight: 500;
		font-size: 28rpx;
		padding: 15rpx 10rpx;
		position: relative;
		transition: color 0.3s ease, font-weight 0.3s ease;
		text-align: center;
	}

	/* 激活状态的 Tab 样式 */
	.nav-link.active {
		color: #FF6B00;
		font-weight: 700;
	}

	/* 激活状态的下划线 */
	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: 5rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 50%;
		height: 6rpx;
		background-color: #FF6B00;
		border-radius: 3rpx;
		transition: width 0.3s ease;
	}

	/* --- Swiper 容器和内容 --- */
	.membership-swiper {
		margin-top: 20rpx;
		/* 移除固定的 height 属性，因为它现在由 style 动态控制 */
		/* height: 1200rpx; */

		/* 添加一个过渡效果，让高度变化更平滑 */
		transition: height 0.3s ease-in-out;
	}

	.swiper-item {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		/* 图片从顶部开始显示 */
	}

	.benefit-image {
		width: 100%;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
		/* 防止图片下方因行内元素特性出现微小间距 */
		vertical-align: top;
	}
</style>