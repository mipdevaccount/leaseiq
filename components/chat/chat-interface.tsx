"use client"

import * as React from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Send, FileText, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "Which leases expire in the next 18 months and have NO renewal options?",
  "List all Loblaw banner anchor leases in Ontario with rent step-ups in 2027 or 2028.",
  "Identify all leases with broad exclusivity clauses that may now be unenforceable.",
  "Show CAM-cap exposure: list every modified-net lease where the CAM cap is below 4%.",
  "Generate a one-page lease summary for CHP-LSE-00003."
];

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = React.useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };
  const isLoading = status === 'submitted' || status === 'streaming';
  const append = (msg: { role: 'user', content: string }) => sendMessage(msg.content);
  const [selectedLeaseId, setSelectedLeaseId] = React.useState<string | null>(null);
  const [leaseData, setLeaseData] = React.useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract citations from messages
  const extractCitations = (content: string) => {
    const regex = /\[CHP-LSE-\d{5}\]/g;
    const matches = content.match(regex) || [];
    return Array.from(new Set(matches)).map(m => m.slice(1, -1)); // remove brackets
  };

  const getText = (m: any) => m.content || m.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('') || '';

  const allCitations = messages
    .filter(m => m.role === 'assistant')
    .flatMap(m => extractCitations(getText(m)))
    .filter((v, i, a) => a.indexOf(v) === i);

  const handleCitationClick = async (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    setIsDrawerOpen(true);
    setLeaseData(null);
    try {
      const res = await fetch(`/api/lease/${leaseId}`);
      if (res.ok) {
        setLeaseData(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left Rail: Suggestions */}
      <div className="hidden lg:flex w-64 flex-col border-r bg-muted/20 p-4 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold text-sm tracking-tight mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Suggested Questions
          </h3>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => append({ role: 'user', content: q })}
                className="text-left text-xs p-3 rounded-lg bg-background border hover:bg-muted/50 transition-colors w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6 pb-20 pt-4">
            {messages.length === 0 && (
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Lease Intelligence</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Ask questions about the portfolio. The AI will retrieve the relevant lease clauses and data points to construct an answer.
                </p>
              </div>
            )}
            
            {messages.map(m => {
              const citations = extractCitations(getText(m));
              return (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 border'}`}>
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap text-[15px]">{getText(m)}</div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{getText(m)}</ReactMarkdown>
                      </div>
                    )}
                    {m.role === 'assistant' && citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t flex flex-wrap gap-2">
                        {citations.map(c => (
                          <Badge 
                            key={c} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-secondary/80 text-xs py-0.5 px-2 font-medium"
                            onClick={() => handleCitationClick(c)}
                          >
                            <FileText className="w-3 h-3 mr-1 inline" />
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/40 border rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Searching lease records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about exclusivity, co-tenancy, expiries..."
                className="pr-12 h-14 rounded-full shadow-sm bg-background border-muted-foreground/20 text-base"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()} 
                className="absolute right-1.5 h-11 w-11 rounded-full"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Rail: Sources */}
      <div className="hidden xl:flex w-80 flex-col border-l bg-muted/10 p-4 overflow-y-auto">
        <h3 className="font-semibold text-sm tracking-tight mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Cited Sources
        </h3>
        
        {allCitations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center mt-10">
            Lease citations will appear here as the assistant references them.
          </p>
        ) : (
          <div className="space-y-3">
            {allCitations.map(c => (
              <Card key={c} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCitationClick(c)}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {c}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                  Click to view full lease details and clause language.
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lease Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-full sm:w-[450px] md:w-[600px] rounded-none">
          <DrawerHeader className="border-b bg-muted/30">
            <DrawerTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedLeaseId}
            </DrawerTitle>
            <DrawerDescription>
              {leaseData?.property_name} • {leaseData?.tenant_legal_name}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="p-6">
            {!leaseData ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {/* Core Info */}
                <section>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Core Info</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div><span className="text-muted-foreground block mb-1">Status</span><Badge>{leaseData.lease_status}</Badge></div>
                    <div><span className="text-muted-foreground block mb-1">GLA</span><span className="font-medium">{Number(leaseData.gla_sqft).toLocaleString()} sf</span></div>
                    <div><span className="text-muted-foreground block mb-1">Expiry</span><span className="font-medium">{leaseData.expiry_date}</span></div>
                    <div><span className="text-muted-foreground block mb-1">Annual Rent</span><span className="font-medium">${Number(leaseData.annual_base_rent_year1).toLocaleString()}</span></div>
                  </div>
                </section>

                {/* Clause Highlights */}
                <section>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Key Clauses</h4>
                  <div className="space-y-6">
                    {['use_clause_text', 'exclusivity_clause_text', 'co_tenancy_clause_text', 'radius_restriction_clause_text', 'assignment_subletting_clause_text'].map(clauseKey => {
                      if (leaseData[clauseKey] && leaseData[clauseKey] !== "N/A" && leaseData[clauseKey].trim() !== '') {
                        return (
                          <div key={clauseKey} className="bg-muted/40 p-4 rounded-xl border border-muted">
                            <h5 className="font-semibold text-sm mb-2 capitalize">{clauseKey.replace('_clause_text', '').replace('_', ' ')}</h5>
                            <p className="text-sm leading-relaxed text-muted-foreground italic">"{leaseData[clauseKey]}"</p>
                          </div>
                        )
                      }
                      return null;
                    })}
                  </div>
                </section>
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
