"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "my-memberDetails",
  setup(__props) {
    const membershipLevels = common_vendor.ref([]);
    const currentTab = common_vendor.ref(0);
    const screenWidth = common_vendor.index.getSystemInfoSync().windowWidth;
    const imageHeights = common_vendor.ref([]);
    const initialTargetLevel = common_vendor.ref(null);
    const currentSwiperHeight = common_vendor.computed(() => {
      const height = imageHeights.value[currentTab.value];
      if (height) {
        return `${height}px`;
      }
      return "300px";
    });
    common_vendor.onLoad((options) => {
      if (options && options.level) {
        initialTargetLevel.value = Number(options.level);
      }
    });
    common_vendor.onMounted(() => {
      fetchMembershipLevels();
    });
    const fetchMembershipLevels = async () => {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/top-up-level/list");
      common_vendor.index.hideLoading();
      if (error) {
        common_vendor.index.showToast({
          title: `加载失败: ${error}`,
          icon: "none"
        });
        return;
      }
      if (data && data.length > 0) {
        membershipLevels.value = data.sort((a, b) => a.level - b.level);
        if (initialTargetLevel.value !== null) {
          const targetIndex = membershipLevels.value.findIndex((item) => item.level === initialTargetLevel.value);
          if (targetIndex !== -1) {
            currentTab.value = targetIndex;
          }
        }
      }
    };
    const switchTab = (index) => {
      if (currentTab.value !== index) {
        currentTab.value = index;
      }
    };
    const onSwiperChange = (e) => {
      currentTab.value = e.detail.current;
    };
    const onImageLoad = (e, index) => {
      const originalWidth = e.detail.width;
      const originalHeight = e.detail.height;
      const imagePaddingInPx = 80 * (screenWidth / 750);
      const imageDisplayWidth = screenWidth - imagePaddingInPx;
      const imageDisplayHeight = imageDisplayWidth / originalWidth * originalHeight;
      imageHeights.value[index] = imageDisplayHeight;
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(membershipLevels.value, (level, index, i0) => {
          return {
            a: common_vendor.t(level.name.replace("会员", "")),
            b: level.level,
            c: currentTab.value === index ? 1 : "",
            d: common_vendor.o(($event) => switchTab(index), level.level)
          };
        }),
        b: common_vendor.f(membershipLevels.value, (level, index, i0) => {
          return {
            a: level.backgroundUrl,
            b: common_vendor.o(($event) => onImageLoad($event, index), level.level),
            c: level.level
          };
        }),
        c: currentTab.value,
        d: currentSwiperHeight.value,
        e: common_vendor.o(onSwiperChange)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-abc533c5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-memberDetails/my-memberDetails.js.map
