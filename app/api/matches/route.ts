import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// GET /api/matches - Fetch all active matches
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('isActive', true)
            .order('createdAt', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error.message || error,
            details: error
        }, { status: 500 });
    }
}

// POST /api/matches - Create a new match (Admin only)
export async function POST(req: NextRequest) {
    try {
        // Admin check
        const adminKey = req.headers.get('X-MACET-ADMIN');
        if (!adminKey || adminKey !== ADMIN_SECRET) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { teamA, teamB, sport, gender, venue, details, batchA, batchB, scoreA, scoreB } = body;

        // Validation
        if (!teamA || !teamB || !sport || !gender || !venue) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('matches')
            .insert([
                {
                    id: crypto.randomUUID(),
                    teamA,
                    teamB,
                    sport,
                    gender,
                    venue,
                    batchA,
                    batchB,
                    details: details || {},
                    scoreA: scoreA || 0,
                    scoreB: scoreB || 0,
                    status: 'UPCOMING',
                    isActive: true
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating match:', error);
        if (error.code === '23505') { // Unique constraint violation if any
            return NextResponse.json({ message: 'Match already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
