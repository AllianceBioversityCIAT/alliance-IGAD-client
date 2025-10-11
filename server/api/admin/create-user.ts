// This endpoint is for manual user creation via curl/console
// NOT exposed in the UI - for admins only

export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    const body = await readBody(event)
    const { email, name, password } = body

    if (!email || !name || !password) {
      return {
        success: false,
        error: "email, name, and password are required"
      }
    }

    // Hash password using SHA-256
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Create user
    const result = await db.prepare(
      "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)"
    ).bind(email, name, passwordHash).run()

    return {
      success: true,
      message: "User created successfully",
      user: {
        id: result.meta.last_row_id,
        email,
        name
      }
    }
  } catch (error: any) {
    // Check for unique constraint
    if (error.message?.includes('UNIQUE constraint failed')) {
      return {
        success: false,
        error: "User with this email already exists"
      }
    }
    return {
      success: false,
      error: error.message
    }
  }
})

