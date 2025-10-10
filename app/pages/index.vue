<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100">
      <div class="container mx-auto px-4 py-12">
        <div class="text-center">
          <!-- Logo -->
          <div class="flex justify-center mb-8">
            <img 
              src="/igad-logo.png" 
              alt="IGAD - Intergovernmental Authority on Development Logo" 
              class="h-24 w-auto object-contain"
            />
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl md:text-5xl mb-4 tracking-tight text-green-800">
            AI-Powered Agricultural Intelligence Hub
          </h1>

          <!-- Subtitle -->
          <p class="text-xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Empowering agricultural experts across the IGAD region with intelligent tools for policy analysis, report generation, and strategic communication
          </p>

          <!-- Mission Card -->
          <div class="max-w-4xl mx-auto">
            <div class="text-card-foreground flex flex-col gap-6 rounded-xl border p-8 bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
              <div class="flex items-center justify-center mb-4">
                <div class="w-12 h-0.5 bg-green-600"></div>
                <span class="mx-4 text-green-800 font-medium">PEACE, PROSPERITY AND REGIONAL INTEGRATION</span>
                <div class="w-12 h-0.5 bg-green-600"></div>
              </div>
              <p class="text-lg leading-relaxed text-gray-700">
                Supporting the Intergovernmental Authority on Development's mission through advanced AI tools that enhance agricultural productivity, policy development, and regional cooperation across East Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tools & Services Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl mb-4 text-green-800">AI-Powered Tools & Services</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our suite of specialized tools designed for agricultural experts, policy makers, and development professionals.
        </p>
      </div>

      <!-- Tools Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Report Generator - Coming Soon -->
        <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-gray-200 opacity-75">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">Coming Soon</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column text-gray-500">
                  <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                  <path d="M18 17V9"></path>
                  <path d="M13 17V5"></path>
                  <path d="M8 17v-3"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Report Generator</h3>
                <p class="text-gray-600 leading-relaxed">Generate comprehensive agricultural and policy reports with AI assistance</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Policy Analyzer - Coming Soon -->
        <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-gray-200 opacity-75">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">Coming Soon</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search text-gray-500">
                  <path d="m21 21-4.34-4.34"></path>
                  <circle cx="11" cy="11" r="8"></circle>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Policy Analyzer</h3>
                <p class="text-gray-600 leading-relaxed">Analyze and review regional policies for agricultural development</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Proposal Writer - Available -->
        <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-green-200 hover:border-green-300 cursor-pointer">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Available</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-green-100 group-hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen text-green-700">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Proposal Writer</h3>
                <p class="text-gray-600 leading-relaxed">Create compelling funding proposals for agricultural initiatives</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 w-full bg-green-600 hover:bg-green-700 text-white group-hover:translate-x-1 transition-transform">
                  Launch Tool
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-2 h-4 w-4">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Newsletter Generator - Available -->
        <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-green-200 hover:border-green-300 cursor-pointer">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Available</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-green-100 group-hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail text-green-700">
                  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Newsletter Generator</h3>
                <p class="text-gray-600 leading-relaxed">Create engaging newsletters on agricultural innovations and policy updates</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 w-full bg-green-600 hover:bg-green-700 text-white group-hover:translate-x-1 transition-transform">
                  Launch Tool
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-2 h-4 w-4">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Agribusiness Hub - Coming Soon -->
        <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-gray-200 opacity-75">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">Coming Soon</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up text-gray-500">
                  <path d="M16 7h6v6"></path>
                  <path d="m22 7-8.5 8.5-5-5L2 17"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Agribusiness Hub</h3>
                <p class="text-gray-600 leading-relaxed">Connect with agribusiness development opportunities across the region</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-green-800 text-white py-8 mt-16">
      <div class="container mx-auto px-4 text-center">
        <p class="text-green-100">© 2024 IGAD - Intergovernmental Authority on Development</p>
        <p class="text-green-200 text-sm mt-2">Advancing agricultural innovation and regional integration across East Africa</p>
      </div>
    </div>

    <!-- Floating Docs Button -->
    <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all rounded-md fixed bottom-6 right-6 z-50 shadow-lg bg-blue-600 hover:bg-blue-700 text-white h-14 px-6 gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open h-5 w-5">
        <path d="M12 7v14"></path>
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
      </svg>
      <span class="hidden sm:inline">View Docs</span>
    </button>
  </div>
</template>

<script setup lang="ts">
</script>