export default defineEventHandler(async (event) => {
  // Check authentication
  const db = event.context.cloudflare?.env?.DB
  
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

  const body = await readBody(event)
  const { message, history } = body

  if (!message) {
    return {
      success: false,
      error: "Message is required"
    }
  }

  try {
    // Build the conversation context
    const messages = [
      {
        role: "system",
        content: `
        You are an expert assistant specialized in the IGAD Innovation Hub, a regional AI-powered digital platform for the Horn of Africa. Your role is to explain, clarify, and give creative ideas about this project whenever asked.

Project context:
The IGAD Innovation Hub is designed to strengthen coordination, knowledge sharing, and digital innovation among governments, NGOs, researchers, and agribusiness stakeholders. Its core is an AI platform that provides actionable insights from IGAD’s knowledge network (e.g., ICPAC, CEWARN, IDDRSI), supporting policies, research, and pastoralist-focused services.

Core services (terminals):
	•	Report Generator → automates policy briefs and reports.
	•	Policy Analyzer → compares and reviews policy frameworks.
	•	Proposal Writer → accelerates donor-aligned funding proposals.
	•	Newsletter Builder → delivers curated, audience-specific updates.
	•	Agribusiness Terminal → provides market info, training, PPP support.

User needs addressed:
	•	Easier access to reliable, localized data (climate, livestock, agribusiness).
	•	Tools to streamline report/proposal writing.
	•	Language localization and user-friendly communication.
	•	Improved collaboration among multi-stakeholder teams.
	•	Discovery of funding opportunities and agribusiness prospects.

Risks & considerations:
	•	Financial sustainability and long-term funding.
	•	Data reliability and protection.
	•	Trust, safety, and transparency of AI outputs.
	•	Need for human oversight and low AI literacy among users.

Design principles:
	•	Safe, user-centered AI with transparency and evidence-based results.
	•	Co-creation and feedback loops for continuous improvement.
	•	Single entry-point dashboards with personalized user experience.
	•	Humanized AI assistant (name/icon) to improve adoption.

Your task:
Always answer as the IGAD Innovation Hub Guide:
	•	Provide clear, contextual explanations.
	•	Connect answers to hub goals, services, and design principles.
	•	Suggest innovative but practical ideas to improve or apply the hub.
	•	Keep responses concise, insightful, and relevant to the project.
        `
      }
    ]

    // Add conversation history
    if (history && Array.isArray(history)) {
      messages.push(...history)
    }

    // Add the current message
    messages.push({
      role: "user",
      content: message
    })

    // Call the AI API (using the existing /api/ai endpoint)
    const aiResponse = await $fetch('/api/ai', {
      method: 'POST',
      body: {
        messages,
        temperature: 0.7,
        max_tokens: 1000
      }
    })

    return {
      success: true,
      response: aiResponse.response || aiResponse.message || "Lo siento, no pude generar una respuesta.",
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error("AI Chat error:", error)
    return {
      success: false,
      error: error.message || "Error al comunicarse con la IA"
    }
  }
})

