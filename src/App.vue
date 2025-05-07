<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <Live2DWidget />
    <MobileMenu :categories="categories"/>
  </div>
</template>

<script setup lang="ts">
// App.vue根组件
import MobileMenu from './components/MobileMenu.vue';
import {onMounted, ref} from 'vue';

// 模拟分类数据，实际项目中可能从API获取
const categories = ref([
  {id: '1', name: '前端'},
  {id: '2', name: '后端'},
  {id: '3', name: 'AI'},
  {id: '4', name: '数据库'}
]);

// 在实际项目中，可能需要从API获取分类数据
onMounted(async () => {
  // 获取分类数据的逻辑
  // const result = await fetchCategories();
  // categories.value = result.data;
});
</script>

<style>
.app {
  width: 100%;
  min-height: 100vh;
}
</style>
