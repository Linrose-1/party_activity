<template>
	<view class="page-container">
		<!-- 1. 顶部吸顶导航 -->
		<!-- uni-app 中实现吸顶效果的最佳方式是使用 CSS position: sticky -->
		<view class="main-nav">
			<text class="nav-link" @click="scrollTo('xuantie')">玄铁</text>
			<text class="nav-link" @click="scrollTo('qingtong')">青铜</text>
			<text class="nav-link" @click="scrollTo('baiyin')">白银</text>
			<text class="nav-link" @click="scrollTo('huangjin')">黄金</text>
			<text class="nav-link" @click="scrollTo('heizhuan')">黑钻</text>
		</view>

		<!-- 2. 页面主内容区域 -->
		<view class="content-wrapper">
			<view class="header">
				<text class="title">会员等级与权益</text>
				<text class="subtitle">探索不同等级的专属权益，开启您的价值之旅</text>
			</view>

			<!-- 3. 会员等级卡片列表 -->
			<view class="membership-tiers">
				<!-- 玄铁 -->
				<view class="card card-iron" id="xuantie">
					<view class="card-header">
						<!-- SVG 图标可直接使用 image 标签加载 -->
						<image class="card-icon" src="/static/membership-icons/iron.svg" mode="aspectFit" />
						<text class="card-title">玄铁</text>
						<view class="card-price">免费 <text class="term">/ 1年</text></view>
					</view>
					<view class="card-body">
						<ul class="initial-values">
							<li>智米：<text class="value">20 个</text> <text class="calc">(=20元)</text></li>
							<li>贡分：<text class="value">0 个</text></li>
						</ul>
						<text class="benefits-title">基本权益</text>
						<ul class="benefits-list">
							<li>可浏览小程序的基本功能</li>
						</ul>
					</view>
					<view class="card-footer">
						<button class="btn" @click="showContactModal">免费加入</button>
					</view>
				</view>

				<!-- 青铜 -->
				<view class="card card-bronze" id="qingtong">
					<view class="card-header">
						<image class="card-icon" src="/static/membership-icons/bronze.svg" mode="aspectFit" />
						<text class="card-title">青铜</text>
						<view class="card-price">100 元 <text class="term">/ 2个月</text></view>
					</view>
					<view class="card-body">
						<ul class="initial-values">
							<li>初始智米：<text class="value">100 个</text> <text class="calc">(100 × 1.0)</text></li>
							<li>初始贡分：<text class="value">800 个</text> <text class="calc">(100 × 8)</text></li>
						</ul>
						<text class="benefits-title">基本权益</text>
						<ul class="benefits-list">
							<li>参与平台收益二次分配</li>
							<li>消费平台服务与产品</li>
							<li>发起聚会 (每月限2次)</li>
							<li>商友圈分享 (每周限1条)</li>
						</ul>
					</view>
					<view class="card-footer">
						<button class="btn" @click="showContactModal">选择青铜</button>
					</view>
				</view>

				<!-- 白银 -->
				<view class="card card-silver" id="baiyin">
					<view class="card-header">
						<image class="card-icon" src="/static/membership-icons/silver.svg" mode="aspectFit" />
						<text class="card-title">白银</text>
						<view class="card-price">365 元 <text class="term">/ 1年</text></view>
					</view>
					<view class="card-body">
						<ul class="initial-values">
							<li>初始智米：<text class="value">402 个</text> <text class="calc">(365 × 1.1)</text></li>
							<li>初始贡分：<text class="value">2,190 个</text> <text class="calc">(365 × 6)</text></li>
						</ul>
						<text class="benefits-title">基本权益</text>
						<ul class="benefits-list">
							<li>参与平台收益二次分配</li>
							<li>消费平台服务与产品</li>
							<li>发起聚会 (每月限4次)</li>
							<li>商友圈分享 (每周限2条)</li>
						</ul>
					</view>
					<view class="card-footer">
						<button class="btn" @click="showContactModal">选择白银</button>
					</view>
				</view>

				<!-- 黄金 -->
				<view class="card card-gold" id="huangjin">
					<view class="card-header">
						<image class="card-icon" src="/static/membership-icons/gold.svg" mode="aspectFit" />
						<text class="card-title">黄金</text>
						<view class="card-price">3,650 元 <text class="term">/ 1年</text></view>
					</view>
					<view class="card-body">
						<ul class="initial-values">
							<li>初始智米：<text class="value">4,380 个</text> <text class="calc">(3650 × 1.2)</text></li>
							<li>初始贡分：<text class="value">18,250 个</text> <text class="calc">(3650 × 5)</text></li>
						</ul>
						<text class="benefits-title">基本权益</text>
						<ul class="benefits-list">
							<li>参与平台收益二次分配</li>
							<li>消费平台服务与产品</li>
							<li>发起聚会 (每日限2次)</li>
							<li>商友圈分享 (每日限5条)</li>
							<li>申请特定合法众筹 (每年2次)</li>
						</ul>
					</view>
					<view class="card-footer">
						<button class="btn" @click="showContactModal">选择黄金</button>
					</view>
				</view>

				<!-- 黑钻 -->
				<view class="card card-diamond" id="heizhuan">
					<view class="card-header">
						<image class="card-icon" src="/static/membership-icons/diamond.svg" mode="aspectFit" />
						<text class="card-title">黑钻</text>
						<view class="card-price">36,500 元 <text class="term">/ 1年</text></view>
					</view>
					<view class="card-body">
						<ul class="initial-values">
							<li>初始智米：<text class="value">47,450 个</text> <text class="calc">(36500 × 1.3)</text></li>
							<li>初始贡分：<text class="value">146,000 个</text> <text class="calc">(36500 × 4)</text></li>
						</ul>
						<text class="benefits-title">基本权益</text>
						<ul class="benefits-list">
							<li>参与平台收益二次分配</li>
							<li>消费平台服务与产品</li>
							<li>发起聚会 (每日限10次)</li>
							<li>商友圈分享 (每日限10条)</li>
							<li>申请合法众筹 (每年4次)</li>
						</ul>
						<view class="special-benefit">
							<text class="special-title">平台跟投机制</text>
							<text class="special-desc">由黑钻会员发起并审核通过的项目，平台在一年内跟投36,500元。若一年内未跟投：</text>
							<ul class="sub-list">
								<li><text class="strong">退款选项：</text>36500 - 已消耗智米 = 现金退款 (退后取消黑钻资格)</li>
								<li><text class="strong">延期选项：</text>不退款，保留黑钻会员资格1年 (享受权益与跟投资格)</li>
							</ul>
						</view>
					</view>
					<view class="card-footer">
						<button class="btn" @click="showContactModal">选择黑钻</button>
					</view>
				</view>
			</view> <!-- .membership-tiers -->
		</view> <!-- .content-wrapper -->
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	// --- 交互逻辑 ---

	/**
	 * @description 滚动到指定ID的元素
	 * @param {string} elementId - 要滚动到的元素的ID
	 */
	const scrollTo = (elementId) => {
		uni.pageScrollTo({
			selector: `#${elementId}`,
			duration: 300 // 滚动动画时长
		});
	};

	/**
	 * @description 显示客服二维码和提示信息的模态框
	 */
	const showContactModal = () => {
		uni.showModal({
			title: '联系我们',
			// content 使用 \n 进行换行
			content: '本阶段属于会员需求测试期，请扫码添加猩聚社创始猿微信交流！',
			showCancel: false, // 只显示一个“确定”按钮
			confirmText: '知道了',
			success: (res) => {
				if (res.confirm) {
					// 用户点击“知道了”后，预览二维码图片
					uni.previewImage({
						urls: ['https://img.gofor.club/index1.png'] // 将二维码URL放入数组
					});
				}
			}
		});
	};
</script>

<style lang="scss" scoped>
	/* --- CSS变量定义 --- */
	:root {
		--c-iron: #8d99ae;
		--g-iron: linear-gradient(135deg, #e0e0e0, #b0bec5);
		--c-bronze: #d08c60;
		--g-bronze: linear-gradient(135deg, #f8c291, #e59866);
		--c-silver: #a7b4c2;
		--g-silver: linear-gradient(135deg, #e2e8f0, #d6dde5);
		--c-gold: #ffc107;
		--g-gold: linear-gradient(135deg, #fff3cd, #ffe082);
		--c-diamond: #9b59b6;
		--g-diamond: linear-gradient(135deg, #34495e, #2c3e50);
		--c-diamond-accent: #a78bfa;
	}

	/* --- 基础与布局 --- */
	.page-container {
		background-color: #f4f7f9;
		color: #34495e;
	}

	.content-wrapper {
		padding: 40rpx;
	}

	.header {
		text-align: center;
		margin-bottom: 80rpx;

		.title {
			display: block;
			font-size: 56rpx;
			font-weight: 800;
			color: #2c3e50;
			margin-bottom: 10rpx;
			letter-spacing: -2rpx;
		}

		.subtitle {
			display: block;
			font-size: 28rpx;
			color: #7f8c8d;
		}
	}

	/* --- 吸顶导航 --- */
	.main-nav {
		position: sticky;
		top: 0;
		/* H5和小程序中，如果顶部有原生导航，可能需要 var(--window-top) */
		background-color: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(10px);
		z-index: 100;
		padding: 15rpx 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: flex;
		justify-content: center;
		gap: 30rpx;
	}

	.nav-link {
		text-decoration: none;
		color: #34495e;
		font-weight: 600;
		font-size: 26rpx;
		padding: 10rpx 0;
		position: relative;
		transition: color 0.3s ease;
	}

	/* --- 会员卡片 --- */
	.membership-tiers {
		display: flex;
		flex-direction: column;
		gap: 50rpx;
		/* 稍微增大卡片间距，给阴影留出更多空间 */
	}

	.card {
		background-color: #ffffff;
		border-radius: 32rpx;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1rpx solid #e5e7eb;
		transition: transform 0.3s ease, box-shadow 0.3s ease;

		/* ==================== 【【【核心修改点：替换阴影】】】 ==================== */
		/* 这是一个由两层组成的柔和阴影，比原来更细腻 */
		box-shadow:
			0 4rpx 10rpx rgba(0, 0, 0, 0.04),
			/* 靠近卡片的轮廓阴影 */
			0 12rpx 30rpx rgba(0, 0, 0, 0.08);
		/* 更弥散的基础阴影 */
		/* ==================================================================== */
	}

	/* 鼠标悬浮或触摸时的效果 */
	.card:active {
		transform: translateY(-10rpx) scale(1.02);
		/* 增加一点点放大效果 */

		/* ==================== 【【【核心修改点：替换激活阴影】】】 ==================== */
		/* 激活时的阴影更深、更广，悬浮感更强 */
		box-shadow:
			0 8rpx 15rpx rgba(0, 0, 0, 0.06),
			0 25rpx 50rpx rgba(0, 0, 0, 0.12);
		/* ==================================================================== */
	}

	/* ... (card-header, card-body 等其他样式保持不变) ... */

	/* --- 【可选但推荐】为不同等级的卡片添加彩色辉光阴影 --- */
	/* 这会让每个卡片在激活时散发出与其主题色相匹配的光晕，效果非常棒 */
	.card-iron:active {
		box-shadow:
			0 8rpx 15rpx rgba(0, 0, 0, 0.06),
			0 25rpx 50rpx rgba(144, 164, 174, 0.2);
		/* 铁灰色辉光 */
	}

	.card-bronze:active {
		box-shadow:
			0 8rpx 15rpx rgba(0, 0, 0, 0.06),
			0 25rpx 50rpx rgba(210, 140, 96, 0.3);
		/* 青铜色辉光 */
	}

	.card-silver:active {
		box-shadow:
			0 8rpx 15rpx rgba(0, 0, 0, 0.06),
			0 25rpx 50rpx rgba(167, 180, 194, 0.3);
		/* 银色辉光 */
	}

	.card-gold:active {
		box-shadow:
			0 8rpx 15rpx rgba(0, 0, 0, 0.06),
			0 25rpx 50rpx rgba(255, 193, 7, 0.25);
		/* 金色辉光 */
	}

	.card-diamond:active {
		box-shadow:
			0 8rpx 15rpx rgba(0, 0, 0, 0.06),
			0 25rpx 50rpx rgba(155, 89, 182, 0.3);
		/* 钻石紫色辉光 */
	}

	.card-header {
		padding: 40rpx 30rpx;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.card-icon {
		margin: 0 auto 30rpx;
		width: 128rpx;
		height: 128rpx;
	}

	.card-title {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
	}

	.card-price {
		font-size: 32rpx;
		font-weight: 500;
		margin-top: 10rpx;
	}

	.card-price .term {
		font-size: 26rpx;
		font-weight: 400;
		opacity: 0.8;
	}

	.card-body {
		padding: 30rpx;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.benefits-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		border-bottom: 1rpx solid #eee;
		padding-bottom: 15rpx;
		margin-top: 20rpx;
		margin-bottom: 20rpx;
		color: #2c3e50;
	}

	.benefits-list {
		padding: 0;
		margin: 0;
	}

	.benefits-list li {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;
		font-size: 28rpx;
		line-height: 1.6;
	}

	.benefits-list li::before {
		content: "✓";
		color: #2ecc71;
		margin-right: 15rpx;
		font-weight: bold;
		flex-shrink: 0;
		margin-top: 6rpx;
	}

	.initial-values {
		list-style: none;
		padding: 20rpx;
		margin: 0 0 20rpx 0;
		background-color: #f8f9fa;
		border-radius: 16rpx;
		border: 1rpx solid #e9ecef;
	}

	.initial-values li {
		font-size: 28rpx;
		margin-bottom: 10rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.initial-values li:last-child {
		margin-bottom: 0;
	}

	.initial-values .value {
		font-weight: 600;
	}

	.initial-values .calc {
		font-size: 24rpx;
		color: #7f8c8d;
	}

	.card-footer {
		padding: 30rpx;
		margin-top: auto;
	}

	.btn {
		display: block;
		width: 100%;
		padding: 24rpx 20rpx;
		border-radius: 16rpx;
		font-size: 32rpx;
		font-weight: 700;
		text-align: center;
		text-decoration: none;
	}

	.btn::after {
		border: none;
	}

	/* --- 各等级颜色 --- */
	.card-iron .card-header {
		background: var(--g-iron);
	}

	.card-iron .card-title,
	.card-iron .card-price {
		color: #37474f;
	}

	.card-iron .btn {
		background-color: var(--c-iron);
		color: #fff;
	}

	.card-bronze .card-header {
		background: var(--g-bronze);
	}

	.card-bronze .card-title,
	.card-bronze .card-price {
		color: #8c5a3c;
	}

	.card-bronze .btn {
		background-color: var(--c-bronze);
		color: #fff;
	}

	.card-silver .card-header {
		background: var(--g-silver);
	}

	.card-silver .card-title,
	.card-silver .card-price {
		color: #546e7a;
	}

	.card-silver .btn {
		background-color: var(--c-silver);
		color: #fff;
	}

	.card-gold .card-header {
		background: var(--g-gold);
	}

	.card-gold .card-title,
	.card-gold .card-price {
		color: #b58900;
	}

	.card-gold .btn {
		background-color: var(--c-gold);
		color: #111;
	}

	.card-diamond {
		border-color: var(--c-diamond-accent);
		border-width: 4rpx;
	}

	.card-diamond .card-header {
		background: var(--g-diamond);
	}

	.card-diamond .card-title,
	.card-diamond .card-price {
		color: #fff;
	}

	.card-diamond .btn {
		background: var(--c-diamond-accent);
		color: #fff;
	}

	.card-diamond .benefits-list li::before {
		color: var(--c-diamond-accent);
	}

	/* --- 黑钻特殊权益 --- */
	.special-benefit {
		background-color: #f8f7fc;
		border-left: 8rpx solid var(--c-diamond-accent);
		padding: 20rpx;
		margin-top: 30rpx;
		border-radius: 0 16rpx 16rpx 0;

		.special-title {
			display: block;
			margin: 0 0 10rpx 0;
			color: var(--c-diamond);
			font-size: 28rpx;
			font-weight: bold;
		}

		.special-desc {
			display: block;
			font-size: 26rpx;
		}

		.sub-list {
			font-size: 26rpx;
			margin: 10rpx 0 0 0;
			padding: 0;
		}

		.sub-list li {
			margin-bottom: 8rpx;
		}

		.sub-list .strong {
			font-weight: 600;
		}
	}

	/* 移除HTML特有的ul/li默认样式 */
	ul {
		list-style: none;
	}
</style>