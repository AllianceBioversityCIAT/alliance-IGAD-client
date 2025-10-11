import puppeteer from '@cloudflare/puppeteer'

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const browserBinding = env?.MYBROWSER

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
    
    await page.goto("https://yecksin.com", { waitUntil: "networkidle0" })
    
    const html = await page.content()
    await browser.close()

    return {
      success: true,
      html
    }
  } catch (error) {
    return {
      success: false,
      error: "Error executing puppeteer",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

