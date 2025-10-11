export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    const sessionId = getCookie(event, 'session_id')

    if (!sessionId) {
      return {
        success: false,
        authenticated: false
      }
    }

    // Get session with user
    const { results } = await db.prepare(`
      SELECT u.id, u.email, u.name, s.expires_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).bind(sessionId).all()

    if (results.length === 0) {
      deleteCookie(event, 'session_id')
      return {
        success: false,
        authenticated: false
      }
    }

    const session = results[0]
    const expiresAt = new Date(session.expires_at)

    // Check if session expired
    if (expiresAt < new Date()) {
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
      deleteCookie(event, 'session_id')
      return {
        success: false,
        authenticated: false
      }
    }

    return {
      success: true,
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

