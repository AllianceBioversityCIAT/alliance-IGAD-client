import puppeteer from '@cloudflare/puppeteer'

// ============================================
// CONFIGURATION - Adjust these variables
// ============================================
const MAX_PAGES_TO_SCRAPE = 2              // Number of pages to navigate
const MAX_AI_RETRIES = 3                   // Maximum AI consultation attempts

interface Publication {
  title: string
  url?: string
  description?: string
  date?: string
  image?: string
  [key: string]: any
}

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env
  const browserBinding = env?.MYBROWSER
  const ai = env?.AI

  if (!browserBinding) {
    return { success: false, error: "Browser binding not available" }
  }

  if (!ai) {
    return { success: false, error: "AI binding not available" }
  }

  try {
    const query = getQuery(event)
    const targetUrl = query.url as string

    if (!targetUrl) {
      return { success: false, error: "URL parameter is required" }
    }

    console.log('🚀 Iniciando scraping de publicaciones...')
    console.log('📍 URL:', targetUrl)
    console.log('📄 Páginas a revisar:', MAX_PAGES_TO_SCRAPE)

    const browser = await puppeteer.launch(browserBinding)
    const page = await browser.newPage()

    // Navigate to first page
    console.log('🌐 Navegando a la primera página...')
    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    })
    await new Promise(resolve => setTimeout(resolve, 3000))

    const allPublications: Publication[] = []
    let currentPageNumber = 1
    let aiRetryCount = 0

    // Process pages
    while (currentPageNumber <= MAX_PAGES_TO_SCRAPE) {
      console.log(`\n📄 Procesando página ${currentPageNumber}/${MAX_PAGES_TO_SCRAPE}...`)

      // Get current page HTML
      const currentHTML = await page.content()
      const currentUrl = page.url()

      console.log(`🔍 Extrayendo publicaciones con regex pattern...`)

      // Extract publications using simple regex patterns (faster than AI)
      try {
        // Find all publication blocks
        const publicationBlocks = currentHTML.match(/<div class="d-list d-list-publication">[\s\S]*?<\/div>\s*<\/div>/g) || []

        console.log(`📦 Encontrados ${publicationBlocks.length} bloques de publicaciones`)

        for (const block of publicationBlocks) {
          // Extract title
          const titleMatch = block.match(/<h5[^>]*class="title-link"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/i) ||
                           block.match(/<a[^>]*class="[^"]*aaa[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/i)

          // Extract date
          const dateMatch = block.match(/<h6[^>]*class="date"[^>]*>([^<]+)<\/h6>/i)

          // Extract description
          const descMatch = block.match(/<p>\s*([\s\S]*?)\s*<\/p>/i)

          // Extract image
          const imageMatch = block.match(/<img[^>]*src="([^"]+)"/i)

          if (titleMatch) {
            const publication: Publication = {
              title: titleMatch[2].trim(),
              url: titleMatch[1].startsWith('http') ? titleMatch[1] : `https://www.fao.org${titleMatch[1]}`,
              description: descMatch ? descMatch[1].trim().substring(0, 500) : null,
              date: dateMatch ? dateMatch[1].trim() : null,
              image: imageMatch ? imageMatch[1] : null
            }

            allPublications.push(publication)
          }
        }

        console.log(`✅ Extraídas ${publicationBlocks.length} publicaciones de página ${currentPageNumber}`)
      } catch (extractError) {
        console.log(`❌ Error extrayendo publicaciones:`, extractError)
      }

      // If we've processed all pages, stop
      if (currentPageNumber >= MAX_PAGES_TO_SCRAPE) {
        console.log('✅ Todas las páginas procesadas')
        break
      }

      // Navigate to next page
      console.log(`\n🔄 Navegando a página ${currentPageNumber + 1}...`)

      const previousUrl = page.url()
      let navigated = false

      // Try common pagination patterns first (faster, no AI needed)
      console.log(`   🔍 Buscando paginación con patrones comunes...`)

      const commonSelectors = [
        `a.page-link[href*="/${currentPageNumber + 1}/"]`,
        `a[href*="/publications/${currentPageNumber + 1}/"]`,
        `.pagination a[href*="/${currentPageNumber + 1}/"]`,
        `li.page-item a[href*="${currentPageNumber + 1}"]`
      ]

      for (const selector of commonSelectors) {
        try {
          console.log(`   Probando: ${selector}`)
          const nextButton = await page.$(selector)

          if (nextButton) {
            console.log(`   ✅ Encontrado! Haciendo click...`)

            await Promise.race([
              nextButton.click().then(() => page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {})),
              new Promise(resolve => setTimeout(resolve, 5000))
            ])

            await new Promise(resolve => setTimeout(resolve, 2000))

            // Verify navigation by checking URL change
            const newUrl = page.url()

            console.log(`   🔍 Verificando navegación...`)
            console.log(`   📍 URL anterior: ${previousUrl}`)
            console.log(`   📍 URL nueva: ${newUrl}`)

            // Simple URL comparison
            if (newUrl !== previousUrl && newUrl.includes(`${currentPageNumber + 1}`)) {
              navigated = true
              currentPageNumber++
              console.log(`   ✅ Navegación exitosa a página ${currentPageNumber}`)
              break
            } else {
              console.log(`   ⚠️ La URL no cambió correctamente`)
            }
          }
        } catch (error) {
          continue
        }
      }

      // If navigation failed and we have AI retries left, ask AI for help
      if (!navigated && aiRetryCount < MAX_AI_RETRIES) {
        aiRetryCount++
        console.log(`   🤖 Estrategia IA (intento ${aiRetryCount}/${MAX_AI_RETRIES})...`)

        try {
          const aiSuggestionPrompt = `I need to navigate to page ${currentPageNumber + 1} on this website.

Current URL: ${previousUrl}
Current page number indicator: ${currentPageNumber}

HTML (pagination area, first 10000 chars):
${currentHTML.substring(0, 10000)}

Analyze the pagination and suggest a CSS selector to click on page ${currentPageNumber + 1}.

Return ONLY a JSON object (no markdown):
{
  "selector": "CSS selector to find page ${currentPageNumber + 1} link",
  "strategy": "brief explanation",
  "confidence": "high/medium/low"
}

Look for:
- Links with text "${currentPageNumber + 1}"
- Next page buttons
- Pagination numbers
- URLs with /${currentPageNumber + 1}/`

          const aiSuggestionResponse = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
              {
                role: "system",
                content: "You are an expert at analyzing pagination. Return ONLY valid JSON."
              },
              {
                role: "user",
                content: aiSuggestionPrompt
              }
            ],
            temperature: 0.2,
            max_tokens: 300
          })

          const suggestionText = aiSuggestionResponse.response || JSON.stringify(aiSuggestionResponse)
          const suggestionMatch = suggestionText.match(/\{[\s\S]*\}/)

          if (suggestionMatch) {
            const suggestion = JSON.parse(suggestionMatch[0])
            console.log(`   💡 IA sugiere: ${suggestion.selector}`)
            console.log(`   📝 Estrategia: ${suggestion.strategy}`)

            const aiButton = await page.$(suggestion.selector)
            if (aiButton) {
              await Promise.race([
                aiButton.click().then(() => page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {})),
                new Promise(resolve => setTimeout(resolve, 5000))
              ])

              await new Promise(resolve => setTimeout(resolve, 2000))

              // Verify with AI again
              const newUrl = page.url()
              if (newUrl !== previousUrl) {
                navigated = true
                currentPageNumber++
                console.log(`   ✅ Navegación exitosa con IA a página ${currentPageNumber}`)
              }
            }
          }
        } catch (aiError) {
          console.log(`   ❌ IA no pudo ayudar:`, aiError)
        }
      }

      if (!navigated) {
        console.log(`❌ No se pudo navegar a página ${currentPageNumber + 1}`)
        console.log(`⚠️ Finalizando scraping con ${allPublications.length} publicaciones`)
        break
      }
    }

    await browser.close()
    console.log('🔒 Navegador cerrado')

    console.log(`\n🎉 Scraping completado`)
    console.log(`📊 Total publicaciones extraídas: ${allPublications.length}`)
    console.log(`📄 Páginas procesadas: ${currentPageNumber}`)

    return {
      success: true,
      totalPublications: allPublications.length,
      pagesProcessed: currentPageNumber,
      publications: allPublications,
      config: {
        maxPagesToScrape: MAX_PAGES_TO_SCRAPE,
        maxAIRetries: MAX_AI_RETRIES,
        aiRetriesUsed: aiRetryCount
      }
    }

  } catch (error) {
    console.error('💥 ERROR:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
