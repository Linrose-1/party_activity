"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_uni_rate2 = common_vendor.resolveComponent("uni-rate");
  _easycom_uni_rate2();
}
const _easycom_uni_rate = () => "../uni_modules/uni-rate/components/uni-rate/uni-rate.js";
if (!Math) {
  _easycom_uni_rate();
}
const _sfc_main = {
  __name: "ScoreForm",
  props: {
    // 分数对象，用于双向绑定
    modelValue: {
      type: Object,
      default: () => ({})
    },
    // 是否只读模式（用于查看他人评分时）
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const scores = common_vendor.ref({
      ...props.modelValue
    });
    common_vendor.watch(() => props.modelValue, (newVal) => {
      Object.assign(scores.value, newVal);
    }, {
      deep: true
    });
    const scoreCategories = [
      {
        title: "基础信用",
        items: [
          {
            label: "守时",
            key: "punctuality"
          },
          {
            label: "守诺",
            key: "promiseKeep"
          },
          {
            label: "守法",
            key: "lawAbiding"
          },
          {
            label: "尽责",
            key: "responsible"
          }
        ]
      },
      {
        title: "协作态度",
        items: [
          {
            label: "真诚",
            key: "sincere"
          },
          {
            label: "包容",
            key: "tolerance"
          },
          {
            label: "利他",
            key: "altruism"
          },
          {
            label: "共情",
            key: "empathy"
          }
        ]
      },
      {
        title: "专业能力",
        items: [
          {
            label: "专注",
            key: "focus"
          },
          {
            label: "高效",
            key: "efficient"
          },
          {
            label: "细致",
            key: "detailOriented"
          },
          {
            label: "拓局",
            key: "expandVision"
          }
        ]
      },
      {
        title: "精神格局",
        items: [
          {
            label: "贡献",
            key: "contribution"
          },
          {
            label: "谦逊",
            key: "humility"
          },
          {
            label: "远见",
            key: "foresight"
          },
          {
            label: "使命",
            key: "mission"
          }
        ]
      }
    ];
    const onRateChange = (key, e) => {
      if (props.readonly)
        return;
      scores.value[key] = e.value;
      emit("update:modelValue", {
        ...scores.value
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(scoreCategories, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.title),
            b: common_vendor.f(category.items, (item, k1, i1) => {
              return {
                a: common_vendor.t(item.label),
                b: common_vendor.o((e) => onRateChange(item.key, e), item.key),
                c: "8704d7b3-0-" + i0 + "-" + i1,
                d: common_vendor.p({
                  value: scores.value[item.key],
                  max: 10,
                  size: 18,
                  color: "#e0e0e0",
                  ["active-color"]: "#FF8C00",
                  ["allow-half"]: false,
                  readonly: __props.readonly
                }),
                e: common_vendor.t(scores.value[item.key]),
                f: item.key
              };
            }),
            c: category.title
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8704d7b3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ScoreForm.js.map
