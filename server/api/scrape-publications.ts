import puppeteer from '@cloudflare/puppeteer'

interface ClassifiedPublication {
  title: string
  url: string
  fullContent: string
  contentPreview: string
  relatedUrls: string[]
  // Clasificación automática - la IA extrae y estructura la información que encuentra
  // Cada artículo puede tener diferentes campos (tips, relatedContent, author, etc.)
  aiClassification: {
    title?: string
    description?: string
    author?: string
    publicationDate?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any // Campos dinámicos según lo que exista en el contenido
  }
}

export default defineEventHandler(async (event) => {
  const env = event.context.cloudflare?.env
  const db = env?.DB
  const browserBinding = env?.MYBROWSER
  const ai = env?.AI

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
    
    // Get limit parameter (default 4, max 10)
    const limitParam = query.limit ? parseInt(query.limit as string) : 4
    const limit = Math.min(Math.max(limitParam, 1), 10) // Between 1 and 10

    console.log('🚀 Iniciando web scraping...')
    console.log('📍 URL objetivo:', targetUrl)
    console.log('📊 Límite de artículos:', limit)

    const browser = await puppeteer.launch(browserBinding)
    const page = await browser.newPage()
    
    console.log('🌐 Navegando a la página principal...')
    // Navigate to the specified URL with more lenient wait strategy
    try {
      await page.goto(targetUrl, { 
        waitUntil: "domcontentloaded",
        timeout: 60000
      })
      console.log('✅ Página cargada exitosamente')
    } catch {
      console.log('⚠️ Timeout en navegación, continuando de todas formas...')
    }
    
    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('⏳ Esperando que carguen los resultados...')
    // Wait for results to load
    await page.waitForSelector('#search-results-holder', { timeout: 20000 })
    
    console.log(`📝 Extrayendo enlaces de publicaciones (primeras ${limit})...`)
    // Extract publication URLs with dynamic limit
    const publicationLinks = await page.evaluate((maxItems) => {
      // @ts-expect-error - DOM is available in browser context
      const items = document.querySelectorAll('#search-results-holder .d-list.d-list-publication')
      const results: Array<{
        title: string
        url: string
        date: string
        description: string
        image: string
      }> = []
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.forEach((item: any, index: number) => {
        if (index < maxItems) {
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
          
          if (title && url) {
            results.push({ title, url, date, description, image })
          }
        }
      })
      
      return results
    }, limit)

    console.log(`✅ Se encontraron ${publicationLinks.length} publicaciones`)
    console.log('📚 Publicaciones a procesar:', publicationLinks.map(p => p.title))

    // Process each article with AI classification
    const classifiedPublications: ClassifiedPublication[] = []
    
    for (let i = 0; i < publicationLinks.length; i++) {
      const pub = publicationLinks[i]
      const articleStartTime = Date.now()
      console.log('\n' + '='.repeat(60))
      console.log(`📖 [${i + 1}/${publicationLinks.length}] Procesando: "${pub.title}"`)
      console.log(`🔗 URL: ${pub.url}`)
      try {
        console.log('🌐 Abriendo artículo...')
        // Navigate to individual article with more lenient wait strategy
        try {
          await page.goto(pub.url, { 
            waitUntil: "domcontentloaded",
            timeout: 60000
          })
          console.log('✅ Artículo cargado')
        } catch {
          console.log('⚠️ Timeout en navegación del artículo, continuando...')
        }
        
        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('📄 Extrayendo contenido del artículo...')
        // Extract full content from the article page (excluding images, related sections, etc)
        const articleContent = await page.evaluate(() => {
          // Remove unwanted sections before extracting content
          // @ts-expect-error - DOM document API is available in the browser context and querySelectorAll returns NodeList
          const elementsToRemove = document.querySelectorAll([
            'img',
            'figure',
            'picture',
            'video',
            'iframe',
            'aside',
            'nav',
            'header',
            'footer',
            '.related',
            '.related-content',
            '.sidebar',
            '.advertisement',
            '.ad',
            '.social-share',
            '.comments',
            '[class*="related"]',
            '[class*="sidebar"]',
            '[class*="footer"]',
            '[class*="navigation"]',
            '[id*="related"]',
            '[id*="sidebar"]'
          ].join(','))
          
          // Create a clone to avoid modifying the actual page
          // @ts-expect-error - cloneNode returns a generic Node but we know it's an Element in this context
          const clone = document.body.cloneNode(true)
          
          // Remove unwanted elements from clone
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          elementsToRemove.forEach((el: any) => {
            const cloneEl = clone.querySelector(el.tagName + (el.className ? '.' + Array.from(el.classList).join('.') : ''))
            if (cloneEl) cloneEl.remove()
          })
          
          // Try to find main content area in priority order
          const contentSelectors = [
            'article .article-body',
            'article .content',
            '.article-content',
            '.post-content',
            '.entry-content',
            'article',
            'main article',
            '.main-content',
            '#main-content',
            'main',
            '#content'
          ]
          
          let content = ''
          for (const selector of contentSelectors) {
            // @ts-expect-error - clone is a cloned Node that has querySelector method available for Element types
            const element = clone.querySelector(selector) || document.querySelector(selector)
            if (element) {
              // Extract all paragraph texts
              const paragraphs = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li')
              const texts: string[] = []
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              paragraphs.forEach((p: any) => {
                const text = p.textContent?.trim()
                if (text && text.length > 20) { // Only meaningful paragraphs
                  texts.push(text)
                }
              })
              
              content = texts.join('\n\n')
              
              if (content.length > 500) break // Found substantial content
            }
          }
          
          // Fallback: Get all paragraphs from body
          if (!content || content.length < 500) {
            // @ts-expect-error - document API available in browser context and querySelectorAll returns NodeList
            const allParagraphs = document.querySelectorAll('p, h1, h2, h3')
            const texts: string[] = []
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            allParagraphs.forEach((p: any) => {
              const text = p.textContent?.trim()
              // Filter out navigation, footer, etc
              if (text && 
                  text.length > 30 && 
                  !text.toLowerCase().includes('cookie') &&
                  !text.toLowerCase().includes('related content') &&
                  !text.toLowerCase().includes('share on')) {
                texts.push(text)
              }
            })
            
            content = texts.join('\n\n')
          }
          
          return content
        })

        console.log(`📊 Contenido extraído: ${articleContent.length} caracteres`)
        console.log(`🔍 Preview (primeros 200 chars): ${articleContent.substring(0, 200)}...`)
        console.log(`🔍 Preview (últimos 200 chars): ...${articleContent.substring(Math.max(0, articleContent.length - 200))}`)

        // Extract all URLs from the article content (SIN IA - más rápido)
        console.log('🔗 Extrayendo URLs del artículo (sin IA)...')
        const startUrlExtraction = Date.now()
        const extractedUrls = await page.evaluate(() => {
          // @ts-expect-error - DOM is available in browser context
          const links = Array.from(document.querySelectorAll('a[href]'))
          const urls = links
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((link: any) => link.href)
            .filter((href: string) => 
              href.startsWith('http') && 
              !href.includes('facebook.com') && 
              !href.includes('twitter.com') &&
              !href.includes('linkedin.com') &&
              !href.includes('instagram.com') &&
              !href.includes('youtube.com')
            )
            .filter((href: string, index: number, self: string[]) => 
              self.indexOf(href) === index // Remove duplicates
            )
            .slice(0, 10) // First 10 unique URLs
          return urls
        })
        const urlExtractionTime = Date.now() - startUrlExtraction
        console.log(`📎 URLs extraídas: ${extractedUrls.length} (${urlExtractionTime}ms)`)
        if (extractedUrls.length > 0) {
          console.log('   Primera URL:', extractedUrls[0])
        }
        
        // Use AI model to intelligently EXTRACT and CLASSIFY existing information
        console.log('🤖 Enviando a IA para extracción y clasificación automática...')
        console.log('   Modelo: llama-3.1-8b-instruct')
        const startAI = Date.now()
        
        // Use full content for comprehensive extraction
        const contentForAI = articleContent.substring(0, 12000)
        
        const prompt = `EXTRACT and CLASSIFY all the information from this publication. DO NOT generate, summarize, or create new content. Only extract what already exists.

Title: ${pub.title}
Description: ${pub.description}
Date: ${pub.date}
Full Content:
${contentForAI}

Your task: Identify and extract ALL information sections that exist in this content. Each article is different - some have tips, some have related content, some have author info, etc.

Return ONLY a JSON object with the information you FIND (no markdown, no explanations):
{
  "title": "extract exact title",
  "description": "extract description if exists",
  "author": "extract author name if exists",
  "publicationDate": "extract date if exists",
  ... (add fields for EVERYTHING you find)
}

IMPORTANT RULES:
- DO NOT generate summaries, DO NOT create content
- ONLY extract information that EXISTS in the content
- Automatically identify sections like: tips, relatedContent, methodology, keyPoints, recommendations, conclusions, references, etc.
- If you find a "Tips" section, add "tips": ["tip1", "tip2"]
- If you find "Related Articles/Content", add "relatedContent": []
- If you find "Key Points", add "keyPoints": []
- If you find author info, extract it exactly as written
- If you find geographic mentions, add "geographicFocus": []
- If you find organizations/institutions, add "organizations": []
- Create field names that describe what you found (use camelCase)
- Use arrays [] for lists, strings "" for single values
- If information doesn't exist, don't include that field

Example of what to extract (if found in content):
- title, author, date, description
- tips, recommendations, keyPoints
- relatedContent, references, citations
- methodology, approach, framework
- geographicFocus, organizations, stakeholders
- conclusions, findings, results
- ... any other section you identify

ONLY extract, DO NOT create or summarize.`

        console.log('⏱️  Llamando a la API de IA...')
        const aiResponse = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { 
              role: "system", 
              content: "You are an expert information extractor. You ONLY extract and classify information that exists in content. You NEVER generate, summarize, or create new content. You identify sections automatically and structure them in JSON. Return ONLY valid JSON, no markdown, no explanations."
            },
            { 
              role: "user", 
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2500
        })
        
        const aiTime = Date.now() - startAI
        console.log(`✅ Respuesta de IA recibida (${aiTime}ms)`)
        console.log('📝 Respuesta completa:', JSON.stringify(aiResponse).substring(0, 300) + '...')

        // Parse AI response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let classifiedData: any
        console.log('🔍 Intentando parsear respuesta de IA...')
        try {
          const responseText = aiResponse.response || JSON.stringify(aiResponse)
          console.log('   Texto recibido (primeros 400 chars):', responseText.substring(0, 400))
          
          // Try to extract JSON from the response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            console.log('   ✓ JSON encontrado en la respuesta')
            classifiedData = JSON.parse(jsonMatch[0])
            console.log('✅ JSON parseado correctamente')
            
            // Log all fields dynamically
            console.log('   📊 Campos extraídos por la IA:')
            Object.keys(classifiedData).forEach(key => {
              const value = classifiedData[key]
              if (Array.isArray(value)) {
                console.log(`   - ${key}: [${value.length} items] ${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}`)
              } else if (typeof value === 'string') {
                console.log(`   - ${key}: ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`)
              } else {
                console.log(`   - ${key}:`, value)
              }
            })
          } else {
            console.log('⚠️ No se encontró JSON en la respuesta')
            console.log('   Respuesta completa:', responseText)
            // Fallback data - solo información básica extraída
            classifiedData = {
              title: pub.title,
              description: pub.description || "",
              publicationDate: pub.date || ""
            }
          }
        } catch (parseError) {
          console.log('❌ Error parseando respuesta de IA:', parseError)
          console.log('   Error detalle:', parseError instanceof Error ? parseError.message : String(parseError))
          // Fallback if AI response is not valid JSON - solo información básica
          classifiedData = {
            title: pub.title,
            description: pub.description || "",
            publicationDate: pub.date || ""
          }
        }

        console.log('🔨 Construyendo objeto clasificado...')
        const classified = {
          title: pub.title,
          url: pub.url,
          fullContent: articleContent,
          contentPreview: articleContent.substring(0, 600) + '...',
          relatedUrls: extractedUrls.slice(0, 5),
          // Toda la clasificación de la IA se guarda aquí (flexible y dinámica)
          aiClassification: classifiedData
        }

        classifiedPublications.push(classified)

        const totalArticleTime = Date.now() - articleStartTime
        console.log('✅ Artículo extraído y clasificado exitosamente:')
        console.log('   📌 Título:', classified.title.substring(0, 60) + '...')
        console.log('   🔗 URL:', classified.url)
        console.log('   📄 Contenido completo:', `${articleContent.length} caracteres`)
        console.log('   📎 URLs relacionadas:', classified.relatedUrls.length)
        console.log('   🤖 Información extraída por IA:')
        console.log('      Total de campos extraídos:', Object.keys(classified.aiClassification).length)
        console.log('      Campos:', Object.keys(classified.aiClassification).join(', '))
        console.log('      Preview:', JSON.stringify(classified.aiClassification).substring(0, 250) + '...')
        console.log('   ⏱️  Tiempo total:', totalArticleTime, 'ms')
        console.log('   📊 Progreso:', `${i + 1}/${publicationLinks.length} completados`)

      } catch (articleError) {
        console.error('❌ Error procesando artículo:', pub.url)
        console.error('   Error:', articleError)
        console.log('⚠️ Agregando datos básicos como fallback')
        // Add fallback data for failed articles - solo info básica extraída
        classifiedPublications.push({
          title: pub.title,
          url: pub.url,
          fullContent: "",
          contentPreview: "",
          relatedUrls: [],
          aiClassification: {
            title: pub.title,
            description: pub.description || "",
            publicationDate: pub.date || "",
            error: "Failed to extract content"
          }
        })
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Proceso completado exitosamente')
    console.log(`📊 Total de artículos procesados: ${classifiedPublications.length}`)
    
    await browser.close()
    console.log('🔒 Navegador cerrado')

    return {
      success: true,
      count: classifiedPublications.length,
      url: targetUrl,
      basicPublications: publicationLinks,
      classifiedPublications
    }
  } catch (error) {
    console.error('💥 ERROR GENERAL EN SCRAPING:')
    console.error('   Mensaje:', error instanceof Error ? error.message : String(error))
    console.error('   Stack:', error instanceof Error ? error.stack : 'N/A')
    
    return {
      success: false,
      error: "Error while scraping",
      message: error instanceof Error ? error.message : String(error)
    }
  }
})

