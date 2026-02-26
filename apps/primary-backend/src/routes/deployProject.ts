import { Router } from "express";
import { prisma } from '@repo/db'
import { validate } from '../middleware/validate.middleware.js'
import { createDeploymetSchema } from "../schemas/deployment.schema.js";


const router: Router = Router()

