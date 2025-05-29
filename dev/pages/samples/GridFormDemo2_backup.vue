<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FormKitSchema } from '@formkit/vue'

// 폼 데이터 초기화
const formData = ref({})

// 제출 핸들러
function handleSubmit(data: any) {
  console.log('제출된 데이터:', data)
  alert('폼이 성공적으로 제출되었습니다!')
}

// 초기화 핸들러
function handleReset() {
  formData.value = {}
}

// 4x4 그리드를 위한 스키마 생성
function createGridSchema() {
  const rows = 4
  const cols = 4
  const gridSchema = []
  
  // 각 행을 위한 그룹 생성
  for (let row = 1; row <= rows; row++) {
    const rowItems = []
    
    // 각 열에 대한 입력 필드 생성
    for (let col = 1; col <= cols; col++) {
      const fieldName = `field_${row}_${col}`
      const label = `항목 ${row}-${col}`
      
      // 다양한 입력 타입 사용
      let inputType
      const index = (row - 1) * cols + col
      
      if (index % 5 === 0) {
        inputType = 'primeSelect'
      } else if (index % 4 === 0) {
        inputType = 'primeCheckbox'
      } else if (index % 3 === 0) {
        inputType = 'primeInputNumber'
      } else {
        inputType = 'primeInputText'
      }
      
      // 입력 필드 스키마 생성
      const fieldSchema = {
        $formkit: inputType,
        name: fieldName,
        label: label,
        validation: index % 3 === 0 ? 'required' : '',
        help: `${label}에 대한 도움말`,
        class: 'w-full'
      }
      
      // Select 타입일 경우 옵션 추가
      if (inputType === 'primeSelect') {
        fieldSchema.options = [
          { value: 'option1', label: '옵션 1' },
          { value: 'option2', label: '옵션 2' },
          { value: 'option3', label: '옵션 3' }
        ]
      }
      
      rowItems.push(fieldSchema)
    }
    
    // 행 그룹 추가
    gridSchema.push({
      $el: 'div',
      attrs: {
        class: 'grid grid-cols-4 gap-4 mb-4'
      },
      children: rowItems.map(item => ({
        $el: 'div',
        attrs: {
          class: 'col-span-1'
        },
        children: [item]
      }))
    })
  }
  
  // 버튼 영역 추가
  gridSchema.push({
    $el: 'div',
    attrs: {
      class: 'flex justify-content-end gap-2 mt-4'
    },
    children: [
      {
        $formkit: 'button',
        label: '초기화',
        onClick: handleReset,
        attrs: {
          type: 'button',
          class: 'p-button p-component p-button-secondary'
        }
      },
      {
        $formkit: 'submit',
        label: '제출',
        attrs: {
          class: 'p-button p-component p-button-primary'
        }
      }
    ]
  })
  
  return gridSchema
}

// 스키마 생성
const schema = createGridSchema()
</script>

<template>
  <div class="formkit-card p-4 surface-card border-round shadow-2">
    <div class="mb-4">
      <h2 class="text-xl font-bold text-color">4x4 그리드 폼 데모</h2>
    </div>
    
    <FormKit
      type="form"
      v-model="formData"
      :actions="false"
      @submit="handleSubmit"
    >
      <FormKitSchema :schema="schema" />
    </FormKit>
    
    <div class="mt-6 p-3 border-1 border-dashed surface-border">
      <h3 class="text-lg font-semibold mb-2 text-color">현재 폼 데이터</h3>
      <pre class="text-sm text-color surface-ground p-2 border-round">{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.formkit-card {
  max-width: 1200px;
  margin: 0 auto;
}

pre {
  white-space: pre-wrap;
  overflow-x: auto;
}

:deep(.p-component) {
  font-family: var(--font-family);
}

:deep(.formkit-outer) {
  margin-bottom: 1rem;
}

:deep(.formkit-label) {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

:deep(.formkit-input) {
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

:deep(.formkit-help) {
  color: var(--text-color-secondary);
}
</style>
