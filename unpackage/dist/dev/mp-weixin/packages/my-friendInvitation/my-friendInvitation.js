"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "my-friendInvitation",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const platformInfo = common_vendor.ref({});
    const inviteTools = common_vendor.ref([
      {
        name: "注册邀请",
        desc: "注册分享邀请",
        icon: "/static/icon/精准投放.png",
        path: "/pages/index/index"
      },
      {
        name: "名片邀请",
        desc: "名片分享邀请",
        icon: "/static/icon/我的名片.png",
        path: "/packages/my-businessCard/my-businessCard"
      },
      {
        name: "发贴邀请",
        desc: "商机分享邀友",
        icon: "/static/icon/商机.png",
        path: "/packages/home-opportunitiesPublish/home-opportunitiesPublish"
      },
      {
        name: "聚会邀请",
        desc: "聚会分享邀友",
        icon: "/static/icon/聚会.png",
        path: "/packages/active-publish/active-publish"
      }
    ]);
    const initializePage = async () => {
      await Promise.all([fetchUserInfo(), fetchPlatformConfig()]);
      common_vendor.index.stopPullDownRefresh();
    };
    const fetchUserInfo = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/user/get");
      if (data)
        userInfo.value = data;
    };
    const fetchPlatformConfig = async () => {
      const {
        data
      } = await utils_request.request("/app-api/system/platformConfig/getPlatformConfig");
      if (data)
        platformInfo.value = data;
    };
    const goToPlatformIntro = () => common_vendor.index.navigateTo({
      url: "/pages/platform-intro/platform-intro"
    });
    const viewParentCard = () => {
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${userInfo.value.parentId}&name=${encodeURIComponent(userInfo.value.parentName)}&avatar=${encodeURIComponent(userInfo.value.parentAvatar || "")}&fromShare=1`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const handleToolClick = (item) => common_vendor.index.navigateTo({
      url: item.path
    });
    common_vendor.onMounted(() => initializePage());
    common_vendor.onPullDownRefresh(() => initializePage());
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(inviteTools.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.desc),
            d: index,
            e: common_vendor.o(($event) => handleToolClick(item), index)
          };
        }),
        b: platformInfo.value.name
      }, platformInfo.value.name ? {
        c: platformInfo.value.img,
        d: common_vendor.t(platformInfo.value.name),
        e: common_vendor.o(goToPlatformIntro)
      } : {}, {
        f: userInfo.value && userInfo.value.parentName
      }, userInfo.value && userInfo.value.parentName ? {} : {}, {
        g: userInfo.value && userInfo.value.parentName
      }, userInfo.value && userInfo.value.parentName ? common_vendor.e({
        h: userInfo.value.parentAvatar
      }, userInfo.value.parentAvatar ? {
        i: userInfo.value.parentAvatar
      } : {
        j: common_vendor.t(userInfo.value.parentName.charAt(0))
      }, {
        k: common_vendor.t(userInfo.value.parentName),
        l: userInfo.value.parentName === "猩聚社"
      }, userInfo.value.parentName === "猩聚社" ? {} : {}, {
        m: common_vendor.o(viewParentCard)
      }) : {}, {
        n: userInfo.value && !userInfo.value.parentName
      }, userInfo.value && !userInfo.value.parentName ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a29497fd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-friendInvitation/my-friendInvitation.js.map
