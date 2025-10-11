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
    const { id, title, prompt } = body

    if (!id || !title || !prompt) {
      return {
        success: false,
        error: "Fields 'id', 'title' and 'prompt' are required"
      }
    }

    // Update prompt
    await db.prepare(
      `UPDATE prompts 
       SET title = ?, prompt = ?, updated_by = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(title, prompt, userId, id).run()

    // Get the updated record with user info
    const { results } = await db.prepare(`
      SELECT p.*,
        u1.name as created_by_name,
        u1.email as created_by_email,
        u2.name as updated_by_name,
        u2.email as updated_by_email
      FROM prompts p
      JOIN users u1 ON p.created_by = u1.id
      JOIN users u2 ON p.updated_by = u2.id
      WHERE p.id = ?
    `).bind(id).all()

    return {
      success: true,
      prompt: results[0],
      message: "Prompt updated successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

