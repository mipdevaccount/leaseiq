import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in .env.local");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CSV_PATH = path.join(process.cwd(), 'data', 'choice_properties_synthetic_leases.csv');
const LEASES_OUT_PATH = path.join(process.cwd(), 'data', 'leases.json');
const EMBEDDINGS_OUT_PATH = path.join(process.cwd(), 'data', 'embeddings.json');

const CLAUSE_FIELDS = [
  'recovery_clause_text',
  'percentage_rent_clause_text',
  'renewal_clause_text',
  'use_clause_text',
  'exclusivity_clause_text',
  'co_tenancy_clause_text',
  'radius_restriction_clause_text',
  'assignment_subletting_clause_text',
  'early_termination_clause_text',
  'ti_allowance_clause_text',
  'security_deposit_clause_text',
];

async function main() {
  console.log('Reading CSV...');
  const csvData = fs.readFileSync(CSV_PATH, 'utf-8');
  
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const leases = parsed.data as Record<string, string>[];
  console.log(`Parsed ${leases.length} leases.`);

  // Write the structured data to leases.json
  fs.writeFileSync(LEASES_OUT_PATH, JSON.stringify(leases, null, 2));
  console.log(`Saved structured data to ${LEASES_OUT_PATH}`);

  // Create embeddings
  console.log('Generating embeddings...');
  const embeddings: Record<string, number[]> = {};
  
  // Batch size for OpenAI API to avoid rate limits / oversized requests
  const BATCH_SIZE = 100;
  
  for (let i = 0; i < leases.length; i += BATCH_SIZE) {
    console.log(`Processing batch ${i} to ${Math.min(i + BATCH_SIZE, leases.length)}...`);
    const batch = leases.slice(i, i + BATCH_SIZE);
    
    const textsToEmbed = batch.map(lease => {
      // Combine key identifiers and narrative clauses
      const identifiers = `Lease ID: ${lease.lease_id}
Property Name: ${lease.property_name}
Tenant: ${lease.tenant_legal_name} (${lease.tenant_dba})
Address: ${lease.address}, ${lease.city}, ${lease.province}`;

      const clauses = CLAUSE_FIELDS.map(field => {
        const text = lease[field];
        return text && text.trim() !== '' ? `${field.replace(/_text$/, '').replace(/_/g, ' ')}: ${text}` : null;
      }).filter(Boolean).join('\n\n');

      return `${identifiers}\n\n${clauses}`;
    });

    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: textsToEmbed,
    });

    response.data.forEach((item, index) => {
      const leaseId = batch[index].lease_id;
      embeddings[leaseId] = item.embedding;
    });
  }

  fs.writeFileSync(EMBEDDINGS_OUT_PATH, JSON.stringify(embeddings));
  console.log(`Saved embeddings to ${EMBEDDINGS_OUT_PATH}`);
  console.log('Ingestion complete!');
}

main().catch(console.error);
