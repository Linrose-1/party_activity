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
  __name: "ZhimiPayPopup",
  props: {
    title: {
      type: String,
      default: "确认支付"
    },
    content: {
      type: String,
      default: "确认使用智米开启该服务吗？"
    },
    price: {
      type: Number,
      required: true
    },
    // 可选：如果传入 apiPath，组件内部自动发起请求
    apiPath: {
      type: String,
      default: ""
    },
    apiMethod: {
      type: String,
      default: "POST"
    },
    apiData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["success", "close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const popupRef = common_vendor.ref(null);
    const userBalance = common_vendor.ref(0);
    const isPaying = common_vendor.ref(false);
    const isBalanceEnough = common_vendor.computed(() => {
      return userBalance.value >= props.price;
    });
    const open = async () => {
      popupRef.value.open();
      await fetchUserBalance();
    };
    const close = () => {
      popupRef.value.close();
      emit("close");
    };
    const onChange = (e) => {
      if (!e.show)
        emit("close");
    };
    const fetchUserBalance = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/user/get");
      if (data) {
        userBalance.value = data.point || 0;
      }
    };
    const goToRecharge = () => {
      close();
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge?type=zhimi"
        // 假设有这个参数控制跳到智米Tab
      });
    };
    const handlePay = async () => {
      if (!props.apiPath) {
        emit("success");
        close();
        return;
      }
      isPaying.value = true;
      try {
        const {
          error
        } = await utils_request.request(props.apiPath, {
          method: props.apiMethod,
          data: props.apiData
        });
        if (error) {
          const msg = typeof error === "string" ? error : error.msg || "支付失败";
          common_vendor.index.showToast({
            title: msg,
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          emit("success");
          setTimeout(() => {
            close();
          }, 1e3);
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        isPaying.value = false;
      }
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(__props.title),
        b: common_vendor.o(close),
        c: common_vendor.p({
          type: "closeempty",
          size: "20",
          color: "#999"
        }),
        d: common_vendor.t(__props.content),
        e: common_vendor.t(__props.price),
        f: common_vendor.t(userBalance.value),
        g: !isBalanceEnough.value
      }, !isBalanceEnough.value ? {} : {}, {
        h: !isBalanceEnough.value ? 1 : "",
        i: common_vendor.o(goToRecharge),
        j: isPaying.value,
        k: isPaying.value,
        l: common_vendor.o(handlePay),
        m: common_vendor.o(close),
        n: isPaying.value,
        o: common_vendor.sr(popupRef, "8e921717-0", {
          "k": "popupRef"
        }),
        p: common_vendor.o(onChange),
        q: common_vendor.p({
          type: "center",
          ["is-mask-click"]: false,
          ["background-color"]: "#fff"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8e921717"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ZhimiPayPopup.js.map
