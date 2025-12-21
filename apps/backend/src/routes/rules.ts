import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { db } from "@georules/database";
import { rules } from "@georules/core";
import { and, desc, eq } from "drizzle-orm";
import {
  ErrorResponseSchema,
  RuleCreateBodySchema,
  RuleResponseSchema,
  RuleUpdateBodySchema,
} from "@georules/core/api-contracts";
import z from "zod";

export const rulesRouter = new Elysia({ prefix: "/rules" })
  .use(authMiddleware)
  // GET /api/rules/mine
  .get("/mine", async ({ user }) => {
    const userRules = await db
      .select()
      .from(rules)
      .where(eq(rules.ownerId, user.id))
      .orderBy(desc(rules.createdAt));

    return userRules;
  }, {
    response: {
      200: z.array(RuleResponseSchema),
    },
    betterAuthGuard: true,
  })
  // POST /api/rules/new
  .post("/new", async ({ body, user }) => {
    const { title, content, folderId, slug, metadata } = body;

    const [newRule] = await db.insert(rules).values({
      id: crypto.randomUUID(),
      title,
      content,
      slug,
      folderId: folderId === "ROOT" || folderId === null ? null : folderId,
      ownerId: user.id,
      createdAt: new Date(),
      metadata: metadata ?? {},
    }).returning();

    return newRule;
  }, {
    body: RuleCreateBodySchema,
    response: {
      200: RuleResponseSchema,
    },
    betterAuthGuard: true,
  })
  .get("/:id", async ({ params: { id }, user, status }) => {
    const [rule] = await db
      .select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.ownerId, user.id)));

    if (!rule) {
      return status(404, { error: "Not found.", status: 404 });
    }
    return rule;
  }, {
    params: t.Object({
      id: t.String(),
    }),
    betterAuthGuard: true,
    response: {
      200: RuleResponseSchema,
      404: ErrorResponseSchema,
    },
  })
  // PUT /api/rules/:id
  .put("/:id", async ({ params: { id }, body, user, status }) => {
    const [existing] = await db
      .select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.ownerId, user.id)));

    if (!existing) {
      return status(404, { error: "Not found.", status: 404 });
    }

    const [updated] = await db.update(rules)
      .set({
        ...body,
      })
      .where(eq(rules.id, id))
      .returning();

    return updated;
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: RuleUpdateBodySchema,
    response: {
      200: RuleResponseSchema,
      404: ErrorResponseSchema,
    },
    betterAuthGuard: true,
  })
  // DELETE /api/rules/:id
  .delete("/:id", async ({ params: { id }, user, status }) => {
    const [deleted] = await db
      .delete(rules)
      .where(and(eq(rules.id, id), eq(rules.ownerId, user.id)))
      .returning();

    if (!deleted) {
      return status(404, { error: "Not found.", status: 404 });
    }
    return { success: true, id };
  }, {
    params: t.Object({
      id: t.String(),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        id: t.String(),
      }),
      404: ErrorResponseSchema,
    },
    betterAuthGuard: true,
  });
