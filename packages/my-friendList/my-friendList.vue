<template>
	<view class="friend-list-page">
		<!-- 1. 顶部圈主信息卡片 -->
		<view class="owner-header" :style="{ background: themeColor }">
			<view class="owner-content">
				<image :src="ownerInfo.avatar || defaultAvatar" mode="aspectFill" class="owner-avatar" />
				<view class="owner-info">
					<text class="owner-name">{{ ownerInfo.name || '商友' }} 的商圈</text>
					<text class="owner-desc">连接全球精英商友 · 发现无限可能</text>
				</view>
			</view>
			<!-- 统计信息 -->
			<view class="owner-stats">
				<view class="stat-item">
					<text class="num">{{ total }}</text>
					<text class="label">圈友总数</text>
				</view>
				<view class="stat-line"></view>
				<view class="stat-item">
					<text class="num">{{ ownerInfo.topUpLevelName || '精英商友' }}</text>
					<text class="label">圈主等级</text>
				</view>
			</view>
		</view>

		<!-- 2. 搜索过滤区 -->
		<view class="search-sticky">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="searchKey" placeholder="搜索圈友姓名或手机号" confirm-type="search"
					@confirm="handleSearch" />
				<text class="search-btn" @click="handleSearch">搜索</text>
			</view>
		</view>

		<!-- 3. 圈友列表区 -->
		<view class="list-container">
			<template v-if="friendList.length > 0">
				<view class="friend-card" v-for="item in friendList" :key="item.id" @click="handleUserClick(item)">
					<image :src="item.avatar || defaultAvatar" mode="aspectFill" class="f-avatar"
						@click.stop="handleUserClick(item)" />

					<view class="f-body">
						<view class="f-top">
							<text class="f-name">{{ item.realName || item.nickname }}</text>
							<!-- 关系标签：智能显示同乡、同行、同学等 -->
							<view class="relation-tags">
								<text class="r-tag town" v-if="item.fellowTownspeopleFlag === 1">同乡</text>
								<text class="r-tag peer" v-if="item.peerFlag === 1">同行</text>
								<text class="r-tag school" v-if="item.classmateFlag === 1">同学</text>
							</view>
						</view>

						<view class="f-desc text-ellipsis">
							{{ item.positionTitle || '精英商友' }} | {{ item.companyName || '暂无公司信息' }}
						</view>

						<view class="f-footer">
							<uni-icons type="location-filled" size="12" color="#bbb"></uni-icons>
							<text class="f-loc">{{ item.locationAddressStr || '暂未设置位置' }}</text>
						</view>
					</view>

					<uni-icons type="right" size="16" color="#eee"></uni-icons>
				</view>

				<!-- 分页加载状态 -->
				<uni-load-more :status="loadingStatus"></uni-load-more>
			</template>

			<!-- 空状态 -->
			<view class="empty-state" v-else-if="loadingStatus !== 'loading'">
				<image src="/static/icon/empty-contacts.png" mode="aspectFit" class="empty-img" />
				<text>暂无相关圈友信息</text>
			</view>
		</view>

		<!-- 操作菜单弹窗 (复用组件) -->
		<AvatarLongPressMenu ref="menuRef" @action="handleMenuAction" />
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import AvatarLongPressMenu from '@/components/AvatarLongPressMenu.vue';

	// --- 变量定义 ---
	const themeColor = '#FF6A00';
	const defaultAvatar = 'https://img.gofor.club/mmexport1759211962539.jpg';

	const ownerInfo = reactive({
		id: null,
		name: '',
		avatar: '',
		topUpLevelName: ''
	});
	const friendList = ref([]);
	const total = ref(0);
	const pageNo = ref(1);
	const pageSize = 15;
	const searchKey = ref('');
	const loadingStatus = ref('more');
	const menuRef = ref(null);

	/**
	 * 页面加载：获取圈主信息
	 */
	onLoad((options) => {
		console.log("options", options)
		if (options.userId) {
			ownerInfo.id = options.userId;
			ownerInfo.name = decodeURIComponent(options.userName || '');
			ownerInfo.avatar = decodeURIComponent(options.avatar || '');

			uni.setNavigationBarTitle({
				title: `${ownerInfo.name}的圈友`
			});
			fetchFriendList(true);
		}
	});

	// 下拉刷新
	onPullDownRefresh(() => fetchFriendList(true));

	// 上拉加载
	onReachBottom(() => {
		if (loadingStatus.value === 'noMore' || loadingStatus.value === 'loading') return;
		pageNo.value++;
		fetchFriendList(false);
	});

	/**
	 * [接口方法] 获取指定用户的圈友列表
	 */
	const fetchFriendList = async (isRefresh = false) => {
		if (isRefresh) {
			pageNo.value = 1;
			loadingStatus.value = 'loading';
		}

		const {
			data,
			error
		} = await request('/app-api/member/user/friend/my-friend-list', {
			method: 'GET',
			data: {
				userId: ownerInfo.id,
				searchKey: searchKey.value,
				pageNo: pageNo.value,
				pageSize: pageSize,
				status: 1 // 只查正式好友位
			}
		});

		if (isRefresh) uni.stopPullDownRefresh();

		if (error) {
			loadingStatus.value = 'more';
			return;
		}

		const list = data.list || [];
		friendList.value = isRefresh ? list : [...friendList.value, ...list];
		total.value = data.total || 0;
		loadingStatus.value = friendList.value.length >= data.total ? 'noMore' : 'more';
	};

	/**
	 * [方法] 处理搜索
	 */
	const handleSearch = () => fetchFriendList(true);

	/**
	 * [方法] 点击圈友头像/卡片
	 */
	const handleUserClick = (user) => {
		// 组装菜单组件需要的格式
		const menuUser = {
			id: user.id,
			name: user.realName || user.nickname,
			avatar: user.avatar,
			managerId: user.id // 用于判断是否本人
		};
		menuRef.value.open(menuUser);
	};

	/**
	 * [回调] 处理菜单操作
	 */
	const handleMenuAction = ({
		type,
		user
	}) => {
		if (type === 'viewCard') {
			uni.navigateTo({
				url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}` +
					`&name=${encodeURIComponent(user.name)}` +
					`&avatar=${encodeURIComponent(user.avatar)}` +
					`&friendOwnerUserId=${ownerInfo.id}`
			});
		} else if (type === 'viewPath') {
			uni.navigateTo({
				url: `/packages/relationship-path/relationship-path?targetUserId=${user.id}&name=${encodeURIComponent(user.name)}`
			});
		}
	};
</script>

<style scoped lang="scss">
	.friend-list-page {
		background-color: #F8F9FB;
		min-height: 100vh;
	}

	/* 顶部圈主卡片 */
	.owner-header {
		padding: 60rpx 40rpx;
		border-radius: 0 0 50rpx 50rpx;
		color: #fff;
		box-shadow: 0 10rpx 30rpx rgba(255, 106, 0, 0.2);

		.owner-content {
			display: flex;
			align-items: center;
			gap: 30rpx;
			margin-bottom: 40rpx;

			.owner-avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 4rpx solid rgba(255, 255, 255, 0.6);
			}

			.owner-name {
				font-size: 36rpx;
				font-weight: bold;
				display: block;
			}

			.owner-desc {
				font-size: 24rpx;
				opacity: 0.8;
				margin-top: 6rpx;
			}
		}

		.owner-stats {
			display: flex;
			align-items: center;
			background: rgba(255, 255, 255, 0.1);
			padding: 20rpx;
			border-radius: 20rpx;

			.stat-item {
				flex: 1;
				text-align: center;

				.num {
					font-size: 32rpx;
					font-weight: bold;
					display: block;
				}

				.label {
					font-size: 20rpx;
					opacity: 0.7;
				}
			}

			.stat-line {
				width: 2rpx;
				height: 40rpx;
				background: rgba(255, 255, 255, 0.2);
			}
		}
	}

	/* 搜索框 */
	.search-sticky {
		position: sticky;
		top: 0;
		z-index: 10;
		padding: 30rpx;
		background: #F8F9FB;

		.search-box {
			background: #fff;
			border-radius: 40rpx;
			padding: 0 30rpx;
			height: 80rpx;
			display: flex;
			align-items: center;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

			input {
				flex: 1;
				margin: 0 20rpx;
				font-size: 28rpx;
			}

			.search-btn {
				font-size: 28rpx;
				color: #FF6A00;
				font-weight: bold;
			}
		}
	}

	/* 圈友卡片 */
	.list-container {
		padding: 0 30rpx 40rpx;
	}

	.friend-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

		.f-avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			background: #f0f0f0;
		}

		.f-body {
			flex: 1;
			min-width: 0;

			.f-top {
				display: flex;
				align-items: center;
				gap: 12rpx;
				margin-bottom: 8rpx;

				.f-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
			}

			.f-desc {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 8rpx;
			}

			.f-footer {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.f-loc {
					font-size: 22rpx;
					color: #bbb;
				}
			}
		}
	}

	/* 关系标签 */
	.relation-tags {
		display: flex;
		gap: 8rpx;

		.r-tag {
			font-size: 18rpx;
			padding: 2rpx 10rpx;
			border-radius: 6rpx;

			&.town {
				background: #E6F7FF;
				color: #1890FF;
			}

			&.peer {
				background: #F6FFED;
				color: #52C41A;
			}

			&.school {
				background: #FFF7E6;
				color: #FA8C16;
			}
		}
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
		color: #999;

		.empty-img {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 20rpx;
		}
	}
</style>