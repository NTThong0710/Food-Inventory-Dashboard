<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Server, Database, Activity, FileText, Upload, Trash2, Key, Bot } from 'lucide-vue-next'

const files = ref<{name: string, size: string}[]>([])

onMounted(async () => {
  try {
    const apiUrl = import.meta.env.VITE_AI_CHATBOT_URL || 'http://localhost:7860'
    const res = await fetch(`${apiUrl}/files`)
    const json = await res.json()
    if (json.status === 'success') {
      files.value = json.data
    }
  } catch (error) {
    console.error('Không thể tải danh sách tài liệu RAG:', error)
  }
})

// Fake chart data for demo
const chartData = [
  { day: 'T2', queries: 45, height: '45%' },
  { day: 'T3', queries: 62, height: '62%' },
  { day: 'T4', queries: 30, height: '30%' },
  { day: 'T5', queries: 80, height: '80%' },
  { day: 'T6', queries: 120, height: '100%' },
  { day: 'T7', queries: 95, height: '85%' },
  { day: 'CN', queries: 110, height: '95%' },
]

const selectedFile = ref<File | null>(null)
const isUploading = ref(false)

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null
  } else {
    selectedFile.value = null
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  isUploading.value = true
  
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const apiUrl = import.meta.env.VITE_AI_CHATBOT_URL || 'http://localhost:7860'
    const response = await fetch(`${apiUrl}/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('Upload thất bại')
    const json = await response.json()
    
    if (json.status === 'success') {
      // Tải lại danh sách file
      const apiUrl = import.meta.env.VITE_AI_CHATBOT_URL || 'http://localhost:7860'
      const resFiles = await fetch(`${apiUrl}/files`)
      const jsonFiles = await resFiles.json()
      if (jsonFiles.status === 'success') {
        files.value = jsonFiles.data
      }
      alert('Upload tài liệu thành công. AI đã học xong kiến thức mới!')
    }
  } catch (error) {
    console.error(error)
    alert('Có lỗi xảy ra khi upload. Vui lòng kiểm tra lại backend AI.')
  } finally {
    selectedFile.value = null
    isUploading.value = false
  }
}

</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <Bot class="w-6 h-6 text-[#37EC13]" /> Quản lý Trợ lý AI (FoodyBot)
        </h1>
        <p class="text-gray-400 mt-1">Giám sát trạng thái và huấn luyện AI bằng tài liệu mới</p>
      </div>
      <div class="flex gap-2">
        <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Bot đang hoạt động
        </span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-green-500/5 rounded-bl-full"></div>
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-400 text-sm font-medium">Tổng truy vấn tháng này</p>
            <h3 class="text-3xl font-bold text-white mt-2">1,248</h3>
            <p class="text-green-400 text-xs mt-2 flex items-center gap-1">
              <Activity class="w-3 h-3" /> +14% so với tháng trước
            </p>
          </div>
          <div class="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Server class="w-6 h-6" />
          </div>
        </div>
      </div>

      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-full"></div>
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-400 text-sm font-medium">Tài liệu RAG (Knowledge)</p>
            <h3 class="text-3xl font-bold text-white mt-2">{{ files.length }}</h3>
            <p class="text-purple-400 text-xs mt-2 flex items-center gap-1">
              <Database class="w-3 h-3" /> ~ 1.5MB Dữ liệu Vector
            </p>
          </div>
          <div class="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Database class="w-6 h-6" />
          </div>
        </div>
      </div>

      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full"></div>
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-400 text-sm font-medium">Độ chính xác RAG</p>
            <h3 class="text-3xl font-bold text-white mt-2">98.5%</h3>
            <p class="text-yellow-400 text-xs mt-2 flex items-center gap-1">
              Dựa trên tỷ lệ trả lời đúng
            </p>
          </div>
          <div class="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
            <Activity class="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Chart Column (Span 2) -->
      <div class="lg:col-span-2 bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 shadow-lg">
        <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
          Biểu đồ Truy vấn (7 ngày qua)
        </h3>
        <!-- CSS Bar Chart -->
        <div class="h-64 flex items-end justify-between gap-2 px-2 mt-4 pb-2 border-b border-[#2A362C]">
          <div v-for="data in chartData" :key="data.day" class="w-full flex flex-col items-center gap-2 relative group">
            <!-- Tooltip -->
            <div class="absolute -top-8 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {{ data.queries }}
            </div>
            <!-- Bar -->
            <div 
              class="w-full max-w-[40px] bg-gradient-to-t from-[#1B5E20] to-[#37EC13] rounded-t-sm transition-all duration-500 group-hover:opacity-80"
              :style="{ height: data.height }"
            ></div>
            <!-- Label -->
            <span class="text-xs text-gray-400 mt-2">{{ data.day }}</span>
          </div>
        </div>
      </div>

      <!-- Config & Data Column -->
      <div class="space-y-6">
        
        <!-- Upload Section -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-white mb-4">Huấn luyện AI (Thêm tài liệu)</h3>
          <p class="text-xs text-gray-400 mb-4">Upload file PDF, TXT, CSV để thêm kiến thức cho FoodyBot.</p>
          
          <div class="border-2 border-dashed border-[#2A362C] rounded-xl p-6 text-center hover:bg-[#1B241D] transition-colors cursor-pointer relative">
            <input type="file" @change="handleFileSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".txt,.pdf,.csv">
            <Upload class="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p class="text-sm font-medium text-gray-300">
              {{ selectedFile ? selectedFile.name : 'Click hoặc kéo thả file vào đây' }}
            </p>
          </div>
          
          <button 
            @click="handleUpload"
            :disabled="!selectedFile || isUploading"
            class="w-full mt-4 py-2.5 bg-[#1B5E20] hover:bg-[#2e7d32] text-[#37EC13] font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isUploading" class="w-4 h-4 animate-spin" />
            {{ isUploading ? 'Đang nhúng VectorDB...' : 'Tải lên & Huấn luyện' }}
          </button>
        </div>

        <!-- File List -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-white mb-4">Tài liệu trong não AI</h3>
          <ul class="space-y-3">
            <li v-for="file in files" :key="file.name" class="flex items-center justify-between p-3 bg-[#0C160A] rounded-lg border border-[#2A362C]">
              <div class="flex items-center gap-3 overflow-hidden">
                <FileText class="w-5 h-5 text-gray-400 shrink-0" />
                <div class="truncate">
                  <p class="text-sm font-medium text-gray-200 truncate">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ file.size }}</p>
                </div>
              </div>
              <button class="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0">
                <Trash2 class="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>
