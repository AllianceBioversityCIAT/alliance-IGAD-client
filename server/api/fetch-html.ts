import puppeteer from '@cloudflare/puppeteer'

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env
  const browserBinding = env?.MYBROWSER

  // Obtener la URL del query parameter
  const query = getQuery(event)
  const url = query.url as string

  // Validar que se proporcionó una URL
  if (!url) {
    return {
      success: false,
      error: "URL parameter is required",
      message: "Please provide a URL using the ?url=... query parameter"
    }
  }

  // Validar formato de URL
  try {
    new URL(url)
  } catch (error) {
    return {
      success: false,
      error: "Invalid URL format",
      message: "The provided URL is not valid"
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
    const page = await browser.newPage()

    // Configurar timeout y navegar a la URL proporcionada
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

    await browser.close()

    return {
      success: true,
      url,
      body: bodyHtml
    }
  } catch (error) {
    return {
      success: false,
      error: "Error fetching HTML",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})
