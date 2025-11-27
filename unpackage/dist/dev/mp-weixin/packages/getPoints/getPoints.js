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
            points: 50,
            dailyLimit: "10次/天",
            path: "/pages/my-businessCard/my-businessCard"
          },
          {
            name: "分享聚会奖励",
            points: 80,
            dailyLimit: "3次/天",
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "分享商机奖励",
            points: 50,
            dailyLimit: "5次/天",
            path: "/pages/home/home",
            isTabBar: true
          }
          // {
          // 	name: '关注用户',
          // 	points: 5,
          // 	dailyLimit: 100,
          // 	path: '/pages/home/home',
          // 	isTabBar: true
          // },
        ]
      },
      {
        title: "内容贡献",
        icon: "compose",
        tasks: [
          {
            name: "成功发布评论",
            points: 15,
            dailyLimit: "10次/天",
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "成功推荐门店",
            points: 50,
            dailyLimit: "5次/天",
            path: "/pages/shop-recommend/shop-recommend"
          },
          {
            name: "成功申请入驻",
            points: 100,
            dailyLimit: "不限",
            path: null
          },
          {
            name: "完成完整的数字身份编辑",
            points: 120,
            dailyLimit: "1次",
            path: "/packages/my-edit/my-edit"
          },
          {
            name: "数字身份更新",
            points: 30,
            dailyLimit: "1次/天",
            path: "/packages/my-edit/my-edit"
          }
        ]
      },
      {
        title: "核心参与",
        icon: "paperplane-filled",
        tasks: [
          {
            name: "参加聚会",
            points: 100,
            dailyLimit: "5次/天",
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "阅读聚会详情",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "阅读商机详情",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "阅览聚店详情",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/shop/shop",
            isTabBar: true
          },
          {
            name: "收藏聚会",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "收藏商机",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "赞踩商机",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/home/home",
            isTabBar: true
          },
          {
            name: "匿名举报或建议商机",
            points: 20,
            dailyLimit: "5次/天",
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "赞踩聚会",
            points: 10,
            dailyLimit: "5次/天",
            path: "/pages/active/active",
            isTabBar: true
          },
          {
            name: "举报聚会",
            points: 20,
            dailyLimit: "5次/天",
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
            points: 20,
            dailyLimit: "5次/天",
            path: null
          },
          // 假设这个没有直接跳转入口
          {
            name: "用户参加活动让利",
            points: 80,
            dailyLimit: "5次/天",
            path: null
          },
          {
            name: "用户参加活动平台让利",
            points: 80,
            dailyLimit: "5次/天",
            path: null
          },
          {
            name: "店铺因活动成功举办获得贡分",
            points: 100,
            dailyLimit: "5次/天",
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
