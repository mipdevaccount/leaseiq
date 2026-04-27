import fs from 'fs';
import path from 'path';
import { openai } from './openai';

export interface Lease {
  lease_id: string;
  property_name: string;
  tenant_legal_name: string;
  tenant_dba: string;
  city: string;
  province: string;
  gla_sqft: string;
  lease_status: string;
  exclusivity_type: string;
  [key: string]: string | undefined;
}

let cachedLeases: Lease[] | null = null;
let cachedEmbeddings: Record<string, number[]> | null = null;

export function getLeases(): Lease[] {
  if (!cachedLeases) {
    const leasesPath = path.join(process.cwd(), 'data', 'leases.json');
    if (fs.existsSync(leasesPath)) {
      cachedLeases = JSON.parse(fs.readFileSync(leasesPath, 'utf-8'));
    } else {
      cachedLeases = [];
    }
  }
  return cachedLeases!;
}

export function getEmbeddings(): Record<string, number[]> {
  if (!cachedEmbeddings) {
    const embeddingsPath = path.join(process.cwd(), 'data', 'embeddings.json');
    if (fs.existsSync(embeddingsPath)) {
      cachedEmbeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));
    } else {
      cachedEmbeddings = {};
    }
  }
  return cachedEmbeddings!;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct; // assuming normalized
}

export async function semanticSearch(query: string, candidateLeases?: Lease[], topK: number = 8): Promise<Lease[]> {
  const allLeases = getLeases();
  const allEmbeddings = getEmbeddings();
  
  if (!query || query.trim() === '') return candidateLeases ? candidateLeases.slice(0, topK) : allLeases.slice(0, topK);

  const response = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    input: query,
  });
  
  const queryEmbedding = response.data[0].embedding;
  const leasesToSearch = candidateLeases || allLeases;
  
  const scoredLeases = leasesToSearch.map(lease => {
    const leaseEmbedding = allEmbeddings[lease.lease_id];
    let score = -1;
    if (leaseEmbedding) {
      score = cosineSimilarity(queryEmbedding, leaseEmbedding);
    }
    return { lease, score };
  });
  
  scoredLeases.sort((a, b) => b.score - a.score);
  return scoredLeases.slice(0, topK).map(s => s.lease);
}

// Simple filter based on text matching on specific fields
export function structuredFilter(leases: Lease[], filters: Record<string, string>): Lease[] {
  return leases.filter(lease => {
    for (const [key, value] of Object.entries(filters)) {
      if (!lease[key] || !lease[key].toLowerCase().includes(value.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}
