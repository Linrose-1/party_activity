<template>
	<view class="container">
		<!-- 只有在用户信息加载后才显示内容 -->
		<template v-if="userInfo">
			<!-- 社交等级晋升系统 -->
			<view class="level-system section-card">
				<view class="section-title">
					<uni-icons type="medal" size="24" color="#FF6B00"></uni-icons> 社交等级晋升系统
				</view>

				<view class="current-level">
					<view class="level-badge">
						<view class="level-name">{{ userInfo.level.name }}</view>
						<view class="level-points">{{ userInfo.level.icon }}</view>
					</view>

					<view class="level-info">
						<h3>当前等级: <span class="highlight-orange">{{ userInfo.level.name }}</span></h3>
						<view class="info-text">您当前拥有<span class="highlight-red">{{ userInfo.currExperience }}</span>贡分
						</view>
						<view class="info-text" v-if="pointsToNextLevel > 0">距离下一等级还需 <span
								class="highlight-orange">{{ pointsToNextLevel }}</span> 贡分
						</view>
						<view class="info-text" v-else>
							<uni-icons type="cloud-upload" size="18" color="#28a745"></uni-icons>
							恭喜您，已达到最高社交等级！
						</view>
					</view>
				</view>

				<!-- 静态等级阶梯 -->
				<view class="level-steps">
					<view class="level-step">
						<view class="step-icon" style="background: #E0E0E0;">☆</view>
						<view class="step-name">联合流猩人</view>
						<view class="step-points">≤5000</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #A5D6A7;">★</view>
						<view class="step-name">联合月猩人</view>
						<view class="step-points">≤50000</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #4FC3F7;">✯</view>
						<view class="step-name">联合伙猩人</view>
						<view class="step-points">≤150000</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #BA68C8;">✪</view>
						<view class="step-name">联合创猩人</view>
						<view class="step-points">≤500000</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #FFD54F;">✦</view>
						<view class="step-name">联合创始猿</view>
						<view class="step-points">≤2000000</view>
					</view>
				</view>

				<view class="level-actions">
					<button class="action-button level-up-btn" @click="navigateToGetPoints">
						<!-- <uni-icons type="arrow-up" size="20" color="#fff"></uni-icons> -->
						提升社交等级
					</button>
				</view>
			</view>

			<!-- 会员等级晋升系统 -->
			<view class="membership-level-system section-card" v-if="userInfo && membershipLevels.length > 0">
				<view class="section-title">
					<uni-icons type="vip" size="24" color="#FFD700"></uni-icons> 会员等级晋升系统
				</view>

				<view class="membership-status">
					<!-- 1. 当前等级 -->
					<view class="status-text">
						当前等级: <span class="status-highlight">{{ currentMembershipLevel.name }}</span>
					</view>

					<!-- 2. 下一级会员-->
					<view class="status-text" v-if="userInfo.topUpLevel.nextLevelName">
						下一级会员: <span class="next-level-name">{{ userInfo.topUpLevel.nextLevelName }}</span>
					</view>
					<!-- 如果没有下一级（已经是最高级），显示提示 -->
					<view class="status-text status-max-level" v-else>
						<uni-icons type="cloud-upload" size="18" color="#28a745"></uni-icons>
						恭喜您，已达到最高会员等级！
					</view>

					<!-- 3. 到期时间-->
					<view class="status-text">
						到期时间: <span class="status-highlight">{{ formatDate(userInfo.topUpLevel.expirationTime) }}</span>
					</view>
				</view>

				<view class="membership-levels">
					<view v-for="level in membershipLevels" :key="level.level" class="membership-level-item"
						:class="[getMemberCardClass(level.name), { 'current-member-highlight': userInfo.topUpLevel.name === level.name }]"
						@click="navigateToMemberDetails(level)">

						<view class="level-icon">{{ getLevelIcon(level.name) }}</view>
						<view class="level-name">{{ level.name }}</view>
						<view class="level-price">充值 {{ level.price }} 元</view>
					</view>
				</view>

				<view class="membership-actions">
					<button class="action-button details-btn" @click="navigateToMemberDetails()">
						<uni-icons type="list" size="20" color="#fff"></uni-icons> 会员详情
					</button>
					<button class="action-button recharge-btn" @click="navigateToMembershipRecharge">
						<uni-icons type="wallet" size="20" color="#fff"></uni-icons> 立即充值
					</button>
				</view>
			</view>

		</template>

		<!-- 页面加载中占位 -->
		<view v-else class="loading-placeholder">
			<uni-load-more status="loading" contentText="正在加载您的会员信息..."></uni-load-more>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	// ‼️ 请确保此路径相对于您新文件的位置是正确的
	import request from '../../utils/request.js';

	// ======================= 数据状态 =======================
	const userInfo = ref(null);
	const membershipLevels = ref([]);

	// ======================= 生命周期 =======================
	onMounted(() => {
		fetchUserInfo();
		fetchMemberLevels();
	});

	// ======================= 数据获取 =======================
	const fetchUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (error) {
			uni.showToast({
				title: `加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}
		userInfo.value = data;
	};

	// 获取会员等级列表的方法
	const fetchMemberLevels = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/top-up-level/list');
		if (!error && data) {
			// 【【【修复 ②】】】: 确保数据赋值给正确的变量
			// 同时增加一个辅助计算的“至尊”等级
			const fetchedLevels = data.sort((a, b) => a.level - b.level);
			membershipLevels.value = [
				...fetchedLevels,
				// {
				// 	name: '至尊',
				// 	level: Infinity,
				// 	experience: Infinity
				// }
			];
		}
	};


	// ======================= 社交等级：计算属性 =======================
	const pointsToNextLevel = computed(() => {
		if (!userInfo.value) return 0;
		const currentPoints = userInfo.value.currExperience;
		const levels = [5000, 50000, 150000, 500000, 2000000]; // 等级门槛
		for (const threshold of levels) {
			if (currentPoints < threshold) {
				return threshold - currentPoints;
			}
		}
		return 0; // 已达到最高等级
	});

	// ======================= 会员等级：数据和计算属性 =======================

	const currentMembershipLevel = computed(() => {
		// 1. 基础数据未加载时的保护
		if (!userInfo.value || membershipLevels.value.length === 0) {
			return {
				name: '加载中...'
			};
		}

		// 2. 获取后端返回的等级对象
		const backendLevel = userInfo.value.topUpLevel;

		// 3. 【核心判定】：如果 id 为 null 或名称明确为“游客”，直接判定为游客
		if (!backendLevel || backendLevel.id === null || backendLevel.name === '游客') {
			return {
				name: '游客',
				level: 0,
				color: '#999',
				icon: '👤'
			};
		}

		// 4. 【正式会员处理】：通过 ID 在本地等级配置表中查找对应的 UI 样式（背景色、图标等）
		// 注意：后端返回的 id 通常是数字，确保匹配逻辑稳健
		const matchedLevel = membershipLevels.value.find(l => Number(l.id) === Number(backendLevel.id));

		// 5. 返回匹配到的带样式的对象，若没匹配到则直接返回后端原始对象
		return matchedLevel || backendLevel;
	});

	// const currentMembershipLevel = computed(() => {
	// 	// 确保依赖的数据都已加载
	// 	if (!userInfo.value || typeof userInfo.value.topUpExperience === 'undefined' || membershipLevels.value
	// 		.length === 0) {
	// 		return {
	// 			name: '加载中...'
	// 		};
	// 	}
	// 	if (userInfo.value.topUpLevel?.id === null || userInfo.value.topUpLevel?.id === undefined) {
	// 		return {
	// 			name: '游客'
	// 		};
	// 	}
	// 	const amount = userInfo.value.topUpExperience;
	// 	// 从高到低遍历，找到第一个满足条件的等级
	// 	for (let i = membershipLevels.value.length - 1; i >= 0; i--) {
	// 		if (amount >= membershipLevels.value[i].experience) {
	// 			return membershipLevels.value[i];
	// 		}
	// 	}
	// 	return membershipLevels.value[0] || {
	// 		name: '游客'
	// 	};
	// });

	const nextMembershipLevel = computed(() => {
		if (membershipLevels.value.length === 0) return null;
		const currentIndex = membershipLevels.value.findIndex(level => level.name === currentMembershipLevel.value
			.name);
		// 确保不是最后一个有效等级（-2 是因为我们加了一个无限大的辅助等级）
		if (currentIndex !== -1 && currentIndex < membershipLevels.value.length - 2) {
			return membershipLevels.value[currentIndex + 1];
		}
		return null; // 已是最高等级
	});

	// const amountToNextLevel = computed(() => {
	// 	if (nextMembershipLevel.value && userInfo.value) {
	// 		const needed = nextMembershipLevel.value.experience - userInfo.value.topUpExperience;
	// 		return Math.max(0, needed);
	// 	}
	// 	return 0;
	// });

	// ======================= 页面跳转方法 =======================
	const navigateToMemberDetails = (level) => {
		const url = '/pages/my-memberDetails/my-memberDetails';
		// 如果点击的是具体的等级卡片，则附带 level 参数
		if (level && level.level) {
			uni.navigateTo({
				url: `${url}?level=${level.level}`
			});
		} else {
			// 如果点击的是底部的“会员详情”按钮，则不带参数跳转
			uni.navigateTo({
				url
			});
		}
	};

	const navigateToMembershipRecharge = () => {
		uni.navigateTo({
			url: '/pages/recharge/recharge?type=membership'
		});
	};

	const navigateToGetPoints = () => {
		uni.navigateTo({
			url: '/packages/getPoints/getPoints'
		});
	};

	// --- 辅助方法，用于动态添加样式和图标 ---
	const getMemberCardClass = (name) => {
		if (name.includes('青铜')) return 'bronze-member';
		if (name.includes('白银')) return 'silver-member';
		if (name.includes('黄金')) return 'gold-member';
		if (name.includes('黑钻')) return 'diamond-member';
		return 'visitor';
	};

	const getLevelIcon = (name) => {
		if (name.includes('青铜')) return '🪙';
		if (name.includes('白银')) return '🔶';
		if (name.includes('黄金')) return '🌟';
		if (name.includes('黑钻')) return '💎';
		return '👤';
	};

	// --- 时间格式化 ---
	const formatDate = (timestamp) => {
		if (!timestamp || timestamp === 0) return '未开通';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		return `${Y}-${M}-${D}`;
	};
</script>

<style scoped>
	/* 页面基础样式 */
	.container {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding: 30rpx;
	}

	.loading-placeholder {
		padding-top: 200rpx;
	}

	/* 通用卡片样式 */
	.section-card {
		background: #ffffff;
		border-radius: 40rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 40rpx;
		color: #333;
		display: flex;
		align-items: center;
	}

	.section-title uni-icons {
		margin-right: 16rpx;
	}

	/* 高亮文本样式 */
	.highlight-orange {
		color: #ff7707;
		font-weight: 600;
		margin: 0 8rpx;
	}

	.highlight-red {
		color: #ff0000;
		font-weight: 600;
		margin: 0 8rpx;
	}

	/* --- 社交等级系统样式 --- */
	.level-system {
		/* background: linear-gradient(to right, #f9f9f9, #f0f0f0); */
		/* ... (原有的伪元素装饰可以保留或移除) ... */
	}

	.current-level {
		display: flex;
		align-items: center;
		margin-bottom: 50rpx;
	}

	.level-badge {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: white;
		margin-right: 30rpx;
		flex-shrink: 0;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
		background: linear-gradient(to bottom, #CD7F32, #8C6B46);
	}

	.level-badge .level-name {
		font-size: 26rpx;
		margin-bottom: 6rpx;
	}

	.level-badge .level-points {
		font-size: 24rpx;
	}

	.level-info h3 {
		font-size: 32rpx;
		margin-bottom: 12rpx;
	}

	.level-info .info-text {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	.level-actions {
		margin-top: 50rpx;
		/* 与下方的等级阶梯拉开距离 */
	}

	.level-up-btn {
		/* 复用 .action-button 的基础样式，并添加渐变背景 */
		background: linear-gradient(to right, #FF8C00, #FF6E00);
	}

	.level-steps {
		display: flex;
		justify-content: space-around;
		margin-top: 40rpx;
	}

	.level-step {
		text-align: center;
		flex: 1;
	}

	.step-icon {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16rpx;
		font-size: 32rpx;
		color: white;
	}

	.step-name {
		font-size: 24rpx;
		font-weight: 500;
		margin-bottom: 8rpx;
	}

	.step-points {
		font-size: 22rpx;
		color: #999;
	}

	/* --- 会员等级系统样式 --- */
	.membership-status {
		background: linear-gradient(135deg, #fffaf2, #fff5e6);
		border-radius: 30rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		border: 2rpx solid #ffe8cc;
	}

	.status-text {
		font-size: 28rpx;
		color: #664d03;
		margin-bottom: 16rpx;
		line-height: 1.5;
	}

	.status-text:last-child {
		margin-bottom: 0;
	}

	.status-highlight {
		font-weight: 700;
		color: #e67e22;
	}

	.next-level-progress {
		font-size: 28rpx;
	}

	.next-level-name {
		font-weight: bold;
		color: #d35400;
	}

	.amount-needed {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff0000;
		margin: 0 8rpx;
	}

	.status-max-level {
		font-size: 28rpx;
		font-weight: bold;
		color: #28a745;
		display: flex;
		align-items: center;
	}

	.status-max-level uni-icons {
		margin-right: 12rpx;
	}

	.membership-description {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 40rpx;
		text-align: center;
	}

	.membership-levels {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}

	.membership-level-item {
		border-radius: 20rpx;
		padding: 20rpx 10rpx;
		text-align: center;
		transition: transform 0.2s, box-shadow 0.2s;
		border: 2rpx solid #eee;
	}

	.current-member-highlight {
		transform: translateY(-8rpx);
		box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.1) !important;
		border: 4rpx solid #FF6B00 !important;
	}

	.level-icon {
		font-size: 40rpx;
		margin-bottom: 12rpx;
	}

	.level-name {
		font-size: 26rpx;
		font-weight: 600;
		margin-bottom: 8rpx;
	}

	.level-price {
		font-size: 24rpx;
	}

	/* 不同等级的颜色 */
	.visitor {
		background-color: #f8f9fa;
	}

	.visitor .level-name {
		color: #6c757d;
	}

	.bronze-member {
		background-color: #fff4e6;
	}

	.bronze-member .level-name {
		color: #CD7F32;
	}

	.silver-member {
		background-color: #f1f3f5;
	}

	.silver-member .level-name {
		color: #868e96;
	}

	.gold-member {
		background-color: #fff9db;
	}

	.gold-member .level-name {
		color: #e6a23c;
	}

	.diamond-member {
		background-color: #343a40;
		color: white;
	}

	.diamond-member .level-name {
		color: #f8f9fa;
	}

	.membership-actions {
		display: flex;
		gap: 30rpx;
		margin-top: 40rpx;
	}

	.action-button {
		flex: 1;
		height: 88rpx;
		border-radius: 44rpx;
		border: none;
		color: white;
		font-size: 30rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.action-button::after {
		border: none;
	}

	.details-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
	}

	.recharge-btn {
		background: linear-gradient(to right, #007bff, #0056b3);
	}

	.action-button uni-icons {
		margin-right: 12rpx;
	}
</style>