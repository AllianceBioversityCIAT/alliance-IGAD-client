export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    // Get data from body
    const body = await readBody(event)
    const { title, prompt } = body

    if (!title || !prompt) {
      return {
        success: false,
        error: "Both 'title' and 'prompt' fields are required"
      }
    }

    // Insert new prompt
    const result = await db.prepare(
      `INSERT INTO prompts (title, prompt) VALUES (?, ?)`
    ).bind(title, prompt).run()

    // Get the newly created record
    const { results } = await db.prepare(
      "SELECT * FROM prompts WHERE id = ?"
    ).bind(result.meta.last_row_id).all()

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

