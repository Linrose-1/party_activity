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
  __name: "my-account",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      fetchUserInfo().then(() => {
        if (userInfo.value) {
          getHistoryList(true);
        }
      });
    });
    const fetchUserInfo = async () => {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({
          title: `加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      userInfo.value = data;
      common_vendor.index.__f__("log", "at packages/my-account/my-account.vue:317", "123", userInfo.value);
    };
    const navigateToInfoDetails = () => {
      if (!userInfo.value || !userInfo.value.id) {
        common_vendor.index.showToast({
          title: "无法获取用户ID",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/packages/my-account-informationDetails/my-account-informationDetails?id=${userInfo.value.id}`
      });
    };
    const pointsToNextLevel = common_vendor.computed(() => {
      if (!userInfo.value)
        return 0;
      const currentPoints = userInfo.value.currExperience;
      if (currentPoints < 100)
        return 100 - currentPoints;
      if (currentPoints < 500)
        return 500 - currentPoints;
      if (currentPoints < 1e3)
        return 1e3 - currentPoints;
      if (currentPoints < 2e3)
        return 2e3 - currentPoints;
      return 0;
    });
    const membershipLevels = common_vendor.ref([
      {
        name: "玄铁会员",
        threshold: 0
      },
      {
        name: "青铜会员",
        threshold: 100
      },
      {
        name: "白银会员",
        threshold: 365
      },
      {
        name: "黄金会员",
        threshold: 3650
      },
      {
        name: "黑钻会员",
        threshold: 36500
      },
      // 添加一个无限大的“顶层”，方便计算，用户不会看到
      {
        name: "至尊",
        threshold: Infinity
      }
    ]);
    const currentMembershipLevel = common_vendor.computed(() => {
      if (!userInfo.value || typeof userInfo.value.topUpExperience === "undefined") {
        return membershipLevels.value[0];
      }
      const amount = userInfo.value.topUpExperience;
      for (let i = membershipLevels.value.length - 1; i >= 0; i--) {
        if (amount >= membershipLevels.value[i].threshold) {
          return membershipLevels.value[i];
        }
      }
      return membershipLevels.value[0];
    });
    const navigateToMemberDetails = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-memberDetails/my-memberDetails"
      });
    };
    const navigateToMembershipRecharge = () => {
      common_vendor.index.navigateTo({
        url: "/packages/recharge/recharge?type=membership"
      });
    };
    const nextMembershipLevel = common_vendor.computed(() => {
      const currentIndex = membershipLevels.value.findIndex((level) => level.name === currentMembershipLevel.value.name);
      if (currentIndex < membershipLevels.value.length - 2) {
        return membershipLevels.value[currentIndex + 1];
      }
      return null;
    });
    common_vendor.computed(() => {
      if (nextMembershipLevel.value && userInfo.value) {
        const needed = nextMembershipLevel.value.threshold - userInfo.value.topUpExperience;
        return Math.max(0, needed);
      }
      return 0;
    });
    const historyList = common_vendor.ref([]);
    const historyPageNo = common_vendor.ref(1);
    const historyPageSize = common_vendor.ref(10);
    const historyTotal = common_vendor.ref(0);
    const historyLoadStatus = common_vendor.ref("more");
    const getHistoryList = async (isRefresh = false) => {
      if (historyLoadStatus.value === "loading" || historyLoadStatus.value === "noMore" && !isRefresh) {
        return;
      }
      if (isRefresh) {
        historyPageNo.value = 1;
        historyList.value = [];
        historyLoadStatus.value = "more";
      }
      historyLoadStatus.value = "loading";
      const params = {
        pageNo: historyPageNo.value,
        pageSize: historyPageSize.value
      };
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/experience-record/page", {
        method: "GET",
        data: params
      });
      if (error) {
        historyLoadStatus.value = "more";
        common_vendor.index.showToast({
          title: `历史记录加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      if (data && data.list) {
        historyList.value.push(...data.list);
        historyTotal.value = data.total;
        if (historyList.value.length >= historyTotal.value) {
          historyLoadStatus.value = "noMore";
        } else {
          historyLoadStatus.value = "more";
          historyPageNo.value++;
        }
      } else {
        historyLoadStatus.value = "noMore";
      }
    };
    common_vendor.onReachBottom(() => {
      getHistoryList();
    });
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      const s = date.getSeconds().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const tasks = common_vendor.ref([
      {
        icon: "flag",
        name: "发起聚会",
        desc: "成功发起并举办一次聚会",
        points: "+30分/次",
        path: "/packages/active-publish/active-publish"
      },
      {
        icon: "calendar",
        name: "参与聚会",
        desc: "参加平台组织的聚会",
        points: "+5分/次",
        path: "/pages/active/active"
      },
      {
        icon: "chat",
        name: "分享聚会",
        desc: "分享有价值的聚会",
        points: "+5分/次",
        path: "/pages/active/active"
      },
      {
        icon: "sound",
        name: "发布商机",
        desc: "分享有价值的商业机会",
        points: "+5分/次",
        path: "/pages/home/home"
      },
      {
        icon: "mic",
        name: "评论商机",
        desc: "对他人分享的商机进行评价",
        points: "+5分/次",
        path: "/packages/home-commercialDetail/home-commercialDetail"
      },
      {
        icon: "personadd",
        name: "分享名片",
        desc: "分享个人名片卡片",
        points: "+5分/人",
        path: "/packages/my-businessCard/my-businessCard"
      },
      {
        icon: "personadd",
        name: "邀请注册",
        desc: "邀请新用户进行注册",
        points: "+5分/人",
        path: "/pages/index/index"
      },
      {
        icon: "star",
        name: "其他贡献",
        desc: "用户在平台的其他贡献",
        points: "+5分"
      }
    ]);
    const handleTaskClick = (task) => {
      if (!task.path) {
        common_vendor.index.showToast({
          title: "该功能正在开发中...",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: task.path,
        fail: (err) => {
          common_vendor.index.__f__("error", "at packages/my-account/my-account.vue:572", `跳转失败: ${err.errMsg}`);
          common_vendor.index.showToast({
            title: "请手动前往对应页面",
            icon: "none"
          });
        }
      });
    };
    const handleExchangeSmartRice = () => {
      common_vendor.index.__f__("log", "at packages/my-account/my-account.vue:582", "用户点击了申请兑换，准备跳转到兑换页面...");
      common_vendor.index.showToast({
        title: "兑换页面开发中...",
        icon: "none"
      });
    };
    const handleRechargeSmartRice = () => {
      common_vendor.index.__f__("log", "at packages/my-account/my-account.vue:591", "用户点击了充值智米，跳转到充值页面...");
      common_vendor.index.navigateTo({
        url: "/packages/recharge/recharge"
        // 跳转到充值页面
      });
    };
    const navigateToRecommendFriends = () => {
      common_vendor.index.navigateTo({
        url: "/pages/my-recommendFriends/my-recommendFriends"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "person-filled",
          size: "24",
          color: "#FF6B00"
        }),
        c: userInfo.value.avatar || "/static/default-avatar.png",
        d: common_vendor.t(userInfo.value.nickname || "未设置昵称"),
        e: common_vendor.t(userInfo.value.virtualId),
        f: common_vendor.p({
          type: "right",
          size: "14",
          color: "#fff"
        }),
        g: common_vendor.o(navigateToInfoDetails),
        h: common_vendor.p({
          type: "personadd",
          size: "24",
          color: "#FF6B00"
        }),
        i: userInfo.value.parentName
      }, userInfo.value.parentName ? {
        j: common_vendor.t(userInfo.value.parentName.charAt(0)),
        k: common_vendor.t(userInfo.value.parentName)
      } : {
        l: common_vendor.p({
          type: "info",
          size: "24",
          color: "#999"
        })
      }, {
        m: common_vendor.p({
          type: "staff-filled",
          size: "22",
          color: "#fff"
        }),
        n: common_vendor.p({
          type: "right",
          size: "16",
          color: "#fff"
        }),
        o: common_vendor.o(navigateToRecommendFriends),
        p: common_vendor.p({
          type: "medal",
          size: "24",
          color: "#FF6B00"
        }),
        q: common_vendor.t(userInfo.value.level.name),
        r: common_vendor.t(userInfo.value.level.icon),
        s: common_vendor.t(userInfo.value.level.name),
        t: common_vendor.t(userInfo.value.currExperience),
        v: common_vendor.t(pointsToNextLevel.value),
        w: common_vendor.p({
          type: "vip",
          size: "24",
          color: "#FFD700"
        }),
        x: common_vendor.t(currentMembershipLevel.value.name),
        y: common_vendor.t(userInfo.value.topUpExperience || 0),
        z: userInfo.value.topUpLevel.name === "玄铁会员" ? 1 : "",
        A: userInfo.value.topUpLevel.name === "青铜会员" ? 1 : "",
        B: userInfo.value.topUpLevel.name === "白银会员" ? 1 : "",
        C: userInfo.value.topUpLevel.name === "黄金会员" ? 1 : "",
        D: userInfo.value.topUpLevel.name === "黑钻会员" ? 1 : "",
        E: common_vendor.o(navigateToMemberDetails),
        F: common_vendor.p({
          type: "list",
          size: "20",
          color: "#fff"
        }),
        G: common_vendor.o(navigateToMemberDetails),
        H: common_vendor.p({
          type: "wallet",
          size: "20",
          color: "#fff"
        }),
        I: common_vendor.o(navigateToMembershipRecharge),
        J: common_vendor.p({
          type: "wallet",
          size: "24",
          color: "#FF6B00"
        }),
        K: common_vendor.t(userInfo.value.point),
        L: common_vendor.p({
          type: "forward",
          size: "20",
          color: "#fff"
        }),
        M: common_vendor.o(handleExchangeSmartRice),
        N: common_vendor.p({
          type: "wallet",
          size: "20",
          color: "#fff"
        }),
        O: common_vendor.o(handleRechargeSmartRice),
        P: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#FF6B00"
        }),
        Q: common_vendor.t(userInfo.value.currExperience),
        R: common_vendor.f(tasks.value, (task, index, i0) => {
          return {
            a: "73c6c0a5-14-" + i0,
            b: common_vendor.p({
              type: task.icon,
              size: "24",
              color: "#FF6B00"
            }),
            c: common_vendor.t(task.name),
            d: common_vendor.t(task.desc),
            e: common_vendor.t(task.points),
            f: "73c6c0a5-15-" + i0,
            g: common_vendor.o(($event) => handleTaskClick(task), index),
            h: index
          };
        }),
        S: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#fff"
        }),
        T: common_vendor.p({
          type: "bars",
          size: "24",
          color: "#FF6B00"
        }),
        U: historyList.value.length === 0 && historyLoadStatus.value === "noMore"
      }, historyList.value.length === 0 && historyLoadStatus.value === "noMore" ? {
        V: common_vendor.p({
          type: "info-filled",
          size: "40",
          color: "#ccc"
        })
      } : {
        W: common_vendor.f(historyList.value, (record, index, i0) => {
          return {
            a: "73c6c0a5-18-" + i0,
            b: common_vendor.p({
              type: record.experience >= 0 ? "arrow-up" : "arrow-down",
              size: "20",
              color: record.experience >= 0 ? "#28a745" : "#dc3545"
            }),
            c: record.experience >= 0 ? 1 : "",
            d: record.experience < 0 ? 1 : "",
            e: common_vendor.t(record.title),
            f: common_vendor.t(formatTimestamp(record.createTime)),
            g: common_vendor.t(record.experience > 0 ? "+" : ""),
            h: common_vendor.t(record.experience),
            i: record.experience >= 0 ? 1 : "",
            j: record.experience < 0 ? 1 : "",
            k: record.createTime + "-" + index
          };
        })
      }, {
        X: historyList.value.length > 0
      }, historyList.value.length > 0 ? {
        Y: common_vendor.p({
          status: historyLoadStatus.value
        })
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-73c6c0a5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-account/my-account.js.map
