
# 平台兼容性

移动端

# drag-sort-vue3 
基于 uni-app 的小程序拖拽组件，可用于 uni-app、mpvue、h5、app-nvue

> 遇到问题或有建议可以加入QQ群(455948571)反馈  
> 如果觉得组件不错，<font color=#f00>给五星鼓励鼓励</font>咯！
> 
# 如何使用
下载后放到项目目录中（在 uni-app 中运行到 H5 端需 HBuilderX 2.0 及以上版本）

如果直接通过uni_modules的方式下载，可以不需要单独引入直接在uniapp项目中使用

# 基本用法
```javascript
<template>
  <u-popup :show="show" @close="close" @open="open">
		<view style="height: 500px">
			<drag-sort-vue3 :list="list" :props="{label: 'label'}" @change="sortChange"></drag-sort-vue3>
		</view>
	</u-popup>
</template>

<script lang="ts" setup>
import { ref, defineEmits, defineProps } from 'vue'
import dragSortVue3 from '../drag-sort-vue3/index.vue'

const emits = defineEmits(['close']);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
const list = ref([
				{
					label: '项目1'
				},
				{
					label: '项目2'
				},
				{
					label: '项目3'
				},
				{
					label: '项目4'
				},
				{
					label: '项目5'
				},
				{
					label: '项目6'
				}
			])
function close () {
	emits('close')
}
function sortChange (arr: any) {
	console.log('改变后的数据', arr)
}
</script>
 
<style lang="scss" scoped>

</style>

```
### 如果有使用问题请加群

注意：如果插件问题，请务必给一个完整的复现demo，谢谢配合；
[点击链接加入群聊前端开发（uniapp插件）】](https://qm.qq.com/q/S1bJzQfJAG)

### 预览

***

|                 						功能预览    						                			|   
| :---------------------------------------------------------------------: |
| ![](https://lixueshiaa.github.io/webtest/www/static/drag-sort-vue3.gif) |