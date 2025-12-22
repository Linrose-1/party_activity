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
const _sfc_main = {
  __name: "my-order-detail",
  setup(__props) {
    const orderInfo = common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.id) {
        fetchDetail(options.id);
      }
    });
    const fetchDetail = async (id) => {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user-post-pay-record/get", {
          method: "GET",
          data: {
            id
          }
        });
        if (error)
          throw new Error(error);
        orderInfo.value = data;
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取详情失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const formatTime = (ts) => {
      if (!ts)
        return "";
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    };
    const copyText = (text) => {
      if (!text)
        return;
      common_vendor.index.setClipboardData({
        data: text
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: orderInfo.value
      }, orderInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: orderInfo.value.payStatus === 1 ? "checkbox-filled" : "info-filled",
          size: "30",
          color: "#fff"
        }),
        c: common_vendor.t(orderInfo.value.payStatus === 1 ? "支付成功" : "待支付"),
        d: orderInfo.value.payStatus === 1
      }, orderInfo.value.payStatus === 1 ? {} : {}, {
        e: common_vendor.n(orderInfo.value.payStatus === 1 ? "bg-success" : "bg-pending"),
        f: common_vendor.t(orderInfo.value.payType === 2 ? "会员开通" : "智米充值"),
        g: common_vendor.t(orderInfo.value.remark || "-"),
        h: common_vendor.t(orderInfo.value.amount),
        i: common_vendor.t(orderInfo.value.orderNo),
        j: common_vendor.o(($event) => copyText(orderInfo.value.orderNo)),
        k: common_vendor.t(formatTime(orderInfo.value.createTime)),
        l: orderInfo.value.payStatus === 1
      }, orderInfo.value.payStatus === 1 ? {} : {}, {
        m: common_vendor.p({
          type: "headphones",
          size: "18",
          color: "#666"
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fc3d86e7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-order-detail/my-order-detail.js.map
