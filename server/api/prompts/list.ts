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

    // Get all prompts for this type with user info
    // Active prompts first, then by date
    const { results } = await db.prepare(`
      SELECT p.*,
        u1.name as created_by_name,
        u1.email as created_by_email,
        u2.name as updated_by_name,
        u2.email as updated_by_email
      FROM prompts p
      JOIN users u1 ON p.created_by = u1.id
      JOIN users u2 ON p.updated_by = u2.id
      WHERE p.type = ?
      ORDER BY p.is_active DESC, p.created_at DESC
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

