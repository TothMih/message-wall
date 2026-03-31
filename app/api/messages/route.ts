import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';
type CreateMessageBody = {
  content?: string;
};

export async function GET() {
  const { data, error } = await supabaseServer
    .from('messages')
    .select('id, content, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Nem sikerült lekérni az üzeneteket.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateMessageBody;
  const content = body.content?.trim();

  if (!content) {
    return NextResponse.json(
      { error: 'Az üzenet nem lehet üres.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('messages')
    .insert([{ content }])
    .select('id, content, created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Nem sikerült elmenteni az üzenetet.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}