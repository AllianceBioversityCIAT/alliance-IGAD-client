export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    const query = getQuery(event)
    const id = query.id

    if (!id) {
      return {
        success: false,
        error: "The 'id' parameter is required"
      }
    }

    await db.prepare(
      "DELETE FROM prompts WHERE id = ?"
    ).bind(id).run()

    return {
      success: true,
      message: "Prompt deleted successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

