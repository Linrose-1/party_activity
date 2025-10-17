<template>
	<view class="page">
		<!-- 内容卡片 -->
		<view class="form-container">
			<view class="form-card">
				<view class="form-group">
					<view class="form-label">标题</view>
					<input v-model="form.title" class="form-input" placeholder="请输入标题（最多100字）" maxlength="100" />
				</view>

				<view class="form-group">
					<view class="form-label">内容</view>
					<!-- placeholder 已绑定到计算属性 -->
					<textarea v-model="form.content" class="form-textarea" :placeholder="contentPlaceholder"
						maxlength="5000" />
				</view>

				<view class="form-group">
					<view class="form-label">选择分类</view>
					<radio-group @change="topicChange" class="radio-group-container">
						<label class="radio-item">
							<radio value="普通商机" :checked="form.topic === '普通商机'" color="#FF6A00" />
							<text>普通商机</text>
						</label>
						<label class="radio-item">
							<radio value="创业猎伙" :checked="form.topic === '创业猎伙'" color="#FF6A00" />
							<text>创业猎伙🔥</text>
						</label>
					</radio-group>
				</view>

				<view class="form-group">
					<view class="form-label">添加标签</view>
					<!-- v-for 循环 form.tags -->
					<view class="tags-container">
						<view v-for="(tag, index) in form.tags" :key="index" class="tag">
							{{ tag }}
							<text class="tag-remove" @click="removeTag(index)">×</text>
						</view>
					</view>
					<!-- v-model 绑定到 form.tagInput -->
					<view class="tag-input-container">
						<input v-model="form.tagInput" class="tag-input" placeholder="输入标签（如,合作/需求/经验/创业灵感...）" />
						<button class="add-tag-btn" @click="addTag">添加</button>
					</view>
					<text class="hint">添加精准标签让更多人发现您的商机</text>
				</view>

				<view class="form-group">
					<view class="form-label">上传图片或者视频</view>
					<!-- Case 1: 还未选择任何媒体 -->
					<view class="media-selector" v-if="form.images.length === 0 && !form.postVideo">
						<view class="selector-btn" @click="handleChooseImage">
							<uni-icons type="image-filled" size="30" color="#4CAF50"></uni-icons>
							<text>发布图片</text>
						</view>
						<view class="selector-btn" @click="handleChooseVideo">
							<uni-icons type="videocam-filled" size="30" color="#2196F3"></uni-icons>
							<text>发布视频</text>
						</view>
					</view>

					<!-- Case 2: 已经选择了图片 -->
					<view v-else-if="form.mediaType === 'image'" class="image-preview">
						<!-- 图片的 3x3 网格布局 (代码保持不变) -->
						<view v-for="(img, i) in form.images" :key="i" class="image-wrapper">
							<image :src="img" mode="aspectFill" class="preview-img" @click="replaceImage(i)" />
							<view class="delete-image-btn" @click.stop="deleteImage(i)">×</view>
						</view>
						<view class="add-img-placeholder" @click="handleChooseImage" v-if="form.images.length < 9">
							<uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
							<text>添加图片</text>
						</view>
					</view>

					<!-- Case 3: 已经选择了视频 -->
					<view v-else-if="form.mediaType === 'video' && form.postVideo" class="video-preview-wrapper">
						<video :src="form.postVideo" class="preview-video" controls></video>
						<view class="delete-video-btn" @click.stop="deleteVideo">×</view>
					</view>
					<text class="hint">{{ form.mediaType === 'image' ? '最多可上传9张图片' : '仅支持上传一个视频' }}</text>
				</view>
			</view>

			<view class="form-card">
				<text class="section-title">其他设置</text>
				<view class="setting-item">
					<text class="setting-label">允许他人查看我的名片</text>
					<!-- :checked 绑定 form.showProfile -->
					<switch :checked="form.showProfile" @change="e => form.showProfile = e.detail.value"
						color="#FF6A00" />
				</view>
			</view>

			<button class="submit-btn" @click="submitPost">发布帖子</button>
		</view>
	</view>
</template>

<script setup>
	import {
		reactive,
		computed,
		watch
	} from 'vue'; // ref 已被移除，引入 reactive
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';

	// --- 【核心】统一使用 reactive 管理所有表单状态 ---
	const form = reactive({
		title: '',
		content: '',
		topic: '普通商机',
		tags: [],
		tagInput: '',
		mediaType: 'image',
		images: [],
		postVideo: '',
		showProfile: true,
	});

	// --- 计算属性 ---
	const contentPlaceholder = computed(() => {
		if (form.topic === '创业猎伙') {
			return '发布寻找创业项目合伙人需求。';
		}
		return '描述您的项目/商机、需求/经验分享。';
	});

	// --- 生命周期钩子 ---
	onLoad(() => {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showModal({
				title: '请先登录',
				content: '发布商机需要登录后才能操作',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/index/index'
						});
					} else {
						uni.navigateBack();
					}
				}
			});
			return;
		}
		checkDraft();
	});

	// --- 草稿功能 (逻辑不变，已适配 reactive) ---
	const DRAFT_KEY = 'post_draft_v2'; // 建议更新key，避免旧格式草稿的干扰
	let debounceTimer = null;

	watch(form, (newValue) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			saveDraft(newValue);
		}, 1500);
	}, {
		deep: true
	});

	const saveDraft = (data) => {
		if (data.title || data.content || data.tags.length > 0 || data.images.length > 0) {
			uni.setStorageSync(DRAFT_KEY, JSON.stringify(data));
			console.log('📝 草稿已自动保存');
		}
	};

	const checkDraft = () => {
		const draft = uni.getStorageSync(DRAFT_KEY);
		if (draft) {
			uni.showModal({
				title: '发现未完成的草稿',
				content: '是否恢复上次编辑的内容？',
				confirmText: '恢复',
				cancelText: '放弃',
				success: (res) => {
					if (res.confirm) {
						const draftData = JSON.parse(draft);
						Object.assign(form, draftData);
					} else {
						uni.removeStorageSync(DRAFT_KEY);
					}
				}
			});
		}
	};

	const clearDraft = () => {
		uni.removeStorageSync(DRAFT_KEY);
		console.log('🧹 草稿已清除');
	};

	// --- 表单交互函数 (现在都操作 form 对象) ---
	function topicChange(e) {
		form.topic = e.detail.value;
	}

	function addTag() {
		let val = form.tagInput.trim();
		if (!val) return uni.showToast({
			title: '请输入标签',
			icon: 'none'
		});
		if (form.tags.length >= 5) return uni.showToast({
			title: '最多添加5个标签',
			icon: 'none'
		});
		if (!val.startsWith('#')) val = '#' + val;
		if (form.tags.includes(val)) return uni.showToast({
			title: '标签已存在',
			icon: 'none'
		});

		form.tags.push(val);
		form.tagInput = '';
	}

	function removeTag(index) {
		form.tags.splice(index, 1);
	}

	/**
	 * 【新增】选择媒体类型
	 * @param {string} type - 'image' 或 'video'
	 */
	function selectMediaType(type) {
		if (form.images.length > 0 || form.postVideo) {
			uni.showModal({
				title: '提示',
				content: '切换类型将清空已上传的图片或视频，是否继续？',
				success: (res) => {
					if (res.confirm) {
						form.mediaType = type;
						form.images = [];
						form.postVideo = '';
						// 切换后立即打开选择器
						if (type === 'image') handleChooseImage();
						if (type === 'video') handleChooseVideo();
					}
				}
			});
		} else {
			form.mediaType = type;
			if (type === 'image') handleChooseImage();
			if (type === 'video') handleChooseVideo();
		}
	}

	// --- 图片处理函数 (现在都操作 form.images) ---
	async function handleChooseImage() {
		uni.chooseImage({
			count: 9 - form.images.length,
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const validFiles = res.tempFiles.filter(file => file.size <= 5 * 1024 * 1024);
				if (res.tempFiles.length > validFiles.length) {
					uni.showToast({
						title: '部分文件过大(>5MB)，已忽略',
						icon: 'none'
					});
				}
				if (validFiles.length === 0) return;

				uni.showLoading({
					title: `正在上传 ${validFiles.length} 张图片...`,
					mask: true
				});

				const uploadPromises = validFiles.map(file => uploadFile(file, {
					directory: 'post'
				}));
				const results = await Promise.all(uploadPromises);
				uni.hideLoading();

				const successfulUrls = [];
				results.forEach(result => {
					if (result.data) successfulUrls.push(result.data);
					else console.error('上传失败:', result.error);
				});

				form.images.push(...successfulUrls);
				if (successfulUrls.length < validFiles.length) {
					uni.showToast({
						title: `${validFiles.length - successfulUrls.length} 张图片上传失败`,
						icon: 'none'
					});
				}
			},
		});
	}

	function replaceImage(index) {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const file = res.tempFiles[0];
				if (file.size > 5 * 1024 * 1024) return uni.showToast({
					title: '文件大小不能超过5MB',
					icon: 'none'
				});

				uni.showLoading({
					title: '正在替换...',
					mask: true
				});
				const result = await uploadFile(file, {
					directory: 'post'
				});
				uni.hideLoading();

				if (result.data) {
					form.images[index] = result.data;
					uni.showToast({
						title: '图片已替换',
						icon: 'none'
					});
				} else {
					uni.showToast({
						title: result.error || '替换失败',
						icon: 'error'
					});
				}
			},
		});
	}

	function deleteImage(index) {
		uni.showModal({
			title: '提示',
			content: '确定要删除这张图片吗？',
			success: (res) => {
				if (res.confirm) {
					form.images.splice(index, 1);
				}
			}
		});
	}

	// --- 【新增】视频处理函数 ---
	async function handleChooseVideo() {
		// 确保 mediaType 是 video
		form.mediaType = 'video';

		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60, // 限制最长60秒
			compressed: true, // 建议压缩
			success: async (res) => {
				const videoFile = {
					path: res.tempFilePath,
					size: res.size,
					name: res.tempFilePath.substring(res.tempFilePath.lastIndexOf('/') + 1)
				};

				// 前端校验视频大小 (例如：限制50MB)
				if (videoFile.size > 50 * 1024 * 1024) {
					return uni.showToast({
						title: '视频大小不能超过50MB',
						icon: 'none'
					});
				}

				uni.showLoading({
					title: '视频上传中...',
					mask: true
				});

				// 调用 uploadFile (它应该也能处理视频文件)
				const result = await uploadFile(videoFile, {
					directory: 'post_videos'
				});

				uni.hideLoading();

				if (result.data) {
					form.postVideo = result.data; // 将返回的URL存入 postVideo
					uni.showToast({
						title: '视频上传成功',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: result.error || '视频上传失败',
						icon: 'none'
					});
				}
			},
			fail: (err) => {
				// 用户取消选择时，不提示错误
				if (err.errMsg.indexOf('cancel') === -1) {
					console.error('选择视频失败:', err);
				}
			}
		});
	}

	function deleteVideo() {
		uni.showModal({
			title: '提示',
			content: '确定要删除这个视频吗？',
			success: (res) => {
				if (res.confirm) {
					form.postVideo = '';
				}
			}
		});
	}

	// --- 提交表单 ---
	function submitPost() {
		if (!form.title.trim() || form.title.length > 100) return uni.showToast({
			title: '标题不能为空且不能超过100字',
			icon: 'none'
		});
		if (form.content.length > 5000) return uni.showToast({
			title: '内容不能超过5000字',
			icon: 'none'
		});
		if (!form.topic) return uni.showToast({
			title: '请选择一个专题',
			icon: 'none'
		});

		const postData = {
			userId: uni.getStorageSync('userId') || 0, // 从缓存获取 userId
			postTitle: form.title,
			postType: form.topic === '普通商机' ? '0' : '1',
			postContent: form.content,
			postImg: form.mediaType === 'image' ? form.images.join(',') : '',
			postVideo: form.mediaType === 'video' ? form.postVideo : '',
			postedAt: new Date().toISOString(),
			commentFlag: 1,
			cardFlag: form.showProfile,
			tags: form.tags,
			status: 'active'
		};

		uni.showModal({
			title: '确认发布',
			content: '请确认您填写的内容无误。',
			success: (res) => {
				if (res.confirm) {
					createOpportunities(postData);
				}
			}
		});
	}

	const createOpportunities = async (postData) => {
		uni.showLoading({
			title: '正在发布...',
			mask: true
		});
		const result = await request('/app-api/member/business-opportunities/create', {
			method: 'POST',
			data: postData
		});
		uni.hideLoading();

		if (result.data !== null) {
			clearDraft();
			uni.showModal({
				title: '发布成功',
				content: '可在【我的】-【我的商机】中查看您发布的商机。',
				showCancel: false,
				confirmText: '知道了',
				success: (res) => {
					if (res.confirm) {
						uni.navigateBack();
					}
				}
			});
		} else {
			uni.showToast({
				title: result.error || '发布失败',
				icon: 'none'
			});
		}
	};
</script>

<style scoped>
	.page {
		padding: 20rpx;
		background-color: #f9f9f9;
	}

	.header {
		background: linear-gradient(135deg, #FF6A00, #FF8C37);
		color: white;
		padding: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.header-title {
		font-size: 36rpx;
		font-weight: bold;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 50%;
		width: 50rpx;
		height: 50rpx;
		font-size: 28rpx;
		color: white;
		text-align: center;
	}

	.form-container {
		/* margin-top: 20rpx; */
	}

	.form-card {
		background: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.form-group {
		margin-bottom: 30rpx;
	}

	.form-label {
		font-size: 28rpx;
		font-weight: 700;
		margin-top: 10rpx;
		display: block;
		color: #666;
		margin-bottom: 10rpx;
		/* 为label增加一点下边距 */
	}

	.form-input,
	.form-textarea {
		width: 95%;
		border: 1rpx solid #e0e0e0;
		border-radius: 12rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 10rpx;
	}

	.form-textarea {
		min-height: 180rpx;
	}

	.hint {
		font-size: 24rpx;
		color: #999;
	}

	/* 新增：单选框组样式 */
	.radio-group-container {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 40rpx;
		/* 选项之间的间距 */
		margin-top: 10rpx;
	}

	.radio-item {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
	}

	.radio-item text {
		margin-left: 10rpx;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin: 10rpx 0;
	}

	.tag {
		background: #fff0e6;
		color: #FF6A00;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
	}

	.tag-remove {
		margin-left: 8rpx;
		font-size: 24rpx;
		color: #888;
	}

	.tag-input-container {
		display: flex;
		margin-top: 10rpx;
	}

	.tag-input {
		flex: 1;
		border: 1rpx solid #e0e0e0;
		border-top-left-radius: 20rpx;
		border-bottom-left-radius: 20rpx;
		padding: 16rpx;
		font-size: 26rpx;
	}

	.add-tag-btn {
		background: #FF6A00;
		color: white;
		padding: 0 30rpx;
		border-top-right-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
		font-size: 26rpx;
	}

	.image-preview {
		display: grid;
		/* 1. 声明为 grid 布局 */
		grid-template-columns: repeat(3, 1fr);
		/* 2. 创建一个三列的网格，每列宽度平分剩余空间 */
		gap: 16rpx;
		/* 3. 设置网格项之间的间距 */
		margin-top: 10rpx;
	}

	.image-wrapper {
		position: relative;
		/* 【修改】移除固定的宽高，让它自适应 grid 容器分配的空间 */
		/* width: 150rpx; */
		/* height: 150rpx; */
		border-radius: 12rpx;
		overflow: hidden;
		/* 【新增】强制设置宽高比为1:1，确保是正方形 */
		aspect-ratio: 1 / 1;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.delete-image-btn {
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 0 12rpx 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		z-index: 10;
	}

	.delete-image-btn:active {
		background-color: rgba(0, 0, 0, 0.7);
	}

	.add-img-placeholder {
		/* 【修改】移除固定的宽高，让它自适应 grid 容器 */
		/* width: 150rpx; */
		/* height: 150rpx; */
		/* 【新增】确保它也是一个正方形 */
		aspect-ratio: 1 / 1;

		/* 其他样式保持不变 */
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 24rpx;
	}

	.add-img-placeholder i {
		font-size: 48rpx;
		margin-bottom: 10rpx;
		color: inherit;
	}

	.add-img-placeholder text {
		font-size: 24rpx;
	}

	.add-img-placeholder:active {
		border-color: #FF6A00;
		color: #FF6A00;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.setting-label {
		font-size: 28rpx;
		color: #555;
	}

	.submit-btn {
		background: linear-gradient(to right, #FF6A00, #FF8C37);
		color: white;
		border-radius: 30rpx;
		padding: 14rpx;
		font-size: 30rpx;
		width: 100%;
		text-align: center;
		font-weight: 600;
		margin-top: 20rpx;
		box-shadow: 0 6rpx 16rpx rgba(255, 106, 0, 0.3);
	}

	/* ==================== 【新增】媒体选择器和视频预览样式 ==================== */
	.media-selector {
		display: flex;
		gap: 30rpx;
		margin-top: 10rpx;
	}

	.selector-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 180rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		color: #666;
		font-size: 26rpx;
		transition: all 0.2s ease;
	}

	.selector-btn:active {
		border-color: #FF6A00;
		color: #FF6A00;
	}

	.selector-btn text {
		margin-top: 10rpx;
	}


	.video-preview-wrapper {
		position: relative;
		width: 60%;
		/* 视频预览不需要占满整行 */
		margin-top: 10rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.preview-video {
		width: 100%;
		display: block;
	}

	.delete-video-btn {
		/* 复用删除图片的按钮样式 */
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 0 12rpx 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		z-index: 10;
	}

	.delete-video-btn:active {
		background-color: rgba(0, 0, 0, 0.7);
	}

	/* ===================================================================== */
</style>