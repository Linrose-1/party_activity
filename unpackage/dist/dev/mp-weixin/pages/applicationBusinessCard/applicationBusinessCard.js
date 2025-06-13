"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "applicationBusinessCard",
  setup(__props) {
    const userPoints = common_vendor.reactive({
      contribution: 11,
      // 贡分
      wisdom: 0
      // 智米
    });
    const contactName = common_vendor.ref("陈总");
    const contactCompany = common_vendor.ref("创新科技有限公司");
    const selectedOption = common_vendor.ref("contribution");
    const showInsufficient = common_vendor.ref(false);
    const showSuccess = common_vendor.ref(false);
    const selectOption = (option) => {
      selectedOption.value = option;
      showInsufficient.value = false;
    };
    const exchangePoints = () => {
      let sufficient = false;
      if (selectedOption.value === "contribution") {
        if (userPoints.contribution >= 10) {
          userPoints.contribution -= 10;
          sufficient = true;
        }
      } else if (selectedOption.value === "wisdom") {
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
          title: "积分不足，请先获取更多积分",
          icon: "error",
          // 可以在uni-app中使用'none'并自定义图标
          duration: 2e3
        });
      }
    };
    const goToEarnPoints = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-account/my-account"
        // 假设赚取积分页面路径为 /pages/earn-points/earn-points
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(contactName.value.charAt(0)),
        b: common_vendor.t(contactName.value),
        c: common_vendor.t(contactCompany.value),
        d: common_vendor.t(contactName.value),
        e: selectedOption.value === "contribution" ? 1 : "",
        f: common_vendor.o(($event) => selectOption("contribution")),
        g: selectedOption.value === "wisdom" ? 1 : "",
        h: common_vendor.o(($event) => selectOption("wisdom")),
        i: common_vendor.t(userPoints.contribution),
        j: userPoints.contribution < 10 && selectedOption.value === "contribution" ? 1 : "",
        k: common_vendor.t(userPoints.wisdom),
        l: userPoints.wisdom < 1 && selectedOption.value === "wisdom" ? 1 : "",
        m: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        n: common_vendor.o(exchangePoints),
        o: common_vendor.o(goToEarnPoints),
        p: showSuccess.value
      }, showSuccess.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0843d79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/applicationBusinessCard/applicationBusinessCard.js.map
