'use client';

import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2, CheckSquare, ListTodo, BarChart2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AuthForms } from "@/components/auth/AuthForms";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("azure-ad", { 
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const features = [
    {
      icon: ListTodo,
      title: "Task Tracking",
      description: "Keep track of your daily tasks and progress"
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Monitor hours spent on different projects"
    },
    {
      icon: BarChart2,
      title: "Analytics",
      description: "Visualize your productivity trends"
    },
    {
      icon: CheckSquare,
      title: "Progress Reports",
      description: "Generate detailed work reports instantly"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left Section - Features */}
      <div className="flex-1 p-8 md:p-16 flex items-center justify-center">
        <div className="max-w-xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Work Notes
            </h1>
            <p className="text-xl text-gray-600">
              Your personal workspace for efficient task management and productivity tracking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="p-4 bg-white/50 backdrop-blur border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <feature.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Sign In */}
      <div className="flex-1 p-8 md:p-16 flex items-center justify-center bg-white/30 backdrop-blur">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp ? 'Sign up to start tracking your work' : 'Sign in to access your workspace'}
            </p>
          </div>

          <AuthForms 
            onToggleForm={() => setIsSignUp(!isSignUp)} 
            isSignUp={isSignUp} 
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            className="w-full flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 h-12 text-lg"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 23 23"
                fill="none"
                className="w-5 h-5"
              >
                <path d="M11 4.5H4.5V11H11V4.5Z" fill="white" />
                <path d="M18.5 4.5H12V11H18.5V4.5Z" fill="white" />
                <path d="M11 12H4.5V18.5H11V12Z" fill="white" />
                <path d="M18.5 12H12V18.5H18.5V12Z" fill="white" />
              </svg>
            )}
            {isLoading ? "Connecting..." : "Continue with Microsoft"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Securely access your work notes and track your productivity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
