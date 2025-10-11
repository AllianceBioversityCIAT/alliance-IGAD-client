export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Base de datos no disponible" }
  }

  try {
    // Obtener todos los prompts ordenados por fecha (más recientes primero)
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

