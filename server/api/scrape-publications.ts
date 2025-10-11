import puppeteer from '@cloudflare/puppeteer'

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env 
  const browserBinding = env?.MYBROWSER

  if (!browserBinding) {
    return { 
      success: false,
      error: "Browser binding no disponible",
      message: "Asegúrate de que MYBROWSER esté configurado en wrangler.toml"
    }
  }

  try {
    const query = getQuery(event)
    const targetUrl = query.url as string || "https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en"

    const browser = await puppeteer.launch(browserBinding)
    const page = await browser.newPage()
    
    // Navegar a la URL especificada
    await page.goto(targetUrl, { 
      waitUntil: "networkidle0",
      timeout: 30000
    })
    
    // Esperar a que se carguen los resultados
    await page.waitForSelector('#search-results-holder', { timeout: 10000 })
    
    // Extraer datos de las publicaciones
    const publications = await page.evaluate(() => {
      const items = document.querySelectorAll('#search-results-holder .d-list.d-list-publication')
      const results: Array<{
        title: string
        url: string
        date: string
        description: string
        image: string
      }> = []
      
      items.forEach((item) => {
        // Extraer imagen
        const imageElement = item.querySelector('.d-list-visual img')
        const image = imageElement?.getAttribute('src') || ''
        
        // Extraer título y URL
        const titleElement = item.querySelector('.title-link a')
        const title = titleElement?.textContent?.trim() || ''
        const url = titleElement?.getAttribute('href') || ''
        
        // Extraer fecha
        const dateElement = item.querySelector('.date')
        const date = dateElement?.textContent?.trim() || ''
        
        // Extraer descripción
        const descElement = item.querySelector('.d-list-content > p')
        const description = descElement?.textContent?.trim() || ''
        
        if (title) {
          results.push({ title, url, date, description, image })
        }
      })
      
      return results
    })
    
    await browser.close()

    return {
      success: true,
      count: publications.length,
      url: targetUrl,
      publications
    }
  } catch (error) {
    return {
      success: false,
      error: "Error durante el scraping",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

