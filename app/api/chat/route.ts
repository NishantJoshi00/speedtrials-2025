import { 
  searchWaterSystems, 
  getQuickStats, 
  getSystemDetails, 
  getSystemsByViolationStatus,
  getCountyStats,
  getPopularLocations,
  getSystemTypes
} from '@/lib/supabase'

// Helper to determine what data is needed
async function getRelevantData(message: string) {
  const lowerMessage = message.toLowerCase()
  const data: any = {}
  const functionCalls: string[] = []

  try {
    // Get stats for overview questions
    if (lowerMessage.includes('stats') || lowerMessage.includes('overview') || lowerMessage.includes('total') || lowerMessage.includes('how many')) {
      functionCalls.push('getQuickStats()')
      data.stats = await getQuickStats()
    }

    // Get county data for county-related questions
    if (lowerMessage.includes('county') || lowerMessage.includes('counties') || lowerMessage.includes('worst') || lowerMessage.includes('best') || lowerMessage.includes('safest')) {
      functionCalls.push('getCountyStats()')
      data.counties = await getCountyStats()
    }

    // Get violation data
    if (lowerMessage.includes('violation') || lowerMessage.includes('problem') || lowerMessage.includes('unsafe') || lowerMessage.includes('risk')) {
      functionCalls.push('getSystemsByViolationStatus(true)')
      functionCalls.push('getSystemsByViolationStatus(false)')
      data.violationSystems = await getSystemsByViolationStatus(true)
      data.safeSystems = await getSystemsByViolationStatus(false)
    }

    // Search for specific locations
    const searchTerms = []
    if (lowerMessage.includes('atlanta')) searchTerms.push('atlanta')
    if (lowerMessage.includes('savannah')) searchTerms.push('savannah')
    if (lowerMessage.includes('columbus')) searchTerms.push('columbus')
    if (lowerMessage.includes('augusta')) searchTerms.push('augusta')
    if (lowerMessage.includes('macon')) searchTerms.push('macon')
    
    // Extract quoted search terms or "in X" or "near X"
    const quotedMatch = message.match(/"([^"]+)"/)?.[1]
    const inMatch = message.match(/\b(?:in|near|around)\s+([A-Za-z\s]+?)(?:\s|$|[,.])/i)?.[1]
    
    if (quotedMatch) searchTerms.push(quotedMatch)
    if (inMatch) searchTerms.push(inMatch.trim())

    if (searchTerms.length > 0) {
      data.searchResults = {}
      for (const term of searchTerms) {
        functionCalls.push(`searchWaterSystems("${term}")`)
        data.searchResults[term] = await searchWaterSystems(term)
      }
    }

    // Get system types if asking about categories
    if (lowerMessage.includes('type') || lowerMessage.includes('category') || lowerMessage.includes('kind')) {
      functionCalls.push('getSystemTypes()')
      data.systemTypes = await getSystemTypes()
    }

    // Get popular locations for general location questions
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('popular')) {
      functionCalls.push('getPopularLocations()')
      data.popularLocations = await getPopularLocations()
    }

    // Log function calls made
    if (functionCalls.length > 0) {
      console.log('🔧 Function calls:', functionCalls.join(', '))
    }

  } catch (error) {
    console.error('❌ Error fetching data:', error)
    data.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return data
}

// Improved streaming with word-aware chunking
function createImprovedStreamingResponse(text: string) {
  const encoder = new TextEncoder()
  let index = 0
  
  const stream = new ReadableStream({
    start(controller) {
      function pushChunk() {
        try {
          if (index >= text.length) {
            console.log('✅ Streaming complete, sent', text.length, 'characters')
            controller.close()
            return
          }
          
          // Smart chunking: try to break at word boundaries for better effect
          let chunkSize = Math.floor(Math.random() * 8) + 5 // 5-12 characters
          let endIndex = Math.min(index + chunkSize, text.length)
          
          // If we're not at the end, try to break at a word boundary
          if (endIndex < text.length) {
            const nextSpace = text.indexOf(' ', endIndex)
            const nextNewline = text.indexOf('\n', endIndex)
            const nextBreak = Math.min(
              nextSpace === -1 ? text.length : nextSpace,
              nextNewline === -1 ? text.length : nextNewline
            )
            
            // If the next break is within 5 characters, use it
            if (nextBreak - endIndex <= 5) {
              endIndex = nextBreak + 1 // Include the space/newline
            }
          }
          
          const chunk = text.slice(index, endIndex)
          index = endIndex
          
          // Robust escaping for JSON
          const escapedChunk = chunk
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\r\n/g, '\\n')
            .replace(/\r/g, '\\n')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, ' ')
          
          // Send the chunk
          controller.enqueue(encoder.encode(`0:"${escapedChunk}"\n`))
          
          // Variable delay based on chunk content for realistic effect
          let delay = 20 // Base delay
          if (chunk.includes('\n')) delay += 15 // Pause at line breaks
          if (chunk.includes('.')) delay += 10  // Pause at sentence ends
          if (chunk.includes(',')) delay += 5   // Short pause at commas
          
          // Add some randomness (±10ms)
          delay += Math.floor(Math.random() * 20) - 10
          
          setTimeout(pushChunk, Math.max(delay, 10)) // Minimum 10ms delay
        } catch (error) {
          console.error('❌ Streaming error at character', index, ':', error)
          // Try to continue with a smaller chunk
          if (index < text.length) {
            index = Math.min(index + 1, text.length)
            setTimeout(pushChunk, 50)
          } else {
            controller.error(error)
          }
        }
      }
      
      console.log('🚀 Starting smart streaming for', text.length, 'characters')
      // Small initial delay to let the UI prepare
      setTimeout(pushChunk, 50)
    },
  })
  
  return stream
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    
    if (!lastMessage?.content) {
      throw new Error('No message content provided')
    }

    console.log('📝 User query:', lastMessage.content)

    // Phase 1: Retrieve relevant data
    const data = await getRelevantData(lastMessage.content)

    // Phase 2: Generate response with Llama API using the data
    const baseUrl = process.env.OPENAI_BASE_URL?.replace(/\/$/, '') || 'https://api.llama.com/compat/v1'
    
    // Build enhanced system message with the retrieved data
    let systemMessage = `You are a helpful AI assistant for the Georgia Water Quality Dashboard. You have access to real data about Georgia's public water systems.

Guidelines:
- Be conversational and helpful
- Provide specific, data-driven answers using the data provided below
- Use clear markdown formatting with headers, bullet points, and lists
- Always mention this is Georgia water system data
- For emergencies, remind users to call (404) 656-4713

FORMATTING INSTRUCTIONS:
- Use ## for main section headers (e.g., ## Overview, ## Risk Levels)
- Use ### for subsection headers 
- Use **bold text** for important information
- Use bullet points (-) for lists
- Use numbered lists when showing rankings
- Structure responses clearly with sections

Data context:
- Risk levels: 'no_violations' (safest), 'low_risk', 'medium_risk', 'high_risk' (most dangerous)
- System types: CWS (Community), NTNCWS (School/Workplace), TNCWS (Transient)`

    // Add retrieved data to context
    if (data.stats) {
      systemMessage += `\n\nCURRENT GEORGIA WATER STATISTICS:
- Total Water Systems: ${data.stats.totalSystems?.toLocaleString()}
- Systems with Current Violations: ${data.stats.systemsWithViolations?.toLocaleString()}
- Total Population Served: ${data.stats.totalPopulation?.toLocaleString()}
- Risk Distribution: ${JSON.stringify(data.stats.riskDistribution)}`
    }

    if (data.counties) {
      const countyList = Object.values(data.counties)
        .sort((a: any, b: any) => b.violationCount - a.violationCount)
        .slice(0, 15)
        .map((c: any) => `${c.county}: ${c.systemCount} systems, ${c.violationCount} violations`)
      systemMessage += `\n\nCOUNTY STATISTICS (Top 15 by violations):
${countyList.join('\n')}`
    }

    if (data.violationSystems || data.safeSystems) {
      if (data.violationSystems) {
        systemMessage += `\n\nSYSTEMS WITH VIOLATIONS (${data.violationSystems.length} total):`
        data.violationSystems.slice(0, 10).forEach((sys: any) => {
          systemMessage += `\n- ${sys.pws_name} (${sys.primary_county}): ${sys.population_served_count} people, Risk: ${sys.risk_level}`
        })
      }
    }

    if (data.searchResults) {
      Object.entries(data.searchResults).forEach(([term, results]: [string, any]) => {
        if (results.length > 0) {
          systemMessage += `\n\nSEARCH RESULTS FOR "${term.toUpperCase()}" (${results.length} found):`
          results.slice(0, 8).forEach((sys: any) => {
            systemMessage += `\n- ${sys.pws_name} (${sys.primary_county}): ${sys.population_served_count} people served, Risk: ${sys.risk_level}, Violations: ${sys.current_violations || 0}`
          })
        }
      })
    }

    if (data.systemTypes) {
      systemMessage += `\n\nSYSTEM TYPES:
${data.systemTypes.map((type: any) => `- ${type.type_description}: ${type.count} systems`).join('\n')}`
    }

    if (data.popularLocations) {
      systemMessage += `\n\nPOPULAR LOCATIONS:
Top Cities: ${data.popularLocations.topCities?.map((c: any) => `${c.city} (${c.count} systems)`).join(', ')}
Top Counties: ${data.popularLocations.topCounties?.map((c: any) => `${c.county} (${c.count} systems)`).join(', ')}`
    }

    const requestBody = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
      stream: false,
      max_tokens: 800,
      temperature: 0.7
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const responseData = await response.json()
    const content = responseData.choices?.[0]?.message?.content || 'No response generated'
    
    console.log('🤖 AI Response:')
    console.log('=' .repeat(50))
    console.log(content)
    console.log('=' .repeat(50))

    // Phase 3: Create improved streaming response
    const stream = createImprovedStreamingResponse(content)
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}