export interface BuildJob {
    id: string;
    repoName: string;
    repoUrl: string;
    gitToken?: string;
    buildCommand: string;
    buildOutDir: string;
}