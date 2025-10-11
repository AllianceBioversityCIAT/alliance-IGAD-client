export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Base de datos no disponible" }
  }

  try {
    const query = getQuery(event)
    const id = query.id

    if (!id) {
      return {
        success: false,
        error: "El parámetro 'id' es requerido"
      }
    }

    await db.prepare(
      "DELETE FROM prompts WHERE id = ?"
    ).bind(id).run()

    return {
      success: true,
      message: "Prompt eliminado exitosamente"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

