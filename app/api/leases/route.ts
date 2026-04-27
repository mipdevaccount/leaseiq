import { getLeases } from '@/lib/retrieval';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const leases = getLeases();
    return NextResponse.json(leases);
  } catch (error) {
    console.error('Leases API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
