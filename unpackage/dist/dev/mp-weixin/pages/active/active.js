"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_collapse_item2 = common_vendor.resolveComponent("uni-collapse-item");
  const _easycom_uni_collapse2 = common_vendor.resolveComponent("uni-collapse");
  (_easycom_uni_icons2 + _easycom_uni_collapse_item2 + _easycom_uni_collapse2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_collapse_item = () => "../../uni_modules/uni-collapse/components/uni-collapse-item/uni-collapse-item.js";
const _easycom_uni_collapse = () => "../../uni_modules/uni-collapse/components/uni-collapse/uni-collapse.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_collapse_item + _easycom_uni_collapse + ActivityCard)();
}
const ActivityCard = () => "../../components/ActivityCard.js";
const _sfc_main = {
  __name: "active",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const activeCategory = common_vendor.ref("全部类型");
    const getDate = (type) => {
      const date2 = /* @__PURE__ */ new Date();
      let year = date2.getFullYear();
      let month = date2.getMonth() + 1;
      let day = date2.getDate();
      if (type === "start") {
        year = year - 10;
      } else if (type === "end") {
        year = year + 10;
      }
      month = month > 9 ? month : "0" + month;
      day = day > 9 ? day : "0" + day;
      return `${year}-${month}-${day}`;
    };
    common_vendor.ref("picker");
    const array = common_vendor.ref(["全部类型", "交流会", "沙龙", "峰会", "分享会", "其他"]);
    const index = common_vendor.ref(0);
    const date = common_vendor.ref(getDate({
      format: true
    }));
    const startDate = common_vendor.computed(() => getDate("start"));
    const endDate = common_vendor.computed(() => getDate("end"));
    const bindPickerChange = (e) => {
      common_vendor.index.__f__("log", "at pages/active/active.vue:124", "picker发送选择改变，携带值为", e.detail.value);
      index.value = e.detail.value;
    };
    const bindDateChange = (e) => {
      date.value = e.detail.value;
    };
    const selectedLocationInfo = common_vendor.ref(null);
    const openMapToChooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/active/active.vue:136", "选择位置成功:", res);
          selectedLocationInfo.value = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/active/active.vue:145", "选择位置失败:", err);
          if (err.errMsg.includes("cancel"))
            ;
          else {
            common_vendor.index.showToast({
              title: "选择位置失败",
              icon: "none"
            });
          }
        }
      });
    };
    const activitiesData = common_vendor.ref([
      {
        id: 1,
        title: "互联网创业者交流会",
        image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "2025-05-28 14:00-16:00",
        location: "上海市浦东新区张江高科技园区",
        participants: {
          current: 32,
          total: 50
        },
        tags: ["交流会", "线下活动"],
        organizer: "张经理"
      },
      {
        id: 2,
        title: "2025金融科技峰会",
        image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "2025-06-15 09:00-17:00",
        location: "上海国际会议中心",
        participants: {
          current: 180,
          total: 200
        },
        tags: ["峰会", "线下活动"],
        organizer: "李主管"
      },
      {
        id: 3,
        title: "AI技术分享会",
        image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "2025-06-05 19:00-21:00",
        location: "北京市海淀区中关村创业大街",
        participants: {
          current: 45,
          total: 60
        },
        tags: ["分享会", "线下活动"],
        organizer: "王教授"
      },
      {
        id: 4,
        title: "当代艺术沙龙",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "2025-06-10 15:00-17:00",
        location: "广州市天河区艺术中心",
        participants: {
          current: 28,
          total: 40
        },
        tags: ["沙龙", "线下活动", "其他"],
        organizer: "陈馆长"
      }
    ]);
    const filteredActivities = common_vendor.computed(() => {
      let result = [...activitiesData.value];
      if (activeCategory.value !== "全部类型") {
        result = result.filter(
          (activity) => activity.tags.includes(activeCategory.value)
        );
      }
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(
          (activity) => activity.title.toLowerCase().includes(keyword) || activity.location.toLowerCase().includes(keyword)
        );
      }
      return result;
    });
    const publishActivity = () => {
      common_vendor.index.navigateTo({
        url: "/pages/active-publish/active-publish"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "rgba(255, 255, 255, 0.7)"
        }),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.t(array.value[index.value]),
        e: common_vendor.o(bindPickerChange),
        f: index.value,
        g: array.value,
        h: common_vendor.t(date.value),
        i: date.value,
        j: startDate.value,
        k: endDate.value,
        l: common_vendor.o(bindDateChange),
        m: selectedLocationInfo.value
      }, selectedLocationInfo.value ? {
        n: common_vendor.t(selectedLocationInfo.value.address || selectedLocationInfo.value.name)
      } : {}, {
        o: common_vendor.o(openMapToChooseLocation),
        p: common_vendor.p({
          title: "活动筛选",
          open: true
        }),
        q: common_vendor.f(filteredActivities.value, (activity, index2, i0) => {
          return {
            a: index2,
            b: "12e513cf-3-" + i0,
            c: common_vendor.p({
              activity
            })
          };
        }),
        r: filteredActivities.value.length > 0
      }, filteredActivities.value.length > 0 ? {} : {}, {
        s: common_vendor.p({
          type: "plus",
          size: "18",
          color: "white"
        }),
        t: common_vendor.o(publishActivity)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12e513cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/active/active.js.map
