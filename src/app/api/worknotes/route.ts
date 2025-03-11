import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import WorkNote from '@/models/WorkNote';
import { getAuthSession } from '@/lib/auth';

interface WorkNoteQuery {
  userId: string;
  projectName?: string;
  date?: {
    $gte: Date;
    $lte: Date;
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectName = searchParams.get('projectName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 503 }
      );
    }
    
    // Build query based on provided filters
    const query: WorkNoteQuery = {
      userId: session.user.id
    };
    
    if (projectName && projectName !== 'all') {
      query.projectName = projectName;
    }
    
    if (startDate && endDate) {
      try {
        // Parse dates and set consistent times for start and end
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format');
        }
        
        query.date = {
          $gte: start,
          $lte: end
        };
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid date parameters', details: 'Please provide valid date values' },
          { status: 400 }
        );
      }
    }
    
    const workNotes = await WorkNote.find(query).sort({ date: -1 });
    return NextResponse.json(workNotes);
    
  } catch (error) {
    console.error('Error fetching work notes:', error);
    
    // Specific error handling for Mongoose errors
    if (error instanceof Error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
      
      if (error instanceof mongoose.Error.CastError) {
        return NextResponse.json(
          { error: 'Invalid data format', details: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch work notes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    const workNote = new WorkNote({
      ...body,
      userId: session.user.id,
      userEmail: session.user.email
    });

    await workNote.save();
    return NextResponse.json(workNote, { status: 201 });
  } catch (error) {
    console.error('Error creating work note:', error);
    return NextResponse.json(
      { error: 'Failed to create work note' },
      { status: 500 }
    );
  }
}
