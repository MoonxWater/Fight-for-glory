import { NextRequest, NextResponse } from 'next/server';

const BOYS_SPORTS = [
    'Cricket', 'Football', 'Volleyball', 'Carrom', 'Kabaddi',
    'Badminton', 'Chess', 'Race', 'Tug of War', 'Kho-Kho',
    'Musical Chair', 'LUDO'
];

const GIRLS_SPORTS = [
    'Cricket', 'Football', 'Volleyball', 'Carrom', 'Kabaddi',
    'Badminton', 'Chess', 'Race', 'Tug of War', 'Kho-Kho',
    'Musical Chair', 'LUDO', 'Needle & Thread', 'Spoon Race',
    'Shot Put', 'Skipping'
];

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ gender: string }> }
) {
    const { gender } = await params;

    if (gender === 'boys') {
        return NextResponse.json({ games: BOYS_SPORTS });
    } else if (gender === 'girls') {
        return NextResponse.json({ games: GIRLS_SPORTS });
    } else {
        return NextResponse.json({ message: 'Invalid gender' }, { status: 400 });
    }
}
