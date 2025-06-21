// utils/aiRequest.js (仅包含核心非流式请求功能)

// 定义 AI 服务器的基础 URL 和你的 API Key
// !!! 重要：生产环境请务必使用安全方式管理 API Key !!!
const AI_BASE_URL = 'https://xingxuan.qudone.com/ragflow/api/v1'; // 你的 AI 服务器地址
const API_KEY = 'ragflow-Q3OTQ0MTFhMWMxYjExZjA4OWFjNTJiNz';     // 你的 API Key

/**
 * 封装的核心网络请求函数 (非流式)
 *
 * @param {object} options - 请求配置对象
 * @param {string} options.url - 请求的相对路径 (例如 "/chats/{chat_id}/sessions")
 * @param {string} [options.method='GET'] - HTTP 请求方法 (GET, POST, PUT, DELETE 等)
 * @param {object} [options.data={}] - 请求体数据 (通常用于 POST, PUT 请求)
 * @param {object} [options.header={}] - 需要合并或覆盖的额外请求头
 * @param {number} [options.timeout=30000] - 请求超时时间 (毫秒)
 *
 * @returns {Promise<object>} 返回一个 Promise 对象。
 *   - 如果请求成功且 API 返回 code 为 0，Promise 将 resolve 一个对象：{ success: true, data: apiData.data, code: 0 }
 *   - 如果请求成功但 API 返回 code 非 0，Promise 将 reject 一个对象：{ success: false, message: apiData.message, code: apiData.code, raw: res }
 *   - 如果 HTTP 请求失败 (非 200 状态码)，Promise 将 reject 一个对象：{ success: false, message: '网络错误: {statusCode}', statusCode: res.statusCode, raw: res }
 *   - 如果网络请求本身失败 (例如超时、无法连接)，Promise 将 reject 一个对象：{ success: false, message: '网络请求失败: {errMsg}', error: err }
 *   - 如果服务器返回无效数据，Promise 将 reject 一个对象：{ success: false, message: '无效的响应数据', code: -1, raw: res }
 */
const aiRequest = (options) => {
  // 返回一个 Promise，用于异步处理请求结果
  return new Promise((resolve, reject) => {

    // 显示全局的 Loading 提示，表示正在请求
    uni.showLoading({ title: '请稍候...' });

    // 拼接完整的请求 URL
    let url = AI_BASE_URL + options.url;

    // 准备请求头，包含基础的 Content-Type 和 Authorization
    let header = {
      'Content-Type': 'application/json', // 指定请求体为 JSON 格式
      'Authorization': `Bearer ${API_KEY}`, // 添加 Bearer Token 进行身份验证
      ...(options.header || {}) // 合并调用时传入的额外 header
    };

    // 打印调试日志，记录发送的请求信息
    console.log(`[aiRequest] 发送请求: ${options.method || 'GET'} ${url}`);
    // console.log(`[aiRequest] 使用 Header:`, JSON.stringify(header)); // 需要时取消注释调试 Header
    // console.log(`[aiRequest] 发送 Data:`, options.data); // 需要时取消注释调试请求体

    // 调用 uniapp 的网络请求 API
    uni.request({
      url: url, // 请求地址
      method: options.method || 'GET', // 请求方法，默认为 GET
      data: options.data || {}, // 请求数据
      header: header, // 请求头
      dataType: 'json', // 期望服务器返回 JSON 格式的数据
      timeout: options.timeout || 30000, // 请求超时时间，默认 30 秒

      // 请求成功的回调函数 (HTTP 状态码 2xx 或 304)
      success: (res) => {
        // console.log(`[aiRequest] 收到 success 回调: statusCode=${res.statusCode}, data=`, res.data); // 需要时取消注释调试响应

        // 首先检查 HTTP 状态码是否为 200 OK
        if (res.statusCode === 200) {
          // 获取服务器返回的数据体
          const apiData = res.data;

          // 检查返回的数据是否是有效的对象，并且 API 业务码 (code) 为 0
          if (apiData && typeof apiData === 'object' && apiData.code === 0) {
             // console.log(`[aiRequest] 请求成功, API code=0`);
             // 请求成功且业务成功，resolve Promise 并传递格式化的成功结果
             resolve({ success: true, data: apiData.data, code: 0 });
          } else if (apiData && typeof apiData === 'object') {
             // 请求成功但 API 返回业务错误码 (code 非 0)
             console.error(`[aiRequest] API 业务错误:`, apiData);
             // reject Promise 并传递包含错误信息的对象
             reject({ success: false, message: apiData.message || '请求失败', code: apiData.code, raw: res });
          } else {
              // 服务器返回了 200，但响应体不是有效的 JSON 对象或没有 code 字段
              console.error(`[aiRequest] 无效响应数据或结构`, res);
              // reject Promise 并传递错误信息
              reject({ success: false, message: '无效的响应数据', code: -1, raw: res });
          }
        } else {
          // HTTP 状态码不是 200 (例如 404, 500 等)
          console.error(`[aiRequest] HTTP 错误:`, res);
          // reject Promise 并传递包含 HTTP 错误信息的对象
          reject({ success: false, message: `网络错误: ${res.statusCode}`, statusCode: res.statusCode, raw: res });
        }
      },

      // 网络请求本身失败的回调函数 (例如超时、DNS 解析失败、无法连接服务器等)
      fail: (err) => {
        console.error(`[aiRequest] 请求失败 fail 回调:`, err);
        // reject Promise 并传递包含网络错误信息的对象
        reject({ success: false, message: `网络请求失败: ${err.errMsg}`, error: err });
      },

      // 请求完成的回调函数 (无论成功或失败都会执行)
      complete: () => {
        // 隐藏全局的 Loading 提示
        uni.hideLoading();
      }
    });
  });
};

// --- 只导出核心的 aiRequest 函数 ---
// 其他特定 API 的封装函数（如 createChatSession, converseWithChatAssistant 等）已被移除
export { aiRequest };

// 如果你后续完全不打算直接调用 aiRequest，而是总会通过封装函数，也可以使用默认导出：
// export default aiRequest;