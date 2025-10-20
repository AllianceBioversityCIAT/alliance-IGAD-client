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
    const id = event.context.params?.id

    if (!id) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: "ID parameter is required"
      }
    }

    const result = await db.prepare(`
      SELECT 
        sd.id,
        sd.source_id,
        sd.description,
        sd.data,
        sd.created_at,
        sd.updated_at,
        ss.name as source_name,
        ss.url as source_url,
        u.name as created_by_name,
        u.email as created_by_email
      FROM scraped_data sd
      JOIN scraping_sources ss ON sd.source_id = ss.id
      JOIN users u ON sd.created_by = u.id
      WHERE sd.id = ?
    `).bind(id).first()

    if (!result) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: "Scraped data not found"
      }
    }

    // Parse JSON data
    const parsedData = {
      ...result,
      data: JSON.parse(result.data as string)
    }

    return {
      success: true,
      data: parsedData
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: "Error fetching scraped data",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

