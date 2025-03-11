import { NextResponse } from 'next/server';
import { createVerificationToken, sendPasswordResetEmail } from '@/lib/email';
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 400 }
      );
    }

    // Generate and store reset token
    const token = await createVerificationToken(email, 'reset');
    
    // Send reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}
