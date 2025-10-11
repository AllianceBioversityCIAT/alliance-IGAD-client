export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required"
      }
    }

    // Check if user exists
    const { results } = await db.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email).all()

    if (results.length === 0) {
      return {
        success: false,
        error: "Invalid email or password"
      }
    }

    const user = results[0]

    // Hash the provided password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Verify password
    if (passwordHash !== user.password_hash) {
      return {
        success: false,
        error: "Invalid email or password"
      }
    }

    // Create session (7 days)
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await db.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt.toISOString()).run()

    // Set cookie
    setCookie(event, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

