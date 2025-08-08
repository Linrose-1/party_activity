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
    const recordList = common_vendor.ref([]);
    const searchQuery = common_vendor.ref("");
    const pageNo = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const loadStatus = common_vendor.ref("more");
    const isRefreshing = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    common_vendor.onShow(() => {
      initPage();
    });
    common_vendor.onPullDownRefresh(() => {
      isRefreshing.value = true;
      getRecordPage(true);
    });
    common_vendor.onReachBottom(() => {
      if (hasMore.value) {
        getRecordPage();
      }
    });
    const initPage = async () => {
      const { data, error } = await utils_request.request("/app-api/member/user/get");
      if (error) {
        common_vendor.index.showToast({ title: "获取用户信息失败", icon: "none" });
        return;
      }
      userInfo.value = data;
      await getRecordPage(true);
    };
    const getRecordPage = async (isRefresh = false) => {
      if (loadStatus.value === "loading")
        return;
      if (isRefresh) {
        pageNo.value = 1;
        hasMore.value = true;
        recordList.value = [];
      }
      if (!hasMore.value) {
        loadStatus.value = "noMore";
        return;
      }
      loadStatus.value = "loading";
      const params = {
        pageNo: pageNo.value,
        pageSize,
        userId: userInfo.value.id,
        // 使用当前用户的ID
        payNo: searchQuery.value.trim()
      };
      const { data, error } = await utils_request.request("/app-api/member/user-post-pay-record/page", {
        method: "GET",
        data: params
      });
      isRefreshing.value = false;
      if (error) {
        loadStatus.value = "more";
        common_vendor.index.showToast({ title: `加载失败: ${error}`, icon: "none" });
        return;
      }
      const newList = data.list || [];
      const total = data.total || 0;
      if (isRefresh) {
        recordList.value = newList;
      } else {
        recordList.value.push(...newList);
      }
      if (recordList.value.length >= total) {
        hasMore.value = false;
        loadStatus.value = "noMore";
      } else {
        hasMore.value = true;
        loadStatus.value = "more";
        pageNo.value++;
      }
    };
    const handleSearch = () => {
      getRecordPage(true);
    };
    const handleReupload = (record) => {
      common_vendor.index.navigateTo({
        url: `/pages/my-active-secondRegistration/my-active-secondRegistration?id=${record.id}`
      });
    };
    const previewImages = (imageUrls, currentIndex) => {
      const urls = imageUrls.split(",");
      common_vendor.index.previewImage({
        urls,
        current: currentIndex
      });
    };
    const getStatusInfo = (status) => {
      switch (status) {
        case 1:
          return { text: "待确认", color: "#007BFF" };
        case 2:
          return { text: "确认支付", color: "#28A745" };
        case 3:
          return { text: "已操作数据", color: "#6C757D" };
        case 4:
          return { text: "驳回", color: "#D9534F" };
        default:
          return { text: "未知", color: "#6C757D" };
      }
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "N/A";
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "20",
          color: "#999"
        }),
        b: common_vendor.o(handleSearch),
        c: searchQuery.value,
        d: common_vendor.o(($event) => searchQuery.value = $event.detail.value),
        e: common_vendor.o(handleSearch),
        f: common_vendor.f(recordList.value, (record, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(record.remark || "无备注"),
            b: common_vendor.t(getStatusInfo(record.status).text),
            c: getStatusInfo(record.status).color,
            d: common_vendor.t((record.amount || 0).toFixed(2)),
            e: common_vendor.t(record.payNo),
            f: common_vendor.t(formatTimestamp(record.createTime)),
            g: record.imageUrls
          }, record.imageUrls ? {
            h: common_vendor.f(record.imageUrls.split(","), (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => previewImages(record.imageUrls, index), index)
              };
            })
          } : {}, {
            i: record.status === 4 && record.errMsg
          }, record.status === 4 && record.errMsg ? {
            j: "ada78424-1-" + i0,
            k: common_vendor.p({
              type: "info-filled",
              color: "#D9534F",
              size: "18"
            }),
            l: common_vendor.t(record.errMsg),
            m: common_vendor.o(($event) => handleReupload(record), record.id)
          } : {}, {
            n: record.id
          });
        }),
        g: recordList.value.length > 0 || loadStatus.value !== "more"
      }, recordList.value.length > 0 || loadStatus.value !== "more" ? {
        h: common_vendor.p({
          status: loadStatus.value
        })
      } : {}, {
        i: recordList.value.length === 0 && loadStatus.value === "noMore"
      }, recordList.value.length === 0 && loadStatus.value === "noMore" ? {
        j: common_vendor.p({
          type: "list",
          size: "60",
          color: "#e0e0e0"
        })
      } : {}, {
        k: common_vendor.o((...args) => _ctx.loadMore && _ctx.loadMore(...args)),
        l: isRefreshing.value,
        m: common_vendor.o((...args) => common_vendor.unref(common_vendor.onPullDownRefresh) && common_vendor.unref(common_vendor.onPullDownRefresh)(...args))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ada78424"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-order/my-order.js.map
