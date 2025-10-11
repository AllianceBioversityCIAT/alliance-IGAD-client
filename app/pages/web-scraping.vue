<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
              <NuxtLink to="/web-scraping" class="text-green-600 font-medium">
                Web Scraping
              </NuxtLink>
              <NuxtLink to="/ai-chat" class="text-gray-600 hover:text-green-600 transition-colors">
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

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Action Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Extract Publications</h2>
        
        <!-- URL Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">URL to Scrape</label>
          <input
            v-model="targetUrl"
            type="text"
            placeholder="https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en"
            class="w-full px-4 py-2 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <p class="text-xs text-gray-500 mt-1">You can change the URL to scrape different pages</p>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              Click the button to scrape the latest FAO publications
            </p>
          </div>
          <button
            @click="scrapePublications"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scraping publications...
            </span>
            <span v-else>Start Web Scraping</span>
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm font-medium">{{ error }}</p>
        </div>

        <!-- Current URL Display -->
        <div v-if="scrapedUrl" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-gray-600 font-medium mb-1">Scraped URL:</p>
          <p class="text-sm text-blue-800 break-all">{{ scrapedUrl }}</p>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="publications.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- JSON Display (Left Side) -->
        <div class="lg:col-span-1">
          <div class="bg-gray-900 rounded-lg shadow-lg p-4 sticky top-24">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-white font-semibold">JSON Response</h3>
              <button
                @click="copyJson"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
              >
                {{ jsonCopied ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <pre class="text-green-400 text-xs overflow-auto max-h-[600px] font-mono">{{ jsonData }}</pre>
          </div>
        </div>

        <!-- Publications List (Right Side) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              Results ({{ publications.length }} publications found)
            </h2>
          </div>

          <div
            v-for="(pub, index) in publications"
            :key="index"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
          >
            <div class="flex gap-4 p-6">
              <!-- Image -->
              <div v-if="pub.image" class="flex-shrink-0">
                <img 
                  :src="pub.image" 
                  :alt="pub.title"
                  class="w-32 h-32 object-cover rounded-lg"
                  @error="(e) => e.target.style.display = 'none'"
                />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  <a
                    v-if="pub.url"
                    :href="pub.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-blue-600 transition-colors"
                  >
                    {{ pub.title }}
                  </a>
                  <span v-else>{{ pub.title }}</span>
                </h3>
                
                <div class="flex items-center gap-2 mb-3">
                  <span v-if="pub.date" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ pub.date }}
                  </span>
                </div>

                <p v-if="pub.description" class="text-gray-600 text-sm leading-relaxed mb-3">
                  {{ pub.description }}
                </p>

                <div v-if="pub.url" class="flex gap-2">
                  <a
                    :href="pub.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Publication
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Chat Button & Chat Window -->
      <div v-if="publications.length > 0" class="fixed bottom-6 right-6 z-50">
        <!-- Chat Button -->
        <button
          v-if="!chatOpen"
          @click="chatOpen = true"
          class="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <!-- Chat Window -->
        <div
          v-else
          class="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden border-2 border-purple-200"
        >
          <!-- Chat Header -->
          <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h3 class="font-bold text-sm">Publications Query</h3>
                <p class="text-xs text-purple-100">{{ publications.length }} publications loaded</p>
              </div>
            </div>
            <button
              @click="chatOpen = false"
              class="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Chat Messages -->
          <div ref="chatMessagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <!-- Welcome Message -->
            <div v-if="chatMessages.length === 0" class="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-purple-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-sm text-gray-600 font-medium mb-2">Ask about the publications!</p>
              <p class="text-xs text-gray-500 px-4">
                I can answer questions based on the titles and descriptions of the {{ publications.length }} scraped publications.
              </p>
            </div>

            <!-- Messages -->
            <div v-for="(msg, index) in chatMessages" :key="index" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div
                class="max-w-[80%] rounded-xl px-4 py-2 shadow-sm"
                :class="msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-900 border border-gray-200'"
              >
                <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                <p class="text-xs mt-1 opacity-70" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
                  {{ formatTime(msg.timestamp) }}
                </p>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="chatLoading" class="flex justify-start">
              <div class="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="border-t border-gray-200 p-3 bg-white">
            <form @submit.prevent="sendChatMessage" class="flex gap-2">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Ask about the publications..."
                class="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                :disabled="chatLoading"
              />
              <button
                type="submit"
                :disabled="chatLoading || !chatInput.trim()"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <svg v-if="!chatLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </form>
            <button
              v-if="chatMessages.length > 0"
              @click="clearChatMessages"
              class="text-xs text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Clear conversation
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No publications yet</h3>
        <p class="mt-1 text-sm text-gray-500">
          Click the button above to start scraping publications
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Publication {
  title: string
  url: string
  date: string
  description: string
  image: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const user = ref<any>(null)
const showLoginModal = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

const publications = ref<Publication[]>([])
const loading = ref(false)
const error = ref('')
const targetUrl = ref('https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en')
const scrapedUrl = ref('')
const jsonData = ref('')
const jsonCopied = ref(false)

// Chat states
const chatOpen = ref(false)
const chatMessages = ref<ChatMessage[]>([])
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessagesContainer = ref<HTMLElement | null>(null)

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
    // Redirect to home page after logout
    navigateTo('/')
  } catch (error) {
    console.error('Error logging out:', error)
    // Redirect even if there's an error
    navigateTo('/')
  }
}

const scrapePublications = async () => {
  loading.value = true
  error.value = ''
  publications.value = []
  jsonData.value = ''
  scrapedUrl.value = ''
  // Reset chat when scraping new publications
  chatMessages.value = []
  chatOpen.value = false

  try {
    const response = await $fetch('/api/scrape-publications', {
      params: {
        url: targetUrl.value
      }
    })
    
    if (response.success) {
      publications.value = response.publications
      scrapedUrl.value = response.url
      jsonData.value = JSON.stringify(response, null, 2)
    } else {
      error.value = response.error || 'Failed to scrape publications'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    console.error('Scraping error:', err)
  } finally {
    loading.value = false
  }
}

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(jsonData.value)
    jsonCopied.value = true
    setTimeout(() => {
      jsonCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error copying to clipboard:', err)
  }
}

const sendChatMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value) return

  const userMessage: ChatMessage = {
    role: 'user',
    content: chatInput.value.trim(),
    timestamp: new Date().toISOString()
  }

  chatMessages.value.push(userMessage)
  const messageToSend = chatInput.value
  chatInput.value = ''
  chatLoading.value = true

  // Scroll to bottom
  nextTick(() => {
    scrollChatToBottom()
  })

  try {
    const history = chatMessages.value
      .map(m => ({ role: m.role, content: m.content }))

    const response = await $fetch('/api/ai-publications-chat', {
      method: 'POST',
      body: {
        message: messageToSend,
        publications: publications.value.map(p => ({
          title: p.title,
          date: p.date,
          description: p.description,
          url: p.url
        })),
        history: history.slice(0, -1) // Exclude the message we just added
      }
    })

    if (response.success) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      }
      chatMessages.value.push(assistantMessage)
    } else {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${response.error || 'Unable to get response'}`,
        timestamp: new Date().toISOString()
      }
      chatMessages.value.push(errorMessage)
    }
  } catch (error: any) {
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: `Error: ${error.message || 'AI connection error'}`,
      timestamp: new Date().toISOString()
    }
    chatMessages.value.push(errorMessage)
  } finally {
    chatLoading.value = false
    nextTick(() => {
      scrollChatToBottom()
    })
  }
}

const clearChatMessages = () => {
  if (confirm('Are you sure you want to clear the conversation?')) {
    chatMessages.value = []
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const scrollChatToBottom = () => {
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
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
