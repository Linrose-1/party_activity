<template>
    <div class="business-opportunity-app">
        <!-- 顶部区域 -->
        <div class="header wechat-style">
            <div class="app-title">聚一聚</div>
            <div class="app-subtitle">聚友连接·商机分享</div>
            <div class="app-description">·连接全球精英商友·</div>
            
            <div class="search-container">
                <!-- 使用 uni-icons 替代 fas fa-search -->
                <uni-icons type="search" size="20" color="#FF6A00"></uni-icons>
                <input type="text" placeholder="搜索活动、商友或商机" />
            </div>
        </div>
        
        <!-- 商机发现标题 -->
        <div class="section-title">商机发现</div>
        
        <!-- 导航标签栏 -->
        <div class="tabs">
            <div 
                class="tab" 
                :class="{ active: activeTab === 'recommend' }"
                @click="activeTab = 'recommend'"
            >
                推荐
            </div>
            <div 
                class="tab" 
                :class="{ active: activeTab === 'nearby' }"
                @click="activeTab = 'nearby'"
            >
                附近
            </div>
            <div 
                class="tab" 
                :class="{ active: activeTab === 'follow' }"
                @click="activeTab = 'follow'"
            >
                关注
            </div>
            <button class="post-button" @click="postNew">
                <!-- 使用 uni-icons 替代 fas fa-edit -->
                <uni-icons type="compose" size="18" color="#FFFFFF"></uni-icons>
                发帖
            </button>
        </div>
        
        <!-- 帖子列表 -->
        <div class="post-list">
            <!-- 帖子卡片 -->
            <div 
                v-for="post in displayedPosts" 
                :key="post.id" 
                class="post-card"
				@click="skipCommercialDetail"
            >
                <div class="post-header">
                    <div class="avatar" @click.stop="skipApplicationBusinessCard">{{ post.user.charAt(0) }}</div>
                    <div class="user-info">
                        <div class="user-name">{{ post.user }}</div>
                        <div class="post-time">{{ post.time }}</div>
                    </div>
                </div>
                <div class="post-content">
                    {{ post.content }}
                </div>

                <!-- 商机图片区域 -->
                <div class="post-images" v-if="post.images && post.images.length">
                    <div 
                        v-for="(image, imgIndex) in post.images" 
                        :key="imgIndex" 
                        class="image-wrapper"
                    >
                        <img :src="image" alt="商机图片" class="post-image" />
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
                
                <!-- 赞踩统计 -->
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
                
                <div class="post-actions">
                    <div class="action-group">
                        <div 
                            class="action like" 
                            :class="{ active: post.userAction === 'like' }"
                            @click.stop="toggleAction(post, 'like')"
                        >
                            <uni-icons 
                                :type="post.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" 
                                size="20"
                                :color="post.userAction === 'like' ? '#e74c3c' : '#666'"
                            ></uni-icons>
                            <span>赞</span>
                        </div>
                        <div 
                            class="action dislike" 
                            :class="{ active: post.userAction === 'dislike' }"
                            @click.stop="toggleAction(post, 'dislike')"
                        >
                            <uni-icons 
                                :type="post.userAction === 'dislike' ? 'hand-down-filled' : 'hand-down'" 
                                size="20"
                                :color="post.userAction === 'dislike' ? '#3498db' : '#666'"
                            ></uni-icons>
                            <span>踩</span>
                        </div>
                    </div>
                    <div class="action-group">
                        <div 
                            class="action comment"
                            :class="{ active: post.saved }"
                            @click.stop="toggleSave(post)"
                        >
                            <uni-icons 
                                :type="post.saved ? 'star-filled' : 'star'" 
                                size="20"
                                :color="post.saved ? '#FF6A00' : '#666'"
                            ></uni-icons>
                            <span>收藏</span>
                        </div>
                        <div class="action share" @click.stop="sharePost(post)">
                            <uni-icons type="redo" size="20" color="#666"></uni-icons>
                            <span>分享</span>
                        </div>
                    </div>
                </div>
            </div>
             <!-- 如果没有帖子显示 -->
            <div v-if="displayedPosts.length === 0" class="no-posts-message">
                暂无相关商机，快去发布吧！
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
// 引入 uni-icons 组件（如果不是全局注册的话）
// import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

// 当前激活的标签页
const activeTab = ref('recommend');

// 帖子数据 (模拟不同分类的帖子数据)
const recommendPosts = reactive([
    {
        id: 1,
        user: '陈总',
        time: '2025-06-15 20:44:34',
        content: '我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统，有意向的可以私信我详谈。',
        images: [
            'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作1',
            'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作2',
            'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作3'
        ],
        tags: ['#技术合作', '#AI开发', '#商务合作'],
        likes: 24,
        dislikes: 3,
        userAction: null, // 'like' or 'dislike'
        saved: false
    },
    {
        id: 2,
        user: '李经理',
        time: '2025-06-15 20:44:34',
        content: '刚参加完供应链优化研讨会，获益良多。这次分享几个关于仓储管理的新思路，希望对同行有所帮助。',
        images: [
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=供应链1',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=供应链2',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=供应链3',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=供应链4'
        ],
        tags: ['#供应链管理', '#仓储物流', '#经验分享'],
        likes: 45,
        dislikes: 2,
        userAction: null,
        saved: false
    },
    {
        id: 3,
        user: '张教授',
        time: '2025-06-15 20:44:34',
        content: '寻找医疗器械领域的投资机会，特别关注创新型医疗设备和AI辅助诊断方向，欢迎推荐优质项目。',
        images: [
            'https://via.placeholder.com/150/4CAF50/FFFFFF?text=医疗投资1',
            'https://via.placeholder.com/150/4CAF50/FFFFFF?text=医疗投资2'
        ],
        tags: ['#投资合作', '#医疗健康', '#项目对接'],
        likes: 32,
        dislikes: 5,
        userAction: null,
        saved: false
    }
]);

const nearbyPosts = reactive([
    {
        id: 4,
        user: '王老板',
        time: '2025-06-15 18:00:00',
        content: '我在XX商圈新开了一家智能咖啡馆，提供共享办公空间和优质咖啡，欢迎附近的朋友来体验！',
        images: [
            'https://via.placeholder.com/150/FF9800/FFFFFF?text=咖啡馆1',
            'https://via.placeholder.com/150/FF9800/FFFFFF?text=咖啡馆2',
            'https://via.placeholder.com/150/FF9800/FFFFFF?text=咖啡馆3',
            'https://via.placeholder.com/150/FF9800/FFFFFF?text=咖啡馆4',
            'https://via.placeholder.com/150/FF9800/FFFFFF?text=咖啡馆5',
            'https://via.placeholder.com/150/FF9800/FFFFFF?text=咖啡馆6'
        ],
        tags: ['#本地商机', '#餐饮', '#共享空间'],
        likes: 12,
        dislikes: 1,
        userAction: null,
        saved: false
    },
    {
        id: 5,
        user: '赵律师',
        time: '2025-06-15 15:30:00',
        content: '提供企业法律咨询服务，尤其擅长合同纠纷和知识产权保护，欢迎同城企业咨询。',
        images: [], // 无图片
        tags: ['#法律服务', '#企业咨询', '#同城服务'],
        likes: 8,
        dislikes: 0,
        userAction: null,
        saved: false
    }
]);

const followPosts = reactive([
    {
        id: 6,
        user: 'A股大V',
        time: '2025-06-15 10:00:00',
        content: '分享近期对新能源汽车板块的看法，认为下半年仍有较大增长潜力，欢迎交流。',
        images: [
            'https://via.placeholder.com/150/795548/FFFFFF?text=新能源车'
        ],
        tags: ['#股市分析', '#新能源', '#投资'],
        likes: 100,
        dislikes: 10,
        userAction: null,
        saved: false
    },
    {
        id: 7,
        user: '跨境电商专家',
        time: '2025-06-14 22:00:00',
        content: '针对东南亚跨境电商市场进行深度解析，欢迎寻找合作伙伴或想进入该市场的同行交流。',
        images: [
            'https://via.placeholder.com/150/607D8B/FFFFFF?text=跨境电商1',
            'https://via.placeholder.com/150/607D8B/FFFFFF?text=跨境电商2'
        ],
        tags: ['#跨境电商', '#东南亚市场', '#国际贸易'],
        likes: 78,
        dislikes: 5,
        userAction: null,
        saved: false
    }
]);


// 根据 activeTab 动态显示帖子列表
const displayedPosts = computed(() => {
    switch (activeTab.value) {
        case 'recommend':
            return recommendPosts;
        case 'nearby':
            return nearbyPosts;
        case 'follow':
            return followPosts;
        default:
            return [];
    }
});

/**
 * 切换点赞/踩状态
 * @param {Object} post - 帖子对象
 * @param {string} action - 'like' 或 'dislike'
 */
const toggleAction = (post, action) => {
    if (post.userAction === action) {
        // 取消当前操作
        post.userAction = null;
        if (action === 'like') {
            post.likes--;
        } else {
            post.dislikes--;
        }
    } else {
        // 记录之前的操作
        const prevAction = post.userAction;
        
        // 设置新操作
        post.userAction = action;
        
        // 更新计数
        if (action === 'like') {
            post.likes++;
            if (prevAction === 'dislike') {
                post.dislikes--;
            }
        } else { // action === 'dislike'
            post.dislikes++;
            if (prevAction === 'like') {
                post.likes--;
            }
        }
    }
};

/**
 * 切换收藏状态
 * @param {Object} post - 帖子对象
 */
const toggleSave = (post) => {
    post.saved = !post.saved;
    uni.showToast({
        title: post.saved ? '已收藏' : '已取消收藏',
        icon: 'none'
    });
};

/**
 * 分享帖子 (placeholder)
 * @param {Object} post - 帖子对象
 */
const sharePost = (post) => {
    uni.showToast({
        title: '分享功能即将上线',
        icon: 'none'
    });
};

/**
 * 跳转到发布新帖页面
 */
const postNew = () => {
    uni.navigateTo({
    	url:'/pages/home-opportunitiesPublish/home-opportunitiesPublish'
    })
};

/**
 * 跳转到个人名片页面
 */
const skipApplicationBusinessCard = () =>{
	uni.navigateTo({
		url:'/pages/applicationBusinessCard/applicationBusinessCard'
	})
}

/**
 * 跳转到商机详情页
 */
const skipCommercialDetail =() =>{
	uni.navigateTo({
		url:'/pages/home-commercialDetail/home-commercialDetail'
	})
}
</script>

<style scoped>
/* 全局/基础样式 */
/* * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
} */

/* 页面根容器样式，模拟 body 的布局和最大宽度 */
.business-opportunity-app {
    background-color: #f9f9f9;
    color: #333;
    max-width: 1000rpx; /* 限制内容最大宽度 */
    margin: 0 auto; /* 居中显示 */
    padding-bottom: 160rpx; /* 为底部导航栏留出空间 */
    min-height: 100vh; /* 确保内容不足时也能占满高度 */
    display: flex;
    flex-direction: column;
}

/* 顶部区域样式 */
.header {
    background: linear-gradient(135deg, #FF6A00, #FF8C37);
    color: white;
    padding: 40rpx 40rpx 60rpx;
    border-radius: 0 0 40rpx 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.header::before {
    content: "";
    position: absolute;
    top: -60rpx;
    right: -60rpx;
    width: 240rpx;
    height: 240rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.app-title {
    font-size: 56rpx;
    font-weight: 700;
    margin-bottom: 16rpx;
    text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.app-subtitle {
    font-size: 32rpx;
    margin-bottom: 10rpx;
    opacity: 0.95;
}

.app-description {
    font-size: 28rpx;
    margin-bottom: 40rpx;
    opacity: 0.9;
}

.search-container {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 60rpx;
    padding: 20rpx 40rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.search-container uni-icons { /* 针对 uni-icons 调整 */
    margin-right: 20rpx;
}

.search-container input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 28rpx;
    color: #555;
    background: transparent;
}

/* 商机发现标题 */
.section-title {
    font-size: 40rpx;
    font-weight: 700;
    padding: 40rpx 40rpx 30rpx;
    color: #FF6A00;
    display: flex;
    align-items: center;
}

.section-title::before {
    content: "";
    display: inline-block;
    width: 8rpx;
    height: 40rpx;
    background: #FF6A00;
    border-radius: 4rpx;
    margin-right: 20rpx;
}

/* 导航标签栏 */
.tabs {
    display: flex;
    background: white;
    padding: 10rpx 40rpx;
    border-bottom: 2rpx solid #eee;
    position: sticky;
    top: 0;
    z-index: 10;
}

.tab {
    flex: 1;
    text-align: center;
    padding: 10rpx 0;
    font-size: 32rpx;
    color: #666;
    position: relative;
    transition: all 0.3s;
}

.tab.active {
    color: #FF6A00;
    font-weight: 600;
}

.tab.active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 48rpx;
    height: 6rpx;
    background: #FF6A00;
    border-radius: 6rpx;
}

.post-button {
    background: linear-gradient(to right, #FF6A00, #FF8C37);
    color: white;
    border: none;
    border-radius: 40rpx;
    padding: 16rpx 32rpx;
    font-size: 28rpx;
    font-weight: 600;
    /* cursor: pointer; */
    box-shadow: 0 4rpx 12rpx rgba(255, 106, 0, 0.3);
    display: flex;
    align-items: center;
    margin-left: 30rpx;
    /* 移除小程序按钮默认边框和背景 */
    -webkit-appearance: none;
    background-color: transparent;
}
/* 小程序按钮点击态 */
.post-button::after {
    border: none;
}


.post-button uni-icons { /* 针对 uni-icons 调整 */
    margin-right: 10rpx;
}

/* 帖子列表样式 */
.post-list {
    padding: 0 30rpx;
    flex: 1; /* 让列表占据剩余空间 */
    overflow-y: auto; /* 允许列表内容滚动 */
}

.post-card {
    background: white;
    border-radius: 30rpx;
    padding: 40rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:active { /* 小程序使用 :active 模拟 :hover */
    transform: translateY(-6rpx);
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.post-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
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
}

.user-info {
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
}

.post-content {
    font-size: 30rpx;
    line-height: 1.5;
    margin-bottom: 30rpx;
    color: #444;
}

/* 商机图片样式 */
.post-images {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx; /* 图片之间的间距 */
    margin-bottom: 30rpx;
    overflow: hidden; /* 防止图片溢出 */
}

.image-wrapper {
    width: calc((100% - 32rpx) / 3); /* 两张图片间距16*2=32，所以减去32rpx */
    aspect-ratio: 1 / 1; /* 保持图片正方形 */
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.post-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 裁剪图片以填充容器 */
    display: block; /* 移除图片底部空白 */
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

.post-actions {
    display: flex;
    justify-content: space-between;
    border-top: 2rpx solid #f0f0f0;
    padding-top: 30rpx;
}

.action-group {
    display: flex;
    gap: 40rpx;
}

.action {
    display: flex;
    align-items: center;
    color: #666;
    /* cursor: pointer; */
    transition: all 0.2s;
}

.action uni-icons { /* 针对 uni-icons 调整 */
    margin-right: 12rpx;
}

.action:active { /* 小程序使用 :active 模拟 :hover */
    opacity: 0.7; /* 点击时稍微变暗 */
}

/* 赞踩统计 */
.feedback-stats {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 30rpx;
    padding: 16rpx 30rpx;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 30rpx; /* 在操作区上方添加间距 */
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

.feedback-stats uni-icons { /* 针对 uni-icons 调整 */
    margin-right: 10rpx;
}

/* 微信小程序样式调整 */
.wechat-style {
    position: relative;
}

.wechat-style::after {
    content: "微信小程序";
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
}

.no-posts-message {
    text-align: center;
    padding: 60rpx;
    color: #999;
    font-size: 32rpx;
}
</style>