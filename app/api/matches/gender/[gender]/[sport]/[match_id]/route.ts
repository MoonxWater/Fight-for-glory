import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ gender: string; sport: string; match_id: string }> }
) {
    const { gender, sport, match_id } = await params;

    try {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('isActive', true)
            .eq('gender', gender)
            .eq('sport', sport)
            .eq('id', match_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ message: 'Match not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching filtered match:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
