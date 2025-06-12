<template>
  <view class="container">
    <view class="form-section">
      <view class="section-header">
        <text class="section-title">编辑资料</text>
      </view>
	  <uni-forms-item label="头像" name="avatar" required>
	    <button class="upload-btn" @click="chooseAvatar">上传头像</button>
	    <image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill" />
	  </uni-forms-item>

      <view class="form-content">
        <uni-forms ref="formRef" :modelValue="form" :rules="rules">
          <uni-forms-item label="真实姓名" name="name" required>
            <uni-easyinput v-model="form.name" placeholder="请输入真实姓名"/>
          </uni-forms-item>

          <uni-forms-item label="性别" name="gender" required>
            <uni-data-select v-model="form.gender" :localdata="genderOptions"/>
          </uni-forms-item>

          <uni-forms-item label="出生日期" name="birth">
            <uni-datetime-picker type="date" v-model="form.birth" />
          </uni-forms-item>

          <uni-forms-item label="所在地" name="location">
            <uni-easyinput v-model="form.location" placeholder="请输入所在地" />
          </uni-forms-item>

          <uni-forms-item label="职业" name="job" required>
            <uni-easyinput v-model="form.job" placeholder="请输入职业" />
          </uni-forms-item>

          <uni-forms-item label="公司/机构" name="company" required>
            <uni-easyinput v-model="form.company" placeholder="请输入公司或机构名称" />
          </uni-forms-item>

          <uni-forms-item label="手机号码" name="phone" required>
            <view class="phone-input">
              <picker mode="selector" :range="phoneCodes" :value="codeIndex" @change="onCodeChange">
                <view class="code-picker">{{ phoneCodes[codeIndex] }}</view>
              </picker>

              <uni-easyinput class="phone-text" v-model="form.phone" placeholder="请输入手机号码" />
            </view>
          </uni-forms-item>

          <uni-forms-item label="微信二维码" name="wechatQr">
            <button class="upload-btn" @click="chooseImage">上传二维码</button>
            <image v-if="form.wechatQr" :src="form.wechatQr" class="qr-img" mode="aspectFit" />
          </uni-forms-item>

          <uni-forms-item label="个人简介" name="intro">
            <uni-easyinput type="textarea" v-model="form.intro" placeholder="介绍一下自己..." />
          </uni-forms-item>

          <uni-forms-item label="邀请码" name="inviteCode">
            <uni-easyinput v-model="form.inviteCode" placeholder="填写对方的邀请码（可选）" />
          </uni-forms-item>

        </uni-forms>
        <button class="save-btn" @click="submitForm">保存资料</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const formRef = ref(null);
const form = ref({
  avatar: '',
  name: '',
  gender: '',
  birth: '',
  location: '',
  job: '',
  company: '',
  phone: '',
  wechatQr: '',
  intro: '',
  inviteCode: '',
});

const rules = {
  avatar: { required: true, errorMessage: '请上传头像' },
  name: { required: true, errorMessage: '请输入真实姓名' },
  gender: { required: true, errorMessage: '请选择性别' },
  job: { required: true, errorMessage: '请输入职业' },
  company: { required: true, errorMessage: '请输入公司/机构名称' },
  phone: [
    { required: true, errorMessage: '请输入手机号码' },
    { pattern: /^1[3-9]\d{9}$/, errorMessage: '请输入有效的手机号' },
  ],
};

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    success: res => {
      form.value.avatar = res.tempFilePaths[0];
    }
  });
}


const genderOptions = [
  { value: 'male', text: '男' },
  { value: 'female', text: '女' },
  { value: 'other', text: '其他' },
];

const phoneCodes = ['+86', '+852', '+853', '+886'];
const codeIndex = ref(0);

function chooseImage() {
  uni.chooseImage({
    count: 1,
    success: res => {
      form.value.wechatQr = res.tempFilePaths[0];
    }
  });
}

function submitForm() {
  formRef.value.validate().then(() => {
    uni.showToast({ title: '保存成功', icon: 'success' });
  }).catch(err => {
    console.log('验证失败：', err);
  });
}

function onCodeChange(e) {
  codeIndex.value = e.detail.value;
}

</script>

<style scoped>
.container {
  padding: 30rpx;
}
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.form-content {
  margin-top: 20rpx;
}
.phone-input {
  display: flex;
  align-items: center;
}
.code-picker {
  padding: 20rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  margin-right: 20rpx;
}
.phone-text {
  flex: 1;
}
.upload-btn {
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
}
.qr-img {
  width: 200rpx;
  height: 200rpx;
  margin-top: 20rpx;
  border-radius: 20rpx;
}
.save-btn {
  margin-top: 40rpx;
  width: 100%;
  padding: 10rpx;
  background: linear-gradient(to right, #FF8C00, #FF6B00);
  color: white;
  border-radius: 20rpx;
  font-size: 30rpx;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  margin-top: 20rpx;
  border-radius: 80rpx;
  object-fit: cover;
}

</style>