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
    const query = getQuery(event)
    const id = query.id

    if (!id) {
      return {
        success: false,
        error: "The 'id' parameter is required"
      }
    }

    // Get the prompt to know its type
    const { results: promptResults } = await db.prepare(
      "SELECT type FROM prompts WHERE id = ?"
    ).bind(id).all()

    if (promptResults.length === 0) {
      return {
        success: false,
        error: "Prompt not found"
      }
    }

    const promptType = promptResults[0].type

    // Deactivate all prompts of the same type
    await db.prepare(
      "UPDATE prompts SET is_active = 0 WHERE type = ?"
    ).bind(promptType).run()

    // Activate the selected prompt
    await db.prepare(
      "UPDATE prompts SET is_active = 1, updated_by = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(userId, id).run()

    return {
      success: true,
      message: "Prompt activated successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

