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
    // Try to find existing user by googleId
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, userData.googleId));

    if (existingUser) {
      // Update existing user
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
