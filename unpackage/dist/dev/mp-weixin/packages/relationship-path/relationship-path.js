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
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const defaultAvatar = "https://img.gofor.club/mmexport1759211962539.jpg";
const _sfc_main = {
  __name: "relationship-path",
  setup(__props) {
    const targetUserId = common_vendor.ref(null);
    const targetName = common_vendor.ref("商友");
    const paths = common_vendor.ref([]);
    const isLoading = common_vendor.ref(true);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at packages/relationship-path/relationship-path.vue:95", "人脉链路页收到参数:", options);
      if (options.targetUserId) {
        targetUserId.value = options.targetUserId;
        if (options.name) {
          targetName.value = decodeURIComponent(options.name);
        } else {
          targetName.value = "商友";
        }
        common_vendor.index.__f__("log", "at packages/relationship-path/relationship-path.vue:105", "👤 解析后的目标姓名:", targetName.value);
        common_vendor.index.setNavigationBarTitle({
          title: `与 ${targetName.value} 的关系链路`
        });
        fetchContactLink();
      }
    });
    const fetchContactLink = async () => {
      isLoading.value = true;
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user/friend/contact-friend-link", {
        method: "GET",
        data: {
          targetUserId: targetUserId.value
        }
      });
      isLoading.value = false;
      if (!error && data) {
        paths.value = data.filter((item) => item.degreePathUsers && item.degreePathUsers.length > 0);
      }
    };
    const minDegree = common_vendor.computed(() => {
      if (paths.value.length === 0)
        return 0;
      return paths.value[0].degreePathNum;
    });
    const totalPathCount = common_vendor.computed(() => {
      return paths.value.reduce((sum, item) => sum + item.degreePathUsers.length, 0);
    });
    const goUserCard = (user, uIdx) => {
      const id = user.id;
      const name = uIdx === 0 ? "我" : user.realName || user.nickname || "商友";
      const avatarUrl = user.avatar || defaultAvatar;
      const url = `/packages/applicationBusinessCard/applicationBusinessCard?id=${id}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`;
      common_vendor.index.navigateTo({
        url
      });
    };
    const handleInviteAction = () => {
      common_vendor.index.showToast({
        title: "连接请求已发送",
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: paths.value.length > 0
      }, paths.value.length > 0 ? {
        b: common_vendor.p({
          type: "arrow-right",
          size: "20",
          color: "#FF6E00"
        }),
        c: common_vendor.t(targetName.value),
        d: common_vendor.t(minDegree.value),
        e: common_vendor.t(totalPathCount.value)
      } : {}, {
        f: common_vendor.f(paths.value, (group, gIdx, i0) => {
          return common_vendor.e({
            a: group.degreePathUsers.length > 0
          }, group.degreePathUsers.length > 0 ? {
            b: "5434b9df-1-" + i0,
            c: common_vendor.p({
              type: "fire-filled",
              size: "16",
              color: "#FF6E00"
            }),
            d: common_vendor.t(group.degreePathNum)
          } : {}, {
            e: common_vendor.f(group.degreePathUsers, (path, pIdx, i1) => {
              return {
                a: common_vendor.t(pIdx + 1),
                b: common_vendor.f(path, (user, uIdx, i2) => {
                  return common_vendor.e({
                    a: user.avatar || "/static/icon/default-avatar.png",
                    b: common_vendor.t(uIdx === 0 ? "您" : user.realName || user.nickname),
                    c: common_vendor.o(($event) => goUserCard(user, uIdx), user.id),
                    d: uIdx < path.length - 1
                  }, uIdx < path.length - 1 ? {} : {}, {
                    e: user.id
                  });
                }),
                c: pIdx
              };
            }),
            f: gIdx
          });
        }),
        g: isLoading.value
      }, isLoading.value ? {
        h: common_vendor.p({
          status: "loading",
          contentText: "正在计算最优人脉路径..."
        })
      } : paths.value.length === 0 ? {
        j: common_assets._imports_0$8,
        k: common_vendor.o(handleInviteAction)
      } : {}, {
        i: paths.value.length === 0
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5434b9df"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/packages/relationship-path/relationship-path.js.map
