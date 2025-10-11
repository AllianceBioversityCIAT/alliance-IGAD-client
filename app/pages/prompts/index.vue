<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100">
      <div class="container mx-auto px-4 py-12">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl mb-4 tracking-tight text-green-800">
            🤖 Prompts Management
          </h1>
          <p class="text-xl text-green-700 mb-2 max-w-3xl mx-auto leading-relaxed">
            Select the type of prompt you want to manage
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 max-w-6xl">
      <!-- Prompt Types Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        <!-- Proposal Writer -->
        <NuxtLink to="/prompts/proposal-writer">
          <div class="bg-card text-card-foreground rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 p-8 shadow-lg group bg-white/80 backdrop-blur-sm cursor-pointer h-full">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-green-100 group-hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-700">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-2xl text-gray-900">Proposal Writer</h3>
                <p class="text-gray-600 leading-relaxed">
                  Manage prompts for funding proposals and project applications
                </p>
              </div>
              <div class="pt-4 flex items-center text-green-600 group-hover:translate-x-2 transition-transform">
                <span class="font-medium">Manage Prompts</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Newsletter Generator -->
        <NuxtLink to="/prompts/newsletter-generator">
          <div class="bg-card text-card-foreground rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 p-8 shadow-lg group bg-white/80 backdrop-blur-sm cursor-pointer h-full">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-green-100 group-hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-700">
                  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-2xl text-gray-900">Newsletter Generator</h3>
                <p class="text-gray-600 leading-relaxed">
                  Manage prompts for newsletters and communications
                </p>
              </div>
              <div class="pt-4 flex items-center text-green-600 group-hover:translate-x-2 transition-transform">
                <span class="font-medium">Manage Prompts</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </NuxtLink>

      </div>

      <!-- Back Button -->
      <div class="mt-12 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Check authentication on mount
onMounted(async () => {
  const auth = await $fetch('/api/auth/me')
  if (!auth.authenticated) {
    navigateTo('/')
  }
})
</script>

