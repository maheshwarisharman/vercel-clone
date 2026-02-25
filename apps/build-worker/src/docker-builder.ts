import { execa } from 'execa';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import type { BuildJob } from './types.js';
import { uploadDirectoryToS3 } from './upload-on-s3.js'

const BUILDER_IMAGE = 'build-worker:latest';
const CONTAINER_WORKSPACE = '/workspace';


export async function runBuildInContainer(job: BuildJob) {

    const containerId = `build-${randomUUID()}`;
    const repoDir = `${CONTAINER_WORKSPACE}/${job.repoName}`;

    const localArtifactPath = path.join(os.tmpdir(), containerId);

    try {

        await execa('docker', [
            'run',
            '--detach',
            '--name', containerId,
            '--memory', '2g',
            '--cpus', '1.5',
            '--security-opt', 'no-new-privileges',
            BUILDER_IMAGE,
            'sleep', 'infinity'
        ]) 

        const cloneUrl = buildAuthenticatedUrl(job.repoUrl, job?.gitToken)

        //Clone the Git Repo inside running container
        await dockerExec(containerId, [
            'git', 'clone',
            '--depth', '1',
            '--single-branch',
            cloneUrl,
            repoDir,
        ])

        //install all the node dependencies
        await dockerExec(containerId, [
        'npm', 'ci',         
        '--prefix', repoDir,
        ])

        //Run the Actual Build CMD
        await dockerExec(containerId, [
        'npm', 'run', job.buildCommand,
        '--prefix', repoDir,
        ])



        const artifactDirInContainer = `${repoDir}/${job.buildOutDir}`;
        await fs.mkdir(localArtifactPath, { recursive: true });
    
        await execa('docker', [
        'cp',
        `${containerId}:${artifactDirInContainer}`,
        localArtifactPath,
        ]);

        console.log("Artifacts are copied to:- ", path.join(localArtifactPath, job.buildOutDir))
        const tmpPath = path.join(localArtifactPath, job.buildOutDir);

        const uploadStatus = await uploadDirectoryToS3(tmpPath, job.id, 'vercelclone-test')
        if(uploadStatus) {
          return console.log("Directly Uploaded to s3 successfully!")
        }
        return console.error("Upload Failed")
        
    } catch (e) {

        console.error("There was some error in building the project:- ", e)

    } finally {

        await cleanupContainer(containerId);

    }

}

async function dockerExec(containerId: string, cmd: string[]) {
  const result = await execa('docker', ['exec', containerId, ...cmd], {
    all: true, 
  }).catch(err => {
    // Re-throw with more context for upstream error handling
    throw new Error(
      `docker exec [${cmd[0]}] failed in container ${containerId}:\n${err.all}`
    );
  });

  return result;
}

async function cleanupContainer(containerId: string) {
  try {
    await execa('docker', ['rm', '--force', containerId]);
  } catch {
    console.warn(`[docker] Failed to remove container ${containerId} — may need manual cleanup`);
  }
}

function buildAuthenticatedUrl(repoUrl: string, gitToken?: string): string {

    if (!gitToken) return repoUrl;
    const url = new URL(repoUrl);
    url.username = gitToken;
    return url.toString();

}