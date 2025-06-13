<template>
    <view class="my-favorites-app">
        
        <!-- 分段器 -->
        <view class="segmented-container">
            <uni-segmented-control 
                :current="currentTab" 
                :values="tabs" 
                @clickItem="switchTab"
                style-type="button"
                active-color="#FF6B00"
            />
        </view>
        
        <!-- 收藏的活动 -->
        <view 
            v-show="currentTab === 0" 
            scroll-y 
            class="content-scroll"
            refresher-enabled
            :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh"
        >
            <view class="section-header">
                <text class="section-title">⭐ 收藏的活动</text>
            </view>
            
            <view v-if="favoriteActivities.length > 0" class="activity-list">
                <view 
                    v-for="item in favoriteActivities" 
                    :key="item.id"
                    class="activity-item"
                    @click="skipActivityDetail(item.id)"
                >
                    <image class="activity-image" :src="item.image" mode="aspectFill" />
                    
                    <view class="activity-content">
                        <view class="activity-header">
                            <text class="activity-title">{{ item.title }}</text>
                        </view>
                        
                        <view class="activity-info">
                            <uni-icons type="calendar" size="16" color="#999" />
                            <text class="info-text">{{ item.date }}</text>
                        </view>
                        
                        <view class="activity-info">
                            <uni-icons type="map-pin" size="16" color="#999" />
                            <text class="info-text">{{ item.location }}</text>
                        </view>
                        
                        <view class="activity-footer">
                            <view class="organizer">
                                <uni-icons type="person" size="16" color="#999" />
                                <text>{{ item.organizer }}</text>
                            </view>
                            <view class="action-buttons">
                                <button class="btn btn-cancel" @click.stop="removeFavoriteActivity(item.id)">
                                    取消收藏
                                </button>
                                <button class="btn btn-detail" @click.stop="skipActivityDetail(item.id)">
                                    查看详情
                                </button>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            
            <empty-state 
                v-else 
                title="暂无收藏活动" 
                description="快去发现并收藏感兴趣的活动吧"
            >
                <button class="primary-btn" @click="navigateToDiscoverActivities">去发现活动</button>
            </empty-state>
        </view>
        
        <!-- 收藏的商机 -->
        <view 
            v-show="currentTab === 1" 
            scroll-y 
            class="content-scroll"
            refresher-enabled
            :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh"
        >
            <view class="section-header">
                <text class="section-title">💡 收藏的商机</text>
            </view>
            
            <view v-if="favoriteOpportunities.length > 0" class="post-list">
                <div 
                    v-for="post in favoriteOpportunities" 
                    :key="post.id" 
                    class="post-card"
                    @click="skipCommercialDetail(post.id)"
                >
                    <div class="post-header">
                        <div class="user-info">
                            <div class="avatar" @click.stop="skipApplicationBusinessCard">{{ post.user.charAt(0) }}</div>
                            <div class="user-details-wrapper">
                                <div class="user-name">{{ post.user }}</div>
                                <div class="post-time">
                                    <uni-icons type="redo" size="14" color="#888"></uni-icons> {{ post.time }}
                                </div>
                            </div>
                        </div>
                        <div class="delete-action" @click.stop="removeFavoriteOpportunity(post.id)">
                            <uni-icons type="trash-fill" size="20" color="#FF6A00"></uni-icons>
                            <text>取消收藏</text>
                        </div>
                    </div>
                    
                    <div class="post-content">
                        {{ post.content }}
                    </div>

                    <div class="post-images" v-if="post.images && post.images.length">
                        <div 
                            v-for="(image, imgIndex) in post.images" 
                            :key="imgIndex" 
                            class="image-wrapper"
                        >
                            <img :src="image" alt="商机图片" class="post-image" @click.stop="previewImage(post.images, imgIndex)" />
                        </div>
                    </div>

                    <div class="tags">
                        <div 
                            v-for="(tag, tagIndex) in post.tags" 
                            :key="tagIndex" 
                            class="tag"
                        >
                            {{ tag }}
                        </div>
                    </div>
                    
                    <!-- 赞踩统计 (简化版，仅展示数量) -->
                    <div class="feedback-stats">
                        <div class="like-count">
                            <uni-icons type="hand-up-filled" size="18" color="#e74c3c"></uni-icons>
                            <span>{{ post.likes }}</span>
                        </div>
                        <div class="dislike-count">
                            <uni-icons type="hand-down-filled" size="18" color="#3498db"></uni-icons>
                            <span>{{ post.dislikes }}</span>
                        </div>
                    </div>
                </div>
            </view>
            
            <empty-state 
                v-else 
                title="暂无收藏商机" 
                description="快去发现并收藏感兴趣的商机吧"
            >
                <button class="primary-btn" @click="navigateToDiscoverOpportunities">去发现商机</button>
            </empty-state>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 状态
const currentTab = ref(0);
const tabs = ref(['收藏的活动', '收藏的商机']);
const refreshing = ref(false);

// 模拟收藏的活动数据
const favoriteActivities = reactive([
    {
        id: 1,
        title: '周末户外登山活动 - 挑战青龙山',
        image: 'https://via.placeholder.com/300/FF6B00/FFFFFF?text=登山活动',
        date: '2023年11月25日 08:00-17:00',
        location: '青龙山国家森林公园',
        participants: { current: 28, total: 50 },
        organizer: '户外探险俱乐部',
        tags: ['户外', '运动']
    },
    {
        id: 2,
        title: '科技创新交流沙龙',
        image: 'https://via.placeholder.com/300/4CAF50/FFFFFF?text=科技沙龙',
        date: '2023年12月10日 14:00-17:00',
        location: '市科技馆报告厅',
        participants: { current: 80, total: 100 },
        organizer: '创新科技协会',
        tags: ['科技', '交流', '创新']
    }
]);

// 模拟收藏的商机数据
const favoriteOpportunities = reactive([
    {
        id: 101,
        user: '李总',
        time: '2025-06-16 10:00:00',
        content: '我司寻求智能家居项目合作，主要方向为AIoT设备连接与数据分析平台。欢迎有相关经验的团队联系，可提供技术方案或产品。',
        images: [
            'https://via.placeholder.com/150/FF6A00/FFFFFF?text=智能家居1',
            'https://via.placeholder.com/150/FF6A00/FFFFFF?text=智能家居2'
        ],
        tags: ['#智能家居', '#AIoT', '#项目合作'],
        likes: 15,
        dislikes: 0,
        userAction: null,
        saved: true
    },
    {
        id: 102,
        user: '王经理',
        time: '2025-06-15 14:30:00',
        content: '本人有一批高质量二手办公家具转让，适合创业公司或小型办公室，价格优惠，可上门看货。',
        images: [
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具1',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具2',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具3'
        ],
        tags: ['#二手转让', '#办公用品', '#创业福利'],
        likes: 8,
        dislikes: 1,
        userAction: null,
        saved: true
    }
]);

// 方法
const goBack = () => {
    uni.navigateBack({
        delta: 1
    });
};

const switchTab = (e) => {
    currentTab.value = e.currentIndex;
    // 切换Tab时可以重新加载数据或刷新状态
    refreshing.value = false; // 重置刷新状态
};

const onRefresh = () => {
    refreshing.value = true;
    setTimeout(() => {
        // 模拟数据加载，实际应用中这里会调用API
        console.log('数据刷新完成');
        refreshing.value = false;
        uni.showToast({
            title: '刷新成功',
            icon: 'success'
        });
    }, 1000);
};

// 活动相关方法
const skipActivityDetail = (id) => {
    uni.navigateTo({
        url: `/pages/active-detail/active-detail?id=${id}` // 假设活动详情页路由
    });
};

const removeFavoriteActivity = (id) => {
    uni.showModal({
        title: '取消收藏',
        content: '确定要取消收藏此活动吗？',
        success: (res) => {
            if (res.confirm) {
                const index = favoriteActivities.findIndex(activity => activity.id === id);
                if (index !== -1) {
                    favoriteActivities.splice(index, 1);
                    uni.showToast({
                        title: '已取消收藏',
                        icon: 'success'
                    });
                }
            }
        }
    });
};

const navigateToDiscoverActivities = () => {
    uni.switchTab({
        url: '/pages/activity/index' // 假设活动发现页的tabbar路径
    });
};

// 商机相关方法
const skipCommercialDetail = (id) => {
    uni.navigateTo({
        url: `/pages/home-commercialDetail/home-commercialDetail?id=${id}` // 假设商机详情页路由
    });
};

const removeFavoriteOpportunity = (id) => {
    uni.showModal({
        title: '取消收藏',
        content: '确定要取消收藏此商机吗？',
        success: (res) => {
            if (res.confirm) {
                const index = favoriteOpportunities.findIndex(post => post.id === id);
                if (index !== -1) {
                    favoriteOpportunities.splice(index, 1);
                    uni.showToast({
                        title: '已取消收藏',
                        icon: 'success'
                    });
                }
            }
        }
    });
};

const navigateToDiscoverOpportunities = () => {
    uni.switchTab({
        url: '/pages/home/index' // 假设商机发现页的tabbar路径
    });
};

const skipApplicationBusinessCard = () => {
    uni.navigateTo({
        url: '/pages/applicationBusinessCard/applicationBusinessCard'
    });
};

const previewImage = (urls, current) => {
    uni.previewImage({
        urls: urls,
        current: urls[current],
        longPressActions: {
            itemList: ['发送给朋友', '保存图片', '收藏'],
            success: function(data) {
                console.log('选中了第' + (data.tapIndex + 1) + '个按钮，第' + (data.index + 1) + '张图片');
            },
            fail: function(err) {
                console.log(err.errMsg);
            }
        }
    });
};

// 以下是为商机卡片保留的点赞/踩/收藏/分享逻辑，但实际收藏页可能不需要这些实时交互，仅展示即可。
// 如果需要这些交互，则需要将数据同步回原数据源。
const toggleAction = (item, action) => {
    uni.showToast({
        title: '收藏页只展示，无法进行交互',
        icon: 'none'
    });
    // 如果希望在这里也能交互并影响计数，需要从全局状态或后端获取/更新数据
    // if (item.userAction === action) {
    //     item.userAction = null;
    //     if (action === 'like') { item.likes--; } else { item.dislikes--; }
    // } else {
    //     const prevAction = item.userAction;
    //     item.userAction = action;
    //     if (action === 'like') { item.likes++; if (prevAction === 'dislike') { item.dislikes--; } }
    //     else { item.dislikes++; if (prevAction === 'like') { item.likes--; } }
    // }
};
const toggleSave = (post) => {
    uni.showToast({
        title: '收藏页只展示，无法进行交互',
        icon: 'none'
    });
    // post.saved = !post.saved;
};
const sharePost = (post) => {
    uni.showToast({
        title: '分享功能即将上线',
        icon: 'none'
    });
};


onLoad(() => {
  // 页面加载时可以做一些初始化操作，例如从缓存或API加载真实的收藏数据
});
</script>

<style lang="scss" scoped>
.my-favorites-app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f7fa;
    max-width: 750rpx; /* 限制内容最大宽度 */
    margin: 0 auto; /* 居中显示 */
}

/* 顶部导航 - 复用之前的样式 */
.header {
    background: linear-gradient(135deg, #FF6A00, #FF8C00);
    color: white;
    padding: 36rpx 40rpx;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 6rpx 24rpx rgba(255, 106, 0, 0.3);
    display: flex;
    align-items: center;
    border-bottom-left-radius: 30rpx;
    border-bottom-right-radius: 30rpx;
}
.header .back-btn, .header .action-btn {
    font-size: 44rpx;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}
.header .back-btn {
    margin-right: 30rpx;
}
.header .back-btn:active, .header .action-btn:active {
    background: rgba(255, 255, 255, 0.2);
}
.header h1 {
    font-size: 40rpx;
    font-weight: 600;
    flex-grow: 1;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

/* 分段器容器 */
.segmented-container {
    padding: 20rpx 24rpx;
    background-color: #fff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

/* 滚动内容区 */
.content-scroll {
    flex: 1;
    height: 1px; /* 修复scroll-view高度问题 */
    padding: 0 24rpx;
    box-sizing: border-box;
}

/* 区域标题 */
.section-header {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    .section-title {
        font-size: 32rpx;
        font-weight: 600;
        margin-left: 12rpx; /* 图标前的空间 */
        color: #1c1e21;
    }
}

/* 活动列表项 - 复用“我的活动”页面样式 */
.activity-list {
    margin-bottom: 40rpx;
}

.activity-item {
    background-color: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    &:active {
        opacity: 0.9;
    }
}

.activity-image {
    width: 100%;
    height: 300rpx;
}

.activity-content {
    padding: 24rpx;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.activity-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1c1e21;
    flex: 1;
    margin-right: 20rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
}

.activity-info {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
    .info-text {
        margin-left: 8rpx;
    }
}

.activity-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f2f5;
}

.organizer {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999;
    text {
        margin-left: 8rpx;
    }
}
.participants {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999;
    text {
        margin-left: 8rpx;
    }
}

.action-buttons {
    display: flex;
    gap: 16rpx;
}

.btn {
    padding: 0 24rpx;
    height: 56rpx;
    line-height: 56rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 500;
    border: none;
    /* 移除小程序按钮默认样式 */
    -webkit-appearance: none;
    background-color: transparent;
}
.btn::after {
    border: none;
}
.btn-detail {
    background-color: #f0f2f5;
    color: #606770;
}
.btn-cancel {
    background-color: #ffebee;
    color: #f44336;
}

/* 商机卡片 - 复用“我的商机”页面样式 */
.post-list {
    padding: 0; /* 内部padding由post-card自身控制 */
    flex: 1;
    overflow-y: auto;
}

.post-card {
    background: white;
    border-radius: 30rpx;
    padding: 40rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:active {
    transform: translateY(-6rpx);
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
}

.post-header .user-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.avatar {
    width: 90rpx;
    height: 90rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6A00, #FF8C37);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 36rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
}

.user-details-wrapper {
    flex: 1;
}

.user-name {
    font-weight: 600;
    font-size: 32rpx;
    margin-bottom: 6rpx;
}

.post-time {
    font-size: 26rpx;
    color: #888;
    display: flex;
    align-items: center;
}
.post-time uni-icons {
    margin-right: 10rpx;
}

.delete-action {
    padding: 10rpx 20rpx;
    border-radius: 40rpx;
    background: #ffebe6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20rpx;
    transition: background 0.3s;
    font-size: 28rpx;
    color: #FF6A00;
}
.delete-action uni-icons {
    color: #FF6A00 !important;
    margin-right: 8rpx;
}
.delete-action:active {
    background: #ffdbcc;
}


.post-content {
    font-size: 30rpx;
    line-height: 1.5;
    margin-bottom: 30rpx;
    color: #444;
}

.post-images {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 30rpx;
    overflow: hidden;
}

.image-wrapper {
    width: calc((100% - 32rpx) / 3);
    aspect-ratio: 1 / 1;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.post-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 30rpx;
}

.tag {
    background: #fff0e6;
    color: #FF6A00;
    padding: 10rpx 24rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
}

.feedback-stats {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 30rpx;
    padding: 16rpx 30rpx;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 30rpx;
}

.feedback-stats .like-count {
    display: flex;
    align-items: center;
    margin-right: 30rpx;
    color: #e74c3c;
}

.feedback-stats .dislike-count {
    display: flex;
    align-items: center;
    color: #3498db;
}

.feedback-stats uni-icons {
    margin-right: 10rpx;
}


/* 空状态组件样式 */
.empty-state {
    text-align: center;
    padding: 80rpx 0;
    background-color: #fff;
    border-radius: 16rpx;
    margin-top: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .empty-icon { /* uni-icons 自带尺寸，这里可以不设置 */
        color: #e0e0e0;
        margin-bottom: 24rpx;
    }
    
    p {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 16rpx;
    }
    
    .empty-desc {
        font-size: 26rpx;
        color: #999;
        margin-bottom: 40rpx;
    }
}
.primary-btn {
    background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
    color: white;
    border: none;
    padding: 0 48rpx;
    height: 72rpx;
    line-height: 72rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: 500;
    margin-top: 24rpx;
    /* 移除小程序按钮默认样式 */
    -webkit-appearance: none;
    background-color: transparent;
}
.primary-btn::after {
    border: none;
}
</style>