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
    const promotionQrCodeBase64 = common_vendor.ref("");
    const sharePopup = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    common_vendor.onLoad(async (options) => {
      const token = common_vendor.index.getStorageSync("token");
      let finalOptions = options || {};
      if (finalOptions.scene) {
        const sceneStr = decodeURIComponent(finalOptions.scene);
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:123", `✅ [名片页] 在 onLoad 中检测到 scene: ${sceneStr}`);
        const sceneParams = {};
        sceneStr.split("&").forEach((item) => {
          const parts = item.split("=");
          if (parts[0] && parts[1]) {
            sceneParams[parts[0]] = parts[1];
          }
        });
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:131", "✅ [名片页] scene 解析结果:", sceneParams);
        finalOptions = {
          ...finalOptions,
          ...sceneParams
        };
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:139", "[my-businessCard] onLoad 触发。最终选项:", JSON.stringify(finalOptions));
      const inviteCode = finalOptions.c || finalOptions.inviteCode;
      if (inviteCode) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:144", "✅ [邀请码] 捕获邀请码，暂存本地:", inviteCode);
        common_vendor.index.setStorageSync("pendingInviteCode", inviteCode);
      }
      if (!token) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:150", "⚠️ 当前为游客模式（未登录），尝试允许查看名片数据...");
      }
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      const targetId = finalOptions.i || finalOptions.id;
      if (finalOptions.fromShare && finalOptions.fromShare === "1") {
        fromShare.value = true;
      }
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
          common_vendor.index.__f__("warn", "at pages/my-businessCard/my-businessCard.vue:180", "游客模式且无目标ID，无法展示内容，跳转登录页");
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
          return;
        }
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
        await fetchPromotionQrCode();
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:323", "页面初始化失败:", err.message);
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
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:362", "游客模式，跳过生成推广小程序码");
        return;
      }
      if (!userInfo.value) {
        common_vendor.index.__f__("warn", "at pages/my-businessCard/my-businessCard.vue:368", "无法生成小程序码，因为用户信息尚未加载。");
        return;
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:372", "🚀 [二维码生成] 开始生成小程序码...");
      const scene = generateSceneString();
      if (!scene) {
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:377", "❌ [二维码生成] 生成 scene 失败，无法继续。");
        return;
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:380", `✅ [二维码生成] 使用的 scene: ${scene}`);
      const payload = {
        scene,
        path: "pages/my-businessCard/my-businessCard",
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
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:404", "❌ [二维码生成] 调用接口失败:", error);
        return;
      }
      const finalBase64 = base64Image.startsWith("data:image") ? base64Image : `data:image/png;base64,${base64Image}`;
      promotionQrCodeBase64.value = finalBase64;
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:418", "✅ [二维码生成] 成功获取并存储了小程序码 Base64 数据");
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
        common_vendor.index.__f__("warn", "at pages/my-businessCard/my-businessCard.vue:447", `生成的 scene 字符串长度为 ${scene.length}，超过了32个字符的限制！Scene: ${scene}`);
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:456", "scene", scene);
      return scene;
    };
    const fetchTargetUserInfo = async (userId) => {
      const requestData = {
        readUserId: userId
      };
      if (fromShare.value) {
        requestData.notPay = 1;
      }
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:473", "[名片页] 游客/用户请求名片数据:", JSON.stringify(requestData));
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: requestData
      });
      if (!error) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:485", "✅ 获取名片成功");
        return data;
      }
      common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:490", "获取名片失败:", error);
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
    const handleShareReward = (options) => {
      const sharerId = options.s || options.sharerId;
      if (!options || !sharerId)
        return;
      const bizId = options.i || options.id;
      const loggedInUserId = common_vendor.index.getStorageSync("userId");
      if (sharerId == loggedInUserId) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:648", "用户点击了自己的分享链接，不计分。");
        return;
      }
      if (loggedInUserId) {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:654", "其他已登录用户点击，准备为分享者加分。");
        triggerShareHitApi(sharerId, bizId);
      } else {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:659", "未登录用户点击，暂存分享信息。");
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
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:684", "调用分享名片加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:686", `成功为分享者(ID: ${sharerId})触发贡分增加`);
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
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:726", "[my-businessCard] 分享好友内容:", JSON.stringify(shareContent));
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
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:764", "[my-businessCard] 生成时间轴共享内容:", JSON.stringify(shareContent));
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
    const openSharePopup = () => {
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
      customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      sharePopup.value.open();
    };
    const closeSharePopup = () => sharePopup.value.close();
    const guideShareTimeline = () => {
      closeSharePopup();
      showTimelineGuide.value = true;
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
        j: common_vendor.t(isViewingOwnCard.value ? "我的数字名片" : "TA的数字名片"),
        k: common_vendor.o(handleEditRemark),
        l: common_vendor.o(handleGoToOpportunities),
        m: common_vendor.p({
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
        }),
        n: isViewingOwnCard.value
      }, isViewingOwnCard.value ? {
        o: common_vendor.o(goToEdit)
      } : {}) : {}, {
        f: errorMsg.value,
        i: userInfo.value,
        p: customShareTitle.value,
        q: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        r: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        s: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        t: common_vendor.o(guideShareTimeline),
        v: common_vendor.o(closeSharePopup),
        w: common_vendor.sr(sharePopup, "30894501-4", {
          "k": "sharePopup"
        }),
        x: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        y: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        z: common_assets._imports_0$1,
        A: common_vendor.o(hideTimelineGuide)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30894501"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-businessCard/my-businessCard.js.map
