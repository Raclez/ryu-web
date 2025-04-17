<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <Live2DWidget />
  </div>
</template>

<script setup lang="ts">
// App.vue根组件
</script>

<style>
.app {
  width: 100%;
  min-height: 100vh;
}
</style> 