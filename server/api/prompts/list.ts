export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Database not available" }
  }

  try {
    // Get all prompts ordered by date (most recent first)
    const { results } = await db.prepare(
      "SELECT * FROM prompts ORDER BY created_at DESC LIMIT 100"
    ).all()

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

