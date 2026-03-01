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
    const targetUserId = common_vendor.ref(null);
    const radarDatasets = common_vendor.ref([]);
    const currentUserId = common_vendor.index.getStorageSync("userId");
    const isSelf = common_vendor.computed(() => {
      if (!userInfo.value || !currentUserId)
        return false;
      return String(userInfo.value.id) === String(currentUserId);
    });
    common_vendor.onLoad((options) => {
      if (options.id) {
        targetUserId.value = options.id;
      } else {
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      }
    });
    common_vendor.onShow(() => {
      if (targetUserId.value) {
        loadAllPageData(targetUserId.value);
      }
    });
    const loadAllPageData = async (userId) => {
      common_vendor.index.showLoading({
        title: "同步数据..."
      });
      try {
        await fetchUserInfo(userId);
        await fetchScoreStatistics(userId);
      } catch (e) {
        common_vendor.index.__f__("error", "at packages/my-account-informationDetails/my-account-informationDetails.vue:256", "页面数据加载异常:", e);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const fetchUserInfo = async (userId) => {
      const userRes = await utils_request.request("/app-api/member/user/get", {
        method: "GET",
        data: {
          id: userId
        }
      });
      if (!userRes.error && userRes.data) {
        userInfo.value = userRes.data;
        common_vendor.index.setNavigationBarTitle({
          title: isSelf.value ? "我的详细资料" : `${userRes.data.nickname}的详情`
        });
      }
    };
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
        const formatData = (res) => !res.error && res.data ? [
          res.data.avg1,
          res.data.avg2,
          res.data.avg3,
          res.data.avg4
        ] : [0, 0, 0, 0];
        newDatasets.push({
          name: "自我评价",
          data: formatData(selfRes),
          color: "#FF7D00"
        });
        newDatasets.push({
          name: "商友评价",
          data: formatData(friendRes),
          color: "#4CAF50"
        });
        newDatasets.push({
          name: "综合评价",
          data: formatData(complexRes),
          color: "#1890FF"
        });
        radarDatasets.value = newDatasets;
      } catch (e) {
        radarDatasets.value = [];
      }
    };
    const formattedCompanies = common_vendor.computed(() => {
      if (!userInfo.value)
        return [];
      const companies = splitToArray(userInfo.value.companyName);
      const industries = splitToArray(userInfo.value.industry);
      const positions = splitToArray(userInfo.value.positionTitle);
      const maxLength = Math.max(companies.length, industries.length, positions.length);
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
      const result = [];
      for (let i = 0; i < maxLength; i++) {
        result.push({
          name: associations[i] || "组织名称未填写",
          title: titles[i] || "职务未填写"
        });
      }
      return result;
    });
    const splitToArray = (str) => {
      if (!str)
        return [];
      return str.split(/[,，\n]/).map((item) => item.trim()).filter((item) => item);
    };
    const formatSex = (sex) => {
      if (sex === 1)
        return "男";
      if (sex === 2)
        return "女";
      return "保密";
    };
    const goToResourceMatch = () => {
      common_vendor.index.navigateTo({
        url: "/packages/resource-match/resource-match"
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
        g: common_vendor.o(($event) => previewImage(userInfo.value.avatar)),
        h: common_vendor.t(userInfo.value.nickname || "未填写"),
        i: common_vendor.t(userInfo.value.realName || "未填写"),
        j: common_vendor.t(formatSex(userInfo.value.sex)),
        k: common_vendor.t(userInfo.value.era || "未填写"),
        l: common_vendor.t(userInfo.value.locationAddressStr || "未填写"),
        m: common_vendor.t(userInfo.value.nativePlaceStr || "未填写"),
        n: common_vendor.p({
          type: "flag-filled",
          size: "24",
          color: themeColor
        }),
        o: common_vendor.f(formattedAssociations.value, (item, index, i0) => {
          return {
            a: "991800d7-3-" + i0,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.title),
            d: index
          };
        }),
        p: common_vendor.p({
          type: "auth-filled",
          size: "18",
          color: "#C9A063"
        }),
        q: formattedAssociations.value.length === 0
      }, formattedAssociations.value.length === 0 ? {} : {}, {
        r: common_vendor.f(formattedCompanies.value, (company, index, i0) => {
          return {
            a: common_vendor.t(company.name || "公司名称未填写"),
            b: common_vendor.t(company.industry || "行业未填写"),
            c: common_vendor.t(company.position || "职务未填写"),
            d: index
          };
        }),
        s: formattedCompanies.value.length === 0
      }, formattedCompanies.value.length === 0 ? {} : {}, {
        t: common_vendor.f(splitToArray(userInfo.value.school), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        v: !userInfo.value.school
      }, !userInfo.value.school ? {} : {}, {
        w: common_vendor.f(splitToArray(userInfo.value.hobby), (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        x: !userInfo.value.hobby
      }, !userInfo.value.hobby ? {} : {}, {
        y: common_vendor.t(userInfo.value.contactEmail || "未填写"),
        z: userInfo.value.wechatQrCodeUrl
      }, userInfo.value.wechatQrCodeUrl ? {
        A: userInfo.value.wechatQrCodeUrl,
        B: common_vendor.o(($event) => previewImage(userInfo.value.wechatQrCodeUrl))
      } : {}, {
        C: common_vendor.p({
          type: "chat-filled",
          size: "24",
          color: themeColor
        }),
        D: common_vendor.p({
          type: "sound",
          size: "18",
          color: "#FF7D00"
        }),
        E: common_vendor.t(userInfo.value.signature || "这位朋友很酷，什么也没留下。"),
        F: common_vendor.t(userInfo.value.personalBio || "未填写详细简介"),
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
