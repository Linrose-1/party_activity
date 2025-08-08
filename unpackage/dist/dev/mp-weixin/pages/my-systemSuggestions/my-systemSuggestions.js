"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const themeColor = "#FE6A00";
const _sfc_main = {
  __name: "my-systemSuggestions",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "4caf15f4": themeColor
    }));
    const suggestion = common_vendor.reactive({
      title: "",
      content: ""
    });
    const isLoading = common_vendor.ref(false);
    const isButtonDisabled = common_vendor.computed(() => {
      return !suggestion.title || !suggestion.content || isLoading.value;
    });
    const handleSubmit = async () => {
      if (!suggestion.title) {
        common_vendor.index.showToast({ title: "请输入建议标题", icon: "none" });
        return;
      }
      if (!suggestion.content) {
        common_vendor.index.showToast({ title: "请输入建议内容", icon: "none" });
        return;
      }
      isLoading.value = true;
      try {
        const { data, error } = await utils_request.request("/app-api/member/suggestion/create", {
          method: "POST",
          data: {
            title: suggestion.title,
            content: suggestion.content
          }
        });
        if (error) {
          common_vendor.index.showToast({ title: error, icon: "none" });
        } else {
          common_vendor.index.showToast({
            title: "感谢您的建议！",
            icon: "success"
          });
          suggestion.title = "";
          suggestion.content = "";
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "提交失败，请稍后再试", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "paperplane-filled",
          size: "24",
          color: themeColor
        }),
        b: suggestion.title,
        c: common_vendor.o(common_vendor.m(($event) => suggestion.title = $event.detail.value, {
          trim: true
        })),
        d: suggestion.content,
        e: common_vendor.o(common_vendor.m(($event) => suggestion.content = $event.detail.value, {
          trim: true
        })),
        f: common_vendor.t(suggestion.content.length),
        g: common_vendor.p({
          type: "notification-filled",
          size: "18",
          color: themeColor
        }),
        h: common_vendor.t(isLoading.value ? "正在提交..." : "立即提交"),
        i: common_vendor.o(handleSubmit),
        j: isLoading.value,
        k: isButtonDisabled.value,
        l: common_vendor.s(_ctx.__cssVars())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b548d100"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-systemSuggestions/my-systemSuggestions.js.map
