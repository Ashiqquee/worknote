import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Account } from "next-auth";
import type { AdapterSession, AdapterUser } from "next-auth/adapters";
import clientPromise from "./mongodb";
import { encrypt, decrypt } from "./encryption";

export function createMongoDBAdapter() {
  return {
    ...MongoDBAdapter(clientPromise),
    async createSession(data: AdapterSession): Promise<AdapterSession> {
      const client = await clientPromise;
      const sessionsCollection = client.db().collection("sessions");
      
      // Create the session document with encrypted token
      const sessionDoc = {
        sessionToken: data.sessionToken ? encrypt(data.sessionToken) : data.sessionToken,
        userId: data.userId,
        expires: data.expires
      };
      
      await sessionsCollection.insertOne(sessionDoc);
      
      // Return the original unencrypted session data
      return data;
    },
    
    async getSessionAndUser(sessionToken: string): Promise<{ user: AdapterUser; session: AdapterSession } | null> {
      const client = await clientPromise;
      const sessionsCollection = client.db().collection("sessions");
      const usersCollection = client.db().collection("users");
      
      const session = await sessionsCollection.findOne({ 
        sessionToken: encrypt(sessionToken)
      });
      
      if (!session) return null;
      
      const user = await usersCollection.findOne({ _id: session.userId });
      if (!user) return null;
      
      // Transform MongoDB user document to AdapterUser
      const adapterUser: AdapterUser = {
        id: user._id.toString(),
        email: user.email,
        emailVerified: user.emailVerified || null,
        name: user.name || null,
        image: user.image || null
      };

      // Transform MongoDB session document to AdapterSession
      const adapterSession: AdapterSession = {
        sessionToken: decrypt(session.sessionToken),
        userId: session.userId.toString(),
        expires: session.expires,
      };

      return {
        user: adapterUser,
        session: adapterSession
      };
    },
    
    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">): Promise<AdapterSession | null | undefined> {
      const client = await clientPromise;
      const sessionsCollection = client.db().collection("sessions");
      
      const originalSessionToken = session.sessionToken;
      if (session.sessionToken) {
        session.sessionToken = encrypt(session.sessionToken);
      }
      
      try {
        const result = await sessionsCollection.findOneAndUpdate(
          { sessionToken: encrypt(originalSessionToken) },
          { $set: session },
          { returnDocument: "after" }
        );
        
        if (!result?.value) return null;
        
        // Transform MongoDB session document to AdapterSession
        const updatedSession: AdapterSession = {
          sessionToken: originalSessionToken,
          userId: result.value.userId.toString(),
          expires: result.value.expires
        };
        
        return updatedSession;
      } catch (error) {
        console.error('Error updating session:', error);
        return null;
      }
    },
    
    async linkAccount(account: Account) {
      const client = await clientPromise;
      const accountsCollection = client.db().collection("accounts");
      
      // Encrypt sensitive tokens
      if (account.refresh_token) {
        account.refresh_token = encrypt(account.refresh_token);
      }
      if (account.access_token) {
        account.access_token = encrypt(account.access_token);
      }
      
      await accountsCollection.insertOne(account);
      return account;
    },
    
    async getAccount(providerAccountId: Pick<Account, "provider" | "providerAccountId">) {
      const client = await clientPromise;
      const accountsCollection = client.db().collection("accounts");
      
      const account = await accountsCollection.findOne(providerAccountId);
      
      if (!account) return null;
      
      // Decrypt sensitive tokens
      if (account.refresh_token) {
        account.refresh_token = decrypt(account.refresh_token);
      }
      if (account.access_token) {
        account.access_token = decrypt(account.access_token);
      }
      
      return account;
    }
  };
}
