import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import { connectToDatabase } from '@/lib/db';
import WorkNote from '@/models/WorkNote';
import { Route } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Params { // Define the Params interface
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {  // Use NextRequest and Params
  try {
    await connectToDatabase();

    const workNote = await WorkNote.findById(params.id);

    if (!workNote) {
      return NextResponse.json(
        { error: 'Work note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workNote);
  } catch (error) {
    console.error('Error fetching work note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) { // Use NextRequest and Params
  try {
    const body = await request.json();

    await connectToDatabase();

    const updatedWorkNote = await WorkNote.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedWorkNote) {
      return NextResponse.json(
        { error: 'Work note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedWorkNote);
  } catch (error) {
    console.error('Error updating work note:', error);
    return NextResponse.json(
      { error: 'Failed to update work note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) { // Use NextRequest and Params
  try {
    await connectToDatabase();

    const deletedWorkNote = await WorkNote.findByIdAndDelete(params.id);

    if (!deletedWorkNote) {
      return NextResponse.json(
        { error: 'Work note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Work note deleted successfully' });
  } catch (error) {
    console.error('Error deleting work note:', error);
    return NextResponse.json(
      { error: 'Failed to delete work note' },
      { status: 500 }
    );
  }
}