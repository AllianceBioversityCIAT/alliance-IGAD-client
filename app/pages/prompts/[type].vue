<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100">
      <div class="container mx-auto px-4 py-12">
        <div class="flex items-center justify-center mb-6">
          <NuxtLink to="/prompts" class="absolute left-4 inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors px-4 py-2 rounded-md hover:bg-white/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back
          </NuxtLink>
        </div>
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl mb-4 tracking-tight text-green-800">
            {{ pageTitle }}
          </h1>
          <p class="text-xl text-green-700 mb-2 max-w-3xl mx-auto leading-relaxed">
            Manage and organize your prompts
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 max-w-6xl">

      <!-- Input Section -->
      <div class="mb-8 bg-card text-card-foreground rounded-xl border-2 border-green-200 p-8 shadow-lg bg-white/80 backdrop-blur-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          {{ editingId ? '✏️ Edit Prompt' : '➕ Create New Prompt' }}
        </h3>
        <form @submit.prevent="savePrompt" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              📝 Title
            </label>
            <input
              v-model="title"
              type="text"
              placeholder="Enter a title for your prompt..."
              class="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ✨ Prompt
            </label>
            <textarea
              v-model="newPrompt"
              placeholder="Write your prompt here..."
              rows="6"
              class="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none placeholder:text-gray-400"
              required
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              v-if="editingId"
              type="button"
              @click="cancelEdit"
              class="flex-1 px-4 py-3 rounded-md border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || !newPrompt || !title"
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="editingId ? 'flex-1' : 'w-full'"
            >
              <span v-if="!loading" class="flex items-center justify-center gap-2">
                {{ editingId ? '💾 Update Prompt' : '💾 Save Prompt' }}
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ editingId ? 'Updating...' : 'Saving...' }}
              </span>
            </button>
          </div>
        </form>

        <!-- Success/Error Messages -->
        <transition name="fade">
          <div v-if="message" :class="messageClass" class="mt-4 p-4 rounded-md">
            {{ message }}
          </div>
        </transition>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div class="bg-card text-card-foreground rounded-xl border-2 border-green-200 p-8 bg-white/80 backdrop-blur-sm shadow-lg">
          <div class="text-4xl font-bold text-green-800 mb-2">{{ prompts.length }}</div>
          <div class="text-gray-600">Total Prompts</div>
        </div>
        <div class="bg-card text-card-foreground rounded-xl border-2 border-green-200 p-8 bg-white/80 backdrop-blur-sm shadow-lg">
          <div class="text-4xl font-bold text-green-800 mb-2">{{ activePrompt ? '1' : '0' }}</div>
          <div class="text-gray-600">Active Prompt</div>
        </div>
      </div>

      <!-- Prompts History -->
      <div class="mb-8">
        <h2 class="text-3xl text-green-800 mb-4 flex items-center gap-2">
          📚 Prompts History
          <span class="text-sm font-normal text-gray-600">({{ prompts.length }})</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loadingPrompts" class="text-center py-16">
        <svg class="animate-spin h-12 w-12 mx-auto text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 mt-4">Loading prompts...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="prompts.length === 0" class="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl text-gray-900 mb-2">
          No prompts yet
        </h3>
        <p class="text-gray-600 leading-relaxed">
          Create your first prompt using the form above!
        </p>
      </div>

      <!-- Prompts Grid -->
      <div v-else class="grid grid-cols-1 gap-6">
        <transition-group name="list">
          <div
            v-for="prompt in prompts"
            :key="prompt.id"
            :class="[
              'bg-card text-card-foreground rounded-xl transition-all duration-300 p-8 shadow-lg group bg-white/80 backdrop-blur-sm',
              prompt.is_active ? 'border-4 border-green-500' : 'border-2 border-green-200 hover:border-green-300'
            ]"
          >
            <!-- Active Badge -->
            <div v-if="prompt.is_active" class="mb-4">
              <span class="px-4 py-2 text-sm rounded-full bg-green-100 text-green-800 border-2 border-green-200 font-medium">
                ✅ Active Prompt
              </span>
            </div>

            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl text-gray-900 flex items-center gap-2 mb-2">
                  💬 {{ prompt.title }}
                </h3>
                <div class="flex flex-col gap-1 text-sm text-gray-500">
                  <span>Created by: <strong>{{ prompt.created_by_name }}</strong> ({{ prompt.created_by_email }})</span>
                  <span>Last updated by: <strong>{{ prompt.updated_by_name }}</strong> ({{ prompt.updated_by_email }})</span>
                </div>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <button
                  @click="editPrompt(prompt)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  title="Edit"
                >
                  ✏️ Edit
                </button>
                <button
                  v-if="!prompt.is_active"
                  @click="activatePrompt(prompt.id)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  title="Activate"
                >
                  ✓ Activate
                </button>
                <button
                  @click="deletePrompt(prompt.id)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p class="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
              {{ prompt.prompt }}
            </p>

            <div class="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
              <span class="flex items-center gap-1">
                🕒 {{ formatDate(prompt.created_at) }}
              </span>
              <span class="font-mono text-gray-400">
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

const route = useRoute()
const promptType = computed(() => route.params.type as string)

interface Prompt {
  id: number
  type: string
  title: string
  prompt: string
  is_active: number
  created_by: number
  updated_by: number
  created_by_name: string
  created_by_email: string
  updated_by_name: string
  updated_by_email: string
  created_at: string
  updated_at: string
}

const prompts = ref<Prompt[]>([])
const title = ref('')
const newPrompt = ref('')
const editingId = ref<number | null>(null)
const loading = ref(false)
const loadingPrompts = ref(true)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const pageTitle = computed(() => {
  if (promptType.value === 'proposal-writer') return '📝 Proposal Writer Prompts'
  if (promptType.value === 'newsletter-generator') return '📧 Newsletter Generator Prompts'
  return 'Prompts Manager'
})

const dbType = computed(() => {
  if (promptType.value === 'proposal-writer') return 'proposal_writer'
  if (promptType.value === 'newsletter-generator') return 'newsletter_generator'
  return ''
})

const activePrompt = computed(() => prompts.value.find(p => p.is_active === 1))

const messageClass = computed(() => ({
  'bg-green-100 text-green-800 border-2 border-green-200': messageType.value === 'success',
  'bg-red-100 text-red-800 border-2 border-red-200': messageType.value === 'error'
}))

const loadPrompts = async () => {
  loadingPrompts.value = true
  try {
    const data = await $fetch(`/api/prompts/list?type=${dbType.value}`)
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
    if (editingId.value) {
      // Update existing prompt
      const data = await $fetch('/api/prompts/update', {
        method: 'POST',
        body: {
          id: editingId.value,
          title: title.value,
          prompt: newPrompt.value
        }
      })

      if (data.success) {
        messageType.value = 'success'
        message.value = '✅ Prompt updated successfully'
        cancelEdit()
        await loadPrompts()
        
        setTimeout(() => {
          message.value = ''
        }, 3000)
      } else {
        messageType.value = 'error'
        message.value = `❌ Error: ${data.error}`
      }
    } else {
      // Create new prompt
      const data = await $fetch('/api/prompts/create', {
        method: 'POST',
        body: {
          type: dbType.value,
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
    }
  } catch (error: any) {
    messageType.value = 'error'
    message.value = `❌ Error: ${error.message}`
  } finally {
    loading.value = false
  }
}

const editPrompt = (prompt: Prompt) => {
  editingId.value = prompt.id
  title.value = prompt.title
  newPrompt.value = prompt.prompt
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingId.value = null
  title.value = ''
  newPrompt.value = ''
}

const activatePrompt = async (id: number) => {
  try {
    const data = await $fetch(`/api/prompts/activate?id=${id}`)
    if (data.success) {
      await loadPrompts()
      messageType.value = 'success'
      message.value = '✅ Prompt activated'
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error activating prompt:', error)
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

onMounted(async () => {
  // Check authentication
  const auth = await $fetch('/api/auth/me')
  if (!auth.authenticated) {
    navigateTo('/')
    return
  }

  await loadPrompts()
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

