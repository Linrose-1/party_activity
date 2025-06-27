<template>
  <view class="activity-card">
    <!-- 【修改】将点击事件的参数传入 -->
    <view @click="detailActivity(activity.id)">
      <!-- 【修改】绑定正确的图片字段 -->
      <image :src="activity.coverImageUrl" class="activity-image" mode="aspectFill" />
      <!-- 【修改】绑定正确的标题字段 -->
      <text class="activity-title">{{ activity.activityTitle }}</text>
      
      <view class="activity-info">
        <uni-icons type="calendar" size="16" color="#FF6B00" />
        <!-- 【修改】使用格式化后的日期 -->
        <text>{{ formattedDate }}</text>
      </view>
      
      <view class="activity-info">
        <uni-icons type="map-pin" size="16" color="#FF6B00" />
        <!-- 【修改】绑定正确的地点字段 (请确认API是否返回了 location 字段) -->
        <text>{{ activity.location || '线上活动' }}</text>
      </view>
      
      <view class="activity-stats">
        <!-- 
          【关键修改】
          不再使用嵌套的 participants 对象，而是使用后端直接返回的字段。
          - participantCount: 当前参与人数
          - maxParticipants: 总人数
          使用 || 提供了默认值，防止后端没返回该字段时报错。
        -->
        <view class="participants">
          {{ activity.participantCount || 0 }}/{{ activity.maxParticipants || '不限' }} 人参与
        </view>
      </view>
      
      <!-- 
        【修改】后端数据中没有 tags 数组，暂时注释掉。
        您可以根据需要，将 categoryName 等字段作为标签展示。
        例如: <view class="tag">{{ activity.categoryName }}</view>
      -->
      <!--
      <view class="activity-tags">
        <view v-for="(tag, index) in activity.tags" :key="index" class="tag">
          {{ tag }}
        </view>
      </view>
      -->
    </view>
    
    <view class="activity-footer">
      <view class="organizer">
        <uni-icons type="person" size="16" color="#FF6B00" />
        <!-- 
          【修改】绑定正确的组织者字段。
          请根据API确认是 organizer 还是 organizerName 或其他。
        -->
        <text>{{ activity.organizerName || '主办方' }}</text>
      </view>
      <view class="action-buttons">
        <button class="btn btn-favorite" @click.stop="toggleFavorite">
          <uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="16" color="#FF6B00" />
          <text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </button>
        <!-- 【修改】将点击事件的参数传入 -->
        <button class="btn btn-primary" @click.stop="registerActivity(activity.id)">报名</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['favorite']);

const isFavorite = ref(false);

// 【新增】格式化日期
const formattedDate = computed(() => {
	if (!props.activity.startDatetime) {
		return '时间待定';
	}
	const date = new Date(props.activity.startDatetime);
	const Y = date.getFullYear();
	const M = (date.getMonth() + 1).toString().padStart(2, '0');
	const D = date.getDate().toString().padStart(2, '0');
	const h = date.getHours().toString().padStart(2, '0');
	const m = date.getMinutes().toString().padStart(2, '0');
	return `${Y}-${M}-${D} ${h}:${m}`;
});


const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  emit('favorite', isFavorite.value);
};

// 【修改】接收活动ID，用于跳转传参
const registerActivity = (activityId) => {
  uni.navigateTo({
    url:`/pages/active-enroll/active-enroll?id=${activityId}`
  })
};

// 【修改】接收活动ID，用于跳转传参
const detailActivity = (activityId) => {
  uni.navigateTo({
    url: `/pages/active-detail/active-detail?id=${activityId}`
  });
};
</script>

<style lang="scss" scoped>
/* 您的样式代码保持不变，这里省略以保持简洁 */
.activity-card {
  background: white;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
  padding: 32rpx;
  margin: 32rpx auto;
  position: relative;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: 320rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.activity-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: #1c1e21;
  display: block;
}

.activity-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  color: #606770;
  font-size: 28rpx;
  
  text {
    margin-left: 16rpx;
  }
}

.activity-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  font-size: 26rpx;
  color: #65676b;
}

.participants {
  background: #f0f2f5;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.activity-tags {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
}

.tag {
  background: #fff0e5;
  color: #FF6B00;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: 2rpx solid #ffdcc7;
}

/* 底部区域样式 */
.activity-footer {
  display: flex;
  justify-content: space-between; /* 左右两端对齐 */
  align-items: center; /* 垂直居中 */
  margin-top: 30rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f2f5; /* 添加分割线 */
}

.organizer {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #606770;
  
  text {
    margin-left: 10rpx;
  }
}

/* 按钮区域样式 */
.action-buttons {
  display: flex;
  gap: 24rpx; /* 恢复按钮间距 */
}

/* 基础按钮样式 */
.btn {
  padding: 8rpx 36rpx;
  border-radius: 12rpx;
  font-weight: 500;
  font-size: 28rpx;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  
  text {
    margin-left: 10rpx;
  }
}

/* 主要按钮样式 (报名按钮) */
.btn-primary {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  
  &:active {
    opacity: 0.9;
    transform: translateY(-4rpx);
  }
}

/* 收藏按钮样式 */
.btn-favorite {
  background: #ffe7d8;
  color: #FF6B00;
  
  &:active {
    opacity: 0.9;
    transform: translateY(-4rpx);
  }
}
</style>