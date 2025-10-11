export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare?.env?.MY_KV

  if (!kv) {
    return { success: false, error: "KV no disponible" }
  }

  // Obtener el parámetro key del query
  const query = getQuery(event)
  const key = query.key

  if (!key) {
    return { 
      success: false, 
      error: "Falta parámetro: key es requerido",
      example: "/api/kv/get?key=mikey"
    }
  }

  // Leer del KV
  const value = await kv.get(String(key))

  if (value === null) {
    return {
      success: false,
      message: "Key no encontrada",
      key: key
    }
  }

  return {
    success: true,
    key: key,
    value: value
  }
})

