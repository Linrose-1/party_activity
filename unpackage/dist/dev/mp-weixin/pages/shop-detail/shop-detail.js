"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "shop-detail",
  setup(__props) {
    common_vendor.ref([
      {
        id: 1,
        name: "蓝色夏威夷",
        desc: "经典热带鸡尾酒，混合朗姆酒和蓝柑橘酒",
        price: "68"
      },
      {
        id: 2,
        name: "威士忌酸",
        desc: "波本威士忌搭配柠檬汁和糖浆",
        price: "78"
      },
      {
        id: 3,
        name: "精酿啤酒套餐",
        desc: "三款特色精酿啤酒组合",
        price: "128"
      },
      {
        id: 4,
        name: "爵士之夜套餐",
        desc: "鸡尾酒两杯+小食拼盘",
        price: "198"
      }
    ]);
    const openMap = () => {
      common_vendor.index.openLocation({
        latitude: 39.908823,
        // 纬度
        longitude: 116.39747,
        // 经度
        name: "蓝调酒吧",
        // 地点名称
        address: "朝阳区三里屯路18号院2号楼1层101",
        // 详细地址
        success: function() {
          common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:167", "打开地图成功");
        },
        fail: function(err) {
          common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:170", "打开地图失败:", err);
          common_vendor.index.showToast({ title: "无法打开地图", icon: "none" });
        }
      });
    };
    const openNavigation = () => {
      common_vendor.index.openLocation({
        latitude: 39.908823,
        longitude: 116.39747,
        name: "蓝调酒吧",
        address: "朝阳区三里屯路18号院2号楼1层101",
        success: function() {
          common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:184", "打开导航成功");
        },
        fail: function(err) {
          common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:187", "打开导航失败:", err);
          common_vendor.index.showToast({ title: "无法打开导航", icon: "none" });
        }
      });
    };
    const callPhone = () => {
      common_vendor.index.makePhoneCall({
        phoneNumber: "01087654321",
        // 电话号码
        success: function() {
          common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:199", "拨打电话成功");
        },
        fail: function(err) {
          common_vendor.index.__f__("log", "at pages/shop-detail/shop-detail.vue:202", "拨打电话失败:", err);
          common_vendor.index.showToast({ title: "拨打电话失败", icon: "none" });
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(openMap),
        b: common_vendor.o(openNavigation),
        c: common_vendor.o(callPhone)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b8678dae"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop-detail/shop-detail.js.map
