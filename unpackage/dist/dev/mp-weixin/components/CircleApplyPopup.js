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
  __name: "CircleApplyPopup",
  emits: ["refresh"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const popup = common_vendor.ref(null);
    const list = common_vendor.ref([]);
    const emit = __emit;
    const open = (dataList) => {
      list.value = dataList || [];
      popup.value.open();
    };
    const close = () => {
      popup.value.close();
    };
    const handleAudit = async (item, isAgree) => {
      common_vendor.index.showLoading({
        title: "处理中..."
      });
      try {
        const url = `/app-api/member/user/friend/review`;
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
          if (list.value.length === 0) {
            setTimeout(() => {
              close();
            }, 500);
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
        common_vendor.index.__f__("error", "at components/CircleApplyPopup.vue:117", e);
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
      return new Date(time).toLocaleDateString();
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(list.value.length),
        b: common_vendor.o(close),
        c: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        d: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.avatar || "/static/icon/default-avatar.png",
            b: common_vendor.t(item.realName || item.nickname),
            c: common_vendor.t(formatTime(item.createTime)),
            d: common_vendor.t(item.companyName || "暂无公司"),
            e: common_vendor.t(item.positionTitle || "暂无职位"),
            f: item.fellowTownspeopleFlag === 1
          }, item.fellowTownspeopleFlag === 1 ? {} : {}, {
            g: item.peerFlag === 1
          }, item.peerFlag === 1 ? {} : {}, {
            h: item.classmateFlag === 1
          }, item.classmateFlag === 1 ? {} : {}, {
            i: common_vendor.o(($event) => handleAudit(item, false), item.id),
            j: common_vendor.o(($event) => handleAudit(item, true), item.id),
            k: item.id
          });
        }),
        e: list.value.length === 0
      }, list.value.length === 0 ? {} : {}, {
        f: common_vendor.sr(popup, "8f869322-0", {
          "k": "popup"
        }),
        g: common_vendor.o(onPopupChange),
        h: common_vendor.p({
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
