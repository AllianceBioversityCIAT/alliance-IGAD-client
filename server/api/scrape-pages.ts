import puppeteer from '@cloudflare/puppeteer'

// ============================================
// CONFIGURATION - Adjust these variables
// ============================================
const MAX_PAGES_TO_SCRAPE = 2              // Number of pages to navigate
const PUBLICATIONS_PER_PAGE = 2            // Publications to extract per page
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
    console.log('📊 Publicaciones por página:', PUBLICATIONS_PER_PAGE)

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

      console.log(`🔍 Extrayendo ${PUBLICATIONS_PER_PAGE} publicaciones...`)

      // Extract publications from current page using AI
      const extractionPrompt = `Extract exactly ${PUBLICATIONS_PER_PAGE} publications from this HTML.

HTML Content (first 15000 chars):
${currentHTML.substring(0, 15000)}

Return ONLY a JSON array with exactly ${PUBLICATIONS_PER_PAGE} publications (no markdown, no explanations):
[
  {
    "title": "publication title",
    "url": "publication URL if exists",
    "description": "description/summary if exists",
    "date": "publication date if exists",
    "image": "image URL if exists"
  }
]

IMPORTANT RULES:
- Extract ONLY ${PUBLICATIONS_PER_PAGE} publications (the first ${PUBLICATIONS_PER_PAGE} you find)
- Return ONLY valid JSON array
- DO NOT include any markdown or explanations
- If a field doesn't exist, omit it or set to null
- Look for patterns like: titles, links, descriptions in list items or article elements`

      const extractionResponse = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting structured data from HTML. You return ONLY valid JSON arrays, never markdown or explanations."
          },
          {
            role: "user",
            content: extractionPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })

      // Parse extracted publications
      try {
        const responseText = extractionResponse.response || JSON.stringify(extractionResponse)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/)

        if (jsonMatch) {
          const publications = JSON.parse(jsonMatch[0])
          allPublications.push(...publications)
          console.log(`✅ Extraídas ${publications.length} publicaciones de página ${currentPageNumber}`)
        } else {
          console.log(`⚠️ No se pudieron extraer publicaciones de página ${currentPageNumber}`)
        }
      } catch (parseError) {
        console.log(`❌ Error parseando publicaciones de página ${currentPageNumber}:`, parseError)
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

      // Try common pagination selectors
      const paginationSelectors = [
        `a[aria-label="Next"]`,
        `a.page-link:has-text("${currentPageNumber + 1}")`,
        `.pagination a:has-text("${currentPageNumber + 1}")`,
        `a[href*="/${currentPageNumber + 1}/"]`,
        `.page-item a:has-text("${currentPageNumber + 1}")`,
        `li.page-item:nth-child(${currentPageNumber + 1}) a`
      ]

      for (const selector of paginationSelectors) {
        try {
          console.log(`   Probando selector: ${selector}`)
          const nextButton = await page.$(selector)

          if (nextButton) {
            await Promise.race([
              nextButton.click().then(() => page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {})),
              new Promise(resolve => setTimeout(resolve, 5000))
            ])

            await new Promise(resolve => setTimeout(resolve, 2000))

            // Verify navigation using AI
            const newUrl = page.url()
            const newHTML = await page.content()

            console.log(`   🤖 Verificando si cambió de página...`)

            const verificationPrompt = `Compare these two HTML snippets and determine if they represent DIFFERENT pages.

Previous URL: ${previousUrl}
New URL: ${newUrl}

Previous HTML (first 8000 chars):
${currentHTML.substring(0, 8000)}

New HTML (first 8000 chars):
${newHTML.substring(0, 8000)}

Return ONLY a JSON object (no markdown):
{
  "isDifferentPage": true/false,
  "reason": "brief explanation why they are different or same"
}

Look for:
- Different URLs
- Different publication titles
- Different pagination states
- Different content`

            const verificationResponse = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
              messages: [
                {
                  role: "system",
                  content: "You are an expert at comparing web pages. Return ONLY valid JSON."
                },
                {
                  role: "user",
                  content: verificationPrompt
                }
              ],
              temperature: 0.1,
              max_tokens: 200
            })

            const verifyText = verificationResponse.response || JSON.stringify(verificationResponse)
            const verifyMatch = verifyText.match(/\{[\s\S]*\}/)

            if (verifyMatch) {
              const verification = JSON.parse(verifyMatch[0])
              console.log(`   📊 IA dice: ${verification.reason}`)

              if (verification.isDifferentPage) {
                navigated = true
                currentPageNumber++
                console.log(`   ✅ Navegación exitosa a página ${currentPageNumber}`)
                break
              } else {
                console.log(`   ⚠️ La página no cambió, probando siguiente selector...`)
              }
            }
          }
        } catch (error) {
          console.log(`   ❌ Falló selector: ${selector}`)
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
        publicationsPerPage: PUBLICATIONS_PER_PAGE,
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
