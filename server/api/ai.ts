export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const ai = env?.AI

  if (!ai) {
    return { 
      error: "AI binding not available",
      message: "Make sure AI is configured in wrangler.toml"
    }
  }

  try {
    const body = await readBody(event)
    const { messages, temperature, max_tokens } = body

    // Default messages if none provided
    const messagesToUse = messages || [
      { role: "system", content: "You are a friendly assistant" },
      { role: "user", content: "Hello, how are you?" }
    ]

    const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", { 
      messages: messagesToUse,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000
    })

    return response
  } catch (error) {
    return {
      error: "Error executing Workers AI",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

