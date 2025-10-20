export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env
  const db = env?.DB

  if (!db) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: "Database not available"
    }
  }

  // Check authentication
  // const sessionId = getCookie(event, 'session_id')
  
  // if (!sessionId) {
  //   setResponseStatus(event, 401)
  //   return {
  //     success: false,
  //     error: "Authentication required"
  //   }
  // }

  // // Verify session
  // const { results } = await db.prepare(`
  //   SELECT u.id, u.email, u.name, s.expires_at
  //   FROM sessions s
  //   JOIN users u ON s.user_id = u.id
  //   WHERE s.id = ?
  // `).bind(sessionId).all()

  // if (results.length === 0) {
  //   setResponseStatus(event, 401)
  //   return {
  //     success: false,
  //     error: "Invalid session"
  //   }
  // }

  // const session = results[0]
  // const expiresAt = new Date(session.expires_at)

  // if (expiresAt < new Date()) {
  //   await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
  //   setResponseStatus(event, 401)
  //   return {
  //     success: false,
  //     error: "Session expired"
  //   }
  // }

  try {
    const body = await readBody(event)
    const { name, url, description } = body

    if (!name) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: "Name is required"
      }
    }

    const result = await db.prepare(`
      INSERT INTO scraping_sources (name, url, description)
      VALUES (?, ?, ?)
    `).bind(name, url || null, description || null).run()

    return {
      success: true,
      id: result.meta.last_row_id,
      message: "Scraping source created successfully"
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: "Error creating scraping source",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

