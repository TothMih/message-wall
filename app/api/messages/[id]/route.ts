import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Érvénytelen azonosító.' }, { status: 400 });
  }

  const { error } = await supabaseServer.from('messages').delete().eq('id', numericId);

  if (error) {
    return NextResponse.json(
      { error: 'Nem sikerült törölni az üzenetet.' },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}