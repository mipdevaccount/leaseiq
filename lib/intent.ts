import { openai } from './openai';

export type IntentType = 'structured' | 'semantic' | 'hybrid';

export interface IntentResult {
  type: IntentType;
  filters?: Record<string, string>;
}

export async function classifyIntent(query: string): Promise<IntentResult> {
  const systemPrompt = `You are an intent classifier for a Lease Intelligence platform. 
Determine if the user's query about commercial leases requires:
1. "structured": filtering on strict fields (e.g., province, tenant category, status, expiry year, rent).
2. "semantic": searching unstructured narrative clauses (e.g., exclusivity, co-tenancy, radius restrictions, use clauses, default).
3. "hybrid": both structured filtering and semantic search.

If hybrid or structured, extract the relevant filters.
Allowed filter keys: province, city, tenant_category, tenant_legal_name, property_name, lease_status.
Return ONLY valid JSON in this format:
{
  "type": "structured" | "semantic" | "hybrid",
  "filters": { "key": "value" } // only if applicable
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"type":"hybrid"}');
    return result as IntentResult;
  } catch (error) {
    console.error("Intent classification failed, defaulting to hybrid", error);
    return { type: 'hybrid' };
  }
}
