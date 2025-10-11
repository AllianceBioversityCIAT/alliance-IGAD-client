export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const ai = env?.AI

  if (!ai) {
    return { 
      success: false,
      error: "AI binding no disponible",
      message: "Asegúrate de que AI esté configurado en wrangler.toml"
    }
  }

  try {
    const body = await readBody(event)
    const { messages, temperature, max_tokens } = body

    // Mensajes por defecto si no se proporcionan
    const messagesToUse = messages || [
      { role: "system", content: "Eres un asistente amigable" },
      { role: "user", content: "Hola, ¿cómo estás?" }
    ]

    const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", { 
      messages: messagesToUse,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000
    })

    return response
  } catch (error) {
    return {
      success: false,
      error: "Error al ejecutar Workers AI",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

