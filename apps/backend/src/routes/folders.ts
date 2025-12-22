import { Elysia, t } from "elysia";
import { db } from "@georules/database";
import { folders } from "@georules/core";
import {
  ErrorResponseSchema,
  FolderCreateBodySchema,
  FolderResponseSchema,
  FolderUpdateBodySchema,
} from "@georules/core/api-contracts";
import { and, desc, eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import z from "zod";

export const foldersRouter = new Elysia({ prefix: "/folders" })
  .use(authMiddleware)
  // GET /api/folders/mine
  .get("/mine", async ({ user }) => {
    const userFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.ownerId, user.id))
      .orderBy(desc(folders.createdAt));

    return userFolders;
  }, {
    response: {
      200: z.array(FolderResponseSchema),
    },
    betterAuthGuard: true,
  })
  // POST /api/folders/new
  .post("/new", async ({ body, user }) => {
    const { name, parentId } = body;

    const [newFolder] = await db.insert(folders).values({
      id: crypto.randomUUID(),
      name,
      parentId: parentId ?? null,
      ownerId: user.id,
    }).returning();

    return newFolder;
  }, {
    body: FolderCreateBodySchema,
    response: {
      200: FolderResponseSchema,
    },
    betterAuthGuard: true,
  })
  // GET /api/folders/:id
  .get("/:id", async ({ params: { id }, user, status }) => {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.ownerId, user.id)));

    if (!folder) {
      return status(404, { error: "Not found.", status: 404 });
    }
    return folder;
  }, {
    params: t.Object({
      id: t.String(),
    }),
    response: {
      200: FolderResponseSchema,
      404: ErrorResponseSchema,
    },
    betterAuthGuard: true,
  })
  // PUT /api/folders/:id
  .put("/:id", async ({ params: { id }, body, user, status }) => {
    const [existing] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.ownerId, user.id)));

    if (!existing) {
      return status(404, { error: "Not found.", status: 404 });
    }

    const [updated] = await db.update(folders)
      .set({
        ...body,
      })
      .where(eq(folders.id, id))
      .returning();

    return updated;
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: FolderUpdateBodySchema,
    response: {
      200: FolderResponseSchema,
      404: ErrorResponseSchema,
    },
    betterAuthGuard: true,
  })
  // DELETE /api/folders/:id
  .delete("/:id", async ({ params: { id }, user, status }) => {
    try {
      const [deleted] = await db
        .delete(folders)
        .where(and(eq(folders.id, id), eq(folders.ownerId, user.id)))
        .returning();

      if (!deleted) {
        return status(404, { error: "Not found.", status: 404 });
      }
      return { success: true, id };
    } catch (e) {
      return status(400, {
        error: "Cannot delete folder with items.",
        status: 400,
      });
    }
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
      400: ErrorResponseSchema,
    },
    betterAuthGuard: true,
  });
