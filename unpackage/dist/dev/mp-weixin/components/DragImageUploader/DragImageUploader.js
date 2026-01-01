"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const dragItemHeightRpx = 230;
const _sfc_main = {
  __name: "DragImageUploader",
  props: {
    // 双向绑定的图片数组
    modelValue: {
      type: Array,
      default: () => []
    },
    // 最大数量
    maxCount: {
      type: Number,
      default: 9
    },
    // 列数
    columns: {
      type: Number,
      default: 3
    }
  },
  emits: ["update:modelValue", "add-image"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const list = common_vendor.computed(() => props.modelValue);
    const dragDisplayList = common_vendor.ref([]);
    const dragItemWidth = common_vendor.ref(0);
    const dragItemHeight = common_vendor.ref(0);
    const dragAreaHeight = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const dragIndex = common_vendor.ref(-1);
    const addBtnPos = common_vendor.computed(() => {
      const index = list.value.length;
      return getPos(index);
    });
    common_vendor.onMounted(() => {
      initDragLayout();
      if (list.value.length > 0) {
        initDragList(list.value);
      }
    });
    common_vendor.watch(() => props.modelValue, (newVal) => {
      if (!isDragging.value) {
        initDragList(newVal);
      }
    }, {
      deep: true
    });
    const initDragLayout = () => {
      const sys = common_vendor.index.getSystemInfoSync();
      const containerWidth = sys.windowWidth - common_vendor.index.upx2px(100);
      dragItemWidth.value = containerWidth / props.columns;
      dragItemHeight.value = common_vendor.index.upx2px(dragItemHeightRpx);
    };
    const initDragList = (originList) => {
      if (!dragItemWidth.value)
        initDragLayout();
      dragDisplayList.value = originList.map((url, index) => {
        const {
          x,
          y
        } = getPos(index);
        return {
          id: `img_${index}_${Math.random()}`,
          // 唯一KEY
          data: url,
          x,
          y,
          zIndex: 1,
          realIndex: index
        };
      });
      updateDragHeight();
    };
    const getPos = (index) => {
      const row = Math.floor(index / props.columns);
      const col = index % props.columns;
      return {
        x: col * dragItemWidth.value,
        y: row * dragItemHeight.value
      };
    };
    const updateDragHeight = () => {
      let count = list.value.length;
      if (count < props.maxCount)
        count++;
      const rows = Math.ceil(count / props.columns);
      dragAreaHeight.value = (rows || 1) * dragItemHeight.value;
    };
    const handleAdd = () => {
      emit("add-image");
    };
    const deleteImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除？",
        success: (res) => {
          if (res.confirm) {
            const newList = [...props.modelValue];
            newList.splice(index, 1);
            emit("update:modelValue", newList);
          }
        }
      });
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: props.modelValue,
        current: index,
        loop: true
      });
    };
    const onMovableStart = (index) => {
      isDragging.value = true;
      dragIndex.value = index;
      if (dragDisplayList.value[index]) {
        dragDisplayList.value[index].zIndex = 99;
      }
    };
    const onMovableChange = (e, index) => {
      if (!isDragging.value || index !== dragIndex.value)
        return;
      const x = e.detail.x;
      const y = e.detail.y;
      const centerX = x + dragItemWidth.value / 2;
      const centerY = y + dragItemHeight.value / 2;
      const col = Math.floor(centerX / dragItemWidth.value);
      const row = Math.floor(centerY / dragItemHeight.value);
      let targetIndex = row * props.columns + col;
      if (targetIndex < 0)
        targetIndex = 0;
      if (targetIndex >= dragDisplayList.value.length)
        targetIndex = dragDisplayList.value.length - 1;
      if (targetIndex !== dragIndex.value) {
        const mover = dragDisplayList.value[dragIndex.value];
        const listCopy = [...dragDisplayList.value];
        listCopy.splice(dragIndex.value, 1);
        listCopy.splice(targetIndex, 0, mover);
        listCopy.forEach((item, idx) => {
          if (idx !== targetIndex) {
            const pos = getPos(idx);
            item.x = pos.x;
            item.y = pos.y;
          }
          item.realIndex = idx;
        });
        dragDisplayList.value = listCopy;
        dragIndex.value = targetIndex;
      }
    };
    const onMovableEnd = () => {
      isDragging.value = false;
      if (dragIndex.value !== -1) {
        const item = dragDisplayList.value[dragIndex.value];
        if (item) {
          item.zIndex = 1;
          const pos = getPos(dragIndex.value);
          common_vendor.nextTick$1(() => {
            item.x = pos.x;
            item.y = pos.y;
          });
        }
        const sortedUrls = dragDisplayList.value.map((wrapper) => wrapper.data);
        emit("update:modelValue", sortedUrls);
      }
      dragIndex.value = -1;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(dragDisplayList.value, (item, index, i0) => {
          return {
            a: item.data,
            b: common_vendor.o(($event) => previewImage(item.realIndex), item.id),
            c: common_vendor.o(($event) => deleteImage(item.realIndex), item.id),
            d: item.id,
            e: item.x,
            f: item.y,
            g: item.zIndex,
            h: !isDragging.value && item.zIndex === 1,
            i: common_vendor.o(($event) => onMovableChange($event, index), item.id),
            j: common_vendor.o(($event) => onMovableStart(index), item.id),
            k: common_vendor.o(onMovableEnd, item.id)
          };
        }),
        b: dragItemWidth.value + "px",
        c: dragItemHeight.value + "px",
        d: dragAreaHeight.value + "px",
        e: dragAreaHeight.value + "px",
        f: list.value.length < __props.maxCount
      }, list.value.length < __props.maxCount ? {
        g: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#ccc"
        }),
        h: dragItemWidth.value + "px",
        i: dragItemHeight.value + "px",
        j: addBtnPos.value.x + "px",
        k: addBtnPos.value.y + "px",
        l: common_vendor.o(handleAdd)
      } : {}, {
        m: dragAreaHeight.value + "px"
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cd345a4e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/DragImageUploader/DragImageUploader.js.map
