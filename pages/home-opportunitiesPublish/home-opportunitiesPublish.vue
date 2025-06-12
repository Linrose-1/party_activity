<<template>
  <view class="page">
    <!-- 顶部栏 -->
    <!-- <view class="header">
      <text class="header-title">发布新帖</text>
      <button class="close-btn" @click="onClose">×</button>
    </view> -->

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
          <text class="hint">支持Markdown格式，内容需大于20字</text>
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
            <image v-for="(img, i) in images" :key="i" :src="img" mode="aspectFill" class="preview-img" />
          </view>
          <button class="add-img-btn" @click="handleChooseImage" :disabled="images.length >= 6">选择图片 (最多6张)</button>
        </view>
      </view>

      <view class="form-card">
        <text class="section-title">其他设置</text>
        <view class="setting-item">
          <text class="setting-label">允许他人查看我的名片</text>
          <switch :checked="showProfile" @change="e => showProfile = e.detail.value" />
        </view>
        <view class="setting-item">
          <text class="setting-label">允许他人评论</text>
          <switch :checked="allowComments" @change="e => allowComments = e.detail.value" />
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
const tags = ref([])
const tagInput = ref('')
const images = ref([])
const showProfile = ref(true)
const allowComments = ref(true)

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
    count: 6 - images.value.length,
    success: res => {
      images.value = images.value.concat(res.tempFilePaths)
    }
  })
}

function submitPost() {
  if (!title.value) return uni.showToast({ title: '请输入标题', icon: 'none' })
  if (title.value.length > 50) return uni.showToast({ title: '标题不能超过50字', icon: 'none' })
  if (!content.value || content.value.length < 20) return uni.showToast({ title: '内容不能少于20字', icon: 'none' })
  if (tags.value.length === 0) return uni.showToast({ title: '请至少添加一个标签', icon: 'none' })

  uni.showToast({
    title: '发布成功',
    icon: 'success'
  })
  // 这里可调用后端API发布内容
}

function onClose() {
  uni.navigateBack()
}
</script>

<style scoped>
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
.preview-img {
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
}
.add-img-btn {
  margin-top: 16rpx;
  padding: 10rpx;
  background: #FF8C37;
  color: white;
  border-radius: 30rpx;
  text-align: center;
  font-size: 28rpx;
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
