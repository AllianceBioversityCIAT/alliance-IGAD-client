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
    const { message, publications, history } = body

    if (!message) {
      return {
        success: false,
        error: "El mensaje es requerido"
      }
    }

    if (!publications || publications.length === 0) {
      return {
        success: false,
        error: "No hay publicaciones disponibles"
      }
    }

    // Build context from publications
    const publicationsContext = publications.map((pub: any, index: number) => 
      `Publicación ${index + 1}:\nTítulo: ${pub.title}\nFecha: ${pub.date || 'No especificada'}\nDescripción: ${pub.description}\nURL: ${pub.url}\n`
    ).join('\n')

    // Build the conversation context
    const messages = [
      {
        role: "system",
        content: `Eres un asistente especializado en analizar publicaciones académicas y de investigación sobre agricultura, pastoreo y desarrollo rural en África. 

Tienes acceso a las siguientes publicaciones:

${publicationsContext}

Responde las preguntas del usuario basándote ÚNICAMENTE en la información de estas publicaciones. Si la información no está disponible en las publicaciones proporcionadas, indícalo claramente. Responde siempre en español.`
      }
    ]

    // Add conversation history
    if (history && Array.isArray(history)) {
      messages.push(...history)
    }

    // Add the current message
    messages.push({
      role: "user",
      content: message
    })

    // Call the AI
    const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", { 
      messages,
      temperature: 0.7,
      max_tokens: 1500
    })

    return {
      success: true,
      response: response.response || "Lo siento, no pude generar una respuesta.",
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error("AI Publications Chat error:", error)
    return {
      success: false,
      error: error.message || "Error al comunicarse con la IA"
    }
  }
})

