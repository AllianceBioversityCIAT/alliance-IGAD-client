export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const kv = env?.MY_KV
  const access_key = env?.access_key

  if (!kv) {
    return { 
      hello: "Hello from SSR server api by IGAD",
      error: "KV no disponible" ,
      kv: kv,
      access_key: access_key
    }
  }

  // Leer el valor de la clave "data"
  const value = await kv.get("data")

  return {
    hello: "Hello from SSR server api by IGAD",
    kv_data: value || null,
    kv: kv,
    access_key: access_key
  }
})