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
                @click="handleTabClick('recommend')"
            >
                推荐
            </div>
            <div 
                class="tab" 
                :class="{ active: activeTab === 'nearby' }"
                @click="handleTabClick('nearby')"
            >
                附近
            </div>
            <div 
                class="tab" 
                :class="{ active: activeTab === 'follow' }"
                @click="handleTabClick('follow')"
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
            <!-- 新增：暂无更多内容提示 -->
            <div v-if="displayedPosts.length > 0" class="no-more-content-message">
                暂无更多内容
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
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png'
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
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png'
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
            '../../static/abc.png',
            '../../static/abc.png'
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
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png',
            '../../static/abc.png'
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
            '../../static/abc.png'
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
            '../../static/abc.png',
            '../../static/abc.png'
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

// 用于记录上次成功获取位置的时间戳
let lastLocationFetchTimestamp = 0; 
// 最小获取位置间隔（毫秒），例如 5 秒
const FETCH_LOCATION_MIN_INTERVAL = 5000; 

/**
 * 处理标签页点击事件，特别是针对“附近”标签需要获取地理位置权限
 * @param {string} tabName - 被点击的标签名称
 */
const handleTabClick = (tabName) => {
    if (tabName === 'nearby') {
        uni.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userLocation']) {
                    // 已授权，直接尝试获取位置
                    tryGetLocationAndSwitchTab(tabName);
                } else {
                    // 未授权，请求授权
                    uni.authorize({
                        scope: 'scope.userLocation',
                        success: () => {
                            // 授权成功，尝试获取位置
                            tryGetLocationAndSwitchTab(tabName);
                        },
                        fail: () => {
                            // 授权失败（用户拒绝），不切换标签页，并提示用户
                            uni.showModal({
                                title: '温馨提示',
                                content: '您已拒绝获取位置信息，无法查看附近商机。请在设置中开启位置权限。',
                                showCancel: false,
                                confirmText: '我知道了'
                            });
                            // 不切换标签页，保持在原tab
                        }
                    });
                }
            },
            fail: (err) => {
                console.error('获取用户设置失败', err);
                uni.showToast({
                    title: '检查权限失败',
                    icon: 'none'
                });
                // 不切换标签页，保持在原tab
            }
        });
    } else {
        // 对于其他标签页，直接切换
        activeTab.value = tabName;
    }
};

/**
 * 尝试获取用户地理位置并切换标签页
 * 增加了对频繁调用的防抖处理
 * @param {string} tabName - 目标标签名称
 */
const tryGetLocationAndSwitchTab = (tabName) => {
    const currentTime = Date.now();

    // 如果距离上次成功获取位置的时间不足最小间隔，则直接切换标签页，不重复调用 uni.getLocation
    if (currentTime - lastLocationFetchTimestamp < FETCH_LOCATION_MIN_INTERVAL) {
        console.log('短时间内重复点击“附近”tab，跳过 uni.getLocation 调用，直接切换tab。');
        activeTab.value = tabName; // 仍然切换标签页以提供即时反馈
        uni.showToast({
            title: '位置信息已是最新',
            icon: 'none',
            duration: 1000
        });
        return;
    }

    uni.getLocation({
        type: 'wgs84', // 使用WGS84坐标系，适用于地图展示
        success: (res) => {
            const latitude = res.latitude;
            const longitude = res.longitude;
            console.log('用户位置信息:', { latitude, longitude }); // 打印位置到控制台
            uni.showToast({
                title: '位置获取成功',
                icon: 'success',
                duration: 1000
            });
            activeTab.value = tabName; // 仅在位置获取成功后切换标签页
            lastLocationFetchTimestamp = currentTime; // 更新上次成功获取时间
        },
        fail: (err) => {
            console.error('获取位置失败', err);
            let errorMessage = '获取位置失败，无法查看附近商机。';
            // uni.getLocation 的 fail 回调会包含频繁调用的警告
            if (err.errMsg.includes('频繁调用') || err.errMsg.includes('frequent call')) {
                errorMessage = '您点击太快啦，请稍后再试。';
            } else if (err.errMsg.includes('denied') || err.errMsg.includes('not authorized')) {
                 // 尽管授权失败已在 uni.authorize 中处理，但以防万一这里也捕获
                 errorMessage = '您已拒绝获取位置信息，无法查看附近商机。请检查系统设置。';
            }
            uni.showModal({
                title: '温馨提示',
                content: errorMessage,
                showCancel: false,
                confirmText: '我知道了'
            });
            // 获取位置失败，不切换标签页，保持在原tab
        }
    });
};
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
    padding: 0 40rpx;
    border-bottom: 2rpx solid #eee;
    position: sticky;
    top: 0;
    z-index: 10;
}

.tab {
    flex: 1;
    text-align: center;
    padding: 40rpx 0;
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
    padding: 0 32rpx;
	margin: 15rpx 0;
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

/* 新增样式：暂无更多内容提示 */
.no-more-content-message {
    text-align: center;
    padding: 40rpx 0; /* 上下内边距，让它不至于紧贴着上一个元素 */
    color: #999; /* 颜色 */
    font-size: 28rpx; /* 字体大小 */
    margin-top: 20rpx; /* 与上方帖子卡片的间距 */
}
</style>