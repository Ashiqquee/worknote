import { NextResponse } from 'next/server';
import { VerificationToken } from '@/models/VerificationToken';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const verificationToken = await VerificationToken.findOne({
      email,
      type: 'reset',
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const decryptedToken = decrypt(verificationToken.token);
    if (decryptedToken !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    // Delete used token
    await verificationToken.deleteOne();

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
