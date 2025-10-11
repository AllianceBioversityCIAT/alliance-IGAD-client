export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const kv = env?.MY_KV as KVNamespace | undefined

  if (!kv) {
    return { error: "KV no disponible" }
  }

  // Leer el valor de la clave "data"
  const value = await kv.get("data")

  return {
    hello: "Hello from SSR server api by IGAD",
    kv_data: value
  }
})