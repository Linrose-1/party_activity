"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + MyCard + _easycom_uni_popup + AddCircleConfirmPopup + InviteCircleConfirmPopup + ShareTypePopup + DemandActionFab + SmartGuidePopup)();
}
const MyCard = () => "../../components/MyCard.js";
const AddCircleConfirmPopup = () => "../../components/AddCircleConfirmPopup.js";
const InviteCircleConfirmPopup = () => "../../components/InviteCircleConfirmPopup.js";
const DemandActionFab = () => "../../components/DemandActionFab.js";
const SmartGuidePopup = () => "../../components/SmartGuidePopup.js";
const ShareTypePopup = () => "../../components/ShareTypePopup.js";
const _sfc_main = {
  __name: "my-businessCard",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const errorMsg = common_vendor.ref("");
    const isViewingOwnCard = common_vendor.ref(true);
    const targetUserId = common_vendor.ref(null);
    const fromShare = common_vendor.ref(false);
    common_vendor.ref("");
    const promotionQrCodeBase64 = common_vendor.ref("");
    const remainingShareQuota = common_vendor.ref(0);
    const isQuotaLoaded = common_vendor.ref(false);
    const radarDatasets = common_vendor.ref([]);
    const guideScenario = common_vendor.ref(1);
    const guidePopupRef = common_vendor.ref(null);
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const isPopupOpen = common_vendor.ref(false);
    const addCirclePopup = common_vendor.ref(null);
    const inviteCirclePopup = common_vendor.ref(null);
    const shareTypePopupRef = common_vendor.ref(null);
    const currentShareMode = common_vendor.ref("PROXY");
    const isShareTypePopupOpen = common_vendor.ref(false);
    const creditLevel = common_vendor.ref("");
    const totalScore = common_vendor.ref(0);
    const userStatus = common_vendor.computed(() => {
      if (!utils_user.isUserFullyLoggedIn())
        return "GUEST";
      if (isViewingOwnCard.value)
        return "SELF";
      if (userInfo.value && userInfo.value.isFriend) {
        return "FRIEND";
      }
      return "STRANGER";
    });
    common_vendor.onLoad(async (options) => {
      const token = common_vendor.index.getStorageSync("token");
      let finalOptions = options || {};
      if (finalOptions.scene) {
        const sceneStr = decodeURIComponent(finalOptions.scene);
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:241", `✅ [名片页] 在 onLoad 中检测到 scene: ${sceneStr}`);
        const sceneParams = {};
        sceneStr.split("&").forEach((item) => {
          const parts = item.split("=");
          if (parts[0] && parts[1]) {
            sceneParams[parts[0]] = parts[1];
          }
        });
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:249", "✅ [名片页] scene 解析结果:", sceneParams);
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:250", "测试");
        finalOptions = {
          ...finalOptions,
          ...sceneParams
        };
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:258", "[my-businessCard] onLoad 触发。最终选项:", JSON.stringify(finalOptions));
      const inviteCode = finalOptions.c || finalOptions.inviteCode;
      if (inviteCode) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:263", "✅ [邀请码] 捕获邀请码，暂存本地:", inviteCode);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      if (!token) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:269", "⚠️ 当前为游客模式（未登录），尝试允许查看名片数据...");
      }
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const targetId = finalOptions.i || finalOptions.id;
      const isFromShareStr = finalOptions.fromShare || finalOptions.fs;
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:286", "🔍 [Debug] fromShare/fs 原始值:", isFromShareStr);
      if (isFromShareStr === "1" || isFromShareStr === 1) {
        fromShare.value = true;
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:290", "✅ [Debug] 已识别为分享来源，fromShare = true");
      } else {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:292", "❌ [Debug] 未识别为分享来源");
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:295", "打印结束");
      if (targetId) {
        if (loggedInUserId && targetId == loggedInUserId) {
          isViewingOwnCard.value = true;
        } else {
          isViewingOwnCard.value = false;
          targetUserId.value = targetId;
        }
      } else {
        if (token) {
          isViewingOwnCard.value = true;
        } else {
          common_vendor.index.__f__("warn", "at packages/my-businessCard/my-businessCard.vue:315", "游客模式且无目标ID，无法展示内容，跳转登录页");
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
          return;
        }
      }
      const isShareSource = fromShare.value === true;
      initializePage(isShareSource);
      handleShareReward(finalOptions);
      common_vendor.index.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
        // 关键：必须包含 shareTimeline
      });
      startGuideTimer();
    });
    common_vendor.onReady(() => {
      guideScenario.value = 3;
      if (guidePopupRef.value) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:355", "--- 正在测试引导弹窗，场景 ID:", guideScenario.value);
        guidePopupRef.value.open();
      }
    });
    const initializePage = async (isFromShare = false) => {
      isLoading.value = true;
      errorMsg.value = "";
      userInfo.value = null;
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:369", "🔄 [initializePage] 接收到的 isFromShare:", isFromShare);
      try {
        const rawData = isViewingOwnCard.value ? await fetchOwnUserInfo() : await fetchTargetUserInfo(targetUserId.value, isFromShare);
        if (!rawData)
          throw new Error("未能获取到名片信息");
        userInfo.value = adaptUserInfo(rawData);
        if (userInfo.value.id) {
          await fetchRadarStatistics(userInfo.value.id);
          fetchCreditInfo(userInfo.value.id);
        }
        await fetchPromotionQrCode();
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:390", "页面初始化失败:", err.message);
        const ignoredErrors = [
          "权限不足，已引导至申请页。",
          "GUEST_ACCESS_DENIED"
        ];
        if (!ignoredErrors.includes(err.message)) {
          errorMsg.value = err.message || "加载失败，请稍后重试";
        }
      } finally {
        isLoading.value = false;
      }
    };
    const fetchCreditInfo = async (userId) => {
      try {
        const {
          data,
          error
        } = await utils_request.request(`/app-api/member/user/other_credit-score/${userId}`, {
          method: "GET"
        });
        if (!error && data) {
          creditLevel.value = data.creditLevel;
          totalScore.value = data.totalScore;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:418", "获取信用信息失败", e);
      }
    };
    const handleGoToCredit = () => {
      common_vendor.index.navigateTo({
        url: "/packages/credit-score/credit-score"
      });
    };
    const handleGoToMember = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-member/my-member"
      });
    };
    const fetchRadarStatistics = async (userId) => {
      try {
        const [selfRes, friendRes, complexRes] = await Promise.all([
          utils_request.request("/app-api/member/user-scores/complexStatistics", {
            method: "GET",
            data: {
              userId,
              type: 0
            }
          }),
          utils_request.request("/app-api/member/user-scores/complexStatistics", {
            method: "GET",
            data: {
              userId,
              type: 1
            }
          }),
          utils_request.request("/app-api/member/user-scores/complexStatistics", {
            method: "GET",
            data: {
              userId,
              type: 3
            }
          })
        ]);
        const newDatasets = [];
        newDatasets.push({
          name: "自我评价",
          data: !selfRes.error && selfRes.data ? [
            selfRes.data.avg1 || 0,
            selfRes.data.avg2 || 0,
            selfRes.data.avg3 || 0,
            selfRes.data.avg4 || 0
          ] : [0, 0, 0, 0],
          color: "#FF7D00"
        });
        newDatasets.push({
          name: "商友评价",
          data: !friendRes.error && friendRes.data ? [
            friendRes.data.avg1 || 0,
            friendRes.data.avg2 || 0,
            friendRes.data.avg3 || 0,
            friendRes.data.avg4 || 0
          ] : [0, 0, 0, 0],
          color: "#4CAF50"
        });
        newDatasets.push({
          name: "综合评价",
          data: !complexRes.error && complexRes.data ? [
            complexRes.data.avg1 || 0,
            complexRes.data.avg2 || 0,
            complexRes.data.avg3 || 0,
            complexRes.data.avg4 || 0
          ] : [0, 0, 0, 0],
          color: "#1890FF"
        });
        radarDatasets.value = newDatasets;
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:498", "✅ 评分数据加载完成，顺序：自我(0), 商友(1), 综合(2)");
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:500", "获取评分统计失败", e);
      }
    };
    const fetchOwnUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error)
        throw new Error(error);
      return data;
    };
    const fetchPromotionQrCode = async () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:530", "游客模式，跳过生成推广小程序码");
        return;
      }
      if (!userInfo.value) {
        common_vendor.index.__f__("warn", "at packages/my-businessCard/my-businessCard.vue:536", "无法生成小程序码，因为用户信息尚未加载。");
        return;
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:540", "🚀 [二维码生成] 开始生成小程序码...");
      const scene = generateSceneString();
      if (!scene) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:545", "❌ [二维码生成] 生成 scene 失败，无法继续。");
        return;
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:548", `✅ [二维码生成] 使用的 scene: ${scene}`);
      const payload = {
        scene,
        path: "packages/my-businessCard/my-businessCard",
        width: 430,
        autoColor: true,
        checkPath: true,
        hyaline: true
      };
      const {
        data: base64Image,
        error
      } = await utils_request.request("/app-api/member/social-user/wxa-qrcode", {
        method: "POST",
        data: payload
      });
      if (error) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:572", "❌ [二维码生成] 调用接口失败:", error);
        return;
      }
      const finalBase64 = base64Image.startsWith("data:image") ? base64Image : `data:image/png;base64,${base64Image}`;
      promotionQrCodeBase64.value = finalBase64;
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:586", "✅ [二维码生成] 成功获取并存储了小程序码 Base64 数据");
    };
    const generateSceneString = () => {
      if (!userInfo.value)
        return "";
      const cardOwnerId = userInfo.value.id;
      const inviteCode = userInfo.value.shardCode;
      const sharerId = common_vendor.index.getStorageSync("userId");
      const params = [];
      if (cardOwnerId)
        params.push(`i=${cardOwnerId}`);
      if (sharerId)
        params.push(`s=${sharerId}`);
      if (inviteCode)
        params.push(`c=${inviteCode}`);
      params.push("fs=1");
      const scene = params.join("&");
      if (scene.length > 32) {
        common_vendor.index.__f__("warn", "at packages/my-businessCard/my-businessCard.vue:615", `生成的 scene 字符串长度为 ${scene.length}，超过了32个字符的限制！Scene: ${scene}`);
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:624", "scene", scene);
      return scene;
    };
    const fetchTargetUserInfo = async (userId, forceFree = false) => {
      const requestData = {
        readUserId: userId
        // isReadByFriend: friendOwnerUserId.value ? 1 : 0,
        // friendOwnerUserId: friendOwnerUserId.value || 0
      };
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:639", "🛠 [fetchTargetUserInfo] forceFree:", forceFree);
      if (forceFree) {
        requestData.notPay = 1;
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:646", "[名片页] 游客/用户请求名片数据:", JSON.stringify(requestData));
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: requestData
      });
      if (!error) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:658", "✅ 获取名片成功");
        return data;
      }
      common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:663", "获取名片失败:", error);
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "提示",
          content: "当前为游客模式，如无法查看完整信息，请尝试登录",
          confirmText: "去登录",
          cancelText: "暂不登录",
          success: (res) => {
            if (res.confirm)
              common_vendor.index.reLaunch({
                url: "/pages/index/index"
              });
          }
        });
        return null;
      }
      throw new Error(typeof error === "string" ? error : error.msg || "获取失败");
    };
    const checkShareQuota = async () => {
      try {
        const {
          data
        } = await utils_request.request("/app-api/member/top-up-level-rights/get-remaining", {
          method: "GET",
          data: {
            rightsType: 4
          }
        });
        if (typeof data === "number") {
          remainingShareQuota.value = data;
        } else {
          remainingShareQuota.value = 0;
        }
        isQuotaLoaded.value = true;
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:708", "剩余分享次数:", remainingShareQuota.value);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:710", "获取权益失败", e);
      }
    };
    const deductShareQuota = async () => {
      try {
        await utils_request.request("/app-api/member/top-up-level-rights/update-share-rights", {
          method: "PUT"
        });
        checkShareQuota();
      } catch (e) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:722", "扣减权益失败", e);
      }
    };
    const adaptUserInfo = (rawUserData) => {
      var _a, _b;
      if (!rawUserData)
        return null;
      const splitStr = (str) => str ? String(str).split(",").map((s) => s.trim()).filter((s) => s) : [];
      const associations = splitStr(rawUserData.associationName);
      const titles = splitStr(rawUserData.professionalTitle);
      const associationList = associations.map((name, i) => ({
        name,
        title: titles[i] || ""
      })).filter((item) => item.name || item.title);
      const companies = splitStr(rawUserData.companyName);
      const industries = splitStr(rawUserData.industry);
      const positions = splitStr(rawUserData.positionTitle);
      const companyList = companies.map((name, i) => ({
        name,
        industry: industries[i] || "",
        position: positions[i] || ""
      })).filter((item) => item.name || item.industry || item.position);
      return {
        ...rawUserData,
        // 保留原始数据
        associationList,
        // 结构化后的数组
        companyList,
        // 结构化后的数组
        // 下面这些字段如果 MyCard 内部还在用，也要保留
        pinyinName: ((_a = rawUserData.topUpLevel) == null ? void 0 : _a.name) || rawUserData.topUpLevelName || "",
        titleName: ((_b = rawUserData.level) == null ? void 0 : _b.name) || rawUserData.levelName || ""
      };
    };
    const formattedContactInfo = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      const info = [
        {
          icon: "phone-filled",
          label: "手机",
          value: userInfo.value.mobile || "未设置"
        },
        {
          icon: "email-filled",
          label: "邮箱",
          value: userInfo.value.contactEmail || "未设置"
        }
      ];
      if (userInfo.value.countryStr) {
        info.push({
          icon: "map-pin-ellipse",
          // 使用地图图标
          label: "国家",
          value: userInfo.value.countryStr
        });
      }
      info.push({
        icon: "location-filled",
        label: "商区",
        value: userInfo.value.locationAddressStr || "未设置"
      });
      info.push({
        icon: "location-filled",
        label: "家乡",
        value: userInfo.value.nativePlaceStr || "未设置"
      });
      return info;
    });
    const isAnyPopupOpen = common_vendor.computed(() => {
      return isPopupOpen.value || isShareTypePopupOpen.value;
    });
    const onShareTypePopupChange = (e) => {
      isShareTypePopupOpen.value = e.show;
    };
    const startGuideTimer = () => {
      setTimeout(() => {
        const token = common_vendor.index.getStorageSync("token");
        const userInfo2 = utils_user.getCachedUserInfo();
        if (!token) {
          guideScenario.value = 1;
          if (guidePopupRef.value)
            guidePopupRef.value.open();
        } else if (!userInfo2 || !userInfo2.mobile) {
          guideScenario.value = 2;
          if (guidePopupRef.value)
            guidePopupRef.value.open();
        } else if (userInfo2.isComplete !== 1) {
          guideScenario.value = 3;
          if (guidePopupRef.value)
            guidePopupRef.value.open();
        } else {
          common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:838", "✅ 用户已完善资料，跳过引导弹窗");
          return;
        }
      }, 6e3);
    };
    const openShareTypePopup = () => {
      isShareTypePopupOpen.value = true;
      shareTypePopupRef.value.open();
    };
    const handleShareTypeSelect = (mode) => {
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:856", "用户选择了分享模式:", mode);
      currentShareMode.value = mode;
      if (shareTypePopupRef.value) {
        shareTypePopupRef.value.close();
      }
      isShareTypePopupOpen.value = false;
      setTimeout(() => {
        let titlePrefix = mode === "SELF" ? "【推荐】" : "";
        customShareTitle.value = `${titlePrefix}这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
        if (sharePopup.value) {
          sharePopup.value.open();
          isPopupOpen.value = true;
        }
      }, 350);
    };
    const handleShareReward = (options) => {
      const sharerId = options.s || options.sharerId;
      if (!options || !sharerId)
        return;
      const bizId = options.i || options.id;
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      if (sharerId == loggedInUserId) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:896", "用户点击了自己的分享链接，不计分。");
        return;
      }
      if (loggedInUserId) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:902", "其他已登录用户点击，准备为分享者加分。");
        triggerShareHitApi(sharerId, bizId);
      } else {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:907", "未登录用户点击，暂存分享信息。");
        common_vendor.index.setStorageSync("pendingShareReward", {
          sharerId,
          bizId,
          type: 30
          // 30 代表 "分享名片奖励"
        });
      }
    };
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      const {
        error
      } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 30,
          shareUserId: sharerId,
          bizId
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:932", "调用分享名片加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:934", `成功为分享者(ID: ${sharerId})触发贡分增加`);
      }
    };
    common_vendor.onShareAppMessage((res) => {
      isPopupOpen.value = false;
      isShareTypePopupOpen.value = false;
      if (sharePopup.value)
        sharePopup.value.close();
      if (shareTypePopupRef.value)
        shareTypePopupRef.value.close();
      deductShareQuota();
      if (!userInfo.value)
        return {
          title: "名片分享"
        };
      const cardOwnerId = userInfo.value.id;
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      let finalInviteCode = "";
      if (res.from === "button") {
        if (currentShareMode.value === "SELF") {
          finalInviteCode = utils_user.getInviteCode();
          common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:973", "分享模式：自发(推荐)，使用我的邀请码:", finalInviteCode);
        } else {
          finalInviteCode = userInfo.value.shardCode;
          common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:977", "分享模式：代发(原样)，使用TA的邀请码:", finalInviteCode);
        }
      } else {
        finalInviteCode = utils_user.getInviteCode() || userInfo.value.shardCode;
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:982", "分享模式：原生菜单触发，默认优先使用我的码:", finalInviteCode);
      }
      let sharePath = `/packages/my-businessCard/my-businessCard?id=${cardOwnerId}&fromShare=1`;
      if (loggedInUserId) {
        sharePath += `&sharerId=${loggedInUserId}`;
      }
      if (finalInviteCode) {
        sharePath += `&inviteCode=${finalInviteCode}`;
      }
      const defaultTitle = `${userInfo.value.realName || userInfo.value.nickname} 的数字名片`;
      const finalTitle = customShareTitle.value || defaultTitle;
      const shareContent = {
        title: finalTitle,
        path: sharePath,
        imageUrl: userInfo.value.avatar
        // 使用名片主人的头像作为分享卡片封面
      };
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:1008", "🚀 [onShareAppMessage] 最终分享配置:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      hideTimelineGuide();
      isPopupOpen.value = false;
      isShareTypePopupOpen.value = false;
      deductShareQuota();
      if (!userInfo.value)
        return {};
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const cardOwnerId = userInfo.value.id;
      const inviteCode = currentShareMode.value === "SELF" ? utils_user.getInviteCode() : userInfo.value.shardCode;
      let queryString = `id=${cardOwnerId}&fromShare=1`;
      if (loggedInUserId)
        queryString += `&sharerId=${loggedInUserId}`;
      if (inviteCode)
        queryString += `&inviteCode=${inviteCode}`;
      queryString += `&m=${currentShareMode.value}`;
      const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      return {
        title: finalTitle,
        query: queryString,
        imageUrl: userInfo.value.avatar
      };
    });
    const handleEditRemark = () => {
      common_vendor.index.showModal({
        title: "修改备注名",
        content: userInfo.value.remarkName || "",
        // 将当前备注作为默认值
        editable: true,
        // 开启输入框模式
        placeholderText: "请输入备注名",
        success: async (res) => {
          if (res.confirm) {
            const newRemarkName = res.content.trim();
            const success = await saveUserRemark(newRemarkName);
            if (success) {
              userInfo.value.remarkName = newRemarkName;
              common_vendor.index.showToast({
                title: "备注已更新",
                icon: "success"
              });
            }
          }
        }
      });
    };
    const saveUserRemark = async (remark) => {
      if (!targetUserId.value)
        return false;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-remark/addOrUpdateRemarkName", {
        method: "POST",
        data: {
          toUserId: targetUserId.value,
          remarkName: remark
        }
      });
      if (error) {
        common_vendor.index.showToast({
          title: `保存失败: ${error}`,
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const goToEdit = () => common_vendor.index.navigateTo({
      url: "/packages/my-edit/my-edit"
    });
    const openSharePopup = async () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "提示",
          content: "登录后才能分享名片哦",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm)
              common_vendor.index.reLaunch({
                url: "/pages/index/index"
              });
          }
        });
        return;
      }
      await checkShareQuota();
      if (remainingShareQuota.value !== -1 && remainingShareQuota.value <= 0) {
        common_vendor.index.showModal({
          title: "分享次数不足",
          content: "您本月的名片分享次数已耗尽。升级会员可获取更多次数。",
          confirmText: "升级会员",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/packages/recharge/recharge?type=membership"
              });
            }
          }
        });
        return;
      }
      currentShareMode.value = "SELF";
      customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      sharePopup.value.open();
      isPopupOpen.value = true;
    };
    const closeSharePopup = () => {
      sharePopup.value.close();
      isPopupOpen.value = false;
    };
    const guideShareTimeline = () => {
      closeSharePopup();
      isPopupOpen.value = false;
      showTimelineGuide.value = true;
    };
    const onPopupChange = (e) => {
      isPopupOpen.value = e.show;
    };
    const hideTimelineGuide = () => showTimelineGuide.value = false;
    const handleGoToOpportunities = () => {
      if (!userInfo.value || !userInfo.value.id) {
        common_vendor.index.showToast({
          title: "无法获取用户信息",
          icon: "none"
        });
        return;
      }
      const url = `/packages/user-opportunities/user-opportunities?userId=${userInfo.value.id}&userName=${encodeURIComponent(userInfo.value.realName || userInfo.value.nickname)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const goToLogin = () => {
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    };
    const goToHome = () => {
      common_vendor.index.switchTab({
        url: "/pages/home/home"
      });
    };
    const handleAddCircle = () => {
      const user = {
        id: userInfo.value.id,
        name: userInfo.value.realName || userInfo.value.nickname
      };
      addCirclePopup.value.open(user);
    };
    const handleInviteCircle = () => {
      const user = {
        id: userInfo.value.id,
        name: userInfo.value.realName || userInfo.value.nickname
      };
      inviteCirclePopup.value.open(user);
    };
    const onSocialActionSuccess = (targetId) => {
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:1311", "社交操作成功，目标用户ID:", targetId);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {
        b: common_vendor.p({
          status: "loading",
          contentText: "正在加载名片..."
        })
      } : errorMsg.value ? {
        d: common_vendor.p({
          type: "closeempty",
          size: "50",
          color: "#999"
        }),
        e: common_vendor.t(errorMsg.value)
      } : userInfo.value ? {
        g: common_vendor.t(isViewingOwnCard.value ? "我的数字名片" : "TA的数字名片"),
        h: common_vendor.o(handleEditRemark),
        i: common_vendor.o(handleGoToCredit),
        j: common_vendor.o(handleGoToMember),
        k: common_vendor.o(handleGoToOpportunities),
        l: common_vendor.p({
          avatar: userInfo.value.avatar,
          name: userInfo.value.realName || userInfo.value.nickname,
          ["remark-name"]: userInfo.value.remarkName,
          ["is-viewing-own-card"]: isViewingOwnCard.value,
          ["pinyin-name"]: userInfo.value.pinyinName,
          title: userInfo.value.titleName,
          era: userInfo.value.era,
          ["company-list"]: userInfo.value.companyList,
          ["association-list"]: userInfo.value.associationList,
          ["have-resources"]: userInfo.value.haveResources,
          ["need-resources"]: userInfo.value.needResources,
          signature: userInfo.value.signature,
          ["personal-bio"]: userInfo.value.personalBio,
          ["contact-info"]: formattedContactInfo.value,
          ["show-user-qr-code"]: !!userInfo.value.wechatQrCodeUrl,
          ["user-we-chat-qr-code-url"]: userInfo.value.wechatQrCodeUrl,
          ["shard-code"]: userInfo.value.shardCode,
          ["dynamic-qr-code-url"]: promotionQrCodeBase64.value,
          ["radar-datasets"]: radarDatasets.value,
          ["credit-level"]: creditLevel.value,
          ["total-score"]: totalScore.value,
          ["platform-qr-code-url"]: "https://img.gofor.club/mmexport1759211962539.jpg"
        })
      } : {}, {
        c: errorMsg.value,
        f: userInfo.value,
        m: userInfo.value
      }, userInfo.value ? common_vendor.e({
        n: userStatus.value === "GUEST"
      }, userStatus.value === "GUEST" ? {
        o: common_vendor.o(goToLogin),
        p: common_vendor.o(goToHome)
      } : userStatus.value === "STRANGER" ? {
        r: common_vendor.o(handleAddCircle),
        s: common_vendor.o(handleInviteCircle),
        t: common_vendor.o(openShareTypePopup)
      } : userStatus.value === "FRIEND" ? {
        w: common_vendor.p({
          type: "paperplane",
          size: "18",
          color: "#fff"
        }),
        x: common_vendor.o(openShareTypePopup),
        y: common_vendor.p({
          type: "star-filled",
          size: "18",
          color: "#fff"
        })
      } : userStatus.value === "SELF" ? {
        A: common_vendor.o(openSharePopup),
        B: common_vendor.o(goToEdit)
      } : {}, {
        q: userStatus.value === "STRANGER",
        v: userStatus.value === "FRIEND",
        z: userStatus.value === "SELF",
        C: isAnyPopupOpen.value ? 1 : ""
      }) : {}, {
        D: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        E: common_assets._imports_0$3,
        F: common_vendor.o(hideTimelineGuide)
      } : {}, {
        G: customShareTitle.value,
        H: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        I: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        J: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        K: common_vendor.o(guideShareTimeline),
        L: common_vendor.o(closeSharePopup),
        M: common_vendor.sr(sharePopup, "34d71473-5", {
          "k": "sharePopup"
        }),
        N: common_vendor.o(onPopupChange),
        O: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        P: common_vendor.sr(addCirclePopup, "34d71473-8", {
          "k": "addCirclePopup"
        }),
        Q: common_vendor.sr(inviteCirclePopup, "34d71473-9", {
          "k": "inviteCirclePopup"
        }),
        R: common_vendor.o(onSocialActionSuccess),
        S: common_vendor.sr(shareTypePopupRef, "34d71473-10", {
          "k": "shareTypePopupRef"
        }),
        T: common_vendor.o(handleShareTypeSelect),
        U: common_vendor.o(onShareTypePopupChange),
        V: userStatus.value !== "GUEST" && userStatus.value !== "SELF"
      }, userStatus.value !== "GUEST" && userStatus.value !== "SELF" ? {} : {}, {
        W: common_vendor.sr(guidePopupRef, "34d71473-12", {
          "k": "guidePopupRef"
        }),
        X: common_vendor.p({
          scenario: guideScenario.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-34d71473"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-businessCard/my-businessCard.js.map
