<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Bot, X, Send, User, Loader2 } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true
})

const renderMarkdown = (text: string) => {
  return DOMPurify.sanitize(md.render(text || ''))
}

const isOpen = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
// Tạo một session_id ngẫu nhiên cho mỗi phiên chat (để LangGraph nhớ ngữ cảnh)
const sessionId = ref(`session-${Math.random().toString(36).substring(2, 9)}`)

const messages = ref<{id: number, text: string, sender: 'user' | 'bot'}[]>([
  { id: 1, text: 'Xin chào! Mình là FoodyBot, trợ lý ảo của nhà hàng. Mình có thể giúp gì cho bạn?', sender: 'bot' }
])

const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    const container = messagesContainer.value as HTMLElement
    container.scrollTop = container.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userText = inputMessage.value.trim()
  messages.value.push({ id: Date.now(), text: userText, sender: 'user' })
  inputMessage.value = ''
  
  // Bật trạng thái loading khi vừa gửi xong
  isTyping.value = true 
  scrollToBottom()

  // 1. Tạo sẵn một tin nhắn rỗng của bot để chuẩn bị hứng data stream
  const botMessageId = Date.now() + 1
  messages.value.push({ id: botMessageId, text: '', sender: 'bot' })

  try {
    const apiUrl = import.meta.env.VITE_AI_CHATBOT_URL || 'https://thong0710-food-rag-agenticai.hf.space'
    
    // Gọi thẳng vào endpoint stream mà mình đã tạo ở backend
    const response = await fetch(`${apiUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Bổ sung thêm session_id vào payload
      body: JSON.stringify({ message: userText, session_id: sessionId.value }), 
    })

    if (!response.ok) throw new Error('Network response was not ok')
    if (!response.body) throw new Error('Trình duyệt không hỗ trợ ReadableStream')

    // 2. Tắt hiệu ứng "Đang gõ..." chung vì text chuẩn bị được stream về
    isTyping.value = false

    // 3. Xử lý luồng Stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Decode mảng byte thành string
      const chunkText = decoder.decode(value, { stream: true })
      
      // Tìm lại cái tin nhắn bot trống lúc nãy và cộng dồn text vào
      const botMsg = messages.value.find(m => m.id === botMessageId)
      if (botMsg) {
        botMsg.text += chunkText
      }
      
      // Auto cuộn xuống khi chữ đang tuôn ra
      scrollToBottom()
    }
    
  } catch (error) {
    console.error(error)
    const botMsg = messages.value.find(m => m.id === botMessageId)
    if (botMsg) {
      botMsg.text = '❌ Xin lỗi, hiện tại mình đang gặp sự cố kết nối. Vui lòng thử lại sau nhé!'
    }
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}
</script>


<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Button -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
    >
      <Bot class="w-7 h-7" />
    </button>

    <!-- Chat Window -->
    <div
      v-else
      class="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col"
      style="height: 500px;"
    >
      <!-- Header -->
      <div class="bg-green-600 p-4 text-white flex justify-between items-center shadow-md">
        <div class="flex items-center gap-2">
          <div class="bg-white/20 p-2 rounded-full">
            <Bot class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-sm">FoodyBot Assistant</h3>
            <p class="text-xs text-green-100">Sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
        <button @click="isOpen = false" class="text-green-100 hover:text-white transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Messages Area -->
      <div 
        ref="messagesContainer"
        class="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex w-full"
          :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div 
            class="max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed"
            :class="msg.sender === 'user' 
              ? 'bg-green-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'"
          >
            <!-- Hiển thị HTML đã chuyển từ markdown (bold, italic) -->
            <div
              v-if="msg.sender === 'bot'"
              class="bot-markdown"
              v-html="renderMarkdown(msg.text)"
            ></div>

            <p v-else class="whitespace-pre-wrap">
              {{ msg.text }}
            </p>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white text-gray-500 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-green-500" />
            <span class="text-xs">Đang gõ...</span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-3 bg-white border-t border-gray-100">
        <form @submit.prevent="sendMessage" class="flex items-center gap-2 relative">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Hỏi công thức, tồn kho..."
            class="flex-1 border-none bg-gray-100 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 text-black"
            :disabled="isTyping"
          />
          <button
            type="submit"
            :disabled="!inputMessage.trim() || isTyping"
            class="absolute right-1 p-2 bg-green-600 text-white rounded-full disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            <Send class="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.bot-markdown :deep(p) {
  margin: 0.35rem 0;
}

.bot-markdown :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.bot-markdown :deep(li) {
  margin: 0.25rem 0;
}

.bot-markdown :deep(strong) {
  font-weight: 700;
}
</style>