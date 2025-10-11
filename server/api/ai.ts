export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const ai = env?.AI

  if (!ai) {
    return { 
      error: "AI binding no disponible",
      message: "Asegúrate de que AI esté configurado en wrangler.toml"
    }
  }

  try {
    const messages = [
      { role: "system", content: "You are a friendly assistant" },
      { role: "user", content: "Hello, how are you?" }
    ]

    const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", { 
      messages 
    })

    return response
  } catch (error) {
    return {
      error: "Error al ejecutar Workers AI",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

