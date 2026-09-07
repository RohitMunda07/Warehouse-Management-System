import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.urlencoded({ limit: "20kb", extended: true }))
app.use(express.static("public"))
app.use(express.json({ limit: "20kb" }))
app.use(cookieParser())

// ------- routes import -------
import {
    userRoute,
    itemRouter,
    categoryRouter
} from "./routes/routes.js"

// ------- API Routes -------
app.use("/api/v1/users", userRoute)
app.use("/api/v1/items", itemRouter)
app.use("/api/v1/categories", categoryRouter)

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: 200,
        message: "Server is running",
        timestamp: new Date()
    })
})

export default app;