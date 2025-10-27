import puppeteer from '@cloudflare/puppeteer'

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env
  const browserBinding = env?.MYBROWSER

  // Obtener el body de la petición
  const body = await readBody(event)
  const urls = body?.urls

  // Validar que se proporcionó un array de URLs
  if (!urls || !Array.isArray(urls)) {
    return {
      success: false,
      error: "URLs array is required",
      message: "Please provide an array of URLs in the request body: { urls: ['url1', 'url2', ...] }"
    }
  }

  // Validar que el array no esté vacío
  if (urls.length === 0) {
    return {
      success: false,
      error: "Empty URLs array",
      message: "The URLs array must contain at least one URL"
    }
  }

  // Validar formato de todas las URLs
  for (const url of urls) {
    try {
      new URL(url)
    } catch (error) {
      return {
        success: false,
        error: "Invalid URL format",
        message: `The URL "${url}" is not valid`
      }
    }
  }

  if (!browserBinding) {
    return {
      success: false,
      error: "Browser binding not available",
      message: "Make sure MYBROWSER is configured in wrangler.toml"
    }
  }

  try {
    const browser = await puppeteer.launch(browserBinding)
    const results = []

    // Procesar cada URL
    for (const url of urls) {
      try {
        const page = await browser.newPage()

        // Configurar timeout y navegar a la URL
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 30000 // 30 segundos de timeout
        })

        // Esperar un poco más para asegurar que JavaScript haya terminado de renderizar
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Extraer solo el contenido del body
        const bodyHtml = await page.evaluate(() => {
          return document.body ? document.body.innerHTML : ''
        })

        await page.close()

        results.push({
          url,
          content: bodyHtml,
          success: true
        })
      } catch (error) {
        results.push({
          url,
          content: null,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    await browser.close()

    return {
      success: true,
      count: results.length,
      results
    }
  } catch (error) {
    return {
      success: false,
      error: "Error fetching HTML",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})
