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
      common_vendor.index.showLoading({ title: "加载中..." });
      const { data, error } = await utils_request.request("/app-api/member/user/get", { method: "GET" });
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({ title: `加载失败: ${error}`, icon: "none" });
        return;
      }
      userInfo.value = data;
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
      { name: "游客会员", threshold: 0 },
      { name: "青铜会员", threshold: 100 },
      { name: "白银会员", threshold: 365 },
      { name: "黄金会员", threshold: 3650 },
      { name: "黑钻会员", threshold: 36500 },
      // 添加一个无限大的“顶层”，方便计算，用户不会看到
      { name: "至尊", threshold: Infinity }
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
    const nextMembershipLevel = common_vendor.computed(() => {
      const currentIndex = membershipLevels.value.findIndex((level) => level.name === currentMembershipLevel.value.name);
      if (currentIndex < membershipLevels.value.length - 2) {
        return membershipLevels.value[currentIndex + 1];
      }
      return null;
    });
    const amountToNextLevel = common_vendor.computed(() => {
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
      const { data, error } = await utils_request.request("/app-api/member/experience-record/page", {
        method: "GET",
        data: params
      });
      if (error) {
        historyLoadStatus.value = "more";
        common_vendor.index.showToast({ title: `历史记录加载失败: ${error}`, icon: "none" });
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
      { icon: "calendar", name: "参与活动", desc: "参加平台组织的线上/线下活动", points: "+5分/次" },
      { icon: "flag", name: "组织活动", desc: "成功组织并举办一次活动", points: "+30分/次" },
      { icon: "sound", name: "分享商机", desc: "分享有价值的商业机会", points: "+10分/次" },
      { icon: "personadd", name: "邀请好友", desc: "成功邀请好友注册并认证", points: "+20分/人" },
      { icon: "chat", name: "每日签到", desc: "每日登录并签到", points: "+1分/天" },
      { icon: "star", name: "完善资料", desc: "完善个人和企业资料", points: "+50分" }
    ]);
    const handleTaskClick = (taskName, event) => {
      common_vendor.index.showToast({ title: `点击了任务：${taskName}`, icon: "none" });
    };
    const handleExchangeSmartRice = () => {
      common_vendor.index.showModal({
        title: "兑换智米",
        content: `请联系平台客服进行兑换操作。`,
        showCancel: false,
        confirmText: "联系客服",
        success: (res) => {
          if (res.confirm) {
            contactCustomerService();
          }
        }
      });
    };
    const contactCustomerService = () => {
      common_vendor.index.showToast({ title: "正在为您跳转客服联系方式...", icon: "none", duration: 2e3 });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "personadd",
          size: "24",
          color: "#FF6B00"
        }),
        c: userInfo.value.parentName
      }, userInfo.value.parentName ? {
        d: common_vendor.t(userInfo.value.parentName.charAt(0)),
        e: common_vendor.t(userInfo.value.parentName)
      } : {
        f: common_vendor.p({
          type: "info",
          size: "24",
          color: "#999"
        })
      }, {
        g: common_vendor.p({
          type: "medal",
          size: "24",
          color: "#FF6B00"
        }),
        h: common_vendor.t(userInfo.value.level.name),
        i: common_vendor.t(userInfo.value.level.icon),
        j: common_vendor.t(userInfo.value.level.name),
        k: common_vendor.t(userInfo.value.currExperience),
        l: common_vendor.t(pointsToNextLevel.value),
        m: common_vendor.p({
          type: "vip",
          size: "24",
          color: "#FFD700"
        }),
        n: common_vendor.t(currentMembershipLevel.value.name),
        o: common_vendor.t(userInfo.value.topUpExperience || 0),
        p: amountToNextLevel.value > 0 && nextMembershipLevel.value
      }, amountToNextLevel.value > 0 && nextMembershipLevel.value ? {
        q: common_vendor.t(nextMembershipLevel.value.name),
        r: common_vendor.t(amountToNextLevel.value)
      } : {
        s: common_vendor.p({
          type: "cloud-upload",
          size: "18",
          color: "#28a745"
        })
      }, {
        t: userInfo.value.topUpLevel.name === "游客会员" ? 1 : "",
        v: userInfo.value.topUpLevel.name === "青铜会员" ? 1 : "",
        w: userInfo.value.topUpLevel.name === "白银会员" ? 1 : "",
        x: userInfo.value.topUpLevel.name === "黄金会员" ? 1 : "",
        y: userInfo.value.topUpLevel.name === "黑钻会员" ? 1 : "",
        z: common_vendor.p({
          type: "wallet",
          size: "24",
          color: "#FF6B00"
        }),
        A: common_vendor.t(userInfo.value.point),
        B: common_vendor.p({
          type: "forward",
          size: "20",
          color: "#fff"
        }),
        C: common_vendor.o(handleExchangeSmartRice),
        D: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#fff"
        }),
        E: common_vendor.p({
          type: "info-filled",
          size: "18",
          color: "#FF6B00"
        }),
        F: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#FF6B00"
        }),
        G: common_vendor.t(userInfo.value.currExperience),
        H: common_vendor.f(tasks.value, (task, index, i0) => {
          return {
            a: "04e670bd-10-" + i0,
            b: common_vendor.p({
              type: task.icon,
              size: "24",
              color: "#FF6B00"
            }),
            c: common_vendor.t(task.name),
            d: common_vendor.t(task.desc),
            e: common_vendor.t(task.points),
            f: "04e670bd-11-" + i0,
            g: common_vendor.o(($event) => handleTaskClick(task.name), index),
            h: index
          };
        }),
        I: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#fff"
        }),
        J: common_vendor.p({
          type: "bars",
          size: "24",
          color: "#FF6B00"
        }),
        K: historyList.value.length === 0 && historyLoadStatus.value === "noMore"
      }, historyList.value.length === 0 && historyLoadStatus.value === "noMore" ? {
        L: common_vendor.p({
          type: "info-filled",
          size: "40",
          color: "#ccc"
        })
      } : {
        M: common_vendor.f(historyList.value, (record, index, i0) => {
          return {
            a: "04e670bd-14-" + i0,
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
        N: historyList.value.length > 0
      }, historyList.value.length > 0 ? {
        O: common_vendor.p({
          status: historyLoadStatus.value
        })
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04e670bd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-account/my-account.js.map
