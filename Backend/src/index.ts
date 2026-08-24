import "./env";
// import dotenv from "dotenv"
// dotenv.config(
//     { path: './.env' }
// )

import app from "./app.js"
import connectDB from "./DB/connectdb.js"
import ApiError from "./utils/apiError.js"

const data = {
message: 'Hello, this is a JSON response!',
status: 'success',
timestamp: new Date()
};

const startServer = async () => {
    try {
        await connectDB();
        app.get("/", (req, res) => {
            res.send("Alright!!").json({
                status: 200,
                message: "Every thing is fine",
                data
            })
        })

        console.log();


        const port = process.env.PORT
        if (!port) {
            throw new ApiError(404, "Port not found")
        }

        // console.log("SMTP Connected");

        // console.log("Test email sent");

        app.listen(port, () => {
            console.log("Server is running on", port);
        })
    } catch (error) {
        console.log("Failed to start the server", error);
        process.exit(1);
    }
}

startServer();