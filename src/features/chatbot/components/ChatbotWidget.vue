<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Bot, X, Send, User, Loader2 } from 'lucide-vue-next'

const isOpen = ref(false)
const inputMessage = ref('')
const isTyping = ref(false)
const messages = ref<{id: number, text: string, sender: 'user' | 'bot'}[]>([
  { id: 1, text: 'Xin chào! Mình là FoodyBot, trợ lý ảo của nhà hàng. Mình có thể giúp gì cho bạn?', sender: 'bot' }
])

const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    const container = messagesContainer.value as HTMLElement
    if (container) {
       container.scrollTop = container.scrollHeight
    }
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userText = inputMessage.value.trim()
  messages.value.push({ id: Date.now(), text: userText, sender: 'user' })
  inputMessage.value = ''
  isTyping.value = true
  scrollToBottom()

  try {
    const apiUrl = import.meta.env.VITE_AI_CHATBOT_URL || 'http://localhost:7860';
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userText }),
    })

    if (!response.ok) throw new Error('Network response was not ok')
    
    const data = await response.json()
    messages.value.push({ id: Date.now(), text: data.reply, sender: 'bot' })
  } catch (error) {
    messages.value.push({ 
      id: Date.now(), 
      text: 'Xin lỗi, hiện tại mình đang gặp sự cố kết nối. Vui lòng thử lại sau nhé!', 
      sender: 'bot' 
    })
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
            <!-- Markdown styling có thể áp dụng ở đây nếu cần -->
            <p class="whitespace-pre-wrap">{{ msg.text }}</p>
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
