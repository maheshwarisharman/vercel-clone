import { z } from "zod";

export const createDeploymetSchema = z.object({
    repoName: z.string(),
    repoUrl: z.url(),
    buildCommand: z.string().optional(),
    buildOutDir: z.string().optional()
})