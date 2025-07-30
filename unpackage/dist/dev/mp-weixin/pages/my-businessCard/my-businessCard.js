"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + MyCard + _easycom_uni_popup)();
}
const MyCard = () => "../../components/MyCard.js";
const _sfc_main = {
  __name: "my-businessCard",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const sharePopup = common_vendor.ref(null);
    const targetUserId = common_vendor.ref(null);
    const loggedInUserId = common_vendor.ref(null);
    const customShareTitle = common_vendor.ref("");
    const showTimelineGuide = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options && options.id) {
        targetUserId.value = options.id;
        fetchTargetUserInfo(options.id);
      } else {
        fetchOwnUserInfo();
      }
      if (options && options.sharerId) {
        const sharerId = options.sharerId;
        const bizId = options.id;
        if (sharerId && loggedInUserId.value && sharerId === loggedInUserId.value) {
          common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:105", "用户点击了自己的名片分享链接，不计分。");
        } else if (sharerId && loggedInUserId.value && bizId) {
          common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:109", "其他用户点击了名片分享链接，且已登录，准备为分享者加分。");
          triggerShareHitApi(sharerId, bizId);
        } else if (sharerId && bizId) {
          common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:114", "用户点击了名片分享链接，但尚未登录。暂存分享信息。");
          common_vendor.index.setStorageSync("pendingShareReward", {
            sharerId,
            bizId,
            type: 30
            // 30 代表 "分享名片奖励"
          });
        }
      }
    });
    const adaptUserInfo = (rawUserData) => {
      var _a, _b;
      if (!rawUserData)
        return null;
      return {
        // --- 通用字段直接映射 ---
        id: rawUserData.id,
        mobile: rawUserData.mobile,
        nickname: rawUserData.nickname,
        avatar: rawUserData.avatar,
        realName: rawUserData.realName,
        locationAddress: rawUserData.locationAddress,
        professionalTitle: rawUserData.professionalTitle,
        companyName: rawUserData.companyName,
        contactEmail: rawUserData.contactEmail,
        wechatQrCodeUrl: rawUserData.wechatQrCodeUrl,
        // ... 其他你需要的通用字段
        // --- 差异字段适配 ---
        // 目标：统一为 pinyinName 和 titleName
        // 会员等级 (目标字段：pinyinName)
        // 检查 /get 接口的嵌套结构，如果不存在，则使用 /read-card 接口的平铺结构
        pinyinName: ((_a = rawUserData.topUpLevel) == null ? void 0 : _a.name) || rawUserData.topUpLevelName || "",
        // 用户头衔/等级 (目标字段：titleName)
        // 检查 /get 接口的嵌套结构，如果不存在，则使用 /read-card 接口的平铺结构
        titleName: ((_b = rawUserData.level) == null ? void 0 : _b.name) || rawUserData.levelName || ""
      };
    };
    const fetchOwnUserInfo = async () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      const { data, error } = await utils_request.request("/app-api/member/user/get", { method: "GET" });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({ title: `加载失败: ${error}`, icon: "none" });
        return;
      }
      userInfo.value = adaptUserInfo(data);
    };
    const fetchTargetUserInfo = async (userId) => {
      common_vendor.index.showLoading({ title: "加载中..." });
      const { data, error } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: {
          readUserId: userId
        }
      });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({ title: `获取名片失败: ${error}`, icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 2e3);
        return;
      }
      userInfo.value = adaptUserInfo(data);
    };
    const formattedContactInfo = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      return [
        { icon: "phone-filled", value: userInfo.value.mobile || "未设置手机" },
        { icon: "email-filled", value: userInfo.value.contactEmail || "未设置邮箱" },
        { icon: "location-filled", value: userInfo.value.locationAddress || "未设置地址" }
      ];
    });
    const goToEdit = () => {
      common_vendor.index.navigateTo({ url: "/pages/my-edit/my-edit" });
    };
    const triggerShareHitApi = async (sharerId, bizId) => {
      if (!sharerId || !bizId)
        return;
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:207", `准备为分享者 (ID: ${sharerId}) 增加贡分, 关联名片ID (bizId): ${bizId}`);
      const { error } = await utils_request.request("/app-api/member/experience-record/share-experience-hit", {
        method: "POST",
        data: {
          type: 30,
          // 30 代表 "分享名片奖励"
          shareUserId: sharerId,
          bizId
        }
      });
      if (error) {
        common_vendor.index.__f__("error", "at pages/my-businessCard/my-businessCard.vue:219", "调用分享名片加分接口失败:", error);
      } else {
        common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:221", `成功为分享者 (ID: ${sharerId}) 触发贡分增加`);
      }
    };
    const openSharePopup = () => {
      if (!userInfo.value) {
        common_vendor.index.showToast({ title: "信息加载中，请稍候", icon: "none" });
        return;
      }
      customShareTitle.value = `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      sharePopup.value.open();
    };
    const closeSharePopup = () => {
      sharePopup.value.close();
    };
    common_vendor.onShareAppMessage((res) => {
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:244", "触发了分享给好友", res);
      closeSharePopup();
      if (!userInfo.value) {
        return { title: "快来看看我的专业电子名片！" };
      }
      const sharerId = common_vendor.index.getStorageSync("userId");
      let sharePath = `/pages/my-businessCard/my-businessCard?id=${userInfo.value.id}`;
      if (sharerId) {
        sharePath += `&sharerId=${sharerId}`;
      }
      const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      return {
        title: finalTitle,
        path: sharePath,
        imageUrl: userInfo.value.avatar
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/my-businessCard/my-businessCard.vue:270", "触发了分享到朋友圈");
      hideTimelineGuide();
      if (!userInfo.value) {
        return { title: "快来看看我的专业电子名片！" };
      }
      const sharerId = common_vendor.index.getStorageSync("userId");
      let queryString = `id=${userInfo.value.id}`;
      if (sharerId) {
        queryString += `&sharerId=${sharerId}`;
      }
      const finalTitle = customShareTitle.value || `这是 ${userInfo.value.realName || userInfo.value.nickname} 的名片`;
      return {
        title: finalTitle,
        query: queryString,
        imageUrl: userInfo.value.avatar
      };
    });
    const guideShareTimeline = () => {
      closeSharePopup();
      showTimelineGuide.value = true;
    };
    const hideTimelineGuide = () => {
      showTimelineGuide.value = false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "undo-filled",
          size: "24",
          color: "#fff"
        }),
        b: common_vendor.o(openSharePopup),
        c: userInfo.value
      }, userInfo.value ? {
        d: common_vendor.p({
          avatar: userInfo.value.avatar,
          name: userInfo.value.realName || userInfo.value.nickname,
          ["pinyin-name"]: userInfo.value.pinyinName,
          title: userInfo.value.titleName,
          ["company-name"]: userInfo.value.companyName,
          department: "",
          ["full-company-name"]: userInfo.value.professionalTitle,
          ["contact-info"]: formattedContactInfo.value,
          ["show-user-qr-code"]: !!userInfo.value.wechatQrCodeUrl,
          ["user-we-chat-qr-code-url"]: userInfo.value.wechatQrCodeUrl,
          ["platform-qr-code-url"]: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=platform-info",
          ["logo-url"]: "https://gitee.com/image_store/repo_1/raw/master/go-for-planet-logo.png"
        })
      } : {}, {
        e: userInfo.value
      }, userInfo.value ? {
        f: common_vendor.o(goToEdit)
      } : {}, {
        g: customShareTitle.value,
        h: common_vendor.o(($event) => customShareTitle.value = $event.detail.value),
        i: common_vendor.p({
          type: "weixin",
          size: "30",
          color: "#07c160"
        }),
        j: common_vendor.p({
          type: "pyq",
          size: "30",
          color: "#53a046"
        }),
        k: common_vendor.o(guideShareTimeline),
        l: common_vendor.o(closeSharePopup),
        m: common_vendor.sr(sharePopup, "30894501-2", {
          "k": "sharePopup"
        }),
        n: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        o: showTimelineGuide.value
      }, showTimelineGuide.value ? {
        p: common_assets._imports_0,
        q: common_vendor.o(hideTimelineGuide)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30894501"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-businessCard/my-businessCard.js.map
