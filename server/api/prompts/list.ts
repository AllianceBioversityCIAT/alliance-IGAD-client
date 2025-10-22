export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    // Get type from query
    const query = getQuery(event)
    const type = query.type as string

    if (!type) {
      return {
        success: false,
        error: "Type parameter is required"
      }
    }

    // Get all prompts for this type
    // Active prompts first, then by date
    const { results } = await db.prepare(`
      SELECT * FROM prompts
      WHERE type = ?
      ORDER BY is_active DESC, created_at DESC
      LIMIT 100
    `).bind(type).all()

    return {
      success: true,
      prompts: results,
      total: results.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

