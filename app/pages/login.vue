<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl border border-green-200 w-full max-w-md p-8">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <img src="/logo-login.png" alt="IGAD - Intergovernmental Authority on Development" class="h-20 w-auto" />
      </div>

      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold mb-2 text-green-800">Welcome to IGAD AI Hub</h1>
        <p class="text-gray-600">Agricultural Intelligence Platform</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email Input -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your.email@igad.int"
            class="w-full px-3 py-2 rounded-md border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
          />
        </div>

        <!-- Password Input -->
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 rounded-md border border-green-200 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
          />
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="rounded border-green-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-gray-600">Remember me</span>
          </label>
          <a href="#" class="text-green-700 hover:text-green-800">Forgot password?</a>
        </div>

        <!-- Sign In Button -->
        <button
          type="submit"
          class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium h-11"
        >
          Sign In
        </button>

        <!-- Demo Mode Notice -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800 text-center">
            <strong>Demo Mode:</strong> Click "Sign In" to continue without credentials
          </p>
        </div>
      </form>

      <!-- Footer -->
      <div class="mt-8 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-500">IGAD - Peace, Prosperity and Regional Integration</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { login } = useAuth()

const email = ref('demo.user@igad.int')
const password = ref('demo123')
const rememberMe = ref(true)

const handleLogin = () => {
  // Extract name from email or use a default
  let userName = 'User'

  if (email.value.trim()) {
    // Extract name from email (before @)
    const emailParts = email.value.split('@')
    if (emailParts.length > 0) {
      userName = emailParts[0].split('.').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ')
    }
  }

  // Simulate login (no actual validation)
  login(userName)
  router.push('/')
}
</script>
