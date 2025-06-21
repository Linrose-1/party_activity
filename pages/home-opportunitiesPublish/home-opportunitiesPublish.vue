<template>
  <view class="page">
    <!-- 顶部栏 (注释掉的部分保持不变) -->
    <!-- <view class="header"> ... </view> -->

    <!-- 内容卡片 -->
    <view class="form-container">
      <view class="form-card">
        <view class="form-group">
          <view class="form-label">帖子标题</view>
          <input v-model="title" class="form-input" placeholder="请输入标题（最多50字）" maxlength="50" />
          <text class="hint">清晰明了的标题能吸引更多关注</text>
        </view>

        <view class="form-group">
          <view class="form-label">帖子内容</view>
          <textarea v-model="content" class="form-textarea" placeholder="详细描述您的商机、需求或经验分享..." />
          <text class="hint">内容需大于20字</text>
        </view>

        <!-- 新增：选择专题 -->
        <view class="form-group">
          <view class="form-label">选择专题</view>
          <radio-group @change="topicChange" class="radio-group-container">
            <label class="radio-item">
              <radio value="普通商机" :checked="topic === '普通商机'" color="#FF6A00" />
              <text>普通商机</text>
            </label>
            <label class="radio-item">
              <radio value="创业猎伙" :checked="topic === '创业猎伙'" color="#FF6A00" />
              <text>创业猎伙</text>
            </label>
          </radio-group>
        </view>

        <view class="form-group">
          <view class="form-label">添加标签</view>
          <view class="tags-container">
            <view v-for="(tag, index) in tags" :key="index" class="tag">
              {{ tag }}
              <text class="tag-remove" @click="removeTag(index)">×</text>
            </view>
          </view>
          <view class="tag-input-container">
            <input v-model="tagInput" class="tag-input" placeholder="输入标签（如 #合作）" />
            <button class="add-tag-btn" @click="addTag">添加</button>
          </view>
          <text class="hint">添加1-5个标签，让更多人发现您的帖子</text>
        </view>

        <view class="form-group">
          <view class="form-label">上传图片</view>
          <view class="image-preview">
            <!-- 图片预览区域 -->
            <view v-for="(img, i) in images" :key="i" class="image-wrapper">
              <image :src="img" mode="aspectFill" class="preview-img" @click="replaceImage(i)" />
              <view class="delete-image-btn" @click.stop="deleteImage(i)">×</view>
            </view>
            <!-- 添加图片按钮占位符 -->
            <view class="add-img-placeholder" @click="handleChooseImage" v-if="images.length < 9">
              <i class="fas fa-plus"></i> <!-- 假设已引入Font Awesome -->
              <text>添加图片</text>
            </view>
          </view>
          <text class="hint">最多可上传9张图片</text>
        </view>
      </view>

      <view class="form-card">
        <text class="section-title">其他设置</text>
        <view class="setting-item">
          <text class="setting-label">允许他人查看我的名片</text>
          <switch :checked="showProfile" @change="e => showProfile = e.detail.value" color="#FF6A00" />
        </view>
        <view class="setting-item">
          <text class="setting-label">允许他人评论</text>
          <switch :checked="allowComments" @change="e => allowComments = e.detail.value" color="#FF6A00" />
        </view>
      </view>

      <button class="submit-btn" @click="submitPost">发布帖子</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('')
const content = ref('')
const topic = ref('普通商机') // 新增：专题选择，默认'普通商机'
const tags = ref([])
const tagInput = ref('')
const images = ref([])
const showProfile = ref(true)
const allowComments = ref(true)

// 新增：处理专题选择变化的函数
function topicChange(e) {
  topic.value = e.detail.value
}

function addTag() {
  let val = tagInput.value.trim()
  if (!val) return uni.showToast({ title: '请输入标签', icon: 'none' })
  if (tags.value.length >= 5) return uni.showToast({ title: '最多添加5个标签', icon: 'none' })
  if (!val.startsWith('#')) val = '#' + val
  if (tags.value.includes(val)) return uni.showToast({ title: '标签已存在', icon: 'none' })
  tags.value.push(val)
  tagInput.value = ''
}

function removeTag(index) {
  tags.value.splice(index, 1)
}

function handleChooseImage() {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      images.value = images.value.concat(res.tempFilePaths)
    },
    fail: (err) => {
      console.log("取消选择图片", err);
    }
  })
}

function deleteImage(index) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        images.value.splice(index, 1)
        uni.showToast({ title: '图片已删除', icon: 'none' })
      }
    }
  })
}

function replaceImage(index) {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      images.value[index] = res.tempFilePaths[0]
      uni.showToast({ title: '图片已替换', icon: 'none' })
    },
    fail: (err) => {
      console.log("取消替换图片", err);
    }
  })
}

// 修改：发布帖子的函数，增加了校验和打印逻辑
function submitPost() {
  // 1. 必填项校验
  if (!title.value.trim()) return uni.showToast({ title: '请输入帖子标题', icon: 'none' })
  if (title.value.length > 50) return uni.showToast({ title: '标题不能超过50字', icon: 'none' })
  if (!content.value.trim() || content.value.length < 20) return uni.showToast({ title: '内容不能少于20字', icon: 'none' })
  if (!topic.value) return uni.showToast({ title: '请选择一个专题', icon: 'none' })
  if (tags.value.length === 0) return uni.showToast({ title: '请至少添加一个标签', icon: 'none' })
  
  // 2. 构造要提交的表单数据
  const postData = {
    title: title.value,
    content: content.value,
    topic: topic.value,
    tags: tags.value,
    images: images.value,
    settings: {
      showProfile: showProfile.value,
      allowComments: allowComments.value
    }
  };

  // 3. 在控制台打印完整的表单数据
  console.log('--- 准备发布的帖子表单数据 ---');
  console.log(postData);
  
  // 4. 提示发布成功 (之后可以对接后端API)
  uni.showToast({
    title: '发布成功',
    icon: 'success'
  })

  // 这里可以调用后端API发布内容
  // api.createPost(postData).then(res => { ... })
}
</script>

<style scoped>
/* 原有样式保持不变 */
.page {
  padding: 20rpx;
  background-color: #f9f9f9;
}
.header {
  background: linear-gradient(135deg, #FF6A00, #FF8C37);
  color: white;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}
.header-title {
  font-size: 36rpx;
  font-weight: bold;
}
.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50rpx;
  height: 50rpx;
  font-size: 28rpx;
  color: white;
  text-align: center;
}
.form-container {
  /* margin-top: 20rpx; */
}
.form-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.05);
}
.form-label {
  font-size: 28rpx;
  margin-top: 10rpx;
  display: block;
  color: #666;
  margin-bottom: 10rpx; /* 为label增加一点下边距 */
}
.form-input,
.form-textarea {
  width: 95%;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}
.form-textarea {
  min-height: 180rpx;
}
.hint {
  font-size: 24rpx;
  color: #999;
}
/* 新增：单选框组样式 */
.radio-group-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 40rpx; /* 选项之间的间距 */
  margin-top: 10rpx;
}
.radio-item {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}
.radio-item text {
  margin-left: 10rpx;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 10rpx 0;
}
.tag {
  background: #fff0e6;
  color: #FF6A00;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
}
.tag-remove {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #888;
}
.tag-input-container {
  display: flex;
  margin-top: 10rpx;
}
.tag-input {
  flex: 1;
  border: 1rpx solid #e0e0e0;
  border-top-left-radius: 20rpx;
  border-bottom-left-radius: 20rpx;
  padding: 16rpx;
  font-size: 26rpx;
}
.add-tag-btn {
  background: #FF6A00;
  color: white;
  padding: 0 30rpx;
  border-top-right-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  font-size: 26rpx;
}
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 10rpx;
}
.image-wrapper {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.preview-img {
  width: 100%;
  height: 100%;
  display: block;
}
.delete-image-btn {
  position: absolute;
  top: 0rpx;
  right: 0rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 0 12rpx 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  z-index: 10;
}
.delete-image-btn:active {
    background-color: rgba(0, 0, 0, 0.7);
}
.add-img-placeholder {
  width: 150rpx;
  height: 150rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.add-img-placeholder i {
    font-size: 48rpx;
    margin-bottom: 10rpx;
    color: inherit;
}
.add-img-placeholder text {
    font-size: 24rpx;
}
.add-img-placeholder:active {
    border-color: #FF6A00;
    color: #FF6A00;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.setting-label {
  font-size: 28rpx;
  color: #555;
}
.submit-btn {
  background: linear-gradient(to right, #FF6A00, #FF8C37);
  color: white;
  border-radius: 30rpx;
  padding: 14rpx;
  font-size: 30rpx;
  width: 100%;
  text-align: center;
  font-weight: 600;
  margin-top: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.3);
}
</style>