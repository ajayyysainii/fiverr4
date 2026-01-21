import { db } from "./db";
import { messages, apiKeys, users, cartItems, type Message, type InsertMessage, type ApiKey, type User, type CartItem, type InsertCartItem } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Messages
  createMessage(role: string, content: string): Promise<Message>;
  getMessages(limit?: number): Promise<Message[]>;
  clearMessages(): Promise<void>;
  
  // API Keys
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(name: string): Promise<ApiKey>;
  listApiKeys(): Promise<ApiKey[]>;
  deleteApiKey(id: number): Promise<void>;

  // Wallet & Cart
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  updateUserWallet(id: string, amount: number): Promise<User>;
  getCart(userId: string): Promise<CartItem[]>;
  addToCart(userId: string, item: InsertCartItem): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserWallet(id: string, amount: number): Promise<User> {
    const [user] = await db.update(users).set({ walletBalance: amount }).where(eq(users.id, id)).returning();
    return user;
  }

  async getCart(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(userId: string, item: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db.insert(cartItems).values({ ...item, userId }).returning();
    return cartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
  async createMessage(role: string, content: string): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ role, content })
      .returning();
    return message;
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.timestamp))
      .limit(limit);
  }

  async clearMessages(): Promise<void> {
      await db.delete(messages);
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }

  async createApiKey(name: string): Promise<ApiKey> {
    const key = `ak_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const [apiKey] = await db.insert(apiKeys).values({ key, name }).returning();
    return apiKey;
  }

  async listApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).orderBy(desc(apiKeys.id));
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }
}

export const storage = new DatabaseStorage();
