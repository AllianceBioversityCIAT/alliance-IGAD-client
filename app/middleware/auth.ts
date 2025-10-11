export default defineNuxtRouteMiddleware(async () => {
  // Only run on client side
  if (import.meta.server) return

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auth = await $fetch('/api/auth/me') as any
    
    if (!auth.authenticated) {
      // User is not authenticated, redirect to home
      return navigateTo('/')
    }
  } catch {
    // Error checking auth, redirect to home
    return navigateTo('/')
  }
})