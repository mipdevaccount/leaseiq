import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const CSV_PATH = path.join(process.cwd(), 'data', 'choice_properties_synthetic_leases.csv');
const LEASES_OUT_PATH = path.join(process.cwd(), 'data', 'leases.json');
const EMBEDDINGS_OUT_PATH = path.join(process.cwd(), 'data', 'embeddings.json');

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
  
  // Write empty embeddings so semantic search degrades gracefully instead of crashing
  if (!fs.existsSync(EMBEDDINGS_OUT_PATH)) {
    fs.writeFileSync(EMBEDDINGS_OUT_PATH, JSON.stringify({}));
    console.log(`Saved empty embeddings to ${EMBEDDINGS_OUT_PATH} for graceful fallback`);
  }
}

main().catch(console.error);
