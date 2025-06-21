"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "active-detail",
  setup(__props) {
    const enrollmentType = common_vendor.ref("sponsor");
    const fee = common_vendor.ref(100);
    const sponsorName = common_vendor.ref("未来科技股份有限公司");
    const sponsorLogo = common_vendor.ref("/static/sponsor_logo.png");
    const avatars = [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
      "https://randomuser.me/api/portraits/men/4.jpg"
    ];
    const activities = [
      {
        icon: "sound",
        title: "主题演讲",
        desc: "行业大咖分享创业经验"
      },
      {
        icon: "group",
        title: "圆桌论坛",
        desc: "创业者互动讨论"
      },
      {
        icon: "person",
        title: "自由交流",
        desc: "拓展人脉资源"
      },
      {
        icon: "coffee",
        title: "茶歇时间",
        desc: "精致茶点与饮品"
      }
    ];
    function share() {
      common_vendor.index.showToast({
        title: "已分享到微信朋友圈",
        icon: "none"
      });
    }
    function register() {
      common_vendor.index.navigateTo({
        url: "/pages/active-enroll/active-enroll"
      });
    }
    function viewAllUsers() {
      common_vendor.index.showToast({
        title: "查看全部参与用户",
        icon: "none"
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#FF6B00"
        }),
        b: common_vendor.p({
          type: "location",
          size: "18",
          color: "#FF6B00"
        }),
        c: enrollmentType.value === "aa"
      }, enrollmentType.value === "aa" ? {
        d: common_vendor.t(fee.value)
      } : enrollmentType.value === "sponsor" ? {} : {}, {
        e: enrollmentType.value === "sponsor",
        f: common_vendor.f(activities, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.desc),
            c: index
          };
        }),
        g: common_vendor.p({
          type: "person-filled",
          size: "24",
          color: "#fff"
        }),
        h: common_vendor.p({
          type: "shop-filled",
          size: "24",
          color: "#fff"
        }),
        i: common_vendor.o(viewAllUsers),
        j: common_vendor.f(avatars, (avatar, index, i0) => {
          return {
            a: index,
            b: avatar
          };
        }),
        k: enrollmentType.value === "sponsor"
      }, enrollmentType.value === "sponsor" ? {
        l: sponsorLogo.value,
        m: common_vendor.t(sponsorName.value),
        n: common_vendor.t(sponsorName.value)
      } : {}, {
        o: common_vendor.o(share),
        p: common_vendor.o(register)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-de6b8eea"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active-detail/active-detail.js.map
