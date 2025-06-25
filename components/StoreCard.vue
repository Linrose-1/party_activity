<template>
  <view class="store-item" @click="navigateToStoreDetail">
    <view class="store-content">
      <view class="store-header">
        <view class="store-name">
          <uni-icons :type="store.icon" size="20" color="#FF6B00"></uni-icons>
          <text>{{ store.storeName }}</text>
        </view>
        <view class="distance">
          <uni-icons type="location-filled" size="16" color="#FF6B00"></uni-icons>
          <text>{{ store.distance }}</text>
        </view>
      </view>
      <view class="store-desc">
        {{ store.storeDescription }}
      </view>
      <view class="store-footer">
        <view class="store-tags">
          <view class="store-tag" v-for="tag in store.tags" :key="tag">{{ tag }}</view>
        </view>
        <button class="nav-btn" @click.stop="navigateToMap">
          <uni-icons type="map-filled" size="16" color="#fff"></uni-icons>
          <text>导航</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  store: {
    type: Object,
    required: true,
  },
});

const navigateToStoreDetail = () => {
  uni.navigateTo({
  	url:'/pages/shop-detail/shop-detail'
  })
};

const navigateToMap = () => {
  uni.showToast({
    title: `即将打开地图导航到 ${props.store.name}`,
    icon: 'none',
  });
  console.log(`即将打开地图导航到 ${props.store.name}`);
  // 在实际应用中，你将在此处使用 uni.openLocation API
  /*
  uni.openLocation({
    latitude: 23.123, // 替换为实际的聚店坐标
    longitude: 113.333, // 替换为实际的聚店坐标
    name: props.store.name,
    address: '聚店地址', // 替换为实际的聚店地址
    success: function () {
      console.log('success');
    },
    fail: function () {
      console.log('fail');
    }
  });
  */
};
</script>

<style lang="scss" scoped>
/* Scoped styles 意味着它们只适用于此组件 */
:root {
    --primary: #FF6B00;
    --primary-light: #FF8A33;
    --light-bg: #f8f8f8;
    --dark-text: #333;
    --gray-text: #666;
    --light-text: #999;
    --border: #eee;
    --weui-BG-0: #ededed;
    --weui-BG-1: #f7f7f7;
}

.store-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.store-item:active {
  transform: scale(0.98);
}

.store-content {
  padding: 15px;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.store-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-text);
  display: flex;
  align-items: center;
}

.store-name .uni-icons {
  margin-right: 8px;
}

.distance {
  color: var(--primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.distance .uni-icons {
  margin-right: 4px;
}

.store-desc {
  font-size: 14px;
  color: var(--gray-text);
  margin-bottom: 15px;
  line-height: 1.5;
  /* 对于 uni-app 中的多行省略号，使用 text-overflow: ellipsis 配合 -webkit-line-clamp */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed #ffe8d9;
}

.store-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.store-tag {
  background: #fff5ec;
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.nav-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 6px 18px;
  border-radius: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  line-height: 1; /* 调整按钮行高 */
  margin: 0; /* 重置按钮默认边距 */
}

.nav-btn::after {
  border: none; /* 移除 uni-app 按钮默认边框 */
}

.nav-btn .uni-icons {
  margin-right: 5px;
}
</style>