"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup = () => "../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more + _easycom_uni_popup)();
}
const pageSize = 10;
const _sfc_main = {
  __name: "CircleApplyPopup",
  emits: ["refresh"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const popup = common_vendor.ref(null);
    const list = common_vendor.ref([]);
    const currentTab = common_vendor.ref(1);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    const loading = common_vendor.ref(false);
    const pendingCount = common_vendor.ref(0);
    const emit = __emit;
    const open = (newApplyList, totalCount = 0) => {
      currentTab.value = 1;
      pendingCount.value = totalCount;
      if (newApplyList && newApplyList.length > 0) {
        list.value = newApplyList;
        pageNo.value = 1;
        if (newApplyList.length < pageSize)
          loadingStatus.value = "noMore";
      } else {
        loadData(true);
      }
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    const switchTab = (tabIndex) => {
      if (currentTab.value === tabIndex)
        return;
      currentTab.value = tabIndex;
      loadData(true);
    };
    const loadData = async (isRefresh = false) => {
      if (loadingStatus.value === "loading")
        return;
      if (isRefresh) {
        pageNo.value = 1;
        list.value = [];
        loadingStatus.value = "loading";
        loading.value = true;
      }
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/friend/list", {
          method: "GET",
          data: {
            pageNo: pageNo.value,
            pageSize,
            status: 0,
            // 0 表示申请中
            addInitiator: currentTab.value
            // 1=别人发给我的(待处理), 0=我发给别人的
          }
        });
        if (!error && data) {
          const newList = data.list || [];
          list.value = isRefresh ? newList : [...list.value, ...newList];
          if (list.value.length >= data.total) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            pageNo.value++;
          }
        } else {
          loadingStatus.value = "noMore";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/CircleApplyPopup.vue:174", e);
        loadingStatus.value = "more";
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (loadingStatus.value === "more") {
        loadData(false);
      }
    };
    const handleAudit = async (item, isAgree) => {
      common_vendor.index.showLoading({
        title: "处理中..."
      });
      try {
        const url = `/app-api/member/user/friend/agree`;
        const payload = {
          id: item.fid,
          status: isAgree
        };
        const {
          error
        } = await utils_request.request(url, {
          method: "POST",
          data: payload
        });
        if (!error) {
          common_vendor.index.showToast({
            title: "操作成功",
            icon: "success"
          });
          list.value = list.value.filter((i) => i.id !== item.id);
          if (list.value.length === 0 && pageNo.value > 1) {
            loadData(true);
          }
        } else {
          common_vendor.index.showToast({
            title: error || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络异常",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const onPopupChange = (e) => {
      if (!e.show) {
        emit("refresh");
      }
    };
    const formatTime = (time) => {
      if (!time)
        return "";
      const date = new Date(time);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(close),
        b: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        c: pendingCount.value > 0 && currentTab.value !== 1
      }, pendingCount.value > 0 && currentTab.value !== 1 ? {} : {}, {
        d: currentTab.value === 1 ? 1 : "",
        e: common_vendor.o(($event) => switchTab(1)),
        f: currentTab.value === 0 ? 1 : "",
        g: common_vendor.o(($event) => switchTab(0)),
        h: list.value.length > 0
      }, list.value.length > 0 ? common_vendor.e({
        i: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(item.realName || item.nickname),
            c: common_vendor.t(formatTime(item.createTime)),
            d: common_vendor.t(item.companyName || "暂无公司"),
            e: item.positionTitle
          }, item.positionTitle ? {
            f: common_vendor.t(item.positionTitle)
          } : {}, {
            g: item.fellowTownspeopleFlag === 1
          }, item.fellowTownspeopleFlag === 1 ? {} : {}, {
            h: item.peerFlag === 1
          }, item.peerFlag === 1 ? {} : {}, {
            i: item.classmateFlag === 1
          }, item.classmateFlag === 1 ? {} : {}, currentTab.value === 1 ? {
            j: common_vendor.o(($event) => handleAudit(item, false), item.id),
            k: common_vendor.o(($event) => handleAudit(item, true), item.id)
          } : {
            l: "8f869322-2-" + i0 + ",8f869322-0",
            m: common_vendor.p({
              type: "paperplane",
              size: "16",
              color: "#999"
            })
          }, {
            n: item.id
          });
        }),
        j: currentTab.value === 1,
        k: list.value.length >= 10 || loadingStatus.value === "loading"
      }, list.value.length >= 10 || loadingStatus.value === "loading" ? {
        l: common_vendor.p({
          status: loadingStatus.value
        })
      } : {}) : !loading.value ? {
        n: common_vendor.p({
          type: "email",
          size: "40",
          color: "#ddd"
        }),
        o: common_vendor.t(currentTab.value === 1 ? "待处理申请" : "已发出申请")
      } : {}, {
        m: !loading.value,
        p: common_vendor.o(loadMore),
        q: common_vendor.sr(popup, "8f869322-0", {
          "k": "popup"
        }),
        r: common_vendor.o(onPopupChange),
        s: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#f5f7fa"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8f869322"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/CircleApplyPopup.js.map
