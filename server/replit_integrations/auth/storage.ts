import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  upsertUserByGoogleId(userData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  }): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async upsertUserByGoogleId(userData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  }): Promise<User> {
    // Try to find existing user by googleId first
    const [existingUserByGoogleId] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, userData.googleId));

    if (existingUserByGoogleId) {
      // Update existing user found by googleId
      const [updatedUser] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.googleId, userData.googleId))
        .returning();
      return updatedUser;
    }

    // Check if user exists with the same email (may have signed up differently before)
    const [existingUserByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUserByEmail) {
      // Link existing email user with Google account
      const [updatedUser] = await db
        .update(users)
        .set({
          googleId: userData.googleId,
          firstName: userData.firstName || existingUserByEmail.firstName,
          lastName: userData.lastName || existingUserByEmail.lastName,
          profileImageUrl: userData.profileImageUrl || existingUserByEmail.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email))
        .returning();
      return updatedUser;
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        googleId: userData.googleId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      })
      .returning();
    return newUser;
  }
}

export const authStorage = new AuthStorage();
