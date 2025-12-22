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
  __name: "my-points",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const historyList = common_vendor.ref([]);
    const historyPageNo = common_vendor.ref(1);
    const historyPageSize = common_vendor.ref(10);
    const historyTotal = common_vendor.ref(0);
    const historyLoadStatus = common_vendor.ref("more");
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
        points: "+100分/次",
        path: "/pages/active/active",
        isTabBar: true
      },
      {
        icon: "chat",
        name: "分享聚会",
        desc: "分享有价值的聚会",
        points: "+80分/次",
        path: "/pages/active/active",
        isTabBar: true
      },
      {
        icon: "shop",
        name: "聚店推荐",
        desc: "推荐优质店铺入驻平台",
        points: "+50分/家",
        path: "/pages/my-shopRecommend/my-shopRecommend"
      },
      {
        icon: "paperplane",
        name: "系统共建",
        desc: "为平台提供有效的建议",
        points: "+10分/条",
        path: "/pages/my-systemSuggestions/my-systemSuggestions"
      },
      {
        icon: "personadd",
        name: "分享名片",
        desc: "分享个人名片卡片",
        points: "+50分/人",
        path: "/packages/my-businessCard/my-businessCard"
      },
      {
        icon: "redo",
        name: "邀请注册",
        desc: "邀请新用户进行注册",
        points: "+50分/人",
        path: "/pages/index/index"
      },
      {
        icon: "star",
        name: "其他贡献",
        desc: "用户在平台的其他贡献",
        points: "+n分",
        path: "/packages/getPoints/getPoints"
      }
    ]);
    const tabBarPaths = ["/pages/active/active", "/pages/home/home"];
    common_vendor.onMounted(() => {
      fetchUserInfo();
      getHistoryList(true);
    });
    common_vendor.onReachBottom(() => {
      getHistoryList();
    });
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get", {
        method: "GET"
      });
      if (!error) {
        userInfo.value = data;
      } else {
        common_vendor.index.__f__("error", "at packages/my-points/my-points.vue:185", "获取用户信息失败:", error);
      }
    };
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
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/experience-record/page", {
        method: "GET",
        data: {
          pageNo: historyPageNo.value,
          pageSize: historyPageSize.value
        }
      });
      if (error) {
        historyLoadStatus.value = "more";
        common_vendor.index.showToast({
          title: `历史记录加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      if (data && data.list && data.list.length > 0) {
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
    const handleTaskClick = (task) => {
      if (!task.path) {
        common_vendor.index.showToast({
          title: "敬请期待该任务上线",
          icon: "none"
        });
        return;
      }
      if (task.isTabBar || tabBarPaths.includes(task.path)) {
        common_vendor.index.switchTab({
          url: task.path,
          fail: (err) => {
            common_vendor.index.__f__("error", "at packages/my-points/my-points.vue:248", "switchTab 失败:", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      } else {
        common_vendor.index.navigateTo({
          url: task.path,
          fail: (err) => {
            common_vendor.index.__f__("error", "at packages/my-points/my-points.vue:259", "navigateTo 失败:", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      }
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${Y}-${M}-${D} ${h}:${m}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#FF6B00"
        }),
        c: common_vendor.t(userInfo.value.currExperience),
        d: common_vendor.f(tasks.value, (task, index, i0) => {
          return {
            a: "0c26d269-1-" + i0,
            b: common_vendor.p({
              type: task.icon,
              size: "24",
              color: "#FF6B00"
            }),
            c: common_vendor.t(task.name),
            d: common_vendor.t(task.desc),
            e: common_vendor.t(task.points),
            f: "0c26d269-2-" + i0,
            g: index,
            h: common_vendor.o(($event) => handleTaskClick(task), index)
          };
        }),
        e: common_vendor.p({
          type: "forward",
          size: "20",
          color: "#FF6B00"
        }),
        f: common_vendor.p({
          type: "bars",
          size: "24",
          color: "#FF6B00"
        }),
        g: historyList.value.length === 0 && historyLoadStatus.value === "noMore"
      }, historyList.value.length === 0 && historyLoadStatus.value === "noMore" ? {
        h: common_vendor.p({
          type: "info-filled",
          size: "40",
          color: "#ccc"
        })
      } : {
        i: common_vendor.f(historyList.value, (record, index, i0) => {
          return {
            a: "0c26d269-5-" + i0,
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
        j: historyList.value.length > 0 || historyLoadStatus.value === "loading"
      }, historyList.value.length > 0 || historyLoadStatus.value === "loading" ? {
        k: common_vendor.p({
          status: historyLoadStatus.value,
          contentText: {
            contentdown: "上拉显示更多",
            contentrefresh: "正在加载...",
            contentnomore: "—— 我是有底线的 ——"
          }
        })
      } : {}) : {
        l: common_vendor.p({
          status: "loading"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0c26d269"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-points/my-points.js.map
