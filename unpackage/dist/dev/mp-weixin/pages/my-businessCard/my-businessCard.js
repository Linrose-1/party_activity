"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more + MyCard + _easycom_uni_popup)();
}
const MyCard = () => "../../components/MyCard.js";
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
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      let finalOptions = options || {};
      if (options && options.scene) {
        const sceneStr = decodeURIComponent(options.scene);
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:113", `✅ [名片页] 在 onLoad 中检测到 scene: ${sceneStr}`);
        const sceneParams = {};
        sceneStr.split("&").forEach((item) => {
          const parts = item.split("=");
          if (parts[0] && parts[1]) {
            sceneParams[parts[0]] = parts[1];
          }
        });
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:121", "✅ [名片页] scene 解析结果:", sceneParams);
        finalOptions = {
          ...finalOptions,
          ...sceneParams
        };
      }
      const inviteCode = finalOptions.c || finalOptions.inviteCode;
      if (inviteCode) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:132", `✅ [名片页] 在 onLoad 中捕获到邀请码: ${inviteCode}`);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:136", "[my-businessCard] onLoad 触发。已收到的选项:", JSON.stringify(options));
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      if (finalOptions.fromShare && finalOptions.fromShare === "1") {
        fromShare.value = true;
      }
      const targetId = finalOptions.i || finalOptions.id;
      if (targetId && targetId != loggedInUserId) {
        isViewingOwnCard.value = false;
        targetUserId.value = targetId;
      } else {
        isViewingOwnCard.value = true;
      }
      initializePage();
      handleShareReward(finalOptions);
    });
    const initializePage = async () => {
      isLoading.value = true;
      errorMsg.value = "";
      userInfo.value = null;
      try {
        const rawData = isViewingOwnCard.value ? await fetchOwnUserInfo() : await fetchTargetUserInfo(targetUserId.value);
        if (!rawData)
          throw new Error("未能获取到名片信息");
        userInfo.value = adaptUserInfo(rawData);
        if (isViewingOwnCard.value) {
          generateSceneString();
        }
      } catch (err) {
        errorMsg.value = err.message || "加载失败，请稍后重试";
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:182", "页面初始化失败:", err);
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
        common_vendor.index.__f__("warn", "at pages/my-businessCard/my-businessCard.vue:229", `生成的 scene 字符串长度为 ${scene.length}，超过了32个字符的限制！Scene: ${scene}`);
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:238", scene);
      return scene;
    };
    const fetchTargetUserInfo = async (userId) => {
      const requestData = {
        readUserId: userId
      };
      if (fromShare.value) {
        requestData.notPay = 1;
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:258", "[my-businessCard] 准备使用参数调用 /read-card:", JSON.stringify(requestData));
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: requestData
      });
      if (error) {
        if (!isViewingOwnCard.value) {
          common_vendor.index.redirectTo({
            url: `/pages/business-card-apply/business-card-apply?id=${userId}&name=${encodeURIComponent("目标用户")}&fromShare=${fromShare.value ? "1" : "0"}`
            // 注意：这里可能没有用户信息，所以name只能用一个占位符，或者尝试从缓存获取。
            // 更优化的方案是在跳转前先请求一个简单的用户信息接口。
            // 但根据现有代码，我们直接跳转。
          });
          throw new Error("Redirecting to apply page");
        } else {
          throw new Error(error);
        }
      }
      return data;
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
    const handleShareReward = (options) => {
      const sharerId = options.s || options.sharerId;
      if (!options || !sharerId)
        return;
      const bizId = options.i || options.id;
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      if (sharerId == loggedInUserId) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:365", "用户点击了自己的分享链接，不计分。");
        return;
      }
      if (loggedInUserId) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:371", "其他已登录用户点击，准备为分享者加分。");
        triggerShareHitApi(sharerId, bizId);
      } else {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:376", "未登录用户点击，暂存分享信息。");
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
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:401", "调用分享名片加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:403", `成功为分享者(ID: ${sharerId})触发贡分增加`);
      }
    };
    common_vendor.onShareAppMessage(() => {
      closeSharePopup();
      if (!userInfo.value)
        return {
          title: "一张很棒的电子名片"
        };
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const cardOwnerId = userInfo.value.id;
      const inviteCode = userInfo.value.shardCode;
      let sharePath = `/pages/my-businessCard/my-businessCard?id=${cardOwnerId}&fromShare=1`;
      if (loggedInUserId) {
        sharePath += `&sharerId=${loggedInUserId}`;
      }
      if (inviteCode) {
        sharePath += `&inviteCode=${inviteCode}`;
      }
      const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      const shareContent = {
        title: finalTitle,
        path: sharePath,
        imageUrl: userInfo.value.avatar
      };
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:439", "[my-businessCard] 分享好友内容:", JSON.stringify(shareContent));
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
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:477", "[my-businessCard] 生成时间轴共享内容:", JSON.stringify(shareContent));
      return shareContent;
    });
    const goToEdit = () => common_vendor.index.navigateTo({
      url: "/packages/my-edit/my-edit"
    });
    const openSharePopup = () => {
      customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      sharePopup.value.open();
    };
    const closeSharePopup = () => sharePopup.value.close();
    const guideShareTimeline = () => {
      closeSharePopup();
      showTimelineGuide.value = true;
    };
    const hideTimelineGuide = () => showTimelineGuide.value = false;
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? {
        b: common_vendor.p({
          type: "undo-filled",
          size: "24",
          color: "#fff"
        }),
        c: common_vendor.o(openSharePopup)
      } : {}, {
        d: isLoading.value
      }, isLoading.value ? {
        e: common_vendor.p({
          status: "loading",
          contentText: "正在加载名片..."
        })
      } : errorMsg.value ? {
        g: common_vendor.p({
          type: "closeempty",
          size: "50",
          color: "#999"
        }),
        h: common_vendor.t(errorMsg.value)
      } : userInfo.value ? common_vendor.e({
        j: common_vendor.t(isViewingOwnCard.value ? "我的个人名片" : "Ta 的个人名片"),
        k: common_vendor.p({
          avatar: userInfo.value.avatar,
          name: userInfo.value.realName || userInfo.value.nickname,
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
          ["platform-qr-code-url"]: "https://img.gofor.club/mmexport1759211962539.jpg"
        }),
        l: isViewingOwnCard.value
      }, isViewingOwnCard.value ? {
        m: common_vendor.o(goToEdit)
      } : {}) : {}, {
        f: errorMsg.value,
        i: userInfo.value,
        n: customShareTitle.value,
        o: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        p: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        q: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        r: common_vendor.o(guideShareTimeline),
        s: common_vendor.o(closeSharePopup),
        t: common_vendor.sr(sharePopup, "30894501-4", {
          "k": "sharePopup"
        }),
        v: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        w: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        x: common_assets._imports_0,
        y: common_vendor.o(hideTimelineGuide)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30894501"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-businessCard/my-businessCard.js.map
