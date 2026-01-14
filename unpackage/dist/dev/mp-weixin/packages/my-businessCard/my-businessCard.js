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
  (_easycom_uni_load_more + _easycom_uni_icons + MyCard + _easycom_uni_popup + AddCircleConfirmPopup + ShareTypePopup)();
}
const MyCard = () => "../../components/MyCard.js";
const AddCircleConfirmPopup = () => "../../components/AddCircleConfirmPopup.js";
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
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    const isPopupOpen = common_vendor.ref(false);
    const addCirclePopup = common_vendor.ref(null);
    const shareTypePopupRef = common_vendor.ref(null);
    const currentShareMode = common_vendor.ref("PROXY");
    const isShareTypePopupOpen = common_vendor.ref(false);
    const userStatus = common_vendor.computed(() => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
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
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:205", `✅ [名片页] 在 onLoad 中检测到 scene: ${sceneStr}`);
        const sceneParams = {};
        sceneStr.split("&").forEach((item) => {
          const parts = item.split("=");
          if (parts[0] && parts[1]) {
            sceneParams[parts[0]] = parts[1];
          }
        });
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:213", "✅ [名片页] scene 解析结果:", sceneParams);
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:214", "测试");
        finalOptions = {
          ...finalOptions,
          ...sceneParams
        };
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:222", "[my-businessCard] onLoad 触发。最终选项:", JSON.stringify(finalOptions));
      const inviteCode = finalOptions.c || finalOptions.inviteCode;
      if (inviteCode) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:227", "✅ [邀请码] 捕获邀请码，暂存本地:", inviteCode);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      if (!token) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:233", "⚠️ 当前为游客模式（未登录），尝试允许查看名片数据...");
      }
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const targetId = finalOptions.i || finalOptions.id;
      const isFromShareStr = finalOptions.fromShare || finalOptions.fs;
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:250", "🔍 [Debug] fromShare/fs 原始值:", isFromShareStr);
      if (isFromShareStr === "1" || isFromShareStr === 1) {
        fromShare.value = true;
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:254", "✅ [Debug] 已识别为分享来源，fromShare = true");
      } else {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:256", "❌ [Debug] 未识别为分享来源");
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:259", "打印结束");
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
          common_vendor.index.__f__("warn", "at packages/my-businessCard/my-businessCard.vue:279", "游客模式且无目标ID，无法展示内容，跳转登录页");
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
          return;
        }
      }
      const isShareSource = fromShare.value === true;
      initializePage(isShareSource);
      handleShareReward(finalOptions);
      common_vendor.index.hideShareMenu();
    });
    const initializePage = async (isFromShare = false) => {
      isLoading.value = true;
      errorMsg.value = "";
      userInfo.value = null;
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:307", "🔄 [initializePage] 接收到的 isFromShare:", isFromShare);
      try {
        const rawData = isViewingOwnCard.value ? await fetchOwnUserInfo() : await fetchTargetUserInfo(targetUserId.value, isFromShare);
        if (!rawData)
          throw new Error("未能获取到名片信息");
        userInfo.value = adaptUserInfo(rawData);
        await fetchPromotionQrCode();
      } catch (err) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:322", "页面初始化失败:", err.message);
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
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:361", "游客模式，跳过生成推广小程序码");
        return;
      }
      if (!userInfo.value) {
        common_vendor.index.__f__("warn", "at packages/my-businessCard/my-businessCard.vue:367", "无法生成小程序码，因为用户信息尚未加载。");
        return;
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:371", "🚀 [二维码生成] 开始生成小程序码...");
      const scene = generateSceneString();
      if (!scene) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:376", "❌ [二维码生成] 生成 scene 失败，无法继续。");
        return;
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:379", `✅ [二维码生成] 使用的 scene: ${scene}`);
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
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:403", "❌ [二维码生成] 调用接口失败:", error);
        return;
      }
      const finalBase64 = base64Image.startsWith("data:image") ? base64Image : `data:image/png;base64,${base64Image}`;
      promotionQrCodeBase64.value = finalBase64;
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:417", "✅ [二维码生成] 成功获取并存储了小程序码 Base64 数据");
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
        common_vendor.index.__f__("warn", "at packages/my-businessCard/my-businessCard.vue:446", `生成的 scene 字符串长度为 ${scene.length}，超过了32个字符的限制！Scene: ${scene}`);
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:455", "scene", scene);
      return scene;
    };
    const fetchTargetUserInfo = async (userId, forceFree = false) => {
      const requestData = {
        readUserId: userId
      };
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:468", "🛠 [fetchTargetUserInfo] forceFree:", forceFree);
      if (forceFree) {
        requestData.notPay = 1;
      }
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:475", "[名片页] 游客/用户请求名片数据:", JSON.stringify(requestData));
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: requestData
      });
      if (!error) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:487", "✅ 获取名片成功");
        return data;
      }
      common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:492", "获取名片失败:", error);
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
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:537", "剩余分享次数:", remainingShareQuota.value);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:539", "获取权益失败", e);
      }
    };
    const deductShareQuota = async () => {
      try {
        await utils_request.request("/app-api/member/top-up-level-rights/update-share-rights", {
          method: "PUT"
        });
        checkShareQuota();
      } catch (e) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:551", "扣减权益失败", e);
      }
    };
    const adaptUserInfo = (rawUserData) => {
      var _a, _b;
      if (!rawUserData)
        return null;
      return {
        id: rawUserData.id,
        // --- 身份核心信息 ---
        avatar: rawUserData.avatar,
        realName: rawUserData.realName,
        nickname: rawUserData.nickname,
        remarkName: rawUserData.remarkName,
        pinyinName: ((_a = rawUserData.topUpLevel) == null ? void 0 : _a.name) || rawUserData.topUpLevelName || "",
        // 会员等级
        titleName: ((_b = rawUserData.level) == null ? void 0 : _b.name) || rawUserData.levelName || "",
        // 身份头衔
        era: rawUserData.era,
        // 新增：年代
        // --- 职业与社会信息 ---
        companyName: rawUserData.companyName,
        positionTitle: rawUserData.positionTitle,
        // 新增：职务
        industry: rawUserData.industry,
        // 新增：行业
        professionalTitle: rawUserData.professionalTitle,
        // 新增：社会职务
        // --- 资源信息 ---
        haveResources: rawUserData.haveResources,
        // 新增：我有资源
        needResources: rawUserData.needResources,
        // 新增：我需资源
        // --- 个人展示信息 ---
        signature: rawUserData.signature,
        // 新增：个性签名
        personalBio: rawUserData.personalBio,
        // 新增：个人简介
        // --- 联系方式 (保持不变) ---
        mobile: rawUserData.mobile,
        contactEmail: rawUserData.contactEmail,
        locationAddressStr: rawUserData.locationAddressStr,
        // --- 二维码与邀请码 ---
        wechatQrCodeUrl: rawUserData.wechatQrCodeUrl,
        shardCode: rawUserData.shardCode
      };
    };
    const formattedContactInfo = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      return [
        {
          icon: "phone-filled",
          label: "手机",
          value: userInfo.value.mobile || "未设置"
        },
        {
          icon: "email-filled",
          label: "邮箱",
          value: userInfo.value.contactEmail || "未设置"
        },
        {
          icon: "location-filled",
          label: "地址",
          value: userInfo.value.locationAddressStr || "未设置"
        }
      ];
    });
    const isAnyPopupOpen = common_vendor.computed(() => {
      return isPopupOpen.value || isShareTypePopupOpen.value;
    });
    const onShareTypePopupChange = (e) => {
      isShareTypePopupOpen.value = e.show;
    };
    const openShareTypePopup = () => {
      isShareTypePopupOpen.value = true;
      shareTypePopupRef.value.open();
    };
    const handleShareTypeSelect = (mode) => {
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:641", "用户选择了分享模式:", mode);
      currentShareMode.value = mode;
    };
    const handleShareReward = (options) => {
      const sharerId = options.s || options.sharerId;
      if (!options || !sharerId)
        return;
      const bizId = options.i || options.id;
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      if (sharerId == loggedInUserId) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:663", "用户点击了自己的分享链接，不计分。");
        return;
      }
      if (loggedInUserId) {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:669", "其他已登录用户点击，准备为分享者加分。");
        triggerShareHitApi(sharerId, bizId);
      } else {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:674", "未登录用户点击，暂存分享信息。");
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
        common_vendor.index.__f__("error", "at packages/my-businessCard/my-businessCard.vue:699", "调用分享名片加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:701", `成功为分享者(ID: ${sharerId})触发贡分增加`);
      }
    };
    common_vendor.onShareAppMessage((res) => {
      closeSharePopup();
      if (shareTypePopupRef.value)
        shareTypePopupRef.value.close();
      deductShareQuota();
      if (!userInfo.value)
        return {
          title: "一张很棒的电子名片"
        };
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const cardOwnerId = userInfo.value.id;
      let finalInviteCode = "";
      if (res.from === "button" && currentShareMode.value) {
        if (currentShareMode.value === "SELF") {
          finalInviteCode = utils_user.getInviteCode();
          common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:732", "分享模式：自发，使用我的码:", finalInviteCode);
        } else {
          finalInviteCode = userInfo.value.shardCode;
          common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:736", "分享模式：代发，使用TA的码:", finalInviteCode);
        }
      } else {
        finalInviteCode = utils_user.getInviteCode() || userInfo.value.shardCode;
        common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:750", "分享模式：原生菜单，默认使用:", finalInviteCode);
      }
      let sharePath = `/packages/my-businessCard/my-businessCard?id=${cardOwnerId}&fromShare=1`;
      if (loggedInUserId) {
        sharePath += `&sharerId=${loggedInUserId}`;
      }
      if (finalInviteCode) {
        sharePath += `&inviteCode=${finalInviteCode}`;
      }
      let titlePrefix = "";
      if (currentShareMode.value === "SELF") {
        titlePrefix = "【推荐】";
      }
      const finalTitle = customShareTitle.value || `${titlePrefix}这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      const shareContent = {
        title: finalTitle,
        path: sharePath,
        imageUrl: userInfo.value.avatar
      };
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:778", "[my-businessCard] 最终分享内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    common_vendor.onShareTimeline(() => {
      hideTimelineGuide();
      if (!userInfo.value)
        return {
          title: "一张很棒的电子名片"
        };
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const cardOwnerId = userInfo.value.id;
      const inviteCode = userInfo.value.shardCode;
      let queryString = `id=${cardOwnerId}&fromShare=1`;
      if (loggedInUserId) {
        queryString += `&sharerId=${loggedInUserId}`;
      }
      if (inviteCode) {
        queryString += `&inviteCode=${inviteCode}`;
      }
      const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      const shareContent = {
        title: finalTitle,
        query: queryString,
        imageUrl: userInfo.value.avatar
      };
      common_vendor.index.__f__("log", "at packages/my-businessCard/my-businessCard.vue:854", "[my-businessCard] 生成时间轴共享内容:", JSON.stringify(shareContent));
      return shareContent;
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
                url: "/pages/recharge/recharge?type=membership"
              });
            }
          }
        });
        return;
      }
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
      deductShareQuota();
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
        i: common_vendor.o(handleGoToOpportunities),
        j: common_vendor.p({
          avatar: userInfo.value.avatar,
          name: userInfo.value.realName || userInfo.value.nickname,
          ["remark-name"]: userInfo.value.remarkName,
          ["is-viewing-own-card"]: isViewingOwnCard.value,
          ["pinyin-name"]: userInfo.value.pinyinName,
          title: userInfo.value.titleName,
          era: userInfo.value.era,
          ["company-name"]: userInfo.value.companyName,
          ["position-title"]: userInfo.value.positionTitle,
          industry: userInfo.value.industry,
          ["professional-title"]: userInfo.value.professionalTitle,
          ["have-resources"]: userInfo.value.haveResources,
          ["need-resources"]: userInfo.value.needResources,
          signature: userInfo.value.signature,
          ["personal-bio"]: userInfo.value.personalBio,
          ["contact-info"]: formattedContactInfo.value,
          ["show-user-qr-code"]: !!userInfo.value.wechatQrCodeUrl,
          ["user-we-chat-qr-code-url"]: userInfo.value.wechatQrCodeUrl,
          ["shard-code"]: userInfo.value.shardCode,
          ["dynamic-qr-code-url"]: promotionQrCodeBase64.value,
          ["platform-qr-code-url"]: "https://img.gofor.club/mmexport1759211962539.jpg"
        })
      } : {}, {
        c: errorMsg.value,
        f: userInfo.value,
        k: userInfo.value
      }, userInfo.value ? common_vendor.e({
        l: userStatus.value === "GUEST"
      }, userStatus.value === "GUEST" ? {
        m: common_vendor.o(goToLogin),
        n: common_vendor.o(goToHome)
      } : userStatus.value === "STRANGER" ? {
        p: common_vendor.p({
          type: "paperplane",
          size: "18",
          color: "#fff"
        }),
        q: common_vendor.o(openShareTypePopup),
        r: common_vendor.p({
          type: "plusempty",
          size: "18",
          color: "#fff"
        }),
        s: common_vendor.o(handleAddCircle)
      } : userStatus.value === "FRIEND" ? {
        v: common_vendor.p({
          type: "paperplane",
          size: "18",
          color: "#fff"
        }),
        w: common_vendor.o(openShareTypePopup),
        x: common_vendor.p({
          type: "star-filled",
          size: "18",
          color: "#fff"
        })
      } : userStatus.value === "SELF" ? {
        z: common_vendor.o(openSharePopup),
        A: common_vendor.o(goToEdit)
      } : {}, {
        o: userStatus.value === "STRANGER",
        t: userStatus.value === "FRIEND",
        y: userStatus.value === "SELF",
        B: isAnyPopupOpen.value ? 1 : ""
      }) : {}, {
        C: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        D: common_assets._imports_0$2,
        E: common_vendor.o(hideTimelineGuide)
      } : {}, {
        F: customShareTitle.value,
        G: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        H: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        I: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        J: common_vendor.o(guideShareTimeline),
        K: common_vendor.o(closeSharePopup),
        L: common_vendor.sr(sharePopup, "34d71473-7", {
          "k": "sharePopup"
        }),
        M: common_vendor.o(onPopupChange),
        N: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        O: common_vendor.sr(addCirclePopup, "34d71473-10", {
          "k": "addCirclePopup"
        }),
        P: common_vendor.sr(shareTypePopupRef, "34d71473-11", {
          "k": "shareTypePopupRef"
        }),
        Q: common_vendor.o(handleShareTypeSelect),
        R: common_vendor.o(onShareTypePopupChange)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-34d71473"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-businessCard/my-businessCard.js.map
