"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_user = require("../../utils/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "recharge",
  setup(__props) {
    const currentTab = common_vendor.ref(1);
    const isPaying = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const zhimiOptions = [10, 20, 50, 100, 500];
    const selectedZhimiIndex = common_vendor.ref(0);
    const customAmount = common_vendor.ref("");
    const memberLevels = common_vendor.ref([
      {
        id: 1,
        name: "玄铁会员",
        price: 10,
        period: "月",
        desc: "基础功能体验",
        isRecommended: false
      },
      {
        id: 2,
        name: "青铜会员",
        price: 100,
        period: "月",
        desc: "进阶商友特权",
        isRecommended: false
      },
      {
        id: 3,
        name: "白银会员",
        price: 365,
        period: "年",
        desc: "超高性价比首选",
        isRecommended: true
      },
      {
        id: 4,
        name: "黄金会员",
        price: 3650,
        period: "年",
        desc: "尊享全部权益",
        isRecommended: false
      },
      {
        id: 5,
        name: "黑钻会员",
        price: 36500,
        period: "年",
        desc: "顶级身份象征",
        isRecommended: false
      }
    ]);
    const selectedMemberId = common_vendor.ref(3);
    const payAmount = common_vendor.computed(() => {
      if (currentTab.value === 1) {
        if (customAmount.value) {
          return parseFloat(customAmount.value).toFixed(2);
        }
        if (selectedZhimiIndex.value !== -1) {
          return zhimiOptions[selectedZhimiIndex.value].toFixed(2);
        }
        return 0;
      } else {
        const level = memberLevels.value.find((item) => item.id === selectedMemberId.value);
        return level ? level.price.toFixed(2) : 0;
      }
    });
    common_vendor.onLoad((options) => {
      if (options.type === "membership") {
        currentTab.value = 2;
      }
    });
    common_vendor.onMounted(() => {
      fetchUserInfo();
    });
    const switchTab = (index) => {
      currentTab.value = index;
      if (index === 1) {
        customAmount.value = "";
        selectedZhimiIndex.value = 0;
      }
    };
    const selectZhimiOption = (index) => {
      selectedZhimiIndex.value = index;
      customAmount.value = "";
    };
    const onCustomInput = () => {
      if (customAmount.value) {
        selectedZhimiIndex.value = -1;
      }
    };
    const selectMemberLevel = (level) => {
      selectedMemberId.value = level.id;
    };
    const fetchUserInfo = async () => {
      const {
        data
      } = await utils_request.request("/app-api/member/user/get");
      if (data)
        userInfo.value = data;
    };
    const goToMemberDetails = () => {
      const currentLevel = memberLevels.value.find((item) => item.id === selectedMemberId.value);
      const targetLevelNum = currentLevel ? currentLevel.level : 1;
      common_vendor.index.navigateTo({
        // 带上参数，让详情页自动定位到对应的 Tab
        url: `/pages/my-memberDetails/my-memberDetails?level=${targetLevelNum}`
      });
    };
    const createOrder = async () => {
      var _a;
      let payload = {
        userId: userInfo.value.id,
        payType: currentTab.value,
        // 1-智米, 2-会员
        remark: currentTab.value === 2 ? `购买会员:${(_a = memberLevels.value.find((l) => l.id === selectedMemberId.value)) == null ? void 0 : _a.name}` : "充值智米"
      };
      if (currentTab.value === 2) {
        payload.levelId = selectedMemberId.value;
      } else {
        payload.amount = parseFloat(payAmount.value);
      }
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:282", "1. 开始创建订单, 参数:", payload);
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-post-pay-record/create", {
        method: "POST",
        data: payload
      });
      if (error)
        throw new Error(error);
      return data;
    };
    const getPayParams = async (orderNo) => {
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:303", "正在获取支付签名，订单号:", orderNo);
      const {
        data,
        error
      } = await utils_request.request("/app-api/member/user-post-pay-record/pay", {
        method: "POST",
        data: {
          orderNo: orderNo.orderNo
        }
      });
      if (error)
        throw new Error(error);
      return data;
    };
    const requestWxPayment = (params) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.requestPayment({
          provider: "weixin",
          timeStamp: params.timeStamp,
          nonceStr: params.nonceStr,
          package: params.package,
          signType: params.signType,
          paySign: params.paySign,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:331", "微信支付成功:", res);
            resolve(res);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:335", "微信支付失败/取消:", err);
            if (err.errMsg.includes("cancel")) {
              reject(new Error("用户取消支付"));
            } else {
              reject(new Error("支付失败，请重试"));
            }
          }
        });
      });
    };
    const handleRecharge = async () => {
      if (!utils_user.checkLoginGuard())
        return;
      if (parseFloat(payAmount.value) <= 0) {
        return common_vendor.index.showToast({
          title: "支付金额异常",
          icon: "none"
        });
      }
      if (currentTab.value === 1 && parseFloat(payAmount.value) < 1) {
        return common_vendor.index.showToast({
          title: "智米最小充值 1 元",
          icon: "none"
        });
      }
      isPaying.value = true;
      common_vendor.index.showLoading({
        title: "正在创建订单...",
        mask: true
      });
      try {
        const orderNo = await createOrder();
        common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:378", "订单创建成功，订单号:", orderNo);
        common_vendor.index.showLoading({
          title: "请求支付中..."
        });
        const payParams = await getPayParams(orderNo);
        await requestWxPayment(payParams);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        const msg = error.message || "支付异常";
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:409", "支付流程中断:", error);
        if (msg === "用户取消支付") {
          common_vendor.index.showToast({
            title: "已取消支付",
            icon: "none"
          });
        } else {
          common_vendor.index.showModal({
            title: "支付失败",
            content: msg,
            showCancel: false
          });
        }
      } finally {
        isPaying.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === 1
      }, currentTab.value === 1 ? {} : {}, {
        b: currentTab.value === 1 ? 1 : "",
        c: common_vendor.o(($event) => switchTab(1)),
        d: currentTab.value === 2
      }, currentTab.value === 2 ? {} : {}, {
        e: currentTab.value === 2 ? 1 : "",
        f: common_vendor.o(($event) => switchTab(2)),
        g: currentTab.value === 1
      }, currentTab.value === 1 ? {
        h: common_vendor.f(zhimiOptions, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: common_vendor.t(item),
            c: index,
            d: selectedZhimiIndex.value === index ? 1 : "",
            e: common_vendor.o(($event) => selectZhimiOption(index), index)
          };
        }),
        i: common_vendor.o([($event) => customAmount.value = $event.detail.value, onCustomInput]),
        j: customAmount.value
      } : {}, {
        k: currentTab.value === 2
      }, currentTab.value === 2 ? {
        l: common_vendor.p({
          type: "right",
          size: "12",
          color: "#FF6E00"
        }),
        m: common_vendor.o(goToMemberDetails),
        n: common_vendor.f(memberLevels.value, (level, index, i0) => {
          return common_vendor.e({
            a: level.isRecommended
          }, level.isRecommended ? {} : {}, {
            b: common_vendor.t(level.name),
            c: common_vendor.t(level.desc),
            d: common_vendor.t(level.price),
            e: common_vendor.t(level.period),
            f: selectedMemberId.value === level.id
          }, selectedMemberId.value === level.id ? {} : {}, {
            g: index,
            h: selectedMemberId.value === level.id ? 1 : "",
            i: level.isRecommended ? 1 : "",
            j: common_vendor.o(($event) => selectMemberLevel(level), index)
          });
        })
      } : {}, {
        o: common_vendor.t(payAmount.value || "0.00"),
        p: common_vendor.t(isPaying.value ? "支付中..." : "立即支付"),
        q: common_vendor.o(handleRecharge),
        r: isPaying.value || payAmount.value <= 0,
        s: isPaying.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2984a38c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map
