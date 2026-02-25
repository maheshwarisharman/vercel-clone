require('dotenv').config()
import { runBuildInContainer } from "./docker-builder.js";

runBuildInContainer({
    id: "2g",
    repoName: "Test",
    repoUrl: "https://github.com/maheshwarisharman/7398rfdjk",
    gitToken: process.env.GIT_TOKEN_SHARMAN,
    buildCommand: "build",
    buildOutDir: "dist"
})