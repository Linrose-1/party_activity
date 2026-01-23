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

					<!-- 右上角编辑操作 -->
					<view class="edit-corner" @click.stop="goToEdit(item.id)">
						<uni-icons type="compose" size="14" color="#999"></uni-icons>
						<text>编辑</text>
					</view>

					<view class="card-body" @click="goDetail(item.id)">
						<!-- 左侧 Logo (点击可跳转) -->
						<view class="logo-box">
							<image v-if="item.logoUrl" :src="item.logoUrl" mode="aspectFill" class="logo-img" />
							<view v-else class="logo-placeholder">
								<text class="default-icon">{{ getDefaultIcon(item.enterpriseType) }}</text>
							</view>
						</view>

						<!-- 中间主要信息 -->
						<view class="info-area">
							<view class="name-row">
								<text class="ent-name">{{ truncateName(item.enterpriseName) }}</text>
							</view>

							<!-- 状态标签组 -->
							<view class="tag-row">
								<view class="status-tag" :class="'status-' + item.status">
									{{ getStatusConfig(item.status).label }}
								</view>
							</view>

							<view class="detail-info">
								<text>ID：{{ item.enterpriseId || '系统分配中...' }}</text>
								<text>创建：{{ formatDate(item.createTime) }}</text>
							</view>
						</view>
					</view>

					<!-- 草稿状态下的橙色温情提示 -->
					<view class="draft-notice" v-if="item.status === 0" @click="goToEdit(item.id)">
						<uni-icons type="info-filled" size="14" color="#FF7919"></uni-icons>
						<text>资料未发布，点击“编辑”完善信息后即可展示</text>
					</view>

					<!-- 底部操作按钮行 -->
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

				<!-- 加载反馈 -->
				<uni-load-more :status="loadStatus" color="#999" />
			</template>

			<!-- 3. 空状态展示 -->
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
		ref,
		onMounted
	} from 'vue';
	import {
		onPullDownRefresh,
		onReachBottom
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';

	// --- 数据定义 ---
	const list = ref([]); // 企业列表数据
	const total = ref(0); // 总条数
	const pageNo = ref(1); // 当前页码
	const pageSize = 10; // 每页数量
	const loadStatus = ref('more'); // 分页状态: more | loading | noMore

	/**
	 * 生命周期：页面挂载
	 */
	onMounted(() => {
		fetchEnterpriseList(true);
	});

	/**
	 * 下拉刷新触发
	 */
	onPullDownRefresh(() => {
		fetchEnterpriseList(true);
	});

	/**
	 * 上拉触底触发（分页加载）
	 */
	onReachBottom(() => {
		if (loadStatus.value === 'noMore' || loadStatus.value === 'loading') return;
		pageNo.value++;
		fetchEnterpriseList(false);
	});

	/**
	 * 核心方法：获取企业分页列表
	 * @param {Boolean} isRefresh - 是否为重置刷新
	 */
	const fetchEnterpriseList = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			loadStatus.value = 'loading';
		}

		const {
			data,
			error
		} = await request('/app-api/member/user-enterprise-info/page', {
			method: 'GET',
			data: {
				pageNo: pageNo.value,
				pageSize: pageSize,
				userId: uni.getStorageSync('userId')
			}
		});

		if (isRefresh) uni.stopPullDownRefresh();

		if (error) {
			loadStatus.value = 'more';
			uni.showToast({
				title: error,
				icon: 'none'
			});
			return;
		}

		const newList = data.list || [];
		list.value = isRefresh ? newList : [...list.value, ...newList];
		total.value = data.total;
		loadStatus.value = list.value.length >= data.total ? 'noMore' : 'more';
	};

	/**
	 * 状态映射转换
	 * @param {Number} status - 后端返回的状态码
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
			label: '未知状态',
			class: ''
		};
	};

	/**
	 * 获取行业默认图标
	 * @param {String} type - 企业类型字符串
	 */
	const getDefaultIcon = (type) => {
		if (type?.includes('餐饮')) return '🏭';
		if (type?.includes('科技')) return '🏢';
		return '🏪';
	};

	/**
	 * 格式化时间显示
	 * @param {Number} ts - 时间戳
	 */
	const formatDate = (ts) => {
		if (!ts) return '-';
		const d = new Date(ts);
		return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
	};

	/**
	 * 企业名称截断处理
	 */
	const truncateName = (name) => {
		if (!name) return '';
		return name.length > 12 ? name.substring(0, 12) + '...' : name;
	};

	// --- 路由跳转方法 ---

	/**
	 * 跳转至创建/编辑页
	 */
	const goToEdit = (id = '') => {
		uni.navigateTo({
			url: `/packages/enterprise-edit/enterprise-edit?id=${id}`
		});
	};

	/**
	 * 跳转至企业详情页
	 */
	const goDetail = (id) => {
		uni.navigateTo({
			url: `/packages/enterprise-detail/enterprise-detail?id=${id}`
		});
	};

	/**
	 * 跳转至名片展示页
	 */
	const goCard = (id) => {
		uni.navigateTo({
			url: `/pages/enterprise/card?id=${id}` // 路径请按实际项目调整
		});
	};

	/**
	 * 处理认证逻辑
	 */
	const handleGoAuth = (item) => {
		if (item.status === 3) {
			return uni.showToast({
				title: '该企业已通过认证',
				icon: 'success'
			});
		}
		uni.showToast({
			title: '认证模块正在对接中...',
			icon: 'none'
		});
	};

	/**
	 * 删除企业（带二次确认逻辑）
	 * @param {Object} item - 企业对象数据
	 */
	const handleDelete = (item) => {
		uni.showModal({
			title: '确定要删除吗？',
			content: `删除后"${item.enterpriseName}"的主页及名片将立即失效，且数据不可找回。`,
			confirmText: '确认删除',
			confirmColor: '#FF4D4F',
			cancelText: '我再想想',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '正在处理...',
						mask: true
					});
					// 对接后端删除接口
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
						fetchEnterpriseList(true); // 刷新列表数据
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
</script>

<style scoped lang="scss">
	$theme-color: #FF7919;

	.container {
		min-height: 100vh;
		background-color: #F8F9FB;
		padding: 30rpx;
	}

	/* 顶部区域 */
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

	/* 企业卡片 */
	.enterprise-card {
		background-color: #fff;
		border-radius: 30rpx;
		padding: 40rpx 30rpx 30rpx;
		margin-bottom: 30rpx;
		position: relative;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);

		/* 右上角编辑 */
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

	/* 状态标签 */
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

	/* 草稿提示 */
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

	/* 底部操作 */
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

	/* 空状态 */
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
			/* 黑色按钮更显高级感 */
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