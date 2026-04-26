import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from './routes/wallet.routes.js';

const app = express();

//core middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);

//health
app.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true,
        message: "Server is healthy" 
    });
});

export default app;