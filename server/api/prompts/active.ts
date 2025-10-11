export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    // Get type from query
    const query = getQuery(event)
    let type = query.type as string

    if (!type) {
      return {
        success: false,
        error: "Type parameter is required (e.g., 'proposal-writer' or 'newsletter-generator')"
      }
    }

    // Normalize type: convert hyphens to underscores for database compatibility
    type = type.replace(/-/g, '_')

    // Validate type
    const validTypes = ['proposal_writer', 'newsletter_generator']
    if (!validTypes.includes(type)) {
      return {
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      }
    }

    // Get the active prompt for this type
    const { results } = await db.prepare(`
      SELECT p.*,
        u1.name as created_by_name,
        u1.email as created_by_email,
        u2.name as updated_by_name,
        u2.email as updated_by_email
      FROM prompts p
      JOIN users u1 ON p.created_by = u1.id
      JOIN users u2 ON p.updated_by = u2.id
      WHERE p.type = ? AND p.is_active = 1
      LIMIT 1
    `).bind(type).all()

    if (results.length === 0) {
      return {
        success: false,
        error: `No active prompt found for type: ${type}`,
        message: "Make sure you have activated a prompt for this type in the Manage Prompts page"
      }
    }

    return {
      success: true,
      prompt: results[0]
    }
  } catch (error: any) {
    console.error('Error fetching active prompt:', error)
    return {
      success: false,
      error: error.message || 'Error fetching active prompt'
    }
  }
})