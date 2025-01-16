"use server";
import { config } from "dotenv";
config();

import { db } from "./dbConfig";
import { Users, Webpages, Deployments } from "./schema";
import { desc, eq } from "drizzle-orm";
import { create } from "@web3-storage/w3up-client";
import { ethers } from "ethers";
import WebpageStorageABI from ".//WebpageStorage.json";
import * as Name from "w3name";

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
    // process.env.Smart_contract_Deployed_Address!,
    "0x7be8dD25efAC4e9DF5651FbABf9EAc71A5E6C8bE",
    WebpageStorageABI.abi,
    signer
  );
}

export async function getUserWebpages(userId: number | null) {
  if (userId === null) {
    return db
      .select()
      .from(Webpages)
      .leftJoin(Deployments, eq(Webpages.id, Deployments.webpageId))
      .orderBy(desc(Deployments.deployedAt))
      .execute();
  }
  return db
    .select()
    .from(Webpages)
    .where(eq(Webpages.userId, userId))
    .leftJoin(Deployments, eq(Webpages.id, Deployments.webpageId))
    .orderBy(desc(Deployments.deployedAt))
    .execute();
}

export async function uploadToWeb3Storage(content: string, filename: string) {
  if (!web3StorageClient) {
    throw new Error("Web3Storage client not initialized");
  }
  const file = new File([content], filename, { type: "text/html" });
  const cid = await web3StorageClient.uploadFile(file);
  return cid.toString();
}

export async function storeWebpageOnChain(domain: string, content: string) {
  console.log("firing web3 storage");
  if (!contract) {
    throw new Error("Contract not initialized");
  }
  const cid = await uploadToWeb3Storage(content, "index.html");
  const tx = await contract.storeWebpage(domain, cid);
  await tx.wait();
  return { txHash: tx.hash, cid };
}

export async function createWebpage(
  userId: string | any,
  domain: string,
  content: string
) {
  const { txHash, cid } = await storeWebpageOnChain(domain, content);
  const deploymentUrl = `https://${cid}.ipfs.w3s.link/`;

  const [webpage] = await db
    .insert(Webpages)
    .values({
      userId: parseInt(userId),
      domain,
      cid,
    })
    .returning()
    .execute();

  await db
    .insert(Deployments)
    .values({
      userId: parseInt(userId),
      webpageId: webpage.id,
      transactionHash: txHash,
      deploymentUrl,
    })
    .execute();

  return { webpage, txHash, cid, deploymentUrl };
}

export async function createWebpageWithName(
  userId: string | any,
  domain: string,
  content: string
) {
  const { webpage, txHash, cid, deploymentUrl } = await createWebpage(
    userId,
    domain,
    content
  );

  // Create a new name for this webpage
  const nameString = await createAndSaveName(parseInt(userId));

  // Update the webpage record with the name
  await db
    .update(Webpages)
    .set({ name: nameString })
    .where(eq(Webpages.id, webpage.id))
    .execute();

  // Publish the initial content to the name
  await updateNameContent(parseInt(userId), nameString, content);

  // Resolve the name to get the latest CID
  const resolvedCID = await resolveNameToCID(nameString);

  // Create the w3name URL using a public IPFS gateway
  const w3nameUrl = `https://${resolvedCID}.ipfs.dweb.link`;

  return { webpage, txHash, cid, deploymentUrl, name: nameString, w3nameUrl };
}

async function createAndSaveName(userId: number): Promise<string> {
  const name = await Name.create();
  const nameString = name.toString();

  // Save the key to localStorage
  localStorage.setItem(
    `w3name_${userId}_${nameString}`,
    JSON.stringify(Array.from(name.key.bytes))
  );

  return nameString;
}

async function updateNameContent(
  userId: number,
  nameString: string,
  newContent: string
): Promise<void> {
  // Load the key from localStorage
  const keyBytes = JSON.parse(
    localStorage.getItem(`w3name_${userId}_${nameString}`) || "[]"
  );
  const name = await Name.from(new Uint8Array(keyBytes));

  // Upload the new content to IPFS
  const cid = await uploadToWeb3Storage(newContent, "index.html");
  const value = `/ipfs/${cid}`;

  // Resolve the current revision
  let revision;
  try {
    revision = await Name.resolve(name);
  } catch (error) {
    // If there's no existing revision, create the initial one
    revision = await Name.v0(name, value);
  }

  // Create a new revision
  const nextRevision = await Name.increment(revision, value);

  // Publish the new revision
  await Name.publish(nextRevision, name.key);
}

async function resolveNameToCID(nameString: string): Promise<string> {
  const name = Name.parse(nameString);
  const revision = await Name.resolve(name);
  return revision.value.replace("/ipfs/", "");
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

export async function getUserIdByEmail(email: any): Promise<number | null> {
  try {
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1)
      .execute();

    return user.length > 0 ? user[0].id : null;
  } catch (error) {
    console.error("Error fetching user ID by email:", error);
    return null;
  }
}
