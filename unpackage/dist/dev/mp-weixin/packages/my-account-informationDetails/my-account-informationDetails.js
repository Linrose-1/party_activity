"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + MyRadarChart)();
}
const MyRadarChart = () => "../../components/MyRadarChart.js";
const themeColor = "#FF7D00";
const _sfc_main = {
  __name: "my-account-informationDetails",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const radarCategories = common_vendor.ref(["基础信用", "协助态度", "专业能力", "精神格局"]);
    const radarSeriesData = common_vendor.ref([]);
    common_vendor.onLoad(async (options) => {
      const userId = options.id;
      if (!userId) {
        common_vendor.index.showToast({ title: "参数错误", icon: "none" });
        return common_vendor.index.navigateBack();
      }
      common_vendor.index.showLoading({ title: "正在加载..." });
      try {
        const userRes = await utils_request.request("/app-api/member/user/get", { method: "GET", data: { id: userId } });
        if (userRes.error || !userRes.data)
          throw new Error("获取用户信息失败");
        userInfo.value = userRes.data;
        common_vendor.index.setNavigationBarTitle({ title: `${userRes.data.nickname || "用户"}的详情` });
        await fetchScoreStatistics(userId);
      } catch (e) {
        common_vendor.index.showToast({ title: e.message, icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    });
    const fetchScoreStatistics = async (userId) => {
      try {
        const { data, error } = await utils_request.request("/app-api/member/user-scores/complexStatistics", {
          method: "GET",
          data: { userId, type: 0 }
        });
        if (error) {
          throw new Error("获取评分数据失败");
        }
        radarSeriesData.value = [
          (data == null ? void 0 : data.avg1) || 0,
          (data == null ? void 0 : data.avg2) || 0,
          (data == null ? void 0 : data.avg3) || 0,
          (data == null ? void 0 : data.avg4) || 0
        ];
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-account-informationDetails/my-account-informationDetails.vue:177", e.message);
        radarSeriesData.value = [0, 0, 0, 0];
      }
    };
    const formatSex = (sex) => {
      if (sex === 1)
        return "男";
      if (sex === 2)
        return "女";
      return "未设置";
    };
    const formatBirthday = (timestamp) => {
      if (!timestamp) {
        return "未填写";
      }
      try {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-account-informationDetails/my-account-informationDetails.vue:208", "无效的生日时间戳:", timestamp, e);
        return "日期无效";
      }
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({ urls: [url] });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? common_vendor.e({
        b: common_vendor.p({
          type: "person-filled",
          size: "24",
          color: themeColor
        }),
        c: userInfo.value.avatar || "/static/default-avatar.png",
        d: common_vendor.t(userInfo.value.nickname || "未填写"),
        e: common_vendor.t(userInfo.value.realName || "未填写"),
        f: common_vendor.t(formatSex(userInfo.value.sex)),
        g: common_vendor.t(formatBirthday(userInfo.value.birthday)),
        h: common_vendor.t(userInfo.value.locationAddressStr || "未填写"),
        i: common_vendor.t(userInfo.value.birthplaceStr || "未填写"),
        j: common_vendor.t(userInfo.value.nativePlaceStr || "未填写"),
        k: common_vendor.p({
          type: "flag-filled",
          size: "24",
          color: themeColor
        }),
        l: common_vendor.t(userInfo.value.industryName || "未填写"),
        m: common_vendor.t(userInfo.value.professionalTitle || "未填写"),
        n: common_vendor.t(userInfo.value.companyName || "未填写"),
        o: common_vendor.t(userInfo.value.school || "未填写"),
        p: common_vendor.t(userInfo.value.contactEmail || "未填写"),
        q: common_vendor.t(userInfo.value.hobby || "未填写"),
        r: common_vendor.t(userInfo.value.personalBio || "这位朋友很酷，什么也没留下。"),
        s: userInfo.value.wechatQrCodeUrl
      }, userInfo.value.wechatQrCodeUrl ? {
        t: userInfo.value.wechatQrCodeUrl,
        v: common_vendor.o(($event) => previewImage(userInfo.value.wechatQrCodeUrl))
      } : {}, {
        w: common_vendor.p({
          type: "map-filled",
          size: "24",
          color: themeColor
        }),
        x: radarSeriesData.value.length > 0
      }, radarSeriesData.value.length > 0 ? {
        y: common_vendor.p({
          categories: radarCategories.value,
          ["series-data"]: radarSeriesData.value,
          ["theme-color"]: themeColor
        })
      } : {}, {
        z: radarSeriesData.value.length > 0
      }, radarSeriesData.value.length > 0 ? {
        A: common_vendor.f(radarCategories.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: common_vendor.t(radarSeriesData.value[index]),
            c: index
          };
        }),
        B: themeColor
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-991800d7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-account-informationDetails/my-account-informationDetails.js.map
