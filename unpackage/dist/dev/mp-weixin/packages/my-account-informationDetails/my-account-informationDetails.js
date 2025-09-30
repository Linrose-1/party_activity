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
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        return common_vendor.index.navigateBack();
      }
      common_vendor.index.showLoading({
        title: "正在加载..."
      });
      try {
        const userRes = await utils_request.request("/app-api/member/user/get", {
          method: "GET",
          data: {
            id: userId
          }
        });
        if (userRes.error || !userRes.data)
          throw new Error("获取用户信息失败");
        userInfo.value = userRes.data;
        common_vendor.index.setNavigationBarTitle({
          title: `${userRes.data.nickname || "用户"}的详情`
        });
        await fetchScoreStatistics(userId);
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message,
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    });
    const splitToArray = (str) => {
      if (!str)
        return [];
      return str.split(/[,，\n]/).map((item) => item.trim()).filter((item) => item);
    };
    const formattedCompanies = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      const companies = splitToArray(userInfo.value.companyName);
      const industries = splitToArray(userInfo.value.industry);
      const positions = splitToArray(userInfo.value.positionTitle);
      const maxLength = Math.max(companies.length, industries.length, positions.length);
      if (maxLength === 0)
        return [];
      const result = [];
      for (let i = 0; i < maxLength; i++) {
        result.push({
          name: companies[i] || "",
          industry: industries[i] || "",
          position: positions[i] || ""
        });
      }
      return result;
    });
    const fetchScoreStatistics = async (userId) => {
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user-scores/complexStatistics", {
          method: "GET",
          data: {
            userId,
            type: 0
          }
        });
        if (error)
          throw new Error("获取评分数据失败");
        radarSeriesData.value = [
          (data == null ? void 0 : data.avg1) || 0,
          (data == null ? void 0 : data.avg2) || 0,
          (data == null ? void 0 : data.avg3) || 0,
          (data == null ? void 0 : data.avg4) || 0
        ];
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-account-informationDetails/my-account-informationDetails.vue:285", e.message);
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
    const goToResourceMatch = () => {
      common_vendor.index.__f__("log", "at packages/my-account-informationDetails/my-account-informationDetails.vue:297", "跳转到资源匹配页面");
      common_vendor.index.showToast({
        title: "资源匹配功能即将上线",
        icon: "none"
      });
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url]
      });
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
        g: common_vendor.t(userInfo.value.era || "未填写"),
        h: common_vendor.t(userInfo.value.locationAddressStr || "未填写"),
        i: common_vendor.t(userInfo.value.birthplaceStr || "未填写"),
        j: common_vendor.t(userInfo.value.nativePlaceStr || "未填写"),
        k: common_vendor.p({
          type: "flag-filled",
          size: "24",
          color: themeColor
        }),
        l: common_vendor.f(splitToArray(userInfo.value.professionalTitle), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        m: !userInfo.value.professionalTitle
      }, !userInfo.value.professionalTitle ? {} : {}, {
        n: common_vendor.f(formattedCompanies.value, (company, index, i0) => {
          return {
            a: common_vendor.t(company.name || "公司名称未填写"),
            b: common_vendor.t(company.industry || "行业未填写"),
            c: common_vendor.t(company.position || "职务未填写"),
            d: index
          };
        }),
        o: formattedCompanies.value.length === 0
      }, formattedCompanies.value.length === 0 ? {} : {}, {
        p: common_vendor.f(splitToArray(userInfo.value.school), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        q: !userInfo.value.school
      }, !userInfo.value.school ? {} : {}, {
        r: common_vendor.f(splitToArray(userInfo.value.hobby), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        s: !userInfo.value.hobby
      }, !userInfo.value.hobby ? {} : {}, {
        t: common_vendor.t(userInfo.value.contactEmail || "未填写"),
        v: userInfo.value.wechatQrCodeUrl
      }, userInfo.value.wechatQrCodeUrl ? {
        w: userInfo.value.wechatQrCodeUrl,
        x: common_vendor.o(($event) => previewImage(userInfo.value.wechatQrCodeUrl))
      } : {}, {
        y: common_vendor.p({
          type: "chat-filled",
          size: "24",
          color: themeColor
        }),
        z: common_vendor.p({
          type: "sound",
          size: "20",
          color: "#666"
        }),
        A: common_vendor.t(userInfo.value.signature || "这位朋友很酷，什么也没留下。"),
        B: common_vendor.p({
          type: "sound-filled",
          size: "20",
          color: "#666"
        }),
        C: common_vendor.t(userInfo.value.personalBio || "未填写"),
        D: userInfo.value.haveResources
      }, userInfo.value.haveResources ? {
        E: common_vendor.t(userInfo.value.haveResources)
      } : {}, {
        F: userInfo.value.needResources
      }, userInfo.value.needResources ? {
        G: common_vendor.t(userInfo.value.needResources)
      } : {}, {
        H: common_vendor.p({
          type: "link",
          size: "20",
          color: "#fff"
        }),
        I: common_vendor.o(goToResourceMatch),
        J: common_vendor.p({
          type: "map-filled",
          size: "24",
          color: themeColor
        }),
        K: radarSeriesData.value.length > 0
      }, radarSeriesData.value.length > 0 ? {
        L: common_vendor.p({
          categories: radarCategories.value,
          ["series-data"]: radarSeriesData.value,
          ["theme-color"]: themeColor
        })
      } : {}, {
        M: radarSeriesData.value.length > 0
      }, radarSeriesData.value.length > 0 ? {
        N: common_vendor.f(radarCategories.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: common_vendor.t(radarSeriesData.value[index]),
            c: index
          };
        }),
        O: themeColor
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-991800d7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-account-informationDetails/my-account-informationDetails.js.map
