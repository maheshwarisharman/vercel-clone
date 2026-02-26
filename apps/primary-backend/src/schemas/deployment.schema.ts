import { z } from "zod";

export const createDeploymetSchema = z.object({
    repoName: z.string(),
    repoUrl: z.url(),
    buildCommand: z.string().optional(),
    buildOutDir: z.string().optional()
})

export const createNewProjectSchema = z.object({
    name: z.string(),
    description: z.string().optional,
    user_id: z.string(),
    github_url: z.url(),
    build_cmd: z.string(),
    output_dir: z.string(),
    build_branch: z.string(),
    primary_domain: z.string(),
    project_envs: z.record(z.string(), z.string()).optional()
})