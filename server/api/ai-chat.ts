export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message, history } = body

  if (!message) {
    return {
      success: false,
      error: "Message is required"
    }
  }

  try {
    // Build the conversation context
    const messages = [
      {
        role: "system",
        content: "Eres un asistente de IA especializado en agricultura, desarrollo rural y políticas agrícolas para la región de IGAD (Intergovernmental Authority on Development) en África Oriental. Proporciona respuestas informativas, precisas y útiles."
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

    // Call the AI API (using the existing /api/ai endpoint)
    const aiResponse = await $fetch('/api/ai', {
      method: 'POST',
      body: {
        messages,
        temperature: 0.7,
        max_tokens: 1000
      }
    })

    return {
      success: true,
      response: aiResponse.response || aiResponse.message || "Lo siento, no pude generar una respuesta.",
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error("AI Chat error:", error)
    return {
      success: false,
      error: error.message || "Error al comunicarse con la IA"
    }
  }
})

