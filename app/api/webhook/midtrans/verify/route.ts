import { NextResponse } from 'next/server';
import { syncPaymentStatus } from '@/app/actions/order';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const result = await syncPaymentStatus(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Verify payment endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
