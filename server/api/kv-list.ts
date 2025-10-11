export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const kv = env?.MY_KV

  if (!kv) {
    return { 
      error: "KV no disponible",
      success: false
    }
  }

  // Listar todas las keys
  const list = await kv.list()
  
  // Leer los valores de cada key
  const values: Record<string, any> = {}
  for (const key of list.keys) {
    const value = await kv.get(key.name)
    values[key.name] = value
  }

  return {
    success: true,
    total_keys: list.keys.length,
    keys: list.keys.map(k => k.name),
    values: values
  }
})

