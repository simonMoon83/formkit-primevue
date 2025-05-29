<script setup>
import { ref, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// Import AG-Grid CSS
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

// Component data
const rowData = ref([])
const isLoading = ref(true)

// Column definitions
const columnDefs = ref([
  { field: 'mission', headerName: '임무', width: 150 },
  { field: 'company', headerName: '회사', width: 130 },
  { field: 'location', headerName: '위치', width: 225 },
  { 
    field: 'date', 
    headerName: '날짜',
    valueFormatter: (params) => {
      if (!params.value) return ''
      return new Date(params.value).toLocaleDateString()
    }
  },
  { 
    field: 'price', 
    headerName: '가격', 
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return ''
      return '₩' + params.value.toLocaleString()
    }
  },
  { field: 'successful', headerName: '성공 여부', width: 120 },
  { field: 'rocket', headerName: '로켓' }
])

// Default column definition
const defaultColDef = ref({
  sortable: true,
  filter: true,
  resizable: true
})

// Fetch data from API
const fetchData = async () => {
  try {
    const response = await fetch(
      "https://www.ag-grid.com/example-assets/space-mission-data.json"
    )
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    return []
  }
}

// Load data on component mount
onMounted(async () => {
  isLoading.value = true
  try {
    rowData.value = await fetchData()
  } catch (error) {
    console.error("Error loading data:", error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div style="margin-top: 20px">
    <h1>우주 임무 데이터</h1>
    
    <div v-if="isLoading" style="display: flex; justify-content: center; align-items: center; height: 500px;">
      <p>데이터를 로딩 중입니다...</p>
    </div>
    
    <div v-else class="ag-theme-alpine" style="height: 600px; width: 100%;">
      <ag-grid-vue
        style="width: 100%; height: 100%"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        pagination="true"
      ></ag-grid-vue>
    </div>
  </div>
</template>

<style>
/* 다크모드 스타일 */
body.dark .ag-theme-alpine {
  --ag-background-color: #222;
  --ag-foreground-color: #fff;
  --ag-border-color: #444;
}
</style>