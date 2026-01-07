"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "my-memberDetails",
  setup(__props) {
    const membershipLevels = common_vendor.ref([]);
    const currentTab = common_vendor.ref(0);
    const initialTargetLevel = common_vendor.ref(null);
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
          title: error,
          icon: "none"
        });
        return;
      }
      if (data && data.length > 0) {
        const sortedData = data.sort((a, b) => a.level - b.level);
        membershipLevels.value = sortedData.map((item) => {
          let parsedContent = [];
          parsedContent.push("可使用智米消耗平台服务与产品");
          try {
            if (item.content) {
              const rights = JSON.parse(item.content);
              if (rights.business !== void 0) {
                parsedContent.push(`可进行商机发布 ${rights.business}次/月`);
              }
              if (rights.partnerBusiness !== void 0) {
                parsedContent.push(`可进行猎伙发布 ${rights.partnerBusiness}次/月`);
              }
              if (rights.activity !== void 0) {
                parsedContent.push(`可进行聚会发布 ${rights.activity}次/月`);
              }
              if (rights.shareUserCard !== void 0) {
                const shareCount = rights.shareUserCard >= 999999 ? "无限制" : `${rights.shareUserCard}次`;
                parsedContent.push(`可名片分享 ${shareCount}/月`);
              }
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/my-memberDetails/my-memberDetails.vue:169", "解析权益 JSON 失败", e);
          }
          parsedContent.push("可使用贡分参与平台权益的二次分配，获得智米");
          const themeColor = getThemeColor(item.level);
          return {
            ...item,
            parsedContent,
            // 这里已经是生成的文案数组了，模板直接循环即可
            themeColor,
            shortName: item.name.replace("会员", "")
          };
        });
        if (initialTargetLevel.value !== null) {
          const targetIndex = membershipLevels.value.findIndex((item) => item.level === initialTargetLevel.value);
          if (targetIndex !== -1) {
            currentTab.value = targetIndex;
          }
        }
      }
    };
    const switchTab = (index) => {
      currentTab.value = index;
    };
    const onSwiperChange = (e) => {
      currentTab.value = e.detail.current;
    };
    const formatPrice = (price) => {
      return price == 0 ? "免费" : `¥${price}`;
    };
    const getThemeColor = (level) => {
      switch (Number(level)) {
        case 1:
          return "#5F6C7B";
        case 2:
          return "#CD7F32";
        case 3:
          return "#7F9eb2";
        case 4:
          return "#E6A23C";
        case 5:
          return "#333333";
        default:
          return "#333";
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(membershipLevels.value, (level, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(level.shortName),
            b: currentTab.value === index ? 1 : "",
            c: currentTab.value === index
          }, currentTab.value === index ? {} : {}, {
            d: level.level,
            e: common_vendor.o(($event) => switchTab(index), level.level)
          });
        }),
        b: common_vendor.f(membershipLevels.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.icon
          }, item.icon ? {
            b: item.icon
          } : {}, {
            c: common_vendor.t(item.name),
            d: common_vendor.t(formatPrice(item.price)),
            e: common_vendor.t(item.duration),
            f: common_vendor.t(item.zhimiNum),
            g: common_vendor.t(item.gongfenNum),
            h: common_vendor.f(item.parsedContent, (benefit, bIndex, i1) => {
              return {
                a: "abc533c5-0-" + i0 + "-" + i1,
                b: common_vendor.t(benefit),
                c: bIndex
              };
            }),
            i: !item.parsedContent || item.parsedContent.length === 0
          }, !item.parsedContent || item.parsedContent.length === 0 ? {} : {}, {
            j: common_vendor.n("theme-level-" + item.level),
            k: item.level
          });
        }),
        c: common_vendor.p({
          type: "checkmarkempty",
          size: "16",
          color: "#07c160"
        }),
        d: currentTab.value,
        e: common_vendor.o(onSwiperChange)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-abc533c5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-memberDetails/my-memberDetails.js.map
