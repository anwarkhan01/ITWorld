import express from "express"
import cors from "cors"
import { getProducts } from "./utils/getProducts.js"
import ApiResponse from "./utils/ApiResponse.js"
import { importProducts } from "./utils/importProducts.js"
import productRouter from "./routes/product.route.js"
const app = express()
console.log("FRONTEND_URL", process.env.FRONTEND_URL)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    // credentials: true
}))

app.use("/api/products", productRouter)

app.post("/api/products/import", async (req, res) => {
    await importProducts();
    res.json({ message: "Import check complete" });
});
export default app;