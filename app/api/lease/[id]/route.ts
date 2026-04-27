import { getLeases } from '@/lib/retrieval';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Lease ID is required' }, { status: 400 });
    }

    const leases = getLeases();
    const lease = leases.find(l => l.lease_id === id);

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    return NextResponse.json(lease);
  } catch (error) {
    console.error('Lease API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
