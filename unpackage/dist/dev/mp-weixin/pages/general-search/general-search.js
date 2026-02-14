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
    const list = common_vendor.ref([]);
    const totalCount = common_vendor.ref(0);
    const loadStatus = common_vendor.ref("more");
    const isFilterExpanded = common_vendor.ref(false);
    const hasUnlocked = common_vendor.ref(false);
    const areaTree = common_vendor.ref([]);
    const industryTree = common_vendor.ref([]);
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
    const unlockTiers = [
      {
        id: 1,
        count: 1,
        price: 1
      },
      {
        id: 2,
        count: 6,
        price: 5
      },
      {
        id: 3,
        count: 15,
        price: 10
      }
    ];
    const selectedTier = common_vendor.ref(unlockTiers[1]);
    const freeList = common_vendor.computed(() => list.value.slice(0, 10));
    const paidList = common_vendor.computed(() => list.value.slice(10));
    common_vendor.onLoad((options) => {
      if (options.keyword)
        queryParams.keyword = decodeURIComponent(options.keyword);
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
      const hasValue = Object.values(queryParams).some((v) => v && String(v).trim() !== "");
      if (!hasValue)
        return common_vendor.index.showToast({
          title: "请输入关键词",
          icon: "none"
        });
      list.value = [];
      hasUnlocked.value = false;
      isFilterExpanded.value = false;
      await fetchUsers();
    };
    const fetchUsers = async () => {
      loadStatus.value = "loading";
      const requestData = {
        ...queryParams,
        pageNo: hasUnlocked.value ? 2 : 1,
        pageSize: hasUnlocked.value ? selectedTier.value.count : 10
      };
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/general-search-process", {
        method: "POST",
        data: requestData
      });
      if (!error && data) {
        const getFirstItem = (val) => {
          if (!val)
            return "";
          if (Array.isArray(val) && val.length > 0)
            return val[0];
          if (typeof val === "string" && val.includes(","))
            return val.split(",")[0].trim();
          return val;
        };
        const mapped = (data.list || []).map((u) => ({
          ...u,
          displayTitle: getFirstItem(u.positionTitle) || getFirstItem(u.professionalTitle) || "精英人士",
          displayCompany: getFirstItem(u.companyName) || "暂未设置公司",
          displaySchool: getFirstItem(u.school) || "暂未设置学校"
        }));
        list.value = hasUnlocked.value ? [...list.value, ...mapped] : mapped;
        totalCount.value = data.total || 0;
        loadStatus.value = list.value.length >= totalCount.value ? "noMore" : "more";
      } else {
        loadStatus.value = "noMore";
      }
    };
    const handleUnlock = async () => {
      const canProceed = await utils_user.checkLoginGuard();
      if (!canProceed)
        return;
      common_vendor.index.showModal({
        title: "解锁商友",
        content: `将消耗 ${selectedTier.value.price} 智米解锁后续 ${selectedTier.value.count} 位商友，是否继续？`,
        confirmColor: "#FF8400",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "处理中..."
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
              fetchUsers();
            }
          }
        }
      });
    };
    const resetFilters = () => {
      Object.keys(queryParams).forEach((key) => queryParams[key] = "");
    };
    const goToDetail = (user) => {
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`
      });
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
        R: common_vendor.f(freeList.value, (user, index, i0) => {
          return common_vendor.e({
            a: user.avatar || "/static/images/default-avatar.png",
            b: common_vendor.t(user.nickname),
            c: user.idCert === 1
          }, user.idCert === 1 ? {
            d: "797ccd59-21-" + i0,
            e: common_vendor.p({
              type: "auth-filled",
              size: "12",
              color: "#FF8400"
            })
          } : {}, {
            f: common_vendor.t(user.displayTitle),
            g: common_vendor.t(user.displayCompany),
            h: common_vendor.t(user.displaySchool),
            i: common_vendor.t(user.locationAddressStr || "全国"),
            j: user.id,
            k: common_vendor.o(($event) => goToDetail(user), user.id)
          });
        }),
        S: totalCount.value > 10
      }, totalCount.value > 10 ? common_vendor.e({
        T: common_vendor.f(paidList.value, (user, index, i0) => {
          return common_vendor.e({
            a: user.avatar,
            b: common_vendor.t(user.nickname),
            c: user.idCert === 1
          }, user.idCert === 1 ? {} : {}, {
            d: common_vendor.t(user.displayTitle),
            e: common_vendor.t(user.locationAddressStr),
            f: user.id,
            g: common_vendor.o(($event) => goToDetail(user), user.id)
          });
        }),
        U: list.value.length < totalCount.value
      }, list.value.length < totalCount.value ? common_vendor.e({
        V: paidList.value.length > 0
      }, paidList.value.length > 0 ? {
        W: common_vendor.t(paidList.value.length)
      } : {}, {
        X: common_vendor.f(unlockTiers, (tier, k0, i0) => {
          return {
            a: common_vendor.t(tier.count),
            b: common_vendor.t(tier.price),
            c: tier.id,
            d: selectedTier.value.id === tier.id ? 1 : "",
            e: common_vendor.o(($event) => selectedTier.value = tier, tier.id)
          };
        }),
        Y: common_vendor.o(handleUnlock)
      }) : {}) : {}), {
        Z: list.value.length > 0
      }, list.value.length > 0 ? {
        aa: common_vendor.p({
          status: loadStatus.value
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-797ccd59"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/general-search/general-search.js.map
