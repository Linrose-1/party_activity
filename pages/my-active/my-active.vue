<template>
  <view class="page-container">
    
    <!-- 分段器 -->
    <view class="segmented-container">
      <uni-segmented-control 
        :current="currentTab" 
        :values="tabs" 
        @clickItem="switchTab"
        style-type="button"
        active-color="#FF6B00"
      />
    </view>
    
    <!-- 我的报名活动 -->
    <view 
      v-show="currentTab === 0" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onReachBottom"
    >
      <view class="section-header">
        <text class="section-title">✍️ 我报名的活动</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-if="enrolledActivities.length > 0" class="activity-list">
        <view 
          v-for="(item, index) in enrolledActivities" 
          :key="item.id"
          class="activity-item"
          @click="handleActivityClick(item.id)"
        >
          <image class="activity-image" :src="item.coverImageUrl" mode="aspectFill" />
          
          <view class="activity-content">
            <view class="activity-header">
              <text class="activity-title">{{ item.activityTitle }}</text>
              <!-- 【核心修改】直接使用 statusStr，并传入 getStatusClass -->
              <view :class="['status-tag', getStatusClass(item.statusStr)]">
                {{ item.statusStr }}
              </view>
            </view>
            
            <view class="activity-info">
              <uni-icons type="calendar" size="16" color="#999" />
              <text class="info-text">{{ formatDateTime(item.startDatetime) }}</text>
            </view>
            
            <view class="activity-info">
              <uni-icons type="map-pin" size="16" color="#999" />
              <text class="info-text">{{ item.locationAddress || '线上活动' }}</text>
            </view>
            
            <view class="activity-footer">
              <view class="participants">
                <uni-icons type="people" size="16" color="#999" />
                <text>{{ item.joinCount || 0 }}/{{ item.totalSlots || '不限' }}人</text>
              </view>
              
              <view class="action-buttons">
                <!-- 【核心修改】v-if 条件使用字符串判断 -->
                <button 
                  v-if="['报名中', '即将开始', '进行中'].includes(item.statusStr)" 
                  class="btn btn-cancel" 
                  @click.stop="cancelEnroll(item.id)"
                >
                  取消报名
                </button>
                 <button 
                  v-if="item.statusStr === '待退款'" 
                  class="btn btn-refund-apply" 
                  @click.stop="applyForRefund(item.id)"
                >
                  申请退款
                </button>
                <button class="btn btn-detail" @click.stop="viewDetail(item.id)">
                  查看详情
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state-placeholder">
        <text class="empty-title">暂无报名活动</text>
        <text class="empty-desc">快去发现并报名感兴趣的活动吧</text>
        <button class="primary-btn" @click="navigateToDiscover">去发现</button>
      </view>
      
    </view>
    
    <!-- 我的发布活动 -->
    <view 
      v-show="currentTab === 1" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onReachBottom"
    >
      <view class="section-header">
        <text class="section-title">📢 我发布的活动</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-if="publishedActivities.length > 0" class="activity-list">
        <view 
          v-for="(item, index) in publishedActivities" 
          :key="item.id"
          class="activity-item"
          @click="handleActivityClick(item.id)"
        >
          <image class="activity-image" :src="item.coverImageUrl" mode="aspectFill" />
          
          <view class="activity-content">
            <view class="activity-header">
              <text class="activity-title">{{ item.activityTitle }}</text>
              <view :class="['status-tag', getStatusClass(item.statusStr)]">
                {{ item.statusStr }}
              </view>
            </view>
            
            <view class="activity-info">
              <uni-icons type="calendar" size="16" color="#999" />
              <text class="info-text">{{ formatDateTime(item.startDatetime) }}</text>
            </view>
            
            <view class="activity-info">
              <uni-icons type="map-pin" size="16" color="#999" />
              <text class="info-text">{{ item.locationAddress || '线上活动' }}</text>
            </view>
            
            <view class="activity-footer">
              <view class="participants">
                <uni-icons type="people" size="16" color="#999" />
                <text>{{ item.joinCount || 0 }}/{{ item.totalSlots || '不限' }}人</text>
              </view>
              
              <view class="action-buttons">
				 <button 
				    v-if="item.statusStr === '待退款' && item.paddingReturnCount > 0"
				    class="btn btn-approval" 
				    @click.stop="manageRefunds(item.id, 'individual')"
				  >
				    处理申请 <uni-badge class="badge" :text="item.paddingReturnCount" type="error"></uni-badge>
				  </button>
				  
				  <button 
				    v-if="['未开始', '报名中', '即将开始', '进行中'].includes(item.statusStr)"
				    class="btn btn-cancel" 
				    @click.stop="cancelActivity(item.id)"
				  >
				    取消活动
				  </button>
				  
				  <button 
				    v-if="item.statusStr === '已取消'"
				    class="btn btn-refund-manage" 
				    @click.stop="manageRefunds(item.id, 'all')"
				  >
				    处理退款
				  </button>
                
                <button class="btn btn-detail" @click.stop="viewDetail(item.id)">
                  查看详情
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state-placeholder">
        <text class="empty-title">暂无发布活动</text>
        <text class="empty-desc">创建一个活动，邀请大家参与吧</text>
        <button class="primary-btn" @click="navigateToCreate">创建活动</button>
      </view>
      
    </view>
    
    <view v-if="loading" class="loading-more">加载中...</view>
    
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request.js';

// --- 状态管理 ---
const currentTab = ref(0);
const tabs = ref(['我的报名', '我的发布']);
const refreshing = ref(false);
const loading = ref(false); 

const enrolledActivities = ref([]);
const enrolledPageNo = ref(1);
const enrolledHasMore = ref(true);

const publishedActivities = ref([]);
const publishedPageNo = ref(1);
const publishedHasMore = ref(true);

// --- 核心方法：获取数据 ---
const getMyActivitiesList = async (isLoadMore = false) => {
  if (loading.value) return;

  const hasMore = currentTab.value === 0 ? enrolledHasMore.value : publishedHasMore.value;
  if (isLoadMore && !hasMore) {
    uni.showToast({ title: '没有更多数据了', icon: 'none' });
    return;
  }
  
  loading.value = true;

  const pageNo = currentTab.value === 0 ? enrolledPageNo.value : publishedPageNo.value;
  const params = {
    pageNo: pageNo,
    pageSize: 10,
    tabIndex: currentTab.value
  };

  try {
    const result = await request('/app-api/member/activity/my-list', {
      method: 'GET',
      data: params
    });

    if (result && !result.error && result.data) {
      const list = result.data.list || [];
      const total = result.data.total || 0;

      if (currentTab.value === 0) {
        enrolledActivities.value = isLoadMore ? [...enrolledActivities.value, ...list] : list;
        enrolledHasMore.value = enrolledActivities.value.length < total;
        if(list.length > 0) enrolledPageNo.value++;
      } else {
        publishedActivities.value = isLoadMore ? [...publishedActivities.value, ...list] : list;
        publishedHasMore.value = publishedActivities.value.length < total;
        if(list.length > 0) publishedPageNo.value++;
      }
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// --- 事件处理 ---
const switchTab = (e) => {
  currentTab.value = e.currentIndex;
  const list = currentTab.value === 0 ? enrolledActivities.value : publishedActivities.value;
  if (list.length === 0) {
    getMyActivitiesList(false);
  }
};

const onRefresh = () => {
  refreshing.value = true;
  if (currentTab.value === 0) {
    enrolledPageNo.value = 1;
  } else {
    publishedPageNo.value = 1;
  }
  getMyActivitiesList(false);
};

const onReachBottom = () => {
  getMyActivitiesList(true);
};

// --- 辅助方法 ---

// 【核心修改】删除 getStatusText 函数

// 【核心修改】修改 getStatusClass，使其接收字符串并返回类名
const getStatusClass = (statusStr) => {
  const classMap = {
    '已取消': 'canceled',
    '未开始': 'upcoming',
    '报名中': 'enrolled',
    '即将开始': 'upcoming', // '即将开始' 也使用 'upcoming' 样式
    '进行中': 'ongoing',
    '已结束': 'ended',
    '待退款': 'refund_pending'
  };
  return classMap[statusStr] || ''; // 如果没有匹配，返回空字符串
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '时间待定';
  // 【修改】直接使用时间戳进行格式化
  const date = new Date(dateTimeStr);
	const Y = date.getFullYear();
	const M = (date.getMonth() + 1).toString().padStart(2, '0');
	const D = date.getDate().toString().padStart(2, '0');
	const h = date.getHours().toString().padStart(2, '0');
	const m = date.getMinutes().toString().padStart(2, '0');
	return `${Y}-${M}-${D} ${h}:${m}`;
};

// --- 页面跳转与操作 ---
const handleActivityClick = (activityId) => {
  uni.navigateTo({ url: `/pages/active-detail/active-detail?id=${activityId}` });
};

const viewDetail = (activityId) => {
  uni.navigateTo({ url: `/pages/active-detail/active-detail?id=${activityId}` });
};

const cancelEnroll = (activityId) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消报名吗？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在提交...' });
        const result = await request('/app-api/member/activity/quit-activity', {
            method: 'POST',
            data: { id: activityId }
        });
        uni.hideLoading();

        if(result && !result.error) {
            uni.showToast({ title: '取消成功', icon: 'success' });
            onRefresh();
        } else {
            uni.showToast({ title: result.error || '操作失败', icon: 'none' });
        }
      }
    }
  });
};

const applyForRefund = (activityId) => {
  uni.navigateTo({ url: `/pages/my-active-apply/my-active-apply?id=${activityId}` });
};

const cancelActivity = (activityId) => {
  uni.showModal({
    title: '警告',
    content: '确定要取消您发布的此活动吗？此操作不可逆。',
    confirmColor: '#f44336',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在删除...' });
        const result = await request('/app-api/member/activity/delete', {
            method: 'POST',
            data: { id: activityId }
        });
        uni.hideLoading();

        if(result && !result.error) {
            uni.showToast({ title: '活动已删除', icon: 'success' });
            onRefresh();
        } else {
            uni.showToast({ title: result.error || '操作失败', icon: 'none' });
        }
      }
    }
  });
};

const manageRefunds = (activityId, mode) => {
  uni.navigateTo({ url: `/pages/my-active-manage/my-active-manage?id=${activityId}&mode=${mode}` });
};

const navigateToDiscover = () => {
  uni.switchTab({ url: '/pages/index/index' });
};

const navigateToCreate = () => {
  uni.navigateTo({ url: '/pages/active-publish/active-publish' });
};

// --- 生命周期 ---
onLoad(() => {
  getMyActivitiesList(false);
});

</script>


<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.segmented-container {
  padding: 20rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f2f5;
}

.content-scroll {
  flex: 1;
  height: 1px; // 修复scroll-view高度问题
  padding: 0 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1c1e21;
  }
}

.activity-list {
  padding-bottom: 40rpx;
}

.activity-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.activity-image {
  width: 100%;
  height: 300rpx;
}

.activity-content {
  padding: 24rpx;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.activity-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1c1e21;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  
  &.enrolled, &.ongoing {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  &.pending, &.upcoming {
    background-color: #fff3e0;
    color: #ff9800;
  }
  
  &.ended {
    background-color: #f5f5f5;
    color: #9e9e9e;
  }
  
  // 新增状态样式
  &.refund_pending {
    background-color: #e3f2fd;
    color: #2196f3;
  }
  &.canceled {
    background-color: #ffebee;
    color: #f44336;
  }
}

.activity-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #666;
  
  .info-text {
    margin-left: 8rpx;
  }
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f2f5;
}

.participants {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  
  text {
    margin-left: 8rpx;
  }
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn {
  margin: 0;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  background-color: transparent;
  
  // 消除button默认边框
  &::after {
    border: none;
  }
  
  &-detail {
    background-color: #f0f2f5;
    color: #606770;
  }
  
  &-manage {
    background-color: #e3f2fd;
    color: #2196f3;
  }
  
  &-cancel {
    background-color: #ffebee;
    color: #f44336;
  }

  // 新增按钮样式
  &-refund-apply {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  &-refund-manage {
    background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
    color: white;
  }
}

.btn-approval {
  background-color: #e3f2fd;
  color: #2196f3;
  display: flex; // 为了让徽标对齐
  align-items: center;
  .badge {
    margin-left: 8rpx;
  }
}

.primary-btn {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  border: none;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-top: 24rpx;
}

// 修改为空状态的占位符样式
.empty-state-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  margin-top: 40rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}
  
.empty-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.loading-more {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
}
</style>