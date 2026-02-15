import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('isActive', true)
            .eq('status', 'UPCOMING')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching upcoming matches:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
