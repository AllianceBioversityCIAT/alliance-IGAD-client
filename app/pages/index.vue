<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation Bar -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="flex items-center gap-2">
              <img src="/igad-logo.png" alt="IGAD Logo" class="h-8 w-auto" />
              <span class="text-lg font-semibold text-green-800">IGAD AI Hub</span>
            </NuxtLink>
            <nav v-if="user" class="flex items-center gap-4">
              <NuxtLink to="/web-scraping" class="text-gray-600 hover:text-green-600 transition-colors">
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

        <!-- Web Scraping - Requires Login -->
        <NuxtLink v-if="user" to="/web-scraping" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-green-200 hover:border-green-300 cursor-pointer">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Available</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-green-100 group-hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe text-green-700">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Web Scraping</h3>
                <p class="text-gray-600 leading-relaxed">Extract publications and research data from FAO and other sources</p>
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
        </NuxtLink>

        <!-- Web Scraping - Login Required (when not authenticated) -->
        <div v-else @click="showLoginModal = true" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-yellow-200 hover:border-yellow-300 cursor-pointer">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Login Required</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-yellow-100 group-hover:bg-yellow-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe text-yellow-700">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">Web Scraping</h3>
                <p class="text-gray-600 leading-relaxed">Extract publications and research data from FAO and other sources</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white group-hover:translate-x-1 transition-transform">
                  Login to Access
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock ml-2 h-4 w-4">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Chat - Requires Login -->
        <NuxtLink v-if="user" to="/ai-chat" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-green-200 hover:border-green-300 cursor-pointer">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Available</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-green-100 group-hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle text-green-700">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">AI Chat</h3>
                <p class="text-gray-600 leading-relaxed">Chat with AI assistant specialized in IGAD agricultural development</p>
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
        </NuxtLink>

        <!-- AI Chat - Login Required (when not authenticated) -->
        <div v-else @click="showLoginModal = true" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-yellow-200 hover:border-yellow-300 cursor-pointer">
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Login Required</span>
          </div>
          <div class="p-8">
            <div class="flex flex-col space-y-6">
              <div class="self-start p-4 rounded-xl transition-colors bg-yellow-100 group-hover:bg-yellow-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle text-yellow-700">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                </svg>
              </div>
              <div class="space-y-3">
                <h3 class="text-xl text-gray-900">AI Chat</h3>
                <p class="text-gray-600 leading-relaxed">Chat with AI assistant specialized in IGAD agricultural development</p>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white group-hover:translate-x-1 transition-transform">
                  Login to Access
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock ml-2 h-4 w-4">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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
import { ref, onMounted } from 'vue'

const user = ref<any>(null)
const showLoginModal = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

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

onMounted(() => {
  checkAuth()
})
</script>