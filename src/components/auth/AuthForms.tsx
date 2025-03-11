import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { Loader2, Mail, Lock, User, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthFormsProps {
  onToggleForm: () => void;
  isSignUp: boolean;
}

export function AuthForms({ onToggleForm, isSignUp }: AuthFormsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const result = await signIn('credentials', {
        email,
        password,
        isSignUp: 'false',
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!showOtpInput) {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error);
        }
        
        setShowOtpInput(true);
        toast.success('Verification code sent to your email');
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          name,
          otp,
          isSignUp: 'true',
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!showOtpInput) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error);
        }
        
        setShowOtpInput(true);
        toast.success('Password reset code sent to your email');
      } else {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword: password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error);
        }
        
        toast.success('Password reset successful');
        setShowResetForm(false);
        setShowOtpInput(false);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {showOtpInput ? 'Reset Your Password' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showOtpInput 
              ? 'Enter the verification code sent to your email and create a new password'
              : 'Enter your email address and we\'ll send you a verification code'}
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white"
                placeholder="Enter your email"
                required
                disabled={showOtpInput}
              />
            </div>
          </div>

          {showOtpInput && (
            <>
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 bg-white text-center tracking-[0.5em] font-mono"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Please enter the 6-digit code sent to your email
                  </p>
                </div>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white"
                    placeholder="Create a new password"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters
                </p>
              </div>
            </>
          )}

          <div className="space-y-4">
            <Button
              type="submit"
              className={cn(
                "w-full h-11 text-base font-medium transition-all duration-200",
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98]"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{showOtpInput ? 'Resetting password...' : 'Sending code...'}</span>
                </div>
              ) : (
                <span>{showOtpInput ? 'Reset Password' : 'Send Reset Code'}</span>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setShowResetForm(false);
                setShowOtpInput(false);
                setOtp('');
                setPassword('');
              }}
            >
              ← Back to Sign In
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>
      {showOtpInput && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-10 bg-white text-center tracking-[0.5em] font-mono"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Please enter the 6-digit code sent to your email
            </p>
          </div>
        </Card>
      )}
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-white"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-white"
            placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
            required
            minLength={8}
          />
        </div>
        {isSignUp && (
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters
          </p>
        )}
      </div>
      <Button
        type="submit"
        className={cn(
          "w-full h-11 text-base font-medium transition-all duration-200",
          isLoading
            ? "bg-indigo-400 cursor-not-allowed"
            : "bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98]"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{showOtpInput ? 'Verifying...' : isSignUp ? 'Creating account...' : 'Signing in...'}</span>
          </div>
        ) : (
          <span>
            {isSignUp
              ? (showOtpInput ? 'Complete Sign Up' : 'Create Account')
              : 'Sign In'}
          </span>
        )}
      </Button>
      <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm">
        <Button
          type="button"
          variant="ghost"
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          onClick={onToggleForm}
        >
          {isSignUp ? '← Back to Sign In' : 'Create an account →'}
        </Button>
        {!isSignUp && (
          <Button
            type="button"
            variant="ghost"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            onClick={() => setShowResetForm(true)}
          >
            Forgot password?
          </Button>
        )}
      </div>
    </form>
  );
}
