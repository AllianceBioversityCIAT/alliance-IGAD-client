<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          🤖 AI Prompts Manager
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">
          Gestiona y organiza tus prompts de inteligencia artificial
        </p>
      </div>

      <!-- Input Section -->
      <div class="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
        <form @submit.prevent="savePrompt" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ✨ Nuevo Prompt
            </label>
            <textarea
              v-model="newPrompt"
              placeholder="Escribe tu prompt aquí... 💭"
              rows="4"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none placeholder:text-slate-400"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                🎯 Modelo (opcional)
              </label>
              <input
                v-model="model"
                type="text"
                placeholder="ej: gpt-4, claude-3"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                📊 Tokens (opcional)
              </label>
              <input
                v-model.number="tokens"
                type="number"
                placeholder="ej: 1500"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !newPrompt"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="!loading">💾 Guardar Prompt</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          </button>
        </form>

        <!-- Success/Error Messages -->
        <transition name="fade">
          <div v-if="message" :class="messageClass" class="mt-4 p-4 rounded-lg">
            {{ message }}
          </div>
        </transition>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-3xl font-bold">{{ prompts.length }}</div>
          <div class="text-blue-100 text-sm">Total Prompts</div>
        </div>
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-3xl font-bold">{{ totalTokens.toLocaleString() }}</div>
          <div class="text-indigo-100 text-sm">Total Tokens</div>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-3xl font-bold">{{ uniqueModels }}</div>
          <div class="text-purple-100 text-sm">Modelos Únicos</div>
        </div>
      </div>

      <!-- Prompts History -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          📚 Historial de Prompts
          <span class="text-sm font-normal text-slate-500 dark:text-slate-400">({{ prompts.length }})</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loadingPrompts" class="text-center py-12">
        <svg class="animate-spin h-12 w-12 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-slate-600 dark:text-slate-400 mt-4">Cargando prompts...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="prompts.length === 0" class="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No hay prompts todavía
        </h3>
        <p class="text-slate-500 dark:text-slate-400">
          ¡Crea tu primer prompt usando el formulario de arriba!
        </p>
      </div>

      <!-- Prompts Grid -->
      <div v-else class="grid grid-cols-1 gap-4">
        <transition-group name="list">
          <div
            v-for="prompt in prompts"
            :key="prompt.id"
            class="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 group"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-2xl">💬</span>
                <span class="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {{ prompt.model }}
                </span>
                <span v-if="prompt.tokens > 0" class="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {{ prompt.tokens }} tokens
                </span>
              </div>
              <button
                @click="deletePrompt(prompt.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>

            <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap">
              {{ prompt.prompt }}
            </p>

            <div v-if="prompt.response" class="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4 border-l-4 border-green-500">
              <div class="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✅ Respuesta:</div>
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {{ prompt.response }}
              </p>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1">
                🕒 {{ formatDate(prompt.created_at) }}
              </span>
              <span class="font-mono text-slate-400 dark:text-slate-500">
                ID: {{ prompt.id }}
              </span>
            </div>
          </div>
        </transition-group>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Prompt {
  id: number
  prompt: string
  response: string | null
  model: string
  tokens: number
  created_at: string
  updated_at: string
}

const prompts = ref<Prompt[]>([])
const newPrompt = ref('')
const model = ref('')
const tokens = ref<number | null>(null)
const loading = ref(false)
const loadingPrompts = ref(true)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const messageClass = computed(() => ({
  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700': messageType.value === 'success',
  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700': messageType.value === 'error'
}))

const totalTokens = computed(() => {
  return prompts.value.reduce((sum, p) => sum + (p.tokens || 0), 0)
})

const uniqueModels = computed(() => {
  return new Set(prompts.value.map(p => p.model)).size
})

const loadPrompts = async () => {
  loadingPrompts.value = true
  try {
    const data = await $fetch('/api/prompts/list')
    if (data.success) {
      prompts.value = data.prompts
    }
  } catch (error) {
    console.error('Error loading prompts:', error)
  } finally {
    loadingPrompts.value = false
  }
}

const savePrompt = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const data = await $fetch('/api/prompts/create', {
      method: 'POST',
      body: {
        prompt: newPrompt.value,
        model: model.value || 'default',
        tokens: tokens.value || 0
      }
    })

    if (data.success) {
      messageType.value = 'success'
      message.value = '✅ Prompt guardado exitosamente'
      newPrompt.value = ''
      model.value = ''
      tokens.value = null
      await loadPrompts()
      
      setTimeout(() => {
        message.value = ''
      }, 3000)
    } else {
      messageType.value = 'error'
      message.value = `❌ Error: ${data.error}`
    }
  } catch (error: any) {
    messageType.value = 'error'
    message.value = `❌ Error: ${error.message}`
  } finally {
    loading.value = false
  }
}

const deletePrompt = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este prompt?')) return
  
  try {
    const data = await $fetch(`/api/prompts/delete?id=${id}`)
    if (data.success) {
      await loadPrompts()
      messageType.value = 'success'
      message.value = '🗑️ Prompt eliminado'
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error deleting prompt:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadPrompts()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.list-enter-active {
  transition: all 0.4s ease;
}
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>

