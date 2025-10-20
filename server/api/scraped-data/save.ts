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
  const sessionId = getCookie(event, 'session_id')
  
  if (!sessionId) {
    setResponseStatus(event, 401)
    return {
      success: false,
      error: "Authentication required"
    }
  }

  // Verify session
  const { results } = await db.prepare(`
    SELECT u.id, u.email, u.name, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).bind(sessionId).all()

  if (results.length === 0) {
    setResponseStatus(event, 401)
    return {
      success: false,
      error: "Invalid session"
    }
  }

  const session = results[0]
  const expiresAt = new Date(session.expires_at)

  if (expiresAt < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
    setResponseStatus(event, 401)
    return {
      success: false,
      error: "Session expired"
    }
  }

  try {
    const body = await readBody(event)
    const { source_id, description, data } = body

    if (!source_id || !description || !data) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: "source_id, description, and data are required"
      }
    }

    // Verify source exists
    const sourceCheck = await db.prepare(`
      SELECT id FROM scraping_sources WHERE id = ?
    `).bind(source_id).first()

    if (!sourceCheck) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: "Scraping source not found"
      }
    }

    // Convert data to JSON string if it's an object
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data)

    const result = await db.prepare(`
      INSERT INTO scraped_data (source_id, description, data, created_by)
      VALUES (?, ?, ?, ?)
    `).bind(source_id, description, jsonData, session.id).run()

    return {
      success: true,
      id: result.meta.last_row_id,
      message: "Scraped data saved successfully"
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: "Error saving scraped data",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

