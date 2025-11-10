import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/dbConnection.js";

dotenv.config()

connectDB()
    .then(async () => {
        app.listen(process.env.PORT || 8000, () => {
            console.log("Server is running on port:", process.env.PORT)
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Failed", err)
    })