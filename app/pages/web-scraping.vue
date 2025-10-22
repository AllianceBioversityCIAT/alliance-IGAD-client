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
            <template v-if="isLoggedIn">
              <span class="text-gray-600">Hello, <strong>{{ userName }}</strong></span>
              <NuxtLink to="/prompts" class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                Manage Prompts
              </NuxtLink>
              <button @click="handleLogout" class="px-4 py-2 rounded-md border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-colors">
                Logout
              </button>
            </template>
            <NuxtLink v-else to="/login" class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
              Login
            </NuxtLink>
          </div>
        </div>
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
      <div v-if="classifiedPublications.length > 0" class="space-y-6">
        <!-- JSON Display Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Basic JSON Display -->
          <div class="bg-gray-900 rounded-lg shadow-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-white font-semibold">Basic Scraping JSON</h3>
              <button
                @click="copyJson"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
              >
                {{ jsonCopied ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <pre class="text-green-400 text-xs overflow-auto max-h-[400px] font-mono">{{ jsonData }}</pre>
          </div>

          <!-- AI Classified JSON Display -->
          <div class="bg-purple-900 rounded-lg shadow-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-white font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Classified JSON
              </h3>
              <button
                @click="copyClassifiedJson"
                class="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white text-xs rounded transition-colors"
              >
                {{ classifiedJsonCopied ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <pre class="text-purple-200 text-xs overflow-auto max-h-[400px] font-mono">{{ classifiedJsonData }}</pre>
          </div>
        </div>

        <!-- AI Classified Publications List -->
        <div class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Classified Publications ({{ classifiedPublications.length }} articles analyzed)
            </h2>
          </div>

          <div
            v-for="(pub, index) in classifiedPublications"
            :key="index"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-purple-100 overflow-hidden"
          >
            <div class="p-6">
              <!-- Header with AI Badge -->
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 flex-1">
                  <a
                    v-if="pub.url"
                    :href="pub.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-purple-600 transition-colors"
                  >
                    {{ pub.title }}
                  </a>
                  <span v-else>{{ pub.title }}</span>
                </h3>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Classified
                </span>
              </div>

              <!-- Author -->
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ pub.author }}
                </span>
              </div>

              <!-- Description -->
              <p class="text-gray-700 text-sm leading-relaxed mb-4">
                {{ pub.description }}
              </p>

              <!-- Tags -->
              <div v-if="pub.tags && pub.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="(tag, tagIndex) in pub.tags"
                  :key="tagIndex"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Actions -->
              <div v-if="pub.url" class="flex gap-2">
                <a
                  :href="pub.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  View Publication
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <!-- Related URLs -->
              <div v-if="pub.relatedUrls && pub.relatedUrls.length > 0" class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  URLs Relacionadas Identificadas por IA
                </h4>
                <ul class="space-y-2">
                  <li
                    v-for="(relUrl, urlIndex) in pub.relatedUrls"
                    :key="urlIndex"
                    class="flex items-start gap-2"
                  >
                    <span class="text-purple-600 text-xs mt-1">{{ urlIndex + 1 }}.</span>
                    <a
                      :href="relUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all flex-1"
                    >
                      {{ relUrl }}
                    </a>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </li>
                </ul>
              </div>

              <!-- Full Content (Collapsible) -->
              <details v-if="pub.fullContent" class="mt-4">
                <summary class="text-xs text-gray-500 cursor-pointer hover:text-purple-600 font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver contenido completo ({{ pub.fullContent.length.toLocaleString() }} caracteres)
                </summary>
                <div class="mt-3 p-4 bg-gray-50 rounded border border-gray-200 max-h-96 overflow-auto">
                  <div class="prose prose-sm max-w-none">
                    <pre class="whitespace-pre-wrap text-xs text-gray-700 font-sans">{{ pub.fullContent }}</pre>
                  </div>
                  <button
                    @click="copyFullContent(pub.fullContent)"
                    class="mt-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar contenido completo
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Chat Button & Chat Window -->
      <div v-if="classifiedPublications.length > 0" class="fixed bottom-6 right-6 z-50">
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
                <p class="text-xs text-purple-100">{{ classifiedPublications.length }} publications loaded</p>
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
                I can answer questions based on the titles and descriptions of the {{ classifiedPublications.length }} scraped publications.
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
const { isLoggedIn, userName, checkAuth, logout } = useAuth()

interface Publication {
  title: string
  url: string
  date: string
  description: string
  image: string
}

interface ClassifiedPublication {
  title: string
  description: string
  tags: string[]
  author: string
  url: string
  fullContent: string // Contenido completo sin resumir
  contentPreview: string // Preview corto
  relatedUrls: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const publications = ref<Publication[]>([])
const classifiedPublications = ref<ClassifiedPublication[]>([])
const loading = ref(false)
const error = ref('')
const targetUrl = ref('https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en')
const scrapedUrl = ref('')
const jsonData = ref('')
const classifiedJsonData = ref('')
const jsonCopied = ref(false)
const classifiedJsonCopied = ref(false)

// Chat states
const chatOpen = ref(false)
const chatMessages = ref<ChatMessage[]>([])
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessagesContainer = ref<HTMLElement | null>(null)

const handleLogout = () => {
  logout()
  navigateTo('/')
}

const scrapePublications = async () => {
  loading.value = true
  error.value = ''
  publications.value = []
  classifiedPublications.value = []
  jsonData.value = ''
  classifiedJsonData.value = ''
  scrapedUrl.value = ''
  // Reset chat when scraping new publications
  chatMessages.value = []
  chatOpen.value = false

  try {
    const response: any = await $fetch('/api/scrape-publications', {
      params: {
        url: targetUrl.value
      }
    })
    
    if (response.success) {
      publications.value = response.basicPublications || []
      classifiedPublications.value = response.classifiedPublications || []
      scrapedUrl.value = response.url
      jsonData.value = JSON.stringify(response.basicPublications, null, 2)
      classifiedJsonData.value = JSON.stringify(response.classifiedPublications, null, 2)
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

const copyClassifiedJson = async () => {
  try {
    await navigator.clipboard.writeText(classifiedJsonData.value)
    classifiedJsonCopied.value = true
    setTimeout(() => {
      classifiedJsonCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error copying to clipboard:', err)
  }
}

const copyFullContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    alert('Contenido copiado al portapapeles!')
  } catch (err) {
    console.error('Error copying to clipboard:', err)
    alert('Error al copiar el contenido')
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

    const response: any = await $fetch('/api/ai-publications-chat', {
      method: 'POST',
      body: {
        message: messageToSend,
        publications: classifiedPublications.value.map(p => ({
          title: p.title,
          description: p.description,
          tags: p.tags,
          author: p.author,
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

onMounted(() => {
  checkAuth()
})
</script>
