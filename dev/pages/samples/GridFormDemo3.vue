<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import Button from 'primevue/button'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// Import AG-Grid CSS
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

// ===== AG-Grid 관련 설정 =====

// 상태 관리
const rowData = ref([])
const isLoading = ref(true)
const loadingError = ref('')

// 간소화된 컬럼 정의
const columnDefs = ref([
  { field: 'mission', headerName: '임무' },
  { field: 'company', headerName: '회사' },
  { field: 'location', headerName: '위치' },
  { 
    field: 'date', 
    headerName: '날짜',
    valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
  },
  { 
    field: 'price', 
    headerName: '가격',
    valueFormatter: (params) => params.value ? '₩' + params.value.toLocaleString() : ''
  },
  { field: 'successful', headerName: '성공 여부' },
  { field: 'rocket', headerName: '로켓' }
])

// 기본 설정 간소화
const defaultColDef = ref({
  sortable: true,
  filter: true,
  resizable: true
})

// 대용량 데이터 처리를 위한 그리드 옵션
const gridOptions = ref({
  pagination: true,
  paginationPageSize: 10,
  cacheBlockSize: 10
})

// ===== 데이터 로딩 관련 함수 =====

// AG-Grid 데이터 가져오기
const fetchGridData = async () => {
  try {
    const response = await fetch(
      "https://www.ag-grid.com/example-assets/space-mission-data.json"
    )
    return await response.json()
  } catch (error) {
    console.error("Error fetching grid data:", error)
    throw new Error('그리드 데이터를 가져오는 중 오류가 발생했습니다')
  }
}

// 폼 데이터 초기화
const formData = ref({})

formData.value = {
  name: "aaaa",
  email: "aaa@bbb.com",
  age: 11,
  gender: "male",
  subscribe: true,
  phone: "010-8766-3277",
  address: "경기 성남시 수정구 신흥2동\n599번지 1층",
  contactMethod: "email",
  interests: [
    "sports",
    "music"
  ]
}

// 제출 핸들러
function handleSubmit(data: any) {
  console.log('제출된 데이터:', data)
  alert('폼이 성공적으로 제출되었습니다!')
}

// 초기화 핸들러
function handleReset() {
  formData.value = {}
}

// 테스트 핸들러
function handleTest() {
  console.log('테스트 버튼 클릭')
}

// 데이터베이스에서 가져온 옵션 데이터
const genderOptions = ref([])
const contactOptions = ref([])
const interestsOptions = ref([])

// 스키마 상태
const schema = ref([])

// 데이터베이스에서 옵션 데이터 가져오기 (시뮬레이션)
async function fetchOptionsFromDB() {
  // 실제로는 API 호출이 될 것입니다
  // 예: const response = await fetch('/api/options')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        genders: [
          { value: 'male', label: '남성' },
          { value: 'female', label: '여성' },
          { value: 'other', label: '기타' }
        ],
        contacts: [
          { value: 'email', label: '이메일' },
          { value: 'phone', label: '전화' },
          { value: 'sms', label: 'SMS' }
        ],
        interests: [
          { value: 'tech', label: '기술' },
          { value: 'sports', label: '스포츠' },
          { value: 'music', label: '음악' },
          { value: 'travel', label: '여행' }
        ]
      })
    }, 500) // 0.5초 지연으로 데이터베이스 응답 시뮬레이션
  })
}

// 데이터베이스에서 스키마 가져오기 (시뮬레이션)
async function fetchSchemaFromDB() {
  // 실제로는 API 호출이 될 것입니다
  // 예: const response = await fetch('/api/form-schema/grid-form')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        // 헤더 섹션
        {
          $el: 'div',
          attrs: { class: 'mb-4' },
          children: [
            {
              $el: 'h2',
              attrs: { class: 'text-xl font-bold text-color' },
              children: '간단한 그리드 폼 예제'
            },
            {
              $el: 'p',
              attrs: { class: 'text-color-secondary mt-2' },
              children: '데이터베이스에서 로드된 그리드 레이아웃 폼입니다.'
            }
          ]
        },
        // 헤더 행
        {
          $el: 'div',
          attrs: {
            class: 'grid grid-cols-4 gap-4 mb-4'
          },
          children: [
            {
              $el: 'div',
              attrs: { class: 'col-span-1' },
              children: [
                {
                  $formkit: 'primeInputText',
                  name: 'name',
                  label: '이름',
                  validation: 'required',
                  help: '사용자 이름을 입력하세요',
                  class: 'w-full'
                }
              ]
            },
            {
              $el: 'div',
              attrs: { class: 'col-span-1' },
              children: [
                {
                  $formkit: 'primeInputText',
                  name: 'email',
                  label: '이메일',
                  validation: 'required|email',
                  help: '유효한 이메일 주소를 입력하세요',
                  class: 'w-full'
                }
              ]
            },
            {
              $el: 'div',
              attrs: { class: 'col-span-1' },
              children: [
                {
                  $formkit: 'primeInputNumber',
                  name: 'age',
                  label: '나이',
                  validation: 'required|min_number:1|max_number:120',
                  help: '1-120 사이의 값 입력',
                  class: 'w-full'
                }
              ]
            },
            {
              $el: 'div',
              attrs: { class: 'col-span-1' },
              children: [
                {
                  $formkit: 'primeSelect',
                  name: 'gender',
                  label: '성별',
                  optionLabel: 'label',
                  optionValue: 'value',
                  options: genderOptions,
                  help: '성별을 선택하세요',
                  class: 'w-full'
                }
              ]
            }
          ]
        },
        
        // 두 번째 행
        {
          $el: 'div',
          attrs: {
            class: 'grid grid-cols-2 gap-4 mb-4'
          },
          children: [
            {
              $el: 'div',
              attrs: { class: 'col-span-1' },
              children: [
                {
                  $formkit: 'primeCheckbox',
                  name: 'subscribe',
                  label: '뉴스레터 구독',
                  help: '뉴스레터를 받으시려면 체크하세요',
                  class: 'w-full'
                }
              ]
            },
            {
              $el: 'div',
              attrs: { class: 'col-span-1' },
              children: [
                {
                  $formkit: 'primeInputMask',
                  name: 'phone',
                  label: '전화번호',
                  mask: '999-9999-9999',
                  help: '000-0000-0000 형식',
                  class: 'w-full'
                }
              ]
            },
            {
              $el: 'div',
              attrs: { class: 'col-span-2' },
              children: [
                {
                  $formkit: 'primeTextarea',
                  name: 'address',
                  label: '주소',
                  help: '상세 주소를 입력하세요',
                  rows: 3,
                  class: 'w-full'
                }
              ]
            }
          ]
        },
        
        // 세 번째 행
        {
          $el: 'div',
          attrs: {
            class: 'grid grid-cols-4 gap-4 mb-4'
          },
          children: [
            {
              $el: 'div',
              attrs: { class: 'col-span-2' },
              children: [
                {
                  $formkit: 'primeRadioButton',
                  name: 'contactMethod',
                  label: '선호하는 연락 방법',
                  optionLabel: 'label',
                  optionValue: 'value',
                  options: contactOptions,
                  help: '선호하는 연락 방법을 선택하세요',
                  class: 'w-full'
                }
              ]
            },
            {
              $el: 'div',
              attrs: { class: 'col-span-2' },
              children: [
                {
                  $formkit: 'primeMultiSelect',
                  name: 'interests',
                  label: '관심사',
                  optionLabel: 'label',
                  optionValue: 'value',
                  options: interestsOptions,
                  help: '관심 분야를 선택하세요',
                  class: 'w-full'
                }
              ]
            }
          ]
        },
        
        // 버튼 영역
        {
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
            },
            {
              $formkit: 'button',
              label: '테스트',
              onClick: handleTest,
              attrs: {
                type: 'button',
                class: 'p-button p-component p-button-secondary'
              }
            }
          ]
        }
      ])
    }, 800) // 0.8초 지연으로 데이터베이스 응답 시뮬레이션
  })
}

// 데이터 로드 함수
async function loadFormData() {
  try {
    isLoading.value = true
    loadingError.value = null
    
    // 옵션 데이터 로드
    const optionsData = await fetchOptionsFromDB()
    genderOptions.value = optionsData.genders
    contactOptions.value = optionsData.contacts
    interestsOptions.value = optionsData.interests
    
    // 스키마 로드
    const schemaData = await fetchSchemaFromDB()
    schema.value = schemaData
    
    console.log('데이터베이스에서 스키마 로드 완료')
  } catch (error) {
    console.error('스키마 로딩 실패:', error)
    loadingError.value = '스키마를 로드하는 중 오류가 발생했습니다'
  } finally {
    isLoading.value = false
  }
}

// 통합 데이터 로딩 함수
const loadAllData = async () => {
  isLoading.value = true
  loadingError.value = ''
  
  try {
    // 병렬로 폼 데이터와 그리드 데이터 로딩
    const [formResult, gridResult] = await Promise.all([
      loadFormData(),
      fetchGridData()
    ])
    
    // 결과 적용
    rowData.value = gridResult
  } catch (error) {
    console.error('Error loading data:', error)
    loadingError.value = typeof error === 'string' ? error : '데이터 로딩 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadAllData()
})
</script>

<template>
  <div class="grid-form-container p-4 surface-card border-round shadow-2">
    <!-- 공통 로딩/에러 상태 -->
    <div v-if="isLoading" class="loading-container flex align-items-center justify-content-center py-5">
      <i class="pi pi-spin pi-spinner mr-2" style="font-size: 1.5rem"></i>
      <span>데이터 로딩 중...</span>
    </div>
    
    <div v-else-if="loadingError" class="error-container p-3 bg-red-100 text-red-700 border-round mb-4">
      <i class="pi pi-exclamation-triangle mr-2"></i>
      {{ loadingError }}
      <Button label="다시 시도" icon="pi pi-refresh" class="p-button-sm mt-2" @click="loadAllData" />
    </div>
    
    <div v-else class="content-container">
      <!-- 폼 섹션 -->
      <section class="form-section mb-4">
        <FormKit
          type="form"
          v-model="formData"
          @submit="handleSubmit"
          @reset="handleReset"
          #default="{ state }"
          
        >
          <FormKitSchema :schema="schema" />
        </FormKit>
      </section>
      
      <!-- 그리드 섹션 -->
      <section class="grid-section mb-4">
        <h3 class="text-lg font-semibold mb-2">우주 임무 데이터</h3>
        <div class="ag-theme-quartz" style="height: 400px; width: 100%;">
          <ag-grid-vue
            style="width: 100%; height: 100%"
            :columnDefs="columnDefs"
            :rowData="rowData"
            :defaultColDef="defaultColDef"
            :gridOptions="gridOptions"
            :theme="ThemeQuartz"
          ></ag-grid-vue>
        </div>
      </section>
      
      <!-- 데이터 표시 섹션 -->
      <section class="data-display-section mt-4 p-3 border-1 border-dashed surface-border">
        <h3 class="text-lg font-semibold mb-2 text-color">현재 폼 데이터</h3>
        <pre class="text-sm text-color surface-ground p-2 border-round">{{ JSON.stringify(formData, null, 2) }}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 기본 스타일 */
.grid-form-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* AG-Grid 기본 스타일 - 기본적인 기능에 집중 */
.ag-theme-alpine {
  --ag-header-height: 40px;
  --ag-row-height: 35px;
}
</style>
