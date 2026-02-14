"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "recommend-list",
  setup(__props) {
    const users = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const fetchList = async () => {
      loading.value = true;
      common_vendor.index.showLoading({
        title: "AI智能匹配中..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/random-recommend", {
        method: "GET"
      });
      common_vendor.index.hideLoading();
      loading.value = false;
      if (!error && data) {
        const getFirstItem = (value) => {
          if (!value)
            return "";
          if (Array.isArray(value) && value.length > 0)
            return value[0];
          if (typeof value === "string" && value.includes(","))
            return value.split(",")[0].trim();
          return value;
        };
        users.value = data.map((u) => {
          const tags = [];
          if (u.classmateFlag === 1)
            tags.push("同学");
          if (u.peerFlag === 1)
            tags.push("同行");
          if (u.fellowTownspeopleFlag === 1)
            tags.push("同乡");
          if (u.friendParentFlag === 1)
            tags.push("同圈");
          if (tags.length === 0)
            tags.push("深度契合");
          return {
            ...u,
            matchTags: tags,
            companyName: getFirstItem(u.companyName),
            school: getFirstItem(u.school),
            professionalTitle: getFirstItem(u.professionalTitle)
          };
        });
      }
    };
    const goToDetail = async (user) => {
      const canProceed = await utils_user.checkLoginGuard();
      if (canProceed) {
        common_vendor.index.navigateTo({
          url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}`
        });
      }
    };
    common_vendor.onLoad(() => {
      fetchList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(users.value, (user, index, i0) => {
          return common_vendor.e({
            a: user.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(user.nickname),
            c: user.idCert === 1
          }, user.idCert === 1 ? {} : user.isComplete === 1 ? {} : {}, {
            d: user.isComplete === 1,
            e: common_vendor.t(user.professionalTitle || "暂未设置社会职务"),
            f: common_vendor.t(user.companyName || "暂未设置公司"),
            g: common_vendor.t(user.school || "暂未设置学校"),
            h: common_vendor.f(user.matchTags, (tag, tidx, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tidx
              };
            }),
            i: "6e53aa0e-0-" + i0,
            j: common_vendor.t(user.locationAddressStr || "暂未设置商务/办公地"),
            k: user.id,
            l: common_vendor.o(($event) => goToDetail(user), user.id)
          });
        }),
        b: common_vendor.p({
          type: "location-filled",
          size: "14",
          color: "#8E8E93"
        }),
        c: users.value.length === 0 && !loading.value
      }, users.value.length === 0 && !loading.value ? {
        d: common_assets._imports_0$2
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e53aa0e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/recommend-list/recommend-list.js.map
