"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const generatePromotionQrCode = async (path, customParams = {}) => {
  const userId = common_vendor.index.getStorageSync("userId");
  const userInfoStr = common_vendor.index.getStorageSync("userInfo");
  let inviteCode = "";
  if (userInfoStr) {
    try {
      const user = JSON.parse(userInfoStr);
      inviteCode = user.shardCode || "";
    } catch (e) {
    }
  }
  const params = [];
  if (inviteCode)
    params.push(`c=${inviteCode}`);
  if (userId)
    params.push(`s=${userId}`);
  Object.keys(customParams).forEach((key) => {
    params.push(`${key}=${customParams[key]}`);
  });
  params.push("fs=1");
  const scene = params.join("&");
  common_vendor.index.__f__("log", "at utils/qrcode.js:35", `🚀 [生成二维码] 路径: ${path}, Scene: ${scene}`);
  const {
    data,
    error
  } = await utils_request.request("/app-api/member/social-user/wxa-qrcode", {
    method: "POST",
    data: {
      scene,
      path,
      width: 430,
      autoColor: true,
      checkPath: true,
      hyaline: true
    }
  });
  if (error) {
    common_vendor.index.__f__("error", "at utils/qrcode.js:54", "生成二维码失败:", error);
    return "";
  }
  return data.startsWith("data:image") ? data : `data:image/png;base64,${data}`;
};
exports.generatePromotionQrCode = generatePromotionQrCode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/qrcode.js.map
