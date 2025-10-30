import express from "express"
import cors from "cors"
import productRouter from "./routes/product.route.js"
import authRouter from "./routes/auth.route.js"
import helmet from "helmet"
import cartRouter from "./routes/cart.route.js"
import ApiError from "./utils/ApiError.js"

const app = express()
app.use(express.json())
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL,
}))

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter)
app.use("/api/products", productRouter)

app.use("/", (req, res, next) => {
    next(
        new ApiError(
            404,
            `Route not found: [${req.method}] ${req.originalUrl}. Please check if the endpoint exists or if there is a typo in the URL.`,
        )
    );
});

function cleanStack(stack) {
    if (!stack) return undefined;
    return stack
        .split("\n")
        .filter(line => line.includes("/src/"))
        .map(line => {
            const match = line.match(/at\s+(?:.*?)([^\/]+\/src\/.+?:\d+:\d+)/);
            return match ? match[1] : line.trim();
        })
        .filter(Boolean)
        .join("\n");
}

app.use((err, req, res, next) => {
    console.error("Error:", err);
    const stack = process.env.NODE_ENV === "development" ? cleanStack(err.stack) : undefined;
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            stack: stack,
        });
    }

    const apiError = new ApiError(
        500,
        err.message || "Internal Server Error",
        [],
        stack
    );

    return res.status(500).json({
        success: apiError.success,
        message: apiError.message,
        stack: stack,
    });
});
export default app;