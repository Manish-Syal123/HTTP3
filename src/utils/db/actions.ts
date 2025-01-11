import { config } from "dotenv";
config();

import { db } from "./dbConfig";
import { Users, Webpages, Deployments } from "./schema";
import { eq } from "drizzle-orm";

export async function createOrUpdateUser(address: string, email: string) {
  try {
    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.address, address))
      .execute();

    const now = new Date();

    if (existingUser.length > 0) {
      const [updatedUser] = await db
        .update(Users)
        .set({
          email: email,
          updatedAt: now,
          lastLogin: now,
        })
        .where(eq(Users.address, address))
        .returning()
        .execute();
      return updatedUser;
    } else {
      const [newUser] = await db
        .insert(Users)
        .values({
          address: address,
          email: email,
          createdAt: now,
          updatedAt: now,
          lastLogin: now,
        })
        .returning()
        .execute();

      return newUser;
    }
  } catch (error) {
    console.error("Error creating or updating user:", error);
    return null;
  }
}
