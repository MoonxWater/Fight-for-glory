import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// GET /api/matches/[match_id] - Fetch details of a specific match
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ match_id: string }> }
) {
    const { match_id } = await params;

    try {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
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
        console.error('Error fetching match details:', error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error.message || error,
            details: error
        }, { status: 500 });
    }
}

// PUT /api/matches/[match_id] - Update match (scores, status, details, venue) - Admin only
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ match_id: string }> }
) {
    const { match_id } = await params;
    console.log('PUT request received for match_id:', match_id);

    try {
        // Admin check
        const adminKey = req.headers.get('X-MACET-ADMIN');
        if (!adminKey || adminKey !== ADMIN_SECRET) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { scoreA, scoreB, status, details, venue, batchA, batchB } = body;

        // Build update object
        const updates: any = {};
        if (scoreA !== undefined) updates.scoreA = scoreA;
        if (scoreB !== undefined) updates.scoreB = scoreB;
        if (status) updates.status = status;
        if (details) updates.details = details;
        if (venue) updates.venue = venue;
        if (batchA !== undefined) updates.batchA = batchA;
        if (batchB !== undefined) updates.batchB = batchB;
        updates.updatedAt = new Date().toISOString();

        console.log('Update payload:', updates);
        console.log('Target match_id:', match_id);

        const { error } = await supabase
            .from('matches')
            .update(updates)
            .eq('id', match_id);

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        return NextResponse.json({ message: 'Match updated successfully', id: match_id });
    } catch (error: any) {
        console.error('Error updating match:', error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error.message || error,
            details: error
        }, { status: 500 });
    }
}

// DELETE /api/matches/[match_id] - Soft-delete a match (Admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ match_id: string }> }
) {
    const { match_id } = await params;

    try {
        // Admin check
        const adminKey = req.headers.get('X-MACET-ADMIN');
        if (!adminKey || adminKey !== ADMIN_SECRET) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('matches')
            .update({ isActive: false, updatedAt: new Date().toISOString() })
            .eq('id', match_id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ message: 'Match not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({ message: 'Match soft-deleted' });
    } catch (error: any) {
        console.error('Error deleting match:', error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error.message || error,
            details: error
        }, { status: 500 });
    }
}
