<template>
  <div class="app-container">
    <!-- 헤더 -->
    <header class="header-area p-3 flex justify-content-between align-items-center text-white">
      <div class="flex align-items-center">
        <i class="pi pi-bars mr-3 cursor-pointer md:hidden" @click="sidebarVisible = true"></i>
        <h1 class="m-0">FormKit PrimeVue</h1>
      </div>
      <div>
        <i class="pi pi-user"></i>
      </div>
    </header>
    
    <div class="flex layout-content">
      <!-- 모바일용 사이드바 -->
      <Sidebar v-model:visible="sidebarVisible" class="md:hidden">
        <SideMenu />
      </Sidebar>
      
      <!-- 데스크탑용 사이드바 -->
      <div class="sidebar md:block hidden">
        <SideMenu />
      </div>
      
      <!-- 메인 콘텐츠 -->
      <div class="content-area p-3">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from 'primevue/sidebar';
import SideMenu from '../components/SideMenu.vue';

const sidebarVisible = ref(false);

// 기본 다크모드 설정
onMounted(() => {
  // HTML 요소에 dark 클래스 추가
  document.documentElement.classList.add('dark');
  
  // PrimeVue 테마 설정 (PrimeVue가 테마 변경을 지원하는 경우)
  const linkElement = document.getElementById('theme-link') || document.createElement('link');
  if (!document.getElementById('theme-link')) {
    linkElement.id = 'theme-link';
    linkElement.rel = 'stylesheet';
    document.head.appendChild(linkElement);
  }
  linkElement.href = '/themes/lara-dark-indigo/theme.css';
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.header-area {
  background-color: #1565C0;
}

:root.dark .header-area {
  background-color: #0D47A1;
}

.layout-content {
  min-height: calc(100vh - 64px); /* 헤더 높이를 빼분 값 */
}

.sidebar {
  width: 250px;
  background-color: var(--surface-card);
  border-right: 1px solid var(--surface-border);
}

.content-area {
  flex: 1;
  background-color: var(--surface-ground);
  color: var(--text-color);
  padding: 1.5rem;
}

/* 다크모드 스타일 */
:root.dark {
  --surface-ground: #121212;
  --surface-card: #1e1e1e;
  --surface-border: #383838;
  --text-color: #f5f5f5;
}

@media (max-width: 768px) {
  .layout-content {
    display: block;
  }
}
</style>
