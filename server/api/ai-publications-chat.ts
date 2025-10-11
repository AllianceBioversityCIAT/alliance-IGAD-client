export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const ai = env?.AI

  if (!ai) {
    return { 
      success: false,
      error: "AI binding not available",
      message: "Make sure AI is configured in wrangler.toml"
    }
  }

  try {
    const body = await readBody(event)
    const { message, publications, history } = body

    if (!message) {
      return {
        success: false,
        error: "Message is required"
      }
    }

    if (!publications || publications.length === 0) {
      return {
        success: false,
        error: "No publications available"
      }
    }

    // Build context from publications
    const publicationsContext = publications.map((pub: any, index: number) => 
      `Publication ${index + 1}:\nTitle: ${pub.title}\nDate: ${pub.date || 'Not specified'}\nDescription: ${pub.description}\nURL: ${pub.url}\n`
    ).join('\n')

    // Build the conversation context
    const messages = [
      {
        role: "system",
        content: `You are an assistant specialized in analyzing academic and research publications on agriculture, pastoralism, and rural development in Africa. 

You have access to the following publications:

${publicationsContext}

Answer user questions based ONLY on the information from these publications. If information is not available in the provided publications, clearly indicate so.`
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
      response: response.response || "Sorry, I couldn't generate a response.",
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error("AI Publications Chat error:", error)
    return {
      success: false,
      error: error.message || "Error communicating with AI"
    }
  }
})

