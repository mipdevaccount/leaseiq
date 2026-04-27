import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { classifyIntent } from '@/lib/intent';
import { getLeases, semanticSearch, structuredFilter } from '@/lib/retrieval';
import { SYSTEM_PROMPT } from '@/lib/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return new Response('Invalid request', { status: 400 });
    }

    const query = latestMessage.content || 
                  (latestMessage.parts && latestMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')) || 
                  '';

    if (!query) {
      return new Response('Empty query', { status: 400 });
    }
    
    // Classify intent
    const intent = await classifyIntent(query);
    console.log(`Intent classification: ${intent.type}`, intent.filters);

    let candidateLeases = getLeases();
    
    // Step 1: Structured filtering if applicable
    if ((intent.type === 'structured' || intent.type === 'hybrid') && intent.filters) {
      candidateLeases = structuredFilter(candidateLeases, intent.filters);
    }

    // Step 2: Semantic search if applicable
    let finalLeases = candidateLeases;
    if (intent.type === 'semantic' || intent.type === 'hybrid') {
      // Pass the filtered candidates to semantic search to find top 8
      finalLeases = await semanticSearch(query, candidateLeases, 8);
    } else {
      // If purely structured, limit to top 8 to avoid context overflow
      finalLeases = candidateLeases.slice(0, 8);
    }

    // Step 3: Build context
    const contextLines = finalLeases.map(lease => {
      // Exclude empty fields to save tokens
      const entries = Object.entries(lease)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}: ${v}`);
      return entries.join('\n');
    });

    const contextString = contextLines.map((c, i) => `--- LEASE RECORD ${i + 1} ---\n${c}`).join('\n\n');

    const systemPromptWithContext = `${SYSTEM_PROMPT}\n\nCONTEXT:\n${contextString}`;

    // Map messages to ensure they are CoreMessage compatible (streamText expects content, not parts)
    const coreMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content || (m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : ''),
    }));

    // Step 4: Stream response
    const result = streamText({
      model: openai(process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'),
      messages: [
        { role: 'system', content: systemPromptWithContext },
        ...coreMessages,
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
