import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import productRouter from "./routes/product.route.js";
import authRouter from "./routes/auth.route.js";
import adminRouter from "./routes/admin.route.js";
import orderRouter from "./routes/order.route.js";
import helmet from "helmet";
import cartRouter from "./routes/cart.route.js";
import ApiError from "./utils/ApiError.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
}))
// Body parser with size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: "Too many requests from this IP, please try again later.",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // Limit auth endpoints to 5 requests per windowMs
//     message: "Too many authentication attempts, please try again later.",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// app.use("/api/", limiter);
// app.use("/api/auth/", authLimiter);

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);
app.use("/api/admin", adminRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRouter);
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