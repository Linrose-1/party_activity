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
const defaultAvatar = "/static/icon/default-avatar.png";
const _sfc_main = {
  __name: "suggestion-detail",
  setup(__props) {
    const detail = common_vendor.ref(null);
    const loggedInUserId = common_vendor.index.getStorageSync("userId");
    common_vendor.onLoad((options) => {
      if (options.id) {
        fetchDetail(options.id);
      }
    });
    const fetchDetail = async (id) => {
      common_vendor.index.showLoading({
        title: "正在加载..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/suggestion/get", {
        method: "GET",
        data: {
          id
        }
      });
      common_vendor.index.hideLoading();
      if (data)
        detail.value = data;
    };
    const isOwner = common_vendor.computed(() => {
      return detail.value && detail.value.creator == loggedInUserId;
    });
    const imageList = common_vendor.computed(() => {
      var _a;
      return ((_a = detail.value) == null ? void 0 : _a.img) ? detail.value.img.split(",").filter(Boolean) : [];
    });
    const getStatusText = (s) => {
      const map = {
        0: "待处理",
        1: "已采纳",
        2: "处理中"
      };
      return map[s] || "已公示";
    };
    const formatTime = (ts) => {
      if (!ts)
        return "";
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: imageList.value,
        current: index
      });
    };
    const goUserCard = (id) => {
      if (!id)
        return;
      common_vendor.index.navigateTo({
        url: `/packages/my-businessCard/my-businessCard?id=${id}`
      });
    };
    const goEdit = () => {
      common_vendor.index.navigateTo({
        url: `/pages/my-systemSuggestions/my-systemSuggestions?id=${detail.value.id}`
      });
    };
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: detail.value
      }, detail.value ? common_vendor.e({
        b: common_vendor.t(getStatusText(detail.value.status)),
        c: common_vendor.n("status-" + detail.value.status),
        d: common_vendor.t(formatTime(detail.value.createTime)),
        e: common_vendor.t(detail.value.title),
        f: ((_a = detail.value.memberUser) == null ? void 0 : _a.avatar) || defaultAvatar,
        g: common_vendor.t(((_b = detail.value.memberUser) == null ? void 0 : _b.nickname) || "匿名商友"),
        h: common_vendor.t(((_c = detail.value.memberUser) == null ? void 0 : _c.professionalTitle) || "平台共建商友"),
        i: common_vendor.p({
          type: "right",
          size: "14",
          color: "#ccc"
        }),
        j: common_vendor.o(($event) => {
          var _a2;
          return goUserCard((_a2 = detail.value.memberUser) == null ? void 0 : _a2.id);
        }),
        k: common_vendor.t(detail.value.content),
        l: imageList.value.length
      }, imageList.value.length ? {
        m: common_vendor.f(imageList.value, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImage(index), index)
          };
        })
      } : {}, {
        n: isOwner.value
      }, isOwner.value ? {
        o: common_vendor.o(goEdit)
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ff3d1e4c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/suggestion-detail/suggestion-detail.js.map
