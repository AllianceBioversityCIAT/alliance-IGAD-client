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
    const sources = await db.prepare(`
      SELECT 
        id,
        name,
        url,
        description,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM scraped_data WHERE source_id = scraping_sources.id) as data_count
      FROM scraping_sources
      ORDER BY created_at DESC
    `).all()

    return {
      success: true,
      sources: sources.results
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: "Error fetching scraping sources",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

