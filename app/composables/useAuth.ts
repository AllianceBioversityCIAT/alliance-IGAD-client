export const useAuth = () => {
  const isLoggedIn = useState('isLoggedIn', () => false)
  const userName = useState('userName', () => '')

  // Check if user is logged in on mount
  const checkAuth = () => {
    if (process.client) {
      const logged = localStorage.getItem('isLoggedIn') === 'true'
      const name = localStorage.getItem('userName') || ''
      isLoggedIn.value = logged
      userName.value = name
    }
  }

  // Login function
  const login = (name: string) => {
    if (process.client) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userName', name)
      isLoggedIn.value = true
      userName.value = name
    }
  }

  // Logout function
  const logout = () => {
    if (process.client) {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userName')
      isLoggedIn.value = false
      userName.value = ''
    }
  }

  return {
    isLoggedIn,
    userName,
    checkAuth,
    login,
    logout
  }
}
