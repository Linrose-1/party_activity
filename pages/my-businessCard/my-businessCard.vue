<template>
  <view class="container">
    <!-- 修正点 1: 新增的悬浮分享按钮 -->
    <view class="share-fab" @click="openSharePopup">
      <uni-icons type="undo-filled" size="24" color="#fff"></uni-icons>
    </view>

    <view class="card-header">
      <view class="header-title">我的个人名片</view>
      <view class="header-subtitle">专业形象，随时分享</view>
    </view>
    
    <MyCard
      v-if="userInfo"
      :avatar="userInfo.avatar"
      :name="userInfo.realName || userInfo.nickname"
      :pinyin-name="userInfo.topUpLevel?.name"
      :title="userInfo.level?.name"
      :company-name="userInfo.companyName"
      department=""
      :full-company-name="userInfo.professionalTitle"
      :contact-info="formattedContactInfo"
      :show-user-qr-code="!!userInfo.wechatQrCodeUrl"
      :user-we-chat-qr-code-url="userInfo.wechatQrCodeUrl"
      platform-qr-code-url="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info"
      logo-url="https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png"
    />
	
	  <view class="edit-hint" v-if="userInfo">
		  名片信息可在 <text @click="goToEdit" class="edit-link">个人资料</text> 中编辑
	  </view>
    
     <!-- 2. 【重大修改】新增自定义分享弹窗 -->
        <uni-popup ref="sharePopup" type="bottom" background-color="#fff">
          <view class="share-popup-content">
            <view class="share-popup-title">自定义分享内容</view>
            <view class="share-title-editor">
                <text class="editor-label">标题:</text>
                <input class="editor-input" v-model="customShareTitle" placeholder="请输入分享标题" />
            </view>
            <view class="share-channels">
              <!-- 分享到好友的按钮 -->
              <button class="share-channel-btn" open-type="share">
                <uni-icons type="weixin" size="30" color="#07c160"></uni-icons>
                <text>微信好友</text>
              </button>
              <!-- 引导分享到朋友圈的按钮 -->
              <button class="share-channel-btn" @click="guideShareTimeline">
                <uni-icons type="pyq" size="30" color="#53a046"></uni-icons>
                <text>朋友圈</text>
              </button>
            </view>
            <view class="share-popup-cancel" @click="closeSharePopup">取消</view>
          </view>
        </uni-popup>
    
        <!-- 3. 【重大修改】新增分享到朋友圈的引导遮罩层 -->
        <view v-if="showTimelineGuide" class="timeline-guide-mask" @click="hideTimelineGuide">
          <image src="/static/icons/share-guide-arrow.png" class="guide-arrow"></image>
          <view class="guide-text">
            <text>点击右上角</text>
            <text>分享到朋友圈</text>
          </view>
        </view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad,onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'; // 修正点 2: 导入分享钩子
import MyCard from '../../components/MyCard.vue';
import request from '../../utils/request.js';

const userInfo = ref(null);
const sharePopup = ref(null); // 修正点 3: 用于控制分享弹窗
const targetUserId = ref(null); // 新增：用于存储目标用户ID
const loggedInUserId = ref(null); // 新增：当前登录用户的ID

// 【新增】分享功能所需的状态变量
const customShareTitle = ref('');
const showTimelineGuide = ref(false);


onLoad((options) => {
    // 检查是否有ID传入
    if (options && options.id) {
        targetUserId.value = options.id;
        // 如果有ID，则获取指定用户的名片信息
        fetchTargetUserInfo(options.id);
    } else {
        // 如果没有ID，则获取自己的名片信息
        fetchOwnUserInfo();
    }
	
	// ==================== 【新增】处理分享点击加分逻辑 ====================
		if (options && options.sharerId) {
			const sharerId = options.sharerId;
			// 注意：这里的 bizId 是被查看用户的ID，也就是 targetUserId.value
	        // 但在 onLoad 早期，targetUserId.value 可能还未被赋值，所以直接从 options.id 获取更可靠
			const bizId = options.id; 
	
			// 1. 如果是本人点击，不处理
			if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
				console.log('用户点击了自己的名片分享链接，不计分。');
			}
			// 2. 如果是其他已登录用户点击，直接调用接口加分
			else if (sharerId && loggedInUserId.value && bizId) {
				console.log('其他用户点击了名片分享链接，且已登录，准备为分享者加分。');
				triggerShareHitApi(sharerId, bizId);
			}
			// 3. 如果是未登录用户点击，暂存信息
			else if (sharerId && bizId) {
				console.log('用户点击了名片分享链接，但尚未登录。暂存分享信息。');
				uni.setStorageSync('pendingShareReward', {
					sharerId: sharerId,
					bizId: bizId,
					type: 30 // 30 代表 "分享名片奖励"
				});
			}
		}
	    // =======================================================================
});

const fetchOwnUserInfo = async () => {
  uni.showLoading({ title: '加载中...' });
  const { data, error } = await request('/app-api/member/user/get', { method: 'GET' });
  uni.hideLoading();

  if (error) {
    uni.showToast({ title: `加载失败: ${error}`, icon: 'none' });
    return;
  }
  
  userInfo.value = data;
};

// 新增：获取他人名片信息的函数
const fetchTargetUserInfo = async (userId) => {
    uni.showLoading({ title: '加载中...' });
    const { data, error } = await request('/app-api/member/user/read-card', {
        method: 'POST',
        data: {
            readUserId: userId
        }
    });
    uni.hideLoading();

    if (error) {
        // 如果在这里仍然失败，说明可能发生了异常或权限突然失效
        uni.showToast({ title: `获取名片失败: ${error}`, icon: 'none' });
        // 可以选择跳转回上一页或首页
        setTimeout(() => uni.navigateBack(), 2000);
        return;
    }
    
    userInfo.value = data;
};

const formattedContactInfo = computed(() => {
  if (!userInfo.value) return [];
  return [
    { icon: 'phone-filled', value: userInfo.value.mobile || '未设置手机' },
    { icon: 'email-filled', value: userInfo.value.contactEmail || '未设置邮箱' },
    { icon: 'location-filled', value: userInfo.value.locationAddress || '未设置地址' }
  ];
});

const goToEdit = () => {
  uni.navigateTo({ url: '/pages/my-edit/my-edit' });
};

// 【新增】调用分享命中接口的函数
const triggerShareHitApi = async (sharerId, bizId) => {
	if (!sharerId || !bizId) return;

	console.log(`准备为分享者 (ID: ${sharerId}) 增加贡分, 关联名片ID (bizId): ${bizId}`);

	const { error } = await request('/app-api/member/experience-record/share-experience-hit', {
		method: 'POST',
		data: {
			type: 30, // 30 代表 "分享名片奖励"
			shareUserId: sharerId,
			bizId: bizId
		}
	});

	if (error) {
		console.error('调用分享名片加分接口失败:', error);
	} else {
		console.log(`成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
	}
};

// 打开分享弹窗
const openSharePopup = () => {
  if (!userInfo.value) {
    uni.showToast({ title: '信息加载中，请稍候', icon: 'none' });
    return;
  }
  // 设置默认的分享标题
  customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
  sharePopup.value.open();
};

// 关闭分享弹窗
const closeSharePopup = () => {
  sharePopup.value.close();
};


// 1. 监听用户点击“微信好友”按钮或右上角菜单“转发”
onShareAppMessage((res) => {
  console.log('触发了分享给好友', res);
  // 触发分享后，自动关闭弹窗
  closeSharePopup(); 

  if (!userInfo.value) {
    return { title: '快来看看我的专业电子名片！' };
  }

  const sharerId = uni.getStorageSync('userId');
  let sharePath = `/pages/my-businessCard/my-businessCard?id=${userInfo.value.id}`;
  if (sharerId) {
    sharePath += `&sharerId=${sharerId}`;
  }

  // 【核心】优先使用用户在弹窗中输入的标题
  const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

  return {
    title: finalTitle,
    path: sharePath,
    imageUrl: userInfo.value.avatar,
  };
});

// 2. 监听用户在引导下点击右上角菜单“分享到朋友圈”
onShareTimeline(() => {
  console.log('触发了分享到朋友圈');
  // 触发分享时，隐藏引导蒙层
  hideTimelineGuide(); 

  if (!userInfo.value) {
    return { title: '快来看看我的专业电子名片！' };
  }

  const sharerId = uni.getStorageSync('userId');
  let queryString = `id=${userInfo.value.id}`;
  if (sharerId) {
    queryString += `&sharerId=${sharerId}`;
  }
  
  // 【核心】同样优先使用用户在弹窗中输入的标题
  const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;

  return {
    title: finalTitle,
    query: queryString,
    imageUrl: userInfo.value.avatar,
  };
});


const guideShareTimeline = () => {
  closeSharePopup();
  showTimelineGuide.value = true;
};

// 【新增】隐藏朋友圈引导蒙层的方法
const hideTimelineGuide = () => {
    showTimelineGuide.value = false;
};
</script>

<style lang="scss" scoped>
/* 页面基础布局样式 */
.container {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #333;
  line-height: 1.6;
  padding: 40rpx 30rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 80rpx;
}

.card-header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .header-title {
    font-size: 56rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .header-subtitle {
    font-size: 32rpx;
    color: #777;
  }
}

.edit-hint {
  color: #888;
  font-size: 28rpx;
  margin-top: 40rpx;
  .edit-link {
    color: #007aff;
    text-decoration: underline;
    font-weight: bold;
    margin: 0 8rpx;
  }
}

/* 悬浮分享按钮 */
.share-fab {
  position: fixed;
  top: 180rpx; /* 可根据需要调整，避开导航栏 */
  right: 30rpx;
  width: 90rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
  z-index: 99;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

/* --- 整合后的分享弹窗与引导蒙层样式 --- */

/* 分享弹窗内容区 */
.share-popup-content {
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
}

/* 弹窗顶部标题 */
.share-popup-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

/* 自定义标题编辑区 */
.share-title-editor {
  display: flex;
  align-items: center;
  background-color: #f7f7f7;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 40rpx;
}

.editor-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 20rpx;
}

.editor-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

/* 分享渠道区域 */
.share-channels {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  margin-bottom: 40rpx;
}

/* 分享渠道按钮 (好友、朋友圈) */
.share-channel-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  padding: 0;
  margin: 0;
  border: none;
  line-height: 1.5;
  &::after {
    border: none;
  }
}

.share-channel-btn text {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

/* 弹窗取消按钮 */
.share-popup-cancel {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background-color: #f0f0f0;
  border-radius: 45rpx;
  font-size: 30rpx;
  color: #333;
}

/* 分享到朋友圈的引导蒙层 */
.timeline-guide-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 20rpx;
  box-sizing: border-box;
}

.guide-arrow {
  width: 150rpx;
  height: 150rpx;
  margin-top: 10rpx;
  margin-right: 20rpx;
}

.guide-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-top: 20rpx;
  
  text {
    display: block;
    margin-bottom: 10rpx;
  }
}

/* --- 以下为旧的、已移除的样式，仅作参考 --- */
/* .action-buttons, .action-btn, .share-btn, .share-options, .share-option, .share-icon, .share-title 等选择器相关的旧样式已被移除 */
</style>