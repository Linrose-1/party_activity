<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="title">商机详情</text>
      <text class="more-btn">⋯</text>
    </view>

    <!-- 商机卡片 -->
    <view class="card">
      <view class="author" @click="showContact('陈总')">
        <view class="avatar">陈</view>
        <view class="info">
          <text class="name">陈总</text>
          <text class="time">1小时前</text>
        </view>
      </view>
      <view class="content">
        我们公司正在寻找AI技术合作伙伴，开发新一代智能客服系统……
      </view>
      <view class="tags">
        <text v-for="(tag, index) in tags" :key="index" class="tag">#{{ tag }}</text>
      </view>
      <view class="actions">
        <text class="action-btn" @click="likeCount++">👍 {{ likeCount }}</text>
        <text class="action-btn" @click="dislikeCount++">👎 {{ dislikeCount }}</text>
        <text class="action-btn">🔗 分享</text>
        <text class="action-btn">🔖 收藏</text>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="card">
      <view class="section-title">💬 评论 ({{ comments.length }})</view>
      <view v-for="(comment, index) in comments" :key="index" class="comment">
        <view class="comment-avatar" @click="showContact(comment.name)">
          {{ comment.name.charAt(0) }}
        </view>
        <view class="comment-content">
          <view class="comment-header">
            <text class="comment-name">{{ comment.name }}</text>
            <text class="comment-time">{{ comment.time }}</text>
          </view>
          <text class="comment-text">{{ comment.text }}</text>
          <view class="comment-actions">
            <text class="action-btn">💬 回复</text>
            <text class="action-btn" @click="comment.likes++">👍 {{ comment.likes }}</text>
          </view>
        </view>
      </view>

      <!-- 添加评论 -->
      <view class="add-comment">
        <input v-model="newComment" placeholder="发表评论..." class="comment-input" />
        <button @click="addComment">发送</button>
      </view>
    </view>

    <!-- 联系方式弹窗 -->
    <view class="modal" v-if="showModal" @click.self="closeContact">
      <view class="modal-card">
        <view class="modal-avatar">{{ contactName.charAt(0) }}</view>
        <view class="modal-name">{{ contactName }}</view>
        <view class="modal-info">
          <text>📞 138 **** 5678</text>
          <text>📧 {{ contactName.toLowerCase() }}@example.com</text>
          <text>🏢 创新科技有限公司</text>
          <text>📍 上海市浦东新区</text>
          <text>🔗 www.innotech-ai.com</text>
        </view>
        <button @click="closeContact">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const likeCount = ref(24)
const dislikeCount = ref(3)
const newComment = ref('')
const contactName = ref('')
const showModal = ref(false)

const tags = ['技术合作', 'AI开发', '商务合作', '智能客服']
const comments = ref([
  { name: '张经理', time: '45分钟前', text: '我们团队有5年AI客服系统开发经验……', likes: 5 },
  { name: '王总监', time: '30分钟前', text: '我们有成熟的NLP技术团队……', likes: 2 },
  { name: '李技术', time: '15分钟前', text: '我们专注语音交互系统，有专利技术……', likes: 1 },
  { name: '赵总', time: '10分钟前', text: '刚完成一个电商客服项目，支持多语言。', likes: 0 }
])

function goBack() {
  uni.navigateBack()
}

function showContact(name) {
  contactName.value = name
  showModal.value = true
}

function closeContact() {
  showModal.value = false
}

function addComment() {
  if (!newComment.value.trim()) return
  comments.value.unshift({
    name: '新用户',
    time: '刚刚',
    text: newComment.value,
    likes: 0
  })
  newComment.value = ''
}
</script>

<style scoped>
.page {
  padding: 0 30rpx 30rpx;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: linear-gradient(135deg, #ff6a00, #ff8c00);
  color: white;
  font-size: 36rpx;
  font-weight: bold;
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
}

.back-btn,
.more-btn {
  font-size: 40rpx;
}

.card {
  background: #fff;
  margin-top: 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.author {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  background: orange;
  color: white;
  border-radius: 50%;
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.info {
  margin-left: 20rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
}

.time {
  font-size: 24rpx;
  color: gray;
}

.content {
  font-size: 30rpx;
  margin: 20rpx 0;
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin: 20rpx 0;
}

.tag {
  background: #fff4ec;
  color: #ff6a00;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}

.actions {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;
}

.action-btn {
  font-size: 28rpx;
  color: #666;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.comment {
  display: flex;
  margin-bottom: 30rpx;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #ff8c00;
  color: white;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.comment-content {
  flex: 1;
  margin-left: 20rpx;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  margin-bottom: 10rpx;
}

.comment-text {
  font-size: 28rpx;
  background: #f8f8f8;
  padding: 20rpx;
  border-radius: 16rpx;
}

.comment-actions {
  display: flex;
  gap: 30rpx;
  margin-top: 10rpx;
  font-size: 26rpx;
}

.add-comment {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  gap: 20rpx;
}

.comment-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 20rpx;
  width: 80%;
  padding: 40rpx 20rpx;
  text-align: center;
}

.modal-avatar {
  font-size: 48rpx;
  background: orange;
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  border-radius: 50%;
  color: white;
  margin: 0 auto 20rpx;
}

.modal-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.modal-info text {
  display: block;
  font-size: 28rpx;
  margin: 10rpx 0;
}
</style>
