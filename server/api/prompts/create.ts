export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { success: false, error: "Base de datos no disponible" }
  }

  try {
    // Obtener datos del body
    const body = await readBody(event)
    const { prompt, response, model, tokens } = body

    if (!prompt) {
      return {
        success: false,
        error: "El campo 'prompt' es requerido"
      }
    }

    // Insertar el nuevo prompt
    const result = await db.prepare(
      `INSERT INTO prompts (prompt, response, model, tokens) 
       VALUES (?, ?, ?, ?)`
    ).bind(
      prompt,
      response || null,
      model || 'default',
      tokens || 0
    ).run()

    // Obtener el registro recién creado
    const { results } = await db.prepare(
      "SELECT * FROM prompts WHERE id = ?"
    ).bind(result.meta.last_row_id).all()

    return {
      success: true,
      prompt: results[0],
      message: "Prompt guardado exitosamente"
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

