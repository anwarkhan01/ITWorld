import express from "express"
import cors from "cors"
import { importProducts } from "./utils/importProducts.js"
import productRouter from "./routes/product.route.js"
import verifyToken from "./middlewares/verifyToken.middleware.js"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"
import helmet from "helmet"
import cartRouter from "./routes/cart.route.js"
const app = express()
app.use(express.json())
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    // credentials: true
}))

app.use("/api/cart", cartRouter)
app.use("/api/auth", authRouter);
app.use("/api/user", verifyToken, userRouter)
app.use("/api/products", productRouter)

app.post("/api/products/import", async (req, res) => {
    await importProducts();
    res.json({ message: "Import check complete" });
});
export default app;