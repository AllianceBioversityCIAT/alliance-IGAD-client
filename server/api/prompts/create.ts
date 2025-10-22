export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
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
      `INSERT INTO prompts (type, title, prompt)
       VALUES (?, ?, ?)`
    ).bind(type, title, prompt).run()

    // Get the newly created record
    const { results } = await db.prepare(`
      SELECT * FROM prompts WHERE id = ?
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

