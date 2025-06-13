<template>
	<view class="container">
		<!-- 账户详情 -->
		<view class="account-detail-section">
			<view class="section-header">
				<h2 class="section-title-main">账户信息详情</h2>
			</view>

			<!-- 邀请人模块 - 新增部分 -->
			<view class="inviter-section">
				<view class="section-title">
					<uni-icons type="personadd" size="24" color="#FF6B00"></uni-icons>我的邀请人
				</view>

				<view class="inviter-card" v-if="inviter">
					<view class="inviter-avatar">
						<view class="avatar-placeholder">{{ inviter.name.charAt(0) }}</view>
					</view>
					<view class="inviter-info">
						<view class="inviter-name">{{ inviter.name }}</view>
						<view class="inviter-level">等级: {{ inviter.level }}</view>
						<view class="inviter-date">邀请时间: {{ inviter.inviteDate }}</view>
					</view>
				</view>

				<view class="no-inviter" v-else>
					<uni-icons type="info" size="24" color="#999"></uni-icons>
					<p>您尚未被邀请或未填写邀请人</p>
				</view>
			</view>

			<!-- 等级晋升系统 -->
			<view class="level-system">
				<view class="level-title">
					<uni-icons type="medal" size="24" color="#FF6B00"></uni-icons> 等级晋升系统
				</view>

				<view class="current-level">
					<!-- Add ref for direct DOM access in onMounted -->
					<view class="level-badge bronze" ref="bronzeBadgeRef">
						<view class="level-name">青铜</view>
						<view class="level-points">100-499分</view>
					</view>

					<view class="level-info">
						<h3>当前等级: 青铜</h3>
						<view style="font-size: 26rpx;">您当前拥有<span>{{ points }}</span>贡分</view>
						<view style="font-size: 26rpx;">距离下一等级还需 <span>{{ pointsToNextLevel }}</span>分</view>

						<view class="progress-container">
							<view class="progress-labels">
								<span>0</span>
								<span>{{ maxPoints }}</span>
							</view>
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: progressWidth }">
									<view class="progress-marker" style="left: 10%;">
										<view class="progress-marker-label">游客</view>
									</view>
									<view class="progress-marker" style="left: 50%;">
										<view class="progress-marker-label">白银</view>
									</view>
									<view class="progress-marker" style="left: 100%;">
										<view class="progress-marker-label">黄金</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="level-steps">
					<view class="level-step">
						<view class="step-icon" style="background: #cd7f32;">
							<uni-icons type="person" size="20" color="#fff"></uni-icons>
						</view>
						<view class="step-name">游客</view>
						<view class="step-points">0-99分</view>
					</view>

					<view class="level-step">
						<view class="step-icon active" style="background: #cd7f32;">
							<uni-icons type="shield" size="20" color="#fff"></uni-icons>
						</view>
						<view class="step-name">青铜</view>
						<view class="step-points">100-499分</view>
					</view>

					<view class="level-step">
						<view class="step-icon" style="background: #c0c0c0;">
							<uni-icons type="medal" size="20" color="#fff"></uni-icons>
						</view>
						<view class="step-name">白银</view>
						<view class="step-points">500-999分</view>
					</view>

					<view class="level-step">
						<view class="step-icon" style="background: #ffd700;">
							<uni-icons type="crown" size="20" color="#fff"></uni-icons>
						</view>
						<view class="step-name">黄金</view>
						<view class="step-points">1000+分</view>
					</view>
				</view>
			</view>

			<!-- 新增：智米模块 -->
			<view class="smart-rice-section">
				<view class="smart-rice-header">
					<view class="smart-rice-title">
						<uni-icons type="wallet" size="24" color="#FF6B00"></uni-icons> 我的智米
					</view>
					<view class="smart-rice-value">{{ smartRice }} 智米</view>
				</view>

				<view class="smart-rice-info">
					<p>智米可用于兑换平台内服务或商品。</p>
					<p class="exchange-rate">兑换比例：<span style="color: #FF6B00; font-weight: bold;">{{ pointsPerSmartRice }} 贡分 = 1 智米</span></p>
				</view>

				<view class="smart-rice-actions">
					<button class="action-button exchange-button" @click="handleExchangeSmartRice">
						<uni-icons type="forward" size="20" color="#fff"></uni-icons> 兑换智米
					</button>
					<button class="action-button recharge-button" @click="handleRechargeSmartRice">
						<uni-icons type="redo" size="20" color="#fff"></uni-icons> 充值智米
					</button>
				</view>
				<p class="smart-rice-note">
					<uni-icons type="info-filled" size="18" color="#FF6B00"></uni-icons> 贡分兑换智米或智米充值请联系平台客服。
				</p>
			</view>


			<!-- 贡分获取区域 -->
			<view class="points-section">
				<view class="points-header">
					<view class="points-title"> <uni-icons type="compose" size="24" color="#FF6B00"></uni-icons> 获取贡分</view>
					<view class="points-value">{{ points }}</view>
				</view>

				<p style="font-size: 28rpx; color: #666; margin-bottom: 40rpx;">
					通过完成以下任务获取贡分，提升您的等级：
				</p>

				<view class="task-grid">
					<view class="task-card" v-for="(task, index) in tasks" :key="index">
						<view class="task-header">
							<view class="task-icon">
								<uni-icons :type="task.icon" size="24" color="#FF6B00"></uni-icons>
							</view>
							<view class="task-name">{{ task.name }}</view>
						</view>
						<view class="task-desc">{{ task.desc }}</view>
						<view class="task-footer">
							<span class="task-points">{{ task.points }}</span>
							<button class="task-button" @click="handleTaskClick(task.name, $event)">
								<uni-icons type="plus" size="20" color="#fff"></uni-icons>
							</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 历史记录 -->
			<view class="history-section">
				<view class="history-title">
					<uni-icons type="bars" size="24" color="#FF6B00"></uni-icons> 贡分历史记录
				</view>

				<view class="history-list">
					<view class="history-item" v-for="(record, index) in historyRecords" :key="index"
						@click="handleHistoryClick($event)">
						<view class="history-icon">
							<uni-icons :type="record.icon" size="20" color="#FF6B00"></uni-icons>
						</view>
						<view class="history-details">
							<view class="history-task">{{ record.task }}</view>
							<view class="history-date">{{ record.date }}</view>
						</view>
						<view class="history-points">{{ record.points }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';

	// 响应式数据
	const points = ref(2166);
	const level = ref(
	'青铜'); // Though not directly used for dynamic class in HTML, good to have it reactive if needed later.

	// 新增智米相关数据
	const smartRice = ref(150); // 假设用户当前拥有150智米
	const pointsPerSmartRice = 10; // 兑换比例：10贡分 = 1智米

	// Hardcoded data for tasks and history (can be fetched from API in real app)
	const tasks = ref([{
			icon: 'calendar',
			name: '参与活动',
			desc: '参加平台组织的线上/线下活动',
			points: '+5分/次'
		},
		{
			icon: 'flag',
			name: '组织活动',
			desc: '成功组织并举办一次活动',
			points: '+30分/次'
		},
		{
			icon: 'sound',
			name: '分享商机',
			desc: '分享有价值的商业机会',
			points: '+10分/次'
		},
		{
			icon: 'personadd',
			name: '邀请好友',
			desc: '成功邀请好友注册并认证',
			points: '+20分/人'
		},
		{
			icon: 'chat',
			name: '每日签到',
			desc: '每日登录并签到',
			points: '+1分/天'
		},
		{
			icon: 'star',
			name: '完善资料',
			desc: '完善个人和企业资料',
			points: '+50分'
		},
	]);

	const historyRecords = ref([{
			icon: 'calendar',
			task: '参与线上营销活动',
			date: '2023-10-15 14:30',
			points: '+5'
		},
		{
			icon: 'sound',
			task: '分享商机：供应链合作',
			date: '2023-10-14 10:15',
			points: '+10'
		},
		{
			icon: 'personadd',
			task: '邀请好友：张先生',
			date: '2023-10-12 16:45',
			points: '+20'
		},
		{
			icon: 'chat',
			task: '每日签到',
			date: '2023-10-12 09:02',
			points: '+1'
		},
		{
			icon: 'calendar',
			task: '参与产品发布会',
			date: '2023-10-10 13:20',
			points: '+5'
		},
		{
			icon: 'star',
			task: '完善企业资料',
			date: '2023-10-08 11:30',
			points: '+50'
		},
	]);

	// Computed properties for progress
	const maxPoints = 1000; // Max points for the progress bar
	const pointsToNextLevel = computed(() => {
		// Assuming next level is 500 for Silver, then 1000 for Gold
		if (points.value < 100) return 100 - points.value; // To Bronze (游客0-99, 青铜100-499)
		if (points.value < 500) return 500 - points.value; // To Silver (白银500-999)
		if (points.value < 1000) return 1000 - points.value; // To Gold (黄金1000+)
		return 0; // Already Gold or higher
	});

	const progressWidth = computed(() => {
		// 这里的进度条可能需要根据实际等级范围调整
		// 假设进度条表示从0到1000的范围
		const cappedPoints = Math.min(Math.max(points.value, 0), maxPoints);
		return (cappedPoints / maxPoints) * 100 + '%';
	});

	// Template ref for the bronze badge for direct DOM manipulation in onMounted
	const bronzeBadgeRef = ref(null);

	// Methods
	const goBack = () => {
		// In a real Uni-app project, you'd use uni.navigateBack()
		// uni.navigateBack();
		alert('返回上一页'); // For browser demo
	};

	const handleTaskClick = (taskName, event) => {
		uni.showToast({
			title: `点击了任务：${taskName}`,
			icon: 'none'
		});
		// Original effect: scale and shadow on click
		const card = event.currentTarget.closest('.task-card');
		if (card) {
			card.style.transform = 'scale(0.98)';
			card.style.boxShadow = '0 8rpx 20rpx rgba(255, 107, 0, 0.2)';

			setTimeout(() => {
				card.style.transform = '';
				card.style.boxShadow = '';
			}, 200);
		}
	};

	const handleHistoryClick = (event) => {
		// Original effect: highlight on click
		const item = event.currentTarget;
		if (item) {
			item.style.backgroundColor = '#fff9f0';
			setTimeout(() => {
				item.style.backgroundColor = '';
			}, 300);
		}
	};

	// 新增智米相关方法
	const handleExchangeSmartRice = () => {
		uni.showModal({
			title: '兑换智米',
			content: `兑换比例为 ${pointsPerSmartRice} 贡分 = 1 智米。请联系平台客服进行兑换操作。`,
			showCancel: false,
			confirmText: '联系客服',
			success: (res) => {
				if (res.confirm) {
					contactCustomerService();
				}
			}
		});
	};

	const handleRechargeSmartRice = () => {
		uni.showModal({
			title: '充值智米',
			content: '如需充值智米，请联系平台客服获取充值方式。',
			showCancel: false,
			confirmText: '联系客服',
			success: (res) => {
				if (res.confirm) {
					contactCustomerService();
				}
			}
		});
	};

	const contactCustomerService = () => {
		uni.showToast({
			title: '正在为您跳转客服联系方式...',
			icon: 'none',
			duration: 2000
		});
		// 实际应用中可以跳转到客服页面或显示客服电话/微信等
		console.log('用户点击了联系客服');
	};

	// Lifecycle hook for DOM interactions
	onMounted(() => {
		// Bronze badge animation
		if (bronzeBadgeRef.value) {
			setInterval(() => {
				bronzeBadgeRef.value.classList.toggle('pulse');
			}, 5000);
		}
	});

	// Mock uni object for browser environment if not in Uni-app
	if (typeof uni === 'undefined') {
		window.uni = {
			showToast: (options) => {
				console.log('Mock uni.showToast:', options.title);
				// alert(options.title); // Or a simple browser toast implementation
			},
			showModal: (options) => {
				console.log('Mock uni.showModal:', options.title, options.content);
				if (confirm(`${options.title}\n${options.content}`)) {
					options.success && options.success({
						confirm: true
					});
				} else {
					options.success && options.success({
						cancel: true
					});
				}
			},
			// Add other uni methods if used, e.g., uni.navigateBack
		};
	}

	// 新增邀请人数据
	const inviter = ref({
		name: '张经理',
		level: '黄金会员',
		inviteDate: '2023-09-15',
		avatar: '' // 如果有真实头像URL可以放在这里
	});

	// 新增方法 (原有的，保留)
	const contactInviter = () => {
		uni.showToast({
			title: `联系邀请人: ${inviter.value.name}`,
			icon: 'none'
		});
	};
</script>

<style scoped>
	/*
  The rpx unit is Uni-app specific. For a pure web project, you might prefer px, rem, or vw units.
  For Uni-app, rpx is standard for responsive sizing.
*/
	/* * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
} */

	body {
		background: linear-gradient(135deg, #f8f9fa, #e9ecef);
		color: #333;
		line-height: 1.6;
		padding: 40rpx 30rpx 200rpx;
		min-height: 100vh;
	}

	.container {
		max-width: 750rpx;
		margin: 0 auto;
	}

	/* 顶部用户信息 */
	.user-header {
		background: linear-gradient(135deg, #FF8C00, #FF6B00);
		color: white;
		padding: 50rpx 40rpx 60rpx;
		position: relative;
		border-radius: 40rpx;
		box-shadow: 0 16rpx 50rpx rgba(255, 107, 0, 0.25);
		margin-bottom: 50rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 50rpx;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		background: linear-gradient(45deg, #ffb347, #ffcc33);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 56rpx;
		font-weight: bold;
		color: white;
		margin-right: 30rpx;
		border: 6rpx solid rgba(255, 255, 255, 0.3);
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
	}

	.user-details {
		flex: 1;
	}

	.user-name {
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		display: flex;
		align-items: center;
	}

	.badge {
		background: linear-gradient(to right, #ffd700, #ffcc00);
		color: #8a6d00;
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		margin-left: 20rpx;
		font-weight: 600;
	}

	.user-title {
		font-size: 28rpx;
		opacity: 0.9;
		margin-bottom: 10rpx;
	}

	.user-company {
		font-size: 28rpx;
		opacity: 0.85;
		display: flex;
		align-items: center;
	}

	.back-btn {
		position: absolute;
		top: 60rpx;
		left: 40rpx;
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 30rpx;
		padding: 10rpx 30rpx;
		font-size: 26rpx;
		color: white;
		display: flex;
		align-items: center;
		cursor: pointer;
		transition: all 0.3s;
		text-decoration: none;
	}

	.back-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* 账户详情区域 */
	.account-detail-section {
		background: white;
		margin: 0 0 50rpx;
		border-radius: 40rpx;
		padding: 50rpx;
		box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.08);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 50rpx;
	}

	.section-title-main {
		font-size: 44rpx;
		font-weight: 700;
		color: #333;
		position: relative;
		padding-left: 30rpx;
	}

	.section-title-main::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 10rpx;
		height: 44rpx;
		background: linear-gradient(to bottom, #FF8C00, #FF6B00);
		border-radius: 10rpx;
	}

	/* 等级晋升系统 */
	.level-system {
		background: linear-gradient(to right, #f9f9f9, #f0f0f0);
		border-radius: 40rpx;
		padding: 50rpx;
		margin-bottom: 60rpx;
		position: relative;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.level-title {
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 40rpx;
		color: #333;
		display: flex;
		align-items: center;
	}

	.level-title i {
		margin-right: 20rpx;
		color: #FF6B00;
		font-size: 48rpx;
	}

	.current-level {
		display: flex;
		align-items: center;
		margin-bottom: 50rpx;
	}

	.level-badge {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: white;
		margin-right: 40rpx;
		flex-shrink: 0;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	}

	.bronze {
		background: linear-gradient(to bottom, #CD7F32, #8C6B46);
	}

	.silver {
		background: linear-gradient(to bottom, #C0C0C0, #A9A9A9);
	}

	.gold {
		background: linear-gradient(to bottom, #FFD700, #D4AF37);
	}

	.level-badge .level-name {
		font-size: 32rpx;
		margin-bottom: 6rpx;
	}

	.level-badge .level-points {
		font-size: 28rpx;
		opacity: 0.9;
	}

	.level-info {
		flex: 1;
	}

	.level-info h3 {
		font-size: 36rpx;
		margin-bottom: 16rpx;
	}

	.level-info p {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.progress-container {
		margin-top: 30rpx;
		position: relative;
	}

	.progress-labels {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16rpx;
		font-size: 26rpx;
		color: #666;
	}

	.progress-bar {
		height: 24rpx;
		background: #e0e0e0;
		border-radius: 20rpx;
		overflow: hidden;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		border-radius: 20rpx;
		position: relative;
	}

	.progress-marker {
		position: absolute;
		top: -10rpx;
		width: 6rpx;
		height: 44rpx;
		background: #333;
		transform: translateX(-50%);
	}

	.progress-marker::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 12rpx solid transparent;
		border-right: 12rpx solid transparent;
		border-top: 16rpx solid #333;
	}

	.progress-marker-label {
		position: absolute;
		top: -70rpx;
		left: 50%;
		transform: translateX(-50%);
		font-size: 24rpx;
		background: #333;
		color: white;
		padding: 6rpx 16rpx;
		border-radius: 10rpx;
		white-space: nowrap;
	}

	.level-steps {
		display: flex;
		justify-content: space-between;
		margin-top: 60rpx;
	}

	.level-step {
		text-align: center;
		position: relative;
		flex: 1;
		padding: 0 20rpx;
	}

	.level-step:not(:last-child)::after {
		content: '';
		position: absolute;
		top: 40rpx;
		right: -20rpx;
		width: 40rpx;
		height: 4rpx;
		background: #ddd;
	}

	.step-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20rpx;
		font-size: 36rpx;
		color: white;
	}

	.step-icon.active {
		transform: scale(1.1);
		box-shadow: 0 0 0 8rpx rgba(255, 107, 0, 0.2);
	}

	.step-name {
		font-size: 28rpx;
		font-weight: 600;
		margin-bottom: 10rpx;
	}

	.step-points {
		font-size: 24rpx;
		color: #666;
	}

	/* 贡分获取区域 */
	.points-section {
		background: white;
		border-radius: 40rpx;
		padding: 30rpx;
		margin-bottom: 50rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.points-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.points-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: flex;
		align-items: center;
	}

	.points-title i {
		margin-right: 12rpx;
	}

	.points-value {
		font-size: 48rpx;
		font-weight: bold;
		color: #FF6B00;
	}

	.task-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 50rpx;
		margin-top: 40rpx;
	}

	.task-card {
		background: #f9f9f9;
		border-radius: 30rpx;
		padding: 20rpx;
		transition: all 0.3s;
		position: relative;
		overflow: hidden;
		border: 2rpx solid #eee;
		display: flex;
		flex-direction: column;
	}

	.task-card:hover {
		transform: translateY(-10rpx);
		box-shadow: 0 16rpx 40rpx rgba(255, 107, 0, 0.15);
		border-color: #FF8C00;
	}

	.task-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.task-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 20rpx;
		background: #fff5e6;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		color: #FF6B00;
		font-size: 36rpx;
		flex-shrink: 0;
	}

	.task-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.task-desc {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 30rpx;
		line-height: 1.4;
		flex-grow: 1;
	}

	.task-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.task-points {
		display: inline-block;
		background: rgba(255, 107, 0, 0.1);
		color: #FF6B00;
		padding: 8rpx 20rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		font-weight: 600;
	}

	.task-button {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background: #FF6B00;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s;
		border: none;
		font-size: 32rpx;
		flex-shrink: 0;
	}

	.task-button:hover {
		transform: scale(1.1);
		background: #FF8C00;
	}

	/* 历史记录 */
	.history-section {
		background: white;
		border-radius: 40rpx;
		padding: 50rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.history-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 40rpx;
		color: #333;
		display: flex;
		align-items: center;
	}

	.history-title i {
		margin-right: 20rpx;
		color: #FF6B00;
	}

	.history-list {
		max-height: 600rpx;
		overflow-y: auto;
	}

	.history-item {
		display: flex;
		padding: 30rpx 0;
		border-bottom: 2rpx solid #f0f0f0;
		align-items: center;
		transition: background-color 0.3s ease;
		/* Add transition for smooth highlight */
		cursor: pointer;
	}

	.history-item:last-child {
		border-bottom: none;
	}

	.history-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		background: #f9f9f9;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		color: #FF6B00;
		font-size: 36rpx;
	}

	.history-details {
		flex: 1;
	}

	.history-task {
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 10rpx;
	}

	.history-date {
		font-size: 26rpx;
		color: #888;
	}

	.history-points {
		font-weight: bold;
		color: #FF6B00;
		font-size: 32rpx;
	}

	/* 底部导航 */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		display: flex;
		border-top: 2rpx solid #eee;
		padding: 24rpx 0;
		box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.08);
		z-index: 100;
		max-width: 750rpx;
		margin: 0 auto;
		border-radius: 60rpx 60rpx 0 0;
	}

	.nav-item {
		flex: 1;
		text-align: center;
		font-size: 26rpx;
		color: #999;
		padding: 10rpx 0;
		transition: all 0.3s;
	}

	.nav-item.active {
		color: #3a7bd5;
	}

	.nav-icon {
		font-size: 48rpx;
		margin-bottom: 10rpx;
		transition: all 0.3s;
	}

	.nav-item.active .nav-icon {
		color: #3a7bd5;
		transform: translateY(-10rpx);
	}

	/* 动画效果 */
	@keyframes pulse {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.05);
		}

		100% {
			transform: scale(1);
		}
	}

	.pulse {
		animation: pulse 2s infinite;
	}

	.level-system::before {
		content: '';
		position: absolute;
		top: -100rpx;
		right: -100rpx;
		width: 300rpx;
		height: 300rpx;
		background: radial-gradient(circle, rgba(255, 140, 0, 0.1) 0%, rgba(255, 140, 0, 0) 70%);
		border-radius: 50%;
	}

	.level-system::after {
		content: '';
		position: absolute;
		bottom: -60rpx;
		left: -60rpx;
		width: 200rpx;
		height: 200rpx;
		background: radial-gradient(circle, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0) 70%);
		border-radius: 50%;
	}

	/* 邀请人模块样式 */
	.inviter-section {
		background: white;
		border-radius: 40rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		color: #333;
		display: flex;
		align-items: center;
	}

	.section-title i {
		margin-right: 20rpx;
	}

	.inviter-card {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: #f9f9f9;
		border-radius: 30rpx;
		transition: all 0.3s;
	}

	.inviter-card:hover {
		transform: translateY(-5rpx);
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.inviter-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(45deg, #FF8C00, #FF6B00);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		color: white;
		font-size: 48rpx;
		font-weight: bold;
		overflow: hidden;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.inviter-info {
		flex: 1;
	}

	.inviter-name {
		font-size: 34rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.inviter-level {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 8rpx;
	}

	.inviter-date {
		font-size: 26rpx;
		color: #999;
	}

	.inviter-button {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: rgba(255, 107, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		transition: all 0.3s;
	}

	.inviter-button:hover {
		background: rgba(255, 107, 0, 0.2);
		transform: scale(1.1);
	}

	.no-inviter {
		text-align: center;
		padding: 40rpx;
		color: #999;
		font-size: 28rpx;
	}

	.no-inviter i {
		margin-bottom: 20rpx;
		display: block;
		font-size: 48rpx;
	}

	/* 新增：智米模块样式 */
	.smart-rice-section {
		background: linear-gradient(to right, #fefefe, #f9f9f9);
		border-radius: 40rpx;
		padding: 50rpx;
		margin-bottom: 60rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
		border: 2rpx solid #eee;
	}

	.smart-rice-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.smart-rice-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: flex;
		align-items: center;
	}

	.smart-rice-title i {
		margin-right: 12rpx;
	}

	.smart-rice-value {
		font-size: 48rpx;
		font-weight: bold;
		color: #FF6B00;
	}

	.smart-rice-info {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 40rpx;
	}

	.smart-rice-info .exchange-rate {
		margin-top: 15rpx;
		font-size: 30rpx;
		font-weight: 500;
	}

	.smart-rice-actions {
		display: flex;
		justify-content: space-around;
		gap: 30rpx;
		margin-bottom: 40rpx;
	}

	.action-button {
		flex: 1;
		height: 90rpx;
		border-radius: 50rpx;
		border: none;
		color: white;
		font-size: 32rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.exchange-button {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
	}

	.recharge-button {
		background: linear-gradient(to right, #007bff, #0056b3);
	}

	.action-button uni-icons {
		margin-right: 15rpx;
	}

	.action-button:hover {
		transform: translateY(-5rpx);
		box-shadow: 0 12rpx 25rpx rgba(0, 0, 0, 0.2);
	}

	.smart-rice-note {
		font-size: 26rpx;
		color: #999;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.smart-rice-note uni-icons {
		margin-right: 10rpx;
	}
</style>