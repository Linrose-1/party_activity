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
        users.value = data.map((u) => {
          const tags = [];
          if (u.classmateFlag)
            tags.push("同校校友");
          if (u.peerFlag)
            tags.push("行业同行");
          if (u.fellowTownspeopleFlag)
            tags.push("家乡同乡");
          if (u.matchTagCount > 0)
            tags.push(`${u.matchTagCount}项需求匹配`);
          if (tags.length === 0)
            tags.push("优质商友");
          const getFirstItem = (value) => {
            if (!value)
              return "";
            if (Array.isArray(value) && value.length > 0) {
              return value[0];
            }
            if (typeof value === "string" && value.includes(",")) {
              return value.split(",")[0].trim();
            }
            return value;
          };
          return {
            ...u,
            matchTags: tags,
            companyName: getFirstItem(u.companyName) || "保密机构",
            school: getFirstItem(u.school) || "知名大学",
            positionTitle: getFirstItem(u.positionTitle) || "",
            professionalTitle: getFirstItem(u.professionalTitle) || "精英人士"
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
            c: user.isComplete
          }, user.isComplete ? {} : {}, {
            d: common_vendor.t(user.professionalTitle || "精英人士"),
            e: common_vendor.t(90 + index % 10),
            f: common_vendor.t(user.companyName || "保密机构"),
            g: common_vendor.t(user.school || "知名大学"),
            h: common_vendor.f(user.matchTags, (tag, tidx, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tidx
              };
            }),
            i: "6e53aa0e-0-" + i0,
            j: common_vendor.t(user.locationAddressStr || "全国"),
            k: user.id,
            l: common_vendor.o(($event) => goToDetail(user), user.id)
          });
        }),
        b: common_vendor.p({
          type: "location",
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
