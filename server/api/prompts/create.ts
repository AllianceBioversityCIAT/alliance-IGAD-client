export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    // Get session
    const sessionId = getCookie(event, 'session_id')
    if (!sessionId) {
      return { success: false, error: "Not authenticated" }
    }

    // Get user from session
    const { results: sessionResults } = await db.prepare(
      "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
    ).bind(sessionId).all()

    if (sessionResults.length === 0) {
      return { success: false, error: "Session expired" }
    }

    const userId = sessionResults[0].user_id

    // Get data from body
    const body = await readBody(event)
    const { type, title, prompt } = body

    if (!type || !title || !prompt) {
      return {
        success: false,
        error: "Fields 'type', 'title' and 'prompt' are required"
      }
    }

    if (type !== 'proposal_writer' && type !== 'newsletter_generator') {
      return {
        success: false,
        error: "Invalid type. Must be 'proposal_writer' or 'newsletter_generator'"
      }
    }

    // Insert new prompt
    const result = await db.prepare(
      `INSERT INTO prompts (type, title, prompt, created_by, updated_by) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(type, title, prompt, userId, userId).run()

    // Get the newly created record with user info
    const { results } = await db.prepare(`
      SELECT p.*, 
        u1.name as created_by_name, 
        u2.name as updated_by_name
      FROM prompts p
      JOIN users u1 ON p.created_by = u1.id
      JOIN users u2 ON p.updated_by = u2.id
      WHERE p.id = ?
    `).bind(result.meta.last_row_id).all()

    return {
      success: true,
      prompt: results[0],
      message: "Prompt saved successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

