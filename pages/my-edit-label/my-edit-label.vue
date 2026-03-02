<template>
	<view class="container">
		<view class="page-header">
			<view class="header-title-box">
				<text class="page-title">{{ isSelf ? '数字标签（自我评分）' : '给商友评分' }}</text>
				<text class="page-subtitle">{{ isSelf ? '请对自己以下维度的表现进行1-10分评估' : '请对TA以下维度的表现进行1-10分评估' }}</text>
			</view>

			<!-- 评分标准卡片 -->
			<view class="standard-card">
				<view class="standard-title">
					<uni-icons type="info-filled" size="16" color="#FF8C00"></uni-icons>
					<text>评分参考</text>
				</view>

				<view class="standard-grid">
					<view class="standard-item level-6">
						<view class="score-range">10分</view>
						<view class="score-desc">杰出</view>
					</view>
					<view class="standard-item level-5">
						<view class="score-range">8-9分</view>
						<view class="score-desc">优秀</view>
					</view>
					<view class="standard-item level-4">
						<view class="score-range">6-7分</view>
						<view class="score-desc">较好</view>
					</view>
					<view class="standard-item level-3">
						<view class="score-range">4-5分</view>
						<view class="score-desc">一般</view>
					</view>
					<view class="standard-item level-2">
						<view class="score-range">2-3分</view>
						<view class="score-desc">较差</view>
					</view>
					<view class="standard-item level-1">
						<view class="score-range">0-1分</view>
						<view class="score-desc">极差</view>
					</view>
				</view>
			</view>

			<!-- 新增：填写进度提示条，让用户实时感知完成情况 -->
			<view class="progress-tip" :class="{ 'all-done': isAllFilled }">
				<uni-icons :type="isAllFilled ? 'checkmarkempty' : 'info'" size="14"
					:color="isAllFilled ? '#4CAF50' : '#FF8C00'">
				</uni-icons>
				<text v-if="isAllFilled">所有维度已评分，可以提交了 ✓</text>
				<text v-else>还有 <text class="tip-highlight">{{ totalCount - filledCount }}</text> 个维度未评分</text>
			</view>
		</view>

		<!-- 评分区域：传入 invalidKeys，ScoreForm 内部高亮未填项 -->
		<view class="score-sections">
			<ScoreForm v-model="scores" :invalid-keys="invalidKeys" />
		</view>

		<!-- 提交按钮：改为 view 避免 button &::after 和 &[disabled] SCSS 嵌套编译报错 -->
		<view class="footer">
			<view class="submit-btn" :class="{ 'is-disabled': isSubmitting }" @click="handleSubmit">
				{{ isSubmitting ? '保存中...' : '保存评分' }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		onLoad,
	} from '@dcloudio/uni-app';
	import request from '@/utils/request.js';
	import ScoreForm from '@/components/ScoreForm.vue';

	// ==========================================
	// 1. API 定义区域（原有代码，完全未修改）
	// ==========================================
	const ScoreApi = {
		/**
		 * 保存或更新用户评分
		 * userId: 被评分人ID
		 */
		saveOrUpdate: (scoreData) => {
			return request('/app-api/member/user-scores/saveOrUpdate', {
				method: 'POST',
				data: scoreData
			});
		},
		/**
		 * 获取用户评分
		 * userId: 被评分人ID
		 */
		getInfo: (userId) => {
			return request('/app-api/member/user-scores/getInfo', {
				method: 'GET',
				data: {
					userId
				}
			});
		}
	};

	// ==========================================
	// 2. 状态变量区域（原有代码，完全未修改）
	// ==========================================

	const targetUserId = ref(null); // 目标用户 (Target)，即接口需要的 userId
	const isSelf = ref(false); // 是否是自己给自己评分
	const scoreRecordId = ref(null); // 现有评分记录ID
	const isSubmitting = ref(false); // 提交锁

	// 初始化分数的函数（原有，完全未修改）
	const getInitialScores = () => ({
		punctuality: 0,
		promiseKeep: 0,
		lawAbiding: 0,
		responsible: 0,
		sincere: 0,
		tolerance: 0,
		altruism: 0,
		empathy: 0,
		focus: 0,
		efficient: 0,
		detailOriented: 0,
		expandVision: 0,
		contribution: 0,
		humility: 0,
		foresight: 0,
		mission: 0
	});

	const scores = ref(getInitialScores());

	// ==========================================
	// 新增：校验与进度相关的计算属性和状态
	// 纯展示层逻辑，不影响任何原有功能
	// ==========================================

	/** 校验失败时记录未填项的 key，传给 ScoreForm 用于高亮 */
	const invalidKeys = ref([]);

	/** 总维度数（固定16项） */
	const totalCount = computed(() => Object.keys(scores.value).length);

	/** 已填写（分值 > 0）的维度数 */
	const filledCount = computed(() =>
		Object.values(scores.value).filter(v => v > 0).length
	);

	/** 是否所有维度都已填写，控制进度条和按钮外观 */
	const isAllFilled = computed(() =>
		Object.values(scores.value).every(v => v > 0)
	);

	// ==========================================
	// 3. 生命周期区域（原有代码，完全未修改）
	// ==========================================

	onLoad((options) => {
		const myId = uni.getStorageSync('userId');

		// 确定目标用户：URL传了id则为他人，没传则为自己
		if (options.id) {
			targetUserId.value = options.id;
		} else {
			targetUserId.value = myId;
		}

		// 判断身份关系用于 UI 显示
		isSelf.value = String(targetUserId.value) === String(myId);

		// 设置导航栏标题
		uni.setNavigationBarTitle({
			title: isSelf.value ? '数字标签(自我评分)' : '商友评分'
		});
	});

	onMounted(() => {
		fetchScores();
	});

	// ==========================================
	// 4. 方法逻辑区域（原有代码，完全未修改）
	// ==========================================

	/**
	 * 获取已有评分数据（原有代码，完全未修改）
	 */
	const fetchScores = async () => {
		if (!targetUserId.value) return;

		// 每次请求前重置数据，防止残留
		scoreRecordId.value = null;
		scores.value = getInitialScores();

		uni.showLoading({
			title: '加载中...'
		});

		try {
			const {
				data,
				error
			} = await ScoreApi.getInfo(targetUserId.value);

			if (!error && data) {
				console.log('✅ 获取评分成功:', data);
				scoreRecordId.value = data.id;
				// 回显分数
				Object.keys(scores.value).forEach(key => {
					if (data[key] !== undefined && data[key] !== null) {
						scores.value[key] = data[key];
					}
				});
			}
		} catch (e) {
			console.error('[Fetch Error]', e);
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * 原始提交逻辑（完全未修改，保持原样）
	 * 由 handleSubmit 在前置校验通过后调用
	 */
	const submitScores = async () => {
		if (isSubmitting.value) return;

		isSubmitting.value = true;
		uni.showLoading({
			title: '正在保存...'
		});

		// payload 原样保留，未修改任何字段
		const payload = {
			...scores.value,
			id: scoreRecordId.value,
			scorerId: targetUserId.value, // 被评分人
			userId: targetUserId.value // 评分人（这个加不加都没事，后端重新赋值了)
		};

		try {
			const {
				data: newRecord,
				error
			} = await ScoreApi.saveOrUpdate(payload);

			if (error) {
				const msg = typeof error === 'string' ? error : (error.msg || '保存失败');
				uni.showToast({
					title: msg,
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: '保存成功！',
					icon: 'success'
				});
				if (newRecord && newRecord.id) {
					scoreRecordId.value = newRecord.id;
				}
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		} catch (e) {
			uni.showToast({
				title: '网络异常',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
			uni.hideLoading();
		}
	};

	// ==========================================
	// 5. 新增：前置校验层（不触碰 submitScores 原有逻辑）
	// ==========================================

	/**
	 * 提交按钮点击入口
	 * 先做校验，通过后再调原有 submitScores
	 * 校验逻辑独立于原有功能代码，互不影响
	 */
	const handleSubmit = () => {
		// 找出所有分值为 0（未填）的 key
		const emptyKeys = Object.keys(scores.value).filter(k => scores.value[k] === 0);

		if (emptyKeys.length > 0) {
			// 将未填 key 传给 ScoreForm，触发对应行高亮提示
			invalidKeys.value = emptyKeys;

			uni.showToast({
				title: `还有 ${emptyKeys.length} 个维度未评分`,
				icon: 'none',
				duration: 2000
			});

			// 滚动回顶部，让用户能看到高亮了哪些项
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 300
			});
			return;
		}

		// 全部填写完毕，清除高亮状态，调原有提交函数
		invalidKeys.value = [];
		submitScores();
	};
</script>

<style scoped lang="scss">
	/* 原有样式完全保留，不修改任何原有类 */
	.container {
		background-color: #f9f9f9;
		min-height: 100vh;
		padding: 30rpx 30rpx 140rpx;
		box-sizing: border-box;
	}

	.page-header {
		margin-bottom: 30rpx;
	}

	.header-title-box {
		margin-bottom: 20rpx;
		padding-left: 10rpx;

		.page-title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 8rpx;
			display: block;
		}

		.page-subtitle {
			font-size: 26rpx;
			color: #666;
		}
	}

	.standard-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
	}

	.standard-title {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 20rpx;

		text {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.standard-grid {
		display: flex;
		justify-content: space-between;
		gap: 10rpx;
	}

	.standard-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16rpx 0;
		border-radius: 12rpx;
		background-color: #f5f5f5;

		.score-range {
			font-size: 24rpx;
			font-weight: bold;
			margin-bottom: 4rpx;
		}

		.score-desc {
			font-size: 22rpx;
			opacity: 0.9;
		}

		&.level-6 {
			background-color: #FFF0E6;
			color: #FF6A00;
		}

		&.level-5 {
			background-color: #FFF7E6;
			color: #FF9C38;
		}

		&.level-4 {
			background-color: #E8F5E9;
			color: #4CAF50;
		}

		&.level-3 {
			background-color: #E3F2FD;
			color: #2196F3;
		}

		&.level-2 {
			background-color: #FFF3E0;
			color: #FF9800;
		}

		&.level-1 {
			background-color: #FBE9E7;
			color: #FF5722;
		}
	}

	/* 新增：填写进度提示条 */
	.progress-tip {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-top: 20rpx;
		padding: 16rpx 24rpx;
		background-color: #FFF7ED;
		border-radius: 12rpx;
		border: 1rpx solid #FFE0B2;

		text {
			font-size: 26rpx;
			color: #FF8C00;
		}

		.tip-highlight {
			font-weight: bold;
			color: #FF6B00;
		}

		/* 全部完成时切换为绿色主题 */
		&.all-done {
			background-color: #F1F8E9;
			border-color: #C5E1A5;

			text {
				color: #4CAF50;
			}
		}
	}

	.score-sections {
		margin-bottom: 80rpx;
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		border-top: 1px solid #f0f0f0;
		z-index: 100;
	}

	/* 修复：button → view，消除 &[disabled] 和 &::after SCSS 嵌套编译报错 */
	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(to right, #FF8C00, #FF6B00);
		color: white;
		border-radius: 44rpx;
		font-size: 32rpx;
		text-align: center;
		font-weight: 500;
		box-sizing: border-box;

		/* 提交中时显示禁用样式 */
		&.is-disabled {
			background: #c8c9cc;
			color: rgba(255, 255, 255, 0.8);
		}
	}
</style>