export interface BuildJob {
    id: number;
    repoName: string;
    repoUrl: string;
    gitToken?: string;
    buildCommand: string;
    buildOutDir: string;
}