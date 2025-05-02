<template>
  <div class="env-info-container" v-if="showEnvInfo">
    <div class="env-info" :class="envClass">
      <span>{{ envInfo }}</span>
      <span class="version">v{{ version }}</span>
      <button class="close-btn" @click="closeEnvInfo">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ENV, APP_VERSION, isDev, isTest, isStaging } from '@/utils/env';

// 是否显示环境信息条
const showEnvInfo = ref(true);

// 关闭环境信息条
const closeEnvInfo = () => {
  showEnvInfo.value = false;
};

// 版本号
const version = APP_VERSION;

// 环境信息类名
const envClass = computed(() => {
  if (isDev) return 'development';
  if (isTest) return 'test';
  if (isStaging) return 'staging';
  return '';
});

// 环境信息文本
const envInfo = computed(() => {
  switch (ENV) {
    case 'development':
      return '开发环境';
    case 'test':
      return '测试环境';
    case 'staging':
      return '预发布环境';
    case 'production':
      return '';
    default:
      return ENV;
  }
});
</script>

<style scoped>
.env-info-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
}

.env-info {
  padding: 4px 15px;
  font-size: 12px;
  color: #fff;
  background-color: #52c41a;
  border-radius: 0 0 4px 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.env-info.development {
  background-color: #1890ff;
}

.env-info.test {
  background-color: #fa8c16;
}

.env-info.staging {
  background-color: #722ed1;
}

.version {
  opacity: 0.8;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  padding: 0 0 0 8px;
  line-height: 1;
}
</style> 