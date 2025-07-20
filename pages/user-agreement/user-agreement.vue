<template>
  <view class="page-container">
    <!-- 顶部分页 Tab -->
    <view class="tabs-container">
      <view
        class="tab-item"
        :class="{ active: currentTab === 0 }"
        @click="switchTab(0)"
      >
        用户协议
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 1 }"
        @click="switchTab(1)"
      >
        隐私政策
      </view>
    </view>

    <!-- 协议内容滚动区域 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 用户协议内容 -->
      <view class="agreement-content" v-show="currentTab === 0">
        <rich-text :nodes="userAgreement"></rich-text>
      </view>
	  
      <!-- 隐私政策内容 -->
	  <view class="agreement-content" v-show="currentTab === 1">
	    <rich-text :nodes="privacyPolicy"></rich-text>
	  </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '../../utils/request.js';

// 当前激活的 tab 索引，0: 用户协议, 1: 隐私政策
const currentTab = ref(0)
const userAgreement = ref('') // 初始化为空字符串，避免 rich-text 报错
const privacyPolicy = ref('') // 初始化为空字符串

// 切换 Tab 的方法
const switchTab = (index) => {
  currentTab.value = index
}

onLoad((options) => {
	if (options && options.tab) {
	    // 将字符串参数转为数字，并设置为当前 tab 的初始值
	    // 使用 parseInt 确保得到的是数字类型
	    const initialTab = parseInt(options.tab, 10);
	    // 做个简单的校验，防止传入无效值
	    if (!isNaN(initialTab) && (initialTab === 0 || initialTab === 1)) {
	        currentTab.value = initialTab;
	    }
	  }
  // 页面加载时同时获取两个协议的内容
  getUserAgreement()
  getPrivacyPolicy()
})

const getUserAgreement = async () => {
  const result = await request('/app-api/member/config/userAgreement', {
    method: 'GET',
  });
  if (result && result.data) {
    userAgreement.value = result.data
  } else {
    console.log('获取用户协议失败:', result?.error || '返回数据格式不正确');
  }
};

const getPrivacyPolicy = async () => {
  const result = await request('/app-api/member/config/privacyPolicy', {
    method: 'GET',
  });
  if (result && result.data) {
    privacyPolicy.value = result.data
  } else {
    console.log('获取隐私政策失败:', result?.error || '返回数据格式不正确');
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

// Tab 容器样式
.tabs-container {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5; // 添加一个底部分割线
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  
  .tab-item {
    flex: 1;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #666;
    text-align: center;
    position: relative;
    transition: color 0.3s, font-weight 0.3s;
    
    // 激活状态的 Tab
    &.active {
      color: #007aff; // 主题色
      font-weight: bold;
      
      // 激活状态的下划线指示器
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80rpx;
        height: 6rpx;
        background-color: #007aff;
        border-radius: 3rpx;
      }
    }
  }
}

.content-scroll {
  flex: 1;
  // 修复在某些安卓机型上的高度计算问题
  height: 0; 
  padding: 30rpx;
  box-sizing: border-box;
}

// 协议内容的样式保持不变，因为样式本身写得很好
.agreement-content {
  color: #333;
  font-size: 28rpx;
  line-height: 1.8;

  // ... (您原来的 h1, h2, p, ul, strong 样式可以原封不动地放在这里)
  // 为了简洁，这里省略，请将您原来的样式复制到此处
  
  // rich-text 内部的标签在小程序中无法直接通过组件样式渗透
  // 如果需要修改 h1, p 等标签样式，需要在 rich-text 的 string 类型的 nodes 中内联 style
  // 或者使用插件 https://uniapp.dcloud.net.cn/component/rich-text.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
}
</style>