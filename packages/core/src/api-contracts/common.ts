import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.string(),
  status: z.number(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
