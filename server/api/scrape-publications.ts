import puppeteer from '@cloudflare/puppeteer'

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env
  const db = env?.DB
  const browserBinding = env?.MYBROWSER

  // Check authentication
  if (!db) {
    return {
      success: false,
      error: "Database not available"
    }
  }

  const sessionId = getCookie(event, 'session_id')
  
  if (!sessionId) {
    setResponseStatus(event, 401)
    return {
      success: false,
      error: "Authentication required"
    }
  }

  // Verify session
  const { results } = await db.prepare(`
    SELECT u.id, u.email, u.name, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).bind(sessionId).all()

  if (results.length === 0) {
    setResponseStatus(event, 401)
    return {
      success: false,
      error: "Invalid session"
    }
  }

  const session = results[0]
  const expiresAt = new Date(session.expires_at)

  if (expiresAt < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
    setResponseStatus(event, 401)
    return {
      success: false,
      error: "Session expired"
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
    const query = getQuery(event)
    const targetUrl = query.url as string || "https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en"

    const browser = await puppeteer.launch(browserBinding)
    const page = await browser.newPage()
    
    // Navigate to the specified URL
    await page.goto(targetUrl, { 
      waitUntil: "networkidle0",
      timeout: 30000
    })
    
    // Wait for results to load
    await page.waitForSelector('#search-results-holder', { timeout: 10000 })
    
    // Extract publication data
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
        // Extract image
        const imageElement = item.querySelector('.d-list-visual img')
        const image = imageElement?.getAttribute('src') || ''
        
        // Extract title and URL
        const titleElement = item.querySelector('.title-link a')
        const title = titleElement?.textContent?.trim() || ''
        const url = titleElement?.getAttribute('href') || ''
        
        // Extract date
        const dateElement = item.querySelector('.date')
        const date = dateElement?.textContent?.trim() || ''
        
        // Extract description
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
      error: "Error while scraping",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

