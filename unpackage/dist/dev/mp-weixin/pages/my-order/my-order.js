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
const pageSize = 10;
const _sfc_main = {
  __name: "my-order",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const orderList = common_vendor.ref([]);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    const isPaying = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      loadData(true);
    });
    common_vendor.onPullDownRefresh(() => {
      loadData(true);
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more") {
        loadData(false);
      }
    });
    const loadData = async (isRefresh = false) => {
      if (loadingStatus.value === "loading")
        return;
      loadingStatus.value = "loading";
      if (isRefresh) {
        pageNo.value = 1;
        orderList.value = [];
      }
      try {
        const params = {
          pageNo: pageNo.value,
          pageSize
        };
        if (currentTab.value !== 0) {
          params.payType = currentTab.value;
        }
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user-post-pay-record/page", {
          method: "GET",
          data: params
        });
        if (error)
          throw new Error(error);
        const list = data.list || [];
        orderList.value = isRefresh ? list : [...orderList.value, ...list];
        if (list.length < pageSize) {
          loadingStatus.value = "noMore";
        } else {
          loadingStatus.value = "more";
          pageNo.value++;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/my-order/my-order.vue:139", "加载订单失败", e);
        loadingStatus.value = "more";
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const switchTab = (index) => {
      if (currentTab.value === index)
        return;
      currentTab.value = index;
      loadData(true);
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/my-order-detail/my-order-detail?id=${item.id}`
      });
    };
    const handleRepay = async (item) => {
      if (!item.orderNo) {
        return common_vendor.index.showToast({
          title: "订单号无效",
          icon: "none"
        });
      }
      isPaying.value = true;
      common_vendor.index.showLoading({
        title: "正在支付..."
      });
      try {
        const {
          data: payParams,
          error
        } = await utils_request.request("/app-api/member/user-post-pay-record/pay", {
          method: "POST",
          data: {
            orderNo: item.orderNo
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
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success"
        });
        setTimeout(() => loadData(true), 1e3);
      } catch (e) {
        common_vendor.index.hideLoading();
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
    const formatTime = (ts) => {
      if (!ts)
        return "";
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    const getStatusText = (status) => {
      return status === 1 ? "✅ 支付成功" : "⏳ 待支付";
    };
    const getStatusClass = (status) => {
      return status === 1 ? "status-success" : "status-pending";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === 0 ? 1 : "",
        b: common_vendor.o(($event) => switchTab(0)),
        c: currentTab.value === 1 ? 1 : "",
        d: common_vendor.o(($event) => switchTab(1)),
        e: currentTab.value === 2 ? 1 : "",
        f: common_vendor.o(($event) => switchTab(2)),
        g: common_vendor.f(orderList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(formatTime(item.createTime)),
            b: common_vendor.t(getStatusText(item.payStatus)),
            c: common_vendor.n(getStatusClass(item.payStatus)),
            d: "ada78424-0-" + i0,
            e: common_vendor.p({
              type: item.payType === 2 ? "vip-filled" : "star-filled",
              size: "24",
              color: "#fff"
            }),
            f: common_vendor.n(item.payType === 2 ? "member-bg" : "zhimi-bg"),
            g: common_vendor.t(item.payType === 2 ? "会员开通" : "智米充值"),
            h: common_vendor.t(item.amount),
            i: common_vendor.t(item.remark || (item.payType === 2 ? "会员服务" : "充值余额")),
            j: common_vendor.t(item.orderNo || "生成中..."),
            k: item.payStatus === 0
          }, item.payStatus === 0 ? {
            l: common_vendor.t(item.amount),
            m: common_vendor.o(($event) => handleRepay(item), item.id),
            n: isPaying.value,
            o: isPaying.value
          } : {}, {
            p: item.id,
            q: common_vendor.o(($event) => goToDetail(item), item.id)
          });
        }),
        h: orderList.value.length > 0 || loadingStatus.value === "loading"
      }, orderList.value.length > 0 || loadingStatus.value === "loading" ? {
        i: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}, {
        j: orderList.value.length === 0 && loadingStatus.value === "noMore"
      }, orderList.value.length === 0 && loadingStatus.value === "noMore" ? {
        k: common_vendor.p({
          type: "cart",
          size: "60",
          color: "#ddd"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ada78424"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-order/my-order.js.map
