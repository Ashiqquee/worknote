import { NextResponse } from 'next/server';
import { createVerificationToken, sendVerificationEmail } from '@/lib/email';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser?.isVerified) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Generate and store verification token
    const token = await createVerificationToken(email, 'verification');
    
    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: 'Verification email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
