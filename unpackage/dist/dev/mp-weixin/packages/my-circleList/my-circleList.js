"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_easyinput2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_icons + _easycom_uni_load_more + AvatarLongPressMenu + CircleApplyPopup)();
}
const CircleApplyPopup = () => "../../components/CircleApplyPopup.js";
const AvatarLongPressMenu = () => "../../components/AvatarLongPressMenu.js";
const _sfc_main = {
  __name: "my-circleList",
  setup(__props) {
    const circleFriendList = common_vendor.ref([]);
    const circlePageNo = common_vendor.ref(1);
    const circleLoadStatus = common_vendor.ref("more");
    const circleSearchKey = common_vendor.ref("");
    const circleAddInitiator = common_vendor.ref(0);
    const newApplyList = common_vendor.ref([]);
    const newApplyCount = common_vendor.ref(0);
    const avatarMenuRef = common_vendor.ref(null);
    const applyPopupRef = common_vendor.ref(null);
    const fetchCircleList = async (isRefresh = false) => {
      if (circleLoadStatus.value === "loading")
        return;
      if (isRefresh)
        circlePageNo.value = 1;
      circleLoadStatus.value = "loading";
      const params = {
        pageNo: circlePageNo.value,
        pageSize: 10,
        status: 1,
        addInitiator: circleAddInitiator.value
      };
      if (circleSearchKey.value.trim())
        params.searchKey = circleSearchKey.value.trim();
      const {
        data
      } = await utils_request.request("/app-api/member/user/friend/list", {
        method: "GET",
        data: params
      });
      if (data) {
        circleFriendList.value = isRefresh ? data.list : [...circleFriendList.value, ...data.list];
        circleLoadStatus.value = circleFriendList.value.length >= data.total ? "noMore" : "more";
        circlePageNo.value++;
      }
      common_vendor.index.stopPullDownRefresh();
    };
    const getNewApplyList = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/user/friend/list", {
        method: "GET",
        data: {
          pageNo: 1,
          pageSize: 10,
          status: 0
        }
      });
      if (data) {
        newApplyList.value = data.list;
        newApplyCount.value = data.total;
      }
    };
    const formatCompanyInfo = (item) => {
      var _a, _b;
      const companyRaw = item.companyName || "";
      const positionRaw = item.positionTitle || "";
      const companies = companyRaw.split(/[,，丨]/);
      const positions = positionRaw.split(/[,，丨]/);
      const company = ((_a = companies[0]) == null ? void 0 : _a.trim()) || "";
      const position = ((_b = positions[0]) == null ? void 0 : _b.trim()) || "";
      if (company && position)
        return `${company} · ${position}`;
      return company || position || "暂无公司信息";
    };
    const formatTimestamp = (ts) => {
      if (!ts)
        return "";
      const d = new Date(Number(ts));
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    };
    const openApplyPopup = () => applyPopupRef.value.open(newApplyList.value);
    const handleAuditSuccess = () => {
      getNewApplyList();
      fetchCircleList(true);
    };
    const switchCircleFilter = (type) => {
      circleAddInitiator.value = type;
      fetchCircleList(true);
    };
    const handleCircleSearch = () => fetchCircleList(true);
    const confirmDeleteFriend = (friend) => {
      common_vendor.index.showModal({
        title: "提示",
        content: `确定要与 ${friend.realName || friend.nickname} 解除互圈吗？`,
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (res.confirm)
            deleteFriend(friend);
        }
      });
    };
    const deleteFriend = async (friend) => {
      await utils_request.request(`/app-api/member/user/friend/del`, {
        method: "POST",
        data: {
          id: friend.fid
        }
      });
      fetchCircleList(true);
    };
    const navigateToBusinessCard = (user) => common_vendor.index.navigateTo({
      url: `/packages/applicationBusinessCard/applicationBusinessCard?id=${user.id}&name=${encodeURIComponent(user.nickname || user.realName)}&avatar=${encodeURIComponent(user.avatar || "")}&fromShare=1`
    });
    const handleAvatarClick = async (friend) => {
      if (!await utils_user.checkLoginGuard())
        return;
      const userParams = {
        id: friend.id,
        name: friend.realName || friend.nickname || "圈友",
        avatar: friend.avatar || "",
        isEnterpriseSource: false
      };
      avatarMenuRef.value.open(userParams);
    };
    common_vendor.onMounted(() => {
      fetchCircleList(true);
      getNewApplyList();
    });
    common_vendor.onPullDownRefresh(() => {
      fetchCircleList(true);
      getNewApplyList();
    });
    common_vendor.onReachBottom(() => fetchCircleList());
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleCircleSearch),
        b: common_vendor.o(handleCircleSearch),
        c: common_vendor.o(($event) => circleSearchKey.value = $event),
        d: common_vendor.p({
          prefixIcon: "search",
          placeholder: "搜索圈友姓名",
          modelValue: circleSearchKey.value
        }),
        e: circleAddInitiator.value === 0 ? 1 : "",
        f: common_vendor.o(($event) => switchCircleFilter(0)),
        g: circleAddInitiator.value === 1 ? 1 : "",
        h: common_vendor.o(($event) => switchCircleFilter(1)),
        i: common_vendor.p({
          type: "personadd-filled",
          size: "24",
          color: "#fff"
        }),
        j: newApplyCount.value > 0
      }, newApplyCount.value > 0 ? {
        k: common_vendor.t(newApplyCount.value)
      } : {}, {
        l: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        m: common_vendor.o(openApplyPopup),
        n: common_vendor.f(circleFriendList.value, (friend, k0, i0) => {
          return common_vendor.e({
            a: friend.avatar || "/static/images/default-avatar.png",
            b: common_vendor.o(($event) => handleAvatarClick(friend), friend.id),
            c: common_vendor.t(friend.realName || friend.nickname || "匿名用户"),
            d: friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1
          }, friend.fellowTownspeopleCityFlag === 1 || friend.peerFlag === 1 || friend.classmateFlag === 1 || friend.friendParentFlag === 1 ? common_vendor.e({
            e: friend.friendParentFlag === 1
          }, friend.friendParentFlag === 1 ? {} : {}, {
            f: friend.fellowTownspeopleCityFlag === 1
          }, friend.fellowTownspeopleCityFlag === 1 ? {} : {}, {
            g: friend.peerFlag === 1
          }, friend.peerFlag === 1 ? {} : {}, {
            h: friend.classmateFlag === 1
          }, friend.classmateFlag === 1 ? {} : {}) : {}, {
            i: "cee902af-3-" + i0,
            j: common_vendor.t(formatCompanyInfo(friend)),
            k: friend.followTime || friend.createTime
          }, friend.followTime || friend.createTime ? {
            l: common_vendor.t(formatTimestamp(friend.followTime || friend.createTime))
          } : {}, {
            m: "cee902af-4-" + i0,
            n: common_vendor.o(($event) => confirmDeleteFriend(friend), friend.id),
            o: friend.id,
            p: common_vendor.o(($event) => navigateToBusinessCard(friend), friend.id)
          });
        }),
        o: common_vendor.p({
          type: "briefcase-filled",
          size: "14",
          color: "#888"
        }),
        p: common_vendor.p({
          type: "checkbox-filled",
          size: "18",
          color: "#4cd964"
        }),
        q: circleFriendList.value.length > 0
      }, circleFriendList.value.length > 0 ? {
        r: common_vendor.p({
          status: circleLoadStatus.value
        })
      } : {}, {
        s: common_vendor.sr(avatarMenuRef, "cee902af-6", {
          "k": "avatarMenuRef"
        }),
        t: common_vendor.sr(applyPopupRef, "cee902af-7", {
          "k": "applyPopupRef"
        }),
        v: common_vendor.o(handleAuditSuccess)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cee902af"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/my-circleList/my-circleList.js.map
