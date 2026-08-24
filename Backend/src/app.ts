import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    // origin: "http://localhost:5173",
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
    itemRouter
} from "./routes/routes.js"

app.use("/api/v1/user", userRoute)
app.use("/api/items", itemRouter)



export default app;