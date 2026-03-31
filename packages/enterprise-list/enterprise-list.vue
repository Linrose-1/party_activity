<template>
	<view class="container">
		<!-- 1. 顶部操作区域 -->
		<view class="header-section">
			<view class="page-title">我的企业</view>
			<button class="create-btn" @click="goToEdit('')">
				<uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
				<text>创建新企业</text>
			</button>
		</view>

		<!-- 2. 内容列表区 -->
		<view class="content-wrapper">
			<view class="list-count" v-if="total > 0">
				您已创建 {{ total }} 家企业/品牌
			</view>

			<!-- 列表展示 -->
			<template v-if="list.length > 0">
				<view class="enterprise-card" v-for="item in list" :key="item.id">

					<!-- 右上角悬浮编辑操作 -->
					<view class="edit-corner" @click.stop="goToEdit(item.id)">
						<uni-icons type="compose" size="14" color="#999"></uni-icons>
						<text>编辑</text>
					</view>

					<view class="card-body" @click="goDetail(item.id)">
						<!-- 左侧 Logo 区域 -->
						<view class="logo-box">
							<image v-if="item.logoUrl" :src="item.logoUrl" mode="aspectFill" class="logo-img" />
							<view v-else class="logo-placeholder">
								<text class="default-icon">{{ getDefaultIcon(item.enterpriseType) }}</text>
							</view>
						</view>

						<!-- 中间核心信息区域 -->
						<view class="info-area">
							<view class="name-row">
								<text class="ent-name">{{ truncateName(item.enterpriseName) }}</text>
							</view>

							<!-- 动态状态标签 -->
							<view class="tag-row">
								<view class="status-tag" :class="'status-' + item.status">
									{{ getStatusConfig(item.status).label }}
								</view>
							</view>

							<view class="detail-info">
								<!-- <text>ID：{{ item.enterpriseId || '系统分配中...' }}</text> -->
								<text>创建：{{ formatDate(item.createTime) }}</text>
							</view>
						</view>
					</view>

					<!-- 草稿提示：引导用户发布 -->
					<view class="draft-notice" v-if="item.status === 0" @click="goToEdit(item.id)">
						<uni-icons type="info-filled" size="14" color="#FF7919"></uni-icons>
						<text>资料未发布，点击“编辑”完善信息后即可展示</text>
					</view>

					<!-- 认证失败原因提示：展示 statusDesc 并引导重新认证 -->
					<view class="fail-notice" v-if="item.status === 4" @click="handleGoAuth(item)">
						<view class="fail-header">
							<uni-icons type="clear" size="14" color="#F44336"></uni-icons>
							<text class="fail-t">认证失败原因：</text>
						</view>
						<text class="fail-reason">{{ item.statusDesc || '资料不符合规范，请重新上传' }}</text>
						<view class="re-submit">
							<text>重新提交材料</text>
							<uni-icons type="right" size="12" color="#F44336"></uni-icons>
						</view>
					</view>

					<!-- 底部快捷操作行 -->
					<view class="card-footer">
						<view class="action-btn" @click="goDetail(item.id)">
							<uni-icons type="info" size="16" color="#666"></uni-icons>
							<text>详情</text>
						</view>
						<view class="action-btn" @click="goCard(item.id)">
							<uni-icons type="contact" size="16" color="#666"></uni-icons>
							<text>名片</text>
						</view>
						<view class="action-btn" @click="handleGoAuth(item)">
							<uni-icons type="auth" size="16" color="#666"></uni-icons>
							<text>认证</text>
						</view>
						<view class="action-btn delete" @click="handleDelete(item)">
							<uni-icons type="trash" size="16" color="#FF4D4F"></uni-icons>
							<text>删除</text>
						</view>
					</view>
				</view>

				<!-- 分页加载组件 -->
				<uni-load-more :status="loadStatus" color="#999" />
			</template>

			<!-- 3. 列表空状态展示 -->
			<view class="empty-state" v-else-if="loadStatus !== 'loading'">
				<view class="empty-icon-wrap">
					<text class="emoji">🏢</text>
				</view>
				<view class="empty-title">开启您的商业版图</view>
				<view class="empty-desc">创建企业展示品牌实力，让更多商友发现合作机会</view>
				<button class="now-create-btn" @click="goToEdit('')">立即创建</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom,
		onShow,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		getInviteCode
	} from '@/utils/user.js';

	// --- 状态数据定义 ---
	const list = ref([]); // 存储企业列表
	const total = ref(0); // 存储总条数
	const pageNo = ref(1); // 分页页码
	const pageSize = 10; // 单页条数
	const loadStatus = ref('more'); // 分页状态：more(可加载) | loading | noMore

	/**
	 * [生命周期] 每次进入页面时执行
	 * 作用：实现无感刷新，确保数据实时性
	 */
	onShow(() => {
		// 执行无感重置刷新 (第二个参数传 false 表示不展示全屏 Loading)
		fetchEnterpriseList(true, false);
	});

	/**
	 * [生命周期] 下拉刷新
	 * 作用：手动下拉时触发完整重载
	 */
	onPullDownRefresh(() => {
		fetchEnterpriseList(true, true);
	});

	/**
	 * [生命周期] 上拉触底
	 * 作用：加载下一页数据
	 */
	onReachBottom(() => {
		if (loadStatus.value === 'noMore' || loadStatus.value === 'loading') return;
		pageNo.value++;
		fetchEnterpriseList(false, false);
	});

	/**
	 * [方法] 获取企业分页列表接口
	 * @param {Boolean} isRefresh - 是否清空旧数据从第一页开始请求
	 * @param {Boolean} showFullLoading - 是否需要展示全屏/顶部 Loading
	 */
	const fetchEnterpriseList = async (isRefresh = false, showFullLoading = true) => {
		if (isRefresh) {
			pageNo.value = 1;
			// 仅在明确需要展示加载态时修改 loadStatus
			if (showFullLoading) loadStatus.value = 'loading';
		}

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user-enterprise-info/page', {
				method: 'GET',
				data: {
					pageNo: pageNo.value,
					pageSize: pageSize,
					userId: uni.getStorageSync('userId') // 绑定当前登录人
				}
			});

			if (isRefresh) uni.stopPullDownRefresh(); // 停止下拉动画

			if (error) {
				loadStatus.value = 'more';
				return;
			}

			const newList = data.list || [];
			// 如果是刷新模式，直接替换数组，否则追加到末尾
			list.value = isRefresh ? newList : [...list.value, ...newList];
			total.value = data.total;

			// 更新分页状态：对比当前已加载数量和总数
			loadStatus.value = list.value.length >= data.total ? 'noMore' : 'more';
		} catch (e) {
			loadStatus.value = 'more';
			console.error('获取列表异常:', e);
		}
	};

	/**
	 * [方法] 根据状态码转换显示配置
	 * @param {Number} status 
	 */
	const getStatusConfig = (status) => {
		const configs = {
			0: {
				label: '📝 草稿',
				class: 'status-0'
			},
			1: {
				label: '✅ 已发布',
				class: 'status-1'
			},
			2: {
				label: '⏳ 审核中',
				class: 'status-2'
			},
			3: {
				label: '⭐ 已认证',
				class: 'status-3'
			},
			4: {
				label: '🔒 认证失败',
				class: 'status-4'
			}
		};
		return configs[status] || {
			label: '未知',
			class: ''
		};
	};

	/**
	 * [方法] 获取缺省图标
	 * @param {String} type 
	 */
	const getDefaultIcon = (type) => {
		if (type?.includes('餐饮')) return '🏭';
		if (type?.includes('科技')) return '🏢';
		return '🏪';
	};

	/**
	 * [方法] 格式化创建日期
	 */
	const formatDate = (ts) => {
		if (!ts) return '-';
		const d = new Date(ts);
		return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
	};

	/**
	 * [方法] 处理过长的企业名称
	 */
	const truncateName = (name) => {
		if (!name) return '';
		return name.length > 12 ? name.substring(0, 12) + '...' : name;
	};

	/**
	 * [跳转] 跳转到编辑/创建页
	 * @param {String} id - 为空代表创建，不为空代表编辑
	 */
	const goToEdit = (id = '') => {
		uni.navigateTo({
			url: `/packages/enterprise-edit/enterprise-edit?id=${id}`
		});
	};

	/**
	 * [跳转] 跳转至详情预览
	 */
	const goDetail = (id) => {
		uni.navigateTo({
			url: `/packages/enterprise-detail/enterprise-detail?id=${id}`
		});
	};

	/**
	 * [跳转] 跳转至名片展示
	 */
	const goCard = (id) => {
		uni.navigateTo({
			url: `/packages/enterprise-card/enterprise-card?id=${id}`
		});
	};

	/**
	 * [方法] 处理认证按钮点击
	 * 逻辑：仅发布后的企业可认证，状态4可重新认证
	 */
	const handleGoAuth = (item) => {
		if (item.status === 3) {
			return uni.showToast({
				title: '该企业已通过认证',
				icon: 'success'
			});
		}
		if (item.status === 2) {
			return uni.showToast({
				title: '认证审核中，请耐心等待',
				icon: 'none'
			});
		}
		if (item.status === 0) {
			return uni.showModal({
				title: '提示',
				content: '当前为草稿，请先完成信息发布',
				confirmText: '去编辑',
				success: (res) => {
					if (res.confirm) goToEdit(item.id);
				}
			});
		}
		// 跳转认证
		uni.navigateTo({
			url: `/packages/enterprise-auth/enterprise-auth?enterpriseId=${item.id}&enterpriseName=${encodeURIComponent(item.enterpriseName)}`
		});
	};

	/**
	 * [方法] 删除企业数据
	 * 逻辑：二次确认 -> 调用拼接ID的DELETE请求 -> 成功刷新
	 */
	const handleDelete = (item) => {
		uni.showModal({
			title: '确定要删除吗？',
			content: `删除后"${item.enterpriseName}"的主页及名片将立即失效。`,
			confirmText: '确认删除',
			confirmColor: '#FF4D4F',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '处理中...',
						mask: true
					});
					const {
						error
					} = await request(`/app-api/member/user-enterprise-info/delete?id=${item.id}`, {
						method: 'DELETE'
					});
					uni.hideLoading();
					if (!error) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						fetchEnterpriseList(true, false); // 刷新列表
					} else {
						uni.showToast({
							title: error,
							icon: 'none'
						});
					}
				}
			}
		});
	};

	// ==========================================================
	// --- 分享功能实现 ---
	// ==========================================================

	/**
	 * 1. 分享给好友
	 */
	onShareAppMessage(() => {
		const inviteCode = getInviteCode();
		// 路径需根据 pages.json 中的实际路径配置
		let sharePath = '/packages/enterprise-list/enterprise-list';

		if (inviteCode) {
			sharePath += `?inviteCode=${inviteCode}`;
		}

		console.log('🚀 [企业列表] 发起分享，路径:', sharePath);

		return {
			title: '开启您的商业版图，创建企业展示品牌实力！🏢',
			path: sharePath,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	/**
	 * 2. 分享到朋友圈
	 */
	onShareTimeline(() => {
		const inviteCode = getInviteCode();
		let queryString = '';

		if (inviteCode) {
			queryString = `inviteCode=${inviteCode}`;
		}

		return {
			title: '猩聚社：创建企业名片，让更多商友发现合作机会',
			query: queryString,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};
	});

	// ==========================================================
</script>

<style scoped lang="scss">
	$theme-color: #FF7919;

	.container {
		min-height: 100vh;
		background-color: #F8F9FB;
		padding: 30rpx;
	}

	/* 顶部标题与创建按钮 */
	.header-section {
		margin-bottom: 40rpx;

		.page-title {
			font-size: 38rpx;
			font-weight: 800;
			color: #333;
			margin-bottom: 30rpx;
		}

		.create-btn {
			background: linear-gradient(135deg, $theme-color, #FF9546);
			color: #fff;
			height: 94rpx;
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			box-shadow: 0 8rpx 20rpx rgba($theme-color, 0.2);

			&:active {
				transform: scale(0.98);
				opacity: 0.9;
			}

			text {
				margin-left: 10rpx;
				font-size: 30rpx;
			}
		}
	}

	.list-count {
		font-size: 24rpx;
		color: #bbb;
		margin-bottom: 20rpx;
		padding-left: 10rpx;
	}

	/* 企业卡片样式 */
	.enterprise-card {
		background-color: #fff;
		border-radius: 30rpx;
		padding: 40rpx 30rpx 30rpx;
		margin-bottom: 30rpx;
		position: relative;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);

		.edit-corner {
			position: absolute;
			top: 30rpx;
			right: 30rpx;
			display: flex;
			align-items: center;
			padding: 10rpx 20rpx;
			background-color: #f8f8f8;
			border-radius: 30rpx;

			text {
				font-size: 22rpx;
				color: #999;
				margin-left: 4rpx;
			}

			&:active {
				background-color: #eee;
			}
		}

		.card-body {
			display: flex;
			align-items: center;
			margin-bottom: 30rpx;
		}

		.logo-box {
			width: 120rpx;
			height: 120rpx;
			margin-right: 30rpx;
			flex-shrink: 0;

			.logo-img {
				width: 100%;
				height: 100%;
				border-radius: 30rpx;
				background-color: #f5f5f5;
				box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			}

			.logo-placeholder {
				width: 100%;
				height: 100%;
				border-radius: 30rpx;
				background-color: #f9f9f9;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1rpx solid #eee;

				.default-icon {
					font-size: 50rpx;
				}
			}
		}

		.info-area {
			flex: 1;
			min-width: 0;

			.ent-name {
				font-size: 34rpx;
				font-weight: bold;
				color: #333;
				display: block;
			}
		}
	}

	/* 状态标签样式 */
	.status-tag {
		display: inline-block;
		font-size: 20rpx;
		padding: 4rpx 16rpx;
		border-radius: 8rpx;
		margin-top: 12rpx;

		&.status-0 {
			background: #F5F5F5;
			color: #999;
		}

		&.status-1 {
			background: #EFFFF4;
			color: #4CAF50;
			border: 1rpx solid #D5F5E3;
		}

		&.status-2 {
			background: #EBF5FF;
			color: #2196F3;
			border: 1rpx solid #D6E9FF;
		}

		&.status-3 {
			background: #FFF9E6;
			color: #FFB300;
			border: 1rpx solid #FFECB3;
		}

		&.status-4 {
			background: #FFF2F2;
			color: #F44336;
			border: 1rpx solid #FFDADA;
		}
	}

	.detail-info {
		margin-top: 20rpx;

		text {
			font-size: 22rpx;
			color: #bbb;
			margin-right: 20rpx;
		}
	}

	/* 草稿提示栏 */
	.draft-notice {
		background-color: #FFF9F5;
		padding: 20rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		border: 1rpx dashed rgba($theme-color, 0.3);

		text {
			font-size: 22rpx;
			color: $theme-color;
			margin-left: 10rpx;
			font-weight: 500;
		}
	}

	/* 失败原因提示栏 */
	.fail-notice {
		background-color: #FFF2F2;
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
		border: 1rpx solid rgba(244, 67, 54, 0.2);
		position: relative;

		.fail-header {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;

			.fail-t {
				font-size: 24rpx;
				font-weight: bold;
				color: #F44336;
				margin-left: 10rpx;
			}
		}

		.fail-reason {
			font-size: 24rpx;
			color: #666;
			line-height: 1.5;
			display: block;
			padding-left: 44rpx;
			margin-bottom: 16rpx;
		}

		.re-submit {
			display: flex;
			align-items: center;
			justify-content: flex-end;

			text {
				font-size: 22rpx;
				color: #F44336;
				font-weight: bold;
				margin-right: 4rpx;
			}
		}

		&:active {
			background-color: #FFE5E5;
		}
	}

	/* 底部操作行 */
	.card-footer {
		border-top: 2rpx solid #F8F8F8;
		padding-top: 24rpx;
		display: flex;
		justify-content: space-around;

		.action-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			flex: 1;
			height: 40rpx;

			text {
				font-size: 26rpx;
				color: #666;
			}

			&:not(:last-child) {
				border-right: 2rpx solid #F5F5F5;
			}

			&.delete text {
				color: #FF4D4F;
			}

			&:active {
				opacity: 0.5;
			}
		}
	}

	/* 空状态样式 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;

		.empty-icon-wrap {
			width: 160rpx;
			height: 160rpx;
			background-color: #fff;
			border-radius: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
			margin-bottom: 40rpx;

			.emoji {
				font-size: 80rpx;
			}
		}

		.empty-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 16rpx;
		}

		.empty-desc {
			font-size: 26rpx;
			color: #999;
			text-align: center;
			padding: 0 100rpx;
			line-height: 1.6;
		}

		.now-create-btn {
			margin-top: 60rpx;
			background-color: #333;
			color: #fff;
			width: 340rpx;
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 44rpx;
			font-size: 28rpx;
			font-weight: bold;
			box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
		}
	}
</style>