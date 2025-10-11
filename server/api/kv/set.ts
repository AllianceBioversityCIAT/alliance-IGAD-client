export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare?.env?.MY_KV

  if (!kv) {
    return { success: false, error: "KV no disponible" }
  }

  // Obtener parámetros del query o body
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  
  const key = query.key || body.key
  const value = query.value || body.value

  if (!key || value === undefined) {
    return { 
      success: false, 
      error: "Faltan parámetros: key y value son requeridos",
      example: "/api/kv/set?key=mikey&value=mivalor"
    }
  }

  // Guardar en KV
  await kv.put(String(key), String(value))

  return {
    success: true,
    message: "Dato guardado en KV",
    key: key,
    value: value
  }
})

