import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "content_required")
    .max(1000, "content_too_long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
