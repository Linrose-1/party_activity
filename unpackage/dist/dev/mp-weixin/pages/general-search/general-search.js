"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_picker2 + _easycom_uni_data_select2 + _easycom_uni_forms2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_data_select = () => "../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_picker + _easycom_uni_data_select + _easycom_uni_forms + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "general-search",
  setup(__props) {
    const isFilterExpanded = common_vendor.ref(false);
    const list = common_vendor.ref([]);
    const totalCount = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const areaTree = common_vendor.ref([]);
    const industryTree = common_vendor.ref([]);
    const hasUnlocked = common_vendor.ref(false);
    const unlockTiers = [
      {
        id: 1,
        count: 1,
        price: 1,
        benefit: "单人查看",
        hot: false
      },
      {
        id: 2,
        count: 6,
        price: 5,
        benefit: "加送1位",
        hot: true
      },
      {
        id: 3,
        count: 15,
        price: 10,
        benefit: "买10送5",
        hot: false
      }
    ];
    const selectedTier = common_vendor.ref(unlockTiers[1]);
    const queryParams = common_vendor.reactive({
      keyword: "",
      nickname: "",
      school: "",
      industry: "",
      haveResources: "",
      needResources: "",
      nativePlace: "",
      locationAddress: "",
      era: "",
      hobby: ""
    });
    const eraOptions = [
      {
        value: "50/60",
        text: "50/60"
      },
      {
        value: "70/80",
        text: "70/80"
      },
      {
        value: "90/00",
        text: "90/00"
      },
      {
        value: "不问年代",
        text: "不问年代"
      }
    ];
    const freeList = common_vendor.computed(() => list.value.slice(0, 10));
    const paidList = common_vendor.computed(() => list.value.slice(10));
    common_vendor.onLoad((options) => {
      if (options.keyword) {
        queryParams.keyword = decodeURIComponent(options.keyword);
      }
      initBaseData();
      handleSearch();
    });
    const initBaseData = async () => {
      const [areaRes, indRes] = await Promise.all([
        utils_request.request("/app-api/system/area/tree"),
        utils_request.request("/app-api/member/national-industry/tree", {
          method: "POST"
        })
      ]);
      if (!areaRes.error)
        areaTree.value = areaRes.data;
      if (!indRes.error)
        industryTree.value = indRes.data;
    };
    const handleSearch = async () => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const hasSearchCondition = ((_a = queryParams.keyword) == null ? void 0 : _a.trim()) || ((_b = queryParams.nickname) == null ? void 0 : _b.trim()) || ((_c = queryParams.school) == null ? void 0 : _c.trim()) || ((_d = queryParams.industry) == null ? void 0 : _d.trim()) || ((_e = queryParams.haveResources) == null ? void 0 : _e.trim()) || ((_f = queryParams.needResources) == null ? void 0 : _f.trim()) || queryParams.nativePlace || queryParams.locationAddress || ((_g = queryParams.era) == null ? void 0 : _g.trim()) || ((_h = queryParams.hobby) == null ? void 0 : _h.trim());
      if (!hasSearchCondition) {
        list.value = [];
        totalCount.value = 0;
        loadStatus.value = "noMore";
        common_vendor.index.showToast({
          title: "请输入搜索关键词或选择筛选条件",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      hasUnlocked.value = false;
      list.value = [];
      isFilterExpanded.value = false;
      await fetchUsers(true);
    };
    const fetchUsers = async (isFirstLoad = false) => {
      loadStatus.value = "loading";
      let requestData;
      if (!hasUnlocked.value) {
        requestData = {
          ...queryParams,
          pageNo: 1,
          pageSize: 10
        };
      } else {
        const paidCount = Math.min(selectedTier.value.count, totalCount.value - 10);
        requestData = {
          ...queryParams,
          pageNo: 2,
          pageSize: paidCount
        };
      }
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/general-search-process", {
        method: "POST",
        data: requestData
      });
      if (!error && data) {
        const newList = data.list || [];
        if (!hasUnlocked.value) {
          list.value = newList;
        } else {
          list.value = [...list.value, ...newList];
        }
        totalCount.value = data.total || 0;
        loadStatus.value = list.value.length >= totalCount.value ? "noMore" : "more";
      } else {
        loadStatus.value = "noMore";
      }
    };
    const resetFilters = () => {
      Object.keys(queryParams).forEach((key) => {
        queryParams[key] = "";
      });
    };
    const handleUnlock = async () => {
      const canProceed = await utils_user.checkLoginGuard(`解锁更多精英需消耗 ${selectedTier.value.price} 智米，是否继续？`);
      if (!canProceed)
        return;
      common_vendor.index.showModal({
        title: "确认解锁",
        content: `确认消耗 ${selectedTier.value.price} 智米兑换 ${selectedTier.value.count} 个搜索查看名额？`,
        confirmColor: "#FF8400",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "正在解锁..."
            });
            const {
              error
            } = await utils_request.request(
              `/app-api/member/user/add-normal-search-count?viewCount=${selectedTier.value.count}`,
              {
                method: "POST"
              }
            );
            common_vendor.index.hideLoading();
            if (!error) {
              common_vendor.index.showToast({
                title: "解锁成功",
                icon: "success"
              });
              hasUnlocked.value = true;
              setTimeout(() => {
                fetchUsers();
              }, 1e3);
            }
          }
        }
      });
    };
    const getCommonality = (user) => {
      const p = [];
      if (user.classmateFlag)
        p.push("校友");
      if (user.peerFlag)
        p.push("同行");
      if (user.fellowTownspeopleFlag)
        p.push("同乡");
      if (user.matchTagCount > 0)
        p.push("资源高度匹配");
      return p.length > 0 ? p.join(" · ") : "潜力合作伙伴";
    };
    const goToDetail = async (user) => {
      const canProceed = await utils_user.checkLoginGuard();
      if (canProceed) {
        const defaultAvatar = "/static/icon/default-avatar.png";
        const name = user.nickname || "匿名用户";
        const avatarUrl = user.avatar || defaultAvatar;
        common_vendor.index.navigateTo({
          url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        b: common_vendor.o(handleSearch),
        c: queryParams.keyword,
        d: common_vendor.o(($event) => queryParams.keyword = $event.detail.value),
        e: common_vendor.o(handleSearch),
        f: common_vendor.p({
          type: isFilterExpanded.value ? "arrowup" : "arrowdown",
          size: "14",
          color: "#FF8400"
        }),
        g: common_vendor.o(($event) => isFilterExpanded.value = !isFilterExpanded.value),
        h: common_vendor.o(($event) => queryParams.nickname = $event),
        i: common_vendor.p({
          placeholder: "请输入",
          inputBorder: false,
          modelValue: queryParams.nickname
        }),
        j: common_vendor.p({
          label: "用户名/昵称"
        }),
        k: common_vendor.o(($event) => queryParams.school = $event),
        l: common_vendor.p({
          placeholder: "请输入学校",
          inputBorder: false,
          modelValue: queryParams.school
        }),
        m: common_vendor.p({
          label: "学校/学历"
        }),
        n: common_vendor.o(($event) => queryParams.industry = $event),
        o: common_vendor.p({
          localdata: industryTree.value,
          placeholder: "请选择行业",
          map: {
            text: "name",
            value: "name"
          },
          modelValue: queryParams.industry
        }),
        p: common_vendor.p({
          label: "行业领域"
        }),
        q: common_vendor.o(($event) => queryParams.haveResources = $event),
        r: common_vendor.p({
          placeholder: "提供资源",
          inputBorder: false,
          modelValue: queryParams.haveResources
        }),
        s: common_vendor.p({
          label: "我有资源"
        }),
        t: common_vendor.o(($event) => queryParams.needResources = $event),
        v: common_vendor.p({
          placeholder: "需求资源",
          inputBorder: false,
          modelValue: queryParams.needResources
        }),
        w: common_vendor.p({
          label: "我需资源"
        }),
        x: common_vendor.o(($event) => queryParams.nativePlace = $event),
        y: common_vendor.p({
          localdata: areaTree.value,
          placeholder: "请选择",
          map: {
            text: "name",
            value: "id"
          },
          modelValue: queryParams.nativePlace
        }),
        z: common_vendor.p({
          label: "籍贯/家乡"
        }),
        A: common_vendor.o(($event) => queryParams.locationAddress = $event),
        B: common_vendor.p({
          localdata: areaTree.value,
          placeholder: "请选择",
          map: {
            text: "name",
            value: "id"
          },
          modelValue: queryParams.locationAddress
        }),
        C: common_vendor.p({
          label: "商务办公地"
        }),
        D: common_vendor.o(($event) => queryParams.era = $event),
        E: common_vendor.p({
          localdata: eraOptions,
          placeholder: "选择年代",
          modelValue: queryParams.era
        }),
        F: common_vendor.p({
          label: "出生年代"
        }),
        G: common_vendor.o(($event) => queryParams.hobby = $event),
        H: common_vendor.p({
          placeholder: "如：登山/高尔夫",
          inputBorder: false,
          modelValue: queryParams.hobby
        }),
        I: common_vendor.p({
          label: "兴趣爱好"
        }),
        J: common_vendor.p({
          ["label-position"]: "top",
          ["label-width"]: "100"
        }),
        K: common_vendor.o(resetFilters),
        L: common_vendor.o(handleSearch),
        M: isFilterExpanded.value ? 1 : "",
        N: list.value.length === 0 && loadStatus.value !== "loading"
      }, list.value.length === 0 && loadStatus.value !== "loading" ? {
        O: common_assets._imports_0$2
      } : common_vendor.e({
        P: totalCount.value > 0
      }, totalCount.value > 0 ? {
        Q: common_vendor.t(totalCount.value)
      } : {}, {
        R: freeList.value.length > 0
      }, freeList.value.length > 0 ? {} : {}, {
        S: common_vendor.f(freeList.value, (user, index, i0) => {
          return {
            a: user.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(user.nickname),
            c: common_vendor.t(90 + (10 - index)),
            d: common_vendor.f(5, (s, k1, i1) => {
              return {
                a: s,
                b: "797ccd59-21-" + i0 + "-" + i1
              };
            }),
            e: common_vendor.t(user.professionalTitle || "精英人士"),
            f: common_vendor.t(user.school || "知名院校"),
            g: common_vendor.t(user.locationAddressStr || "核心城市"),
            h: common_vendor.t(getCommonality(user)),
            i: user.id,
            j: common_vendor.o(($event) => goToDetail(user), user.id)
          };
        }),
        T: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#FF8400"
        }),
        U: totalCount.value > 10
      }, totalCount.value > 10 ? common_vendor.e({
        V: common_vendor.t(totalCount.value - 10),
        W: common_vendor.f(paidList.value, (user, index, i0) => {
          return {
            a: user.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(user.nickname),
            c: common_vendor.t(85 - index),
            d: common_vendor.f(5, (s, k1, i1) => {
              return {
                a: s,
                b: "797ccd59-22-" + i0 + "-" + i1
              };
            }),
            e: common_vendor.t(user.professionalTitle || "精英人士"),
            f: common_vendor.t(user.school || "知名院校"),
            g: common_vendor.t(user.locationAddressStr || "核心城市"),
            h: common_vendor.t(getCommonality(user)),
            i: user.id,
            j: common_vendor.o(($event) => goToDetail(user), user.id)
          };
        }),
        X: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#FF8400"
        }),
        Y: list.value.length < totalCount.value
      }, list.value.length < totalCount.value ? common_vendor.e({
        Z: paidList.value.length > 0
      }, paidList.value.length > 0 ? {
        aa: common_vendor.t(paidList.value.length)
      } : {}, {
        ab: common_vendor.f(unlockTiers, (tier, k0, i0) => {
          return common_vendor.e({
            a: tier.hot
          }, tier.hot ? {} : {}, {
            b: common_vendor.t(tier.count),
            c: common_vendor.t(tier.price),
            d: common_vendor.t(tier.benefit),
            e: tier.id,
            f: selectedTier.value.id === tier.id ? 1 : "",
            g: common_vendor.o(($event) => selectedTier.value = tier, tier.id)
          });
        }),
        ac: common_vendor.t(selectedTier.value.price),
        ad: common_vendor.o(handleUnlock)
      }) : {}, {
        ae: paidList.value.length === 0
      }, paidList.value.length === 0 ? {
        af: common_vendor.f(Math.min(2, totalCount.value - 10), (i, k0, i0) => {
          return {
            a: "797ccd59-23-" + i0,
            b: "locked-" + i
          };
        }),
        ag: common_vendor.p({
          type: "locked-filled",
          size: "30",
          color: "#CCC"
        })
      } : {}) : {}, {
        ah: totalCount.value > 0 && list.value.length >= totalCount.value
      }, totalCount.value > 0 && list.value.length >= totalCount.value ? {
        ai: common_vendor.p({
          type: "checkmarkempty",
          size: "24",
          color: "#52C41A"
        })
      } : {}), {
        aj: list.value.length > 0
      }, list.value.length > 0 ? {
        ak: common_vendor.p({
          status: loadStatus.value
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-797ccd59"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/general-search/general-search.js.map
