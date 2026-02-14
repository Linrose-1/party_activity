"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more + AvatarLongPressMenu)();
}
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const _sfc_main = {
  __name: "resource-match",
  setup(__props) {
    const matchType = common_vendor.ref(0);
    const tagInput = common_vendor.ref("");
    const tagsList = common_vendor.ref([]);
    const userList = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const pageNo = common_vendor.ref(1);
    const loadingStatus = common_vendor.ref("more");
    const isInitial = common_vendor.ref(true);
    const menuRef = common_vendor.ref(null);
    const addTag = () => {
      const val = tagInput.value.trim();
      if (!val)
        return;
      if (tagsList.value.length >= 10) {
        return common_vendor.index.showToast({
          title: "最多添加10个标签",
          icon: "none"
        });
      }
      if (tagsList.value.includes(val)) {
        return common_vendor.index.showToast({
          title: "标签已存在",
          icon: "none"
        });
      }
      tagsList.value.push(val);
      tagInput.value = "";
    };
    const removeTag = (index) => {
      tagsList.value.splice(index, 1);
    };
    const handleTabChange = (type) => {
      if (matchType.value === type)
        return;
      matchType.value = type;
      if (tagsList.value.length > 0) {
        handleSearch(true);
      }
    };
    const handleSearch = async (isRefresh = false) => {
      if (tagsList.value.length === 0) {
        return common_vendor.index.showToast({
          title: "请至少添加一个匹配标签",
          icon: "none"
        });
      }
      if (isRefresh) {
        pageNo.value = 1;
        userList.value = [];
        isInitial.value = false;
      }
      loadingStatus.value = "loading";
      try {
        const {
          data,
          error
        } = await utils_request.request("/app-api/member/user/resource-match", {
          method: "POST",
          data: {
            pageNo: pageNo.value,
            pageSize: 15,
            tags: tagsList.value,
            matchType: matchType.value
          }
        });
        if (error) {
          loadingStatus.value = "more";
          return;
        }
        const list = data.list || [];
        userList.value = isRefresh ? list : [...userList.value, ...list];
        total.value = data.total || 0;
        loadingStatus.value = userList.value.length >= total.value ? "noMore" : "more";
        pageNo.value++;
      } catch (e) {
        loadingStatus.value = "more";
      }
    };
    common_vendor.onPullDownRefresh(() => {
      if (tagsList.value.length > 0)
        handleSearch(true);
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      if (loadingStatus.value === "more")
        handleSearch(false);
    });
    const handleAvatarClick = (user) => {
      menuRef.value.open({
        id: user.id,
        name: user.realName || user.nickname,
        avatar: user.avatar,
        managerId: user.id
      });
    };
    const goCard = (user) => {
      common_vendor.index.navigateTo({
        url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.realName || user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`
      });
    };
    const handleMenuAction = ({
      type,
      user
    }) => {
      if (type === "viewCard")
        goCard(user);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: matchType.value === 0 ? 1 : "",
        b: common_vendor.o(($event) => handleTabChange(0)),
        c: matchType.value === 1 ? 1 : "",
        d: common_vendor.o(($event) => handleTabChange(1)),
        e: common_vendor.p({
          type: "info-filled",
          size: "14",
          color: "#999"
        }),
        f: common_vendor.t(matchType.value === 0 ? "输入您需要的关键词，匹配他人的资源" : "输入您的核心能力，匹配他人的需求"),
        g: common_vendor.o(addTag),
        h: tagInput.value,
        i: common_vendor.o(($event) => tagInput.value = $event.detail.value),
        j: common_vendor.o(addTag),
        k: tagsList.value.length > 0
      }, tagsList.value.length > 0 ? {
        l: common_vendor.f(tagsList.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTag(index), index),
            c: "52394c29-1-" + i0,
            d: index
          };
        }),
        m: common_vendor.p({
          type: "closeempty",
          size: "12",
          color: "#FF7D00"
        }),
        n: common_vendor.t(tagsList.value.length)
      } : {}, {
        o: common_vendor.p({
          type: "search",
          size: "18",
          color: "#fff"
        }),
        p: common_vendor.o(($event) => handleSearch(true)),
        q: userList.value.length > 0
      }, userList.value.length > 0 ? {
        r: common_vendor.t(total.value)
      } : {}, {
        s: userList.value.length > 0
      }, userList.value.length > 0 ? {
        t: common_vendor.f(userList.value, (user, k0, i0) => {
          return common_vendor.e({
            a: user.avatar,
            b: common_vendor.o(($event) => handleAvatarClick(user), user.id),
            c: common_vendor.t(user.realName || user.nickname),
            d: user.matchTagCount
          }, user.matchTagCount ? {
            e: "52394c29-3-" + i0,
            f: common_vendor.p({
              type: "fire-filled",
              size: "12",
              color: "#FF7D00"
            }),
            g: common_vendor.t(user.matchTagCount)
          } : {}, {
            h: common_vendor.t(user.positionTitle || "核心高伙"),
            i: common_vendor.t(user.companyName || "暂无公司信息"),
            j: common_vendor.t(matchType.value === 0 ? user.haveResources : user.needResources),
            k: "52394c29-4-" + i0,
            l: user.id,
            m: common_vendor.o(($event) => goCard(user), user.id)
          });
        }),
        v: common_vendor.t(matchType.value === 0 ? "TA拥有：" : "TA需求："),
        w: common_vendor.p({
          type: "right",
          size: "16",
          color: "#eee"
        }),
        x: common_vendor.p({
          status: loadingStatus.value
        })
      } : !isInitial.value ? {
        z: common_assets._imports_0$9
      } : {}, {
        y: !isInitial.value,
        A: common_vendor.sr(menuRef, "52394c29-6", {
          "k": "menuRef"
        }),
        B: common_vendor.o(handleMenuAction)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-52394c29"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/resource-match/resource-match.js.map
