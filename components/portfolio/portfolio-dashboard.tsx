"use client"

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLeases, Lease } from '@/lib/retrieval';
import { Building2, FileText, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';

// Reusing fetching logic. Since we're client side, we should fetch from an API route.
// Let's create an API route to fetch all leases for the dashboard, or we can just fetch the static JSON.
// For now, let's fetch from the API. We'll need a /api/leases route.

export function PortfolioDashboard() {
  const [leases, setLeases] = React.useState<Lease[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedLease, setSelectedLease] = React.useState<Lease | null>(null);

  React.useEffect(() => {
    // Fetch leases.json directly from public dir, or we can build an API route.
    // Let's assume we build an API route /api/leases that returns all.
    fetch('/api/leases')
      .then(res => res.json())
      .then(data => {
        setLeases(data);
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading portfolio data...</div>;
  }

  // Calculate KPIs
  const totalLeases = leases.length;
  const totalGla = leases.reduce((sum, l) => sum + (Number(l.gla_sqft) || 0), 0);
  const totalRent = leases.reduce((sum, l) => sum + (Number(l.annual_base_rent_year1) || 0), 0);
  const activeLeases = leases.filter(l => l.lease_status && l.lease_status.includes('Active'));
  
  // Charts Data
  const provMap: Record<string, number> = {};
  leases.forEach(l => {
    if (l.province) {
      provMap[l.province] = (provMap[l.province] || 0) + 1;
    }
  });
  const provData = Object.entries(provMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const expMap: Record<string, number> = {};
  leases.forEach(l => {
    if (l.expiry_date) {
      const year = new Date(l.expiry_date).getFullYear().toString();
      if (!isNaN(Number(year))) {
        expMap[year] = (expMap[year] || 0) + 1;
      }
    }
  });
  const expData = Object.entries(expMap).map(([year, count]) => ({ year, count })).sort((a,b) => a.year.localeCompare(b.year));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Portfolio Dashboard</h1>
        <p className="text-muted-foreground">Analytics and raw data from the synthetic lease abstract corpus.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{activeLeases.length} currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GLA</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalGla / 1_000_000).toFixed(1)}M sf</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRent / 1_000_000).toFixed(1)}M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Indicator</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.6%</div>
            <p className="text-xs text-muted-foreground">Calibrated target</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Leases by Province</CardTitle>
            <CardDescription>Geographic distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expiry Timeline</CardTitle>
            <CardDescription>Number of leases expiring per year</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Roster</CardTitle>
          <CardDescription>All 1000 synthetic records. Click to view full abstract.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left text-muted-foreground">
                    <th className="font-medium p-3">Lease ID</th>
                    <th className="font-medium p-3">Property</th>
                    <th className="font-medium p-3">Tenant</th>
                    <th className="font-medium p-3">Prov</th>
                    <th className="font-medium p-3">GLA</th>
                    <th className="font-medium p-3">Expiry</th>
                    <th className="font-medium p-3 text-right">Rent</th>
                  </tr>
                </thead>
                <tbody>
                  {leases.slice(0, 50).map(lease => (
                    <tr 
                      key={lease.lease_id} 
                      onClick={() => setSelectedLease(lease)}
                      className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-medium">{lease.lease_id}</td>
                      <td className="p-3">{lease.property_name}</td>
                      <td className="p-3">{lease.tenant_legal_name}</td>
                      <td className="p-3">{lease.province}</td>
                      <td className="p-3">{Number(lease.gla_sqft).toLocaleString()} sf</td>
                      <td className="p-3">{lease.expiry_date}</td>
                      <td className="p-3 text-right">${Number(lease.annual_base_rent_year1).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t">
              Showing top 50 rows for performance in demo.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Details Drawer */}
      <Drawer open={!!selectedLease} onOpenChange={(open) => !open && setSelectedLease(null)} direction="right">
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-full sm:w-[450px] md:w-[600px] rounded-none">
          {selectedLease && (
            <>
              <DrawerHeader className="border-b bg-muted/30">
                <DrawerTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedLease.lease_id}
                </DrawerTitle>
                <DrawerDescription>
                  {selectedLease.property_name} • {selectedLease.tenant_legal_name}
                </DrawerDescription>
              </DrawerHeader>
              <ScrollArea className="p-6">
                <div className="space-y-8 pb-10">
                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">All Fields</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      {Object.entries(selectedLease).filter(([k, v]) => v && v !== 'N/A' && !k.includes('clause_text')).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-muted-foreground block mb-1 text-xs">{k}</span>
                          <span className="font-medium break-words">{v as string}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Clauses</h4>
                    <div className="space-y-4">
                      {Object.entries(selectedLease).filter(([k, v]) => v && v !== 'N/A' && k.includes('clause_text')).map(([k, v]) => (
                        <div key={k} className="bg-muted/40 p-4 rounded-xl border border-muted">
                          <h5 className="font-semibold text-sm mb-2 capitalize">{k.replace('_clause_text', '').replace(/_/g, ' ')}</h5>
                          <p className="text-sm leading-relaxed text-muted-foreground italic">"{v as string}"</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
