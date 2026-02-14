import express, { Express, Request, Response, Router } from "express";
import cors from 'cors'

//v1 Routes
import githubRoutes from './routes/githubRoutes.js'

const app: Express = express()
app.use(cors())
app.use(express.json())


app.get("/health", async (req: Request, res: Response) => {
    res.json({
        status: "ok",
        message: "Server is healthy"
    })
});

app.use('/api/v1/github', githubRoutes)

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});