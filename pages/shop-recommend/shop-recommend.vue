<template>
  <view class="container">
    <!-- 表单容器 -->
    <view class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- 店铺名称 -->
        <view class="form-group">
          <uni-label>店铺名称</uni-label>
          <uni-easyinput 
            type="text" 
            v-model="form.name" 
            placeholder="请输入店铺名称" 
            :inputBorder="false"
            required
          />
        </view>

        <!-- 店铺地址 -->
        <view class="form-group">
          <uni-label>店铺地址</uni-label>
          <uni-easyinput 
            type="text" 
            v-model="form.address" 
            placeholder="请输入详细地址" 
            :inputBorder="false"
            required
          />
        </view>

        <!-- 推荐理由 -->
        <view class="form-group">
          <uni-label>推荐理由</uni-label>
          <uni-easyinput 
            type="textarea" 
            v-model="form.reason" 
            placeholder="请输入推荐理由，如特色服务、环境氛围等"
            :inputBorder="false"
            required
          />
        </view>

        <!-- 提交按钮 -->
        <button form-type="submit" class="submit-btn">
          <uni-icons type="paperplane" size="16" color="#fff"></uni-icons>
          提交推荐
        </button>
      </form>
    </view>

    <!-- 页脚 -->
    <view class="footer">
      感谢你的推荐，审核通过后将展示在首页
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 表单数据
const form = ref({
  name: '',
  address: '',
  reason: ''
})

// 提交表单
const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.address.trim() || !form.value.reason.trim()) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  // 这里可以添加提交到服务器的逻辑
  console.log('提交数据:', form.value)
  
  uni.showModal({
    title: '推荐提交成功',
    content: `店铺：${form.value.name}\n地址：${form.value.address}\n理由：${form.value.reason}`,
    showCancel: false,
    success: () => {
      // 清空表单
      form.value = {
        name: '',
        address: '',
        reason: ''
      }
    }
  })
}

// 页面加载时执行
onLoad(() => {
  // 可以在这里初始化数据
})
</script>

<style lang="scss">
/* 使用 SCSS 变量 */
$primary: #FF6B00;
$primary-light: #FF8A33;
$light-bg: #f8f8f8;
$dark-text: #333;
$gray-text: #666;
$border: #eee;

.container {
  background-color: $light-bg;
  min-height: 100vh;
  padding-bottom: 40px;
}

.form-container {
  padding: 20px;
  background: white;
  margin: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 20px;
  
  // 自定义 uni-easyinput 样式
  :deep(.uni-easyinput) {
    border: 1px solid $border;
    border-radius: 8px;
    padding: 10px;
    
    &.is-input-border {
      border: 1px solid $border;
    }
  }
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: $primary;
  color: white;
  padding: 8px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  transition: background 0.3s;
  
  &:active {
    background: $primary-light;
  }
}

.footer {
  text-align: center;
  color: $gray-text;
  font-size: 13px;
  margin-top: 40px;
  padding: 0 20px;
}

// 自定义导航栏样式
:deep(.uni-nav-bar) {
  .uni-nav-bar--fixed {
    background-color: white;
    border-bottom: 1px solid $border;
  }
  
  .uni-nav-bar-text {
    font-weight: bold;
    font-size: 18px;
  }
}
</style>