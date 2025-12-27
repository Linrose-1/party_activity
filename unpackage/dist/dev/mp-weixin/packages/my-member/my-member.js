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
const _sfc_main = {
  __name: "my-member",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const membershipLevels = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      fetchUserInfo();
      fetchMemberLevels();
    });
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (error) {
        common_vendor.index.showToast({
          title: `加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      userInfo.value = data;
    };
    const fetchMemberLevels = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/top-up-level/list");
      if (!error && data) {
        const fetchedLevels = data.sort((a, b) => a.level - b.level);
        membershipLevels.value = [
          ...fetchedLevels
          // {
          // 	name: '至尊',
          // 	level: Infinity,
          // 	experience: Infinity
          // }
        ];
      }
    };
    const pointsToNextLevel = common_vendor.computed(() => {
      if (!userInfo.value)
        return 0;
      const currentPoints = userInfo.value.currExperience;
      const levels = [5e3, 5e4, 15e4, 5e5, 2e6];
      for (const threshold of levels) {
        if (currentPoints < threshold) {
          return threshold - currentPoints;
        }
      }
      return 0;
    });
    const currentMembershipLevel = common_vendor.computed(() => {
      if (!userInfo.value || typeof userInfo.value.topUpExperience === "undefined" || membershipLevels.value.length === 0) {
        return {
          name: "加载中..."
        };
      }
      const amount = userInfo.value.topUpExperience;
      for (let i = membershipLevels.value.length - 1; i >= 0; i--) {
        if (amount >= membershipLevels.value[i].experience) {
          return membershipLevels.value[i];
        }
      }
      return membershipLevels.value[0] || {
        name: "未知"
      };
    });
    common_vendor.computed(() => {
      if (membershipLevels.value.length === 0)
        return null;
      const currentIndex = membershipLevels.value.findIndex((level) => level.name === currentMembershipLevel.value.name);
      if (currentIndex !== -1 && currentIndex < membershipLevels.value.length - 2) {
        return membershipLevels.value[currentIndex + 1];
      }
      return null;
    });
    const navigateToMemberDetails = (level) => {
      const url = "/pages/my-memberDetails/my-memberDetails";
      if (level && level.level) {
        common_vendor.index.navigateTo({
          url: `${url}?level=${level.level}`
        });
      } else {
        common_vendor.index.navigateTo({
          url
        });
      }
    };
    const navigateToMembershipRecharge = () => {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge?type=membership"
      });
    };
    const navigateToGetPoints = () => {
      common_vendor.index.navigateTo({
        url: "/packages/getPoints/getPoints"
      });
    };
    const getMemberCardClass = (name) => {
      if (name.includes("青铜"))
        return "bronze-member";
      if (name.includes("白银"))
        return "silver-member";
      if (name.includes("黄金"))
        return "gold-member";
      if (name.includes("黑钻"))
        return "diamond-member";
      return "visitor";
    };
    const getLevelIcon = (name) => {
      if (name.includes("青铜"))
        return "🪙";
      if (name.includes("白银"))
        return "🔶";
      if (name.includes("黄金"))
        return "🌟";
      if (name.includes("黑钻"))
        return "💎";
      return "👤";
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "未开通";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      return `${Y}-${M}-${D}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "medal",
          size: "24",
          color: "#FF6B00"
        }),
        c: common_vendor.t(userInfo.value.level.name),
        d: common_vendor.t(userInfo.value.level.icon),
        e: common_vendor.t(userInfo.value.level.name),
        f: common_vendor.t(userInfo.value.currExperience),
        g: pointsToNextLevel.value > 0
      }, pointsToNextLevel.value > 0 ? {
        h: common_vendor.t(pointsToNextLevel.value)
      } : {
        i: common_vendor.p({
          type: "cloud-upload",
          size: "18",
          color: "#28a745"
        })
      }, {
        j: common_vendor.o(navigateToGetPoints),
        k: userInfo.value && membershipLevels.value.length > 0
      }, userInfo.value && membershipLevels.value.length > 0 ? common_vendor.e({
        l: common_vendor.p({
          type: "vip",
          size: "24",
          color: "#FFD700"
        }),
        m: common_vendor.t(currentMembershipLevel.value.name),
        n: userInfo.value.topUpLevel.nextLevelName
      }, userInfo.value.topUpLevel.nextLevelName ? {
        o: common_vendor.t(userInfo.value.topUpLevel.nextLevelName)
      } : {
        p: common_vendor.p({
          type: "cloud-upload",
          size: "18",
          color: "#28a745"
        })
      }, {
        q: common_vendor.t(formatDate(userInfo.value.topUpLevel.expirationTime)),
        r: common_vendor.f(membershipLevels.value, (level, k0, i0) => {
          return {
            a: common_vendor.t(getLevelIcon(level.name)),
            b: common_vendor.t(level.name),
            c: common_vendor.t(level.price),
            d: level.level,
            e: common_vendor.n(getMemberCardClass(level.name)),
            f: common_vendor.n({
              "current-member-highlight": userInfo.value.topUpLevel.name === level.name
            }),
            g: common_vendor.o(($event) => navigateToMemberDetails(level), level.level)
          };
        }),
        s: common_vendor.p({
          type: "list",
          size: "20",
          color: "#fff"
        }),
        t: common_vendor.o(($event) => navigateToMemberDetails()),
        v: common_vendor.p({
          type: "wallet",
          size: "20",
          color: "#fff"
        }),
        w: common_vendor.o(navigateToMembershipRecharge)
      }) : {}) : {
        x: common_vendor.p({
          status: "loading",
          contentText: "正在加载您的会员信息..."
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e6bd0326"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-member/my-member.js.map
