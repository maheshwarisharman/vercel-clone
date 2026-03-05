import { Router } from "express";
import { prisma } from "@repo/db"

const router: Router = Router()

router.get('/all', async (req, res) => {
    //TODO: fetch the user id from auth token

    try {
        const projects = await prisma.project.findMany({
            where: {
                user_id: req.body.user_id
            }
        })
        res.status(200).json({
            message: "Projects fetched successfully",
            data: projects
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Some error occured",
            error: e
        })
    }
})


router.delete('/delete', async (req, res) => {

    try {
        const project = await prisma.project.delete({
            where: {
                project_id: req.body.project_id
            }
        })
        res.status(200).json({
            message: "Project deleted successfully",
            data: project
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Some error occured",
            error: e
        })
    }
})

export default router