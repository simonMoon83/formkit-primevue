<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormKitSchema } from '@formkit/vue'
import Button from 'primevue/button'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community'

// Import AG-Grid CSS - 새로운 테마 API 사용을 위해 ag-grid.css 제거
import 'ag-grid-community/styles/ag-theme-quartz.css'

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

// ===== 타입 정의 =====
interface SpaceMissionData {
  date: string
  mission: string
  location: string
  price: number
  company: string
  successful: boolean
}

interface SearchFormData {
  date_from?: string
  date_to?: string
  mission?: string
  company?: string
  location?: string
  price_min?: number
  price_max?: number
  successful?: string
  guard?: boolean
  event?: boolean
}

// ===== AG-Grid 관련 설정 =====

// 상태 관리
const rowData = ref<SpaceMissionData[]>([])
const originalRowData = ref<SpaceMissionData[]>([]) // 원본 데이터 저장용
const isLoading = ref(false)
const loadingError = ref('')

// 콤럼 정의 - MES 스타일로 수정
const columnDefs = ref<ColDef<SpaceMissionData>[]>([
  { 
    field: 'date', 
    headerName: '날짜',
    width: 110,
    valueFormatter: (params: ValueFormatterParams) => params.value ? new Date(params.value).toLocaleDateString() : '',
    headerClass: 'grid-header-cell',
    cellClass: 'grid-cell'
  },
  { 
    field: 'mission', 
    headerName: '임무명',
    width: 180,
    headerClass: 'grid-header-cell',
    cellClass: 'grid-cell'
  },
  { 
    field: 'location', 
    headerName: '위치', 
    width: 120,
    headerClass: 'grid-header-cell',
    cellClass: 'grid-cell'
  },
  { 
    field: 'price', 
    headerName: '금액',
    width: 120,
    valueFormatter: (params: ValueFormatterParams) => params.value ? params.value.toLocaleString() : '',
    headerClass: 'grid-header-cell text-right',
    cellClass: 'grid-cell text-right'
  },
  { 
    field: 'company', 
    headerName: '회사명',
    width: 120, 
    headerClass: 'grid-header-cell',
    cellClass: 'grid-cell'
  },
  { 
    field: 'successful', 
    headerName: '상태',
    width: 100,
    valueFormatter: (params: ValueFormatterParams) => params.value ? '성공' : '실패',
    headerClass: 'grid-header-cell',
    cellClass: 'grid-cell'
  }
])

// 기본 설정 - MES 스타일로 수정
const defaultColDef = ref<ColDef>({
  sortable: true,
  filter: true,
  resizable: true,
  suppressMovable: true,
  flex: 1,
  minWidth: 100
})

// 그리드 옵션 - 새로운 API로 수정
const gridOptions = ref<GridOptions<SpaceMissionData>>({
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 50, 100],
  suppressCellFocus: true,
  suppressRowHoverHighlight: false,
  rowHeight: 40,
  headerHeight: 40,
  domLayout: 'autoHeight',
  rowSelection: {
    mode: 'multiRow',
    enableSelectionWithoutKeys: true
  },
  animateRows: true,
  enableCellTextSelection: true,
  suppressMenuHide: true
})

// ===== 데이터 로딩 관련 함수 =====

// AG-Grid 데이터 가져오기
const fetchGridData = async (): Promise<SpaceMissionData[]> => {
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
const formData = ref<SearchFormData>({})

// 검색 핸들러
function handleSubmit(data: SearchFormData) {
  console.log('검색 조건:', data)
  
  // 데이터가 없을 경우 처리
  if (!originalRowData.value || originalRowData.value.length === 0) {
    alert('검색할 데이터가 없습니다.')
    return
  }
  
  // 원본 데이터를 기반으로 필터링 수행
  const filteredData = originalRowData.value.filter((item: SpaceMissionData) => {
    try {
      // 임무명 필터
      if (data.mission && item.mission && typeof item.mission === 'string') {
        if (!item.mission.toLowerCase().includes(data.mission.toLowerCase())) {
          return false
        }
      } else if (data.mission) {
        return false  // 항목에 임무명이 없으면 필터링
      }
      
      // 회사 필터
      if (data.company && item.company && typeof item.company === 'string') {
        if (!item.company.toLowerCase().includes(data.company.toLowerCase())) {
          return false
        }
      } else if (data.company) {
        return false  // 항목에 회사명이 없으면 필터링
      }
    
    // 날짜 범위 필터 (시작일)
    if (data.date_from && item.date) {
      try {
        const dateFrom = new Date(data.date_from)
        const itemDate = new Date(item.date)
        if (!isNaN(dateFrom.getTime()) && !isNaN(itemDate.getTime()) && itemDate < dateFrom) {
          return false
        }
      } catch (error) {
        console.error('날짜 비교 오류:', error)
        return false // 오류 발생 시 해당 항목 제외
      }
    }
    
    // 날짜 범위 필터 (종료일)
    if (data.date_to && item.date) {
      try {
        const dateTo = new Date(data.date_to)
        // 종료일은 하루를 더해서 해당 날짜까지 포함되도록 함
        dateTo.setDate(dateTo.getDate() + 1)
        const itemDate = new Date(item.date)
        if (!isNaN(dateTo.getTime()) && !isNaN(itemDate.getTime()) && itemDate > dateTo) {
          return false
        }
      } catch (error) {
        console.error('날짜 비교 오류:', error)
        return false // 오류 발생 시 해당 항목 제외
      }
    }
    
    // 위치 필터
    if (data.location && item.location && typeof item.location === 'string') {
      if (!item.location.toLowerCase().includes(data.location.toLowerCase())) {
        return false
      }
    } else if (data.location) {
      return false  // 항목에 위치가 없으면 필터링
    }
    
    // 가격 범위 필터 (최소)
    if (data.price_min !== null && data.price_min !== undefined && item.price !== undefined) {
      if (Number(item.price) < Number(data.price_min)) {
        return false
      }
    }
    
    // 가격 범위 필터 (최대)
    if (data.price_max !== null && data.price_max !== undefined && item.price !== undefined) {
      if (Number(item.price) > Number(data.price_max)) {
        return false
      }
    }
    
    // 성공 여부 필터
    if (data.successful !== null && data.successful !== undefined && data.successful !== '') {
      try {
        const isSuccessful = data.successful === 'true'
        // item.successful이 undefined이거나 null이 아닌 경우에만 비교
        if (item.successful !== undefined && item.successful !== null) {
          if (item.successful !== isSuccessful) {
            return false
          }
        } else {
          return false // 성공 여부가 없는 항목은 필터링
        }
      } catch (error) {
        console.error('성공 여부 필터링 오류:', error)
        return false // 오류 발생 시 해당 항목 제외
      }
    }
    
      return true
    } catch (error) {
      console.error('필터링 중 오류 발생:', error, '항목:', item)
      return false // 오류 발생 시 해당 항목 제외
    }
  })
  
  // 필터링된 결과를 그리드에 적용
  rowData.value = filteredData
  
  // 사용자에게 피드백
  if (filteredData.length === 0) {
    alert('검색 결과가 없습니다.')
  } else {
    alert(`${filteredData.length}개의 결과를 찾았습니다.`)
  }
}

// 초기화 핸들러
function handleReset() {
  console.log('검색 조건 초기화')
  // 원본 데이터로 복원
  rowData.value = [...originalRowData.value]
  // 폼 데이터 초기화
  formData.value = {}
}

// 스키마 상태
const schema = ref<any[]>([])

function createFormSchema(schemaData: any) {
  return schemaData
}

// 데이터베이스에서 스키마 가져오기 (시뮤레이션)
async function fetchSchemaFromDB(): Promise<any[]> {
  // 실제로는 API 호출이 될 것입니다
  // 예: const response = await fetch('/api/search-conditions')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        // 검색 영역 - 심플한 그리드 레이아웃
        {
          $el: 'div',
          attrs: {
            class: 'mb-4 p-3 surface-card border-round'
          },
          children: [
            // 헤더 행
            {
              $el: 'div',
              attrs: {
                class: 'grid grid-cols-4 gap-4 mb-4'
              },
              children: [
                // 임무명
                {
                  $el: 'div',
                  attrs: { class: 'col-span-1' },
                  children: [
                    {
                      $formkit: 'primeInputText',
                      name: 'mission',
                      label: '임무명',
                      placeholder: '임무명 입력',
                      class: 'w-full'
                    }
                  ]
                },
                
                // 구분 (회사)
                {
                  $el: 'div',
                  attrs: { class: 'col-span-1' },
                  children: [
                    {
                      $formkit: 'primeSelect',
                      name: 'company',
                      label: '회사',
                      placeholder: '전체',
                      optionLabel: 'label',
                      optionValue: 'value',
                      options: [
                        { value: '', label: '전체' },
                        { value: 'SpaceX', label: 'SpaceX' },
                        { value: 'NASA', label: 'NASA' },
                        { value: 'ISRO', label: 'ISRO' },
                        { value: 'Roscosmos', label: 'Roscosmos' }
                      ],
                      class: 'w-full'
                    }
                  ]
                },
                
                // 위치
                {
                  $el: 'div',
                  attrs: { class: 'col-span-1' },
                  children: [
                    {
                      $formkit: 'primeInputText',
                      name: 'location',
                      label: '위치',
                      placeholder: '위치 입력',
                      class: 'w-full'
                    }
                  ]
                },
                
                // 상태
                {
                  $el: 'div',
                  attrs: { class: 'col-span-1' },
                  children: [
                    {
                      $formkit: 'primeSelect',
                      name: 'successful',
                      label: '상태',
                      placeholder: '전체',
                      optionLabel: 'label',
                      optionValue: 'value',
                      options: [
                        { value: '', label: '전체' },
                        { value: 'true', label: '성공' },
                        { value: 'false', label: '실패' }
                      ],
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
                class: 'grid grid-cols-4 gap-4 mb-4'
              },
              children: [
                // 조회기간
                {
                  $el: 'div',
                  attrs: { class: 'col-span-2' },
                  children: [
                    {
                      $el: 'label',
                      attrs: { class: 'block mb-2 text-sm font-medium' },
                      children: '조회기간'
                    },
                    {
                      $el: 'div',
                      attrs: { class: 'flex align-items-center gap-2' },
                      children: [
                        {
                          $formkit: 'primeInputDate',
                          name: 'date_from',
                          placeholder: '시작일',
                          class: 'w-full'
                        },
                        {
                          $el: 'span',
                          children: '~'
                        },
                        {
                          $formkit: 'primeInputDate',
                          name: 'date_to',
                          placeholder: '종료일',
                          class: 'w-full'
                        }
                      ]
                    }
                  ]
                },
                
                // 가격 범위
                {
                  $el: 'div',
                  attrs: { class: 'col-span-2' },
                  children: [
                    {
                      $el: 'label',
                      attrs: { class: 'block mb-2 text-sm font-medium' },
                      children: '가격 범위'
                    },
                    {
                      $el: 'div',
                      attrs: { class: 'flex align-items-center gap-2' },
                      children: [
                        {
                          $formkit: 'primeInputNumber',
                          name: 'price_min',
                          placeholder: '최소',
                          class: 'w-full'
                        },
                        {
                          $el: 'span',
                          children: '~'
                        },
                        {
                          $formkit: 'primeInputNumber',
                          name: 'price_max',
                          placeholder: '최대',
                          class: 'w-full'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            
            // 추가 옵션 및 버튼 행
            {
              $el: 'div',
              attrs: {
                class: 'grid grid-cols-4 gap-4 pt-3 border-top-1 border-300'
              },
              children: [
                // 추가 옵션
                {
                  $el: 'div',
                  attrs: { class: 'col-span-2 flex align-items-center' },
                  children: [
                    {
                      $formkit: 'primeCheckbox',
                      name: 'guard',
                      label: '가드',
                      class: 'mr-3'
                    },
                    {
                      $formkit: 'primeCheckbox',
                      name: 'event',
                      label: '중요경상',
                      class: 'mr-3'
                    },
                    {
                      $formkit: 'primeCheckbox',
                      name: 'successful',
                      value: true,
                      label: '성공만'
                    }
                  ]
                },
                
                // 버튼 영역
                {
                  $el: 'div',
                  attrs: { class: 'col-span-2 flex justify-content-end gap-2' },
                  children: [
                    {
              $formkit: 'button', // Use FormKit's 'button' type
              type: 'reset',     // Standard HTML button type, triggers form @reset
              label: '초기화',
              // Attempt to apply PrimeVue classes for basic styling.
              // Full PrimeVue button styling would require a custom FormKit input.
              attrs: {
                class: 'p-button p-button-outlined p-button-secondary pi pi-refresh' 
                      }
              // Note: The 'icon' prop from PrimeVue Button doesn't directly map.
              // Adding 'pi pi-refresh' to class for icon if PrimeIcons CSS is global.
                    },
                    {
              $formkit: 'submit', // Use FormKit's 'submit' type
              label: '검색',
              attrs: {
                class: 'p-button pi pi-search'
                      }
              // Note: The 'icon' prop from PrimeVue Button doesn't directly map.
              // Adding 'pi pi-search' to class for icon.
                    }
                  ]
                }
              ]
            }
          ]
        }
      ])
    }, 200) // 스키마 로딩 시뮤레이션을 위한 지연 시간
  })
}

// 데이터 로드 함수
async function loadFormData(): Promise<boolean> {
  try {
    // 스키마 로드
    const schemaData = await fetchSchemaFromDB()
    schema.value = schemaData
    console.log('데이터베이스에서 스키마 로드 완료')
    return true
  } catch (error) {
    console.error('스키마 로드 중 오류:', error)
    throw new Error('폼 스키마를 로드하는 데 문제가 발생했습니다')
  }
}

// 통합 데이터 로딩 함수
const loadAllData = async () => {
  isLoading.value = true
  loadingError.value = ''
  
  try {
    console.log('데이터 로딩 시작...')
    
    // 병렬로 폼 스키마와 그리드 데이터 로딩
    const [_, gridResult] = await Promise.all([
      loadFormData(),
      fetchGridData()
    ])
    
    console.log('그리드 데이터 로드 완료:', gridResult.length, '개 항목')
    
    // 결과 적용
    originalRowData.value = [...gridResult]
    rowData.value = [...gridResult]
    
    console.log('데이터 로딩 완료')
  } catch (error) {
    console.error('데이터 로딩 오류:', error)
    loadingError.value = error instanceof Error ? error.message : '데이터 로딩 중 오류가 발생했습니다.'
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
  <div class="max-w-screen-xl mx-auto p-4">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="flex align-items-center justify-content-center py-8">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-primary text-4xl"></i>
        <p class="mt-3 text-600">데이터 로딩 중...</p>
      </div>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else-if="loadingError" class="my-4">
      <div class="p-4 bg-red-50 text-red-700 border-round border-red-200 border-1">
        <div class="flex align-items-center">
          <i class="pi pi-exclamation-triangle mr-3 text-xl"></i>
          <div class="flex-1">
            <h4 class="m-0 mb-2 font-semibold">오류가 발생했습니다</h4>
            <p class="m-0 text-sm">{{ loadingError }}</p>
          </div>
        </div>
        <div class="mt-3">
          <Button 
            label="다시 시도" 
            icon="pi pi-refresh" 
            size="small"
            outlined
            @click="loadAllData" 
          />
        </div>
      </div>
    </div>
    
    <!-- 메인 컨텐츠 -->
    <div v-else>
      <!-- 페이지 헤더 -->
      <div class="bg-primary text-white p-4 border-round mb-4">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h1 class="text-xl font-semibold m-0">자료관리</h1>
            <p class="mt-1 mb-0 opacity-90">우주 임무 데이터 검색 및 관리</p>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-sm opacity-80">총 {{ rowData.length }}건</span>
          </div>
        </div>
      </div>
      
      <!-- GridFormDemo3.vue 스타일의 메인 컨텐츠 래퍼 -->
      <div class="main-content-wrapper p-4 surface-card border-round shadow-2">
        <!-- 검색 폼 섹션 -->
        <section class="form-section mb-4">
          <FormKit
            type="form"
            v-model="formData"
            @submit="handleSubmit"
            @reset="handleReset"
            :actions="false"
          >
            <FormKitSchema :schema="schema" />
          </FormKit>
        </section>
        
        <!-- 그리드 섹션 -->
        <section class="grid-section">
          <div class="surface-card border-round shadow-1 overflow-hidden">
            <!-- 그리드 헤더 -->
            <div class="surface-50 p-3 border-bottom-1 surface-border">
              <div class="flex align-items-center justify-content-between">
                <h3 class="text-lg font-semibold text-900 m-0 flex align-items-center">
                  <i class="pi pi-table mr-2 text-primary"></i>
                  검색 결과
                </h3>
                <span class="text-sm text-600">{{ rowData.length }}개 항목</span>
              </div>
            </div>
            
            <!-- AG-Grid -->
            <div class="ag-theme-quartz" style="height: 500px; width: 100%;">
              <ag-grid-vue
                class="ag-theme-quartz"
                style="width: 100%; height: 100%;"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :defaultColDef="defaultColDef"
                :gridOptions="gridOptions"
              ></ag-grid-vue>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* AG-Grid 기본 스타일링 */
.ag-theme-quartz {
  --ag-header-background-color: var(--surface-50);
  --ag-header-foreground-color: var(--text-color);
  --ag-border-color: var(--surface-border);
  --ag-row-hover-color: var(--surface-hover);
}
</style>
