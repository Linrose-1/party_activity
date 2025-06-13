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
const pointsPerSmartRice = 10;
const maxPoints = 1e3;
const _sfc_main = {
  __name: "my-account",
  setup(__props) {
    const points = common_vendor.ref(2166);
    common_vendor.ref(
      "青铜"
    );
    const smartRice = common_vendor.ref(150);
    const tasks = common_vendor.ref([
      {
        icon: "calendar",
        name: "参与活动",
        desc: "参加平台组织的线上/线下活动",
        points: "+5分/次"
      },
      {
        icon: "flag",
        name: "组织活动",
        desc: "成功组织并举办一次活动",
        points: "+30分/次"
      },
      {
        icon: "sound",
        name: "分享商机",
        desc: "分享有价值的商业机会",
        points: "+10分/次"
      },
      {
        icon: "personadd",
        name: "邀请好友",
        desc: "成功邀请好友注册并认证",
        points: "+20分/人"
      },
      {
        icon: "chat",
        name: "每日签到",
        desc: "每日登录并签到",
        points: "+1分/天"
      },
      {
        icon: "star",
        name: "完善资料",
        desc: "完善个人和企业资料",
        points: "+50分"
      }
    ]);
    const historyRecords = common_vendor.ref([
      {
        icon: "calendar",
        task: "参与线上营销活动",
        date: "2023-10-15 14:30",
        points: "+5"
      },
      {
        icon: "sound",
        task: "分享商机：供应链合作",
        date: "2023-10-14 10:15",
        points: "+10"
      },
      {
        icon: "personadd",
        task: "邀请好友：张先生",
        date: "2023-10-12 16:45",
        points: "+20"
      },
      {
        icon: "chat",
        task: "每日签到",
        date: "2023-10-12 09:02",
        points: "+1"
      },
      {
        icon: "calendar",
        task: "参与产品发布会",
        date: "2023-10-10 13:20",
        points: "+5"
      },
      {
        icon: "star",
        task: "完善企业资料",
        date: "2023-10-08 11:30",
        points: "+50"
      }
    ]);
    const pointsToNextLevel = common_vendor.computed(() => {
      if (points.value < 100)
        return 100 - points.value;
      if (points.value < 500)
        return 500 - points.value;
      if (points.value < 1e3)
        return 1e3 - points.value;
      return 0;
    });
    const progressWidth = common_vendor.computed(() => {
      const cappedPoints = Math.min(Math.max(points.value, 0), maxPoints);
      return cappedPoints / maxPoints * 100 + "%";
    });
    const bronzeBadgeRef = common_vendor.ref(null);
    const handleTaskClick = (taskName, event) => {
      common_vendor.index.showToast({
        title: `点击了任务：${taskName}`,
        icon: "none"
      });
      const card = event.currentTarget.closest(".task-card");
      if (card) {
        card.style.transform = "scale(0.98)";
        card.style.boxShadow = "0 8rpx 20rpx rgba(255, 107, 0, 0.2)";
        setTimeout(() => {
          card.style.transform = "";
          card.style.boxShadow = "";
        }, 200);
      }
    };
    const handleHistoryClick = (event) => {
      const item = event.currentTarget;
      if (item) {
        item.style.backgroundColor = "#fff9f0";
        setTimeout(() => {
          item.style.backgroundColor = "";
        }, 300);
      }
    };
    const handleExchangeSmartRice = () => {
      common_vendor.index.showModal({
        title: "兑换智米",
        content: `兑换比例为 ${pointsPerSmartRice} 贡分 = 1 智米。请联系平台客服进行兑换操作。`,
        showCancel: false,
        confirmText: "联系客服",
        success: (res) => {
          if (res.confirm) {
            contactCustomerService();
          }
        }
      });
    };
    const handleRechargeSmartRice = () => {
      common_vendor.index.showModal({
        title: "充值智米",
        content: "如需充值智米，请联系平台客服获取充值方式。",
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
      common_vendor.index.showToast({
        title: "正在为您跳转客服联系方式...",
        icon: "none",
        duration: 2e3
      });
      common_vendor.index.__f__("log", "at pages/my-account/my-account.vue:374", "用户点击了联系客服");
    };
    common_vendor.onMounted(() => {
      if (bronzeBadgeRef.value) {
        setInterval(() => {
          bronzeBadgeRef.value.classList.toggle("pulse");
        }, 5e3);
      }
    });
    if (typeof common_vendor.index === "undefined") {
      window.uni = {
        showToast: (options) => {
          common_vendor.index.__f__("log", "at pages/my-account/my-account.vue:391", "Mock uni.showToast:", options.title);
        },
        showModal: (options) => {
          common_vendor.index.__f__("log", "at pages/my-account/my-account.vue:395", "Mock uni.showModal:", options.title, options.content);
          if (confirm(`${options.title}
${options.content}`)) {
            options.success && options.success({
              confirm: true
            });
          } else {
            options.success && options.success({
              cancel: true
            });
          }
        }
        // Add other uni methods if used, e.g., uni.navigateBack
      };
    }
    const inviter = common_vendor.ref({
      name: "张经理",
      level: "黄金会员",
      inviteDate: "2023-09-15",
      avatar: ""
      // 如果有真实头像URL可以放在这里
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "personadd",
          size: "24",
          color: "#FF6B00"
        }),
        b: inviter.value
      }, inviter.value ? {
        c: common_vendor.t(inviter.value.name.charAt(0)),
        d: common_vendor.t(inviter.value.name),
        e: common_vendor.t(inviter.value.level),
        f: common_vendor.t(inviter.value.inviteDate)
      } : {
        g: common_vendor.p({
          type: "info",
          size: "24",
          color: "#999"
        })
      }, {
        h: common_vendor.p({
          type: "medal",
          size: "24",
          color: "#FF6B00"
        }),
        i: common_vendor.t(points.value),
        j: common_vendor.t(pointsToNextLevel.value),
        k: common_vendor.t(maxPoints),
        l: progressWidth.value,
        m: common_vendor.p({
          type: "person",
          size: "20",
          color: "#fff"
        }),
        n: common_vendor.p({
          type: "shield",
          size: "20",
          color: "#fff"
        }),
        o: common_vendor.p({
          type: "medal",
          size: "20",
          color: "#fff"
        }),
        p: common_vendor.p({
          type: "crown",
          size: "20",
          color: "#fff"
        }),
        q: common_vendor.p({
          type: "wallet",
          size: "24",
          color: "#FF6B00"
        }),
        r: common_vendor.t(smartRice.value),
        s: common_vendor.t(pointsPerSmartRice),
        t: common_vendor.p({
          type: "forward",
          size: "20",
          color: "#fff"
        }),
        v: common_vendor.o(handleExchangeSmartRice),
        w: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#fff"
        }),
        x: common_vendor.o(handleRechargeSmartRice),
        y: common_vendor.p({
          type: "info-filled",
          size: "18",
          color: "#FF6B00"
        }),
        z: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#FF6B00"
        }),
        A: common_vendor.t(points.value),
        B: common_vendor.f(tasks.value, (task, index, i0) => {
          return {
            a: "04e670bd-12-" + i0,
            b: common_vendor.p({
              type: task.icon,
              size: "24",
              color: "#FF6B00"
            }),
            c: common_vendor.t(task.name),
            d: common_vendor.t(task.desc),
            e: common_vendor.t(task.points),
            f: "04e670bd-13-" + i0,
            g: common_vendor.o(($event) => handleTaskClick(task.name, $event), index),
            h: index
          };
        }),
        C: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#fff"
        }),
        D: common_vendor.p({
          type: "bars",
          size: "24",
          color: "#FF6B00"
        }),
        E: common_vendor.f(historyRecords.value, (record, index, i0) => {
          return {
            a: "04e670bd-15-" + i0,
            b: common_vendor.p({
              type: record.icon,
              size: "20",
              color: "#FF6B00"
            }),
            c: common_vendor.t(record.task),
            d: common_vendor.t(record.date),
            e: common_vendor.t(record.points),
            f: index,
            g: common_vendor.o(($event) => handleHistoryClick($event), index)
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04e670bd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-account/my-account.js.map
