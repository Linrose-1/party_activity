"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + UserScoreBoard)();
}
const UserScoreBoard = () => "../../components/UserScoreBoard.js";
const themeColor = "#FF7D00";
const _sfc_main = {
  __name: "my-account-informationDetails",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const radarDatasets = common_vendor.ref([]);
    common_vendor.ref(["基础信用", "协作态度", "专业能力", "精神格局"]);
    common_vendor.ref([]);
    const currentUserId = common_vendor.index.getStorageSync("userId");
    const isSelf = common_vendor.computed(() => {
      if (!userInfo.value || !currentUserId)
        return false;
      return String(userInfo.value.id) === String(currentUserId);
    });
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
    const formattedAssociations = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      const associations = splitToArray(userInfo.value.associationName);
      const titles = splitToArray(userInfo.value.professionalTitle);
      const maxLength = Math.max(associations.length, titles.length);
      if (maxLength === 0)
        return [];
      const result = [];
      for (let i = 0; i < maxLength; i++) {
        result.push({
          name: associations[i] || "组织名称未填写",
          title: titles[i] || "职务未填写"
        });
      }
      return result;
    });
    const fetchScoreStatistics = async (userId) => {
      try {
        const [selfRes, friendRes, complexRes] = await Promise.all([
          utils_request.request("/app-api/member/user-scores/complexStatistics", {
            method: "GET",
            data: {
              userId,
              type: 0
            }
          }),
          utils_request.request("/app-api/member/user-scores/complexStatistics", {
            method: "GET",
            data: {
              userId,
              type: 1
            }
          }),
          utils_request.request("/app-api/member/user-scores/complexStatistics", {
            method: "GET",
            data: {
              userId,
              type: 3
            }
          })
        ]);
        const newDatasets = [];
        newDatasets.push({
          name: "自我评价",
          data: !selfRes.error && selfRes.data ? [
            selfRes.data.avg1,
            selfRes.data.avg2,
            selfRes.data.avg3,
            selfRes.data.avg4
          ] : [0, 0, 0, 0],
          color: "#FF7D00"
        });
        newDatasets.push({
          name: "商友评价",
          data: !friendRes.error && friendRes.data ? [
            friendRes.data.avg1,
            friendRes.data.avg2,
            friendRes.data.avg3,
            friendRes.data.avg4
          ] : [0, 0, 0, 0],
          color: "#4CAF50"
        });
        newDatasets.push({
          name: "综合评价",
          data: !complexRes.error && complexRes.data ? [
            complexRes.data.avg1,
            complexRes.data.avg2,
            complexRes.data.avg3,
            complexRes.data.avg4
          ] : [0, 0, 0, 0],
          color: "#1890FF"
        });
        radarDatasets.value = newDatasets;
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-account-informationDetails/my-account-informationDetails.vue:369", "获取评分数据失败", e);
        radarDatasets.value = [];
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
      common_vendor.index.__f__("log", "at packages/my-account-informationDetails/my-account-informationDetails.vue:381", "跳转到资源匹配页面");
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
    const goToEdit = () => {
      common_vendor.index.navigateTo({
        url: "/packages/my-edit/my-edit"
        // 请确认这是您项目中真实的编辑页路径
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
        c: isSelf.value
      }, isSelf.value ? {
        d: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#999"
        }),
        e: common_vendor.o(goToEdit)
      } : {}, {
        f: userInfo.value.avatar || "/static/default-avatar.png",
        g: common_vendor.t(userInfo.value.nickname || "未填写"),
        h: common_vendor.t(userInfo.value.realName || "未填写"),
        i: common_vendor.t(formatSex(userInfo.value.sex)),
        j: common_vendor.t(userInfo.value.era || "未填写"),
        k: common_vendor.t(userInfo.value.locationAddressStr || "未填写"),
        l: common_vendor.t(userInfo.value.nativePlaceStr || "未填写"),
        m: common_vendor.p({
          type: "flag-filled",
          size: "24",
          color: themeColor
        }),
        n: common_vendor.f(formattedAssociations.value, (item, index, i0) => {
          return {
            a: "991800d7-3-" + i0,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.title),
            d: index
          };
        }),
        o: common_vendor.p({
          type: "auth-filled",
          size: "18",
          color: "#C9A063"
        }),
        p: formattedAssociations.value.length === 0
      }, formattedAssociations.value.length === 0 ? {} : {}, {
        q: common_vendor.f(formattedCompanies.value, (company, index, i0) => {
          return {
            a: common_vendor.t(company.name || "公司名称未填写"),
            b: common_vendor.t(company.industry || "行业未填写"),
            c: common_vendor.t(company.position || "职务未填写"),
            d: index
          };
        }),
        r: formattedCompanies.value.length === 0
      }, formattedCompanies.value.length === 0 ? {} : {}, {
        s: common_vendor.f(splitToArray(userInfo.value.school), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        t: !userInfo.value.school
      }, !userInfo.value.school ? {} : {}, {
        v: common_vendor.f(splitToArray(userInfo.value.hobby), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        w: !userInfo.value.hobby
      }, !userInfo.value.hobby ? {} : {}, {
        x: common_vendor.t(userInfo.value.contactEmail || "未填写"),
        y: userInfo.value.wechatQrCodeUrl
      }, userInfo.value.wechatQrCodeUrl ? {
        z: userInfo.value.wechatQrCodeUrl,
        A: common_vendor.o(($event) => previewImage(userInfo.value.wechatQrCodeUrl))
      } : {}, {
        B: common_vendor.p({
          type: "chat-filled",
          size: "24",
          color: themeColor
        }),
        C: common_vendor.p({
          type: "sound",
          size: "20",
          color: "#666"
        }),
        D: common_vendor.t(userInfo.value.signature || "这位朋友很酷，什么也没留下。"),
        E: common_vendor.p({
          type: "sound-filled",
          size: "20",
          color: "#666"
        }),
        F: common_vendor.t(userInfo.value.personalBio || "未填写"),
        G: userInfo.value.haveResources
      }, userInfo.value.haveResources ? {
        H: common_vendor.t(userInfo.value.haveResources)
      } : {}, {
        I: userInfo.value.needResources
      }, userInfo.value.needResources ? {
        J: common_vendor.t(userInfo.value.needResources)
      } : {}, {
        K: common_vendor.p({
          type: "link",
          size: "20",
          color: "#fff"
        }),
        L: common_vendor.o(goToResourceMatch),
        M: common_vendor.p({
          type: "map-filled",
          size: "24",
          color: themeColor
        }),
        N: radarDatasets.value.length > 0
      }, radarDatasets.value.length > 0 ? {
        O: common_vendor.p({
          datasets: radarDatasets.value,
          showCard: false,
          showTitle: false
        })
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-991800d7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-account-informationDetails/my-account-informationDetails.js.map
