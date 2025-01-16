import { config } from "dotenv";
config();

import { db } from "./dbConfig";
import { Users, Webpages, Deployments } from "./schema";
import { eq } from "drizzle-orm";
import { create } from "@web3-storage/w3up-client";
import { ethers } from "ethers";
import WebpageStorageABI from ".//WebpageStorage.json";

let web3StorageClient: any;
let contract: ethers.Contract;

export async function initializeClients(userEmail: string) {
  web3StorageClient = await create();

  // Authenticate and select a space using the user's email
  await web3StorageClient.login(userEmail);
  const spaces = await web3StorageClient.spaces(); // spaces is like a folder in web3storage
  if (spaces.length > 0) {
    await web3StorageClient.setCurrentSpace(spaces[0].did());
  } else {
    throw new Error("No spaces available. Please create a space first.");
  }

  const provider = new ethers.JsonRpcProvider("https://pre-rpc.bt.io/");
  const signer = await provider.getSigner();

  contract = new ethers.Contract(
    process.env.Smart_contract_Deployed_Address!,
    WebpageStorageABI.abi,
    signer
  );
}
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
