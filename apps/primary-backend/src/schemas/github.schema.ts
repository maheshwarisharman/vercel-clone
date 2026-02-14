import { z } from "zod";

export const githubAuthSchema = z.object({
        code: z.string(),
        user_id: z.string()
})