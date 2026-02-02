"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "AddCircleConfirmPopup",
  emits: ["success"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const popup = common_vendor.ref(null);
    const targetUser = common_vendor.ref({});
    const loading = common_vendor.ref(false);
    const emit = __emit;
    const open = (user) => {
      targetUser.value = user || {
        name: "商友"
      };
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    const confirm = async () => {
      if (!targetUser.value.id) {
        common_vendor.index.showToast({
          title: "用户ID缺失",
          icon: "none"
        });
        return;
      }
      loading.value = true;
      try {
        const url = `/app-api/member/user/friend/apply/${targetUser.value.id}`;
        const {
          error
        } = await utils_request.request(url, {
          method: "POST"
        });
        if (!error) {
          common_vendor.index.showToast({
            title: "申请已发送",
            icon: "success"
          });
          emit("success", targetUser.value.id);
          close();
        } else {
          common_vendor.index.showToast({
            title: error || "申请失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(targetUser.value.name),
        b: common_vendor.p({
          type: "info-filled",
          size: "14",
          color: "#FF7009"
        }),
        c: common_vendor.o(close),
        d: common_vendor.o(confirm),
        e: loading.value,
        f: common_vendor.sr(popup, "632577f1-0", {
          "k": "popup"
        }),
        g: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-632577f1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AddCircleConfirmPopup.js.map
