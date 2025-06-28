import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { 
  searchWaterSystems, 
  getQuickStats, 
  getSystemDetails, 
  getSystemsByViolationStatus,
  getCountyStats,
  getPopularLocations,
  getSystemTypes
} from '@/lib/supabase'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai(process.env.OPENAI_MODEL || 'gpt-4o-mini', {
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    }),
    messages,
    tools: {
      searchWaterSystems: tool({
        description: 'Search for water systems by city, county, or system ID. Use this when users ask about specific locations or systems.',
        parameters: z.object({
          query: z.string().describe('The search term - can be city name, county name, or system ID'),
        }),
        execute: async ({ query }) => {
          try {
            const results = await searchWaterSystems(query)
            return {
              success: true,
              count: results.length,
              systems: results.slice(0, 10) // Limit to 10 results for readability
            }
          } catch (error) {
            return { success: false, error: 'Failed to search water systems' }
          }
        },
      }),

      getSystemDetails: tool({
        description: 'Get detailed information about a specific water system by its PWSID. Use when users want details about a specific system.',
        parameters: z.object({
          pwsid: z.string().describe('The Public Water System ID (e.g., GA0070000)'),
        }),
        execute: async ({ pwsid }) => {
          try {
            const details = await getSystemDetails(pwsid)
            return details ? { success: true, ...details } : { success: false, error: 'System not found' }
          } catch (error) {
            return { success: false, error: 'Failed to get system details' }
          }
        },
      }),

      getQuickStats: tool({
        description: 'Get overall statistics about Georgia water systems. Use when users ask about general stats, totals, or overview.',
        parameters: z.object({}),
        execute: async () => {
          try {
            const stats = await getQuickStats()
            return { success: true, ...stats }
          } catch (error) {
            return { success: false, error: 'Failed to get statistics' }
          }
        },
      }),

      getSystemsByViolationStatus: tool({
        description: 'Get water systems filtered by violation status. Use when users ask about systems with or without violations.',
        parameters: z.object({
          hasViolations: z.boolean().describe('true to get systems with violations, false for systems without violations'),
        }),
        execute: async ({ hasViolations }) => {
          try {
            const systems = await getSystemsByViolationStatus(hasViolations)
            return {
              success: true,
              count: systems.length,
              systems: systems.slice(0, 15), // Limit for readability
              hasViolations
            }
          } catch (error) {
            return { success: false, error: 'Failed to get systems by violation status' }
          }
        },
      }),

      getCountyStats: tool({
        description: 'Get statistics grouped by county. Use when users ask about county-level data, rankings, or comparisons.',
        parameters: z.object({}),
        execute: async () => {
          try {
            const countyStats = await getCountyStats()
            const sortedCounties = Object.values(countyStats).sort((a: any, b: any) => 
              b.systemCount - a.systemCount
            ).slice(0, 20) // Top 20 counties by system count
            
            return {
              success: true,
              counties: sortedCounties,
              totalCounties: Object.keys(countyStats).length
            }
          } catch (error) {
            return { success: false, error: 'Failed to get county statistics' }
          }
        },
      }),

      getPopularLocations: tool({
        description: 'Get popular cities and counties with most water systems. Use when users ask about major locations or where most systems are.',
        parameters: z.object({}),
        execute: async () => {
          try {
            const locations = await getPopularLocations()
            return { success: true, ...locations }
          } catch (error) {
            return { success: false, error: 'Failed to get popular locations' }
          }
        },
      }),

      getSystemTypes: tool({
        description: 'Get breakdown of water system types (Community, School/Workplace, Transient). Use when users ask about system types or categories.',
        parameters: z.object({}),
        execute: async () => {
          try {
            const types = await getSystemTypes()
            return { success: true, systemTypes: types }
          } catch (error) {
            return { success: false, error: 'Failed to get system types' }
          }
        },
      }),

      calculatePopulationImpact: tool({
        description: 'Calculate how many people are affected by violations. Use when users ask about population impact of water issues.',
        parameters: z.object({
          onlyViolations: z.boolean().default(true).describe('Whether to only count systems with violations'),
        }),
        execute: async ({ onlyViolations }) => {
          try {
            const systems = await getSystemsByViolationStatus(onlyViolations)
            const totalPopulation = systems.reduce((sum, system) => 
              sum + (system.population_served_count || 0), 0
            )
            
            return {
              success: true,
              systemsCount: systems.length,
              totalPopulationAffected: totalPopulation,
              hasViolations: onlyViolations
            }
          } catch (error) {
            return { success: false, error: 'Failed to calculate population impact' }
          }
        },
      }),
    },
    systemMessage: `You are a helpful AI assistant for the Georgia Water Quality Dashboard. You have access to real data about Georgia's public water systems, including violations, population served, counties, and system details.

Guidelines:
- Be conversational and helpful
- Provide specific, data-driven answers
- When showing lists of systems, include key details like location, population served, and violation status
- Use clear formatting for better readability
- Always mention that this is Georgia water system data
- For emergency situations, remind users to call (404) 656-4713
- When users ask about specific locations, use the search function
- When they ask about statistics or trends, use the appropriate data functions
- Be proactive about offering related insights that might be helpful

Data context:
- Risk levels: 'no_violations', 'low_risk', 'medium_risk', 'high_risk'
- Violation statuses include 'Unaddressed' and 'Addressed' (both count as current violations)
- Population served can be 0 for some systems (schools, workplaces)
- System types: CWS (Community), NTNCWS (School/Workplace), TNCWS (Transient)`,
  })

  return result.toAIStreamResponse()
}