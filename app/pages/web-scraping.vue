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
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Extract Publications with AI</h2>

        <!-- URL Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">URL to Scrape</label>
          <input
            v-model="targetUrl"
            type="text"
            placeholder="https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en"
            class="w-full px-4 py-2 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <p class="text-xs text-gray-500 mt-1">Enter any publication listing page URL</p>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              AI will extract publications and navigate through pages automatically
            </p>
            <p v-if="scrapingStatus" class="text-xs text-blue-600 mt-1">
              {{ scrapingStatus }}
            </p>
          </div>
          <button
            @click="startScraping"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loadingMessage }}
            </span>
            <span v-else>Start AI Scraping</span>
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm font-medium">{{ error }}</p>
        </div>

        <!-- Success Display -->
        <div v-if="publications.length > 0" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-800 font-medium">
            ✅ Successfully scraped {{ pagesProcessed }} page(s)
          </p>
          <p class="text-xs text-green-600 mt-1">
            Total publications extracted: {{ publications.length }}
          </p>
          <p class="text-xs text-gray-600 mt-1">
            AI retries used: {{ aiRetriesUsed }} / {{ maxAIRetries }}
          </p>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="publications.length > 0" class="space-y-6">
        <!-- JSON Display -->
        <div class="bg-gray-900 rounded-lg shadow-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-semibold">Extracted Publications (JSON)</h3>
            <button
              @click="copyJson"
              class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              {{ jsonCopied ? '✓ Copied' : 'Copy JSON' }}
            </button>
          </div>
          <pre class="text-green-400 text-xs overflow-auto max-h-[400px] font-mono">{{ jsonData }}</pre>
        </div>

        <!-- Publications List -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-gray-900">
            Extracted Publications ({{ publications.length }})
          </h2>

          <div
            v-for="(pub, index) in publications"
            :key="index"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <!-- Title -->
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

            <!-- Date -->
            <p v-if="pub.date" class="text-sm text-gray-500 mb-3">
              📅 {{ pub.date }}
            </p>

            <!-- Description -->
            <p v-if="pub.description" class="text-gray-700 text-sm leading-relaxed mb-4">
              {{ pub.description }}
            </p>

            <!-- Image -->
            <div v-if="pub.image" class="mb-4">
              <img
                :src="pub.image"
                :alt="pub.title"
                class="w-32 h-32 object-cover rounded border border-gray-200"
                @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              />
            </div>

            <!-- URL -->
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
          Click the button above to start AI-powered scraping
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, userName, checkAuth, logout } = useAuth()

interface Publication {
  title: string
  url?: string
  description?: string
  date?: string
  image?: string
  [key: string]: any
}

const publications = ref<Publication[]>([])
const loading = ref(false)
const error = ref('')
const targetUrl = ref('https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en')
const scrapingStatus = ref('')
const loadingMessage = ref('Scraping...')
const jsonData = ref('')
const jsonCopied = ref(false)
const pagesProcessed = ref(0)
const aiRetriesUsed = ref(0)
const maxAIRetries = ref(3)

const handleLogout = () => {
  logout()
  navigateTo('/')
}

const startScraping = async () => {
  loading.value = true
  error.value = ''
  publications.value = []
  pagesProcessed.value = 0
  aiRetriesUsed.value = 0

  try {
    scrapingStatus.value = 'Starting AI-powered scraping...'
    loadingMessage.value = 'Analyzing page structure...'

    const response: any = await $fetch('/api/scrape-pages', {
      params: {
        url: targetUrl.value
      },
      timeout: 180000 // 3 minutes timeout
    })

    if (!response.success) {
      error.value = response.error || 'Failed to scrape publications'
      return
    }

    publications.value = response.publications || []
    pagesProcessed.value = response.pagesProcessed || 0
    aiRetriesUsed.value = response.config?.aiRetriesUsed || 0
    maxAIRetries.value = response.config?.maxAIRetries || 3

    jsonData.value = JSON.stringify(response.publications, null, 2)

    scrapingStatus.value = `✅ Complete! Extracted ${publications.value.length} publications from ${pagesProcessed.value} page(s)`

  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    console.error('Scraping error:', err)
  } finally {
    loading.value = false
    loadingMessage.value = 'Scraping...'
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

onMounted(() => {
  checkAuth()
})
</script>
