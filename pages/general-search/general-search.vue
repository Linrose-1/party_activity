<template>
	<view class="search-page">
		<!-- 1. 顶部搜索与高级筛选入口 -->
		<view class="header-section">
			<view class="search-bar">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="queryParams.keyword" placeholder="搜索姓名/行业/学校/资源..." class="main-input"
					@confirm="handleSearch" />
				<view class="search-btn" @click="handleSearch">搜索</view>
			</view>
			<view class="filter-toggle" @click="isFilterExpanded = !isFilterExpanded">
				<text>高级筛选</text>
				<uni-icons :type="isFilterExpanded ? 'arrowup' : 'arrowdown'" size="14" color="#FF8400"></uni-icons>
			</view>
		</view>

		<!-- 2. 可折叠高级筛选面板 -->
		<view class="filter-panel" :class="{ 'expanded': isFilterExpanded }">
			<view class="filter-inner">
				<uni-forms label-position="top" label-width="100">
					<view class="filter-grid">
						<uni-forms-item label="用户名/昵称">
							<uni-easyinput v-model="queryParams.nickname" placeholder="请输入" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="学校/学历">
							<uni-easyinput v-model="queryParams.school" placeholder="请输入学校" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
					</view>

					<uni-forms-item label="行业领域">
						<uni-data-picker :localdata="industryTree" v-model="queryParams.industry" placeholder="请选择行业"
							:map="{text: 'name', value: 'name'}" />
					</uni-forms-item>

					<view class="filter-grid">
						<uni-forms-item label="我有资源">
							<uni-easyinput v-model="queryParams.haveResources" placeholder="提供资源" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
						<uni-forms-item label="我需资源">
							<uni-easyinput v-model="queryParams.needResources" placeholder="需求资源" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
					</view>

					<view class="filter-grid">
						<uni-forms-item label="籍贯/家乡">
							<uni-data-picker :localdata="areaTree" v-model="queryParams.nativePlace" placeholder="请选择"
								:map="{text: 'name', value: 'id'}" />
						</uni-forms-item>
						<uni-forms-item label="商务办公地">
							<uni-data-picker :localdata="areaTree" v-model="queryParams.locationAddress"
								placeholder="请选择" :map="{text: 'name', value: 'id'}" />
						</uni-forms-item>
					</view>

					<view class="filter-grid">
						<uni-forms-item label="出生年代">
							<uni-data-select v-model="queryParams.era" :localdata="eraOptions" placeholder="选择年代" />
						</uni-forms-item>
						<uni-forms-item label="兴趣爱好">
							<uni-easyinput v-model="queryParams.hobby" placeholder="如：登山/高尔夫" :inputBorder="false"
								class="custom-input" />
						</uni-forms-item>
					</view>
				</uni-forms>

				<view class="filter-actions">
					<view class="reset-btn" @click="resetFilters">重置条件</view>
					<view class="confirm-btn" @click="handleSearch">确认筛选</view>
				</view>
			</view>
		</view>

		<!-- 3. 搜索结果列表区域 -->
		<scroll-view scroll-y class="result-scroll">
			<view class="result-container">

				<!-- 空状态 -->
				<view class="empty-box" v-if="list.length === 0 && loadStatus !== 'loading'">
					<image src="/static/images/empty.png" mode="aspectFit" class="empty-img" />
					<text>未搜到匹配的精英商友，尝试调整条件</text>
				</view>

				<block v-else>
					<!-- 总数统计 -->
					<view class="total-stats" v-if="totalCount > 0">
						<text>为您找到 {{ totalCount }} 位商友</text>
					</view>

					<!-- 3.1 免费查看区 (前10位) -->
					<view class="user-card" v-for="(user, index) in freeList" :key="user.id" @click="goToDetail(user)">
						<view class="card-main">
							<image :src="user.avatar || '/static/images/default-avatar.png'" class="avatar"
								mode="aspectFill" />
							<view class="info-content">
								<view class="name-row">
									<text class="name">{{ user.nickname }}</text>
									<view class="verify-badge" v-if="user.idCert === 1">
										<uni-icons type="auth-filled" size="12" color="#FF8400"></uni-icons>
										<text>实名</text>
									</view>
								</view>
								<view class="major-title">{{ user.displayTitle }}</view>
							</view>
						</view>

						<view class="card-body">
							<view class="info-item">
								<text class="label">公司</text>
								<text class="val">{{ user.displayCompany }}</text>
							</view>
							<view class="info-item">
								<text class="label">教育</text>
								<text class="val">{{ user.displaySchool }}</text>
							</view>
						</view>

						<view class="card-footer">
							<text class="location-text">{{ user.locationAddressStr || '全国' }}</text>
							<view class="action-btn">查看资料</view>
						</view>
					</view>

					<!-- 3.2 付费解锁区 -->
					<block v-if="totalCount > 10">
						<view class="locked-divider">
							<text>以下为更多搜索结果</text>
						</view>

						<!-- 已解锁的付费商友 -->
						<view class="user-card" v-for="(user, index) in paidList" :key="user.id"
							@click="goToDetail(user)">
							<view class="card-main">
								<image :src="user.avatar" class="avatar" mode="aspectFill" />
								<view class="info-content">
									<view class="name-row">
										<text class="name">{{ user.nickname }}</text>
										<view class="verify-badge" v-if="user.idCert === 1"><text>实名</text></view>
									</view>
									<view class="major-title">{{ user.displayTitle }}</view>
								</view>
							</view>
							<view class="card-footer">
								<text class="location-text">{{ user.locationAddressStr }}</text>
								<view class="action-btn">查看资料</view>
							</view>
						</view>

						<!-- 付费购买卡片 -->
						<view class="unlock-purchase-card" v-if="list.length < totalCount">
							<text class="card-tip" v-if="paidList.length > 0">已成功解锁 {{ paidList.length }} 位</text>
							<text class="card-tip" v-else>前10位免费额度已用完</text>

							<view class="tier-selector">
								<view class="tier-item" v-for="tier in unlockTiers" :key="tier.id"
									:class="{ active: selectedTier.id === tier.id }" @click="selectedTier = tier">
									<text class="t-count">{{ tier.count }}人</text>
									<text class="t-cost">{{ tier.price }} 智米</text>
								</view>
							</view>

							<view class="pay-btn" @click="handleUnlock">
								立即解锁后续精英
							</view>
						</view>
					</block>
				</block>

				<uni-load-more :status="loadStatus" v-if="list.length > 0" />
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import {
		checkLoginGuard
	} from '@/utils/user.js';

	// --- 状态定义 ---
	const list = ref([]);
	const totalCount = ref(0);
	const loadStatus = ref('more');
	const isFilterExpanded = ref(false);
	const hasUnlocked = ref(false);

	const areaTree = ref([]);
	const industryTree = ref([]);

	const queryParams = reactive({
		keyword: '',
		nickname: '',
		school: '',
		industry: '',
		haveResources: '',
		needResources: '',
		nativePlace: '',
		locationAddress: '',
		era: '',
		hobby: ''
	});

	const eraOptions = [{
			value: '50/60',
			text: '50/60'
		}, {
			value: '70/80',
			text: '70/80'
		},
		{
			value: '90/00',
			text: '90/00'
		}, {
			value: '不问年代',
			text: '不问年代'
		}
	];

	const unlockTiers = [{
			id: 1,
			count: 1,
			price: 1
		},
		{
			id: 2,
			count: 6,
			price: 5
		},
		{
			id: 3,
			count: 15,
			price: 10
		}
	];
	const selectedTier = ref(unlockTiers[1]);

	const freeList = computed(() => list.value.slice(0, 10));
	const paidList = computed(() => list.value.slice(10));

	// --- 初始化 ---
	onLoad((options) => {
		if (options.keyword) queryParams.keyword = decodeURIComponent(options.keyword);
		initBaseData();
		handleSearch();
	});

	const initBaseData = async () => {
		const [areaRes, indRes] = await Promise.all([
			request('/app-api/system/area/tree'),
			request('/app-api/member/national-industry/tree', {
				method: 'POST'
			})
		]);
		if (!areaRes.error) areaTree.value = areaRes.data;
		if (!indRes.error) industryTree.value = indRes.data;
	};

	// --- 逻辑处理 ---
	const handleSearch = async () => {
		const hasValue = Object.values(queryParams).some(v => v && String(v).trim() !== '');
		if (!hasValue) return uni.showToast({
			title: '请输入关键词',
			icon: 'none'
		});

		list.value = [];
		hasUnlocked.value = false;
		isFilterExpanded.value = false;
		await fetchUsers();
	};

	const fetchUsers = async () => {
		loadStatus.value = 'loading';
		// 逻辑：如果没解锁过，只查前10条；如果解锁了，查询后续对应的数量
		const requestData = {
			...queryParams,
			pageNo: hasUnlocked.value ? 2 : 1,
			pageSize: hasUnlocked.value ? selectedTier.value.count : 10
		};

		const {
			data,
			error
		} = await request('/app-api/member/user/general-search-process', {
			method: 'POST',
			data: requestData
		});

		if (!error && data) {
			const getFirstItem = (val) => {
				if (!val) return '';
				if (Array.isArray(val) && val.length > 0) return val[0];
				if (typeof val === 'string' && val.includes(',')) return val.split(',')[0].trim();
				return val;
			};

			const mapped = (data.list || []).map(u => ({
				...u,
				displayTitle: getFirstItem(u.positionTitle) || getFirstItem(u.professionalTitle) ||
					'精英人士',
				displayCompany: getFirstItem(u.companyName) || '暂未设置公司',
				displaySchool: getFirstItem(u.school) || '暂未设置学校'
			}));

			list.value = hasUnlocked.value ? [...list.value, ...mapped] : mapped;
			totalCount.value = data.total || 0;
			loadStatus.value = list.value.length >= totalCount.value ? 'noMore' : 'more';
		} else {
			loadStatus.value = 'noMore';
		}
	};

	const handleUnlock = async () => {
		const canProceed = await checkLoginGuard();
		if (!canProceed) return;

		uni.showModal({
			title: '解锁商友',
			content: `将消耗 ${selectedTier.value.price} 智米解锁后续 ${selectedTier.value.count} 位商友，是否继续？`,
			confirmColor: '#FF8400',
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({
						title: '处理中...'
					});
					const {
						error
					} = await request(
						`/app-api/member/user/add-normal-search-count?viewCount=${selectedTier.value.count}`, {
							method: 'POST'
						});
					uni.hideLoading();
					if (!error) {
						uni.showToast({
							title: '解锁成功',
							icon: 'success'
						});
						hasUnlocked.value = true;
						fetchUsers(); // 刷新获取解锁后的数据
					}
				}
			}
		});
	};

	const resetFilters = () => {
		Object.keys(queryParams).forEach(key => queryParams[key] = '');
	};

	const goToDetail = (user) => {
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`
		});
	};
</script>

<style lang="scss" scoped>
	.search-page {
		background: #F7F8FA;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header-section {
		background: #FFF;
		padding: 20rpx 30rpx;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.search-bar {
			background: #F2F3F5;
			height: 84rpx;
			border-radius: 42rpx;
			display: flex;
			align-items: center;
			padding: 0 30rpx;

			.main-input {
				flex: 1;
				margin: 0 20rpx;
				font-size: 28rpx;
			}

			.search-btn {
				color: #FF8400;
				font-weight: bold;
				font-size: 28rpx;
				padding-left: 20rpx;
				border-left: 1px solid #DDD;
			}
		}

		.filter-toggle {
			text-align: center;
			padding-top: 16rpx;
			color: #FF8400;
			font-size: 24rpx;
			display: flex;
			justify-content: center;
			gap: 8rpx;
			font-weight: 500;
		}
	}

	.filter-panel {
		background: #FFF;
		max-height: 0;
		overflow: hidden;
		transition: all 0.3s;

		&.expanded {
			/* 展开时的最大高度要足够大 */
			max-height: 1400rpx;
			/* 关键修复：展开完成后允许内容溢出，这样下拉框才能正常显示 */
			overflow: visible;
			border-bottom: 1rpx solid #EEE;
			padding-bottom: 100rpx; // 增加底部内边距，给下拉框留出物理空间
		}

		.filter-inner {
			padding: 20rpx 40rpx;
			overflow: visible;

			.filter-grid {
				display: flex;
				gap: 30rpx;
				overflow: visible;

				::v-deep .uni-forms-item {
					flex: 1;
				}
			}

			.custom-input {
				background: #F9F9F9;
				border-radius: 12rpx;
				padding: 0 20rpx;
			}
		}

		.filter-actions {
			display: flex;
			gap: 20rpx;
			padding: 0 40rpx;

			.reset-btn {
				flex: 1;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background: #F5F5F5;
				border-radius: 40rpx;
				color: #666;
				font-size: 28rpx;
			}

			.confirm-btn {
				flex: 2;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background: #FF8400;
				border-radius: 40rpx;
				color: #FFF;
				font-weight: bold;
				font-size: 28rpx;
			}
		}
	}

	.result-container {
		padding: 30rpx;
	}

	.total-stats {
		text-align: center;
		padding: 10rpx 0 30rpx;
		font-size: 24rpx;
		color: #999;
	}

	/* 商友精英名片 */
	.user-card {
		background: #FFF;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

		.card-main {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;

			.avatar {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				background: #EEE;
			}

			.info-content {
				flex: 1;
				margin-left: 24rpx;

				.name-row {
					display: flex;
					align-items: center;
					margin-bottom: 8rpx;

					.name {
						font-size: 32rpx;
						font-weight: bold;
						color: #222;
					}

					.verify-badge {
						margin-left: 12rpx;
						background: #FFF7E6;
						border-radius: 4rpx;
						padding: 0 8rpx;
						display: flex;
						align-items: center;
						gap: 4rpx;

						text {
							color: #FF8400;
							font-size: 18rpx;
							font-weight: bold;
						}
					}
				}

				.major-title {
					font-size: 24rpx;
					color: #666;
				}
			}
		}

		.card-body {
			background: #F9FAFB;
			border-radius: 16rpx;
			padding: 20rpx 24rpx;
			margin-bottom: 24rpx;

			.info-item {
				display: flex;
				font-size: 24rpx;
				margin-bottom: 12rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.label {
					color: #999;
					width: 80rpx;
					flex-shrink: 0;
				}

				.val {
					color: #444;
					flex: 1;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					font-weight: 500;
				}
			}
		}

		.card-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid #F3F4F6;
			padding-top: 24rpx;

			.location-text {
				font-size: 22rpx;
				color: #999;
			}

			.action-btn {
				background: #1A1A1A;
				color: #FFF;
				font-size: 24rpx;
				padding: 14rpx 36rpx;
				border-radius: 40rpx;
				font-weight: 600;
			}
		}
	}

	/* 解锁区域样式 */
	.unlock-purchase-card {
		background: linear-gradient(135deg, #2D2D2D, #000);
		border-radius: 32rpx;
		padding: 44rpx 32rpx;
		text-align: center;
		margin: 40rpx 0;

		.card-tip {
			font-size: 26rpx;
			color: #FFBD70;
			margin-bottom: 34rpx;
			display: block;
		}

		.tier-selector {
			display: flex;
			gap: 20rpx;
			margin-bottom: 34rpx;

			.tier-item {
				flex: 1;
				background: rgba(255, 255, 255, 0.08);
				padding: 24rpx 0;
				border-radius: 20rpx;
				display: flex;
				flex-direction: column;
				border: 1px solid transparent;
				transition: all 0.2s;

				&.active {
					border-color: #FF8400;
					background: rgba(255, 132, 0, 0.15);
				}

				.t-count {
					font-size: 32rpx;
					font-weight: bold;
					color: #FFF;
				}

				.t-cost {
					font-size: 20rpx;
					color: rgba(255, 255, 255, 0.5);
					margin-top: 4rpx;
				}
			}
		}

		.pay-btn {
			background: linear-gradient(90deg, #FFBD70, #FF8400);
			color: #FFF;
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 44rpx;
			font-weight: bold;
			font-size: 28rpx;
			box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.3);
		}
	}

	.locked-divider {
		text-align: center;
		margin: 50rpx 0 30rpx;
		position: relative;

		&::before {
			content: "";
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 1px;
			background: #E5E7EB;
			z-index: 1;
		}

		text {
			position: relative;
			z-index: 2;
			background: #F7F8FA;
			padding: 0 24rpx;
			font-size: 22rpx;
			color: #999;
		}
	}

	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 150rpx;

		.empty-img {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 30rpx;
			opacity: 0.6;
		}

		text {
			font-size: 26rpx;
			color: #999;
		}
	}
</style>