<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <uni-nav-bar 
      left-icon="arrowleft" 
      title="我的收藏" 
      :border="false"
      @clickLeft="handleBack"
    />
    
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
    
    <!-- 收藏的活动 -->
    <scroll-view 
      v-show="currentTab === 0" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section-header">
        <uni-icons type="star-filled" size="20" color="#FF6B00" />
        <text class="section-title">收藏的活动</text>
      </view>
      
      <!-- 活动列表 -->
      <view v-if="favoriteActivities.length > 0" class="activity-list">
        <view 
          v-for="(item, index) in favoriteActivities" 
          :key="index"
          class="activity-item"
          @click="viewActivityDetail(item)"
        >
          <image class="activity-image" :src="item.image" mode="aspectFill" />
          
          <view class="activity-content">
            <view class="activity-header">
              <text class="activity-title">{{ item.title }}</text>
              <view :class="['status-tag', item.status]">
                {{ getActivityStatusText(item.status) }}
              </view>
            </view>
            
            <view class="activity-info">
              <uni-icons type="calendar" size="16" color="#999" />
              <text class="info-text">{{ item.date }}</text>
            </view>
            
            <view class="activity-info">
              <uni-icons type="map-pin" size="16" color="#999" />
              <text class="info-text">{{ item.location }}</text>
            </view>
            
            <view class="activity-footer">
              <view class="participants">
                <uni-icons type="people" size="16" color="#999" />
                <text>{{ item.participants.current }}/{{ item.participants.total }}人</text>
              </view>
              
              <view class="action-buttons">
                <button 
                  class="btn btn-cancel" 
                  @click.stop="uncollectActivity(item)"
                >
                  取消收藏
                </button>
                <button class="btn btn-detail" @click.stop="viewActivityDetail(item)">
                  查看详情
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-state 
        v-else 
        title="暂无收藏活动" 
        description="发现并收藏你感兴趣的活动吧"
      >
        <button class="primary-btn" @click="navigateToDiscover">去发现</button>
      </empty-state>
      
      <uni-load-more 
        :status="loadStatus" 
        :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多了'
        }" 
        @clickLoadMore="loadMore"
      />
    </scroll-view>
    
    <!-- 收藏的商机 -->
    <scroll-view 
      v-show="currentTab === 1" 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="section-header">
        <uni-icons type="star-filled" size="20" color="#FF6B00" />
        <text class="section-title">收藏的商机</text>
      </view>
      
      <!-- 商机列表 -->
      <view v-if="favoriteOpportunities.length > 0" class="opportunity-list">
        <view 
          v-for="(item, index) in favoriteOpportunities" 
          :key="index"
          class="opportunity-item"
          @click="viewOpportunityDetail(item)"
        >
          <view class="opportunity-header">
            <view class="avatar" @click.stop="viewUserProfile(item.user)">
              {{ item.user.charAt(0) }}
            </view>
            <view class="user-info">
              <text class="user-name">{{ item.user }}</text>
              <text class="post-time">{{ item.time }}</text>
            </view>
          </view>
          
          <view class="opportunity-content">
            {{ item.content }}
          </view>
          
          <view class="tags">
            <view 
              v-for="(tag, tagIndex) in item.tags" 
              :key="tagIndex" 
              class="tag"
            >
              {{ tag }}
            </view>
          </view>
          
          <view class="opportunity-footer">
            <view class="stats">
              <view class="like-count">
                <uni-icons type="hand-up" size="16" color="#999" />
                <text>{{ item.likes }}</text>
              </view>
              <view class="comment-count">
                <uni-icons type="chat" size="16" color="#999" />
                <text>{{ item.comments }}</text>
              </view>
            </view>
            
            <view class="action-buttons">
              <button 
                class="btn btn-cancel" 
                @click.stop="uncollectOpportunity(item)"
              >
                取消收藏
              </button>
              <button 
                class="btn btn-contact" 
                @click.stop="contactPublisher(item)"
                v-if="item.status === 'active'"
              >
                联系发布者
              </button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-state 
        v-else 
        title="暂无收藏商机" 
        description="发现并收藏有价值的商机吧"
      >
        <button class="primary-btn" @click="navigateToBusiness">浏览商机</button>
      </empty-state>
      
      <uni-load-more 
        :status="loadStatus" 
        :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多了'
        }" 
        @clickLoadMore="loadMore"
      />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'

// 状态
const currentTab = ref(0)
const tabs = ref(['收藏的活动', '收藏的商机'])
const refreshing = ref(false)
const loadStatus = ref('more')

// 模拟数据
const favoriteActivities = ref([
  {
    id: 1,
    title: '周末户外登山活动 - 挑战青龙山',
    image: '/static/activity1.jpg',
    date: '2023年11月25日 08:00-17:00',
    location: '青龙山国家森林公园',
    participants: {
      current: 28,
      total: 50
    },
    status: 'upcoming',
    collectedTime: '2023-11-10'
  },
  // 更多数据...
])

const favoriteOpportunities = ref([
  {
    id: 101,
    user: '张总',
    time: '2023-11-15 14:30',
    content: '寻找AI技术合作伙伴，共同开发智能客服系统，有意向请联系详谈',
    tags: ['技术合作', 'AI开发', '商务合作'],
    likes: 24,
    comments: 8,
    status: 'active', // active/expired
    collectedTime: '2023-11-16'
  },
  // 更多数据...
])

// 方法
const switchTab = (e) => {
  currentTab.value = e.currentIndex
  loadStatus.value = 'more'
}

const handleBack = () => {
  uni.navigateBack()
}

const getActivityStatusText = (status) => {
  const statusMap = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return statusMap[status] || ''
}

const viewActivityDetail = (item) => {
  uni.navigateTo({
    url: `/pages/activity/detail?id=${item.id}`
  })
}

const viewOpportunityDetail = (item) => {
  uni.navigateTo({
    url: `/pages/business/detail?id=${item.id}`
  })
}

const viewUserProfile = (user) => {
  uni.navigateTo({
    url: `/pages/user/profile?name=${encodeURIComponent(user)}`
  })
}

const uncollectActivity = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏此活动吗？',
    success: (res) => {
      if (res.confirm) {
        favoriteActivities.value = favoriteActivities.value.filter(act => act.id !== item.id)
        uni.showToast({
          title: '已取消收藏',
          icon: 'success'
        })
      }
    }
  })
}

const uncollectOpportunity = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏此商机吗？',
    success: (res) => {
      if (res.confirm) {
        favoriteOpportunities.value = favoriteOpportunities.value.filter(op => op.id !== item.id)
        uni.showToast({
          title: '已取消收藏',
          icon: 'success'
        })
      }
    }
  })
}

const contactPublisher = (item) => {
  uni.navigateTo({
    url: `/pages/message/chat?userId=${item.userId}`
  })
}

const navigateToDiscover = () => {
  uni.switchTab({
    url: '/pages/discover/index'
  })
}

const navigateToBusiness = () => {
  uni.switchTab({
    url: '/pages/business/index'
  })
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  }, 1000)
}

const loadMore = () => {
  if (loadStatus.value !== 'more') return
  
  loadStatus.value = 'loading'
  setTimeout(() => {
    if (currentTab.value === 0) {
      favoriteActivities.value.push(...mockActivityData())
    } else {
      favoriteOpportunities.value.push(...mockOpportunityData())
    }
    loadStatus.value = 'noMore'
  }, 1500)
}

onReachBottom(() => {
  loadMore()
})

// 模拟数据方法
const mockActivityData = () => [...Array(2)].map((_, i) => ({
  id: favoriteActivities.value.length + i + 1,
  title: `新收藏活动 ${favoriteActivities.value.length + i + 1}`,
  image: `/static/activity${(favoriteActivities.value.length + i) % 6 + 1}.jpg`,
  date: '2023年12月' + (5 + i) + '日',
  location: '活动地点' + (favoriteActivities.value.length + i),
  participants: {
    current: Math.floor(Math.random() * 50),
    total: 50
  },
  status: ['upcoming', 'ongoing', 'ended'][Math.floor(Math.random() * 3)],
  collectedTime: '2023-11-' + (15 + i)
}))

const mockOpportunityData = () => [...Array(2)].map((_, i) => ({
  id: favoriteOpportunities.value.length + i + 101,
  user: '用户' + (favoriteOpportunities.value.length + i),
  time: '2023-11-' + (20 + i) + ' 10:30',
  content: `新的商机内容 ${favoriteOpportunities.value.length + i + 1}，寻找合作伙伴共同开发项目`,
  tags: ['标签' + (i + 1), '合作'],
  likes: Math.floor(Math.random() * 50),
  comments: Math.floor(Math.random() * 20),
  status: ['active', 'expired'][Math.floor(Math.random() * 2)],
  collectedTime: '2023-11-' + (15 + i)
}))

onLoad(() => {
  // 可以在这里加载真实数据
})
</script>

<style lang="scss" scoped>
/* 复用原有样式基础上新增商机相关样式 */
.page-container,
.segmented-container,
.content-scroll,
.section-header,
.section-title,
.activity-list,
.activity-item,
.activity-image,
.activity-content,
.activity-header,
.activity-title,
.status-tag,
.activity-info,
.info-text,
.activity-footer,
.participants,
.action-buttons,
.btn,
.primary-btn,
.empty-state {
  /* 复用原有样式 */
}

/* 商机列表特有样式 */
.opportunity-list {
  margin-bottom: 40rpx;
}

.opportunity-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  
  &:active {
    opacity: 0.9;
  }
}

.opportunity-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B00, #FF8C37);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 30rpx;
  margin-bottom: 6rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.opportunity-content {
  font-size: 28rpx;
  line-height: 1.6;
  margin-bottom: 20rpx;
  color: #333;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.tag {
  background: #f0f7ff;
  color: #1890ff;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.opportunity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f2f5;
}

.stats {
  display: flex;
  gap: 24rpx;
}

.like-count,
.comment-count {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  
  text {
    margin-left: 6rpx;
  }
}

.btn-contact {
  background-color: #e8f5e9;
  color: #4caf50;
}

/* 状态标签 */
.status-tag {
  &.active {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  &.expired {
    background-color: #f5f5f5;
    color: #9e9e9e;
  }
}
</style>