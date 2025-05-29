<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Button from 'primevue/button'

// 다크모드 감지
const isDarkMode = computed(() => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
})

// 행 데이터 인터페이스
interface IRow {
  make: string
  model: string
  price: number
  electric: boolean
}

// 그리드 데이터 상태
const rowData = ref<IRow[]>([])
const displayData = ref<IRow[]>([])
const columnDefs = ref<any[]>([])
const isLoading = ref(true)
const loadingError = ref<string | null>(null)
const gridSchema = ref<any>(null)
const gridOptions = ref<any>({})

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = 10
const totalPages = ref(1)

// 정렬 상태
const sortField = ref('')
const sortDirection = ref('asc')

// 데이터베이스에서 그리드 스키마 가져오기 (시뮬레이션)
async function fetchGridSchemaFromDB() {
  // 실제로는 API 호출이 될 것입니다
  // 예: const response = await fetch('/api/grid-schema/cars')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // 타이틀 및 설명
        title: 'AG Grid 스키마 예제',
        description: '데이터베이스에서 로드된 그리드 스키마입니다.',
        
        // 열 정의
        columnDefs: [
          { 
            field: 'make', 
            headerName: '제조사',
            sortable: true,
            filter: true
          },
          { 
            field: 'model',
            headerName: '모델',
            sortable: true,
            filter: true  
          },
          { 
            field: 'price',
            headerName: '가격',
            sortable: true,
            filter: true,
            valueFormatter: (params) => {
              return params.value ? `₩${params.value.toLocaleString()}` : '';
            }
          },
          { 
            field: 'electric',
            headerName: '전기차 여부',
            cellRenderer: (params) => {
              return params.value ? '✅' : '❌';
            },
            sortable: true,
            filter: true
          }
        ],
        
        // 그리드 옵션
        gridOptions: {
          pagination: true,
          paginationPageSize: 10,
          domLayout: 'autoHeight',
          animateRows: true,
          enableCellTextSelection: true,
          suppressRowClickSelection: true
        }
      })
    }, 800) // 0.8초 지연으로 데이터베이스 응답 시뮬레이션
  })
}

// 데이터베이스에서 행 데이터 가져오기 (시뮬레이션)
async function fetchRowDataFromDB() {
  // 실제로는 API 호출이 될 것입니다
  // 예: const response = await fetch('/api/grid-data/cars')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { make: "Tesla", model: "Model Y", price: 64950000, electric: true },
        { make: "Ford", model: "F-Series", price: 33850000, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600000, electric: false },
        { make: "Hyundai", model: "Ioniq 5", price: 55000000, electric: true },
        { make: "Kia", model: "EV6", price: 52000000, electric: true },
        { make: "Honda", model: "Civic", price: 27800000, electric: false },
        { make: "BMW", model: "i4", price: 75000000, electric: true },
        { make: "Mercedes", model: "EQS", price: 120000000, electric: true },
        { make: "Volkswagen", model: "ID.4", price: 62000000, electric: true },
        { make: "Audi", model: "e-tron", price: 82000000, electric: true },
        { make: "Nissan", model: "Leaf", price: 32000000, electric: true },
        { make: "Tesla", model: "Model Y", price: 64950000, electric: true },
        { make: "Ford", model: "F-Series", price: 33850000, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600000, electric: false },
        { make: "Hyundai", model: "Ioniq 5", price: 55000000, electric: true },
        { make: "Kia", model: "EV6", price: 52000000, electric: true },
        { make: "Honda", model: "Civic", price: 27800000, electric: false },
        { make: "BMW", model: "i4", price: 75000000, electric: true },
        { make: "Mercedes", model: "EQS", price: 120000000, electric: true },
        { make: "Volkswagen", model: "ID.4", price: 62000000, electric: true },
        { make: "Audi", model: "e-tron", price: 82000000, electric: true },
        { make: "Nissan", model: "Leaf", price: 32000000, electric: true },
        { make: "Tesla", model: "Model Y", price: 64950000, electric: true },
        { make: "Ford", model: "F-Series", price: 33850000, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600000, electric: false },
        { make: "Hyundai", model: "Ioniq 5", price: 55000000, electric: true },
        { make: "Kia", model: "EV6", price: 52000000, electric: true },
        { make: "Honda", model: "Civic", price: 27800000, electric: false },
        { make: "BMW", model: "i4", price: 75000000, electric: true },
        { make: "Mercedes", model: "EQS", price: 120000000, electric: true },
        { make: "Volkswagen", model: "ID.4", price: 62000000, electric: true },
        { make: "Audi", model: "e-tron", price: 82000000, electric: true },
        { make: "Nissan", model: "Leaf", price: 32000000, electric: true },
        { make: "Tesla", model: "Model Y", price: 64950000, electric: true },
        { make: "Ford", model: "F-Series", price: 33850000, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600000, electric: false },
        { make: "Hyundai", model: "Ioniq 5", price: 55000000, electric: true },
        { make: "Kia", model: "EV6", price: 52000000, electric: true },
        { make: "Honda", model: "Civic", price: 27800000, electric: false },
        { make: "BMW", model: "i4", price: 75000000, electric: true },
        { make: "Mercedes", model: "EQS", price: 120000000, electric: true },
        { make: "Volkswagen", model: "ID.4", price: 62000000, electric: true },
        { make: "Audi", model: "e-tron", price: 82000000, electric: true },
        { make: "Nissan", model: "Leaf", price: 32000000, electric: true },
        { make: "Chevrolet", model: "Bolt", price: 42000000, electric: true }
      ])
    }, 500) // 0.5초 지연으로 데이터베이스 응답 시뮬레이션
  })
}

// 그리드 데이터 로드 함수
async function loadGridData() {
  try {
    isLoading.value = true
    loadingError.value = null
    
    // 스키마 로드
    const schemaData = await fetchGridSchemaFromDB() as any
    gridSchema.value = schemaData
    columnDefs.value = schemaData.columnDefs
    gridOptions.value = schemaData.gridOptions
    
    // 행 데이터 로드
    const rowDataResult = await fetchRowDataFromDB()
    rowData.value = rowDataResult as IRow[]
    
    // 페이지네이션 초기화
    totalPages.value = Math.ceil(rowData.value.length / pageSize)
    updateDisplayData()
    
    console.log('데이터베이스에서 그리드 데이터 로드 완료')
  } catch (error: any) {
    console.error('그리드 데이터 로딩 실패:', error)
    loadingError.value = '그리드 데이터를 로드하는 중 오류가 발생했습니다'
  } finally {
    isLoading.value = false
  }
}

// 페이지네이션 처리
function updateDisplayData() {
  // 정렬 적용
  let sortedData = [...rowData.value]
  if (sortField.value) {
    sortedData.sort((a, b) => {
      const aValue = a[sortField.value as keyof IRow]
      const bValue = b[sortField.value as keyof IRow]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection.value === 'asc' 
          ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) 
          : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0)
      }
    })
  }
  
  // 페이지네이션 적용
  const startIndex = (currentPage.value - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, sortedData.length)
  displayData.value = sortedData.slice(startIndex, endIndex)
}

// 정렬 함수
function sortBy(field: string) {
  if (sortField.value === field) {
    // 동일한 필드인 경우 정렬 방향 전환
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 새로운 필드로 정렬
    sortField.value = field
    sortDirection.value = 'asc'
  }
  
  updateDisplayData()
}

// 페이지 이동 함수
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    updateDisplayData()
  }
}

// 이전 페이지
function goToPrevPage() {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// 다음 페이지
function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadGridData()
})
</script>

<template>
  <div class="modern-card" :class="{ 'dark-mode': isDarkMode }" :style="isDarkMode ? 'background-color: #1e1e1e; color: #f5f5f5;' : ''">
    <!-- 로딩 상태 표시 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">그리드 데이터 로딩 중...</span>
    </div>
    
    <!-- 에러 메시지 -->
    <div v-else-if="loadingError" class="error-container">
      <i class="pi pi-exclamation-triangle mr-2"></i>
      {{ loadingError }}
      <Button label="다시 시도" icon="pi pi-refresh" class="p-button-sm mt-3" @click="loadGridData" />
    </div>
    
    <!-- 그리드 렌더링 -->
    <div v-else class="grid-container">
      <!-- 헤더 섹션 -->
      <div class="header-section">
        <h2 class="title">{{ gridSchema.title }}</h2>
        <p class="description">{{ gridSchema.description }}</p>
      </div>
      
      <!-- 테이블 구현 - 모던 스타일링 -->
      <div class="table-container">
        <div class="table-wrapper">
          <table class="modern-table" :style="isDarkMode ? 'background-color: #1a1a1a; color: #f5f5f5;' : ''">
            <thead :style="isDarkMode ? 'background-color: #333;' : ''">
              <tr>
                <th v-for="(col, index) in columnDefs" :key="index" @click="sortBy(col.field)" :style="isDarkMode ? 'color: #e0e0e0; border-color: #444;' : ''">
                  <div class="header-content">
                    <span>{{ col.headerName }}</span>
                    <i v-if="sortField === col.field" 
                      :class="['pi', sortDirection === 'asc' ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down', 'sort-icon', 'active']"></i>
                    <i v-else class="pi pi-sort sort-icon"></i>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in displayData" :key="rowIndex" class="data-row" :style="isDarkMode ? 'background-color: #222; color: #f5f5f5;' : ''">
                <td v-for="(col, colIndex) in columnDefs" :key="colIndex">
                  <template v-if="col.field === 'electric'">
                    <span :class="`status-badge ${row[col.field] ? 'status-positive' : 'status-negative'}`">
                      {{ row[col.field] ? '전기차' : '일반차량' }}
                    </span>
                  </template>
                  <template v-else-if="col.field === 'price'">
                    <span class="price">₩{{ row[col.field].toLocaleString() }}</span>
                  </template>
                  <template v-else-if="col.field === 'make'">
                    <div class="make-cell">
                      <div class="make-icon">{{ row[col.field].charAt(0) }}</div>
                      <span>{{ row[col.field] }}</span>
                    </div>
                  </template>
                  <template v-else>
                    {{ row[col.field] }}
                  </template>
                </td>
              </tr>
              <tr v-if="displayData.length === 0" class="empty-row">
                <td :colspan="columnDefs.length" class="empty-message">
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 페이지네이션 -->
        <div class="pagination-container">
          <div class="pagination-info">
            <span class="items-count">총 {{ rowData.length }}개 항목 중 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, rowData.length) }}개 표시</span>
          </div>
          <div class="pagination-controls">
            <button 
              class="pagination-button" 
              @click="goToPrevPage" 
              :disabled="currentPage === 1"
              :class="{ 'disabled': currentPage === 1 }">
              <i class="pi pi-chevron-left"></i>
              <span>이전</span>
            </button>
            <div class="pagination-pages">
              <span class="current-page">{{ currentPage }}</span>
              <span class="total-pages">/ {{ totalPages }}</span>
            </div>
            <button 
              class="pagination-button" 
              @click="goToNextPage" 
              :disabled="currentPage === totalPages"
              :class="{ 'disabled': currentPage === totalPages }">
              <span>다음</span>
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 기본 카드 스타일 */
.modern-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin: 1rem 0;
  transition: all 0.3s ease;
  color: #333;
}

/* 다크모드 스타일 */
.dark-mode {
  background-color: #1e1e1e;
  color: #f5f5f5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 헤더 섹션 */
.header-section {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.dark-mode .header-section {
  border-bottom-color: #333;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.dark-mode .title {
  color: #f5f5f5;
}

.description {
  color: #666;
  font-size: 0.9rem;
}

.dark-mode .description {
  color: #aaa;
}

/* 테이블 스타일 */
.table-container {
  overflow: hidden;
  border-radius: 12px;
  background-color: #fff;
}

.dark-mode .table-container {
  background-color: #252525;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.9rem;
  background-color: #fff;
}

.dark-mode .modern-table {
  background-color: #252525;
}

.modern-table thead {
  background-color: #f9fafb;
}

.dark-mode .modern-table thead {
  background-color: #2a2a2a;
}

.modern-table th {
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  white-space: nowrap;
}

.dark-mode .modern-table th {
  color: #e0e0e0;
  border-bottom-color: #444;
}

.modern-table td {
  padding: 1rem;
  color: #4b5563;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.dark-mode .modern-table td {
  color: #d0d0d0;
  border-bottom-color: #333;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-icon {
  font-size: 0.75rem;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.sort-icon.active {
  opacity: 1;
  color: #2196F3;
}

th:hover .sort-icon {
  opacity: 1;
}

th {
  cursor: pointer;
}

/* 데이터 행 스타일 */
.data-row {
  transition: all 0.2s ease;
  background-color: #fff;
}

.dark-mode .data-row {
  background-color: #252525;
}

.data-row:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.dark-mode .data-row:hover {
  background-color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 전기차 여부 배지 */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-positive {
  background-color: #ecfdf5;
  color: #065f46;
}

.status-negative {
  background-color: #fef2f2;
  color: #991b1b;
}

/* 가격 스타일 */
.price {
  font-weight: 600;
  color: #1f2937;
}

/* 제조사 셀 스타일 */
.make-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.make-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4b5563;
}

/* 페이지네이션 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #4b5563;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(.disabled) {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.pagination-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
}

.current-page {
  font-weight: 600;
  color: #1f2937;
}

.total-pages {
  color: #9ca3af;
}

/* 로딩 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #6b7280;
  font-size: 0.9rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 스타일 */
.error-container {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}
</style>
