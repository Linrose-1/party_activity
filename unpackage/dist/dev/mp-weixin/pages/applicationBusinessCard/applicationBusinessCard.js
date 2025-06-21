"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "applicationBusinessCard",
  setup(__props) {
    const myName = common_vendor.ref("张明");
    const myCompany = common_vendor.ref("未来科技");
    const myWork = common_vendor.ref("人工智能项目管理");
    const userPoints = common_vendor.reactive({
      // contribution: 11,  // 贡分已移除
      wisdom: 0
      // 智米
    });
    const contactName = common_vendor.ref("陈总");
    const contactCompany = common_vendor.ref("创新科技有限公司");
    const selectedOption = common_vendor.ref("wisdom");
    const showInsufficient = common_vendor.ref(false);
    const showSuccess = common_vendor.ref(false);
    const selectOption = (option) => {
      selectedOption.value = option;
      showInsufficient.value = false;
    };
    const exchangePoints = () => {
      let sufficient = false;
      if (selectedOption.value === "wisdom") {
        if (userPoints.wisdom >= 1) {
          userPoints.wisdom -= 1;
          sufficient = true;
        }
      }
      if (sufficient) {
        showSuccess.value = true;
        showInsufficient.value = false;
        common_vendor.index.showToast({
          title: "兑换成功！",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          showSuccess.value = false;
          common_vendor.index.navigateTo({
            url: "/pages/my-businessCard/my-businessCard"
            // 兑换成功后跳转到的页面
          });
        }, 2e3);
      } else {
        showInsufficient.value = true;
        common_vendor.index.showToast({
          title: "智米不足，请先获取更多积分",
          icon: "error",
          // 可以在uni-app中使用'none'并自定义图标
          duration: 2e3
        });
      }
    };
    const goToEarnPoints = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-account/my-account"
        // 假设赚取积分页面路径为 /pages/my-account/my-account
      });
    };
    const formattedFriendRequestMessage = common_vendor.computed(() => {
      return `您好！我是${myCompany.value}${myName.value}，目前在从事与您项目关联的${myWork.value}工作。我从聚一聚获得您的微信。请通过。`;
    });
    const copyFriendRequestMessage = () => {
      common_vendor.index.setClipboardData({
        data: formattedFriendRequestMessage.value,
        success: () => {
          common_vendor.index.showToast({
            title: "复制成功！",
            icon: "success",
            duration: 1500
          });
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "复制失败，请重试",
            icon: "none",
            duration: 1500
          });
          common_vendor.index.__f__("error", "at pages/applicationBusinessCard/applicationBusinessCard.vue:197", "复制到剪贴板失败", err);
        }
      });
    };
    common_vendor.onLoad(() => {
      userPoints.wisdom = 5;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(contactName.value.charAt(0)),
        b: common_vendor.t(contactName.value),
        c: common_vendor.t(contactCompany.value),
        d: common_vendor.t(contactName.value),
        e: selectedOption.value === "wisdom" ? 1 : "",
        f: common_vendor.o(($event) => selectOption("wisdom")),
        g: common_vendor.t(userPoints.wisdom),
        h: userPoints.wisdom < 1 ? 1 : "",
        i: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        j: common_vendor.o(exchangePoints),
        k: common_vendor.o(goToEarnPoints),
        l: showSuccess.value
      }, showSuccess.value ? {} : {}, {
        m: common_vendor.t(formattedFriendRequestMessage.value),
        n: common_vendor.o(copyFriendRequestMessage)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0843d79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/applicationBusinessCard/applicationBusinessCard.js.map
