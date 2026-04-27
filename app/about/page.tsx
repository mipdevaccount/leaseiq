import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, Bot, FileText, Search, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex-1 w-full bg-muted/10 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">How it Works</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The Lease Intelligence Platform demonstrates how Retrieval-Augmented Generation (RAG) transforms unstructured lease abstracts into a queryable, decision-grade dataset.
          </p>
        </div>

        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 flex gap-4 text-amber-900 dark:text-amber-200">
          <ShieldCheck className="w-8 h-8 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Important: Synthetic Data</h3>
            <p className="text-sm leading-relaxed opacity-90">
              This demonstration uses synthetic data calibrated against publicly disclosed portfolio characteristics. <strong>No actual lease documents were used as input.</strong> When deployed for production, this exact architecture will process real lease documents, applying the same reasoning capabilities to proprietary data within a secure enclave.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Database className="w-8 h-8 text-primary mb-2" />
              <CardTitle>1. Data Ingestion & Indexing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Lease abstracts are ingested into two parallel indexes. Structured fields (rent, expiry, GLA) are stored for SQL-like filtering. Unstructured narrative clauses (exclusivity, co-tenancy, radius restrictions) are passed through an embedding model (text-embedding-3-small) to create a searchable vector space.
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Search className="w-8 h-8 text-primary mb-2" />
              <CardTitle>2. Intent Routing & Retrieval</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              When a query is submitted, a lightweight intent classifier routes it as structured, semantic, or hybrid. The system first narrows the candidate pool using structured filters, then performs a cosine similarity search across the vectors to find the most contextually relevant lease clauses.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bot className="w-8 h-8 text-primary mb-2" />
              <CardTitle>3. Synthesis & Citation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              The retrieved lease records are packaged into a tight context window and passed to the LLM (gpt-4o-mini). The model is strictly prompted to synthesize an answer based <em>only</em> on the provided context, and to cite the specific lease ID [CHP-LSE-NNNNN] for every factual claim.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="w-8 h-8 text-primary mb-2" />
              <CardTitle>4. Verification UI</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Answers are streamed to the client in real-time. Because every claim is cited, users can click any citation chip to instantly open the source lease record in a side drawer, verifying the model's interpretation against the actual clause language.
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-card border rounded-xl p-8 text-center">
          <h3 className="font-semibold text-lg mb-2">The Value Proposition</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A standard database can report that a lease contains an exclusivity clause. Only a semantic RAG pipeline can instantly identify whether the specific drafting language in that clause exposes the landlord to new regulatory risks under the Competition Act. This platform bridges the gap between structured data and narrative reality.
          </p>
        </div>
      </div>
    </div>
  );
}
