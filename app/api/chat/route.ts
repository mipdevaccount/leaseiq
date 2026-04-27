import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { getLeases, semanticSearch } from '@/lib/retrieval';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { z } from 'zod';
import alasql from 'alasql';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Map messages to ensure they are CoreMessage compatible
    const coreMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content || (m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : ''),
    }));

    // Add tool instructions to system prompt
    const enhancedSystemPrompt = `${SYSTEM_PROMPT}

You are now an Agentic AI with access to tools. You MUST use your tools to answer the user's questions.

AVAILABLE TOOLS:
1. \`search_leases\`: Use this to find specific lease records when the user asks about specific clauses, properties, or tenants.
2. \`analyze_portfolio\`: Use this to run SQL queries against the full 1,000-lease dataset. Use this for ANY question involving counting, aggregations, averages, or max/min.

DATABASE SCHEMA for \`analyze_portfolio\`:
Table name is \`leases\`.
Columns:
- lease_id (string)
- property_name (string)
- tenant_legal_name (string)
- tenant_dba (string)
- address (string)
- city (string)
- province (string)
- postal_code (string)
- lease_status (string) e.g., 'Active', 'Expired'
- gla_sqft (number as string)
- execution_date (YYYY-MM-DD)
- commencement_date (YYYY-MM-DD)
- expiry_date (YYYY-MM-DD)
- annual_base_rent_year1 (number as string)
- rent_steps (string)
- exclusivity_type (string) e.g., 'Broad', 'Narrow'
- Use standard SQL. For dates, you can use \`LEFT(expiry_date, 4)\` to get the year.
- Example: \`SELECT LEFT(expiry_date, 4) as year, COUNT(*) as count FROM leases GROUP BY LEFT(expiry_date, 4) ORDER BY count DESC LIMIT 1\`
`;

    // Step 4: Stream response
    const result = streamText({
      model: openai(process.env.OPENAI_CHAT_MODEL || 'gpt-4o'), // Upgraded to gpt-4o for complex SQL capabilities
      system: enhancedSystemPrompt,
      messages: coreMessages,
      maxSteps: 5, // Allow multi-step tool calling
      tools: {
        search_leases: tool({
          description: 'Search for specific leases by semantic similarity to read clauses and individual lease details. Returns top 8 matches.',
          parameters: z.object({
            query: z.string().describe('The search query or description of the lease/clauses to find'),
          }),
          execute: async ({ query }) => {
            const allLeases = getLeases();
            const results = await semanticSearch(query, allLeases, 8);
            return results.map(lease => {
              const entries = Object.entries(lease)
                .filter(([_, v]) => v !== undefined && v !== null && v !== '')
                .map(([k, v]) => `${k}: ${v}`);
              return entries.join('\\n');
            }).join('\\n\\n--- NEXT LEASE ---\\n\\n');
          },
        }),
        analyze_portfolio: tool({
          description: 'Execute a SQL query against the entire "leases" database to perform data aggregations, counts, group bys, and statistics. Returns the raw JSON output of the query.',
          parameters: z.object({
            query: z.string().describe('The SQL query to execute on the "leases" table. Keep it standard SQL.'),
          }),
          execute: async ({ query }) => {
            try {
              const leases = getLeases();
              const safeQuery = query.replace(/\bleases\b/gi, '?');
              const res = alasql(safeQuery, [leases]);
              return JSON.stringify(res).slice(0, 10000); // Truncate to prevent context overload
            } catch (err: any) {
              return JSON.stringify({ error: err.message, note: 'Failed to execute SQL query. Please rewrite your query and try again.' });
            }
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
