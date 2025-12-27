"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "GridDrag",
  props: {
    list: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Number,
      default: 3
    },
    itemHeightRpx: {
      type: Number,
      default: 230
    }
  },
  emits: ["change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const displayList = common_vendor.ref([]);
    const itemWidth = common_vendor.ref(0);
    const itemHeight = common_vendor.ref(0);
    const areaHeight = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const dragIndex = common_vendor.ref(-1);
    const initLayout = () => {
      const sys = common_vendor.index.getSystemInfoSync();
      const containerWidth = sys.windowWidth - common_vendor.index.upx2px(40);
      itemWidth.value = containerWidth / props.columns;
      itemHeight.value = common_vendor.index.upx2px(props.itemHeightRpx);
      common_vendor.index.__f__("log", "at components/GridDrag/GridDrag.vue:61", "📏 [GridDrag] 尺寸计算:", {
        w: itemWidth.value,
        h: itemHeight.value
      });
    };
    const initList = (originList) => {
      if (itemWidth.value === 0)
        initLayout();
      if (!originList || originList.length === 0) {
        displayList.value = [];
        areaHeight.value = 0;
        return;
      }
      common_vendor.index.__f__("log", "at components/GridDrag/GridDrag.vue:77", "🔄 [GridDrag] 初始化列表, 长度:", originList.length);
      displayList.value = originList.map((item, index) => {
        const {
          x,
          y
        } = getPos(index);
        return {
          // 必须给一个随机ID，防止 Vue 复用导致图片不刷新
          id: `item_${index}_${Math.random().toString(36).substr(2)}`,
          data: item,
          x,
          y,
          zIndex: 1,
          realIndex: index
        };
      });
      updateAreaHeight();
    };
    const getPos = (index) => {
      const row = Math.floor(index / props.columns);
      const col = index % props.columns;
      return {
        x: col * itemWidth.value,
        y: row * itemHeight.value
      };
    };
    const updateAreaHeight = () => {
      const count = displayList.value.length;
      const rows = Math.ceil(count / props.columns);
      areaHeight.value = rows * itemHeight.value;
      common_vendor.index.__f__("log", "at components/GridDrag/GridDrag.vue:114", "📏 [GridDrag] 容器高度更新:", areaHeight.value);
    };
    common_vendor.onMounted(() => {
      initLayout();
      if (props.list.length > 0) {
        initList(props.list);
      }
    });
    common_vendor.watch(() => props.list, (newVal) => {
      if (!isDragging.value) {
        initList(newVal);
      }
    }, {
      deep: true,
      immediate: true
    });
    const onTouchStart = (index) => {
      isDragging.value = true;
      dragIndex.value = index;
      displayList.value[index].zIndex = 99;
    };
    const onChange = (e, index) => {
      if (!isDragging.value || index !== dragIndex.value)
        return;
      const x = e.detail.x;
      const y = e.detail.y;
      const centerX = x + itemWidth.value / 2;
      const centerY = y + itemHeight.value / 2;
      const col = Math.floor(centerX / itemWidth.value);
      const row = Math.floor(centerY / itemHeight.value);
      let targetIndex = row * props.columns + col;
      if (targetIndex < 0)
        targetIndex = 0;
      if (targetIndex >= displayList.value.length)
        targetIndex = displayList.value.length - 1;
      if (targetIndex !== dragIndex.value) {
        const mover = displayList.value[dragIndex.value];
        displayList.value.splice(dragIndex.value, 1);
        displayList.value.splice(targetIndex, 0, mover);
        displayList.value.forEach((item, idx) => {
          if (idx !== targetIndex) {
            const pos = getPos(idx);
            item.x = pos.x;
            item.y = pos.y;
          }
        });
        dragIndex.value = targetIndex;
      }
    };
    const onTouchEnd = () => {
      isDragging.value = false;
      if (dragIndex.value !== -1) {
        const item = displayList.value[dragIndex.value];
        item.zIndex = 1;
        const pos = getPos(dragIndex.value);
        common_vendor.nextTick$1(() => {
          item.x = pos.x;
          item.y = pos.y;
        });
        const sortedData = displayList.value.map((wrapper) => wrapper.data);
        emits("change", sortedData);
      }
      dragIndex.value = -1;
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(displayList.value, (item, index, i0) => {
          return {
            a: "d-" + i0,
            b: common_vendor.r("d", {
              item: item.data,
              index
            }, i0),
            c: item.id,
            d: item.x,
            e: item.y,
            f: item.zIndex,
            g: !isDragging.value && item.zIndex === 1,
            h: common_vendor.o(($event) => onChange($event, index), item.id),
            i: common_vendor.o(($event) => onTouchStart(index), item.id),
            j: common_vendor.o(onTouchEnd, item.id)
          };
        }),
        b: itemWidth.value + "px",
        c: itemHeight.value + "px",
        d: areaHeight.value + "px",
        e: areaHeight.value + "px"
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-15512d7a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/GridDrag/GridDrag.js.map
