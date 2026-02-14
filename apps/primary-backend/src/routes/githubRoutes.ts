import { Request, Response, Router } from "express";
import { githubAuthSchema } from '../schemas/github.schema.js'
import { validate } from '../middleware/validate.middleware.js'
import axios from 'axios'
import { prisma } from '@repo/db'

const router: Router = Router()

interface githubTokenRes {
    success: boolean,
    message: string,
    data?: {
        access_token: string
    }
}

/*
 * PUT /auth - GitHub OAuth Authentication Route 
 * Exchanges a GitHub OAuth authorization code for an access token and stores it in the database.
 */
router.put('/auth', validate(githubAuthSchema), async (req: Request, res: Response) => {    
    const { code, user_id } = req.body

    try {
        const githubTokenRes: githubTokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )

        const accessToken = githubTokenRes.data?.access_token
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                error: 'No Access Token Found, Unauthorised'
            })
        }
        //Save the token to DB
        const resFromDB: boolean = await saveTokenToDB(user_id, accessToken)
        if (resFromDB) {
            return res.status(200).json({
                success: true,
                message: "User Access Token updated successfully"
            })
        }

        return res.status(404).json({
            success: false,
            message: "User Id cannot be found"
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e
        })
    }

})

const saveTokenToDB = async (user_id: string, code: string): Promise<boolean> => {

    try {
        //Try Updating the user row with the access code
        await prisma.user.update({
            where: {
                id: user_id
            },
            data: {
                github_access_token: code
            }
        })

        return true
    } catch (e) {
        console.log(e);
        return false
    }

}

export default router