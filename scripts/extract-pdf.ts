import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load env vars
dotenv.config(); // Checks .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') }); // Also checks .env.local

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in .env or .env.local");
  process.exit(1);
}

const TARGET_DIR = path.resolve('/Users/michaelianni-palarchio/Documents/MIP Development/LeaseIQ Prototype/Lease Abstracts/Ontario/30670_2625 Sheffield Rd/1_Amazon');
const OUT_PATH = path.resolve(process.cwd(), 'data', 'sample-extracted-leases.json');

// Zod schema based on the lease_schema_dictionary
const leaseSchema = z.object({
  lease_id: z.string().describe("Generate a unique lease ID like 'CHP-LSE-AMZ-01'"),
  property_name: z.string().describe("Property or centre name"),
  tenant_legal_name: z.string().describe("Legal entity on the lease"),
  tenant_dba: z.string().describe("Operating banner / DBA"),
  address: z.string().describe("Civic address of the property"),
  city: z.string().describe("City"),
  province: z.string().describe("2-letter Canadian province code"),
  gla_sqft: z.string().describe("Gross leasable area in sqft (number as string)"),
  lease_status: z.string().describe("E.g., Active, Expired"),
  commencement_date: z.string().describe("YYYY-MM-DD"),
  expiry_date: z.string().describe("YYYY-MM-DD"),
  annual_base_rent_year1: z.string().describe("Total annual base rent for year 1 (number as string)"),
  rent_escalation_summary: z.string().describe("Summary of rent increases"),
  exclusivity_type: z.string().describe("None, Limited, Narrow, or Broad"),
  recovery_clause_text: z.string().describe("Narrative clause describing recovery structure / additional rent / CAM"),
  percentage_rent_clause_text: z.string().describe("Narrative clause describing percentage rent"),
  renewal_clause_text: z.string().describe("Narrative clause describing renewal options"),
  use_clause_text: z.string().describe("Narrative clause describing permitted use"),
  exclusivity_clause_text: z.string().describe("Narrative clause describing exclusivity rights"),
  co_tenancy_clause_text: z.string().describe("Narrative clause describing co-tenancy requirements"),
  assignment_subletting_clause_text: z.string().describe("Narrative clause describing assignment and subletting"),
  early_termination_clause_text: z.string().describe("Narrative clause describing early termination rights"),
  ti_allowance_clause_text: z.string().describe("Narrative clause describing Tenant Improvement allowance"),
  security_deposit_clause_text: z.string().describe("Narrative clause describing security deposit"),
  hvac_responsibility_clause_text: z.string().describe("Narrative clause describing HVAC responsibilities (Landlord vs Tenant)")
});

async function main() {
  console.log(`Scanning target directory: ${TARGET_DIR}`);
  const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log("No PDFs found in the directory.");
    return;
  }

  const extractedLeases = [];

  for (const file of files) {
    const filePath = path.join(TARGET_DIR, file);
    console.log(`\nProcessing PDF: ${file}`);
    
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      console.log(`Extracted ${pdfData.text.length} characters of raw text.`);
      // Take the first 100k characters to avoid token limits if the PDF is massive
      const rawText = pdfData.text.substring(0, 100000);

      console.log(`Sending to OpenAI (gpt-4o) for structuring...`);
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: leaseSchema,
        prompt: `You are an expert commercial lease abstractor. Read the following raw text extracted from a lease document and extract the required fields exactly as specified in the schema. If a field is not present or cannot be determined, output "N/A" or an empty string rather than guessing. 
        
        Raw Lease Text:
        ${rawText}`,
      });

      console.log(`Extraction successful for ${file}.`);
      extractedLeases.push(object);

    } catch (error: any) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nSaving ${extractedLeases.length} extracted leases to ${OUT_PATH}...`);
  fs.writeFileSync(OUT_PATH, JSON.stringify(extractedLeases, null, 2));
  console.log('Extraction complete! Please review the output file.');
}

main().catch(console.error);
