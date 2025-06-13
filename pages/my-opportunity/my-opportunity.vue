<template>
    <div class="my-opportunities-app">
        
        <!-- 帖子列表 -->
        <div class="post-list">
            <!-- 帖子卡片 -->
            <div 
                v-for="post in myPosts" 
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
                    <!-- 删除按钮 -->
                    <div class="delete-action" @click.stop="deleteOpportunity(post.id)">
                        <uni-icons type="close" size="15" color="#FF6A00">删除</uni-icons>
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
            <div v-if="myPosts.length === 0" class="no-posts-message">
                <uni-icons type="info" size="60" color="#ccc"></uni-icons>
                <p>您还没有发布任何商机</p>
                <button class="empty-post-button" @click="postNew">
                    <uni-icons type="compose" size="20" color="#FFFFFF"></uni-icons> 发布我的第一个商机
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// 模拟“我的商机”数据
const myPosts = reactive([
    {
        id: 101, // 增加ID以方便删除
        user: '当前用户', // 假设这是登录用户
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
        saved: false
    },
    {
        id: 102,
        user: '当前用户',
        time: '2025-06-15 14:30:00',
        content: '本人有一批高质量二手办公家具转让，适合创业公司或小型办公室，价格优惠，可上门看货。',
        images: [
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具1',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具2',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具3',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具4',
            'https://via.placeholder.com/150/007AFF/FFFFFF?text=办公家具5'
        ],
        tags: ['#二手转让', '#办公用品', '#创业福利'],
        likes: 8,
        dislikes: 1,
        userAction: null,
        saved: false
    },
    {
        id: 103,
        user: '当前用户',
        time: '2025-06-14 09:00:00',
        content: '寻找在营销策划、品牌推广方面有独到见解的专家，希望通过线上线下结合的方式提升品牌影响力。',
        images: [], // 无图片
        tags: ['#营销策划', '#品牌推广', '#专家合作'],
        likes: 20,
        dislikes: 0,
        userAction: null,
        saved: true // 模拟已被收藏
    }
]);

/**
 * 返回上一页
 */
const goBack = () => {
    uni.navigateBack({
        delta: 1
    });
};

/**
 * 删除商机
 * @param {number} id - 要删除的商机ID
 */
const deleteOpportunity = (id) => {
    uni.showModal({
        title: '确认删除',
        content: '您确定要删除这条商机吗？删除后将无法恢复。',
        success: (res) => {
            if (res.confirm) {
                const index = myPosts.findIndex(post => post.id === id);
                if (index !== -1) {
                    myPosts.splice(index, 1);
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                }
            }
        }
    });
};

/**
 * 切换点赞/踩状态 (与商机发现页通用逻辑)
 * @param {Object} post - 帖子对象
 * @param {string} action - 'like' 或 'dislike'
 */
const toggleAction = (post, action) => {
    if (post.userAction === action) {
        post.userAction = null;
        if (action === 'like') {
            post.likes--;
        } else {
            post.dislikes--;
        }
    } else {
        const prevAction = post.userAction;
        post.userAction = action;
        if (action === 'like') {
            post.likes++;
            if (prevAction === 'dislike') {
                post.dislikes--;
            }
        } else {
            post.dislikes++;
            if (prevAction === 'like') {
                post.likes--;
            }
        }
    }
};

/**
 * 切换收藏状态 (与商机发现页通用逻辑)
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
 * 分享帖子 (与商机发现页通用逻辑)
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
 * @param {number} id - 商机ID
 */
const skipCommercialDetail = (id) =>{
	uni.navigateTo({
		url:`/pages/home-commercialDetail/home-commercialDetail?id=${id}` // 实际项目中应传递商机ID
	})
}

/**
 * 预览图片 (与商机详情页通用逻辑)
 * @param {Array} urls - 图片URL数组
 * @param {number} current - 当前点击图片的索引
 */
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
.my-opportunities-app {
    background-color: #f9f9f9;
    color: #333;
    max-width: 750rpx; /* 限制内容最大宽度 */
    margin: 0 auto; /* 居中显示 */
    padding-bottom: 40rpx; /* 页面底部留空 */
    min-height: 100vh; /* 确保内容不足时也能占满高度 */
    display: flex;
    flex-direction: column;
}

/* 顶部区域样式 - 复用商机详情页的 Header 风格 */
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

.header .back-btn {
    font-size: 44rpx;
    margin-right: 30rpx;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.header .back-btn:active { /* uni-app 模拟 :hover */
    background: rgba(255, 255, 255, 0.2);
}

.header h1 {
    font-size: 40rpx;
    font-weight: 600;
    flex-grow: 1;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.header .action-btn {
    font-size: 40rpx;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.header .action-btn:active { /* uni-app 模拟 :hover */
    background: rgba(255, 255, 255, 0.2);
}

/* 发布按钮在 Header 中 */
.post-new-header-btn uni-icons {
    /* 调整图标颜色，确保在深色背景下可见 */
    color: white !important; 
}


/* 帖子列表样式 - 复用商机发现页的样式 */
.post-list {
    padding: 30rpx;
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
    justify-content: space-between; /* 使删除按钮右对齐 */
    margin-bottom: 30rpx;
}

.post-header .user-info {
    display: flex;
    align-items: center;
    flex: 1; /* 占据剩余空间 */
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
    flex-shrink: 0; /* 防止头像被压缩 */
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

/* 删除按钮样式 */
.delete-action {
    padding: 10rpx ;
    border-radius: 40rpx;
    background: #ffebe6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20rpx; /* 与用户信息分隔 */
    transition: background 0.3s;
}
.delete-action:active {
    background: #ffdbcc; /* 点击态 */
}
.delete-action uni-icons {
    color: #FF6A00 !important; /* 确保图标颜色 */
}


.post-content {
    font-size: 30rpx;
    line-height: 1.5;
    margin-bottom: 30rpx;
    color: #444;
}

/* 商机图片样式 - 复用商机发现页的样式 */
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

/* 赞踩统计 - 复用商机发现页的样式 */
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
    transition: all 0.2s;
}

.action uni-icons { /* 针对 uni-icons 调整 */
    margin-right: 12rpx;
}

.action:active { /* 小程序使用 :active 模拟 :hover */
    opacity: 0.7; /* 点击时稍微变暗 */
}

.action.like.active {
    color: #e74c3c;
}

.action.dislike.active {
    color: #3498db;
}

.action.comment.active { /* 收藏激活状态 */
    color: #FF6A00;
}

/* 没有商机时的提示信息 */
.no-posts-message {
    text-align: center;
    padding: 100rpx 40rpx;
    color: #999;
    font-size: 32rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30rpx;
}

.no-posts-message p {
    margin: 20rpx 0;
}

.empty-post-button {
    background: linear-gradient(to right, #FF6A00, #FF8C37);
    color: white;
    border: none;
    border-radius: 60rpx;
    padding: 24rpx 50rpx;
    font-size: 32rpx;
    font-weight: 600;
    box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
    /* 移除小程序按钮默认边框和背景 */
    -webkit-appearance: none;
    background-color: transparent;
}
.empty-post-button::after {
    border: none;
}
.empty-post-button uni-icons {
    margin-right: 15rpx;
    color: white !important; /* 确保图标颜色 */
}
</style>