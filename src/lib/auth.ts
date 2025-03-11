import { getServerSession, type NextAuthOptions } from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "./mongodb";
import { encrypt, decrypt } from "./encryption";
import { User } from "@/models/User";
import { VerificationToken } from "@/models/VerificationToken";
import bcrypt from "bcryptjs";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "Is Sign Up", type: "boolean" },
        otp: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const client = await clientPromise;

        if (credentials.isSignUp === 'true') {
          if (!credentials.name || !credentials.otp) {
            throw new Error('Name and OTP required for signup');
          }

          // Verify OTP
          const verificationToken = await VerificationToken.findOne({
            email: credentials.email,
            type: 'verification',
          });

          if (!verificationToken) {
            throw new Error('Invalid or expired verification token');
          }

          const decryptedToken = decrypt(verificationToken.token);
          if (decryptedToken !== credentials.otp) {
            throw new Error('Invalid OTP');
          }

          // Create new user
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const user = await User.create({
            email: credentials.email,
            password: hashedPassword,
            name: credentials.name,
            isVerified: true,
          });

          await verificationToken.deleteOne();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } else {
          // Login flow
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your email first');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        }
      },
    }),
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email offline_access"
        }
      },
      client: {
        token_endpoint_auth_method: "client_secret_post"
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.preferred_username || profile.email,
          image: null
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.access_token) {
          // Store user data and encrypted tokens
          const client = await clientPromise;
          const db = client.db('worknotes');
          const usersCollection = db.collection("users");
          // Store user with encrypted tokens
          const userData = {
            email: user.email,
            name: user.name,
            accessToken: encrypt(account.access_token),
            updatedAt: new Date()
          };
          
          await usersCollection.updateOne(
            { email: user.email },
            { $set: userData },
            { upsert: true }
          );
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
 
};

export const getAuthSession = () => getServerSession(authOptions);
