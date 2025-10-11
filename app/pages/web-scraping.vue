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
                Chat con IA
              </NuxtLink>
            </nav>
          </div>
          
          <div class="flex items-center gap-4">
            <template v-if="user">
              <span class="text-gray-600">Hola, <strong>{{ user.name }}</strong></span>
              <NuxtLink to="/prompts" class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                Gestionar Prompts
              </NuxtLink>
              <button @click="logout" class="px-4 py-2 rounded-md border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-colors">
                Cerrar Sesión
              </button>
            </template>
            <button v-else @click="showLoginModal = true" class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Iniciar Sesión</h2>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <input
              v-model="loginEmail"
              type="email"
              placeholder="Ingresa tu correo..."
              class="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              v-model="loginPassword"
              type="password"
              placeholder="Ingresa tu contraseña..."
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
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loginLoading"
              class="flex-1 px-4 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {{ loginLoading ? 'Cargando...' : 'Iniciar Sesión' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Action Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Extraer Publicaciones</h2>
        
        <!-- URL Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">URL a Scrapear</label>
          <input
            v-model="targetUrl"
            type="text"
            placeholder="https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en"
            class="w-full px-4 py-2 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <p class="text-xs text-gray-500 mt-1">Puedes cambiar la URL para scrapear diferentes páginas</p>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              Haz clic en el botón para scrapear las últimas publicaciones de FAO
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
              Haciendo web scraping...
            </span>
            <span v-else>Hacer Web Scraping</span>
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm font-medium">{{ error }}</p>
        </div>

        <!-- Current URL Display -->
        <div v-if="scrapedUrl" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-gray-600 font-medium mb-1">URL Scrapeada:</p>
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
                {{ jsonCopied ? '✓ Copiado' : 'Copiar' }}
              </button>
            </div>
            <pre class="text-green-400 text-xs overflow-auto max-h-[600px] font-mono">{{ jsonData }}</pre>
          </div>
        </div>

        <!-- Publications List (Right Side) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              Resultados ({{ publications.length }} publicaciones encontradas)
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
                    Ver Publicación
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay publicaciones aún</h3>
        <p class="mt-1 text-sm text-gray-500">
          Haz clic en el botón de arriba para comenzar a scrapear publicaciones
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Publication {
  title: string
  url: string
  date: string
  description: string
  image: string
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
      loginError.value = data.error || 'Error al iniciar sesión'
    }
  } catch (error: any) {
    loginError.value = error.message || 'Error al iniciar sesión'
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

const scrapePublications = async () => {
  loading.value = true
  error.value = ''
  publications.value = []
  jsonData.value = ''
  scrapedUrl.value = ''

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
      error.value = response.error || 'Error al scrapear las publicaciones'
    }
  } catch (err: any) {
    error.value = err.message || 'Ocurrió un error inesperado'
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

onMounted(() => {
  checkAuth()
})
</script>
