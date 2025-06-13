<template>
    <div class="business-opportunity-detail-app">
        
        <div class="container">
            <!-- 商机卡片 -->
            <div class="opportunity-card">
                <div class="author-info">
                    <div class="author-avatar" @click="showContact(postDetail.user, postDetail.contact)">
                        {{ postDetail.user.charAt(0) }}
                    </div>
                    <!-- uni-app 不支持 :hover 和相邻选择器，这里tooltip简单模拟，实际复杂情况可用Popup组件 -->
                    <div class="avatar-tooltip">点击获取联系方式</div>
                    <div class="author-details">
                        <div class="author-name">{{ postDetail.user }}</div>
                        <div class="post-time">
                            <uni-icons type="redo" size="14" color="#888"></uni-icons> {{ postDetail.time }}
                        </div>
                    </div>
                </div>
                
                <div class="opportunity-content">
                    {{ postDetail.content }}
                </div>

                <!-- 图片区域 -->
                <div class="post-images" v-if="postDetail.images && postDetail.images.length">
                    <div 
                        v-for="(image, imgIndex) in postDetail.images" 
                        :key="imgIndex" 
                        class="image-wrapper"
                    >
                        <img :src="image" alt="商机图片" class="post-image" @click.stop="previewImage(postDetail.images, imgIndex)" />
                    </div>
                </div>
                
                <div class="tags">
                    <div class="tag" v-for="(tag, index) in postDetail.tags" :key="index">
                        {{ tag }}
                    </div>
                </div>
                
                <div class="interactions">
                    <div 
                        class="interaction-btn" 
                        :class="{ active: postDetail.userAction === 'like' }"
                        @click="toggleAction(postDetail, 'like')"
                    >
                        <uni-icons 
                            :type="postDetail.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" 
                            size="18"
                            :color="postDetail.userAction === 'like' ? '#e74c3c' : '#666'"
                        ></uni-icons>
                        <span>{{ postDetail.likes }}</span>
                    </div>
                    <div 
                        class="interaction-btn" 
                        :class="{ active: postDetail.userAction === 'dislike' }"
                        @click="toggleAction(postDetail, 'dislike')"
                    >
                        <uni-icons 
                            :type="postDetail.userAction === 'dislike' ? 'hand-down-filled' : 'hand-down'" 
                            size="18"
                            :color="postDetail.userAction === 'dislike' ? '#3498db' : '#666'"
                        ></uni-icons>
                        <span>{{ postDetail.dislikes }}</span>
                    </div>
                    <div class="interaction-btn" @click="shareOpportunity">
                        <uni-icons type="redo" size="18" color="#666"></uni-icons> 分享
                    </div>
                    <div 
                        class="interaction-btn" 
                        :class="{ active: postDetail.saved }"
                        @click="toggleBookmark(postDetail)"
                    >
                        <uni-icons 
                            :type="postDetail.saved ? 'star-filled' : 'star'" 
                            size="18"
                            :color="postDetail.saved ? '#FF6A00' : '#666'"
                        ></uni-icons>
                        收藏
                    </div>
                </div>
            </div>
            
            <!-- 评论区 -->
            <div class="comments-section">
                <div class="section-title">
                    <uni-icons type="chatbubble-filled" size="20" color="#FF6A00"></uni-icons> 评论 ({{ comments.length }})
                </div>
                
                <div class="comment-list">
                    <div class="comment" v-for="comment in comments" :key="comment.id">
                        <div class="comment-avatar" @click="showContact(comment.user, comment.contact)">
                            {{ comment.user.charAt(0) }}
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <div class="commenter-name">{{ comment.user }}</div>
                                <div class="comment-time">{{ comment.time }}</div>
                            </div>
                            <div class="comment-text">{{ comment.text }}</div>
                            <div class="comment-actions">
                                <div class="comment-action" @click="replyComment(comment)">
                                    <uni-icons type="chatbubble" size="16" color="#666"></uni-icons> 回复
                                </div>
                                <div 
                                    class="comment-action" 
                                    :class="{ active: comment.userAction === 'like' }"
                                    @click="toggleAction(comment, 'like')"
                                >
                                    <uni-icons 
                                        :type="comment.userAction === 'like' ? 'hand-up-filled' : 'hand-up'" 
                                        size="16"
                                        :color="comment.userAction === 'like' ? '#e74c3c' : '#666'"
                                    ></uni-icons>
                                    <span>{{ comment.likes }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="comments.length === 0" class="no-comments-message">
                        暂无评论，快来发表第一条评论吧！
                    </div>
                </div>
            </div>
            
            <!-- 添加评论区域 -->
            <div class="add-comment">
                <input 
                    type="text" 
                    v-model="newCommentText" 
                    placeholder="发表你的评论..." 
                    @confirm="addComment" 
                    confirm-type="send"
                />
                <button @click="addComment">发送</button>
            </div>
        </div>
        
        <!-- 联系方式弹窗 -->
        <div class="contact-modal" :class="{ active: showContactModal }" @click.self="closeContact">
            <div class="contact-card">
                <div class="contact-avatar">{{ currentContact.name.charAt(0) }}</div>
                <div class="contact-name">{{ currentContact.name }}</div>
                <div class="contact-info">
                    <p v-if="currentContact.phone">
                        <uni-icons type="phone-filled" size="18" color="#FF6A00"></uni-icons> 
                        {{ currentContact.phone }}
                    </p>
                    <p v-if="currentContact.email">
                        <uni-icons type="email-filled" size="18" color="#FF6A00"></uni-icons> 
                        {{ currentContact.email }}
                    </p>
                    <p v-if="currentContact.company">
                        <uni-icons type="paperplane-filled" size="18" color="#FF6A00"></uni-icons> 
                        {{ currentContact.company }}
                    </p>
                    <p v-if="currentContact.address">
                        <uni-icons type="location-filled" size="18" color="#FF6A00"></uni-icons> 
                        {{ currentContact.address }}
                    </p>
                    <p v-if="currentContact.website">
                        <uni-icons type="link" size="18" color="#FF6A00"></uni-icons> 
                        {{ currentContact.website }}
                    </p>
                </div>
                <button class="close-btn" @click="closeContact">关闭</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
// 如果不是全局引入 uni-icons，可以在这里按需引入
// import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

// 模拟商机详情数据
const postDetail = reactive({
    id: 1,
    user: '陈总',
    time: '1小时前',
    content: '我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统。要求具备自然语言处理和机器学习经验，有相关行业解决方案的团队优先。项目周期预计6个月，预算面议。期待与有实力的团队合作，共同打造行业领先的智能客服解决方案。',
    images: [
        'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图1',
        'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图2',
        'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图3',
        'https://via.placeholder.com/150/FF6A00/FFFFFF?text=AI合作图4'
    ],
    tags: ['#技术合作', '#AI开发', '#商务合作', '#智能客服'],
    likes: 24,
    dislikes: 3,
    userAction: null, // 'like' or 'dislike'
    saved: false,
    contact: { // 模拟联系方式
        phone: '138 **** 5678',
        email: 'chenzong@example.com',
        company: '创新科技有限公司',
        address: '上海市浦东新区',
        website: 'www.innotech-ai.com'
    }
});

// 模拟评论数据
const comments = reactive([
    {
        id: 1,
        user: '张经理',
        time: '45分钟前',
        text: '我们团队有5年AI客服系统开发经验，已完成多个金融行业智能客服项目。已私信您联系方式，期待进一步沟通！',
        likes: 5,
        userAction: null,
        contact: { phone: '139 **** 1234', email: 'zhang@example.com', company: '智联科技' }
    },
    {
        id: 2,
        user: '王总监',
        time: '30分钟前',
        text: '您好，我们有成熟的NLP技术团队，开发过多个智能客服系统。能否提供更具体的需求文档？谢谢！',
        likes: 2,
        userAction: null,
        contact: { phone: '137 **** 5678', email: 'wang@example.com', company: '未来智能' }
    },
    {
        id: 3,
        user: '李技术',
        time: '15分钟前',
        text: '我们专注于AI语音交互系统，有自有专利技术，可以显著提升客服效率。已发送公司介绍到私信，请查收。',
        likes: 1,
        userAction: null,
        contact: { phone: '136 **** 9012', email: 'li@example.com', company: '声学智能' }
    },
    {
        id: 4,
        user: '赵总',
        time: '10分钟前',
        text: '我们公司刚完成一个电商智能客服项目，支持多语言处理。已私信您案例演示链接，欢迎查看。',
        likes: 0,
        userAction: null,
        contact: { phone: '135 **** 3456', email: 'zhao@example.com', company: '电商通' }
    }
]);

// 评论输入框内容
const newCommentText = ref('');

// 联系方式弹窗相关
const showContactModal = ref(false);
const currentContact = reactive({
    name: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    website: ''
});

/**
 * 返回上一页
 */
const goBack = () => {
    uni.navigateBack({
        delta: 1
    });
};

/**
 * 显示更多操作（模拟）
 */
const showMoreActions = () => {
    uni.showActionSheet({
        itemList: ['举报', '分享到...'],
        success: function (res) {
            console.log('用户点击了', res.tapIndex);
            if (res.tapIndex === 0) {
                uni.showToast({ title: '举报功能待完善', icon: 'none' });
            } else if (res.tapIndex === 1) {
                shareOpportunity();
            }
        }
    });
};

/**
 * 切换点赞/踩状态
 * @param {Object} item - 帖子或评论对象
 * @param {string} action - 'like' 或 'dislike'
 */
const toggleAction = (item, action) => {
    if (item.userAction === action) {
        // 取消当前操作
        item.userAction = null;
        if (action === 'like') {
            item.likes--;
        } else {
            item.dislikes--;
        }
    } else {
        // 记录之前的操作
        const prevAction = item.userAction;
        
        // 设置新操作
        item.userAction = action;
        
        // 更新计数
        if (action === 'like') {
            item.likes++;
            if (prevAction === 'dislike') {
                item.dislikes--;
            }
        } else { // action === 'dislike'
            item.dislikes++;
            if (prevAction === 'like') {
                item.likes--;
            }
        }
    }
};

/**
 * 切换收藏状态
 * @param {Object} post - 帖子对象
 */
const toggleBookmark = (post) => {
    post.saved = !post.saved;
    uni.showToast({
        title: post.saved ? '已收藏' : '已取消收藏',
        icon: 'none'
    });
};

/**
 * 分享商机 (模拟)
 */
const shareOpportunity = () => {
    uni.showToast({
        title: '分享功能即将上线',
        icon: 'none'
    });
};

/**
 * 显示联系方式弹窗
 * @param {string} userName - 用户名
 * @param {Object} contactInfo - 联系方式详情
 */
const showContact = (userName, contactInfo) => {
    // 复制联系信息，避免直接修改原始数据
    Object.assign(currentContact, { name: userName, ...contactInfo });
    showContactModal.value = true;
};

/**
 * 关闭联系方式弹窗
 */
const closeContact = () => {
    showContactModal.value = false;
};

/**
 * 评论回复功能 (模拟)
 * @param {Object} comment - 被回复的评论对象
 */
const replyComment = (comment) => {
    uni.showToast({
        title: `回复 ${comment.user}: 功能待完善`,
        icon: 'none'
    });
    // 可以在这里设置评论输入框的placeholder或@某人
    newCommentText.value = `@${comment.user} `;
};

/**
 * 添加新评论
 */
const addComment = () => {
    const text = newCommentText.value.trim();
    if (text) {
        const newId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1;
        comments.unshift({
            id: newId,
            user: '当前用户', // 实际应为登录用户
            time: '刚刚',
            text: text,
            likes: 0,
            userAction: null,
            contact: { phone: '188 **** 8888', email: 'current@example.com' } // 模拟当前用户联系方式
        });
        newCommentText.value = '';
        uni.showToast({
            title: '评论成功',
            icon: 'success'
        });
    } else {
        uni.showToast({
            title: '评论内容不能为空',
            icon: 'none'
        });
    }
};

/**
 * 预览图片
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
/* 注意：这里所有的 px 单位都已转换为 rpx */

/* 页面根容器样式，模拟 body 的布局和最大宽度 */
.business-opportunity-detail-app {
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
    max-width: 750rpx; /* 限制内容最大宽度 */
    margin: 0 auto; /* 居中显示 */
    min-height: 100vh; /* 确保内容不足时也能占满高度 */
    display: flex;
    flex-direction: column;
    padding-bottom: 120rpx; /* 为底部评论输入框留出空间 */
}

/* 顶部导航 */
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

.header .back-btn:active {
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

.header .action-btn:active {
    background: rgba(255, 255, 255, 0.2);
}

/* 商机卡片 */
.opportunity-card {
    background: white;
    border-radius: 36rpx;
    margin: 40rpx 30rpx;
    padding: 44rpx;
    box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.05);
    border: 2rpx solid #eee;
    position: relative;
    overflow: hidden;
}

.opportunity-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 10rpx;
    height: 100%;
    background: #FF6A00;
    border-top-left-radius: 36rpx;
    border-bottom-left-radius: 36rpx;
}

.author-info {
    display: flex;
    align-items: center;
    margin-bottom: 36rpx;
    position: relative;
}

.author-avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6A00, #FF8C00);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 48rpx;
    position: relative;
    border: 4rpx solid white;
    box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.3);
    transition: transform 0.3s;
}

.author-avatar:active {
    transform: scale(1.05);
}

.avatar-tooltip {
    position: absolute;
    bottom: -56rpx; /* 调整位置 */
    left: 50%;
    transform: translateX(-50%);
    background: #FF6A00;
    color: white;
    font-size: 22rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    white-space: nowrap;
    opacity: 0; /* 默认隐藏 */
    transition: opacity 0.3s;
    pointer-events: none;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.2);
}

/* uni-app 无法直接使用相邻选择器伪类，所以这里只作为样式说明 */
/* .author-avatar:hover + .avatar-tooltip {
    opacity: 1;
} */
/* 如果要实现hover效果，可能需要js动态添加class或者uni-ui的tooltip组件 */

.author-details {
    margin-left: 30rpx;
}

.author-name {
    font-weight: 700;
    font-size: 36rpx;
    color: #333;
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

.opportunity-content {
    margin: 40rpx 0;
    font-size: 32rpx;
    color: #444;
    line-height: 1.7;
    padding: 0 10rpx;
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
    gap: 20rpx;
    margin: 40rpx 0;
}

.tag {
    background: rgba(255, 106, 0, 0.1);
    color: #FF6A00;
    padding: 14rpx 32rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
    font-weight: 500;
    border: 2rpx solid rgba(255, 106, 0, 0.2);
}

.interactions {
    display: flex;
    justify-content: space-between;
    border-top: 2rpx solid #f0f0f0;
    padding-top: 36rpx;
    margin-top: 30rpx;
}

.interaction-btn {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 30rpx;
    transition: all 0.2s;
    padding: 10rpx 20rpx;
    border-radius: 16rpx;
}

.interaction-btn:active {
    background: rgba(255, 106, 0, 0.08);
}

.interaction-btn uni-icons {
    margin-right: 16rpx;
}

.interaction-btn.active {
    /* 收藏的激活状态 */
    color: #FF6A00; 
}


/* 评论区 */
.comments-section {
    background: white;
    border-radius: 36rpx;
    margin: 40rpx 30rpx;
    padding: 44rpx;
    box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.05);
    border: 2rpx solid #eee;
}

.section-title {
    font-size: 40rpx;
    font-weight: 700;
    margin-bottom: 50rpx;
    padding-bottom: 30rpx;
    border-bottom: 2rpx solid #f0f0f0;
    color: #333;
    display: flex;
    align-items: center;
}

.section-title uni-icons {
    margin-right: 24rpx;
    color: #FF6A00;
    background: rgba(255, 106, 0, 0.1);
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.comment-list {
    margin-top: 30rpx;
}

.comment {
    display: flex;
    margin-bottom: 50rpx;
    padding-bottom: 40rpx;
    border-bottom: 2rpx solid #f5f5f5;
}

.comment:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.comment-avatar {
    width: 92rpx;
    height: 92rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF8C00, #FF6A00);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 36rpx;
    flex-shrink: 0;
    border: 4rpx solid white;
    box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.2);
    transition: transform 0.3s;
}

.comment-avatar:active {
    transform: scale(1.05);
}

.comment-content {
    margin-left: 30rpx;
    flex-grow: 1;
}

.comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
}

.commenter-name {
    font-weight: 600;
    font-size: 32rpx;
    color: #333;
}

.comment-time {
    font-size: 24rpx;
    color: #888;
    margin-left: 24rpx;
}

.comment-text {
    font-size: 30rpx;
    color: #555;
    line-height: 1.6;
    background: #fafafa;
    padding: 24rpx 30rpx;
    border-radius: 24rpx;
    border: 2rpx solid #f0f0f0;
}

.comment-actions {
    display: flex;
    margin-top: 24rpx;
    margin-left: 10rpx;
}

.comment-action {
    color: #666;
    font-size: 26rpx;
    margin-right: 40rpx;
    display: flex;
    align-items: center;
}

.comment-action uni-icons {
    margin-right: 10rpx;
}

.comment-action:active {
    color: #FF6A00;
}
.comment-action.active {
    color: #e74c3c; /* 点赞评论的激活色 */
}


/* 添加评论 */
.add-comment {
    position: fixed;
    bottom: -40rpx;
    left: 50%;
    transform: translateX(-50%);
    max-width: 750rpx;
    width: 100%;
    display: flex;
    align-items: center;
    background: white;
    padding: 10rpx;
    /* 适配底部安全区域 */
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.05);
    border-top: 2rpx solid #e0e0e0;
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    z-index: 99;
}

.add-comment input {
    flex-grow: 1;
    border: 2rpx solid #e0e0e0;
    border-radius: 50rpx;
    padding: 24rpx 40rpx;
    font-size: 30rpx;
    outline: none;
    transition: all 0.3s;
}

.add-comment input:focus {
    border-color: #FF6A00;
    box-shadow: 0 0 0 4rpx rgba(255, 106, 0, 0.2);
}

.add-comment button {
    background: #FF6A00;
    color: white;
    border: none;
    border-radius: 50rpx;
    /* padding: 24rpx 50rpx; */
    margin-left: 24rpx;
    font-weight: 500;
    transition: background 0.3s;
    box-shadow: 0 6rpx 20rpx rgba(255, 106, 0, 0.3);
    /* 移除小程序按钮默认样式 */
    -webkit-appearance: none;
    /* background-color: transparent; */
}
.add-comment button::after {
    border: none;
}

.add-comment button:active {
    background: #e05a00;
}

/* 联系方式弹窗 */
.contact-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.contact-modal.active {
    opacity: 1;
    pointer-events: all;
}

.contact-card {
    background: white;
    border-radius: 40rpx;
    width: 85%;
    max-width: 640rpx;
    padding: 60rpx;
    text-align: center;
    transform: translateY(60rpx);
    transition: transform 0.4s;
    box-shadow: 0 30rpx 80rpx rgba(0,0,0,0.3);
    position: relative;
    overflow: hidden;
}

.contact-modal.active .contact-card {
    transform: translateY(0);
}

.contact-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10rpx;
    background: linear-gradient(to right, #FF6A00, #FF8C00);
}

.contact-avatar {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6A00, #FF8C00);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 72rpx;
    margin: 0 auto 40rpx;
    border: 6rpx solid white;
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
}

.contact-name {
    font-size: 44rpx;
    font-weight: 700;
    margin-bottom: 50rpx;
    color: #333;
}

.contact-info {
    background: #fff8f3;
    border-radius: 30rpx;
    padding: 40rpx;
    margin: 40rpx 0;
    text-align: left;
    border: 2rpx solid #ffe8d9;
}

.contact-info p {
    margin: 28rpx 0;
    display: flex;
    align-items: center;
    font-size: 30rpx;
}

.contact-info uni-icons {
    margin-right: 24rpx;
    color: #FF6A00;
    width: 48rpx;
    font-size: 36rpx;
    text-align: center;
}

.close-btn {
    background: #FF6A00;
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 28rpx 50rpx;
    width: 100%;
    font-weight: 600;
    margin-top: 20rpx;
    font-size: 32rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 106, 0, 0.4);
    transition: background 0.3s;
    /* 移除小程序按钮默认样式 */
    -webkit-appearance: none;
    background-color: transparent;
}
.close-btn::after {
    border: none;
}

.close-btn:active {
    background: #e05a00;
}

.no-comments-message {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 28rpx;
}
</style>