import { execa } from 'execa';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const BUILDER_IMAGE = 'build-worker:latest';
const CONTAINER_WORKSPACE = '/workspace';


export async function runBuildInContainer(job) {

    const containerId = `build-${randomUUID()}`;
    const repoDir = `${CONTAINER_WORKSPACE}/${job.repoName}`;

    const localArtifactPath = path.join(os.tmpdir(), containerId);

    try {

        await execa('docker', [
            'run',
            '--detach',
            '--name', containerId,
            '--memory', '2g',
            '--cpus', '1.5g',
            '--network', 'none',
            '--security-opt', 'no-new-privileges',
            BUILDER_IMAGE,
            'sleep', 'infinity'
        ]) 

        const cloneUrl = buildAuthenticatedUrl(job.repoUrl, job.gitToken);

    } catch (e) {

    }

}

export function buildAuthenticatedUrl(repoUrl: string, gitToken: string): string {

    if (!gitToken) return repoUrl;
    const url = new URL(repoUrl);
    url.username = gitToken;
    return url.toString();

}