export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB
  
  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    const sessionId = getCookie(event, 'session_id')

    if (sessionId) {
      // Delete session from database
      await db.prepare(
        "DELETE FROM sessions WHERE id = ?"
      ).bind(sessionId).run()
    }

    // Clear cookie
    deleteCookie(event, 'session_id')

    return {
      success: true,
      message: "Logged out successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

