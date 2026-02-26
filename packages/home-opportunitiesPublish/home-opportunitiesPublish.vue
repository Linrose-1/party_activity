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

				<view class="form-card">
					<!-- 1. 发布身份选择：增加 :disabled="isEditMode" -->
					<view class="form-group">
						<view class="form-label">发布身份</view>
						<radio-group @change="handleIdentityChange" class="radio-group-container">
							<label class="radio-item">
								<!-- 禁用 radio -->
								<radio value="0" :checked="form.isEnterprise === 0" :disabled="isEditMode"
									color="#FF6A00" />
								<text :style="{color: isEditMode ? '#999' : '#333'}">个人身份</text>
							</label>
							<label class="radio-item">
								<!-- 禁用 radio -->
								<radio value="1" :checked="form.isEnterprise === 1" :disabled="isEditMode"
									color="#FF6A00" />
								<text :style="{color: isEditMode ? '#999' : '#333'}">企业/品牌身份</text>
							</label>
						</radio-group>
					</view>

					<!-- 2. 企业下拉选择：增加 :disabled="isEditMode" -->
					<view class="form-group" v-if="form.isEnterprise === 1">
						<view class="form-label">选择发布企业</view>
						<view class="enterprise-selector-wrap">
							<uni-data-select v-model="form.userEnterpriseId" :localdata="myEnterprises"
								:disabled="isEditMode" placeholder="请选择名下的企业"></uni-data-select>
						</view>
						<!-- 编辑模式下隐藏“去创建”的提示，防止干扰 -->
						<view class="no-enterprise-tip" v-if="myEnterprises.length === 0 && !isEditMode"
							@click="goToCreateEnterprise">
							<text>检测到您尚未创建已发布的企业，点击去创建 ></text>
						</view>
					</view>
				</view>

				<view class="form-group">
					<view class="form-label">选择分类</view>
					<radio-group @change="topicChange" class="radio-group-container">
						<label class="radio-item">
							<!-- 禁用商机分享单选框 -->
							<radio value="商机分享" :checked="form.topic === '商机分享'" :disabled="isEditMode"
								color="#FF6A00" />
							<text :style="{color: isEditMode ? '#999' : '#333'}">商机分享</text>
						</label>
						<label class="radio-item">
							<!-- 禁用创业猎伙单选框 -->
							<radio value="创业猎伙" :checked="form.topic === '创业猎伙'" :disabled="isEditMode"
								color="#FF6A00" />
							<text :style="{color: isEditMode ? '#999' : '#333'}">创业猎伙🔥</text>
						</label>
					</radio-group>
					<!-- 编辑模式下的温馨提示 -->
					<view v-if="isEditMode" class="hint" style="margin-top: 8rpx; color: #BBB;">
						注：商机发布后不可更改分类
					</view>
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

					<scroll-view class="tag-suggestions-scroll" scroll-x="true" v-if="tagSuggestions.length > 0">
						<view class="suggestion-tag" v-for="(suggestion, index) in tagSuggestions" :key="index"
							@click="selectSuggestion(suggestion)">
							{{ suggestion }}
						</view>
					</scroll-view>

					<!-- v-model 绑定到 form.tagInput -->
					<view class="tag-input-container">
						<input v-model="form.tagInput" class="tag-input" placeholder="输入标签（如,合作/需求/经验/创业灵感...）" />
						<button class="add-tag-btn" @click="handleAddTagManually">添加</button>
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

					<!-- Case 2: 图片区域 -->
					<view v-if="form.mediaType === 'image' && form.images.length > 0" class="image-preview-area">
						<DragImageUploader v-model="form.images" :max-count="9" @add-image="handleChooseImage" />
					</view>

					<!-- Case 3: 已经选择了视频 -->
					<view v-if="form.mediaType === 'video' && form.postVideo" class="video-section">

						<!-- 视频预览 -->
						<view class="video-preview-wrapper">
							<video :src="form.postVideo" class="preview-video" controls object-fit="contain"></video>
							<!-- 删除按钮：加 .stop 阻止冒泡 -->
							<cover-view class="delete-video-btn" @click.stop="deleteVideo">×</cover-view>
						</view>

						<!-- 封面上传 -->
						<view class="video-cover-wrapper" @click="handleChooseVideoCover">
							<image v-if="form.businessCoverImageUrl" :src="form.businessCoverImageUrl" mode="aspectFill"
								class="cover-image" />
							<view v-else class="add-cover-placeholder">
								<uni-icons type="image" size="24" color="#999"></uni-icons>
								<text>上传封面</text>
							</view>
							<view class="cover-tag">视频封面</view>
						</view>

					</view>

					<!-- 提示文案 -->
					<text class="hint">{{ form.mediaType === 'image' ? '最多可上传9张图片' : '仅支持上传一个视频' }}</text>
					<view class="hint">为了适应分享封面，首张图片建议使用4:3画幅比例上传，可使用相册自带的画幅剪切工具调整图片尺寸</view>
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

				<!-- 阅读留痕设置 -->
				<view class="setting-item">
					<view class="setting-label-group">
						<text class="setting-label">开启阅读留痕</text>
						<text class="setting-desc">其他商友点击详情页阅读之后会留下头像，方便发现与匹配对贴子感兴趣的商友</text>
					</view>
					<switch :checked="form.isReadTrace === 1" @change="e => form.isReadTrace = e.detail.value ? 1 : 0"
						color="#FF6A00" />
				</view>
			</view>

			<button class="submit-btn"
				:class="{ 'disabled-btn': isQuotaLoaded && currentRemainingQuota <= 0 && !isEditMode }"
				@click="handleSubmitClick">
				{{ isEditMode ? '提交修改' : '发布帖子' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		watch,
		nextTick,
		onMounted,
		computed
	} from 'vue';
	import {
		onLoad,
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';
	import request from '../../utils/request.js';
	import uploadFile from '../../utils/upload.js';
	import {
		getInviteCode
	} from '../../utils/user.js';

	// --- 统一使用 reactive 管理所有表单状态 ---
	const form = reactive({
		id: null,
		title: '',
		content: '',
		topic: '商机分享',
		tags: [],
		tagInput: '',
		mediaType: 'image',
		images: [],
		postVideo: '',
		businessCoverImageUrl: '',
		showProfile: true,
		isReadTrace: 1,
		isEnterprise: 0, // 0-个人, 1-企业
		userEnterpriseId: null // 企业主键ID
	});

	const isEditMode = ref(false); // 标记是否为编辑模式
	let hasCheckedDraft = false; // 草稿检查锁

	const myEnterprises = ref([]); // 存储我的企业列表

	const tagSuggestions = ref([]); // 用于存储从API获取的标签建议
	let tagSearchTimer = null; // 用于输入防抖

	const quotaBusiness = ref(0); // 商机剩余
	const quotaPartner = ref(0); // 猎伙剩余
	const isQuotaLoaded = ref(false);

	// --- 计算属性 ---
	const contentPlaceholder = computed(() => {
		if (form.topic === '创业猎伙') {
			return '发布寻找创业项目合伙人需求。';
		}
		return '描述您的项目/商机、需求/经验分享。';
	});

	const currentRemainingQuota = computed(() => {
		// 根据当前选中的 topic 返回对应的余额
		if (form.topic === '创业猎伙') {
			return quotaPartner.value;
		}
		return quotaBusiness.value; // 默认为商机分享
	});

	// --- 生命周期钩子 ---
	onLoad(async (options) => {
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

		if (options.id) {
			isEditMode.value = true;
			form.id = options.id;
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: '编辑商机'
			});
			// 获取详情数据进行反显
			fetchOpportunityDetail(options.id);
		} else {
			// 创建模式才检查本地草稿
			checkDraft();
		}

		if (uni.getStorageSync('token')) {
			checkPublishQuota();
			fetchMyEnterprises();
		}
		uni.showShareMenu({
			// withShareTicket: true,
			menus: ["shareAppMessage", "shareTimeline"]
		});
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
			hasCheckedDraft = true;
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

	/**
	 * [新增方法] 获取详情并还原到表单
	 */
	const fetchOpportunityDetail = async (id) => {
		uni.showLoading({
			title: '正在获取内容...'
		});
		const {
			data,
			error
		} = await request('/app-api/member/business-opportunities/get', {
			method: 'GET',
			data: {
				id
			}
		});
		uni.hideLoading();

		if (!error && data) {
			// 数据映射还原
			form.title = data.postTitle;
			form.content = data.postContent;
			form.topic = data.postType == 1 ? '创业猎伙' : '商机分享';
			form.tags = data.tags || [];
			form.showProfile = data.cardFlag;
			form.isReadTrace = data.isReadTrace;
			form.isEnterprise = data.isEnterprise;
			form.userEnterpriseId = data.userEnterpriseId;

			// 媒体还原
			if (data.postVideo) {
				form.mediaType = 'video';
				form.postVideo = data.postVideo;
				form.businessCoverImageUrl = data.businessCoverImageUrl;
			} else {
				form.mediaType = 'image';
				form.images = data.postImg ? data.postImg.split(',').filter(s => s) : [];
			}
		}
	};

	// 获取商机发布剩余次数
	// 获取商机/猎伙发布剩余次数
	const checkPublishQuota = async () => {
		try {
			const [res1, res2] = await Promise.all([
				request('/app-api/member/top-up-level-rights/get-remaining', {
					method: 'GET',
					data: {
						rightsType: 1
					}
				}),
				request('/app-api/member/top-up-level-rights/get-remaining', {
					method: 'GET',
					data: {
						rightsType: 2
					}
				})
			]);

			// 只看 data，null 转为 0
			quotaBusiness.value = (typeof res1.data === 'number') ? res1.data : 0;
			quotaPartner.value = (typeof res2.data === 'number') ? res2.data : 0;

			isQuotaLoaded.value = true;
			console.log(`权益加载完成: 商机=${quotaBusiness.value}, 猎伙=${quotaPartner.value}`);

		} catch (e) {
			console.error('获取权益失败', e);
		}
	};

	// --- 表单交互函数 (现在都操作 form 对象) ---
	function topicChange(e) {
		form.topic = e.detail.value;
	}

	/**
	 * 处理点击建议标签的函数
	 * @param {string} tagName - 被点击的建议标签名
	 */
	function selectSuggestion(tagName) {
		if (!tagName) return;

		// 1. 格式化标签名 (确保带 '#')
		let val = tagName.trim();
		if (!val.startsWith('#')) val = '#' + val;

		// 2. 校验是否已存在或超出数量
		if (form.tags.length >= 5) return uni.showToast({
			title: '最多添加5个标签',
			icon: 'none'
		});
		if (form.tags.includes(val)) return uni.showToast({
			title: '标签已存在',
			icon: 'none'
		});

		// 3. 将建议添加到表单的 tags 数组中
		form.tags.push(val);

		// 4. 清空输入框和建议列表
		form.tagInput = '';
		tagSuggestions.value = [];
	}

	function handleAddTagManually() {
		let val = form.tagInput.trim();
		if (!val) return uni.showToast({
			title: '请输入标签',
			icon: 'none'
		});

		// 1. 格式化标签名
		if (!val.startsWith('#')) val = '#' + val;

		// 2. 校验
		if (form.tags.length >= 5) return uni.showToast({
			title: '最多添加5个标签',
			icon: 'none'
		});
		if (form.tags.includes(val)) return uni.showToast({
			title: '标签已存在',
			icon: 'none'
		});

		// 3. 添加到表单
		form.tags.push(val);

		// 4. 只有在手动添加时，才记录到历史
		logTagSearch(val, 1); // type: 1 代表商机

		// 5. 清空输入框和建议
		form.tagInput = '';
		tagSuggestions.value = [];
	}



	/**
	 * 静默记录标签搜索历史
	 * @param {string} name - 标签名
	 * @param {number} type - 类型 (1: 商机)
	 */
	async function logTagSearch(name, type) {
		// 移除 '#' 前缀再记录
		const tagName = name.startsWith('#') ? name.substring(1) : name;

		try {
			await request('/app-api/member/tags-search-history/create', {
				method: 'POST',
				data: {
					id: 0,
					name: tagName,
					type: type
				}
			});
			console.log(`标签历史 "${tagName}" 已记录`);
		} catch (error) {
			console.error('记录标签历史失败:', error);
		}
	}

	/**
	 * 监听标签输入框的变化，触发模糊搜索
	 */
	watch(() => form.tagInput, (newValue) => {
		clearTimeout(tagSearchTimer);
		if (newValue && newValue.trim()) {
			// 使用防抖，延迟300ms触发搜索
			tagSearchTimer = setTimeout(() => {
				fetchTagSuggestions(newValue.trim());
			}, 300);
		} else {
			// 如果输入框为空，清空建议
			tagSuggestions.value = [];
		}
	});

	/**
	 * 从API获取标签建议
	 * @param {string} keyword - 用户输入的关键词
	 */
	async function fetchTagSuggestions(keyword) {
		try {
			const {
				data,
				error
			} = await request('/app-api/member/tags-search-history/page', {
				method: 'GET',
				data: {
					pageNo: 1,
					pageSize: 20,
					name: keyword,
					type: 1 // 只搜索商机相关的历史标签
				}
			});

			if (error || !data || !data.list) {
				tagSuggestions.value = [];
				return;
			}

			// 将返回的列表处理成字符串数组，并去重
			const suggestions = data.list.map(item => item.name);
			tagSuggestions.value = [...new Set(suggestions)];

		} catch (e) {
			console.error('获取标签建议失败:', e);
			tagSuggestions.value = [];
		}
	}

	function removeTag(index) {
		form.tags.splice(index, 1);
	}

	/**
	 * 选择媒体类型
	 * @param {string} type - 'image' 或 'video'
	 */
	function selectMediaType(type) {
		// 如果已经有内容，提示清空
		if ((type === 'image' && form.postVideo) || (type === 'video' && form.images.length > 0)) {
			uni.showModal({
				title: '提示',
				content: '切换类型将清空当前内容，是否继续？',
				success: (res) => {
					if (res.confirm) {
						form.mediaType = type;
						form.images = [];
						form.postVideo = '';
						form.businessCoverImageUrl = '';

						if (type === 'image') handleChooseImage();
						if (type === 'video') handleChooseVideo();
					}
				}
			});
		} else {
			// 无冲突，直接开始
			form.mediaType = type;
			if (type === 'image') handleChooseImage();
			if (type === 'video') handleChooseVideo();
		}
	}

	// --- 图片处理函数 ---
	async function handleChooseImage() {
		// 确保模式正确
		if (form.mediaType !== 'image') form.mediaType = 'image';

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
					title: `正在上传...`,
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

				// 将新图片追加到数组，DragImageUploader 会自动响应
				form.images.push(...successfulUrls);

				if (successfulUrls.length < validFiles.length) {
					uni.showToast({
						title: '部分图片上传失败',
						icon: 'none'
					});
				}
			},
		});
	}


	// 预览图片
	const previewImage = (index) => {
		console.log('当前点击的图片:', form.images[index]);
		if (!form.images || form.images.length === 0) return;

		uni.previewImage({
			urls: form.images, // 预览所有图片
			current: index, // 当前显示的图片索引
			loop: true // 是否循环预览
		});
	};

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

	// --- 视频处理函数 ---
	async function handleChooseVideo() {
		// 1. 清理可能存在的图片
		if (form.images.length > 0) {
			// 这里可以直接清空，或者询问用户。为了体验流畅，直接清空并切换模式。
			form.images = [];
		}

		// 2. 调用系统选择视频
		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60,
			compressed: true,
			success: async (res) => {
				// 选到了视频，设置模式
				form.mediaType = 'video';

				const videoFile = {
					path: res.tempFilePath,
					size: res.size
				};

				// 校验大小
				if (videoFile.size > 50 * 1024 * 1024) {
					form.mediaType = ''; // 恢复初始状态
					return uni.showToast({
						title: '视频超过50MB',
						icon: 'none'
					});
				}

				uni.showLoading({
					title: '视频上传中...',
					mask: true
				});

				const result = await uploadFile(videoFile, {
					directory: 'post_videos'
				});

				uni.hideLoading();

				if (result.data) {
					form.postVideo = result.data;
					uni.showToast({
						title: '视频上传成功',
						icon: 'success'
					});
				} else {
					// 失败了恢复状态
					form.mediaType = '';
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					});
				}
			},
			fail: (err) => {
				// 用户取消了，不做任何改变，保持显示大按钮的状态
				console.log('取消选择视频');
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
					form.businessCoverImageUrl = '';
					// 如果删除了视频，且没有图片，重置状态以显示大按钮
					if (form.images.length === 0) {
						form.mediaType = '';
					}
				}
			}
		});
	}

	// 上传视频封面
	const handleChooseVideoCover = async () => {
		uni.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFiles[0].tempFilePath;

				// #ifdef MP-WEIXIN
				// 微信小程序端：调用原生裁剪
				wx.cropImage({
					src: tempFilePath,
					cropScale: '4:3', // 【关键】强制 4:3 比例
					success: (cropRes) => {
						console.log('裁剪成功:', cropRes.tempFilePath);
						uploadCoverToCloud(cropRes.tempFilePath);
					},
					fail: (err) => {
						console.log('用户取消裁剪或失败:', err);
						// 即使取消裁剪，是否允许直接使用原图？
						// 如果强制要求 4:3，这里就 return; 
						// 如果允许降级，则调用 uploadCoverToCloud(tempFilePath);
					}
				});
				// #endif

				// #ifndef MP-WEIXIN
				// 非小程序端直接上传（或引入裁剪插件）
				uploadCoverToCloud(tempFilePath);
				// #endif
			}
		});
	};

	// 抽离上传逻辑
	const uploadCoverToCloud = async (filePath) => {
		uni.showLoading({
			title: '上传中...'
		});

		// 构造 file 对象 (适配你的 uploadFile 工具)
		const result = await uploadFile({
			path: filePath
		}, {
			directory: 'post_covers'
		});

		uni.hideLoading();

		if (result.data) {
			form.businessCoverImageUrl = result.data;
			uni.showToast({
				title: '封面设置成功',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: '上传失败',
				icon: 'none'
			});
		}
	};

	const showQuotaExceededModal = () => {
		const typeName = form.topic === '创业猎伙' ? '创业猎伙' : '商机发布';
		uni.showModal({
			title: '发布额度不足',
			content: `您本月的【${typeName}】发布次数已耗尽，升级会员可获取更多额度。`,
			cancelText: '取消',
			confirmText: '升级会员',
			confirmColor: '#FF6A00',
			success: (res) => {
				if (res.confirm) {
					// 跳转到会员充值页
					uni.navigateTo({
						url: '/packages/recharge/recharge?type=membership'
					});
				}
			}
		});
	};

	const handleSubmitClick = () => {
		// 使用计算属性判断当前类别的额度
		if (isQuotaLoaded.value && currentRemainingQuota.value == 0) {
			showQuotaExceededModal();
			return;
		}
		submitPost();
	};

	/**
	 * [方法] 获取我名下的企业列表 (对接 /my-list 接口)
	 */
	const fetchMyEnterprises = async () => {
		const {
			data,
			error
		} = await request('/app-api/member/user-enterprise-info/my-list', {
			method: 'GET'
		});
		if (!error && data && data.list) {
			// 过滤出只有“已发布”和“已认证”的企业，防止草稿误用
			myEnterprises.value = data.list
				.filter(item => item.status !== 0)
				.map(item => ({
					text: item.enterpriseName,
					value: item.id
				}));

			console.log('✅ 可用发布身份企业数:', myEnterprises.value.length);
		}
	};

	/**
	 * [方法] 切换发布身份
	 */
	const handleIdentityChange = (e) => {
		const val = Number(e.detail.value);
		form.isEnterprise = val;

		// 如果切回个人，清空企业ID
		if (val === 0) {
			form.userEnterpriseId = null;
		} else if (myEnterprises.value.length === 1) {
			// 如果只有一家企业，自动选中
			form.userEnterpriseId = myEnterprises.value[0].value;
		}
	};

	/**
	 * [跳转] 如果没企业，引导去创建
	 */
	const goToCreateEnterprise = () => {
		uni.navigateTo({
			url: '/packages/enterprise-list/enterprise-list'
		});
	};


	// --- 提交表单 ---
	function submitPost() {
		// 额度检查拦截
		if (isQuotaLoaded.value && currentRemainingQuota.value == 0) {
			showQuotaExceededModal();
			return;
		}
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
		if (form.isEnterprise === 1 && !form.userEnterpriseId) {
			return uni.showToast({
				title: '请选择要发布的身份企业',
				icon: 'none'
			});
		}

		const postData = {
			id: form.id,
			userId: uni.getStorageSync('userId') || 0, // 从缓存获取 userId
			postTitle: form.title,
			postType: form.topic === '商机分享' ? '0' : '1',
			postContent: form.content,
			postImg: form.mediaType === 'image' ? form.images.join(',') : '',
			postVideo: form.mediaType === 'video' ? form.postVideo : '',
			businessCoverImageUrl: form.mediaType === 'video' ? form.businessCoverImageUrl : '',
			postedAt: new Date().toISOString(),
			commentFlag: 1,
			cardFlag: form.showProfile,
			isReadTrace: form.isReadTrace,
			isEnterprise: form.isEnterprise,
			userEnterpriseId: form.userEnterpriseId || 0,
			tags: form.tags,
			status: 'active'
		};

		uni.showModal({
			title: isEditMode.value ? '确认修改' : '确认发布',
			content: '请确认您填写的内容无误。',
			success: (res) => {
				if (res.confirm) {
					// 根据模式执行不同的接口
					if (isEditMode.value) {
						performUpdate(postData); // 调用更新方法
					} else {
						createOpportunities(postData); // 调用原有的创建方法
					}
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

	/**
	 * [方法] 执行更新接口
	 */
	const performUpdate = async (postData) => {
		uni.showLoading({
			title: '正在保存修改...',
			mask: true
		});
		const result = await request('/app-api/member/business-opportunities/update', {
			method: 'PUT', // 注意这里是 PUT
			data: postData
		});
		uni.hideLoading();

		if (!result.error) {

			clearDraft();

			uni.showToast({
				title: '修改成功',
				icon: 'success'
			});
			// 修改成功后延迟返回
			setTimeout(() => uni.navigateBack(), 1500);
		} else {
			uni.showToast({
				title: result.error || '保存失败',
				icon: 'none'
			});
		}
	};

	/**
	 * @description 监听用户点击“分享给好友”
	 */
	onShareAppMessage(() => {
		// 1. 获取当前用户的邀请码
		const inviteCode = getInviteCode();
		console.log(`[商机发布页] 分享给好友，获取到邀请码: ${inviteCode}`);

		// 2. 构建分享路径，并附带邀请码参数
		let sharePath = '/packages/home-opportunitiesPublish/home-opportunitiesPublish';
		if (inviteCode) {
			sharePath += `?inviteCode=${inviteCode}`;
		}

		// 3. 定义分享内容
		const shareContent = {
			title: '发现一个好商机，快来发布你的商业需求！',
			path: sharePath,
			// 建议使用一个固定的、吸引人的分享图片
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};

		console.log('[商机发布页] 分享给好友的内容:', JSON.stringify(shareContent));
		return shareContent;
	});

	/**
	 * @description 监听用户点击“分享到朋友圈”
	 */
	onShareTimeline(() => {
		// 1. 获取当前用户的邀请码
		const inviteCode = getInviteCode();
		console.log(`[商机发布页] 分享到朋友圈，获取到邀请码: ${inviteCode}`);

		// 2. 构建 query 字符串
		let queryString = '';
		if (inviteCode) {
			queryString = `inviteCode=${inviteCode}`;
		}

		// 3. 定义分享内容
		const shareContent = {
			title: '发现一个好商机，快来发布你的商业需求！',
			query: queryString,
			imageUrl: 'https://img.gofor.club/logo_share.jpg'
		};

		console.log('[商机发布页] 分享到朋友圈的内容:', JSON.stringify(shareContent));
		return shareContent;
	});

	/* ========================================  图片拖拽移动编辑 ======================================== */

	// 删除逻辑
	// const deleteImage = (index) => {
	// 	uni.showModal({
	// 		title: '提示',
	// 		content: '确定删除？',
	// 		success: (res) => {
	// 			if (res.confirm) {
	// 				form.images.splice(index, 1);
	// 				initDragList(form.images);

	// 				// 如果删光了，重置回初始状态
	// 				if (form.images.length === 0) {
	// 					form.mediaType = '';
	// 				}
	// 			}
	// 		}
	// 	});
	// };

	// --- 拖拽排序相关状态 ---
	// const dragDisplayList = ref([]);
	// const dragItemWidth = ref(0);
	// const dragItemHeight = ref(0);
	// const dragAreaHeight = ref(0);
	// const isDragging = ref(false);
	// const dragIndex = ref(-1);
	// const dragColumns = 3;
	// const dragItemHeightRpx = 230;

	// 1. 初始化尺寸
	// const initDragLayout = () => {
	// 	const sys = uni.getSystemInfoSync();

	// 	// 假设页面左右 padding 各 20rpx，总共 40rpx
	// 	// 【关键】这里多减一点，比如减 60rpx 或 70rpx，确保宽度绝对不会溢出
	// 	// 如果你的 .page padding 是 20rpx，那这里减 40rpx 是不够的，因为还有 item 之间的间隙
	// 	// 建议减去 (20rpx * 2) + 稍微多一点的冗余
	// 	const containerWidth = sys.windowWidth - uni.upx2px(100);

	// 	// 计算单格宽度
	// 	dragItemWidth.value = containerWidth / dragColumns;
	// 	dragItemHeight.value = uni.upx2px(dragItemHeightRpx);
	// };

	// // 2. 初始化列表 (监听 form.images)
	// watch(() => form.images, (newVal) => {
	// 	if (!isDragging.value) {
	// 		initDragList(newVal);
	// 	}
	// }, {
	// 	deep: true
	// }); // 移除 immediate，手动调一次即可

	// // 在 onLoad 或 onMounted 里初始化一次
	// onMounted(() => {
	// 	initDragLayout();
	// 	// 如果有草稿恢复的数据
	// 	if (form.images.length > 0) initDragList(form.images);
	// });

	// const initDragList = (originList) => {
	// 	if (!originList) return;
	// 	// 确保尺寸已计算
	// 	if (dragItemWidth.value === 0) initDragLayout();

	// 	dragDisplayList.value = originList.map((url, index) => {
	// 		const {
	// 			x,
	// 			y
	// 		} = getPos(index);
	// 		return {
	// 			id: `img_${index}_${Math.random()}`, // 唯一KEY
	// 			data: url,
	// 			x,
	// 			y,
	// 			zIndex: 1,
	// 			realIndex: index
	// 		};
	// 	});
	// 	updateDragHeight();
	// };

	// const getPos = (index) => {
	// 	const row = Math.floor(index / dragColumns);
	// 	const col = index % dragColumns;
	// 	return {
	// 		x: col * dragItemWidth.value,
	// 		y: row * dragItemHeight.value
	// 	};
	// };

	// const updateDragHeight = () => {
	// 	const count = dragDisplayList.value.length;
	// 	const rows = Math.ceil(count / dragColumns);
	// 	dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
	// };

	// // --- 拖拽事件 ---
	// const onMovableStart = (index) => {
	// 	isDragging.value = true;
	// 	dragIndex.value = index;
	// 	dragDisplayList.value[index].zIndex = 99;
	// };

	// const onMovableChange = (e, index) => {
	// 	if (!isDragging.value || index !== dragIndex.value) return;
	// 	const x = e.detail.x;
	// 	const y = e.detail.y;

	// 	const centerX = x + dragItemWidth.value / 2;
	// 	const centerY = y + dragItemHeight.value / 2;
	// 	const col = Math.floor(centerX / dragItemWidth.value);
	// 	const row = Math.floor(centerY / dragItemHeight.value);
	// 	let targetIndex = row * dragColumns + col;

	// 	if (targetIndex < 0) targetIndex = 0;
	// 	if (targetIndex >= dragDisplayList.value.length) targetIndex = dragDisplayList.value.length - 1;

	// 	if (targetIndex !== dragIndex.value) {
	// 		const mover = dragDisplayList.value[dragIndex.value];
	// 		dragDisplayList.value.splice(dragIndex.value, 1);
	// 		dragDisplayList.value.splice(targetIndex, 0, mover);

	// 		dragDisplayList.value.forEach((item, idx) => {
	// 			if (idx !== targetIndex) {
	// 				const pos = getPos(idx);
	// 				item.x = pos.x;
	// 				item.y = pos.y;
	// 			}
	// 		});
	// 		dragIndex.value = targetIndex;
	// 	}
	// };

	// const onMovableEnd = () => {
	// 	isDragging.value = false;
	// 	if (dragIndex.value !== -1) {
	// 		const item = dragDisplayList.value[dragIndex.value];
	// 		item.zIndex = 1;
	// 		const pos = getPos(dragIndex.value);
	// 		nextTick(() => {
	// 			item.x = pos.x;
	// 			item.y = pos.y;
	// 		});

	// 		// 同步回 form.images
	// 		const sortedUrls = dragDisplayList.value.map(wrapper => wrapper.data);
	// 		form.images = sortedUrls;
	// 	}
	// 	dragIndex.value = -1;
	// };

	/* ========================================  图片拖拽移动编辑 ======================================== */
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

	.identity-hint {
		margin-top: 16rpx;
		font-size: 22rpx;
		color: #999;
		background-color: #f9f9f9;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		line-height: 1.4;
	}

	.enterprise-selector-wrap {
		margin-top: 10rpx;
	}

	.no-enterprise-tip {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #FF6A00;
		text-decoration: underline;
		text-align: center;
	}

	.animate-fade {
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ==================== 标签建议区域样式 ==================== */
	.tag-suggestions-scroll {
		white-space: nowrap;
		/* 关键：让内部元素不换行，从而可以横向滚动 */
		padding: 10rpx 0;
		margin-bottom: 10rpx;
		width: 100%;
	}

	/* 隐藏滚动条 */
	.tag-suggestions-scroll ::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}

	.suggestion-tag {
		display: inline-block;
		/* 关键：让标签在同一行排列 */
		background-color: #f0f0f0;
		color: #555;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
		margin-right: 16rpx;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.suggestion-tag:active {
		background-color: #e0e0e0;
	}

	/* ============================================================ */

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
		/* 移除固定的宽高，让它自适应 grid 容器分配的空间 */
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
		/* 移除固定的宽高，让它自适应 grid 容器 */
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

	.setting-label-group {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding-right: 20rpx;
	}

	.setting-desc {
		font-size: 22rpx;
		color: #999;
		line-height: 1.4;
		margin-top: 4rpx;
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

	.submit-btn.disabled-btn {
		background: #ccc;
		/* 灰色背景 */
		color: #fff;
		box-shadow: none;
		/* pointer-events: none;  <--如果不希望用户点击出弹窗，就加上这行；如果希望点击后弹窗提示升级，就不要加这行 */
	}

	/* ==================== 媒体选择器和视频预览样式 ==================== */
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


	.video-section {
		display: flex;
		gap: 20rpx;
		margin-top: 10rpx;
	}

	/* 视频预览框 (左侧) */
	.video-preview-wrapper {
		position: relative;
		flex: 2;
		/* 占据较大宽度 */
		height: 240rpx;
		/* 固定高度 */
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #000;
	}

	.preview-video {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* 封面上传框 (右侧) */
	.video-cover-wrapper {
		position: relative;
		flex: 1;
		/* 占据较小宽度 */
		height: 240rpx;
		/* 高度与视频一致 */
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.cover-image {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.add-cover-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
	}

	.add-cover-placeholder text {
		font-size: 22rpx;
		margin-top: 6rpx;
	}

	.cover-tag {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		font-size: 20rpx;
		text-align: center;
		padding: 4rpx 0;
		z-index: 10;
	}

	.delete-video-btn {
		/* 复用删除图片的按钮样式 */
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 50rpx;
		height: 50rpx;
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
</style>