<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
    <!-- Navigation Bar -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="flex items-center gap-2">
              <img src="/igad-logo.png" alt="IGAD Logo" class="h-8 w-auto" />
              <span class="text-lg font-semibold text-green-800">IGAD AI Hub</span>
            </NuxtLink>
            <nav class="flex items-center gap-4">
              <NuxtLink to="/web-scraping" class="text-gray-600 hover:text-green-600 transition-colors">
                Web Scraping
              </NuxtLink>
              <NuxtLink to="/ai-chat" class="text-green-600 font-medium">
                AI Chat
              </NuxtLink>
            </nav>
          </div>
          
          <div class="flex items-center gap-4">
            <template v-if="user">
              <span class="text-gray-600">Hello, <strong>{{ user.name }}</strong></span>
              <NuxtLink to="/prompts" class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                Manage Prompts
              </NuxtLink>
              <button @click="logout" class="px-4 py-2 rounded-md border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-colors">
                Logout
              </button>
            </template>
            <button v-else @click="showLoginModal = true" class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Login to IGAD AI Hub</h2>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="loginEmail"
              type="email"
              placeholder="Enter your email..."
              class="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              v-model="loginPassword"
              type="password"
              placeholder="Enter your password..."
              class="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>
          
          <div v-if="loginError" class="p-3 bg-red-100 text-red-800 border-2 border-red-200 rounded-md text-sm">
            {{ loginError }}
          </div>
          
          <div class="flex gap-3">
            <button
              type="button"
              @click="showLoginModal = false"
              class="flex-1 px-4 py-3 rounded-md border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loginLoading"
              class="flex-1 px-4 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {{ loginLoading ? 'Loading...' : 'Login' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Main Chat Container -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden" style="height: calc(100vh - 140px);">
        <!-- Chat Header -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold">AI Chat - IGAD</h1>
              <p class="text-purple-100 text-sm">Specialized assistant in agriculture and rural development</p>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4" style="height: calc(100vh - 340px);">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-purple-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Welcome to AI Chat!</h3>
            <p class="text-gray-500">Start a conversation by writing a message below</p>
            <div class="mt-6 max-w-md mx-auto text-left">
              <p class="text-sm text-gray-600 mb-2 font-medium">Example questions:</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>• What are the best practices for sustainable agriculture?</li>
                <li>• How does climate change affect the IGAD region?</li>
                <li>• Give me information about agricultural policies in East Africa</li>
              </ul>
            </div>
          </div>

          <!-- Chat Messages -->
          <div v-for="(msg, index) in messages" :key="index" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
            <div class="flex gap-3 max-w-3xl" :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div v-if="msg.role === 'user'" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
                </div>
                <div v-else class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <!-- Message Content -->
              <div>
                <div
                  class="rounded-2xl px-4 py-3 shadow-sm"
                  :class="msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'"
                >
                  <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                </div>
                <p class="text-xs text-gray-400 mt-1 px-2" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
                  {{ formatTime(msg.timestamp) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="flex gap-3 max-w-3xl">
              <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div class="bg-gray-100 rounded-2xl px-4 py-3">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 p-4 bg-gray-50">
          <form @submit.prevent="sendMessage" class="flex gap-3">
            <input
              v-model="currentMessage"
              type="text"
              placeholder="Write your message here..."
              class="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              :disabled="isLoading"
            />
            <button
              type="submit"
              :disabled="isLoading || !currentMessage.trim()"
              class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <svg v-else class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </form>
          <div class="flex items-center justify-between mt-2">
            <p class="text-xs text-gray-500">Press Enter to send</p>
            <button
              v-if="messages.length > 0"
              @click="clearChat"
              class="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

const user = ref<any>(null)
const showLoginModal = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

const messages = ref<Message[]>([])
const currentMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const checkAuth = async () => {
  try {
    const auth = await $fetch('/api/auth/me')
    if (auth.authenticated) {
      user.value = auth.user
    }
  } catch (error) {
    console.error('Error checking auth:', error)
  }
}

const login = async () => {
  loginLoading.value = true
  loginError.value = ''
  
  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { 
        email: loginEmail.value,
        password: loginPassword.value
      }
    })
    
    if (data.success) {
      user.value = data.user
      showLoginModal.value = false
      loginEmail.value = ''
      loginPassword.value = ''
    } else {
      loginError.value = data.error || 'Login failed'
    }
  } catch (error: any) {
    loginError.value = error.message || 'Login failed'
  } finally {
    loginLoading.value = false
  }
}

const logout = async () => {
  try {
    await $fetch('/api/auth/logout')
    user.value = null
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage: Message = {
    role: 'user',
    content: currentMessage.value.trim(),
    timestamp: new Date().toISOString()
  }

  messages.value.push(userMessage)
  const messageToSend = currentMessage.value
  currentMessage.value = ''
  isLoading.value = true

  // Scroll to bottom
  nextTick(() => {
    scrollToBottom()
  })

  try {
    const history = messages.value
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }))

    const response = await $fetch('/api/ai-chat', {
      method: 'POST',
      body: {
        message: messageToSend,
        history: history.slice(0, -1) // Exclude the message we just added
      }
    })

    if (response.success) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      }
      messages.value.push(assistantMessage)
    } else {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${response.error || 'Unable to get response'}`,
        timestamp: new Date().toISOString()
      }
      messages.value.push(errorMessage)
    }
  } catch (error: any) {
    const errorMessage: Message = {
      role: 'assistant',
      content: `Error: ${error.message || 'AI connection error'}`,
      timestamp: new Date().toISOString()
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const clearChat = () => {
  if (confirm('Are you sure you want to clear the chat?')) {
    messages.value = []
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(async () => {
  await checkAuth()
  // If not authenticated after check, redirect to home
  if (!user.value) {
    navigateTo('/')
  }
})
</script>

