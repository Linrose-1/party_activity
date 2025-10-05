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
  __name: "getPoints",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "67d32381": themeColor.value
    }));
    const themeColor = common_vendor.ref("#FF862D");
    const taskCategories = common_vendor.ref([
      {
        title: "分享与互动",
        icon: "redo-filled",
        tasks: [
          {
            name: "分享名片奖励",
            points: 5,
            dailyLimit: 100,
            path: "/pages/my-businessCard/my-businessCard"
          },
          {
            name: "分享活动奖励",
            points: 5,
            dailyLimit: 100,
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "分享商机奖励",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "关注用户",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          }
        ]
      },
      {
        title: "内容贡献",
        icon: "compose",
        tasks: [
          {
            name: "发布评论",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "推荐门店",
            points: 10,
            dailyLimit: 100,
            path: "/pages/shop-recommend/shop-recommend"
          },
          {
            name: "修改名片获得贡分",
            points: 5,
            dailyLimit: 100,
            path: "/packages/my-edit/my-edit"
          }
        ]
      },
      {
        title: "核心参与",
        icon: "paperplane-filled",
        tasks: [
          {
            name: "报名活动",
            points: 10,
            dailyLimit: 100,
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "阅读活动",
            points: 5,
            dailyLimit: 100,
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "阅读商机",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "阅览门店",
            points: 10,
            dailyLimit: 100,
            path: "/pages/shop/shop",
            isTabBar: true
          },
          {
            name: "收藏活动",
            points: 5,
            dailyLimit: 100,
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "收藏商机",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "点赞商机",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "点踩商机",
            points: 5,
            dailyLimit: 100,
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "点赞活动",
            points: 5,
            dailyLimit: 100,
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "点踩活动",
            points: 5,
            dailyLimit: 100,
            path: "/pages/active/active",
            isTabBar: true
          }
        ]
      },
      {
        title: "消费与特殊奖励",
        icon: "money-filled",
        tasks: [
          {
            name: "支付名片获得贡分",
            points: 10,
            dailyLimit: 100,
            path: null
          },
          // 假设这个没有直接跳转入口
          {
            name: "用户报名活动让利",
            points: 10,
            dailyLimit: 100,
            path: null
          },
          {
            name: "用户报名活动平台让利",
            points: 10,
            dailyLimit: 100,
            path: null
          },
          {
            name: "店铺因活动有报名获得贡分",
            points: 10,
            dailyLimit: 100,
            path: null
          }
        ]
      }
    ]);
    const tabBarPaths = ["/pages/home/home", "/pages/active/active", "/pages/shop/shop", "/pages/my/my"];
    const handleTaskClick = (task) => {
      if (!task.path) {
        common_vendor.index.showToast({
          title: "此奖励为被动获取，无直接入口",
          icon: "none"
        });
        return;
      }
      if (task.isTabBar || tabBarPaths.includes(task.path)) {
        common_vendor.index.switchTab({
          url: task.path,
          fail: (err) => {
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
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(taskCategories.value, (category, k0, i0) => {
          return {
            a: "9bb03283-0-" + i0,
            b: common_vendor.p({
              type: category.icon,
              size: "20",
              color: themeColor.value
            }),
            c: common_vendor.t(category.title),
            d: common_vendor.f(category.tasks, (task, k1, i1) => {
              return {
                a: common_vendor.t(task.name),
                b: common_vendor.t(task.points),
                c: common_vendor.t(task.dailyLimit),
                d: common_vendor.o(($event) => handleTaskClick(task), task.name),
                e: task.name
              };
            }),
            e: category.title
          };
        }),
        b: common_vendor.s(_ctx.__cssVars())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9bb03283"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/getPoints/getPoints.js.map
