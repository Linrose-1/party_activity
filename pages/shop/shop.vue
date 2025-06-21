<template>
	<view class="app">

		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="20" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索聚店名称或关键词" v-model="searchTerm"
					@input="onSearchInput" />
			</view>

			<scroll-view scroll-x class="filters-scroll">
				<view class="filters">
					<button v-for="filter in filters" :key="filter.value" class="filter-btn"
						:class="{ active: activeFilter === filter.value }" @click="selectFilter(filter.value)">
						{{ filter.name }}
					</button>
				</view>
			</scroll-view>
		</view>

		<view class="store-list" @scrolltolower="loadMoreStores">
			<!-- <view class="section-title">附近推荐</view> -->

			<StoreCard v-for="store in filteredStores" :key="store.id" :store="store" @click="goToStoreDetail(store)" />

			<view style="width: 100%;height: 100rpx;"></view>

			<view v-if="loadingMore" class="load-more">
				<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			<view v-if="!hasMore && filteredStores.length > 0" class="load-more">
				<uni-icons type="checkmarkempty" size="20" color="#999"></uni-icons>
				<text>已加载全部内容</text>
			</view>
			<view v-if="filteredStores.length === 0 && !loadingMore" class="empty-state">
				<uni-icons type="info" size="60" color="#ffd8c1"></uni-icons>
				<text>暂无相关聚店</text>
				<text>请尝试其他关键词或筛选条件</text>
			</view>
		</view>

		<view class="action-bar">
			<view class="action-btn share-btn" @click="shareStore">
				<uni-icons type="redo" size="20" color="#333"></uni-icons>
				<text>聚店推荐</text>
			</view>
			<view class="action-btn register-btn" @click="applyToList">
				<uni-icons type="plus-filled" size="20" color="#fff"></uni-icons>
				<text>申请上榜</text>
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
	import StoreCard from '../../components/StoreCard.vue';
	import request from '../../utils/request.js';


	const searchTerm = ref('');
	const activeFilter = ref('all');
	const loadingMore = ref(false);
	const hasMore = ref(true); // 模拟是否有更多数据加载
	
	onMounted(() => {
		getStoreList();
	});

	//获取聚店信息分页
	const getStoreList = async () => {
		// 调用封装的请求方法
		const result = await request('/app-api/member/store/list', {
			method: 'GET', // 请求方式
			data: {
				"pageNo": 1,
				"pageSize": 10
			}
		});

		// 如果请求成功，打印返回的数据
		console.log('login result.data:', result);

		// 如果请求失败，打印错误信息
		if (result.error) {
			console.log('请求失败:', result.error);
		}
	};

	const allStores = ref([{
			id: 1,
			name: '蓝调酒吧',
			category: 'bar',
			distance: '0.8km',
			description: '爵士乐主题酒吧，提供各类特色鸡尾酒和精酿啤酒，环境优雅，适合朋友聚会和小型派对。',
			tags: ['鸡尾酒', '爵士乐', '聚会'],
			icon: 'cocktail' // FontAwesome 图标名称
		},
		{
			id: 2,
			name: '川味小厨',
			category: 'food',
			distance: '0.3km',
			description: '地道川菜馆，主打麻辣火锅和各式川味小吃，食材新鲜，口味正宗，价格实惠。',
			tags: ['川菜', '火锅', '麻辣'],
			icon: 'utensils'
		},
		{
			id: 3,
			name: '星光KTV',
			category: 'ktv',
			distance: '1.2km',
			description: '高端KTV娱乐场所，拥有豪华包间和专业音响设备，提供丰富歌单和优质服务，适合公司团建和生日派对。',
			tags: ['豪华包间', '专业音响', '团建'],
			icon: 'microphone-alt'
		},
		{
			id: 4,
			name: '王者台球俱乐部',
			category: 'billiards',
			distance: '1.5km',
			description: '专业台球俱乐部，拥有国际标准球台，环境舒适，提供饮品和小吃，定期举办台球比赛。',
			tags: ['专业球台', '比赛', '休闲娱乐'],
			icon: 'dice'
		},
		{
			id: 5,
			name: '意大利披萨屋',
			category: 'food',
			distance: '0.9km',
			description: '正宗意式披萨餐厅，采用传统窑烤工艺，食材进口，提供多种意式美食和葡萄酒。',
			tags: ['窑烤披萨', '意式美食', '葡萄酒'],
			icon: 'pizza-slice'
		},
		{
			id: 6,
			name: '精酿啤酒屋',
			category: 'bar',
			distance: '1.7km',
			description: '自酿啤酒专门店，提供20多种手工精酿啤酒，搭配美式烧烤和小吃，工业风装修风格。',
			tags: ['手工啤酒', '美式烧烤', '工业风'],
			icon: 'beer'
		},
		{
			id: 7,
			name: '麦霸主题KTV',
			category: 'ktv',
			distance: '2.1km',
			description: '主题包厢KTV，每个包厢有不同主题装饰，最新曲库，智能点歌系统，提供自助餐服务。',
			tags: ['主题包厢', '最新曲库', '自助餐'],
			icon: 'music'
		},
	]);

	const filters = ref([{
			name: '全部',
			value: 'all'
		},
		{
			name: '咖啡',
			value: 'bar'
		},
		{
			name: '茶馆',
			value: 'food'
		},
		{
			name: '美食',
			value: 'ktv'
		},
		{
			name: '酒吧',
			value: 'billiards'
		},
		{
			name: '其他',
			value: 'other'
		},
	]);

	const filteredStores = computed(() => {
		let result = allStores.value;

		// 按类别过滤
		if (activeFilter.value !== 'all') {
			result = result.filter(store => store.category === activeFilter.value);
		}

		// 按搜索词过滤
		if (searchTerm.value.trim() !== '') {
			const lowerCaseSearchTerm = searchTerm.value.toLowerCase().trim();
			result = result.filter(store =>
				store.name.toLowerCase().includes(lowerCaseSearchTerm) ||
				store.description.toLowerCase().includes(lowerCaseSearchTerm)
			);
		}

		return result;
	});

	const onSearchInput = () => {
		// 过滤由 computed 属性 `filteredStores` 处理
	};

	const selectFilter = (filterValue) => {
		activeFilter.value = filterValue;
	};

	const loadMoreStores = () => {
		if (loadingMore.value || !hasMore.value) {
			return;
		}
		loadingMore.value = true;

		// 模拟 API 调用
		setTimeout(() => {
			// 在实际应用中，你将在此处获取更多数据并添加到 allStores.value
			// 对于此示例，我们将模拟在初始数据集之后没有更多数据。
			hasMore.value = false; // 此示例中没有更多数据可加载
			loadingMore.value = false;
		}, 1000);
	};

	const goToStoreDetail = (store) => {
		uni.navigateTo({
			url: `/pages/store/detail?id=${store.id}&name=${store.name}` // 示例导航
		});
		console.log('进入', store.name, '详情页');
	};

	const shareStore = () => {
		uni.navigateTo({
			url: '/pages/shop-recommend/shop-recommend'
		})
	};

	const applyToList = () => {
		uni.showToast({
			title: '申请上榜',
			icon: 'none'
		});
		console.log('点击申请上榜');
	};
</script>

<style lang="scss">
	/*
  Uniapp 支持 Sass/Scss。如果你喜欢纯 CSS，请删除 `lang="scss"`
  并确保你的 CSS 有效。
*/

	:root {
		--primary: #FF6B00;
		--primary-light: #FF8A33;
		--light-bg: #f8f8f8;
		--dark-text: #333;
		--gray-text: #666;
		--light-text: #999;
		--border: #eee;
		--weui-BG-0: #ededed;
		--weui-BG-1: #f7f7f7;
	}

	// page {
	//   height: 100%;
	//   overflow: hidden;
	// }

	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: var(--weui-BG-0);
		color: var(--dark-text);
		font-size: 16px;
	}

	/* 顶部标题栏 - 微信小程序风格 */
	.navbar {
		background: white;
		padding: 0 15px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #e5e5e5;
		position: relative;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.navbar-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--dark-text);
	}

	/* 搜索区域 */
	.search-container {
		background: white;
		padding: 15px;
		position: sticky;
		top: 0;
		z-index: 90;
		border-bottom: 1px solid var(--border);
		margin-bottom: 10rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		background: var(--weui-BG-1);
		border-radius: 20px;
		padding: 10px 15px;
		border: 1px solid #ffe8d9;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 15px;
		outline: none;
		color: var(--dark-text);
		margin-left: 10rpx;
		/* 适应 uni-icons */
	}

	.filters-scroll {
		white-space: nowrap;
		width: 100%;
		padding-top: 15px;
	}

	.filters {
		display: flex;
		gap: 10px;
		padding: 0 15px;
		/* 为筛选器添加内边距以便滚动 */
	}

	.filter-btn {
		background: #f1f1f1;
		color: var(--gray-text);
		border: none;
		padding: 8px 15px;
		border-radius: 16px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
		line-height: 1;
		/* 调整按钮行高 */
		margin: 0;
		/* 重置按钮默认边距 */
	}

	.filter-btn::after {
		border: none;
		/* 移除 uni-app 按钮默认边框 */
	}

	.filter-btn.active {
		background: var(--primary);
		color: #FF6B00;
		font-weight: 500;
	}

	/* 商店列表 */
	.store-list {
		flex: 1;
		padding: 0 15px;
		padding-bottom: 20px;
		/* `scroll-behavior: smooth` 不直接作为 CSS 在 uni-app 的 scroll-view 中支持。
     通常通过 JS 中的 `scroll-into-view` 或 `scroll-top` 动画来处理。 */
	}

	.section-title {
		font-size: 17px;
		font-weight: 600;
		padding: 20px 0 15px;
		color: var(--dark-text);
		position: relative;
		display: flex;
		align-items: center;
	}

	.section-title::before {
		content: "";
		display: block;
		width: 4px;
		height: 16px;
		background: var(--primary);
		border-radius: 2px;
		margin-right: 8px;
	}

	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: var(--light-text);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.empty-state .uni-icons {
		font-size: 60px;
		/* 使用 uni-icons 的 size 属性 */
		margin-bottom: 20px;
		color: #ffd8c1;
	}

	.empty-state text {
		font-size: 15px;
		margin-top: 10px;
		line-height: 1.5;
	}

	/* 加载更多 */
	.load-more {
		text-align: center;
		padding: 15px;
		color: var(--light-text);
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.load-more .uni-icons {
		margin-right: 5px;
	}

	/* 底部操作栏 */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		display: flex;
		padding: 10px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		line-height: 1;
		/* 调整按钮行高 */
	}

	.action-btn .uni-icons {
		margin-right: 5px;
	}

	.share-btn {
		background: #f0f0f0;
		color: #333;
		margin-right: 10px;
	}

	.register-btn {
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
	}
</style>