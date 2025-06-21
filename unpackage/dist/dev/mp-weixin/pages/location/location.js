"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_segmented_control2 + _easycom_uni_icons2)();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_icons + ActivityCard)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const _sfc_main = {
  __name: "location",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabItems = ["活动", "商友"];
    const shaken = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const shakeDebounce = common_vendor.ref(true);
    const activities = common_vendor.ref([]);
    const businesses = common_vendor.ref([]);
    const handleTabClick = (e) => {
      currentTab.value = e.currentIndex;
    };
    const startShake = () => {
      triggerShakeSequence();
    };
    const triggerShakeSequence = () => {
      if (!shakeDebounce.value)
        return;
      shakeDebounce.value = false;
      getLocationAndProceed();
    };
    const getLocationAndProceed = () => {
      common_vendor.index.getLocation({
        type: "gcj02",
        // 推荐使用 gcj02，兼容性更好
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/location/location.vue:126", "✅ 获取用户位置成功:");
          common_vendor.index.__f__("log", "at pages/location/location.vue:127", `   - 纬度: ${res.latitude}`);
          common_vendor.index.__f__("log", "at pages/location/location.vue:128", `   - 经度: ${res.longitude}`);
          executeShakeActions();
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/location/location.vue:134", "❌ 获取位置失败:", err);
          if (err.errMsg && (err.errMsg.includes("auth deny") || err.errMsg.includes("auth denied"))) {
            common_vendor.index.showModal({
              title: "需要位置权限",
              content: "我们需要您的位置信息来发现附近的活动和商友，请在设置中打开位置权限。",
              confirmText: "去设置",
              showCancel: true,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  common_vendor.index.openSetting();
                }
              }
            });
          } else {
            common_vendor.index.showToast({
              title: "获取位置失败，请检查系统定位服务是否开启",
              icon: "none"
            });
          }
          shakeDebounce.value = true;
        }
      });
    };
    const executeShakeActions = () => {
      loading.value = true;
      shaken.value = true;
      common_vendor.index.vibrateShort();
      setTimeout(() => {
        loadMockData();
        loading.value = false;
        setTimeout(() => {
          shakeDebounce.value = true;
        }, 1e3);
      }, 1500);
    };
    const loadMockData = () => {
      activities.value = [
        {
          id: 1,
          title: "互联网创业者交流会",
          image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          date: "今天 14:00-16:00",
          location: "创业咖啡厅",
          participants: { current: 32, total: 50 },
          // 修改为对象
          tags: ["创业", "交流会"],
          organizer: "创业咖啡厅"
          // 补充组织者信息
        },
        {
          id: 2,
          title: "2025金融科技峰会",
          image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          date: "明天 09:00-17:00",
          location: "国际会议中心",
          participants: { current: 180, total: 200 },
          tags: ["金融", "科技"],
          organizer: "金融时报"
        }
      ];
      businesses.value = [
        {
          id: 1,
          name: "张明",
          position: "产品总监",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          firms: "创新科技有限公司",
          distance: "120米"
        },
        {
          id: 2,
          name: "李华",
          position: "技术主管",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          firms: "创新科技有限公司",
          distance: "560米"
        }
      ];
    };
    const handleFavorite = (isFavorite) => {
      common_vendor.index.__f__("log", "at pages/location/location.vue:233", "收藏状态改变:", isFavorite);
      common_vendor.index.showToast({
        title: isFavorite ? "收藏成功" : "取消收藏",
        icon: "none"
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.onAccelerometerChange((res) => {
        if (Math.abs(res.x) > 1.5 && Math.abs(res.y) > 1.5) {
          triggerShakeSequence();
        }
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.stopAccelerometer();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleTabClick),
        b: common_vendor.p({
          current: currentTab.value,
          values: tabItems,
          ["style-type"]: "button",
          ["active-color"]: "#FF6B00"
        }),
        c: !shaken.value
      }, !shaken.value ? {
        d: common_vendor.p({
          type: "hand-up",
          size: "60",
          color: "#FFFFFF"
        }),
        e: common_vendor.o(startShake)
      } : loading.value ? {} : {
        g: common_vendor.p({
          type: "calendar-filled",
          size: "20",
          color: "#FF6B00"
        }),
        h: common_vendor.f(activities.value, (activity, k0, i0) => {
          return {
            a: activity.id,
            b: common_vendor.o(handleFavorite, activity.id),
            c: "4d9b4fcb-3-" + i0,
            d: common_vendor.p({
              activity
            })
          };
        }),
        i: currentTab.value === 0,
        j: common_vendor.p({
          type: "staff-filled",
          size: "20",
          color: "#FF6B00"
        }),
        k: common_vendor.f(businesses.value, (business, k0, i0) => {
          return {
            a: business.avatar,
            b: common_vendor.t(business.name),
            c: common_vendor.t(business.distance),
            d: common_vendor.t(business.position),
            e: common_vendor.t(business.firms),
            f: business.id
          };
        }),
        l: currentTab.value === 1
      }, {
        f: loading.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4d9b4fcb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/location/location.js.map
