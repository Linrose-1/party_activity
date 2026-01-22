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
    const recentRecords = common_vendor.ref([]);
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
      fetchRecentRecords();
    });
    const fetchUserInfo = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/get");
      if (!error)
        userInfo.value = data;
    };
    const fetchRecentRecords = async () => {
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/experience-record/my-experience-list", {
        data: {
          pageNo: 1,
          pageSize: 5
        }
      });
      if (!error && data) {
        recentRecords.value = data.list;
      }
    };
    const formatDate = (ts) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const goToAllRecords = () => {
      common_vendor.index.navigateTo({
        url: "/packages/experience-records/experience-records"
      });
    };
    const handleTaskClick = (task) => {
      if (!task.path)
        return;
      if (task.isTabBar || tabBarPaths.includes(task.path)) {
        common_vendor.index.switchTab({
          url: task.path
        });
      } else {
        common_vendor.index.navigateTo({
          url: task.path
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "medal-filled",
          size: "22",
          color: "#FF6B00"
        }),
        c: common_vendor.t(userInfo.value.currExperience || 0),
        d: common_vendor.t(userInfo.value.totalExperience || 0),
        e: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF6B00"
        }),
        f: common_vendor.p({
          type: "info",
          size: "14",
          color: "#FF6B00"
        }),
        g: common_vendor.f(tasks.value, (task, index, i0) => {
          return {
            a: "0c26d269-3-" + i0,
            b: common_vendor.p({
              type: task.icon,
              size: "24",
              color: "#FF6B00"
            }),
            c: common_vendor.t(task.name),
            d: common_vendor.t(task.points),
            e: common_vendor.t(task.desc),
            f: "0c26d269-4-" + i0,
            g: index,
            h: common_vendor.o(($event) => handleTaskClick(task), index)
          };
        }),
        h: common_vendor.p({
          type: "right",
          size: "14",
          color: "#DDD"
        }),
        i: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        j: common_vendor.o(goToAllRecords),
        k: recentRecords.value.length > 0
      }, recentRecords.value.length > 0 ? {
        l: common_vendor.f(recentRecords.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(formatDate(item.createTime)),
            c: common_vendor.t(item.experience > 0 ? "+" : ""),
            d: common_vendor.t(item.experience),
            e: item.experience > 0 ? 1 : "",
            f: index
          };
        })
      } : {}) : {
        m: common_vendor.p({
          status: "loading"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0c26d269"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-points/my-points.js.map
