<template>
	<view class="match-container">
		<!-- 1. 顶部 Tab 切换 -->
		<view class="tabs-box">
			<view class="tab-item" :class="{ active: matchType === 0 }" @click="handleTabChange(0)">
				<text>我需资源·匹配</text>
				<view class="line"></view>
			</view>
			<view class="tab-item" :class="{ active: matchType === 1 }" @click="handleTabChange(1)">
				<text>我有资源·匹配</text>
				<view class="line"></view>
			</view>
		</view>

		<view class="search-section">
			<!-- 2. 标签输入区 -->
			<view class="input-card">
				<view class="input-desc">
					<uni-icons type="info-filled" size="14" color="#999"></uni-icons>
					<text>{{ matchType === 0 ? '输入您需要的关键词，匹配他人的资源' : '输入您的核心能力，匹配他人的需求' }}</text>
				</view>

				<view class="tag-input-wrapper">
					<input v-model="tagInput" class="main-input" placeholder="输入关键词(如:AI、融资、园区)" confirm-type="add"
						@confirm="addTag" />
					<view class="add-btn" @click="addTag">添加</view>
				</view>

				<!-- 已添加标签展示 -->
				<view class="tags-wall" v-if="tagsList.length > 0">
					<view class="tag-badge" v-for="(tag, index) in tagsList" :key="index">
						<text>{{ tag }}</text>
						<uni-icons type="closeempty" size="12" color="#FF7D00" @click="removeTag(index)"></uni-icons>
					</view>
					<text class="tag-count">{{ tagsList.length }}/10</text>
				</view>
			</view>

			<!-- 3. 匹配按钮 -->
			<button class="match-trigger-btn" @click="handleSearch(true)">
				<uni-icons type="search" size="18" color="#fff"></uni-icons>
				<text>开启资源匹配</text>
			</button>
		</view>

		<!-- 4. 匹配结果列表 -->
		<view class="result-list">
			<view class="result-header" v-if="userList.length > 0">
				<text>匹配结果 ({{ total }})</text>
				<text class="sort-tip">按匹配度优先排序</text>
			</view>

			<template v-if="userList.length > 0">
				<view class="user-card" v-for="user in userList" :key="user.id" @click="goCard(user)">
					<image :src="user.avatar" mode="aspectFill" class="u-avatar"
						@click.stop="handleAvatarClick(user)" />

					<view class="u-info">
						<view class="u-top">
							<text class="u-name">{{ user.realName || user.nickname }}</text>
							<!-- 匹配度标识 -->
							<view class="match-tag" v-if="user.matchTagCount">
								<uni-icons type="fire-filled" size="12" color="#FF7D00"></uni-icons>
								<text>匹配 {{ user.matchTagCount }} 项</text>
							</view>
						</view>

						<view class="u-company text-ellipsis">
							{{ user.positionTitle || '核心高伙' }} | {{ user.companyName || '暂无公司信息' }}
						</view>

						<view class="resource-preview">
							<text class="label">{{ matchType === 0 ? 'TA拥有：' : 'TA需求：' }}</text>
							<text class="val">{{ matchType === 0 ? user.haveResources : user.needResources }}</text>
						</view>
					</view>
					<uni-icons type="right" size="16" color="#eee"></uni-icons>
				</view>

				<uni-load-more :status="loadingStatus"></uni-load-more>
			</template>

			<!-- 空状态 -->
			<view class="empty-state" v-else-if="!isInitial">
				<image src="/static/icon/empty-match.png" mode="aspectFit" class="empty-img" />
				<text>输入标签并点击匹配，精准对接商友资源</text>
			</view>
		</view>

		<!-- 头像点击菜单 (复用组件) -->
		<AvatarLongPressMenu ref="menuRef" @action="handleMenuAction" />
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';

	// --- 状态变量 ---
	const matchType = ref(0); // 0: 我需, 1: 我有
	const tagInput = ref(''); // 输入框内容
	const tagsList = ref([]); // 标签数组 (最多10个)
	const userList = ref([]); // 匹配到的用户列表
	const total = ref(0); // 总人数
	const pageNo = ref(1); // 页码
	const loadingStatus = ref('more');
	const isInitial = ref(true); // 是否是初始未搜索状态
	const menuRef = ref(null);

	/**
	 * [方法] 添加标签
	 */
	const addTag = () => {
		const val = tagInput.value.trim();
		if (!val) return;
		if (tagsList.value.length >= 10) {
			return uni.showToast({
				title: '最多添加10个标签',
				icon: 'none'
			});
		}
		if (tagsList.value.includes(val)) {
			return uni.showToast({
				title: '标签已存在',
				icon: 'none'
			});
		}
		tagsList.value.push(val);
		tagInput.value = '';
	};

	/**
	 * [方法] 移除标签
	 */
	const removeTag = (index) => {
		tagsList.value.splice(index, 1);
	};

	/**
	 * [方法] 切换 Tab
	 */
	const handleTabChange = (type) => {
		if (matchType.value === type) return;
		matchType.value = type;
		// 如果已经有标签，自动触发一次搜索
		if (tagsList.value.length > 0) {
			handleSearch(true);
		}
	};

	/**
	 * [方法] 执行资源匹配搜索
	 * @param {Boolean} isRefresh 是否为全新搜索
	 */
	const handleSearch = async (isRefresh = false) => {
		if (tagsList.value.length === 0) {
			return uni.showToast({
				title: '请至少添加一个匹配标签',
				icon: 'none'
			});
		}

		if (isRefresh) {
			pageNo.value = 1;
			userList.value = [];
			isInitial.value = false;
		}

		loadingStatus.value = 'loading';

		try {
			const {
				data,
				error
			} = await request('/app-api/member/user/resource-match', {
				method: 'POST',
				data: {
					pageNo: pageNo.value,
					pageSize: 15,
					tags: tagsList.value,
					matchType: matchType.value
				}
			});

			if (error) {
				loadingStatus.value = 'more';
				return;
			}

			const list = data.list || [];
			userList.value = isRefresh ? list : [...userList.value, ...list];
			total.value = data.total || 0;
			loadingStatus.value = userList.value.length >= total.value ? 'noMore' : 'more';
			pageNo.value++;

		} catch (e) {
			loadingStatus.value = 'more';
		}
	};

	// --- 下拉/分页 ---
	onPullDownRefresh(() => {
		if (tagsList.value.length > 0) handleSearch(true);
		uni.stopPullDownRefresh();
	});

	onReachBottom(() => {
		if (loadingStatus.value === 'more') handleSearch(false);
	});

	// --- 交互与跳转 ---
	const handleAvatarClick = (user) => {
		menuRef.value.open({
			id: user.id,
			name: user.realName || user.nickname,
			avatar: user.avatar,
			managerId: user.id
		});
	};

	const goCard = (user) => {
		uni.navigateTo({
			url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.realName || user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`
		});
	};

	const handleMenuAction = ({
		type,
		user
	}) => {
		if (type === 'viewCard') goCard(user);
		// 处理其他菜单动作...
	};
</script>

<style scoped lang="scss">
	$theme: #FF7D00;

	.match-container {
		background-color: #F8F9FB;
		min-height: 100vh;
	}

	/* Tabs 样式 */
	.tabs-box {
		display: flex;
		background: #fff;
		height: 100rpx;
		position: sticky;
		top: 0;
		z-index: 10;

		.tab-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			color: #666;
			transition: 0.3s;

			.line {
				width: 40rpx;
				height: 6rpx;
				background: transparent;
				border-radius: 3rpx;
				margin-top: 8rpx;
			}

			&.active {
				color: $theme;
				font-weight: bold;

				.line {
					background: $theme;
				}
			}
		}
	}

	.search-section {
		padding: 30rpx;
	}

	/* 输入卡片 */
	.input-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);

		.input-desc {
			display: flex;
			align-items: center;
			gap: 10rpx;
			margin-bottom: 24rpx;

			text {
				font-size: 22rpx;
				color: #999;
			}
		}
	}

	.tag-input-wrapper {
		display: flex;
		background: #F5F7FA;
		border-radius: 50rpx;
		padding: 10rpx 10rpx 10rpx 30rpx;
		align-items: center;

		.main-input {
			flex: 1;
			font-size: 28rpx;
			height: 60rpx;
		}

		.add-btn {
			background: $theme;
			color: #fff;
			font-size: 24rpx;
			font-weight: bold;
			padding: 12rpx 30rpx;
			border-radius: 40rpx;
		}
	}

	.tags-wall {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 30rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #F0F0F0;

		.tag-badge {
			background: #FFF5EE;
			border: 1rpx solid rgba($theme, 0.2);
			padding: 8rpx 20rpx;
			border-radius: 30rpx;
			display: flex;
			align-items: center;
			gap: 10rpx;

			text {
				font-size: 24rpx;
				color: $theme;
				font-weight: 500;
			}
		}

		.tag-count {
			font-size: 20rpx;
			color: #ccc;
			align-self: flex-end;
		}
	}

	/* 匹配按钮 */
	.match-trigger-btn {
		margin-top: 40rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #FF9D4D, $theme);
		color: #fff;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		font-weight: bold;
		box-shadow: 0 10rpx 24rpx rgba(255, 125, 0, 0.2);

		&::after {
			border: none;
		}
	}

	/* 列表样式 */
	.result-list {
		padding: 0 30rpx 60rpx;
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 10rpx;

		text {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}

		.sort-tip {
			font-size: 22rpx;
			color: #999;
			font-weight: normal;
		}
	}

	.user-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		/* 增加内边距 */
		margin-bottom: 24rpx;
		display: flex;
		align-items: flex-start;
		/* 关键：顶部对齐，防止头像随内容变长而居中 */
		gap: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);


		.u-avatar {
			width: 110rpx;
			height: 110rpx;
			border-radius: 50%;
			background: #f0f0f0;
		}

		.u-info {
			flex: 1;
			min-width: 0;

			.u-top {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 8rpx;

				.u-name {
					font-size: 32rpx;
					font-weight: bold;
				}
			}

			.u-company {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 12rpx;
			}

			.resource-preview {
				font-size: 24rpx;
				/* 稍微调大一点点，更易读 */
				background: #F9FAFB;
				padding: 20rpx;
				/* 增加内边距 */
				border-radius: 12rpx;
				margin-top: 10rpx;
				line-height: 1.6;
				/* 增加行高，防止文字挤在一起 */

				/* 核心逻辑：允许换行 */
				white-space: pre-wrap;
				/* 保留后端传来的换行符并自动换行 */
				word-break: break-all;
				/* 防止长字母/数字串撑破布局 */

				.label {
					color: #999;
					font-weight: bold;
					margin-bottom: 6rpx;
					display: block;
					/* 让标签独占一行或者紧贴内容，根据喜好调整 */
				}

				.val {
					color: #444;
					/* 深一点的灰色，方便阅读 */
				}
			}
		}
	}

	.match-tag {
		display: flex;
		align-items: center;
		gap: 4rpx;
		background: #FFF5EE;
		color: $theme;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		font-weight: bold;
	}

	.text-ellipsis {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 100rpx;
		color: #bbb;
		font-size: 24rpx;

		.empty-img {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 20rpx;
			opacity: 0.6;
		}
	}
</style>