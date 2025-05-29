<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import Button from 'primevue/button'

// 다크모드 감지
var isDarkMode = computed(() => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
})

isDarkMode.value = true

// 행 데이터 인터페이스
interface IRow {
  id: number
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

// 수정 관련 상태
const editingCell = reactive({
  rowIndex: -1,
  field: '',
  value: null,
  originalValue: null
})
const editHistory = ref<any[]>([])

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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // 타이틀 및 설명
        title: '수정 가능한 그리드 예제',
        description: '셀을 클릭하여 데이터를 편집할 수 있는 그리드 스키마입니다.',
        
        // 열 정의
        columnDefs: [
          { 
            field: 'make', 
            headerName: '제조사',
            sortable: true,
            filter: true,
            editable: true
          },
          { 
            field: 'model',
            headerName: '모델',
            sortable: true,
            filter: true,
            editable: true
          },
          { 
            field: 'price',
            headerName: '가격',
            sortable: true,
            filter: true,
            editable: true,
            valueFormatter: (params) => {
              return params.value ? `₩${params.value.toLocaleString()}` : '';
            }
          },
          { 
            field: 'electric',
            headerName: '전기차 여부',
            editable: true,
            cellRenderer: (params) => {
              return params.value ? '✅' : '❌';
            }
          }
        ],
        
        // 그리드 옵션
        gridOptions: {
          pagination: true,
          paginationPageSize: 10,
          domLayout: 'autoHeight',
          animateRows: true,
          enableCellTextSelection: true
        }
      })
    }, 800) // 0.8초 지연으로 데이터베이스 응답 시뮬레이션
  })
}

// 데이터베이스에서 행 데이터 가져오기 (시뮬레이션)
async function fetchRowDataFromDB() {
  // 실제로는 API 호출이 될 것입니다
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, make: "Tesla", model: "Model Y", price: 64950000, electric: true },
        { id: 2, make: "Ford", model: "F-Series", price: 33850000, electric: false },
        { id: 3, make: "Toyota", model: "Corolla", price: 29600000, electric: false },
        { id: 4, make: "Hyundai", model: "Ioniq 5", price: 55000000, electric: true },
        { id: 5, make: "Kia", model: "EV6", price: 52000000, electric: true },
        { id: 6, make: "Honda", model: "Civic", price: 27800000, electric: false },
        { id: 7, make: "BMW", model: "i4", price: 75000000, electric: true },
        { id: 8, make: "Mercedes", model: "EQS", price: 120000000, electric: true },
        { id: 9, make: "Volkswagen", model: "ID.4", price: 62000000, electric: true },
        { id: 10, make: "Audi", model: "e-tron", price: 82000000, electric: true },
        { id: 11, make: "Nissan", model: "Leaf", price: 32000000, electric: true },
        { id: 12, make: "Chevrolet", model: "Bolt", price: 42000000, electric: true }
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

// 셀 편집 시작
function startEditing(rowIndex: number, field: string, value: any) {
  editingCell.rowIndex = rowIndex
  editingCell.field = field
  editingCell.value = value
  editingCell.originalValue = value
}

// 편집 취소
function cancelEditing() {
  editingCell.rowIndex = -1
  editingCell.field = ''
  editingCell.value = null
  editingCell.originalValue = null
}

// 편집 완료
function finishEditing() {
  if (editingCell.rowIndex >= 0) {
    const row = displayData.value[editingCell.rowIndex]
    const originalRow = rowData.value.find(r => r.id === row.id)
    
    if (originalRow) {
      const oldValue = originalRow[editingCell.field as keyof IRow]
      originalRow[editingCell.field as keyof IRow] = editingCell.value
      
      // 변경 내역 기록
      editHistory.value.push({
        timestamp: new Date(),
        rowId: row.id,
        field: editingCell.field,
        oldValue,
        newValue: editingCell.value
      })
    }
    
    // 편집 상태 초기화
    cancelEditing()
  }
}

// 편집 내역 지우기
function clearEditHistory() {
  editHistory.value = []
}

// 특정 필드의 편집 가능 여부 확인
function isEditable(field: string) {
  const colDef = columnDefs.value.find(col => col.field === field)
  return colDef && colDef.editable
}

// 편집 내역을 서버에 저장 (시뮬레이션)
function saveChanges() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('변경 내역 저장 완료:', editHistory.value)
      resolve()
    }, 800)
  })
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadGridData()
})
</script>

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
  background-color: #1a1a1a;
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
  position: relative;
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
  background-color: #1a1a1a;
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

/* 편집 관련 스타일 */
.edit-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.2s;
}

td:hover .edit-icon {
  opacity: 1;
}

.cell-editor {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.edit-input, .edit-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: black;
}

.edit-input:focus, .edit-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.edit-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-confirm {
  background-color: #10b981;
  color: white;
}

.edit-confirm:hover {
  background-color: #059669;
}

.edit-cancel {
  background-color: #ef4444;
  color: white;
}

.edit-cancel:hover {
  background-color: #dc2626;
}

/* 작업 컬럼 스타일 */
.action-column {
  width: 60px;
  text-align: center;
}

.action-cell {
  text-align: center;
  padding: 0.5rem !important;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

/* 변경 내역 섹션 */
.edit-history-section {
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.edit-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.edit-history-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.edit-history-content {
  overflow-x: auto;
}

.edit-history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.edit-history-table th,
.edit-history-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.edit-history-table th {
  font-weight: 600;
  text-align: left;
  color: #4b5563;
  background-color: #f9fafb;
}

.edit-history-table tr:hover {
  background-color: #f3f4f6;
}

/* 빈 상태 메시지 */
.empty-message {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-style: italic;
}
</style>

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
      
      <!-- 테이블 구현 -->
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
                <th class="action-column">작업</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in displayData" :key="row.id" class="data-row" :style="isDarkMode ? 'background-color: #222; color: #f5f5f5;' : ''">
                <td v-for="(col, colIndex) in columnDefs" :key="colIndex" @click="isEditable(col.field) && startEditing(rowIndex, col.field, row[col.field])">
                  <!-- 편집 중인 셀 -->
                  <div v-if="editingCell.rowIndex === rowIndex && editingCell.field === col.field" class="cell-editor" @click.stop>
                    <template v-if="col.field === 'electric'">
                      <select v-model="editingCell.value" class="edit-select">
                        <option :value="true">전기차</option>
                        <option :value="false">일반차량</option>
                      </select>
                    </template>
                    <template v-else-if="col.field === 'price'">
                      <input 
                        type="number"
                        v-model.number="editingCell.value"
                        class="edit-input"
                        min="1000000"
                        step="1000000"
                      />
                    </template>
                    <template v-else>
                      <input 
                        type="text"
                        v-model="editingCell.value"
                        class="edit-input"
                      />
                    </template>
                    
                    <div class="edit-actions">
                      <button @click="finishEditing" class="edit-btn edit-confirm">
                        <i class="pi pi-check"></i>
                      </button>
                      <button @click="cancelEditing" class="edit-btn edit-cancel">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 일반 셀 -->
                  <template v-else>
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
                    
                    <i v-if="isEditable(col.field)" class="pi pi-pencil edit-icon"></i>
                  </template>
                </td>
                <td class="action-cell">
                  <button class="action-btn" @click="startEditing(rowIndex, 'make', row.make)">
                    <i class="pi pi-pencil"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="displayData.length === 0" class="empty-row">
                <td :colspan="columnDefs.length + 1" class="empty-message">
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
      
      <!-- 변경 내역 섹션 -->
      <div class="edit-history-section" v-if="editHistory.length > 0">
        <div class="edit-history-header">
          <h3>변경 내역</h3>
          <div class="edit-history-actions">
            <Button label="저장" icon="pi pi-save" class="p-button-sm p-button-success mr-2" @click="saveChanges" />
            <Button label="취소" icon="pi pi-trash" class="p-button-sm p-button-danger" @click="clearEditHistory" />
          </div>
        </div>
        
        <div class="edit-history-content">
          <table class="edit-history-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>ID</th>
                <th>필드</th>
                <th>이전 값</th>
                <th>새 값</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(edit, index) in editHistory" :key="index">
                <td>{{ new Date(edit.timestamp).toLocaleTimeString() }}</td>
                <td>{{ edit.rowId }}</td>
                <td>{{ columnDefs.find(col => col.field === edit.field)?.headerName || edit.field }}</td>
                <td>
                  <template v-if="edit.field === 'electric'">
                    <span :class="`status-badge ${edit.oldValue ? 'status-positive' : 'status-negative'}`">
                      {{ edit.oldValue ? '전기차' : '일반차량' }}
                    </span>
                  </template>
                  <template v-else-if="edit.field === 'price'">
                    <span>₩{{ edit.oldValue.toLocaleString() }}</span>
                  </template>
                  <template v-else>
                    {{ edit.oldValue }}
                  </template>
                </td>
                <td>
                  <template v-if="edit.field === 'electric'">
                    <span :class="`status-badge ${edit.newValue ? 'status-positive' : 'status-negative'}`">
                      {{ edit.newValue ? '전기차' : '일반차량' }}
                    </span>
                  </template>
                  <template v-else-if="edit.field === 'price'">
                    <span>₩{{ edit.newValue.toLocaleString() }}</span>
                  </template>
                  <template v-else>
                    {{ edit.newValue }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
