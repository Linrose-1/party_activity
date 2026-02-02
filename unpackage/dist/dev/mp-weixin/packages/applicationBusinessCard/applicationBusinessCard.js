"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "applicationBusinessCard",
  setup(__props) {
    const currentUserInfo = common_vendor.ref(null);
    const targetUserInfo = common_vendor.ref(null);
    const targetUserId = common_vendor.ref(null);
    const fromShare = common_vendor.ref(false);
    const isPaying = common_vendor.ref(false);
    const showInsufficient = common_vendor.ref(false);
    common_vendor.ref(false);
    const isLoading = common_vendor.ref(true);
    const friendOwnerUserId = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at packages/applicationBusinessCard/applicationBusinessCard.vue:171", "[business-card-apply] onLoad 触发。收到的选项：", options);
      if (options.friendOwnerUserId) {
        friendOwnerUserId.value = options.friendOwnerUserId;
      }
      if (options.id && options.name) {
        targetUserId.value = parseInt(options.id, 10);
        fromShare.value = options.fromShare === "1";
        targetUserInfo.value = {
          id: targetUserId.value,
          nickname: decodeURIComponent(options.name),
          realName: decodeURIComponent(options.name),
          avatar: options.avatar ? decodeURIComponent(options.avatar) : "/static/images/default-avatar.png"
        };
        initializePage();
      } else {
        isLoading.value = false;
        common_vendor.index.showToast({
          title: "缺少必要的用户信息",
          icon: "error"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    const costAmount = common_vendor.computed(() => {
      return friendOwnerUserId.value ? 2 : 1;
    });
    const initializePage = async () => {
      try {
        const hasPermission = await checkAccessPermission();
        if (hasPermission) {
          return;
        }
        await Promise.all([
          fetchCurrentUserInfo(),
          fetchSimpleTargetUserInfo()
        ]);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/applicationBusinessCard/applicationBusinessCard.vue:235", "初始化页面时发生错误:", e);
      } finally {
        isLoading.value = false;
      }
    };
    const checkAccessPermission = async () => {
      const requestData = {
        readUserId: targetUserId.value,
        isReadByFriend: friendOwnerUserId.value ? 1 : 0,
        friendOwnerUserId: friendOwnerUserId.value || 0
      };
      if (fromShare.value) {
        requestData.notPay = 1;
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/read-card", {
        method: "POST",
        data: requestData
      });
      if (data && !error) {
        common_vendor.index.__f__("log", "at packages/applicationBusinessCard/applicationBusinessCard.vue:263", "权限检查成功，直接跳转到名片页。");
        let targetUrl = `/packages/my-businessCard/my-businessCard?id=${targetUserId.value}`;
        if (friendOwnerUserId.value) {
          targetUrl += `&friendOwnerUserId=${friendOwnerUserId.value}`;
        }
        common_vendor.index.redirectTo({
          url: targetUrl
        });
        return true;
      } else {
        common_vendor.index.__f__("log", "at packages/applicationBusinessCard/applicationBusinessCard.vue:273", "权限检查失败，显示支付页面。", error);
        return false;
      }
    };
    const fetchSimpleTargetUserInfo = async () => {
      if (!targetUserId.value) {
        common_vendor.index.__f__("warn", "at packages/applicationBusinessCard/applicationBusinessCard.vue:285", "无法获取简要信息，因为 targetUserId 不存在。");
        return;
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/getSimpleUserInfo", {
        method: "GET",
        data: {
          readUserId: targetUserId.value,
          notPay: 1
          // 固定传 1
        }
      });
      common_vendor.index.__f__("log", "at packages/applicationBusinessCard/applicationBusinessCard.vue:301", "----------- getSimpleUserInfo 接口返回数据 -----------");
      common_vendor.index.__f__("log", "at packages/applicationBusinessCard/applicationBusinessCard.vue:302", JSON.stringify(data, null, 2));
      common_vendor.index.__f__("log", "at packages/applicationBusinessCard/applicationBusinessCard.vue:303", "----------------------------------------------------");
      if (error) {
        common_vendor.index.__f__("error", "at packages/applicationBusinessCard/applicationBusinessCard.vue:307", "获取目标用户简要信息失败:", error);
        return;
      }
      if (data) {
        targetUserInfo.value = {
          ...targetUserInfo.value,
          ...data
        };
      }
    };
    const fetchCurrentUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (data) {
        currentUserInfo.value = data;
      } else {
        common_vendor.index.__f__("error", "at packages/applicationBusinessCard/applicationBusinessCard.vue:334", "获取当前用户信息失败:", error);
      }
    };
    const handlePayToReadCard = async () => {
      if (isPaying.value)
        return;
      if (!targetUserId.value) {
        common_vendor.index.showToast({
          title: "目标用户ID无效",
          icon: "none"
        });
        return;
      }
      if (currentUserInfo.value && currentUserInfo.value.point < costAmount.value) {
        showInsufficient.value = true;
        common_vendor.index.showToast({
          title: "智米不足",
          icon: "none"
        });
        return;
      }
      isPaying.value = true;
      showInsufficient.value = false;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/pay-read-card", {
        method: "POST",
        data: {
          readUserId: targetUserId.value,
          isReadByFriend: friendOwnerUserId.value ? 1 : 0,
          friendOwnerUserId: friendOwnerUserId.value || 0
        }
      });
      isPaying.value = false;
      if (error) {
        common_vendor.index.showToast({
          title: `支付失败: ${error}`,
          icon: "none",
          duration: 2e3
        });
      } else if (data === true) {
        common_vendor.index.showToast({
          title: "支付成功！",
          icon: "success",
          duration: 2e3
        });
        fetchCurrentUserInfo();
        setTimeout(() => {
          let finalUrl = `/packages/my-businessCard/my-businessCard?id=${targetUserId.value}`;
          if (friendOwnerUserId.value) {
            finalUrl += `&friendOwnerUserId=${friendOwnerUserId.value}`;
          }
          common_vendor.index.redirectTo({
            url: finalUrl
          });
        }, 2e3);
      } else {
        common_vendor.index.showToast({
          title: "支付遇到未知问题",
          icon: "none",
          duration: 2e3
        });
      }
    };
    const handleEditRemark = () => {
      common_vendor.index.showModal({
        title: "设置备注名",
        content: targetUserInfo.value.remarkName || "",
        editable: true,
        placeholderText: "请输入备注名",
        success: async (res) => {
          if (res.confirm) {
            const newRemarkName = res.content.trim();
            const success = await saveUserRemark(newRemarkName);
            if (success) {
              targetUserInfo.value = {
                ...targetUserInfo.value,
                remarkName: newRemarkName
              };
              common_vendor.index.showToast({
                title: "备注已保存",
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
    const goToEarnPoints = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-account/my-account"
      });
    };
    const formattedFriendRequestMessage = common_vendor.computed(() => {
      if (!currentUserInfo.value || !targetUserInfo.value)
        return "正在生成中...";
      const targetName = targetUserInfo.value.realName;
      const myName = currentUserInfo.value.realName || currentUserInfo.value.nickname;
      const myCompany = currentUserInfo.value.companyName || "我的公司";
      const myWork = currentUserInfo.value.professionalTitle || "我的职位";
      return `您好 ${targetName}！我是${myCompany}的${myName}，目前在从事${myWork}工作。我从猩聚社平台获得您的联系方式，希望可以认识一下。`;
    });
    const copyFriendRequestMessage = () => {
      common_vendor.index.setClipboardData({
        data: formattedFriendRequestMessage.value,
        success: () => common_vendor.index.showToast({
          title: "复制成功！",
          icon: "success"
        }),
        fail: () => common_vendor.index.showToast({
          title: "复制失败",
          icon: "none"
        })
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {} : common_vendor.e({
        b: targetUserInfo.value
      }, targetUserInfo.value ? common_vendor.e({
        c: targetUserInfo.value.avatar
      }, targetUserInfo.value.avatar ? {
        d: targetUserInfo.value.avatar
      } : {
        e: common_vendor.t((targetUserInfo.value.realName || targetUserInfo.value.nickname || "?").charAt(0))
      }, {
        f: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        g: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#888"
        }),
        h: targetUserInfo.value.remarkName
      }, targetUserInfo.value.remarkName ? {
        i: common_vendor.t(targetUserInfo.value.remarkName)
      } : {}, {
        j: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        k: common_vendor.o(handleEditRemark),
        l: targetUserInfo.value.companyName
      }, targetUserInfo.value.companyName ? {
        m: common_vendor.p({
          type: "flag",
          size: "16",
          color: "#888"
        }),
        n: common_vendor.t(targetUserInfo.value.companyName)
      } : {}, {
        o: targetUserInfo.value.positionTitle
      }, targetUserInfo.value.positionTitle ? {
        p: common_vendor.p({
          type: "staff",
          size: "16",
          color: "#888"
        }),
        q: common_vendor.t(targetUserInfo.value.positionTitle)
      } : {}, {
        r: targetUserInfo.value.professionalTitle
      }, targetUserInfo.value.professionalTitle ? {
        s: common_vendor.p({
          type: "medal",
          size: "16",
          color: "#888"
        }),
        t: common_vendor.t(targetUserInfo.value.professionalTitle)
      } : {}, {
        v: targetUserInfo.value.socialOrganization
      }, targetUserInfo.value.socialOrganization ? {
        w: common_vendor.p({
          type: "network",
          size: "16",
          color: "#888"
        }),
        x: common_vendor.t(targetUserInfo.value.socialOrganization)
      } : {}, {
        y: targetUserInfo.value.personalBio
      }, targetUserInfo.value.personalBio ? {
        z: common_vendor.p({
          type: "paperclip",
          size: "16",
          color: "#888"
        }),
        A: common_vendor.t(targetUserInfo.value.personalBio)
      } : {}, {
        B: common_vendor.t(targetUserInfo.value.realName || targetUserInfo.value.nickname),
        C: common_vendor.t(costAmount.value),
        D: currentUserInfo.value
      }, currentUserInfo.value ? {
        E: common_vendor.t(currentUserInfo.value.point),
        F: currentUserInfo.value.point < 1 ? 1 : ""
      } : {}, {
        G: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        H: common_vendor.t(isPaying.value ? "支付中..." : "确认支付"),
        I: common_vendor.o(handlePayToReadCard),
        J: isPaying.value,
        K: isPaying.value,
        L: common_vendor.o(goToEarnPoints)
      }) : {
        M: common_vendor.p({
          status: "loading",
          contentText: "正在加载用户信息..."
        })
      }, {
        N: currentUserInfo.value && targetUserInfo.value
      }, currentUserInfo.value && targetUserInfo.value ? {
        O: common_vendor.t(formattedFriendRequestMessage.value),
        P: common_vendor.o(copyFriendRequestMessage)
      } : {}));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fd2d3e1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/applicationBusinessCard/applicationBusinessCard.js.map
