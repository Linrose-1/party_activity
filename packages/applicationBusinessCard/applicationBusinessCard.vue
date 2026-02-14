<template>
	<view class="business-card-apply-page">
		<view v-if="isLoading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载信息，请稍候...</text>
		</view>

		<view class="container" v-else>
			<!-- 申请卡片 -->
			<!-- 使用 v-if 确保在目标用户信息加载后再显示 -->
			<view class="application-card" v-if="targetUserInfo">
				<view class="target-user">
					<!-- 优先显示头像，如果没有则显示姓氏首字母 -->
					<image v-if="targetUserInfo.avatar" :src="targetUserInfo.avatar" class="target-avatar-image">
					</image>
					<view v-else class="target-avatar">
						{{ (targetUserInfo.realName || targetUserInfo.nickname || '?').charAt(0) }}
					</view>

					<view class="target-name">{{ targetUserInfo.realName || targetUserInfo.nickname }}</view>
					<!-- <view class="target-title">{{ targetUserInfo.companyName || '公司信息未设置' }}</view> -->
				</view>

				<!-- ==================== 用户信息预览区 ==================== -->
				<view class="target-details">
					<view class="detail-item remark-item" @click="handleEditRemark">
						<uni-icons type="compose" size="16" color="#888"></uni-icons>
						<text class="detail-label">备注名:</text>
						<!-- 有备注显示备注，无备注显示提示 -->
						<text v-if="targetUserInfo.remarkName"
							class="detail-value remark-highlight">{{ targetUserInfo.remarkName }}</text>
						<text v-else class="detail-value placeholder-text">点击设置备注</text>
						<uni-icons type="right" size="14" color="#ccc" style="margin-left: auto;"></uni-icons>
					</view>

					<view v-if="targetUserInfo.companyName" class="detail-item">
						<uni-icons type="flag" size="16" color="#888"></uni-icons>
						<text class="detail-label">公司:</text>
						<text class="detail-value">{{ targetUserInfo.companyName }}</text>
					</view>
					<view v-if="targetUserInfo.positionTitle" class="detail-item">
						<uni-icons type="staff" size="16" color="#888"></uni-icons>
						<text class="detail-label">职务:</text>
						<text class="detail-value">{{ targetUserInfo.positionTitle }}</text>
					</view>
					<view v-if="targetUserInfo.professionalTitle" class="detail-item">
						<uni-icons type="medal" size="16" color="#888"></uni-icons>
						<text class="detail-label">社会职务:</text>
						<text class="detail-value">{{ targetUserInfo.professionalTitle }}</text>
					</view>
					<view v-if="targetUserInfo.socialOrganization" class="detail-item">
						<uni-icons type="network" size="16" color="#888"></uni-icons>
						<text class="detail-label">社会组织:</text>
						<text class="detail-value">{{ targetUserInfo.socialOrganization }}</text>
					</view>
					<view v-if="targetUserInfo.personalBio" class="detail-item bio-item">
						<uni-icons type="paperclip" size="16" color="#888"></uni-icons>
						<text class="detail-label">个人简介:</text>
						<text class="detail-value">{{ targetUserInfo.personalBio }}</text>
					</view>
				</view>
				<!-- ======================================================================== -->

				<view class="description">
					您正在申请查看<span
						class="highlight">{{ targetUserInfo.realName || targetUserInfo.nickname }}</span>的联系方式。请选择一种方式支付查看费用：
				</view>

				<view class="cost-section">
					<view class="cost-title">选择支付方式</view>

					<view class="cost-options">
						<view class="cost-option selected"> <!-- 只有一个选项，直接设为选中 -->
							<view class="currency-icon">
								<i class="fas fa-gem"></i> <!-- 建议替换为 uni-icons 或图片 -->
							</view>
							<view class="cost-amount">{{ costAmount }}</view>
							<view class="cost-label">智米</view>
						</view>
					</view>

					<view class="price-policy-hint">
						<uni-icons type="info-filled" size="14" color="#FF6A00"></uni-icons>
						<text v-if="friendOwnerUserId">提示：您正在通过其他圈主的圈友列表查看用户名片，需支付 2 智米。</text>
						<text v-else>提示：普通名片查看需支付 1 智米。</text>
					</view>

					<view class="user-balance user-balance-adjust" v-if="currentUserInfo">
						<view class="balance-item">
							<view>我的智米</view>
							<view class="balance-value" :class="{ 'insufficient-value': currentUserInfo.point < 1 }">
								{{ currentUserInfo.point }}
							</view>
						</view>
					</view>

					<view class="insufficient" v-if="showInsufficient">
						<i class="fas fa-exclamation-circle"></i> 您的智米不足，请先获取更多积分
					</view>
				</view>

				<view class="action-buttons">
					<button class="btn btn-primary" @click="handlePayToReadCard" :loading="isPaying"
						:disabled="isPaying">
						{{ isPaying ? '支付中...' : '确认支付' }}
					</button>

					<button class="btn btn-secondary" @click="goToEarnPoints">
						获取更多智米
					</button>
				</view>

			</view>
			<!-- 加载中的占位符 -->
			<view v-else class="loading-placeholder">
				<uni-load-more status="loading" :contentText="{ contentdown: '上拉加载更多', contentrefresh: '正在加载用户信息...', contentnomore: '—— 我是有底线的 ——' }"></uni-load-more>
			</view>

			<!-- 提示信息 -->
			<view class="info-card">
				<h1 class="info-card-title">
					<i class="fas fa-info-circle"></i> 为什么需要支付智米？
				</h1>
				<p>为了维护猩聚社平台信任社交、价值社交、共建共享的生态，查看商友信息与连接商友需要消耗智米。这有助于：</p>
				<ul>
					<li>·确保联系人请求的严肃性</li>
					<li>·保护用户免受非关联干扰</li>
					<li>·维护高质量商业社交环境</li>
					<li>·激励用户贡献高质量内容</li>
				</ul>
			</view>


			<!-- 格式化申请好友语卡片 -->
			<view class="friend-request-card" v-if="currentUserInfo && targetUserInfo">
				<h1 class="friend-request-title">
					<i class="fas fa-comment-dots"></i> 申请微信好友语
				</h1>
				<p class="friend-request-desc">复制以下文字，方便快速添加对方微信：</p>
				<view class="message-box">
					<text selectable class="formatted-message">{{ formattedFriendRequestMessage }}</text>
					<button class="copy-btn" @click="copyFriendRequestMessage">
						⧉复制
					</button>
				</view>
			</view>


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
	import request from '../../utils/request.js';

	// --- 状态管理 ---
	const currentUserInfo = ref(null); // 存储【当前登录用户】的信息
	const targetUserInfo = ref(null); // 存储【目标用户】的信息
	const targetUserId = ref(null);
	const fromShare = ref(false);
	const isPaying = ref(false);
	const showInsufficient = ref(false);
	const isReadyForDisplay = ref(false);
	const isLoading = ref(true);

	const friendOwnerUserId = ref(null);

	// --- 页面生命周期 ---
	onLoad((options) => {
		console.log('[business-card-apply] onLoad 触发。收到的选项：', options);

		if (options.friendOwnerUserId) {
			friendOwnerUserId.value = options.friendOwnerUserId;
		}

		// 1. 快速的同步操作
		if (options.id && options.name) {
			targetUserId.value = parseInt(options.id, 10);
			fromShare.value = options.fromShare === '1';

			// 预填充UI，提供即时反馈，但此时页面还被loading覆盖
			targetUserInfo.value = {
				id: targetUserId.value,
				nickname: decodeURIComponent(options.name),
				realName: decodeURIComponent(options.name),
				avatar: options.avatar ? decodeURIComponent(options.avatar) :
					'/static/images/default-avatar.png'
			};

			// 2.【核心修复】启动异步任务，但【不使用 await】！
			// 让 onLoad 立即结束，页面得以成功加载
			initializePage();

		} else {
			// 参数错误，快速失败
			isLoading.value = false; // 隐藏加载
			uni.showToast({
				title: '缺少必要的用户信息',
				icon: 'error'
			});
			setTimeout(() => uni.navigateBack(), 1500);
		}
	});

	// --- 初始化与数据获取 ---

	// 动态计算本次查看需要多少智米
	const costAmount = computed(() => {
		return friendOwnerUserId.value ? 2 : 1;
	});

	// 页面初始化总函数
	const initializePage = async () => {
		try {
			// 步骤一：首先进行权限检查
			const hasPermission = await checkAccessPermission();

			// 如果权限检查通过，函数会直接跳转，当前页面实例后续会被销毁
			if (hasPermission) {
				return;
			}

			// ==================== 并行获取两种信息 ====================
			// 如果权限检查未通过（即需要支付），则同时获取：
			// 1. 目标用户的简要信息（用于展示）
			// 2. 当前登录用户的信息（用于显示余额）
			await Promise.all([
				fetchCurrentUserInfo(),
				fetchSimpleTargetUserInfo(),
			]);
			// ========================================================================

		} catch (e) {
			console.error("初始化页面时发生错误:", e);
			// 即使出错，也要结束加载状态，让用户能看到页面
		} finally {
			// 步骤三：无论成功与否，所有异步操作完成后，结束加载状态，显示页面内容
			isLoading.value = false;
		}
	};

	// 任务一：检查权限，如果成功则直接跳转
	const checkAccessPermission = async () => {
		const requestData = {
			readUserId: targetUserId.value,
			isReadByFriend: friendOwnerUserId.value ? 1 : 0,
			friendOwnerUserId: friendOwnerUserId.value || 0
		};
		if (fromShare.value) {
			requestData.notPay = 1;
		}

		const {
			data,
			error
		} = await request('/app-api/member/user/read-card', {
			method: 'POST',
			data: requestData
		});

		if (data && !error) {
			console.log("权限检查成功，直接跳转到名片页。");
			let targetUrl = `/packages/my-businessCard/my-businessCard?id=${targetUserId.value}`;
			if (friendOwnerUserId.value) {
				targetUrl += `&friendOwnerUserId=${friendOwnerUserId.value}`;
			}
			uni.redirectTo({
				url: targetUrl
			});
			return true;
		} else {
			console.log("权限检查失败，显示支付页面。", error);
			return false;
		}
	};

	// ==================== 获取目标用户简要信息的函数 ====================
	/**
	 * @description 获取目标用户的简要信息用于支付前预览
	 */
	const fetchSimpleTargetUserInfo = async () => {
		// 防御性编程，确保 targetUserId 存在
		if (!targetUserId.value) {
			console.warn("无法获取简要信息，因为 targetUserId 不存在。");
			return;
		}

		const {
			data,
			error
		} = await request('/app-api/member/user/getSimpleUserInfo', {
			method: 'GET',
			data: {
				readUserId: targetUserId.value,
				notPay: 1 // 固定传 1
			}
		});

		// ==================== 【按您的要求】打印接口返回数据 ====================
		console.log('----------- getSimpleUserInfo 接口返回数据 -----------');
		console.log(JSON.stringify(data, null, 2)); // 格式化输出，方便查看
		console.log('----------------------------------------------------');
		// =================================================================

		if (error) {
			console.error("获取目标用户简要信息失败:", error);
			// 即使失败，页面也能用 URL 传来的基础信息展示，不中断流程
			return;
		}

		if (data) {
			// 将获取到的新信息，与已有的基础信息（如头像）合并
			// 这样可以保留从 URL 传来的头像，同时补充 API 返回的字段
			targetUserInfo.value = {
				...targetUserInfo.value,
				...data
			};
		}
	};
	// ===================================================================================

	// 任务二：获取当前登录用户的信息（为了余额和好友申请语）
	const fetchCurrentUserInfo = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user/get', {
			method: 'GET'
		});
		if (data) {
			currentUserInfo.value = data;
		} else {
			console.error('获取当前用户信息失败:', error);
		}
	};

	// --- 核心业务逻辑 ---
	const handlePayToReadCard = async () => {
		if (isPaying.value) return;
		if (!targetUserId.value) {
			uni.showToast({
				title: '目标用户ID无效',
				icon: 'none'
			});
			return;
		}
		if (currentUserInfo.value && currentUserInfo.value.point < costAmount.value) {
			showInsufficient.value = true;
			uni.showToast({
				title: '智米不足',
				icon: 'none'
			});
			return;
		}
		isPaying.value = true;
		showInsufficient.value = false;

		const {
			data,
			error
		} = await request('/app-api/member/user/pay-read-card', {
			method: 'POST',
			data: {
				readUserId: targetUserId.value,
				isReadByFriend: friendOwnerUserId.value ? 1 : 0,
				friendOwnerUserId: friendOwnerUserId.value || 0
			}
		});

		isPaying.value = false;

		if (error) {
			uni.showToast({
				title: `支付失败: ${error}`,
				icon: 'none',
				duration: 2000
			});
		} else if (data === true) {
			uni.showToast({
				title: '支付成功！',
				icon: 'success',
				duration: 2000
			});

			// 【修正】支付成功后，只需刷新当前用户的余额信息即可
			fetchCurrentUserInfo();

			setTimeout(() => {
				let finalUrl = `/packages/my-businessCard/my-businessCard?id=${targetUserId.value}`;
				if (friendOwnerUserId.value) {
					finalUrl += `&friendOwnerUserId=${friendOwnerUserId.value}`;
				}
				uni.redirectTo({
					url: finalUrl
				});
			}, 2000);
		} else {
			uni.showToast({
				title: '支付遇到未知问题',
				icon: 'none',
				duration: 2000
			});
		}
	};

	const handleEditRemark = () => {
		uni.showModal({
			title: '设置备注名',
			content: targetUserInfo.value.remarkName || '',
			editable: true,
			placeholderText: '请输入备注名',
			success: async (res) => {
				if (res.confirm) {
					const newRemarkName = res.content.trim();
					const success = await saveUserRemark(newRemarkName);
					if (success) {
						// 更新本地显示
						// 注意：这里更新的是 targetUserInfo 对象，界面会自动响应
						targetUserInfo.value = {
							...targetUserInfo.value,
							remarkName: newRemarkName
						};
						uni.showToast({
							title: '备注已保存',
							icon: 'success'
						});
					}
				}
			}
		});
	};

	const saveUserRemark = async (remark) => {
		if (!targetUserId.value) return false;
		const {
			error
		} = await request('/app-api/member/user-remark/addOrUpdateRemarkName', {
			method: 'POST',
			data: {
				toUserId: targetUserId.value,
				remarkName: remark,
			}
		});
		if (error) {
			uni.showToast({
				title: `保存失败: ${error}`,
				icon: 'none'
			});
			return false;
		}
		return true;
	};

	// --- 辅助功能 ---
	const goToEarnPoints = () => {
		uni.navigateTo({
			url: '/packages/my-account/my-account'
		});
	};

	// 计算属性现在可以正确地从两个独立的数据源取值
	const formattedFriendRequestMessage = computed(() => {
		if (!currentUserInfo.value || !targetUserInfo.value) return '正在生成中...';

		const targetName = targetUserInfo.value.realName; // 来自URL参数
		const myName = currentUserInfo.value.realName || currentUserInfo.value.nickname; // 来自API
		const myCompany = currentUserInfo.value.companyName || '我的公司'; // 来自API
		const myWork = currentUserInfo.value.professionalTitle || '我的职位'; // 来自API

		return `您好 ${targetName}！我是${myCompany}的${myName}，目前在从事${myWork}工作。我从猩聚社平台获得您的联系方式，希望可以认识一下。`;
	});

	const copyFriendRequestMessage = () => {
		uni.setClipboardData({
			data: formattedFriendRequestMessage.value,
			success: () => uni.showToast({
				title: '复制成功！',
				icon: 'success'
			}),
			fail: () => uni.showToast({
				title: '复制失败',
				icon: 'none'
			})
		});
	};
</script>

<style scoped>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #f8f9fa;
	}

	.loading-spinner {
		width: 50rpx;
		height: 50rpx;
		border: 4rpx solid #e0e0e0;
		border-top-color: #ff6b00;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}

	.loading-text {
		font-size: 28rpx;
		color: #666;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	/* 在原有样式基础上，新增和修改以下样式 */
	.target-avatar-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		margin-bottom: 30rpx;
		border: 6rpx solid white;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
	}

	.loading-placeholder {
		padding: 100rpx 0;
	}

	/* 其他样式保持不变... */
	/* 页面根容器样式，模拟 body 的布局和最大宽度 */
	.business-card-apply-page {
		background: linear-gradient(135deg, #f8f9fa, #e9ecef);
		color: #333;
		line-height: 1.6;
		max-width: 750rpx;
		/* uni-app 推荐使用 rpx */
		margin: 0 auto;
		/* 页面内容居中 */
		position: relative;
		min-height: 100vh;
		/* 确保页面至少占满视口高度 */
		display: flex;
		/* 使用 flex 布局，使顶部导航和内容可以分开管理 */
		flex-direction: column;
	}

	.container {
		padding: 40rpx;
		/* 转换为 rpx */
		padding-bottom: 160rpx;
		/* 为底部导航栏留出空间，转换为 rpx */
		flex: 1;
		/* 容器占据剩余垂直空间 */
		overflow-y: auto;
		/* 允许内容垂直滚动 */
		-webkit-overflow-scrolling: touch;
		/* 提升 iOS 滚动流畅度 */
	}

	/* 顶部导航 (此处模板中已移除，保留样式以防需要) */
	.header {
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		color: white;
		padding: 36rpx 40rpx;
		/* 转换为 rpx */
		position: sticky;
		/* 吸顶效果 */
		top: 0;
		z-index: 100;
		box-shadow: 0 6rpx 24rpx rgba(255, 106, 0, 0.3);
		/* 转换为 rpx */
		display: flex;
		align-items: center;
		border-bottom-left-radius: 30rpx;
		/* 转换为 rpx */
		border-bottom-right-radius: 30rpx;
		/* 转换为 rpx */
	}

	.header .back-btn {
		font-size: 44rpx;
		/* 转换为 rpx */
		margin-right: 30rpx;
		/* 转换为 rpx */
		width: 72rpx;
		/* 转换为 rpx */
		height: 72rpx;
		/* 转换为 rpx */
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.3s;
	}

	.header .back-btn:active {
		background: rgba(255, 255, 255, 0.2);
	}

	.header h1 {
		font-size: 40rpx;
		/* 转换为 rpx */
		font-weight: 600;
		flex-grow: 1;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
		/* 转换为 rpx */
	}

	/* 申请卡片 */
	.application-card {
		background: white;
		border-radius: 40rpx;
		/* 转换为 rpx */
		margin: 50rpx 0;
		/* 转换为 rpx */
		padding: 60rpx;
		/* 转换为 rpx */
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
		/* 转换为 rpx */
		border: 2rpx solid #eee;
		/* 转换为 rpx */
		position: relative;
		overflow: hidden;
		text-align: center;
	}

	.application-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 10rpx;
		/* 转换为 rpx */
		background: linear-gradient(to right, #FF6A00, #FF8C00);
	}

	.target-user {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
		/* 转换为 rpx */
	}

	.target-avatar {
		width: 180rpx;
		/* 转换为 rpx */
		height: 180rpx;
		/* 转换为 rpx */
		border-radius: 50%;
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		font-size: 72rpx;
		/* 转换为 rpx */
		margin-bottom: 30rpx;
		/* 转换为 rpx */
		border: 6rpx solid white;
		/* 转换为 rpx */
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
		/* 转换为 rpx */
	}

	.target-name {
		font-size: 48rpx;
		/* 转换为 rpx */
		font-weight: 700;
		color: #333;
	}

	.target-title {
		font-size: 32rpx;
		/* 转换为 rpx */
		color: #666;
		margin-top: 10rpx;
		/* 转换为 rpx */
	}

	.description {
		font-size: 32rpx;
		/* 转换为 rpx */
		color: #555;
		margin: 40rpx 0;
		/* 转换为 rpx */
		line-height: 1.7;
		padding: 0 20rpx;
		/* 转换为 rpx */
	}

	.highlight {
		color: #FF6A00;
		font-weight: bold;
	}

	.cost-section {
		background: #fff8f3;
		border-radius: 30rpx;
		/* 转换为 rpx */
		padding: 40rpx;
		/* 转换为 rpx */
		margin: 50rpx 0;
		/* 转换为 rpx */
		border: 2rpx solid #ffe8d9;
		/* 转换为 rpx */
	}

	.cost-title {
		font-size: 36rpx;
		/* 转换为 rpx */
		font-weight: 600;
		color: #FF6A00;
		margin-bottom: 40rpx;
		/* 转换为 rpx */
		text-align: center;
	}

	.cost-options {
		display: flex;
		justify-content: center;
		/* 确保单个选项也能居中 */
		gap: 40rpx;
		/* 转换为 rpx */
		margin-bottom: 20rpx;
		/* 转换为 rpx */
	}

	.cost-option {
		/* 移除 flex: 1; 因为现在只有一个选项，flex:1 会使其占据所有空间 */
		max-width: 300rpx;
		/* 转换为 rpx */
		min-width: 280rpx;
		/* 确保有最小宽度，避免内容过少时太窄 */
		border: 4rpx solid #e0e0e0;
		/* 转换为 rpx */
		border-radius: 30rpx;
		/* 转换为 rpx */
		padding: 30rpx;
		/* 转换为 rpx */
		text-align: center;
		transition: all 0.3s;
		position: relative;
		background: white;
	}

	.cost-option.selected {
		border-color: #FF6A00;
		background: #fff8f3;
		box-shadow: 0 10rpx 30rpx rgba(255, 106, 0, 0.15);
		/* 转换为 rpx */
	}

	.cost-option.selected::after {
		content: '✓';
		position: absolute;
		top: -20rpx;
		/* 转换为 rpx */
		right: -20rpx;
		/* 转换为 rpx */
		width: 50rpx;
		/* 转换为 rpx */
		height: 50rpx;
		/* 转换为 rpx */
		background: #FF6A00;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 32rpx;
		/* 转换为 rpx */
	}

	.currency-icon {
		font-size: 56rpx;
		/* 转换为 rpx */
		color: #FF8C00;
		margin-bottom: 20rpx;
		/* 转换为 rpx */
	}

	.cost-amount {
		font-size: 40rpx;
		/* 转换为 rpx */
		font-weight: 700;
		color: #333;
		margin-bottom: 10rpx;
		/* 转换为 rpx */
	}

	.cost-label {
		font-size: 28rpx;
		/* 转换为 rpx */
		color: #777;
	}

	/* 1. 资费提示条主容器 */
	.price-policy-hint {
		margin: 20rpx 0;
		background-color: #FFF9F5;
		padding: 16rpx 24rpx;
		border-radius: 12rpx;
		display: flex;
		flex-direction: row;
		/* 显式声明布局方向 */
		align-items: center;
		gap: 10rpx;
	}

	/* 2. 资费提示条内的文字 - 修复嵌套报错 */
	.price-policy-hint text {
		font-size: 24rpx;
		color: #FF6A00;
		font-weight: 500;
	}

	/* 3. 强制调整余额区域间距 */
	.user-balance-adjust {
		margin-top: 20rpx !important;
	}

	.user-balance {
		display: flex;
		justify-content: center;
		/* 单个项目时也能居中 */
		gap: 60rpx;
		/* 转换为 rpx */
		margin: 40rpx 0;
		/* 转换为 rpx */
		padding: 30rpx;
		/* 转换为 rpx */
		background: #f8f9fa;
		border-radius: 24rpx;
		/* 转换为 rpx */
		font-size: 30rpx;
		/* 转换为 rpx */
	}

	.balance-item {
		text-align: center;
	}

	.balance-value {
		font-weight: 700;
		font-size: 36rpx;
		/* 转换为 rpx */
		color: #FF6A00;
		margin-top: 10rpx;
		/* 转换为 rpx */
	}

	.insufficient-value {
		color: #e53935;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		/* 转换为 rpx */
		margin-top: 40rpx;
		/* 转换为 rpx */
	}

	.btn {
		padding: 32rpx;
		/* 转换为 rpx */
		border-radius: 24rpx;
		/* 转换为 rpx */
		font-size: 34rpx;
		/* 转换为 rpx */
		font-weight: 600;
		transition: all 0.3s;
		text-align: center;
		border: none;
		-webkit-appearance: none;
		background-color: transparent;
		line-height: 1;
	}

	.btn::after {
		border: none;
	}

	.btn-primary {
		background: linear-gradient(135deg, #FF6A00, #FF8C00);
		color: white;
		box-shadow: 0 10rpx 30rpx rgba(255, 106, 0, 0.3);
		/* 转换为 rpx */
	}

	.btn-primary:active {
		background: linear-gradient(135deg, #e05a00, #e07a00);
		transform: translateY(-4rpx);
		/* 转换为 rpx */
		box-shadow: 0 14rpx 36rpx rgba(255, 106, 0, 0.4);
		/* 转换为 rpx */
	}

	.btn-secondary {
		background: #f0f0f0;
		color: #666;
	}

	.btn-secondary:active {
		background: #e0e0e0;
	}

	.insufficient {
		color: #e53935;
		font-size: 28rpx;
		/* 转换为 rpx */
		margin-top: 20rpx;
		/* 转换为 rpx */
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		/* 转换为 rpx */
	}

	.success-message {
		background: #4caf50;
		color: white;
		padding: 30rpx;
		/* 转换为 rpx */
		border-radius: 24rpx;
		/* 转换为 rpx */
		margin-top: 40rpx;
		/* 转换为 rpx */
		text-align: center;
		animation: fadeIn 0.5s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		/* 转换为 rpx */
		font-size: 32rpx;
		/* 转换为 rpx */
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		/* 转换为 rpx */
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 新增的格式化申请好友语卡片样式 */
	.friend-request-card {
		background: white;
		border-radius: 40rpx;
		margin-top: 50rpx;
		/* 与上一个卡片保持间距 */
		padding: 50rpx;
		box-shadow: 0 15rpx 50rpx rgba(0, 0, 0, 0.08);
		border: 2rpx solid #f0f0f0;
		position: relative;
		overflow: hidden;
	}

	.friend-request-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 8rpx;
		background: linear-gradient(to right, #007bff, #0056b3);
		/* 蓝色渐变 */
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;
	}

	.friend-request-title {
		font-size: 42rpx;
		font-weight: 700;
		color: #333;
		margin-bottom: 20rpx;
		/* 调整标题下方间距 */
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.friend-request-title i {
		margin-right: 20rpx;
		font-size: 48rpx;
		color: #007bff;
		/* 图标颜色 */
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.friend-request-desc {
		font-size: 28rpx;
		color: #777;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.message-box {
		background: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* 文本和按钮居中 */
		gap: 20rpx;
		/* 文本和按钮间距 */
	}

	.formatted-message {
		width: 100%;
		font-size: 30rpx;
		color: #555;
		line-height: 1.6;
		text-align: left;
		/* 文本左对齐 */
		word-break: break-all;
		/* 确保长文本换行 */
	}

	.copy-btn {
		background: #007bff;
		color: black;
		border: none;
		border-radius: 24rpx;
		padding: 20rpx 40rpx;
		font-size: 30rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(0, 123, 255, 0.3);
		transition: background 0.3s;
		width: auto;
		/* 按钮宽度自适应内容 */
		/* uni-app 按钮默认样式重置 */
		-webkit-appearance: none;
		background-color: transparent;
		line-height: 1;
		display: flex;
		/* 让图标和文字在按钮内水平居中 */
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		/* 图标和文字间距 */
	}

	.copy-btn::after {
		border: none;
	}

	.copy-btn:active {
		background: #0056b3;
		transform: translateY(-2rpx);
		box-shadow: 0 10rpx 24rpx rgba(0, 123, 255, 0.4);
	}

	.copy-btn i {
		font-size: 32rpx;
	}


	/* 提示卡片 */
	.info-card {
		background: white;
		border-radius: 40rpx;
		padding: 50rpx;
		margin-top: 50rpx;
		box-shadow: 0 15rpx 50rpx rgba(0, 0, 0, 0.08);
		border: 2rpx solid #f0f0f0;
		position: relative;
		overflow: hidden;
	}

	.info-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 8rpx;
		background: linear-gradient(to right, #4CAF50, #8BC34A);
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;
	}

	.info-card-title {
		font-size: 42rpx;
		font-weight: 700;
		color: #333;
		margin-bottom: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.info-card-title i {
		margin-right: 20rpx;
		font-size: 48rpx;
		color: #4CAF50;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.info-card p {
		font-size: 30rpx;
		color: #666;
		margin-bottom: 25rpx;
		line-height: 1.7;
		text-align: justify;
	}

	.info-card ul {
		padding-left: 60rpx;
		margin-top: 30rpx;
		list-style: none;
	}

	.info-card li {
		position: relative;
		font-size: 30rpx;
		color: #666;
		margin-bottom: 20rpx;
		line-height: 1.6;
		padding-left: 40rpx;
	}

	.info-card li::before {
		content: '\2022';
		font-size: 36rpx;
		color: #4CAF50;
		position: absolute;
		left: 0;
		top: 0rpx;
		line-height: 1.6;
		font-weight: bold;
	}

	/* 底部导航 (此处模板中已移除，保留样式以防需要) */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		background: white;
		display: flex;
		justify-content: space-around;
		padding: 24rpx 0;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		border-top: 2rpx solid #e0e0e0;
		box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.05);
		max-width: 750rpx;
		z-index: 100;
		border-top-left-radius: 40rpx;
		border-top-right-radius: 40rpx;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 24rpx;
		color: #888;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
		transition: all 0.3s;
	}

	.nav-item.active {
		color: #FF6A00;
		background: rgba(255, 106, 0, 0.08);
	}

	.nav-item i {
		font-size: 44rpx;
		margin-bottom: 10rpx;
	}

	.nav-item span {
		font-weight: 500;
	}


	.target-details {
		margin-top: 40rpx;
		margin-bottom: 40rpx;
		padding-top: 40rpx;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		text-align: left;
		/* 确保内容左对齐 */
	}

	.remark-item {
		/* 增加点击区域和反馈 */
		padding: 16rpx 0;
		/* 稍微加大一点垂直间距 */
		border-bottom: 1rpx dashed #eee;
		/* 可选分隔线 */
		cursor: pointer;
	}

	.remark-item:active {
		opacity: 0.7;
	}

	.remark-highlight {
		font-weight: bold;
		color: #333;
	}

	.placeholder-text {
		color: #999;
		font-style: italic;
	}

	.detail-item {
		display: flex;
		align-items: flex-start;
		/* 顶部对齐，方便简介换行 */
		font-size: 28rpx;
	}

	.detail-item .uni-icons {
		margin-right: 16rpx;
		transform: translateY(4rpx);
		/* 图标垂直微调 */
	}

	.detail-label {
		color: #888;
		width: 150rpx;
		/* 固定标签宽度，使其对齐 */
		flex-shrink: 0;
	}

	.detail-value {
		color: #333;
		flex: 1;
		word-break: break-all;
		/* 确保长文本能正确换行 */
	}

	.bio-item .detail-value {
		white-space: pre-wrap;
		/* 保持简介的换行符 */
		line-height: 1.6;
	}
</style>