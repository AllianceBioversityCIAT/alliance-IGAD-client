export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
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
       SET title = ?, prompt = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(title, prompt, id).run()

    // Get the updated record
    const { results } = await db.prepare(`
      SELECT * FROM prompts WHERE id = ?
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

