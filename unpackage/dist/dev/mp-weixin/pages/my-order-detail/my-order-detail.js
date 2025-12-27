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
  __name: "my-order-detail",
  setup(__props) {
    const detail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const loadError = common_vendor.ref(false);
    const isPaying = common_vendor.ref(false);
    const orderId = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.id) {
        orderId.value = options.id;
        fetchDetail();
      } else {
        loadError.value = true;
        isLoading.value = false;
      }
    });
    const isPaid = common_vendor.computed(() => {
      return detail.value && detail.value.payStatus === 1;
    });
    const statusText = common_vendor.computed(() => {
      if (!detail.value)
        return "";
      if (detail.value.status === 4)
        return "已驳回";
      if (detail.value.payStatus === 1)
        return "支付成功";
      return "待支付";
    });
    const productName = common_vendor.computed(() => {
      if (!detail.value)
        return "";
      return detail.value.payType === 2 ? "会员开通" : "智米充值";
    });
    const fetchDetail = async () => {
      isLoading.value = true;
      loadError.value = false;
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user-post-pay-record/get", {
          method: "GET",
          data: {
            id: orderId.value
          }
        });
        if (error)
          throw new Error(error);
        detail.value = data;
        common_vendor.index.__f__("log", "at pages/my-order-detail/my-order-detail.vue:169", "订单详情数据:", data);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my-order-detail/my-order-detail.vue:171", "获取详情失败", e);
        loadError.value = true;
      } finally {
        isLoading.value = false;
      }
    };
    const formatTime = (ts) => {
      if (!ts)
        return "-";
      const date = new Date(ts);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      const s = date.getSeconds().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const copyText = (text) => {
      if (!text)
        return;
      common_vendor.index.setClipboardData({
        data: text,
        success: () => common_vendor.index.showToast({
          title: "已复制",
          icon: "none"
        })
      });
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        urls: [url]
      });
    };
    const handleContact = () => {
      common_vendor.index.showModal({
        title: "联系客服",
        content: "请拨打客服热线：400-XXX-XXXX",
        confirmText: "呼叫",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.makePhoneCall({
              phoneNumber: "4001234567"
            });
          }
        }
      });
    };
    const handleRepay = async () => {
      if (!detail.value.orderNo)
        return;
      isPaying.value = true;
      try {
        const {
          data: payParams,
          error
        } = await utils_request.request("/app-api/member/user-post-pay-record/pay", {
          method: "POST",
          data: {
            orderNo: detail.value.orderNo
          }
        });
        if (error)
          throw new Error(error);
        await new Promise((resolve, reject) => {
          common_vendor.index.requestPayment({
            provider: "weixin",
            ...payParams,
            success: resolve,
            fail: (err) => {
              if (err.errMsg.includes("cancel"))
                reject(new Error("取消支付"));
              else
                reject(new Error("支付失败"));
            }
          });
        });
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success"
        });
        fetchDetail();
      } catch (e) {
        if (e.message !== "取消支付") {
          common_vendor.index.showToast({
            title: e.message || "支付异常",
            icon: "none"
          });
        }
      } finally {
        isPaying.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: detail.value
      }, detail.value ? common_vendor.e({
        b: common_vendor.p({
          type: isPaid.value ? "checkbox-filled" : "info-filled",
          size: "50",
          color: isPaid.value ? "#4cd964" : "#ff9800"
        }),
        c: common_vendor.t(statusText.value),
        d: !isPaid.value
      }, !isPaid.value ? {} : {}, {
        e: detail.value.status === 4 && detail.value.errMsg
      }, detail.value.status === 4 && detail.value.errMsg ? {
        f: common_vendor.p({
          type: "info-filled",
          color: "#ff4d4f",
          size: "18"
        }),
        g: common_vendor.t(detail.value.errMsg)
      } : {}, {
        h: common_vendor.t(detail.value.orderNo || "生成中..."),
        i: common_vendor.p({
          type: "paperclip",
          size: "14",
          color: "#999"
        }),
        j: common_vendor.o(($event) => copyText(detail.value.orderNo)),
        k: common_vendor.t(formatTime(detail.value.createTime)),
        l: detail.value.payTime
      }, detail.value.payTime ? {
        m: common_vendor.t(formatTime(detail.value.payTime))
      } : {}, {
        n: common_vendor.t(productName.value),
        o: common_vendor.t(detail.value.remark || productName.value),
        p: detail.value.expirationTime
      }, detail.value.expirationTime ? {
        q: common_vendor.t(formatTime(detail.value.expirationTime))
      } : {}, {
        r: detail.value.imageUrls
      }, detail.value.imageUrls ? {
        s: detail.value.imageUrls,
        t: common_vendor.o(($event) => previewImage(detail.value.imageUrls))
      } : {}, {
        v: common_vendor.t(detail.value.amount),
        w: common_vendor.p({
          type: "headphones",
          size: "20",
          color: "#666"
        }),
        x: common_vendor.o(handleContact),
        y: !isPaid.value
      }, !isPaid.value ? {
        z: common_vendor.o(handleRepay),
        A: isPaying.value
      } : {}) : common_vendor.e({
        B: isLoading.value
      }, isLoading.value ? {
        C: common_vendor.p({
          status: "loading"
        })
      } : loadError.value ? {
        E: common_vendor.o(fetchDetail)
      } : {}, {
        D: loadError.value
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fc3d86e7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-order-detail/my-order-detail.js.map
