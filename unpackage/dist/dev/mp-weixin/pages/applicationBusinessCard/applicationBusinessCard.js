"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "applicationBusinessCard",
  setup(__props) {
    const userPoints = common_vendor.reactive({
      contribution: 8,
      // 贡分
      wisdom: 0
      // 智米
    });
    const contactName = common_vendor.ref("陈总");
    const contactCompany = common_vendor.ref("创新科技有限公司");
    const contactEmail = common_vendor.ref("chenzong@example.com");
    const contactAddress = common_vendor.ref("上海市浦东新区");
    const contactWebsite = common_vendor.ref("www.innotech-ai.com");
    const selectedOption = common_vendor.ref("contribution");
    const showInsufficient = common_vendor.ref(false);
    const showSuccess = common_vendor.ref(false);
    const showContactModal = common_vendor.ref(false);
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
          showContactModal.value = true;
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
    const closeContact = () => {
      showContactModal.value = false;
    };
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
        // 返回上一级页面
      });
    };
    const goToEarnPoints = () => {
      common_vendor.index.navigateTo({
        url: "/pages/earn-points/earn-points"
        // 假设赚取积分页面路径为 /pages/earn-points/earn-points
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.t(contactName.value.charAt(0)),
        c: common_vendor.t(contactName.value),
        d: common_vendor.t(contactCompany.value),
        e: common_vendor.t(contactName.value),
        f: selectedOption.value === "contribution" ? 1 : "",
        g: common_vendor.o(($event) => selectOption("contribution")),
        h: selectedOption.value === "wisdom" ? 1 : "",
        i: common_vendor.o(($event) => selectOption("wisdom")),
        j: common_vendor.t(userPoints.contribution),
        k: userPoints.contribution < 10 && selectedOption.value === "contribution" ? 1 : "",
        l: common_vendor.t(userPoints.wisdom),
        m: userPoints.wisdom < 1 && selectedOption.value === "wisdom" ? 1 : "",
        n: showInsufficient.value
      }, showInsufficient.value ? {} : {}, {
        o: common_vendor.o(exchangePoints),
        p: common_vendor.o(goToEarnPoints),
        q: showSuccess.value
      }, showSuccess.value ? {} : {}, {
        r: common_vendor.t(contactName.value.charAt(0)),
        s: common_vendor.t(contactName.value),
        t: common_vendor.t(contactEmail.value),
        v: common_vendor.t(contactCompany.value),
        w: common_vendor.t(contactAddress.value),
        x: common_vendor.t(contactWebsite.value),
        y: common_vendor.o(closeContact),
        z: showContactModal.value ? 1 : "",
        A: common_vendor.o(closeContact)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0843d79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/applicationBusinessCard/applicationBusinessCard.js.map
