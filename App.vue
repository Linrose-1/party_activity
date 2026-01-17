<script>
	import request from '@/utils/request.js';

	export default {
		data() {
			return {
				locationTimer: null
			}
		},
		onLaunch: function(options) {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')

			console.log('App Launch, 启动参数 options:', options);

			let finalQuery = options.query || {};

			// 1. 检查是否存在 scene 参数 (扫码进入)
			if (options.scene) {
				const sceneStr = decodeURIComponent(options.scene);
				console.log('✅ [App.vue] 检测到 scene 参数:', sceneStr);
				// 2. 将 scene 字符串解析成键值对对象
				const sceneParams = {};
				sceneStr.split('&').forEach(item => {
					const parts = item.split('=');
					if (parts[0] && parts[1]) {
						sceneParams[parts[0]] = parts[1];
					}
				});
				console.log('✅ [App.vue] scene 解析结果:', sceneParams);
				// 3. 将解析后的参数合并到 finalQuery 中，优先使用 scene 里的参数
				finalQuery = {
					...finalQuery,
					...sceneParams
				};
			}

			// 4. 从最终的参数对象中提取邀请码
			const inviteCode = finalQuery.c || finalQuery.inviteCode;
			if (inviteCode) {
				console.log('✅ [App.vue] 全局捕获到邀请码:', inviteCode);
				uni.setStorageSync('pendingInviteCode', inviteCode);
			}
		},
		onShow: function() {
			console.log('App Show');
			// 在应用显示时，尝试启动定时器
			this.startLocationUpdates();
			// 检查并应用新版本
			this.checkUpdate();
		},
		onHide: function() {
			console.log('App Hide');
			// 应用隐藏时，停止定时器
			this.stopLocationUpdates();
		},
		methods: {
			/**
			 * 检查小程序更新
			 */
			checkUpdate() {
				// 获取全局唯一的版本更新管理器
				const updateManager = uni.getUpdateManager();

				// 1. 检查是否有新版本
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log('是否有新版本发布:', res.hasUpdate);
				});

				// 2. 新版本下载完成
				updateManager.onUpdateReady(function() {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success: function(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
							}
						}
					});
				});

				// 3. 新版本下载失败
				updateManager.onUpdateFailed(function() {
					// 新的版本下载失败
					console.error('新版本下载失败');
					// 可以选择提示用户删除小程序重新搜索，或者静默忽略
					// uni.showToast({ title: '新版本下载失败，请稍后重试', icon: 'none' });
				});
			},
			/**
			 * 检查用户是否已登录
			 */
			isLoggedIn() {
				// 这里假设你将登录凭证（例如 token 或 userId）保存在本地缓存中
				// 请根据你项目实际存储凭证的方式来修改
				const token = uni.getStorageSync('token');
				// 如果 token 存在，则认为已登录
				return !!token;
			},

			/**
			 * 启动周期性位置上传
			 */
			startLocationUpdates() {
				// 先清除已有的定时器，防止重复启动
				this.stopLocationUpdates();

				// 【核心修正】: 如果未登录，直接返回，不启动定时器
				if (!this.isLoggedIn()) {
					console.log('用户未登录，不启动位置上传定时器');
					return;
				}

				const updateTask = () => {
					console.log('正在获取并上传用户当前位置...');
					uni.getLocation({
						type: 'gcj02',
						success: async (res) => {
							console.log(`获取位置成功: ${res.longitude}, ${res.latitude}`);

							// 直接使用 request 调用接口
							const {
								error
							} = await request('/app-api/member/user/upload-location', {
								method: 'POST',
								data: {
									longitude: res.longitude,
									latitude: res.latitude
								}
							});

							if (error) {
								console.error('自动上传位置信息失败:', error);
							} else {
								console.log('用户当前位置上传成功！');
							}
						},
						fail: (err) => {
							console.error('获取位置信息失败:', err);
						}
					});
				};

				// 立即执行一次
				updateTask();

				// 设置定时器，每10分钟 (600000毫秒) 执行一次
				this.locationTimer = setInterval(updateTask, 600000);
				console.log('位置上传定时器已启动');
			},

			/**
			 * 停止位置上传
			 */
			stopLocationUpdates() {
				if (this.locationTimer) {
					clearInterval(this.locationTimer);
					this.locationTimer = null;
					console.log('位置上传定时器已停止');
				}
			}
		}
	}
</script>


<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>