import puppeteer from '@cloudflare/puppeteer'

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const browserBinding = env?.MYBROWSER

  if (!browserBinding) {
    return { 
      error: "Browser binding no disponible",
      message: "Asegúrate de que MYBROWSER esté configurado en wrangler.toml"
    }
  }

  try {
    const browser = await puppeteer.launch(browserBinding)
    const page = await browser.newPage()
    
    await page.goto("https://yecksin.com", { waitUntil: "networkidle0" })
    
    const html = await page.content()
    await browser.close()

    return html
  } catch (error) {
    return {
      error: "Error al ejecutar puppeteer",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

