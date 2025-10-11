export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare?.env?.MY_KV

  if (!kv) {
    return { success: false, error: "KV no disponible" }
  }

  // Listar todas las keys
  const list = await kv.list()
  
  // Leer los valores de cada key
  const items: Array<{ key: string, value: string | null }> = []
  for (const key of list.keys) {
    const value = await kv.get(key.name)
    items.push({ key: key.name, value })
  }

  return {
    success: true,
    total: list.keys.length,
    items
  }
})

