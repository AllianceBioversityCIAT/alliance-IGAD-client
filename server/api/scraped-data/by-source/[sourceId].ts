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
    const sourceId = event.context.params?.sourceId

    if (!sourceId) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: "Source ID parameter is required"
      }
    }

    // Verify source exists
    const source = await db.prepare(`
      SELECT id, name, url, description FROM scraping_sources WHERE id = ?
    `).bind(sourceId).first()

    if (!source) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: "Scraping source not found"
      }
    }

    // Get all scraped data for this source
    const scrapedDataResults = await db.prepare(`
      SELECT 
        sd.id,
        sd.description,
        sd.data,
        sd.created_at,
        sd.updated_at,
        u.name as created_by_name,
        u.email as created_by_email
      FROM scraped_data sd
      JOIN users u ON sd.created_by = u.id
      WHERE sd.source_id = ?
      ORDER BY sd.created_at DESC
    `).bind(sourceId).all()

    // Parse JSON data for each result
    const parsedResults = scrapedDataResults.results.map((item: any) => ({
      ...item,
      data: JSON.parse(item.data)
    }))

    return {
      success: true,
      source,
      count: parsedResults.length,
      data: parsedResults
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: "Error fetching scraped data by source",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

