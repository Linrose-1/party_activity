<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <uni-nav-bar 
      left-icon="arrowleft" 
      title="我的商机" 
      :border="false"
      @clickLeft="handleBack"
    />
    
    <!-- 商机列表 -->
    <scroll-view 
      scroll-y 
      class="content-scroll"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="myOpportunities.length > 0" class="opportunity-list">
        <view 
          v-for="(item, index) in myOpportunities" 
          :key="item.id"
          class="opportunity-item"
        >
          <view class="opportunity-header">
            <!-- 移除状态标签，仅显示发布时间 -->
            <text class="post-time">{{ formatTime(item.time) }}</text>
          </view>
          
          <view class="opportunity-content" @click="viewDetail(item)">
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
          
          <view class="feedback-stats">
            <view class="stat-item">
              <uni-icons type="hand-up" size="16" color="#999" />
              <text>{{ item.likes }}人感兴趣</text>
            </view>
            <view class="stat-item">
              <uni-icons type="chat" size="16" color="#999" />
              <text>{{ item.comments }}条咨询</text>
            </view>
            <view class="stat-item">
              <uni-icons type="eye" size="16" color="#999" />
              <text>{{ item.views }}次浏览</text>
            </view>
          </view>
          
          <view class="action-buttons">
            <!-- 仅保留删除按钮 -->
            <button 
              class="btn btn-delete" 
              @click="showDeleteConfirm(item)"
            >
              删除
            </button>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-state 
        v-else 
        title="暂无发布的商机"
        description="发布您的第一条商机信息，寻找合作伙伴"
      >
        <button class="primary-btn" @click="navigateToPost">发布商机</button>
      </empty-state>
      
      <uni-load-more 
        :status="loadStatus" 
        :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多了'
        }" 
      />
    </scroll-view>
    
    <!-- 底部发布按钮 -->
    <view class="floating-button" @click="navigateToPost">
      <uni-icons type="plus" size="24" color="#fff" />
      <text>发布商机</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
// 引入EmptyState组件，确保您的项目中存在此组件或自行创建
// import EmptyState from '@/components/EmptyState.vue' // 假设路径

// 页面状态
const refreshing = ref(false)
const loadStatus = ref('more') // 'more', 'loading', 'noMore'

// 模拟数据 (移除了status属性的实际用途，但保留在数据结构中不影响)
const myOpportunities = ref([
  {
    id: 1,
    content: '寻找AI技术合作伙伴，共同开发智能客服系统，有意向请联系详谈',
    tags: ['技术合作', 'AI开发', '商务合作'],
    time: '2023-11-15 14:30:00',
    likes: 24,
    comments: 8,
    views: 156,
    contactCount: 5
  },
  {
    id: 2,
    content: '优质供应链资源对接，主要提供电子产品原材料，寻求长期合作伙伴',
    tags: ['供应链', '电子元件', '长期合作'],
    time: '2023-10-20 09:15:00',
    likes: 18,
    comments: 12,
    views: 210,
    contactCount: 7
  },
  {
    id: 3,
    content: '招募线上教育课程讲师，要求有五年以上教学经验，科目不限',
    tags: ['教育', '讲师', '兼职'],
    time: '2023-12-01 10:00:00',
    likes: 30,
    comments: 5,
    views: 180,
    contactCount: 10
  },
  {
    id: 4,
    content: '寻求本地农产品电商平台合作，共同拓展市场，提供优质有机蔬菜',
    tags: ['农产品', '电商', '合作'],
    time: '2023-11-28 16:45:00',
    likes: 15,
    comments: 3,
    views: 90,
    contactCount: 2
  },
  {
    id: 5,
    content: '招聘前端开发工程师，熟悉Vue.js和Uniapp，有小程序开发经验优先',
    tags: ['招聘', '前端', '软件开发'],
    time: '2023-12-05 11:20:00',
    likes: 40,
    comments: 15,
    views: 250,
    contactCount: 8
  },
])

// 方法
const handleBack = () => {
  uni.navigateBack()
}

const formatTime = (timeStr) => {
  // 只截取日期和时间部分，例如 "2023-11-15 14:30"
  return timeStr.slice(0, 16)
}

const viewDetail = (item) => {
  uni.navigateTo({
    url: `/pages/business/detail?id=${item.id}&from=mine`
  })
}

const showDeleteConfirm = (item) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条商机吗？删除后不可恢复',
    confirmColor: '#FF6B00',
    success: (res) => {
      if (res.confirm) {
        deleteOpportunity(item.id)
      }
    }
  })
}

const deleteOpportunity = (id) => {
  const initialLength = myOpportunities.value.length;
  myOpportunities.value = myOpportunities.value.filter(item => item.id !== id);
  if (myOpportunities.value.length < initialLength) {
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    })
  }
}

const navigateToPost = () => {
  uni.navigateTo({
    url: '/pages/business/post'
  })
}

const onRefresh = () => {
  refreshing.value = true
  loadStatus.value = 'more' // 重置加载状态
  // 模拟重新加载数据
  setTimeout(() => {
    myOpportunities.value = mockOpportunityData(5); // 刷新时加载少量新数据或重置为初始数据
    refreshing.value = false
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  }, 1000)
}

const loadMore = () => {
  if (loadStatus.value === 'loading' || loadStatus.value === 'noMore') return
  
  loadStatus.value = 'loading'
  setTimeout(() => {
    const newData = mockOpportunityData(3); // 每次加载3条新数据
    if (myOpportunities.value.length < 20) { // 模拟总数据量上限
      myOpportunities.value.push(...newData);
      loadStatus.value = 'more';
    } else {
      loadStatus.value = 'noMore';
    }
  }, 1500)
}

// 模拟数据生成器
const mockOpportunityData = (count) => {
  const baseId = myOpportunities.value.length > 0 ? myOpportunities.value[myOpportunities.value.length - 1].id + 1 : 1;
  return [...Array(count)].map((_, i) => ({
    id: baseId + i,
    content: `这是新加载的商机内容 ${baseId + i}，寻求合作伙伴共同开发项目，欢迎咨询！`,
    tags: ['新标签', '合作', `主题${i+1}`],
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 300),
    contactCount: Math.floor(Math.random() * 10)
  }));
}

onLoad(() => {
  // 页面加载时可以调用获取商机列表的接口
  // 例如：fetchOpportunities()
})
// onReachBottom 生命周期钩子已通过 @scrolltolower 绑定到 scroll-view 上，所以这里可以移除
// onReachBottom(() => {
//   loadMore()
// })
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 100rpx; // 留出底部浮动按钮的空间
  box-sizing: border-box; // 确保内边距不撑大高度
}

/* 移除状态筛选相关样式 */
/* .filter-tabs, .filter-tab, .indicator { display: none; } */


.content-scroll {
  flex: 1;
  height: 1px; /* 解决flex子项在某些情况下不正确计算高度的问题 */
  padding: 24rpx; /* 调整内边距，使内容不贴边 */
}

.opportunity-list {
  padding-bottom: 40rpx; // 列表底部间距，防止内容与加载更多重叠
}

.opportunity-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.opportunity-header {
  display: flex;
  justify-content: flex-end; /* 时间靠右显示 */
  align-items: center;
  margin-bottom: 20rpx;
}

/* 移除状态标签样式 */
/* .status-tag, .status-tag.active, .status-tag.expired { display: none; } */

.post-time {
  font-size: 24rpx;
  color: #999;
}

.opportunity-content {
  font-size: 30rpx;
  line-height: 1.6;
  margin-bottom: 20rpx;
  color: #333;
  word-break: break-word;
  // 可以添加多行文本溢出省略
  /*
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; // 限制最多3行
  overflow: hidden;
  text-overflow: ellipsis;
  */
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
  white-space: nowrap; // 防止标签内文字换行
}

.feedback-stats {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-top: 1rpx solid #f0f2f5;
  border-bottom: 1rpx solid #f0f2f5;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  
  text {
    margin-left: 8rpx;
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end; /* 按钮靠右对齐 */
  gap: 20rpx;
}

.btn {
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  display: flex; /* 确保按钮内容居中 */
  align-items: center;
  justify-content: center;
  
  /* 移除编辑和刷新按钮样式 */
  /* &-edit, &-refresh { display: none; } */

  &-delete {
    background-color: #ffebee;
    color: #f44336;
  }
}

.primary-btn {
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  border: none;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-top: 24rpx;
  display: inline-flex; /* 使按钮能包裹内容并居中 */
  align-items: center;
  justify-content: center;
}

.floating-button {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
  color: white;
  border-radius: 50rpx;
  padding: 16rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 0, 0.3);
  z-index: 100; // 确保在最上层
  
  text {
    margin-left: 10rpx;
    font-size: 28rpx;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  margin-top: 40rpx;
  height: calc(100% - 80rpx); /* 确保在scroll-view中可以居中 */
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 24rpx;
  }
  .empty-title {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 12rpx;
  }
  .empty-description {
    font-size: 28rpx;
    color: #999;
    line-height: 1.5;
    margin-bottom: 40rpx;
  }
}
</style>