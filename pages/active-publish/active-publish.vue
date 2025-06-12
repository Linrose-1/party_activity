<template>
  <view class="page">
    <!-- 表单内容 -->
    <view class="form-section">
      <view class="section-title">基本信息</view>

      <uni-forms>
        <uni-forms-item label="活动标题">
          <uni-easyinput v-model="form.title" placeholder="请输入活动标题" />
        </uni-forms-item>

        <uni-forms-item label="活动封面">
          <!-- <view class="cover-upload" @click="uploadCover">
            <text>{{ form.cover ? '已选择图片' : '点击上传封面图片' }}</text>
          </view> -->
		  <view class="cover-upload" @click="uploadCover">
		      <image v-if="form.cover" :src="form.cover" mode="aspectFill"></image>
		      <text v-else>点击上传封面图片</text>
		    </view>
        </uni-forms-item>

        <uni-forms-item label="活动时间">
          <uni-datetime-picker type="datetimerange" v-model="form.time" rangeSeparator="至" />
        </uni-forms-item>
		
		<uni-forms-item label="报名时间">
		  <uni-datetime-picker type="datetimerange" v-model="form.enrollTime" rangeSeparator="至" />
		</uni-forms-item>

        <uni-forms-item label="活动地点">
          <uni-easyinput v-model="form.location" placeholder="请输入活动地点" />
        </uni-forms-item>

        <uni-forms-item label="总名额">
          <uni-easyinput type="number" v-model="form.capacity" />
        </uni-forms-item>

        <uni-forms-item label="报名费用 (元)">
          <uni-easyinput type="number" v-model="form.fee" />
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="form-section">
      <view class="section-title">活动详情</view>
      <uni-forms-item label="活动介绍">
        <uni-easyinput type="textarea" autoHeight v-model="form.description" />
      </uni-forms-item>

      <view v-for="(item, index) in form.agenda" :key="index" class="activity-item">
        <view class="input-group">
          <uni-easyinput v-model="item.title" placeholder="环节标题" />
          <uni-easyinput v-model="item.desc" placeholder="环节描述" />
          <uni-icons type="close" @click="removeAgenda(index)" />
        </view>
      </view>

      <view class="add-btn" @click="addAgenda">
        <uni-icons type="plusempty" /><text>添加活动环节</text>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">组织者信息</view>

      <uni-forms>
        <uni-forms-item label="组织者姓名">
          <uni-easyinput v-model="form.organizer" />
        </uni-forms-item>

        <uni-forms-item label="组织单位">
          <uni-easyinput v-model="form.organization" />
        </uni-forms-item>

        <uni-forms-item label="联系电话">
          <uni-easyinput v-model="form.phone" />
        </uni-forms-item>

        <uni-forms-item label="收款码上传">
          <view class="cover-upload" @click="uploadCode">
              <image v-if="form.qrcode" :src="form.qrcode" mode="aspectFit"></image>
              <text v-else>点击上传收款码图片</text>
            </view>
        </uni-forms-item>
      </uni-forms>
    </view>
	
	<view class="form-section">
	  <view class="section-title">商圈信息</view>
	  <view style="font-size: 32rpx;color:darkgray;margin-bottom: 10rpx;">
	  	请选择聚店:
	  </view>
	
	  <!-- 搜索输入框 -->
	  <view class="search-bar">
	    <uni-easyinput
	      v-model="searchKeyword"
	      placeholder="搜索店铺名称"
	      @input="filterShops"
	    />
	  </view>
	  
	
	  <!-- 显示已选店铺 -->
	  <view class="selected-shop" v-if="form.businessName">
	    当前选择店铺：{{ form.businessName }}
	  </view>
	</view>


    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn save-btn" @click="saveDraft">保存草稿</view>
      <view class="action-btn publish-btn" @click="publish">发布活动</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const form = ref({
  title: '互联网创业者交流会',
  cover: '',
  enrollTime: ['2025-06-15 14:00:00', '2025-06-15 17:00:00'],
  time: ['2025-06-15 14:00:00', '2025-06-15 17:00:00'],
  location: '上海市浦东新区张江高科技园区',
  capacity: 50,
  fee: 100,
  description: `本次互联网创业者交流会旨在为行业内的创业者提供一个交流思想、分享经验的平台。...`,
  agenda: [
    { title: '主题演讲', desc: '行业大咖分享创业经验' },
    { title: '圆桌论坛', desc: '创业者互动讨论' },
    { title: '自由交流', desc: '拓展人脉资源' }
  ],
  organizer: '张经理',
  organization: '创新科技活动策划部',
  phone: '021-68881234',
  qrcode: '',
  businessName: '创客空间咖啡厅',
  businessAddress: '张江高科技园区88号',
  businessPhone: '021-68881234',
  businessHours: '09:00-22:00 (每日营业)'
})

function goBack() {
  uni.navigateBack()
}

function uploadCover() {
  uni.chooseImage({ count: 1, success: res => form.value.cover = res.tempFilePaths[0] })
}

function uploadCode() {
  uni.chooseImage({ count: 1, success: res => form.value.qrcode = res.tempFilePaths[0] })
}

function addAgenda() {
  form.value.agenda.push({ title: '', desc: '' })
}

function removeAgenda(index) {
  form.value.agenda.splice(index, 1)
}

function saveDraft() {
  uni.showToast({ title: '活动已保存为草稿', icon: 'none' })
}

function publish() {
  uni.showToast({ title: '活动发布成功！', icon: 'success' })
  // 可在此处提交表单并跳转页面
}

const searchKeyword = ref('')
const filteredShops = ref([])

async function searchShops() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    filteredShops.value = []
    return
  }

  // 模拟请求，可替换为真实接口调用
  try {
    const res = await uni.request({
      url: 'https://your-api.com/api/shops/search',
      method: 'GET',
      data: { keyword },
    })

    filteredShops.value = res.data?.shops || []
  } catch (e) {
    uni.showToast({ title: '搜索失败', icon: 'none' })
  }
}


function selectShop(shop) {
  form.value.businessName = shop.name
  uni.showToast({ title: `已选择：${shop.name}`, icon: 'none' })
}

</script>

<style lang="scss" scoped>
.page {
  background-color: #f8f8f8;
  padding-bottom: 160rpx;
}
.top-nav {
  background-color: #FF6F00;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  font-size: 32rpx;
}
.page-title {
  flex: 1;
  text-align: center;
  font-weight: bold;
}
.form-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6F00;
  margin-bottom: 20rpx;
  border-left: 10rpx solid #FF6F00;
  padding-left: 20rpx;
}
.cover-upload {
  border: 2rpx dashed #ccc;
  border-radius: 16rpx;
  background-color: #fafafa;
  color: #999;
  
  // 移除 padding，因为现在图片会直接填充这个区域
  // padding: 30rpx; 

  // 定义上传区域的固定尺寸，图片会尝试填充这个尺寸
  width: 100%; // 宽度占满父容器
  height: 200rpx; // 设定一个固定的高度，你可以根据需要调整

  // 使用 Flexbox 来居中文本或图片
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  
  // 确保图片超出区域时被裁剪，尤其对于 aspectFill
  overflow: hidden; 
  
  // 让整个区域可点击
  cursor: pointer;

  // 如果有文本，设置文本样式
  text {
    font-size: 28rpx;
    // 可以添加一些样式让文本更突出
  }

  // 图片在 .cover-upload 内部的样式
  image {
    width: 100%; /* 图片宽度填充容器 */
    height: 100%; /* 图片高度填充容器 */
    // uni-app 的 `mode` 属性已经处理了 `object-fit`，所以这里通常不需要再写 `object-fit`
    // object-fit: cover; // 如果 mode="aspectFill" 则相当于这个
    // object-fit: contain; // 如果 mode="aspectFit" 则相当于这个
  }
}
// .cover-upload {
//   border: 2rpx dashed #ccc;
//   padding: 30rpx;
//   border-radius: 16rpx;
//   text-align: center;
//   background-color: #fafafa;
//   color: #999;
// }
.activity-item {
  margin: 20rpx 0;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF6F00;
  font-weight: bold;
  margin-top: 20rpx;
  gap: 10rpx;
}
.action-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  box-shadow: 0 -5rpx 10rpx rgba(0, 0, 0, 0.05);
}
.action-btn {
  flex: 1;
  margin:  10rpx;
  padding: 24rpx;
  text-align: center;
  border-radius: 16rpx;
  font-weight: bold;
  font-size: 28rpx;
}
.save-btn {
  background-color: #f0f0f0;
  color: #666;
}
.publish-btn {
  background-color: #FF6F00;
  color: #fff;
}

.search-bar {
  margin-bottom: 20rpx;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.shop-item {
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 16rpx;
  font-size: 28rpx;
  cursor: pointer;
}

.shop-item.selected {
  background-color: #FF6F00;
  color: #fff;
  font-weight: bold;
}

.selected-shop {
  margin-top: 20rpx;
  color: #666;
  font-size: 26rpx;
}

</style>
