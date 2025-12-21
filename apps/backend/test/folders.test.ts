import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { auth } from "../src/auth";
import { GeorulesClient } from "@georules/core";

const PORT = 3001 + Math.floor(Math.random() * 1000);
const BASE_URL = `http://localhost:${PORT}`;

describe("Folders Integration Tests", () => {
  let server: any;
  let client: GeorulesClient;
  let token: string;
  let user: any;

  beforeAll(async () => {
    // Start the server.
    server = app.listen(PORT);
    console.log(`Test server running at ${BASE_URL}.`);

    // Create a new user with a random email.
    const email = `test-${crypto.randomUUID()}@example.com`;
    const password = "password123";
    const name = "Test User";

    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!signUpResponse) {
      throw new Error("Failed to sign up test user.");
    }

    // Login to get the token.
    const signInResponse = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!signInResponse || !signInResponse.token) {
      throw new Error("Failed to sign in test user.");
    }

    token = signInResponse.token;
    user = signInResponse.user;

    // Initialize the client with the token.
    client = new GeorulesClient(BASE_URL, {
      token,
    });
  });

  afterAll(() => {
    if (server) {
      server.stop();
    }
  });

  it("should create a new folder", async () => {
    const newFolder = {
      name: "My First Folder",
      parentId: null,
    };

    const created = await client.createFolder(newFolder);

    expect(created).toBeDefined();
    expect(created.name).toBe(newFolder.name);
    expect(created.id).toBeDefined();
    expect(created.ownerId).toBe(user.id);
  });

  it("should get all folders", async () => {
    const folders = await client.getFolders();
    expect(Array.isArray(folders)).toBe(true);
    expect(folders.length).toBeGreaterThan(0);
  });

  it("should get a single folder by ID", async () => {
    const folders = await client.getFolders();
    const firstFolder = folders[0];

    const fetched = await client.getFolder(firstFolder.id);
    expect(fetched.id).toBe(firstFolder.id);
    expect(fetched.name).toBe(firstFolder.name);
  });

  it("should update a folder", async () => {
    const folders = await client.getFolders();
    const folderToUpdate = folders[0];

    const updatedName = "Updated Folder " + Date.now();
    const updated = await client.updateFolder(folderToUpdate.id, {
      name: updatedName,
    });

    expect(updated.id).toBe(folderToUpdate.id);
    expect(updated.name).toBe(updatedName);

    // Verify persistence.
    const fetched = await client.getFolder(folderToUpdate.id);
    expect(fetched.name).toBe(updatedName);
  });

  it("should fail to update a non-existent folder", async () => {
    try {
      await client.updateFolder("non-existent-id", { name: "new" });
      throw new Error("Should have thrown 404.");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });

  it("should delete a folder", async () => {
    // Create a temp folder to delete.
    const tempFolder = await client.createFolder({
      name: "Delete Me",
      parentId: null,
    });

    const deleted = await client.deleteFolder(tempFolder.id);
    expect(deleted.success).toBe(true);
    expect(deleted.id).toBe(tempFolder.id);

    // Verify it's gone.
    try {
      await client.getFolder(tempFolder.id);
      throw new Error("Should have thrown 404.");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });

  it("should fail to delete a non-existent folder", async () => {
    try {
      await client.deleteFolder("non-existent-id");
      throw new Error("Should have thrown 404.");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });

  it("should fail to get a non-existent folder", async () => {
    try {
      await client.getFolder("non-existent-id");
      throw new Error("Should have thrown 404.");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });
});
