import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sport: string }> }
) {
    const { sport } = await params;

    try {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('isActive', true)
            .eq('sport', sport)
            .order('createdAt', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error fetching ${sport} matches:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
