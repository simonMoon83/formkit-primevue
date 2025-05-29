<template>
  <div class="p-3">
    <Menu :model="menuItems" class="w-full border-none" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Menu from 'primevue/menu';

const menuItems = ref([
  {
    label: '입력 컴포넌트',
    items: [
      { label: '텍스트 입력', to: '/inputs/InputText' },
      { label: '선택 상자', to: '/inputs/Select' },
      { label: '체크박스', to: '/inputs/Checkbox' },
      { label: '라디오 버튼', to: '/inputs/RadioButton' }
    ]
  },
  {
    label: '폼 샘플',
    items: [
      { label: '기본 폼', to: '/samples/BasicForm' },
      { label: '그리드 폼', to: '/samples/GridFormDemo' },
      { label: '그리드 폼 2', to: '/samples/GridFormDemo2' },
      { label: '폼 에디터', to: '/samples/FormEditor' }
    ]
  }
]);
</script>

<style scoped>
:deep(.p-menu) {
  width: 100%;
  border: none;
  background: transparent;
}

:deep(.p-menuitem) {
  margin-bottom: 0.25rem;
}
</style>
