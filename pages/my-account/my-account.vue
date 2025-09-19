<template>
	<view class="container">

		<view class="account-detail-section" v-if="userInfo">
			<view class="section-header">
				<h2 class="section-title-main">账户信息详情</h2>
			</view>

			<!-- 个人信息详情模块 -->
			<view class="personal-info-section">
				<view class="section-title">
					<uni-icons type="person-filled" size="24" color="#FF6B00"></uni-icons>个人信息详情
				</view>
				<view class="personal-info-card">
					<image class="info-avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill">
					</image>
					<view class="info-details">
						<view class="info-name">{{ userInfo.nickname || '未设置昵称' }}</view>
						<view class="info-id">ID: {{ userInfo.virtualId }}</view>
					</view>
					<button class="details-button" @click="navigateToInfoDetails">
						查看 <uni-icons type="right" size="14" color="#fff"></uni-icons>
					</button>
				</view>
			</view>

			<!-- 邀请人模块 -->
			<view class="inviter-section">
				<view class="section-title">
					<uni-icons type="personadd" size="24" color="#FF6B00"></uni-icons>我的邀请人
				</view>

				<view class="inviter-card" v-if="userInfo.parentName">
					<view class="inviter-avatar">
						<view class="avatar-placeholder">{{ userInfo.parentName.charAt(0) }}</view>
					</view>
					<view class="inviter-info">
						<view class="inviter-name">{{ userInfo.parentName }}</view>
					</view>
				</view>

				<view class="no-inviter" v-else>
					<uni-icons type="info" size="24" color="#999"></uni-icons>
					<p>您尚未被邀请或未填写邀请人</p>
				</view>

				<!-- ================= 我的推荐商友模块 ================= -->
				<view class="recommend-friends-section">
					<button class="recommend-friends-button" @click="navigateToRecommendFriends">
						<uni-icons type="staff-filled" size="22" color="#fff" style="margin-right: 16rpx;"></uni-icons>
						查看我的推荐商友
						<uni-icons type="right" size="16" color="#fff" style="margin-left: auto;"></uni-icons>
					</button>
				</view>
			</view>



			<!-- 社交等级晋升系统 -->
			<view class="level-system">
				<view class="level-title">
					<uni-icons type="medal" size="24" color="#FF6B00"></uni-icons> 社交等级晋升系统
				</view>

				<view class="current-level">
					<view class="level-badge bronze">
						<view class="level-name">{{ userInfo.level.name }}</view>
						<view class="level-points">{{ userInfo.level.icon }}</view>
					</view>

					<view class="level-info">
						<h3>当前等级: <span style="color: #ff7707;font-weight: 600;">{{ userInfo.level.name }}</span></h3>
						<view style="font-size: 26rpx;">您当前拥有<span
								style="color: #ff0000;">{{ userInfo.currExperience }}</span>贡分</view>
						<view style="font-size: 26rpx;">距离下一等级还需 <span
								style="color: #ff7707;">{{ pointsToNextLevel }}</span> 贡分
						</view>
					</view>
				</view>

				<view class="level-steps">
					<!-- 等级阶梯保持静态展示 -->
					<view class="level-step">
						<view class="step-icon" style="background: #E0E0E0;">☆</view>
						<view class="step-name">联合流猩人</view>
						<view class="step-points">0-99分</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #A5D6A7;">★</view>
						<view class="step-name">联合月猩人</view>
						<view class="step-points">100-499分</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #4FC3F7;">✯</view>
						<view class="step-name">联合伙猩人</view>
						<view class="step-points">500-999分</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #BA68C8;">✪</view>
						<view class="step-name">联合创猩人</view>
						<view class="step-points">1000-2000分</view>
					</view>
					<view class="level-step">
						<view class="step-icon" style="background: #FFD54F;">✦</view>
						<view class="step-name">联合创始猿</view>
						<view class="step-points">2000+分</view>
					</view>
				</view>
			</view>

			<!-- ================= 会员等级晋升系统 (已修改) ================= -->
			<view class="membership-level-system">
				<view class="membership-title">
					<uni-icons type="vip" size="24" color="#FFD700"></uni-icons> 会员等级晋升系统
				</view>

				<!-- 动态显示当前会员等级状态 -->
				<view class="membership-status">
					<view class="status-text">
						当前等级: <span class="status-highlight">{{ currentMembershipLevel.name }}</span>
					</view>
					<!-- 新增：显示累计充值金额 -->
					<view class="status-text">
						已累计充值: <span class="status-highlight">{{ userInfo.topUpExperience || 0 }} 元</span>
					</view>
					<!-- <view class="status-text next-level-progress" v-if="amountToNextLevel > 0 && nextMembershipLevel">
						距离 <span class="next-level-name">{{ nextMembershipLevel.name }}</span> 还需
						<span class="amount-needed">{{ amountToNextLevel }} 元</span>
					</view>
					<view class="status-text status-max-level" v-else>
						<uni-icons type="cloud-upload" size="18" color="#28a745"></uni-icons>
						恭喜您，已达到最高会员等级！
					</view> -->
				</view>

				<p class="membership-description">
					会员等级根据累计充值金额进行晋升
				</p>

				<view class="membership-levels">
					<view class="membership-level-item visitor"
						:class="{'current-member-highlight': userInfo.topUpLevel.name === '玄铁会员'}">
						<view class="level-icon">👤</view>
						<view class="level-name">玄铁会员</view>
						<view class="level-price">充值 0 元</view>
					</view>
					<view class="membership-level-item bronze-member"
						:class="{'current-member-highlight': userInfo.topUpLevel.name === '青铜会员'}">
						<view class="level-icon">🪙</view>
						<view class="level-name">青铜会员</view>
						<view class="level-price">充值 100 元</view>
					</view>
					<view class="membership-level-item silver-member"
						:class="{'current-member-highlight': userInfo.topUpLevel.name === '白银会员'}">
						<view class="level-icon">🔶</view>
						<view class="level-name">白银会员</view>
						<view class="level-price">充值 365 元</view>
					</view>
					<view class="membership-level-item gold-member"
						:class="{'current-member-highlight': userInfo.topUpLevel.name === '黄金会员'}">
						<view class="level-icon">🌟</view>
						<view class="level-name">黄金会员</view>
						<view class="level-price">充值 3,650 元</view>
					</view>
					<view class="membership-level-item diamond-member"
						:class="{'current-member-highlight': userInfo.topUpLevel.name === '黑钻会员'}">
						<view class="level-icon">💎</view>
						<view class="level-name">黑钻会员</view>
						<view class="level-price">充值 36,500 元</view>
					</view>
				</view>

				<!-- 会员操作按钮区域 -->
				<view class="membership-actions">
					<button class="action-button details-btn" @click="navigateToMemberDetails">
						<uni-icons type="list" size="20" color="#fff"></uni-icons> 会员详情
					</button>
					<button class="action-button recharge-btn" @click="navigateToMembershipRecharge">
						<uni-icons type="wallet" size="20" color="#fff"></uni-icons> 立即充值
					</button>
				</view>
			</view>
			<!-- ================= 会员等级系统修改结束 ================= -->

			<!-- 我的智米模块 -->
			<view class="smart-rice-section">
				<view class="smart-rice-header">
					<view class="smart-rice-title">
						<uni-icons type="wallet" size="24" color="#FF6B00"></uni-icons> 我的智米
					</view>
					<view class="smart-rice-value">{{ userInfo.point }} 智米</view>
				</view>
				<view class="smart-rice-info">
					<p>智米可用于兑换平台内服务或商品。</p>
				</view>
				<view class="smart-rice-actions">
					<button class="action-button exchange-button" @click="handleExchangeSmartRice">
						<uni-icons type="forward" size="20" color="#fff"></uni-icons> 申请兑换
					</button>
					<button class="action-button recharge-button" @click="handleRechargeSmartRice">
						<uni-icons type="wallet" size="20" color="#fff"></uni-icons> 立即充值
					</button>
				</view>
				<!-- <p class="smart-rice-note">
					<uni-icons type="info-filled" size="18" color="#FF6B00"></uni-icons> 智米充值请联系平台客服。
				</p> -->
			</view>

			<!-- 贡分获取区域 -->
			<view class="points-section">
				<view class="points-header">
					<view class="points-title"> <uni-icons type="compose" size="24" color="#FF6B00"></uni-icons> 获取贡分
					</view>
					<view class="points-value">{{ userInfo.currExperience }}</view>
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
							<button class="task-button" @click="handleTaskClick(task)">
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

				<view v-if="historyList.length === 0 && historyLoadStatus === 'noMore'" class="history-empty">
					<uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
					<text>暂无贡分记录</text>
				</view>

				<view v-else class="history-list">
					<view class="history-item" v-for="(record, index) in historyList"
						:key="record.createTime + '-' + index">
						<view class="history-icon"
							:class="{ 'positive-bg': record.experience >= 0, 'negative-bg': record.experience < 0 }">
							<uni-icons :type="record.experience >= 0 ? 'arrow-up' : 'arrow-down'" size="20"
								:color="record.experience >= 0 ? '#28a745' : '#dc3545'">
							</uni-icons>
						</view>
						<view class="history-details">
							<view class="history-task">{{ record.title }}</view>
							<view class="history-date">{{ formatTimestamp(record.createTime) }}</view>
						</view>
						<view class="history-points"
							:class="{ 'positive': record.experience >= 0, 'negative': record.experience < 0 }">
							{{ record.experience > 0 ? '+' : '' }}{{ record.experience }}
						</view>
					</view>
				</view>

				<uni-load-more v-if="historyList.length > 0" :status="historyLoadStatus"></uni-load-more>
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
	import {
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js'; // ‼️ 请确保此路径正确

	// ======================= 用户基本信息模块 =======================
	const userInfo = ref(null);

	onMounted(() => {
		fetchUserInfo().then(() => {
			if (userInfo.value) {
				getHistoryList(true);
			}
		});
	});

	const fetchUserInfo = async () => {
		uni.showLoading({
			title: '加载中...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		uni.hideLoading();

		if (error) {
			uni.showToast({
				title: `加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}
		userInfo.value = data;
		console.log("123",userInfo.value)
	};

	/**
	 * 跳转到个人信息详情页
	 */
	const navigateToInfoDetails = () => {
		// 检查 userInfo.value 和 userInfo.value.id 是否存在
		if (!userInfo.value || !userInfo.value.id) {
			uni.showToast({
				title: '无法获取用户ID',
				icon: 'none'
			});
			return;
		}

		// 【核心修改】只传递用户的 ID
		uni.navigateTo({
			url: `/packages/my-account-informationDetails/my-account-informationDetails?id=${userInfo.value.id}`
		});
	};

	// 计算属性 - 距离下一社交等级所需贡分
	const pointsToNextLevel = computed(() => {
		if (!userInfo.value) return 0;
		const currentPoints = userInfo.value.currExperience;

		if (currentPoints < 100) return 100 - currentPoints;
		if (currentPoints < 500) return 500 - currentPoints;
		if (currentPoints < 1000) return 1000 - currentPoints;
		if (currentPoints < 2000) return 2000 - currentPoints;
		return 0;
	});

	// ======================= 会员等级模块 (已修改) =======================
	// 定义会员等级及其门槛
	const membershipLevels = ref([{
			name: '玄铁会员',
			threshold: 0
		},
		{
			name: '青铜会员',
			threshold: 100
		},
		{
			name: '白银会员',
			threshold: 365
		},
		{
			name: '黄金会员',
			threshold: 3650
		},
		{
			name: '黑钻会员',
			threshold: 36500
		},
		// 添加一个无限大的“顶层”，方便计算，用户不会看到
		{
			name: '至尊',
			threshold: Infinity
		}
	]);

	// 计算当前会员等级
	const currentMembershipLevel = computed(() => {
		// 确保 userInfo 和 topUpExperience 已加载
		if (!userInfo.value || typeof userInfo.value.topUpExperience === 'undefined') {
			return membershipLevels.value[0]; // 返回默认值
		}
		const amount = userInfo.value.topUpExperience;
		// 从高到低查找，找到第一个满足条件的等级
		for (let i = membershipLevels.value.length - 1; i >= 0; i--) {
			if (amount >= membershipLevels.value[i].threshold) {
				return membershipLevels.value[i];
			}
		}
		return membershipLevels.value[0];
	});

	/**
	 * 跳转到会员详情页
	 */
	const navigateToMemberDetails = () => {
		uni.navigateTo({
			url: '/pages/my-memberDetails/my-memberDetails'
		});
	};
	/**
	 * 跳转到会员充值页
	 */
	const navigateToMembershipRecharge = () => {
		// 注意：这里跳转到和智米充值相同的页面
		// 将来可以通过参数区分充值类型，例如：?type=membership
		uni.navigateTo({
			url: '/pages/recharge/recharge?type=membership'
		});
	};

	// 计算下一会员等级
	const nextMembershipLevel = computed(() => {
		const currentIndex = membershipLevels.value.findIndex(level => level.name === currentMembershipLevel.value
			.name);
		// 确保不是最后一个有效等级（-2 是因为我们加了一个无限大的顶层）
		if (currentIndex < membershipLevels.value.length - 2) {
			return membershipLevels.value[currentIndex + 1];
		}
		return null; // 已是最高等级，没有下一级
	});

	// 计算距离下一等级还需的金额
	const amountToNextLevel = computed(() => {
		if (nextMembershipLevel.value && userInfo.value) {
			const needed = nextMembershipLevel.value.threshold - userInfo.value.topUpExperience;
			return Math.max(0, needed); // 确保结果不为负
		}
		return 0; // 已是最高等级
	});

	// ======================= 贡分历史记录模块 =======================
	const historyList = ref([]);
	const historyPageNo = ref(1);
	const historyPageSize = ref(10);
	const historyTotal = ref(0);
	const historyLoadStatus = ref('more');

	const getHistoryList = async (isRefresh = false) => {
		if (historyLoadStatus.value === 'loading' || (historyLoadStatus.value === 'noMore' && !isRefresh)) {
			return;
		}
		if (isRefresh) {
			historyPageNo.value = 1;
			historyList.value = [];
			historyLoadStatus.value = 'more';
		}
		historyLoadStatus.value = 'loading';
		const params = {
			pageNo: historyPageNo.value,
			pageSize: historyPageSize.value,
		};
		const {
			data,
			error
		} = await request('/app-api/member/experience-record/page', {
			method: 'GET',
			data: params,
		});
		if (error) {
			historyLoadStatus.value = 'more';
			uni.showToast({
				title: `历史记录加载失败: ${error}`,
				icon: 'none'
			});
			return;
		}
		if (data && data.list) {
			historyList.value.push(...data.list);
			historyTotal.value = data.total;
			if (historyList.value.length >= historyTotal.value) {
				historyLoadStatus.value = 'noMore';
			} else {
				historyLoadStatus.value = 'more';
				historyPageNo.value++;
			}
		} else {
			historyLoadStatus.value = 'noMore';
		}
	};

	onReachBottom(() => {
		getHistoryList();
	});

	// ======================= 辅助函数 =======================
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const Y = date.getFullYear();
		const M = (date.getMonth() + 1).toString().padStart(2, '0');
		const D = date.getDate().toString().padStart(2, '0');
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	};

	// ======================= 静态数据和方法 (保持不变) =======================
	const tasks = ref([
		{
			icon: 'flag',
			name: '发起聚会',
			desc: '成功发起并举办一次聚会',
			points: '+30分/次',
			path: '/pages/active-publish/active-publish'
		},
		{
			icon: 'calendar',
			name: '参与聚会',
			desc: '参加平台组织的聚会',
			points: '+5分/次',
			path: '/pages/active/active'
		},
		{
			icon: 'chat',
			name: '分享聚会',
			desc: '分享有价值的聚会',
			points: '+5分/次',
			path: '/pages/active/active'
		},
		{
			icon: 'sound',
			name: '发布商机',
			desc: '分享有价值的商业机会',
			points: '+5分/次',
			path: '/pages/home/home'
		},
		{
			icon: 'mic',
			name: '评论商机',
			desc: '对他人分享的商机进行评价',
			points: '+5分/次',
			path: '/pages/home-commercialDetail/home-commercialDetail'
		},
		{
			icon: 'personadd',
			name: '分享名片',
			desc: '分享个人名片卡片',
			points: '+5分/人',
			path: '/pages/my-businessCard/my-businessCard'
		},
		{
			icon: 'personadd',
			name: '邀请注册',
			desc: '邀请新用户进行注册',
			points: '+5分/人',
			path: '/pages/index/index'
		},
		{
			icon: 'star',
			name: '其他贡献',
			desc: '用户在平台的其他贡献',
			points: '+5分',
		},
	]);

	const handleTaskClick = (task) => {
		if (!task.path) {
			uni.showToast({
				title: '该功能正在开发中...',
				icon: 'none'
			});
			return;
		}
		uni.navigateTo({
			url: task.path,
			fail: (err) => {
				console.error(`跳转失败: ${err.errMsg}`);
				uni.showToast({
					title: '请手动前往对应页面',
					icon: 'none'
				});
			}
		});
	};

	const handleExchangeSmartRice = () => {
		console.log('用户点击了申请兑换，准备跳转到兑换页面...');
		uni.showToast({
			title: '兑换页面开发中...',
			icon: 'none'
		});
		// uni.navigateTo({ url: '/pages/exchange/exchange' });
	};

	const handleRechargeSmartRice = () => {
		console.log('用户点击了充值智米，跳转到充值页面...');
		uni.navigateTo({
			url: '/pages/recharge/recharge' // 跳转到充值页面
		});
	};

	// 跳转到“我的推荐商友”页面 ---
	const navigateToRecommendFriends = () => {
		uni.navigateTo({
			url: '/pages/my-recommendFriends/my-recommendFriends'
		});
	};

	const contactCustomerService = () => {
		uni.showToast({
			title: '正在为您跳转客服联系方式...',
			icon: 'none',
			duration: 2000
		});
	};
</script>

<style scoped>
	/* ================== 会员操作按钮样式 ================== */
	.membership-actions {
		display: flex;
		justify-content: space-around;
		gap: 30rpx;
		margin-top: 50rpx;
		/* 与列表保持间距 */
	}

	/* 复用 .action-button 基础样式，并为新按钮定义颜色 */
	.details-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
	}

	.recharge-btn {
		background: linear-gradient(to right, #007bff, #0056b3);
	}

	/* ================== 历史记录模块样式 ================== */
	.history-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		color: #999;
		font-size: 28rpx;
	}

	.history-empty text {
		margin-top: 20rpx;
	}

	.history-icon.positive-bg {
		background-color: #e8f5e9;
		/* 绿色背景 */
	}

	.history-icon.negative-bg {
		background-color: #fce4e4;
		/* 红色背景 */
	}

	.history-points.positive {
		color: #28a745;
		/* 绿色 */
	}

	.history-points.negative {
		color: #dc3545;
		/* 红色 */
	}

	/* 当前会员等级高亮样式 */
	.current-member-highlight {
		transform: translateY(-8rpx);
		box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.15) !important;
		border: 4rpx solid #FF6B00 !important;
	}


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

	.level-system {
		background: linear-gradient(to right, #f9f9f9, #f0f0f0);
		border-radius: 40rpx;
		padding: 50rpx 10rpx;
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
		font-size: 28rpx;
		margin-bottom: 6rpx;
	}

	.level-badge .level-points {
		font-size: 24rpx;
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

	.membership-level-system {
		background: #ffffff;
		border-radius: 40rpx;
		padding: 50rpx;
		margin-top: 60rpx;
		margin-bottom: 60rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
		border: 1px solid #f0f0f0;
	}

	.membership-title {
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
		display: flex;
		align-items: center;
	}

	.membership-title uni-icons {
		margin-right: 20rpx;
	}

	.membership-status {
		background: linear-gradient(135deg, #fffaf2, #fff5e6);
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		border: 2rpx solid #ffe8cc;
	}

	.status-text {
		font-size: 30rpx;
		color: #664d03;
		margin-bottom: 20rpx;
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
		font-size: 32rpx;
	}

	.next-level-name {
		font-weight: bold;
		color: #d35400;
	}

	.amount-needed {
		font-size: 36rpx;
		font-weight: bold;
		color: #ff0000;
		margin: 0 8rpx;
	}

	.status-max-level {
		font-size: 32rpx;
		font-weight: bold;
		color: #28a745;
		display: flex;
		align-items: center;
	}

	.status-max-level uni-icons {
		margin-right: 12rpx;
	}

	.membership-description {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 50rpx;
		line-height: 1.6;
		text-align: center;
	}

	.membership-levels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250rpx, 1fr));
		gap: 30rpx;
	}

	.membership-level-item {
		border-radius: 30rpx;
		padding: 30rpx 20rpx;
		text-align: center;
		transition: transform 0.3s, box-shadow 0.3s;
		cursor: pointer;
	}

	.membership-level-item:hover {
		transform: translateY(-8rpx);
		box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.1);
	}

	.membership-level-item .level-icon {
		margin-bottom: 20rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.membership-level-item .level-name {
		font-size: 30rpx;
		font-weight: 600;
		margin-bottom: 10rpx;
	}

	.membership-level-item .level-price {
		font-size: 28rpx;
		font-weight: 500;
	}

	.visitor {
		background-color: #f8f9fa;
		border: 2rpx solid #dee2e6;
	}

	.visitor .level-name {
		color: #6c757d;
	}

	.visitor .level-price {
		color: #6c757d;
	}

	.bronze-member {
		background-color: #fff4e6;
		border: 2rpx solid #fed8b1;
	}

	.bronze-member .level-name {
		color: #CD7F32;
	}

	.bronze-member .level-price {
		color: #8C6B46;
	}

	.silver-member {
		background-color: #f1f3f5;
		border: 2rpx solid #ced4da;
	}

	.silver-member .level-name {
		color: #868e96;
	}

	.silver-member .level-price {
		color: #495057;
	}

	.gold-member {
		background-color: #fff9db;
		border: 2rpx solid #ffec8b;
	}

	.gold-member .level-name {
		color: #e6a23c;
	}

	.gold-member .level-price {
		color: #c67c00;
	}

	.diamond-member {
		background-color: #343a40;
		border: 2rpx solid #495057;
	}

	.diamond-member .level-name {
		color: #f8f9fa;
	}

	.diamond-member .level-price {
		color: #dee2e6;
	}

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
		font-size: 32rpx;
	}

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


	/* 【新增】个人信息详情模块样式 */
	.personal-info-section {
		background: white;
		border-radius: 40rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.personal-info-card {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background: #f9f9f9;
		border-radius: 30rpx;
	}

	.info-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.info-details {
		flex: 1;
		min-width: 0;
	}

	.info-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.info-id {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.details-button {
		margin-left: auto;
		flex-shrink: 0;
		height: 68rpx;
		line-height: 68rpx;
		padding: 0 30rpx;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
		border-radius: 34rpx;
		font-size: 26rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
	}

	.details-button::after {
		border: none;
	}

	.details-button uni-icons {
		margin-left: 8rpx;
	}

	/* ================== 新增推荐商友按钮样式 ================== */
	.recommend-friends-section {
		/* padding: 0 0 40rpx; */
		/* 与其他模块保持间距 */
		margin-top: 20rpx;
	}

	.recommend-friends-button {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100rpx;
		padding: 0 40rpx;
		background: linear-gradient(135deg, #2c3e50, #46627f);
		color: white;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: bold;
		border: none;
		box-shadow: 0 8rpx 20rpx rgba(44, 62, 80, 0.2);
		transition: all 0.3s ease;
	}

	.recommend-friends-button::after {
		border: none;
	}

	.recommend-friends-button:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 12rpx 25rpx rgba(44, 62, 80, 0.3);
	}
</style>