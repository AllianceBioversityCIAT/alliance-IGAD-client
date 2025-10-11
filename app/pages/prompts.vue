<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          🤖 AI Prompts Manager
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">
          Manage and organize your artificial intelligence prompts
        </p>
      </div>

      <!-- Input Section -->
      <div class="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
        <form @submit.prevent="savePrompt" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              📝 Title
            </label>
            <input
              v-model="title"
              type="text"
              placeholder="Enter a title for your prompt..."
              class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ✨ Prompt
            </label>
            <textarea
              v-model="newPrompt"
              placeholder="Write your prompt here... 💭"
              rows="6"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none placeholder:text-slate-400"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading || !newPrompt || !title"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="!loading">💾 Save Prompt</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div class="text-4xl font-bold">{{ prompts.length }}</div>
          <div class="text-blue-100 text-sm mt-1">Total Prompts</div>
        </div>
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div class="text-4xl font-bold">{{ recentCount }}</div>
          <div class="text-indigo-100 text-sm mt-1">Added Today</div>
        </div>
      </div>

      <!-- Prompts History -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          📚 Prompts History
          <span class="text-sm font-normal text-slate-500 dark:text-slate-400">({{ prompts.length }})</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loadingPrompts" class="text-center py-12">
        <svg class="animate-spin h-12 w-12 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-slate-600 dark:text-slate-400 mt-4">Loading prompts...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="prompts.length === 0" class="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No prompts yet
        </h3>
        <p class="text-slate-500 dark:text-slate-400">
          Create your first prompt using the form above!
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
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  💬 {{ prompt.title }}
                </h3>
              </div>
              <button
                @click="deletePrompt(prompt.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0"
                title="Delete"
              >
                🗑️
              </button>
            </div>

            <p class="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap">
              {{ prompt.prompt }}
            </p>

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
  title: string
  prompt: string
  created_at: string
}

const prompts = ref<Prompt[]>([])
const title = ref('')
const newPrompt = ref('')
const loading = ref(false)
const loadingPrompts = ref(true)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const messageClass = computed(() => ({
  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700': messageType.value === 'success',
  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700': messageType.value === 'error'
}))

const recentCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return prompts.value.filter(p => new Date(p.created_at) >= today).length
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
        title: title.value,
        prompt: newPrompt.value
      }
    })

    if (data.success) {
      messageType.value = 'success'
      message.value = '✅ Prompt saved successfully'
      title.value = ''
      newPrompt.value = ''
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
  if (!confirm('Are you sure you want to delete this prompt?')) return
  
  try {
    const data = await $fetch(`/api/prompts/delete?id=${id}`)
    if (data.success) {
      await loadPrompts()
      messageType.value = 'success'
      message.value = '🗑️ Prompt deleted'
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

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString('en-US', {
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

