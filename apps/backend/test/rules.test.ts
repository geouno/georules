import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { auth } from "../src/auth";
import { GeorulesClient } from "@georules/core";

const PORT = 3001 + Math.floor(Math.random() * 1000);
const BASE_URL = `http://localhost:${PORT}`;

describe("Rules Integration Tests", () => {
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

  it("should create a new rule", async () => {
    const newRule = {
      title: "My First Rule",
      slug: `rule-${crypto.randomUUID()}`,
      content: "rule content",
      metadata: { key: "value" },
    };

    const created = await client.createRule(newRule);

    expect(created).toBeDefined();
    expect(created.title).toBe(newRule.title);
    expect(created.slug).toBe(newRule.slug);
    expect(created.id).toBeDefined();
    expect(created.ownerId).toBe(user.id);
  });

  it("should get all rules", async () => {
    const rules = await client.getRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it("should get a single rule by ID", async () => {
    const rules = await client.getRules();
    const firstRule = rules[0];

    const fetched = await client.getRule(firstRule.id);
    expect(fetched.id).toBe(firstRule.id);
    expect(fetched.title).toBe(firstRule.title);
  });

  it("should update a rule", async () => {
    const rules = await client.getRules();
    const ruleToUpdate = rules[0];

    const updatedContent = "Updated content " + Date.now();
    const updated = await client.updateRule(ruleToUpdate.id, {
      content: updatedContent,
    });

    expect(updated.id).toBe(ruleToUpdate.id);
    expect(updated.content).toBe(updatedContent);

    // Verify persistence.
    const fetched = await client.getRule(ruleToUpdate.id);
    expect(fetched.content).toBe(updatedContent);
  });

  it("should fail to update a non-existent rule", async () => {
    try {
      await client.updateRule("non-existent-id", { content: "new" });
      throw new Error("Should have thrown 404.");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });

  it("should delete a rule", async () => {
    // Create a temp rule to delete.
    const tempRule = await client.createRule({
      title: "Delete Me",
      slug: `delete-${crypto.randomUUID()}`,
      content: "delete me",
    });

    const deleted = await client.deleteRule(tempRule.id);
    expect(deleted.success).toBe(true);
    expect(deleted.id).toBe(tempRule.id);

    // Verify it's gone.
    try {
      await client.getRule(tempRule.id);
      throw new Error("Should have thrown 404.");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });

  it("should fail to delete a non-existent rule", async () => {
    try {
      await client.deleteRule("non-existent-id");
      throw new Error("Should have thrown 404");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });

  it("should fail to get a non-existent rule", async () => {
    try {
      await client.getRule("non-existent-id");
      throw new Error("Should have thrown 404");
    } catch (e: any) {
      expect(e.message).toContain("404");
    }
  });
});
